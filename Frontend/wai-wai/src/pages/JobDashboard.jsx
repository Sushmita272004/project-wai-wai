// frontend/wai-wai/src/pages/JobDashboard.jsx
import React, { useState, useMemo, useRef } from 'react';
import FilterPanel from '../components/FilterPanel';
import JobCard from '../components/JobCard';
import mockJobs from '../data/mockJobs.json'; 
import { FiSearch, FiFilter, FiGrid, FiList, FiUploadCloud, FiX } from 'react-icons/fi';

const JobDashboard = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [sortBy, setSortBy] = useState("matchScore");

  // --- RESUME MATCHING STATES ---
  const [resumeData, setResumeData] = useState(null); // Stores parsed resume
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const [filters, setFilters] = useState({
    locations: [],
    experience: 10,
    salaryRange: { min: 0, max: 10000000 },
    skills: [],
    jobTypes: [],
    datePosted: 'any'
  });

  // --- 1. HANDLE RESUME UPLOAD ---
  const handleResumeUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    // We don't need a specific JD for general matching, sending empty
    formData.append('job_description', ""); 

    try {
      const res = await fetch('http://127.0.0.1:5000/api/parse-resume', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (res.ok) {
        setResumeData(data.extracted_data);
        alert(`✅ Resume Parsed! Jobs are now ranked for ${data.extracted_data.name}.`);
      } else {
        alert("Parsing failed. Please try again.");
      }
    } catch (err) {
      console.error(err);
      alert("Network Error: Is backend running?");
    } finally {
      setIsUploading(false);
      // Reset input so same file can be selected again if needed
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const clearResumeMatch = () => {
    setResumeData(null);
  };

  // --- 2. SMART MATCHING LOGIC ---
  // If resume is uploaded, we recalculate scores dynamically
  const jobsWithScores = useMemo(() => {
    if (!resumeData) return mockJobs;

    return mockJobs.map(job => {
      let score = 0;
      
      // A. Skill Overlap (Weight: 60%)
      const jobSkills = job.skills.map(s => s.toLowerCase());
      const userSkills = (resumeData.skills || []).map(s => s.toLowerCase());
      
      const matchingSkills = jobSkills.filter(skill => 
        userSkills.some(userSkill => userSkill.includes(skill) || skill.includes(userSkill))
      );
      
      const skillMatchRatio = jobSkills.length > 0 ? matchingSkills.length / jobSkills.length : 0;
      score += skillMatchRatio * 60;

      // B. Experience Match (Weight: 20%)
      // Heuristic: If user has enough exp, full points. If slightly less, partial.
      // We assume user experience is just a number in the list for simplicity, or we parse it.
      // Since parsed exp is an array of strings, we'll do a basic check or just skip for now to keep it robust.
      // Let's rely heavily on skills for this mock.
      score += 20; // Base boost for having a resume

      // C. Location Match (Weight: 10%) (Optional)
      
      // Cap score at 98%
      const finalScore = Math.min(98, Math.round(score + 10)); // +10 base

      return { ...job, matchScore: finalScore };
    });
  }, [resumeData]);

  // --- 3. FILTERING & SORTING ---
  const filteredJobs = useMemo(() => {
    return jobsWithScores.filter(job => {
      const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) || job.company.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesLocation = filters.locations.length === 0 || filters.locations.includes(job.location);
      const matchesType = filters.jobTypes.length === 0 || filters.jobTypes.includes(job.type);
      const matchesExp = job.experience <= filters.experience;
      const matchesSalary = job.salaryMax >= filters.salaryRange.min;
      const matchesSkills = filters.skills.length === 0 || job.skills.some(s => filters.skills.includes(s));
      return matchesSearch && matchesLocation && matchesType && matchesExp && matchesSalary && matchesSkills;
    }).sort((a, b) => {
      if (sortBy === 'matchScore') return b.matchScore - a.matchScore;
      if (sortBy === 'salary') return b.salary - a.salary;
      if (sortBy === 'date') return new Date(b.postedDate) - new Date(a.postedDate);
      return 0;
    });
  }, [searchTerm, filters, sortBy, jobsWithScores]);

  return (
    <div style={styles.container}>
      {/* MOBILE OVERLAY */}
      {isFilterOpen && <div style={styles.overlay} onClick={() => setIsFilterOpen(false)} />}

      <div style={styles.layout}>
        {/* SIDEBAR */}
        <FilterPanel 
            filters={filters} 
            setFilters={setFilters} 
            isOpen={isFilterOpen} 
            onClose={() => setIsFilterOpen(false)} 
        />

        {/* MAIN CONTENT */}
        <main style={styles.main}>
          
          {/* SEARCH & CONTROLS */}
          <div style={styles.topBar}>
            <div style={styles.searchWrapper}>
                <FiSearch style={styles.searchIcon} />
                <input 
                    type="text" 
                    placeholder="Search by role, company..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={styles.searchInput}
                />
            </div>
            
            <div style={styles.controlsRow}>
                {/* RESUME UPLOAD BUTTON */}
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    style={{display: 'none'}} 
                    accept=".pdf,.docx" 
                    onChange={handleResumeUpload} 
                />
                
                {!resumeData ? (
                    <button 
                        onClick={() => fileInputRef.current.click()}
                        disabled={isUploading}
                        style={styles.uploadBtn}
                    >
                        <FiUploadCloud style={{fontSize: '1.1rem'}} />
                        {isUploading ? 'Analyzing...' : 'Smart Match with Resume'}
                    </button>
                ) : (
                    <div style={styles.activeResumeBadge}>
                        <span>Matches for: <strong>{resumeData.name?.split(' ')[0]}</strong></span>
                        <button onClick={clearResumeMatch} style={styles.clearResumeBtn} title="Remove Resume"><FiX /></button>
                    </div>
                )}

                <select 
                    value={sortBy} 
                    onChange={(e) => setSortBy(e.target.value)}
                    style={styles.sortSelect}
                >
                    <option value="matchScore">Smart Match</option>
                    <option value="salary">Highest Salary</option>
                    <option value="date">Newest First</option>
                </select>

                <div style={styles.viewToggle}>
                    <button onClick={() => setViewMode('grid')} style={viewMode === 'grid' ? styles.activeIconBtn : styles.iconBtn}><FiGrid /></button>
                    <button onClick={() => setViewMode('list')} style={viewMode === 'list' ? styles.activeIconBtn : styles.iconBtn}><FiList /></button>
                </div>
            </div>
          </div>

          <div style={styles.resultsHeader}>
            <p style={{color: '#4b5563'}}>
                Found <strong>{filteredJobs.length}</strong> opportunities
                {resumeData && <span style={{color: '#4f46e5', marginLeft: '5px'}}> (Personalized Rankings Active)</span>}
            </p>
          </div>

          <div style={viewMode === 'grid' ? styles.grid : styles.list}>
            {filteredJobs.length > 0 ? (
                filteredJobs.map(job => <JobCard key={job.id} job={job} />)
            ) : (
                <div style={styles.noResults}>
                    <h3>No jobs found</h3>
                    <p>Try adjusting your search or filters.</p>
                    <button onClick={() => setFilters({locations: [], experience: 10, salaryRange: { min: 0 }, skills: [], jobTypes: [], datePosted: 'any'})} style={styles.clearBtn}>Clear All Filters</button>
                </div>
            )}
          </div>
        </main>
      </div>

      <button className="mobile-only" onClick={() => setIsFilterOpen(true)} style={styles.mobileFloatBtn}>
        <FiFilter style={{marginRight: '8px'}} /> Filters
      </button>

      <style>{`
        @media (min-width: 769px) { .mobile-only { display: none !important; } }
      `}</style>
    </div>
  );
};

