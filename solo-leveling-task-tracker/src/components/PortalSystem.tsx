import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Skull, 
  Flame, 
  Compass, 
  Sparkles, 
  Coins, 
  CheckCircle, 
  XCircle, 
  Shield, 
  Zap, 
  UserCheck, 
  Plus, 
  HelpCircle,
  AlertOctagon,
  Wand2
} from 'lucide-react';
import { AppState, PlayerStats, InventoryItem, ShadowSoldier, RedGateRaid } from '../types';

interface PortalSystemProps {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  addSystemLog: (msg: string) => void;
}

const AVAILABLE_CLASSES = [
  {
    id: 'Shadow Monarch',
    title: 'Shadow Monarch (Necromancer)',
    icon: Skull,
    color: 'text-purple-400 border-purple-500/30 bg-purple-950/10',
    hoverColor: 'group-hover:border-purple-500/60',
    glowColor: 'shadow-purple-500/20',
    description: 'Master of death. High-yield Shadow extraction rate (+35% success), and grants passive bonuses to mystical attributes.',
    perks: 'Passive +4 Intelligence, +2 Sense. Extracted Shadows gain +1 buff effectiveness.'
  },
  {
    id: 'Vanguard',
    title: 'Vanguard (Fighter/Tank)',
    icon: Shield,
    color: 'text-red-400 border-red-500/30 bg-red-950/10',
    hoverColor: 'group-hover:border-red-500/60',
    glowColor: 'shadow-red-500/20',
    description: 'Frontline iron vanguard. Physical physical achievements boost strength limits faster.',
    perks: 'Workout (+STR) and Clean Room (+VIT) tasks yield +25% bonus points. Passive +3 Strength, +3 Vitality.'
  },
  {
    id: 'Aether Swift',
    title: 'Aether Swift (Assassin/Speed)',
    icon: Zap,
    color: 'text-cyan-400 border-cyan-500/30 bg-cyan-950/10',
    hoverColor: 'group-hover:border-cyan-500/60',
    glowColor: 'shadow-cyan-500/20',
    description: 'Wind-like speedster. Hyperfocus on high-speed and stamina burning cardio routines.',
    perks: 'Cardio (+AGI) and Yoga (+SEN) yield +30% bonus points. Passive +4 Agility.'
  },
  {
    id: 'Arcane Focus',
    title: 'Arcane Focus (Mage/Scholar)',
    icon: Wand2,
    color: 'text-blue-400 border-blue-500/30 bg-blue-950/10',
    hoverColor: 'group-hover:border-blue-500/60',
    glowColor: 'shadow-blue-500/20',
    description: 'Mental magician. Drastically amplifies productivity when designing code, reading textbooks, or solving CTFs.',
    perks: 'Self Study, Coding, and CTF (+INT) yield +25% bonus points. Passive +4 Intelligence.'
  }
];

const RED_GATE_DUNGEONS = [
  {
    name: 'Snowy Mountain Escape',
    boss: 'Baruka (Ice Elf Clan Leader)',
    difficulty: 'A-Rank' as const,
    description: 'Blizzard storm blocks system egress. Maintain intense physically active stamina or freeze.',
    taskName: 'Workout or Cardio',
    taskId: 'workout', // or cardio
    targetCount: 1.5,
    rewardItemName: 'Baruka\'s Dagger (Epic)'
  },
  {
    name: 'Demon Castle Upper Floors',
    boss: 'Baran (Demon King)',
    difficulty: 'S-Rank' as const,
    description: 'Ascend the final level of the lightning tower. Complete extreme study thresholds.',
    taskName: 'Coding, CTF or Self Study',
    taskId: 'coding',
    targetCount: 2.0,
    rewardItemName: 'Demon King\'s Shortsword (Legendary)'
  },
  {
    name: 'Double Dungeon Chamber',
    boss: 'The Architect (Statue Creator)',
    difficulty: 'S-Rank' as const,
    description: 'Survival trial. Sit completely still and find inner focus through meditation.',
    taskName: 'Yoga or Meditation',
    taskId: 'meditation',
    targetCount: 1.0,
    rewardItemName: 'Ruler\'s Authority Ring (Legendary)'
  },
  {
    name: 'Orc Territory Outpost',
    boss: 'Kargalgan (High Orc Shaman)',
    difficulty: 'B-Rank' as const,
    description: 'Ancient spell wards block the exits. Complete core study objectives to break the runes.',
    taskName: 'Self Study',
    taskId: 'self_study',
    targetCount: 1.0,
    rewardItemName: 'High Orc Spellstone (Rare)'
  },
  {
    name: 'Desert Oasis Ruins',
    boss: 'Giant Centipede Monarch',
    difficulty: 'C-Rank' as const,
    description: 'Wasteland dungeon. De-clutter and clean your space physically to secure the oasis.',
    taskName: 'Clean Room',
    taskId: 'clean_room',
    targetCount: 1.0,
    rewardItemName: 'Oasis Water Elixir (Common)'
  }
];

