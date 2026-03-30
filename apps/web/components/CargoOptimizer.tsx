'use client';

import { useState } from 'react';
import { Cargo3DVisualization } from './Cargo3D';
import {
  Cargo,
  BusLuggageBay,
  optimizeCargoPlacement,
  generateOptimizationStats,
} from '../lib/cargo-optimizer';
import { motion } from 'framer-motion';

interface CargoOptimizerProps {
  initialCargo?: Cargo[];
  bayDimensions?: BusLuggageBay;
}

const DEFAULT_BAY: BusLuggageBay = {
  length: 200, // cm
  width: 150, // cm
  height: 100, // cm
  maxWeightKg: 500,
};

export function CargoOptimizer({ initialCargo = [], bayDimensions = DEFAULT_BAY }: CargoOptimizerProps) {
  const [cargo, setCargo] = useState<Cargo[]>(initialCargo);
  const [autoRotate, setAutoRotate] = useState(false); // Default to false as per user request
  const [showStats, setShowStats] = useState(true);

  // Optimize cargo placement
  const result = optimizeCargoPlacement(cargo, bayDimensions);
  const stats = generateOptimizationStats(result);

  const handleAddCargo = () => {
    const newCargo: Cargo = {
      id: `C${(cargo.length + 1).toString().padStart(3, '0')}`, // Better IDs
      length: Math.floor(Math.random() * 40 + 20),
      width: Math.floor(Math.random() * 40 + 20),
      height: Math.floor(Math.random() * 30 + 15),
      weightKg: Math.floor(Math.random() * 30 + 5),
    };
    setCargo([...cargo, newCargo]);
  };

  const handleClearCargo = () => {
    setCargo([]);
  };

  const handleManualSort = (strategy: 'volume' | 'weight' | 'id') => {
    const sorted = [...cargo].sort((a, b) => {
      if (strategy === 'volume') return (b.length * b.width * b.height) - (a.length * a.width * a.height);
      if (strategy === 'weight') return b.weightKg - a.weightKg;
      return a.id.localeCompare(b.id);
    });
    setCargo(sorted);
  };

  return (
    <div className="w-full space-y-6">
      {/* Control Panel */}
      <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">3D Cargo Optimizer</h3>
            <p className="text-xs text-slate-400 mt-1">Current Strategy: <span className="text-cyan-400 font-medium">{result.strategyName}</span></p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setAutoRotate(!autoRotate)}
              className={`px-4 py-2 rounded-lg transition text-sm ${autoRotate ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-800 text-slate-400'}`}
            >
              {autoRotate ? '⏸' : '▶'} Auto-Rotate
            </button>
            <button
              onClick={() => setShowStats(!showStats)}
              className="px-4 py-2 rounded-lg bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 transition text-sm"
            >
              📊 Stats
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleAddCargo}
            className="flex-1 min-w-[200px] px-4 py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium hover:opacity-90 transition shadow-lg shadow-cyan-500/10"
          >
            + Add Random Cargo
          </button>
          <div className="flex bg-slate-800 rounded-lg p-1 border border-white/5">
            <button onClick={() => handleManualSort('volume')} className="px-3 py-1 text-xs text-slate-300 hover:text-white transition border-r border-white/5">Sort Volume</button>
            <button onClick={() => handleManualSort('weight')} className="px-3 py-1 text-xs text-slate-300 hover:text-white transition border-r border-white/5">Sort Weight</button>
            <button onClick={() => handleManualSort('id')} className="px-3 py-1 text-xs text-slate-300 hover:text-white transition">Reset</button>
          </div>
          <button
            onClick={handleClearCargo}
            className="px-4 py-3 rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500/30 transition font-medium"
          >
            Clear All
          </button>
        </div>

        {/* Cargo List */}
        <div className="max-h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {cargo.map((item) => (
              <div
                key={item.id}
                className="text-xs p-2 rounded bg-slate-800/50 border border-white/5 text-slate-300 flex flex-col justify-between"
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="font-mono text-cyan-400">{item.id}</span>
                  <span className="text-[10px] bg-slate-700 px-1 rounded">{item.weightKg.toFixed(0)}kg</span>
                </div>
                <p className="text-slate-400">
                  {item.length.toFixed(0)}×{item.width.toFixed(0)}×{item.height.toFixed(0)} cm
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3D Visualization */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-2xl border border-white/10 bg-slate-900/40 overflow-hidden group shadow-2xl"
        style={{ height: '500px' }}
      >
        <div className="absolute top-4 left-4 z-10 pointer-events-none">
          <div className="bg-slate-950/80 backdrop-blur-md border border-white/10 rounded-lg px-3 py-2 text-[10px] text-slate-300">
            <p className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Heavier items prioritized for bottom placement</p>
            <p className="flex items-center gap-2 mt-1"><span className="w-2 h-2 rounded-full bg-blue-500"></span> Multi-strategy optimizer active</p>
          </div>
        </div>
        {result.placed.length > 0 ? (
          <Cargo3DVisualization
            cargo={result.placed}
            bay={bayDimensions}
            packingResult={result}
            autoRotate={autoRotate}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-4">
            <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center animate-pulse">
              📦
            </div>
            <p>Add cargo to visualize optimization</p>
          </div>
        )}
      </motion.div>

      {/* Statistics Panel */}
      {showStats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          <StatCard label="Total Items" value={stats.totalCargo} />
          <StatCard label="Successfully Packed" value={stats.packedCargo} highlight />
          <StatCard label="Volume Utilization" value={stats.volumeUtilization} highlight />
          <StatCard label="Weight Utilization" value={stats.weightUtilization} />
        </motion.div>
      )}

      {/* Metrics Summary */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl border border-white/10 bg-gradient-to-r from-slate-900/60 to-slate-800/60 p-6 shadow-xl"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-slate-400 text-sm mb-1">Overall Efficiency</p>
            <p className="text-2xl font-bold text-cyan-400">
              {(parseFloat(stats.volumeUtilization) * 0.7 +
                parseFloat(stats.weightUtilization) * 0.3).toFixed(1)}
              %
            </p>
          </div>
          <div>
            <p className="text-slate-400 text-sm mb-1">Selected Strategy</p>
            <p className="text-sm font-bold text-blue-400 uppercase tracking-wider leading-tight">
              {result.strategyName}
            </p>
          </div>
          <div>
            <p className="text-slate-400 text-sm mb-1">Total Weight</p>
            <p className="text-2xl font-bold text-purple-400">
              {stats.totalWeight}
            </p>
          </div>
          <div>
            <p className="text-slate-400 text-sm mb-1">Packing Rate</p>
            <p className="text-2xl font-bold text-emerald-400">
              {((result.placed.length / (result.placed.length + result.unplaced.length || 1)) * 100).toFixed(0)}%
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function StatCard({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string | number;
  highlight?: boolean;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`rounded-xl border p-4 ${
        highlight
          ? 'border-cyan-500/30 bg-cyan-500/10'
          : 'border-white/10 bg-slate-800/30'
      }`}
    >
      <p className="text-sm text-slate-400 mb-1">{label}</p>
      <p
        className={`text-2xl font-bold ${
          highlight ? 'text-cyan-400' : 'text-white'
        }`}
      >
        {value}
      </p>
    </motion.div>
  );
}
