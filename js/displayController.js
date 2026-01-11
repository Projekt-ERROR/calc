/**
 * display controller - manages all display and UI interactions
 */

/**
 * imports
 */
import { sleep, tryCatch } from './utils.js';
import { calculatorHistory } from './calculatorHistory.js';
import { VALIDATION, OPERATORS, DISPLAY_CONSTANTS } from './constants.js';

// ============================================
// CALCULATOR DISPLAY
// ============================================

const displayCalculator = {
  // consts
  MOTD: DISPLAY_CONSTANTS.MOTD,
  TYPING_SPEED: DISPLAY_CONSTANTS.TYPING_SPEED,

  // DOM reference
  display: null,

  // animation controller
  typingController: null,
  currentAnimationId: 0,

  /**
   * Initialize the display controller
   * @returns {{success: boolean, error?: string}}
   */
  initialize: function () {
    try {
      this.display = document.getElementById('display');
      
      if (!this.display) {
        throw new Error('Display element not found');
      }
      
      return { success: true };
      
    } catch (error) {
      console.error('Failed to initialize display:', error);
      return {
        success: false,
        error: 'Display initialization failed'
      };
    }
  },

  /**
   * get current display value
   * @returns {string}
   */
  getValue: function () {
    try {
      if (!this.display) {
        console.warn('display not initialized');
        return '';
      }

      return this.display.value || '';

    } catch (error) {
      console.error('error getting display value: ', error);
      return '';
    }
  },

  /**
   * gets the current number
   * @returns {string} the current number string
   */
  getCurrentNumber: function () {
    try {
      const display = this.getValue();
      const parts = display.split(/[+\-*/]/);
      return parts[parts.length - 1] || '';

    } catch (error) {
      console.error('error getting current number: ', error);
      return '';
    }
  },

  /**
   * set display value
   * @param {string} value
   */
  setValue: function (value) {
    try {
      if (!this.display) {
        return {
          success: false,
          error: 'display not initialized'
        };
      }

      const stringValue = String(value);

      if (stringValue.length > VALIDATION.MAX_DISPLAY_LENGTH) {
        console.warn('display value exceeds the max length');
        return {
          success: false,
          error: 'value to long for display'
        };
      }

      this.display.value = stringValue;
      return { success: true };

    } catch (error) {
      console.error('error setting display value: ', error);
      return {
        success: false,
        error: 'failed to set display value'
      };
    }
  },

  /**
   * clear display and cancel any active animations
   */
  clearDisplay: function () {
    try {
      if (this.typingController) {
        this.typingController.abort();
        this.typingController = null;
      }
      this.currentAnimationId++;
      this.setValue('');

      return { success: true };
    } catch (error) {
      console.error('error clearing display');
      return {
        success: false,
        error: 'failed to clear display'
      };
    }
  },

  /**
   * append input to display
   * @param {string} input
   */
  appendToDisplay: function (input) {
    try {
      if (typeof input !== 'string' || input === '') {
        return {
          success: false,
          error: 'invalid input'
        };
      }

      // Check for MOTD
      if (this.isShowingMotd()) {
        this.clearDisplay();
      }

      const currentNumber = this.getCurrentNumber();
      const display = this.getValue();

      if (display.length >=  VALIDATION.MAX_DISPLAY_LENGTH) {
        console.warn('display at max length');
        return {
          success: false,
          error: 'display full'
        };
      }

      // Special handling for decimal
      if (input === '.') { 
        if (currentNumber.includes('.')) {
          return {
            success: false,
            error: 'number already has decimal point'
          };
        }
        if (currentNumber === '') {
          input = '0.';
        }
      }

      // Special handling for operators
      if (OPERATORS.includes(input)) {
        
        // Count consecutive operators at end
        let consecutiveOps = 0;
        for (let i = display.length - 1; i >= 0; i--) {
          if (OPERATORS.includes(display[i])) {
            consecutiveOps++;
          } else {
            break;
          }
        }

        // empty display: only allow minus
        if (display === '' && input !== '-') {
          return {
            success: false,
            error: 'cannot start with operator'
          };
        }

        // starting with minus: don't allow another minus (prevent --)
        if (display === '-') {
          return {
            success: false,
            error: 'invalid operator sequence'
          };
        }

        // 1 operator already: only allow minus (for negatives like 5+-3)
        if (consecutiveOps === 1 && input !== '-') {
          return {
            success: false,
            error: 'invalid operator sequence'
          }
        }

        // 2+ operators already: block everything
        if (consecutiveOps >= 2) {
          return {
            success: false,
            error: 'too many consecutive operators'
          };
        }
      }

      const result = this.setValue(display + input);
      return result;
    } catch (error) {
      console.error('error appending to display: ', error);
      return {
        success: false,
        error: 'failed to append to display'
      };
    }
  },

  /**
   * reset display and show MOTD
   */
  resetDisplay: function () {
    try {
      this.setValue('');
      this.typingMessage(this.MOTD);
      return { success: true };
    } catch (error) {
      console.error('error resetting display: ', error);
      return {
        success: false,
        error: 'failed to reset display'
      };
    }
  },

  /**
   * check if currently showing MOTD
   * @returns {boolean}
   */
  isShowingMotd: function () {
    try {

      return this.typingController !== null || this.getValue() === this.MOTD;

    } catch (error) {

      console.error('error checking MOTD status: ', error);
      return false;

    }
  },

  /**
   * delete last character from display
   */
  deleteLast: function () {
    try {
      const currentValue = this.getValue();

      if (this.isShowingMotd() ||
          currentValue === 'Error' ||
          currentValue === 'undefined') {
        return this.clearDisplay();
      }

      this.setValue(currentValue.slice(0, -1));
      return { success:true };

    } catch (error) {

      console.error('failed to delete last character: ', error);
      return {
        success: false,
        error: 'failed to delete last character'
      };
    }
  },

  /**
   * type message character by character with animation
   * @param {string} message
   */
  typingMessage: async function (message) {
    try {
      if (typeof message !== 'string') {
        return {
          success: false,
          error: 'Message must be a string'
        };
      }

      if (this.typingController) {
        this.typingController.abort();
      }

      const animationId = ++this.currentAnimationId;
      this.typingController = new AbortController();
      const { signal } = this.typingController;

      this.setValue('');

      try {
        for (const char of message) {
          if (signal.aborted || animationId !== this.currentAnimationId) {
            break;
          }

          this.setValue(this.getValue() + char);
          await sleep(this.TYPING_SPEED, signal);
        }

        this.typingController = null;
        return { success: true };

      } catch (error) {
        
        if (error.name === 'AbortError') {
          return { success: true };
        }

        throw error;
      }

    } catch (error) {

      console.error('Error in typing animation:', error);
      this.typingController = null;
      return {
        success: false,
        error: 'typing animation failed'
      };
    }
  },

  /**
   * initializes keyboard support
   * initializes the keyboard event listener
   */
  initKeyboardSupport: function () {
    try {
      document.addEventListener('keydown', (event) => {
        tryCatch(
          () => this.handleKeyPress(event),
          null,
          'Keyboard event handling error'
        );
      });

      return { success: true };
    } catch (error) {
      console.error('failed to initialize keyboard support:', error);
      return {
        success: false,
        error: 'keyboard initialization failed'
      };
    }
  },

  /**
   * handles individual keypress event
   * @param {KeyboardEvent} event - the keyboard event
   */
  handleKeyPress: function (event) {
    try {
      if (!event || !event.key) {
        return;
      }

      const key = event.key;

      // checks if num
      if (!isNaN(parseFloat(key)) && isFinite(key)) {
        event.preventDefault();
        this.appendToDisplay(key);

      // checks if operator
      } else if (OPERATORS.includes(key)) {
        event.preventDefault();
        this.appendToDisplay(key);

      // checks if decimal
      } else if (key === '.') {
        event.preventDefault();
        this.appendToDisplay(key);

      // checks if '=' or 'Enter' to call App.calculate
      } else if (key === '=' || key === 'Enter') {
        event.preventDefault();
        document.dispatchEvent(new CustomEvent('calculator:calculate'));

      // checks if 'Backspace' to delete last
      } else if (key === 'Backspace') {
        event.preventDefault();
        this.deleteLast();

      // checks if 'Escape' or 'c' to reset display
      } else if (key === 'Escape' || key.toLowerCase() === 'c') {
        event.preventDefault();
        this.resetDisplay();
      }
    } catch (error) {
      console.error('Error handling key press:', error);
    }
  }
};