const SHADOW_POOL = [
  { name: 'Igris (The Bloodred Commander)', rank: 'Elite Knight' as const, passiveStat: 'strength' as const, buffValue: 3, desc: 'Quiet, honorable swordsman. Passive +3 Strength.' },
  { name: 'Beru (The Shadow Ant King)', rank: 'Commander' as const, passiveStat: 'vitality' as const, buffValue: 4, desc: 'Hyperactive, fiercely loyal general. Passive +4 Vitality.' },
  { name: 'Tusk (The High Orc Shaman)', rank: 'Knight' as const, passiveStat: 'intelligence' as const, buffValue: 3, desc: 'A colossal shadow mage carrying a magical orb. Passive +3 Intelligence.' },
  { name: 'Iron (The Clumsy Heavy Tank)', rank: 'Elite' as const, passiveStat: 'vitality' as const, buffValue: 2, desc: 'Humorous, axe-wielding giant heavy shield shield. Passive +2 Vitality.' },
  { name: 'Tank (The Shadow Ice Bear)', rank: 'Elite' as const, passiveStat: 'strength' as const, buffValue: 2, desc: 'Roaring frost bear mount. Passive +2 Strength.' },
  { name: 'Kaisel (The Wyvern Shadow)', rank: 'Knight' as const, passiveStat: 'agility' as const, buffValue: 3, desc: 'Majestic purple flying drake. Passive +3 Agility.' },
];

