import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Shield, Sparkles, LogOut, RotateCcw, AlertTriangle, Swords, HelpCircle, UserCheck, Skull } from 'lucide-react';
import { getInitialState, saveState } from './initialState';
import { AppState, Task, StatName, InventoryItem } from './types';

// Import our custom sub-components
import StatusWindow from './components/StatusWindow';
import DailyLogger from './components/DailyLogger';
import QuestRegistry from './components/QuestRegistry';
import Inventory from './components/Inventory';
import LevelUpModal from './components/LevelUpModal';
import LootBoxModal from './components/LootBoxModal';
import PortalSystem from './components/PortalSystem';

// Helper to calculate Hunter Rank based on total cumulative XP
export const getHunterRank = (totalXp: number) => {
  if (totalXp < 3600) return 'F-Rank';
  if (totalXp < 10800) return 'E-Rank';
  if (totalXp < 25200) return 'D-Rank';
  if (totalXp < 54000) return 'C-Rank';
  if (totalXp < 100000) return 'B-Rank';
  if (totalXp < 200000) return 'A-Rank';
  return 'S-Rank';
};

export const getRankMultiplier = (rank: string) => {
  switch (rank) {
    case 'F-Rank': return 1.0;
    case 'E-Rank': return 1.2;
    case 'D-Rank': return 1.4;
    case 'C-Rank': return 1.6;
    case 'B-Rank': return 1.8;
    case 'A-Rank': return 2.0;
    default: return 2.5;
  }
};

export const getPenaltyForRank = (rank: string, level: number) => {
  const penalties: Record<string, string[]> = {
    'F-Rank': ['50x Push Ups', '50x Squats', '2 min Plank', '1.5 miles Run'],
    'E-Rank': ['100x Push Ups', '100x Squats', '4 min Plank', '3 miles Run'],
    'D-Rank': ['150x Push Ups', '150x Squats', '5 min Plank', '5 miles Run'],
    'C-Rank': ['200x Push Ups', '200x Squats', '100x Sit Ups', '4hrs Focus Study'],
    'B-Rank': ['250x Push Ups', '100x Pull Ups', '10km Run', '6hrs Straight Coding'],
    'A-Rank': ['300x Push Ups', '150x Pull Ups', '15km Run', '8hrs Straight Coding'],
    'S-Rank': ['500x Push Ups', '200x Pull Ups', '20km Run', '12hrs Straight Coding'],
  };
  const list = penalties[rank] || penalties['F-Rank'];
  const idx = level % list.length;
  return list[idx];
};

