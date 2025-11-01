const GAME_CONFIG = {
  TASK_BASE_XP: 25,
  TASK_CREDIT: 15, // Renamed from Gold
  ANOMALY_DEFEAT_XP: 150,
  ANOMALY_DEFEAT_CREDIT: 100, // Renamed from Gold
  POMODORO_WORK_XP: 5,
  POMODORO_WORK_FOCUS_GAIN: 1,
  STREAK_BONUS_PER_DAY: 2, // Slightly increased bonus
  STREAK_DAMAGE_MULTIPLIER: 0.02,
  RANDOM_REWARD_CHANCE: 0.15, // 15% chance
  XP_BASE: 100, // Starting XP to level up
  XP_INCREASE_PER_LEVEL: 50, // How much XP requirement increases each level
  DAMAGE_RANDOM_LOW: 0.8,
  DAMAGE_RANDOM_HIGH: 1.2,
  DAMAGE_DIFFICULTY_MULTIPLIERS: {
    'Easy': 1.0,
    'Medium': 1.5,
    'Hard': 2.5
  },
  DAILY_REWARD_MULTIPLIERS: {
    'Easy': 1.0,
    'Medium': 1.25,
    'Hard': 1.75
  },
  // New multipliers for quest rewards
  QUEST_REWARD_MULTIPLIERS: {
    'Easy': 1.0,
    'Medium': 1.5,
    'Hard': 2.25
  },
  QUEST_REWARD_SCALARS: {
    duration: 0.005, // Per minute
    urgency: 0.25    // Bonus for tasks due within 24 hours
  },
  // New scaled rewards for stats
  STAT_REWARD_VALUES: {
    'Easy': 1,
    'Medium': 2,
    'Hard': 3
  }
};

const ANOMALIES = [
  { id: 1, name: "Entropy Node", level: 1, maxHp: 100, artClass: 'slime-art' }, // Was Procrastination Slime
  { id: 2, name: "The Multitasker", level: 3, maxHp: 200, artClass: 'dragon-art' }, // Was Distraction Dragon
  { id: 3, name: "Procrastinor", level: 5, maxHp: 350, artClass: 'beast-art' }, // Was Burnout Beast
  { id: 4, name: "Cognitive Fog", level: 7, maxHp: 500, artClass: 'demon-art' }, // Was Chaos Demon
  { id: 5, name: "The Void of Unrest", level: 10, maxHp: 750, artClass: 'emperor-art' } // Was Entropy Emperor
];

const ITEMS_CATALOG = {
  'xp_boost_small': { id: 'xp_boost_small', name: "Data Packet: Insight", description: "Grants +20% XP from the next 3 quests.", effect: { type: 'xp_boost', multiplier: 1.2, charges: 3 } }, // Was Elixir of Insight
  'anomaly_damage_small': { id: 'anomaly_damage_small', name: "Firewall Breach Script", description: "Instantly deals 50 damage to the current Anomaly.", effect: { type: 'anomaly_damage', amount: 50 } }, // Was Scroll of Sundering
  'credit_boost_small': { id: 'credit_boost_small', name: "Credit Multiplier", description: "Grants +25% Credits from the next 5 quests.", effect: { type: 'credit_boost', multiplier: 1.25, charges: 5 } },
  'stat_point_core': { id: 'stat_point_core', name: "Cognitive Core", description: "Permanently increases a random stat by 1.", effect: { type: 'permanent_stat_point', amount: 1 } }, // Was Wisdom Tome
  'precision_lens': { id: 'precision_lens', name: "Precision Lens", description: "Your next quest's stabilization is a guaranteed critical hit (max damage).", effect: { type: 'guaranteed_crit', charges: 1 } }, // Was Amulet of Strength
  'encrypted_cache': { id: 'encrypted_cache', name: "Encrypted Cache", description: "Contains a random digital artifact. What could it be?", effect: { type: 'instant_item' } }, // Was Enigmatic Chest

  // --- New Common Items (Sellables) ---
  'corrupted_data_fragment': { id: 'corrupted_data_fragment', name: "Corrupted Data Fragment", description: "Garbled data. A data broker might give you a few credits for it.", effect: { type: 'junk' } },
  'entropy_shard': { id: 'entropy_shard', name: "Entropy Shard", description: "A crystallized piece of a defeated Entropy Node.", effect: { type: 'junk' } },
  'depreciated_code_snippet': { id: 'depreciated_code_snippet', name: "Depreciated Code Snippet", description: "Old code, not useful for processing anymore.", effect: { type: 'junk' } },
  'credit_chip_small': { id: 'credit_chip_small', name: "Small Credit Chip", description: "A small chip containing 50 Credits.", effect: { type: 'instant_credit', amount: 50 } }, // Was Small Pouch of Gold

  // --- New Uncommon Items ---
  'overclock_module': { id: 'overclock_module', name: "Overclock Module", description: "Boosts Discipline by 10 for the next quest's stabilization.", effect: { type: 'temp_stat_boost', stat: 'discipline', amount: 10, charges: 1 } },
  'luck_algorithm': { id: 'luck_algorithm', name: "Luck Algorithm", description: "Slightly increases artifact drop chance for the next 3 quests.", effect: { type: 'item_chance_boost', multiplier: 1.5, charges: 3 } },
  'automation_script': { id: 'automation_script', name: "Automation Script", description: "A quick process. Instantly completes one 'Easy' Daily Habit.", effect: { type: 'complete_daily' } },

  // --- New Rare Items ---
  'data_defragmenter': { id: 'data_defragmenter', name: "Data Defragmenter", description: "Refactors 2 common junk artifacts into 50 Credits.", effect: { type: 'transmute_junk' } },
  'system_reboot_key': { id: 'system_reboot_key', name: "System Reboot Key", description: "Resets all completed Daily Habits for the day, allowing you to complete them again.", effect: { type: 'reset_dailies' } },
  'exploit_scanner': { id: 'exploit_scanner', name: "Exploit Scanner", description: "Your next 3 stabilizations deal bonus damage equal to 10% of the Anomaly's instability.", effect: { type: 'execute_damage', multiplier: 0.10, charges: 3 } },

  // --- New Legendary Items ---
  'firewall_override': { id: 'firewall_override', name: "Firewall Override", description: "A legendary failsafe. If a quest would cause you to break your streak, this is consumed to preserve it.", effect: { type: 'streak_saver', charges: 1 } },
  'nootropic_implant': { id: 'nootropic_implant', name: "Nootropic Implant", description: "Permanently increases Intelligence by 3.", effect: { type: 'permanent_stat_boost', stat: 'intelligence', amount: 3 } },
  'discipline_matrix': { id: 'discipline_matrix', name: "Discipline Matrix", description: "Permanently increases Discipline by 3.", effect: { type: 'permanent_stat_boost', stat: 'discipline', amount: 3 } }, // Renamed from Strength
  'focus_accelerator': { id: 'focus_accelerator', name: "Focus Accelerator", description: "Permanently increases Focus by 3.", effect: { type: 'permanent_stat_boost', stat: 'focus', amount: 3 } },
  'quantum_coin': { id: 'quantum_coin', name: "Quantum Coin", description: "A strange, pulsating coin. On use, has a 50% chance to double your current credits, and a 50% chance to halve them.", effect: { type: 'credit_gambit' } },
  'learning_algorithm': { id: 'learning_algorithm', name: "Optimized Learning Algorithm", description: "A legendary artifact. On use, permanently reduces the XP required to level up by 5%.", effect: { type: 'xp_reduction', amount: 0.05 } }
};

const SHOP_ITEMS = [
  { itemId: 'xp_boost_small', price: 100 }, // Elixir of Insight
  { itemId: 'anomaly_damage_small', price: 150 }, // Scroll of Sundering
  { itemId: 'credit_boost_small', price: 80 }, // Credit Multiplier
  { itemId: 'precision_lens', price: 200 }, // Amulet of Strength
  { itemId: 'overclock_module', price: 120 }, // Overclock Module
  { itemId: 'stat_point_core', price: 750 }, // Wisdom Tome
  { itemId: 'system_reboot_key', price: 500 }, // System Reboot Key
  { itemId: 'firewall_override', price: 1000 } // Firewall Override
];

const CLASS_STARTING_ITEMS = {
  architect: 'anomaly_damage_small', // Vanguard -> Architect, Scroll of Sundering -> Firewall Breach Script
  analyst: 'xp_boost_small', // Scholar -> Analyst, Elixir of Insight -> Data Packet: Insight
  ascetic: 'credit_chip_small', // Monk -> Ascetic, Small Pouch of Gold -> Small Credit Chip
  synthesist: 'encrypted_cache' // Generalist -> Synthesist, Enigmatic Chest -> Encrypted Cache
};

const CLASSES = {
  architect: {
    id: 'architect',
    name: 'Architect', // Was Vanguard
    bonuses: { damage_multiplier: 1.05, preferred_stat: 'discipline' } // Was Strength
  },
  analyst: {
    id: 'analyst',
    name: 'Analyst', // Was Scholar
    bonuses: { xp_multiplier: 1.10, preferred_stat: 'intelligence' }
  },
  ascetic: {
    id: 'ascetic',
    name: 'Ascetic', // Was Monk
    bonuses: { focus_gain_multiplier: 1.2, preferred_stat: 'focus' }
  },
  synthesist: {
    id: 'synthesist',
    name: 'Synthesist', // Was Generalist
    bonuses: { item_chance_boost: 0.05, preferred_stat: null }
  }
};

const TASK_TYPE_STAT_GAINS = {
  'Study': { stat: 'intelligence', icon: '🧠' },
  'Project': { stat: 'intelligence', icon: '🧠' },
  'Creative': { stat: 'intelligence', icon: '🧠' },
  'Health': { stat: 'discipline', icon: '💪' },
  'Habit': { stat: 'focus', icon: '🎯' },
  'Admin': { stat: 'focus', icon: '🎯' },
  'Social': { stat: 'focus', icon: '🎯' }
};

const DEFAULT_PLAYER_DATA = {
  level: 1,
  xp: 0,
  credit: 0,
  name: '',
  class: null,
  stats: { 
    discipline: 5,
    intelligence: 5, 
    focus: 5
  },
  streak: { 
    count: 0, 
    lastCompletedDate: "" 
  },
  xpReduction: 0,
  tasks: [],
  dailyQuests: [],
  currentAnomaly: {
    id: 1,
    hp: 100
  },
  inventory: [],
  activeEffects: [],
  creations: {
    summaries: [], // {id, title, content, createdAt}
    quizzes: [],   // {id, questions: [], flashcards: [], createdAt}
    corrections: [] // {id, originalText, content, createdAt}
  },
  agent: { // New data structure for the AI Agent
    lastPlanDate: null,
    energyProfile: {
      focusStart: '09:00', // Default focus start time
      focusEnd: '17:00',   // Default focus end time
      // e.g., 'morning': 0.8, 'afternoon': 0.6, 'evening': 0.9 (Learned energy levels)
    },
    taskTypePerformance: {
      // e.g., 'Study': { completed: 2, totalTime: 3600 }
    }
  },
  pomodoroSettings: { // New settings object
    workDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    sessionsBeforeLongBreak: 4
  },
  theme: 'dark', // Add theme preference
  focusHistory: [] // To track when focus sessions are completed
};

