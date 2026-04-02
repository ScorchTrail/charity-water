// Game engine core - pure data model + immutable updates

const TILE = {
  TREE: 0,
  GRASS: 1,
  BUCKET: 2,
  SOIL: 3,
  PLAYER: 4,
  WATERED: 5,
  PUDDLE: 6,
  FLOWER: 7,
};
// Difficulty and timer globals
let difficulty = 'normal';
let timerInterval;
let timeRemaining = 120;
let difficultyBonus = 0;

function setDifficulty(diff) {
  difficulty = diff;
  if (diff === 'easy') {
    timeRemaining = Infinity;
    difficultyBonus = 0;
  } else if (diff === 'normal') {
    timeRemaining = 120;
    difficultyBonus = 50;
  } else if (diff === 'hard') {
    timeRemaining = 30;
    difficultyBonus = 100;
  }
}

function startTimer() {
  if (timeRemaining === Infinity) {
    document.getElementById('timer').textContent = '--:--';
    return;
  }
  updateTimerDisplay();
  timerInterval = setInterval(() => {
    timeRemaining--;
    updateTimerDisplay();
    if (timeRemaining <= 0) {
      clearInterval(timerInterval);
      showModal("Time's Up!", 'You ran out of time. Try again!', 'Restart', () => {
        gameEngine.resetGame();
      });
    }
  }, 1000);
}

