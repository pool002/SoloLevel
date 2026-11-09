import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, Plus, Trash2, ArrowRight, ClipboardCopy, Info, Heart, Dumbbell, Zap, Eye, Brain } from 'lucide-react';
import { Task, DayScores, StatName } from '../types';

interface DailyLoggerProps {
  tasks: Task[];
  scores: DayScores;
  selectedDayIndex: number;
  selectedWeekLabel: string;
  onUpdateScore: (taskId: string, value: number) => void;
  onDaySelect: (dayIndex: number) => void;
  onAddTask: (task: Omit<Task, 'id'>) => void;
  onDeleteTask: (taskId: string) => void;
  playerStats: { strength: number; agility: number; vitality: number; intelligence: number; sense: number };
}

export default function DailyLogger({
  tasks,
  scores,
  selectedDayIndex,
  selectedWeekLabel,
  onUpdateScore,
  onDaySelect,
  onAddTask,
  onDeleteTask,
  playerStats
}: DailyLoggerProps) {
  const [showCustomTaskForm, setShowCustomTaskForm] = useState(false);
  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskPoints, setNewTaskPoints] = useState<number>(3);
  const [newTaskUnit, setNewTaskUnit] = useState<'hr' | 'occ'>('hr');
  const [newTaskCategory, setNewTaskCategory] = useState<StatName | 'negative'>('intelligence');
  const [newTaskDescription, setNewTaskDescription] = useState('');

  const daysOfWeek = [
    { label: 'SUN', name: 'Sunday' },
    { label: 'MON', name: 'Monday' },
    { label: 'TUE', name: 'Tuesday' },
    { label: 'WED', name: 'Wednesday' },
    { label: 'THU', name: 'Thursday' },
    { label: 'FRI', name: 'Friday' },
    { label: 'SAT', name: 'Saturday' }
  ];

  // Helper to render Stat icons
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'strength':
        return <Dumbbell className="h-3.5 w-3.5 text-red-400" />;
      case 'agility':
        return <Zap className="h-3.5 w-3.5 text-green-400" />;
      case 'vitality':
        return <Heart className="h-3.5 w-3.5 text-emerald-400" />;
      case 'intelligence':
        return <Brain className="h-3.5 w-3.5 text-purple-400" />;
      case 'sense':
        return <Eye className="h-3.5 w-3.5 text-amber-400" />;
      default:
        return <Info className="h-3.5 w-3.5 text-slate-500" />;
    }
  };

  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case 'strength': return 'bg-red-950/40 border-red-500/20 text-red-400';
      case 'agility': return 'bg-green-950/40 border-green-500/20 text-green-400';
      case 'vitality': return 'bg-emerald-950/40 border-emerald-500/20 text-emerald-400';
      case 'intelligence': return 'bg-purple-950/40 border-purple-500/20 text-purple-400';
      case 'sense': return 'bg-amber-950/40 border-amber-500/20 text-amber-400';
      default: return 'bg-slate-900 border-slate-700 text-slate-400';
    }
  };

  // Calculate Stat Bonus Factor: E.g., stats can give a subtle points multiplier!
  // Strength increases workout points, Intelligence study points, etc.
  // Formula: Bonus % = (statValue - 10) * 1.5% (or 0 if stat < 10)
  const getStatBonusMultiplier = (category: string) => {
    if (category === 'negative') return 1.0;
    
    const statValue = playerStats[category as StatName] || 10;
    if (statValue <= 10) return 1.0;
    
    // Each point above 10 gives a 2% bonus
    return 1 + (statValue - 10) * 0.02;
  };

  const calculatePoints = (task: Task, multiplier: number) => {
    if (!multiplier) return 0;
    const basePts = task.points;
    const bonusMultiplier = getStatBonusMultiplier(task.category);
    
    // For positive habits, apply the bonus multiplier. For negative habits, reduce damage with Vitality!
    if (task.category === 'negative') {
      const vitBonus = Math.max(0, (playerStats.vitality - 10) * 0.015); // Each Vitality point reduces negative impact by 1.5%
      const reduction = 1 - Math.min(0.4, vitBonus); // Cap damage reduction at 40%
      return Number((multiplier * basePts * reduction).toFixed(2));
    } else {
      return Number((multiplier * basePts * bonusMultiplier).toFixed(2));
    }
  };

  // Totals for today
  let positiveXpEarned = 0;
  let negativeXpLost = 0;

  tasks.forEach((task) => {
    const val = scores[task.id] || 0;
    if (val > 0) {
      const pts = calculatePoints(task, val);
      if (pts > 0) positiveXpEarned += pts;
      else if (pts < 0) negativeXpLost += Math.abs(pts);
    }
  });

  const dailyNet = Number((positiveXpEarned - negativeXpLost).toFixed(2));

  const handleSliderChange = (taskId: string, val: number) => {
    onUpdateScore(taskId, val);
  };

  const handleIncrement = (taskId: string, unit: string, isPositive: boolean) => {
    const currentVal = scores[taskId] || 0;
    const step = unit === 'hr' ? 0.5 : 1.0;
    const newVal = isPositive ? currentVal + step : Math.max(0, currentVal - step);
    onUpdateScore(taskId, Number(newVal.toFixed(2)));
  };

  const handleCreateCustomTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskName.trim()) return;

    onAddTask({
      name: newTaskName.trim(),
      points: newTaskPoints,
      unit: newTaskUnit,
      category: newTaskCategory,
      description: newTaskDescription.trim() || `Log your customized ${newTaskName} routine.`
    });

    setNewTaskName('');
    setNewTaskDescription('');
    setShowCustomTaskForm(false);
  };

  // Split tasks into positive habits and negative habits
  const positiveTasks = tasks.filter(t => t.category !== 'negative');
  const negativeTasks = tasks.filter(t => t.category === 'negative');

  return (
    <div
      id="daily-logger-container"
      className="border border-slate-800 relative overflow-hidden rounded bg-slate-950/40 p-6 backdrop-blur-sm h-full flex flex-col"
    >
      <div className="scanline absolute inset-0 pointer-events-none" />

      {/* Header */}
      <div className="mb-4 flex flex-wrap gap-3 items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 border-l-2 border-cyan-500 pl-3">
            DAILY QUESTS: PREPARATION FOR THE STRONGER
          </h2>
          <p className="text-[10px] font-mono text-slate-500 pl-3">
            Active target: {selectedWeekLabel} &bull; Logging: {daysOfWeek[selectedDayIndex].name}
          </p>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setShowCustomTaskForm(!showCustomTaskForm)}
            className="flex items-center gap-1 border border-slate-800 rounded bg-slate-900/40 px-2 py-1 font-mono text-[9px] text-slate-400 hover:text-cyan-400 hover:border-cyan-500/30 transition-all cursor-pointer font-bold uppercase"
          >
            <Plus className="h-3 w-3" />
            CREATE QUEST
          </button>
        </div>
      </div>

      {/* High-Tech Day Selector Selector Pills */}
      <div className="mb-6 grid grid-cols-7 gap-1 bg-slate-950 p-1 rounded border border-slate-800/80">
        {daysOfWeek.map((day, idx) => (
          <button
            key={day.label}
            onClick={() => onDaySelect(idx)}
            className={`font-mono text-[10px] font-bold py-1.5 rounded transition-all cursor-pointer ${
              selectedDayIndex === idx
                ? 'bg-cyan-950/30 text-cyan-400 border border-cyan-500/40 shadow-[0_0_8px_rgba(34,211,238,0.15)]'
                : 'text-slate-500 hover:bg-slate-900 hover:text-slate-300'
            }`}
          >
            {day.label}
          </button>
        ))}
      </div>

      {/* Custom Task Form Popover */}
      <AnimatePresence>
        {showCustomTaskForm && (
          <motion.form
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            onSubmit={handleCreateCustomTask}
            className="mb-6 rounded-lg bg-slate-900/90 border border-cyan-500/30 p-4 space-y-3 overflow-hidden"
          >
            <h3 className="font-display text-xs font-bold text-cyan-300 uppercase tracking-widest flex items-center gap-1.5">
              <Plus className="h-3.5 w-3.5" /> CREATE CUSTOM OBJECTIVE
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">Quest Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Reading Sci-Fi, Boxing Practice"
                  value={newTaskName}
                  onChange={(e) => setNewTaskName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">XP Points per unit</label>
                <input
                  type="number"
                  required
                  value={newTaskPoints}
                  onChange={(e) => setNewTaskPoints(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">Measurement Unit</label>
                <select
                  value={newTaskUnit}
                  onChange={(e) => setNewTaskUnit(e.target.value as 'hr' | 'occ')}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
                >
                  <option value="hr">Hours Spent (hr)</option>
                  <option value="occ">Occurrences / Counts (occ)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">RPG Stat Attribute Mapping</label>
                <select
                  value={newTaskCategory}
                  onChange={(e) => setNewTaskCategory(e.target.value as StatName | 'negative')}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
                >
                  <option value="strength">Strength (STR) - Workouts, lifting</option>
                  <option value="agility">Agility (AGI) - Cardio, fast movements</option>
                  <option value="vitality">Vitality (VIT) - Sleep, cleaning, chores</option>
                  <option value="intelligence">Intelligence (INT) - Coding, studies, reading</option>
                  <option value="sense">Sense (SEN) - Meditation, plants, relaxation</option>
                  <option value="negative">Negative Habit - Deducts points (Smoking, Drinking)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">Quest Description</label>
              <input
                type="text"
                placeholder="Explain the purpose of this quest..."
                value={newTaskDescription}
                onChange={(e) => setNewTaskDescription(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCustomTaskForm(false)}
                className="rounded px-3 py-1 bg-slate-800 text-slate-400 font-mono text-[10px] hover:bg-slate-700 hover:text-slate-200 transition-all cursor-pointer"
              >
                CANCEL
              </button>
              <button
                type="submit"
                className="rounded px-3 py-1 bg-cyan-500 text-slate-950 font-display font-bold text-[10px] hover:bg-cyan-400 transition-all cursor-pointer"
              >
                INJECT INTO SYSTEM
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Quest logging lists */}
      <div className="flex-grow overflow-y-auto pr-1 space-y-6 max-h-[500px]">
        
        {/* Positive Habits */}
        <div>
          <h3 className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mb-4 flex items-center gap-1.5 border-l-2 border-cyan-500 pl-2">
            POSITIVE OBJECTIVES (ACTIVE)
          </h3>

          <div className="space-y-3">
            {positiveTasks.map((task) => {
              const val = scores[task.id] || 0;
              const pointsEarned = calculatePoints(task, val);
              const bonusMultiplier = getStatBonusMultiplier(task.category);

              return (
                <div
                  key={task.id}
                  className="bg-slate-900/20 border border-slate-800 hover:border-slate-750 p-4 rounded transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-grow">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <div className="flex items-center gap-2">
                          <div className={`w-4 h-4 border flex items-center justify-center flex-shrink-0 rounded-sm transition-colors ${val > 0 ? 'border-cyan-500/80 bg-cyan-500/10' : 'border-slate-800 bg-slate-950'}`}>
                            {val > 0 && <div className="w-1.5 h-1.5 bg-cyan-400" />}
                          </div>
                          <span className="font-sans text-sm font-medium text-slate-200">{task.name}</span>
                        </div>

                        <span className={`text-[8px] font-mono border px-1.5 py-0.5 rounded uppercase flex items-center gap-1 ${getCategoryBadgeClass(task.category)}`}>
                          {getCategoryIcon(task.category)}
                          {task.category}
                        </span>
                        {bonusMultiplier > 1 && (
                          <span className="text-[9px] font-mono text-amber-500 font-bold" title={`Bonus multiplier from RPG attributes: x${bonusMultiplier.toFixed(2)}`}>
                            x{bonusMultiplier.toFixed(2)} Stat Bonus
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1 pl-6 leading-relaxed">{task.description}</p>
                    </div>

                    {/* Delete Custom Tasks */}
                    {!['clean_room', 'water_plants', 'self_study', 'coding', 'ctf', 'cardio', 'workout', 'yoga', 'meditation'].includes(task.id) && (
                      <button
                        onClick={() => onDeleteTask(task.id)}
                        className="text-slate-600 hover:text-red-400 p-1 rounded hover:bg-slate-900 transition-all cursor-pointer"
                        title="Delete custom task"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    )}
                  </div>

                  {/* Interactive Inputs */}
                  <div className="mt-3 flex items-center justify-between gap-4 bg-slate-950/40 p-2 rounded border border-slate-850">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleIncrement(task.id, task.unit, false)}
                        className="h-7 w-7 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200 font-black text-xs flex items-center justify-center cursor-pointer"
                      >
                        -
                      </button>
                      
                      <div className="w-16 text-center">
                        <span className="font-mono text-xs font-bold text-slate-300">{val}</span>
                        <span className="text-[9px] text-slate-500 ml-0.5">{task.unit}</span>
                      </div>

                      <button
                        onClick={() => handleIncrement(task.id, task.unit, true)}
                        className="h-7 w-7 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200 font-black text-xs flex items-center justify-center cursor-pointer"
                      >
                        +
                      </button>
                    </div>

                    {/* Quick values sliders */}
                    <div className="flex-grow max-w-xs px-4 hidden sm:block">
                      <input
                        type="range"
                        min="0"
                        max={task.unit === 'hr' ? "6" : "5"}
                        step={task.unit === 'hr' ? "0.5" : "1"}
                        value={val}
                        onChange={(e) => handleSliderChange(task.id, parseFloat(e.target.value))}
                        className="w-full accent-cyan-500 cursor-pointer h-1 bg-slate-900 rounded appearance-none"
                      />
                    </div>

                    {/* Calculated Points Indicator */}
                    <div className="text-right">
                      <span className="text-[9px] font-mono text-slate-500 uppercase block">XP gained</span>
                      <span className={`font-mono text-xs font-bold ${pointsEarned > 0 ? 'text-cyan-400' : 'text-slate-500'}`}>
                        +{pointsEarned} XP
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Negative / Penalty Habits */}
        <div>
          <h3 className="text-[10px] font-bold text-rose-500 tracking-widest uppercase mb-4 flex items-center gap-1.5 border-l-2 border-rose-500 pl-2">
            SYSTEM DEBUFFS / WARNING SIGNALS
          </h3>

          <div className="space-y-3">
            {negativeTasks.map((task) => {
              const val = scores[task.id] || 0;
              const pointsLost = Math.abs(calculatePoints(task, val));
              const vitBonus = Math.max(0, (playerStats.vitality - 10) * 0.015);

              return (
                <div
                  key={task.id}
                  className="bg-slate-950/10 border border-rose-950/20 hover:border-rose-900/30 p-4 rounded transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-grow">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <div className="flex items-center gap-2">
                          <div className={`w-4 h-4 border flex items-center justify-center flex-shrink-0 rounded-sm transition-colors ${val > 0 ? 'border-rose-500/80 bg-rose-500/10' : 'border-slate-800 bg-slate-950'}`}>
                            {val > 0 && <div className="w-1.5 h-1.5 bg-rose-500" />}
                          </div>
                          <span className="font-sans text-sm font-medium text-slate-300">{task.name}</span>
                        </div>

                        <span className="text-[8px] font-mono border bg-rose-950/15 border-rose-500/20 text-rose-400 px-1.5 py-0.5 rounded uppercase font-bold">
                          DEBUFF
                        </span>
                        {vitBonus > 0 && (
                          <span className="text-[9px] font-mono text-emerald-400 font-bold" title={`Vitality shields you, absorbing negative debuffs by ${(vitBonus * 100).toFixed(1)}%`}>
                            -{Math.min(40, Math.round(vitBonus * 100))}% Damage Absorbed
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1 pl-6 leading-relaxed">{task.description}</p>
                    </div>

                    {!['1xcig', 'gaming', 'alcohol'].includes(task.id) && (
                      <button
                        onClick={() => onDeleteTask(task.id)}
                        className="text-slate-600 hover:text-red-400 p-1 rounded hover:bg-slate-900 transition-all cursor-pointer"
                        title="Delete custom penalty"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    )}
                  </div>

                  {/* Interactive Inputs */}
                  <div className="mt-3 flex items-center justify-between gap-4 bg-slate-950/40 p-2 rounded border border-rose-950/10">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleIncrement(task.id, task.unit, false)}
                        className="h-7 w-7 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200 font-black text-xs flex items-center justify-center cursor-pointer"
                      >
                        -
                      </button>
                      
                      <div className="w-16 text-center">
                        <span className="font-mono text-xs font-bold text-slate-300">{val}</span>
                        <span className="text-[9px] text-slate-500 ml-0.5">{task.unit}</span>
                      </div>

                      <button
                        onClick={() => handleIncrement(task.id, task.unit, true)}
                        className="h-7 w-7 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200 font-black text-xs flex items-center justify-center cursor-pointer"
                      >
                        +
                      </button>
                    </div>

                    {/* Quick values sliders */}
                    <div className="flex-grow max-w-xs px-4 hidden sm:block">
                      <input
                        type="range"
                        min="0"
                        max={task.unit === 'hr' ? "8" : "10"}
                        step={task.unit === 'hr' ? "0.5" : "1"}
                        value={val}
                        onChange={(e) => handleSliderChange(task.id, parseFloat(e.target.value))}
                        className="w-full accent-rose-500 cursor-pointer h-1 bg-slate-900 rounded appearance-none"
                      />
                    </div>

                    {/* Calculated Points Indicator */}
                    <div className="text-right">
                      <span className="text-[9px] font-mono text-slate-500 uppercase block">Points lost</span>
                      <span className={`font-mono text-xs font-bold ${pointsLost > 0 ? 'text-rose-400' : 'text-slate-500'}`}>
                        -{pointsLost} XP
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Daily Net Summary Board */}
      <div className="mt-6 border-t border-slate-800 pt-4 bg-slate-900/20 p-3 rounded border border-slate-800/80">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono text-slate-400 block uppercase">CORE QUEST SUMMARY FOR TODAY</span>
            <div className="flex items-center gap-4 mt-0.5">
              <span className="text-xs font-mono text-cyan-400">+{positiveXpEarned.toFixed(1)} XP</span>
              <span className="text-xs font-mono text-red-400">-{negativeXpLost.toFixed(1)} XP</span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-mono text-slate-500 block uppercase">DAILY NET</span>
            <span className={`font-mono text-sm font-black ${dailyNet >= 0 ? 'text-cyan-400' : 'text-rose-400'}`}>
              {dailyNet >= 0 ? `+${dailyNet}` : dailyNet} XP
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
