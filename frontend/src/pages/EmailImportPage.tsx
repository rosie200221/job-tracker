import { useState } from "react";
import type { InterviewDetails } from "../types/interview";

function EmailImportPage() {
  const [emailText, setEmailText] = useState("");
  const [extracting, setExtracting] = useState(false);
  const [error, setError] = useState("");
  const [interviewDetails, setInterviewDetails] =
    useState<InterviewDetails | null>(null);

  async function handleExtractInterview() {
    if (!emailText.trim()) {
      setError("Paste an email first");
      return;
    }

    try {
      setExtracting(true);
      setError("");

      const response = await fetch(
        "http://localhost:4000/api/applications/extract-interview",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({ text: emailText }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to extract interview details");
      }

      const data: InterviewDetails = await response.json();
      setInterviewDetails(data);
    } catch (error) {
      console.error(error);
      setError("Could not extract Interview Details");
    } finally {
      setExtracting(false);
    }
  }

  async function handleDownloadCalendar() {
    if (!interviewDetails) return;

    const response = await fetch(
      "http://localhost:4000/api/applications/calendar-event",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: interviewDetails.interviewTitle || "Interview",
          date: interviewDetails.interviewDate,
          time: interviewDetails.interviewTime,
          durationMinutes: 30,
          location: interviewDetails.meetingLink ? "Online" : "",
          meetingLink: interviewDetails.meetingLink,
          notes: interviewDetails.notes,
        }),
      },
    );

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "interview.ics";
    link.click();

    window.URL.revokeObjectURL(url);
  }

  return (
    <div>
      <h2 style={{ marginBottom: "8px" }}> Email Import</h2>
      <p style={{ color: "#666", marginBottom: "24px" }}>
        Paste an interview email, extract the details and generate a calendar
        file
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "24px",
        }}
      >
        <div
          style={{
            backgroundColor: "white",
            border: "1px solid #e5e7eb",
            borderRadius: "16px",
            padding: "24px",
          }}
        >
          <h3 style={{ marginTop: 0 }}> Paste Email</h3>

          <textarea
            value={emailText}
            onChange={(e) => setEmailText(e.target.value)}
            rows={18}
            style={{
              width: "100%",
              padding: "14px",
              border: "1px solid #d1d5db",
              borderRadius: "12px",
              resize: "vertical",
              fontFamily: "inherit",
            }}
          />

          {error && (
            <p style={{ color: "#991b1b", marginTop: "12px" }}> {error} </p>
          )}

          <button
            type="button"
            onClick={handleExtractInterview}
            disabled={extracting}
            style={{
              marginTop: "16px",
              border: "none",
              backgroundColor: extracting ? "#6b7280" : "#111827",
              color: "white",
              padding: "12px 16px",
              borderRadius: "10px",
              cursor: extracting ? "not-allowed" : "pointer",
              fontWeight: 600,
            }}
          >
            {extracting ? "Extracting..." : "Extract Interview Details"}
          </button>
        </div>

        <div
          style={{
            backgroundColor: "white",
            border: "1px solid #e5e7eb",
            borderRadius: "16px",
            padding: "24px",
          }}
        >
          <h3 style={{ marginTop: 0 }}>Extracted Details</h3>

          {!interviewDetails ? (
            <p style={{ color: "#666" }}>Extracted details here</p>
          ) : (
            <div style={{ display: "grid", gap: "12px" }}>
              <p>
                <strong>Status</strong> {interviewDetails.status || "-"}
              </p>
              <p>
                <strong> Title</strong>
                {""}
                {interviewDetails.interviewTitle || "-"}
              </p>

              <p>
                <strong> Date: </strong>
                {""}
                {interviewDetails.interviewDate || "-"}
              </p>

              <p>
                <strong> Time: </strong>
                {""}
                {interviewDetails.interviewTime || "-"}
              </p>

              <p>
                <strong>Meeting Link:</strong>
                {""}
                {interviewDetails.meetingLink || "-"}
              </p>

              <div>
                <pre
                  style={{
                    whiteSpace: "pre-wrap",
                    backgroundColor: "#f9fafb",
                    border: "1px solid #e5e7eb",
                    borderRadius: "10px",
                    padding: "12px",
                    fontFamily: "inherit",
                  }}
                >
                  {interviewDetails.notes || "-"}
                </pre>
              </div>

              <button
                type="button"
                onClick={handleDownloadCalendar}
                disabled={
                  !interviewDetails.interviewDate ||
                  !interviewDetails.interviewTime
                }
                style={{
                  marginTop: "8px",
                  border: "none",
                  backgroundColor:
                    !interviewDetails.interviewDate ||
                    !interviewDetails.interviewTime
                      ? "#9ca3af"
                      : "#4338ca",
                  color: "white",
                  padding: "12px 16px",
                  borderRadius: "10px",
                  cursor:
                    !interviewDetails.interviewDate ||
                    !interviewDetails.interviewTime
                      ? "not-allowed"
                      : "pointer",
                  fontWeight: 600,
                }}
              >
                Download Calendar File
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default EmailImportPage;
