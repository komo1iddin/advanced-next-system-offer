import { monitoringService } from '@/lib/services/MonitoringService';

export enum CircuitState {
  CLOSED = 'CLOSED',      // Normal operation - requests go through
  OPEN = 'OPEN',          // Circuit is open - requests fail fast
  HALF_OPEN = 'HALF_OPEN' // Testing the waters - limited requests go through
}

export interface CircuitBreakerOptions {
  failureThreshold: number;    // Number of failures before opening the circuit
  resetTimeout: number;        // Time in ms before trying half-open state
  maxHalfOpenCalls: number;    // Max number of calls allowed in half-open state
  timeout?: number;            // Timeout for operations in ms
  monitorBucketSize?: number;  // Size of time window for failure rate in ms
}

export interface CircuitBreakerStats {
  state: CircuitState;
  failures: number;
  successes: number;
  rejectsCount: number;
  lastFailure: string | null;
  lastFailureTime: number | null;
  lastStateChange: number;
  halfOpenSuccesses: number;
  halfOpenFailures: number;
}

/**
 * Circuit Breaker implementation to prevent cascading failures
 */
export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failures: number = 0;
  private successes: number = 0;
  private rejectsCount: number = 0;
  private lastFailure: Error | null = null;
  private lastFailureTime: number | null = null;
  private nextAttemptTime: number = 0;
  private halfOpenSuccesses: number = 0;
  private halfOpenFailures: number = 0;
  private lastStateChange: number = Date.now();
  private stateTimers: Map<string, NodeJS.Timeout> = new Map();

  constructor(
    private readonly name: string,
    private readonly options: CircuitBreakerOptions = {
      failureThreshold: 5,
      resetTimeout: 30000, // 30 seconds
      maxHalfOpenCalls: 3,
      timeout: 10000, // 10 seconds
      monitorBucketSize: 60000 // 1 minute
    }
  ) {}

  /**
   * Execute a function with circuit breaker protection
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    // Circuit is open - fail fast
    if (this.state === CircuitState.OPEN) {
      if (Date.now() < this.nextAttemptTime) {
        this.rejectsCount++;
        
        // Track circuit breaker rejection
        monitoringService.trackMetric({
          name: 'circuit.rejection',
          value: 1,
          tags: {
            circuitName: this.name,
            state: this.state
          }
        });
        
        throw new Error(`Circuit ${this.name} is OPEN - failing fast`);
      }
      
      // Time to try again - move to half-open
      this.transitionToState(CircuitState.HALF_OPEN);
    }

    // In half-open state, limit the number of calls
    if (
      this.state === CircuitState.HALF_OPEN && 
      this.halfOpenSuccesses + this.halfOpenFailures >= this.options.maxHalfOpenCalls
    ) {
      this.rejectsCount++;
      
      // Track circuit breaker rejection
      monitoringService.trackMetric({
        name: 'circuit.rejection',
        value: 1,
        tags: {
          circuitName: this.name,
          state: this.state
        }
      });
      
      throw new Error(`Circuit ${this.name} is HALF_OPEN and at capacity - failing fast`);
    }

    // Apply timeout if configured
    let timeoutId: NodeJS.Timeout | undefined;
    const executionPromise = new Promise<T>((resolve, reject) => {
      // Set timeout if configured
      if (this.options.timeout) {
        timeoutId = setTimeout(() => {
          const timeoutError = new Error(`Operation timed out after ${this.options.timeout}ms`);
          reject(timeoutError);
        }, this.options.timeout);
      }

      // Execute the function
      fn()
        .then(result => {
          if (timeoutId) clearTimeout(timeoutId);
          resolve(result);
        })
        .catch(error => {
          if (timeoutId) clearTimeout(timeoutId);
          reject(error);
        });
    });

    try {
      const result = await executionPromise;
      this.recordSuccess();
      return result;
    } catch (error) {
      this.recordFailure(error as Error);
      throw error;
    }
  }

  /**
   * Record a successful call
   */
  private recordSuccess(): void {
    this.successes++;
    
    if (this.state === CircuitState.HALF_OPEN) {
      this.halfOpenSuccesses++;
      
      // If we've had enough successes in half-open state, close the circuit
      if (this.halfOpenSuccesses >= this.options.maxHalfOpenCalls) {
        this.transitionToState(CircuitState.CLOSED);
      }
    }
    
    // Track circuit breaker success
    monitoringService.trackMetric({
      name: 'circuit.success',
      value: 1,
      tags: {
        circuitName: this.name,
        state: this.state
      }
    });
  }

  /**
   * Record a failed call
   */
  private recordFailure(error: Error): void {
    this.failures++;
    this.lastFailure = error;
    this.lastFailureTime = Date.now();
    
    if (this.state === CircuitState.CLOSED) {
      if (this.failures >= this.options.failureThreshold) {
        this.transitionToState(CircuitState.OPEN);
      }
    } else if (this.state === CircuitState.HALF_OPEN) {
      this.halfOpenFailures++;
      this.transitionToState(CircuitState.OPEN);
    }
    
    // Track circuit breaker failure
    monitoringService.trackMetric({
      name: 'circuit.failure',
      value: 1,
      tags: {
        circuitName: this.name,
        state: this.state,
        errorType: error.name
      }
    });
  }

  /**
   * Transition the circuit to a new state
   */
  private transitionToState(newState: CircuitState): void {
    if (this.state === newState) return;
    
    // Clear any existing timers
    if (this.stateTimers.has(this.state)) {
      clearTimeout(this.stateTimers.get(this.state)!);
      this.stateTimers.delete(this.state);
    }

    // Update state
    const previousState = this.state;
    this.state = newState;
    this.lastStateChange = Date.now();
    
    // Reset counters on state change
    if (newState === CircuitState.HALF_OPEN) {
      this.halfOpenSuccesses = 0;
      this.halfOpenFailures = 0;
    } else if (newState === CircuitState.CLOSED) {
      this.failures = 0;
    }
    
    // If transitioning to OPEN, set a timer to try HALF_OPEN
    if (newState === CircuitState.OPEN) {
      this.nextAttemptTime = Date.now() + this.options.resetTimeout;
      
      // Set timer to transition to HALF_OPEN
      const timer = setTimeout(() => {
        if (this.state === CircuitState.OPEN) {
          this.transitionToState(CircuitState.HALF_OPEN);
        }
      }, this.options.resetTimeout);
      
      this.stateTimers.set(newState, timer);
    }
    
    // Log and track state change
    console.log(`Circuit ${this.name} state changed from ${previousState} to ${newState}`);
    
    monitoringService.trackMetric({
      name: 'circuit.stateChange',
      value: 1,
      tags: {
        circuitName: this.name,
        fromState: previousState,
        toState: newState
      }
    });
  }

  /**
   * Force circuit to a specific state (for testing or manual recovery)
   */
  forceState(state: CircuitState): void {
    this.transitionToState(state);
  }

  /**
   * Get current circuit stats
   */
  getStats(): CircuitBreakerStats {
    return {
      state: this.state,
      failures: this.failures,
      successes: this.successes,
      rejectsCount: this.rejectsCount,
      lastFailure: this.lastFailure ? this.lastFailure.message : null,
      lastFailureTime: this.lastFailureTime,
      lastStateChange: this.lastStateChange,
      halfOpenSuccesses: this.halfOpenSuccesses,
      halfOpenFailures: this.halfOpenFailures
    };
  }

  /**
   * Reset circuit to initial closed state
   */
  reset(): void {
    this.transitionToState(CircuitState.CLOSED);
    this.failures = 0;
    this.successes = 0;
    this.rejectsCount = 0;
    this.lastFailure = null;
    this.lastFailureTime = null;
    this.halfOpenSuccesses = 0;
    this.halfOpenFailures = 0;
  }
}

