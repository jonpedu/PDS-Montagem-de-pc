
import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';
import { User } from '../types';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';

interface AuthContextType {
  currentUser: User | null;
  session: Session | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (nome: string, email: string, pass: string) => Promise<void>;
  updateUser: (updates: { nome?: string; email?: string; password?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [justAuthenticated, setJustAuthenticated] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const fetchUserProfile = useCallback(async (supabaseUser: SupabaseUser): Promise<User | null> => {
    // Retry logic in case profile creation has a delay after signup trigger
    for (let i = 0; i < 3; i++) {
        const { data: profile, error } = await supabase
            .from('profiles')
            .select('nome, email')
            .eq('id', supabaseUser.id)
            .single();

        if (error && error.code !== 'PGRST116') {
            console.error("Error fetching user profile:", error);
            return null; // Don't retry on db errors, only on not found
        }
        if (profile) {
            return { id: supabaseUser.id, nome: profile.nome, email: profile.email };
        }
        if (i < 2) { // if not last attempt
             await new Promise(resolve => setTimeout(resolve, 300)); // wait before retrying
        }
    }
    console.error("Profile not found for user after retries:", supabaseUser.id);
    return null;
  }, []);

  // Main listener for auth state changes from Supabase
  useEffect(() => {
    setIsLoading(true);
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      if (session?.user) {
        const profile = await fetchUserProfile(session.user);
        setCurrentUser(profile);
      } else {
        setCurrentUser(null);
      }
      setIsLoading(false);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [fetchUserProfile]);

  // Effect to handle navigation AFTER a successful login/register
  useEffect(() => {
    if (currentUser && justAuthenticated) {
      setJustAuthenticated(false); // Reset the trigger

      const navState = location.state as any;
      const fromLocation = navState?.from;
      const originalPath = fromLocation?.pathname || '/dashboard';
      
      if (navState?.pendingAction) {
         navigate(originalPath, { replace: true, state: { fromLogin: true, action: navState.pendingAction } });
      } else {
         navigate(originalPath, { replace: true });
      }
    }
  }, [currentUser, justAuthenticated, location, navigate]);


  const login = async (email: string, pass: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });
    if (error) throw error;
    if (data.session) {
      // Set a flag to trigger the navigation effect once the user state is updated by onAuthStateChange
      setJustAuthenticated(true);
    }
  };

  const register = async (nome: string, email: string, pass: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password: pass,
      options: {
        data: {
          nome: nome,
        },
      },
    });
    if (error) throw error;
    
    if (data.session) { // User is logged in immediately (e.g., auto-confirm is on)
      setJustAuthenticated(true);
    } else if (data.user) { // Email confirmation is likely required
      alert('Cadastro realizado! Por favor, verifique seu e-mail para confirmar sua conta e poder fazer o login.');
      navigate('/login');
    }
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    // Clear session storage and navigate. onAuthStateChange will handle state cleanup.
    sessionStorage.removeItem('proceededAnonymously');
    sessionStorage.removeItem('pendingBuild'); 
    sessionStorage.removeItem('pendingAiNotes');
    navigate('/');
  };

  const updateUser = async (updates: { nome?: string; email?: string; password?: string }) => {
    if (!currentUser || !session?.user) throw new Error("User not authenticated.");

    const { nome, email, password } = updates;
    const supabaseUserUpdates: any = {};
    if (email) supabaseUserUpdates.email = email;
    if (password) supabaseUserUpdates.password = password;
    
    if (Object.keys(supabaseUserUpdates).length > 0) {
      const { data, error: authError } = await supabase.auth.updateUser(supabaseUserUpdates);
      if (authError) throw authError;
      // After email update, user might need to re-verify. Supabase handles this.
      if(data.user) {
          const updatedProfile = await fetchUserProfile(data.user);
          setCurrentUser(updatedProfile);
      }
    }
    
    if (nome && nome !== currentUser.nome) {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ nome })
        .eq('id', currentUser.id);
      if (profileError) throw profileError;
      // Optimistically update state
      setCurrentUser(prev => prev ? { ...prev, nome } : null);
    }
  };

  const value: AuthContextType = {
    currentUser,
    session,
    isLoading,
    login,
    logout,
    register,
    updateUser
  };

  return <AuthContext.Provider value={value}>{!isLoading && children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
