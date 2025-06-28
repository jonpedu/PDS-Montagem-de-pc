
import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';
import { User } from '../types'; // User agora tem 'nome'
import { useNavigate, useLocation } from 'react-router-dom';


interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>; // Simplificado para email/senha
  logout: () => void;
  register: (nome: string, email: string, pass: string) => Promise<void>; // Adicionado pass, nome já estava
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
    // const pendingActionFromLogin = fromLocation?.state?.pendingAction; // Ajustado para pegar de navState
    const pendingActionFromLogin = navState?.pendingAction; // Pegar pendingAction diretamente do state passado para /login ou /register
    const originalPath = fromLocation?.pathname || '/dashboard';


    if (pendingActionFromLogin && (originalPath === '/build' || originalPath.startsWith('/build/'))) {
        navigate(originalPath, { replace: true, state: { fromLogin: true, action: pendingActionFromLogin } });
    } else {
        navigate(originalPath, { replace: true });
    }
  };

  // Login agora usa email e password (mock)
  const login = useCallback(async (email: string, _password?: string) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Simular busca de usuário. Em um app real, buscaria pelo email e validaria a senha.
    // Para este exemplo, se o email for "user@example.com", o login é bem-sucedido.
    // O nome é mockado ou poderia ser recuperado de um "banco de dados" mock.
    const mockUserName = email.startsWith("test") ? email.split("@")[0] : "Usuário Teste";

    const user: User = { id: Date.now().toString(), nome: mockUserName, email }; // Usar 'nome'
    setCurrentUser(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
    setIsLoading(false);
    handleAuthSuccessNavigation();
  }, [navigate, location.state]);

  // Register agora usa nome, email e password (mock)
  const register = useCallback(async (nome: string, email: string, _password?: string) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    if (email === 'taken@example.com') {
        setIsLoading(false);
        throw new Error("Email já cadastrado.");
    }
    const user: User = { id: Date.now().toString(), nome, email }; // Usar 'nome'
    setCurrentUser(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
    setIsLoading(false);
    handleAuthSuccessNavigation();
  }, [navigate, location.state]);


  const logout = useCallback(() => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    sessionStorage.removeItem('proceededAnonymously');
    sessionStorage.removeItem('pendingBuild'); 
    sessionStorage.removeItem('pendingAiNotes');
    navigate('/');
  }, [navigate]);

  return (
    <AuthContext.Provider value={{ currentUser, isLoading, login, logout, register }}>
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
