// frontend/wai-wai/src/pages/JobDashboard.jsx
import React, {
  useState,
  useMemo,
  useRef,
  useEffect,
  useDeferredValue,
} from "react";
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
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";

const JobDashboard = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [sortBy, setSortBy] = useState("matchScore");

  // --- RESUME MATCHING STATES ---
  const [resumeData, setResumeData] = useState(null);
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

  // --- PAGINATION STATE ---
  const ITEMS_PER_PAGE = 12;
  const [currentPage, setCurrentPage] = useState(1);

  // --- MOBILE OPTIMIZATIONS ---
  const deferredSearchTerm = useDeferredValue(searchTerm);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.matchMedia("(max-width: 768px)").matches;
      setIsMobile(mobile);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    // Force list view on mobile for better UX
    if (isMobile) {
      setViewMode("list");
    }
  }, [isMobile]);

  // Scroll to top whenever page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  // Reset to Page 1 if search/filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filters, sortBy]);

  useEffect(() => {
    // Prevent background scroll when filters are open (mobile overlay)
    document.body.style.overflow = isFilterOpen ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isFilterOpen]);

  // --- 1. HANDLE RESUME UPLOAD ---
  const handleResumeUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("job_description", "");

    try {
      // Using Gemini-powered backend endpoint
      const API_BASE =
        import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5000";
      const res = await fetch(`${API_BASE}/api/parse-resume`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (res.ok) {
        setResumeData(data.extracted_data);
        alert(
          `✅ Resume Parsed! Jobs are now ranked for ${data.extracted_data.name} based on AI skill extraction.`,
        );
      } else {
        alert("Parsing failed. Please try again.");
      }
    } catch (err) {
      console.error(err);
      alert("Network Error: Is backend running?");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const clearResumeMatch = () => {
    setResumeData(null);
  };

  // --- 2. SMART MATCHING LOGIC (UPDATED) ---
  const jobsWithScores = useMemo(() => {
    // If no resume is uploaded, return jobs with default/zero scores and no missing skills
    if (!resumeData)
      return mockJobs.map((job) => ({
        ...job,
        matchScore: 0,
        missingSkills: [],
      }));

    return mockJobs.map((job) => {
      let score = 0;

      // Normalize Skills
      const jobSkills = (job.skills || []).map((s) => s.toLowerCase().trim());
      const userSkills = (resumeData.skills || []).map((s) =>
        s.toLowerCase().trim(),
      );

      // Calculate Overlap
      // We check if a job skill exists in user skills (fuzzy string check)
      const matchingSkills = jobSkills.filter((jobSkill) =>
        userSkills.some(
          (userSkill) =>
            userSkill.includes(jobSkill) || jobSkill.includes(userSkill),
        ),
      );

      // Identify Missing Skills
      const missingSkills = jobSkills.filter(
        (jobSkill) =>
          !userSkills.some(
            (userSkill) =>
              userSkill.includes(jobSkill) || jobSkill.includes(userSkill),
          ),
      );

      // Score Calculation (Weight: 70% Skills, 30% Experience/Base)
      const skillMatchRatio =
        jobSkills.length > 0 ? matchingSkills.length / jobSkills.length : 0;
      score += skillMatchRatio * 70;

      // Experience Boost (Simple logic: if user exp >= job exp req)
      // Assuming mockJobs have numeric 'experience' and parsed data has 'experience' array or string
      // Just adding a base boost for now to ensure good candidates get high scores
      score += 20;

      // Cap score at 99%
      const finalScore = Math.min(
        99,
        Math.round(score + (skillMatchRatio > 0.8 ? 9 : 0)),
      );

      return {
        ...job,
        matchScore: finalScore,
        missingSkills: missingSkills, // Pass this to the card!
      };
    });
  }, [resumeData]);

  // --- 3. FILTERING & SORTING ---
  const filteredJobs = useMemo(() => {
    return jobsWithScores
      .filter((job) => {
        const matchesSearch =
          job.title.toLowerCase().includes(deferredSearchTerm.toLowerCase()) ||
          job.company.toLowerCase().includes(deferredSearchTerm.toLowerCase());
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
  }, [deferredSearchTerm, filters, sortBy, jobsWithScores]);

  // --- 4. PAGINATION LOGIC ---
  const totalPages = Math.ceil(filteredJobs.length / ITEMS_PER_PAGE);

  const displayedJobs = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredJobs.slice(startIndex, endIndex);
  }, [filteredJobs, currentPage]);

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
              <FiSearch className="job-search-icon" aria-hidden="true" />
              <input
                type="text"
                placeholder="Search by role, company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="job-search-input"
                aria-label="Search jobs"
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
                  aria-label="Upload resume for smart match"
                  disabled={isUploading}
                  className="job-upload-btn"
                >
                  <FiUploadCloud style={{ fontSize: "1.1rem" }} />
                  {isUploading
                    ? "Scanning with Gemini..."
                    : "Smart Match with Resume"}
                </button>
              ) : (
                <div className="job-active-resume-badge">
                  <span>
                    Matches for:{" "}
                    <strong>{resumeData.name?.split(" ")[0]}</strong>
                  </span>
                  <button
                    onClick={clearResumeMatch}
                    aria-label="Clear uploaded resume"
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

              {!isMobile && (
                <div className="job-view-toggle">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={
                      viewMode === "grid"
                        ? "job-icon-btn-active"
                        : "job-icon-btn"
                    }
                    aria-label="Grid view"
                  >
                    <FiGrid />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={
                      viewMode === "list"
                        ? "job-icon-btn-active"
                        : "job-icon-btn"
                    }
                    aria-label="List view"
                  >
                    <FiList />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="job-results-header">
            <p className="job-results-text">
              Found{" "}
              <span className="job-results-count">{filteredJobs.length}</span>{" "}
              opportunities
              {resumeData && (
                <span className="job-results-badge">(AI Ranked & Parsed)</span>
              )}
            </p>
          </div>

          {/** Enforce list view on mobile */}
          <div
            className={
              (isMobile ? "list" : viewMode) === "grid"
                ? "job-grid"
                : "job-list"
            }
          >
            {displayedJobs.length > 0 ? (
              displayedJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  // Assuming JobCard can render these props if updated,
                  // or user has updated JobCard to consume 'job.missingSkills'
                  // found inside the job object itself.
                />
              ))
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

          {/* --- PAGINATION CONTROLS --- */}
          {filteredJobs.length > ITEMS_PER_PAGE && (
            <div className="pagination-container">
              {/* Previous Arrow */}
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="pagination-arrow"
                aria-label="Previous Page"
              >
                <FiChevronLeft />
              </button>

              {/* Page Numbers */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (number) => (
                  <button
                    key={number}
                    onClick={() => setCurrentPage(number)}
                    className={`pagination-number ${
                      currentPage === number ? "active" : ""
                    }`}
                  >
                    {number}
                  </button>
                ),
              )}

              {/* Next Arrow */}
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="pagination-arrow"
                aria-label="Next Page"
              >
                <FiChevronRight />
              </button>
            </div>
          )}
        </main>
      </div>

      <button
        className="mobile-only job-mobile-float-btn"
        onClick={() => setIsFilterOpen(true)}
        aria-label="Open filters"
      >
        <FiFilter style={{ marginRight: "8px" }} /> Filters
      </button>

      <style>{`
        @media (min-width: 769px) { .mobile-only { display: none !important; } }
        
        /* Pagination Styles */
        .pagination-container {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 8px;
          margin-top: 30px;
          padding-bottom: 20px;
          flex-wrap: wrap;
        }

        .pagination-arrow,
        .pagination-number {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          padding: 8px 14px;
          cursor: pointer;
          font-weight: 500;
          color: #4a5568;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 36px;
        }

        .pagination-arrow:hover:not(:disabled),
        .pagination-number:hover {
          background-color: #f7fafc;
          border-color: #cbd5e0;
        }

        .pagination-number.active {
          background-color: #3b82f6;
          color: white;
          border-color: #3b82f6;
        }

        .pagination-arrow:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          background-color: #f1f5f9;
        }
      `}</style>
    </div>
  );
};

export default JobDashboard;
