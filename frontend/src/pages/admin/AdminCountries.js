import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { countryService } from '../../utils/api';

const AdminCountries = () => {
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    flag: '',
    region: 'East Africa',
    active: true
  });
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const location = useLocation();
  
  useEffect(() => {
    fetchCountries();
    
    // Check if we should show the form based on URL params
    const params = new URLSearchParams(location.search);
    if (params.get('new') === 'true') {
      setShowForm(true);
    }
    
    const editId = params.get('edit');
    if (editId) {
      handleEdit(editId);
    }
  }, [location]);
  
  const fetchCountries = async () => {
    try {
      setLoading(true);
      const res = await countryService.getAll();
      setCountries(res.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load countries');
      setLoading(false);
    }
  };
  
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingId) {
        await countryService.update(editingId, formData);
      } else {
        await countryService.create(formData);
      }
      
      // Reset form and fetch updated list
      resetForm();
      fetchCountries();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save country');
    }
  };
  
  const handleEdit = async (id) => {
    try {
      const res = await countryService.getById(id);
      setFormData(res.data);
      setEditingId(id);
      setShowForm(true);
    } catch (err) {
      setError('Failed to load country details');
    }
  };
  
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this country?')) {
      try {
        await countryService.delete(id);
        fetchCountries();
      } catch (err) {
        setError('Failed to delete country');
      }
    }
  };
  
  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      flag: '',
      region: 'East Africa',
      active: true
    });
    setEditingId(null);
    setShowForm(false);
  };
  
  const filteredCountries = countries.filter(country => 
    country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    country.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    country.region.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Countries</h1>
        <button 
          className="btn btn-primary"
          onClick={() => {
            resetForm();
            setShowForm(!showForm);
          }}
        >
          {showForm ? 'Cancel' : 'Add New Country'}
        </button>
      </div>
      
      {error && (
        <div className="bg-red-500 bg-opacity-10 border border-red-500 text-red-500 p-4 rounded-md mb-6">
          {error}
        </div>
      )}
      
      {/* Form */}
      {showForm && (
        <div className="bg-dark-200 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">
            {editingId ? 'Edit Country' : 'Add New Country'}
          </h2>
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group">
                <label htmlFor="name" className="form-label">Country Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="form-input"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="code" className="form-label">Country Code</label>
                <input
                  type="text"
                  id="code"
                  name="code"
                  className="form-input"
                  value={formData.code}
                  onChange={handleInputChange}
                  required
                  maxLength="3"
                  placeholder="e.g. RWA"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="flag" className="form-label">Flag URL</label>
                <input
                  type="text"
                  id="flag"
                  name="flag"
                  className="form-input"
                  value={formData.flag}
                  onChange={handleInputChange}
                  placeholder="https://example.com/flag.png"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="region" className="form-label">Region</label>
                <select
                  id="region"
                  name="region"
                  className="form-input"
                  value={formData.region}
                  onChange={handleInputChange}
                  required
                >
                  <option value="East Africa">East Africa</option>
                  <option value="West Africa">West Africa</option>
                  <option value="North Africa">North Africa</option>
                  <option value="Southern Africa">Southern Africa</option>
                  <option value="Central Africa">Central Africa</option>
                </select>
              </div>
              
              <div className="form-group flex items-center">
                <input
                  type="checkbox"
                  id="active"
                  name="active"
                  className="mr-2 h-5 w-5"
                  checked={formData.active}
                  onChange={handleInputChange}
                />
                <label htmlFor="active" className="form-label mb-0">Active</label>
              </div>
            </div>
            
            <div className="flex justify-end mt-4">
              <button 
                type="button" 
                className="btn btn-secondary mr-2"
                onClick={resetForm}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                {editingId ? 'Update Country' : 'Add Country'}
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          className="form-input"
          placeholder="Search countries..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      {/* Countries List */}
      {loading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="bg-dark-200 rounded-lg overflow-hidden">
          {filteredCountries.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-dark-300">
                    <th className="text-left p-4">Flag</th>
                    <th className="text-left p-4">Name</th>
                    <th className="text-left p-4">Code</th>
                    <th className="text-left p-4">Region</th>
                    <th className="text-left p-4">Status</th>
                    <th className="text-right p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCountries.map((country) => (
                    <tr key={country._id} className="border-t border-dark-300">
                      <td className="p-4">
                        {country.flag ? (
                          <img 
                            src={country.flag} 
                            alt={country.name} 
                            className="w-8 h-6 object-cover"
                          />
                        ) : (
                          <div className="w-8 h-6 bg-dark-300 flex items-center justify-center text-xs">
                            {country.code}
                          </div>
                        )}
                      </td>
                      <td className="p-4">{country.name}</td>
                      <td className="p-4">{country.code}</td>
                      <td className="p-4">{country.region}</td>
                      <td className="p-4">
                        {country.active ? (
                          <span className="bg-green-500 bg-opacity-20 text-green-500 px-2 py-1 rounded-full text-xs">
                            Active
                          </span>
                        ) : (
                          <span className="bg-gray-500 bg-opacity-20 text-gray-500 px-2 py-1 rounded-full text-xs">
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <button
                          className="text-primary hover:underline mr-4"
                          onClick={() => handleEdit(country._id)}
                        >
                          Edit
                        </button>
                        <button
                          className="text-red-500 hover:underline"
                          onClick={() => handleDelete(country._id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-6 text-center text-gray-400">
              No countries found. {searchTerm && 'Try a different search term.'}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminCountries;