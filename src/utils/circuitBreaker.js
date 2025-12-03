/**
 * Circuit Breaker Pattern for ESI API Calls
 *
 * Prevents cascading failures by temporarily blocking requests to failing endpoints.
 * When an endpoint fails repeatedly, the circuit "opens" and immediately rejects
 * requests for a cool-down period, allowing the service to recover.
 *
 * States:
 * - CLOSED: Normal operation, requests go through
 * - OPEN: Blocking all requests (after too many failures)
 * - HALF_OPEN: Testing if service recovered (allows limited requests)
 */

// Circuit states
const CircuitState = {
  CLOSED: 'CLOSED',
  OPEN: 'OPEN',
  HALF_OPEN: 'HALF_OPEN',
};

// Default configuration
const DEFAULT_CONFIG = {
  failureThreshold: 5, // Number of failures before opening circuit
  successThreshold: 2, // Number of successes in half-open to close circuit
  timeout: 30000, // Time in ms before trying again (30 seconds)
  monitorInterval: 5000, // How often to check circuit state
  resetTimeout: 60000, // Time after which to reset failure count (1 minute)
};

/**
 * Circuit Breaker class for managing API endpoint reliability
 */
class CircuitBreaker {
  constructor(name, options = {}) {
    this.name = name;
    this.config = { ...DEFAULT_CONFIG, ...options };

    this.state = CircuitState.CLOSED;
    this.failures = 0;
    this.successes = 0;
    this.lastFailureTime = null;
    this.nextRetryTime = null;
    this.listeners = new Set();

    // Stats for monitoring
    this.stats = {
      totalRequests: 0,
      totalFailures: 0,
      totalSuccesses: 0,
      circuitOpens: 0,
      lastStateChange: null,
    };
  }

  /**
   * Record a successful request
   */
  recordSuccess() {
    this.stats.totalRequests++;
    this.stats.totalSuccesses++;

    if (this.state === CircuitState.HALF_OPEN) {
      this.successes++;
      if (this.successes >= this.config.successThreshold) {
        this.close();
      }
    } else if (this.state === CircuitState.CLOSED) {
      // Reset failure count on success
      this.failures = 0;
    }
  }

  /**
   * Record a failed request
   */
  recordFailure(error) {
    this.stats.totalRequests++;
    this.stats.totalFailures++;
    this.lastFailureTime = Date.now();

    if (this.state === CircuitState.HALF_OPEN) {
      // Any failure in half-open immediately opens circuit
      this.open();
    } else if (this.state === CircuitState.CLOSED) {
      this.failures++;
      if (this.failures >= this.config.failureThreshold) {
        this.open();
      }
    }
  }

  /**
   * Open the circuit (block requests)
   */
  open() {
    if (this.state === CircuitState.OPEN) return;

    this.state = CircuitState.OPEN;
    this.stats.circuitOpens++;
    this.stats.lastStateChange = Date.now();
    this.nextRetryTime = Date.now() + this.config.timeout;

    console.warn(`[CircuitBreaker:${this.name}] Circuit OPENED - blocking requests for ${this.config.timeout}ms`);
    this.notifyListeners('open');

    // Schedule transition to half-open
    setTimeout(() => {
      if (this.state === CircuitState.OPEN) {
        this.halfOpen();
      }
    }, this.config.timeout);
  }

  /**
   * Transition to half-open state (test if service recovered)
   */
  halfOpen() {
    this.state = CircuitState.HALF_OPEN;
    this.successes = 0;
    this.stats.lastStateChange = Date.now();

    console.info(`[CircuitBreaker:${this.name}] Circuit HALF-OPEN - testing service`);
    this.notifyListeners('half-open');
  }

  /**
   * Close the circuit (normal operation)
   */
  close() {
    this.state = CircuitState.CLOSED;
    this.failures = 0;
    this.successes = 0;
    this.nextRetryTime = null;
    this.stats.lastStateChange = Date.now();

    console.info(`[CircuitBreaker:${this.name}] Circuit CLOSED - normal operation`);
    this.notifyListeners('close');
  }

  /**
   * Check if the circuit allows requests
   * @returns {boolean} True if requests are allowed
   */
  isRequestAllowed() {
    // Check if failure count should be reset (no recent failures)
    if (this.state === CircuitState.CLOSED &&
        this.lastFailureTime &&
        Date.now() - this.lastFailureTime > this.config.resetTimeout) {
      this.failures = 0;
    }

    switch (this.state) {
      case CircuitState.CLOSED:
        return true;
      case CircuitState.HALF_OPEN:
        return true; // Allow limited requests to test
      case CircuitState.OPEN:
        // Check if timeout has passed
        if (Date.now() >= this.nextRetryTime) {
          this.halfOpen();
          return true;
        }
        return false;
      default:
        return true;
    }
  }