async function initializePlayerData() {
  const result = await new Promise(resolve => chrome.storage.local.get('playerData', resolve));
  let playerData = result.playerData;

  if (!playerData) {
    await savePlayerData(DEFAULT_PLAYER_DATA);
    return DEFAULT_PLAYER_DATA;
  }

  // Migration for older data structures
  let needsUpdate = false;
  if (!playerData.inventory) { playerData.inventory = []; needsUpdate = true; }
  if (playerData.name === undefined) { playerData.name = ''; needsUpdate = true; } // Player Name
  if (playerData.class === undefined) { playerData.class = null; needsUpdate = true; } // Flow Archetype
  if (playerData.stats.strength) { playerData.stats.discipline = playerData.stats.strength; delete playerData.stats.strength; needsUpdate = true; } // Migrate STR to DIS
  if (!playerData.stats.discipline) { playerData.stats.discipline = 5; needsUpdate = true; }
  if (playerData.gold) { playerData.credit = playerData.gold; delete playerData.gold; needsUpdate = true; } // Migrate Gold to Credit
  if (playerData.credit === undefined) { playerData.credit = 0; needsUpdate = true; }
  if (!playerData.activeEffects) { playerData.activeEffects = []; needsUpdate = true; }
  if (!playerData.currentAnomaly) { playerData.currentAnomaly = { ...DEFAULT_PLAYER_DATA.currentAnomaly }; needsUpdate = true; } // Migrate Boss to Anomaly
  if (!playerData.creations) { playerData.creations = { summaries: [], quizzes: [], corrections: [] }; needsUpdate = true; }
  if (!playerData.dailyQuests) { playerData.dailyQuests = []; needsUpdate = true; }
  if (!playerData.creations.corrections) { playerData.creations.corrections = []; needsUpdate = true; }
  if (playerData.xpReduction === undefined) { playerData.xpReduction = 0; needsUpdate = true; }
  if (!playerData.agent?.focusStart) { playerData.agent.focusStart = '09:00'; needsUpdate = true; }
  if (!playerData.agent?.focusEnd) { playerData.agent.focusEnd = '17:00'; needsUpdate = true; }
  if (!playerData.agent) { playerData.agent = { ...DEFAULT_PLAYER_DATA.agent }; needsUpdate = true; }
  if (!playerData.pomodoroSettings) { playerData.pomodoroSettings = { ...DEFAULT_PLAYER_DATA.pomodoroSettings }; needsUpdate = true; }

  if (!playerData.focusHistory) { playerData.focusHistory = []; needsUpdate = true; }
  if (!playerData.theme) { playerData.theme = 'dark'; needsUpdate = true; }
  if (needsUpdate) await savePlayerData(playerData);
  return playerData;
}

async function getPlayerData() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['playerData'], (result) => {
      resolve(result.playerData || DEFAULT_PLAYER_DATA);
    });
  });
}

async function savePlayerData(data) {
  return new Promise((resolve) => {
    chrome.storage.local.set({ playerData: data }, () => {
      if (chrome.runtime.lastError) {
        console.error('Error saving player data:', chrome.runtime.lastError.message);
        // Optionally, show a message to the user
        showTemporaryMessage('Error: Could not save progress!', 5000);
      }
      resolve();
    });
  });
}

async function updateDashboard() {
  const playerData = await getPlayerData();
  
  document.getElementById('level').textContent = playerData.level; // This is now in the ring
  document.getElementById('credit').textContent = playerData.credit;
  document.getElementById('discipline').textContent = playerData.stats.discipline;
  document.getElementById('intelligence').textContent = playerData.stats.intelligence;
  document.getElementById('focus').textContent = playerData.stats.focus;
  document.getElementById('streak').textContent = playerData.streak.count;
  
  const xpRequired = getXPRequired(playerData.level, playerData);
  const xpEl = document.getElementById('xp');
  if (xpEl) {
    // Use innerHTML to allow for styling the required XP part
    xpEl.innerHTML = `${playerData.xp}<span class="xp-required-text"> / ${xpRequired}</span>`;
  }
  const xpProgress = (playerData.xp / getXPRequired(playerData.level, playerData)) * 100;

  // Update XP Ring
  const ringEl = document.getElementById('xp-ring');
  if(ringEl) ringEl.style.setProperty('--xp-angle', `${xpProgress * 3.6}deg`);
  // Update player greeting
  const greetingEl = document.getElementById('player-greeting');  
  if (playerData.name) {
    greetingEl.textContent = `Welcome, ${playerData.name}!`;
    greetingEl.style.display = 'block';
  } else {
    greetingEl.style.display = 'none';
  }

  // Update class display
  const classDisplayEl = document.getElementById('class-display');
  if (playerData.class && CLASSES[playerData.class]) {
    const className = CLASSES[playerData.class].name; // Flow Archetype
    classDisplayEl.innerHTML = `Flow Archetype: <strong style="color: var(--text-light);">${className}</strong>`;
    classDisplayEl.style.display = 'block';
  } else {
    classDisplayEl.style.display = 'none';
  }

  // Update AI motivation quote
  const quoteEl = document.getElementById('ai-motivation-quote');
  if (quoteEl) {
    generateMotivation().then(quote => quoteEl.textContent = `"${quote}"`);
  }
  
  updateAnomalyDisplay(playerData);
}

function updateAnomalyDisplay(playerData) {
  if (!playerData.currentAnomaly) return;
  
  const anomaly = ANOMALIES.find(b => b.id === playerData.currentAnomaly.id);
  if (!anomaly) return;
  
  const anomalyHpPercent = (playerData.currentAnomaly.hp / anomaly.maxHp) * 100;
  
  document.getElementById('bossName').textContent = anomaly.name;
  document.getElementById('bossLevel').textContent = anomaly.level;
  document.getElementById('bossHp').textContent = playerData.currentAnomaly.hp;
  document.getElementById('bossMaxHp').textContent = anomaly.maxHp;
  document.getElementById('bossHpFill').style.width = `${Math.max(anomalyHpPercent, 0)}%`;

  // Update anomaly art
  const bossArtEl = document.getElementById('bossArt');
  bossArtEl.className = 'boss-art-placeholder'; // Reset classes
  bossArtEl.classList.add(anomaly.artClass);
}

function getTodayDate() {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

function getYesterdayDate() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toISOString().split('T')[0];
}

async function updateStreak(playerData) {
  const today = getTodayDate();
  const lastDate = playerData.streak.lastCompletedDate;
  const yesterday = getYesterdayDate();
  let isFirstTaskOfDay = false;
  
  if (lastDate === yesterday) {
    playerData.streak.count += 1;
    isFirstTaskOfDay = true;
  } else if (lastDate !== today) {
    // Streak is broken! Check for a streak saver.
    const streakSaverIndex = playerData.inventory.findIndex(itemId => ITEMS_CATALOG[itemId]?.effect?.type === 'streak_saver');
    if (streakSaverIndex !== -1) {
      const savedItem = ITEMS_CATALOG[playerData.inventory[streakSaverIndex]];
      // Consume the item
      playerData.inventory.splice(streakSaverIndex, 1);
      // Preserve the streak
      playerData.streak.count += 1; // Continue the streak as if it were yesterday
      isFirstTaskOfDay = true;
      showTemporaryMessage(`✨ Your ${savedItem.name} was consumed to preserve your streak!`);
    } else {
      // No saver, streak is reset.
      playerData.streak.count = 1;
      isFirstTaskOfDay = true;
    }
  }
  
  playerData.streak.lastCompletedDate = today;
  return { playerData, isFirstTaskOfDay };
}

/**
 * Parses a duration string (e.g., "30m", "1.5h") into minutes.
 * Replicated from agent.js to avoid cross-script dependency.
 * @param {string} durationStr - The duration string.
 * @returns {number | null} Duration in minutes or null if invalid.
 */
function parseDurationToMinutes(durationStr) {
  if (!durationStr) return null;
  const lowerStr = durationStr.toLowerCase();

  if (lowerStr.includes('h')) {
    const hours = parseFloat(lowerStr.replace('h', ''));
    return !isNaN(hours) ? hours * 60 : null;
  }
  if (lowerStr.includes('m')) {
    const minutes = parseInt(lowerStr.replace('m', ''), 10);
    return !isNaN(minutes) ? minutes : null;
  }
  return null;
}

function calculateQuestRewards(task) {
  const difficultyMultiplier = GAME_CONFIG.QUEST_REWARD_MULTIPLIERS[task.difficulty] || 1.0;
  
  const durationInMinutes = parseDurationToMinutes(task.duration) || 30; // Default to 30 mins if no duration
  const durationMultiplier = 1 + (durationInMinutes * GAME_CONFIG.QUEST_REWARD_SCALARS.duration);

  const daysUntilDue = task.deadline ? (new Date(task.deadline) - new Date()) / (1000 * 60 * 60 * 24) : Infinity;
  const urgencyMultiplier = (daysUntilDue <= 1) ? (1 + GAME_CONFIG.QUEST_REWARD_SCALARS.urgency) : 1.0;

  const totalMultiplier = difficultyMultiplier * durationMultiplier * urgencyMultiplier;

  const xpReward = Math.floor(GAME_CONFIG.TASK_BASE_XP * totalMultiplier);
  const creditReward = Math.floor(GAME_CONFIG.TASK_CREDIT * totalMultiplier);

  return { xpReward, creditReward };
}

function getXPRequired(level, playerData) {
  const baseXP = GAME_CONFIG.XP_BASE;
  const increase = GAME_CONFIG.XP_INCREASE_PER_LEVEL;
  const required = baseXP + (level - 1) * increase;
  return Math.floor(required * (1 - (playerData.xpReduction || 0)));
}

function getRandomStat(playerClass) {
  const stats = ['discipline', 'intelligence', 'focus'];
  const classInfo = CLASSES[playerClass];

  // If class has a preferred stat, give it a higher chance
  if (classInfo && classInfo.bonuses.preferred_stat) {
    // 50% chance for preferred stat, 25% for the others
    const roll = Math.random();
    if (roll < 0.5) {
      return classInfo.bonuses.preferred_stat;
    } else if (roll < 0.75) {
      return stats.filter(s => s !== classInfo.bonuses.preferred_stat)[0];
    } else {
      return stats.filter(s => s !== classInfo.bonuses.preferred_stat)[1];
    }
  }
  return stats[Math.floor(Math.random() * stats.length)]; // Default for Generalist or no class
}

async function checkLevelUp(playerData) {
  let leveledUp = false;
  
  let xpRequired = getXPRequired(playerData.level, playerData);
  while (playerData.xp >= xpRequired) {
    playerData.xp -= xpRequired; // Subtract required XP, carrying over the rest
    playerData.level += 1;
    
    const randomStat = getRandomStat(playerData.class);
    playerData.stats[randomStat] += 1;
    
    leveledUp = true;
    showLevelUpMessage(playerData.level, randomStat);
    triggerLevelUpAnimation();
    xpRequired = getXPRequired(playerData.level, playerData); // Recalculate for the new level
  }
  
  return { playerData, leveledUp };
}

function calculateDamage(stats, streakCount, taskDifficulty, playerClass, playerData) {
  // Create a mutable copy of stats for this calculation
  const tempStats = { ...stats };

  // Check for temporary stat boosts
  if (tempStats.temp_discipline) {
    tempStats.discipline += tempStats.temp_discipline;
  }

  const baseDamage = (tempStats.discipline * 0.8) + (tempStats.intelligence * 0.5) + (tempStats.focus * 0.4);
  
  // Apply difficulty multiplier
  const difficultyMultiplier = GAME_CONFIG.DAMAGE_DIFFICULTY_MULTIPLIERS[taskDifficulty] || 1.5; // Default to Medium

  // Check for guaranteed crit (this part will be added in completeTask)
  const randomMultiplier = tempStats.guaranteed_crit ? GAME_CONFIG.DAMAGE_RANDOM_HIGH : (GAME_CONFIG.DAMAGE_RANDOM_LOW + (Math.random() * (GAME_CONFIG.DAMAGE_RANDOM_HIGH - GAME_CONFIG.DAMAGE_RANDOM_LOW)));
  const streakBonus = 1 + (streakCount * GAME_CONFIG.STREAK_DAMAGE_MULTIPLIER);
  
  let totalDamage = baseDamage * difficultyMultiplier * randomMultiplier * streakBonus;

  // Apply class bonus
  const classInfo = CLASSES[playerClass];
  if (classInfo && classInfo.bonuses.damage_multiplier) {
    totalDamage *= classInfo.bonuses.damage_multiplier;
  }

  // Apply execute damage effect
  const executeEffect = playerData.activeEffects.find(e => e.type === 'execute_damage');
  if (executeEffect) {
    const anomaly = ANOMALIES.find(b => b.id === playerData.currentAnomaly.id);
    const missingHp = anomaly.maxHp - playerData.currentAnomaly.hp;
    totalDamage += missingHp * executeEffect.multiplier;
  }
  return Math.floor(totalDamage);
}

async function defeatAnomaly(playerData) { // Was defeatBoss
  const anomaly = ANOMALIES.find(b => b.id === playerData.currentAnomaly.id);
  const anomalyXP = GAME_CONFIG.ANOMALY_DEFEAT_XP;
  const anomalyCredit = GAME_CONFIG.ANOMALY_DEFEAT_CREDIT;
  
  playerData.xp += anomalyXP;
  playerData.credit += anomalyCredit;
  
  const nextAnomalyId = playerData.currentAnomaly.id + 1;
  const nextAnomaly = ANOMALIES.find(b => b.id === nextAnomalyId);
  
  if (nextAnomaly) {
    playerData.currentAnomaly = {
      id: nextAnomaly.id,
      hp: nextAnomaly.maxHp
    };
  } else {
    playerData.currentAnomaly = {
      id: ANOMALIES[0].id,
      hp: ANOMALIES[0].maxHp
    };
  }
  
  const victoryDialogue = await generateAnomalyDialogue(anomaly.name, true);
  showAnomalyVictoryMessage(anomaly.name, anomalyXP, anomalyCredit, victoryDialogue);
  
  return playerData;
}

