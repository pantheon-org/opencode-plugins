/**
 * Tests for measureDuration
 */

import { measureDuration } from './measure-duration';

describe('measureDuration', () => {
  it('should measure duration of async operation', async () => {
    const operation = async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
      return 'result';
    };

    const [result, duration] = await measureDuration(operation);

    expect(result).toBe('result');
    expect(duration).toBeGreaterThanOrEqual(100);
    expect(duration).toBeLessThan(200); // Allow some margin
  });

  it('should return result and duration as tuple', async () => {
    const operation = async () => ({ data: 'test' });
    const [result, duration] = await measureDuration(operation);

    expect(result).toEqual({ data: 'test' });
    expect(typeof duration).toBe('number');
  });

  it('should handle operations that complete immediately', async () => {
    const operation = async () => 'immediate';
    const [result, duration] = await measureDuration(operation);

    expect(result).toBe('immediate');
    expect(duration).toBeGreaterThanOrEqual(0);
    expect(duration).toBeLessThan(50);
  });

  it('should measure operations that return different types', async () => {
    const stringOp = async () => 'string';
    const numberOp = async () => 42;
    const objectOp = async () => ({ key: 'value' });
    const arrayOp = async () => [1, 2, 3];

    const [str] = await measureDuration(stringOp);
    const [num] = await measureDuration(numberOp);
    const [obj] = await measureDuration(objectOp);
    const [arr] = await measureDuration(arrayOp);

    expect(str).toBe('string');
    expect(num).toBe(42);
    expect(obj).toEqual({ key: 'value' });
    expect(arr).toEqual([1, 2, 3]);
  });

  it('should propagate errors from operation', async () => {
    const operation = async () => {
      throw new Error('Operation failed');
    };

    await expect(measureDuration(operation)).rejects.toThrow(
      'Operation failed',
    );
  });
});
