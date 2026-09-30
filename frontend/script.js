// =====================================================
// INTERVIEWEASE - COMPLETE SCRIPT
// =====================================================

const API_URL =
    "http://localhost:5000/api/interviews";


let interviews = [];

let editingId = null;

let reminderTimer = null;


// =====================================================
// PAGE LOAD
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadInterviews();

        const form =
            document.getElementById(
                "interviewForm"
            );

        if (form) {

            form.addEventListener(
                "submit",
                handleFormSubmit
            );

        }

        startReminderChecker();

    }
);


// =====================================================
// LOAD INTERVIEWS
// =====================================================

async function loadInterviews() {

    try {

        const response =
            await fetch(API_URL);


        const result =
            await response.json();


        if (
            !response.ok ||
            !result.success
        ) {

            throw new Error(
                result.message ||
                "Unable to load interviews"
            );

        }


        interviews =
            result.data || [];


        displayInterviews(
            interviews
        );


        updateStats();


        checkInterviewReminders();

    }

    catch (error) {

        console.error(
            "LOAD ERROR:",
            error
        );


        showToast(
            "Unable to load interviews",
            "error"
        );

    }

}


// =====================================================
// DISPLAY INTERVIEWS
// =====================================================

function displayInterviews(data) {

    const tableBody =
        document.getElementById(
            "interviewTableBody"
        );


    if (!tableBody) {
        return;
    }


    tableBody.innerHTML = "";


    if (
        !data ||
        data.length === 0
    ) {

        tableBody.innerHTML = `

            <tr>

                <td
                    colspan="7"
                    style="
                        text-align:center;
                        padding:30px;
                    "
                >
                    No interviews found
                </td>

            </tr>

        `;

        return;
    }


    data.forEach(
        interview => {

            const row =
                document.createElement(
                    "tr"
                );


            let joinButton = "";


            // =========================================
            // JOIN BUTTON
            // Only Scheduled + Online
            // =========================================

            if (

                interview.interviewType ===
                    "Online"

                &&

                interview.meetingLink

                &&

                interview.status ===
                    "Scheduled"

            ) {

                joinButton = `

                    <button
                        type="button"
                        class="join-btn"
                        onclick="
                            joinMeeting(
                                '${interview._id}'
                            )
                        "
                    >
                        🔗 Join
                    </button>

                `;

            }


            // Convert stored 24-hour time
            // into AM / PM for display

            const displayTime =
                formatTime12Hour(
                    interview.interviewTime
                );


            row.innerHTML = `

                <td>

                    <strong>
                        ${escapeHTML(
                            interview.candidateName
                        )}
                    </strong>

                    <small>
                        ${escapeHTML(
                            interview.candidateEmail
                        )}
                    </small>

                </td>


                <td>

                    ${escapeHTML(
                        interview.interviewerName
                    )}

                </td>


                <td>

                    ${formatDate(
                        interview.interviewDate
                    )}

                </td>


                <td>

                    ${escapeHTML(
                        displayTime
                    )}

                </td>


                <td>

                    ${escapeHTML(
                        interview.interviewType
                    )}

                </td>


                <td>

                    <span
                        class="
                            status
                            ${getStatusClass(
                                interview.status
                            )}
                        "
                    >

                        ${escapeHTML(
                            interview.status
                        )}

                    </span>

                </td>


                <td class="action-buttons">


                    <button
                        type="button"
                        class="view-btn"
                        onclick="
                            viewInterview(
                                '${interview._id}'
                            )
                        "
                    >
                        👁 View
                    </button>


                    <button
                        type="button"
                        class="edit-btn"
                        onclick="
                            editInterview(
                                '${interview._id}'
                            )
                        "
                    >
                        ✏ Edit
                    </button>


                    ${joinButton}


                    <button
                        type="button"
                        class="delete-btn"
                        onclick="
                            deleteInterview(
                                '${interview._id}'
                            )
                        "
                    >
                        🗑 Delete
                    </button>

                </td>

            `;


            tableBody.appendChild(
                row
            );

        }
    );

}


// =====================================================
// OPEN SCHEDULE MODAL
// =====================================================

