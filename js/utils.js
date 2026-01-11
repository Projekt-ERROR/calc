/**
 * utility functions for the calculator application
 */

/**
 * imports
 */
import { ERROR_MESSAGES, VALIDATION } from './constants.js';

/**
 * sleep utility with abort support
 * @param {number} ms - milliseconds to sleep
 * @param {AbortSignal} abortSignal - optional abort signal for cancellation
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
   * @param {*} value - value to validate
   * @returns {{success: boolean, value?: number, error?: string}}
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

  /**
   * validates the parentheses in a expression
   * @param {string} expression - expression to validate
   * @returns {{valid: boolean, error?: string}}
   */
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

  /**
   * validates expression
   * @param {string} expression - expression to validate
   * @returns {{valid: boolean, error?: string}}
   */
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

/**
 * safely executes a function with error handling
 * @param {Function} fn - Function to exexcute
 * @param {*} defaultValue - default value on error
 * @param {string} errorMessage - error message
 * @returns {*}
 */
const tryCatch = (fn, defaultValue, errorMessage = 'Operation failed') => {
  try {
    return fn();
  } catch (error) {
    console.error(`${errorMessage}:`, error);
    const isDev = !window.location.hostname.includes('yourdomain.com') || 
                  window.location.hostname === 'localhost';
    
    if (isDev) {
      console.warn('error caught by tryCatch - throwing for visibility');
      throw error;
    }
    return defaultValue;
  }
};

/**
 * exports
 */
export { sleep, validate, tryCatch };
