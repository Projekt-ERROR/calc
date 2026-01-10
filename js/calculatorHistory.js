/*
 * calculator history functionality
 */

/**
 * constants
 */
const MAX_HISTORY = 10;

const calculatorHistory = {
  history: [],

  /**
  * add calculation to history
  * @param {Object} entry - history entry
  * @param {string} entry.expression - the expression calculated
  * @param {number|string} entry.result - the result
  */

  pushToHistory: function (entry) {
    // check 1: entry exists
    if (!entry) {
      console.warn('Cannot add null/undefined entry to history');
      return;
    }

    // check 2: has expression
    if (!entry.expression) {
      console.warn('Cannot add entry without expression');
      return;
    }

    // check 3: not an error
    if (entry.result === 'Error') {
      console.log('Skipping error result from history');
      return;
    }

    // add to history
    this.history.push({
      expression: entry.expression,
      result: entry.result,
      timestamp: new Date().toISOString()
    });

    // check for if over limit and if so remove oldest
    if (this.history.length > MAX_HISTORY) {
      this.history.shift();
    }
  },

  /**
   * gets all history entries
   * @returns {Array} array of history entries
   */
  getHistory: function () {
    return [...this.history];
  },

  getLastEntry: function () {
    if (this.history.length === 0) return null;
    return this.history[this.history.length - 1];
  },
  
  /**
   * clears history
   */
  clearHistory: function () {
    this.history = [];
  },

  /**
   * get histroy count
   * @returns {number} number of entries
   */
  getCount: function () {
    return this.history.length;
  }
};


/**
 * exports
 */
export { MAX_HISTORY, calculatorHistory };
