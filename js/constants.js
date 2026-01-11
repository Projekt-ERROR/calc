/**
 * application constants for calculator
 */

/**
 * error messages
 */
const ERROR_MESSAGES = {
  DIVISION_BY_ZERO: 'Cannot divide by zero',
  INVALID_EXPRESSION: 'Invalid expression',
  INVALID_NUMBER: 'Invalid number format',
  CALCULATION_ERROR: 'Calculation error',
  EMPTY_EXPRESSION: 'No expression to calculate',
  MISSING_OPERAND: 'Missing operand',
  MISMATCHED_PARENTHESES: 'Mismatched parentheses',
};

/**
 * display constants
 */
const DISPLAY_CONSTANTS = {
  MOTD: 'please use buttons',
  TYPING_SPEED: 50,
  ERROR_DISPLAY: 'Error',
  EMPTY_VALUE: '',
};

/**
 * validation constants
 */
const VALIDATION = {
  MAX_DISPLAY_LENGTH: 50,
  MAX_NUMBER_VALUE: Number.MAX_SAFE_INTEGER,
  MIN_NUMBER_VALUE: Number.MIN_SAFE_INTEGER,
  MAX_HISTORY: 10,
};

/**
 * operators
 */
const OPERATORS = ['+', '-', '*', '/'];

/**
 * calculator actions
 */
const ACTIONS = {
  CLEAR: 'clear',
  DELETE: 'delete',
  CALCULATE: 'calculate',
};

/**
 * exports
  */
export { ERROR_MESSAGES, DISPLAY_CONSTANTS, VALIDATION, OPERATORS, ACTIONS };
