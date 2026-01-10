/**
 * application coordinator - ties together calculator engine and display
 */

/**
 * imports
 */
import { calculatorEngine } from './calculatorEngine.js';
import { calculatorHistory } from './calculatorHistory.js';
import { displayCalculator, displayHistory } from './displayController.js';


const App = {
  initialize: function () {
    // initialize application
    displayCalculator.typingMessage(displayCalculator.MOTD);
    displayCalculator.initKeyboardSupport();
    displayHistory.updateDisplay();

    // listen for calculate from keyboard
    document.addEventListener('calculator:calculate', () => {
      this.calculate();
    });

    // doc initialize
    document.getElementById('calculator-buttons')
      .addEventListener('click', (event) => {
        const button = event.target.closest('button');
        if (!button) return;

        const action = button.dataset.action;
        const value = button.dataset.value;

        if (value) {
          displayCalculator.appendToDisplay(value);
        } else if (action === 'clear') {
          displayCalculator.resetDisplay();
        } else if (action === 'delete') {
          displayCalculator.deleteLast();
        } else if (action === 'calculate') {
          this.calculate();
        }
      });

    document.querySelector('#history-clear-btn')
      .addEventListener('click', () => this.clearHistory());
  },

  /**
   * calculate and display result
   */
  calculate: function () {
    const expression = displayCalculator.getValue();
    const result = calculatorEngine.calculate(expression);

    // display result
    displayCalculator.setValue(result);

    // add to history
    if (expression !== displayCalculator.MOTD) {
      calculatorHistory.pushToHistory({
        expression: expression,
        result: result
      });

      // update history UI
      displayHistory.updateDisplay();
    }
  },

  /**
   * clears history and updates history display
   */
  clearHistory: function () {
    calculatorHistory.clearHistory();
    displayHistory.updateDisplay();
  }
};


/**
 * exports
 */
export { App };

// initialize js
App.initialize();
