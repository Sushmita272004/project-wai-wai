// frontend/wai-wai/src/components/JobCard.jsx
import React, { useState } from 'react';
import { FiMapPin, FiDollarSign, FiClock, FiBriefcase, FiHeart, FiCheckCircle } from 'react-icons/fi';

const JobCard = ({ job }) => {
  const [saved, setSaved] = useState(false);
  const [applied, setApplied] = useState(false);

  // Helper for Match Score Color
  const getScoreColor = (score) => {
    if (score >= 90) return '#10b981'; // Green
    if (score >= 75) return '#f59e0b'; // Amber
    return '#ef4444'; // Red
  };

  const handleApply = (e) => {
    e.stopPropagation();
    setApplied(true);
    alert(`Applied to ${job.title} at ${job.company}!`);
  };

  const toggleSave = (e) => {
    e.stopPropagation();
    setSaved(!saved);
  };

  return (
    <div style={styles.card}>
      {/* HEADER: Title & Match Score */}
      <div style={styles.header}>
        <div>
          <h3 style={styles.title}>{job.title}</h3>
          <p style={styles.company}>{job.company}</p>
        </div>
        
        {/* Match Score Badge */}
        <div style={{...styles.matchBadge, borderColor: getScoreColor(job.matchScore), color: getScoreColor(job.matchScore)}}>
          <span style={{fontSize: '1.1rem', fontWeight: '800'}}>{job.matchScore}%</span>
          <span style={{fontSize: '0.6rem', textTransform: 'uppercase'}}>Match</span>
        </div>
      </div>

      {/* META INFO */}
      <div style={styles.metaGrid}>
        <div style={styles.metaItem}>
            <FiMapPin style={{marginRight: '5px'}} /> {job.location}
        </div>
        <div style={styles.metaItem}>
            <FiDollarSign style={{marginRight: '5px'}} /> {job.salary.toLocaleString()} - {job.salaryMax.toLocaleString()}
        </div>
        <div style={styles.metaItem}>
            <FiBriefcase style={{marginRight: '5px'}} /> {job.experience} Yrs Exp
        </div>
        <div style={styles.metaItem}>
            <FiClock style={{marginRight: '5px'}} /> {new Date(job.postedDate).toLocaleDateString()}
        </div>
      </div>

      {/* SKILLS TAGS */}
      <div style={styles.skillsContainer}>
        {job.skills.slice(0, 4).map((skill, index) => (
          <span key={index} style={styles.skillTag}>{skill}</span>
        ))}
        {job.skills.length > 4 && <span style={styles.moreTag}>+{job.skills.length - 4}</span>}
      </div>

      {/* ACTIONS */}
      <div style={styles.actionRow}>
        <button 
            onClick={toggleSave} 
            style={{...styles.iconBtn, color: saved ? '#ef4444' : '#9ca3af', borderColor: saved ? '#ef4444' : '#e5e7eb'}}
        >
            <FiHeart fill={saved ? '#ef4444' : 'none'} />
        </button>

        <button 
            onClick={handleApply} 
            disabled={applied}
            style={{
                ...styles.applyBtn, 
                backgroundColor: applied ? '#d1fae5' : '#4f46e5',
                color: applied ? '#065f46' : '#fff',
                cursor: applied ? 'default' : 'pointer'
            }}
        >
            {applied ? (
                <><FiCheckCircle style={{marginRight: '5px'}} /> Applied</>
            ) : (
                'Apply Now'
            )}
        </button>
      </div>
    </div>
  );
};

const styles = {
  card: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    border: '1px solid #f3f4f6',
    height: '100%',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '15px',
  },
  title: {
    margin: '0 0 5px 0',
    fontSize: '1.1rem',
    fontWeight: '700',
    color: '#1f2937',
  },
  company: {
    margin: 0,
    fontSize: '0.9rem',
    color: '#6b7280',
    fontWeight: '500',
  },
  matchBadge: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    border: '3px solid',
    backgroundColor: '#fff',
    flexShrink: 0,
    marginLeft: '10px',
  },
  metaGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px',
    fontSize: '0.85rem',
    color: '#4b5563',
    marginBottom: '15px',
  },
  metaItem: {
    display: 'flex',
    alignItems: 'center',
  },
  skillsContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    marginBottom: '20px',
  },
  skillTag: {
    backgroundColor: '#eff6ff',
    color: '#3b82f6',
    padding: '4px 8px',
    borderRadius: '6px',
    fontSize: '0.75rem',
    fontWeight: '600',
  },
  moreTag: {
    fontSize: '0.75rem',
    color: '#9ca3af',
    padding: '4px 8px',
  },
  actionRow: {
    display: 'flex',
    gap: '10px',
    marginTop: 'auto',
  },
  iconBtn: {
    padding: '10px',
    borderRadius: '8px',
    border: '1px solid',
    backgroundColor: '#fff',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
  },
  applyBtn: {
    flex: 1,
    border: 'none',
    borderRadius: '8px',
    fontWeight: '600',
    fontSize: '0.95rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background-color 0.2s',
  }
};

export default JobCard;