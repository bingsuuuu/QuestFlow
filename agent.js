/**
 * QuestFlowAgent - The AI Smart Planner & Flow Assistant
 * This object encapsulates the logic for the AI agent that helps players plan their flow.
 */

const AGENT_CONFIG = {
  weights: {
    urgency: 0.3,        // How soon is it due?
    impact: 0.2,         // How difficult/important is it?
    energyFit: 0.15,     // Does it match my current energy?
    timeFit: 0.3,        // Is this the right time of day for this habit?
    streakRelevance: 0.05, // Will this continue a streak?
  },
  // Default energy profile if the user hasn't developed one yet.
  defaultEnergyProfile: { morning: 0.8, afternoon: 0.6, evening: 0.9 },
};

const SAGE_QUOTES = [
  "Your mind, gamified. Achieve flow through intelligent quests.", // This one is perfect already.
  "Clarity is not found, but created. Let's build your flow.",
  "Focus is the currency of achievement. Let's invest it wisely.",
  "Each completed quest stabilizes your focus. The system grows stronger.",
  "The optimal path is the one you walk with intention.",
  "Distractions are merely system noise. Observe, then return to your signal.",
  "A calm mind is the ultimate operating system.",
  "Progress is not linear, but cyclical. Embrace the rhythm of output and recharge.",
  "Your potential is a system awaiting optimization.",
  "Let's transmute resistance into momentum."
];

const CHAT_STATE = {
  expecting: null, // e.g., 'ENERGY_RATING'
  taskToReschedule: null, // To hold the task object during rescheduling
  lastMessage: null,
}

