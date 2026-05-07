import { createContext, useContext, useEffect, useReducer, useCallback } from "react";
import { authAPI } from "@/api/authAPI";
import toast from "react-hot-toast";
const AuthContext = createContext(null);
const init = { user: JSON.parse(localStorage.getItem("user")) || null, token: localStorage.getItem("token") || null, isLoading: false, isInitialized: false };
const reducer = (s, a) => { switch(a.type){ case "SET_LOADING": return {...s, isLoading: a.payload}; case "LOGIN_SUCCESS": return {...s, user: a.payload.user, token: a.payload.token, isLoading: false}; case "LOGOUT": return {...s, user: null, token: null, isLoading: false}; case "UPDATE_USER": return {...s, user: {...s.user, ...a.payload}}; case "INITIALIZED": return {...s, isInitialized: true}; default: return s; } };
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, init);
  useEffect(() => { const init = async () => { const t = localStorage.getItem("token"); if(t){ try { const r = await authAPI.getMe(); dispatch({type:"LOGIN_SUCCESS",payload:{user:r.data.user,token:t}}); localStorage.setItem("user",JSON.stringify(r.data.user)); } catch { localStorage.removeItem("token"); localStorage.removeItem("user"); dispatch({type:"LOGOUT"}); } } dispatch({type:"INITIALIZED"}); }; init(); }, []);
  const login = useCallback(async (email, password) => { dispatch({type:"SET_LOADING",payload:true}); try { const r = await authAPI.login({email,password}); const {token,user}=r.data; localStorage.setItem("token",token); localStorage.setItem("user",JSON.stringify(user)); dispatch({type:"LOGIN_SUCCESS",payload:{user,token}}); toast.success(`Welcome back, ${user.fullName.split(" ")[0]}!`); return {success:true,user}; } catch(e){ const m=e.response?.data?.message||"Login failed."; toast.error(m); dispatch({type:"SET_LOADING",payload:false}); return {success:false,message:m}; } }, []);
  const register = useCallback(async (data) => { dispatch({type:"SET_LOADING",payload:true}); try { const r = await authAPI.register(data); const {token,user}=r.data; localStorage.setItem("token",token); localStorage.setItem("user",JSON.stringify(user)); dispatch({type:"LOGIN_SUCCESS",payload:{user,token}}); toast.success("Account created!"); return {success:true,user}; } catch(e){ const m=e.response?.data?.message||"Registration failed."; toast.error(m); dispatch({type:"SET_LOADING",payload:false}); return {success:false,message:m}; } }, []);
  const logout = useCallback(() => { localStorage.removeItem("token"); localStorage.removeItem("user"); dispatch({type:"LOGOUT"}); toast.success("Logged out."); }, []);
  const updateUser = useCallback((d) => { const u={...state.user,...d}; localStorage.setItem("user",JSON.stringify(u)); dispatch({type:"UPDATE_USER",payload:d}); }, [state.user]);
  return <AuthContext.Provider value={{...state, isAuthenticated:!!state.token, isAdmin:state.user?.role==="admin", isStudent:state.user?.role==="student", login, register, logout, updateUser}}>{children}</AuthContext.Provider>;
};
export const useAuth = () => { const c = useContext(AuthContext); if(!c) throw new Error("useAuth must be used within AuthProvider"); return c; };
