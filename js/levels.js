// Level definitions for charity: water Push the Box game

// Level 1: Introduction (Simple straight push)
const LEVEL_1 = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 1, 1, 1, 1, 1, 0, 0],
  [0, 0, 4, 1, 2, 1, 3, 0, 0],
  [0, 0, 1, 1, 1, 1, 1, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
];

// Level 2: Two targets, two buckets, slightly more complex
const LEVEL_2 = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 1, 1, 1, 1, 1, 1, 1, 0],
  [0, 1, 0, 0, 0, 0, 0, 1, 0],
  [0, 4, 1, 2, 3, 1, 2, 3, 0],
  [0, 1, 0, 0, 0, 0, 0, 1, 0],
  [0, 1, 1, 1, 1, 1, 1, 1, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
];

// Level 3: Vertical and horizontal pushing
const LEVEL_3 = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 1, 1, 1, 1, 1, 1, 1, 0],
  [0, 1, 1, 1, 1, 1, 1, 1, 0],
  [0, 1, 4, 1, 2, 2, 3, 3, 0],
  [0, 1, 1, 1, 1, 1, 1, 1, 0],
  [0, 1, 1, 1, 1, 1, 1, 1, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
];

// Level 4: Asymmetric walls, requiring navigation around obstacles
const LEVEL_4 = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 1, 1, 1, 1, 1, 0, 0],
  [0, 0, 1, 1, 1, 3, 1, 0, 0],
  [0, 0, 1, 4, 2, 3, 0, 0, 0],
  [0, 0, 1, 1, 1, 2, 1, 0, 0],
  [0, 0, 1, 1, 1, 1, 1, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
];

// Level 5: Open area, requires careful planning so buckets don't get stuck
const LEVEL_5 = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 1, 1, 1, 1, 3, 0, 0],
  [0, 0, 1, 2, 1, 0, 3, 0, 0],
  [0, 0, 1, 2, 1, 1, 1, 0, 0],
  [0, 0, 4, 2, 1, 0, 3, 0, 0],
  [0, 0, 1, 2, 1, 1, 3, 0, 0],
  [0, 0, 1, 1, 1, 1, 1, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
];

// Array of all levels
const levels = [LEVEL_1, LEVEL_2, LEVEL_3, LEVEL_4, LEVEL_5];

// Tile types:
// 0: Wall/Tree (impassable)
// 1: Grass (passable)
// 2: Bucket (movable entity)
// 3: Dry Soil (target for bucket)
// 4: Player (movable entity)
// 5: Watered Soil (bucket on target)
// 6: Flower Field (completed target)
// 7: Contaminated Puddle (penalty)
