import { AppState, Task, WeeklyTarget, PlayerStats, MonthlyGift, InventoryItem } from './types';

export const INITIAL_TASKS: Task[] = [
  {
    id: 'clean_room',
    name: 'Clean Room',
    points: 2,
    unit: 'hr',
    category: 'vitality',
    description: 'De-clutter, dust, sweep, and organize your environment.'
  },
  {
    id: 'water_plants',
    name: 'Water Plants',
    points: 3,
    unit: 'occ',
    category: 'sense',
    description: 'Check soil and water the household plants.'
  },
  {
    id: 'self_study',
    name: 'Self Study',
    points: 4,
    unit: 'hr',
    category: 'intelligence',
    description: 'Read technical books, watch lectures, or learn a new skill.'
  },
  {
    id: 'coding',
    name: 'Coding',
    points: 5,
    unit: 'hr',
    category: 'intelligence',
    description: 'Write code, work on side projects, or fix bugs.'
  },
  {
    id: 'ctf',
    name: 'CTF (Capture The Flag)',
    points: 5,
    unit: 'hr',
    category: 'intelligence',
    description: 'Practice cybersecurity challenges and hacking puzzles.'
  },
  {
    id: 'cardio',
    name: 'Cardio',
    points: 6,
    unit: 'hr',
    category: 'agility',
    description: 'Run, cycle, swim, or perform high-intensity interval training.'
  },
  {
    id: 'workout',
    name: 'Workout',
    points: 7,
    unit: 'hr',
    category: 'strength',
    description: 'Weightlifting, calisthenics, or core exercises.'
  },
  {
    id: 'yoga',
    name: 'Yoga',
    points: 8,
    unit: 'hr',
    category: 'sense',
    description: 'Perform yoga flows, stretches, and mindfulness movements.'
  },
  {
    id: 'meditation',
    name: 'Meditation',
    points: 10,
    unit: 'hr',
    category: 'sense',
    description: 'Mindfulness breathing, concentration, or mental stillness.'
  },
  {
    id: '1xcig',
    name: '1x Cigarette',
    points: -2,
    unit: 'occ',
    category: 'negative',
    description: 'Smoking or vaping (penalty habit).'
  },
  {
    id: 'gaming',
    name: 'Gaming',
    points: -3,
    unit: 'hr',
    category: 'negative',
    description: 'Leisure video gaming (limit to maintain focus).'
  },
  {
    id: 'alcohol',
    name: 'Alcoholic Drink',
    points: -4,
    unit: 'occ',
    category: 'negative',
    description: 'Drinking alcoholic beverages (penalty habit).'
  }
];

export const INITIAL_WEEKLY_TARGETS: WeeklyTarget[] = [
  {
    id: '2026-07-04',
    label: 'Weekend - 4 July 2026',
    targetPoints: 290,
    penalty: '100x Push Ups',
    penaltyCompleted: true,
    totalPointsEarned: 124 // They missed target of 290, so they had a penalty which they completed
  },
  {
    id: '2026-07-11',
    label: 'Weekend - 11 July 2026',
    targetPoints: 300,
    penalty: '3hrs Straight Coding',
    penaltyCompleted: false,
    totalPointsEarned: 78.5 // Preloaded in-progress week score
  },
  {
    id: '2026-07-18',
    label: 'Weekend - 18 July 2026',
    targetPoints: 310,
    penalty: '50x Chin Ups',
    penaltyCompleted: false,
    totalPointsEarned: 0
  },
  {
    id: '2026-07-25',
    label: 'Weekend - 25 July 2026',
    targetPoints: 320,
    penalty: '100x Squats',
    penaltyCompleted: false,
    totalPointsEarned: 0
  },
  {
    id: '2026-08-01',
    label: 'Weekend - 1 Aug 2026',
    targetPoints: 330,
    penalty: 'Plank for 5 mins',
    penaltyCompleted: false,
    totalPointsEarned: 0
  }
];

export const INITIAL_PLAYER_STATS: PlayerStats = {
  name: 'Sung Jin-Woo',
  title: 'F-Rank Hunter',
  level: 4,
  xp: 135,
  maxXp: 400,
  statPoints: 5,
  strength: 12,
  agility: 10,
  vitality: 11,
  intelligence: 14,
  sense: 9,
  gold: 450,
  totalXp: 735,
  isNewUser: false
};

