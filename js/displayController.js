/**
 * display controller - manages all display and UI interactions
 */

const MOTD = 'please use buttons';
const TYPING_SPEED = 50;

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
    if (this.isShowingMotd()) this.clearDisplay();
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
  }
};
