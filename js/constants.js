/**
 * application constants for calculator
 */

/**
 * error messages
 */
const ERROR_MESSAGES = {
  DIVISION_BY_ZERO: 'cannot divide by zero',
  INVALID_EXPRESSION: 'invalid expression',
  INVALID_NUMBER: 'invalid number format',
  CALCULATION_ERROR: 'calculation error',
  EMPTY_EXPRESSION: 'no expression to calculate',
  MISSING_OPERAND: 'missing operand',
  MISMATCHED_PARENTHESES: 'mismatched parentheses',
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