async function grantRandomReward(playerData, isBossDefeat = false) {
  const possibleItems = Object.keys(ITEMS_CATALOG).filter(id => id !== 'encrypted_cache'); // Don't drop a chest from a chest
  let receivedItem = null;
  let dropChance = GAME_CONFIG.RANDOM_REWARD_CHANCE;

  // Apply class bonus for item drops
  const classInfo = CLASSES[playerData.class];
  if (classInfo && classInfo.bonuses.item_chance_boost) {
    dropChance += classInfo.bonuses.item_chance_boost;
  }
  
  // Apply item drop chance boost from effects
  const itemChanceEffect = playerData.activeEffects.find(e => e.type === 'item_chance_boost');
  if (itemChanceEffect) {
    dropChance *= itemChanceEffect.multiplier;
  }

  // Consume a charge from the item chance boost effect if it exists
  if (itemChanceEffect) {
    itemChanceEffect.charges -= 1;
    playerData.activeEffects = playerData.activeEffects.filter(e => e.charges > 0);
  }

  // Anomaly defeats guarantee a reward, tasks have a chance
  if (isBossDefeat || Math.random() < dropChance) {
    const randomItemId = possibleItems[Math.floor(Math.random() * possibleItems.length)];
    playerData.inventory.push(randomItemId);
    receivedItem = ITEMS_CATALOG[randomItemId];
  }

  if (receivedItem) {
    showTemporaryMessage(`🎁 Reward! You found: ${receivedItem.name}`);
  }

  return playerData;
}

async function completeTask(taskId, taskElement) {
  let playerData = await getPlayerData();
  
  const taskIndex = playerData.tasks.findIndex(t => t.id === taskId);
  if (taskIndex === -1) return;
  
  const task = playerData.tasks[taskIndex];

  // --- Agent Reflection ---
  // Calculate the actual time taken from creation to completion.
  const actualDuration = (new Date() - new Date(task.createdAt)) / 1000; // in seconds
  const outcome = {
    task: task,
    status: 'completed',
    actualDuration: actualDuration
  };
  
  const streakUpdateResult = await updateStreak(playerData);
  playerData = streakUpdateResult.playerData;
  const streakCount = playerData.streak.count;
  
  // --- New Dynamic Reward Calculation ---
  let { xpReward, creditReward } = calculateQuestRewards(task);
  // Add streak bonus on top of the calculated rewards
  xpReward += (playerData.streak.count * GAME_CONFIG.STREAK_BONUS_PER_DAY);

  // Apply class bonuses
  const classInfo = CLASSES[playerData.class];
  if (classInfo) {
    if (classInfo.bonuses.xp_multiplier) xpReward = Math.floor(xpReward * classInfo.bonuses.xp_multiplier);
  }

  // Check for and apply active Credit boost effects
  const creditBoostEffect = playerData.activeEffects.find(e => e.type === 'credit_boost');
  if (creditBoostEffect) {
    creditReward = Math.floor(creditReward * creditBoostEffect.multiplier);
    creditBoostEffect.charges -= 1;
  }

  // Check for and apply active XP boost effects
  const xpBoostEffect = playerData.activeEffects.find(e => e.type === 'xp_boost');
  if (xpBoostEffect) {
    xpReward = Math.floor(xpReward * xpBoostEffect.multiplier);
    xpBoostEffect.charges -= 1;
    showTemporaryMessage(`✨ XP Boost! +${(xpBoostEffect.multiplier - 1) * 100}% XP! (${xpBoostEffect.charges} charges left)`);
    
    // Remove effect if charges are used up
    if (xpBoostEffect.charges <= 0) {
      playerData.activeEffects = playerData.activeEffects.filter(e => e.type !== 'xp_boost');
    }
  }
  
  playerData.xp += xpReward;
  playerData.credit += creditReward;

  // Grant stat point based on task type
  const statGainInfo = TASK_TYPE_STAT_GAINS[task.type];
  if (statGainInfo) {
    let { stat, icon } = statGainInfo;
    // Use the new scaled stat rewards
    let statGainAmount = GAME_CONFIG.STAT_REWARD_VALUES[task.difficulty] || 1;
    // Apply Ascetic bonus for Focus gains from Habit tasks
    if (classInfo && classInfo.bonuses.focus_gain_multiplier && stat === 'focus' && task.type === 'Habit') {
      statGainAmount *= classInfo.bonuses.focus_gain_multiplier;
      // The stat gain might be a float, let's handle it. We can floor it for now.
      statGainAmount = Math.floor(statGainAmount); 
    }

    playerData.stats[stat] += statGainAmount;
    const statName = stat.charAt(0).toUpperCase() + stat.slice(1);
    showTemporaryMessage(`${icon} Quest Complete! +${statGainAmount} ${statName}`);
  }
  
  // Create a temporary stats object for damage calculation to apply effects
  const tempStats = { ...playerData.stats };

  // Check for and apply active damage-related effects
  const critEffect = playerData.activeEffects.find(e => e.type === 'guaranteed_crit');
  if (critEffect) {
    tempStats.guaranteed_crit = true;
    critEffect.charges -= 1;
    showTemporaryMessage('🎯 Critical Hit! Maximum damage dealt!');
  }

  const statBoostEffect = playerData.activeEffects.find(e => e.type === 'temp_stat_boost');
  if (statBoostEffect) {
    tempStats.temp_discipline = (tempStats.temp_discipline || 0) + statBoostEffect.amount;
    statBoostEffect.charges -= 1;
    showTemporaryMessage(`💪 Discipline Boost! +${statBoostEffect.amount} DIS for this stabilization!`);
  }

  // Clean up temporary stats after they've been used for calculation
  const cleanupTempStats = () => {
    delete tempStats.guaranteed_crit;
  }
  
  // Handle execute damage effect charge reduction
  const executeEffect = playerData.activeEffects.find(e => e.type === 'execute_damage');
  if (executeEffect) {
    executeEffect.charges -= 1;
  }

  // Remove any effects that have run out of charges
  playerData.activeEffects = playerData.activeEffects.filter(e => e.charges > 0);

  // Calculate damage with potentially modified stats
  const damage = calculateDamage(tempStats, streakCount, task.difficulty, playerData.class, playerData);
  cleanupTempStats(); // Clean up after calculation

  // Apply damage to anomaly
  playerData.currentAnomaly.hp -= damage;
  
  showAnomalyDamageMessage(damage);
  
  if (playerData.currentAnomaly.hp <= 0) {
    playerData = await defeatAnomaly(playerData);
    playerData = await grantRandomReward(playerData, true); // Guaranteed reward for boss
  }
  
  const levelUpResult = await checkLevelUp(playerData);
  playerData = levelUpResult.playerData;
  
  playerData.tasks.splice(taskIndex, 1);
  
  // Grant a potential random reward for completing a task
  playerData = await grantRandomReward(playerData, false);

  // --- Agent Reflection Trigger ---
  await QuestFlowAgent.reflect(outcome);

  // Animate task completion
  if (taskElement) {
    taskElement.classList.add('task-item-completed');
    taskElement.addEventListener('animationend', async () => {
      await savePlayerData(playerData);
      await updateDashboard();
      if (streakUpdateResult.isFirstTaskOfDay) {
        const flavorText = await generateStreakFlavorText(streakCount);
        showStreakMessage(flavorText);
      }
      renderTasks(); // Re-render to show empty message if needed
    }, { once: true });
  } else {
    // Fallback for cases where element isn't passed
    await savePlayerData(playerData);
    await updateDashboard();
    renderTasks();
  }
}

async function addDailyQuest() {
  const inputEl = document.getElementById('dailyQuestInput');
  const addBtn = document.getElementById('addDailyQuestSubmit');
  const text = inputEl.value.trim();
  if (!text) return;

  addBtn.disabled = true;
  addBtn.innerHTML = '<span class="spinner"></span>';

  try {
    const playerData = await getPlayerData();
    let difficultyData = await getDifficultyMultiplier(text, '', ''); // No duration/deadline for habits
    const preferredTime = await suggestRitualTimeOfDay(text); // Get the best time of day

    const newDailyQuest = {
      id: Date.now().toString(),
      text: text,
      difficulty: difficultyData.difficulty === 'Invalid' ? 'Easy' : difficultyData.difficulty,
      lastCompleted: null,
      preferredTime: preferredTime // Save the preferred time
    };

    playerData.dailyQuests.push(newDailyQuest);
    await savePlayerData(playerData);
    inputEl.value = '';
    renderDailyQuests();
  } finally {
    addBtn.disabled = false;
    addBtn.innerHTML = 'Add Habit';
  }
}

async function deleteDailyQuest(questId) {
  const confirmation = confirm("Are you sure you want to delete this daily habit? This cannot be undone.");
  if (!confirmation) return;

  let playerData = await getPlayerData();
  const initialLength = playerData.dailyQuests.length;
  playerData.dailyQuests = playerData.dailyQuests.filter(q => q.id !== questId);

  if (playerData.dailyQuests.length < initialLength) {
    await savePlayerData(playerData);
    await renderDailyQuests();
    showTemporaryMessage('Daily habit deleted.');
  } else {
    showTemporaryMessage('Could not find the habit to delete.');
  }
}

async function renderDailyQuests() {
  const playerData = await getPlayerData();
  const listEl = document.getElementById('dailyQuestList');
  const today = getTodayDate();

  if (playerData.dailyQuests.length === 0) {
    listEl.innerHTML = '<p class="welcome-text">Add a daily habit to build powerful routines.</p>';
    return;
  }

  listEl.innerHTML = playerData.dailyQuests.map(quest => {
    const isCompletedToday = quest.lastCompleted === today;

    // --- Calculate and format rewards for display ---
    const difficulty = quest.difficulty || 'Easy';
    const rewardMultiplier = GAME_CONFIG.DAILY_REWARD_MULTIPLIERS[difficulty] || 1.0;
    const xpReward = Math.floor(GAME_CONFIG.TASK_BASE_XP * rewardMultiplier);
    const creditReward = Math.floor(GAME_CONFIG.TASK_CREDIT * rewardMultiplier);
    let statGainAmount = 1;

    const classInfo = CLASSES[playerData.class];
    if (classInfo && classInfo.bonuses.focus_gain_multiplier) {
      statGainAmount = Math.floor(statGainAmount * classInfo.bonuses.focus_gain_multiplier);
    }

    const rewardsHTML = `
      <span class="reward-item">⭐ ${xpReward} XP</span> 
      <span class="reward-item">💰 ${creditReward} Credit</span> 
      <span class="reward-item">🎯 +1 FOCUS</span>`;

    return `
      <div class="task-item difficulty-${quest.difficulty.toLowerCase()} ${isCompletedToday ? 'task-item-daily-completed' : ''}">
        <div class="task-info">
          <div class="task-text">${quest.text}</div>
          <div class="task-meta">Daily Habit • ${quest.difficulty}</div>
          <div class="task-rewards">${rewardsHTML}</div>
        </div>
        <div class="task-actions">
          <button class="delete-btn" data-delete-daily-id="${quest.id}" title="Delete Ritual">×</button>
          <button class="complete-btn" data-daily-quest-id="${quest.id}" ${isCompletedToday ? 'disabled' : ''}>✓</button>
        </div>
      </div>
    `;
  }).join('');

  // Add listener for complete buttons
  document.querySelectorAll('.complete-btn[data-daily-quest-id]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const questId = e.target.getAttribute('data-daily-quest-id');
      completeDailyQuest(questId, e.target.closest('.task-item'));
    });
  });

  // Add listener for delete buttons
  document.querySelectorAll('.delete-btn[data-delete-daily-id]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const questId = e.target.getAttribute('data-delete-daily-id');
      deleteDailyQuest(questId);
    });
  });
}

