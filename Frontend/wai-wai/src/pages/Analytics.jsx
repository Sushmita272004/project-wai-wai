// Frontend/wai-wai/src/pages/Analytics.jsx
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  FiTrendingUp,
  FiUsers,
  FiBriefcase,
  FiClock,
  FiAward,
  FiTarget,
} from "react-icons/fi";
import "../styles/Analytics.css";

const COLORS = [
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "#f43f5e",
  "#f59e0b",
  "#10b981",
];

const Analytics = () => {
  const [overview, setOverview] = useState(null);
  const [pipeline, setPipeline] = useState([]);
  const [timeToHire, setTimeToHire] = useState([]);
  const [sources, setSources] = useState([]);
  const [quality, setQuality] = useState([]);
  const [recentApps, setRecentApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState("last_30_days");
  const [isMobile, setIsMobile] = useState(false);

  const API_BASE = "http://127.0.0.1:5000";

  useEffect(() => {
    fetchAnalyticsData();
  }, [dateRange]);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      const [
        overviewRes,
        pipelineRes,
        timeRes,
        sourcesRes,
        qualityRes,
        recentRes,
      ] = await Promise.all([
        fetch(`${API_BASE}/analytics/overview`),
        fetch(`${API_BASE}/analytics/pipeline`),
        fetch(`${API_BASE}/analytics/time-to-hire`),
        fetch(`${API_BASE}/analytics/source-effectiveness`),
        fetch(`${API_BASE}/analytics/candidate-quality`),
        fetch(`${API_BASE}/analytics/recent-applications`),
      ]);

      const overviewData = await overviewRes.json();
      const pipelineData = await pipelineRes.json();
      const timeData = await timeRes.json();
      const sourcesData = await sourcesRes.json();
      const qualityData = await qualityRes.json();
      const recentData = await recentRes.json();

      setOverview(overviewData);
      setPipeline(pipelineData.pipeline);
      setTimeToHire(timeData.time_series);
      setSources(sourcesData.sources);
      setQuality(qualityData.distribution);
      setRecentApps(recentData.applications);
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const MetricCard = ({ icon: Icon, title, value, change, color }) => (
    <motion.div
      className="metric-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div
        className="metric-icon"
        style={{ backgroundColor: `${color}20`, color }}
      >
        <Icon size={24} />
      </div>
      <div className="metric-content">
        <div className="metric-title">{title}</div>
        <div className="metric-value">{value}</div>
        {change && (
          <div
            className={`metric-change ${change.startsWith("+") ? "positive" : "negative"}`}
          >
            {change}
          </div>
        )}
      </div>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="analytics-loading">
        <div className="spinner"></div>
        <p>Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="analytics-container">
      <div className="analytics-header">
        <div>
          <h1>Hiring Analytics Dashboard</h1>
          <p>Comprehensive insights into your hiring pipeline</p>
        </div>
        <div className="date-range-selector">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            aria-label="Select date range"
          >
            <option value="last_7_days">Last 7 Days</option>
            <option value="last_30_days">Last 30 Days</option>
            <option value="last_90_days">Last 90 Days</option>
            <option value="all_time">All Time</option>
          </select>
        </div>
      </div>

      {/* Overview Metrics */}
      <div className="metrics-grid">
        <MetricCard
          icon={FiUsers}
          title="Total Applications"
          value={overview?.metrics?.total_applications || 0}
          change={overview?.metrics?.applications_change}
          color="#6366f1"
        />
        <MetricCard
          icon={FiBriefcase}
          title="Active Jobs"
          value={overview?.metrics?.active_jobs || 0}
          color="#8b5cf6"
        />
        <MetricCard
          icon={FiClock}
          title="Avg Time to Hire"
          value={`${overview?.metrics?.avg_time_to_hire_days || 0} days`}
          color="#ec4899"
        />
        <MetricCard
          icon={FiAward}
          title="Offer Acceptance"
          value={`${overview?.metrics?.offer_acceptance_rate || 0}%`}
          color="#10b981"
        />
        <MetricCard
          icon={FiTarget}
          title="Top Source"
          value={overview?.metrics?.top_source || "N/A"}
          color="#f59e0b"
        />
      </div>

      {/* Charts Section */}
      <div className="charts-container">
        {/* Pipeline Funnel */}
        <motion.div
          className="chart-card chart-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h3>Application Pipeline</h3>
          <ResponsiveContainer width="100%" height={isMobile ? 240 : 300}>
            <BarChart data={pipeline}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="stage" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="count" fill="#6366f1" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Time to Hire Trend */}
        <motion.div
          className="chart-card chart-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3>Time to Hire Trend</h3>
          <ResponsiveContainer width="100%" height={isMobile ? 240 : 300}>
            <LineChart data={timeToHire}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="week" stroke="#6b7280" />
              <YAxis
                stroke="#6b7280"
                label={{ value: "Days", angle: -90, position: "insideLeft" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                }}
              />
              <Line
                type="monotone"
                dataKey="avg_days"
                stroke="#ec4899"
                strokeWidth={3}
                dot={{ fill: "#ec4899", r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Source Effectiveness */}
        <motion.div
          className="chart-card chart-half"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3>Source Breakdown</h3>
          <ResponsiveContainer width="100%" height={isMobile ? 240 : 300}>
            <PieChart>
              <Pie
                data={sources}
                dataKey="applications"
                nameKey="source"
                cx="50%"
                cy="50%"
                outerRadius={isMobile ? 80 : 100}
                label={
                  isMobile
                    ? false
                    : (entry) => `${entry.source}: ${entry.applications}`
                }
              >
                {sources.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                }}
              />
              {isMobile && <Legend verticalAlign="bottom" height={24} />}
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Quality Distribution */}
        <motion.div
          className="chart-card chart-half"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3>Candidate Quality Distribution</h3>
          <ResponsiveContainer width="100%" height={isMobile ? 240 : 300}>
            <BarChart data={quality}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="range" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="count" fill="#10b981" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Recent Applications Table */}
      <motion.div
        className="recent-applications"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h3>Recent Applications</h3>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Candidate</th>
                <th>Job ID</th>
                <th>Source</th>
                <th>Status</th>
                <th>Quality Score</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {recentApps.map((app) => (
                <tr key={app.id}>
                  <td>{app.candidate}</td>
                  <td>Job #{app.job_id}</td>
                  <td>
                    <span className="source-badge">{app.source}</span>
                  </td>
                  <td>
                    <span
                      className={`status-badge status-${app.status.toLowerCase()}`}
                    >
                      {app.status}
                    </span>
                  </td>
                  <td>
                    <div className="quality-score">
                      <div className="score-bar">
                        <div
                          className="score-fill"
                          style={{ width: `${app.quality_score}%` }}
                        ></div>
                      </div>
                      <span>{app.quality_score}</span>
                    </div>
                  </td>
                  <td>{app.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default Analytics;
