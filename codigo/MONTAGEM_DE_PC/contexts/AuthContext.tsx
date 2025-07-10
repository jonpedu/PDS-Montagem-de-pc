// Importações necessárias do React, React Router e Supabase.
import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';
import { User } from '../types';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import toast from 'react-hot-toast';

// Define a estrutura do objeto de contexto de autenticação.
interface AuthContextType {
  currentUser: User | null; // O usuário logado, com nosso tipo 'User'.
  session: Session | null; // A sessão do Supabase.
  isLoading: boolean; // Indica se o estado de autenticação está sendo carregado.
  login: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (nome: string, email: string, pass: string) => Promise<void>;
  updateUser: (updates: { nome?: string; email?: string; password?: string }) => Promise<void>;
}

// Cria o contexto de autenticação.
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Componente provedor que encapsula a lógica de autenticação.
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  // Estado para controlar se o usuário acabou de se autenticar, para acionar a navegação.
  const [justAuthenticated, setJustAuthenticated] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  /**
   * Busca o perfil do usuário na tabela 'profiles' do Supabase.
   * Inclui uma lógica de nova tentativa para lidar com o atraso entre a criação do usuário em 'auth.users'
   * e a criação do perfil pelo trigger do banco de dados.
   * @param supabaseUser O objeto de usuário do Supabase.
   * @returns O perfil do usuário formatado ou nulo se não encontrado.
   */
  const fetchUserProfile = useCallback(async (supabaseUser: SupabaseUser): Promise<User | null> => {
    for (let i = 0; i < 3; i++) {
        const { data: profile, error } = await supabase
            .from('profiles')
            .select('nome, email')
            .eq('id', supabaseUser.id)
            .single();

        if (error && error.code !== 'PGRST116') { // 'PGRST116' é o erro para "nenhuma linha encontrada".
            console.error("Error fetching user profile:", error);
            return null;
        }
        if (profile) {
            return { id: supabaseUser.id, nome: profile.nome, email: profile.email };
        }
        if (i < 2) { // Se não for a última tentativa, espera um pouco antes de tentar novamente.
             await new Promise(resolve => setTimeout(resolve, 300));
        }
    }
    console.error("Profile not found for user after retries:", supabaseUser.id);
    return null;
  }, []);

  // Efeito principal que ouve as mudanças no estado de autenticação do Supabase.
  useEffect(() => {
    setIsLoading(true);

    // Timeout de segurança para evitar um estado de carregamento infinito se a conexão com o Supabase travar.
    const authTimeout = setTimeout(() => {
      console.warn("A verificação de autenticação expirou. Renderizando a aplicação...");
      toast.error("Não foi possível conectar ao servidor de autenticação. Tente recarregar a página.", { duration: 8000 });
      setIsLoading(false);
    }, 8000); // Timeout de 8 segundos.

    // onAuthStateChange é o ouvinte que reage a logins, logouts, etc.
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      clearTimeout(authTimeout); // A verificação foi bem-sucedida, então limpa o timeout.
      setSession(session);
      if (session?.user) {
        // Se há uma sessão, busca o perfil do usuário.
        const profile = await fetchUserProfile(session.user);
        setCurrentUser(profile);
      } else {
        // Se não há sessão, limpa o usuário atual.
        setCurrentUser(null);
      }
      setIsLoading(false);
    });

    // Função de limpeza para cancelar a inscrição do ouvinte quando o componente for desmontado.
    return () => {
      clearTimeout(authTimeout);
      authListener.subscription.unsubscribe();
    };
  }, [fetchUserProfile]);

  // Efeito para lidar com o redirecionamento após um login ou registro bem-sucedido.
  useEffect(() => {
    if (currentUser && justAuthenticated) {
      setJustAuthenticated(false); // Reseta o gatilho.

      const navState = location.state as any;
      const fromLocation = navState?.from;
      // Define a rota de destino: a página original ou o dashboard como padrão.
      const originalPath = fromLocation?.pathname || '/dashboard';
      
      // Se havia uma ação pendente (ex: salvar build), navega de volta com essa informação.
      if (navState?.pendingAction) {
         navigate(originalPath, { replace: true, state: { fromLogin: true, action: navState.pendingAction } });
      } else {
         navigate(originalPath, { replace: true });
      }
    }
  }, [currentUser, justAuthenticated, location, navigate]);


  // Função de login.
  const login = async (email: string, pass: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });
    if (error) throw error;
    if (data.session) {
      // Define o gatilho para o efeito de navegação.
      setJustAuthenticated(true);
    }
  };

  // Função de registro.
  const register = async (nome: string, email: string, pass: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password: pass,
      options: {
        // 'options.data' passa metadados que o trigger do DB usará para criar o perfil.
        data: {
          nome: nome,
        },
      },
    });
    if (error) throw error;
    
    if (data.session) { // Se o auto-confirm estiver ativado, o usuário já está logado.
      setJustAuthenticated(true);
      toast.success('Cadastro realizado com sucesso! Bem-vindo(a)!');
    } else if (data.user) { // Se a confirmação de e-mail for necessária.
      toast.success('Cadastro realizado! Verifique seu e-mail para confirmar a conta.', {
        duration: 6000, // Longa duração para dar tempo de ler.
      });
      navigate('/login');
    }
  };

  // Função de logout.
  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    // Limpa o sessionStorage e navega. O onAuthStateChange cuidará do resto.
    sessionStorage.removeItem('proceededAnonymously');
    sessionStorage.removeItem('pendingBuild'); 
    sessionStorage.removeItem('pendingAiNotes');
    navigate('/');
  };

  // Função para atualizar os dados do usuário.
  const updateUser = async (updates: { nome?: string; email?: string; password?: string }) => {
    if (!currentUser || !session?.user) throw new Error("User not authenticated.");

    const { nome, email, password } = updates;
    const supabaseUserUpdates: any = {};
    if (email) supabaseUserUpdates.email = email;
    if (password) supabaseUserUpdates.password = password;
    
    // Atualiza os dados de autenticação (e-mail, senha).
    if (Object.keys(supabaseUserUpdates).length > 0) {
      const { data, error: authError } = await supabase.auth.updateUser(supabaseUserUpdates);
      if (authError) throw authError;
      if(data.user) {
          // Após a atualização, busca novamente o perfil para manter o estado consistente.
          const updatedProfile = await fetchUserProfile(data.user);
          setCurrentUser(updatedProfile);
      }
    }
    
    // Atualiza os dados do perfil (nome).
    if (nome && nome !== currentUser.nome) {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ nome })
        .eq('id', currentUser.id);
      if (profileError) throw profileError;
      // Atualiza o estado local otimisticamente para uma resposta mais rápida da UI.
      setCurrentUser(prev => prev ? { ...prev, nome } : null);
    }
  };

  // Objeto de valor fornecido pelo contexto.
  const value: AuthContextType = {
    currentUser,
    session,
    isLoading,
    login,
    logout,
    register,
    updateUser
  };

  // Renderiza os componentes filhos somente após o carregamento inicial da autenticação.
  return <AuthContext.Provider value={value}>{!isLoading && children}</AuthContext.Provider>;
};

// Hook customizado para consumir o contexto de autenticação de forma fácil e segura.
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
