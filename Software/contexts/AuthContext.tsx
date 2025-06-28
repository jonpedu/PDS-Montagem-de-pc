import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';
import { User, UserWithPassword } from '../types';
import { useNavigate, useLocation } from 'react-router-dom';

const USERS_DB_KEY = 'codeTugaBuilds_users_db';

interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => void;
  register: (nome: string, email: string, pass: string) => Promise<void>;
  updateUser: (userId: string, updates: Partial<Pick<UserWithPassword, 'nome' | 'email' | 'password_mock'>>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();
  const location = useLocation();


  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        setCurrentUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to load user from localStorage", error);
      localStorage.removeItem('currentUser');
    }
    setIsLoading(false);
  }, []);

  const handleAuthSuccessNavigation = () => {
    const navState = location.state as any;
    const fromLocation = navState?.from;
    const pendingActionFromLogin = navState?.pendingAction;
    const originalPath = fromLocation?.pathname || '/dashboard';


    if (pendingActionFromLogin && (originalPath === '/build' || originalPath.startsWith('/build/'))) {
        navigate(originalPath, { replace: true, state: { fromLogin: true, action: pendingActionFromLogin } });
    } else {
        navigate(originalPath, { replace: true });
    }
  };

  const login = useCallback(async (email: string, pass: string) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay

    const usersDbStr = localStorage.getItem(USERS_DB_KEY);
    const usersDb: UserWithPassword[] = usersDbStr ? JSON.parse(usersDbStr) : [];
    
    const foundUser = usersDb.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!foundUser || foundUser.password_mock !== pass) {
        setIsLoading(false);
        throw new Error("Email ou senha inválidos.");
    }

    const { password_mock, ...userForSession } = foundUser;
    setCurrentUser(userForSession);
    localStorage.setItem('currentUser', JSON.stringify(userForSession));
    setIsLoading(false);
    handleAuthSuccessNavigation();
  }, [navigate, location.state]);

  const register = useCallback(async (nome: string, email: string, pass: string) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay

    const usersDbStr = localStorage.getItem(USERS_DB_KEY);
    const usersDb: UserWithPassword[] = usersDbStr ? JSON.parse(usersDbStr) : [];

    if (usersDb.some(u => u.email.toLowerCase() === email.toLowerCase())) {
        setIsLoading(false);
        throw new Error("Este email já está cadastrado.");
    }

    const newUser: UserWithPassword = {
        id: Date.now().toString(),
        nome,
        email,
        password_mock: pass
    };

    usersDb.push(newUser);
    localStorage.setItem(USERS_DB_KEY, JSON.stringify(usersDb));

    const { password_mock, ...userForSession } = newUser;
    setCurrentUser(userForSession);
    localStorage.setItem('currentUser', JSON.stringify(userForSession));
    setIsLoading(false);
    handleAuthSuccessNavigation();
  }, [navigate, location.state]);

  const updateUser = useCallback(async (userId: string, updates: Partial<Pick<UserWithPassword, 'nome' | 'email' | 'password_mock'>>) => {
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
    
    const usersDbStr = localStorage.getItem(USERS_DB_KEY);
    const usersDb: UserWithPassword[] = usersDbStr ? JSON.parse(usersDbStr) : [];
    
    const userIndex = usersDb.findIndex(u => u.id === userId);

    if (userIndex === -1) {
      throw new Error("Usuário não encontrado.");
    }

    // Check for email collision
    if (updates.email && usersDb.some(u => u.email.toLowerCase() === updates.email!.toLowerCase() && u.id !== userId)) {
        throw new Error("Este email já está em uso por outra conta.");
    }
    
    // Apply updates to the user in the DB
    const originalUser = usersDb[userIndex];
    const updatedUserInDb = { ...originalUser, ...updates };
    usersDb[userIndex] = updatedUserInDb;
    localStorage.setItem(USERS_DB_KEY, JSON.stringify(usersDb));

    // Update the current session user
    const { password_mock, ...userForSession } = updatedUserInDb;
    setCurrentUser(userForSession);
    localStorage.setItem('currentUser', JSON.stringify(userForSession));
  }, []);


  const logout = useCallback(() => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    sessionStorage.removeItem('proceededAnonymously');
    sessionStorage.removeItem('pendingBuild'); 
    sessionStorage.removeItem('pendingAiNotes');
    navigate('/');
  }, [navigate]);

  return (
    <AuthContext.Provider value={{ currentUser, isLoading, login, logout, register, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};