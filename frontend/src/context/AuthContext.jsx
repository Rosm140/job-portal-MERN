import { createContext, useContext, useEffect, useReducer, useCallback } from "react";
import { authAPI } from "../api/authAPI";
import toast from "react-hot-toast";

const AuthContext = createContext(null);

const initialState = {
  user:          JSON.parse(localStorage.getItem("user")) || null,
  token:         localStorage.getItem("token") || null,
  isLoading:     false,
  isInitialized: false,
};

const authReducer = (state, action) => {
  switch (action.type) {
    case "SET_LOADING":    return { ...state, isLoading: action.payload };
    case "LOGIN_SUCCESS":  return { ...state, user: action.payload.user, token: action.payload.token, isLoading: false };
    case "LOGOUT":         return { ...state, user: null, token: null, isLoading: false };
    case "UPDATE_USER":    return { ...state, user: { ...state.user, ...action.payload } };
    case "INITIALIZED":    return { ...state, isInitialized: true };
    default:               return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Verify token on app load
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const res = await authAPI.getMe();
          dispatch({ type: "LOGIN_SUCCESS", payload: { user: res.data.user, token } });
          localStorage.setItem("user", JSON.stringify(res.data.user));
        } catch {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          dispatch({ type: "LOGOUT" });
        }
      }
      dispatch({ type: "INITIALIZED" });
    };
    initAuth();
  }, []);

  const login = useCallback(async (email, password) => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const res = await authAPI.login({ email, password });
      const { token, user } = res.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      dispatch({ type: "LOGIN_SUCCESS", payload: { user, token } });
      toast.success(`Welcome back, ${user.fullName.split(" ")[0]}! 👋`);
      return { success: true, user };
    } catch (error) {
      const msg = error.response?.data?.message || "Login failed.";
      toast.error(msg);
      dispatch({ type: "SET_LOADING", payload: false });
      return { success: false, message: msg };
    }
  }, []);

  const register = useCallback(async (userData) => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const res = await authAPI.register(userData);
      const { token, user } = res.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      dispatch({ type: "LOGIN_SUCCESS", payload: { user, token } });
      toast.success("Account created successfully! 🎉");
      return { success: true, user };
    } catch (error) {
      const msg = error.response?.data?.message || "Registration failed.";
      toast.error(msg);
      dispatch({ type: "SET_LOADING", payload: false });
      return { success: false, message: msg };
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    dispatch({ type: "LOGOUT" });
    toast.success("Logged out successfully.");
  }, []);

  const updateUser = useCallback((userData) => {
    const updated = { ...state.user, ...userData };
    localStorage.setItem("user", JSON.stringify(updated));
    dispatch({ type: "UPDATE_USER", payload: userData });
  }, [state.user]);

  return (
    <AuthContext.Provider value={{
      ...state,
      isAuthenticated: !!state.token,
      isAdmin:         state.user?.role === "admin",
      isStudent:       state.user?.role === "student",
      login, register, logout, updateUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
