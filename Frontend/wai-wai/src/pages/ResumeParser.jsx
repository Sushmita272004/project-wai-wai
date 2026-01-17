// frontend/wai-wai/src/pages/ResumeParser.jsx
import React, { useState } from 'react';

const ResumeParser = () => {
  const [file, setFile] = useState(null);
  const [fileUrl, setFileUrl] = useState(null);
  
  // Data States
  const [parsedData, setParsedData] = useState(null);
  const [confidence, setConfidence] = useState(null);
  const [relevancy, setRelevancy] = useState(0);
  const [jobDescription, setJobDescription] = useState(""); 
  
  // UX States
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [statusText, setStatusText] = useState(""); // To show "Uploading" vs "Processing"

  // --- HANDLERS ---
  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setFileUrl(URL.createObjectURL(selected));
      // Reset states for new file
      setParsedData(null); 
      setUploadProgress(0);
      setStatusText("");
    }
  };

  const handleParse = async () => {
    if (!file) {
        alert("Please upload a resume first.");
        return;
    }
    
    setLoading(true);
    setStatusText("Uploading Resume...");
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('job_description', jobDescription);

    // Using XMLHttpRequest for Real-time Upload Progress
    const xhr = new XMLHttpRequest();
    xhr.open('POST', 'http://127.0.0.1:5000/api/parse-resume');

    // Track Progress
    xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
            const percent = Math.round((event.loaded / event.total) * 100);
            setUploadProgress(percent);
            if (percent === 100) {
                setStatusText("Processing with AI... (This may take a moment)");
            }
        }
    };

    // Handle Response
    xhr.onload = () => {
        setLoading(false);
        if (xhr.status === 200) {
            const data = JSON.parse(xhr.responseText);
            setParsedData(data.extracted_data);
            setConfidence(data.confidence_scores);
            setRelevancy(data.relevancy_score);
        } else {
            setStatusText("Error Occurred.");
            alert("Error parsing resume. Server status: " + xhr.status);
        }
    };

    xhr.onerror = () => {
        setLoading(false);
        setStatusText("Network Error.");
        alert("Network Error: Could not connect to backend.");
    };

    xhr.send(formData);
  };

  const handleSave = async () => {
    try {
      const payload = {
          ...parsedData,
          relevancy_score: relevancy,
          confidence_scores: confidence,
          job_description: jobDescription
      };

      const res = await fetch('http://127.0.0.1:5000/api/save-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      
      if (result.success) {
        alert("✅ Success! Profile saved to Database.");
        // Reset everything for next user
        setFile(null);
        setParsedData(null);
        setJobDescription("");
        setUploadProgress(0);
        setStatusText("");
      } else {
        console.error("Save failed:", result);
        alert("❌ Failed to save: " + (result.error || "Check console for details"));
      }
    } catch (err) {
      console.error("Save Error:", err);
      alert("❌ Network Error: Is the backend running?");
    }
  };

  // --- HELPERS ---
  const handleChange = (key, value) => setParsedData(prev => ({ ...prev, [key]: value }));
  const handleArrayChange = (key, value) => handleChange(key, value.split(','));

  const Field = ({ label, fieldKey, isArray = false }) => {
    const score = confidence?.[fieldKey] || 0;
    const isLowConfidence = score < 70; 
    const val = parsedData?.[fieldKey];
    const displayVal = isArray && Array.isArray(val) ? val.join(', ') : val;

    return (
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <label style={styles.label}>{label}</label>
          <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: isLowConfidence ? '#d97706' : '#059669' }}>
             Confidence: {score}%
          </span>
        </div>
        
        {isArray ? (
          <textarea
            value={displayVal || ''}
            onChange={(e) => handleArrayChange(fieldKey, e.target.value)}
            style={{
                ...styles.input,
                minHeight: '100px',
                border: isLowConfidence ? '2px solid #f59e0b' : '1px solid #ccc',
                backgroundColor: isLowConfidence ? '#fffbeb' : '#fff'
            }}
          />
        ) : (
          <input
            type="text"
            value={displayVal || ''}
            onChange={(e) => handleChange(fieldKey, e.target.value)}
            style={{
                ...styles.input,
                border: isLowConfidence ? '2px solid #f59e0b' : '1px solid #ccc',
                backgroundColor: isLowConfidence ? '#fffbeb' : '#fff'
            }}
          />
        )}
        {isLowConfidence && <small style={{color: '#d97706', fontWeight: 'bold'}}>⚠️ Low Confidence - Please Verify</small>}
      </div>
    );
  };

  return (
    <div style={styles.container}>
      <h2 style={{ textAlign: 'center', marginBottom: '30px', color: '#fff' }}>Smart Resume Parsing System</h2>

      {/* STEP 1: UPLOAD AREA */}
      {!parsedData && (
        <div style={styles.uploadCard}>
            
            {/* Job Description Input */}
            <div style={{ marginBottom: '25px', textAlign: 'left' }}>
                <label style={styles.labelMuted}>
                    Target Job Description (Optional - for Relevancy Score)
                </label>
                <textarea 
                    placeholder="Paste the Job Description here..."
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    style={{ ...styles.input, minHeight: '80px', backgroundColor: '#fff' }}
                />
            </div>

            {/* File Drop Zone */}
            <div style={styles.dropZone}>
                <p style={{ fontSize: '1.1rem', color: '#64748b', marginBottom: '15px' }}>
                    Upload Resume (PDF or DOCX)
                </p>
                
                {/* Custom File Input UI */}
                {!file ? (
                    <div style={{position: 'relative', overflow: 'hidden', display: 'inline-block'}}>
                        <button style={styles.uploadBtn}>Choose File</button>
                        <input 
                            type="file" 
                            onChange={handleFileChange} 
                            accept=".pdf,.docx" 
                            style={{position: 'absolute', left: 0, top: 0, opacity: 0, width: '100%', height: '100%', cursor: 'pointer'}} 
                        />
                    </div>
                ) : (
                    // FILE SELECTED FEEDBACK
                    <div style={styles.fileSelectedBox}>
                        <span style={{fontSize: '1.5rem'}}>📄</span>
                        <div>
                            <p style={{fontWeight: 'bold', margin: 0, color: '#065f46'}}>{file.name}</p>
                            <p style={{fontSize: '0.8rem', margin: 0, color: '#047857'}}>Ready to parse</p>
                        </div>
                        <button onClick={() => setFile(null)} style={styles.removeBtn}>✕</button>
                    </div>
                )}
            </div>

            {/* PROGRESS BAR (Dynamic) */}
            {loading && (
                <div style={styles.progressContainer}>
                    <div style={styles.progressBarBackground}>
                        <div style={{ ...styles.progressBarFill, width: `${uploadProgress}%` }}></div>
                    </div>
                    <p style={{ marginTop: '10px', color: '#4f46e5', fontWeight: 'bold' }}>
                        {statusText} {uploadProgress < 100 ? `${uploadProgress}%` : ''}
                    </p>
                </div>
            )}

            {/* PARSE BUTTON */}
            {file && !loading && (
                <button onClick={handleParse} style={styles.parseBtn}>
                    🚀 Parse Resume & Check Relevancy
                </button>
            )}
        </div>
      )}

      {/* STEP 2: RESULTS AREA */}
      {parsedData && (
        <div style={styles.splitView}>
            {/* LEFT: EDIT FORM */}
            <div style={styles.formPanel}>
                <div style={styles.headerRow}>
                    <h3 style={styles.panelHeader}>Parsed Details</h3>
                    
                    {/* Relevancy Badge */}
                    <div style={{ 
                        padding: '8px 16px', borderRadius: '20px', 
                        backgroundColor: relevancy > 70 ? '#dcfce7' : '#fee2e2',
                        color: relevancy > 70 ? '#166534' : '#991b1b',
                        fontWeight: 'bold', border: '1px solid currentColor',
                        display: 'flex', alignItems: 'center', gap: '5px'
                    }}>
                        <span>Job Match:</span>
                        <span style={{fontSize: '1.2rem'}}>{relevancy}%</span>
                    </div>
                </div>
                
                <Field label="Full Name" fieldKey="name" />
                <Field label="Email Address" fieldKey="email" />
                <Field label="Phone Number" fieldKey="phone" />
                <Field label="Education" fieldKey="education" />
                <Field label="Skills" fieldKey="skills" isArray />
                <Field label="Work Experience" fieldKey="experience" isArray />
                <Field label="Projects" fieldKey="projects" isArray />

                <div style={{ marginTop: '30px', display: 'flex', gap: '15px' }}>
                    <button onClick={handleSave} style={styles.saveBtn}>✅ Confirm & Save to Database</button>
                    <button onClick={() => setParsedData(null)} style={styles.cancelBtn}>Discard</button>
                </div>
            </div>

            {/* RIGHT: PREVIEW */}
            <div style={styles.previewPanel}>
                <h3 style={styles.panelHeader}>Original Document</h3>
                {file?.type === 'application/pdf' ? (
                    <iframe src={fileUrl} style={styles.iframe} title="Resume Preview"></iframe>
                ) : (
                    <div style={styles.docxPlaceholder}><p><strong>{file.name}</strong></p><p>DOCX Preview not available in browser.</p></div>
                )}
            </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: { maxWidth: '1280px', margin: '0 auto', padding: '20px' },
  uploadCard: { padding: '40px', border: '2px dashed #94a3b8', borderRadius: '12px', textAlign: 'center', backgroundColor: '#f8fafc', maxWidth: '700px', margin: '40px auto' },
  dropZone: { display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '10px' },
  
  // Custom File Input Styles
  uploadBtn: { backgroundColor: '#fff', border: '1px solid #ccc', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', color: '#555' },
  
  // File Selected Badge
  fileSelectedBox: { display: 'flex', alignItems: 'center', gap: '15px', backgroundColor: '#d1fae5', padding: '10px 20px', borderRadius: '8px', border: '1px solid #10b981' },
  removeBtn: { background: 'none', border: 'none', color: '#047857', cursor: 'pointer', fontSize: '1.2rem', fontWeight: 'bold' },

  parseBtn: { marginTop: '25px', padding: '14px 35px', backgroundColor: '#4f46e5', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '1.1rem', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' },
  
  // Progress Bar
  progressContainer: { width: '80%', margin: '25px auto 0' },
  progressBarBackground: { width: '100%', height: '12px', backgroundColor: '#e2e8f0', borderRadius: '6px', overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: '#4f46e5', transition: 'width 0.2s ease' },

  splitView: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', alignItems: 'start' },
  formPanel: { backgroundColor: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' },
  headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '15px', marginBottom: '20px' },
  panelHeader: { margin: 0, color: '#1e293b' },
  previewPanel: { height: '850px', backgroundColor: '#e2e8f0', borderRadius: '12px', padding: '15px' },
  iframe: { width: '100%', height: '94%', border: 'none', backgroundColor: '#fff', borderRadius: '4px', marginTop: '10px' },
  input: { width: '100%', padding: '12px', borderRadius: '6px', fontSize: '1rem', marginTop: '5px', color: '#333', fontFamily: 'inherit' },
  label: { fontWeight: 'bold', fontSize: '0.9rem', color: '#333' },
  labelMuted: { display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#64748b' },
  
  saveBtn: { flex: 2, padding: '14px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem' },
  cancelBtn: { flex: 1, padding: '14px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' },
  docxPlaceholder: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#64748b', fontSize: '1.1rem' }
};

export default ResumeParser;