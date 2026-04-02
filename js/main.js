// Main entry point for charity: water Push the Box game

document.addEventListener('DOMContentLoaded', () => {
  // Initialize game engine
  gameEngine = new GameEngine();

  // Initialize UI
  initUI();

  // Start game immediately with default difficulty
  selectedDifficulty = 'easy';
  gameEngine.setDifficulty(selectedDifficulty);
  gameEngine.initGame(levels[0]);
  isPlaying = true;
  startTimer();
  showNotification(
    'Game started on Easy by default. Use difficulty controls at top to change anytime.',
    'info'
  );
});