export default function App() {
  const [state, setState] = useState<AppState>(getInitialState());
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [showLootBox, setShowLootBox] = useState(false);
  const [systemLogs, setSystemLogs] = useState<string[]>(state.notifications || []);
  const [activeTab, setActiveTab] = useState<'tracker' | 'inventory' | 'portal'>('tracker');
  const [activeEffect, setActiveEffect] = useState<string | null>(null);

  // Perform dynamic weekly schedule check, Sunday purge, and target set
  useEffect(() => {
    const now = new Date();
    const dayIndex = now.getDay(); // 0 is Sunday, 6 is Saturday
    
    // Find the Saturday ending this week
    const sat = new Date(now);
    const diff = 6 - dayIndex;
    sat.setDate(now.getDate() + diff);
    const targetWeekId = sat.toISOString().split('T')[0];
    
    setState(prev => {
      // 1. Re-calculate the whole week points for all targets to cache them before purging
      const updatedTargets = prev.weeklyTargets.map(t => {
        let weekSum = 0;
        const weekScores = prev.scores[t.id] || {};
        Object.keys(weekScores).forEach((dayStr) => {
          const dScores = weekScores[Number(dayStr)] || {};
          Object.keys(dScores).forEach((tId) => {
            const tk = prev.tasks.find(tk => tk.id === tId);
            const v = dScores[tId] || 0;
            if (tk && v > 0) {
              const base = tk.points;
              const bonus = tk.category === 'negative' ? 1.0 : (1 + ((prev.playerStats[tk.category as StatName] || 10) - 10) * 0.02);
              if (tk.category === 'negative') {
                const vit = Math.max(0, (prev.playerStats.vitality - 10) * 0.015);
                weekSum += v * base * (1 - Math.min(0.4, vit));
              } else {
                weekSum += v * base * bonus;
              }
            }
          });
        });
        return { 
          ...t, 
          totalPointsEarned: t.totalPointsEarned !== undefined && t.totalPointsEarned > 0 
            ? t.totalPointsEarned 
            : Number(weekSum.toFixed(2)) 
        };
      });

      // 2. Check if the current calendar week target is already present
      const hasCurrentWeek = updatedTargets.some(t => t.id === targetWeekId);
      let nextTargets = [...updatedTargets];
      let nextScores = { ...prev.scores };
      let notifications = [...(prev.notifications || [])];

      if (!hasCurrentWeek) {
        // Game logic to set target points & penalty
        const playerRank = getHunterRank(prev.playerStats.totalXp || 0);
        const rankMultiplier = getRankMultiplier(playerRank);
        const level = prev.playerStats.level || 1;
        
        const targetPoints = Math.round((200 + level * 15) * rankMultiplier);
        const penalty = getPenaltyForRank(playerRank, level);
        
        const newTarget = {
          id: targetWeekId,
          label: `Weekend - ${sat.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}`,
          targetPoints,
          penalty,
          penaltyCompleted: false,
          totalPointsEarned: 0
        };

        nextTargets.push(newTarget);
        nextScores[targetWeekId] = {
          0: {}, 1: {}, 2: {}, 3: {}, 4: {}, 5: {}, 6: {}
        };

        notifications.unshift(`SYSTEM: NEW WEEK INITIALIZED (${targetWeekId}). Target: ${targetPoints} XP. Penalty: ${penalty}.`);
      }

      // 3. Purge daily logs for older weeks (keep long-term summary in weeklyTargets list)
      Object.keys(nextScores).forEach(weekId => {
        if (weekId !== targetWeekId) {
          nextScores[weekId] = {}; 
        }
      });

      return {
        ...prev,
        weeklyTargets: nextTargets,
        scores: nextScores,
        currentWeekId: targetWeekId,
        currentDayIndex: dayIndex,
        notifications: notifications.slice(0, 50)
      };
    });
  }, []);

  // Sync state to local storage when it changes
  useEffect(() => {
    saveState(state);
  }, [state]);

  // Sync notifications logs
  useEffect(() => {
    setSystemLogs(state.notifications || []);
  }, [state.notifications]);

  // Check for consecutive failed penalties to trigger Lockout
  useEffect(() => {
    const sorted = [...state.weeklyTargets].sort((a, b) => a.id.localeCompare(b.id));
    let consecutiveCount = 0;
    let triggerLock = false;

    for (let i = 0; i < sorted.length; i++) {
      const t = sorted[i];
      // Skip current week as it is not fully complete/failed yet
      if (t.id === state.currentWeekId) continue;

      const earned = t.totalPointsEarned || 0;
      const target = t.targetPoints;
      const failedTarget = earned < target;
      const penaltyIncomplete = !t.penaltyCompleted;

      if (failedTarget && penaltyIncomplete) {
        consecutiveCount++;
        if (consecutiveCount >= 2) {
          triggerLock = true;
          break;
        }
      } else {
        consecutiveCount = 0; // reset on any success or completed penalty
      }
    }

    if (triggerLock && !state.isSystemLocked) {
      setState(prev => ({
        ...prev,
        isSystemLocked: true,
        notifications: [
          '🚨 EMERGENCY: LOCKOUT PROTOCOL ACTIVATED FOR 2 CONSECUTIVE UNRESOLVED PENALTIES.',
          ...(prev.notifications || [])
        ].slice(0, 50)
      }));
    }
  }, [state.weeklyTargets, state.currentWeekId, state.isSystemLocked]);

  const handleExecuteRestoration = () => {
    setState(prev => {
      // Mark all past incomplete penalties completed to unlock
      const unlockedTargets = prev.weeklyTargets.map(t => ({
        ...t,
        penaltyCompleted: true
      }));

      return {
        ...prev,
        isSystemLocked: false,
        weeklyTargets: unlockedTargets,
        notifications: [
          '🌌 SYSTEM RE-ENTRY: Restoration ritual completed. Clearance granted.',
          '🌌 Status restored to ACTIVE. Keep your discipline!',
          ...(prev.notifications || [])
        ].slice(0, 50)
      };
    });
  };

  // Helper to append to system logs
  const addSystemLog = (msg: string) => {
    const formatted = `SYSTEM: ${msg}`;
    setState(prev => ({
      ...prev,
      notifications: [formatted, ...(prev.notifications || [])].slice(0, 50)
    }));
  };

  // Helper to calculate XP bonus multiplier based on player stats
  const getStatBonusMultiplier = (category: string) => {
    if (category === 'negative') return 1.0;
    
    const statValue = state.playerStats[category as StatName] || 10;
    if (statValue <= 10) return 1.0;
    
    // Each point above 10 gives a 2% bonus
    return 1 + (statValue - 10) * 0.02;
  };

  // Helper to calculate actual points for a task given a multiplier
  const calculatePoints = (task: Task, multiplier: number) => {
    if (!multiplier) return 0;
    const basePts = task.points;
    const bonusMultiplier = getStatBonusMultiplier(task.category);
    
    if (task.category === 'negative') {
      const vitBonus = Math.max(0, (state.playerStats.vitality - 10) * 0.015); // Vitality reduces negative impact by 1.5% per point above 10
      const reduction = 1 - Math.min(0.4, vitBonus); // Cap damage reduction at 40%
      return Number((multiplier * basePts * reduction).toFixed(2));
    } else {
      return Number((multiplier * basePts * bonusMultiplier).toFixed(2));
    }
  };

  // Calculate the total points scored for a specific week based on state.scores[weekId]
  const calculateWeeklyTotal = (weekId: string) => {
    const weekScores = state.scores[weekId];
    if (!weekScores) return 0;

    let total = 0;
    Object.keys(weekScores).forEach((dayIdxStr) => {
      const dayScores = weekScores[Number(dayIdxStr)];
      if (dayScores) {
        Object.keys(dayScores).forEach((taskId) => {
          const task = state.tasks.find(t => t.id === taskId);
          const val = dayScores[taskId] || 0;
          if (task && val > 0) {
            total += calculatePoints(task, val);
          }
        });
      }
    });

    return Number(total.toFixed(2));
  };

  // Active week total score
  const activeWeeklyTotal = calculateWeeklyTotal(state.currentWeekId);

  // Update a task score for the currently selected day & week
  const handleUpdateScore = (taskId: string, newValue: number) => {
    const weekId = state.currentWeekId;
    const dayIdx = state.currentDayIndex;
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return;

    // Get old value to compute XP delta
    const currentWeekScores = state.scores[weekId] || {};
    const currentDayScores = currentWeekScores[dayIdx] || {};
    const oldVal = currentDayScores[taskId] || 0;

    // Compute XP delta
    const oldPts = calculatePoints(task, oldVal);
    const newPts = calculatePoints(task, newValue);
    const deltaXp = Number((newPts - oldPts).toFixed(2));

    // Update scores in state
    const updatedScores = { ...state.scores };
    if (!updatedScores[weekId]) updatedScores[weekId] = {};
    if (!updatedScores[weekId][dayIdx]) updatedScores[weekId][dayIdx] = {};
    
    if (newValue === 0) {
      delete updatedScores[weekId][dayIdx][taskId];
    } else {
      updatedScores[weekId][dayIdx][taskId] = newValue;
    }

    // Dynamic Level Up & XP logic
    setState(prev => {
      let currentXp = prev.playerStats.xp + deltaXp;
      let totalXp = (prev.playerStats.totalXp || 0) + deltaXp;
      if (totalXp < 0) totalXp = 0;
      let level = prev.playerStats.level;
      let maxXp = prev.playerStats.maxXp;
      let statPoints = prev.playerStats.statPoints;
      let gold = prev.playerStats.gold;
      let triggeredLevelUp = false;

      // Handle positive delta (Earned XP)
      if (currentXp >= maxXp) {
        triggeredLevelUp = true;
        level += 1;
        currentXp = Number((currentXp - maxXp).toFixed(2));
        maxXp = level * 100; // Curve: Lvl 1=100, Lvl 2=200, Lvl 3=300, etc.
        statPoints += 5;
        gold += 100;
      }

      // Keep XP >= 0
      if (currentXp < 0) {
        currentXp = 0;
      }

      // Prepare updated stats
      const updatedStats = {
        ...prev.playerStats,
        xp: Number(currentXp.toFixed(2)),
        totalXp: Number(totalXp.toFixed(2)),
        level,
        maxXp,
        statPoints,
        gold
      };

      // Set level up trigger state
      if (triggeredLevelUp) {
        setTimeout(() => setShowLevelUp(true), 200);
      }

      // Compile logs
      const updatedNotifications = [...(prev.notifications || [])];
      if (deltaXp !== 0) {
        const actionText = deltaXp > 0 ? 'earned' : 'lost';
        const formattedXp = Math.abs(deltaXp).toFixed(1);
        const logMsg = `SYSTEM: Logged adjustment on "${task.name}". ${deltaXp > 0 ? '+' : '-'}${formattedXp} XP ${actionText}.`;
        updatedNotifications.unshift(logMsg);
      }

      if (triggeredLevelUp) {
        updatedNotifications.unshift(`SYSTEM: LEVEL UP achieved! Welcome to level ${level}. +5 Stat Points and +100 Gold credited.`);
      }

      // Also update cached total points earned for the target week
      const updatedTargets = prev.weeklyTargets.map(t => {
        if (t.id === weekId) {
          // Re-calculate the whole week points
          let weekSum = 0;
          const weekScores = updatedScores[weekId] || {};
          Object.keys(weekScores).forEach((dayStr) => {
            const dScores = weekScores[Number(dayStr)] || {};
            Object.keys(dScores).forEach((tId) => {
              const tk = prev.tasks.find(tk => tk.id === tId);
              const v = dScores[tId] || 0;
              if (tk && v > 0) {
                // Compute using prev stats to avoid recursive lookups
                const base = tk.points;
                const bonus = tk.category === 'negative' ? 1.0 : (1 + ((prev.playerStats[tk.category as StatName] || 10) - 10) * 0.02);
                if (tk.category === 'negative') {
                  const vit = Math.max(0, (prev.playerStats.vitality - 10) * 0.015);
                  weekSum += v * base * (1 - Math.min(0.4, vit));
                } else {
                  weekSum += v * base * bonus;
                }
              }
            });
          });
          return { ...t, totalPointsEarned: Number(weekSum.toFixed(2)) };
        }
        return t;
      });

      return {
        ...prev,
        scores: updatedScores,
        playerStats: updatedStats,
        weeklyTargets: updatedTargets,
        notifications: updatedNotifications.slice(0, 50)
      };
    });
  };

  // Allocate a stat point to Strength, Agility, Vitality, etc.
  const handleAllocateStat = (statName: StatName) => {
    if (state.playerStats.statPoints <= 0) return;

    setState(prev => {
      const updatedStats = {
        ...prev.playerStats,
        statPoints: prev.playerStats.statPoints - 1,
        [statName]: prev.playerStats[statName] + 1
      };

      // Custom message detailing the stat's effect
      let statEffect = '';
      if (statName === 'strength') statEffect = 'Increases strength, amplifying workout & cardio multipliers!';
      if (statName === 'agility') statEffect = 'Increases agility, boosting cardio & yoga speeds!';
      if (statName === 'vitality') statEffect = 'Boosts stamina, absorbing up to 40% of smoking & drinking debuffs!';
      if (statName === 'intelligence') statEffect = 'Amplifies coding, study, and CTF cybersecurity focus gains!';
      if (statName === 'sense') statEffect = 'Enhances meditation, yoga, and plant watering mindfulness scores!';

      return {
        ...prev,
        playerStats: updatedStats,
        notifications: [
          `SYSTEM: Allocated 1 Stat Point to ${statName.toUpperCase()}. Attribute increased to ${updatedStats[statName]}.`,
          `SYSTEM: ${statEffect}`,
          ...(prev.notifications || [])
        ].slice(0, 50)
      };
    });
  };

  // Reset allocated stat points back to unallocated state
  const handleResetStats = () => {
    setState(prev => {
      const totalAllocated = 
        (prev.playerStats.strength - 10) +
        (prev.playerStats.agility - 10) +
        (prev.playerStats.vitality - 10) +
        (prev.playerStats.intelligence - 10) +
        (prev.playerStats.sense - 10);

      if (totalAllocated <= 0) return prev;

      const updatedStats = {
        ...prev.playerStats,
        statPoints: prev.playerStats.statPoints + totalAllocated,
        strength: 10,
        agility: 10,
        vitality: 10,
        intelligence: 10,
        sense: 10
      };

      return {
        ...prev,
        playerStats: updatedStats,
        notifications: [
          'SYSTEM: All allocated attribute stat points have been refunded. Please re-distribute.',
          ...(prev.notifications || [])
        ].slice(0, 50)
      };
    });
  };

  const handleAvatarUpload = (url: string) => {
    setState(prev => ({
      ...prev,
      playerStats: {
        ...prev.playerStats,
        avatarUrl: url
      }
    }));
    addSystemLog('Profile photo Awakened and verified successfully on system server.');
  };

  // Add custom user-created objective
  const handleAddTask = (newTask: Omit<Task, 'id'>) => {
    const newId = `custom_${newTask.name.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`;
    const taskWithId: Task = {
      ...newTask,
      id: newId
    };

    setState(prev => ({
      ...prev,
      tasks: [...prev.tasks, taskWithId],
      notifications: [
        `SYSTEM: Registered new custom quest: "${taskWithId.name}". Reward: +${taskWithId.points} XP per ${taskWithId.unit}.`,
        ...(prev.notifications || [])
      ].slice(0, 50)
    }));
  };

  // Delete custom user-created objective
  const handleDeleteTask = (taskId: string) => {
    setState(prev => {
      const filteredTasks = prev.tasks.filter(t => t.id !== taskId);
      // Clean up scores for this deleted task
      const updatedScores = { ...prev.scores };
      Object.keys(updatedScores).forEach(week => {
        Object.keys(updatedScores[week]).forEach(day => {
          delete updatedScores[week][Number(day)][taskId];
        });
      });

      return {
        ...prev,
        tasks: filteredTasks,
        scores: updatedScores,
        notifications: [
          'SYSTEM: Objective deleted successfully from database.',
          ...(prev.notifications || [])
        ].slice(0, 50)
      };
    });
  };

  // Complete/toggle Weekly Penalty status
  const handleTogglePenaltyCompleted = () => {
    setState(prev => {
      const updatedTargets = prev.weeklyTargets.map(w => {
        if (w.id === prev.currentWeekId) {
          const newState = !w.penaltyCompleted;
          
          // Reward them for completing the penalty
          let updatedStats = { ...prev.playerStats };
          if (newState) {
            updatedStats.gold += 50; // Credited 50 Gold for push-ups/workout penalty completion
            updatedStats.xp = Math.min(prev.playerStats.maxXp - 1, prev.playerStats.xp + 30); // Credited some XP
          }

          return { ...w, penaltyCompleted: newState };
        }
        return w;
      });

      const currentWeek = prev.weeklyTargets.find(w => w.id === prev.currentWeekId);
      const isCompleting = currentWeek ? !currentWeek.penaltyCompleted : false;

      return {
        ...prev,
        weeklyTargets: updatedTargets,
        notifications: [
          isCompleting
            ? `SYSTEM: Penalty Quest executed! +50 Gold and +30 XP credited. Status: Restored.`
            : `SYSTEM: Penalty Quest status reverted to Unfinished. Status: Flagged.`,
          ...(prev.notifications || [])
        ].slice(0, 50)
      };
    });
  };

  // Unlock & open Monthly Mystery Chest
  const handleOpenMonthlyChest = () => {
    setShowLootBox(true);
  };

  // Callback when a Loot Chest is fully decoded & opened
  const handleClaimLoot = (claimedItem: InventoryItem) => {
    setState(prev => {
      // Mark July Monthly Gift as opened
      const updatedGifts = prev.monthlyGifts.map(g => {
        if (g.id === '2026-07') {
          return { ...g, isOpened: true, rewardItem: claimedItem };
        }
        return g;
      });

      return {
        ...prev,
        inventory: [claimedItem, ...prev.inventory],
        monthlyGifts: updatedGifts,
        notifications: [
          `SYSTEM: Unlocked legendary loot container. Claimed "${claimedItem.name}".`,
          `SYSTEM: Artifact has been safely stored inside your Hunter Inventory.`,
          ...(prev.notifications || [])
        ].slice(0, 50)
      };
    });
    setShowLootBox(false);
  };

  // Consume / Use an inventory item
  const handleUseItem = (itemId: string) => {
    const item = state.inventory.find(i => i.id === itemId);
    if (!item) return;

    // Level requirement block check
    if (item.requiredLevel !== undefined && state.playerStats.level < item.requiredLevel) {
      alert(`System Lock: Requires Level ${item.requiredLevel} to activate "${item.name}". Accumulate more XP to level up!`);
      return;
    }

    // Trigger cool specific visual status effects based on the item used!
    let statusEffectLog = '';
    let updatedStats = { ...state.playerStats };

    if (item.name.includes("Demon King's Shortsword")) {
      statusEffectLog = 'Equipped blade. Active: +5 Intelligence buff enabled (Boosts your focus on coding!).';
      updatedStats.intelligence += 5;
      setActiveEffect("Demon King's Shortsword Active: +5 INT");
    } else if (item.name.includes("Kamish's Wrath")) {
      statusEffectLog = "Kamish's Wrath activated! Physical workout fatigue fully cleared (Go have an ice-cold stretch).";
      updatedStats.strength += 3;
      setActiveEffect("Kamish's Wrath Active: +3 STR");
    } else if (item.name.includes("Shadow Monarch Crown")) {
      statusEffectLog = 'Shadow Monarch Crown used. Action: Granted 2 hours of guilt-free video gaming today. Enjoy!';
      setActiveEffect("Crown of Monarchs Active: No Gaming Penalty for today!");
    } else if (item.name.includes("Ruler's Authority")) {
      statusEffectLog = 'Ruler\'s Authority Scroll decoded. Action: Claim a delicious Cheat Meal tonight as your real-world reward!';
      setActiveEffect("Ruler's Authority active: Redeem 1x Cheat Meal Coupon");
    } else if (item.name.includes("Espresso Shot")) {
      statusEffectLog = 'Brewed premium black Espresso. Action: Focused mind fatigue resolved. +1 Intelligence registered.';
      updatedStats.intelligence += 1;
    } else if (item.name.includes("Hydration Elixir")) {
      statusEffectLog = 'Drank cold water hydration elixir. Action: Purged blood toxins. +1 Vitality registered.';
      updatedStats.vitality += 1;
    } else if (item.name.includes("Weighted Vest")) {
      statusEffectLog = 'Equipped Vanguard\'s Weighted Vest. Action: Bodyweight circuit complete. +1 Strength and +1 Vitality registered.';
      updatedStats.strength += 1;
      updatedStats.vitality += 1;
    } else if (item.name.includes("Scroll of Absolute Focus")) {
      statusEffectLog = 'Scroll of Absolute Focus decoded. Action: Muted cellular notifications. +2 Intelligence registered.';
      updatedStats.intelligence += 2;
      setActiveEffect("Absolute Focus: +2 INT");
    } else if (item.name.includes("Sneakers")) {
      statusEffectLog = 'Laced up Aether Wind Sneakers. Action: Run complete. +2 Agility registered. Movement speed enhanced.';
      updatedStats.agility += 2;
    } else if (item.name.includes("Titan")) {
      statusEffectLog = 'Tightened Belt of the Titan. Action: 100 Squats completed. +3 Strength and +2 Vitality registered.';
      updatedStats.strength += 3;
      updatedStats.vitality += 2;
    } else if (item.name.includes("Hourglass")) {
      statusEffectLog = 'Rotated Chronos Focus Hourglass. Action: temporal awareness dilated. +4 Sense and +2 Intelligence registered.';
      updatedStats.sense += 4;
      updatedStats.intelligence += 2;
      setActiveEffect("Temporal Perception: +4 SEN");
    } else if (item.name.includes("Potion")) {
      statusEffectLog = 'Drank Healing Potion. Remonition: Stand up, stretch, and drink a tall glass of ice-cold water!';
      updatedStats.vitality += 2;
    } else {
      statusEffectLog = 'Artifact activated. Buff registered on system.';
    }

    // Delete single-use items, keep permanent equipment
    const isSingleUse = item.name.includes("Potion") || 
                        item.name.includes("Scroll") || 
                        item.name.includes("Key") || 
                        item.name.includes("Espresso") || 
                        item.name.includes("Elixir") || 
                        item.name.includes("Sneakers") || 
                        item.name.includes("Hourglass");

    setState(prev => {
      const filteredInventory = isSingleUse
        ? prev.inventory.filter(i => i.id !== itemId)
        : prev.inventory;

      return {
        ...prev,
        playerStats: updatedStats,
        inventory: filteredInventory,
        notifications: [
          `SYSTEM: Activated artifact "${item.name}".`,
          `SYSTEM: ${statusEffectLog}`,
          ...(prev.notifications || [])
        ].slice(0, 50)
      };
    });
  };

  const handleDeleteItem = (itemId: string) => {
    setState(prev => ({
      ...prev,
      inventory: prev.inventory.filter(i => i.id !== itemId),
      notifications: [
        'SYSTEM: Discarded item from inventory.',
        ...(prev.notifications || [])
      ].slice(0, 50)
    }));
  };

  // Reset all application state to initial values
  const handleNukeAllData = () => {
    if (window.confirm('Are you sure you want to nuke all tracker logs and reset to Level 1? All data will be wiped.')) {
      localStorage.removeItem('solo_leveling_state');
      window.location.reload();
    }
  };

  // Selected Day & Week models
  const currentWeekObj = state.weeklyTargets.find(w => w.id === state.currentWeekId) || state.weeklyTargets[0];
  const activeDayScores = state.scores[state.currentWeekId]?.[state.currentDayIndex] || {};

  // Find active penalty: A penalty is active if they are on a week where they failed to meet the target
  // E.g., Week of July 4th: Target 290, they earned 124. This is a failed week, so penalty is active!
  const isPenaltyActiveForWeek = (weekId: string) => {
    const target = state.weeklyTargets.find(w => w.id === weekId);
    if (!target) return false;
    
    // Find the real-time calendar current week ending Saturday
    const now = new Date();
    const dayIndex = now.getDay();
    const sat = new Date(now);
    const diff = 6 - dayIndex;
    sat.setDate(now.getDate() + diff);
    const realCurrentWeekId = sat.toISOString().split('T')[0];

    // If it is a past week and they didn't hit target, penalty is active
    if (weekId < realCurrentWeekId) {
      const earned = weekId === state.currentWeekId ? activeWeeklyTotal : (target.totalPointsEarned || 0);
      return earned < target.targetPoints;
    }
    
    // For current week, let's say penalty is active if they are in the negative or if they explicitly want to view/complete it
    return activeWeeklyTotal < 0;
  };

  const activePenaltyForWeek = isPenaltyActiveForWeek(state.currentWeekId) ? currentWeekObj.penalty : null;
  const isCurrentPenaltyCompleted = currentWeekObj.penaltyCompleted;

  // Let's check July gift lock status
  const isJulyClean = state.weeklyTargets
    .filter(w => w.id.startsWith('2026-07'))
    .every(w => {
      const earned = w.id === state.currentWeekId ? activeWeeklyTotal : (w.totalPointsEarned || 0);
      const metTarget = earned >= w.targetPoints;
      return metTarget || w.penaltyCompleted;
    });

  const activeJulyGift = state.monthlyGifts.find(g => g.id === '2026-07') || { id: '2026-07', label: 'July 2026 Legendary Reward', isUnlocked: isJulyClean, isOpened: false };

  return (
    <div
      id="root-theme-wrapper"
      className="min-h-screen bg-slate-950 text-slate-100 font-sans hologram-grid relative pb-12 overflow-x-hidden selection:bg-cyan-500 selection:text-slate-950"
    >
      {/* 0. Accountability System Lockout Screen Overlay */}
      {state.isSystemLocked && (
        <div className="fixed inset-0 z-[9999] bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center overflow-y-auto">
          <div className="max-w-md w-full border border-rose-500/50 bg-rose-950/20 p-8 rounded-lg shadow-[0_0_35px_rgba(239,68,68,0.25)] relative overflow-hidden space-y-6">
            <div className="scanline absolute inset-0 pointer-events-none" />
            
            <div className="flex flex-col items-center gap-3">
              <div className="h-16 w-16 rounded bg-rose-950/80 border border-rose-500 flex items-center justify-center animate-pulse">
                <Skull className="h-10 w-10 text-rose-500" />
              </div>
              <p className="font-mono text-xs text-rose-500 font-bold tracking-widest uppercase">
                EMERGENCY ALERT: DEFECTOR PROTOCOL
              </p>
              <h2 className="text-2xl font-light text-white uppercase tracking-tight font-sans">
                SYSTEM LOCKED
              </h2>
            </div>

            <div className="space-y-2 border-t border-b border-rose-950 py-4 font-mono text-[11px] text-left text-slate-400">
              <div className="flex justify-between">
                <span>HUNTER STATUS:</span>
                <span className="text-rose-400 font-bold">PENALTY DEFECTOR</span>
              </div>
              <div className="flex justify-between">
                <span>VIOLATION DETECTED:</span>
                <span className="text-rose-400 font-bold">FAILED PENALTIES &gt; 2 WEEKS</span>
              </div>
              <div className="flex justify-between">
                <span>SECURITY CLEARANCE:</span>
                <span className="text-rose-500 font-bold">REVOKED</span>
              </div>
            </div>

            <div className="text-xs text-slate-300 leading-relaxed font-light text-center">
              The System has locked all progress tracking, inventory systems, and specialty grids. 
              To regain clearances, you must perform the physical <strong className="text-cyan-400 font-mono">Restoration Ritual</strong>:
              <br />
              <span className="block mt-2 font-mono font-bold text-amber-400 uppercase">
                Perform 100 Squats or 100 Push-ups immediately
              </span>
            </div>

            <button
              onClick={handleExecuteRestoration}
              className="w-full bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs font-bold py-3.5 px-6 rounded uppercase transition-all shadow-[0_0_15px_rgba(239,68,68,0.3)] active:scale-95 cursor-pointer"
            >
              EXECUTE RESTORATION RITUAL (RESTORE ACCESS)
            </button>
          </div>
        </div>
      )}

      {/* Absolute visual scanlines and ambient layout lighting */}
      <div className="absolute top-0 left-0 right-0 h-[600px] bg-gradient-to-b from-cyan-950/10 via-transparent to-transparent pointer-events-none" />
      <div className="absolute top-1/4 -left-48 w-96 h-96 bg-cyan-500/5 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-blue-500/5 blur-3xl rounded-full pointer-events-none" />

      {/* Navigation & Brand Header */}
      <header
        id="app-nav-header"
        className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40"
      >
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-wrap items-end justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center rounded bg-slate-900 border border-slate-800">
              <Swords className="h-5 w-5 text-cyan-400 animate-pulse" />
            </div>
            <div className="space-y-0.5">
              <p className="text-cyan-400 text-[10px] font-bold tracking-widest uppercase font-mono">
                The System: Player Interface
              </p>
              <h1 className="text-2xl font-light tracking-tight text-white uppercase font-sans">
                SOLO LEVELING
              </h1>
            </div>
          </div>

          {/* Active status effect banner */}
          {activeEffect && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-amber-950/20 border border-amber-900/40 text-amber-300 font-mono text-[10px] py-1 px-3 rounded flex items-center gap-1.5"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-400 animate-spin" />
              <span>{activeEffect}</span>
            </motion.div>
          )}

          {/* Tab selection & utility actions */}
          <div className="flex items-center gap-2 sm:gap-3 w-full lg:w-auto justify-between lg:justify-end">
            <button
              onClick={() => setActiveTab('tracker')}
              className={`flex-1 lg:flex-none text-center font-mono text-[10px] sm:text-xs font-bold px-2 sm:px-4 py-2 rounded transition-all cursor-pointer border ${
                activeTab === 'tracker'
                  ? 'bg-cyan-950/30 text-cyan-400 border-cyan-500/50 shadow-[0_0_8px_rgba(34,211,238,0.2)]'
                  : 'bg-slate-900/60 text-slate-500 border-slate-800 hover:text-slate-300'
              }`}
            >
              SYSTEM TRACKER
            </button>
            <button
              onClick={() => setActiveTab('inventory')}
              className={`flex-1 lg:flex-none text-center font-mono text-[10px] sm:text-xs font-bold px-2 sm:px-4 py-2 rounded transition-all cursor-pointer border ${
                activeTab === 'inventory'
                  ? 'bg-cyan-950/30 text-cyan-400 border-cyan-500/50 shadow-[0_0_8px_rgba(34,211,238,0.2)]'
                  : 'bg-slate-900/60 text-slate-500 border-slate-800 hover:text-slate-300'
              }`}
            >
              INVENTORY
            </button>
            <button
              onClick={() => setActiveTab('portal')}
              className={`flex-1 lg:flex-none text-center font-mono text-[10px] sm:text-xs font-bold px-2 sm:px-4 py-2 rounded transition-all cursor-pointer border ${
                activeTab === 'portal'
                  ? 'bg-cyan-950/30 text-cyan-400 border-cyan-500/50 shadow-[0_0_8px_rgba(34,211,238,0.2)]'
                  : 'bg-slate-900/60 text-slate-500 border-slate-800 hover:text-slate-300'
              }`}
            >
              SYSTEM PORTAL
            </button>

            <button
              onClick={handleNukeAllData}
              className="p-2 text-slate-600 hover:text-red-400 rounded hover:bg-slate-900 transition-colors cursor-pointer"
              title="Wipe state database & start over from Level 1"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container Layout */}
      <main className="max-w-7xl mx-auto px-4 mt-8">
        
        {/* Dynamic Warning Alert: if they have a penalty protocol active, show a scary header debuff warning! */}
        {activePenaltyForWeek && !isCurrentPenaltyCompleted && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 border border-rose-900/50 bg-rose-950/10 rounded p-4 flex flex-col sm:flex-row items-center gap-4 text-rose-400"
          >
            <AlertTriangle className="h-10 w-10 text-rose-500 flex-shrink-0 animate-pulse" />
            <div className="text-center sm:text-left flex-grow">
              <h3 className="font-mono font-bold text-xs uppercase tracking-widest text-rose-500">
                WARNING: PENALTY QUEST ACTIVE (DEBUFF DETECTED)
              </h3>
              <p className="font-sans text-xs text-rose-200/70 mt-1 leading-snug">
                You failed to secure the {currentWeekObj.label} target of {currentWeekObj.targetPoints} XP. 
                Complete your active physical penalty <strong className="text-rose-400 font-mono">"{currentWeekObj.penalty}"</strong> and mark it done inside the Quest Registry to lift the debuff!
              </p>
            </div>
            <button
              onClick={() => {
                const element = document.getElementById('quest-registry-container') || document.getElementById('mobile-quest-registry');
                element?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="bg-rose-950/40 text-rose-400 border border-rose-500/30 hover:bg-rose-500 hover:text-slate-950 font-mono font-bold text-xs uppercase px-4 py-2 rounded tracking-wider transition-all cursor-pointer"
            >
              VIEW PENALTY
            </button>
          </motion.div>
        )}


        {/* DESKTOP VIEW LAYOUT: Visible on large screens and up (lg:grid) */}
        <div className="hidden lg:grid grid-cols-12 gap-8 items-start">
          
          {/* LEFT SIDEBAR: Status Window (Takes 4 columns on large screens) */}
          <section className="lg:col-span-4 space-y-8">
            <StatusWindow
              stats={state.playerStats}
              onAllocateStat={handleAllocateStat}
              onResetStats={handleResetStats}
              onAvatarUpload={handleAvatarUpload}
            />

            {/* SYSTEM LOGGER CHAT / SYSTEM ACTIVITY FEED */}
            <div className="border border-slate-800 rounded bg-slate-950/40 p-5 font-mono text-xs">
              <h3 className="text-xs font-bold text-slate-400 tracking-widest uppercase border-l-2 border-cyan-500 pl-3 mb-4 flex items-center justify-between">
                <span>SYSTEM NOTIFICATION FEED</span>
                <span className="text-[10px] text-slate-600 font-mono">Max 50</span>
              </h3>
              <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                {systemLogs.map((log, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`py-1 border-b border-slate-900/30 text-[11px] leading-relaxed ${
                      log.includes('LEVEL UP') || log.includes('GIFT')
                        ? 'text-yellow-400 font-bold'
                        : log.includes('Penalty') || log.includes('Cigarette') || log.includes('debuff')
                          ? 'text-red-400'
                          : log.includes('custom')
                            ? 'text-purple-400'
                            : 'text-slate-400'
                    }`}
                  >
                    {log}
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* MAIN CONTENT AREA: Logger or Inventory (Takes 8 columns on large screens) */}
          <section className="lg:col-span-8 space-y-8">
            {activeTab === 'tracker' ? (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                
                {/* Logger Core (Takes 7 columns on medium screens) */}
                <div className="md:col-span-7 lg:col-span-7">
                  <DailyLogger
                    tasks={state.tasks}
                    scores={activeDayScores}
                    selectedDayIndex={state.currentDayIndex}
                    selectedWeekLabel={currentWeekObj.label}
                    onUpdateScore={handleUpdateScore}
                    onDaySelect={(idx) => setState(prev => ({ ...prev, currentDayIndex: idx }))}
                    onAddTask={handleAddTask}
                    onDeleteTask={handleDeleteTask}
                    playerStats={state.playerStats}
                  />
                </div>

                {/* Quest Registry (Takes 5 columns on medium screens) */}
                <div className="md:col-span-5 lg:col-span-5">
                  <QuestRegistry
                    weeklyTargets={state.weeklyTargets}
                    currentWeekId={state.currentWeekId}
                    onWeekSelect={(id) => setState(prev => ({ ...prev, currentWeekId: id }))}
                    weeklyTotalPoints={activeWeeklyTotal}
                    activePenalty={activePenaltyForWeek}
                    penaltyCompleted={isCurrentPenaltyCompleted}
                    onTogglePenaltyCompleted={handleTogglePenaltyCompleted}
                    monthlyGift={activeJulyGift}
                    onOpenGift={handleOpenMonthlyChest}
                  />
                </div>

              </div>
            ) : activeTab === 'inventory' ? (
              <div className="grid grid-cols-1 gap-8">
                <Inventory
                  inventory={state.inventory}
                  playerLevel={state.playerStats.level}
                  onUseItem={handleUseItem}
                  onDeleteItem={handleDeleteItem}
                />
              </div>
            ) : (
              <PortalSystem
                state={state}
                setState={setState}
                addSystemLog={addSystemLog}
              />
            )}
          </section>

        </div>


        {/* MOBILE & TABLET RESPONSIVE VIEW: Visible on small and medium screens (hidden on lg and up) */}
        {/* Shows: Status window (collapsible/expandable) -> Quest Registry (penalty flashing) -> Daily quests -> Logs/Notifications */}
        <div className="flex flex-col lg:hidden space-y-6">
          
          {/* 1. Status Window (Minified/Expandable by default) */}
          <StatusWindow
            stats={state.playerStats}
            onAllocateStat={handleAllocateStat}
            onResetStats={handleResetStats}
            onAvatarUpload={handleAvatarUpload}
          />

          {activeTab === 'tracker' ? (
            <>
              {/* 2. Quest Registry (Flashes penalty red if active and incomplete) */}
              <div 
                id="mobile-quest-registry" 
                className={`transition-all rounded overflow-hidden ${
                  activePenaltyForWeek && !isCurrentPenaltyCompleted 
                    ? 'animate-pulse ring-2 ring-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.4)]' 
                    : ''
                }`}
              >
                <QuestRegistry
                  weeklyTargets={state.weeklyTargets}
                  currentWeekId={state.currentWeekId}
                  onWeekSelect={(id) => setState(prev => ({ ...prev, currentWeekId: id }))}
                  weeklyTotalPoints={activeWeeklyTotal}
                  activePenalty={activePenaltyForWeek}
                  penaltyCompleted={isCurrentPenaltyCompleted}
                  onTogglePenaltyCompleted={handleTogglePenaltyCompleted}
                  monthlyGift={activeJulyGift}
                  onOpenGift={handleOpenMonthlyChest}
                />
              </div>

              {/* 3. Daily Quests (Daily Logger) */}
              <DailyLogger
                tasks={state.tasks}
                scores={activeDayScores}
                selectedDayIndex={state.currentDayIndex}
                selectedWeekLabel={currentWeekObj.label}
                onUpdateScore={handleUpdateScore}
                onDaySelect={(idx) => setState(prev => ({ ...prev, currentDayIndex: idx }))}
                onAddTask={handleAddTask}
                onDeleteTask={handleDeleteTask}
                playerStats={state.playerStats}
              />
            </>
          ) : activeTab === 'inventory' ? (
            <>
              {/* 2. Inventory */}
              <Inventory
                inventory={state.inventory}
                playerLevel={state.playerStats.level}
                onUseItem={handleUseItem}
                onDeleteItem={handleDeleteItem}
              />
            </>
          ) : (
            <PortalSystem
              state={state}
              setState={setState}
              addSystemLog={addSystemLog}
            />
          )}

          {/* 4. Notification feed logs (Placed at the bottom for Clean Minimalism) */}
          <div className="border border-slate-800 rounded bg-slate-950/40 p-5 font-mono text-xs">
            <h3 className="text-xs font-bold text-slate-400 tracking-widest uppercase border-l-2 border-cyan-500 pl-3 mb-4 flex items-center justify-between">
              <span>SYSTEM NOTIFICATION FEED</span>
              <span className="text-[10px] text-slate-600 font-mono">Max 50</span>
            </h3>
            <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
              {systemLogs.map((log, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`py-1 border-b border-slate-900/30 text-[11px] leading-relaxed ${
                    log.includes('LEVEL UP') || log.includes('GIFT')
                      ? 'text-yellow-400 font-bold'
                      : log.includes('Penalty') || log.includes('Cigarette') || log.includes('debuff')
                        ? 'text-red-400'
                        : log.includes('custom')
                          ? 'text-purple-400'
                          : 'text-slate-400'
                  }`}
                >
                  {log}
                </motion.div>
              ))}
            </div>
          </div>

        </div>

        {/* System Footer aligned with Clean Minimalism */}
        <footer className="mt-16 pt-6 border-t border-slate-900 flex justify-between items-center pb-8">
          <div className="flex gap-4">
            <span className="text-[9px] uppercase tracking-widest text-slate-600 font-mono">Server: KR-01</span>
            <span className="text-[9px] uppercase tracking-widest text-slate-600 font-mono">Uptime: 432h</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse"></div>
            <span className="text-[9px] uppercase tracking-widest text-cyan-500/80 font-bold font-mono">System Synchronized</span>
          </div>
        </footer>
      </main>

      {/* MODALS / OVERLAYS */}
      <LevelUpModal
        isOpen={showLevelUp}
        level={state.playerStats.level}
        onClose={() => setShowLevelUp(false)}
      />

      <LootBoxModal
        isOpen={showLootBox}
        onClose={handleClaimLoot}
      />

      {/* Onboarding / Awakening Name Modal */}
      {state.playerStats.isNewUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 backdrop-blur-md">
          <div className="scanline absolute inset-0 pointer-events-none" />
          <div className="absolute inset-0 hologram-grid opacity-10 pointer-events-none" />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="max-w-md w-full rounded bg-slate-950 p-8 border border-slate-800 text-center relative overflow-hidden"
          >
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-cyan-500/5 blur-3xl rounded-full" />
            
            <div className="flex justify-center mb-6 text-cyan-400">
              <div className="relative rounded bg-slate-900/60 p-6 border border-slate-800">
                <Shield className="h-16 w-16 text-cyan-500 animate-pulse" />
              </div>
            </div>

            <h2 className="font-mono text-xl font-bold text-slate-200 tracking-wider uppercase">
              S-RANK IDENTIFICATION REQUIRED
            </h2>
            <p className="font-mono mt-2 text-[10px] text-slate-500 uppercase tracking-widest leading-relaxed">
              The System is searching for your soul frequency. Enter your name to awaken as an active player.
            </p>

            <form onSubmit={(e) => {
              e.preventDefault();
              const input = (e.currentTarget.elements.namedItem('username') as HTMLInputElement).value.trim();
              if (!input) return;
              
              setState(prev => ({
                ...prev,
                playerStats: {
                  ...prev.playerStats,
                  name: input,
                  isNewUser: false
                },
                notifications: [
                  `SYSTEM: HUNTER AWAKENED! Welcome, ${input}. Let the Leveling begin!`,
                  ...(prev.notifications || [])
                ]
              }));
            }} className="mt-6 space-y-4">
              <input
                name="username"
                type="text"
                required
                placeholder="ENTER YOUR NAME..."
                maxLength={25}
                className="w-full text-center bg-slate-900 border border-slate-800 rounded py-3 font-mono text-sm tracking-widest text-slate-200 focus:outline-none focus:border-cyan-500 uppercase"
                autoFocus
              />

              <button
                type="submit"
                className="w-full rounded bg-cyan-500 hover:bg-cyan-400 py-3 font-mono text-xs font-bold uppercase tracking-wider text-slate-950 transition-all cursor-pointer"
              >
                CONFIRM AWAKENING
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
