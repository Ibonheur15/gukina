import React from 'react';
import useLiveMinute from '../hooks/useLiveMinute';

const LiveMinuteDisplay = ({ match, className = "" }) => {
  const liveMinute = useLiveMinute(match);

  const getDisplayText = () => {
    switch (match.status) {
      case 'live':
        return `${liveMinute}'`;
      case 'halftime':
        return 'HT';
      case 'ended':
        return 'FT';
      case 'not_started':
        return 'Not Started';
      case 'postponed':
        return 'Postponed';
      case 'canceled':
        return 'Canceled';
      default:
        return match.status;
    }
  };

  const getStatusClass = () => {
    switch (match.status) {
      case 'live':
        return 'bg-green-600 text-white';
      case 'halftime':
        return 'bg-yellow-600 text-white';
      case 'ended':
        return 'bg-gray-600 text-white';
      case 'not_started':
        return 'bg-blue-600 text-white';
      case 'postponed':
        return 'bg-orange-600 text-white';
      case 'canceled':
        return 'bg-red-800 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  return (
    <span className={`px-2 py-1 rounded text-sm font-medium ${getStatusClass()} ${className}`}>
      {getDisplayText()}
    </span>
  );
};

export default LiveMinuteDisplay;