function openScheduleModal() {

    editingId = null;


    const form =
        document.getElementById(
            "interviewForm"
        );


    if (form) {
        form.reset();
    }


    document.getElementById(
        "interviewId"
    ).value = "";


    document.getElementById(
        "modalTitle"
    ).textContent =
        "Schedule Interview";


    document.getElementById(
        "modalSubtitle"
    ).textContent =
        "Add a new interview";


    document.getElementById(
        "submitBtn"
    ).textContent =
        "Schedule Interview";


    document.getElementById(
        "status"
    ).value =
        "Scheduled";


    document.getElementById(
        "interviewPeriod"
    ).value =
        "AM";


    document.getElementById(
        "scheduleModal"
    ).style.display =
        "flex";

}


// =====================================================
// CLOSE SCHEDULE MODAL
// =====================================================

function closeScheduleModal() {

    const modal =
        document.getElementById(
            "scheduleModal"
        );


    if (modal) {

        modal.style.display =
            "none";

    }


    editingId = null;


    const form =
        document.getElementById(
            "interviewForm"
        );


    if (form) {
        form.reset();
    }


    document.getElementById(
        "interviewId"
    ).value = "";

}


// =====================================================
// EDIT INTERVIEW
// =====================================================

async function editInterview(id) {

    try {

        const response =
            await fetch(
                `${API_URL}/${id}`
            );


        const result =
            await response.json();


        if (
            !response.ok ||
            !result.success
        ) {

            throw new Error(
                result.message ||
                "Unable to load interview"
            );

        }


        const interview =
            result.data;


        editingId =
            interview._id;


        document.getElementById(
            "interviewId"
        ).value =
            interview._id;


        document.getElementById(
            "candidateName"
        ).value =
            interview.candidateName ||
            "";


        document.getElementById(
            "candidateEmail"
        ).value =
            interview.candidateEmail ||
            "";


        document.getElementById(
            "interviewerName"
        ).value =
            interview.interviewerName ||
            "";


        document.getElementById(
            "interviewDate"
        ).value =
            formatDateForInput(
                interview.interviewDate
            );


        // =============================================
        // CONVERT 24 HOUR TIME TO 12 HOUR
        // =============================================

        const timeData =
            convertTo12Hour(
                interview.interviewTime
            );


        document.getElementById(
            "interviewTime"
        ).value =
            timeData.time;


        document.getElementById(
            "interviewPeriod"
        ).value =
            timeData.period;


        document.getElementById(
            "interviewType"
        ).value =
            interview.interviewType ||
            "Online";


        document.getElementById(
            "meetingLink"
        ).value =
            interview.meetingLink ||
            "";


        document.getElementById(
            "status"
        ).value =
            interview.status ||
            "Scheduled";


        document.getElementById(
            "modalTitle"
        ).textContent =
            "Edit Interview";


        document.getElementById(
            "modalSubtitle"
        ).textContent =
            "Update interview details";


        document.getElementById(
            "submitBtn"
        ).textContent =
            "Update Interview";


        document.getElementById(
            "scheduleModal"
        ).style.display =
            "flex";

    }

    catch (error) {

        console.error(
            "EDIT ERROR:",
            error
        );


        showToast(
            error.message ||
            "Unable to edit interview",
            "error"
        );

    }

}


// =====================================================
// FORM SUBMIT
// =====================================================

