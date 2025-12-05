import { vi } from 'vitest';
import { CircuitBreaker, CircuitState, CircuitBreakerRegistry } from './circuitBreaker';

// Mock timer functions
vi.useFakeTimers();

describe('CircuitBreaker', () => {
  let circuit;
  const healthCheckFn = vi.fn().mockResolvedValue(true);

  beforeEach(() => {
    // Reset mocks and circuit before each test
    vi.spyOn(global.Math, 'random').mockReturnValue(0.05);
    healthCheckFn.mockClear();
    circuit = new CircuitBreaker('test-circuit', {
      slidingWindowSize: 10000,
      minRequests: 3,
      failureRateThreshold: 0.5,
      openStateTimeout: 5000,
      gradualRecoverySteps: [0.1, 0.5, 1.0],
      halfOpenSuccessThreshold: 3,
    }, healthCheckFn);
  });

  afterEach(() => {
    vi.mocked(global.Math.random).mockRestore();
  });


  it('should start in a CLOSED state', () => {
    expect(circuit.state).toBe(CircuitState.CLOSED);
  });

  it('should open after reaching the failure threshold', () => {
    circuit.probes.push({ timestamp: Date.now(), success: false });
    circuit.probes.push({ timestamp: Date.now(), success: false });
    circuit.probes.push({ timestamp: Date.now(), success: false });
    circuit.recordFailure({ response: { status: 500 } }); // This triggers the check
    expect(circuit.state).toBe(CircuitState.OPEN);
  });

  it('should transition to HALF_OPEN after the timeout', () => {
    circuit.open(1000);
    expect(circuit.state).toBe(CircuitState.OPEN);
    vi.advanceTimersByTime(1001);
    expect(circuit.state).toBe(CircuitState.HALF_OPEN);
  });

  it('should close after successful requests in HALF_OPEN state', () => {
    circuit.state = CircuitState.OPEN; // Set state to allow halfOpen() to run
    circuit.halfOpen();
    circuit.recordSuccess();
    circuit.recordSuccess();
    circuit.recordSuccess();
    expect(circuit.state).toBe(CircuitState.CLOSED);
  });

  it('should open again on failure in HALF_OPEN state', () => {
    circuit.state = CircuitState.OPEN; // Set state to allow halfOpen() to run
    circuit.halfOpen();
    circuit.recordFailure({ response: { status: 500 } });
    expect(circuit.state).toBe(CircuitState.OPEN);
  });

  it('should handle rate limit errors with a custom backoff', () => {
    const error = {
      response: { status: 429, headers: { 'retry-after': '10' } },
    };
    circuit.recordFailure(error);
    expect(circuit.state).toBe(CircuitState.OPEN);
    expect(circuit.nextRetryTime - Date.now()).toBeGreaterThan(9000);
  });

  it('should not allow requests in OPEN state', () => {
    circuit.open();
    expect(circuit.isRequestAllowed()).toBe(false);
  });

  it('should allow requests in HALF_OPEN state based on gradual recovery', () => {
    circuit.state = CircuitState.OPEN; // Set state to allow halfOpen() to run
    circuit.halfOpen();
    // With Math.random = 0.05, should be allowed since threshold is 0.1
    expect(circuit.isRequestAllowed()).toBe(true);
  });

  it('should increment gradual recovery index on success', () => {
    circuit.state = CircuitState.OPEN; // Set state to allow halfOpen() to run
    circuit.halfOpen();
    circuit.recordSuccess();
    expect(circuit.gradualRecoveryIndex).toBe(1);
  });

  it('should run health checks in HALF_OPEN state', () => {
    circuit.state = CircuitState.OPEN; // Set state to allow halfOpen() to run
    circuit.halfOpen();
    vi.advanceTimersByTime(5001);
    expect(healthCheckFn).toHaveBeenCalled();
  });
});

describe('CircuitBreakerRegistry', () => {
  let registry;

  beforeEach(() => {
    registry = new CircuitBreakerRegistry();
  });

  it('should create a new circuit if one does not exist', () => {
    const circuit = registry.getCircuit('new-circuit');
    expect(circuit).toBeInstanceOf(CircuitBreaker);
    expect(registry.circuits.has('new-circuit')).toBe(true);
  });

  it('should return an existing circuit', () => {
    const circuit1 = registry.getCircuit('existing-circuit');
    const circuit2 = registry.getCircuit('existing-circuit');
    expect(circuit1).toBe(circuit2);
  });

  it('should provide status of all circuits', () => {
    registry.getCircuit('circuit1');
    registry.getCircuit('circuit2');
    const statuses = registry.getAllStatus();
    expect(statuses).toHaveLength(2);
    expect(statuses[0].name).toBe('circuit1');
  });
});
