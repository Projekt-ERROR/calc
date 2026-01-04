/**
 * application coordinator - ties together calculator engine and display
 */

const App = {
  initialize: function () {
    // initialize application
    displayCalculator.typingMessage(displayCalculator.MOTD);
    displayCalculator.initKeyboardSupport();
    displayHistory.updateDisplay();
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