async function handleFormSubmit(
    event
) {

    event.preventDefault();


    const id =
        document.getElementById(
            "interviewId"
        ).value.trim();


    const submitBtn =
        document.getElementById(
            "submitBtn"
        );


    // ================================================
    // GET 12-HOUR TIME
    // ================================================

    const enteredTime =
        document.getElementById(
            "interviewTime"
        ).value.trim();


    const period =
        document.getElementById(
            "interviewPeriod"
        ).value;


    // ================================================
    // VALIDATE TIME
    // ================================================

    if (
        !validateTime(
            enteredTime
        )
    ) {

        showToast(
            "Please enter time like 02:30",
            "error"
        );

        return;
    }


    // ================================================
    // CONVERT 02:30 PM → 14:30
    // ================================================

    const time24 =
        convertTo24Hour(
            enteredTime,
            period
        );


    const data = {

        candidateName:
            document.getElementById(
                "candidateName"
            ).value.trim(),


        candidateEmail:
            document.getElementById(
                "candidateEmail"
            ).value.trim(),


        interviewerName:
            document.getElementById(
                "interviewerName"
            ).value.trim(),


        interviewDate:
            document.getElementById(
                "interviewDate"
            ).value,


        // Store 24-hour format
        // in MongoDB

        interviewTime:
            time24,


        interviewType:
            document.getElementById(
                "interviewType"
            ).value,


        meetingLink:
            document.getElementById(
                "meetingLink"
            ).value.trim(),


        status:
            document.getElementById(
                "status"
            ).value

    };


    try {

        submitBtn.disabled =
            true;


        // =============================================
        // UPDATE
        // =============================================

        if (id) {

            submitBtn.textContent =
                "Updating...";


            const response =
                await fetch(
                    `${API_URL}/${id}`,
                    {

                        method: "PUT",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify(
                                data
                            )

                    }
                );


            const result =
                await response.json();


            if (
                !response.ok ||
                !result.success
            ) {

                throw new Error(
                    result.message ||
                    "Update failed"
                );

            }


            closeScheduleModal();


            showToast(
                "Interview updated successfully!",
                "success"
            );


            await loadInterviews();

        }


        // =============================================
        // CREATE
        // =============================================

        else {

            submitBtn.textContent =
                "Scheduling...";


            const response =
                await fetch(
                    API_URL,
                    {

                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify(
                                data
                            )

                    }
                );


            const result =
                await response.json();


            if (
                !response.ok ||
                !result.success
            ) {

                throw new Error(
                    result.message ||
                    "Scheduling failed"
                );

            }


            closeScheduleModal();


            showToast(
                "Interview scheduled successfully!",
                "success"
            );


            await loadInterviews();

        }

    }

    catch (error) {

        console.error(
            "FORM ERROR:",
            error
        );


        showToast(
            error.message ||
            "Unable to save interview",
            "error"
        );

    }

    finally {

        submitBtn.disabled =
            false;


        submitBtn.textContent =
            id
                ? "Update Interview"
                : "Schedule Interview";

    }

}


// =====================================================
// VIEW INTERVIEW
// =====================================================

async function viewInterview(id) {

    try {

        const response =
            await fetch(
                `${API_URL}/${id}`
            );


        const result =
            await response.json();


        if (
            !response.ok ||
            !result.success
        ) {

            throw new Error(
                result.message ||
                "Unable to load interview"
            );

        }


        const interview =
            result.data;


        const content =
            document.getElementById(
                "viewDetailsContent"
            );


        const displayTime =
            formatTime12Hour(
                interview.interviewTime
            );


        let meetingSection = "";


        if (

            interview.interviewType ===
                "Online"

            &&

            interview.meetingLink

            &&

            interview.status ===
                "Scheduled"

        ) {

            meetingSection = `

                <div class="detail-card full">

                    <div class="detail-icon">
                        🔗
                    </div>

                    <div class="detail-info">

                        <span>
                            Meeting Link
                        </span>

                        <a
                            href="${escapeHTML(
                                interview.meetingLink
                            )}"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Join Interview
                        </a>

                    </div>

                </div>

            `;

        }

        else {

            let message =
                "Not available";


            if (
                interview.status ===
                "Completed"
            ) {

                message =
                    "Interview Completed";

            }


            if (
                interview.status ===
                "Cancelled"
            ) {

                message =
                    "Interview Cancelled";

            }


            if (
                interview.interviewType !==
                "Online"
            ) {

                message =
                    "Offline Interview";

            }


            meetingSection = `

                <div class="detail-card full">

                    <div class="detail-icon">
                        🔒
                    </div>

                    <div class="detail-info">

                        <span>
                            Meeting Link
                        </span>

                        <strong>
                            ${message}
                        </strong>

                    </div>

                </div>

            `;

        }


        content.innerHTML = `

            <div class="candidate-profile">

                <div class="candidate-avatar">

                    ${getInitials(
                        interview.candidateName
                    )}

                </div>


                <div>

                    <h3>
                        ${escapeHTML(
                            interview.candidateName
                        )}
                    </h3>

                    <p>
                        ${escapeHTML(
                            interview.candidateEmail
                        )}
                    </p>

                </div>

            </div>


            <div class="details-grid">


                <div class="detail-card">

                    <div class="detail-icon">
                        👨‍💼
                    </div>

                    <div class="detail-info">

                        <span>
                            Interviewer
                        </span>

                        <strong>
                            ${escapeHTML(
                                interview.interviewerName
                            )}
                        </strong>

                    </div>

                </div>


                <div class="detail-card">

                    <div class="detail-icon">
                        📅
                    </div>

                    <div class="detail-info">

                        <span>
                            Interview Date
                        </span>

                        <strong>
                            ${formatDate(
                                interview.interviewDate
                            )}
                        </strong>

                    </div>

                </div>


                <div class="detail-card">

                    <div class="detail-icon">
                        🕐
                    </div>

                    <div class="detail-info">

                        <span>
                            Interview Time
                        </span>

                        <strong>
                            ${displayTime}
                        </strong>

                    </div>

                </div>


                <div class="detail-card">

                    <div class="detail-icon">
                        💻
                    </div>

                    <div class="detail-info">

                        <span>
                            Interview Type
                        </span>

                        <strong>
                            ${escapeHTML(
                                interview.interviewType
                            )}
                        </strong>

                    </div>

                </div>


                <div class="detail-card">

                    <div class="detail-icon">
                        📌
                    </div>

                    <div class="detail-info">

                        <span>
                            Status
                        </span>

                        <span
                            class="
                                status
                                ${getStatusClass(
                                    interview.status
                                )}
                            "
                        >
                            ${escapeHTML(
                                interview.status
                            )}
                        </span>

                    </div>

                </div>


                ${meetingSection}


            </div>

        `;


        document.getElementById(
            "viewModal"
        ).style.display =
            "flex";

    }

    catch (error) {

        console.error(
            "VIEW ERROR:",
            error
        );


        showToast(
            error.message ||
            "Unable to view interview",
            "error"
        );

    }

}


