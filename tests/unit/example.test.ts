// tests/unit/example.test.ts
describe('Unit Tests - Example Suite', () => {
  describe('String Utilities', () => {
    it('should convert string to uppercase', () => {
      const input = 'digital va gov';
      const result = input.toUpperCase();
      expect(result).toBe('DIGITAL VA GOV');
    });

    it('should validate email format', () => {
      const validateEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
      };

      expect(validateEmail('test@va.gov')).toBe(true);
      expect(validateEmail('invalid.email')).toBe(false);
      expect(validateEmail('user@domain.co.uk')).toBe(true);
    });

    it('should trim whitespace', () => {
      const input = '  digital.va.gov  ';
      const result = input.trim();
      expect(result).toBe('digital.va.gov');
    });
  });

  describe('Array Operations', () => {
    it('should filter array correctly', () => {
      const numbers = [1, 2, 3, 4, 5];
      const evens = numbers.filter((n) => n % 2 === 0);
      expect(evens).toEqual([2, 4]);
    });

    it('should map array elements', () => {
      const users = [{ id: 1, name: 'John' }, { id: 2, name: 'Jane' }];
      const names = users.map((u) => u.name);
      expect(names).toEqual(['John', 'Jane']);
    });

    it('should sort array', () => {
      const numbers = [3, 1, 4, 1, 5, 9];
      const sorted = [...numbers].sort((a, b) => a - b);
      expect(sorted).toEqual([1, 1, 3, 4, 5, 9]);
    });
  });

  describe('Object Operations', () => {
    it('should merge objects', () => {
      const obj1 = { a: 1, b: 2 };
      const obj2 = { b: 3, c: 4 };
      const merged = { ...obj1, ...obj2 };
      expect(merged).toEqual({ a: 1, b: 3, c: 4 });
    });

    it('should deeply merge nested objects', () => {
      const obj1 = {
        user: { id: 1, name: 'John' },
        settings: { theme: 'dark' },
      };
      const obj2 = {
        user: { role: 'admin' },
        settings: { language: 'en' },
      };

      const deepMerge = (target: any, source: any): any => {
        const result = { ...target };
        for (const key in source) {
          if (typeof source[key] === 'object' && source[key] !== null) {
            result[key] = deepMerge(result[key] || {}, source[key]);
          } else {
            result[key] = source[key];
          }
        }
        return result;
      };

      const merged = deepMerge(obj1, obj2);
      expect(merged.user).toEqual({ id: 1, name: 'John', role: 'admin' });
    });
  });

  describe('Date Operations', () => {
    it('should calculate days between dates', () => {
      const calculateDaysBetween = (date1: Date, date2: Date): number => {
        const diffTime = Math.abs(date2.getTime() - date1.getTime());
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      };

      const start = new Date('2024-01-01');
      const end = new Date('2024-01-10');
      expect(calculateDaysBetween(start, end)).toBe(9);
    });

    it('should format date correctly', () => {
      const formatDate = (date: Date): string => {
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
      };

      const date = new Date('2024-01-15');
      expect(formatDate(date)).toContain('2024');
      expect(formatDate(date)).toContain('15');
    });
  });

  describe('Retry Logic', () => {
    it('should retry failed operations', async () => {
      let attempts = 0;

      const retryOperation = async (
        operation: () => Promise<any>,
        maxAttempts: number = 3,
        delayMs: number = 100,
      ): Promise<any> => {
        for (let i = 0; i < maxAttempts; i++) {
          try {
            return await operation();
          } catch (error) {
            if (i === maxAttempts - 1) throw error;
            await new Promise((resolve) => setTimeout(resolve, delayMs));
          }
        }
      };

      const flakeyOperation = async () => {
        attempts++;
        if (attempts < 3) {
          throw new Error('Failed');
        }
        return 'Success';
      };

      const result = await retryOperation(flakeyOperation);
      expect(result).toBe('Success');
      expect(attempts).toBe(3);
    });
  });

  describe('Debounce & Throttle', () => {
    it('should debounce function calls', (done) => {
      let callCount = 0;

      const debounce = (fn: Function, delay: number) => {
        let timeoutId: NodeJS.Timeout;
        return function (...args: any[]) {
          clearTimeout(timeoutId);
          timeoutId = setTimeout(() => fn(...args), delay);
        };
      };

      const callback = () => {
        callCount++;
      };

      const debouncedFn = debounce(callback, 100);

      debouncedFn();
      debouncedFn();
      debouncedFn();

      setTimeout(() => {
        expect(callCount).toBe(1);
        done();
      }, 150);
    });

    it('should throttle function calls', (done) => {
      let callCount = 0;

      const throttle = (fn: Function, limit: number) => {
        let inThrottle = false;
        return function (...args: any[]) {
          if (!inThrottle) {
            fn(...args);
            inThrottle = true;
            setTimeout(() => (inThrottle = false), limit);
          }
        };
      };

      const callback = () => {
        callCount++;
      };

      const throttledFn = throttle(callback, 100);

      throttledFn();
      throttledFn();
      throttledFn();
      throttledFn();

      setTimeout(() => {
        expect(callCount).toBeGreaterThan(1);
        expect(callCount).toBeLessThan(4);
        done();
      }, 150);
    });
  });

  describe('Error Handling', () => {
    it('should handle errors gracefully', () => {
      const safeJsonParse = (jsonString: string): any => {
        try {
          return JSON.parse(jsonString);
        } catch (error) {
          console.warn('JSON parse error:', error);
          return null;
        }
      };

      expect(safeJsonParse('{"valid": "json"}')).toEqual({ valid: 'json' });
      expect(safeJsonParse('invalid json')).toBeNull();
    });

    it('should validate required parameters', () => {
      const validateParams = (params: Record<string, any>, required: string[]): void => {
        const missing = required.filter((key) => !(key in params) || params[key] == null);
        if (missing.length > 0) {
          throw new Error(`Missing required parameters: ${missing.join(', ')}`);
        }
      };

      expect(() => {
        validateParams({ email: 'test@va.gov' }, ['email', 'password']);
      }).toThrow('Missing required parameters: password');
    });
  });

  describe('Performance Utilities', () => {
    it('should measure function execution time', () => {
      const measureTime = (fn: () => void): number => {
        const start = performance.now();
        fn();
        return performance.now() - start;
      };

      const duration = measureTime(() => {
        Array.from({ length: 1000 }).forEach(() => Math.random());
      });

      expect(duration).toBeGreaterThan(0);
      expect(duration).toBeLessThan(1000); // Should be fast
    });

    it('should cache function results', () => {
      let callCount = 0;

      const memoize = (fn: Function) => {
        const cache: Record<string, any> = {};
        return (arg: string) => {
          if (arg in cache) {
            return cache[arg];
          }
          const result = fn(arg);
          cache[arg] = result;
          return result;
        };
      };

      const expensiveFunction = (input: string) => {
        callCount++;
        return input.toUpperCase();
      };

      const memoized = memoize(expensiveFunction);

      expect(memoized('test')).toBe('TEST');
      expect(memoized('test')).toBe('TEST');
      expect(memoized('test')).toBe('TEST');

      expect(callCount).toBe(1); // Only called once due to memoization
    });
  });
});