async function completeDailyQuest(questId, questElement) {
  let playerData = await getPlayerData();
  const questIndex = playerData.dailyQuests.findIndex(q => q.id === questId);
  if (questIndex === -1) return;

  const today = getTodayDate();
  if (playerData.dailyQuests[questIndex].lastCompleted === today) {
    showTemporaryMessage("You've already completed this habit today!");
    return;
  }

  // Mark as completed for today
  playerData.dailyQuests[questIndex].lastCompleted = today;

  // --- Grant Rewards, now scaled by difficulty ---
  const difficulty = playerData.dailyQuests[questIndex].difficulty || 'Easy';
  const rewardMultiplier = GAME_CONFIG.DAILY_REWARD_MULTIPLIERS[difficulty] || 1.0;

  const xpReward = Math.floor(GAME_CONFIG.TASK_BASE_XP * rewardMultiplier);
  const creditReward = Math.floor(GAME_CONFIG.TASK_CREDIT * rewardMultiplier);
  let statGainAmount = 1;

  playerData.xp += xpReward;
  playerData.credit += creditReward;

  // Ascetic bonus for focus gain from habits
  const classInfo = CLASSES[playerData.class];
  if (classInfo && classInfo.bonuses.focus_gain_multiplier) {
    statGainAmount = Math.floor(statGainAmount * classInfo.bonuses.focus_gain_multiplier);
  }
  playerData.stats.focus += statGainAmount;
  showTemporaryMessage(`🎯 Habit synced! +${xpReward} XP, +${creditReward} Credit, +${statGainAmount} Focus`);

  // No damage to anomaly for daily habits to keep them as a separate progression loop

  const levelUpResult = await checkLevelUp(playerData);
  playerData = levelUpResult.playerData;

  // Animate completion without removing the element
  if (questElement) {
    questElement.classList.add('task-item-daily-completed');
    questElement.querySelector('.complete-btn').disabled = true;
  }

  await savePlayerData(playerData);
  await updateDashboard();
}

async function addTask() {
  const taskInput = document.getElementById('taskInput');
  const durationInput = document.getElementById('taskDuration');
  const deadlineInput = document.getElementById('taskDeadline');
  const addTaskBtn = document.getElementById('addTaskSubmit');
  const taskText = taskInput.value.trim();
  const duration = durationInput.value.trim();
  let deadline = deadlineInput.value;
  
  if (!taskText) return;

  addTaskBtn.disabled = true;
  addTaskBtn.innerHTML = '<span class="spinner"></span>Analyzing...';

  try {
    const playerData = await getPlayerData();
    
    const taskType = await suggestTaskType(taskText);
    const difficultyData = await getDifficultyMultiplier(taskText, duration, deadline);

    if (taskType === 'Invalid' || difficultyData.difficulty === 'Invalid') {
      showTemporaryMessage('🤔 That quest seems unclear. Please provide more details!', 4000);
      return;
    }
    
    // If the user didn't provide a duration, ask the agent for an estimate.
    const finalDuration = duration || await QuestFlowAgent.getFormattedTaskEstimate(taskType) || '';

    const newTask = {
      id: Date.now().toString(),
      text: taskText,
      type: taskType,
      difficulty: difficultyData.difficulty,
      duration: finalDuration, // Can be user-provided or agent-estimated
      deadline: deadline, // Can be empty
      createdAt: new Date().toISOString()
    };
    
    playerData.tasks.push(newTask);
    await savePlayerData(playerData);
    
    durationInput.value = '';
    deadlineInput.value = '';
    taskInput.value = '';
    renderTasks();
    renderDailyQuests(); // Also re-render dailies in case of data change
  } finally {
    addTaskBtn.disabled = false;
    addTaskBtn.innerHTML = 'Add Quest';
  }
}

async function renderTasks() {
  const playerData = await getPlayerData();
  const taskList = document.getElementById('taskList');
  const today = getTodayDate();
  
  if (playerData.tasks.length === 0) {
    taskList.innerHTML = '<p class="welcome-text">Welcome, adventurer! Add a quest to begin your journey.</p>';
    return;
  }
  
  // Sort tasks: by deadline (soonest first), then by creation date for those without deadlines
  const sortedTasks = playerData.tasks.sort((a, b) => {
    const aHasDeadline = !!a.deadline;
    const bHasDeadline = !!b.deadline;

    if (aHasDeadline && !bHasDeadline) return -1; // a comes first
    if (!aHasDeadline && bHasDeadline) return 1;  // b comes first
    if (aHasDeadline && bHasDeadline) {
      return new Date(a.deadline) - new Date(b.deadline);
    }
    // Neither has a deadline, sort by creation date (newest first)
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  const isTaskUrgent = (deadline) => {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0); // Set to the beginning of today
    const endOfTomorrow = new Date(todayStart);
    endOfTomorrow.setDate(todayStart.getDate() + 2); // This gives the start of the day after tomorrow
    const taskDeadline = new Date(deadline);
    return taskDeadline < endOfTomorrow;
  };

  taskList.innerHTML = sortedTasks.map(task => {
    const isUrgent = task.deadline && isTaskUrgent(task.deadline);
    const urgentClass = isUrgent ? 'task-urgent' : '';
    const urgentIndicator = isUrgent ? '<span class="urgent-indicator">🔥 URGENT</span>' : '';

    // --- New: Calculate dynamic rewards for display ---
    const { xpReward, creditReward } = calculateQuestRewards(task);
    const statGainInfo = TASK_TYPE_STAT_GAINS[task.type];

    // Account for Analyst's XP bonus
    const classInfo = CLASSES[playerData.class];
    if (classInfo && classInfo.bonuses.xp_multiplier) { // This is a base display, the completion function will apply the bonus.
      xpReward = Math.floor(xpReward * classInfo.bonuses.xp_multiplier);
    }

    let rewardsHTML = `<span class="reward-item">⭐ ${xpReward} XP</span> <span class="reward-item">💰 ${creditReward} Credit</span>`;
    if (statGainInfo) {
      const statReward = GAME_CONFIG.STAT_REWARD_VALUES[task.difficulty] || 1;
      rewardsHTML += ` <span class="reward-item">${statGainInfo.icon} +${statReward} ${statGainInfo.stat.toUpperCase()}</span>`;
    }

    return `
    <div class="task-item difficulty-${task.difficulty.toLowerCase()} ${urgentClass}">
      <div class="task-info">
        <div class="task-text">${task.text}</div>
        <div class="task-meta">
          ${urgentIndicator}
          <span>${task.type} • ${task.difficulty}</span>
          ${task.duration ? `<span class="task-meta-duration"> • ${task.duration}</span>` : ''}
          ${task.deadline ? `<span class="task-meta-deadline">Due: ${new Date(task.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>` : ''}
        </div>
        <div class="task-rewards">${rewardsHTML}</div>
      </div>
      <button class="complete-btn" data-task-id="${task.id}">✓</button>
    </div>
  `}).join('');
  
  document.querySelectorAll('.complete-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const taskId = e.target.getAttribute('data-task-id');
      const taskElement = e.target.closest('.task-item');
      completeTask(taskId, taskElement);
    });
  });
}

/**
 * Displays a notification that stacks with others.
 * @param {string} htmlContent The message to display (can be HTML).
 * @param {string} type A class for styling (e.g., 'levelup', 'damage').
 * @param {number} duration Time in ms before the notification fades.
 */
function showNotification(htmlContent, type = 'info', duration = 4000) {
  const container = document.getElementById('notification-container');
  if (!container) return;

  const notification = document.createElement('div');
  notification.className = `notification-item notification-${type}`;
  notification.innerHTML = htmlContent;

  container.appendChild(notification);

  // Set a timer to remove the notification
  setTimeout(() => {
    notification.classList.add('fading-out'); // Start the fade-out animation
    // Use a timeout that matches the CSS transition duration to remove the element.
    // This is more reliable than the 'transitionend' event which can fire multiple times.
    // The CSS transition is 0.4s, so we'll wait 500ms to be safe.
    setTimeout(() => notification.remove(), 500);
  }, duration);
}

function showStreakMessage(message) {
  showNotification(`🔥 ${message}`, 'streak', 5000);
}

function showLevelUpMessage(newLevel, statIncreased) {
  const statNames = {
    'discipline': 'Discipline 💪', // Was Strength
    'intelligence': 'Intelligence 🧠',
    'focus': 'Focus 🎯'
  };
  const message = `
    <div style="font-weight: bold; font-size: 1.2em;">⚡ MIND TIER UP! ⚡</div>
    <div>You reached Mind Tier ${newLevel}!</div>
    <div style="margin-top: 4px;">+1 ${statNames[statIncreased]}</div>`;
  showNotification(message, 'levelup', 4000);
}

/**
 * Creates and triggers the visual "Flow Surge" animation on level up.
 */
function triggerLevelUpAnimation() {
  const surgeRing = document.createElement('div');
  surgeRing.className = 'flow-surge-ring';
  document.body.appendChild(surgeRing);

  // Remove the element after the animation is done to keep the DOM clean
  surgeRing.addEventListener('animationend', () => surgeRing.remove());
}

function showStatUpMessage(stat) {
  const statNames = {
    'discipline': 'Discipline 💪',
    'intelligence': 'Intelligence 🧠',
    'focus': 'Focus 🎯'
  };
  const message = `
    <div style="font-weight: bold; font-size: 1.1em;">📈 Stat Increased!</div>
    <div>Your ${statNames[stat]} has permanently increased!</div>`;
  showNotification(message, 'info', 3500);
}

function showAnomalyDamageMessage(damage) {
  showNotification(`💥 Stabilized for ${damage} points!`, 'damage', 2000);
}

function showAnomalyVictoryMessage(bossName, xp, gold, dialogue) {
  const message = `
    <div style="font-weight: bold; font-size: 1.2em;">🏆 VICTORY! 🏆</div>
    <div>${dialogue}</div>
    <div style="margin-top: 4px;">+${xp} XP, +${gold} Credit</div>`;
  showNotification(message, 'victory', 5000);
}

/**
 * Renders the 3-stat radar chart on the canvas.
 * @param {object} stats - The player's stats object { discipline, intelligence, focus }.
 */