// =====================================================
// CLOSE VIEW MODAL
// =====================================================

function closeViewModal() {

    const modal =
        document.getElementById(
            "viewModal"
        );


    if (modal) {

        modal.style.display =
            "none";

    }

}


// =====================================================
// JOIN MEETING
// =====================================================

async function joinMeeting(id) {

    try {

        const response =
            await fetch(
                `${API_URL}/${id}`
            );


        const result =
            await response.json();


        if (
            !response.ok ||
            !result.success
        ) {

            throw new Error(
                result.message ||
                "Unable to load interview"
            );

        }


        const interview =
            result.data;


        if (
            interview.status !==
            "Scheduled"
        ) {

            showToast(
                "This interview is no longer active.",
                "warning"
            );

            return;

        }


        if (
            interview.interviewType !==
            "Online"
        ) {

            showToast(
                "This is an offline interview.",
                "warning"
            );

            return;

        }


        if (
            !interview.meetingLink
        ) {

            showToast(
                "Meeting link is not available.",
                "warning"
            );

            return;

        }


        window.open(
            interview.meetingLink,
            "_blank"
        );

    }

    catch (error) {

        console.error(
            "JOIN ERROR:",
            error
        );


        showToast(
            error.message ||
            "Unable to join meeting",
            "error"
        );

    }

}


// =====================================================
// DELETE INTERVIEW
// =====================================================

async function deleteInterview(id) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this interview?"
        );


    if (!confirmed) {
        return;
    }


    try {

        const response =
            await fetch(
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
                result.message ||
                "Delete failed"
            );

        }


        showToast(
            "Interview deleted successfully!",
            "success"
        );


        await loadInterviews();

    }

    catch (error) {

        console.error(
            "DELETE ERROR:",
            error
        );


        showToast(
            error.message ||
            "Unable to delete interview",
            "error"
        );

    }

}


// =====================================================
// SEARCH
// =====================================================

