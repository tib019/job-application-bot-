import { initializeScheduler } from "./services/scheduler";

/**
 * Initialize the scheduler when the server starts
 * This file is imported in the main server file
 */
export function startScheduler() {
  console.log("[Init] Starting job application scheduler...");
  
  // Initialize the scheduler
  initializeScheduler();
  
  console.log("[Init] Scheduler started successfully");
}