function renderRadarChart(stats) {
  const canvas = document.getElementById('radar-chart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const width = canvas.width;
  const height = canvas.height;
  const center = { x: width / 2, y: height / 2 };
  const radius = width * 0.4; // 40% of canvas width
  const maxStatValue = 50; // The value represented by the outermost ring

  // Clear canvas
  ctx.clearRect(0, 0, width, height);

  const statKeys = ['discipline', 'intelligence', 'focus'];
  const angleSlice = (Math.PI * 2) / 3;

  // --- Draw Grid Lines ---
  ctx.strokeStyle = 'rgba(138, 138, 142, 0.3)'; // --text-dark with opacity
  ctx.lineWidth = 1;

  // Draw 3 concentric triangles for the grid
  for (let i = 1; i <= 3; i++) {
    const gridRadius = (radius / 3) * i;
    ctx.beginPath();
    for (let j = 0; j < 3; j++) {
      const angle = j * angleSlice - (Math.PI / 2); // Start with top point
      const x = center.x + gridRadius * Math.cos(angle);
      const y = center.y + gridRadius * Math.sin(angle);
      if (j === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();
  }

  // --- Draw Axes and Labels ---
  ctx.font = 'bold 12px "Space Mono", monospace';
  ctx.fillStyle = 'rgba(234, 234, 234, 0.8)'; // --text-light with opacity

  for (let i = 0; i < 3; i++) {
    const angle = i * angleSlice - (Math.PI / 2);
    const x = center.x + radius * Math.cos(angle);
    const y = center.y + radius * Math.sin(angle);

    // Draw axis line
    ctx.beginPath();
    ctx.moveTo(center.x, center.y);
    ctx.lineTo(x, y);
    ctx.stroke();

    // Draw label
    const label = statKeys[i].substring(0, 3).toUpperCase();
    const labelX = center.x + (radius + 20) * Math.cos(angle);
    const labelY = center.y + (radius + 20) * Math.sin(angle);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, labelX, labelY);
  }

  // --- Draw Player Stat Polygon ---
  ctx.beginPath();
  for (let i = 0; i < 3; i++) {
    const statValue = stats[statKeys[i]] || 0;
    const statRatio = Math.min(statValue / maxStatValue, 1); // Cap at max value
    const statRadius = radius * statRatio;
    const angle = i * angleSlice - (Math.PI / 2);

    const x = center.x + statRadius * Math.cos(angle);
    const y = center.y + statRadius * Math.sin(angle);

    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();

  // Fill the polygon
  ctx.fillStyle = 'rgba(99, 102, 241, 0.4)'; // --accent-primary with opacity
  ctx.fill();

  // Stroke the polygon
  ctx.strokeStyle = 'rgba(0, 224, 184, 1)'; // --accent-secondary
  ctx.lineWidth = 2;
  ctx.stroke();

  // Draw points at each vertex
  for (let i = 0; i < 3; i++) {
    const statValue = stats[statKeys[i]] || 0;
    const statRatio = Math.min(statValue / maxStatValue, 1);
    const statRadius = radius * statRatio;
    const angle = i * angleSlice - (Math.PI / 2);
    const x = center.x + statRadius * Math.cos(angle);
    const y = center.y + statRadius * Math.sin(angle);

    ctx.beginPath();
    ctx.arc(x, y, 3, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 224, 184, 1)';
    ctx.fill();
  }
}

/**
 * A centralized function to manage which panel is visible.
 * It ensures only one panel is open at a time for a smooth UI.
 * @param {string | null} panelIdToShow The ID of the panel to show, or null to show the default content area.
 */
function showPanel(panelIdToShow) {
  const ALL_PANELS = ['pomodoro-panel', 'study-tools-panel', 'inventory-panel', 'notes-panel', 'settings-panel'];

  // Loop through all panels
  ALL_PANELS.forEach(id => {
    const panel = document.getElementById(id);
    if (!panel) return;

    if (id === panelIdToShow) {
      // Toggle the visibility of the selected panel
      const isCurrentlyVisible = panel.style.display === 'block';
      panel.style.display = isCurrentlyVisible ? 'none' : 'block';
      // If we just made it visible, run its render function
      if (!isCurrentlyVisible) {
        if (id === 'inventory-panel') {
          renderInventory();
        } else if (id === 'notes-panel') {
          renderNotesPanel();
        } else if (id === 'settings-panel') {
          // When opening settings, populate the focus hours inputs
          getPlayerData().then(playerData => {
            document.getElementById('focusStartInput').value = playerData.agent.focusStart || '09:00';
            document.getElementById('focusEndInput').value = playerData.agent.focusEnd || '17:00';
            // Populate Pomodoro settings
            document.getElementById('pomodoroWorkDuration').value = playerData.pomodoroSettings.workDuration;
            document.getElementById('pomodoroShortBreak').value = playerData.pomodoroSettings.shortBreakDuration;
            document.getElementById('pomodoroLongBreak').value = playerData.pomodoroSettings.longBreakDuration;
            document.getElementById('pomodoroSessions').value = playerData.pomodoroSettings.sessionsBeforeLongBreak;
            renderFocusAnalysis(playerData.focusHistory);
          });
        }
      }
    } else {
      // Hide all other panels
      panel.style.display = 'none';
    }
  });
}

/**
 * Analyzes focus history and renders the bar chart in the settings panel.
 * @param {Array} focusHistory - The player's focus history array.
 */
function renderFocusAnalysis(focusHistory) {
  const analysis = {
    morning: 0,   // 5am - 12pm
    afternoon: 0, // 12pm - 6pm
    evening: 0    // 6pm - 12am
  };

  if (focusHistory) {
    focusHistory.forEach(session => {
      const hour = new Date(session.timestamp).getHours();
      if (hour >= 5 && hour < 12) {
        analysis.morning += session.duration;
      } else if (hour >= 12 && hour < 18) {
        analysis.afternoon += session.duration;
      } else if (hour >= 18 && hour < 24) {
        analysis.evening += session.duration;
      }
    });
  }

  const morningBar = document.getElementById('morning-bar');
  const afternoonBar = document.getElementById('afternoon-bar');
  const eveningBar = document.getElementById('evening-bar');
  const morningValue = document.getElementById('morning-value');
  const afternoonValue = document.getElementById('afternoon-value');
  const eveningValue = document.getElementById('evening-value');

  const maxMinutes = Math.max(1, analysis.morning, analysis.afternoon, analysis.evening); // Avoid division by zero

  const setBar = (barEl, valueEl, minutes) => {
    if (barEl && valueEl) {
      const percentage = (minutes / maxMinutes) * 100;
      barEl.style.height = `${percentage}%`;
      valueEl.textContent = `${minutes}m`;
      // Highlight the most productive time
      if (minutes > 0 && percentage === 100) {
        barEl.style.filter = 'brightness(1.2)';
      } else {
        barEl.style.filter = 'none';
      }
    }
  };

  setBar(morningBar, morningValue, analysis.morning);
  setBar(afternoonBar, afternoonValue, analysis.afternoon);
  setBar(eveningBar, eveningValue, analysis.evening);
}

// In-memory timer state
let pomodoroInterval = null;
let pomodoroState = {
  isRunning: false,
  isWork: true,
  remainingSeconds: 25 * 60,
  activeQuestId: null, // To link a pomodoro session to a specific quest
  sessionCount: 0 // To track sessions for long breaks
};

function initPomodoroUI() {
  const startBtn = document.getElementById('pomodoro-start');
  const pauseBtn = document.getElementById('pomodoro-pause');
  const resetBtn = document.getElementById('pomodoro-reset');

  if (startBtn) startBtn.addEventListener('click', startPomodoro);
  if (pauseBtn) pauseBtn.addEventListener('click', pausePomodoro);
  if (resetBtn) resetBtn.addEventListener('click', resetPomodoro);

  loadPomodoroState();
}

async function loadPomodoroState() {
  const res = await new Promise(resolve => chrome.storage.local.get(['pomodoro', 'playerData'], resolve));
  const playerData = res.playerData || await getPlayerData(); // Ensure we have player data for settings
  const settings = playerData.pomodoroSettings;

    const saved = res.pomodoro || {};
    pomodoroState.isRunning = !!saved.isRunning;
    pomodoroState.isWork = (typeof saved.isWork === 'boolean') ? saved.isWork : true;
    pomodoroState.remainingSeconds = (typeof saved.remainingSeconds === 'number') ? saved.remainingSeconds : (settings.workDuration * 60);
    pomodoroState.activeQuestId = saved.activeQuestId || null;
    pomodoroState.sessionCount = saved.sessionCount || 0; // This line was missing

    if (typeof playerData.totalFocusMinutes !== 'number') {
      playerData.totalFocusMinutes = 0;
      await savePlayerData(playerData);
    }

    updatePomodoroDisplay();
    if (pomodoroState.isRunning) startPomodoroInterval();
}

function savePomodoroState() {
  chrome.storage.local.set({ pomodoro: pomodoroState });
}

function startPomodoro(questId = null) {
  // If a questId is passed via an event, extract it. Otherwise, use what's passed.
  const finalQuestId = (typeof questId === 'string') ? questId : null;

  if (pomodoroState.isRunning) return;
  if (!pomodoroState.remainingSeconds || pomodoroState.remainingSeconds <= 0) {
    resetPomodoro(); // This will set the correct work duration
  }
  pomodoroState.isRunning = true;

  // Only update the active quest ID if a new one is explicitly provided.
  // This prevents it from being cleared when resuming a paused session.
  if (finalQuestId) {
    pomodoroState.activeQuestId = finalQuestId;
  }
  savePomodoroState();
  startPomodoroInterval();
  updatePomodoroDisplay();
}

function pausePomodoro() {
  if (!pomodoroState.isRunning) return;
  pomodoroState.isRunning = false;
  savePomodoroState();
  if (pomodoroInterval) { clearInterval(pomodoroInterval); pomodoroInterval = null; }
  updatePomodoroDisplay();
}

async function resetPomodoro() {
  const playerData = await getPlayerData();
  pomodoroState.isRunning = false;
  pomodoroState.isWork = true;
  pomodoroState.remainingSeconds = playerData.pomodoroSettings.workDuration * 60;
  pomodoroState.activeQuestId = null; // Clear active quest on reset
  savePomodoroState();
  if (pomodoroInterval) { clearInterval(pomodoroInterval); pomodoroInterval = null; }
  updatePomodoroDisplay();
}

async function startPomodoroInterval() {
  if (pomodoroInterval) clearInterval(pomodoroInterval);
  pomodoroInterval = setInterval(() => {
    pomodoroState.remainingSeconds -= 1;
    if (pomodoroState.remainingSeconds <= 0) {
      clearInterval(pomodoroInterval);
      pomodoroInterval = null;
      pomodoroState.isRunning = false;
      handlePomodoroSessionComplete();
    }
    updatePomodoroDisplay();
    savePomodoroState();
  }, 1000);
}

async function handlePomodoroSessionComplete() {
  const playerData = await getPlayerData();
  const settings = playerData.pomodoroSettings;

  if (pomodoroState.isWork) {
    const classInfo = CLASSES[playerData.class];

    // XP reward now scales with Focus stat
    const focusBonusXp = Math.floor(playerData.stats.focus / 5); // +1 XP for every 5 Focus
    const xpReward = GAME_CONFIG.POMODORO_WORK_XP + focusBonusXp;

    // Focus stat gain can be boosted by Monk class
    let focusGain = GAME_CONFIG.POMODORO_WORK_FOCUS_GAIN;
    if (classInfo && classInfo.bonuses.focus_gain_multiplier) {
      focusGain *= classInfo.bonuses.focus_gain_multiplier;
    }    
    focusGain = Math.round(focusGain); // Round to nearest whole number

    playerData.xp += xpReward;
    playerData.stats.focus += focusGain;
    playerData.totalFocusMinutes = (playerData.totalFocusMinutes || 0) + settings.workDuration;

    // Log the completed session for focus analysis
    const sessionLog = {
      timestamp: new Date().toISOString(),
      duration: settings.workDuration
    };
    if (!playerData.focusHistory) playerData.focusHistory = [];
    playerData.focusHistory.push(sessionLog);

    // If this session was linked to a quest, deal damage to the anomaly but DO NOT complete the task.
    if (pomodoroState.activeQuestId) {
      const questId = pomodoroState.activeQuestId;
      const activeTask = playerData.tasks.find(t => t.id === questId);
      if (activeTask) {
        const damage = calculateDamage(playerData.stats, playerData.streak.count, activeTask.difficulty, playerData.class, playerData);
        playerData.currentAnomaly.hp -= damage;
        showAnomalyDamageMessage(damage);
        showTemporaryMessage(`⚔️ Stabilized Anomaly by ${damage} points by focusing on your task!`);

        if (playerData.currentAnomaly.hp <= 0) {
          playerData = await defeatAnomaly(playerData);
          playerData = await grantRandomReward(playerData, true); // Anomaly defeat reward
        }
      }
    }

    await savePlayerData(playerData);
    await updateDashboard();

    pomodoroState.sessionCount++; // Increment session count after a work session
    showTemporaryMessage(`Pomodoro complete! +${xpReward} XP, +${focusGain} Focus`);
  } else {
    showTemporaryMessage('Break complete — ready for the next focus session!');
  }

  // Flip mode and set timer for the next session
  pomodoroState.isWork = !pomodoroState.isWork;
  if (pomodoroState.isWork) {
    // Starting a new work session
    pomodoroState.remainingSeconds = settings.workDuration * 60;
  } else {
    // Starting a break session
    const isLongBreak = pomodoroState.sessionCount > 0 && pomodoroState.sessionCount % settings.sessionsBeforeLongBreak === 0;
    pomodoroState.remainingSeconds = (isLongBreak ? settings.longBreakDuration : settings.shortBreakDuration) * 60;
  }
  pomodoroState.activeQuestId = null; // Clear the linked quest ID
  pomodoroState.isRunning = false;
  savePomodoroState();
  updatePomodoroDisplay();
}

function formatTime(seconds) {
  seconds = Math.max(0, Math.floor(seconds));
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

async function updatePomodoroDisplay() {
  const timerEl = document.getElementById('pomodoro-timer');
  const statusEl = document.getElementById('pomodoro-status');
  const questDisplayEl = document.getElementById('pomodoro-quest-display');
  const sessionCountEl = document.getElementById('pomodoro-session-count');
  const focusEl = document.getElementById('focus-minutes');
  const startBtn = document.getElementById('pomodoro-start');
  if (!timerEl || !statusEl || !focusEl || !questDisplayEl || !sessionCountEl) return;
  
  const playerData = await getPlayerData(); // Moved this line up
  timerEl.textContent = formatTime(pomodoroState.remainingSeconds);
  statusEl.textContent = pomodoroState.isWork ? (pomodoroState.isRunning ? 'Work session (running)' : 'Work session') : (pomodoroState.isRunning ? 'Break (running)' : 'Break');
  if (startBtn) startBtn.textContent = pomodoroState.isWork ? 'Start Flow' : 'Start Break';

  // Display the active quest, if any
  if (pomodoroState.activeQuestId && pomodoroState.isWork) {
    const activeQuest = playerData.tasks.find(t => t.id === pomodoroState.activeQuestId);
    if (activeQuest) {
      questDisplayEl.textContent = `Focusing on: "${activeQuest.text}"`;
      questDisplayEl.style.display = 'block';
    }
  } else {
    questDisplayEl.textContent = '';
    questDisplayEl.style.display = 'none';
  }

  // Display session count
  const settings = playerData.pomodoroSettings;
  sessionCountEl.textContent = `Session: ${pomodoroState.sessionCount} / ${settings.sessionsBeforeLongBreak}`;

  const totalFocusMinutes = playerData.totalFocusMinutes || 0;
  
  if (focusEl) {
    focusEl.textContent = `Total Focus: ${totalFocusMinutes}m`;
  }
}

function showTemporaryMessage(text, timeout = 3500, options = {}) {
  // This function is now a wrapper for the new notification system.
  // Options like retry buttons are complex for this new system, so we simplify.
  showNotification(text, 'info', timeout);
}

/**
 * Handles the download of the AI model when triggered by the user.
 */
async function handleModelDownload() {
  try {
    showNotification('Starting AI model download... Please approve the browser prompt. <div id="download-progress-container" style="margin-top: 8px; background: #555; border-radius: 4px; overflow: hidden;"><div id="download-progress-bar" style="width: 0%; height: 6px; background: #c89b3c; transition: width 0.2s ease;"></div></div>', 'download', 20000);

    // This function from ai.js is designed to be called from a user gesture.
    // It will trigger the browser's download prompt.
    await window.ai.requestModelDownload((progress) => {
      const progressBar = document.getElementById('download-progress-bar');
      if (progressBar) {
        progressBar.style.width = `${Math.round(progress * 100)}%`;
      }
    });

    showNotification('✅ AI Model downloaded successfully!', 'success', 5000);
  } catch (error) {
    console.error('AI model download failed:', error);
    showNotification('Download failed. Please try again.', 'error', 10000);
  }
}

async function handleSummarize() {
  const inputEl = document.getElementById('summarizer-input');
  const outputContainer = document.getElementById('summarizer-output-container');
  const actionsContainer = document.getElementById('summarizer-actions');
  const outputEl = document.getElementById('summarizer-output');
  const summarizeBtn = document.getElementById('summarize-btn');

  const text = inputEl.value;
  if (!text.trim()) return;

  actionsContainer.innerHTML = ''; // Clear previous buttons
  outputContainer.style.display = 'block';
  outputEl.innerHTML = '<span class="spinner"></span>'; // Start with just the spinner
  summarizeBtn.disabled = true;

  try {
    let fullSummary = '';
    outputEl.textContent = ''; // Clear spinner before streaming
    for await (const chunk of await window.ai.streamSummarizeText(text)) {
      outputEl.textContent += chunk; // Append each chunk
      fullSummary += chunk;
    }

    // Add a "Save to Notes" button
    const saveBtn = document.createElement('button');
    saveBtn.textContent = 'Save to Notes';
    saveBtn.className = 'action-btn secondary small-btn';
    saveBtn.onclick = async () => {
      const playerData = await getPlayerData();
      const newSummary = { id: Date.now().toString(), title: text.substring(0, 40) + '...', content: fullSummary, createdAt: new Date().toISOString() };
      playerData.creations.summaries.unshift(newSummary);
      await savePlayerData(playerData);
      showTemporaryMessage('✅ Summary saved!');
      saveBtn.textContent = 'Saved!';
      saveBtn.disabled = true;
    };
    actionsContainer.appendChild(saveBtn);

    // Add a "Copy" button
    const copyBtn = document.createElement('button');
    copyBtn.textContent = 'Copy';
    copyBtn.className = 'action-btn tertiary small-btn';
    copyBtn.style.marginLeft = '8px';
    copyBtn.onclick = () => {
      navigator.clipboard.writeText(fullSummary).then(() => {
        copyBtn.textContent = 'Copied!';
        setTimeout(() => { copyBtn.textContent = 'Copy'; }, 2000);
      });
    };
    actionsContainer.appendChild(copyBtn);
  } finally {
    summarizeBtn.disabled = false;
  }
}

async function handleGenerateQuiz() {
  const inputEl = document.getElementById('summarizer-input');
  const outputContainer = document.getElementById('quiz-output-container');
  const quizContentEl = document.getElementById('quiz-content');
  const actionsContainer = document.getElementById('quiz-actions');
  const quizBtn = document.getElementById('generate-quiz-btn');

  const text = inputEl.value;
  if (!text.trim()) {
    showTemporaryMessage('Please provide some text in the summarizer input to generate a quiz from.', 4000);
    return;
  }

  outputContainer.style.display = 'block';
  actionsContainer.innerHTML = ''; // Clear previous buttons
  quizBtn.disabled = true;

  // Show a loading indicator
  quizContentEl.innerHTML = '<div class="output-box"><span class="spinner"></span>Generating quiz...</div>';

  try {
    // Use the non-streaming version of the AI function
    const rawText = await window.ai.generateQuiz(text);

    // Now parse and render the complete text
    const { questions, flashcards } = parseQuizAndFlashcards(rawText);

    let html = '';

    if (questions.length > 0) {
      html += '<h4>📝 Quiz Questions</h4>';
      html += questions.map(q => `
        <div class="quiz-item">
          <p><strong>${q.question}</strong></p>
          <ul class="quiz-options">
            ${q.options.map((opt, index) => `<li>${String.fromCharCode(65 + index)}) ${opt}</li>`).join('')}
          </ul>
          <button class="action-btn tertiary small-btn show-answer-btn">Show Answer</button>
          <p class="quiz-answer" style="display:none;"><strong>Answer:</strong> ${q.answer}</p>
        </div>
      `).join('');
    }

    if (flashcards.length > 0) {
      html += '<h4 style="margin-top: 20px;">🃏 Flashcards</h4>';
      html += flashcards.map(f => `
        <div class="flashcard-item">
          <p><strong>Front:</strong> ${f.front}</p>
          <button class="action-btn tertiary small-btn show-answer-btn">Show Back</button>
          <p class="quiz-answer" style="display:none;"><strong>Back:</strong> ${f.back}</p>
        </div>
      `).join('');
    }

    if (html) {
      quizContentEl.innerHTML = html; // Render into the dedicated content element
      // Add event listeners to the new buttons
      quizContentEl.querySelectorAll('.show-answer-btn').forEach(button => {
        button.addEventListener('click', (e) => {
          e.target.style.display = 'none';
          e.target.nextElementSibling.style.display = 'block';
        });
      });
    } else {
      // If parsing fails, show the raw text
      quizContentEl.innerHTML = `<div class="output-box">${rawText.replace(/\n/g, '<br>')}</div>`;
    }

    actionsContainer.innerHTML = ''; // Clear and re-add buttons at the end

    // Add a "Save to Notes" button
    const saveBtn = document.createElement('button');
    saveBtn.textContent = 'Save to Notes';
    saveBtn.className = 'action-btn secondary small-btn';
    saveBtn.onclick = async () => {
      const savedQuizData = { questions, flashcards };
      const playerData = await getPlayerData();
      const newQuiz = { id: Date.now().toString(), questions: savedQuizData.questions, flashcards: savedQuizData.flashcards, createdAt: new Date().toISOString() };
      playerData.creations.quizzes.unshift(newQuiz);
      await savePlayerData(playerData);
      showTemporaryMessage('✅ Quiz saved!');
      saveBtn.textContent = 'Saved!';
      saveBtn.disabled = true;
    };
    actionsContainer.appendChild(saveBtn);

    // Add a "Copy Raw Text" button
    const copyBtn = document.createElement('button');
    copyBtn.textContent = 'Copy Raw Text';
    copyBtn.className = 'action-btn tertiary small-btn';
    copyBtn.style.marginLeft = '8px';
    copyBtn.onclick = () => {
      navigator.clipboard.writeText(rawText).then(() => {
        copyBtn.textContent = 'Copied!';
        setTimeout(() => { copyBtn.textContent = 'Copy Raw Text'; }, 2000);
      });
    };
    actionsContainer.appendChild(copyBtn);

  } finally {
    quizBtn.disabled = false;
  }
}

function parseQuizAndFlashcards(text) {
  const questions = [];
  const flashcards = [];

  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  let mode = null; // 'quiz' or 'flashcards'
  let currentQuestion = null;

  for (const line of lines) {
    if (line.includes('Quiz Questions')) mode = 'quiz';
    else if (line.includes('Flashcards')) {
      if (currentQuestion) questions.push(currentQuestion);
      currentQuestion = null;
      mode = 'flashcards';
    }
    else if (mode === 'quiz') {
      if (/^\d+[\.\)]/.test(line)) { // Starts with "1.", "1)", etc.
        if (currentQuestion) questions.push(currentQuestion);
        currentQuestion = { question: line, options: [], answer: '' };
      } else if (currentQuestion && /^\s*-\s*[A-D][\.\)]/.test(line)) { // Starts with "- A)", "- A.", etc.
        // More robustly find the option text after the letter and separator
        const match = line.match(/^\s*-\s*[A-D][\.\)]\s*(.*)/);
        if (match && match[1]) {
          currentQuestion.options.push(match[1]);
        }
      } else if (currentQuestion && line.startsWith('Answer:')) {
        currentQuestion.answer = line.replace('Answer:', '').trim();
      }
    } else if (mode === 'flashcards') {
      if (line.startsWith('- Front:')) { // A new flashcard starts
        const front = line.replace('- Front:', '').trim();
        // Find the corresponding 'Back:' line, which should be next
        const currentLineIndex = lines.indexOf(line);
        if (currentLineIndex + 1 < lines.length && lines[currentLineIndex + 1].startsWith('Back:')) {
          const back = lines[currentLineIndex + 1].replace('Back:', '').trim();
          flashcards.push({ front, back });
        }
      }
    }
  }
  if (currentQuestion) questions.push(currentQuestion);

  return { questions, flashcards };
}

