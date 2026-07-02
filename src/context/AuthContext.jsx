import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

// Create a context for authentication state
const AuthContext = createContext({ user: null, loading: true });

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 1. Get the initial session asynchronously (Supabase v2 Requirement)
        const checkInitialSession = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                setUser(session?.user ?? null);
            } catch (error) {
                console.error("Error checking initial auth session:", error);
            } finally {
                setLoading(false);
            }
        };

        checkInitialSession();

        // 2. Listen for auth state changes (Login, Logout, Token Refresh)
        // Destructure { data: { subscription } } cleanly for v2
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            setLoading(false);
        });

        // 3. Clean up the subscription using the modern v2 unsubscribe method
        return () => {
            if (subscription) subscription.unsubscribe();
        };
    }, []);

    const signIn = async (email, password) => {
    const { error, data } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    setUser(data.user);
  };

  const signUp = async (email, password, name, branch, year) => {
    const { error, data } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, branch, year } },
    });
    if (error) throw error;
    setUser(data.user);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const value = { user, loading, signIn, signUp, signOut };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);