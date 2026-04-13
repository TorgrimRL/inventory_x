import axios from "./apiClient";

export const checkSession = async () => {
  try {
    await axios.get("/api/user/verify/");
    return true; // Session is valid
  } catch {
    return false; // Session is invalid
  }
};

export const startSocialLogin = (provider: "google") => {
  if (provider !== "google") {
    throw new Error(`Unsupported social login provider: ${provider}`);
  }

  window.location.assign("/api/user/auth0/start/");
};
