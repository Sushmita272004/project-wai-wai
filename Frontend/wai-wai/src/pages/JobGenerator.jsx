import React, { useState } from "react";
import { jsPDF } from "jspdf";
import { motion, AnimatePresence } from "framer-motion";
import "../styles/JobGenerator.css";
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
    <div className="job-generator-container">
      <div className="job-generator-wrapper">
        {/* Header */}
        <motion.div
          className="job-generator-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="job-generator-header-content">
            <div className="job-generator-icon-wrapper">
              <FiZap className="job-generator-header-icon" />
            </div>
            <div>
              <h1 className="job-generator-title">
                {step === 4
                  ? "Your AI-Generated Job Description"
                  : "AI Job Description Generator"}
              </h1>
              <p className="job-generator-subtitle">
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
            className="job-generator-progress-section"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="job-generator-progress-bar">
              {[1, 2, 3].map((num) => (
                <React.Fragment key={num}>
                  <motion.div
                    className={`job-generator-progress-dot ${
                      step >= num ? "job-generator-progress-dot-active" : ""
                    }`}
                    initial={{ scale: 0.8 }}
                    animate={{ scale: step >= num ? 1 : 0.8 }}
                  >
                    {step > num ? <FiCheck /> : num}
                  </motion.div>
                  {num < 3 && (
                    <div className="job-generator-progress-line-wrapper">
                      <div className="job-generator-progress-line">
                        <motion.div
                          className="job-generator-progress-line-fill"
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
          className="job-generator-card"
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
                className="job-generator-form-content"
              >
                <h3 className="job-generator-step-title">
                  Let's start with the basics
                </h3>

                <div className="job-generator-input-group">
                  <label className="job-generator-label">
                    Job Title <span className="job-generator-required">*</span>
                  </label>
                  <input
                    type="text"
                    name="jobTitle"
                    value={formData.jobTitle}
                    onChange={handleChange}
                    placeholder="e.g., Senior Backend Engineer"
                    className="job-generator-input"
                  />
                </div>

                <div className="job-generator-input-group">
                  <label className="job-generator-label">
                    Industry / Domain
                  </label>
                  <select
                    name="industry"
                    value={formData.industry}
                    onChange={handleChange}
                    className="job-generator-select"
                  >
                    {industries.map((industry) => (
                      <option key={industry} value={industry}>
                        {industry}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="job-generator-input-group">
                  <label className="job-generator-label">
                    Experience Level
                  </label>
                  <div className="job-generator-radio-group">
                    {["Entry-Level", "Mid-Level", "Senior"].map((level) => (
                      <motion.label
                        key={level}
                        className={`job-generator-radio-label ${
                          formData.experienceLevel === level
                            ? "job-generator-radio-label-active"
                            : ""
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <input
                          type="radio"
                          name="experienceLevel"
                          value={level}
                          checked={formData.experienceLevel === level}
                          onChange={handleChange}
                          className="job-generator-radio-input"
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
                className="job-generator-form-content"
              >
                <h3 className="job-generator-step-title">
                  What skills are you looking for?
                </h3>

                <div className="job-generator-input-group">
                  <label className="job-generator-label">
                    Key Skills <span className="job-generator-required">*</span>
                  </label>
                  <input
                    type="text"
                    name="skills"
                    value={formData.skills}
                    onChange={handleChange}
                    placeholder="e.g., Python, React, AWS, Machine Learning"
                    className="job-generator-input"
                  />
                  <p className="job-generator-hint">
                    Separate skills with commas
                  </p>
                </div>

                <div className="job-generator-input-group">
                  <label className="job-generator-label">
                    Special Requirements (Optional)
                  </label>
                  <textarea
                    name="specialRequirements"
                    value={formData.specialRequirements}
                    onChange={handleChange}
                    placeholder="e.g., Willing to travel, Remote work available, Security clearance required"
                    className="job-generator-textarea"
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
                className="job-generator-form-content"
              >
                <h3 className="job-generator-step-title">
                  Tell us about your company culture
                </h3>

                <div className="job-generator-input-group">
                  <label className="job-generator-label">Culture Type</label>
                  <div className="job-generator-radio-group">
                    {["Startup", "Corporate", "Remote-first"].map((culture) => (
                      <motion.label
                        key={culture}
                        className={`job-generator-radio-label ${
                          formData.culture === culture
                            ? "job-generator-radio-label-active"
                            : ""
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <input
                          type="radio"
                          name="culture"
                          value={culture}
                          checked={formData.culture === culture}
                          onChange={handleChange}
                          className="job-generator-radio-input"
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
                  className="job-generator-summary-box"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <FiCheckCircle className="job-generator-summary-icon" />
                  <div>
                    <h4 className="job-generator-summary-title">
                      Ready to Generate!
                    </h4>
                    <p className="job-generator-summary-text">
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
                className="job-generator-form-content"
              >
                <div className="job-generator-result-header">
                  <div className="job-generator-result-info">
                    <FiCheckCircle className="job-generator-success-icon" />
                    <span className="job-generator-result-text">
                      Generated Successfully!
                    </span>
                  </div>
                  <div className="job-generator-action-buttons">
                    <motion.button
                      onClick={copyToClipboard}
                      className={`job-generator-action-btn ${
                        copied ? "job-generator-action-btn-success" : ""
                      }`}
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
                      className="job-generator-action-btn"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <FiDownload /> PDF
                    </motion.button>
                    <motion.button
                      onClick={saveDraft}
                      className="job-generator-action-btn"
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
                  className="job-generator-result-textarea"
                />

                <motion.button
                  onClick={() => setStep(1)}
                  className="job-generator-start-over-btn"
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
              className="job-generator-navigation"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {step > 1 && (
                <motion.button
                  onClick={prevStep}
                  className="job-generator-back-btn"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <FiChevronLeft /> Back
                </motion.button>
              )}

              {step < 3 ? (
                <motion.button
                  onClick={nextStep}
                  className={`job-generator-next-btn ${
                    step === 1 && !formData.jobTitle
                      ? "job-generator-btn-disabled"
                      : ""
                  }`}
                  disabled={step === 1 && !formData.jobTitle}
                  whileHover={formData.jobTitle ? { scale: 1.02 } : {}}
                  whileTap={formData.jobTitle ? { scale: 0.98 } : {}}
                >
                  Next <FiChevronRight />
                </motion.button>
              ) : (
                <motion.button
                  onClick={handleGenerate}
                  className={`job-generator-generate-btn ${
                    loading ? "job-generator-btn-disabled" : ""
                  }`}
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
                        className="job-generator-spinner"
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

export default JobGenerator;
