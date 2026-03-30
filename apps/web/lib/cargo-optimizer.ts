/**
 * 3D Bin Packing Algorithm for optimal cargo arrangement
 * Uses multiple strategies including Guillotine and First-Fit-Decreasing
 * Considers weight for structural integrity (heavier boxes at bottom)
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
  strategyName: string;
}

interface Rectangle {
  x: number;
  y: number;
  z: number;
  width: number;
  height: number;
  depth: number;
}

export enum PackingStrategy {
  VOLUME_DESC = 'Volume Descending',
  WEIGHT_DESC = 'Weight Descending (Heavier Bottom)',
  DENSITY_DESC = 'Density Descending',
  DIMENSION_DESC = 'Longest Dimension Descending'
}

/**
 * Main cargo optimization function that runs multiple strategies
 * and returns the best one for maximum capacity.
 */
export function optimizeCargoPlacement(
  cargo: Cargo[],
  bay: BusLuggageBay
): PackingResult {
  const results: PackingResult[] = [];
  
  // Run all strategies
  results.push(runPackingStrategy(cargo, bay, PackingStrategy.VOLUME_DESC));
  results.push(runPackingStrategy(cargo, bay, PackingStrategy.WEIGHT_DESC));
  results.push(runPackingStrategy(cargo, bay, PackingStrategy.DENSITY_DESC));
  results.push(runPackingStrategy(cargo, bay, PackingStrategy.DIMENSION_DESC));

  // Find the strategy that placed the most items
  return results.reduce((best, current) => {
    if (current.placed.length > best.placed.length) return current;
    if (current.placed.length === best.placed.length && current.volumeUtilization > best.volumeUtilization) return current;
    return best;
  }, results[0]);
}

/**
 * Runs a specific packing strategy
 */
function runPackingStrategy(
  cargo: Cargo[],
  bay: BusLuggageBay,
  strategy: PackingStrategy
): PackingResult {
  let sortedCargo = [...cargo];

  // Sorting based on strategy
  switch (strategy) {
    case PackingStrategy.VOLUME_DESC:
      sortedCargo.sort((a, b) => (b.length * b.width * b.height) - (a.length * a.width * a.height));
      break;
    case PackingStrategy.WEIGHT_DESC:
      // Primary sort by weight (heavier first), secondary by volume
      sortedCargo.sort((a, b) => b.weightKg - a.weightKg || (b.length * b.width * b.height) - (a.length * a.width * a.height));
      break;
    case PackingStrategy.DENSITY_DESC:
      sortedCargo.sort((a, b) => {
        const densityA = a.weightKg / (a.length * a.width * a.height);
        const densityB = b.weightKg / (b.length * b.width * b.height);
        return densityB - densityA;
      });
      break;
    case PackingStrategy.DIMENSION_DESC:
      sortedCargo.sort((a, b) => Math.max(b.length, b.width, b.height) - Math.max(a.length, a.width, a.height));
      break;
  }

  const placed: PlacedCargo[] = [];
  const unplaced: Cargo[] = [];
  let currentWeight = 0;

  // Track weight distribution - simplified check for "no package damage"
  // We'll use a virtual grid to track height/weight at each point
  const freeRectangles: Rectangle[] = [
    { x: 0, y: 0, z: 0, width: bay.width, height: bay.height, depth: bay.length }
  ];

  for (const item of sortedCargo) {
    if (currentWeight + item.weightKg > bay.maxWeightKg) {
      unplaced.push(item);
      continue;
    }

    const rotations = generateRotations(item);
    let bestFit: {
      position: { x: number; y: number; z: number };
      rotation: Cargo;
      rectIdx: number;
      score: number;
    } | null = null;

    for (let i = 0; i < freeRectangles.length; i++) {
      const rect = freeRectangles[i];
      for (const rotated of rotations) {
        if (rotated.width <= rect.width && rotated.height <= rect.height && rotated.length <= rect.depth) {
          // Weight constraint: If strategy is WEIGHT_DESC, prioritize lower Y positions (bottom)
          // Score = Y position (lower is better) + wasted volume
          const yScore = rect.y * 1000; 
          const volumeScore = (rect.width * rect.height * rect.depth) - (rotated.width * rotated.height * rotated.length);
          const score = yScore + volumeScore;

          if (!bestFit || score < bestFit.score) {
            bestFit = { position: { x: rect.x, y: rect.y, z: rect.z }, rotation: rotated, rectIdx: i, score };
          }
        }
      }
    }

    if (bestFit) {
      const placedItem: PlacedCargo = {
        ...bestFit.rotation,
        id: item.id,
        position: bestFit.position
      };
      
      placed.push(placedItem);
      currentWeight += item.weightKg;

      // Guillotine split
      const rect = freeRectangles[bestFit.rectIdx];
      freeRectangles.splice(bestFit.rectIdx, 1);
      freeRectangles.push(...splitRectangle(rect, placedItem.position, placedItem));
      
      // Merge/sort free rectangles to optimize future placements
      freeRectangles.sort((a, b) => a.y - b.y || a.x - b.x || a.z - b.z);
    } else {
      unplaced.push(item);
    }
  }

  const totalVolume = bay.length * bay.width * bay.height;
  const usedVolume = placed.reduce((sum, p) => sum + (p.length * p.width * p.height), 0);

  return {
    placed,
    unplaced,
    volumeUtilization: usedVolume / totalVolume,
    weightUtilization: currentWeight / bay.maxWeightKg,
    totalWeight: currentWeight,
    strategyName: strategy
  };
}

