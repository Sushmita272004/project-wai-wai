// frontend/wai-wai/src/pages/JobDashboard.jsx
import React, { useState, useMemo, useRef } from "react";
import FilterPanel from "../components/FilterPanel";
import JobCard from "../components/JobCard";
import mockJobs from "../data/mockJobs.json";
import {
  FiSearch,
  FiFilter,
  FiGrid,
  FiList,
  FiUploadCloud,
  FiX,
} from "react-icons/fi";
import "../styles/JobDashboard.css";

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
    datePosted: "any",
  });

  // --- 1. HANDLE RESUME UPLOAD ---
  const handleResumeUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    // We don't need a specific JD for general matching, sending empty
    formData.append("job_description", "");

    try {
      const res = await fetch("http://127.0.0.1:5000/api/parse-resume", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (res.ok) {
        setResumeData(data.extracted_data);
        alert(
          `✅ Resume Parsed! Jobs are now ranked for ${data.extracted_data.name}.`,
        );
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

    return mockJobs.map((job) => {
      let score = 0;

      // A. Skill Overlap (Weight: 60%)
      const jobSkills = job.skills.map((s) => s.toLowerCase());
      const userSkills = (resumeData.skills || []).map((s) => s.toLowerCase());

      const matchingSkills = jobSkills.filter((skill) =>
        userSkills.some(
          (userSkill) => userSkill.includes(skill) || skill.includes(userSkill),
        ),
      );

      const skillMatchRatio =
        jobSkills.length > 0 ? matchingSkills.length / jobSkills.length : 0;
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
    return jobsWithScores
      .filter((job) => {
        const matchesSearch =
          job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.company.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesLocation =
          filters.locations.length === 0 ||
          filters.locations.includes(job.location);
        const matchesType =
          filters.jobTypes.length === 0 || filters.jobTypes.includes(job.type);
        const matchesExp = job.experience <= filters.experience;
        const matchesSalary = job.salaryMax >= filters.salaryRange.min;
        const matchesSkills =
          filters.skills.length === 0 ||
          job.skills.some((s) => filters.skills.includes(s));
        return (
          matchesSearch &&
          matchesLocation &&
          matchesType &&
          matchesExp &&
          matchesSalary &&
          matchesSkills
        );
      })
      .sort((a, b) => {
        if (sortBy === "matchScore") return b.matchScore - a.matchScore;
        if (sortBy === "salary") return b.salary - a.salary;
        if (sortBy === "date")
          return new Date(b.postedDate) - new Date(a.postedDate);
        return 0;
      });
  }, [searchTerm, filters, sortBy, jobsWithScores]);

  return (
    <div className="job-dashboard-container">
      {/* MOBILE OVERLAY */}
      {isFilterOpen && (
        <div
          className="job-dashboard-overlay"
          onClick={() => setIsFilterOpen(false)}
        />
      )}

      <div className="job-dashboard-layout">
        {/* SIDEBAR */}
        <FilterPanel
          filters={filters}
          setFilters={setFilters}
          isOpen={isFilterOpen}
          onClose={() => setIsFilterOpen(false)}
        />

        {/* MAIN CONTENT */}
        <main className="job-dashboard-main">
          {/* SEARCH & CONTROLS */}
          <div className="job-dashboard-top-bar">
            <div className="job-search-wrapper">
              <FiSearch className="job-search-icon" />
              <input
                type="text"
                placeholder="Search by role, company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="job-search-input"
              />
            </div>

            <div className="job-controls-row">
              {/* RESUME UPLOAD BUTTON */}
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: "none" }}
                accept=".pdf,.docx"
                onChange={handleResumeUpload}
              />

              {!resumeData ? (
                <button
                  onClick={() => fileInputRef.current.click()}
                  disabled={isUploading}
                  className="job-upload-btn"
                >
                  <FiUploadCloud style={{ fontSize: "1.1rem" }} />
                  {isUploading ? "Analyzing..." : "Smart Match with Resume"}
                </button>
              ) : (
                <div className="job-active-resume-badge">
                  <span>
                    Matches for:{" "}
                    <strong>{resumeData.name?.split(" ")[0]}</strong>
                  </span>
                  <button
                    onClick={clearResumeMatch}
                    className="job-clear-resume-btn"
                    title="Remove Resume"
                  >
                    <FiX />
                  </button>
                </div>
              )}

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="job-sort-select"
              >
                <option value="matchScore">Smart Match</option>
                <option value="salary">Highest Salary</option>
                <option value="date">Newest First</option>
              </select>

              <div className="job-view-toggle">
                <button
                  onClick={() => setViewMode("grid")}
                  className={
                    viewMode === "grid" ? "job-icon-btn-active" : "job-icon-btn"
                  }
                >
                  <FiGrid />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={
                    viewMode === "list" ? "job-icon-btn-active" : "job-icon-btn"
                  }
                >
                  <FiList />
                </button>
              </div>
            </div>
          </div>

          <div className="job-results-header">
            <p className="job-results-text">
              Found{" "}
              <span className="job-results-count">{filteredJobs.length}</span>{" "}
              opportunities
              {resumeData && (
                <span className="job-results-badge">
                  (Personalized Rankings Active)
                </span>
              )}
            </p>
          </div>

          <div className={viewMode === "grid" ? "job-grid" : "job-list"}>
            {filteredJobs.length > 0 ? (
              filteredJobs.map((job) => <JobCard key={job.id} job={job} />)
            ) : (
              <div className="job-no-results">
                <h3>No jobs found</h3>
                <p>Try adjusting your search or filters.</p>
                <button
                  onClick={() =>
                    setFilters({
                      locations: [],
                      experience: 10,
                      salaryRange: { min: 0 },
                      skills: [],
                      jobTypes: [],
                      datePosted: "any",
                    })
                  }
                  className="job-clear-btn"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        </main>
      </div>

      <button
        className="mobile-only job-mobile-float-btn"
        onClick={() => setIsFilterOpen(true)}
      >
        <FiFilter style={{ marginRight: "8px" }} /> Filters
      </button>

      <style>{`
        @media (min-width: 769px) { .mobile-only { display: none !important; } }
      `}</style>
    </div>
  );
};

export default JobDashboard;
