/*
 * calculator history functionality
 */

/**
 * imports
 */
import { VALIDATION } from './constants.js';
/**
 * constants
 */
// const max_history = 10;

const calculatorHistory = {
  history: [],

  /**
   * Add calculation to history
   * @param {Object} entry - History entry
   * @param {string} entry.expression - The expression calculated
   * @param {number|string} entry.result - The result
   * @returns {{success: boolean, error?: string}}
   */
  pushToHistory: function (entry) {
    try {
      // Validate entry exists
      if (!entry) {
        console.warn('Cannot add null/undefined entry to history');
        return {
          success: false,
          error: 'Entry is null or undefined'
        };
      }

      // Validate entry structure
      if (typeof entry !== 'object') {
        console.warn('Entry must be an object');
        return {
          success: false,
          error: 'Invalid entry format'
        };
      }

      // Validate has expression
      if (!entry.expression || typeof entry.expression !== 'string') {
        console.warn('Entry must have a valid expression string');
        return {
          success: false,
          error: 'Missing or invalid expression'
        };
      }

      // Validate has result
      if (entry.result === undefined || entry.result === null) {
        console.warn('Entry must have a result');
        return {
          success: false,
          error: 'Missing result'
        };
      }

      // Don't add errors to history
      if (entry.result === 'Error' || typeof entry.result === 'string') {
        console.log('Skipping error result from history');
        return {
          success: false,
          error: 'Cannot add error results to history'
        };
      }

      // Validate result is a valid number
      if (typeof entry.result !== 'number' || !isFinite(entry.result)) {
        console.warn('Result must be a valid finite number');
        return {
          success: false,
          error: 'Invalid result value'
        };
      }

      // Create history entry with timestamp
      const historyEntry = {
        expression: entry.expression.trim(),
        result: entry.result,
        timestamp: new Date().toISOString()
      };

      // Add to history
      this.history.push(historyEntry);

      // Maintain maximum history size
      if (this.history.length > VALIDATION.MAX_HISTORY) {
        this.history.shift();
      }

      return { success: true };

    } catch (error) {
      console.error('Error adding to history:', error);
      return {
        success: false,
        error: 'Failed to add entry to history'
      };
    }
  },

  /**
   * Get all history entries
   * @returns {Array} Array of history entries (defensive copy)
   */
  getHistory: function () {
    try {
      // Return defensive copy to prevent external modification
      return this.history.map(entry => ({ ...entry }));
    } catch (error) {
      console.error('Error retrieving history:', error);
      return [];
    }
  },

  /**
   * Get last history entry
   * @returns {Object|null} Last entry or null if empty
   */
  getLastEntry: function () {
    try {
      if (this.history.length === 0) {
        return null;
      }
      
      // Return defensive copy
      const lastEntry = this.history[this.history.length - 1];
      return { ...lastEntry };
      
    } catch (error) {
      console.error('Error retrieving last entry:', error);
      return null;
    }
  },
  
  /**
   * Clear all history
   * @returns {{success: boolean}}
   */
  clearHistory: function () {
    try {
      this.history = [];
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
   * Get history count
   * @returns {number} Number of entries
   */
  getCount: function () {
    try {
      return this.history.length;
    } catch (error) {
      console.error('Error getting history count:', error);
      return 0;
    }
  },

  /**
   * Get entry by index
   * @param {number} index - Index of entry to retrieve
   * @returns {Object|null} Entry or null if not found
   */
  getEntryByIndex: function (index) {
    try {
      if (typeof index !== 'number' || index < 0 || index >= this.history.length) {
        return null;
      }
      
      return { ...this.history[index] };
      
    } catch (error) {
      console.error('Error retrieving entry by index:', error);
      return null;
    }
  },

  /**
   * Remove entry by index
   * @param {number} index - Index of entry to remove
   * @returns {{success: boolean, error?: string}}
   */
  removeEntryByIndex: function (index) {
    try {
      if (typeof index !== 'number' || index < 0 || index >= this.history.length) {
        return {
          success: false,
          error: 'Invalid index'
        };
      }
      
      this.history.splice(index, 1);
      return { success: true };
      
    } catch (error) {
      console.error('Error removing entry:', error);
      return {
        success: false,
        error: 'Failed to remove entry'
      };
    }
  }
};


/**
 * exports
 */
export { calculatorHistory };