async function renderInventory() {
  const playerData = await getPlayerData();
  const inventoryListEl = document.getElementById('inventory-list');
  const activeEffectsEl = document.getElementById('active-effects-list');

  renderShop(playerData);
  // Render Inventory Items
  if (playerData.inventory.length === 0) {
    inventoryListEl.innerHTML = '<p class="small-text">Your inventory is empty.</p>';
  } else {
    inventoryListEl.innerHTML = playerData.inventory.map(itemId => {
      const item = ITEMS_CATALOG[itemId];
      if (!item) return '';
      return `
        <div class="inventory-item">
          <div class="item-info">
            <strong>${item.name}</strong>
            <p class="small-text">${item.description}</p>
          </div>
          <div class="inventory-item-actions">
            <button class="action-btn secondary small-btn sell-btn" data-sell-item-id="${item.id}">
              Sell 💰${getItemSellPrice(item.id)}
            </button>
            <button class="action-btn tertiary small-btn use-btn" data-use-item-id="${item.id}">Use</button>
          </div>
        </div>
      `;
    }).join('');
  }

  // Render Active Effects
  if (playerData.activeEffects.length === 0) {
    activeEffectsEl.innerHTML = '<p class="small-text">No active effects.</p>';
  } else {
    activeEffectsEl.innerHTML = playerData.activeEffects.map(effect => {
      if (effect.type === 'xp_boost') {
        return `<div class="effect-item">✨ +${(effect.multiplier - 1) * 100}% XP Boost (${effect.charges} charges left)</div>`;
      } else if (effect.type === 'temp_stat_boost') {
        return `<div class="effect-item">💪 +${effect.amount} ${effect.stat.charAt(0).toUpperCase() + effect.stat.slice(1)} Boost (${effect.charges} charges left)</div>`;
      } else if (effect.type === 'gold_boost') {
        return `<div class="effect-item">💰 +${(effect.multiplier - 1) * 100}% Credit Boost (${effect.charges} left)</div>`;
      } else if (effect.type === 'guaranteed_crit') {
        return `<div class="effect-item">🎯 Guaranteed Critical Hit (${effect.charges} charges left)</div>`;
      }
      return '';
    }).join('');
  }

  // Add event listeners to "Use" buttons
  document.querySelectorAll('#inventory-list .use-btn').forEach(button => {
    button.addEventListener('click', () => useItem(button.dataset.useItemId));
  });

  // Add event listeners to "Sell" buttons
  document.querySelectorAll('#inventory-list .sell-btn').forEach(button => {
    button.addEventListener('click', () => sellItem(button.dataset.sellItemId));
  });
}

