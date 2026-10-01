import React, {
  useEffect,
  useMemo,
  useState
} from "react";

import "./App.css";
import Login from "./Login";

// =====================================================
// API URL
// =====================================================

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://interviewease1-1.onrender.com/api/interviews";
// =====================================================
// EMPTY FORM
// =====================================================

const emptyForm = {
  companyName: "",
  candidateName: "",
  candidateEmail: "",
  interviewerName: "",
  interviewDate: "",
  interviewTime: "",
  interviewType: "Online",
  meetingLink: ""
};

// =====================================================
// FORMAT TIME
// =====================================================

function formatTime(timeValue) {
  if (!timeValue) {
    return "-";
  }

  const value = String(timeValue)
    .trim()
    .toUpperCase();

  // Already AM / PM
  if (
    value.includes("AM") ||
    value.includes("PM")
  ) {
    return value;
  }

  const parts = value.split(":");

  if (parts.length < 2) {
    return value;
  }

  let hours = parseInt(parts[0], 10);

  const minutes = String(parts[1])
    .padStart(2, "0");

  if (Number.isNaN(hours)) {
    return value;
  }

  const period =
    hours >= 12 ? "PM" : "AM";

  hours = hours % 12;

  if (hours === 0) {
    hours = 12;
  }

  return `${String(hours).padStart(
    2,
    "0"
  )}:${minutes} ${period}`;
}

// =====================================================
// FORMAT DATE
// =====================================================

function formatDate(dateValue) {
  if (!dateValue) {
    return "-";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric"
    }
  );
}

// =====================================================
// GET INTERVIEW DATE TIME
// =====================================================

function getInterviewDateTime(interview) {
  if (
    !interview ||
    !interview.interviewDate ||
    !interview.interviewTime
  ) {
    return null;
  }

  const date = new Date(
    interview.interviewDate
  );

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const year =
    date.getUTCFullYear();

  const month =
    date.getUTCMonth();

  const day =
    date.getUTCDate();

  let time = String(
    interview.interviewTime
  )
    .trim()
    .toUpperCase();

  let hours = 0;
  let minutes = 0;

  // ---------------------------------------------
  // AM / PM
  // ---------------------------------------------

  if (
    time.includes("AM") ||
    time.includes("PM")
  ) {
    const parts =
      time.split(/\s+/);

    const timePart =
      parts[0];

    const period =
      parts[1];

    const timeValues =
      timePart.split(":");

    hours =
      parseInt(
        timeValues[0],
        10
      );

    minutes =
      parseInt(
        timeValues[1],
        10
      );

    if (
      period === "PM" &&
      hours !== 12
    ) {
      hours += 12;
    }

    if (
      period === "AM" &&
      hours === 12
    ) {
      hours = 0;
    }
  }

  // ---------------------------------------------
  // 24 HOURS
  // ---------------------------------------------

  else {
    const timeValues =
      time.split(":");

    hours =
      parseInt(
        timeValues[0],
        10
      );

    minutes =
      parseInt(
        timeValues[1],
        10
      );
  }

  if (
    Number.isNaN(hours) ||
    Number.isNaN(minutes)
  ) {
    return null;
  }

  // Backend stores interview time as IST.
  // Convert IST to UTC.
  return new Date(
    Date.UTC(
      year,
      month,
      day,
      hours - 5,
      minutes - 30
    )
  );
}

// =====================================================
// GET LIVE STATUS
// =====================================================

function getLiveStatus(interview) {
  if (!interview) {
    return "Scheduled";
  }

  if (
    interview.status ===
    "Cancelled"
  ) {
    return "Cancelled";
  }

  if (
    interview.status ===
    "Completed"
  ) {
    return "Completed";
  }

  const interviewDateTime =
    getInterviewDateTime(
      interview
    );

  if (
    interviewDateTime &&
    interviewDateTime <= new Date()
  ) {
    return "Completed";
  }

  return "Scheduled";
}

// =====================================================
// APP
// =====================================================

