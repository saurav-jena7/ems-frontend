export interface AuthUser {
  id: string;
  name: string;
  phone: string;
  email: string;
}

export const saveAuth = (token: string, user: AuthUser) => {
  localStorage.setItem("ems_token", token);
  localStorage.setItem("ems_user", JSON.stringify(user));
};

export const getToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("ems_token");
};

export const getUser = (): AuthUser | null => {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("ems_user");
  return raw ? JSON.parse(raw) : null;
};

export const clearAuth = () => {
  localStorage.removeItem("ems_token");
  localStorage.removeItem("ems_user");
};

export const isAuthenticated = (): boolean => !!getToken();
