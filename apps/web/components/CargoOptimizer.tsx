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
  const [autoRotate, setAutoRotate] = useState(true);
  const [showStats, setShowStats] = useState(true);

  // Optimize cargo placement
  const result = optimizeCargoPlacement(cargo, bayDimensions);
  const stats = generateOptimizationStats(result);

  const handleAddCargo = () => {
    const newCargo: Cargo = {
      id: `cargo-${Date.now()}`,
      length: Math.random() * 40 + 20,
      width: Math.random() * 40 + 20,
      height: Math.random() * 30 + 15,
      weightKg: Math.random() * 30 + 5,
    };
    setCargo([...cargo, newCargo]);
  };

  const handleClearCargo = () => {
    setCargo([]);
  };

  return (
    <div className="w-full space-y-6">
      {/* Control Panel */}
      <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">3D Cargo Optimizer</h3>
          <div className="flex gap-2">
            <button
              onClick={() => setAutoRotate(!autoRotate)}
              className="px-4 py-2 rounded-lg bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 transition text-sm"
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

        <div className="flex gap-3">
          <button
            onClick={handleAddCargo}
            className="flex-1 px-4 py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium hover:opacity-90 transition"
          >
            + Add Random Cargo
          </button>
          <button
            onClick={handleClearCargo}
            className="px-4 py-3 rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500/30 transition font-medium"
          >
            Clear All
          </button>
        </div>

        {/* Cargo List */}
        <div className="max-h-40 overflow-y-auto">
          <div className="grid grid-cols-2 gap-2">
            {cargo.map((item) => (
              <div
                key={item.id}
                className="text-xs p-2 rounded bg-slate-800/50 border border-white/5 text-slate-300"
              >
                <p className="font-mono">{item.id}</p>
                <p className="text-slate-400">
                  {item.length.toFixed(0)}×{item.width.toFixed(0)}×{item.height.toFixed(0)} cm
                </p>
                <p className="text-slate-400">{item.weightKg.toFixed(1)} kg</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3D Visualization */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-white/10 bg-slate-900/40 overflow-hidden"
        style={{ height: '500px' }}
      >
        {result.placed.length > 0 ? (
          <Cargo3DVisualization
            cargo={result.placed}
            bay={bayDimensions}
            packingResult={result}
            autoRotate={autoRotate}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400">
            <p>Add cargo to visualize optimization</p>
          </div>
        )}
      </motion.div>

      {/* Statistics Panel */}
      {showStats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 md:grid-cols-3 gap-4"
        >
          <StatCard label="Total Cargo" value={stats.totalCargo} />
          <StatCard label="Packed" value={stats.packedCargo} />
          <StatCard label="Unpacked" value={stats.unpackedCargo} />
          <StatCard label="Packing Rate" value={stats.packingRate} highlight />
          <StatCard
            label="Volume Used"
            value={stats.volumeUtilization}
            highlight
          />
          <StatCard
            label="Weight Used"
            value={stats.weightUtilization}
            highlight
          />
          <StatCard label="Total Weight" value={stats.totalWeight} />
        </motion.div>
      )}

      {/* Metrics Summary */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl border border-white/10 bg-gradient-to-r from-slate-900/60 to-slate-800/60 p-6"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-slate-400 text-sm">Efficiency</p>
            <p className="text-2xl font-bold text-cyan-400">
              {(parseFloat(stats.volumeUtilization) * 0.7 +
                parseFloat(stats.weightUtilization) * 0.3).toFixed(1)}
              %
            </p>
          </div>
          <div>
            <p className="text-slate-400 text-sm">Volume Used</p>
            <p className="text-2xl font-bold text-blue-400">
              {stats.volumeUtilization}
            </p>
          </div>
          <div>
            <p className="text-slate-400 text-sm">Weight Capacity</p>
            <p className="text-2xl font-bold text-purple-400">
              {stats.weightUtilization}
            </p>
          </div>
          <div>
            <p className="text-slate-400 text-sm">Cargo Fit</p>
            <p className="text-2xl font-bold text-emerald-400">
              {stats.packingRate}
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
