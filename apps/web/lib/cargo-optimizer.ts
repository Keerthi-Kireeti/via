/**
 * 3D Bin Packing Algorithm for optimal cargo arrangement
 * Uses a Guillotine algorithm with best-fit heuristics
 */

export interface Cargo {
  id: string;
  length: number; // cm
  width: number;  // cm
  height: number; // cm
  weightKg: number;
}

export interface BusLuggageBay {
  length: number; // cm (e.g., 200cm for typical bus luggage bay)
  width: number;  // cm (e.g., 150cm)
  height: number; // cm (e.g., 100cm)
  maxWeightKg: number;
}

export interface PlacedCargo extends Cargo {
  position: {
    x: number;
    y: number;
    z: number;
  };
}

export interface PackingResult {
  placed: PlacedCargo[];
  unplaced: Cargo[];
  volumeUtilization: number;
  weightUtilization: number;
  totalWeight: number;
}

interface Rectangle {
  x: number;
  y: number;
  z: number;
  width: number;
  height: number;
  depth: number;
}

/**
 * Main cargo optimization function
 * Arranges cargo using a 3D guillotine algorithm with best-fit heuristic
 */
export function optimizeCargoPlacement(
  cargo: Cargo[],
  bay: BusLuggageBay
): PackingResult {
  // Sort cargo by volume (largest first) for better packing
  const sortedCargo = [...cargo].sort(
    (a, b) =>
      b.length * b.width * b.height - (a.length * a.width * a.height)
  );

  const placed: PlacedCargo[] = [];
  const unplaced: Cargo[] = [];
  let totalWeight = 0;
  let maxWeight = bay.maxWeightKg;

  // Initialize free rectangles with the entire bay space
  const freeRectangles: Rectangle[] = [
    {
      x: 0,
      y: 0,
      z: 0,
      width: bay.width,
      height: bay.height,
      depth: bay.length,
    },
  ];

  for (const item of sortedCargo) {
    // Check if item exceeds weight limit
    if (totalWeight + item.weightKg > maxWeight) {
      unplaced.push(item);
      continue;
    }

    // Try all rotations of the item for best fit
    const rotations = generateRotations(item);
    let bestFit: {
      position: { x: number; y: number; z: number };
      rotation: Cargo;
      rectangleIndex: number;
      wastedSpace: number;
    } | null = null;

    for (let rectIdx = 0; rectIdx < freeRectangles.length; rectIdx++) {
      const rect = freeRectangles[rectIdx];

      for (const rotatedItem of rotations) {
        // Check if item fits in this rectangle
        if (
          rotatedItem.width <= rect.width &&
          rotatedItem.height <= rect.height &&
          rotatedItem.length <= rect.depth
        ) {
          const wastedSpace =
            rect.width * rect.height * rect.depth -
            (rotatedItem.width *
              rotatedItem.height *
              rotatedItem.length);

          // Keep track of best fit (least wasted space)
          if (!bestFit || wastedSpace < bestFit.wastedSpace) {
            bestFit = {
              position: { x: rect.x, y: rect.y, z: rect.z },
              rotation: rotatedItem,
              rectangleIndex: rectIdx,
              wastedSpace,
            };
          }
        }
      }
    }

    if (bestFit) {
      // Place the item
      const placedItem: PlacedCargo = {
        ...bestFit.rotation,
        id: item.id,
        weightKg: item.weightKg,
        position: bestFit.position,
      };

      placed.push(placedItem);
      totalWeight += item.weightKg;

      // Update free rectangles using guillotine algorithm
      const rect = freeRectangles[bestFit.rectangleIndex];
      freeRectangles.splice(bestFit.rectangleIndex, 1);

      // Create new free rectangles from the split
      const newRectangles = splitRectangle(
        rect,
        placedItem.position,
        placedItem
      );

      freeRectangles.push(...newRectangles);

      // Remove overlapping/contained rectangles
      freeRectangles.sort((a, b) => a.x + a.y + a.z - (b.x + b.y + b.z));
    } else {
      unplaced.push(item);
    }
  }

  const totalVolume = bay.length * bay.width * bay.height;
  const usedVolume = placed.reduce(
    (sum, p) => sum + p.length * p.width * p.height,
    0
  );

  return {
    placed,
    unplaced,
    volumeUtilization: usedVolume / totalVolume,
    weightUtilization: totalWeight / bay.maxWeightKg,
    totalWeight,
  };
}

/**
 * Generate all unique rotations of a cargo box
 */
function generateRotations(cargo: Cargo): Cargo[] {
  const rotations: Cargo[] = [];
  const dimensions = [cargo.length, cargo.width, cargo.height];

  // Generate unique permutations
  const permutations = [
    [dimensions[0], dimensions[1], dimensions[2]],
    [dimensions[0], dimensions[2], dimensions[1]],
    [dimensions[1], dimensions[0], dimensions[2]],
    [dimensions[1], dimensions[2], dimensions[0]],
    [dimensions[2], dimensions[0], dimensions[1]],
    [dimensions[2], dimensions[1], dimensions[0]],
  ];

  const seen = new Set<string>();

  for (const [length, width, height] of permutations) {
    const key = `${length},${width},${height}`;
    if (!seen.has(key)) {
      seen.add(key);
      rotations.push({
        ...cargo,
        length,
        width,
        height,
      });
    }
  }

  return rotations;
}

/**
 * Split a rectangle after placing an item using guillotine algorithm
 */
function splitRectangle(
  rect: Rectangle,
  itemPos: { x: number; y: number; z: number },
  item: PlacedCargo
): Rectangle[] {
  const newRects: Rectangle[] = [];

  // Right rectangle (remaining space to the right)
  if (itemPos.x + item.width < rect.x + rect.width) {
    newRects.push({
      x: itemPos.x + item.width,
      y: rect.y,
      z: rect.z,
      width: rect.x + rect.width - (itemPos.x + item.width),
      height: rect.height,
      depth: rect.depth,
    });
  }

  // Top rectangle (remaining space above)
  if (itemPos.y + item.height < rect.y + rect.height) {
    newRects.push({
      x: rect.x,
      y: itemPos.y + item.height,
      z: rect.z,
      width: rect.width,
      height: rect.y + rect.height - (itemPos.y + item.height),
      depth: rect.depth,
    });
  }

  // Back rectangle (remaining space at the back)
  if (itemPos.z + item.length < rect.z + rect.depth) {
    newRects.push({
      x: rect.x,
      y: rect.y,
      z: itemPos.z + item.length,
      width: rect.width,
      height: rect.height,
      depth: rect.z + rect.depth - (itemPos.z + item.length),
    });
  }

  return newRects;
}

/**
 * Generate optimization statistics for visualization
 */
export function generateOptimizationStats(result: PackingResult) {
  return {
    totalCargo: result.placed.length + result.unplaced.length,
    packedCargo: result.placed.length,
    unpackedCargo: result.unplaced.length,
    packingRate: ((result.placed.length / (result.placed.length + result.unplaced.length)) * 100).toFixed(1) + '%',
    volumeUtilization: (result.volumeUtilization * 100).toFixed(1) + '%',
    weightUtilization: (result.weightUtilization * 100).toFixed(1) + '%',
    totalWeight: result.totalWeight.toFixed(1) + ' kg',
  };
}
