import { useState, useEffect } from 'react';

const useLiveMinute = (match) => {
  const [currentMinute, setCurrentMinute] = useState(match?.currentMinute || 0);

  useEffect(() => {
    let interval;

    const calculateLiveMinute = () => {
      if (!match || match.status !== 'live') {
        setCurrentMinute(match?.currentMinute || 0);
        return;
      }

      const now = new Date();
      
      if (match.halfTimeStartTime) {
        // Second half - calculate from half time start
        const halfTimeStart = new Date(match.halfTimeStartTime);
        const secondHalfMinutes = Math.floor((now - halfTimeStart) / (1000 * 60));
        setCurrentMinute(45 + secondHalfMinutes);
      } else if (match.liveStartTime) {
        // First half - calculate from match start
        const liveStart = new Date(match.liveStartTime);
        const firstHalfMinutes = Math.floor((now - liveStart) / (1000 * 60));
        setCurrentMinute(firstHalfMinutes);
      } else {
        setCurrentMinute(match?.currentMinute || 0);
      }
    };

    if (match && match.status === 'live') {
      // Calculate immediately
      calculateLiveMinute();
      
      // Update every second for real-time counting
      interval = setInterval(calculateLiveMinute, 1000);
    } else {
      setCurrentMinute(match?.currentMinute || 0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [match?.status, match?.liveStartTime, match?.halfTimeStartTime, match?.currentMinute]);

  return currentMinute;
};

export default useLiveMinute;