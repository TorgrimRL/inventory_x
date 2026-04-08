import axios from "./apiClient";

export const checkSession = async () => {
  try {
    await axios.get("/api/user/verify/");
    return true; // Session is valid
  } catch {
    return false; // Session is invalid
  }
};

export const startSocialLogin = async (provider: "google") => {
  throw new Error(`startSocialLogin not implemented for provider: ${provider}`);
};
