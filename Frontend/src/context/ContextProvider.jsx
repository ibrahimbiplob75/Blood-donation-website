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
import { 
  performCrossDomainLogout,
  initializeAuthListeners,
  clearFirebaseIndexedDB 
} from "../utils/crossDomainAuth.js";

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
      // Perform cross-domain logout with backend API call
      const backendLogoutFn = async () => {
        if (hasAdminToken()) {
          await publicAxios.post("/admin/logout", {}, { withCredentials: true });
        }
      };
      
      // Execute comprehensive cross-domain logout
      await performCrossDomainLogout(backendLogoutFn);

      // Reset all state
      setIsAdmin(false);
      setUserRole(null);
      setUser(null);
      
      return { success: true };
    } catch (error) {
      console.error("Logout error:", error);
      
      // Force clear even on error
      clearAllTokens();
      await clearFirebaseIndexedDB();
      setIsAdmin(false);
      setUserRole(null);
      setUser(null);
      
      return { success: false, error };
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
        try {
          if (currentUser && currentUser.email) {
            setUser(currentUser);
            setIsAdmin(false);

            try {
              // Get JWT token
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

              // Fetch user role - IMPORTANT: This must complete before setting loading to false
              const userRes = await publicAxios.get(
                `/users?email=${currentUser.email}`
              );
              
              if (userRes?.data?.[0]) {
                const userRole = userRes.data[0].role || "user";
                const userData = {
                  id: currentUser.uid,
                  name: currentUser.displayName,
                  email: currentUser.email,
                  role: userRole,
                  avatar: currentUser.photoURL || null,
                };
                // Persist user data with correct role
                setUserData(userData);
                setUserRole(userRole);
              } else {
                setUserRole("user");
              }
            } catch (error) {
              console.error("Error fetching user data:", error);
              clearAllTokens();
              setUserRole("user");
            }
          } else {
            // No user logged in
            setUser(null);
            clearAllTokens();
            setUserRole(null);
            setIsAdmin(false);
          }
        } finally {
          // Always set loading to false when auth state change is complete
          setLoading(false);
        }
      });

      return () => unsubscribe();
    };

    initAuth();
  }, [publicAxios]);
  
  // Setup cross-tab and cross-domain logout listener
  useEffect(() => {
    const handleCrossTabLogout = () => {
      // Clear local state when logout is triggered from another tab/domain
      setUser(null);
      setIsAdmin(false);
      setUserRole(null);
      clearAllTokens();
    };
    
    // Initialize cross-tab logout listener
    const cleanupListener = initializeAuthListeners(handleCrossTabLogout);
    
    return () => {
      if (cleanupListener) {
        cleanupListener();
      }
    };
  }, []);

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