const styles = {
  container: { backgroundColor: '#f8fafc', minHeight: '100vh', position: 'relative' },
  layout: { display: 'flex', width: '100%', maxWidth: '1600px', margin: '0 auto', alignItems: 'flex-start' },
  main: { flex: 1, padding: '20px', minWidth: 0 },
  overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000 },
  topBar: { display: 'flex', flexWrap: 'wrap', gap: '15px', marginBottom: '25px', justifyContent: 'space-between', alignItems: 'center' },
  
  searchWrapper: { flex: 1, display: 'flex', alignItems: 'center', backgroundColor: '#fff', padding: '12px 20px', borderRadius: '12px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', minWidth: '280px' },
  searchIcon: { color: '#9ca3af', marginRight: '10px', fontSize: '1.2rem' },
  searchInput: { border: 'none', outline: 'none', width: '100%', fontSize: '1rem' },

  controlsRow: { display: 'flex', gap: '10px', flexWrap: 'wrap' },
  
  // NEW STYLES FOR RESUME BUTTON
  uploadBtn: { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', backgroundColor: '#4f46e5', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', transition: 'background 0.2s' },
  activeResumeBadge: { display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', backgroundColor: '#eef2ff', color: '#4f46e5', borderRadius: '8px', border: '1px solid #c7d2fe', fontSize: '0.9rem' },
  clearResumeBtn: { background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center' },

  sortSelect: { padding: '10px 15px', borderRadius: '8px', border: '1px solid #e5e7eb', backgroundColor: '#fff', cursor: 'pointer', outline: 'none' },
  viewToggle: { display: 'flex', gap: '4px', backgroundColor: '#fff', padding: '4px', borderRadius: '8px', border: '1px solid #e5e7eb' },
  iconBtn: { padding: '8px', border: 'none', background: 'transparent', color: '#9ca3af', cursor: 'pointer', borderRadius: '6px' },
  activeIconBtn: { padding: '8px', border: 'none', background: '#eef2ff', color: '#4f46e5', cursor: 'pointer', borderRadius: '6px' },
  resultsHeader: { marginBottom: '15px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' },
  list: { display: 'flex', flexDirection: 'column', gap: '15px' },
  mobileFloatBtn: { position: 'fixed', bottom: '25px', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#1f2937', color: '#fff', padding: '12px 24px', borderRadius: '30px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.2)', zIndex: 900, display: 'flex', alignItems: 'center', fontWeight: 'bold' },
  noResults: { textAlign: 'center', padding: '60px', color: '#6b7280' },
  clearBtn: { marginTop: '10px', padding: '8px 16px', backgroundColor: '#4f46e5', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }
};

export default JobDashboard;