export const INITIAL_MONTHLY_GIFTS: MonthlyGift[] = [
  {
    id: '2026-07',
    label: 'July 2026 Legendary Reward',
    isUnlocked: false,
    isOpened: false
  }
];

export const INITIAL_SCORES: AppState['scores'] = {
  // Pre-loaded historical week ending July 4th
  '2026-07-04': {
    0: { clean_room: 1.5, cardio: 1.0, workout: 2.0, gaming: 3.0, '1xcig': 2.0 }, // Sun
    1: { clean_room: 0.5, self_study: 1.5, workout: 1.0, gaming: 4.0 }, // Mon
    2: { water_plants: 1.0, self_study: 2.0, coding: 2.0, gaming: 2.0 }, // Tue
    3: { coding: 3.0, workout: 1.5, meditation: 0.5, alcohol: 2.0 }, // Wed
    4: { self_study: 1.0, cardio: 0.5, gaming: 5.0 }, // Thu
    5: { clean_room: 1.0, coding: 1.0, workout: 1.0, gaming: 6.0, alcohol: 3.0 }, // Fri
    6: { self_study: 2.0, coding: 2.0, gaming: 4.0 } // Sat
  },
  // Current week ending July 11th (Matching spreadsheet)
  '2026-07-11': {
    // Sunday (July 5th)
    0: {
      clean_room: 2.0, // 2.00 in sheet
      cardio: 1.0,     // 1.00 in sheet
      workout: 5.0,    // 5.00 in sheet
      '1xcig': 1.0,    // -2.00 points in sheet (1 occurrence * -2 = -2 pts)
      gaming: 2.0,     // -6.00 points in sheet (2 hours * -3 = -6 pts)
      alcohol: 1.0     // -4.00 points in sheet (1 occurrence * -4 = -4 pts)
    },
    // Monday (July 6th)
    1: {
      clean_room: 2.0, // 2.00 in sheet
      workout: 1.0,    // 1.00 in sheet
      '1xcig': 0.25,   // -0.50 points in sheet (0.25 occurrence * -2 = -0.50 pts)
      gaming: 2.0      // -6.00 points in sheet (2.0 hours * -3 = -6.00 pts)
    },
    // Tuesday (July 7th)
    2: {
      self_study: 1.0, // 1.00 in sheet
      '1xcig': 0.5,    // -1.00 points in sheet (0.5 occurrence * -2 = -1.00 pts)
      gaming: 1.67     // -5.00 points in sheet (1.67 hours * -3 = -5.00 pts)
    },
    // Wednesday (July 8th) - CURRENT DAY
    3: {
      self_study: 2.5, // 2.50 in sheet
      cardio: 2.5,     // 2.50 in sheet
      workout: 3.0,    // 3.00 in sheet
      gaming: 1.0      // -3.00 points in sheet (1.0 hour * -3 = -3.00 pts)
    },
    // Thursday
    4: {},
    // Friday
    5: {},
    // Saturday
    6: {}
  }
};

