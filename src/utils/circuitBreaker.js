/**
 * Advanced Circuit Breaker Pattern for ESI API Calls
 *
 * Prevents cascading failures with advanced features like sliding window metrics,
 * health checks, and gradual recovery.
 */

// Circuit states
export const CircuitState = {
  CLOSED: 'CLOSED',
  OPEN: 'OPEN',
  HALF_OPEN: 'HALF_OPEN',
};

// Error types for strategy-based handling
const ErrorType = {
  TIMEOUT: 'TIMEOUT',
  RATE_LIMIT: 'RATE_LIMIT',
  SERVER_ERROR: 'SERVER_ERROR',
  UNKNOWN: 'UNKNOWN',
};

// Default configuration
const DEFAULT_CONFIG = {
  slidingWindowSize: 60000, // Time window for failure rate (ms)
  failureRateThreshold: 0.5, // Failure rate to open circuit (50%)
  minRequests: 10, // Min requests in window to evaluate failure rate
  openStateTimeout: 30000, // Time in open state before half-open (ms)
  halfOpenSuccessThreshold: 3, // Consecutive successes to close circuit
  healthCheckInterval: 5000, // How often to probe in half-open (ms)
  gradualRecoverySteps: [0.1, 0.25, 0.5, 1.0], // % of traffic allowed
  errorWeights: {
    [ErrorType.TIMEOUT]: 1.5,
    [ErrorType.SERVER_ERROR]: 1.0,
    [ErrorType.UNKNOWN]: 1.0,
  },
};

/**
 * Represents a single request probe in the sliding window
 */
class Probe {
  constructor(success, errorType = ErrorType.UNKNOWN) {
    this.timestamp = Date.now();
    this.success = success;
    this.errorType = success ? null : errorType;
  }
}

/**
 * Circuit Breaker class for managing API endpoint reliability
 */
export class CircuitBreaker {
  constructor(name, options = {}, healthCheckFn = null) {
    this.name = name;
    this.config = { ...DEFAULT_CONFIG, ...options };
    this.healthCheckFn = healthCheckFn;

    this.state = CircuitState.CLOSED;
    this.probes = [];
    this.nextRetryTime = null;
    this.listeners = new Set();
    this.healthCheckTimer = null;
    this.gradualRecoveryIndex = 0;
    this.halfOpenSuccesses = 0;

    this.stats = {
      stateChanges: [],
      failureRate: 0,
      recoveryTime: null,
      lastTrip: null,
    };
  }

  /**
   * Classify error type for strategic handling
   */
  classifyError(error) {
    if (error.code === 'ECONNABORTED' || error.isTimeout) return ErrorType.TIMEOUT;
    if (error.response?.status === 429) return ErrorType.RATE_LIMIT;
    if (error.response?.status >= 500) return ErrorType.SERVER_ERROR;
    return ErrorType.UNKNOWN;
  }

  /**
   * Prune probes outside the sliding window
   */
  pruneProbes() {
    const now = Date.now();
    this.probes = this.probes.filter(
      (p) => now - p.timestamp < this.config.slidingWindowSize
    );
  }

  /**
   * Calculate current failure rate
   */
  calculateFailureRate() {
    this.pruneProbes();
    if (this.probes.length < this.config.minRequests) {
      return 0;
    }

    const weightedFailures = this.probes
      .filter((p) => !p.success)
      .reduce((sum, p) => sum + (this.config.errorWeights[p.errorType] || 1), 0);

    this.stats.failureRate = weightedFailures / this.probes.length;
    return this.stats.failureRate;
  }

  /**
   * Record a successful request
   */
  recordSuccess() {
    this.probes.push(new Probe(true));
    if (this.state === CircuitState.HALF_OPEN) {
      this.halfOpenSuccesses++;
      if (this.gradualRecoveryIndex < this.config.gradualRecoverySteps.length - 1) {
        this.gradualRecoveryIndex++;
      }
      if (this.halfOpenSuccesses >= this.config.halfOpenSuccessThreshold) {
        this.close();
      }
    }
  }

  /**
   * Record a failed request
   */
  recordFailure(error) {
    const errorType = this.classifyError(error);

    // Handle rate limits immediately
    if (errorType === ErrorType.RATE_LIMIT) {
      const retryAfter = error.response.headers['retry-after'];
      const backoff = retryAfter ? parseInt(retryAfter, 10) * 1000 : this.config.openStateTimeout;
      this.open(backoff);
      return;
    }

    this.probes.push(new Probe(false, errorType));

    if (this.state === CircuitState.CLOSED) {
      if (this.calculateFailureRate() >= this.config.failureRateThreshold) {
        this.open();
      }
    } else if (this.state === CircuitState.HALF_OPEN) {
      this.open();
    }
  }

