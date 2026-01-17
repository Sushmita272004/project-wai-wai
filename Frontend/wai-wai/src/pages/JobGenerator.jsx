import React, { useState } from "react";
import { jsPDF } from "jspdf";

const JobGenerator = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [generatedJob, setGeneratedJob] = useState("");

  const [formData, setFormData] = useState({
    jobTitle: "",
    industry: "Technology",
    experienceLevel: "Mid-Level",
    skills: "",
    culture: "Corporate",
    specialRequirements: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleJobEdit = (e) => {
    setGeneratedJob(e.target.value);
  };

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  // --- API CALL TO FLASK ---
  const handleGenerate = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://127.0.0.1:5000/api/generate-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.success) {
        setGeneratedJob(data.description);
        setStep(4); // Move to Result Step
      } else {
        alert("Error generating job: " + data.error);
      }
    } catch (error) {
      console.error("Connection error:", error);
      alert("Failed to connect to backend. Is Flask running?");
    }
    setLoading(false);
  };

  // --- ACTIONS ---
  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedJob);
    alert("Copied to clipboard!");
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    const pageHeight = doc.internal.pageSize.getHeight();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 10;
    const maxWidth = pageWidth - 2 * margin;
    const lineHeight = 7;
    let yPosition = margin;

    const splitText = doc.splitTextToSize(generatedJob, maxWidth);

    splitText.forEach((line) => {
      if (yPosition + lineHeight > pageHeight - margin) {
        doc.addPage();
        yPosition = margin;
      }
      doc.text(line, margin, yPosition);
      yPosition += lineHeight;
    });

    doc.save(`${formData.jobTitle}_Description.pdf`);
  };

  const saveDraft = () => {
    localStorage.setItem("savedJobDraft", generatedJob);
    alert("Draft saved to browser storage!");
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>
        {step === 4
          ? "Your AI Job Description"
          : `Create Job Description - Step ${step} of 3`}
      </h2>

      {/* Progress Bar (Hidden on Result step) */}
      {step < 4 && (
        <div style={styles.progressBarContainer}>
          <div
            style={{ ...styles.progressBarFill, width: `${(step / 3) * 100}%` }}
          ></div>
        </div>
      )}

      <div style={styles.card}>
        {/* STEP 1: BASIC INFO */}
        {step === 1 && (
          <div style={styles.formGroup}>
            <h3>Basic Information</h3>
            <label style={styles.label}>Job Title *</label>
            <input
              type="text"
              name="jobTitle"
              value={formData.jobTitle}
              onChange={handleChange}
              placeholder="e.g. Senior Backend Engineer"
              style={styles.input}
            />

            <label style={styles.label}>Industry/Domain</label>
            <select
              name="industry"
              value={formData.industry}
              onChange={handleChange}
              style={styles.input}
            >
              <option value="Technology">Technology</option>
              <option value="Healthcare">Healthcare</option>
              <option value="Finance">Finance</option>
              <option value="Education">Education</option>
              <option value="Retail">Retail</option>
              <option value="Manufacturing">Manufacturing</option>
              <option value="Marketing">Marketing & Advertising</option>
              <option value="Real Estate">Real Estate</option>
              <option value="E-commerce">E-commerce</option>
              <option value="Consulting">Consulting</option>
              <option value="Hospitality">Hospitality & Tourism</option>
              <option value="Media">Media & Entertainment</option>
              <option value="Legal">Legal</option>
              <option value="Non-Profit">Non-Profit</option>
              <option value="Government">Government</option>
              <option value="Energy">Energy & Utilities</option>
              <option value="Transportation">Transportation & Logistics</option>
              <option value="Telecommunications">Telecommunications</option>
              <option value="Agriculture">Agriculture</option>
              <option value="Construction">Construction</option>
            </select>

            <label style={styles.label}>Experience Level</label>
            <select
              name="experienceLevel"
              value={formData.experienceLevel}
              onChange={handleChange}
              style={styles.input}
            >
              <option value="Entry-Level">Entry-Level (0-2 years)</option>
              <option value="Mid-Level">Mid-Level (3-5 years)</option>
              <option value="Senior">Senior (5+ years)</option>
            </select>
          </div>
        )}

        {/* STEP 2: SKILLS */}
        {step === 2 && (
          <div style={styles.formGroup}>
            <h3>Skills & Requirements</h3>
            <label style={styles.label}>Key Skills (Comma separated) *</label>
            <input
              type="text"
              name="skills"
              value={formData.skills}
              onChange={handleChange}
              placeholder="e.g. Python, React, AWS"
              style={styles.input}
            />

            <label style={styles.label}>Special Requirements (Optional)</label>
            <textarea
              name="specialRequirements"
              value={formData.specialRequirements}
              onChange={handleChange}
              placeholder="e.g. Willing to travel..."
              style={{ ...styles.input, height: "80px" }}
            />
          </div>
        )}

        {/* STEP 3: CULTURE */}
        {step === 3 && (
          <div style={styles.formGroup}>
            <h3>Company Culture</h3>
            <label style={styles.label}>Culture Type</label>
            <select
              name="culture"
              value={formData.culture}
              onChange={handleChange}
              style={styles.input}
            >
              <option value="Startup">Startup (Fast-paced)</option>
              <option value="Corporate">Corporate (Structured)</option>
              <option value="Remote-first">Remote-first</option>
            </select>
            <div style={styles.summary}>
              <h4>Ready to Generate?</h4>
              <p>
                We will create a structured description for a{" "}
                <strong>
                  {formData.experienceLevel} {formData.jobTitle}
                </strong>
                .
              </p>
            </div>
          </div>
        )}

        {/* STEP 4: RESULT */}
        {step === 4 && (
          <div style={styles.resultContainer}>
            <textarea
              value={generatedJob}
              onChange={handleJobEdit}
              style={styles.textArea}
            />
            <div style={styles.actionButtons}>
              <button onClick={copyToClipboard} style={styles.secondaryBtn}>
                📋 Copy
              </button>
              <button onClick={downloadPDF} style={styles.secondaryBtn}>
                ⬇ PDF
              </button>
              <button onClick={saveDraft} style={styles.secondaryBtn}>
                💾 Save Draft
              </button>
              <button onClick={() => setStep(1)} style={styles.textBtn}>
                Start Over
              </button>
            </div>
          </div>
        )}

        {/* NAVIGATION BUTTONS */}
        {step < 4 && (
          <div style={styles.buttonGroup}>
            {step > 1 && (
              <button onClick={prevStep} style={styles.secondaryBtn}>
                Back
              </button>
            )}

            {step < 3 ? (
              <button
                onClick={nextStep}
                style={styles.primaryBtn}
                disabled={!formData.jobTitle}
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleGenerate}
                style={styles.generateBtn}
                disabled={loading}
              >
                {loading ? "Generating..." : "Generate with AI ✨"}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: { maxWidth: "800px", margin: "2rem auto", padding: "0 1rem" },
  header: { textAlign: "center", marginBottom: "2rem", color: "#333" },
  card: {
    backgroundColor: "white",
    padding: "2rem",
    borderRadius: "8px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
    textAlign: "left",
  },
  label: { fontWeight: "bold", fontSize: "0.9rem", color: "#444" },
  input: {
    padding: "0.8rem",
    borderRadius: "4px",
    border: "1px solid #ddd",
    fontSize: "1rem",
  },
  textArea: {
    width: "100%",
    height: "400px",
    padding: "1rem",
    borderRadius: "4px",
    border: "1px solid #ccc",
    fontFamily: "monospace",
    lineHeight: "1.5",
    resize: "vertical",
  },
  buttonGroup: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "2rem",
  },
  actionButtons: {
    display: "flex",
    gap: "10px",
    marginTop: "1rem",
    flexWrap: "wrap",
  },
  primaryBtn: {
    padding: "0.8rem 1.5rem",
    backgroundColor: "#646cff",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    marginLeft: "auto",
  },
  secondaryBtn: {
    padding: "0.8rem 1.2rem",
    backgroundColor: "#f3f4f6",
    color: "#333",
    border: "1px solid #ddd",
    borderRadius: "4px",
    cursor: "pointer",
    fontWeight: "500",
  },
  generateBtn: {
    padding: "0.8rem 1.5rem",
    backgroundColor: "#10b981",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontWeight: "bold",
    marginLeft: "auto",
  },
  textBtn: {
    padding: "0.8rem",
    backgroundColor: "transparent",
    color: "#666",
    border: "none",
    cursor: "pointer",
    textDecoration: "underline",
  },
  progressBarContainer: {
    height: "6px",
    backgroundColor: "#eee",
    borderRadius: "4px",
    marginBottom: "2rem",
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#646cff",
    transition: "width 0.3s ease",
  },
  summary: {
    marginTop: "1rem",
    padding: "1rem",
    backgroundColor: "#eef2ff",
    borderRadius: "4px",
    color: "#333",
  },
};

export default JobGenerator;
