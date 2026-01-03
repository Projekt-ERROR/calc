/**
 * calculator Engine - Pure mathematical computation
 * converts infix expressions to postfix and evaluates them
 */

const calculatorEngine = {
  /**
   * convert infix notation to postfix (Reverse Polish Notation)
   * @param {string} infix - Mathematical expression in infix notation
   * @returns {string} Expression in postfix notation
   */
  infixToPostfix: function (infix) {
    const tokens = infix.match(/(\d*\.?\d+|[+\-*/()])/g) || [];
    const output = [];
    const operators = [];

    const precedence = {
      '+': 1,
      '-': 1,
      '*': 2,
      '/': 2
    };

    for (const token of tokens) {
      if (!isNaN(parseFloat(token)) && isFinite(token)) {
        output.push(token);
      } else if (precedence[token]) {
        while (operators.length > 0 && precedence[operators[operators.length - 1]] >= precedence[token]) {
          output.push(operators.pop());
        }
        operators.push(token);
      } else if (token === '(') {
        operators.push(token);
      } else if (token === ')') {
        while (operators.length > 0 && operators[operators.length - 1] !== '(') {
          output.push(operators.pop());
        }
        operators.pop();
      }
    }

    while (operators.length > 0) {
      output.push(operators.pop());
    }

    return output.join(' ');
  },

  /**
   * evaluate a postfix expression
   * @param {string} postfix - Expression in postfix notation
   * @returns {number} Result of the calculation
   */
  evaluatePostfix: function (postfix) {
    const stack = [];
    const tokens = postfix.split(' ');

    for (const token of tokens) {
      if (!isNaN(parseFloat(token)) && isFinite(token)) {
        stack.push(parseFloat(token));
      } else {
        const b = stack.pop();
        const a = stack.pop();

        let result;
        if (token === '+') {
          result = a + b;
        } else if (token === '-') {
          result = a - b;
        } else if (token === '*') {
          result = a * b;
        } else if (token === '/') {
          result = a / b;
        }

        stack.push(result);
      }
    }

    return stack[0];
  },

  /**
   * Calculate the result of an infix expression
   * @param {string} expression - mathematical expression in infix notation
   * @returns {number|string} result or 'Error' on failure
   */
  calculate: function (expression) {
    try {
      return this.evaluatePostfix(this.infixToPostfix(expression));
    } catch (err) {
      return 'Error';
    }
  }
};
