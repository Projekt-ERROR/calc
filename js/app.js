/**
 * application coordinator - ties together calculator engine and display
 */

const App = {
  /**
   * calculate and display result
   */
  calculate: function () {
    const expression = displayController.getValue();
    const result = calculatorEngine.calculate(expression);

    displayController.setValue(result);
  }
};

// initialize application
displayController.typingMessage(MOTD);
