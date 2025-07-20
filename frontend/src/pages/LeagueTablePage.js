import React from 'react';
import { useParams } from 'react-router-dom';

const LeagueTablePage = () => {
  const { leagueId } = useParams();
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">League Table</h1>
      <div className="bg-dark-200 rounded-lg p-6 text-center">
        <p className="text-gray-400">League table for ID: {leagueId} will be available soon</p>
      </div>
    </div>
  );
};

export default LeagueTablePage;