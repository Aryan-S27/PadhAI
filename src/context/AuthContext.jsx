import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

// Create a context for authentication state
const AuthContext = createContext({ user: null, loading: true, isGuest: false });

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isGuest, setIsGuest] = useState(false);

    useEffect(() => {
        // 1. Get the initial session asynchronously (Supabase v2 Requirement)
        const checkInitialSession = async () => {
            try {
                // Check if a guest session exists first
                const guestStored = localStorage.getItem("padhai_is_guest");
                if (guestStored === "true") {
                    setIsGuest(true);
                    setUser({
                        id: "guest",
                        email: "guest@padhai.ai",
                        isGuest: true,
                        user_metadata: { name: "Guest Student" }
                    });
                    setLoading(false);
                    return;
                }

                const { data: { session } } = await supabase.auth.getSession();
                if (session?.user) {
                    setUser(session.user);
                } else {
                    setUser(null);
                }
            } catch (error) {
                console.error("Error checking initial auth session:", error);
            } finally {
                setLoading(false);
            }
        };

        checkInitialSession();

        // 2. Listen for auth state changes (Login, Logout, Token Refresh)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (localStorage.getItem("padhai_is_guest") !== "true") {
                setUser(session?.user ?? null);
                setLoading(false);
            }
        });

        // 3. Clean up the subscription
        return () => {
            if (subscription) subscription.unsubscribe();
        };
    }, []);

    const signIn = async (email, password) => {
        // Clear any active guest session
        localStorage.removeItem("padhai_is_guest");
        setIsGuest(false);

        const { error, data } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        setUser(data.user);
        return data.user;
    };

    const signUp = async (email, password, name, branch, year, extraMetadata = {}) => {
        // Clear any active guest session
        localStorage.removeItem("padhai_is_guest");
        setIsGuest(false);

        const mergedMetadata = {
            name,
            branch: branch || "",
            year: year || 1,
            ...extraMetadata
        };

        const { error, data } = await supabase.auth.signUp({
            email,
            password,
            options: { data: mergedMetadata },
        });
        if (error) throw error;

        // Attempt profiles upsert for DB consistency
        try {
            if (data.user) {
                const profileUpdate = {
                    id: data.user.id,
                    name,
                    branch: branch || "",
                    year: year ? Number(year) : 1,
                    semester: extraMetadata.semester ? Number(extraMetadata.semester) : null,
                    college: extraMetadata.university || extraMetadata.board || extraMetadata.examTarget || ""
                };
                await supabase.from("profiles").upsert(profileUpdate);
            }
        } catch (dbErr) {
            console.warn("Could not upsert profile directly, metadata is saved:", dbErr);
        }

        setUser(data.user);
        return data.user;
    };

    const startGuestSession = () => {
        localStorage.setItem("padhai_is_guest", "true");
        setIsGuest(true);
        setUser({
            id: "guest",
            email: "guest@padhai.ai",
            isGuest: true,
            user_metadata: { name: "Guest Student" }
        });
    };

    const signOut = async () => {
        localStorage.removeItem("padhai_is_guest");
        setIsGuest(false);
        setUser(null);
        await supabase.auth.signOut();
    };

    const value = { user, loading, isGuest, signIn, signUp, startGuestSession, signOut };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);