export const INITIAL_INVENTORY: InventoryItem[] = [
  {
    id: 'item_1',
    name: 'Monarch\'s Espresso Shot',
    rarity: 'Common',
    description: 'Brew a premium black coffee or double-shot espresso to trigger instant fatigue correction (+1 INT).',
    iconName: 'zap',
    dateObtained: '2026-07-11',
    requiredLevel: 1
  },
  {
    id: 'item_2',
    name: 'High-Grade Hydration Elixir',
    rarity: 'Common',
    description: 'Drink 500ml of cold mineral water immediately to cleanse blood toxicity (+1 VIT).',
    iconName: 'droplet',
    dateObtained: '2026-07-11',
    requiredLevel: 1
  },
  {
    id: 'item_3',
    name: 'Vanguard\'s Weighted Vest',
    rarity: 'Rare',
    description: 'Equip to amplify heavy physical routines. Perform a dedicated bodyweight circuit (+1 STR, +1 VIT).',
    iconName: 'shield',
    dateObtained: '2026-07-11',
    requiredLevel: 2
  },
  {
    id: 'item_4',
    name: 'Scroll of Absolute Focus',
    rarity: 'Epic',
    description: 'Mute your smartphone and enter Do Not Disturb mode for 3 continuous hours of deep study (+2 INT).',
    iconName: 'scroll',
    dateObtained: '2026-07-11',
    requiredLevel: 3
  },
  {
    id: 'item_5',
    name: 'Aether Wind Sneakers',
    rarity: 'Rare',
    description: 'Lace up and run 3 miles in real life to break heavy sweat limits (+2 AGI).',
    iconName: 'key',
    dateObtained: '2026-07-11',
    requiredLevel: 3
  },
  {
    id: 'item_6',
    name: 'Belt of the Titan',
    rarity: 'Legendary',
    description: 'Increases strength threshold under extreme stress. Complete 100 squats physically (+3 STR, +2 VIT).',
    iconName: 'sword',
    dateObtained: '2026-07-11',
    requiredLevel: 4
  },
  {
    id: 'item_7',
    name: 'Chronos Focus Hourglass',
    rarity: 'Legendary',
    description: 'Dilates focus perception. 4 hours of pure uninterrupted programming or engineering (+4 SEN, +2 INT).',
    iconName: 'zap',
    dateObtained: '2026-07-11',
    requiredLevel: 5
  }
];

export const getInitialState = (): AppState => {
  // Check if saved state exists in localStorage
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('solo_leveling_system_v3_state');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Ensure totalXp is initialized on older formats
        if (parsed.playerStats) {
          if (parsed.playerStats.totalXp === undefined) parsed.playerStats.totalXp = 0;
          if (parsed.playerStats.playerClass === undefined) parsed.playerStats.playerClass = '';
        }
        if (parsed.redGateRaid === undefined) parsed.redGateRaid = null;
        if (parsed.shadowArmy === undefined) parsed.shadowArmy = [];
        if (parsed.isSystemLocked === undefined) parsed.isSystemLocked = false;

        if (parsed.tasks && parsed.playerStats && parsed.scores) {
          return parsed;
        }
      } catch (e) {
        console.error('Failed to parse saved state', e);
      }
    }
  }

  // Create empty stats representing a brand new user starting at Level 1, Rank F
  const newPlayerStats: PlayerStats = {
    name: '', // Triggers name input onboarding
    title: 'F-Rank Awakened',
    level: 1,
    xp: 0,
    maxXp: 100,
    statPoints: 0,
    strength: 10,
    agility: 10,
    vitality: 10,
    intelligence: 10,
    sense: 10,
    gold: 0,
    totalXp: 0,
    isNewUser: true,
    playerClass: ''
  };

  const today = new Date();
  const saturdayDate = new Date();
  const day = today.getDay();
  saturdayDate.setDate(today.getDate() + (6 - day));
  const currentWeekId = saturdayDate.toISOString().split('T')[0];

  const defaultWeeklyTargets: WeeklyTarget[] = [
    {
      id: currentWeekId,
      label: `Weekend - ${saturdayDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}`,
      targetPoints: 200,
      penalty: '50x Push Ups',
      penaltyCompleted: false,
      totalPointsEarned: 0
    }
  ];

  const initialScores: AppState['scores'] = {
    [currentWeekId]: {
      0: {}, 1: {}, 2: {}, 3: {}, 4: {}, 5: {}, 6: {}
    }
  };

  return {
    playerStats: newPlayerStats,
    tasks: INITIAL_TASKS,
    weeklyTargets: defaultWeeklyTargets,
    scores: initialScores,
    inventory: INITIAL_INVENTORY,
    monthlyGifts: INITIAL_MONTHLY_GIFTS,
    currentWeekId: currentWeekId,
    currentDayIndex: day,
    notifications: [
      'SYSTEM: Quest Log Initialized for New Player.',
      'SYSTEM: Enter your credentials to Awaken your player profile.'
    ],
    redGateRaid: null,
    shadowArmy: [],
    isSystemLocked: false
  };
};

export const saveState = (state: AppState) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('solo_leveling_system_v3_state', JSON.stringify(state));
  }
};
