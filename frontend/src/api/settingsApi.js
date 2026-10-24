import axios from "axios";
import { toApiError } from "./historyAPI";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// GET /api/settings/profile
export async function getProfile() {
  try {
    const res = await axios.get(`${API_URL}/api/settings/profile`);
    return res.data.profile;
  } catch (error) {
    throw toApiError(error);
  }
}

// PATCH /api/settings/profile  ->  the saved profile
export async function updateProfile({
  name,
  email,
  targetRole,
  experienceLevel,
}) {
  try {
    const res = await axios.patch(`${API_URL}/api/settings/profile`, {
      name,
      email,
      targetRole,
      experienceLevel,
    });
    return res.data.profile;
  } catch (error) {
    throw toApiError(error);
  }
}

// DELETE /api/settings/account  (needs the password; a body on DELETE goes in `data`)
export async function deleteAccount(password) {
  try {
    await axios.delete(`${API_URL}/api/settings/account`, {
      data: { password },
    });
  } catch (error) {
    throw toApiError(error);
  }
}

export async function logout() {
  try {
    const response = await axios.post(`${API_URL}/api/settings/logout`);

    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Logout request failed");
  }
}
