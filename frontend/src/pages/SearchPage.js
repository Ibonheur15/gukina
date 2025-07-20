import React, { useState } from 'react';

const SearchPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Search</h1>
      
      <div className="mb-6">
        <input
          type="text"
          className="form-input"
          placeholder="Search for teams, leagues, or countries..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      <div className="bg-dark-200 rounded-lg p-6 text-center">
        <p className="text-gray-400">Search functionality will be available soon</p>
      </div>
    </div>
  );
};

export default SearchPage;