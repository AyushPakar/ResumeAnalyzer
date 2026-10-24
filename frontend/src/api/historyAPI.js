import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export function toApiError(error) {
  const data = error.response?.data;

  const message =
    typeof data === "object" && data?.message
      ? data.message
      : !error.response
        ? "Can't reach the server. Check that the backend is running."
        : `Request failed (${error.response.status}).`;

  const err = new Error(message);
  err.retryable = Boolean(data?.retryable);
  return err;
}

// GET /api/history  ->  lightweight list for the History table
export async function listHistory() {
  try {
    const res = await axios.get(`${API_URL}/api/history`);
    return res.data.resumes;
  } catch (error) {
    throw toApiError(error);
  }
}

// POST /api/history/:id/retry  ->  re-run the analysis on the stored file
export async function retryResume(resumeId) {
  try {
    await axios.post(`${API_URL}/api/history/${resumeId}/retry`);
  } catch (error) {
    throw toApiError(error);
  }
}

// DELETE /api/history/:id  ->  removes the file, analysis and job matches
export async function deleteResume(resumeId) {
  try {
    await axios.delete(`${API_URL}/api/history/${resumeId}`);
  } catch (error) {
    throw toApiError(error);
  }
}