function searchInterviews() {

    const input =
        document.getElementById(
            "searchInput"
        );


    if (!input) {
        return;
    }


    const text =
        input.value
            .toLowerCase()
            .trim();


    if (!text) {

        displayInterviews(
            interviews
        );

        return;

    }


    const filtered =
        interviews.filter(
            interview => {

                const candidate =
                    (
                        interview.candidateName ||
                        ""
                    ).toLowerCase();


                const email =
                    (
                        interview.candidateEmail ||
                        ""
                    ).toLowerCase();


                const interviewer =
                    (
                        interview.interviewerName ||
                        ""
                    ).toLowerCase();


                const type =
                    (
                        interview.interviewType ||
                        ""
                    ).toLowerCase();


                const status =
                    (
                        interview.status ||
                        ""
                    ).toLowerCase();


                return (

                    candidate.includes(
                        text
                    )

                    ||

                    email.includes(
                        text
                    )

                    ||

                    interviewer.includes(
                        text
                    )

                    ||

                    type.includes(
                        text
                    )

                    ||

                    status.includes(
                        text
                    )

                );

            }
        );


    displayInterviews(
        filtered
    );

}


// =====================================================
// UPDATE STATS
// =====================================================

function updateStats() {

    const total =
        interviews.length;


    const scheduled =
        interviews.filter(
            item =>
                item.status ===
                "Scheduled"
        ).length;


    const completed =
        interviews.filter(
            item =>
                item.status ===
                "Completed"
        ).length;


    const cancelled =
        interviews.filter(
            item =>
                item.status ===
                "Cancelled"
        ).length;


    const totalElement =
        document.getElementById(
            "totalInterviews"
        );


    const scheduledElement =
        document.getElementById(
            "scheduledInterviews"
        );


    const completedElement =
        document.getElementById(
            "completedInterviews"
        );


    const cancelledElement =
        document.getElementById(
            "cancelledInterviews"
        );


    if (totalElement) {

        totalElement.textContent =
            total;

    }


    if (scheduledElement) {

        scheduledElement.textContent =
            scheduled;

    }


    if (completedElement) {

        completedElement.textContent =
            completed;

    }


    if (cancelledElement) {

        cancelledElement.textContent =
            cancelled;

    }

}


// =====================================================
// 30 MINUTE REMINDER
// =====================================================

function startReminderChecker() {

    checkInterviewReminders();


    reminderTimer =
        setInterval(
            checkInterviewReminders,
            30000
        );

}


// =====================================================
// CHECK REMINDERS
// =====================================================

function checkInterviewReminders() {

    if (
        !interviews ||
        interviews.length === 0
    ) {

        return;

    }


    const now =
        new Date();


    interviews.forEach(
        interview => {

            if (
                interview.status !==
                "Scheduled"
            ) {

                return;

            }


            if (
                !interview.interviewDate ||
                !interview.interviewTime
            ) {

                return;

            }


            const interviewDateTime =
                createInterviewDateTime(
                    interview.interviewDate,
                    interview.interviewTime
                );


            if (!interviewDateTime) {
                return;
            }


            const difference =
                interviewDateTime.getTime() -
                now.getTime();


            const minutes =
                difference / 60000;


            if (
                minutes > 0 &&
                minutes <= 30
            ) {

                const reminderKey =
                    `reminder_${interview._id}`;


                if (
                    localStorage.getItem(
                        reminderKey
                    ) === "shown"
                ) {

                    return;

                }


                localStorage.setItem(
                    reminderKey,
                    "shown"
                );


                showInterviewReminder(
                    interview,
                    Math.ceil(minutes)
                );

            }

        }
    );

}


// =====================================================
// CREATE DATE + TIME
// =====================================================

function createInterviewDateTime(
    dateString,
    timeString
) {

    try {

        const date =
            new Date(
                dateString
            );


        if (
            isNaN(
                date.getTime()
            )
        ) {

            return null;

        }


        const parts =
            timeString.split(":");


        const hours =
            parseInt(
                parts[0],
                10
            );


        const minutes =
            parseInt(
                parts[1],
                10
            );


        if (
            isNaN(hours) ||
            isNaN(minutes)
        ) {

            return null;

        }


        date.setHours(
            hours,
            minutes,
            0,
            0
        );


        return date;

    }

    catch (error) {

        console.error(
            "DATE TIME ERROR:",
            error
        );


        return null;

    }

}


// =====================================================
// SHOW REMINDER
// =====================================================

