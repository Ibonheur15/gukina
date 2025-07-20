import React from 'react';
import { useParams } from 'react-router-dom';

const TeamPage = () => {
  const { teamId } = useParams();
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Team Details</h1>
      <div className="bg-dark-200 rounded-lg p-6 text-center">
        <p className="text-gray-400">Team details for ID: {teamId} will be available soon</p>
      </div>
    </div>
  );
};

export default TeamPage;