import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Gift, Sparkles, AlertCircle, Award } from 'lucide-react';
import { InventoryItem } from '../types';

interface LootBoxModalProps {
  isOpen: boolean;
  onClose: (item: InventoryItem) => void;
}

const POSSIBLE_REWARDS: Omit<InventoryItem, 'id' | 'dateObtained'>[] = [
  {
    name: "Demon King's Shortsword",
    rarity: 'Legendary',
    description: 'A sharp, pitch-black blade that glows with purple mana. Use to gain a temporary +5 Intelligence boost!',
    iconName: 'sword'
  },
  {
    name: "Kamish's Wrath Dagger",
    rarity: 'Legendary',
    description: "Forged from the dragon Kamish's fang. Activate to instantly clear your real-life workout fatigue!",
    iconName: 'sword'
  },
  {
    name: 'Shadow Monarch Crown',
    rarity: 'Legendary',
    description: 'Imbued with absolute control. Activate to redeem 2 hours of guilt-free, pure gaming bliss!',
    iconName: 'scroll'
  },
  {
    name: "Ruler's Authority Scroll",
    rarity: 'Epic',
    description: 'Allows you to manipulate objects mentally. Use to claim a customized "Cheat Day" meal of your choice!',
    iconName: 'scroll'
  },
  {
    name: 'Elixir of Rejuvenation',
    rarity: 'Epic',
    description: 'Restores 100% of physical energy. (Triggers a reminder to stretch, drink water, and sleep early).',
    iconName: 'droplet'
  },
  {
    name: 'E-Rank Guild Recruit Badge',
    rarity: 'Common',
    description: 'Allows you to recruit a friend for a joint workout or study session. (Double XP tomorrow!).',
    iconName: 'key'
  }
];

