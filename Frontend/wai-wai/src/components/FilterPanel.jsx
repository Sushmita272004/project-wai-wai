// frontend/wai-wai/src/components/FilterPanel.jsx
import React, { useState } from 'react';
import { FiX, FiSearch, FiCheck } from 'react-icons/fi';

const FilterPanel = ({ filters, setFilters, isOpen, onClose }) => {
  const [skillSearch, setSkillSearch] = useState("");

  const locations = ["Remote", "Bangalore, India", "Hyderabad, India", "Mumbai, India", "Pune, India", "Delhi, India"];
  const jobTypes = ["Full-time", "Part-time", "Contract", "Internship", "Remote", "Hybrid"];
  // Extended skills list for better searching
  const allSkills = ["React", "Python", "Java", "Node.js", "AWS", "Docker", "Figma", "SQL", "MongoDB", "Tailwind", "Next.js", "TypeScript", "C++", "Go", "Rust"];

  // Toggle Checkbox / Skills
  const handleCheckboxChange = (category, value) => {
    setFilters(prev => {
      const current = prev[category];
      const updated = current.includes(value)
        ? current.filter(item => item !== value) // Remove
        : [...current, value]; // Add
      return { ...prev, [category]: updated };
    });
  };

  const handleRangeChange = (e) => {
    setFilters(prev => ({ ...prev, experience: parseInt(e.target.value) }));
  };

  const handleSalaryChange = (type, value) => {
    setFilters(prev => ({
      ...prev,
      salaryRange: { ...prev.salaryRange, [type]: parseInt(value) || 0 }
    }));
  };

  return (
    <aside className={`filter-sidebar ${isOpen ? 'open' : ''}`}>
      
      <div style={styles.header}>
        <h3>Filters</h3>
        {/* Mobile Close Button */}
        <button onClick={onClose} style={styles.closeBtn} className="mobile-only">
          <FiX size={20} />
        </button>
      </div>

      <div style={styles.scrollContent}>
          {/* 1. SKILLS (Enhanced) */}
          <div style={styles.section}>
            <h4>Skills</h4>
            
            {/* Search Input */}
            <div style={styles.searchBox}>
              <FiSearch style={{color: '#9ca3af'}} />
              <input 
                type="text" 
                placeholder="Search skills..." 
                value={skillSearch}
                onChange={(e) => setSkillSearch(e.target.value)}
                style={styles.searchInput}
              />
            </div>

            {/* SELECTED SKILLS (With Cross Icon) */}
            {filters.skills.length > 0 && (
                <div style={styles.selectedSkillsContainer}>
                    {filters.skills.map(skill => (
                        <button 
                            key={skill}
                            onClick={() => handleCheckboxChange('skills', skill)}
                            style={styles.selectedTag}
                        >
                            {skill} <FiX size={12} style={{marginLeft: '4px'}} />
                        </button>
                    ))}
                </div>
            )}

            {/* AVAILABLE SKILLS LIST */}
            <div style={styles.tagsContainer}>
              {allSkills
                .filter(skill => skill.toLowerCase().includes(skillSearch.toLowerCase()))
                .filter(skill => !filters.skills.includes(skill)) // Hide already selected
                .slice(0, 10) // Limit display
                .map(skill => (
                <button 
                  key={skill}
                  onClick={() => handleCheckboxChange('skills', skill)}
                  style={styles.unselectedTag}
                >
                  + {skill}
                </button>
              ))}
            </div>
          </div>

          <hr style={styles.divider} />

          {/* 2. LOCATION */}
          <div style={styles.section}>
            <h4>Location</h4>
            <div style={styles.checkboxGroup}>
              {locations.map(loc => (
                <label key={loc} style={styles.checkboxLabel}>
                  <input 
                    type="checkbox" 
                    checked={filters.locations.includes(loc)}
                    onChange={() => handleCheckboxChange('locations', loc)}
                    style={{accentColor: '#4f46e5'}}
                  />
                  {loc}
                </label>
              ))}
            </div>
          </div>

          <hr style={styles.divider} />

          {/* 3. EXPERIENCE */}
          <div style={styles.section}>
            <div style={{display:'flex', justifyContent:'space-between', marginBottom:'10px'}}>
                <h4 style={{margin:0}}>Experience</h4>
                <span style={{fontSize:'0.9rem', color:'#4f46e5', fontWeight:'bold'}}>{filters.experience} Yrs</span>
            </div>
            <input 
              type="range" 
              min="0" max="10" 
              value={filters.experience} 
              onChange={handleRangeChange}
              style={styles.slider}
            />
          </div>

          <hr style={styles.divider} />

          {/* 4. SALARY */}
          <div style={styles.section}>
            <h4>Min Salary (₹)</h4>
            <div style={styles.salaryInputBox}>
              <span style={{color:'#6b7280'}}>₹</span>
              <input 
                type="number" 
                value={filters.salaryRange.min}
                onChange={(e) => handleSalaryChange('min', e.target.value)}
                style={styles.nakedInput}
              />
            </div>
          </div>

          <hr style={styles.divider} />

          {/* 5. JOB TYPE */}
          <div style={styles.section}>
            <h4>Job Type</h4>
            <div style={styles.checkboxGroup}>
              {jobTypes.map(type => (
                <label key={type} style={styles.checkboxLabel}>
                  <input 
                    type="checkbox" 
                    checked={filters.jobTypes.includes(type)}
                    onChange={() => handleCheckboxChange('jobTypes', type)}
                    style={{accentColor: '#4f46e5'}}
                  />
                  {type}
                </label>
              ))}
            </div>
          </div>

          {/* RESET BUTTON */}
          <div style={{paddingTop: '20px'}}>
             <button 
                onClick={() => setFilters({
                    locations: [], experience: 10, salaryRange: { min: 0, max: 10000000 }, 
                    skills: [], jobTypes: [], datePosted: 'any'
                })}
                style={styles.resetBtn}
              >
                Reset All Filters
              </button>
          </div>
      </div>

      {/* CSS Injection for Sidebar Layout */}
      <style>{`
        .filter-sidebar {
            width: 280px;
            background-color: #fff;
            border-right: 1px solid #e5e7eb;
            height: calc(100vh - 70px); /* Fill remaining height below navbar */
            position: sticky;
            top: 70px; /* Stick below navbar */
            display: flex;
            flex-direction: column;
            flex-shrink: 0; /* Prevent shrinking */
        }
        
        /* Mobile Drawer Styles */
        @media (max-width: 768px) {
            .filter-sidebar {
                position: fixed;
                top: 0;
                left: 0;
                height: 100vh;
                z-index: 2000;
                transform: translateX(-100%);
                transition: transform 0.3s ease;
                width: 85%;
                max-width: 320px;
                box-shadow: 4px 0 15px rgba(0,0,0,0.1);
            }
            .filter-sidebar.open {
                transform: translateX(0);
            }
            .mobile-only { display: block !important; }
        }
        @media (min-width: 769px) {
            .mobile-only { display: none !important; }
        }
      `}</style>
    </aside>
  );
};