function updateTimerDisplay() {
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  document.getElementById('timer').textContent =
    `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function resetTimer() {
  clearInterval(timerInterval);
  setDifficulty(difficulty);
  startTimer();
}

function getMaxScoreForLevel(levelData) {
  const { soils } = parseLevel(levelData);
  return soils.length * 50 + 100;
}

let isMuted = false;

function saveMuteState(muted) {
  localStorage.setItem('charityWaterMuted', JSON.stringify(Boolean(muted)));
}

function loadMuteState() {
  const saved = localStorage.getItem('charityWaterMuted');
  if (saved === null) return false;
  try {
    return JSON.parse(saved);
  } catch (e) {
    return false;
  }
}

function updateMuteButton() {
  const button = document.getElementById('mute-btn');
  if (!button) return;
  button.textContent = isMuted ? '🔇' : '🔊';
  button.classList.toggle('app-btn--muted', isMuted);
  button.setAttribute('aria-label', isMuted ? 'Unmute' : 'Mute');
}

function setMuted(muted) {
  isMuted = Boolean(muted);
  const allAudio = document.querySelectorAll('audio');
  allAudio.forEach((audio) => {
    audio.muted = isMuted;
  });
  saveMuteState(isMuted);
  updateMuteButton();
}

function toggleMute() {
  setMuted(!isMuted);
  showNotification(isMuted ? 'Sound muted' : 'Sound unmuted', 'info');
}

function playBucketAudio() {
  // Deprecated: bucket sound no longer separate; use move audio for all movements
  if (isMuted) return;
  const audio = document.getElementById('move-audio');
  if (!audio) return;

  audio.currentTime = 0;
  audio.play().catch(() => {
    // Autoplay restrictions may block until user interacts.
  });
}

function playMoveAudio() {
  if (isMuted) return;
  const audio = document.getElementById('move-audio');
  if (!audio) return;

  // ensure move clip is loud enough and full volume by default
  audio.volume = 1.0; // 0.0 to 1.0 (max)
  audio.currentTime = 0;
  audio.play().catch(() => {
    // Autoplay restrictions may block until user interacts.
  });
}

function playCheerAudio() {
  if (isMuted) return;
  const audio = document.getElementById('cheer-audio');
  if (!audio) return;

  audio.currentTime = 0;
  audio.play().catch(() => {
    // Autoplay restrictions may block until user interacts.
  });

  // Stop after 2 seconds so only a short cheer plays
  setTimeout(() => {
    audio.pause();
    audio.currentTime = 0;
  }, 2000);
}

// Progress saving functions
function saveProgress(currentLevelIndex, completedLevels) {
  const progress = {
    currentLevel: currentLevelIndex,
    completedLevels: completedLevels,
  };
  localStorage.setItem('charityWaterProgress', JSON.stringify(progress));
}

function loadProgress() {
  const saved = localStorage.getItem('charityWaterProgress');
  if (saved) {
    return JSON.parse(saved);
  }
  return { currentLevel: 0, completedLevels: [] };
}

function clearProgress() {
  localStorage.removeItem('charityWaterProgress');
}

function arraysEqual(a, b) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i].x !== b[i].x || a[i].y !== b[i].y) return false;
  }
  return true;
}
function cloneGrid(grid) {
  return grid.map((row) => [...row]);
}

function parseLevel(levelData) {
  const background = cloneGrid(levelData);
  let player = null;
  const buckets = [];
  const soils = [];

  for (let y = 0; y < 9; y++) {
    for (let x = 0; x < 9; x++) {
      const val = background[y][x];
      if (val === TILE.PLAYER) {
        player = { x, y };
        background[y][x] = TILE.GRASS;
      } else if (val === TILE.BUCKET) {
        buckets.push({ x, y });
        background[y][x] = TILE.GRASS;
      } else if (val === TILE.SOIL) {
        soils.push({ x, y });
      }
    }
  }

  return { background, player, buckets, soils, moves: 0 };
}

function isWalkable(bg, x, y) {
  if (x < 0 || x > 8 || y < 0 || y > 8) return false;
  const tile = bg[y][x];
  return (
    tile === TILE.GRASS ||
    tile === TILE.SOIL ||
    tile === TILE.WATERED ||
    tile === TILE.FLOWER ||
    tile === TILE.PUDDLE
  );
}

function processMove(state, dx, dy) {
  const { background, player, buckets, soils } = state;
  const newX = player.x + dx;
  const newY = player.y + dy;

  if (newX < 0 || newX > 8 || newY < 0 || newY > 8) return null;

  const bucketIdx = buckets.findIndex((b) => b.x === newX && b.y === newY);
  const newBg = cloneGrid(background);
  let newBuckets = buckets.map((b) => ({ ...b }));
  let scoreChange = 0;
  const events = [];

  if (bucketIdx !== -1) {
    const pushX = newX + dx;
    const pushY = newY + dy;

    if (!isWalkable(background, pushX, pushY)) return null;

    const blockedByBucket = buckets.some((b) => b.x === pushX && b.y === pushY);
    if (blockedByBucket) return null;

    // Before moving bucket, if its current position is watered, turn to soil
    if (newBg[newY][newX] === TILE.WATERED) {
      newBg[newY][newX] = TILE.SOIL;
    }

    // Move bucket
    newBuckets = buckets.map((b, i) => (i === bucketIdx ? { x: pushX, y: pushY } : { ...b }));

    // After moving, if new position is soil, turn to watered
    if (newBg[pushY][pushX] === TILE.SOIL) {
      newBg[pushY][pushX] = TILE.WATERED;
      scoreChange += 50;
      events.push({ type: 'watered', x: pushX, y: pushY });
    }
  } else {
    // Player move, if leaving a watered tile, turn to soil
    if (newBg[player.y][player.x] === TILE.WATERED) {
      newBg[player.y][player.x] = TILE.SOIL;
    }

    if (!isWalkable(background, newX, newY)) return null;
  }

  if (newBg[newY][newX] === TILE.PUDDLE) {
    scoreChange -= 10;
    events.push({ type: 'puddle', x: newX, y: newY });
  }

  const allWatered = soils.every((soil) => {
    const tile = newBg[soil.y][soil.x];
    return tile === TILE.WATERED || tile === TILE.FLOWER;
  });

  const newState = {
    background: newBg,
    player: { x: newX, y: newY },
    buckets: newBuckets,
    soils: soils.map((s) => ({ ...s })),
  };

  return {
    newState,
    scoreChange,
    puddlePenalty: scoreChange < 0,
    events,
    won: allWatered,
  };
}

class GameEngine {
  constructor() {
    // Load progress from localStorage
    const progress = loadProgress();
    this.currentLevelIndex = progress.currentLevel;
    this.completedLevels = progress.completedLevels || [];
    this.score = 0;
    this.levelScore = 0;
    this.state = null;
    this.isMoving = false;
    this.milestone25 = false;
    this.milestone50 = false;
    this.milestone75 = false;
    this.history = [];
    this.undoStreak = 0;
    this.hasEncouragedMoveCount = false;

    // Restore mute state and button
    setMuted(loadMuteState());
  }

  setDifficulty(diff) {
    setDifficulty(diff);
  }

  // Navigate to a specific level (respects lock system)
  goToLevel(levelIndex) {
    if (levelIndex < 0 || levelIndex >= levels.length) {
      showNotification('Invalid level', 'error');
      return false;
    }
    // Can only go to levels already completed, or the next unlocked level
    if (levelIndex <= Math.max(...this.completedLevels, -1) + 1) {
      this.currentLevelIndex = levelIndex;
      this.levelScore = 0;
      this.milestone25 = false;
      this.milestone50 = false;
      this.milestone75 = false;
      this.initGame(levels[levelIndex]);
      resetTimer();
      if (typeof updateLevelSelector === 'function') updateLevelSelector();
      return true;
    } else {
      showNotification(
        `Level ${levelIndex + 1} is locked. Complete level ${Math.max(...this.completedLevels, -1) + 2} first.`,
        'error'
      );
      return false;
    }
  }

  initGame(levelData) {
    this.state = parseLevel(levelData);
    this.levelScore = 0;
    this.milestone25 = false;
    this.milestone50 = false;
    this.milestone75 = false;
    this.history = [];
    this.updateUndoButton();
    this.render();
    this.updateScore();
    this.updateMoves();
    this.updateProgress();
  }

  updateProgress() {
    const currentCircle = document.getElementById('progress-current');
    const nextCircle = document.getElementById('progress-next');
    const finishText = document.getElementById('progress-finish');
    if (!currentCircle || !nextCircle || !finishText) return;

    const levelNumber = this.currentLevelIndex + 1;
    const totalLevels = levels.length;
    const nextLevel = levelNumber < totalLevels ? levelNumber + 1 : '🏁';

    currentCircle.querySelector('.level-progress__label').textContent = levelNumber;

    currentCircle.classList.add('level-progress__circle--current');

    if (nextLevel === '🏁') {
      nextCircle.querySelector('.level-progress__label').textContent = '🏁';
      nextCircle.classList.remove('level-progress__circle--next');
      nextCircle.classList.add('level-progress__circle--finish');
      finishText.style.display = 'block';
      finishText.textContent = 'Finish line!';
    } else {
      nextCircle.querySelector('.level-progress__label').textContent = nextLevel;
      nextCircle.classList.remove('level-progress__circle--finish');
      nextCircle.classList.add('level-progress__circle--next');
      finishText.style.display = 'none';
    }

    // Optional: change dash color on final stretch
    const dash = document.querySelector('.level-progress__dash');
    if (dash)
      dash.style.background =
        levelNumber === totalLevels
          ? 'var(--primary)'
          : 'linear-gradient(90deg, var(--primary), var(--muted))';
  }

  pushHistory() {
    if (!this.state) return;
    const snapshot = {
      background: cloneGrid(this.state.background),
      player: { ...this.state.player },
      buckets: this.state.buckets.map((b) => ({ ...b })),
      soils: this.state.soils.map((s) => ({ ...s })),
      moves: this.state.moves || 0,
      score: this.score,
      levelScore: this.levelScore,
    };
    this.history.push(snapshot);
    this.updateUndoButton();
  }

  undoMove() {
    if (!this.history.length) {
      showNotification('No move to undo', 'info');
      return;
    }

    const snapshot = this.history.pop();
    this.state.background = cloneGrid(snapshot.background);
    this.state.player = { ...snapshot.player };
    this.state.buckets = snapshot.buckets.map((b) => ({ ...b }));
    this.state.soils = snapshot.soils.map((s) => ({ ...s }));
    this.state.moves = snapshot.moves;
    this.score = snapshot.score;
    this.levelScore = snapshot.levelScore;

    this.undoStreak += 1;
    if (this.undoStreak > 5) {
      showNotification(
        'It is solvable — you’re almost there. Maybe try looking at it upside down.',
        'info'
      );
      this.undoStreak = 0;
    }

    this.render();
    this.updateScore();
    this.updateMoves();
    this.updateUndoButton();

    showNotification('Move undone', 'success');
  }

  updateUndoButton() {
    const button = document.getElementById('undo-btn');
    if (!button) return;
    button.disabled = this.history.length === 0;
  }

  movePlayer(direction) {
    if (this.isMoving || !isPlaying) return;

    const map = {
      up: { dx: 0, dy: -1 },
      down: { dx: 0, dy: 1 },
      left: { dx: -1, dy: 0 },
      right: { dx: 1, dy: 0 },
    };
    const move = map[direction];
    if (!move) return;

    const result = processMove(this.state, move.dx, move.dy);
    if (!result) return;

    // Save current state before applying move
    this.pushHistory();

    const nextMoves = (this.state.moves || 0) + 1;
    this.state = { ...result.newState, moves: nextMoves };
    this.score = this.score + result.scoreChange;
    this.levelScore += result.scoreChange;

    // Reset undo streak when player makes a new move
    this.undoStreak = 0;

    // Encourage after long playthrough
    if (nextMoves > 50 && !this.hasEncouragedMoveCount) {
      this.hasEncouragedMoveCount = true;
      showNotification(
        'Hang in there! It is solvable — you’re almost there. Maybe try looking at it upside down.',
        'info'
      );
    }

    // Play footstep audio for all valid moves (no separate bucket sound)
    playMoveAudio();
    this.updateScore();
    this.updateMoves();

    // Check milestones
    const maxScore = getMaxScoreForLevel(levels[this.currentLevelIndex]);
    const progress = this.levelScore / maxScore;
    if (progress >= 0.25 && !this.milestone25) {
      this.milestone25 = true;
      showNotification('25% complete! Keep going!', 'success');
    }
    if (progress >= 0.5 && !this.milestone50) {
      this.milestone50 = true;
      showNotification('50% complete! Halfway there!', 'success');
    }
    if (progress >= 0.75 && !this.milestone75) {
      this.milestone75 = true;
      showNotification('75% complete! Almost done!', 'success');
    }

    if (result.puddlePenalty) {
      showNotification('☠️ −10 points · Contaminated puddle', 'error');
    }

    result.events.forEach((event) => {
      if (event.type === 'watered') {
        showNotification('💧 +50 points · Soil watered', 'success');
      }
    });

    this.isMoving = true;
    this.render();

    if (result.won) {
      this.completeLevel();
    }

    setTimeout(() => {
      this.isMoving = false;
    }, 150);
  }

  completeLevel() {
    for (let y = 0; y < 9; y++) {
      for (let x = 0; x < 9; x++) {
        if (this.state.background[y][x] === TILE.WATERED) {
          this.state.background[y][x] = TILE.FLOWER;
        }
      }
    }

    // Clear buckets array so they don't render on top of flowers
    this.state.buckets = [];

    this.score = Math.max(0, this.score + 100 + difficultyBonus);
    this.updateScore();
    this.updateMoves();
    this.render();
    if (typeof updateLevelSelector === 'function') updateLevelSelector();

    const finishedLevelNumber = this.currentLevelIndex + 1;

    // Mark level as completed and save progress
    if (!this.completedLevels.includes(this.currentLevelIndex)) {
      this.completedLevels.push(this.currentLevelIndex);
    }
    saveProgress(this.currentLevelIndex, this.completedLevels);

    showNotification(`Level ${finishedLevelNumber} complete!`, 'success');

    // Play a short cheer sound when completing the level
    playCheerAudio();

    // Celebratory confetti for every level complete
    triggerConfetti();
    setTimeout(() => triggerConfetti(), 400);

    // Do not allow undo after level-complete state is shown
    this.history = [];
    this.updateUndoButton();

    setTimeout(() => {
      this.currentLevelIndex += 1;
      if (this.currentLevelIndex < levels.length) {
        saveProgress(this.currentLevelIndex, this.completedLevels);
        this.initGame(levels[this.currentLevelIndex]);
        resetTimer();
      } else {
        this.gameComplete();
      }
    }, 1200);
  }

  gameComplete() {
    showModal('Game Complete!', `Final Score: ${this.score}`, 'Play Again', () => {
      this.resetGame();
    });
  }

  resetLevel() {
    this.initGame(levels[this.currentLevelIndex]);
    resetTimer();
    showNotification('Level Reset', 'info');
  }

  resetGame() {
    // Reset to saved progress rather than always level 0
    const progress = loadProgress();
    this.currentLevelIndex = progress.currentLevel;
    this.completedLevels = progress.completedLevels || [];
    this.score = 0;
    this.initGame(levels[this.currentLevelIndex]);
    resetTimer();
    if (typeof updateLevelSelector === 'function') updateLevelSelector();
    saveProgress(this.currentLevelIndex, this.completedLevels);
  }

  updateScore() {
    const scoreNode = document.getElementById('score');
    if (scoreNode) {
      scoreNode.textContent = this.score;
    }
  }

  updateMoves() {
    const movesNode = document.getElementById('moves');
    if (movesNode && this.state) {
      movesNode.textContent = this.state.moves || 0;
    }
  }

  render() {
    const gameBoard = document.getElementById('game-board');
    if (!gameBoard || !this.state) return;

    gameBoard.innerHTML = '';

    for (let y = 0; y < 9; y++) {
      for (let x = 0; x < 9; x++) {
        const tile = document.createElement('div');
        tile.className = `tile tile-${this.state.background[y][x]}`;
        tile.dataset.x = x;
        tile.dataset.y = y;
        gameBoard.appendChild(tile);
      }
    }

    const playerCell = gameBoard.children[this.state.player.y * 9 + this.state.player.x];
    if (playerCell) {
      const playerEntity = document.createElement('div');
      playerEntity.className = 'entity player';
      playerEntity.innerHTML = '<img src="./assets/svgs/player.svg" alt="Player" />';
      playerCell.appendChild(playerEntity);
    }

    this.state.buckets.forEach((bucket) => {
      const bucketCell = gameBoard.children[bucket.y * 9 + bucket.x];
      if (bucketCell) {
        const bucketEntity = document.createElement('img');
        bucketEntity.className = 'entity bucket';
        bucketEntity.src = './assets/svgs/bucket.svg';
        bucketEntity.alt = 'Water bucket';
        bucketCell.appendChild(bucketEntity);
      }
    });

    this.updateUndoButton();

    // For completed flower tiles, show a flower icon overlay
    for (let y = 0; y < 9; y++) {
      for (let x = 0; x < 9; x++) {
        if (this.state.background[y][x] === TILE.FLOWER) {
          const flowerCell = gameBoard.children[y * 9 + x];
          if (flowerCell) {
            const flowerEntity = document.createElement('img');
            flowerEntity.className = 'entity flower';
            flowerEntity.src = './assets/svgs/Flower.svg';
            flowerEntity.alt = 'Flower';
            flowerCell.appendChild(flowerEntity);
          }
        }
      }
    }
  }
}

window.TILE = TILE;
window.parseLevel = parseLevel;
window.processMove = processMove;
window.isWalkable = isWalkable;
window.GameEngine = GameEngine;