function showInterviewReminder(
    interview,
    minutes
) {

    const message =
        `Interview with ${interview.interviewerName} starts in ${minutes} minute${minutes === 1 ? "" : "s"}.`;


    showToast(
        `🔔 ${message}`,
        "warning"
    );


    showBrowserNotification(
        "Interview Reminder",
        message
    );


    playReminderSound();

}


// =====================================================
// BROWSER NOTIFICATION
// =====================================================

function showBrowserNotification(
    title,
    message
) {

    if (
        !("Notification" in window)
    ) {

        return;

    }


    if (
        Notification.permission ===
        "granted"
    ) {

        new Notification(
            title,
            {
                body: message
            }
        );

    }

}


// =====================================================
// REQUEST NOTIFICATION PERMISSION
// =====================================================

function requestNotificationPermission() {

    if (
        !("Notification" in window)
    ) {

        return;

    }


    if (
        Notification.permission ===
        "default"
    ) {

        Notification.requestPermission()
            .then(
                permission => {

                    console.log(
                        "Notification permission:",
                        permission
                    );

                }
            )
            .catch(
                error => {

                    console.error(
                        "Notification error:",
                        error
                    );

                }
            );

    }

}


// =====================================================
// REMINDER SOUND
// =====================================================

function playReminderSound() {

    try {

        const AudioContext =
            window.AudioContext ||
            window.webkitAudioContext;


        if (!AudioContext) {
            return;
        }


        const audioContext =
            new AudioContext();


        const oscillator =
            audioContext.createOscillator();


        const gain =
            audioContext.createGain();


        oscillator.type =
            "sine";


        oscillator.frequency.value =
            800;


        gain.gain.value =
            0.08;


        oscillator.connect(
            gain
        );


        gain.connect(
            audioContext.destination
        );


        oscillator.start();


        setTimeout(
            () => {

                oscillator.stop();

                audioContext.close();

            },
            300
        );

    }

    catch (error) {

        console.log(
            "Reminder sound unavailable"
        );

    }

}


// =====================================================
// FORMAT DATE
// =====================================================

