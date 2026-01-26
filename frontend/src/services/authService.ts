import axios from "axios";

export const checkSession = async () => {
  try {
    const res = await axios.get("/api/user/verify/");
    console.log("Sent Headers:", res.config.headers);
    return true; // Session is valid
  } catch (err: any) {
    console.error("Session check failed:", err.message);
    return false; // Session is invalid
  }
};