  /**
   * Execute a function with circuit breaker protection
   * @param {Function} fn - Async function to execute
   * @returns {Promise} Result of the function or rejection if circuit is open
   */
  async execute(fn) {
    if (!this.isRequestAllowed()) {
      const waitTime = Math.max(0, this.nextRetryTime - Date.now());
      throw new CircuitBreakerError(
        `Circuit breaker is OPEN for ${this.name}. Retry in ${Math.ceil(waitTime / 1000)}s`,
        this.name,
        waitTime
      );
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
   * Add a listener for state changes
   * @param {Function} listener - Callback function (state, circuitName)
   */
  addListener(listener) {
    this.listeners.add(listener);
  }

  /**
   * Remove a listener
   * @param {Function} listener - Callback function to remove
   */
  removeListener(listener) {
    this.listeners.delete(listener);
  }

  /**
   * Notify all listeners of state change
   */
  notifyListeners(newState) {
    this.listeners.forEach(listener => {
      try {
        listener(newState, this.name);
      } catch (e) {
        console.error('Circuit breaker listener error:', e);
      }
    });
  }

  /**
   * Get current circuit status
   * @returns {Object} Status object with current state and stats
   */
  getStatus() {
    return {
      name: this.name,
      state: this.state,
      failures: this.failures,
      successes: this.successes,
      nextRetryTime: this.nextRetryTime,
      stats: { ...this.stats },
      config: { ...this.config },
    };
  }

  /**
   * Manually reset the circuit breaker
   */
  reset() {
    this.close();
    this.failures = 0;
    this.lastFailureTime = null;
    console.info(`[CircuitBreaker:${this.name}] Manually reset`);
  }
}

/**
 * Custom error for circuit breaker rejections
 */
class CircuitBreakerError extends Error {
  constructor(message, circuitName, waitTime) {
    super(message);
    this.name = 'CircuitBreakerError';
    this.circuitName = circuitName;
    this.waitTime = waitTime;
    this.isCircuitBreakerError = true;
  }
}

/**
 * Circuit Breaker Registry - manages multiple circuit breakers
 */
class CircuitBreakerRegistry {
  constructor() {
    this.circuits = new Map();
    this.globalListeners = new Set();
  }

  /**
   * Get or create a circuit breaker for an endpoint
   * @param {string} name - Unique name for the circuit
   * @param {Object} options - Configuration options
   * @returns {CircuitBreaker} The circuit breaker instance
   */
  getCircuit(name, options = {}) {
    if (!this.circuits.has(name)) {
      const circuit = new CircuitBreaker(name, options);

      // Add global listener
      circuit.addListener((state, circuitName) => {
        this.globalListeners.forEach(listener => {
          try {
            listener(state, circuitName);
          } catch (e) {
            console.error('Global circuit listener error:', e);
          }
        });
      });

      this.circuits.set(name, circuit);
    }
    return this.circuits.get(name);
  }

  /**
   * Get status of all circuits
   * @returns {Array} Array of status objects
   */
  getAllStatus() {
    return Array.from(this.circuits.values()).map(c => c.getStatus());
  }

  /**
   * Get circuits that are currently open
   * @returns {Array} Array of open circuit statuses
   */
  getOpenCircuits() {
    return this.getAllStatus().filter(s => s.state === CircuitState.OPEN);
  }

  /**
   * Add a global listener for all circuit state changes
   * @param {Function} listener - Callback function
   */
  addGlobalListener(listener) {
    this.globalListeners.add(listener);
  }

  /**
   * Remove a global listener
   * @param {Function} listener - Callback to remove
   */
  removeGlobalListener(listener) {
    this.globalListeners.delete(listener);
  }

  /**
   * Reset all circuits
   */
  resetAll() {
    this.circuits.forEach(circuit => circuit.reset());
  }

  /**
   * Check if any circuits are open
   * @returns {boolean} True if any circuit is open
   */
  hasOpenCircuits() {
    return Array.from(this.circuits.values()).some(
      c => c.state === CircuitState.OPEN
    );
  }
}

// Create singleton registry
const registry = new CircuitBreakerRegistry();

/**
 * Pre-configured circuit breakers for ESI endpoints
 */
const ESI_CIRCUITS = {
  MARKET_ORDERS: 'esi:market:orders',
  MARKET_HISTORY: 'esi:market:history',
  UNIVERSE_NAMES: 'esi:universe:names',
  UNIVERSE_TYPES: 'esi:universe:types',
  CHARACTER_DATA: 'esi:character:data',
  CONTRACTS: 'esi:contracts',
  ROUTES: 'esi:routes',
};

/**
 * Get a circuit breaker for an ESI endpoint
 * @param {string} endpoint - ESI endpoint identifier (use ESI_CIRCUITS constants)
 * @param {Object} options - Override default options
 * @returns {CircuitBreaker} Circuit breaker instance
 */
function getESICircuit(endpoint, options = {}) {
  const defaults = {
    failureThreshold: 3,
    successThreshold: 2,
    timeout: 30000,
  };
  return registry.getCircuit(endpoint, { ...defaults, ...options });
}

/**
 * Wrap an async function with circuit breaker protection
 * @param {string} circuitName - Name of the circuit to use
 * @param {Function} fn - Async function to wrap
 * @param {Object} options - Circuit breaker options
 * @returns {Function} Wrapped function
 */
function withCircuitBreaker(circuitName, fn, options = {}) {
  const circuit = registry.getCircuit(circuitName, options);

  return async (...args) => {
    return circuit.execute(() => fn(...args));
  };
}

export {
  CircuitBreaker,
  CircuitBreakerError,
  CircuitBreakerRegistry,
  CircuitState,
  registry,
  ESI_CIRCUITS,
  getESICircuit,
  withCircuitBreaker,
};

export default registry;
