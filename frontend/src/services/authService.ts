import axios from "axios";

export const checkSession = async () => {
  try {
    await axios.get("/api/user/verify/");
    return true; // Session is valid
  } catch {
    return false; // Session is invalid
  }
};