export default function PortalSystem({ state, setState, addSystemLog }: PortalSystemProps) {
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [isScanning, setIsScanning] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionResult, setExtractionResult] = useState<{ success: boolean; message: string; shadow?: ShadowSoldier } | null>(null);

  // Helper: check current today's completion count for Red Gate task
  const getTodayTaskProgress = (taskId: string) => {
    const todayScores = state.scores[state.currentWeekId]?.[state.currentDayIndex] || {};
    // If the task is workout, maybe they did cardio or workout - we merge cardio/workout for Snowy Mountain A-Rank
    if (taskId === 'workout') {
      return (todayScores['workout'] || 0) + (todayScores['cardio'] || 0);
    }
    return todayScores[taskId] || 0;
  };

  // 1. SELECT CLASS SPECIALTY
  const handleSelectClass = (classId: string) => {
    if (state.playerStats.level < 5) {
      alert('SYSTEM ERROR: Your Hunter level is insufficient. Reach level 5 to initiate Awakening.');
      return;
    }
    
    setState(prev => {
      const selected = AVAILABLE_CLASSES.find(c => c.id === classId);
      if (!selected) return prev;

      // Apply passive buff immediately to base stats
      let updatedStats = { ...prev.playerStats, playerClass: classId };
      if (classId === 'Shadow Monarch') {
        updatedStats.intelligence += 4;
        updatedStats.sense += 2;
      } else if (classId === 'Vanguard') {
        updatedStats.strength += 3;
        updatedStats.vitality += 3;
      } else if (classId === 'Aether Swift') {
        updatedStats.agility += 4;
      } else if (classId === 'Arcane Focus') {
        updatedStats.intelligence += 4;
      }

      return {
        ...prev,
        playerStats: updatedStats,
        notifications: [
          `SYSTEM: Awakened Specialty Class Chosen: ${selected.title}!`,
          `SYSTEM: Passive perks applied: ${selected.perks}`,
          ...(prev.notifications || [])
        ].slice(0, 50)
      };
    });
    addSystemLog(`Chosen Class specialty: ${classId}. Attributes adjusted.`);
  };

  // 2. TRIGGER RED GATE EMERGENCY RAID
  const handleTriggerRedGate = () => {
    if (state.redGateRaid) {
      alert('SYSTEM NOTICE: A Red Gate is already open and trapping your sensor grids.');
      return;
    }

    setIsScanning(true);
    setTimeout(() => {
      // Pick random dungeon
      const randomDungeon = RED_GATE_DUNGEONS[Math.floor(Math.random() * RED_GATE_DUNGEONS.length)];
      const raidId = `raid_${Date.now()}`;
      
      const newRaid: RedGateRaid = {
        id: raidId,
        name: randomDungeon.name,
        boss: randomDungeon.boss,
        difficulty: randomDungeon.difficulty,
        description: randomDungeon.description,
        requiredTaskName: randomDungeon.taskName,
        requiredTaskId: randomDungeon.taskId,
        targetCount: randomDungeon.targetCount,
        currentCount: 0, // checked dynamically
        rewardXp: randomDungeon.difficulty === 'S-Rank' ? 400 : randomDungeon.difficulty === 'A-Rank' ? 250 : 150,
        rewardGold: randomDungeon.difficulty === 'S-Rank' ? 300 : randomDungeon.difficulty === 'A-Rank' ? 200 : 100,
        rewardItemName: randomDungeon.rewardItemName,
        status: 'active'
      };

      setState(prev => ({
        ...prev,
        redGateRaid: newRaid,
        notifications: [
          `⚠️ WARNING: RED GATE EMERGENCY RAID DETECTED!`,
          `⚠️ BOSS: ${newRaid.boss} (${newRaid.difficulty}) has trapped the server!`,
          `⚠️ REQUIREMENT: Complete ${newRaid.targetCount} units of "${newRaid.requiredTaskName}" today to escape!`,
          ...(prev.notifications || [])
        ].slice(0, 50)
      }));

      setIsScanning(false);
      addSystemLog(`ALERT: Opened Red Gate "${newRaid.name}" - Defeat ${newRaid.boss}!`);
    }, 1500);
  };

  // 3. CLAIM RAID SUCCESS
  const handleClaimRaidSuccess = () => {
    const raid = state.redGateRaid;
    if (!raid || raid.status !== 'active') return;

    const progress = getTodayTaskProgress(raid.requiredTaskId);
    if (progress < raid.targetCount) {
      alert('SYSTEM ERROR: Dungeon seal is still intact. Defeat the target requirement first!');
      return;
    }

    // Grant rewards
    setState(prev => {
      // Create loot item
      const lootId = `loot_${Date.now()}`;
      const rarity = raid.difficulty === 'S-Rank' ? 'Legendary' as const : raid.difficulty === 'A-Rank' ? 'Epic' as const : 'Rare' as const;
      const lootItem: InventoryItem = {
        id: lootId,
        name: raid.rewardItemName,
        rarity: rarity,
        description: `Awakened weapon claimed from defeating ${raid.boss} inside the Red Gate. Boosts stats significantly!`,
        iconName: 'sword',
        dateObtained: new Date().toISOString().split('T')[0],
        requiredLevel: raid.difficulty === 'S-Rank' ? 4 : 2
      };

      // Add rewards
      let updatedStats = { ...prev.playerStats };
      updatedStats.gold += raid.rewardGold;
      
      // XP & potential level-up
      let currentXp = updatedStats.xp + raid.rewardXp;
      let totalXp = (updatedStats.totalXp || 0) + raid.rewardXp;
      let level = updatedStats.level;
      let maxXp = updatedStats.maxXp;
      let statPoints = updatedStats.statPoints;

      if (currentXp >= maxXp) {
        level += 1;
        currentXp = currentXp - maxXp;
        maxXp = level * 100;
        statPoints += 5;
        updatedStats.gold += 100;
      }

      updatedStats.xp = currentXp;
      updatedStats.totalXp = totalXp;
      updatedStats.level = level;
      updatedStats.maxXp = maxXp;
      updatedStats.statPoints = statPoints;

      return {
        ...prev,
        playerStats: updatedStats,
        inventory: [lootItem, ...prev.inventory],
        redGateRaid: { ...raid, status: 'cleared' },
        notifications: [
          `🏆 RED GATE RAID CLEARED! DEFEATED ${raid.boss.toUpperCase()}!`,
          `🏆 REWARDS: +${raid.rewardXp} XP, +${raid.rewardGold} GOLD, and claimed "${raid.rewardItemName}"!`,
          `🏆 SYSTEM: Souldust harvested. You may now perform Shadow Extraction (Necromancy)!`,
          ...(prev.notifications || [])
        ].slice(0, 50)
      };
    });

    addSystemLog(`Cleared Red Gate: ${raid.name}. Souldust harvested.`);
  };

  // 4. FORFEIT RAID
  const handleForfeitRaid = () => {
    if (!window.confirm('Forfeit the Red Gate? Doing so will collapse the spatial rift but registers a failure log.')) return;
    
    setState(prev => ({
      ...prev,
      redGateRaid: null,
      notifications: [
        `SYSTEM: Spatial rift closed. Red Gate vanished. Status: Lost.`,
        ...(prev.notifications || [])
      ].slice(0, 50)
    }));
    addSystemLog('Forfeited Red Gate Emergency Raid.');
  };

  // 5. SHADOW EXTRACTION (ARISE!)
  const handleExtractShadow = () => {
    if (state.playerStats.gold < 150) {
      alert('SYSTEM LIMIT: Not enough Gold Tokens. Shadow Extraction requires 150 Gold Tokens to channel Necromancy.');
      return;
    }

    setIsExtracting(true);
    setExtractionResult(null);

    setTimeout(() => {
      // Determine success rate: Base 50%, Shadow Monarch gets +35% (total 85%)
      const isMonarch = state.playerStats.playerClass === 'Shadow Monarch';
      const successChance = isMonarch ? 0.85 : 0.50;
      const roll = Math.random();

      if (roll <= successChance) {
        // Pick a shadow that we don't already have, or if we have all, pick a random one
        const currentArmyNames = (state.shadowArmy || []).map(s => s.name.split(' (')[0]);
        const availablePool = SHADOW_POOL.filter(s => !currentArmyNames.includes(s.name.split(' (')[0]));
        
        const shadowData = availablePool.length > 0 
          ? availablePool[Math.floor(Math.random() * availablePool.length)]
          : SHADOW_POOL[Math.floor(Math.random() * SHADOW_POOL.length)];

        // Shadow Monarch adds +1 value to buffs
        const finalBuffValue = isMonarch ? shadowData.buffValue + 1 : shadowData.buffValue;
        
        const newShadow: ShadowSoldier = {
          id: `shadow_${Date.now()}`,
          name: shadowData.name,
          rank: shadowData.rank,
          buffDescription: `Passive +${finalBuffValue} to ${shadowData.passiveStat.toUpperCase()}`,
          passiveStat: shadowData.passiveStat,
          buffValue: finalBuffValue
        };

        setState(prev => {
          let updatedStats = { ...prev.playerStats };
          updatedStats.gold -= 150;
          
          // Apply shadow stat buff directly to player stats!
          updatedStats[newShadow.passiveStat] += newShadow.buffValue;

          return {
            ...prev,
            playerStats: updatedStats,
            shadowArmy: [...(prev.shadowArmy || []), newShadow],
            notifications: [
              `🌌 ARISE! Extracted Shadow Soldier: ${newShadow.name}!`,
              `🌌 BUFF APPLIED: ${newShadow.buffDescription}!`,
              ...(prev.notifications || [])
            ].slice(0, 50)
          };
        });

        setExtractionResult({
          success: true,
          message: `The soul was successfully bound. Shadow "${newShadow.name.split(' (')[0]}" joins your monarch army!`,
          shadow: newShadow
        });
        addSystemLog(`Successfully extracted Shadow Soldier: ${newShadow.name}!`);
      } else {
        setState(prev => ({
          ...prev,
          playerStats: {
            ...prev.playerStats,
            gold: prev.playerStats.gold - 150
          },
          notifications: [
            `❌ EXTRACTION FAILED: The soul dissolved into souldust. (-150 Gold)`,
            ...(prev.notifications || [])
          ].slice(0, 50)
        }));

        setExtractionResult({
          success: false,
          message: 'The soul rejected your command and dissolved into black mist. Try again!'
        });
        addSystemLog(`Shadow extraction failed. Soul dissolved.`);
      }

      setIsExtracting(false);
    }, 2000);
  };

  // Active Raid variables
  const raid = state.redGateRaid;
  const progress = raid ? getTodayTaskProgress(raid.requiredTaskId) : 0;
  const isRaidCleared = raid ? progress >= raid.targetCount : false;

  return (
    <div id="portal-system-view" className="space-y-8 animate-fade-in">
      
      {/* 1. CLASS AWAKENING PANEL */}
      <section className="border border-slate-800 bg-slate-950/40 p-6 rounded backdrop-blur-sm relative overflow-hidden">
        <div className="scanline absolute inset-0 pointer-events-none" />
        <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 border-l-2 border-cyan-500 pl-3 mb-6">
          AWAKENED CLASS SPECIALTY
        </h2>

        {state.playerStats.level < 5 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center bg-slate-900/40 border border-slate-800 rounded">
            <AlertOctagon className="h-12 w-12 text-slate-600 mb-3 animate-pulse" />
            <h3 className="font-mono text-sm uppercase text-slate-400 font-bold">CLASS SELECTION LOCKED</h3>
            <p className="text-xs text-slate-500 max-w-md mt-2 font-light">
              Your neural power grid is too weak to choose a specialty class yet. 
              The System will grant specialty awakening options once you secure <strong className="text-cyan-400 font-mono">Hunter Level 5</strong> (Current: Level {state.playerStats.level}).
            </p>
          </div>
        ) : state.playerStats.playerClass ? (
          <div className="p-5 bg-gradient-to-r from-slate-900/80 to-slate-950/80 border border-cyan-500/35 rounded-lg flex flex-col md:flex-row items-center gap-6">
            <div className="h-16 w-16 rounded bg-cyan-950/40 border border-cyan-400/40 flex items-center justify-center shadow-[0_0_15px_rgba(34,211,238,0.2)]">
              {React.createElement(
                AVAILABLE_CLASSES.find(c => c.id === state.playerStats.playerClass)?.icon || Skull,
                { className: "h-8 w-8 text-cyan-400" }
              )}
            </div>
            <div className="space-y-1 text-center md:text-left flex-grow">
              <span className="font-mono text-[9px] text-cyan-400 border border-cyan-500/20 px-2 py-0.5 rounded bg-cyan-950/20 uppercase font-black tracking-widest">
                ACTIVE AWAKENING SPECIALTY
              </span>
              <h3 className="text-xl font-light text-white font-sans tracking-tight">
                {AVAILABLE_CLASSES.find(c => c.id === state.playerStats.playerClass)?.title}
              </h3>
              <p className="text-xs text-slate-400">
                {AVAILABLE_CLASSES.find(c => c.id === state.playerStats.playerClass)?.description}
              </p>
              <div className="pt-2 text-amber-400 font-mono text-[10px] uppercase font-bold flex items-center gap-1">
                <Sparkles className="h-3 w-3 animate-pulse" />
                ACTIVE PERK: {AVAILABLE_CLASSES.find(c => c.id === state.playerStats.playerClass)?.perks}
              </div>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-xs text-slate-400 mb-4 font-light leading-snug">
              You have secured enough mental energy to initiate your Specialty Selection. 
              Choose your path carefully — each specialty provides permanent passive boosts and specialized points bonuses:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {AVAILABLE_CLASSES.map(cls => {
                const Icon = cls.icon;
                return (
                  <div 
                    key={cls.id}
                    onClick={() => handleSelectClass(cls.id)}
                    className={`group border ${cls.color} ${cls.hoverColor} p-4 rounded cursor-pointer transition-all hover:scale-[1.01] hover:shadow-[0_0_15px_rgba(0,0,0,0.4)] flex flex-col justify-between`}
                  >
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <Icon className="h-5 w-5" />
                        <h4 className="font-mono text-xs uppercase font-bold tracking-wider text-white">
                          {cls.id}
                        </h4>
                      </div>
                      <p className="text-[11px] text-slate-400 mb-2 leading-relaxed">
                        {cls.description}
                      </p>
                    </div>
                    <div className="border-t border-slate-800/60 pt-2 text-[10px] text-amber-400 font-mono font-bold uppercase italic">
                      Perk: {cls.perks}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* 2. THE RED GATE EMERGENCY RAID PANEL */}
      <section className="border border-slate-800 bg-slate-950/40 p-6 rounded backdrop-blur-sm relative overflow-hidden">
        <div className="scanline absolute inset-0 pointer-events-none" />
        <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 border-l-2 border-rose-500 pl-3 mb-6">
          THE RED GATE: EMERGENCY RAID
        </h2>

        {!raid ? (
          <div className="flex flex-col items-center justify-center p-8 text-center bg-slate-900/20 border border-slate-800/50 rounded">
            <Compass className="h-12 w-12 text-slate-700 mb-3 animate-spin-slow" />
            <h3 className="font-mono text-sm uppercase text-slate-400 font-bold">SPATIAL RIFT SCANNER</h3>
            <p className="text-xs text-slate-500 max-w-md mt-2 font-light mb-4">
              Trigger the scanner sensors to detect active spatial tears and enter dangerous Red Gate dungeons. 
              Be ready — once you enter a Red Gate, you must complete the specified criteria or forfeit gold tokens.
            </p>
            <button
              onClick={handleTriggerRedGate}
              disabled={isScanning}
              className="bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 border border-rose-500/40 hover:border-rose-500 px-6 py-2.5 rounded font-mono text-xs font-bold uppercase transition-all shadow-[0_0_15px_rgba(244,63,94,0.1)] active:scale-95 disabled:opacity-50 cursor-pointer flex items-center gap-2"
            >
              {isScanning ? (
                <>
                  <div className="h-3 w-3 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
                  SCANNING RIFTS...
                </>
              ) : (
                'TRIGGER PORTAL SCANNER'
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className={`p-5 rounded-lg border relative overflow-hidden ${
              raid.status === 'cleared' 
                ? 'bg-green-950/10 border-green-500/30' 
                : 'bg-rose-950/10 border-rose-500/40 shadow-[0_0_20px_rgba(244,63,94,0.1)]'
            }`}>
              <div className="absolute top-2 right-2 font-mono text-[9px] border px-2 py-0.5 rounded font-bold uppercase tracking-widest bg-slate-900/80">
                {raid.difficulty} RAID
              </div>

              <div className="space-y-2">
                <span className="font-mono text-[10px] text-rose-500 font-bold tracking-widest uppercase">
                  {raid.status === 'cleared' ? 'RAID CLEARED' : 'ACTIVE EMERGENCY DUNGEON'}
                </span>
                <h3 className="text-2xl font-light text-white uppercase tracking-tight font-sans">
                  {raid.name}
                </h3>
                <p className="text-xs text-slate-400 italic">
                  Boss: <span className="text-rose-400 font-bold font-mono">{raid.boss}</span> — {raid.description}
                </p>
              </div>

              {raid.status === 'active' && (
                <div className="mt-5 space-y-3">
                  <div className="flex justify-between items-end text-xs font-mono">
                    <span className="text-slate-400">ESCAPE REQUIREMENT: {raid.requiredTaskName}</span>
                    <span className="text-rose-400 font-bold">{progress} / {raid.targetCount} UNITS today</span>
                  </div>
                  {/* Progress bar */}
                  <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                    <div 
                      className={`h-full transition-all duration-500 ${isRaidCleared ? 'bg-green-500' : 'bg-rose-500 animate-pulse'}`}
                      style={{ width: `${Math.min(100, (progress / raid.targetCount) * 100)}%` }}
                    />
                  </div>

                  <div className="pt-2 flex flex-wrap gap-2 justify-between items-center text-[10px] font-mono text-slate-400 border-t border-slate-800/60">
                    <div className="flex gap-4">
                      <span className="flex items-center gap-1"><Sparkles className="h-3.5 w-3.5 text-yellow-500" /> +{raid.rewardXp} XP</span>
                      <span className="flex items-center gap-1"><Coins className="h-3.5 w-3.5 text-amber-500" /> +{raid.rewardGold} Gold</span>
                      <span className="text-purple-400 font-bold">Loot: {raid.rewardItemName}</span>
                    </div>

                    <div className="flex gap-2">
                      {isRaidCleared ? (
                        <button
                          onClick={handleClaimRaidSuccess}
                          className="bg-green-600 hover:bg-green-500 text-white border border-green-400 px-4 py-1.5 rounded text-xs font-bold uppercase transition-all shadow-[0_0_12px_rgba(34,197,94,0.3)] cursor-pointer"
                        >
                          CLAIM RAID LOOT
                        </button>
                      ) : (
                        <button
                          disabled
                          className="bg-slate-900 text-slate-500 border border-slate-800 px-4 py-1.5 rounded text-xs font-bold uppercase cursor-not-allowed"
                        >
                          DUNGEON SEALED
                        </button>
                      )}
                      <button
                        onClick={handleForfeitRaid}
                        className="bg-slate-950/80 hover:bg-slate-900 text-rose-400/80 border border-rose-950/50 px-3 py-1.5 rounded text-xs font-mono uppercase transition-colors cursor-pointer"
                      >
                        COLLAPSE rift
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {raid.status === 'cleared' && (
                <div className="mt-4 p-3 bg-green-950/20 border border-green-500/20 text-green-400 rounded text-xs font-mono flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  <span>The spatial coordinate was fully purged. Baron / Baruka defeated. You may scan for another gate tomorrow.</span>
                  <button 
                    onClick={() => setState(prev => ({ ...prev, redGateRaid: null }))}
                    className="ml-auto text-green-300 underline font-sans text-[10px] cursor-pointer"
                  >
                    Clear Log
                  </button>
                </div>
              )}
            </div>
            
            {/* Simulation button */}
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => {
                  setState(prev => ({
                    ...prev,
                    isSystemLocked: true,
                    notifications: [
                      '🚨 [SIMULATION] TRIGGERED 2-WEEK CONSECUTIVE PENALTY LOCKOUT.',
                      ...(prev.notifications || [])
                    ].slice(0, 50)
                  }));
                }}
                className="text-[10px] text-rose-500 hover:text-rose-400 font-mono underline hover:no-underline transition-all cursor-pointer bg-transparent border-0"
              >
                Simulate 2-Week Penalty Lockout (Test Accountability Block)
              </button>
            </div>
          </div>
        )}
      </section>

      {/* 3. SHADOW EXTRACTION (NECROMANCY - "ARISE") */}
      <section className="border border-slate-800 bg-slate-950/40 p-6 rounded backdrop-blur-sm relative overflow-hidden">
        <div className="scanline absolute inset-0 pointer-events-none" />
        <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 border-l-2 border-purple-500 pl-3 mb-6">
          SHADOW EXTRACTION (NECROMANCY: ARISE)
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Summon controls */}
          <div className="lg:col-span-1 space-y-4">
            <div className="p-4 bg-slate-900/60 border border-slate-800 rounded">
              <h3 className="font-mono text-xs uppercase font-bold text-slate-300 mb-2 flex items-center gap-1.5">
                <Skull className="h-4 w-4 text-purple-400" />
                Necromancer Spellbook
              </h3>
              <p className="text-[11px] text-slate-400 leading-relaxed font-light mb-3">
                Spend gold to command and extract shadows of high-tier commanders. 
                Extracted shadows are bound to your shadow army, granting massive passive stat buffs!
              </p>
              <div className="bg-slate-950 border border-slate-800 p-2.5 rounded font-mono text-[10px] text-yellow-500 flex justify-between items-center mb-4">
                <span>EXTRACTION COST:</span>
                <span className="font-bold">150 GOLD TOKENS</span>
              </div>

              <button
                onClick={handleExtractShadow}
                disabled={isExtracting || state.playerStats.gold < 150}
                className="w-full bg-gradient-to-r from-purple-950 to-indigo-950 hover:from-purple-900 hover:to-indigo-900 text-purple-200 border border-purple-500/30 hover:border-purple-400 py-3 rounded font-mono text-xs font-black uppercase transition-all shadow-[0_0_15px_rgba(168,85,247,0.1)] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
              >
                {isExtracting ? (
                  <>
                    <div className="h-3.5 w-3.5 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                    CHANNELING SOUL...
                  </>
                ) : (
                  'ARISE (EXTRACT SHADOW)'
                )}
              </button>
            </div>

            {/* Extraction result logs */}
            <AnimatePresence mode="wait">
              {extractionResult && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`p-3 rounded border text-xs font-mono leading-relaxed ${
                    extractionResult.success 
                      ? 'bg-purple-950/20 border-purple-500/40 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.15)]' 
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {extractionResult.success ? (
                      <CheckCircle className="h-4 w-4 text-purple-400 flex-shrink-0 mt-0.5 animate-bounce" />
                    ) : (
                      <XCircle className="h-4 w-4 text-slate-500 flex-shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className="font-bold uppercase mb-1">
                        {extractionResult.success ? 'SUMMON SUCCESSFUL' : 'SUMMON REJECTED'}
                      </p>
                      <p className="text-[11px] text-slate-300">
                        {extractionResult.message}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Active shadow army list */}
          <div className="lg:col-span-2 space-y-3">
            <h3 className="font-mono text-xs uppercase font-bold text-slate-300 flex items-center justify-between border-b border-slate-800/60 pb-1.5">
              <span>MY SHADOW SOLDIERS ({(state.shadowArmy || []).length})</span>
              <span className="text-[10px] text-purple-400 lowercase font-light">passive stat multiplier active</span>
            </h3>

            {(!state.shadowArmy || state.shadowArmy.length === 0) ? (
              <div className="flex flex-col items-center justify-center p-8 text-center bg-slate-900/10 border border-dashed border-slate-800 rounded">
                <Skull className="h-8 w-8 text-slate-700 mb-2" />
                <p className="text-xs text-slate-500 font-light font-mono">
                  No shadows bound. Perform an extraction above or conquer Red Gates to recruit soldiers.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {state.shadowArmy.map(sh => (
                  <div 
                    key={sh.id}
                    className="p-3 bg-slate-900/60 border border-purple-500/25 rounded flex items-center justify-between hover:border-purple-400/40 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[8px] bg-purple-950/80 text-purple-300 border border-purple-500/30 px-1.5 rounded uppercase font-bold">
                          {sh.rank}
                        </span>
                        <h4 className="text-xs font-bold font-sans text-white truncate max-w-[150px]">
                          {sh.name.split(' (')[0]}
                        </h4>
                      </div>
                      <p className="text-[10px] text-slate-400 font-mono italic">
                        {sh.name.split(' (')[1]?.replace(')', '') || 'Shadow Knight'}
                      </p>
                    </div>
                    
                    <div className="text-right">
                      <div className="font-mono text-xs text-purple-400 font-black">
                        +{sh.buffValue} {sh.passiveStat.substring(0, 3).toUpperCase()}
                      </div>
                      <span className="text-[8px] text-slate-500 uppercase font-mono">bound soul</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </section>

    </div>
  );
}
