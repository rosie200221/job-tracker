import { useState } from "react";
import { useNavigate } from "react-router";
import type { ApplicationStatus } from "../types/application";
import { APPLICATION_STATUSES } from "../types/application";

function NewApplicationPage() {
  const navigate = useNavigate();

  const [companyName, setCompanyName] = useState("");
  const [roleTitle, setRoleTitle] = useState("");
  const [location, setLocation] = useState("");
  const [status, setStatus] = useState<ApplicationStatus>("APPLIED");
  const [appliedDate, setAppliedDate] = useState("");
  const [notes, setNotes] = useState("");
  const [jobDescription, setJobDescription] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [extracting, setExtracting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!companyName || !roleTitle) {
      setError("Company name and role title are required");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const response = await fetch("http://localhost:4000/api/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          companyName,
          roleTitle,
          location: location || null,
          status,
          appliedDate: appliedDate || null,
          notes: notes || null,
        }),
      });

      if (!response.ok) {
        throw new Error("failed to save application");
      }

      navigate("/applications");
    } catch (err) {
      console.error(err);
      setError("could not save application");
    } finally {
      setSaving(false);
    }
  }

  async function handleExtractDetails() {
    if (!jobDescription.trim()) {
      setError("Paste a job description first");
      return;
    }

    try {
      setExtracting(true);
      setError("");

      const response = await fetch(
        "http://localhost:4000/api/applications/extract",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: jobDescription,
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to extract");
      }

      const data: { notes: string } = await response.json();

      if (!data.notes) {
        setError("Could not use extract useful sections");
        return;
      }

      setNotes(data.notes);
    } catch (error) {
      console.error(error);
      setError("Coult not extract job details");
    } finally {
      setExtracting(false);
    }
  }

  return (
    <div>
      <h2 style={{ marginBottom: "8px" }}> Add New Application</h2>
      <p style={{ color: "#666", marginBottom: "24px" }}>
        Fill the application manually or paste a job description for extraction
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "24px",
          backgroundColor: "white",
          border: "1px solid #e5e7eb",
          borderRadius: "16px",
          overflow: "hidden",
        }}
      >
        <form onSubmit={handleSubmit} style={{ padding: "32px" }}>
          <h3 style={{ marginTop: 0, marginBottom: "24px" }}>
            Application Details
          </h3>

          <div style={{ display: "grid", gap: "18px" }}>
            <label>
              Company Name
              <input
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. SAP"
                style={inputStyle}
              />
            </label>

            <label>
              Role Title
              <input
                value={roleTitle}
                onChange={(e) => setRoleTitle(e.target.value)}
                style={inputStyle}
              />
            </label>

            <label>
              Location
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                style={inputStyle}
              />
            </label>

            <label>
              Status
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ApplicationStatus)}
                style={inputStyle}
              >
                {APPLICATION_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Applied Date
              <input
                type="date"
                value={appliedDate}
                onChange={(e) => setAppliedDate(e.target.value)}
                style={inputStyle}
              />
            </label>

            <label>
              notes
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add additional notes here"
                rows={20}
                style={textAreaStyle}
              />
            </label>

            <button
              type="submit"
              disabled={saving}
              style={{
                marginTop: "8px",
                border: "none",
                backgroundColor: "#11182",
                color: "white",
                padding: "12px 16px",
                borderRadius: "10px",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              {saving ? "Saving..." : "Save Application"}
            </button>
          </div>
        </form>

        {/* RIGHT SIDE: JOB DESCRIPTION */}

        <div
          style={{
            padding: "32px",
            background: "linear-gradient(135deg, #4338ca, #6d28d9)",
            color: "white",
          }}
        >
          <h3 style={{ marginTop: 0, marginBottom: "12px" }}>
            Job Description
          </h3>

          <p style={{ opacity: 0.85, marginBottom: "20px" }}>
            Paste Job description here, extracting...
          </p>

          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste job description here"
            rows={18}
            style={{
              width: "100%",
              minHeight: "420px",
              border: "1px solid rgba(255,255,255,0.35)",
              borderRadius: "12px",
              padding: "14px",
              resize: "vertical",
              backgroundColor: "rgba(255,255,255,0.12)",
              color: "white",
              outline: "none",
            }}
          />

          <button
            type="button"
            onClick={handleExtractDetails}
            disabled={extracting}
            style={{
              marginTop: "16px",
              border: "none",
              backgroundColor: "white",
              color: "#4338ca",
              padding: "12px 16px",
              borderRadius: "10px",
              cursor: extracting ? "not-allowed" : "pointer",
              fontWeight: 700,
              opacity: extracting ? 0.7 : 1,
            }}
          >
            {extracting ? "Extracting..." : "Extract Details"}
          </button>
        </div>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  marginTop: "6px",
  padding: "10px 12px",
  border: "1px solid #d1d5db",
  borderRadius: "8px",
  fontSize: "14px",
};

const textAreaStyle: React.CSSProperties = {
  ...inputStyle,
  resize: "vertical",
  fontFamily: "inherit",
};

export default NewApplicationPage;
