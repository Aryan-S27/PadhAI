import { useEffect } from "react";

export const useTargetReminder = () => {
  useEffect(() => {
    const checkAndAlert = (forcedHour = null) => {
      const now = Date.now();
      const lastAlert = localStorage.getItem("padhai_last_alert_time");
      
      // 3 hours in milliseconds = 10,800,000 ms
      const THREE_HOURS_MS = 3 * 60 * 60 * 1000;
      
      // If forcedHour is provided, we bypass the time difference checks (for testing)
      const shouldTrigger = forcedHour !== null || !lastAlert || (now - Number(lastAlert) >= THREE_HOURS_MS);
      
      if (shouldTrigger) {
        const currentDate = new Date();
        const currentHour = forcedHour !== null ? forcedHour : currentDate.getHours();
        
        // Block alert between 00:00 and 06:00 AM IST
        if (currentHour >= 0 && currentHour < 6) {
          if (forcedHour === null) return; // Only skip if not testing
        }
        
        let message = "";
        if (currentHour >= 6 && currentHour < 15) {
          message = "Good day! Let's make progress on today's target. Step by step, you've got this! 🌟";
        } else {
          message = "Target Check: The day is slipping by. It is time to get serious, focus, and complete today's scheduled target. 🎯";
        }
        
        // Save the alert time
        localStorage.setItem("padhai_last_alert_time", String(now));
        
        // Trigger browser alert
        alert(message);
      }
    };

    // Expose test helper globally for verification
    window.testTriggerAlert = (mockHour) => {
      console.log(`[PadhAI] Triggering manual test alert for hour: ${mockHour}:00`);
      checkAndAlert(mockHour);
    };

    // Initial check on load
    checkAndAlert();

    // Check every 1 minute
    const interval = setInterval(() => {
      checkAndAlert();
    }, 60000);

    return () => clearInterval(interval);
  }, []);
};