// ============================================
// HISTORY DISPLAY
// ============================================

const displayHistory = {
  // DOM reference
  historyList: null,

  /**
   * initialize history display
   * @returns {{success: boolean, error?: string}}
   */
  initialize: function () {
    try {
      this.historyList = document.getElementById('history-list');
      
      if (!this.historyList) {
        throw new Error('history list element not found');
      }

      // set up event delegation
      this.historyList.addEventListener('click', (event) => {
        tryCatch(
          () => {
            const historyItem = event.target.closest('.history-item');
            
            if (!historyItem) return;

            const expression = historyItem.dataset.expression;
            
            if (expression) {
              displayCalculator.setValue(expression);
            }
          },
          null,
          'history item click error'
        );
      });
      
      return { success: true };
      
    } catch (error) {
      console.error('failed to initialize history display:', error);
      return {
        success: false,
        error: 'history display initialization failed'
      };
    }
  },

  /**
   * update the history display in UI
   * @returns {{success: boolean, error?: string}}
   */
  updateDisplay: function () {
    try {
      if (!this.historyList) {
        return {
          success: false,
          error: 'history list not initialized'
        };
      }

      const history = calculatorHistory.getHistory();
      
      // clear current display
      this.historyList.innerHTML = '';
      
      // show message if empty
      if (history.length === 0) {
        this.showEmptyMessage();
        return { success: true };
      }
      
      // add each history item (newest first)
      const reversedHistory = [...history].reverse();
      
      for (const entry of reversedHistory) {
        const result = this.addHistoryItem(entry);
        if (!result.success) {
          console.warn('failed to add history item:', result.error);
        }
      }
      
      return { success: true };
      
    } catch (error) {
      console.error('error updating history display:', error);
      return {
        success: false,
        error: 'failed to update history display'
      };
    }
  },

  /**
   * add a single history item to the display
   * @param {Object} entry - history entry
   * @param {string} entry.expression - the expression
   * @param {number|string} entry.result - the result
   * @returns {{success: boolean, error?: string}}
   */
  addHistoryItem: function (entry) {
    try {
      if (!entry || !entry.expression) {
        return {
          success: false,
          error: 'invalid history entry'
        };
      }

      if (!this.historyList) {
        return {
          success: false,
          error: 'history list not initialized'
        };
      }

      const item = document.createElement('div');
      item.className = 'history-item';
      item.dataset.expression = entry.expression;

      // sanitize values for display
      const expression = String(entry.expression).substring(0, 100);
      const result = String(entry.result).substring(0, 20);

      item.innerHTML = `
        <span class="history-expression">${this.escapeHtml(expression)}</span>
        <span class="history-result">= ${this.escapeHtml(result)}</span>
      `;
      
      this.historyList.appendChild(item);
      
      return { success: true };
      
    } catch (error) {
      console.error('error adding history item:', error);
      return {
        success: false,
        error: 'failed to add history item'
      };
    }
  },

  /**
   * show empty history message
   * @returns {{success: boolean}}
   */
  showEmptyMessage: function () {
    try {
      if (!this.historyList) {
        return {
          success: false,
          error: 'history list not initialized'
        };
      }

      const message = document.createElement('div');
      message.className = 'history-empty';
      message.textContent = 'no calculations yet';
      this.historyList.appendChild(message);
      
      return { success: true };
      
    } catch (error) {
      console.error('error showing empty message:', error);
      return {
        success: false,
        error: 'failed to show empty message'
      };
    }
  },

  /**
   * escape HTML to prevent XSS
   * @param {string} text - text to escape
   * @returns {string} escaped text
   */
  escapeHtml: function (text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
};


/**
 * exports
 */
export { OPERATORS, displayCalculator, displayHistory };
