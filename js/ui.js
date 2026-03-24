// UI Management for charity: water Push the Box

// Global game engine instance
let gameEngine;

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
    if (gameEngine.isMoving) return;

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
    }
  });

  // Mobile D-pad
  const dpadButtons = document.querySelectorAll('.dpad-btn');
  dpadButtons.forEach((button) => {
    button.addEventListener('touchstart', (e) => {
      e.preventDefault();
      button.classList.add('pressed');
      const direction = button.dataset.direction;
      gameEngine.movePlayer(direction);
    });

    button.addEventListener('touchend', () => {
      button.classList.remove('pressed');
    });

    button.addEventListener('mousedown', (e) => {
      e.preventDefault();
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
}

// Initialize UI
function initUI() {
  setupInputHandlers();
}