export default function LootBoxModal({ isOpen, onClose }: LootBoxModalProps) {
  const [isOpening, setIsOpening] = useState(false);
  const [revealedItem, setRevealedItem] = useState<InventoryItem | null>(null);

  useEffect(() => {
    if (isOpen) {
      setIsOpening(false);
      setRevealedItem(null);
    }
  }, [isOpen]);

  const handleOpenChest = () => {
    setIsOpening(true);

    // Audio chime if allowed
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Synth swell
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 1.8);
      gain.gain.setValueAtTime(0.01, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 1.5);
      osc.start();
      osc.stop(ctx.currentTime + 1.8);
    } catch (e) {
      // ignore
    }

    // Wait 2 seconds for dramatic opening shake/pulse
    setTimeout(() => {
      // Pick a random reward
      const roll = Math.random();
      let picked: Omit<InventoryItem, 'id' | 'dateObtained'>;
      
      if (roll < 0.2) {
        // 20% Legendary
        const legendaries = POSSIBLE_REWARDS.filter(r => r.rarity === 'Legendary');
        picked = legendaries[Math.floor(Math.random() * legendaries.length)];
      } else if (roll < 0.6) {
        // 40% Epic
        const epics = POSSIBLE_REWARDS.filter(r => r.rarity === 'Epic');
        picked = epics[Math.floor(Math.random() * epics.length)];
      } else {
        // 40% Common / Rare
        const normals = POSSIBLE_REWARDS.filter(r => r.rarity === 'Common' || r.rarity === 'Rare');
        const list = normals.length > 0 ? normals : POSSIBLE_REWARDS;
        picked = list[Math.floor(Math.random() * list.length)];
      }

      const todayStr = new Date().toISOString().split('T')[0];
      const newItem: InventoryItem = {
        ...picked,
        id: `reward_${Date.now()}`,
        dateObtained: todayStr
      };

      setRevealedItem(newItem);
      setIsOpening(false);

      // Level-up / Legendary chime
      try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2); // G5
        osc.frequency.setValueAtTime(1046.50, ctx.currentTime + 0.3); // C6
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.9);
        osc.start();
        osc.stop(ctx.currentTime + 0.9);
      } catch (e) {
        // ignore
      }

    }, 2200);
  };

  const handleClaimReward = () => {
    if (revealedItem) {
      onClose(revealedItem);
    }
  };

  const getRarityGlow = (rarity: string) => {
    switch (rarity) {
      case 'Legendary': return 'border-amber-500/20 text-yellow-500';
      case 'Epic': return 'border-purple-500/20 text-purple-400';
      default: return 'border-slate-800 text-slate-400';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          id="loot-box-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 backdrop-blur-md"
        >
          <div className="absolute inset-0 hologram-grid opacity-10 pointer-events-none" />

          {!revealedItem ? (
            <motion.div
              key="chest-closed"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="max-w-md w-full rounded bg-slate-950 p-8 border border-slate-800 text-center relative overflow-hidden"
            >
              <div className="scanline absolute inset-0 pointer-events-none" />

              <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-amber-500/5 blur-3xl rounded-full" />

              <motion.div
                animate={isOpening ? {
                  x: [0, -6, 6, -6, 6, -3, 3, 0],
                  y: [0, -3, 3, -3, 3, 0],
                  scale: [1, 1.05, 1.02, 1.08, 1.02, 1.1, 1]
                } : {
                  y: [0, -6, 0]
                }}
                transition={isOpening ? {
                  duration: 2.2,
                  ease: 'easeInOut'
                } : {
                  repeat: Infinity,
                  duration: 3,
                  ease: 'easeInOut'
                }}
                className="flex justify-center mb-6 text-amber-500"
              >
                <div className="relative rounded bg-slate-900/60 p-6 border border-slate-800">
                  <Gift className="h-16 w-16 text-amber-500" />
                </div>
              </motion.div>

              <h2 className="font-mono text-xl font-bold text-slate-200 tracking-wider uppercase">
                {isOpening ? 'UNLOCKING MYSTERY CHEST...' : 'LEGENDARY CHEST UNLOCKED!'}
              </h2>
              
              <p className="font-mono mt-1 text-[10px] text-slate-500 uppercase tracking-widest">
                {isOpening
                  ? 'Decoding mana frequency... Standby for artifact materialization.'
                  : 'An absolute reward chest has arrived from the Shadow Monarch.'
                }
              </p>

              <div className="mt-8">
                <button
                  disabled={isOpening}
                  onClick={handleOpenChest}
                  className="w-full rounded bg-amber-500 hover:bg-amber-400 py-3 font-mono text-xs font-bold uppercase tracking-wider text-slate-950 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isOpening ? 'DECODING SYSTEM...' : 'OPEN MYSTERY CHEST'}
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="chest-revealed"
              initial={{ scale: 0.8, opacity: 0, rotateY: 90 }}
              animate={{ scale: 1, opacity: 1, rotateY: 0 }}
              transition={{ type: 'spring', damping: 15 }}
              className={`max-w-md w-full rounded bg-slate-950 p-8 border text-center relative overflow-hidden ${getRarityGlow(revealedItem.rarity)}`}
            >
              <div className="scanline absolute inset-0 pointer-events-none" />

              <div className="flex justify-center mb-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.2, 1] }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="rounded bg-slate-900 p-5 border border-current"
                >
                  <Award className="h-12 w-12" />
                </motion.div>
              </div>

              <span className="text-[10px] font-mono tracking-widest uppercase block text-amber-500 mb-1 font-bold">
                Artifact Acquired!
              </span>

              <h2 className="font-mono text-2xl font-bold tracking-wider uppercase mb-1 text-slate-200">
                {revealedItem.name}
              </h2>

              <span className="font-mono text-[9px] uppercase px-2.5 py-0.5 rounded bg-slate-900 border border-current font-bold">
                {revealedItem.rarity} Rank Item
              </span>

              <p className="font-mono text-xs mt-6 text-slate-400 leading-relaxed bg-slate-900/40 p-4 rounded border border-slate-800">
                {revealedItem.description}
              </p>

              <div className="mt-8 flex items-center justify-center gap-2 text-[10px] font-mono text-slate-500">
                <AlertCircle className="h-4 w-4" />
                <span>Added to your active Inventory</span>
              </div>

              <div className="mt-6">
                <button
                  onClick={handleClaimReward}
                  className="w-full rounded bg-slate-100 text-slate-950 py-3 font-mono text-xs font-bold uppercase tracking-wider hover:bg-slate-200 transition-all cursor-pointer"
                >
                  CLAIM AND SYNC STATUS
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
