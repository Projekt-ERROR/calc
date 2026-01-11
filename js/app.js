/**
 * Application coordinator - ties together calculator engine and display
 */

import { calculatorEngine } from './calculatorEngine.js';
import { calculatorHistory } from './calculatorHistory.js';
import { displayCalculator, displayHistory } from './displayController.js';
import { ACTIONS, DISPLAY_CONSTANTS } from './constants.js';
import { tryCatch } from './utils.js';

export const App = {
  /**
   * Initialize the application
   * @returns {{success: boolean, error?: string}}
   */
  initialize: function () {
    try {
      console.log('Initializing calculator application...');

      // Initialize display calculator
      const displayInitResult = displayCalculator.initialize();
      if (!displayInitResult.success) {
        throw new Error(`Display initialization failed: ${displayInitResult.error}`);
      }

      // Initialize history display
      const historyInitResult = displayHistory.initialize();
      if (!historyInitResult.success) {
        throw new Error(`History initialization failed: ${historyInitResult.error}`);
      }

      // Show welcome message
      displayCalculator.typingMessage(displayCalculator.MOTD);
      
      // Update history display
      displayHistory.updateDisplay();

      // Set up event listeners
      this.setupEventListeners();

      console.log('Calculator application initialized successfully');
      return { success: true };

    } catch (error) {
      console.error('Fatal: Application initialization failed:', error);
      
      // Try to show error to user
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
   * Set up all event listeners
   * @returns {{success: boolean, error?: string}}
   */
  setupEventListeners: function () {
    try {
      // Listen for calculate event from keyboard
      document.addEventListener('calculator:calculate', () => {
        tryCatch(
          () => this.calculate(),
          null,
          'Calculate event handler error'
        );
      });

      // Calculator buttons
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

      // History clear button
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

      // Initialize keyboard support
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
   * Handle calculator button clicks
   * @param {MouseEvent} event - Click event
   */
  handleButtonClick: function (event) {
    try {
      const button = event.target.closest('button');
      if (!button) return;

      const action = button.dataset.action;
      const value = button.dataset.value;

      if (value) {
        const result = displayCalculator.appendToDisplay(value);
        if (!result.success) {
          console.warn('Failed to append value:', result.error);
          // Optionally provide user feedback here
        }
      } else if (action === ACTIONS.CLEAR) {
        displayCalculator.resetDisplay();
      } else if (action === ACTIONS.DELETE) {
        displayCalculator.deleteLast();
      } else if (action === ACTIONS.CALCULATE) {
        this.calculate();
      }

    } catch (error) {
      console.error('Error handling button click:', error);
    }
  },

  /**
   * Calculate and display result
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
      console.error('Calculation error:', message);
      
      // Could add UI notification here in the future
      // For example, a toast notification or status message
      
    } catch (error) {
      console.error('Error showing temporary error:', error);
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
   * Get application state for debugging
   * @returns {Object} Current application state
   */
  getState: function () {
    try {
      return {
        display: displayCalculator.getValue(),
        historyCount: calculatorHistory.getCount(),
        isShowingMotd: displayCalculator.isShowingMotd()
      };
    } catch (error) {
      console.error('Error getting application state:', error);
      return {
        error: 'Failed to get state'
      };
    }
  }
};

// Initialize application when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    App.initialize();
  });
} else {
  // DOM already loaded
  App.initialize();
}
