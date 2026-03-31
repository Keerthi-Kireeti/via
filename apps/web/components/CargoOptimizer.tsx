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
    <div className="w-full space-y-4 sm:space-y-6">
      {/* Control Panel */}
      <div className="rounded-xl sm:rounded-2xl border border-white/10 bg-slate-900/80 p-4 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-white">3D Cargo Optimizer</h3>
            <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5 sm:mt-1">Current Strategy: <span className="text-cyan-400 font-medium">{result.strategyName}</span></p>
          </div>
          <div className="flex w-full sm:w-auto gap-2">
            <button
              onClick={() => setAutoRotate(!autoRotate)}
              className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg transition text-xs sm:text-sm ${autoRotate ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-800 text-slate-400'}`}
            >
              {autoRotate ? '⏸' : '▶'} <span className="sm:inline">Rotate</span>
            </button>
            <button
              onClick={() => setShowStats(!showStats)}
              className="flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 transition text-xs sm:text-sm"
            >
              📊 <span className="sm:inline">Stats</span>
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleAddCargo}
            className="w-full sm:flex-1 px-4 py-2.5 sm:py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-sm sm:text-base font-medium hover:opacity-90 transition shadow-lg shadow-cyan-500/10"
          >
            + Add Random Cargo
          </button>
          <div className="flex bg-slate-800 rounded-lg p-1 border border-white/5 w-full sm:w-auto overflow-x-auto">
            <button onClick={() => handleManualSort('volume')} className="flex-1 sm:flex-none px-3 py-1 text-[10px] sm:text-xs text-slate-300 hover:text-white transition border-r border-white/5 whitespace-nowrap">Sort Vol</button>
            <button onClick={() => handleManualSort('weight')} className="flex-1 sm:flex-none px-3 py-1 text-[10px] sm:text-xs text-slate-300 hover:text-white transition border-r border-white/5 whitespace-nowrap">Sort Wt</button>
            <button onClick={() => handleManualSort('id')} className="flex-1 sm:flex-none px-3 py-1 text-[10px] sm:text-xs text-slate-300 hover:text-white transition whitespace-nowrap">Reset</button>
          </div>
          <button
            onClick={handleClearCargo}
            className="w-full sm:w-auto px-4 py-2.5 sm:py-3 rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500/30 transition text-sm sm:text-base font-medium"
          >
            Clear
          </button>
        </div>

        {/* Cargo List */}
        <div className="max-h-32 sm:max-h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {cargo.map((item) => (
              <div
                key={item.id}
                className="text-[10px] sm:text-xs p-2 rounded bg-slate-800/50 border border-white/5 text-slate-300 flex flex-col justify-between"
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="font-mono text-cyan-400">{item.id}</span>
                  <span className="text-[9px] sm:text-[10px] bg-slate-700 px-1 rounded">{item.weightKg.toFixed(0)}kg</span>
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
        className="relative rounded-xl sm:rounded-2xl border border-white/10 bg-slate-900/40 overflow-hidden group shadow-2xl"
        style={{ height: '350px', smHeight: '500px' } as any}
      >
        <div className="absolute top-2 left-2 sm:top-4 sm:left-4 z-10 pointer-events-none max-w-[80%] sm:max-w-none">
          <div className="bg-slate-950/80 backdrop-blur-md border border-white/10 rounded-lg px-2 py-1.5 sm:px-3 sm:py-2 text-[9px] sm:text-[10px] text-slate-300">
            <p className="flex items-center gap-1.5 sm:gap-2"><span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500"></span> Heavier items bottom</p>
            <p className="flex items-center gap-1.5 sm:gap-2 mt-1"><span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-blue-500"></span> Multi-strategy AI</p>
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
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-3 sm:gap-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-slate-800/50 flex items-center justify-center animate-pulse text-xl sm:text-2xl">
              📦
            </div>
            <p className="text-xs sm:text-sm">Add cargo to visualize</p>
          </div>
        )}
      </motion.div>

      {/* Statistics Panel */}
      {showStats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4"
        >
          <StatCard label="Total Items" value={stats.totalCargo.toString()} />
          <StatCard label="Packed" value={stats.packedCargo.toString()} hint="Successful" />
          <StatCard label="Volume" value={stats.volumeUtilization} hint="Utilization" />
          <StatCard label="Weight" value={stats.weightUtilization} hint="Utilization" />
        </motion.div>
      )}

      {/* Metrics Summary */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="rounded-xl sm:rounded-2xl border border-white/10 bg-gradient-to-r from-slate-900/60 to-slate-800/60 p-4 sm:p-6 shadow-xl"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-4 text-center">
          <div>
            <p className="text-slate-400 text-[10px] sm:text-sm mb-0.5 sm:mb-1">Efficiency</p>
            <p className="text-lg sm:text-2xl font-bold text-cyan-400">
              {(parseFloat(stats.volumeUtilization) * 0.7 +
                parseFloat(stats.weightUtilization) * 0.3).toFixed(1)}
              %
            </p>
          </div>
          <div className="hidden sm:block">
            <p className="text-slate-400 text-sm mb-1">Strategy</p>
            <p className="text-sm font-bold text-blue-400 uppercase tracking-wider leading-tight">
              {result.strategyName}
            </p>
          </div>
          <div>
            <p className="text-slate-400 text-[10px] sm:text-sm mb-0.5 sm:mb-1">Total Weight</p>
            <p className="text-lg sm:text-2xl font-bold text-purple-400">
              {stats.totalWeight}
            </p>
          </div>
          <div>
            <p className="text-slate-400 text-[10px] sm:text-sm mb-0.5 sm:mb-1">Rate</p>
            <p className="text-lg sm:text-2xl font-bold text-emerald-400">
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
