// UI Management for charity: water Push the Box

// Global game engine instance
let gameEngine;

// Difficulty selection
let selectedDifficulty = 'easy';
let isPlaying = false;

// Global error tracker for debugging
window.addEventListener('error', (event) => {
  console.error('Unhandled JS error:', event.error || event.message);
  showNotification(`Error: ${event.message} (see console)`, 'error');
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled rejection:', event.reason);
  showNotification(`Promise error: ${event.reason}`, 'error');
});

// Notification system
function showNotification(message, type = 'info') {
  const notification = document.getElementById('notification');
  notification.textContent = message;
  notification.className = `notification-bar ${type} show`;

  setTimeout(() => {
    notification.classList.remove('show');
  }, 3000);
}

// Modal system
function showModal(title, message, buttonText, callback) {
  // Remove existing modal
  const existingModal = document.querySelector('.modal');
  if (existingModal) {
    existingModal.remove();
  }

  const modal = document.createElement('div');
  modal.className = 'modal show';

  modal.innerHTML = `
        <div class="modal-content">
            <h2>${title}</h2>
            <p>${message}</p>
            <button>${buttonText}</button>
        </div>
    `;

  document.body.appendChild(modal);

  modal.querySelector('button').addEventListener('click', () => {
    modal.remove();
    if (callback) callback();
  });
}

// Confetti effect
function triggerConfetti() {
  if (typeof confetti === 'function') {
    const colors = ['#FFC907', '#77A8BB', '#003366', '#BF6C46', '#ffffff'];

    // Primary burst from center-bottom area
    confetti({
      particleCount: 180,
      spread: 90,
      origin: { y: 0.55 },
      colors,
    });

    // Optional supporting bursts for visual richness
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { x: 0.2, y: 0.6 },
      colors,
    });

    confetti({
      particleCount: 70,
      spread: 60,
      origin: { x: 0.8, y: 0.6 },
      colors,
    });

    return;
  }

  // Fallback manual confetti for environments without canvas-confetti
  const duration = 3000;
  const animationEnd = Date.now() + duration;

  const randomInRange = (min, max) => Math.random() * (max - min) + min;

  (function frame() {
    const timeLeft = animationEnd - Date.now();
    if (timeLeft <= 0) return;

    const particleCount = 50 * (timeLeft / duration);
    for (let i = 0; i < particleCount; i++) {
      createConfettiParticle();
    }

    requestAnimationFrame(frame);
  })();
}

function createConfettiParticle() {
  const particle = document.createElement('div');
  particle.style.position = 'fixed';
  particle.style.width = '10px';
  particle.style.height = '10px';
  particle.style.backgroundColor = ['#FFC907', '#77A8BB', '#003366', '#BF6C46', '#ffffff'][
    Math.floor(Math.random() * 5)
  ];
  particle.style.left = Math.random() * 100 + 'vw';
  particle.style.top = '-10px';
  particle.style.zIndex = '9999';
  particle.style.pointerEvents = 'none';

  document.body.appendChild(particle);

  const animation = particle.animate(
    [
      { transform: 'translateY(0) rotate(0deg)', opacity: 1 },
      {
        transform: `translateY(${window.innerHeight}px) rotate(${Math.random() * 360}deg)`,
        opacity: 0,
      },
    ],
    {
      duration: 3000,
      easing: 'ease-out',
    }
  );

  animation.onfinish = () => particle.remove();
}

