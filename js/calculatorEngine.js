/**
 * calculator engine - pure mathematical computation
 * converts infix expressions to postfix and evaluates them
 */


import { ERROR_MESSAGES } from './constants.js';
import { validate } from './utils.js';


const calculatorEngine = {
  /**
   * convert infix notation to postfix (Reverse Polish Notation)
   * @param {string} infix - mathematical expression in infix notation
   * @returns {{success: boolean, postfix?: string, error?: string}}
   */
  infixToPostfix: function (infix) {
    try {
      // Validate input
      if (typeof infix !== 'string') {
        return {
          success: false,
          error: 'expression must be a string'
        };
      }

      // Validate parentheses
      const parenthesesCheck = validate.validateParentheses(infix);
      if (!parenthesesCheck.valid) {
        return {
          success: false,
          error: parenthesesCheck.error
        };
      }

      // 1. Tokenize
      let tokens = infix.match(/(\d*\.?\d+|[+\-*/()])/g);
      
      if (!tokens || tokens.length === 0) {
        return {
          success: false,
          error: ERROR_MESSAGES.INVALID_EXPRESSION
        };
      }
      
      // 2. Merge negative numbers
      const mergeResult = this.mergeNegativeNumbers(tokens);
      if (!mergeResult.success) {
        return mergeResult;
      }
      tokens = mergeResult.tokens;

      // 3. Shunting yard algorithm
      const output = [];
      const operators = [];

      const precedence = {
        '+': 1,
        '-': 1,
        '*': 2,
        '/': 2
      };

      for (const token of tokens) {
        if (validate.isValidNumber(token)) {
          // Validate number is in safe range
          const num = parseFloat(token);
          if (!validate.isInSafeRange(num)) {
            return {
              success: false,
              error: 'number outside safe range'
            };
          }
          output.push(token);
        } else if (precedence[token]) {
          while (
            operators.length > 0 && 
            precedence[operators[operators.length - 1]] >= precedence[token]
          ) {
            output.push(operators.pop());
          }
          operators.push(token);
        } else if (token === '(') {
          operators.push(token);
        } else if (token === ')') {
          while (operators.length > 0 && operators[operators.length - 1] !== '(') {
            output.push(operators.pop());
          }
          // Pop the opening parenthesis
          if (operators.length === 0) {
            return {
              success: false,
              error: ERROR_MESSAGES.MISMATCHED_PARENTHESES
            };
          }
          operators.pop();
        } else {
          return {
            success: false,
            error: `invalid token: ${token}`
          };
        }
      }

      while (operators.length > 0) {
        const op = operators.pop();
        if (op === '(' || op === ')') {
          return {
            success: false,
            error: ERROR_MESSAGES.MISMATCHED_PARENTHESES
          };
        }
        output.push(op);
      }

      // Validate we have at least one operand
      if (output.length === 0) {
        return {
          success: false,
          error: ERROR_MESSAGES.EMPTY_EXPRESSION
        };
      }

      return {
        success: true,
        postfix: output.join(' ')
      };

    } catch (error) {
      console.error('error in infixToPostfix:', error);
      return {
        success: false,
        error: ERROR_MESSAGES.CALCULATION_ERROR
      };
    }
  },

  /**
   * evaluate a postfix expression
   * @param {string} postfix - expression in postfix notation
   * @returns {{success: boolean, result?: number, error?: string}}
   */
  evaluatePostfix: function (postfix) {
    try {
      // validate input
      if (typeof postfix !== 'string' || postfix.trim() === '') {
        return {
          success: false,
          error: ERROR_MESSAGES.EMPTY_EXPRESSION
        };
      }

      const stack = [];
      const tokens = postfix.split(' ');

      for (const token of tokens) {
        if (validate.isValidNumber(token)) {
          const num = parseFloat(token);
          
          if (!validate.isInSafeRange(num)) {
            return {
              success: false,
              error: 'number outside safe range'
            };
          }
          
          stack.push(num);
        } else {
          // Need at least 2 operands for binary operation
          if (stack.length < 2) {
            return {
              success: false,
              error: ERROR_MESSAGES.MISSING_OPERAND
            };
          }

          const b = stack.pop();
          const a = stack.pop();

          let result;
          
          switch (token) {
            case '+':
              result = a + b;
              break;
            case '-':
              result = a - b;
              break;
            case '*':
              result = a * b;
              break;
            case '/':
              if (b === 0) {
                return {
                  success: false,
                  error: ERROR_MESSAGES.DIVISION_BY_ZERO
                };
              }
              result = a / b;
              break;
            default:
              return {
                success: false,
                error: `invalid operator: ${token}`
              };
          }

          // Check if result is valid and in range
          if (!validate.isValidNumber(result)) {
            return {
              success: false,
              error: ERROR_MESSAGES.CALCULATION_ERROR
            };
          }

          if (!validate.isInSafeRange(result)) {
            return {
              success: false,
              error: 'result outside safe range'
            };
          }

          stack.push(result);
        }
      }

      // Should have exactly one result
      if (stack.length !== 1) {
        return {
          success: false,
          error: ERROR_MESSAGES.INVALID_EXPRESSION
        };
      }

      return {
        success: true,
        result: stack[0]
      };

    } catch (error) {
      console.error('error in evaluatePostfix:', error);
      return {
        success: false,
        error: ERROR_MESSAGES.CALCULATION_ERROR
      };
    }
  },

  /**
   * checks if '-' at the start or after operator and merges it with number
   * @param {Array} tokens - array of tokens
   * @returns {{success: boolean, tokens?: Array, error?: string}}
   */
  mergeNegativeNumbers: function (tokens) {
    try {
      if (!Array.isArray(tokens)) {
        return {
          success: false,
          error: 'tokens must be an array'
        };
      }

      const result = [];

      for (let i = 0; i < tokens.length; i++) {
        const current = tokens[i];
        const previous = tokens[i - 1];
        const next = tokens[i + 1];

        if (current === '-') {
          const isUnary = !previous || ['+', '-', '*', '/', '('].includes(previous);

          if (isUnary && next && this.isNumber(next)) {
            // merge the minus to number
            const negativeNum = '-' + next;
            
            // validate the merged number
            if (!validate.isValidNumber(negativeNum)) {
              return {
                success: false,
                error: ERROR_MESSAGES.INVALID_NUMBER
              };
            }
            
            result.push(negativeNum);
            i++; // skip the next token as we've merged it
          } else {
            // binary subtraction, keep it separate
            result.push(current);
          }
        } else {
          // not '-', push to results
          result.push(current);
        }
      }
      
      return {
        success: true,
        tokens: result
      };

    } catch (error) {
      console.error('error in mergeNegativeNumbers:', error);
      return {
        success: false,
        error: ERROR_MESSAGES.CALCULATION_ERROR
      };
    }
  },

  /**
   * check if a token is a number
   * @param {string} token - The token to check
   * @returns {boolean} True if token is number
   */
  isNumber: function (token) {
    return validate.isValidNumber(token);
  },

  /**
   * Calculate the result of an infix expression
   * @param {string} expression - Mathematical expression in infix notation
   * @returns {{success: boolean, result?: number, error?: string}}
   */
  calculate: function (expression) {
    try {
      // Validate expression
      const expressionCheck = validate.validateExpression(expression);
      if (!expressionCheck.valid) {
        return {
          success: false,
          error: expressionCheck.error
        };
      }

      // Convert to postfix
      const postfixResult = this.infixToPostfix(expression);
      if (!postfixResult.success) {
        return postfixResult;
      }

      // Evaluate postfix
      const evaluationResult = this.evaluatePostfix(postfixResult.postfix);
      return evaluationResult;

    } catch (error) {
      console.error('error in calculate:', error);
      return {
        success: false,
        error: ERROR_MESSAGES.CALCULATION_ERROR
      };
    }
  }
};


/**
 * exports
 */
export { calculatorEngine };
