import React, { useState } from "react";
import { jsPDF } from "jspdf";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiChevronRight,
  FiChevronLeft,
  FiCheck,
  FiCopy,
  FiDownload,
  FiSave,
  FiRefreshCw,
  FiAlertCircle,
  FiCheckCircle,
  FiZap,
} from "react-icons/fi";

const JobGenerator = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [generatedJob, setGeneratedJob] = useState("");
  const [copied, setCopied] = useState(false);

  const [formData, setFormData] = useState({
    jobTitle: "",
    industry: "Technology",
    experienceLevel: "Mid-Level",
    skills: "",
    culture: "Corporate",
    specialRequirements: "",
  });

  const industries = [
    "Technology",
    "Healthcare",
    "Finance",
    "Education",
    "Retail",
    "Manufacturing",
    "Marketing & Advertising",
    "Real Estate",
    "E-commerce",
    "Consulting",
    "Hospitality & Tourism",
    "Media & Entertainment",
    "Legal",
    "Non-Profit",
    "Government",
    "Energy & Utilities",
    "Transportation & Logistics",
    "Telecommunications",
    "Agriculture",
    "Construction",
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleJobEdit = (e) => {
    setGeneratedJob(e.target.value);
  };

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

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
        setStep(4);
      } else {
        alert("Error generating job: " + data.error);
      }
    } catch (error) {
      console.error("Connection error:", error);
      alert("Failed to connect to backend. Is Flask running?");
    }
    setLoading(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedJob);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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

  const stepVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 },
  };

  return (
    <div style={styles.container}>
      <div style={styles.wrapper}>
        {/* Header */}
        <motion.div
          style={styles.header}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div style={styles.headerContent}>
            <div style={styles.iconWrapper}>
              <FiZap style={styles.headerIcon} />
            </div>
            <div>
              <h1 style={styles.title}>
                {step === 4
                  ? "Your AI-Generated Job Description"
                  : "AI Job Description Generator"}
              </h1>
              <p style={styles.subtitle}>
                {step === 4
                  ? "Review and customize your job description"
                  : `Step ${step} of 3 - ${["Basic Information", "Skills & Requirements", "Company Culture"][step - 1]}`}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Progress Bar */}
        {step < 4 && (
          <motion.div
            style={styles.progressSection}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div style={styles.progressBar}>
              {[1, 2, 3].map((num) => (
                <React.Fragment key={num}>
                  <motion.div
                    style={{
                      ...styles.progressDot,
                      ...(step >= num ? styles.progressDotActive : {}),
                    }}
                    initial={{ scale: 0.8 }}
                    animate={{ scale: step >= num ? 1 : 0.8 }}
                  >
                    {step > num ? <FiCheck /> : num}
                  </motion.div>
                  {num < 3 && (
                    <div style={styles.progressLineWrapper}>
                      <div style={styles.progressLine}>
                        <motion.div
                          style={styles.progressLineFill}
                          initial={{ width: "0%" }}
                          animate={{ width: step > num ? "100%" : "0%" }}
                          transition={{ duration: 0.5 }}
                        />
                      </div>
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </motion.div>
        )}

        {/* Form Card */}
        <motion.div
          style={styles.card}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <AnimatePresence mode="wait">
            {/* Step 1: Basic Info */}
            {step === 1 && (
              <motion.div
                key="step1"
                variants={stepVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.3 }}
                style={styles.formContent}
              >
                <h3 style={styles.stepTitle}>Let's start with the basics</h3>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>
                    Job Title <span style={styles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    name="jobTitle"
                    value={formData.jobTitle}
                    onChange={handleChange}
                    placeholder="e.g., Senior Backend Engineer"
                    style={styles.input}
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Industry / Domain</label>
                  <select
                    name="industry"
                    value={formData.industry}
                    onChange={handleChange}
                    style={styles.select}
                  >
                    {industries.map((industry) => (
                      <option key={industry} value={industry}>
                        {industry}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Experience Level</label>
                  <div style={styles.radioGroup}>
                    {["Entry-Level", "Mid-Level", "Senior"].map((level) => (
                      <motion.label
                        key={level}
                        style={{
                          ...styles.radioLabel,
                          ...(formData.experienceLevel === level
                            ? styles.radioLabelActive
                            : {}),
                        }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <input
                          type="radio"
                          name="experienceLevel"
                          value={level}
                          checked={formData.experienceLevel === level}
                          onChange={handleChange}
                          style={styles.radioInput}
                        />
                        {level}
                      </motion.label>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Skills */}
            {step === 2 && (
              <motion.div
                key="step2"
                variants={stepVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.3 }}
                style={styles.formContent}
              >
                <h3 style={styles.stepTitle}>
                  What skills are you looking for?
                </h3>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>
                    Key Skills <span style={styles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    name="skills"
                    value={formData.skills}
                    onChange={handleChange}
                    placeholder="e.g., Python, React, AWS, Machine Learning"
                    style={styles.input}
                  />
                  <p style={styles.hint}>Separate skills with commas</p>
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>
                    Special Requirements (Optional)
                  </label>
                  <textarea
                    name="specialRequirements"
                    value={formData.specialRequirements}
                    onChange={handleChange}
                    placeholder="e.g., Willing to travel, Remote work available, Security clearance required"
                    style={styles.textarea}
                    rows="4"
                  />
                </div>
              </motion.div>
            )}

            {/* Step 3: Culture */}
            {step === 3 && (
              <motion.div
                key="step3"
                variants={stepVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.3 }}
                style={styles.formContent}
              >
                <h3 style={styles.stepTitle}>
                  Tell us about your company culture
                </h3>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Culture Type</label>
                  <div style={styles.radioGroup}>
                    {["Startup", "Corporate", "Remote-first"].map((culture) => (
                      <motion.label
                        key={culture}
                        style={{
                          ...styles.radioLabel,
                          ...(formData.culture === culture
                            ? styles.radioLabelActive
                            : {}),
                        }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <input
                          type="radio"
                          name="culture"
                          value={culture}
                          checked={formData.culture === culture}
                          onChange={handleChange}
                          style={styles.radioInput}
                        />
                        {culture === "Startup" && "🚀 "}
                        {culture === "Corporate" && "🏢 "}
                        {culture === "Remote-first" && "🌍 "}
                        {culture}
                      </motion.label>
                    ))}
                  </div>
                </div>

                <motion.div
                  style={styles.summaryBox}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <FiCheckCircle style={styles.summaryIcon} />
                  <div>
                    <h4 style={styles.summaryTitle}>Ready to Generate!</h4>
                    <p style={styles.summaryText}>
                      We'll create a {formData.culture.toLowerCase()} job
                      description for a{" "}
                      <strong>
                        {formData.experienceLevel} {formData.jobTitle}
                      </strong>{" "}
                      in the {formData.industry} industry.
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            )}

            {/* Step 4: Result */}
            {step === 4 && (
              <motion.div
                key="step4"
                variants={stepVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.3 }}
                style={styles.formContent}
              >
                <div style={styles.resultHeader}>
                  <div style={styles.resultInfo}>
                    <FiCheckCircle style={styles.successIcon} />
                    <span style={styles.resultText}>
                      Generated Successfully!
                    </span>
                  </div>
                  <div style={styles.actionButtons}>
                    <motion.button
                      onClick={copyToClipboard}
                      style={
                        copied ? styles.actionBtnSuccess : styles.actionBtn
                      }
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {copied ? (
                        <>
                          <FiCheck /> Copied!
                        </>
                      ) : (
                        <>
                          <FiCopy /> Copy
                        </>
                      )}
                    </motion.button>
                    <motion.button
                      onClick={downloadPDF}
                      style={styles.actionBtn}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <FiDownload /> PDF
                    </motion.button>
                    <motion.button
                      onClick={saveDraft}
                      style={styles.actionBtn}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <FiSave /> Save
                    </motion.button>
                  </div>
                </div>

                <textarea
                  value={generatedJob}
                  onChange={handleJobEdit}
                  style={styles.resultTextarea}
                />

                <motion.button
                  onClick={() => setStep(1)}
                  style={styles.startOverBtn}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <FiRefreshCw /> Create Another Job Description
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Buttons */}
          {step < 4 && (
            <motion.div
              style={styles.navigation}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {step > 1 && (
                <motion.button
                  onClick={prevStep}
                  style={styles.backBtn}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <FiChevronLeft /> Back
                </motion.button>
              )}

              {step < 3 ? (
                <motion.button
                  onClick={nextStep}
                  style={{
                    ...styles.nextBtn,
                    ...(step === 1 && !formData.jobTitle
                      ? styles.btnDisabled
                      : {}),
                  }}
                  disabled={step === 1 && !formData.jobTitle}
                  whileHover={formData.jobTitle ? { scale: 1.02 } : {}}
                  whileTap={formData.jobTitle ? { scale: 0.98 } : {}}
                >
                  Next <FiChevronRight />
                </motion.button>
              ) : (
                <motion.button
                  onClick={handleGenerate}
                  style={{
                    ...styles.generateBtn,
                    ...(loading ? styles.btnDisabled : {}),
                  }}
                  disabled={loading}
                  whileHover={
                    !loading
                      ? {
                          scale: 1.02,
                          boxShadow: "0 12px 30px rgba(16, 185, 129, 0.4)",
                        }
                      : {}
                  }
                  whileTap={!loading ? { scale: 0.98 } : {}}
                >
                  {loading ? (
                    <>
                      <motion.div
                        style={styles.spinner}
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                      />
                      Generating...
                    </>
                  ) : (
                    <>
                      <FiZap /> Generate with AI
                    </>
                  )}
                </motion.button>
              )}
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: "100vh",
    padding: "2rem 1rem",
    background: "linear-gradient(135deg, #F9FAFB 0%, #EEF2FF 100%)",
  },
  wrapper: {
    maxWidth: "900px",
    margin: "0 auto",
  },
  header: {
    marginBottom: "2rem",
  },
  headerContent: {
    display: "flex",
    alignItems: "center",
    gap: "1.5rem",
  },
  iconWrapper: {
    width: "60px",
    height: "60px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)",
    borderRadius: "1rem",
    boxShadow: "0 8px 20px rgba(79, 70, 229, 0.3)",
  },
  headerIcon: {
    fontSize: "2rem",
    color: "white",
  },
  title: {
    fontSize: "clamp(1.5rem, 3vw, 2.25rem)",
    fontWeight: "800",
    marginBottom: "0.5rem",
    color: "#111827",
  },
  subtitle: {
    fontSize: "1rem",
    color: "#6B7280",
    fontWeight: "500",
  },
  progressSection: {
    marginBottom: "2rem",
  },
  progressBar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0",
  },
  progressDot: {
    width: "48px",
    height: "48px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.125rem",
    fontWeight: "700",
    backgroundColor: "white",
    color: "#9CA3AF",
    border: "3px solid #E5E7EB",
    zIndex: 2,
    transition: "all 0.3s ease",
  },
  progressDotActive: {
    background: "linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)",
    color: "white",
    border: "3px solid #4F46E5",
    boxShadow: "0 4px 12px rgba(79, 70, 229, 0.3)",
  },
  progressLineWrapper: {
    flex: 1,
    padding: "0 0.5rem",
  },
  progressLine: {
    height: "4px",
    backgroundColor: "#E5E7EB",
    borderRadius: "2px",
    overflow: "hidden",
  },
  progressLineFill: {
    height: "100%",
    background: "linear-gradient(90deg, #4F46E5 0%, #7C3AED 100%)",
  },
  card: {
    backgroundColor: "white",
    borderRadius: "1.5rem",
    padding: "3rem",
    boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
  },
  formContent: {
    minHeight: "350px",
  },
  stepTitle: {
    fontSize: "1.5rem",
    fontWeight: "700",
    marginBottom: "2rem",
    color: "#111827",
  },
  inputGroup: {
    marginBottom: "1.75rem",
  },
  label: {
    display: "block",
    fontSize: "0.95rem",
    fontWeight: "600",
    color: "#374151",
    marginBottom: "0.5rem",
  },
  required: {
    color: "#EF4444",
  },
  input: {
    width: "100%",
    padding: "0.875rem 1.125rem",
    fontSize: "1rem",
    border: "2px solid #E5E7EB",
    borderRadius: "0.75rem",
    transition: "all 0.2s ease",
    backgroundColor: "white",
  },
  select: {
    width: "100%",
    padding: "0.875rem 1.125rem",
    fontSize: "1rem",
    border: "2px solid #E5E7EB",
    borderRadius: "0.75rem",
    transition: "all 0.2s ease",
    backgroundColor: "white",
    cursor: "pointer",
  },
  textarea: {
    width: "100%",
    padding: "0.875rem 1.125rem",
    fontSize: "1rem",
    border: "2px solid #E5E7EB",
    borderRadius: "0.75rem",
    transition: "all 0.2s ease",
    backgroundColor: "white",
    resize: "vertical",
    fontFamily: "inherit",
  },
  hint: {
    fontSize: "0.875rem",
    color: "#9CA3AF",
    marginTop: "0.5rem",
  },
  radioGroup: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
    gap: "0.75rem",
  },
  radioLabel: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0.875rem 1rem",
    border: "2px solid #E5E7EB",
    borderRadius: "0.75rem",
    cursor: "pointer",
    fontSize: "0.95rem",
    fontWeight: "600",
    color: "#6B7280",
    transition: "all 0.2s ease",
    backgroundColor: "white",
  },
  radioLabelActive: {
    border: "2px solid #4F46E5",
    backgroundColor: "#EEF2FF",
    color: "#4F46E5",
  },
  radioInput: {
    display: "none",
  },
  summaryBox: {
    display: "flex",
    gap: "1rem",
    padding: "1.5rem",
    backgroundColor: "#ECFDF5",
    border: "2px solid #10B981",
    borderRadius: "1rem",
    marginTop: "2rem",
  },
  summaryIcon: {
    fontSize: "1.75rem",
    color: "#10B981",
    flexShrink: 0,
  },
  summaryTitle: {
    fontSize: "1.125rem",
    fontWeight: "700",
    color: "#065F46",
    marginBottom: "0.5rem",
  },
  summaryText: {
    fontSize: "0.95rem",
    color: "#047857",
    lineHeight: "1.6",
  },
  resultHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1.5rem",
    flexWrap: "wrap",
    gap: "1rem",
  },
  resultInfo: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
  },
  successIcon: {
    fontSize: "1.5rem",
    color: "#10B981",
  },
  resultText: {
    fontSize: "1.125rem",
    fontWeight: "600",
    color: "#065F46",
  },
  actionButtons: {
    display: "flex",
    gap: "0.5rem",
    flexWrap: "wrap",
  },
  actionBtn: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    padding: "0.625rem 1rem",
    fontSize: "0.875rem",
    fontWeight: "600",
    color: "#4F46E5",
    backgroundColor: "#EEF2FF",
    border: "none",
    borderRadius: "0.5rem",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  actionBtnSuccess: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    padding: "0.625rem 1rem",
    fontSize: "0.875rem",
    fontWeight: "600",
    color: "white",
    backgroundColor: "#10B981",
    border: "none",
    borderRadius: "0.5rem",
    cursor: "pointer",
  },
  resultTextarea: {
    width: "100%",
    minHeight: "400px",
    padding: "1.25rem",
    fontSize: "0.95rem",
    border: "2px solid #E5E7EB",
    borderRadius: "0.75rem",
    fontFamily: "monospace",
    lineHeight: "1.7",
    resize: "vertical",
    marginBottom: "1.5rem",
  },
  startOverBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.75rem",
    width: "100%",
    padding: "1rem",
    fontSize: "1rem",
    fontWeight: "600",
    color: "#6B7280",
    backgroundColor: "#F3F4F6",
    border: "2px solid #E5E7EB",
    borderRadius: "0.75rem",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  navigation: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "2.5rem",
    gap: "1rem",
  },
  backBtn: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    padding: "0.875rem 1.5rem",
    fontSize: "1rem",
    fontWeight: "600",
    color: "#6B7280",
    backgroundColor: "#F3F4F6",
    border: "none",
    borderRadius: "0.75rem",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  nextBtn: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    padding: "0.875rem 1.5rem",
    fontSize: "1rem",
    fontWeight: "600",
    color: "white",
    background: "linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)",
    border: "none",
    borderRadius: "0.75rem",
    cursor: "pointer",
    marginLeft: "auto",
    boxShadow: "0 4px 12px rgba(79, 70, 229, 0.3)",
  },
  generateBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.75rem",
    padding: "0.875rem 1.5rem",
    fontSize: "1rem",
    fontWeight: "600",
    color: "white",
    background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
    border: "none",
    borderRadius: "0.75rem",
    cursor: "pointer",
    marginLeft: "auto",
    boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)",
  },
  btnDisabled: {
    opacity: 0.6,
    cursor: "not-allowed",
  },
  spinner: {
    width: "20px",
    height: "20px",
    border: "3px solid rgba(255,255,255,0.3)",
    borderTop: "3px solid white",
    borderRadius: "50%",
  },
};

export default JobGenerator;
