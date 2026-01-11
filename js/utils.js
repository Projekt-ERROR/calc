/**
 * utility functions for the calculator application
 */

/**
 * imports
 */
import { ERROR_MESSAGES, VALIDATION } from './constants.js';

/**
 * sleep utility with abort support
 * @param {number} ms - Milliseconds to sleep
 * @param {AbortSignal} abortSignal - Optional abort signal for cancellation
 * @returns {Promise<void>}
 */
const sleep = (ms, abortSignal) => {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, ms);

    abortSignal?.addEventListener('abort', () => {
      clearTimeout(timer);
      reject(new DOMException('Cancelled', 'AbortError'));
    });
  });
};

const validate = {
  /**
   * validates if value is a finite number
   * @param {*} value - value to validate
   * @return {boolean}
   */
  isValidNumber: function (value) {
    const num = parseFloat(value);
    return !isNaN(num) && isFinite(num); 
  },

  /**
   * validates if value is in safe range
   * @param {*} value - value to validate
   * @return {boolean}
   */
  isInSafeRange: function (value) {
    return value >= VALIDATION.MIN_NUMBER_VALUE && value <= VALIDATION.MAX_NUMBER_VALUE;
  },

  /**
   * safely parse a number with validation
   */
  safeParseNumber: function (value) {
    const num = parseFloat(value);
    if (value === null || value === undefined) {
      return {
        success: false,
        error: 'Value is null or undefined'
      };
    }

    if (!this.isValidNumber(value)) {
      return {
        success: false,
        error: ERROR_MESSAGES.INVALID_NUMBER
      };
    }

    if (!this.isInSafeRange(num)) {
      return {
        success: false,
        error: 'Number outside safe range'
      };
    }

    return {
      success: true,
      value: num
    };
  },

  validateParentheses: function (expression) {
    let count = 0;

    for (const char of expression) {
      if (char === '(') count ++;
      if (char === ')') count --;
      
      if (count < 0) {
        return {
          valid: false,
          error: ERROR_MESSAGES.MISMATCHED_PARENTHESES
        };
      }
    }

    if (count !== 0) {
      return {
        valid: false,
        error: ERROR_MESSAGES.MISMATCHED_PARENTHESES
      };
    }

    return { valid: true };
  },

  validateExpression: function (expression) {
    if (!expression || expression.trim() === '') {
      return {
        valid: false,
        error: ERROR_MESSAGES.EMPTY_EXPRESSION
      };
    }

    const validPattern = /^[\d+\-*/.() ]+$/;
    if (!validPattern.test(expression)) {
      return {
        valid: false,
        error: ERROR_MESSAGES.INVALID_EXPRESSION
      };
    }

    return { valid: true };
  }
};

const tryCatch = (fn, defaultValue, errorMessage = 'Operation failed') => {
  try {
    return fn();
  } catch (error) {
    console.error(`${errorMessage}:`, error);
    return defaultValue;
  }
};

/**
 * exports
 */
export { sleep, validate, tryCatch };