function formatDate(
    dateString
) {

    if (!dateString) {
        return "";
    }


    const date =
        new Date(
            dateString
        );


    if (
        isNaN(
            date.getTime()
        )
    ) {

        return dateString;

    }


    return date.toLocaleDateString(
        "en-GB",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}


// =====================================================
// FORMAT DATE FOR INPUT
// =====================================================

function formatDateForInput(
    dateString
) {

    if (!dateString) {
        return "";
    }


    const date =
        new Date(
            dateString
        );


    if (
        isNaN(
            date.getTime()
        )
    ) {

        return "";

    }


    const year =
        date.getFullYear();


    const month =
        String(
            date.getMonth() + 1
        ).padStart(
            2,
            "0"
        );


    const day =
        String(
            date.getDate()
        ).padStart(
            2,
            "0"
        );


    return `${year}-${month}-${day}`;

}


// =====================================================
// FORMAT 24 HOUR → 12 HOUR
// =====================================================

function convertTo12Hour(
    time24
) {

    if (!time24) {

        return {
            time: "",
            period: "AM"
        };

    }


    const parts =
        time24.split(":");


    let hours =
        parseInt(
            parts[0],
            10
        );


    const minutes =
        parts[1] || "00";


    if (
        isNaN(hours)
    ) {

        return {
            time: "",
            period: "AM"
        };

    }


    const period =
        hours >= 12
            ? "PM"
            : "AM";


    if (hours === 0) {

        hours = 12;

    }

    else if (
        hours > 12
    ) {

        hours -= 12;

    }


    return {

        time:
            `${String(hours).padStart(2, "0")}:${minutes}`,

        period:
            period

    };

}


// =====================================================
// FORMAT 24 HOUR TIME FOR DISPLAY
// =====================================================

function formatTime12Hour(
    time24
) {

    const result =
        convertTo12Hour(
            time24
        );


    if (!result.time) {
        return "";
    }


    return `${result.time} ${result.period}`;

}


// =====================================================
// CONVERT 12 HOUR → 24 HOUR
// =====================================================

function convertTo24Hour(
    time12,
    period
) {

    const parts =
        time12.split(":");


    let hours =
        parseInt(
            parts[0],
            10
        );


    const minutes =
        parts[1];


    if (
        period === "AM"
    ) {

        if (
            hours === 12
        ) {

            hours = 0;

        }

    }

    else {

        if (
            hours !== 12
        ) {

            hours += 12;

        }

    }


    return `${String(hours).padStart(2, "0")}:${minutes}`;

}


// =====================================================
// VALIDATE TIME
// =====================================================

function validateTime(
    time
) {

    const regex =
        /^(0[1-9]|1[0-2]):[0-5][0-9]$/;


    return regex.test(
        time
    );

}


// =====================================================
// STATUS CLASS
// =====================================================

function getStatusClass(
    status
) {

    if (
        status ===
        "Completed"
    ) {

        return "completed";

    }


    if (
        status ===
        "Cancelled"
    ) {

        return "cancelled";

    }


    return "scheduled";

}


// =====================================================
// GET INITIALS
// =====================================================

function getInitials(
    name
) {

    if (!name) {
        return "U";
    }


    const words =
        name
            .trim()
            .split(
                /\s+/
            );


    if (
        words.length === 1
    ) {

        return words[0]
            .substring(
                0,
                2
            )
            .toUpperCase();

    }


    return (

        words[0][0] +

        words[
            words.length - 1
        ][0]

    ).toUpperCase();

}


// =====================================================
// ESCAPE HTML
// =====================================================

function escapeHTML(
    value
) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


// =====================================================
// CLOSE MODALS OUTSIDE CLICK
// =====================================================

window.addEventListener(
    "click",
    event => {

        const scheduleModal =
            document.getElementById(
                "scheduleModal"
            );


        const viewModal =
            document.getElementById(
                "viewModal"
            );


        if (

            scheduleModal &&

            event.target ===
                scheduleModal

        ) {

            closeScheduleModal();

        }


        if (

            viewModal &&

            event.target ===
                viewModal

        ) {

            closeViewModal();

        }

    }
);


// =====================================================
// ESC KEY
// =====================================================

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key !==
            "Escape"
        ) {

            return;

        }


        const scheduleModal =
            document.getElementById(
                "scheduleModal"
            );


        const viewModal =
            document.getElementById(
                "viewModal"
            );


        if (

            scheduleModal &&

            scheduleModal.style.display ===
                "flex"

        ) {

            closeScheduleModal();

        }


        if (

            viewModal &&

            viewModal.style.display ===
                "flex"

        ) {

            closeViewModal();

        }

    }
);


// =====================================================
// TOAST
// =====================================================

function showToast(
    message,
    type = "success"
) {

    const container =
        document.getElementById(
            "toastContainer"
        );


    if (!container) {

        console.log(
            `[${type}] ${message}`
        );

        return;

    }


    const toast =
        document.createElement(
            "div"
        );


    toast.className =
        `toast ${type}`;


    let icon =
        "✅";


    if (
        type === "error"
    ) {

        icon =
            "❌";

    }


    if (
        type === "warning"
    ) {

        icon =
            "⚠️";

    }


    toast.innerHTML = `

        <span class="toast-icon">
            ${icon}
        </span>

        <span class="toast-message">
            ${escapeHTML(
                message
            )}
        </span>

    `;


    container.appendChild(
        toast
    );


    setTimeout(
        () => {

            toast.classList.add(
                "hide"
            );


            setTimeout(
                () => {

                    toast.remove();

                },
                300
            );

        },
        4000
    );

}


// =====================================================
// NOTIFICATION PERMISSION
// =====================================================

document.addEventListener(
    "click",
    () => {

        requestNotificationPermission();

    },
    {
        once: true
    }
);


// =====================================================
// TIME INPUT AUTO FORMAT
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const timeInput =
            document.getElementById(
                "interviewTime"
            );


        if (!timeInput) {
            return;
        }


        timeInput.addEventListener(
            "input",
            () => {

                let value =
                    timeInput.value
                        .replace(
                            /[^0-9]/g,
                            ""
                        );


                if (
                    value.length > 4
                ) {

                    value =
                        value.substring(
                            0,
                            4
                        );

                }


                if (
                    value.length >= 3
                ) {

                    value =
                        value.substring(
                            0,
                            2
                        ) +
                        ":" +
                        value.substring(
                            2
                        );

                }


                timeInput.value =
                    value;

            }
        );

    }
);