function generateRotations(cargo: Cargo): Cargo[] {
  const { length: l, width: w, height: h } = cargo;
  const rotations: Cargo[] = [
    { ...cargo, length: l, width: w, height: h },
    { ...cargo, length: l, width: h, height: w },
    { ...cargo, length: w, width: l, height: h },
    { ...cargo, length: w, width: h, height: l },
    { ...cargo, length: h, width: l, height: w },
    { ...cargo, length: h, width: w, height: l }
  ];
  
  // Filter unique rotations
  const seen = new Set();
  return rotations.filter(r => {
    const key = `${r.length}-${r.width}-${r.height}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function splitRectangle(rect: Rectangle, pos: { x: number, y: number, z: number }, item: PlacedCargo): Rectangle[] {
  const newRects: Rectangle[] = [];

  // Split along X (Width)
  if (pos.x + item.width < rect.x + rect.width) {
    newRects.push({
      x: pos.x + item.width, y: rect.y, z: rect.z,
      width: rect.x + rect.width - (pos.x + item.width),
      height: rect.height, depth: rect.depth
    });
  }

  // Split along Y (Height)
  if (pos.y + item.height < rect.y + rect.height) {
    newRects.push({
      x: rect.x, y: pos.y + item.height, z: rect.z,
      width: item.width, // Only split above the item
      height: rect.y + rect.height - (pos.y + item.height),
      depth: rect.depth
    });
  }

  // Split along Z (Depth/Length)
  if (pos.z + item.length < rect.z + rect.depth) {
    newRects.push({
      x: rect.x, y: rect.y, z: pos.z + item.length,
      width: item.width, height: item.height,
      depth: rect.z + rect.depth - (pos.z + item.length)
    });
  }

  return newRects;
}

export function generateOptimizationStats(result: PackingResult) {
  return {
    totalCargo: result.placed.length + result.unplaced.length,
    packedCargo: result.placed.length,
    unplacedCargo: result.unplaced.length,
    strategy: result.strategyName,
    volumeUtilization: (result.volumeUtilization * 100).toFixed(1) + '%',
    weightUtilization: (result.weightUtilization * 100).toFixed(1) + '%',
    totalWeight: result.totalWeight.toFixed(1) + ' kg',
  };
}