function renderShop(playerData) {
  const shopListEl = document.getElementById('shop-list');
  if (!shopListEl) return;

  shopListEl.innerHTML = SHOP_ITEMS.map(shopItem => {
    const item = ITEMS_CATALOG[shopItem.itemId];
    if (!item) return '';
    const canAfford = playerData.credit >= shopItem.price;

    return `
      <div class="shop-item">
        <div class="item-info">
          <strong>${item.name}</strong>
          <p class="small-text">${item.description}</p>
        </div>
        <button class="action-btn primary small-btn buy-btn" data-item-id="${item.id}" data-price="${shopItem.price}" ${!canAfford ? 'disabled' : ''}>
          💰 ${shopItem.price}
        </button>
      </div>
    `;
  }).join('');

  // Add event listeners for buy buttons
  document.querySelectorAll('#shop-list .buy-btn').forEach(button => {
    button.addEventListener('click', () => {
      buyItem(button.dataset.itemId, parseInt(button.dataset.price));
    });
  });
}

function getItemSellPrice(itemId) {
  const shopItem = SHOP_ITEMS.find(item => item.itemId === itemId);
  if (shopItem) {
    return Math.floor(shopItem.price * 0.7); // Sell for 70% of buy price
  }
  // Default sell price for non-shop items or items not in the current shop list
  switch (itemId) {
    case 'credit_chip_small': return 15;
    case 'encrypted_cache': return 30;
    case 'corrupted_data_fragment': return 2;
    case 'entropy_shard': return 5;
    case 'depreciated_code_snippet': return 3;
    default: return 20; // A generic low price for other items
  }
}

async function sellItem(itemId) {
  let playerData = await getPlayerData();
  const itemIndex = playerData.inventory.findIndex(invItemId => invItemId === itemId);

  if (itemIndex === -1) {
    showTemporaryMessage("Item not found in inventory.");
    return;
  }

  const sellPrice = getItemSellPrice(itemId);

  playerData.credit += sellPrice;
  playerData.inventory.splice(itemIndex, 1);

  await savePlayerData(playerData);
  await renderInventory(); // Re-render the whole panel
  await updateDashboard();

  showTemporaryMessage(`Sold for ${sellPrice} credits.`);
}

async function buyItem(itemId, price) {
  let playerData = await getPlayerData();
  if (playerData.credit < price) {
    showTemporaryMessage("You don't have enough credits!");
    return;
  }

  playerData.credit -= price;
  playerData.inventory.push(itemId);
  await savePlayerData(playerData);
  await renderInventory(); // Re-render the whole panel
  await updateDashboard();
}
async function useItem(itemId) {
  let playerData = await getPlayerData();
  const itemIndex = playerData.inventory.indexOf(itemId);
  if (itemIndex === -1) return;

  const item = ITEMS_CATALOG[itemId];
  if (!item) return;

  // Apply effect
  if (item.effect.type === 'instant_credit') {
    // Handles items that grant gold instantly.
    playerData.credit += item.effect.amount;
    showTemporaryMessage(`💰 Used ${item.name}! +${item.effect.amount} Credits!`);
  } else if (['xp_boost', 'gold_boost', 'temp_stat_boost', 'guaranteed_crit', 'item_chance_boost', 'execute_damage', 'streak_saver'].includes(item.effect.type)) {
    // Handles all items that grant a temporary, charge-based effect.
    playerData.activeEffects.push(JSON.parse(JSON.stringify(item.effect))); // Deep copy
    showTemporaryMessage(`✨ Used ${item.name}! Effect is now active.`);
  } else if (item.effect.type === 'permanent_stat_boost') {
    // Handles tomes and artifacts that grant permanent stat increases.
    const statToBoost = item.effect.stat || getRandomStat(playerData.class); // e.g. Cognitive Core
    playerData.stats[statToBoost] += item.effect.amount;
    showTemporaryMessage(`📘 Used ${item.name}! Permanently +${item.effect.amount} ${statToBoost.toUpperCase()}!`);
  } else if (item.effect.type === 'anomaly_damage') {
    playerData.currentAnomaly.hp = Math.max(0, playerData.currentAnomaly.hp - item.effect.amount);
    showAnomalyDamageMessage(item.effect.amount);
  } else if (item.effect.type === 'junk') {
    // Prevents the use of junk items.
    showTemporaryMessage(`This item is junk. You should sell it!`);
    return; // Do not consume the item
  } else if (item.effect.type === 'complete_daily') {
    // Finds and completes the first available 'Easy' daily habit.
    const easyQuest = playerData.dailyQuests.find(q => q.difficulty === 'Easy' && q.lastCompleted !== getTodayDate());
    if (easyQuest) {
      await completeDailyQuest(easyQuest.id, null); // Complete without element animation
      showTemporaryMessage(`Used ${item.name} to complete: "${easyQuest.text}"`);
    } else {
      showTemporaryMessage(`No 'Easy' daily rituals available to complete!`);
      return; // Do not consume item if no target
    }
  } else if (item.effect.type === 'transmute_junk') {
    // Converts 2 junk items into gold.
    const junkTypes = ['corrupted_data_fragment', 'entropy_shard', 'depreciated_code_snippet'];
    const junkIndices = playerData.inventory.map((id, index) => junkTypes.includes(id) ? index : -1).filter(index => index !== -1);
    if (junkIndices.length < 2) {
      showTemporaryMessage('You need at least 2 common junk items to transmute!');
      return; // Do not consume
    }
    // Remove the first two found junk items by their indices, from end to start to avoid shifting.
    playerData.inventory.splice(junkIndices[1], 1);
    playerData.inventory.splice(junkIndices[0], 1);
    playerData.credit += 50;
    showTemporaryMessage(`Defragmented artifacts into 50 Credits!`);
  } else if (item.effect.type === 'reset_dailies') {
    // Resets all daily habits, allowing them to be completed again.
    playerData.dailyQuests.forEach(q => q.lastCompleted = null);
    await renderDailyQuests();
    showTemporaryMessage('All Daily Habits have been reset!');
  } else if (item.effect.type === 'credit_gambit') {
    // A 50/50 chance to double or halve your current credits.
    if (Math.random() < 0.5) {
      playerData.credit = Math.floor(playerData.credit * 2);
      showTemporaryMessage('Quantum state resolved favorably! Your credits have been doubled!');
    } else {
      playerData.credit = Math.floor(playerData.credit / 2);
      showTemporaryMessage('Unlucky... Your credits have been halved.');
    }
  } else if (item.effect.type === 'xp_reduction') {
    // Permanently reduces the XP required for all future level-ups.
    playerData.xpReduction = (playerData.xpReduction || 0) + item.effect.amount;
    showTemporaryMessage(`XP required for leveling up is now permanently reduced!`);
  } else if (item.effect.type === 'instant_item') {
    // Opens a chest or container to grant another random item.
    showTemporaryMessage(`🎁 You open the ${item.name}...`);
    // Remove the chest first, then grant the new item
    playerData.inventory.splice(itemIndex, 1);
    playerData = await grantRandomReward(playerData, true); // Guaranteed reward from a chest
  }

  // For streak savers, the item is consumed on use to activate the effect, which is checked in updateStreak().
  if (item.effect.type === 'streak_saver') { /* No action needed here, just consumption */ }

  // Remove item from inventory
  playerData.inventory.splice(itemIndex, 1);

  await savePlayerData(playerData);
  await updateDashboard();
  await renderInventory();
}

async function handleGrammarCheck() {
  const inputEl = document.getElementById('summarizer-input');
  const outputContainer = document.getElementById('grammar-output-container');
  const actionsContainer = document.getElementById('grammar-actions');
  const checkBtn = document.getElementById('check-grammar-btn');

  const text = inputEl.value;
  if (!text.trim()) return;

  actionsContainer.innerHTML = ''; // Clear previous buttons
  outputContainer.style.display = 'block';
  outputContainer.innerHTML = '<div class="output-box"><span class="spinner"></span>Checking grammar...</div>';
  checkBtn.disabled = true;

  try {
    const corrections = await window.ai.checkGrammar(text);
    outputContainer.innerHTML = `<div class="output-box">${corrections.replace(/\n/g, '<br>')}</div>`;

    // Add a "Save to Notes" button
    const saveBtn = document.createElement('button');
    saveBtn.textContent = 'Save to Notes';
    saveBtn.className = 'action-btn secondary small-btn';
    saveBtn.onclick = async () => {
      const playerData = await getPlayerData();
      const newCorrection = { id: Date.now().toString(), originalText: text.substring(0, 40) + '...', content: corrections, createdAt: new Date().toISOString() };
      playerData.creations.corrections.unshift(newCorrection);
      await savePlayerData(playerData);
      showTemporaryMessage('✅ Correction saved!');
      saveBtn.textContent = 'Saved!';
      saveBtn.disabled = true;
    };
    actionsContainer.appendChild(saveBtn);

    // Add a "Copy" button
    const copyBtn = document.createElement('button');
    copyBtn.textContent = 'Copy';
    copyBtn.className = 'action-btn tertiary small-btn';
    copyBtn.style.marginLeft = '8px';
    copyBtn.onclick = () => {
      navigator.clipboard.writeText(corrections).then(() => {
        copyBtn.textContent = 'Copied!';
        setTimeout(() => { copyBtn.textContent = 'Copy'; }, 2000);
      });
    };
    actionsContainer.appendChild(copyBtn);
  } finally {
    checkBtn.disabled = false;
  }
}

async function renderNotesPanel() {
  const playerData = await getPlayerData();
  const summariesListEl = document.getElementById('saved-summaries-list');
  const quizzesListEl = document.getElementById('saved-quizzes-list');
  const correctionsListEl = document.getElementById('saved-corrections-list');

  // Render Summaries
  if (playerData.creations.summaries.length === 0) {
    summariesListEl.innerHTML = '<p class="small-text">No summaries saved yet.</p>';
  } else {
    summariesListEl.innerHTML = playerData.creations.summaries.map(summary => `
      <div class="saved-item">
        <div class="saved-item-header">
          <strong>Summary: ${summary.title}</strong>
          <button class="delete-btn" data-type="summaries" data-id="${summary.id}">×</button>
        </div>
        <div class="saved-item-content">${summary.content.replace(/\n/g, '<br>')}</div>
        <p class="small-text">${new Date(summary.createdAt).toLocaleString()}</p>
      </div>
    `).join('');
  }

  // Render Quizzes
  if (playerData.creations.quizzes.length === 0) {
    quizzesListEl.innerHTML = '<p class="small-text">No quizzes saved yet.</p>';
  } else {
    quizzesListEl.innerHTML = playerData.creations.quizzes.map(quiz => `
      <div class="saved-item quiz-container">
        <div class="saved-item-header">
          <strong>Quiz from ${new Date(quiz.createdAt).toLocaleDateString()}</strong>
          <button class="delete-btn" data-type="quizzes" data-id="${quiz.id}">×</button>
        </div>
        ${quiz.questions && quiz.questions.length > 0 ? `
          <h5 class="notes-subtitle">Quiz Questions</h5>
          ${quiz.questions.map(q => `
            <div class="quiz-item" style="padding: 10px; border-left: 2px solid var(--panel-bg); margin-bottom: 10px;">
              <p><strong>${q.question}</strong></p>
              <ul class="quiz-options">
                ${q.options.map((opt, index) => `<li>${String.fromCharCode(65 + index)}) ${opt}</li>`).join('')}
              </ul>
              <p class="quiz-answer" style="display: block; background: none; padding: 0; margin-top: 4px;"><em>Answer: ${q.answer}</em></p>
            </div>`).join('')}` : ''}
        ${quiz.flashcards && quiz.flashcards.length > 0 ? `
          <h5 class="notes-subtitle">Flashcards</h5>
          ${quiz.flashcards.map(f => `
            <div class="flashcard-item" style="padding: 10px; border-left: 2px solid var(--panel-bg); margin-bottom: 10px;">
              <p><strong>Front:</strong> ${f.front}</p>
              <p><strong>Back:</strong> ${f.back}</p>
            </div>`).join('')}` : ''}
      </div>
    `).join('');
  }

  // Render Corrections
  if (playerData.creations.corrections.length === 0) {
    correctionsListEl.innerHTML = '<p class="small-text">No corrections saved yet.</p>';
  } else {
    correctionsListEl.innerHTML = playerData.creations.corrections.map(item => `
      <div class="saved-item">
        <div class="saved-item-header">
          <strong>Correction for: "${item.originalText}"</strong>
          <button class="delete-btn" data-type="corrections" data-id="${item.id}">×</button>
        </div>
        <div class="saved-item-content">${item.content.replace(/\n/g, '<br>')}</div>
        <p class="small-text">${new Date(item.createdAt).toLocaleString()}</p>
      </div>
    `).join('');
  }

  // Add event listeners to delete buttons
  document.querySelectorAll('#notes-panel .delete-btn').forEach(button => {
    button.addEventListener('click', (e) => {
      const id = e.target.dataset.id;
      const type = e.target.dataset.type;
      deleteCreation(type, id);
    });
  });
}

