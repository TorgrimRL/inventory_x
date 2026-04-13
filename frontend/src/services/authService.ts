import axios from "./apiClient";

export type CurrentUser = {
  username: string;
  email: string;
  picture?: string | null;
};

export const checkSession = async () => {
  try {
    await axios.get("/api/user/verify/");
    return true; // Session is valid
  } catch {
    return false; // Session is invalid
  }
};

export const getCurrentUser = async (): Promise<CurrentUser> => {
  const response = await axios.get("/api/user/verify/");
  return response.data;
};
export const startSocialLogin = (provider: "google") => {
  if (provider !== "google") {
    throw new Error(`Unsupported social login provider: ${provider}`);
  }

  window.location.assign("/api/user/auth0/start/");
};
