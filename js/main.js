// Main entry point for charity: water Push the Box game

document.addEventListener('DOMContentLoaded', () => {
  // Initialize game engine
  gameEngine = new GameEngine();

  // Initialize UI
  initUI();

  // Start the game
  gameEngine.initGame(levels[0]);

  // Show welcome message
  showNotification(
    'Welcome to charity: water Push the Box! Push buckets onto dry soil to water them.',
    'info'
  );
});
