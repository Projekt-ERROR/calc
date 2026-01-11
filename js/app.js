/**
 * application coordinator - ties together calculator engine and display
 */

import { calculatorEngine } from './calculatorEngine.js';
import { calculatorHistory } from './calculatorHistory.js';
import { displayCalculator, displayHistory } from './displayController.js';
import { ACTIONS, DISPLAY_CONSTANTS } from './constants.js';
import { tryCatch } from './utils.js';

export const App = {
  /**
   * initialize the application
   * @returns {{success: boolean, error?: string}}
   */
  initialize: function () {
    try {
      console.log('Initializing calculator application...');

      // initialize display calculator
      const displayInitResult = displayCalculator.initialize();
      if (!displayInitResult.success) {
        throw new Error(`Display initialization failed: ${displayInitResult.error}`);
      }

      // initialize history display
      const historyInitResult = displayHistory.initialize();
      if (!historyInitResult.success) {
        throw new Error(`History initialization failed: ${historyInitResult.error}`);
      }

      // show welcome message
      displayCalculator.typingMessage(displayCalculator.MOTD);
      
      // update history display
      displayHistory.updateDisplay();

      // set up event listeners
      this.setupEventListeners();

      console.log('Calculator application initialized successfully');
      return { success: true };

    } catch (error) {
      console.error('Fatal: Application initialization failed:', error);
      
      // try to show error to user
      tryCatch(
        () => {
          const display = document.getElementById('display');
          if (display) {
            display.value = 'Initialization Error';
          }
        },
        null,
        'Failed to display initialization error'
      );

      return {
        success: false,
        error: error.message || 'Application initialization failed'
      };
    }
  },

  /**
   * set up all event listeners
   * @returns {{success: boolean, error?: string}}
   */
  setupEventListeners: function () {
    try {
      // listen for calculate event from keyboard
      document.addEventListener('calculator:calculate', () => {
        tryCatch(
          () => this.calculate(),
          null,
          'Calculate event handler error'
        );
      });

      // calculator buttons
      const calculatorButtons = document.getElementById('calculator-buttons');
      if (!calculatorButtons) {
        throw new Error('Calculator buttons element not found');
      }

      calculatorButtons.addEventListener('click', (event) => {
        tryCatch(
          () => this.handleButtonClick(event),
          null,
          'Button click handler error'
        );
      });

      // history clear button
      const historyClearBtn = document.querySelector('#history-clear-btn');
      if (!historyClearBtn) {
        throw new Error('History clear button not found');
      }

      historyClearBtn.addEventListener('click', () => {
        tryCatch(
          () => this.clearHistory(),
          null,
          'Clear history handler error'
        );
      });

      // initialize keyboard support
      const keyboardResult = displayCalculator.initKeyboardSupport();
      if (!keyboardResult.success) {
        console.warn('Keyboard support initialization failed:', keyboardResult.error);
      }

      return { success: true };

    } catch (error) {
      console.error('Failed to set up event listeners:', error);
      return {
        success: false,
        error: 'Event listener setup failed'
      };
    }
  },

  /**
   * handle calculator button clicks
   * @param {MouseEvent} event - click event
   */
  handleButtonClick: function (event) {
    try {
      const button = event.target.closest('button');
      if (!button) {
        return { success: true };
      }

      const action = button.dataset.action;
      const value = button.dataset.value;

      if (value) {
        const result = displayCalculator.appendToDisplay(value);
        if (!result.success) {
          console.warn('failed to append value:', result.error);
          return result;
        }
      } else if (action === ACTIONS.CLEAR) {
        const result = displayCalculator.resetDisplay();
        if (!result.success) {
          console.warn('failed to reset:', result.error);
          return result;
        }
      } else if (action === ACTIONS.DELETE) {
        const result = displayCalculator.deleteLast();
        if (!result.success) {
          console.warn('failed to reset', result.error);
          return result;
        }
      } else if (action === ACTIONS.CALCULATE) {
        return this.calculate();
      }
      
      return { success: true };
    } catch (error) {
      console.error('error handling button click:', error);
      return {
        success: false,
        error: 'error handling button click'
      };
    }
  },

  /**
   * calculate and display result
   * @returns {{success: boolean, result?: number, error?: string}}
   */
  calculate: function () {
    try {
      const expression = displayCalculator.getValue();

      // Don't calculate MOTD
      if (expression === DISPLAY_CONSTANTS.MOTD) {
        return {
          success: false,
          error: 'Cannot calculate MOTD'
        };
      }

      // Don't calculate empty expression
      if (!expression || expression.trim() === '') {
        displayCalculator.setValue('Error');
        return {
          success: false,
          error: 'Empty expression'
        };
      }

      // Perform calculation
      const calculationResult = calculatorEngine.calculate(expression);

      // Handle calculation errors
      if (!calculationResult.success) {
        console.warn('Calculation error:', calculationResult.error);
        displayCalculator.setValue('Error');
        
        // Show specific error message briefly if available
        if (calculationResult.error) {
          this.showTemporaryError(calculationResult.error);
        }
        
        return calculationResult;
      }

      // Display successful result
      const result = calculationResult.result;
      displayCalculator.setValue(result);

      // Add to history
      const historyResult = calculatorHistory.pushToHistory({
        expression: expression,
        result: result
      });

      if (!historyResult.success) {
        console.warn('Failed to add to history:', historyResult.error);
      }

      // Update history UI
      const displayResult = displayHistory.updateDisplay();
      if (!displayResult.success) {
        console.warn('Failed to update history display:', displayResult.error);
      }

      return {
        success: true,
        result: result
      };

    } catch (error) {
      console.error('Unexpected error in calculate:', error);
      displayCalculator.setValue('Error');
      return {
        success: false,
        error: 'Calculation failed'
      };
    }
  },

  /**
   * Show temporary error message in console
   * @param {string} message - Error message to show
   */
  showTemporaryError: function (message) {
    try {
      console.error('calculation error:', message);
      return {
        success: true
      };    
    } catch (error) {
      console.error('error showing temporary error:', error);
      return {
        success: false,
        error: 'error showing temporary error'
      };
    }
  },

  /**
   * Clear history and update display
   * @returns {{success: boolean, error?: string}}
   */
  clearHistory: function () {
    try {
      const clearResult = calculatorHistory.clearHistory();
      
      if (!clearResult.success) {
        console.error('Failed to clear history:', clearResult.error);
        return clearResult;
      }

      const displayResult = displayHistory.updateDisplay();
      
      if (!displayResult.success) {
        console.warn('Failed to update display after clearing:', displayResult.error);
      }

      console.log('History cleared successfully');
      return { success: true };

    } catch (error) {
      console.error('Error clearing history:', error);
      return {
        success: false,
        error: 'Failed to clear history'
      };
    }
  },

  /**
   * get application state for debugging
   * @returns {Object} current application state
   */
  getState: function () {
    try {
      return {
        success: true,
        state: {
          display: displayCalculator.getValue(),
          historyCount: calculatorHistory.getCount(),
          isShowingMotd: displayCalculator.isShowingMotd()
        }
      };
    } catch (error) {
      console.error('error getting application state:', error);
      return {
        success: false,
        error: 'failed to get state'
      };
    }
  }
};

// initialize application when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    App.initialize();
  });
} else {
  // DOM already loaded
  App.initialize();
}
