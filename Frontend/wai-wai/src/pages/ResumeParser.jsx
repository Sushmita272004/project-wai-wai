// frontend/wai-wai/src/pages/ResumeParser.jsx
import React, { useState } from "react";
import "../styles/ResumeParser.css";

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
    if (!file) {
      alert("Please upload a resume first.");
      return;
    }

    setLoading(true);
    setStatusText("Uploading & Extracting Text...");
    setUploadProgress(0);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("job_description", jobDescription);

    const xhr = new XMLHttpRequest();
    const API_BASE =
      import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5000";
    xhr.open("POST", `${API_BASE}/api/parse-resume`);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        setUploadProgress(percent); // Used here
        if (percent === 100)
          setStatusText("Processing with AI... (This may take a moment)");
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

    xhr.onerror = () => {
      setLoading(false);
      setStatusText("Network Error.");
      alert("Network Error");
    };
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
        experience_years: parsedData.experience
          ? parsedData.experience.length
          : 1,
      };

      const API_BASE =
        import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5000";
      const res = await fetch(`${API_BASE}/api/analyze-gap`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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
        candidate_name: parsedData.name || "Candidate",
      };
      const API_BASE =
        import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5000";
      const res = await fetch(`${API_BASE}/api/download-roadmap`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Server error");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const safeName = (parsedData.name || "Candidate").replace(
        /[^a-z0-9]/gi,
        "_",
      );
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
      const payload = {
        ...parsedData,
        relevancy_score: relevancy,
        confidence_scores: confidence,
        job_description: jobDescription,
      };
      const API_BASE =
        import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5000";
      const res = await fetch(`${API_BASE}/api/save-profile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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
  const handleChange = (key, value) =>
    setParsedData((prev) => ({ ...prev, [key]: value }));
  const handleArrayChange = (key, value) => handleChange(key, value.split(","));

  const Field = ({ label, fieldKey, isArray = false }) => {
    const score = confidence?.[fieldKey] || 0;
    const isLowConfidence = score < 70;
    const val = parsedData?.[fieldKey];
    const displayVal = isArray && Array.isArray(val) ? val.join(", ") : val;

    return (
      <div style={{ marginBottom: "20px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "8px",
          }}
        >
          <label style={styles.label}>{label}</label>
          <span
            style={{
              fontSize: "0.8rem",
              fontWeight: "bold",
              color: isLowConfidence ? "#d97706" : "#059669",
            }}
          >
            Confidence: {score}%
          </span>
        </div>
        {isArray ? (
          <textarea
            value={displayVal || ""}
            onChange={(e) => handleArrayChange(fieldKey, e.target.value)}
            style={{ ...styles.input, minHeight: "100px" }}
          />
        ) : (
          <input
            type="text"
            value={displayVal || ""}
            onChange={(e) => handleChange(fieldKey, e.target.value)}
            style={{ ...styles.input }}
          />
        )}
      </div>
    );
  };

  return (
    <div className="rp-container">
      <h2 className="rp-title">Smart Resume Parsing System</h2>

      {/* STEP 1: UPLOAD */}
      {!parsedData && (
        <div className="rp-upload-card">
          <div className="rp-upload-jd">
            <label className="rp-label-muted">
              Target Job Description (Optional)
            </label>
            <textarea
              placeholder="Paste JD here for Gap Analysis..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="rp-input rp-textarea"
            />
          </div>
          <div className="rp-drop-zone">
            <p className="rp-drop-zone-text">Upload Resume (PDF/DOCX)</p>
            {!file ? (
              <div className="rp-upload-input-wrapper">
                <button
                  className="rp-upload-btn"
                  aria-label="Choose resume file"
                >
                  Choose File
                </button>
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.docx"
                  className="rp-hidden-input"
                  aria-label="Upload resume"
                />
              </div>
            ) : (
              <div className="rp-file-selected-box">
                <span>📄 {file.name}</span>
                <button
                  onClick={() => setFile(null)}
                  className="rp-remove-btn"
                  aria-label="Remove file"
                >
                  ✕
                </button>
              </div>
            )}
          </div>
          {loading && (
            <div className="rp-progress-container">
              <div className="rp-progress-bg">
                <div
                  className="rp-progress-fill"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="rp-progress-text">
                {statusText} {uploadProgress}%
              </p>
            </div>
          )}
          {file && !loading && (
            <button onClick={handleParse} className="rp-parse-btn">
              🚀 Parse Resume
            </button>
          )}
        </div>
      )}

      {/* STEP 2: RESULTS */}
      {parsedData && (
        <div className="rp-split-view">
          <div className="rp-form-panel">
            <div className="rp-header-row">
              <h3 className="rp-panel-header">Parsed Details</h3>
              <div className="rp-relevancy-badge">Job Match: {relevancy}%</div>
            </div>

            <Field label="Full Name" fieldKey="name" />
            <Field label="Email" fieldKey="email" />
            <Field label="Phone" fieldKey="phone" />
            <Field label="Skills" fieldKey="skills" isArray />
            <Field label="Experience" fieldKey="experience" isArray />

            {!gapData && !isAnalyzingGap && jobDescription.length > 10 && (
              <button onClick={handleGapAnalysis} className="rp-analyze-btn">
                🔮 Analyze Skill Gap & Career Coach
              </button>
            )}

            {isAnalyzingGap && (
              <p className="rp-analyzing-text">
                🤖 AI is analyzing your skills & generating roadmap...
              </p>
            )}

            {gapData && (
              <div className="rp-gap-section">
                <div className="rp-gap-header">
                  <h3 className="rp-section-title">📊 Career Coach Report</h3>
                  <button onClick={handleDownloadPDF} className="rp-pdf-btn">
                    ⬇ PDF Report
                  </button>
                </div>

                <div className="rp-readiness-card">
                  <div className="rp-readiness-score">
                    <div
                      className={
                        gapData.analysis.readiness_score > 70
                          ? "rp-readiness-value good"
                          : "rp-readiness-value warn"
                      }
                    >
                      {gapData.analysis.readiness_score}%
                    </div>
                    <div className="rp-readiness-label">Readiness</div>
                  </div>
                  <div className="rp-readiness-text">
                    <p>{gapData.analysis.readiness_reasoning}</p>
                  </div>
                </div>

                {gapData.visualization_data?.radar_chart && (
                  <div className="rp-stats-grid">
                    {Object.entries(gapData.visualization_data.radar_chart).map(
                      ([k, v]) => (
                        <div key={k} className="rp-stat-box">
                          <div className="rp-stat-key">
                            {k.replace(/_/g, " ")}
                          </div>
                          <div className="rp-stat-val">{v}%</div>
                        </div>
                      ),
                    )}
                  </div>
                )}

                <h4 className="rp-sub-header">🚀 Learning Roadmap</h4>
                {gapData.learning_roadmap.map((step, i) => (
                  <div key={i} className="rp-roadmap-step">
                    <div className="rp-step-badge">{step.phase}</div>
                    <div>
                      <div className="rp-roadmap-focus">
                        {step.focus}{" "}
                        <span className="rp-roadmap-duration">
                          ({step.duration})
                        </span>
                      </div>
                      <div className="rp-roadmap-reason">{step.reasoning}</div>
                    </div>
                  </div>
                ))}

                <h4 className="rp-sub-header">🔀 Alternative Career Paths</h4>
                {gapData.alternative_paths?.map((path, i) => (
                  <div key={i} className="rp-alt-path-card">
                    <div className="rp-alt-path-role">
                      {path.role}{" "}
                      <span className="rp-alt-path-match">
                        ({path.match_potential} Match)
                      </span>
                    </div>
                    <div className="rp-alt-path-text">{path.conclusion}</div>
                  </div>
                ))}

                <h4 className="rp-sub-header">💰 Salary Insights (INR)</h4>
                <div className="rp-salary-box">
                  <div>
                    <strong>Current Est:</strong>{" "}
                    {gapData.salary_growth?.current_estimated}
                  </div>
                  <div>
                    <strong>1 Year Potential:</strong>{" "}
                    {gapData.salary_growth?.potential_1_year}
                  </div>
                  <div className="rp-salary-insight">
                    {gapData.salary_growth?.insight}
                  </div>
                </div>
              </div>
            )}

            <div className="rp-actions">
              <button onClick={handleSave} className="rp-save-btn">
                ✅ Save Profile
              </button>
              <button
                onClick={() => setParsedData(null)}
                className="rp-cancel-btn"
              >
                Discard
              </button>
            </div>
          </div>

          <div className="rp-preview-panel">
            <h3 className="rp-panel-header">Original Document</h3>
            {file?.type === "application/pdf" ? (
              <iframe
                src={fileUrl}
                className="rp-iframe"
                title="Preview"
              ></iframe>
            ) : (
              <div className="rp-docx-placeholder">
                DOCX Preview Unavailable
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
export default ResumeParser;