  /**
   * Open the circuit
   */
  open(timeout = this.config.openStateTimeout) {
    if (this.state === CircuitState.OPEN && Date.now() < this.nextRetryTime) return;

    this.state = CircuitState.OPEN;
    this.nextRetryTime = Date.now() + timeout;
    this.stats.lastTrip = { time: Date.now(), failureRate: this.stats.failureRate };
    this.recordStateChange('OPEN');

    setTimeout(() => this.halfOpen(), timeout);
  }

  /**
   * Transition to half-open state
   */
  halfOpen() {
    if (this.state !== CircuitState.OPEN) return;
    this.state = CircuitState.HALF_OPEN;
    this.gradualRecoveryIndex = 0;
    this.halfOpenSuccesses = 0;
    this.probes = []; // Clear probes to only count new successes
    this.recordStateChange('HALF_OPEN');

    if (this.healthCheckFn) {
      this.healthCheckTimer = setInterval(async () => {
        try {
          await this.healthCheckFn();
          this.recordSuccess();
        } catch (e) {
          this.recordFailure(e);
        }
      }, this.config.healthCheckInterval);
    }
  }

  /**
   * Close the circuit
   */
  close() {
    if (this.state === CircuitState.CLOSED) return;

    this.state = CircuitState.CLOSED;
    this.probes = [];
    this.halfOpenSuccesses = 0;
    if (this.healthCheckTimer) clearInterval(this.healthCheckTimer);
    this.recordStateChange('CLOSED');
  }

  /**
   * Check if a request is allowed
   */
  isRequestAllowed() {
    if (this.state === CircuitState.CLOSED) return true;
    if (this.state === CircuitState.OPEN && Date.now() >= this.nextRetryTime) {
      this.halfOpen();
    }
    if (this.state === CircuitState.HALF_OPEN) {
      const recoveryPercentage = this.config.gradualRecoverySteps[this.gradualRecoveryIndex];
      return Math.random() < recoveryPercentage;
    }
    return false;
  }

  /**
   * Execute a function with circuit breaker protection
   */
  async execute(fn) {
    if (!this.isRequestAllowed()) {
      throw new CircuitBreakerError(`Circuit breaker ${this.name} is OPEN`);
    }
    try {
      const result = await fn();
      this.recordSuccess();
      return result;
    } catch (error) {
      this.recordFailure(error);
      throw error;
    }
  }

  /**
   * Record state changes for analytics
   */
  recordStateChange(newState) {
    const now = Date.now();
    this.stats.stateChanges.push({ state: newState, timestamp: now });
    this.notifyListeners(newState);
  }

  /**
   * Notify listeners of a state change
   */
  notifyListeners(newState) {
    this.listeners.forEach(listener => listener(newState, this.name));
  }

  /**
   * Get current status and metrics
   */
  getStatus() {
    return {
      name: this.name,
      state: this.state,
      stats: this.stats,
      failureRate: this.calculateFailureRate(),
    };
  }
}

/**
 * Custom error for circuit breaker
 */
export class CircuitBreakerError extends Error {
  constructor(message) {
    super(message);
    this.name = 'CircuitBreakerError';
  }
}

/**
 * Manages multiple circuit breakers
 */
export class CircuitBreakerRegistry {
  constructor() {
    this.circuits = new Map();
  }

  getCircuit(name, options, healthCheckFn) {
    if (!this.circuits.has(name)) {
      this.circuits.set(name, new CircuitBreaker(name, options, healthCheckFn));
    }
    return this.circuits.get(name);
  }

  getAllStatus() {
    return Array.from(this.circuits.values()).map(c => c.getStatus());
  }

  getMetrics() {
    return this.getAllStatus().map(s => ({
      name: s.name,
      state: s.state,
      failureRate: s.failureRate,
      lastTrip: s.stats.lastTrip,
      stateChanges: s.stats.stateChanges.length,
    }));
  }
}

// Singleton registry
export const registry = new CircuitBreakerRegistry();

/**
 * Pre-configured circuit breakers for ESI endpoints
 */
export const ESI_CIRCUITS = {
  MARKET_ORDERS: 'esi:market:orders',
  MARKET_HISTORY: 'esi:market:history',
  UNIVERSE_NAMES: 'esi:universe:names',
  UNIVERSE_TYPES: 'esi:universe:types',
  CHARACTER_DATA: 'esi:character:data',
  CONTRACTS: 'esi:contracts',
  ROUTES: 'esi:routes',
};
