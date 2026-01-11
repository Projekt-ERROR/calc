/*
 * calculator history functionality
 */

/**
 * imports
 */
import { VALIDATION } from './constants.js';
import { tryCatch } from './utils.js'
/**
 * constants
 */
// const max_history = 10;

const calculatorHistory = {
  history: [],

  /**
   * add calculation to history
   * @param {Object} entry - history entry
   * @param {string} entry.expression - the expression calculated
   * @param {number|string} entry.result - the result
   * @returns {{success: boolean, error?: string}}
   */
  pushToHistory: function (entry) {
    try {
      // validate entry exists
      if (!entry) {
        console.warn('cannot add null/undefined entry to history');
        return {
          success: false,
          error: 'entry is null or undefined'
        };
      }

      // validate entry structure
      if (typeof entry !== 'object') {
        console.warn('entry must be an object');
        return {
          success: false,
          error: 'invalid entry format'
        };
      }

      // validate has expression
      if (!entry.expression || typeof entry.expression !== 'string') {
        console.warn('entry must have a valid expression string');
        return {
          success: false,
          error: 'missing or invalid expression'
        };
      }

      // validate has result
      if (entry.result === undefined || entry.result === null) {
        console.warn('entry must have a result');
        return {
          success: false,
          error: 'missing result'
        };
      }

      // don't add errors to history
      if (entry.result === 'Error' || typeof entry.result === 'string') {
        console.log('skipping error result from history');
        return {
          success: false,
          error: 'cannot add error results to history'
        };
      }

      // validate result is a valid number
      if (typeof entry.result !== 'number' || !isFinite(entry.result)) {
        console.warn('result must be a valid finite number');
        return {
          success: false,
          error: 'invalid result value'
        };
      }

      // create history entry with timestamp
      const historyEntry = {
        expression: entry.expression.trim(),
        result: entry.result,
        timestamp: new Date().toISOString()
      };

      // add to history
      this.history.push(historyEntry);

      // maintain maximum history size
      if (this.history.length > VALIDATION.MAX_HISTORY) {
        this.history.shift();
      }

      return { success: true };

    } catch (error) {
      console.error('error adding to history:', error);
      return {
        success: false,
        error: 'failed to add entry to history'
      };
    }
  },

  /**
   * get all history entries
   * @returns {Array} array of history entries (defensive copy)
   */
  getHistory: function () {
    return tryCatch(
      () => this.history.map(entry => ({ ...entry })),
      [],
      'error retrieving histor'
    );
  },

  /**
   * get last history entry
   * @returns {Object|null} last entry or null if empty
   */
  getLastEntry: function () {
    return tryCatch(
      () => {
        if (this.history.length === 0) return null;
        
        // return defensive copy
        return { ...this.history[this.history.length - 1] };
      },
      null,
      'error retrieving last entry'
    );
  },
  
  /**
   * clear all history
   * @returns {{success: boolean}}
   */
  clearHistory: function () {
    try {
      this.history = [];
      return { success: true };
      
    } catch (error) {
      console.error('error clearing history:', error);
      return {
        success: false,
        error: 'failed to clear history'
      };
    }
  },

  /**
   * get history count
   * @returns {number} number of entries
   */
  getCount: function () {
    return tryCatch(
      () => this.history.length,
      0,
      'error getting history count'
    );
  },

  /**
   * get entry by index
   * @param {number} index - index of entry to retrieve
   * @returns {Object|null} entry or null if not found
   */
  getEntryByIndex: function (index) {
    return tryCatch(
      () => {
        if (typeof index !== 'number' || index < 0 || index >= this.history.length) return null;
        return { ...this.history[index] };
      },
      null,
      'error retrieiving entry by index'
    );
  },

  /**
   * remove entry by index
   * @param {number} index - index of entry to remove
   * @returns {{success: boolean, error?: string}}
   */
  removeEntryByIndex: function (index) {
    try {
      if (typeof index !== 'number' || index < 0 || index >= this.history.length) {
        return {
          success: false,
          error: 'invalid index'
        };
      }
      
      this.history.splice(index, 1);
      return { success: true };
      
    } catch (error) {
      console.error('error removing entry:', error);
      return {
        success: false,
        error: 'failed to remove entry'
      };
    }
  }
};


/**
 * exports
 */
export { calculatorHistory };
