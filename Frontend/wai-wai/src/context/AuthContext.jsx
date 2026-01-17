// frontend/wai-wai/src/context/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../supabaseClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Check active session on load
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        setRole(session.user.user_metadata?.role || 'candidate');
      }
      setLoading(false);
    };

    checkSession();

    // 2. Listen for changes (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        setRole(session.user.user_metadata?.role || 'candidate');
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // REGISTER FUNCTION
  const register = async (email, password, role) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { role: role } // This saves 'employer' or 'candidate' in the user object
      }
    });
    if (error) throw error;
    return data;
  };

  // LOGIN FUNCTION
  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    
    // Check if the user is logging in with the correct role intent
    // (We will enforce strict role checks in the UI/Protected Routes)
    return data;
  };

  // LOGOUT FUNCTION
  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{ user, role, register, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};