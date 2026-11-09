import React from 'react';
import { motion } from 'motion/react';
import { Shield, Target, Flame, AlertOctagon, Gift, CheckCircle, HelpCircle } from 'lucide-react';
import { WeeklyTarget, MonthlyGift } from '../types';

interface QuestRegistryProps {
  weeklyTargets: WeeklyTarget[];
  currentWeekId: string;
  onWeekSelect: (weekId: string) => void;
  weeklyTotalPoints: number;
  activePenalty: string | null;
  penaltyCompleted: boolean;
  onTogglePenaltyCompleted: () => void;
  monthlyGift: MonthlyGift;
  onOpenGift: () => void;
}

export default function QuestRegistry({
  weeklyTargets,
  currentWeekId,
  onWeekSelect,
  weeklyTotalPoints,
  activePenalty,
  penaltyCompleted,
  onTogglePenaltyCompleted,
  monthlyGift,
  onOpenGift
}: QuestRegistryProps) {
  const currentWeek = weeklyTargets.find(w => w.id === currentWeekId) || weeklyTargets[0];
  const targetPct = Math.min(100, Math.max(0, (weeklyTotalPoints / currentWeek.targetPoints) * 100));

  // Find the real-time calendar current week ending Saturday
  const getRealCurrentWeekId = () => {
    const now = new Date();
    const dayIndex = now.getDay();
    const sat = new Date(now);
    const diff = 6 - dayIndex;
    sat.setDate(now.getDate() + diff);
    return sat.toISOString().split('T')[0];
  };
  const realCurrentWeekId = getRealCurrentWeekId();

  // Determine if this is a previous week
  const isPastWeek = (weekId: string) => {
    return weekId < realCurrentWeekId;
  };

  // Check if all weeks are green to unlock monthly gift
  // A week is "clean" if they either met the target, or they didn't but completed the penalty
  const isJulyClean = weeklyTargets
    .filter(w => w.id.startsWith('2026-07'))
    .every(w => {
      const earned = w.id === currentWeekId ? weeklyTotalPoints : (w.totalPointsEarned || 0);
      const metTarget = earned >= w.targetPoints;
      return metTarget || w.penaltyCompleted;
    });

  return (
    <div
      id="quest-registry-container"
      className="border border-slate-800 relative overflow-hidden rounded bg-slate-950/40 p-6 backdrop-blur-sm flex flex-col"
    >
      <div className="scanline absolute inset-0 pointer-events-none" />

      {/* Header */}
      <div className="mb-6 flex items-center gap-2">
        <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 border-l-2 border-cyan-500 pl-3">
          QUEST REGISTRY: CAMPAIGN MONITOR
        </h2>
      </div>

      {/* Selector Dropdown */}
      <div className="mb-6">
        <label className="block text-[9px] font-mono text-slate-500 uppercase mb-1.5">SELECT WEEKLY CAMPAIGN</label>
        <select
          value={currentWeekId}
          onChange={(e) => onWeekSelect(e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-cyan-500 font-mono cursor-pointer"
        >
          {weeklyTargets.map((w) => (
            <option key={w.id} value={w.id}>
              {w.label} {w.id === realCurrentWeekId ? '(Current Week)' : ''}
            </option>
          ))}
        </select>
      </div>

      {/* Current Weekly Target Status */}
      <div className="mb-6 rounded border border-slate-800 bg-slate-900/30 p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <span className="text-[10px] font-mono text-slate-500 uppercase block">Weekly Target</span>
            <span className="text-sm font-semibold text-slate-200">
              {currentWeek.label}
            </span>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-mono text-slate-500 uppercase block">Goal Threshold</span>
            <span className="font-mono text-xs font-bold text-cyan-400">
              {currentWeek.targetPoints} XP
            </span>
          </div>
        </div>

        {/* Experience gauge */}
        <div className="relative h-1.5 w-full bg-slate-900 border border-slate-800 mt-3 mb-1.5">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${targetPct}%` }}
            transition={{ duration: 0.8 }}
            className={`h-full ${targetPct >= 100 ? 'bg-emerald-500' : 'bg-cyan-500'}`}
          />
        </div>

        <div className="flex justify-between items-center text-[10px] font-mono">
          <span className="text-slate-400">Progress: {weeklyTotalPoints.toFixed(1)} / {currentWeek.targetPoints} XP</span>
          <span className={`font-bold ${targetPct >= 100 ? 'text-emerald-400' : 'text-cyan-400'}`}>
            {Math.round(targetPct)}%
          </span>
        </div>

        {/* Success Indicator */}
        {weeklyTotalPoints >= currentWeek.targetPoints && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-4 flex items-center gap-2 bg-emerald-950/20 border border-emerald-900/30 rounded p-2.5 text-emerald-400 text-xs"
          >
            <CheckCircle className="h-4 w-4 text-emerald-400 flex-shrink-0 animate-pulse" />
            <div>
              <span className="font-mono font-bold uppercase tracking-wider block">WEEKLY TARGET SECURED!</span>
              <span className="text-[10px] text-slate-400 font-sans">Weekly penalty averted. Level up speed increased.</span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Penalty protocol */}
      {activePenalty && (
        <div className={`mb-6 rounded p-4 border transition-all ${
          penaltyCompleted
            ? 'bg-emerald-950/10 border-emerald-900/30 text-emerald-400'
            : 'bg-rose-950/10 border-rose-900/30 text-rose-400'
        }`}>
          <div className="flex items-start gap-3">
            <AlertOctagon className={`h-5 w-5 flex-shrink-0 mt-0.5 ${penaltyCompleted ? 'text-emerald-400' : 'text-rose-500 animate-pulse'}`} />
            <div className="flex-grow">
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-bold uppercase tracking-widest block font-mono ${penaltyCompleted ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {penaltyCompleted ? 'PENALTY COMPLETED' : 'PENALTY PROTOCOL ACTIVE'}
                </span>
                <span className="font-mono text-[9px] text-slate-500 uppercase bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded">
                  {currentWeek.label.replace('Weekend - ', 'Wk Ending ')}
                </span>
              </div>
              
              <h4 className={`text-xs font-semibold mt-1 ${penaltyCompleted ? 'line-through text-slate-500' : 'text-slate-100 font-mono'}`}>
                {activePenalty}
              </h4>
              <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                {penaltyCompleted
                  ? 'You have successfully executed the physical correction penalty. Your status is restored.'
                  : 'Weekly target was missed! You must complete this task physically to unlock normal status.'
                }
              </p>

              <div className="mt-3">
                <label className="flex items-center gap-2 text-[10px] font-mono cursor-pointer bg-slate-950/50 hover:bg-slate-950 px-2.5 py-1.5 rounded border border-slate-900 transition-colors select-none">
                  <input
                    type="checkbox"
                    checked={penaltyCompleted}
                    onChange={onTogglePenaltyCompleted}
                    className="accent-emerald-500 h-3.5 w-3.5 rounded cursor-pointer"
                  />
                  <span className={`${penaltyCompleted ? 'text-emerald-400' : 'text-slate-300'}`}>
                    {penaltyCompleted ? '✓ Penalty Completed & Logged' : 'I have completed this penalty task'}
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Monthly Gift Loot Box Section */}
      <div className="mt-auto rounded border border-slate-800 bg-slate-900/10 p-4 relative">
        <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-amber-500/5 blur-xl rounded-full pointer-events-none" />

        <div className="flex items-start gap-3">
          <div className="relative">
            <motion.div
              animate={isJulyClean && !monthlyGift.isOpened ? { rotate: [0, -5, 5, -5, 5, 0] } : {}}
              transition={{ repeat: Infinity, duration: 2.5, repeatDelay: 3 }}
              className={`p-3 rounded border flex items-center justify-center ${
                monthlyGift.isOpened
                  ? 'bg-slate-950 text-slate-600 border-slate-800'
                  : isJulyClean
                    ? 'bg-amber-950/10 text-amber-400 border-amber-500/30 cursor-pointer shadow-[0_0_8px_rgba(245,158,11,0.15)]'
                    : 'bg-slate-900/60 text-slate-500 border-slate-800'
              }`}
              onClick={isJulyClean && !monthlyGift.isOpened ? onOpenGift : undefined}
            >
              <Gift className={`h-8 w-8 ${isJulyClean && !monthlyGift.isOpened ? 'animate-pulse text-amber-400' : ''}`} />
            </motion.div>
          </div>

          <div className="flex-grow min-w-0">
            <span className="text-[9px] font-mono text-amber-500 font-bold block uppercase tracking-wider">
              Monthly Mystery Chest
            </span>
            <h4 className="text-xs font-semibold text-slate-200 font-mono mt-0.5">
              {monthlyGift.label}
            </h4>
            <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
              {monthlyGift.isOpened
                ? 'Reward claimed. Check your Inventory!'
                : isJulyClean
                  ? '⚡ ALL JUL CAMPAIGNS SECURED! Click the Chest to claim your Legendary loot!'
                  : 'Keep all July campaigns clean (meet target OR complete penalties) to unlock this Legendary reward.'
              }
            </p>

            {isJulyClean && !monthlyGift.isOpened && (
              <button
                onClick={onOpenGift}
                className="mt-2.5 w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono font-bold text-[10px] py-1.5 px-2.5 rounded transition-all tracking-wider uppercase cursor-pointer"
              >
                OPEN SYSTEM REWARD CHEST
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
