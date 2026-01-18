import React, { useState } from 'react';
// Added FiUploadCloud to the import list below
import { FiMapPin, FiDollarSign, FiClock, FiBriefcase, FiHeart, FiCheckCircle, FiAlertCircle, FiUploadCloud } from 'react-icons/fi';

// --- STYLES OBJECT ---
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
    position: 'relative',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '15px',
    gap: '10px'
  },
  title: {
    margin: '0 0 5px 0',
    fontSize: '1.1rem',
    fontWeight: '700',
    color: '#1f2937',
    lineHeight: '1.4'
  },
  company: {
    margin: 0,
    fontSize: '0.9rem',
    color: '#6b7280',
    fontWeight: '500',
  },
  matchContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '50px',
  },
  circularChart: {
    display: 'block',
    margin: '0 auto',
    maxWidth: '100%',
    maxHeight: '250px',
  },
  circleBg: {
    fill: 'none',
    stroke: '#eee',
    strokeWidth: '3.8',
  },
  circle: {
    fill: 'none',
    strokeWidth: '2.8',
    strokeLinecap: 'round',
    transition: 'stroke-dasharray 0.5s ease',
  },
  percentage: {
    fill: '#111',
    fontFamily: 'sans-serif',
    fontWeight: 'bold',
    fontSize: '0.65rem',
    textAnchor: 'middle',
  },
  matchLabel: {
    fontSize: '0.6rem',
    textTransform: 'uppercase',
    color: '#6b7280',
    marginTop: '2px',
    fontWeight: '600'
  },
  // UPDATED UPLOAD PROMPT STYLE
  uploadPrompt: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.7rem',
    color: '#2563eb',
    fontWeight: '600',
    textAlign: 'center',
    cursor: 'pointer',
    backgroundColor: '#f0f9ff',
    border: '1px dashed #bfdbfe',
    padding: '8px 4px',
    borderRadius: '8px',
    width: '60px',
    height: '60px',
    lineHeight: '1.1',
    transition: 'all 0.2s ease',
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
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  skillsContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    marginBottom: '15px',
  },
  skillTag: {
    backgroundColor: '#f3f4f6',
    color: '#374151',
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
  missingSkillsBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '0.8rem',
    color: '#b91c1c',
    backgroundColor: '#fef2f2',
    padding: '8px',
    borderRadius: '6px',
    marginBottom: '15px',
    border: '1px solid #fecaca'
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

  // Trigger file upload from card
  const triggerUpload = (e) => {
    e.stopPropagation();
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) fileInput.click();
  };

  return (
    <div style={styles.card}>
      {/* HEADER: Title & Match Score */}
      <div style={styles.header}>
        <div style={{ flex: 1 }}>
          <h3 style={styles.title}>{job.title}</h3>
          <p style={styles.company}>{job.company}</p>
        </div>
        
        {job.matchScore > 0 ? (
          <div style={styles.matchContainer}>
             <svg viewBox="0 0 36 36" style={styles.circularChart}>
                <path
                  style={styles.circleBg}
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  style={{...styles.circle, stroke: getScoreColor(job.matchScore)}}
                  strokeDasharray={`${job.matchScore}, 100`}
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <text x="18" y="20.35" style={styles.percentage}>
                  {job.matchScore}%
                </text>
              </svg>
              <span style={styles.matchLabel}>Match</span>
          </div>
        ) : (
          <div 
            onClick={triggerUpload}
            style={styles.uploadPrompt}
            title="Click to upload resume for Match Score"
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#dbeafe';
              e.currentTarget.style.borderColor = '#3b82f6';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#f0f9ff';
              e.currentTarget.style.borderColor = '#bfdbfe';
            }}
          >
            <FiUploadCloud style={{ fontSize: '1.2rem', marginBottom: '2px' }} />
            <span style={{ fontSize: '0.6rem' }}>Check Match</span>
          </div>
        )}
      </div>

      {/* META INFO */}
      <div style={styles.metaGrid}>
        <div style={styles.metaItem}>
            <FiMapPin style={{marginRight: '5px'}} /> {job.location}
        </div>
        <div style={styles.metaItem}>
            <FiDollarSign style={{marginRight: '5px'}} /> {(job.salaryMax || job.salary)/100000}L PA
        </div>
        <div style={styles.metaItem}>
            <FiBriefcase style={{marginRight: '5px'}} /> {job.experience} Yrs
        </div>
        <div style={styles.metaItem}>
            <FiClock style={{marginRight: '5px'}} /> {new Date(job.postedDate).toLocaleDateString()}
        </div>
      </div>

      {/* SKILLS TAGS */}
      <div style={styles.skillsContainer}>
        {(job.skills || []).slice(0, 4).map((skill, index) => (
          <span key={index} style={styles.skillTag}>{skill}</span>
        ))}
        {(job.skills || []).length > 4 && <span style={styles.moreTag}>+{(job.skills || []).length - 4}</span>}
      </div>

      {/* Missing Skills Section */}
      {job.missingSkills && job.missingSkills.length > 0 && (
        <div style={styles.missingSkillsBox}>
          <FiAlertCircle style={{ minWidth: '16px' }} />
          <span>
            Missing: {job.missingSkills.slice(0, 3).join(", ")}
            {job.missingSkills.length > 3 ? "..." : ""}
          </span>
        </div>
      )}

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

export default JobCard;