const QuestFlowAgent = {

  /**
   * The main entry point for the agent's planning loop.
   * This function orchestrates the perception, planning, and execution phases of the Flow OS.
   */
  async runPlanningCycle() {
    console.log("Flow Assistant: Starting planning cycle...");

    // 1. PERCEPTION: Gather all necessary information.
    const perceptionData = await this.perceive();

    // 2. PLANNER: Create a daily Flow Schedule based on the perceived data.
    const campaignResult = this.plan(perceptionData); // Renamed from plan

    // 3. EXECUTOR: Render the plan to the UI.
    this.execute(campaignResult, perceptionData);

    console.log("AI Agent: Planning cycle complete.");
  },

  /**
   * Subsystem 1: Perception
   * Gathers all inputs for the planner.
   * @returns {Promise<object>} A snapshot of the current state.
   */
  async perceive() {
    console.log("Flow Assistant (Perception): Gathering data...");
    const playerData = await getPlayerData(); // Using the existing helper from dashboard.js

    // For now, we're just grabbing tasks and player stats.
    // In the future, this will include calendar events, mood, etc.
    return {
      dailyQuests: playerData.dailyQuests, // These are the Habits
      tasks: playerData.tasks,
      stats: playerData.stats,
      agentMemory: playerData.agent,
      playerClass: playerData.class,
      streak: playerData.streak,
      name: playerData.name,
      blockoutPeriods: playerData.agent.blockoutPeriods || [],
    };
  },

  /**
   * Subsystem 3: Planner
   * Ranks and prioritizes tasks to create a daily Flow Schedule.
   * @param {object} perceptionData - The data gathered by the perceive subsystem.
   * @returns {Array<object>} An ordered list of quests for the day (the "Flow Schedule").
   */
  plan(perceptionData) {
    console.log("Flow Assistant (Planner): Scoring and scheduling tasks...");
    const { tasks, dailyQuests, agentMemory, streak, blockoutPeriods } = perceptionData;

    // Clear out old blockout periods at the start of a new planning cycle
    const nowForBlockout = new Date();
    const activeBlockouts = (blockoutPeriods || []).filter(p => new Date(p.end) > nowForBlockout);
    agentMemory.blockoutPeriods = activeBlockouts; // This is correct for the current planning cycle
    // We must also save this cleaned list back to storage for future runs.
    getPlayerData().then(data => { data.agent.blockoutPeriods = activeBlockouts; savePlayerData(data); });


    // Check if it's currently outside of focus hours
    if (this.isOutsideFocusHours(agentMemory.focusStart, agentMemory.focusEnd)) {
      console.log("Flow Assistant (Planner): Outside of focus hours. Recommending rest.");
      return { isRestTime: true, campaign: [] };
    }

    // --- Time Allocation Logic ---
    const now = new Date();
    const end = this.parseTimeString(agentMemory.focusEnd);
    let availableMinutes = (end - now) / (1000 * 60);

    // If focus time has already passed for today
    if (availableMinutes <= 0) {
      console.log("Flow Assistant (Planner): Focus hours have ended for the day.");
      return { isRestTime: true, campaign: [] };
    }

    let currentTime = new Date(now);

    // Get current energy level based on time of day
    const currentEnergy = this.getCurrentEnergyLevel(agentMemory.energyProfile);

    // --- Combine tasks and uncompleted daily habits ---
    const today = new Date().toISOString().split('T')[0];
    const uncompletedDailies = (dailyQuests || [])
      .filter(dq => dq.lastCompleted !== today)
      .map(dq => ({
        ...dq,
        isDailyHabit: true,
        type: 'Habit', // Treat dailies as Habits for scoring
        deadline: today, // Give them high urgency for planning
      }));

    const allTasks = [...tasks, ...uncompletedDailies];

    // If there are no tasks, no need to plan further.
    if (allTasks.length === 0) {
      return { isRestTime: false, campaign: [] };
    }

    // Check if completing any task today would preserve a streak
    const isStreakTask = this.isStreakRelevant(streak);

    const scoredTasks = allTasks.map(task => {
      // 1. Urgency Score (0-1)
      const urgencyScore = this.scoreUrgency(task.deadline);

      // 2. Impact Score (0-1)
      const impactScore = this.scoreImpact(task.difficulty);

      // 3. Energy Fit Score (0-1)
      const energyFitScore = this.scoreEnergyFit(task.type, currentEnergy);

      // 4. Time Fit Score for Habits (0-1)
      const timeFitScore = task.isDailyHabit ? this.scoreTimeFit(task, this.getCurrentTimeOfDay()) : 0.5; // Neutral score for non-habits

      // 5. Streak Relevance Score (0-1)
      const streakRelevanceScore = isStreakTask && task.isDailyHabit ? 1.0 : 0.0; // Only apply streak to dailies for now

      // Calculate weighted total score
      const totalScore =
        urgencyScore * AGENT_CONFIG.weights.urgency +
        impactScore * AGENT_CONFIG.weights.impact +
        energyFitScore * AGENT_CONFIG.weights.energyFit +
        timeFitScore * AGENT_CONFIG.weights.timeFit +
        streakRelevanceScore * AGENT_CONFIG.weights.streakRelevance;

      return { ...task, score: totalScore };
    });

    // Sort by score, highest first to prepare for scheduling
    const prioritizedTasks = scoredTasks.sort((a, b) => b.score - a.score);

    const scheduledCampaign = [];
    let currentScheduleTime = new Date(now); // This will track the current time as we schedule
    let remainingFocusMinutes = availableMinutes; // This tracks how much time is left until focusEnd

    // Integrate blockout periods into the schedule first
    activeBlockouts.forEach(blockout => {
      const blockoutStart = new Date(blockout.start);
      const blockoutEnd = new Date(blockout.end);
      // If a blockout starts now or in the future and is within the focus window
      if (blockoutStart >= currentScheduleTime && blockoutStart < end) {
        scheduledCampaign.push({ id: `blockout-${blockout.id}`, text: `Unavailable: ${blockout.reason}`, type: 'Break', startTime: blockoutStart, endTime: blockoutEnd });
      }
    });

    for (const originalTask of prioritizedTasks) {
      // Determine quest duration in minutes
      let taskDuration = this.parseDurationToMinutes(originalTask.duration);
      if (taskDuration === null) {
        const estimateInSeconds = this.getEstimate(originalTask.type, agentMemory);
        taskDuration = estimateInSeconds ? Math.round(estimateInSeconds / 60) : 25;
      }

      let currentTaskRemainingDuration = taskDuration; // How much of this specific task is left to schedule
      let partCounter = 1;

      while (currentTaskRemainingDuration > 0 && remainingFocusMinutes > 0) {
        const blockDuration = Math.min(currentTaskRemainingDuration, 120); // Max 2-hour block

        // --- Check for conflicts with pre-scheduled blockouts ---
        const potentialEndTime = new Date(currentScheduleTime.getTime() + blockDuration * 60000);
        const conflict = scheduledCampaign.find(item => item.type === 'Break' && item.startTime < potentialEndTime && item.endTime > currentScheduleTime);

        if (conflict) {
          // There's a conflict. Move the schedule time to after the conflict ends.
          currentScheduleTime = new Date(conflict.endTime);
          remainingFocusMinutes = (end - currentScheduleTime) / (1000 * 60);
          continue; // Re-evaluate the current task in the new time slot
        }

        // --- Schedule the task block ---
        if (remainingFocusMinutes >= blockDuration) {
          const scheduledBlock = { ...originalTask }; // Copy the original task
          scheduledBlock.text = `${originalTask.text}${taskDuration > 120 ? ` (Part ${partCounter})` : ''}`; // Add part indicator if original task was long
          scheduledBlock.startTime = new Date(currentScheduleTime);
          currentScheduleTime.setMinutes(currentScheduleTime.getMinutes() + blockDuration);
          scheduledBlock.endTime = new Date(currentScheduleTime);
          scheduledCampaign.push(scheduledBlock);
          remainingFocusMinutes -= blockDuration;
          currentTaskRemainingDuration -= blockDuration;
          partCounter++;

          // --- Schedule a break if there's more of this task AND enough time for a break ---
          if (currentTaskRemainingDuration > 0 && remainingFocusMinutes >= 30) {
            const breakTask = {
              id: `break-${Date.now()}-${Math.random()}`, // Unique ID for break
              text: 'Break',
              type: 'Break',
              difficulty: 'Easy',
              duration: '30m',
              startTime: new Date(currentScheduleTime),
              endTime: new Date(currentScheduleTime.setMinutes(currentScheduleTime.getMinutes() + 30)),
            };
            scheduledCampaign.push(breakTask);
            remainingFocusMinutes -= 30;
          } else if (currentTaskRemainingDuration > 0 && remainingFocusMinutes > 0 && remainingFocusMinutes < 30) {
            // Not enough for a full break, but some time left. Allocate a whole-minute partial break.
            const partialBreakDuration = Math.floor(remainingFocusMinutes);
            if (partialBreakDuration > 0) { // Only schedule a break if there's at least 1 full minute
              const breakTask = {
                id: `break-${Date.now()}-${Math.random()}`,
                text: 'Break',
                type: 'Break',
                difficulty: 'Easy',
                duration: `${partialBreakDuration}m`,
                startTime: new Date(currentScheduleTime),
                endTime: new Date(currentScheduleTime.setMinutes(currentScheduleTime.getMinutes() + partialBreakDuration)),
              };
              scheduledCampaign.push(breakTask);
            }
            remainingFocusMinutes = 0; // All remaining time is considered used up
          }
        } else if (remainingFocusMinutes > 0) {
          // Not enough time for a full block, but some time left. Allocate a whole-minute partial block.
          const partialBlockDuration = Math.floor(remainingFocusMinutes);
          if (partialBlockDuration <= 0) {
            break; // No time left to schedule even a minute
          }
          const scheduledBlock = { ...originalTask };
          scheduledBlock.text = `${originalTask.text}${taskDuration > 120 ? ` (Part ${partCounter})` : ''} (Partial)`;
          scheduledBlock.startTime = new Date(currentScheduleTime);
          currentScheduleTime.setMinutes(currentScheduleTime.getMinutes() + partialBlockDuration);
          scheduledBlock.endTime = new Date(currentScheduleTime);
          scheduledCampaign.push(scheduledBlock);
          remainingFocusMinutes = 0; // All time used
          currentTaskRemainingDuration -= partialBlockDuration; // Mark as partially done
        }
        // If remainingFocusMinutes is 0, break from the while loop for this quest
        if (remainingFocusMinutes <= 0) break;
      }
      // If no more focus minutes, stop trying to schedule any more tasks
      if (remainingFocusMinutes <= 0) break;
    }

    // Edge case: If after all this, scheduledCampaign is still empty,
    // but there were prioritized tasks and available time, it means even the first
    // block of the highest priority task couldn't fit. In this scenario, we
    // schedule the highest priority task for whatever time is left.
    // Sort the campaign by start time before returning
    if (scheduledCampaign.length === 0 && prioritizedTasks.length > 0 && availableMinutes > 0) { // Renamed from prioritizedTasks
      console.log("AI Agent (Planner): No single task fits. Allocating all remaining time to top priority quest.");
      const topQuest = prioritizedTasks[0];
      topQuest.startTime = new Date(now);
      topQuest.endTime = new Date(end); // Allocate until the end of focus hours
      scheduledCampaign.push(topQuest);
    }
    console.log("AI Agent (Planner): Generated campaign:", scheduledCampaign);
    return { isRestTime: false, campaign: scheduledCampaign.sort((a, b) => a.startTime - b.startTime) };
  },

  /**
   * Calculates urgency score based on deadline.
   * @param {string | null} deadline - The quest's deadline string.
   * @returns {number} A score from 0 to 1.
   */
  scoreUrgency(deadline) {
    if (!deadline) return 0.1; // Low urgency for tasks without a deadline
    const daysUntilDue = (new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24);
    if (daysUntilDue < 0) return 1.0; // Overdue tasks are max urgency
    if (daysUntilDue < 1) return 1.0; // Due today
    // Score decreases as the deadline gets further away, dropping to ~0 after 7 days.
    return Math.max(0, 1 - (daysUntilDue / 7));
  },

  /**
   * Calculates impact score based on difficulty.
   * @param {string} difficulty - The quest's difficulty ('Easy', 'Medium', 'Hard').
   * @returns {number} A score from 0 to 1.
   */
  scoreImpact(difficulty) {
    switch (difficulty) {
      case 'Hard': return 1.0;
      case 'Medium': return 0.6;
      case 'Easy': return 0.3;
      default: return 0.5;
    }
  },

  /**
   * Calculates how well a task's energy requirement fits the user's current energy.
   * @param {string} taskType - The type of the quest (e.g., 'Study', 'Admin').
   * @param {number} currentEnergy - The user's current energy level (0-1).
   * @returns {number} A score from 0 to 1.
   */
  scoreEnergyFit(taskType, currentEnergy) {
    const highEnergyTasks = ['Study', 'Project', 'Creative', 'Health'];
    const taskEnergyRequirement = highEnergyTasks.includes(taskType) ? 0.9 : 0.3; // High-energy vs Low-energy
    // The score is higher when the user's energy matches the task's requirement.
    return 1.0 - Math.abs(currentEnergy - taskEnergyRequirement);
  },

  /**
   * Determines the user's current energy level based on the time of day.
   * @param {object} energyProfile - The user's learned energy profile.
   * @returns {number} An energy level from 0 to 1.
   */
  getCurrentEnergyLevel(energyProfile) {
    const hour = new Date().getHours();
    const profile = (energyProfile && Object.keys(energyProfile).length > 0) ? energyProfile : AGENT_CONFIG.defaultEnergyProfile;
    if (hour >= 5 && hour < 12) return profile.morning || 0.8; // Morning
    if (hour >= 12 && hour < 18) return profile.afternoon || 0.6; // Afternoon
    return profile.evening || 0.9; // Evening/Night
  },

  isStreakRelevant(streak) {
    const today = new Date().toISOString().split('T')[0];
    // If the last completion was not today, then any task completion will preserve/start a streak.
    return streak.lastCompletedDate !== today;
  },

  /**
   * Checks if the current time is outside the defined focus hours.
   * @param {string} focusStart - Start time in "HH:MM" format.
   * @param {string} focusEnd - End time in "HH:MM" format.
   * @returns {boolean} True if it's outside focus hours, false otherwise.
   */
  isOutsideFocusHours(focusStart, focusEnd) {
    if (!focusStart || !focusEnd) {
      return false; // If not set, always assume it's focus time.
    }

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const start = focusStart.split(':');
    const startMinutes = parseInt(start[0], 10) * 60 + parseInt(start[1], 10);

    const end = focusEnd.split(':');
    const endMinutes = parseInt(end[0], 10) * 60 + parseInt(end[1], 10);

    // Handle overnight schedules (e.g., 10 PM to 2 AM)
    if (endMinutes < startMinutes) {
      return currentMinutes > endMinutes && currentMinutes < startMinutes;
    } else {
      return currentMinutes < startMinutes || currentMinutes > endMinutes;
    }
  },

  /**
   * Parses a duration string (e.g., "30m", "1.5h") into minutes.
   * @param {string} durationStr - The duration string.
   * @returns {number | null} Duration in minutes or null if invalid.
   */
  parseDurationToMinutes(durationStr) {
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
  },

  /**
   * Parses a time string (e.g., "17:00") into a Date object for today.
   * @param {string} timeStr - The time string "HH:MM".
   * @returns {Date} A date object set to today at the given time.
   */
  parseTimeString(timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  },

  /**
   * Formats a Date object into a "HH:MM" string.
   */
  formatTime(date) {
    return date.toTimeString().substring(0, 5);
  },

  /**
   * Subsystem 4: Executor
   * Renders the plan to the UI and handles actions.
   * @param {object} campaignResult - The result from the planner { campaign, isRestTime }.
   * @param {object} perceptionData - The data gathered by the perceive subsystem.
   */
  async execute(campaignResult, perceptionData) {
    console.log("Flow Assistant (Executor): Rendering campaign to UI...");
    const campaignListEl = document.getElementById('campaign-list');
    if (!campaignListEl) return;

    if (campaignResult.isRestTime) {
      campaignListEl.innerHTML = '<p class="welcome-text">It is time to rest and recharge. Your Flow Schedule will resume during your focus hours.</p>';
      return;
    }

    const campaign = campaignResult.campaign; // Renamed from campaign
    if (!campaign || campaign.length === 0) {
      campaignListEl.innerHTML = '<p class="welcome-text">Your schedule is clear! Add quests for the Assistant to plan.</p>';
      return;
    }

    const { agentMemory } = perceptionData; // We'll need this for estimates

    let taskCounter = 0; // To number only actual tasks

    campaignListEl.innerHTML = campaign.slice(0, 5).map((quest) => {
      // Get the agent's time estimate if the user didn't provide one.
      const durationDisplay = quest.duration || this.formatEstimate(this.getEstimate(quest.type, agentMemory)) || '';

      // Format the allocated time block
      const timeBlock = quest.startTime && quest.endTime ? `[${this.formatTime(quest.startTime)} - ${this.formatTime(quest.endTime)}]` : '';

      if (quest.type === 'Break') {
        return `
          <div class="task-item difficulty-easy">
            <div class="task-info" style="flex-grow: 1;">
              ${timeBlock ? `<div class="task-time-block">${timeBlock}</div>` : ''}
              <div class="task-text"><strong>${quest.text}</strong></div>
              <div class="task-meta">${quest.duration}</div>
            </div>
          </div>
        `;
      } else {
        taskCounter++; // Increment only for actual quests
        return `
          <div class="task-item difficulty-${quest.difficulty.toLowerCase()}">
            <div class="task-info" style="flex-grow: 1;">
              ${timeBlock ? `<div class="task-time-block">${timeBlock}</div>` : ''}
              <div class="task-text"><strong>#${taskCounter}:</strong> ${quest.text}</div>
              <div class="task-meta">${quest.type} • ${quest.difficulty}${durationDisplay ? ` • ${durationDisplay}` : ''}</div>
            </div>
          <button class="action-btn primary small-btn" data-quest-id="${quest.id}" data-is-daily="${!!quest.isDailyHabit}">Start Flow</button>
          </div>
        `;
      }
    }).join('');

    // Add event listeners to the "Start" buttons
    campaignListEl.querySelectorAll('[data-quest-id]').forEach(button => {
      button.addEventListener('click', (e) => {
        const questId = e.target.dataset.questId;
        const isDaily = e.target.dataset.isDaily === 'true';
        if (isDaily) {
          this.completeDailyHabitFromCampaign(questId);
        } else {
          this.startQuest(questId);
        }
      });
    });
  },

  startQuest(questId) {
    console.log(`Flow Assistant: Initiating flow for task ${questId}`);
    showPanel('pomodoro-panel');
    startPomodoro(questId); // Pass the questId to the pomodoro starter
  },

  async completeDailyHabitFromCampaign(questId) {
    console.log(`Flow Assistant: Syncing habit ${questId} from Flow Schedule.`);
    // Find the button in the main daily habits list to get the element for animation
    const dailyListElement = document.querySelector(`#dailyQuestList [data-daily-quest-id="${questId}"]`);
    const taskItemElement = dailyListElement ? dailyListElement.closest('.task-item') : null;

    await completeDailyQuest(questId, taskItemElement);

    // After completion, re-run the planning cycle to remove it from the schedule
    await this.runPlanningCycle();
  },

  /**
   * Calculates how well a habit fits the current time of day.
   * @param {object} habit - The daily habit task object.
   * @param {string} currentTimeOfDay - 'morning', 'afternoon', or 'evening'.
   * @returns {number} A score from 0 to 1.
   */
  scoreTimeFit(habit, currentTimeOfDay) {
    const preferredTime = habit.preferredTime || 'any'; // Default to 'any' if not set

    if (preferredTime === 'any') {
      return 0.7; // Rituals that can be done anytime get a decent score always
    }
    if (preferredTime === currentTimeOfDay) {
      return 1.0; // Perfect match
    }
    return 0.1; // Mismatch, very low score
  },

  getCurrentTimeOfDay() {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 18) return 'afternoon';
    return 'evening';
  },

  /**
   * Calculates the average time for a task type from memory.
   * @param {string} taskType - The type of quest (e.g., 'Study').
   * @param {object} agentMemory - The agent's memory object.
   * @returns {number | null} The average duration in seconds, or null if not enough data.
   */
  getEstimate(taskType, agentMemory) {
    const performance = agentMemory.taskTypePerformance[taskType];
    // Require at least 2 completed tasks for a meaningful average.
    if (performance && performance.completed >= 2) {
      return performance.totalTime / performance.completed;
    }
    return null;
  },

  /**
   * Formats a duration in seconds into a human-readable string.
   * @param {number | null} seconds - The duration in seconds.
   * @returns {string | null} A formatted string like "Est. ~45m" or null.
   */
  formatEstimate(seconds) {
    if (seconds === null) return null;

    const minutes = Math.round(seconds / 60);

    if (minutes < 90) {
      return `Est. ~${minutes}m`;
    } else {
      const hours = (minutes / 60).toFixed(1);
      // Use .replace to remove trailing .0 (e.g., "2.0h" -> "2h")
      return `Est. ~${hours.replace(/\.0$/, '')}h`;
    }
  },

  async getFormattedTaskEstimate(taskType) {
    const playerData = await getPlayerData();
    const agentMemory = playerData.agent;
    const estimateInSeconds = this.getEstimate(taskType, agentMemory);
    return this.formatEstimate(estimateInSeconds);
  },

  /**
   * Subsystem 5: Reflector / Learner
   * Ingests outcomes to update memory and improve future planning.
   * @param {object} outcome - Data about a completed or failed quest.
   */
  async reflect(outcome) {
    console.log("Flow Assistant (Reflector): Learning from outcome:", outcome);
    const { task, status, actualDuration } = outcome;
    if (!task || !task.type) return;

    const playerData = await getPlayerData();
    const agentMemory = playerData.agent;

    // Initialize performance tracking for this task type if it doesn't exist
    if (!agentMemory.taskTypePerformance[task.type]) {
      agentMemory.taskTypePerformance[task.type] = {
        completed: 0,
        totalTime: 0, // in seconds
        // 'failed' can be added later
      };
    }

    const performance = agentMemory.taskTypePerformance[task.type];

    if (status === 'completed') {
      performance.completed += 1;
      performance.totalTime += actualDuration;
    }
    // TODO: Handle 'failed' status if a task can be failed.

    // The agent's memory is part of playerData, so we just need to save it.
    await savePlayerData(playerData);

    console.log(`Flow Assistant (Reflector): Updated memory for '${task.type}'. New stats:`, performance);
  },

  // --- CHATBOT SUBSYSTEM ---

  /**
   * Initializes the chat interface with a welcome message.
   */
  async openChat() {
    const chatLog = document.getElementById('chat-log');
    if (chatLog.children.length === 0) {
      const playerData = await getPlayerData();
      const name = playerData.name || 'Flow Operative';
      this.addMessageToLog(`<strong>Flow Assistant:</strong> Welcome, ${name}. The system is ready. How can I help you achieve your flow state?`, 'agent');
      this.showDefaultSuggestions();
    }
  },

  /**
   * Main entry point for handling user messages from the chat.
   * @param {string} messageText - The text entered by the user.
   */
  async handleUserMessage(messageText) {
    if (!messageText.trim()) return;

    this.addMessageToLog(messageText, 'user');
    this.clearSuggestions();

    // Simple keyword-based intent recognition
    const lowerMessage = messageText.toLowerCase();

    if (lowerMessage.includes('energy') || lowerMessage.includes('mood') || lowerMessage.includes('feeling')) {
      this.promptForEnergy();
    } else if (lowerMessage.includes('plan') || lowerMessage.includes('day')) {
      this.addMessageToLog("<strong>Flow Assistant:</strong> Of course. Optimizing your schedule now...", 'agent');
      await this.runPlanningCycle();
      this.addMessageToLog("<strong>Flow Assistant:</strong> Your Flow Schedule is updated.", 'agent');
      this.showDefaultSuggestions();
    } else if (lowerMessage.includes('advice') || lowerMessage.includes('quote') || lowerMessage.includes('motivation') || lowerMessage.includes('inspire') || lowerMessage.includes('wisdom')) {
      this.offerWisdom();
    } else {
      const playerData = await getPlayerData();
      const name = playerData.name || 'Flow Operative';
      this.addMessageToLog(`<strong>Flow Assistant:</strong> A curious query, ${name}. I shall reflect upon it. But first, tell me of your current energy level.`, 'agent');
      this.promptForEnergy();
    }
  },

  /**
   * Sets the user's energy level and provides feedback.
   * @param {'high' | 'medium' | 'low'} level - The energy level chosen by the user.
   */
  async setEnergy(level) {
    this.clearSuggestions();
    let energyValue, response;
    const playerData = await getPlayerData();
    const name = playerData.name || 'Flow Operative';

    switch (level) {
      case 'high':
        energyValue = 0.9;
        response = "Excellent. High energy levels detected. I will prioritize high-impact tasks.";
        break;
      case 'medium':
        energyValue = 0.6;
        response = "Acknowledged. A steady rhythm is perfect for consistent progress. Your schedule is being adjusted.";
        break;
      case 'low':
        energyValue = 0.3;
        response = `Understood. Rest is a vital part of the cycle. I will suggest lighter tasks to conserve your energy.`;
        break;
    }

    this.addMessageToLog(`<strong>Flow Assistant:</strong> ${response}`, 'agent');

    // This is a temporary override. The Reflector should build a proper profile over time.
    const hour = new Date().getHours();
    const timeOfDay = (hour >= 5 && hour < 12) ? 'morning' : (hour >= 12 && hour < 18) ? 'afternoon' : 'evening';
    
    playerData.agent.energyProfile[timeOfDay] = energyValue;
    await savePlayerData(playerData);

    // Re-plan the day with the new energy information
    await this.runPlanningCycle();
    this.showDefaultSuggestions();
  },

  /**
   * Asks the user for their energy level and shows suggestion buttons.
   */
  promptForEnergy() {
    this.addMessageToLog("<strong>Flow Assistant:</strong> What is your current energy level?", 'agent');
    const suggestions = [
      { text: '⚡ High Energy', action: () => this.setEnergy('high') },
      { text: 'Steady', action: () => this.setEnergy('medium') },
      { text: 'Weary', action: () => this.setEnergy('low') }
    ];
    this.showSuggestions(suggestions);
  },

  showDefaultSuggestions() {
    const suggestions = [
      { text: 'How is my energy?', action: () => this.promptForEnergy() },
      { text: 'Plan my day', action: async () => {
        this.addMessageToLog("Optimize my day.", 'user');
        this.addMessageToLog("<strong>Flow Assistant:</strong> Recalculating your optimal schedule...", 'agent');
        await this.runPlanningCycle();
        this.addMessageToLog("<strong>Flow Assistant:</strong> Your Flow Schedule is updated.", 'agent');
        this.showDefaultSuggestions();
      }},
      { text: 'Offer some wisdom', action: () => {
        this.addMessageToLog("Offer some wisdom.", 'user');
        this.offerWisdom();
      }},
      { text: 'Reschedule a task', action: () => {
        this.addMessageToLog("I need to reschedule something.", 'user');
        this.promptForRescheduleTask();
      }},
    ];
    this.showSuggestions(suggestions);
  },

  offerWisdom() {
    const quote = SAGE_QUOTES[Math.floor(Math.random() * SAGE_QUOTES.length)];
    this.addMessageToLog(`<strong>Flow Assistant:</strong> Consider this...`, 'agent');
    // Add a small delay for dramatic effect
    setTimeout(() => {
        this.addMessageToLog(`<em>"${quote}"</em>`, 'agent');
        this.showDefaultSuggestions();
    }, 800);
  },

  async promptForRescheduleTask() {
    this.addMessageToLog("<strong>Flow Assistant:</strong> Of course. Which quest needs to be moved?", 'agent');
    const playerData = await getPlayerData();
    const tasks = playerData.tasks;

    if (tasks.length === 0) {
        this.addMessageToLog("<strong>Flow Assistant:</strong> There are no quests on your board to reschedule.", 'agent');
        this.showDefaultSuggestions();
        return;
    }

    const suggestions = tasks.map(task => ({
        text: task.text.substring(0, 30) + (task.text.length > 30 ? '...' : ''),
        action: () => {
            this.addMessageToLog(`Reschedule: "${task.text}"`, 'user');
            this.promptForBlockoutTime(task);
        }
    }));
    
    this.showSuggestions(suggestions);
  },

  promptForBlockoutTime(task) {
    CHAT_STATE.taskToReschedule = task; // Store the task in the chat state
    this.addMessageToLog("<strong>Flow Assistant:</strong> Understood. When are you unable to do any tasks?", 'agent');
    const suggestions = [
      { text: 'Next 30 mins', action: () => this.handleReschedule(30, 'a quick meeting') },
      { text: 'Next hour', action: () => this.handleReschedule(60, 'an appointment') },
      { text: 'This Afternoon', action: () => this.handleReschedule('afternoon', 'the afternoon') },
      { text: 'Tomorrow Morning', action: () => this.handleReschedule('tomorrow_morning', 'tomorrow morning') },
    ];
    this.showSuggestions(suggestions);
  },

  async handleReschedule(blockoutPeriod, reason) {
    this.addMessageToLog(`I'm busy for ${reason}.`, 'user');
    this.addMessageToLog("<strong>Flow Assistant:</strong> Acknowledged. Adjusting your Flow Schedule...", 'agent');
    
    const now = new Date();
    let blockoutStart, blockoutEnd;

    if (typeof blockoutPeriod === 'number') {
      blockoutStart = now;
      blockoutEnd = new Date(now.getTime() + blockoutPeriod * 60000);
    } else if (blockoutPeriod === 'afternoon') {
      blockoutStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 13, 0, 0); // 1 PM
      blockoutEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 17, 0, 0); // 5 PM
    } else if (blockoutPeriod === 'tomorrow_morning') {
      blockoutStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 9, 0, 0); // Tomorrow 9 AM
      blockoutEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 12, 0, 0); // Tomorrow 12 PM
    }

    const playerData = await getPlayerData();
    if (!playerData.agent.blockoutPeriods) {
      playerData.agent.blockoutPeriods = [];
    }
    playerData.agent.blockoutPeriods.push({ id: Date.now(), start: blockoutStart, end: blockoutEnd, reason: reason });
    await savePlayerData(playerData);

    await this.runPlanningCycle();
    this.addMessageToLog("<strong>Flow Assistant:</strong> Your schedule has been updated to accommodate your blockout time.", 'agent');
    this.showDefaultSuggestions();
  },

  showSuggestions(suggestions) {
    const container = document.getElementById('chat-suggestions');
    this.clearSuggestions();
    suggestions.forEach(s => {
      const btn = document.createElement('button');
      btn.className = 'suggestion-btn';
      btn.textContent = s.text;
      btn.onclick = s.action;
      container.appendChild(btn);
    });
  },

  clearSuggestions() {
    document.getElementById('chat-suggestions').innerHTML = '';
  },

  addMessageToLog(htmlContent, type) {
    const chatLog = document.getElementById('chat-log');
    const messageEl = document.createElement('div');
    messageEl.className = `chat-message ${type}-message`;
    messageEl.innerHTML = htmlContent;
    chatLog.appendChild(messageEl);
    chatLog.scrollTop = chatLog.scrollHeight; // Auto-scroll to the bottom
  }
};