/**
 * display controller - manages all display and UI interactions
 */

const MOTD = 'please use buttons';
const TYPING_SPEED = 50;
const OPERATORS = ['+', '-', '*', '/'];

const displayController = {
  display: document.getElementById('display'),
  typingController: null,
  currentAnimationId: 0,

  /**
   * get current display value
   * @returns {string}
   */
  getValue: function () {
    return this.display.value;
  },

  /**
   * gets the current number
   * @returns {string} the current number string
   */
  getCurrentNumber: function () {
    const display = this.getValue();
    const parts = display.split(/[+\-*/]/);
    return parts[parts.length - 1];
  },

  /**
   * set display value
   * @param {string} value
   */
  setValue: function (value) {
    this.display.value = value;
  },

  /**
   * clear display and cancel any active animations
   */
  clearDisplay: function () {
    if (this.typingController) {
      this.typingController.abort();
      this.typingController = null;
    }
    this.currentAnimationId++;
    this.setValue('');
  },

  /**
   * append input to display
   * @param {string} input
   */
    appendToDisplay: function (input) {
      const currentNumber = this.getCurrentNumber();
      const display = this.getValue();
      
      // Check for MOTD
      if (this.isShowingMotd()) this.clearDisplay();

      // Special handling for decimal
      if (input === '.') { 
        if (currentNumber.includes('.')) {
          return;
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
        if (display === '' && input !== '-') return;

        // starting with minus: don't allow another minus (prevent --)
        if (display === '-') return;

        // 1 operator already: only allow minus (for negatives like 5+-3)
        if (consecutiveOps === 1 && input !== '-') return;

        // 2+ operators already: block everything
        if (consecutiveOps >= 2) return;
      }
      
      this.setValue(this.getValue() + input);
    },

  /**
   * reset display and show MOTD
   */
  resetDisplay: function () {
    this.setValue('');
    this.typingMessage(MOTD);
  },

  /**
   * check if currently showing MOTD
   * @returns {boolean}
   */
  isShowingMotd: function () {
    return this.typingController !== null || this.getValue() === MOTD;
  },

  /**
   * delete last character from display
   */
  deleteLast: function () {
    if (this.isShowingMotd()) this.clearDisplay();
    this.setValue(this.getValue().slice(0, -1));
  },

  /**
   * type message character by character with animation
   * @param {string} message
   */
  typingMessage: async function (message) {
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
        await sleep(TYPING_SPEED, signal);
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        return;
      }
      throw err;
    }
  },

  /**
   * initializes keyboard support
   * initializes the keyboard event listener
   */
  initKeyboardSupport: function () {
    document.addEventListener('keydown', (event) => {
      this.handleKeyPress(event);
    });
  },

  /**
   * handles individual keypress event
   * @param {KeyboardEvent} event - the keyboard event
   */
  handleKeyPress: function (event) {
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
      App.calculate();

    // checks if 'Backspace' to delete last
    } else if (key === 'Backspace') {
      event.preventDefault();
      this.deleteLast();

    // checks if 'Escape' or 'c' to reset display
    } else if (key === 'Escape' || key.toLowerCase() === 'c') {
      event.preventDefault();
      this.resetDisplay();
    }
  }
};