async function deleteCreation(type, id) {
  const confirmation = confirm("Are you sure you want to delete this item?");
  if (!confirmation) return;

  let playerData = await getPlayerData();
  
  if (playerData.creations && playerData.creations[type]) {
    const initialLength = playerData.creations[type].length;
    playerData.creations[type] = playerData.creations[type].filter(item => item.id !== id);
    
    if (playerData.creations[type].length < initialLength) {
      await savePlayerData(playerData);
      await renderNotesPanel(); // Re-render the panel to show the change
      showTemporaryMessage('Item deleted.');
    }
  }
}

async function changeClass() {
  const confirmation = confirm("Are you sure you want to change your class? You will be returned to the class selection screen.");
  if (confirmation) {
    let playerData = await getPlayerData();
    playerData.class = null; // This will trigger the class selection overlay
    await savePlayerData(playerData);
    initClassSelection(playerData);
  }
}

async function resetProgress() {
  const confirmation = confirm("Are you sure you want to reset all your progress? This action cannot be undone.");
  if (confirmation) {
    await savePlayerData(DEFAULT_PLAYER_DATA);
    await updateDashboard();
    // Re-render any open panels to reflect the reset
    if (document.getElementById('inventory-panel').style.display === 'block') renderInventory();
    if (document.getElementById('task-manager').style.display === 'block') renderTasks();
  }
}

/**
 * Provides detailed diagnostics on the availability of the Chrome AI API.
 * This helps debug environment issues like missing flags or incompatible versions.
 */
async function checkAiAvailability() {
  try {
    if (typeof window.ai?.canCreateTextSession !== 'function') {
      showTemporaryMessage("AI not available. Ensure you're on Chrome 127+.", 15000);
      return;
    }

    // Use the compatibility function from ai.js which handles initialization.
    const aiStatus = await window.ai.canCreateTextSession();

    switch (aiStatus) {
      case 'readily': // 'readily' is the new 'available' in the compat layer
        // No need to show a message if it's already working.
        break;
      case 'after-download': // This status comes from the compat layer
        showNotification('AI model needs to be downloaded. <button id="download-ai-btn" class="action-btn tertiary small-btn" style="margin-left: 10px; padding: 2px 8px;">Download</button>', 'download-prompt', 15000);
        document.getElementById('download-ai-btn').onclick = handleModelDownload;
        break;
      case 'unavailable':
        showNotification("AI not supported on this device or is disabled.", 'error', 15000);
        break;
      default:
        showNotification(`AI status is '${aiStatus}'.`, 'error', 15000);
    }
  } catch (e) {
    console.error("Error checking AI availability:", e);
    showNotification("Could not check AI status. The 'ai' permission might have been denied.", 'error', 10000);
  }
}

function addAnimationStyles() {
  const style = document.createElement('style');
  style.textContent = `
    /* Task Completion Animation */
    .task-item-completed {
      animation: fade-out-and-slide 0.5s ease-out forwards;
    }

    @keyframes fade-out-and-slide {
      from {
        opacity: 1;
        transform: translateX(0);
      }
      to {
        opacity: 0;
        transform: translateX(50px);
        height: 0;
        padding-top: 0;
        padding-bottom: 0;
        margin-top: 0;
        margin-bottom: 0;
        border-width: 0;
      }
    }

    /* Enhanced Level Up Animation */
    #levelUpMessage.level-up-animated .level-up-content {
        animation: pulse-and-glow 1s ease-in-out 2;
    }
  `;
  document.head.appendChild(style);
}

function initClassSelection(playerData) {
  const overlay = document.getElementById('class-selection-overlay');
  if (playerData.class) {
    overlay.style.display = 'none';
    document.querySelector('.container').style.display = 'flex';
    return;
  }

  overlay.style.display = 'flex';
  document.querySelector('.container').style.display = 'none';

  // Add hover effects to class cards
  document.querySelectorAll('.class-card').forEach(card => {
    card.setAttribute('data-class-card', card.querySelector('.action-btn').dataset.class);
    card.addEventListener('click', (e) => {
      // Allow clicking anywhere on the card to trigger the button
      card.querySelector('.action-btn').click();
    });
  });

  document.querySelectorAll('.class-card .action-btn').forEach(button => {
    button.addEventListener('click', async (e) => {
      e.stopPropagation(); // Prevent card click from firing twice if button is inside card
      const nameInput = document.getElementById('player-name-input');
      const playerName = nameInput.value.trim();
      if (!playerName) {
        showTemporaryMessage('Please enter your name to begin your quest!', 3000);
        nameInput.focus();
        return;
      }

      const chosenClass = e.target.dataset.class;
      playerData.name = playerName;
      playerData.class = chosenClass;

      // Add starting artifact based on Flow Archetype
      const startingItem = CLASS_STARTING_ITEMS[chosenClass];
      if (startingItem) {
        playerData.inventory.push(startingItem);
      }

      await savePlayerData(playerData);
      showTemporaryMessage(`Flow Archetype selected: ${CLASSES[chosenClass].name}!`);
      await updateDashboard(); // Force a refresh of the dashboard UI
      initClassSelection(playerData); // This will now hide the overlay
    });
  });
}

function applyTheme(theme) {
  document.body.setAttribute('data-theme', theme);
  const themeSwitch = document.getElementById('theme-switch');
  const themeLabel = document.getElementById('theme-label');
  if (themeSwitch) {
    themeSwitch.checked = theme === 'light';
  }
  if (themeLabel) {
    themeLabel.textContent = theme === 'light' ? 'Light Mode' : 'Dark Mode';
  }
}

async function handleThemeToggle() {
  const themeSwitch = document.getElementById('theme-switch');
  const newTheme = themeSwitch.checked ? 'light' : 'dark';
  applyTheme(newTheme);
  const playerData = await getPlayerData();
  playerData.theme = newTheme;
  await savePlayerData(playerData);
}

document.addEventListener('DOMContentLoaded', async () => {
  addAnimationStyles();
  await initializePlayerData();
  await updateDashboard();
  // Render both task lists on initial load
  await renderTasks();
  await renderDailyQuests();
  initPomodoroUI();
  
  const playerData = await getPlayerData();
  initClassSelection(playerData);
  applyTheme(playerData.theme); // Apply saved theme on load

  // New Top Bar Button Listeners
  document.getElementById('pomodoroBtn').addEventListener('click', () => showPanel('pomodoro-panel'));

  // Bottom Action Button Listeners
  document.getElementById('studyToolsBtn').addEventListener('click', () => showPanel('study-tools-panel'));
  document.getElementById('inventoryBtn').addEventListener('click', () => showPanel('inventory-panel'));
  document.getElementById('notesBtn').addEventListener('click', () => showPanel('notes-panel'));
  document.getElementById('settingsBtn').addEventListener('click', () => showPanel('settings-panel'));

  // Task and Chat input listeners
  document.getElementById('addTaskSubmit').addEventListener('click', addTask);
  document.getElementById('addDailyQuestSubmit').addEventListener('click', addDailyQuest);
  document.getElementById('taskInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTask();
    }
  });
  document.getElementById('dailyQuestInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addDailyQuest();
    }
  });
  document.getElementById('chat-send-btn').addEventListener('click', () => {
    const input = document.getElementById('chat-input');
    QuestFlowAgent.handleUserMessage(input.value);
    input.value = '';
  });
  document.getElementById('chat-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      document.getElementById('chat-send-btn').click();
    }
  });

  // Study Tools and Settings listeners
  document.getElementById('summarize-btn').addEventListener('click', handleSummarize);
  document.getElementById('generate-quiz-btn').addEventListener('click', handleGenerateQuiz);

  document.getElementById('clear-summarizer-btn').addEventListener('click', () => {
    document.getElementById('summarizer-input').value = '';
  });

  document.getElementById('check-grammar-btn').addEventListener('click', handleGrammarCheck);
  document.getElementById('changeClassBtn').addEventListener('click', changeClass);

  document.getElementById('saveFocusHoursBtn').addEventListener('click', async () => {
    const start = document.getElementById('focusStartInput').value;
    const end = document.getElementById('focusEndInput').value;

    const playerData = await getPlayerData();
    playerData.agent.focusStart = start;
    playerData.agent.focusEnd = end;

    await savePlayerData(playerData);
    showTemporaryMessage('Focus hours updated!');
    await QuestFlowAgent.runPlanningCycle(); // Re-run the agent to update the campaign
  });

  document.getElementById('savePomodoroSettingsBtn').addEventListener('click', async () => {
    const playerData = await getPlayerData();
    playerData.pomodoroSettings = {
      workDuration: parseInt(document.getElementById('pomodoroWorkDuration').value, 10) || 25,
      shortBreakDuration: parseInt(document.getElementById('pomodoroShortBreak').value, 10) || 5,
      longBreakDuration: parseInt(document.getElementById('pomodoroLongBreak').value, 10) || 15,
      sessionsBeforeLongBreak: parseInt(document.getElementById('pomodoroSessions').value, 10) || 4,
    };
    await savePlayerData(playerData);
    showTemporaryMessage('Pomodoro settings saved!');
    
    // If a timer is not running, reset it to reflect the new work duration
    if (!pomodoroState.isRunning) {
      await resetPomodoro();
    }
  });
  document.getElementById('resetProgressBtn').addEventListener('click', resetProgress);

  // Theme toggle listener
  document.getElementById('theme-switch').addEventListener('change', handleThemeToggle);

  checkAiAvailability(); // Check for AI on startup

  // Initialize and run the AI Agent
  QuestFlowAgent.runPlanningCycle();

  // Stats Modal Logic
  const statsModal = document.getElementById('stats-modal-overlay');
  const coreStatsContainer = document.getElementById('core-stats-container');
  const closeStatsBtn = document.getElementById('close-stats-modal-btn');

  coreStatsContainer.addEventListener('click', async () => {
    const playerData = await getPlayerData();
    renderRadarChart(playerData.stats);
    statsModal.style.display = 'flex';
  });
  closeStatsBtn.addEventListener('click', () => statsModal.style.display = 'none');
  statsModal.addEventListener('click', (e) => { if (e.target === statsModal) statsModal.style.display = 'none'; });

  // AI Companion Bubble and Panel Logic
  const bubble = document.getElementById('ai-companion-bubble');
  const chatPanel = document.getElementById('ai-chat-panel');
  const closeChatBtn = document.getElementById('close-chat-panel-btn');

  bubble.addEventListener('click', () => {
    chatPanel.classList.toggle('open');
    QuestFlowAgent.openChat();
  });
  closeChatBtn.addEventListener('click', () => chatPanel.classList.remove('open'));

  // View Toggling Logic
  const questView = document.getElementById('quest-view');
  const dailyView = document.getElementById('daily-ritual-view');
  const chatView = document.getElementById('chat-view');
  const toggleQuestsBtn = document.getElementById('toggle-quests-view');
  const toggleDailiesBtn = document.getElementById('toggle-dailies-view');

  toggleQuestsBtn.addEventListener('click', () => {
    questView.style.display = 'block';
    dailyView.style.display = 'none';
    toggleQuestsBtn.classList.add('active');
    toggleDailiesBtn.classList.remove('active');
  });

  toggleDailiesBtn.addEventListener('click', () => {
    questView.style.display = 'none';
    dailyView.style.display = 'block';
    toggleQuestsBtn.classList.remove('active');
    toggleDailiesBtn.classList.add('active');
  });

});
