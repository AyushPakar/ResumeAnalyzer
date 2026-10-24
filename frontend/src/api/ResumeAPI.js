// import axios from "axios";

// const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// // Compares an already-uploaded resume with a pasted job description.
// // Resolves with the match result, or throws an Error (with .retryable).
// export async function matchJob(resumeId, jobDescription) {
//   try {
//     const res = await axios.post(
//       `${API_URL}/api/${resumeId}/match`,
//       { jobDescription },
//       {
//         headers: {
//           "Content-Type": "application/json",
//         },
//       },
//     );

//     return res.data.result;
//   } catch (error) {
//     const data = error.response?.data;
//     const message =
//       typeof data === "object" && data?.message
//         ? data.message
//         : !error.response
//           ? "Can't reach the server. Check that the backend is running."
//           : `Request failed (${error.response.status}).`;

//     const err = new Error(message);
//     err.retryable = Boolean(data?.retryable);
//     throw err;
//   }
// }

import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Turns any axios failure into a readable Error. A response without a JSON
// "message" (like Express's 404 page) gets a clear fallback instead of a
// vague one.
function toApiError(error) {
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

// GET /api/resume/:id  ->  the saved resume document (includes .status and .analysis)
export async function getResume(resumeId) {
  try {
    const res = await axios.get(`${API_URL}/api/${resumeId}`);
    return res.data.resume;
  } catch (error) {
    throw toApiError(error);
  }
}

// POST /api/resume/:id/match  ->  job description match result
export async function matchJob(resumeId, jobDescription) {
  try {
    const res = await axios.post(`${API_URL}/api/${resumeId}/match`, {
      jobDescription,
    });
    return res.data.result;
  } catch (error) {
    throw toApiError(error);
  }
}
