export type StatName = 'strength' | 'agility' | 'vitality' | 'intelligence' | 'sense';

export interface Task {
  id: string;
  name: string;
  points: number; // base points per unit (can be positive or negative)
  unit: string;   // "hr" or "occ"
  category: StatName | 'negative';
  description: string;
}

export interface DayScores {
  [taskId: string]: number; // the multiplier/quantity (e.g., 2.0 hours, 1 cigarette)
}

export interface WeeklyTarget {
  id: string; // e.g., "2026-07-04"
  label: string; // "Weekend - 4 July 2026"
  targetPoints: number;
  penalty: string;
  penaltyCompleted: boolean;
  totalPointsEarned?: number; // cached or calculated
}

export interface PlayerStats {
  name: string;
  title: string;
  level: number;
  xp: number;
  maxXp: number;
  statPoints: number; // unallocated stat points
  strength: number;
  agility: number;
  vitality: number;
  intelligence: number;
  sense: number;
  gold: number; // Earned through completing daily tasks or hitting targets
  totalXp: number; // Cumulative XP of the hunter
  avatarUrl?: string; // Uploaded profile picture URL
  isNewUser?: boolean; // Flag to indicate if new user onboarding is active
  playerClass?: string; // Selected Specialty Class (e.g. Shadow Monarch, Vanguard, Aether Swift, Arcane Focus)
}

export interface InventoryItem {
  id: string;
  name: string;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  description: string;
  iconName: string;
  dateObtained: string;
  requiredLevel?: number;
}

export interface RedGateRaid {
  id: string;
  name: string;
  boss: string;
  difficulty: 'C-Rank' | 'B-Rank' | 'A-Rank' | 'S-Rank';
  description: string;
  requiredTaskName: string;
  requiredTaskId: string;
  targetCount: number; // hours of coding/studying, workouts, or times water plants
  currentCount: number;
  rewardXp: number;
  rewardGold: number;
  rewardItemName: string;
  status: 'active' | 'cleared' | 'failed';
}

export interface ShadowSoldier {
  id: string;
  name: string;
  rank: 'Normal' | 'Elite' | 'Knight' | 'Elite Knight' | 'Commander' | 'Marshal';
  buffDescription: string;
  passiveStat: StatName;
  buffValue: number;
}

export interface MonthlyGift {
  id: string; // "2026-07"
  label: string; // "July 2026 Legendary Reward"
  isUnlocked: boolean; // if all weekly targets in this month are clean (or met/penalty-cleared)
  isOpened: boolean;
  rewardItem?: InventoryItem;
}

export interface AppState {
  playerStats: PlayerStats;
  tasks: Task[];
  weeklyTargets: WeeklyTarget[];
  // Mapping of weeklyTargetId -> DayOfWeek (0: Sunday, 1: Monday, ... 6: Saturday) -> taskId -> multiplier
  scores: {
    [weekId: string]: {
      [dayIndex: number]: DayScores;
    };
  };
  inventory: InventoryItem[];
  monthlyGifts: MonthlyGift[];
  currentWeekId: string; // ID of the currently selected week
  currentDayIndex: number; // 0-6 index for Sunday-Saturday
  notifications: string[]; // Recent system alerts/logs
  redGateRaid?: RedGateRaid | null; // Currently active Red Gate Raid
  shadowArmy?: ShadowSoldier[];      // Summoned Shadow Soldiers
  isSystemLocked?: boolean;          // Accountability Lockout screen active
}
