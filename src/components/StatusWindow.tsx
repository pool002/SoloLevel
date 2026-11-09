import React, { useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Shield, Coins, Sparkles, User, Sword, Compass, Award, Upload, ChevronDown, ChevronUp } from 'lucide-react';
import { PlayerStats, StatName } from '../types';

interface StatusWindowProps {
  stats: PlayerStats;
  onAllocateStat: (statName: StatName) => void;
  onResetStats?: () => void;
  onAvatarUpload?: (url: string) => void;
}

export default function StatusWindow({ stats, onAllocateStat, onResetStats, onAvatarUpload }: StatusWindowProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);
  const xpPercentage = Math.min(100, Math.max(0, (stats.xp / stats.maxXp) * 100));

  // Determine Rank based on total cumulative XP
  const getRank = (totalXp: number) => {
    if (totalXp < 3600) return 'F-Rank';
    if (totalXp < 10800) return 'E-Rank';
    if (totalXp < 25200) return 'D-Rank';
    if (totalXp < 54000) return 'C-Rank';
    if (totalXp < 100000) return 'B-Rank';
    if (totalXp < 200000) return 'A-Rank';
    return 'S-Rank';
  };

  const getRankTitle = (rank: string) => {
    switch (rank) {
      case 'F-Rank': return 'F-Rank Awakened';
      case 'E-Rank': return 'E-Rank Pioneer';
      case 'D-Rank': return 'D-Rank Veteran';
      case 'C-Rank': return 'C-Rank Spellsword';
      case 'B-Rank': return 'B-Rank Elite Warrior';
      case 'A-Rank': return 'A-Rank Vanguard';
      default: return 'S-Rank Monarch';
    }
  };

  const getRankColor = (rank: string) => {
    switch (rank) {
      case 'F-Rank': return 'text-slate-500 border-slate-700/30';
      case 'E-Rank': return 'text-slate-300 border-slate-400/30';
      case 'D-Rank': return 'text-green-400 border-green-500/30';
      case 'C-Rank': return 'text-blue-400 border-blue-500/30';
      case 'B-Rank': return 'text-purple-400 border-purple-500/30';
      case 'A-Rank': return 'text-pink-400 border-pink-500/30';
      default: return 'text-yellow-400 border-yellow-500/30 font-black';
    }
  };

  const currentRank = getRank(stats.totalXp || 0);
  const currentTitle = getRankTitle(currentRank);

  // Calculate Combat Power: a composite of all stats and level
  const totalStatsSum = stats.strength + stats.agility + stats.vitality + stats.intelligence + stats.sense;
  const combatPower = totalStatsSum * 15 + stats.level * 80;

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Strict client-side extension check
    const allowedExtensions = ['.jpg', '.jpeg', '.png'];
    const fileExt = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg'];

    if (!allowedExtensions.includes(fileExt) || !allowedMimeTypes.includes(file.type)) {
      alert('Strict System Check: Only .jpg, .jpeg, and .png extensions/mime-types are permitted!');
      return;
    }

    // Check size (e.g. max 4MB)
    if (file.size > 4 * 1024 * 1024) {
      alert('System Limit: Avatar images must be smaller than 4MB.');
      return;
    }

    try {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          onAvatarUpload?.(reader.result);
        } else {
          alert('System error reading the awakened photo stream.');
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Avatar upload failure:', err);
      alert('Error reading awakened profile photo stream.');
    }
  };

  return (
    <div
      id="status-window-container"
      className="border border-slate-800 relative overflow-hidden rounded bg-slate-950/40 p-6 backdrop-blur-sm"
    >
      {/* Hologram Scanner Scanning Line */}
      <div className="scanline absolute inset-0 pointer-events-none" />

      {/* Title */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 border-l-2 border-cyan-500 pl-3">
          STATUS WINDOW
        </h2>
        <span className="font-mono text-[10px] text-slate-500 italic">System: Synchronized</span>
      </div>

      {/* Avatar & Rank/Title Details */}
      <div className="flex items-start gap-4">
        {/* Holographic Avatar Box with upload handler */}
        <div 
          onClick={handleAvatarClick}
          className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded bg-slate-900/60 border border-slate-800 flex items-center justify-center cursor-pointer group"
          title="Awaken identity: Upload profile photo"
        >
          {stats.avatarUrl ? (
            <img 
              src={stats.avatarUrl} 
              alt={stats.name} 
              className="h-full w-full object-cover relative z-10"
              referrerPolicy="no-referrer"
            />
          ) : (
            <User className="h-10 w-10 text-slate-500 relative z-10 group-hover:opacity-20 transition-opacity" />
          )}

          {/* Holographic overlay on hover */}
          <div className="absolute inset-0 bg-cyan-950/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-all z-20">
            <Upload className="h-5 w-5 text-cyan-400 animate-pulse" />
            <span className="text-[8px] text-cyan-300 font-mono mt-1 font-bold">UPLOAD</span>
          </div>

          {/* Avatar overlay mesh */}
          <div className="absolute inset-0 bg-gradient-to-t from-cyan-950/20 via-transparent to-transparent pointer-events-none z-10" />

          <span className="absolute bottom-1 right-1 font-mono text-[9px] text-cyan-400 px-1 rounded bg-slate-950 border border-slate-800 z-20">
            CP {combatPower}
          </span>
        </div>

        {/* Hidden File Input */}
        <input 
          ref={fileInputRef}
          type="file"
          accept=".jpg,.jpeg,.png"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Identity Info */}
        <div className="flex-grow min-w-0 space-y-1">
          <h3 className="truncate text-xl font-light tracking-tight text-white uppercase font-sans">
            {stats.name || 'UNREGISTERED HUNTER'}
          </h3>
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            <span className={`font-mono text-[9px] border px-2 py-0.5 rounded uppercase font-bold bg-slate-900/60 ${getRankColor(currentRank)}`}>
              {currentRank}
            </span>
            <span className="font-mono text-[9px] border border-amber-500/20 text-amber-400 px-2 py-0.5 rounded bg-amber-950/10 flex items-center gap-1">
              <Award className="h-2.5 w-2.5" />
              {currentTitle}
            </span>
            <span className="font-mono text-[9px] border border-cyan-500/25 text-cyan-400 px-2 py-0.5 rounded bg-cyan-950/20 font-bold uppercase">
              LVL {stats.level}
            </span>
          </div>

          <div className="pt-1 flex items-center gap-1.5 text-[10px] text-yellow-400 font-mono">
            <Coins className="h-3.5 w-3.5 text-yellow-500" />
            <span className="font-bold">{stats.gold} GOLD TOKENS</span>
          </div>
        </div>
      </div>

      {/* Expand/Collapse Toggle Button (Visible ONLY on mobile and tablet) */}
      <button
        onClick={() => setIsMobileExpanded(!isMobileExpanded)}
        className="w-full mt-4 py-2 text-center text-[10px] font-mono font-bold uppercase tracking-widest text-cyan-400 bg-slate-900/60 border border-slate-800 rounded hover:bg-slate-900 hover:border-cyan-500/40 transition-all flex items-center justify-center gap-1.5 lg:hidden cursor-pointer"
      >
        {isMobileExpanded ? (
          <>
            <ChevronUp className="h-3.5 w-3.5 text-cyan-400 animate-bounce" />
            <span>Collapse System Status</span>
          </>
        ) : (
          <>
            <ChevronDown className="h-3.5 w-3.5 text-cyan-400 animate-bounce" />
            <span>Expand System Status ({stats.statPoints > 0 ? `${stats.statPoints}pts unused` : 'attributes'})</span>
          </>
        )}
      </button>

      {/* Details Container - Always visible on desktop, toggleable on mobile */}
      <div className={`${isMobileExpanded ? 'block' : 'hidden lg:block'} mt-6 space-y-6 transition-all`}>
        {/* Level and Experience section (Styled perfectly to match Clean Minimalism) */}
        <div className="rounded border border-slate-800 bg-slate-900/30 p-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] uppercase font-bold text-slate-500 font-mono">Experience (XP)</span>
            <span className="font-mono text-xs text-cyan-400">
              {Math.round(stats.xp)} / {stats.maxXp} XP ({Math.round(xpPercentage)}%)
            </span>
          </div>

          {/* XP Bar */}
          <div className="relative h-1.5 w-full bg-slate-900 border border-slate-800/80">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${xpPercentage}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full bg-cyan-500 shadow-[0_0_8px_rgba(34,211,238,0.5)]"
            />
          </div>
        </div>

        {/* Statistics Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/60 pb-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
              Ability Statistics
            </span>
            {stats.statPoints > 0 && (
              <motion.span
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="font-mono text-[10px] font-bold text-amber-500 uppercase flex items-center gap-1"
              >
                <Sparkles className="h-3 w-3" />
                {stats.statPoints} Points Available!
              </motion.span>
            )}
          </div>

          <div className="grid gap-3">
            {/* Strength */}
            <div className="flex items-center justify-between bg-slate-900/20 border border-slate-800/50 p-2.5 rounded">
              <div className="flex items-center gap-2">
                <Sword className="h-3.5 w-3.5 text-slate-400" />
                <div>
                  <span className="text-xs text-slate-300 font-medium block">Strength (STR)</span>
                  {/* Visual bar graph representation */}
                  <div className="mt-1 w-28 h-0.5 bg-slate-900"><div className="h-full bg-cyan-700" style={{ width: `${Math.min(100, stats.strength * 2.2)}%` }}></div></div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono font-bold text-cyan-400 text-sm">{stats.strength}</span>
                {stats.statPoints > 0 && (
                  <button
                    onClick={() => onAllocateStat('strength')}
                    className="flex h-5 w-5 items-center justify-center rounded bg-slate-900 border border-slate-700 text-cyan-400 hover:bg-cyan-500 hover:text-slate-950 transition-colors font-mono font-bold text-xs cursor-pointer"
                  >
                    +
                  </button>
                )}
              </div>
            </div>

            {/* Agility */}
            <div className="flex items-center justify-between bg-slate-900/20 border border-slate-800/50 p-2.5 rounded">
              <div className="flex items-center gap-2">
                <Compass className="h-3.5 w-3.5 text-slate-400" />
                <div>
                  <span className="text-xs text-slate-300 font-medium block">Agility (AGI)</span>
                  {/* Visual bar graph representation */}
                  <div className="mt-1 w-28 h-0.5 bg-slate-900"><div className="h-full bg-cyan-700" style={{ width: `${Math.min(100, stats.agility * 2.2)}%` }}></div></div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono font-bold text-cyan-400 text-sm">{stats.agility}</span>
                {stats.statPoints > 0 && (
                  <button
                    onClick={() => onAllocateStat('agility')}
                    className="flex h-5 w-5 items-center justify-center rounded bg-slate-900 border border-slate-700 text-cyan-400 hover:bg-cyan-500 hover:text-slate-950 transition-colors font-mono font-bold text-xs cursor-pointer"
                  >
                    +
                  </button>
                )}
              </div>
            </div>

            {/* Vitality */}
            <div className="flex items-center justify-between bg-slate-900/20 border border-slate-800/50 p-2.5 rounded">
              <div className="flex items-center gap-2">
                <Shield className="h-3.5 w-3.5 text-slate-400" />
                <div>
                  <span className="text-xs text-slate-300 font-medium block">Vitality (VIT)</span>
                  {/* Visual bar graph representation */}
                  <div className="mt-1 w-28 h-0.5 bg-slate-900"><div className="h-full bg-cyan-700" style={{ width: `${Math.min(100, stats.vitality * 2.2)}%` }}></div></div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono font-bold text-cyan-400 text-sm">{stats.vitality}</span>
                {stats.statPoints > 0 && (
                  <button
                    onClick={() => onAllocateStat('vitality')}
                    className="flex h-5 w-5 items-center justify-center rounded bg-slate-900 border border-slate-700 text-cyan-400 hover:bg-cyan-500 hover:text-slate-950 transition-colors font-mono font-bold text-xs cursor-pointer"
                  >
                    +
                  </button>
                )}
              </div>
            </div>

            {/* Intelligence */}
            <div className="flex items-center justify-between bg-slate-900/20 border border-slate-800/50 p-2.5 rounded">
              <div className="flex items-center gap-2">
                <Compass className="h-3.5 w-3.5 text-slate-400" />
                <div>
                  <span className="text-xs text-slate-300 font-medium block">Intelligence (INT)</span>
                  {/* Visual bar graph representation */}
                  <div className="mt-1 w-28 h-0.5 bg-slate-900"><div className="h-full bg-cyan-700" style={{ width: `${Math.min(100, stats.intelligence * 2.2)}%` }}></div></div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono font-bold text-cyan-400 text-sm">{stats.intelligence}</span>
                {stats.statPoints > 0 && (
                  <button
                    onClick={() => onAllocateStat('intelligence')}
                    className="flex h-5 w-5 items-center justify-center rounded bg-slate-900 border border-slate-700 text-cyan-400 hover:bg-cyan-500 hover:text-slate-950 transition-colors font-mono font-bold text-xs cursor-pointer"
                  >
                    +
                  </button>
                )}
              </div>
            </div>

            {/* Sense */}
            <div className="flex items-center justify-between bg-slate-900/20 border border-slate-800/50 p-2.5 rounded">
              <div className="flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-slate-400" />
                <div>
                  <span className="text-xs text-slate-300 font-medium block">Sense (SEN)</span>
                  {/* Visual bar graph representation */}
                  <div className="mt-1 w-28 h-0.5 bg-slate-900"><div className="h-full bg-cyan-700" style={{ width: `${Math.min(100, stats.sense * 2.2)}%` }}></div></div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono font-bold text-cyan-400 text-sm">{stats.sense}</span>
                {stats.statPoints > 0 && (
                  <button
                    onClick={() => onAllocateStat('sense')}
                    className="flex h-5 w-5 items-center justify-center rounded bg-slate-900 border border-slate-700 text-cyan-400 hover:bg-cyan-500 hover:text-slate-950 transition-colors font-mono font-bold text-xs cursor-pointer"
                  >
                    +
                  </button>
                )}
              </div>
            </div>
          </div>
          
          {/* Reset stats helper button */}
          {onResetStats && (
            <div className="pt-2 text-right">
              <button
                onClick={onResetStats}
                className="text-[9px] font-mono text-slate-500 hover:text-cyan-400 hover:underline transition-all cursor-pointer bg-transparent border-0 outline-none"
              >
                Reset Allocated Stat Points
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