const styles = {
  header: {
    padding: '20px',
    borderBottom: '1px solid #f3f4f6',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
  },
  scrollContent: {
    padding: '20px',
    overflowY: 'auto',
    flex: 1, // Allow this section to scroll while header stays fixed
  },
  closeBtn: { background: 'none', border: 'none', cursor: 'pointer' },
  section: { marginBottom: '20px' },
  divider: { border: 'none', borderTop: '1px solid #f3f4f6', margin: '20px 0' },
  
  // Skills Styles
  searchBox: { display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '8px', marginBottom: '12px' },
  searchInput: { border: 'none', outline: 'none', width: '100%', fontSize: '0.9rem' },
  
  selectedSkillsContainer: { display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' },
  selectedTag: { display: 'flex', alignItems: 'center', backgroundColor: '#4f46e5', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: '20px', fontSize: '0.8rem', cursor: 'pointer' },
  
  tagsContainer: { display: 'flex', flexWrap: 'wrap', gap: '6px' },
  unselectedTag: { backgroundColor: '#f3f4f6', color: '#374151', border: '1px solid #e5e7eb', padding: '5px 10px', borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.2s' },
  
  // Controls
  checkboxGroup: { display: 'flex', flexDirection: 'column', gap: '10px' },
  checkboxLabel: { display: 'flex', gap: '10px', fontSize: '0.9rem', color: '#4b5563', cursor: 'pointer', alignItems: 'center' },
  
  slider: { width: '100%', cursor: 'pointer', accentColor: '#4f46e5', height: '4px' },
  
  salaryInputBox: { display: 'flex', alignItems: 'center', border: '1px solid #d1d5db', borderRadius: '6px', padding: '8px' },
  nakedInput: { border: 'none', outline: 'none', marginLeft: '5px', width: '100%', fontSize: '0.9rem' },

  resetBtn: { width: '100%', padding: '12px', backgroundColor: '#f9fafb', border: '1px solid #d1d5db', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', color: '#4b5563' }
};

export default FilterPanel;