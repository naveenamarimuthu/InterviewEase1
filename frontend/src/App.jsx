import { useEffect, useMemo, useState } from "react";
import "./App.css";

const API_URL = "http://localhost:5000/api/interviews";

function App() {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // =====================================================
  // SEARCH & FILTER
  // =====================================================

  const [searchText, setSearchText] = useState("");
  const [companyFilter, setCompanyFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");

  // =====================================================
  // FORM
  // =====================================================

  const [formData, setFormData] = useState({
    companyName: "",
    candidateName: "",
    candidateEmail: "",
    interviewerName: "",
    interviewDate: "",
    interviewTime: "",
    timePeriod: "AM",
    interviewType: "Online",
    meetingLink: "",
    status: "Scheduled"
  });

  // =====================================================
  // FETCH INTERVIEWS
  // =====================================================

  const fetchInterviews = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error("Unable to connect to backend");
      }

      const result = await response.json();

      if (result.success) {
        setInterviews(result.data || []);
      } else {
        throw new Error(
          result.message || "Unable to load interviews"
        );
      }
    } catch (err) {
      console.error(err);

      setError(
        err.message || "Failed to fetch interviews"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterviews();
  }, []);

  // =====================================================
  // DATE FORMAT
  // =====================================================

  const formatDate = (date) => {
    if (!date) return "-";

    const d = new Date(date);

    if (Number.isNaN(d.getTime())) {
      return date;
    }

    return d.toLocaleDateString("en-GB");
  };

  // =====================================================
  // TIME FORMAT
  // =====================================================

  const formatTime = (time) => {
    if (!time) return "-";

    if (/AM|PM/i.test(time)) {
      return time;
    }

    const parts = time.split(":");

    if (parts.length < 2) {
      return time;
    }

    let hour = parseInt(parts[0], 10);
    const minute = parts[1];

    if (Number.isNaN(hour)) {
      return time;
    }

    const period = hour >= 12 ? "PM" : "AM";

    hour = hour % 12;

    if (hour === 0) {
      hour = 12;
    }

    return `${String(hour).padStart(2, "0")}:${minute} ${period}`;
  };

  // =====================================================
  // FORM CHANGE
  // =====================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // =====================================================
  // ADD MODAL
  // =====================================================

  const openAddModal = () => {
    setEditingId(null);

    setFormData({
      companyName: "",
      candidateName: "",
      candidateEmail: "",
      interviewerName: "",
      interviewDate: "",
      interviewTime: "",
      timePeriod: "AM",
      interviewType: "Online",
      meetingLink: "",
      status: "Scheduled"
    });

    setShowModal(true);
  };

  // =====================================================
  // EDIT MODAL
  // =====================================================

  const openEditModal = (interview) => {
    setEditingId(interview._id);

    let time = interview.interviewTime || "";
    let period = "AM";

    if (/AM|PM/i.test(time)) {
      const match = time.match(/(AM|PM)/i);

      if (match) {
        period = match[1].toUpperCase();

        time = time
          .replace(/AM|PM/i, "")
          .trim();
      }
    } else if (time.includes(":")) {
      const hour = parseInt(
        time.split(":")[0],
        10
      );

      if (!Number.isNaN(hour)) {
        period = hour >= 12 ? "PM" : "AM";

        let convertedHour = hour % 12;

        if (convertedHour === 0) {
          convertedHour = 12;
        }

        const minute = time.split(":")[1];

        time =
          `${String(convertedHour).padStart(
            2,
            "0"
          )}:${minute}`;
      }
    }

    setFormData({
      companyName:
        interview.companyName || "",

      candidateName:
        interview.candidateName || "",

      candidateEmail:
        interview.candidateEmail || "",

      interviewerName:
        interview.interviewerName || "",

      interviewDate:
        interview.interviewDate
          ? interview.interviewDate.substring(0, 10)
          : "",

      interviewTime: time,

      timePeriod: period,

      interviewType:
        interview.interviewType || "Online",

      meetingLink:
        interview.meetingLink || "",

      status:
        interview.status || "Scheduled"
    });

    setShowModal(true);
  };

  // =====================================================
  // SAVE INTERVIEW
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setError("");

      if (
        !formData.companyName ||
        !formData.candidateName ||
        !formData.candidateEmail ||
        !formData.interviewerName ||
        !formData.interviewDate ||
        !formData.interviewTime
      ) {
        alert("Please fill all required fields.");
        return;
      }

      let hour = parseInt(
        formData.interviewTime.split(":")[0],
        10
      );

      const minute =
        formData.interviewTime.split(":")[1];

      if (
        formData.timePeriod === "PM" &&
        hour !== 12
      ) {
        hour += 12;
      }

      if (
        formData.timePeriod === "AM" &&
        hour === 12
      ) {
        hour = 0;
      }

      const finalTime =
        `${String(hour).padStart(2, "0")}:${minute}`;

      const dataToSend = {
        companyName:
          formData.companyName,

        candidateName:
          formData.candidateName,

        candidateEmail:
          formData.candidateEmail,

        interviewerName:
          formData.interviewerName,

        interviewDate:
          formData.interviewDate,

        interviewTime:
          finalTime,

        interviewType:
          formData.interviewType,

        meetingLink:
          formData.interviewType === "Online"
            ? formData.meetingLink
            : "",

        status:
          formData.status
      };

      const url = editingId
        ? `${API_URL}/${editingId}`
        : API_URL;

      const method = editingId
        ? "PUT"
        : "POST";

      const response = await fetch(url, {
        method,

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify(dataToSend)
      });

      const result = await response.json();

      if (
        !response.ok ||
        !result.success
      ) {
        throw new Error(
          result.message || "Operation failed"
        );
      }

      alert(
        editingId
          ? "Interview updated successfully!"
          : "Interview scheduled successfully!"
      );

      setShowModal(false);
      setEditingId(null);

      await fetchInterviews();

    } catch (err) {
      console.error(err);

      alert(
        err.message ||
        "Failed to save interview"
      );
    }
  };

  // =====================================================
  // DELETE
  // =====================================================

  const deleteInterview = async (id) => {
    const confirmDelete =
      window.confirm(
        "Are you sure you want to delete this interview?"
      );

    if (!confirmDelete) return;

    try {
      const response = await fetch(
        `${API_URL}/${id}`,
        {
          method: "DELETE"
        }
      );

      const result =
        await response.json();

      if (
        !response.ok ||
        !result.success
      ) {
        throw new Error(
          result.message || "Delete failed"
        );
      }

      alert(
        "Interview deleted successfully!"
      );

      await fetchInterviews();

    } catch (err) {
      console.error(err);

      alert(
        err.message ||
        "Failed to delete interview"
      );
    }
  };

  // =====================================================
  // COMPANY LIST
  // =====================================================

  const companies = useMemo(() => {
    const uniqueCompanies = interviews
      .map(
        (interview) =>
          interview.companyName
      )
      .filter(
        (company) =>
          company &&
          company.trim() !== ""
      );

    return [
      ...new Set(uniqueCompanies)
    ].sort();
  }, [interviews]);

  // =====================================================
  // FILTERED INTERVIEWS
  // =====================================================

  const filteredInterviews = useMemo(() => {
    const search =
      searchText
        .toLowerCase()
        .trim();

    return interviews.filter(
      (interview) => {

        const matchesSearch =
          !search ||
          interview.companyName
            ?.toLowerCase()
            .includes(search) ||
          interview.candidateName
            ?.toLowerCase()
            .includes(search) ||
          interview.candidateEmail
            ?.toLowerCase()
            .includes(search) ||
          interview.interviewerName
            ?.toLowerCase()
            .includes(search);

        const matchesCompany =
          companyFilter === "All" ||
          interview.companyName ===
            companyFilter;

        const matchesStatus =
          statusFilter === "All" ||
          interview.status ===
            statusFilter;

        const matchesType =
          typeFilter === "All" ||
          interview.interviewType ===
            typeFilter;

        return (
          matchesSearch &&
          matchesCompany &&
          matchesStatus &&
          matchesType
        );
      }
    );
  }, [
    interviews,
    searchText,
    companyFilter,
    statusFilter,
    typeFilter
  ]);

  // =====================================================
  // COMPANY DASHBOARD
  // =====================================================

  const dashboardInterviews =
    useMemo(() => {

      if (companyFilter === "All") {
        return interviews;
      }

      return interviews.filter(
        (interview) =>
          interview.companyName ===
          companyFilter
      );

    }, [
      interviews,
      companyFilter
    ]);

  const dashboardTotal =
    dashboardInterviews.length;

  const dashboardCompleted =
    dashboardInterviews.filter(
      (item) =>
        item.status === "Completed"
    ).length;

  const dashboardCancelled =
    dashboardInterviews.filter(
      (item) =>
        item.status === "Cancelled"
    ).length;

  const dashboardScheduled =
    dashboardInterviews.filter(
      (item) =>
        item.status === "Scheduled"
    ).length;

  const dashboardCompletionRate =
    dashboardTotal > 0
      ? Math.round(
          (dashboardCompleted /
            dashboardTotal) *
            100
        )
      : 0;

  // =====================================================
  // UPCOMING COUNT
  // =====================================================

  const today = new Date();

  today.setHours(
    0,
    0,
    0,
    0
  );

  const dashboardUpcoming =
    dashboardInterviews.filter(
      (item) => {

        if (
          item.status !==
          "Scheduled"
        ) {
          return false;
        }

        const interviewDate =
          new Date(
            item.interviewDate
          );

        interviewDate.setHours(
          0,
          0,
          0,
          0
        );

        return (
          interviewDate >= today
        );
      }
    ).length;

  // =====================================================
  // NEXT INTERVIEW
  // =====================================================

  const nextInterview =
    useMemo(() => {

      const now =
        new Date();

      const upcoming =
        interviews
          .filter(
            (item) => {

              if (
                item.status !==
                "Scheduled"
              ) {
                return false;
              }

              if (
                !item.interviewDate
              ) {
                return false;
              }

              if (
                companyFilter !==
                  "All" &&
                item.companyName !==
                  companyFilter
              ) {
                return false;
              }

              const date =
                new Date(
                  item.interviewDate
                );

              if (
                Number.isNaN(
                  date.getTime()
                )
              ) {
                return false;
              }

              return (
                date >=
                new Date(
                  now.getFullYear(),
                  now.getMonth(),
                  now.getDate()
                )
              );
            }
          )
          .sort(
            (a, b) =>
              new Date(
                a.interviewDate
              ).getTime() -
              new Date(
                b.interviewDate
              ).getTime()
          );

      return upcoming[0] || null;

    }, [
      interviews,
      companyFilter
    ]);

  // =====================================================
  // JOIN
  // =====================================================

  const joinInterview =
    (interview) => {

      if (
        interview.status !==
        "Scheduled"
      ) {
        return;
      }

      if (
        interview.interviewType !==
        "Online"
      ) {
        return;
      }

      if (
        !interview.meetingLink
      ) {
        alert(
          "Meeting link is not available."
        );

        return;
      }

      window.open(
        interview.meetingLink,
        "_blank",
        "noopener,noreferrer"
      );
    };

  // =====================================================
  // CLEAR FILTERS
  // =====================================================

  const clearFilters = () => {

    setSearchText("");
    setCompanyFilter("All");
    setStatusFilter("All");
    setTypeFilter("All");

  };

  // =====================================================
  // CLOSE MODAL
  // =====================================================

  const closeModal = () => {

    setShowModal(false);
    setEditingId(null);

  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="app">

      {/* HEADER */}

      <header className="header">

        <div className="brand">

          <div className="logo">
            IE
          </div>

          <div>

            <h1>
              InterviewEase
            </h1>

            <p>
              Interview Scheduling System
            </p>

          </div>

        </div>

        <button
          className="schedule-btn"
          onClick={openAddModal}
        >
          + Schedule Interview
        </button>

      </header>

      <main className="container">

        {/* =================================================
            DASHBOARD TITLE
        ================================================= */}

        <div className="dashboard-heading">

          <div>

            <h2>
              Dashboard
            </h2>

            <p>
              {companyFilter === "All"
                ? "Overview of all interviews"
                : `Showing statistics for ${companyFilter}`}
            </p>

          </div>

          {companyFilter !== "All" && (

            <div className="selected-company">

              🏢{" "}
              <strong>
                {companyFilter}
              </strong>

            </div>

          )}

        </div>

        {/* =================================================
            DASHBOARD STATS
        ================================================= */}

        <section className="stats">

          {/* TOTAL */}

          <div className="stat-card">

            <div className="stat-icon total">
              📋
            </div>

            <div>

              <span>
                Total Interviews
              </span>

              <strong>
                {dashboardTotal}
              </strong>

            </div>

          </div>

          {/* UPCOMING */}

          <div className="stat-card">

            <div className="stat-icon scheduled">
              📅
            </div>

            <div>

              <span>
                Upcoming
              </span>

              <strong>
                {dashboardUpcoming}
              </strong>

            </div>

          </div>

          {/* COMPLETED */}

          <div className="stat-card">

            <div className="stat-icon completed">
              ✓
            </div>

            <div>

              <span>
                Completed
              </span>

              <strong>
                {dashboardCompleted}
              </strong>

            </div>

          </div>

          {/* CANCELLED */}

          <div className="stat-card">

            <div className="stat-icon cancelled">
              ×
            </div>

            <div>

              <span>
                Cancelled
              </span>

              <strong>
                {dashboardCancelled}
              </strong>

            </div>

          </div>

          {/* COMPLETION RATE */}

          <div className="stat-card">

            <div className="stat-icon percentage">
              %
            </div>

            <div>

              <span>
                Completion Rate
              </span>

              <strong>
                {dashboardCompletionRate}%
              </strong>

            </div>

          </div>

        </section>

        {/* =================================================
            COMPANY SUMMARY
        ================================================= */}

        {companyFilter !== "All" && (

          <section className="company-summary">

            <div className="company-summary-header">

              <div>

                <span className="company-summary-label">
                  COMPANY SUMMARY
                </span>

                <h3>
                  {companyFilter}
                </h3>

              </div>

              <div className="company-total-badge">
                {dashboardTotal} Interviews
              </div>

            </div>

            <div className="company-summary-grid">

              <div className="company-summary-item">

                <span>
                  Scheduled
                </span>

                <strong>
                  {dashboardScheduled}
                </strong>

              </div>

              <div className="company-summary-item">

                <span>
                  Completed
                </span>

                <strong>
                  {dashboardCompleted}
                </strong>

              </div>

              <div className="company-summary-item">

                <span>
                  Cancelled
                </span>

                <strong>
                  {dashboardCancelled}
                </strong>

              </div>

              <div className="company-summary-item">

                <span>
                  Completion Rate
                </span>

                <strong>
                  {dashboardCompletionRate}%
                </strong>

              </div>

            </div>

          </section>

        )}

        {/* =================================================
            NEXT UPCOMING INTERVIEW
        ================================================= */}

        {nextInterview && (

          <section className="next-interview-card">

            <div className="next-interview-left">

              <div className="next-icon">
                ⏰
              </div>

              <div>

                <span className="next-label">
                  NEXT UPCOMING INTERVIEW
                </span>

                <h3>
                  {nextInterview.companyName}
                </h3>

                <p>
                  Candidate:{" "}
                  <strong>
                    {
                      nextInterview.candidateName
                    }
                  </strong>
                </p>

                <p>
                  Interviewer:{" "}
                  <strong>
                    {
                      nextInterview.interviewerName
                    }
                  </strong>
                </p>

              </div>

            </div>

            <div className="next-interview-details">

              <div>

                <span>
                  📅 Date
                </span>

                <strong>
                  {formatDate(
                    nextInterview.interviewDate
                  )}
                </strong>

              </div>

              <div>

                <span>
                  🕐 Time
                </span>

                <strong>
                  {formatTime(
                    nextInterview.interviewTime
                  )}
                </strong>

              </div>

              <div>

                <span>
                  💻 Type
                </span>

                <strong>
                  {
                    nextInterview.interviewType
                  }
                </strong>

              </div>

            </div>

          </section>

        )}

        {/* =================================================
            INTERVIEWS
        ================================================= */}

        <section className="interviews-section">

          <div className="section-heading">

            <div>

              <h2>
                Scheduled Interviews
              </h2>

              <p>
                Manage all your interviews
              </p>

            </div>

            <div className="result-count">

              {filteredInterviews.length}{" "}
              interview
              {filteredInterviews.length !== 1
                ? "s"
                : ""}

            </div>

          </div>

          {/* FILTERS */}

          <div className="filters">

            {/* SEARCH */}

            <div className="search-box">

              <span>
                🔍
              </span>

              <input
                type="text"
                placeholder="Search company, candidate, email or interviewer..."
                value={searchText}
                onChange={(e) =>
                  setSearchText(
                    e.target.value
                  )
                }
              />

            </div>

            {/* COMPANY */}

            <select
              value={companyFilter}
              onChange={(e) =>
                setCompanyFilter(
                  e.target.value
                )
              }
            >

              <option value="All">
                All Companies
              </option>

              {companies.map(
                (company) => (

                  <option
                    key={company}
                    value={company}
                  >
                    {company}
                  </option>

                )
              )}

            </select>

            {/* STATUS */}

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(
                  e.target.value
                )
              }
            >

              <option value="All">
                All Status
              </option>

              <option value="Scheduled">
                Scheduled
              </option>

              <option value="Completed">
                Completed
              </option>

              <option value="Cancelled">
                Cancelled
              </option>

            </select>

            {/* TYPE */}

            <select
              value={typeFilter}
              onChange={(e) =>
                setTypeFilter(
                  e.target.value
                )
              }
            >

              <option value="All">
                All Types
              </option>

              <option value="Online">
                Online
              </option>

              <option value="Offline">
                Offline
              </option>

            </select>

            {/* CLEAR */}

            <button
              className="clear-btn"
              onClick={clearFilters}
            >
              Clear
            </button>

          </div>

          {/* ERROR */}

          {error && (

            <div className="error-box">

              <div className="warning-icon">
                ⚠️
              </div>

              <h3>
                Unable to load interviews
              </h3>

              <p>
                {error}
              </p>

              <button
                onClick={
                  fetchInterviews
                }
              >
                Try Again
              </button>

            </div>

          )}

          {/* LOADING */}

          {loading &&
            !error && (

              <div className="loading">
                Loading interviews...
              </div>

            )}

          {/* TABLE */}

          {!loading &&
            !error &&
            filteredInterviews.length > 0 && (

              <div className="table-wrapper">

                <table>

                  <thead>

                    <tr>

                      <th>
                        COMPANY
                      </th>

                      <th>
                        CANDIDATE
                      </th>

                      <th>
                        INTERVIEWER
                      </th>

                      <th>
                        DATE
                      </th>

                      <th>
                        TIME
                      </th>

                      <th>
                        TYPE
                      </th>

                      <th>
                        STATUS
                      </th>

                      <th>
                        ACTIONS
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {filteredInterviews.map(
                      (interview) => (

                        <tr
                          key={
                            interview._id
                          }
                        >

                          <td>

                            <strong>
                              {
                                interview.companyName ||
                                "-"
                              }
                            </strong>

                          </td>

                          <td>

                            <div className="candidate">

                              <strong>
                                {
                                  interview.candidateName
                                }
                              </strong>

                              <small>
                                {
                                  interview.candidateEmail
                                }
                              </small>

                            </div>

                          </td>

                          <td>
                            {
                              interview.interviewerName
                            }
                          </td>

                          <td>
                            {formatDate(
                              interview.interviewDate
                            )}
                          </td>

                          <td>
                            {formatTime(
                              interview.interviewTime
                            )}
                          </td>

                          <td>

                            <span
                              className={`type-badge ${
                                interview.interviewType ===
                                "Online"
                                  ? "online"
                                  : "offline"
                              }`}
                            >
                              {
                                interview.interviewType
                              }
                            </span>

                          </td>

                          <td>

                            <span
                              className={`status-badge ${
                                interview.status.toLowerCase()
                              }`}
                            >
                              {
                                interview.status
                              }
                            </span>

                          </td>

                          <td>

                            <div className="actions">

                              {interview.status ===
                                "Scheduled" &&
                                interview.interviewType ===
                                  "Online" && (

                                  <button
                                    className="join-btn"
                                    onClick={() =>
                                      joinInterview(
                                        interview
                                      )
                                    }
                                  >
                                    Join
                                  </button>

                                )}

                              <button
                                className="edit-btn"
                                onClick={() =>
                                  openEditModal(
                                    interview
                                  )
                                }
                              >
                                Edit
                              </button>

                              <button
                                className="delete-btn"
                                onClick={() =>
                                  deleteInterview(
                                    interview._id
                                  )
                                }
                              >
                                Delete
                              </button>

                            </div>

                          </td>

                        </tr>

                      )
                    )}

                  </tbody>

                </table>

              </div>

            )}

          {/* EMPTY */}

          {!loading &&
            !error &&
            filteredInterviews.length === 0 && (

              <div className="empty">

                <div className="empty-icon">
                  🔍
                </div>

                {interviews.length === 0 ? (

                  <>
                    <h3>
                      No interviews found
                    </h3>

                    <p>
                      Click "Schedule Interview"
                      to create your first
                      interview.
                    </p>
                  </>

                ) : (

                  <>
                    <h3>
                      No matching interviews
                    </h3>

                    <p>
                      Try changing your
                      search or filter
                      options.
                    </p>

                    <button
                      onClick={
                        clearFilters
                      }
                    >
                      Clear Filters
                    </button>
                  </>

                )}

              </div>

            )}

        </section>

      </main>

      {/* =================================================
          MODAL
      ================================================= */}

      {showModal && (

        <div
          className="modal-overlay"
          onClick={closeModal}
        >

          <div
            className="modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="modal-header">

              <div>

                <h2>
                  {editingId
                    ? "Edit Interview"
                    : "Schedule Interview"}
                </h2>

                <p>
                  {editingId
                    ? "Update interview details"
                    : "Add a new interview"}
                </p>

              </div>

              <button
                className="close-btn"
                onClick={closeModal}
              >
                ×
              </button>

            </div>

            <form
              onSubmit={handleSubmit}
              className="form"
            >

              <div className="form-grid">

                {/* COMPANY */}

                <div className="form-group full">

                  <label>
                    Company Name
                  </label>

                  <input
                    type="text"
                    name="companyName"
                    value={
                      formData.companyName
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Enter company name"
                    required
                  />

                </div>

                {/* CANDIDATE */}

                <div className="form-group">

                  <label>
                    Candidate Name
                  </label>

                  <input
                    type="text"
                    name="candidateName"
                    value={
                      formData.candidateName
                    }
                    onChange={
                      handleChange
                    }
                    required
                  />

                </div>

                {/* EMAIL */}

                <div className="form-group">

                  <label>
                    Candidate Email
                  </label>

                  <input
                    type="email"
                    name="candidateEmail"
                    value={
                      formData.candidateEmail
                    }
                    onChange={
                      handleChange
                    }
                    required
                  />

                </div>

                {/* INTERVIEWER */}

                <div className="form-group">

                  <label>
                    Interviewer Name
                  </label>

                  <input
                    type="text"
                    name="interviewerName"
                    value={
                      formData.interviewerName
                    }
                    onChange={
                      handleChange
                    }
                    required
                  />

                </div>

                {/* DATE */}

                <div className="form-group">

                  <label>
                    Interview Date
                  </label>

                  <input
                    type="date"
                    name="interviewDate"
                    value={
                      formData.interviewDate
                    }
                    onChange={
                      handleChange
                    }
                    required
                  />

                </div>

                {/* TIME */}

                <div className="form-group">

                  <label>
                    Interview Time
                  </label>

                  <div className="time-row">

                    <input
                      type="time"
                      name="interviewTime"
                      value={
                        formData.interviewTime
                      }
                      onChange={
                        handleChange
                      }
                      required
                    />

                    <select
                      name="timePeriod"
                      value={
                        formData.timePeriod
                      }
                      onChange={
                        handleChange
                      }
                    >

                      <option value="AM">
                        AM
                      </option>

                      <option value="PM">
                        PM
                      </option>

                    </select>

                  </div>

                </div>

                {/* TYPE */}

                <div className="form-group">

                  <label>
                    Interview Type
                  </label>

                  <select
                    name="interviewType"
                    value={
                      formData.interviewType
                    }
                    onChange={
                      handleChange
                    }
                  >

                    <option value="Online">
                      Online
                    </option>

                    <option value="Offline">
                      Offline
                    </option>

                  </select>

                </div>

                {/* MEETING LINK */}

                {formData.interviewType ===
                  "Online" && (

                  <div className="form-group full">

                    <label>
                      Meeting Link
                    </label>

                    <input
                      type="url"
                      name="meetingLink"
                      value={
                        formData.meetingLink
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="https://meeting.com"
                    />

                  </div>

                )}

                {/* STATUS */}

                <div className="form-group">

                  <label>
                    Status
                  </label>

                  <select
                    name="status"
                    value={
                      formData.status
                    }
                    onChange={
                      handleChange
                    }
                  >

                    <option value="Scheduled">
                      Scheduled
                    </option>

                    <option value="Completed">
                      Completed
                    </option>

                    <option value="Cancelled">
                      Cancelled
                    </option>

                  </select>

                </div>

              </div>

              <div className="modal-actions">

                <button
                  type="button"
                  className="cancel-btn"
                  onClick={closeModal}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-btn"
                >
                  {editingId
                    ? "Update Interview"
                    : "Schedule Interview"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}

export default App;