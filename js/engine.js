// Game engine core - pure data model + immutable updates

const TILE = {
  TREE: 0,
  GRASS: 1,
  BUCKET: 2,
  SOIL: 3,
  PLAYER: 4,
  WATERED: 5,
  FLOWER: 6,
  PUDDLE: 7,
};

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

    newBuckets = buckets.map((b, i) => (i === bucketIdx ? { x: pushX, y: pushY } : { ...b }));

    const remainingBuckets = [];
    newBuckets.forEach((bucket) => {
      if (newBg[bucket.y][bucket.x] === TILE.SOIL) {
        newBg[bucket.y][bucket.x] = TILE.WATERED;
        scoreChange += 50;
        events.push({ type: 'watered', x: bucket.x, y: bucket.y });
      } else {
        remainingBuckets.push(bucket);
      }
    });

    newBuckets = remainingBuckets;
  } else {
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
    this.currentLevelIndex = 0;
    this.score = 0;
    this.state = null;
    this.isMoving = false;
  }

  initGame(levelData) {
    this.state = parseLevel(levelData);
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

  movePlayer(direction) {
    if (this.isMoving) return;

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

    const nextMoves = (this.state.moves || 0) + 1;
    this.state = { ...result.newState, moves: nextMoves };
    this.score = Math.max(0, this.score + result.scoreChange);
    this.updateScore();
    this.updateMoves();

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

    this.score = Math.max(0, this.score + 100);
    this.updateScore();
    this.updateMoves();
    this.render();

    const finishedLevelNumber = this.currentLevelIndex + 1;
    showNotification(`Level ${finishedLevelNumber} complete!`, 'success');

    if (finishedLevelNumber === levels.length) {
      triggerConfetti();
      setTimeout(() => triggerConfetti(), 400);
    }

    setTimeout(() => {
      this.currentLevelIndex += 1;
      if (this.currentLevelIndex < levels.length) {
        this.initGame(levels[this.currentLevelIndex]);
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
    showNotification('Level Reset', 'info');
  }

  resetGame() {
    this.currentLevelIndex = 0;
    this.score = 0;
    this.initGame(levels[0]);
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
  }
}

window.TILE = TILE;
window.parseLevel = parseLevel;
window.processMove = processMove;
window.isWalkable = isWalkable;
window.GameEngine = GameEngine;
