// Main entry point for charity: water Push the Box game

document.addEventListener('DOMContentLoaded', () => {
  // Initialize game engine
  gameEngine = new GameEngine();

  // Initialize UI
  initUI();

  // Start game immediately with default difficulty
  selectedDifficulty = 'easy';
  gameEngine.setDifficulty(selectedDifficulty);

  // Load saved level or start at level 0
  const savedProgress = loadProgress();
  gameEngine.initGame(levels[savedProgress.currentLevel]);
  isPlaying = true;
  startTimer();
  if (typeof updateLevelSelector === 'function') updateLevelSelector();
  showNotification(
    `Game started on Easy. Level ${savedProgress.currentLevel + 1}. Use difficulty controls at top to change anytime.`,
    'info'
  );
});