function App() {

  // ===================================================
  // LOGIN
  // ===================================================

  const [isLoggedIn, setIsLoggedIn] =
    useState(
      !!localStorage.getItem(
        "interviewEaseToken"
      )
    );

  // ===================================================
  // DATA
  // ===================================================

  const [interviews, setInterviews] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  // ===================================================
  // MODAL
  // ===================================================

  const [showModal, setShowModal] =
    useState(false);

  const [editingInterview, setEditingInterview] =
    useState(null);

  // ===================================================
  // FORM
  // ===================================================

  const [form, setForm] =
    useState(emptyForm);

  // ===================================================
  // FILTERS
  // ===================================================

  const [search, setSearch] =
    useState("");

  const [companyFilter, setCompanyFilter] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("All");

  const [typeFilter, setTypeFilter] =
    useState("All");

  // ===================================================
  // CURRENT TIME
  // ===================================================

  const [, setCurrentTime] =
    useState(new Date());

  // ===================================================
  // LIVE CLOCK
  // ===================================================

  useEffect(() => {
    const timer =
      setInterval(() => {
        setCurrentTime(
          new Date()
        );
      }, 1000);

    return () =>
      clearInterval(timer);
  }, []);

  // ===================================================
  // FETCH INTERVIEWS
  // ===================================================

  const fetchInterviews =
    async () => {

      try {
        setLoading(true);

        const token =
          localStorage.getItem(
            "interviewEaseToken"
          );

        if (!token) {
          setIsLoggedIn(false);
          return;
        }

        const response =
          await fetch(API_URL, {
            headers: {
              Authorization:
                `Bearer ${token}`
            }
          });

        if (
          response.status === 401
        ) {
          localStorage.removeItem(
            "interviewEaseToken"
          );

          localStorage.removeItem(
            "interviewEaseUser"
          );

          setIsLoggedIn(false);

          return;
        }

        const data =
          await response.json();

        if (data.success) {
          setInterviews(
            data.data || []
          );
        } else {
          console.error(
            data.message
          );
        }

      } catch (error) {
        console.error(
          "FETCH ERROR:",
          error
        );

      } finally {
        setLoading(false);
      }
    };

  // ===================================================
  // FETCH WHEN LOGIN
  // ===================================================

  useEffect(() => {
    if (isLoggedIn) {
      fetchInterviews();
    }
  }, [isLoggedIn]);

  // ===================================================
  // LOGIN
  // ===================================================

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  // ===================================================
  // LOGOUT
  // ===================================================

  const handleLogout = () => {

    localStorage.removeItem(
      "interviewEaseToken"
    );

    localStorage.removeItem(
      "interviewEaseUser"
    );

    setInterviews([]);

    setIsLoggedIn(false);
  };

  // ===================================================
  // FORM CHANGE
  // ===================================================

  const handleChange = (e) => {

    const {
      name,
      value
    } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value
    }));

    // If Offline selected,
    // remove meeting link.
    if (
      name === "interviewType" &&
      value === "Offline"
    ) {
      setForm((prev) => ({
        ...prev,
        interviewType:
          value,
        meetingLink: ""
      }));
    }
  };

  // ===================================================
  // OPEN ADD MODAL
  // ===================================================

  const openAddModal = () => {

    setEditingInterview(null);

    setForm({
      ...emptyForm
    });

    setShowModal(true);
  };

  // ===================================================
  // OPEN EDIT MODAL
  // ===================================================

  const openEditModal =
    (interview) => {

      setEditingInterview(
        interview
      );

      let interviewDate = "";

      if (
        interview.interviewDate
      ) {
        const date =
          new Date(
            interview.interviewDate
          );

        if (
          !Number.isNaN(
            date.getTime()
          )
        ) {
          interviewDate =
            `${date.getUTCFullYear()}-${String(
              date.getUTCMonth() + 1
            ).padStart(2, "0")}-${String(
              date.getUTCDate()
            ).padStart(2, "0")}`;
        }
      }

      let interviewTime =
        interview.interviewTime ||
        "";

      // Convert AM/PM to HH:mm
      if (
        interviewTime
          .toUpperCase()
          .includes("AM") ||
        interviewTime
          .toUpperCase()
          .includes("PM")
      ) {

        const parts =
          interviewTime
            .trim()
            .toUpperCase()
            .split(/\s+/);

        const timePart =
          parts[0];

        const period =
          parts[1];

        let [
          hours,
          minutes
        ] =
          timePart
            .split(":")
            .map(Number);

        if (
          period === "PM" &&
          hours !== 12
        ) {
          hours += 12;
        }

        if (
          period === "AM" &&
          hours === 12
        ) {
          hours = 0;
        }

        interviewTime =
          `${String(hours).padStart(
            2,
            "0"
          )}:${String(minutes).padStart(
            2,
            "0"
          )}`;
      }

      setForm({
        companyName:
          interview.companyName ||
          "",

        candidateName:
          interview.candidateName ||
          "",

        candidateEmail:
          interview.candidateEmail ||
          "",

        interviewerName:
          interview.interviewerName ||
          "",

        interviewDate,

        interviewTime,

        interviewType:
          interview.interviewType ||
          "Online",

        meetingLink:
          interview.meetingLink ||
          ""
      });

      setShowModal(true);
    };

  // ===================================================
  // CLOSE MODAL
  // ===================================================

  const closeModal = () => {

    setShowModal(false);

    setEditingInterview(null);

    setForm({
      ...emptyForm
    });
  };

  // ===================================================
  // CREATE / UPDATE
  // ===================================================

  const handleSubmit =
    async (e) => {

      e.preventDefault();

      try {

        const token =
          localStorage.getItem(
            "interviewEaseToken"
          );

        if (!token) {
          setIsLoggedIn(false);
          return;
        }

        const isEdit =
          !!editingInterview;

        const url =
          isEdit
            ? `${API_URL}/${editingInterview._id}`
            : API_URL;

        const method =
          isEdit
            ? "PUT"
            : "POST";

        const response =
          await fetch(url, {
            method,

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`
            },

            body: JSON.stringify({
              companyName:
                form.companyName,

              candidateName:
                form.candidateName,

              candidateEmail:
                form.candidateEmail,

              interviewerName:
                form.interviewerName,

              interviewDate:
                form.interviewDate,

              interviewTime:
                form.interviewTime,

              interviewType:
                form.interviewType,

              meetingLink:
                form.interviewType ===
                "Online"
                  ? form.meetingLink
                  : ""
            })
          });

        if (
          response.status === 401
        ) {
          localStorage.removeItem(
            "interviewEaseToken"
          );

          localStorage.removeItem(
            "interviewEaseUser"
          );

          setIsLoggedIn(false);

          return;
        }

        const data =
          await response.json();

        if (!response.ok) {
          alert(
            data.message ||
            "Something went wrong"
          );

          return;
        }

        alert(
          isEdit
            ? "Interview updated successfully!"
            : "Interview scheduled successfully!"
        );

        closeModal();

        fetchInterviews();

      } catch (error) {

        console.error(
          "SAVE ERROR:",
          error
        );

        alert(
          "Unable to connect to server"
        );
      }
    };

  // ===================================================
  // DELETE
  // ===================================================

  const handleDelete =
    async (id) => {

      const confirmDelete =
        window.confirm(
          "Are you sure you want to delete this interview?"
        );

      if (!confirmDelete) {
        return;
      }

      try {

        const token =
          localStorage.getItem(
            "interviewEaseToken"
          );

        const response =
          await fetch(
            `${API_URL}/${id}`,
            {
              method: "DELETE",

              headers: {
                Authorization:
                  `Bearer ${token}`
              }
            }
          );

        if (
          response.status === 401
        ) {
          handleLogout();
          return;
        }

        const data =
          await response.json();

        if (!response.ok) {
          alert(
            data.message ||
            "Delete failed"
          );

          return;
        }

        fetchInterviews();

      } catch (error) {

        console.error(
          "DELETE ERROR:",
          error
        );

        alert(
          "Unable to delete interview"
        );
      }
    };

  // ===================================================
  // COMPANIES
  // ===================================================

  const companies =
    useMemo(() => {

      const list =
        interviews
          .map(
            (item) =>
              item.companyName
          )
          .filter(Boolean);

      return [
        ...new Set(list)
      ].sort();

    }, [interviews]);

  // ===================================================
  // FILTERED INTERVIEWS
  // ===================================================

  const filteredInterviews =
    useMemo(() => {

      return interviews.filter(
        (interview) => {

          const liveStatus =
            getLiveStatus(
              interview
            );

          const searchText =
            search
              .toLowerCase()
              .trim();

          const matchesSearch =
            !searchText ||
            String(
              interview.companyName ||
              ""
            )
              .toLowerCase()
              .includes(searchText) ||

            String(
              interview.candidateName ||
              ""
            )
              .toLowerCase()
              .includes(searchText) ||

            String(
              interview.candidateEmail ||
              ""
            )
              .toLowerCase()
              .includes(searchText) ||

            String(
              interview.interviewerName ||
              ""
            )
              .toLowerCase()
              .includes(searchText);

          const matchesCompany =
            !companyFilter ||
            interview.companyName ===
              companyFilter;

          const matchesStatus =
            statusFilter === "All" ||
            liveStatus ===
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
      search,
      companyFilter,
      statusFilter,
      typeFilter
    ]);

  // ===================================================
  // DASHBOARD STATS
  // ===================================================

  const stats =
    useMemo(() => {

      const selected =
        companyFilter
          ? interviews.filter(
              (item) =>
                item.companyName ===
                companyFilter
            )
          : interviews;

      const total =
        selected.length;

      const scheduled =
        selected.filter(
          (item) =>
            getLiveStatus(item) ===
            "Scheduled"
        ).length;

      const completed =
        selected.filter(
          (item) =>
            getLiveStatus(item) ===
            "Completed"
        ).length;

      const cancelled =
        selected.filter(
          (item) =>
            getLiveStatus(item) ===
            "Cancelled"
        ).length;

      const percentage =
        total > 0
          ? Math.round(
              (completed /
                total) *
                100
            )
          : 0;

      return {
        total,
        scheduled,
        completed,
        cancelled,
        percentage
      };

    }, [
      interviews,
      companyFilter
    ]);

  // ===================================================
  // NEXT UPCOMING INTERVIEW
  // ===================================================

  const nextInterview =
    useMemo(() => {

      const now =
        new Date();

      const upcoming =
        interviews
          .filter((interview) => {

            if (
              companyFilter &&
              interview.companyName !==
                companyFilter
            ) {
              return false;
            }

            if (
              getLiveStatus(
                interview
              ) !== "Scheduled"
            ) {
              return false;
            }

            const dateTime =
              getInterviewDateTime(
                interview
              );

            return (
              dateTime &&
              dateTime > now
            );
          })
          .sort(
            (a, b) =>
              getInterviewDateTime(a) -
              getInterviewDateTime(b)
          );

      return upcoming[0] || null;

    }, [
      interviews,
      companyFilter
    ]);

  // ===================================================
  // COMPANY SUMMARY
  // ===================================================

  const companySummary =
    useMemo(() => {

      if (!companyFilter) {
        return null;
      }

      const companyInterviews =
        interviews.filter(
          (item) =>
            item.companyName ===
            companyFilter
        );

      return {
        total:
          companyInterviews.length,

        scheduled:
          companyInterviews.filter(
            (item) =>
              getLiveStatus(item) ===
              "Scheduled"
          ).length,

        completed:
          companyInterviews.filter(
            (item) =>
              getLiveStatus(item) ===
              "Completed"
          ).length,

        cancelled:
          companyInterviews.filter(
            (item) =>
              getLiveStatus(item) ===
              "Cancelled"
          ).length
      };

    }, [
      interviews,
      companyFilter
    ]);

  // ===================================================
  // CLEAR FILTERS
  // ===================================================

  const clearFilters = () => {

    setSearch("");
    setCompanyFilter("");
    setStatusFilter("All");
    setTypeFilter("All");
  };

  // ===================================================
  // LOGIN SCREEN
  // ===================================================

  if (!isLoggedIn) {

    return (
      <Login
        onLogin={handleLogin}
      />
    );
  }

  // ===================================================
  // MAIN UI
  // ===================================================

  return (
    <div className="app">

      {/* =================================================
          HEADER
      ================================================= */}

      <header className="top-header">

        <div className="brand">

          <div className="brand-icon">
            💼
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

        <div className="header-actions">

          <button
            className="add-btn"
            onClick={
              openAddModal
            }
          >
            ＋ Add Interview
          </button>

          <button
            className="logout-btn"
            onClick={
              handleLogout
            }
          >
            Logout
          </button>

        </div>

      </header>


      {/* =================================================
          MAIN
      ================================================= */}

      <main className="main-content">

        {/* =================================================
            DASHBOARD HEADING
        ================================================= */}

        <div className="dashboard-heading">

          <div>
            <h2>
              Dashboard
            </h2>

            <p>
              Manage and track your interviews
            </p>
          </div>

          {companyFilter && (
            <div className="selected-company">
              🏢 {companyFilter}
            </div>
          )}

        </div>


        {/* =================================================
            STATS
        ================================================= */}

        <div className="stats">

          <div className="stat-card">

            <div className="stat-icon total">
              📋
            </div>

            <div>
              <span>
                TOTAL INTERVIEWS
              </span>

              <strong>
                {stats.total}
              </strong>
            </div>

          </div>


          <div className="stat-card">

            <div className="stat-icon scheduled">
              🗓️
            </div>

            <div>
              <span>
                SCHEDULED
              </span>

              <strong>
                {stats.scheduled}
              </strong>
            </div>

          </div>


          <div className="stat-card">

            <div className="stat-icon completed">
              ✓
            </div>

            <div>
              <span>
                COMPLETED
              </span>

              <strong>
                {stats.completed}
              </strong>
            </div>

          </div>


          <div className="stat-card">

            <div className="stat-icon cancelled">
              ✕
            </div>

            <div>
              <span>
                CANCELLED
              </span>

              <strong>
                {stats.cancelled}
              </strong>
            </div>

          </div>


          <div className="stat-card">

            <div className="stat-icon percentage">
              %
            </div>

            <div>
              <span>
                COMPLETION RATE
              </span>

              <strong>
                {stats.percentage}%
              </strong>
            </div>

          </div>

        </div>


        {/* =================================================
            COMPANY SUMMARY
        ================================================= */}

        {companyFilter &&
          companySummary && (
            <div className="company-summary">

              <div className="company-summary-header">

                <div>
                  <div className="company-summary-label">
                    COMPANY SUMMARY
                  </div>

                  <h3>
                    🏢 {companyFilter}
                  </h3>
                </div>

                <div className="company-total-badge">
                  {companySummary.total} Interviews
                </div>

              </div>

              <div className="company-summary-grid">

                <div className="company-summary-item">
                  <span>
                    Total
                  </span>

                  <strong>
                    {companySummary.total}
                  </strong>
                </div>

                <div className="company-summary-item">
                  <span>
                    Scheduled
                  </span>

                  <strong>
                    {companySummary.scheduled}
                  </strong>
                </div>

                <div className="company-summary-item">
                  <span>
                    Completed
                  </span>

                  <strong>
                    {companySummary.completed}
                  </strong>
                </div>

                <div className="company-summary-item">
                  <span>
                    Cancelled
                  </span>

                  <strong>
                    {companySummary.cancelled}
                  </strong>
                </div>

              </div>

            </div>
          )}


        {/* =================================================
            NEXT INTERVIEW
        ================================================= */}

        {nextInterview && (

          <div className="next-interview-card">

            <div className="next-interview-left">

              <div className="next-icon">
                ⏰
              </div>

              <div>

                <div className="next-label">
                  NEXT UPCOMING INTERVIEW
                </div>

                <h3>
                  {nextInterview.candidateName}
                </h3>

                <p>
                  🏢{" "}
                  {nextInterview.companyName ||
                    "-"}
                  {" • "}
                  👤{" "}
                  {nextInterview.interviewerName ||
                    "-"}
                </p>

              </div>

            </div>


            <div className="next-interview-details">

              <div>
                <span>
                  DATE
                </span>

                <strong>
                  {formatDate(
                    nextInterview.interviewDate
                  )}
                </strong>
              </div>

              <div>
                <span>
                  TIME
                </span>

                <strong>
                  {formatTime(
                    nextInterview.interviewTime
                  )}
                </strong>
              </div>

              <div>
                <span>
                  TYPE
                </span>

                <strong>
                  {nextInterview.interviewType}
                </strong>
              </div>

            </div>

          </div>
        )}


        {/* =================================================
            FILTERS
        ================================================= */}

        <div className="filters">

          <div className="search-box">

            <span>
              🔍
            </span>

            <input
              type="text"
              placeholder="Search company, candidate, email..."
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
            />

          </div>


          <select
            value={companyFilter}
            onChange={(e) =>
              setCompanyFilter(
                e.target.value
              )
            }
          >
            <option value="">
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


          <button
            className="clear-btn"
            onClick={
              clearFilters
            }
          >
            Clear
          </button>

        </div>


        {/* =================================================
            TABLE
        ================================================= */}

        <div className="table-container">

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

              {loading ? (

                <tr>
                  <td
                    colSpan="8"
                    className="empty-state"
                  >
                    Loading interviews...
                  </td>
                </tr>

              ) : filteredInterviews.length ===
                0 ? (

                <tr>
                  <td
                    colSpan="8"
                    className="empty-state"
                  >
                    <div>
                      <div className="empty-icon">
                        📭
                      </div>

                      <h3>
                        No Interviews Found
                      </h3>

                      <p>
                        Try changing your filters
                        or schedule a new interview.
                      </p>
                    </div>
                  </td>
                </tr>

              ) : (

                filteredInterviews.map(
                  (interview) => {

                    const liveStatus =
                      getLiveStatus(
                        interview
                      );

                    return (

                      <tr
                        key={
                          interview._id
                        }
                      >

                        {/* COMPANY */}

                        <td>

                          <strong>
                            {interview.companyName ||
                              "-"}
                          </strong>

                        </td>


                        {/* CANDIDATE */}

                        <td>

                          <div className="candidate-cell">

                            <strong>
                              {interview.candidateName ||
                                "-"}
                            </strong>

                            <span>
                              {interview.candidateEmail ||
                                "-"}
                            </span>

                          </div>

                        </td>


                        {/* INTERVIEWER */}

                        <td>
                          {interview.interviewerName ||
                            "-"}
                        </td>


                        {/* DATE */}

                        <td>
                          <strong>
                            {formatDate(
                              interview.interviewDate
                            )}
                          </strong>
                        </td>


                        {/* TIME */}

                        <td>

                          <strong>
                            {formatTime(
                              interview.interviewTime
                            )}
                          </strong>

                        </td>


                        {/* TYPE */}

                        <td>

                          <span
                            className={`type-badge ${
                              interview.interviewType
                                ?.toLowerCase()
                            }`}
                          >

                            {interview.interviewType ===
                            "Online"
                              ? "💻"
                              : "🏢"}

                            {" "}

                            {interview.interviewType ||
                              "-"}

                          </span>

                        </td>


                        {/* STATUS */}

                        <td>

                          <span
                            className={`status-badge ${
                              liveStatus.toLowerCase()
                            }`}
                          >

                            <span className="status-dot"></span>

                            {liveStatus}

                          </span>

                        </td>


                        {/* ACTIONS */}

                        <td>

                          <div className="action-buttons">

                            {/* JOIN */}

                            {liveStatus ===
                              "Scheduled" &&
                              interview.interviewType ===
                                "Online" &&
                              interview.meetingLink && (

                                <a
                                  href={
                                    interview.meetingLink
                                  }
                                  target="_blank"
                                  rel="noreferrer"
                                  className="join-btn"
                                >
                                  Join
                                </a>

                              )}


                            {/* EDIT */}

                            <button
                              className="edit-btn"
                              onClick={() =>
                                openEditModal(
                                  interview
                                )
                              }
                            >
                              ✏️
                            </button>


                            {/* DELETE */}

                            <button
                              className="delete-btn"
                              onClick={() =>
                                handleDelete(
                                  interview._id
                                )
                              }
                            >
                              🗑️
                            </button>

                          </div>

                        </td>

                      </tr>

                    );
                  }
                )

              )}

            </tbody>

          </table>

        </div>

      </main>


      {/* =================================================
          ADD / EDIT INTERVIEW MODAL
      ================================================= */}

      {showModal && (

        <div
          className="modal-overlay"
          onClick={
            closeModal
          }
        >

          <div
            className="interview-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            {/* =================================================
                MODAL HEADER
            ================================================= */}

            <div className="modal-header">

              <div className="modal-title-section">

                <div className="modal-icon">
                  {editingInterview
                    ? "✏️"
                    : "📅"}
                </div>

                <div>

                  <h2>
                    {editingInterview
                      ? "Edit Interview"
                      : "Schedule Interview"}
                  </h2>

                  <p>
                    {editingInterview
                      ? "Update the interview details below"
                      : "Create a new interview schedule"}
                  </p>

                </div>

              </div>


              <button
                className="modal-close"
                onClick={
                  closeModal
                }
              >
                ✕
              </button>

            </div>


            {/* =================================================
                FORM
            ================================================= */}

            <form
              onSubmit={
                handleSubmit
              }
            >

              {/* =================================================
                  INTERVIEW DETAILS
              ================================================= */}

              <div className="form-section">

                <div className="form-section-title">

                  <span>
                    👤
                  </span>

                  <div>

                    <h3>
                      Interview Details
                    </h3>

                    <p>
                      Enter company and candidate information
                    </p>

                  </div>

                </div>


                <div className="form-grid">

                  {/* COMPANY */}

                  <div className="form-group">

                    <label>
                      Company Name{" "}
                      <span>*</span>
                    </label>

                    <div className="input-wrapper">

                      <span className="input-icon">
                        🏢
                      </span>

                      <input
                        type="text"
                        name="companyName"
                        placeholder="Enter company name"
                        value={
                          form.companyName
                        }
                        onChange={
                          handleChange
                        }
                        required
                      />

                    </div>

                  </div>


                  {/* CANDIDATE */}

                  <div className="form-group">

                    <label>
                      Candidate Name{" "}
                      <span>*</span>
                    </label>

                    <div className="input-wrapper">

                      <span className="input-icon">
                        👤
                      </span>

                      <input
                        type="text"
                        name="candidateName"
                        placeholder="Enter candidate name"
                        value={
                          form.candidateName
                        }
                        onChange={
                          handleChange
                        }
                        required
                      />

                    </div>

                  </div>


                  {/* EMAIL */}

                  <div className="form-group">

                    <label>
                      Candidate Email{" "}
                      <span>*</span>
                    </label>

                    <div className="input-wrapper">

                      <span className="input-icon">
                        ✉️
                      </span>

                      <input
                        type="email"
                        name="candidateEmail"
                        placeholder="candidate@email.com"
                        value={
                          form.candidateEmail
                        }
                        onChange={
                          handleChange
                        }
                        required
                      />

                    </div>

                  </div>


                  {/* INTERVIEWER */}

                  <div className="form-group">

                    <label>
                      Interviewer Name{" "}
                      <span>*</span>
                    </label>

                    <div className="input-wrapper">

                      <span className="input-icon">
                        🎤
                      </span>

                      <input
                        type="text"
                        name="interviewerName"
                        placeholder="Enter interviewer name"
                        value={
                          form.interviewerName
                        }
                        onChange={
                          handleChange
                        }
                        required
                      />

                    </div>

                  </div>

                </div>

              </div>


              {/* =================================================
                  SCHEDULE
              ================================================= */}

              <div className="form-section">

                <div className="form-section-title">

                  <span>
                    🗓️
                  </span>

                  <div>

                    <h3>
                      Schedule
                    </h3>

                    <p>
                      Select interview date and time
                    </p>

                  </div>

                </div>


                <div className="form-grid">

                  {/* DATE */}

                  <div className="form-group">

                    <label>
                      Interview Date{" "}
                      <span>*</span>
                    </label>

                    <div className="input-wrapper">

                      <span className="input-icon">
                        📅
                      </span>

                      <input
                        type="date"
                        name="interviewDate"
                        value={
                          form.interviewDate
                        }
                        onChange={
                          handleChange
                        }
                        required
                      />

                    </div>

                  </div>


                  {/* TIME */}

                  <div className="form-group">

                    <label>
                      Interview Time{" "}
                      <span>*</span>
                    </label>

                    <div className="input-wrapper">

                      <span className="input-icon">
                        ⏰
                      </span>

                      <input
                        type="time"
                        name="interviewTime"
                        value={
                          form.interviewTime
                        }
                        onChange={
                          handleChange
                        }
                        required
                      />

                    </div>

                    <small className="field-hint">
                      Select the interview start time
                    </small>

                  </div>


                  {/* INTERVIEW TYPE */}

                  <div className="form-group full-width">

                    <label>
                      Interview Type{" "}
                      <span>*</span>
                    </label>


                    <div className="interview-type-options">

                      {/* ONLINE */}

                      <label
                        className={`type-option ${
                          form.interviewType ===
                          "Online"
                            ? "active"
                            : ""
                        }`}
                      >

                        <input
                          type="radio"
                          name="interviewType"
                          value="Online"
                          checked={
                            form.interviewType ===
                            "Online"
                          }
                          onChange={
                            handleChange
                          }
                        />

                        <div className="type-icon">
                          💻
                        </div>

                        <div>

                          <strong>
                            Online Interview
                          </strong>

                          <span>
                            Video call / virtual meeting
                          </span>

                        </div>

                      </label>


                      {/* OFFLINE */}

                      <label
                        className={`type-option ${
                          form.interviewType ===
                          "Offline"
                            ? "active"
                            : ""
                        }`}
                      >

                        <input
                          type="radio"
                          name="interviewType"
                          value="Offline"
                          checked={
                            form.interviewType ===
                            "Offline"
                          }
                          onChange={
                            handleChange
                          }
                        />

                        <div className="type-icon">
                          🏢
                        </div>

                        <div>

                          <strong>
                            Offline Interview
                          </strong>

                          <span>
                            Face-to-face interview
                          </span>

                        </div>

                      </label>

                    </div>

                  </div>


                  {/* MEETING LINK */}

                  {form.interviewType ===
                    "Online" && (

                    <div className="form-group full-width">

                      <label>

                        Meeting Link

                        <span className="optional">
                          Optional
                        </span>

                      </label>

                      <div className="input-wrapper">

                        <span className="input-icon">
                          🔗
                        </span>

                        <input
                          type="url"
                          name="meetingLink"
                          placeholder="https://meet.google.com/..."
                          value={
                            form.meetingLink
                          }
                          onChange={
                            handleChange
                          }
                        />

                      </div>

                      <small className="field-hint">
                        Add the meeting link for the candidate to join.
                      </small>

                    </div>

                  )}

                </div>

              </div>


              {/* =================================================
                  MODAL FOOTER
              ================================================= */}

              <div className="modal-footer">

                <button
                  type="button"
                  className="cancel-btn"
                  onClick={
                    closeModal
                  }
                >
                  Cancel
                </button>


                <button
                  type="submit"
                  className="save-interview-btn"
                >

                  <span>
                    {editingInterview
                      ? "✓"
                      : "＋"}
                  </span>

                  {editingInterview
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