// Input handling
function setupInputHandlers() {
  // Keyboard controls
  document.addEventListener('keydown', (e) => {
    if (gameEngine.isMoving || !isPlaying) return;

    switch (e.key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
        e.preventDefault();
        gameEngine.movePlayer('up');
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        e.preventDefault();
        gameEngine.movePlayer('down');
        break;
      case 'ArrowLeft':
      case 'a':
      case 'A':
        e.preventDefault();
        gameEngine.movePlayer('left');
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        e.preventDefault();
        gameEngine.movePlayer('right');
        break;
      case '[':
        // Go to previous level
        e.preventDefault();
        gameEngine.goToLevel(gameEngine.currentLevelIndex - 1);
        break;
      case ']':
        // Go to next level
        e.preventDefault();
        gameEngine.goToLevel(gameEngine.currentLevelIndex + 1);
        break;
    }
  });

  // Mobile D-pad
  const dpadButtons = document.querySelectorAll('.dpad-btn');
  dpadButtons.forEach((button) => {
    button.addEventListener('touchstart', (e) => {
      e.preventDefault();
      if (!isPlaying) return;
      button.classList.add('pressed');
      const direction = button.dataset.direction;
      gameEngine.movePlayer(direction);
    });

    button.addEventListener('touchend', () => {
      button.classList.remove('pressed');
    });

    button.addEventListener('mousedown', (e) => {
      e.preventDefault();
      if (!isPlaying) return;
      button.classList.add('pressed');
      const direction = button.dataset.direction;
      gameEngine.movePlayer(direction);
    });

    button.addEventListener('mouseup', () => {
      button.classList.remove('pressed');
    });
  });

  // Reset button
  document.getElementById('reset-btn').addEventListener('click', () => {
    gameEngine.resetLevel();
  });

  // Level navigation buttons
  const prevLevelBtn = document.getElementById('prev-level-btn');
  const nextLevelBtn = document.getElementById('next-level-btn');

  if (prevLevelBtn) {
    prevLevelBtn.addEventListener('click', () => {
      gameEngine.goToLevel(gameEngine.currentLevelIndex - 1);
    });
  }

  if (nextLevelBtn) {
    nextLevelBtn.addEventListener('click', () => {
      gameEngine.goToLevel(gameEngine.currentLevelIndex + 1);
    });
  }

  const muteBtn = document.getElementById('mute-btn');
  if (muteBtn) {
    muteBtn.addEventListener('click', () => {
      toggleMute();
    });
  }

  const undoBtn = document.getElementById('undo-btn');
  if (undoBtn) {
    undoBtn.addEventListener('click', () => {
      gameEngine.undoMove();
    });
  }
}

// Level selector
function setupLevelSelector() {
  const levelSelector = document.getElementById('level-selector');
  if (!levelSelector) return;

  levelSelector.innerHTML = '';

  for (let i = 0; i < levels.length; i++) {
    const btn = document.createElement('button');
    btn.textContent = String(i + 1);
    btn.dataset.level = i;
    btn.type = 'button';
    btn.className = 'locked';

    btn.addEventListener('click', () => {
      if (!btn.disabled && gameEngine.goToLevel(i)) {
        isPlaying = true;
        showNotification(`Switched to Level ${i + 1}`, 'success');
      }
    });

    levelSelector.appendChild(btn);
  }

  updateLevelSelector();
}

function updateLevelSelector() {
  const levelSelector = document.getElementById('level-selector');
  if (!levelSelector || !gameEngine) return;

  const maxUnlocked = Math.max(...gameEngine.completedLevels, -1) + 1;

  Array.from(levelSelector.children).forEach((btn, idx) => {
    const target = idx;
    const isUnlocked = target <= maxUnlocked;

    btn.disabled = !isUnlocked;
    btn.classList.toggle('unlocked', isUnlocked);
    btn.classList.toggle('locked', !isUnlocked);
    btn.classList.toggle('current', target === gameEngine.currentLevelIndex);
  });
}

// Initialize UI
function initUI() {
  setupDifficultySelection();
  setupInputHandlers();
  setupLevelSelector();
}

function setupDifficultySelection() {
  const buttons = document.querySelectorAll('.difficulty-btn');
  if (buttons.length === 0) {
    console.warn('No difficulty buttons found');
    return;
  }

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      // Immediate visual update
      buttons.forEach((b) => b.classList.remove('selected'));
      btn.classList.add('selected');

      selectedDifficulty = btn.dataset.difficulty;
      gameEngine.setDifficulty(selectedDifficulty);

      // If already playing, immediately apply the difficulty changes
      if (isPlaying) {
        resetTimer();
      }

      const playBtn = document.getElementById('play-btn');
      if (playBtn) {
        playBtn.disabled = false;
      }

      showNotification(`Difficulty set to ${selectedDifficulty}`, 'success');
    });
  });

  // Set default easy visually and at least once
  selectedDifficulty = 'easy';
  const easyButton = document.querySelector('.difficulty-btn[data-difficulty="easy"]');
  if (easyButton) {
    buttons.forEach((b) => b.classList.remove('selected'));
    easyButton.classList.add('selected');
  }
  gameEngine.setDifficulty('easy');

  const playBtn = document.getElementById('play-btn');
  if (playBtn) {
    playBtn.addEventListener('click', () => {
      isPlaying = true;

      // Load and resume from saved progress
      const savedProgress = loadProgress();
      gameEngine.currentLevelIndex = Number.isInteger(savedProgress.currentLevel)
        ? savedProgress.currentLevel
        : 0;
      gameEngine.completedLevels = Array.isArray(savedProgress.completedLevels)
        ? savedProgress.completedLevels
        : [];
      gameEngine.initGame(levels[gameEngine.currentLevelIndex]);

      showNotification(
        `Resuming Level ${gameEngine.currentLevelIndex + 1}. Push buckets onto dry soil to water them.`,
        'info'
      );
      resetTimer();
    });
  } else {
    console.warn('Play button not found');
  }
}
