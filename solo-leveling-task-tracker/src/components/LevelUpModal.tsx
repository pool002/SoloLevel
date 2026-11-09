import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Sparkles } from 'lucide-react';

interface LevelUpModalProps {
  isOpen: boolean;
  level: number;
  onClose: () => void;
}

export default function LevelUpModal({ isOpen, level, onClose }: LevelUpModalProps) {
  useEffect(() => {
    if (isOpen) {
      // Trigger a dramatic tone if supported (can use browser beep or visual-only)
      try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        // Solo Leveling style level up chime: low to high pitch
        osc.frequency.setValueAtTime(300, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.4);
        
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);
        
        osc.start();
        osc.stop(ctx.currentTime + 0.8);
      } catch (e) {
        // AudioContext not allowed or not supported, ignore
      }
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          id="level-up-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            id="level-up-card"
            initial={{ scale: 0.8, y: 50, rotate: -2 }}
            animate={{ scale: 1, y: 0, rotate: 0 }}
            exit={{ scale: 0.8, y: 50, rotate: 2 }}
            transition={{ type: 'spring', damping: 15 }}
            className="relative max-w-md w-full overflow-hidden rounded bg-slate-950 p-8 text-center border border-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Holographic scanner line inside card */}
            <div className="scanline absolute inset-0 pointer-events-none" />

            {/* Glowing Golden Aura */}
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-amber-500/5 blur-3xl rounded-full pointer-events-none" />

            <div className="flex justify-center mb-4">
              <motion.div
                initial={{ rotate: 180, scale: 0 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="rounded-full bg-amber-500/10 p-3 text-amber-500 ring-1 ring-amber-500/20"
              >
                <Shield className="h-10 w-10 text-amber-500" />
              </motion.div>
            </div>

            <motion.h1
              initial={{ letterSpacing: '0.1em', opacity: 0 }}
              animate={{ letterSpacing: '0.2em', opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="font-mono text-2xl font-bold uppercase text-amber-500 tracking-wider"
            >
              LEVEL UP
            </motion.h1>
            
            <p className="font-mono mt-1 text-[10px] text-slate-500 uppercase tracking-widest">
              The System rewards your diligence
            </p>

            <div className="my-8 flex items-center justify-center gap-6">
              <div className="text-right">
                <span className="text-[10px] text-slate-500 uppercase font-mono block">Previous</span>
                <span className="font-mono text-2xl font-medium text-slate-400">LVL {level - 1}</span>
              </div>
              
              <div className="h-8 w-[1px] bg-slate-800" />
              
              <div className="text-left">
                <span className="text-[10px] text-amber-500 uppercase font-mono block font-bold">Current</span>
                <motion.span
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ delay: 0.6, duration: 0.4 }}
                  className="font-mono text-3xl font-bold text-amber-500"
                >
                  LVL {level}
                </motion.span>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mb-8 rounded bg-slate-900/40 border border-slate-800 p-4"
            >
              <div className="flex items-center justify-center gap-2 text-amber-400">
                <Sparkles className="h-4 w-4" />
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider">Rewards Unlocked:</span>
              </div>
              <ul className="mt-2 text-[10px] font-mono text-slate-400 space-y-1">
                <li>+5 Stat Points (distributable)</li>
                <li>+100 Gold Tokens</li>
                <li>Full Health/Fatigue Restored</li>
              </ul>
            </motion.div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full rounded bg-amber-500 py-3 font-mono text-xs font-bold uppercase tracking-wider text-slate-950 transition-all hover:bg-amber-400 cursor-pointer"
              onClick={onClose}
            >
              Acknowledge System Notification
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
