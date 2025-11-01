# QuestFlow: A Gamified Productivity OS

**Transform your daily tasks into an epic RPG. QuestFlow is a Chrome Extension that gamifies your productivity with levels, stats, and an on-device AI assistant to help you achieve a state of flow.**

---

## 🚀 Introduction

In a world of endless distractions, maintaining focus is a superpower. **QuestFlow** is a next-generation productivity and study companion that turns this challenge into a game. Built as a Chrome Extension, it reframes your to-do list as a series of quests within a sleek, futuristic interface. 

Powered by **on-device AI using Gemini Nano**, QuestFlow acts as an intelligent partner that not only tracks your progress but actively helps you plan, focus, and learn more effectively. It’s not just a to-do list; it’s an operating system for your ambition.

## ✨ Core Features

*   **🎮 Gamified Task Management:**
    *   Turn tasks into "Quests" and "Daily Habits."
    *   Earn XP to increase your **Mind Tier** (level) and permanently boost your core stats: **Discipline, Intelligence, and Focus**.
    *   Choose a **Flow Archetype** (class) like Architect or Analyst for unique gameplay bonuses.
    *   Build a daily **Streak** for compounding rewards.

*   **🤖 AI Flow Assistant (Powered by Gemini Nano):**
    *   **Proactive Planning:** The AI analyzes your quests and generates a prioritized, time-blocked **Flow Schedule** for your day, tailored to your focus hours.
    *   **Conversational Chat:** Open a chat panel to talk to the assistant. Ask it to reschedule tasks, report your energy levels for schedule adjustments, or offer motivational wisdom.
    *   **Intelligent Analysis:** The AI automatically suggests a task's type and difficulty when you create it.

*   **🧠 Integrated Focus & Study Tools:**
    *   A fully functional **Pomodoro Timer** that can be linked to specific quests to help you stay on task.
    *   An on-device **AI Study Suite** to summarize text, generate quizzes, and check grammar.
    *   A **Notes Panel** to save all your AI-generated study materials.

*   **🖥️ Sleek "Flow OS" Interface:**
    *   A beautiful **Glassmorphism** UI that feels modern and responsive.
    *   Switch between persistent **Light & Dark Modes** to suit your preference.
    *   Visualize your progress with a **Stats Radar Chart** and a **Focus Analysis** board.

## 🛠️ How We Built It

QuestFlow was built with a "vanilla-first" philosophy, ensuring a lightweight and performant experience.

*   **Core:** Vanilla **JavaScript (ES6+), HTML5, and CSS3**. No external frameworks were used.
*   **AI:** The **Chrome AI API (`window.ai`)** provides direct access to the on-device Gemini Nano model. This ensures all AI operations are private, secure, and available offline. We used careful prompt engineering to get structured, reliable output from the model.
*   **Platform:** Packaged as a **Chrome Extension** using Manifest V3.
*   **State Management:** All application state and user data are managed using `chrome.storage.local` and a disciplined `async/await` pattern to keep the UI in sync with the data.

## 📦 Getting Started: How to Install

To try out QuestFlow, you can load it as an unpacked extension in Chrome.

1.  **Download the Code:** Download and unzip the project folder.
2.  **Open Chrome Extensions:** Open Chrome and navigate to `chrome://extensions`.
3.  **Enable Developer Mode:** In the top-right corner, turn on the "Developer mode" toggle.
4.  **Load the Extension:** Click the **"Load unpacked"** button that appears on the top-left.
5.  **Select the Folder:** In the file selection dialog, navigate to and select the main `QuestFlowMVP` project folder (the one containing `manifest.json`).
6.  **Launch!** The QuestFlow icon will appear in your extensions list. Click it to launch the dashboard!

## 🕹️ How to Use

1.  **Onboarding:** On your first launch, you'll be prompted to enter your name and choose a **Flow Archetype**.
2.  **Add a Quest:** Use the "Add Quest" input to create your first task. The AI will automatically analyze it.
3.  **Check Your Schedule:** The AI Assistant will generate a **Flow Schedule** with your prioritized tasks for the day.
4.  **Start Focusing:** Click "Start Flow" on a scheduled task to link it to the Pomodoro timer and begin a focus session.
5.  **Talk to the Assistant:** Click the floating bubble in the bottom-right to chat with the Flow Assistant. Try asking it to "reschedule a task" or tell it your energy level is "low."

## What's next for QuestFlow

* Improving the AI planner and chatbot – more can be done to make it smarter and more interactive
* Improving the statistics window so user can visualise their workstyle better, and give them better personalisation
* Social flow challenges (where it becomes a multiplayer game instead of a single-player one)
* Adding more flow archetypes that better describe each individual's work style, weakness and ways to improve. 
* Google calender integration for the AI planner.