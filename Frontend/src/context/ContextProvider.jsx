import { createContext, useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  GoogleAuthProvider,
  deleteUser,
  signInWithPopup,
} from "firebase/auth";
import { auth } from "../Firebase/firebase";
import AxiosPublic from "../context/AxiosPublic.jsx";
import { 
  clearAllTokens, 
  setAdminToken, 
  setUserToken, 
  getAdminToken,
  hasAdminToken,
  setUserData,
  getUserData 
} from "../utils/tokenManager.js";

export const AuthProvider = createContext(null);

const ContextProvider = ({ children }) => {
  const [publicAxios] = AxiosPublic();
  const [user, setUser] = useState(null);
  const [loader, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const googleProvider = new GoogleAuthProvider();

  // Firebase Auth Methods
  const createUser = (email, password) => {
    setLoading(true);
    return createUserWithEmailAndPassword(auth, email, password);
  };

  const signIn = (email, password) => {
    setLoading(true);
    return signInWithEmailAndPassword(auth, email, password);
  };

  const GmailLogin = () => {
    setLoading(true);
    return signInWithPopup(auth, googleProvider);
  };

  const updateUserProfile = (name, phone) => {
    return updateProfile(auth.currentUser, {
      displayName: name,
      phoneNumber: phone,
    });
  };

  const DeleteUser = () => {
    return deleteUser(user);
  };

  const LogOut = async () => {
    try {
      // Clear admin token if exists
      if (hasAdminToken()) {
        try {
          await publicAxios.post("/admin/logout", {}, { withCredentials: true });
        } catch (error) {
          console.error('Admin logout API error:', error);
        }
      }

      // Clear all tokens using token manager
      clearAllTokens();

      // Sign out from Firebase
      try {
        await signOut(auth);
      } catch (error) {
        console.error('Firebase signout error:', error);
      }

      // Reset all state
      setIsAdmin(false);
      setUserRole(null);
      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
      // Force clear even on error
      clearAllTokens();
      setIsAdmin(false);
      setUserRole(null);
      setUser(null);
    }
  };

  // Check admin session on mount and after login
  const checkAdminSession = async () => {
    try {
      const response = await publicAxios.get("/admin/verify-token", {
        withCredentials: true,
      });

      if (response.data.authenticated) {
        const userData = {
          id: response.data.user._id,
          name: response.data.user.name || response.data.user.Name,
          email: response.data.user.email,
          role: response.data.user.role,
          avatar: response.data.user.avatar || null,
        };
        
        // Store user data in localStorage
        setUserData(userData);
        
        setIsAdmin(true);
        setUserRole(response.data.user.role);
        setUser({
          email: response.data.user.email,
          displayName: response.data.user.name || response.data.user.Name,
          uid: response.data.user._id,
          isAdmin: true,
        });
        return true;
      } else {
        // If not authenticated, ensure state is cleared
        setIsAdmin(false);
        setUserRole(null);
        return false;
      }
    } catch (error) {
      console.error('Admin session check failed:', error);
      setIsAdmin(false);
      setUserRole(null);
      return false;
    }
  };

  // Auth State Observer
  useEffect(() => {
    const initAuth = async () => {
      setLoading(true);

      // First check if admin token exists
      if (hasAdminToken()) {
        const hasAdminSession = await checkAdminSession();
        
        if (hasAdminSession) {
          setLoading(false);
          return;
        } else {
          // Admin token exists but invalid, clear it
          clearAllTokens();
        }
      }

      // If no valid admin session, check Firebase
      const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
        setUser(currentUser);
        setIsAdmin(false);

        if (currentUser && currentUser.email) {
          try {
            const userInfo = { email: currentUser.email };
            const res = await publicAxios.post("/jwt", userInfo);

            if (res?.data?.token) {
              const userData = {
                id: currentUser.uid,
                name: currentUser.displayName,
                email: currentUser.email,
                role: "user",
                avatar: currentUser.photoURL || null,
              };
              setUserToken(res.data.token, userData);
            }

            const userRes = await publicAxios.get(
              `/users?email=${currentUser.email}`
            );
            if (userRes?.data?.[0]) {
              setUserRole(userRes.data[0].role || "user");
            }
          } catch (error) {
            console.error("Error fetching user data:", error);
            clearAllTokens();
            setUserRole(null);
          }
        } else {
          clearAllTokens();
          setUserRole(null);
        }

        setLoading(false);
      });

      return () => unsubscribe();
    };

    initAuth();
  }, [publicAxios]);

  const authInfo = {
    user,
    loader,
    userRole,
    isAdmin,
    createUser,
    signIn,
    LogOut,
    updateUserProfile,
    GmailLogin,
    DeleteUser,
    checkAdminSession,
  };

  return (
    <AuthProvider.Provider value={authInfo}>{children}</AuthProvider.Provider>
  );
};

export default ContextProvider;