// Circuit breaker registry to access circuits by name
class CircuitBreakerRegistry {
  private circuits: Map<string, CircuitBreaker> = new Map();

  /**
   * Get or create a circuit breaker
   */
  getOrCreate(name: string, options?: CircuitBreakerOptions): CircuitBreaker {
    if (!this.circuits.has(name)) {
      this.circuits.set(name, new CircuitBreaker(name, options));
    }
    return this.circuits.get(name)!;
  }

  /**
   * Get all circuit breakers
   */
  getAll(): Map<string, CircuitBreaker> {
    return this.circuits;
  }

  /**
   * Get stats for all circuits
   */
  getAllStats(): Record<string, CircuitBreakerStats> {
    const stats: Record<string, CircuitBreakerStats> = {};
    this.circuits.forEach((circuit, name) => {
      stats[name] = circuit.getStats();
    });
    return stats;
  }

  /**
   * Reset a specific circuit
   */
  resetCircuit(name: string): boolean {
    if (this.circuits.has(name)) {
      this.circuits.get(name)!.reset();
      return true;
    }
    return false;
  }

  /**
   * Reset all circuits
   */
  resetAll(): void {
    this.circuits.forEach(circuit => circuit.reset());
  }
}

// Export singleton registry
export const circuitBreakerRegistry = new CircuitBreakerRegistry();

/**
 * Utility function to execute an operation with circuit breaker protection
 */
export async function withCircuitBreaker<T>(
  operation: () => Promise<T>,
  circuitName: string,
  options?: CircuitBreakerOptions
): Promise<T> {
  const circuit = circuitBreakerRegistry.getOrCreate(circuitName, options);
  return circuit.execute(operation);
}