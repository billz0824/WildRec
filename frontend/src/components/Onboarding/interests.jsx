import React, { useState, useRef, useEffect } from 'react';
import { useUser } from '../../context/UserContext';

const Interests = ({ next }) => {
  const { updatePreferences, getAvailableSubjects, getAvailableMajors } = useUser();
  const [major, setMajor] = useState('');
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  
  const availableSubjects = getAvailableSubjects();
  const availableMajors = getAvailableMajors();
  
  // Filter subjects based on search term
  const filteredSubjects = availableSubjects.filter(subject => 
    subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleInterestSelect = (subject) => {
    if (!selectedInterests.includes(subject)) {
      setSelectedInterests([...selectedInterests, subject]);
    }
    setSearchTerm('');
    setShowDropdown(false);
  };

  const removeInterest = (subject) => {
    setSelectedInterests(selectedInterests.filter(s => s !== subject));
  };

  const handleNext = () => {
    updatePreferences({ 
      major, 
      interests: selectedInterests
    });
    next();
  };

  return (
    <div className="onboarding-step dark text-white p-8 max-w-lg mx-auto">
      <h2 className="text-2xl font-bold mb-6">Tell us about your major and interests</h2>

      <div className="mb-4">
        <label className="block">
          <span className="text-sm font-medium">Major</span>
          <select
            className="w-full mt-1 p-2 rounded bg-gray-800 border border-gray-600"
            value={major}
            onChange={(e) => setMajor(e.target.value)}
          >
            <option value="">Select your major</option>
            {availableMajors.map((majorCode) => (
              <option key={majorCode} value={majorCode}>
                {majorCode}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mb-4">
        <span className="text-sm font-medium block mb-2">Select your interests</span>
        
        {/* Search input */}
        <div className="relative" ref={dropdownRef}>
          <input
            type="text"
            className="w-full p-2 rounded bg-gray-800 border border-gray-600"
            placeholder="Search for subjects..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
          />
          
          {/* Dropdown menu */}
          {showDropdown && searchTerm && (
            <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-600 rounded shadow-lg max-h-60 overflow-y-auto">
              {filteredSubjects.length > 0 ? (
                filteredSubjects.map((subject) => (
                  <div
                    key={subject}
                    className="p-2 hover:bg-gray-700 cursor-pointer"
                    onClick={() => handleInterestSelect(subject)}
                  >
                    {subject}
                  </div>
                ))
              ) : (
                <div className="p-2 text-gray-400">No subjects found</div>
              )}
            </div>
          )}
        </div>
        
        {/* Selected interests tags */}
        <div className="mt-3 flex flex-wrap gap-2">
          {selectedInterests.map((subject) => (
            <div 
              key={subject} 
              className="flex items-center bg-purple-600 text-white px-3 py-1 rounded"
            >
              <span>{subject}</span>
              <button 
                className="ml-2 text-white hover:text-gray-200"
                onClick={() => removeInterest(subject)}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={handleNext}
        className="mt-4 px-4 py-2 bg-purple-600 rounded text-white hover:bg-purple-700"
      >
        Continue
      </button>
    </div>
  );
};

export default Interests;