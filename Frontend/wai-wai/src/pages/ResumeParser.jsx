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
  
  // NEW: Gap Analysis & Coaching State
  const [gapData, setGapData] = useState(null);
  const [isAnalyzingGap, setIsAnalyzingGap] = useState(false);
  
  // UX States
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [statusText, setStatusText] = useState(""); 

  // --- HANDLERS ---
  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setFileUrl(URL.createObjectURL(selected));
      setParsedData(null); 
      setGapData(null);
      setUploadProgress(0);
      setStatusText("");
    }
  };

  const handleParse = async () => {
    if (!file) { alert("Please upload a resume first."); return; }
    
    setLoading(true);
    setStatusText("Uploading & Extracting Text...");
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('job_description', jobDescription);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', 'http://127.0.0.1:5000/api/parse-resume');

    xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
            const percent = Math.round((event.loaded / event.total) * 100);
            setUploadProgress(percent); // Used here
            if (percent === 100) setStatusText("Processing with AI... (This may take a moment)");
        }
    };

    xhr.onload = () => {
        setLoading(false);
        if (xhr.status === 200) {
            const data = JSON.parse(xhr.responseText);
            setParsedData(data.extracted_data);
            setConfidence(data.confidence_scores);
            setRelevancy(data.relevancy_score);
        } else {
            setStatusText("Error Occurred.");
            alert("Error parsing resume.");
        }
    };

    xhr.onerror = () => { setLoading(false); setStatusText("Network Error."); alert("Network Error"); };
    xhr.send(formData);
  };

  const handleGapAnalysis = async () => {
    setIsAnalyzingGap(true);
    try {
        const payload = {
            current_role: "Candidate", 
            current_skills: parsedData.skills || [],
            target_role: "Target Role",
            job_description: jobDescription,
            experience_years: parsedData.experience ? parsedData.experience.length : 1
        };

        const res = await fetch('http://127.0.0.1:5000/api/analyze-gap', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        const data = await res.json();
        if (data.analysis) setGapData(data);
    } catch (e) {
        console.error("Gap Analysis Failed", e);
        alert("Analysis failed. Check backend console.");
    } finally {
        setIsAnalyzingGap(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!gapData) {
        alert("Please run the Skill Gap Analysis first.");
        return;
    }
    try {
        const payload = {
            roadmap_data: gapData,
            candidate_name: parsedData.name || "Candidate"
        };
        const res = await fetch('http://127.0.0.1:5000/api/download-roadmap', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        if (!res.ok) throw new Error("Server error");

        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const safeName = (parsedData.name || "Candidate").replace(/[^a-z0-9]/gi, '_');
        a.download = `Career_Roadmap_${safeName}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
    } catch (e) {
        alert("Download failed: " + e.message);
    }
  };

  const handleSave = async () => {
    if (!parsedData) return;
    try {
      const payload = { ...parsedData, relevancy_score: relevancy, confidence_scores: confidence, job_description: jobDescription };
      const res = await fetch('http://127.0.0.1:5000/api/save-profile', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
      });
      const result = await res.json();
      if (res.ok) alert("✅ Profile Saved!");
      else alert("❌ Save Failed: " + (result.error || "Unknown error"));
    } catch (err) { 
        console.error(err);
        alert("Network Error: Is backend running?"); 
    }
  };

  // --- UI COMPONENTS ---
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
          <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: isLowConfidence ? '#d97706' : '#059669' }}>Confidence: {score}%</span>
        </div>
        {isArray ? (
          <textarea value={displayVal || ''} onChange={(e) => handleArrayChange(fieldKey, e.target.value)} style={{...styles.input, minHeight: '100px'}} />
        ) : (
          <input type="text" value={displayVal || ''} onChange={(e) => handleChange(fieldKey, e.target.value)} style={{...styles.input}} />
        )}
      </div>
    );
  };

  return (
    <div style={styles.container}>
      <h2 style={{ textAlign: 'center', marginBottom: '30px', color: '#000' }}>Smart Resume Parsing System</h2>

      {/* STEP 1: UPLOAD */}
      {!parsedData && (
        <div style={styles.uploadCard}>
            <div style={{ marginBottom: '25px', textAlign: 'left' }}>
                <label style={styles.labelMuted}>Target Job Description (Optional)</label>
                <textarea 
                    placeholder="Paste JD here for Gap Analysis..."
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    style={{ ...styles.input, minHeight: '100px' }}
                />
            </div>
            <div style={styles.dropZone}>
                <p style={{ fontSize: '1.1rem', color: '#64748b' }}>Upload Resume (PDF/DOCX)</p>
                {!file ? (
                    <div style={{position: 'relative', overflow: 'hidden', display: 'inline-block'}}>
                        <button style={styles.uploadBtn}>Choose File</button>
                        <input type="file" onChange={handleFileChange} accept=".pdf,.docx" style={styles.hiddenInput} />
                    </div>
                ) : (
                    <div style={styles.fileSelectedBox}>
                        <span>📄 {file.name}</span>
                        <button onClick={() => setFile(null)} style={styles.removeBtn}>✕</button>
                    </div>
                )}
            </div>
            {loading && (
                <div style={styles.progressContainer}>
                    <div style={styles.progressBarBackground}>
                        <div style={{ ...styles.progressBarFill, width: `${uploadProgress}%` }}></div>
                    </div>
                    <p style={{ marginTop: '10px', color: '#4f46e5', fontWeight: 'bold' }}>
                        {statusText} {uploadProgress}%
                    </p>
                </div>
            )}
            {file && !loading && <button onClick={handleParse} style={styles.parseBtn}>🚀 Parse Resume</button>}
        </div>
      )}

      {/* STEP 2: RESULTS */}
      {parsedData && (
        <div style={styles.splitView}>
            <div style={styles.formPanel}>
                <div style={styles.headerRow}>
                    <h3 style={styles.panelHeader}>Parsed Details</h3>
                    <div style={styles.relevancyBadge}>Job Match: {relevancy}%</div>
                </div>
                
                <Field label="Full Name" fieldKey="name" />
                <Field label="Email" fieldKey="email" />
                <Field label="Phone" fieldKey="phone" />
                <Field label="Skills" fieldKey="skills" isArray />
                <Field label="Experience" fieldKey="experience" isArray />

                {/* --- ANALYZE BUTTON --- */}
                {!gapData && !isAnalyzingGap && jobDescription.length > 10 && (
                    <button onClick={handleGapAnalysis} style={styles.analyzeBtn}>
                        🔮 Analyze Skill Gap & Career Coach
                    </button>
                )}

                {isAnalyzingGap && <p style={{textAlign:'center', color: '#4f46e5', fontWeight: 'bold', padding: '20px'}}>🤖 AI is analyzing your skills & generating roadmap...</p>}

                {/* --- GAP RESULTS --- */}
                {gapData && (
                    <div style={styles.gapSection}>
                        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'15px'}}>
                            <h3 style={styles.sectionTitle}>📊 Career Coach Report</h3>
                            <button onClick={handleDownloadPDF} style={styles.pdfBtn}>⬇ PDF Report</button>
                        </div>

                        {/* Readiness */}
                        <div style={styles.readinessCard}>
                            <div style={{textAlign:'center', paddingRight:'20px', borderRight:'1px solid #ddd'}}>
                                <div style={{fontSize:'2.5rem', fontWeight:'800', color: gapData.analysis.readiness_score > 70 ? '#10b981' : '#f59e0b'}}>
                                    {gapData.analysis.readiness_score}%
                                </div>
                                <div style={{fontSize:'0.8rem'}}>Readiness</div>
                            </div>
                            <div style={{paddingLeft:'20px'}}>
                                <p style={{fontStyle:'italic', color:'#555'}}>{gapData.analysis.readiness_reasoning}</p>
                            </div>
                        </div>

                        {/* Radar Stats */}
                        {gapData.visualization_data?.radar_chart && (
                            <div style={styles.statsGrid}>
                                {Object.entries(gapData.visualization_data.radar_chart).map(([k,v]) => (
                                    <div key={k} style={styles.statBox}>
                                        <div style={{fontSize:'0.7rem', color:'#666'}}>{k.replace(/_/g,' ')}</div>
                                        <div style={{fontWeight:'bold', color:'#059669'}}>{v}%</div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Roadmap */}
                        <h4 style={styles.subHeader}>🚀 Learning Roadmap</h4>
                        {gapData.learning_roadmap.map((step, i) => (
                            <div key={i} style={styles.roadmapStep}>
                                <div style={styles.stepBadge}>{step.phase}</div>
                                <div>
                                    <div style={{fontWeight:'bold'}}>{step.focus} <span style={{fontSize:'0.8em', color:'#666'}}>({step.duration})</span></div>
                                    <div style={{fontSize:'0.9em', color:'#444'}}>{step.reasoning}</div>
                                </div>
                            </div>
                        ))}

                        {/* Alternative Paths */}
                        <h4 style={styles.subHeader}>🔀 Alternative Career Paths</h4>
                        {gapData.alternative_paths?.map((path, i) => (
                            <div key={i} style={styles.altPathCard}>
                                <div style={{fontWeight:'bold', color:'#1e293b'}}>{path.role} <span style={{fontSize:'0.8em', color:'#059669'}}>({path.match_potential} Match)</span></div>
                                <div style={{fontSize:'0.9em', color:'#475569'}}>{path.conclusion}</div>
                            </div>
                        ))}

                        {/* Salary (INR) */}
                        <h4 style={styles.subHeader}>💰 Salary Insights (INR)</h4>
                        <div style={styles.salaryBox}>
                            <div><strong>Current Est:</strong> {gapData.salary_growth?.current_estimated}</div>
                            <div><strong>1 Year Potential:</strong> {gapData.salary_growth?.potential_1_year}</div>
                            <div style={{gridColumn:'1 / -1', marginTop:'5px', fontSize:'0.9em', fontStyle:'italic'}}>{gapData.salary_growth?.insight}</div>
                        </div>
                    </div>
                )}

                <div style={{ marginTop: '30px', display: 'flex', gap: '15px' }}>
                    <button onClick={handleSave} style={styles.saveBtn}>✅ Save Profile</button>
                    <button onClick={() => setParsedData(null)} style={styles.cancelBtn}>Discard</button>
                </div>
            </div>

            {/* PREVIEW */}
            <div style={styles.previewPanel}>
                <h3 style={styles.panelHeader}>Original Document</h3>
                {file?.type === 'application/pdf' ? (
                    <iframe src={fileUrl} style={styles.iframe} title="Preview"></iframe>
                ) : (
                    <div style={styles.docxPlaceholder}>DOCX Preview Unavailable</div>
                )}
            </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: { maxWidth: '1400px', margin: '0 auto', padding: '20px' },
  uploadCard: { padding: '40px', border: '2px dashed #94a3b8', borderRadius: '12px', textAlign: 'center', backgroundColor: '#f8fafc', maxWidth: '700px', margin: '40px auto' },
  input: { width: '100%', padding: '12px', borderRadius: '6px', fontSize: '1rem', marginTop: '5px', border: '1px solid #ccc' },
  label: { fontWeight: 'bold', fontSize: '0.9rem', color: '#333' },
  labelMuted: { display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#64748b' },
  uploadBtn: { backgroundColor: '#fff', border: '1px solid #ccc', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' },
  hiddenInput: { position: 'absolute', left: 0, top: 0, opacity: 0, width: '100%', height: '100%', cursor: 'pointer' },
  parseBtn: { marginTop: '25px', padding: '14px 35px', backgroundColor: '#4f46e5', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '1.1rem', cursor: 'pointer', fontWeight: 'bold' },
  analyzeBtn: { width: '100%', padding: '15px', backgroundColor: '#8b5cf6', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '1rem', cursor: 'pointer', fontWeight: 'bold', marginBottom: '20px', boxShadow: '0 4px 6px rgba(139, 92, 246, 0.25)' },
  
  // Progress Bar Styles
  progressContainer: { width: '80%', margin: '25px auto 0' },
  progressBarBackground: { width: '100%', height: '12px', backgroundColor: '#e2e8f0', borderRadius: '6px', overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: '#4f46e5', transition: 'width 0.2s ease' },

  splitView: { display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '30px', alignItems: 'start' },
  formPanel: { backgroundColor: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' },
  previewPanel: { height: '1200px', backgroundColor: '#e2e8f0', borderRadius: '12px', padding: '15px', position: 'sticky', top: '20px' },
  iframe: { width: '100%', height: '96%', border: 'none', backgroundColor: '#fff', borderRadius: '4px', marginTop: '10px' },
  
  gapSection: { marginTop: '30px', borderTop: '2px dashed #e2e8f0', paddingTop: '20px' },
  sectionTitle: { fontSize: '1.25rem', color: '#1e293b', borderLeft: '5px solid #4f46e5', paddingLeft: '10px' },
  subHeader: { marginTop: '25px', marginBottom: '10px', color: '#334155', borderBottom: '1px solid #eee', paddingBottom: '5px' },
  
  readinessCard: { display: 'flex', alignItems: 'center', backgroundColor: '#f0fdf4', padding: '20px', borderRadius: '12px', border: '1px solid #bbf7d0', marginBottom: '15px' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '10px', marginBottom: '15px' },
  statBox: { backgroundColor: '#f8fafc', padding: '10px', borderRadius: '8px', textAlign: 'center', border: '1px solid #e2e8f0' },
  
  roadmapStep: { display: 'flex', alignItems: 'flex-start', backgroundColor: '#fff', padding: '15px', borderRadius: '8px', borderLeft: '4px solid #4f46e5', marginBottom: '10px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' },
  stepBadge: { backgroundColor: '#eef2ff', color: '#4f46e5', padding: '5px 10px', borderRadius: '6px', fontWeight: 'bold', marginRight: '15px', whiteSpace: 'nowrap' },
  
  altPathCard: { backgroundColor: '#fdf4ff', padding: '12px', borderRadius: '8px', marginBottom: '8px', border: '1px solid #f0abfc' },
  salaryBox: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', backgroundColor: '#fffbeb', padding: '15px', borderRadius: '8px', border: '1px solid #fcd34d' },
  
  pdfBtn: { backgroundColor: '#ef4444', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' },
  saveBtn: { flex: 2, padding: '14px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' },
  cancelBtn: { flex: 1, padding: '14px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' },
  
  dropZone: { display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '10px' },
  fileSelectedBox: { display: 'flex', alignItems: 'center', gap: '15px', backgroundColor: '#d1fae5', padding: '10px 20px', borderRadius: '8px', border: '1px solid #10b981' },
  removeBtn: { background: 'none', border: 'none', color: '#047857', cursor: 'pointer', fontSize: '1.2rem', fontWeight: 'bold' },
  docxPlaceholder: { display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#666' },
  relevancyBadge: { padding: '5px 15px', backgroundColor: '#dcfce7', color: '#166534', borderRadius: '20px', fontWeight: 'bold' }
};

export default ResumeParser;