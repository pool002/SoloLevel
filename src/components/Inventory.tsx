import React from 'react';
import { motion } from 'motion/react';
import { Shield, Sparkles, Key, Droplet, Sword, Scroll, Zap, Gift, Trash, Lock } from 'lucide-react';
import { InventoryItem } from '../types';

interface InventoryProps {
  inventory: InventoryItem[];
  playerLevel: number;
  onUseItem: (itemId: string) => void;
  onDeleteItem?: (itemId: string) => void;
}

export default function Inventory({ inventory, playerLevel, onUseItem, onDeleteItem }: InventoryProps) {
  // Helper to render Item icons
  const getItemIcon = (iconName: string) => {
    switch (iconName) {
      case 'key':
        return <Key className="h-5 w-5" />;
      case 'droplet':
        return <Droplet className="h-5 w-5 text-blue-400 animate-pulse" />;
      case 'sword':
        return <Sword className="h-5 w-5 text-red-400" />;
      case 'scroll':
        return <Scroll className="h-5 w-5 text-indigo-400" />;
      case 'zap':
        return <Zap className="h-5 w-5 text-green-400" />;
      case 'shield':
        return <Shield className="h-5 w-5 text-cyan-400" />;
      default:
        return <Gift className="h-5 w-5 text-amber-400" />;
    }
  };

  const getRarityBadge = (rarity: string) => {
    switch (rarity) {
      case 'Common':
        return 'bg-slate-900 border-slate-800 text-slate-400';
      case 'Rare':
        return 'bg-blue-950/10 border-blue-500/20 text-blue-400';
      case 'Epic':
        return 'bg-purple-950/10 border-purple-500/20 text-purple-400';
      default:
        return 'bg-amber-950/10 border-amber-500/20 text-amber-400 font-bold';
    }
  };

  return (
    <div
      id="inventory-container"
      className="border border-slate-800 relative overflow-hidden rounded bg-slate-950/40 p-6 backdrop-blur-sm min-h-[500px] flex flex-col"
    >
      <div className="scanline absolute inset-0 pointer-events-none" />

      {/* Header */}
      <div className="mb-6 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 border-l-2 border-cyan-500 pl-3">
            HUNTER INVENTORY ({inventory.length}/20)
          </h2>
        </div>
        <span className="font-mono text-[9px] text-amber-500 flex items-center gap-1 uppercase tracking-wider font-bold">
          <Sparkles className="h-3 w-3 text-amber-400" /> Items persistent
        </span>
      </div>

      {inventory.length === 0 ? (
        <div className="text-center text-slate-500 border border-dashed border-slate-800 rounded bg-slate-900/10 flex-grow flex flex-col justify-center items-center p-6">
          <Gift className="h-10 w-10 mb-3 text-slate-700 animate-pulse" />
          <p className="text-sm font-semibold text-slate-300">Your inventory is currently empty.</p>
          <p className="text-[10px] text-slate-500 mt-2 max-w-sm leading-relaxed font-light">
            Complete your weekly targets and open mystery chests to obtain legendary artifacts and active weaponry!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3 overflow-y-auto pr-1 flex-grow">
          {inventory.map((item) => {
            const isLocked = item.requiredLevel !== undefined && playerLevel < item.requiredLevel;
            return (
              <div
                key={item.id}
                className={`border p-3 rounded flex items-start gap-3 transition-all group ${
                  isLocked 
                    ? 'bg-slate-950/80 border-slate-900 opacity-60 saturate-50' 
                    : 'bg-slate-900/20 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                {/* Item Icon Holographic Screen */}
                <div className={`h-11 w-11 rounded border flex items-center justify-center flex-shrink-0 bg-slate-950 ${
                  isLocked 
                    ? 'border-slate-900 text-slate-600'
                    : item.rarity === 'Legendary' 
                      ? 'border-amber-500/20 text-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.15)]' 
                      : 'border-slate-800 text-slate-400'
                }`}>
                  {isLocked ? <Lock className="h-4 w-4 text-rose-500/70" /> : getItemIcon(item.iconName)}
                </div>

                <div className="flex-grow min-w-0">
                  <div className="flex flex-wrap items-center justify-between gap-1">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <h4 className={`text-xs font-bold truncate font-mono ${isLocked ? 'text-slate-500' : 'text-slate-200'}`}>
                        {item.name}
                      </h4>
                      {isLocked && (
                        <span className="text-[8px] font-mono font-bold text-rose-400 bg-rose-950/30 border border-rose-900/40 px-1 py-0.2 rounded uppercase flex items-center gap-0.5">
                          <Lock className="h-2 w-2" /> REQ Lvl {item.requiredLevel}
                        </span>
                      )}
                    </div>
                    <span className={`text-[8px] font-mono border px-1.5 py-0.5 rounded uppercase ${isLocked ? 'border-slate-900 text-slate-600 bg-slate-900/20' : getRarityBadge(item.rarity)}`}>
                      {item.rarity}
                    </span>
                  </div>

                  <p className={`text-[10px] mt-1 leading-relaxed ${isLocked ? 'text-slate-600' : 'text-slate-400'}`}>
                    {item.description}
                  </p>

                  <div className="mt-2.5 flex items-center justify-between gap-2">
                    <span className="font-mono text-[9px] text-slate-600 uppercase">
                      Acquired: {item.dateObtained}
                    </span>

                    <div className="flex gap-1.5">
                      {onDeleteItem && (
                        <button
                          onClick={() => onDeleteItem(item.id)}
                          className="text-slate-600 hover:text-red-400 p-1 rounded hover:bg-slate-900 transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
                          title="Discard item"
                        >
                          <Trash className="h-3 w-3" />
                        </button>
                      )}
                      
                      {isLocked ? (
                        <button
                          disabled
                          className="rounded bg-slate-950 border border-slate-900/60 text-slate-700 px-2.5 py-1 font-mono text-[9px] font-bold tracking-wide uppercase"
                        >
                          LOCKED (LVL {item.requiredLevel})
                        </button>
                      ) : (
                        <button
                          onClick={() => onUseItem(item.id)}
                          className="rounded bg-slate-900 border border-slate-700 hover:bg-cyan-500 hover:text-slate-950 text-cyan-400 hover:border-cyan-500 px-2.5 py-1 font-mono text-[9px] font-bold tracking-wide uppercase transition-all cursor-pointer"
                        >
                          ACTIVATE
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
