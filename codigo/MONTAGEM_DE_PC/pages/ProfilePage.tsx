// Importações de React, hooks, componentes e tipos.
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/core/Button';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/core/LoadingSpinner';
import toast from 'react-hot-toast';

// Componente da página de perfil do usuário.
const ProfilePage: React.FC = () => {
  // Obtém dados e funções do contexto de autenticação.
  const { currentUser, logout, updateUser, isLoading: authIsLoading } = useAuth();
  const navigate = useNavigate();

  // Estados locais para controlar o modo de edição, os dados do formulário e o feedback para o usuário.
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Efeito para popular o formulário com os dados do usuário atual quando o componente é montado ou o usuário muda.
  useEffect(() => {
    if (currentUser) {
      setFormData({
        nome: currentUser.nome,
        email: currentUser.email,
        newPassword: '',
        confirmPassword: '',
      });
    }
  }, [currentUser]);

  // Efeito para redirecionar o usuário se ele não estiver autenticado.
  useEffect(() => {
    // Se o carregamento terminou e ainda não há usuário, navega para a página de login.
    if (!authIsLoading && !currentUser) {
      navigate('/login');
    }
  }, [authIsLoading, currentUser, navigate]);

  // Se a autenticação estiver carregando ou o usuário não estiver logado,
  // exibe um spinner para evitar a renderização do resto do componente com dados nulos.
  if (authIsLoading || !currentUser) {
    return <div className="flex justify-center p-10"><LoadingSpinner text="Carregando perfil..." /></div>;
  }

  // Função para lidar com o logout.
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (e: any) {
        toast.error(`Falha ao sair: ${e.message}`);
    }
  };
  
  // Alterna o modo de edição do formulário.
  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    setError('');
    setSuccess('');
    // Reseta o formulário para os dados atuais do usuário ao cancelar a edição.
    if (isEditing && currentUser) {
        setFormData({
            nome: currentUser.nome,
            email: currentUser.email,
            newPassword: '',
            confirmPassword: '',
        });
    }
  };

  // Atualiza o estado do formulário conforme o usuário digita.
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({...prev, [e.target.name]: e.target.value}));
  };

  // Lida com o envio do formulário de atualização.
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validações dos dados do formulário.
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      setError('As novas senhas não coincidem.');
      return;
    }
    if (formData.newPassword && formData.newPassword.length < 6) {
      setError('A nova senha deve ter pelo menos 6 caracteres.');
      return;
    }

    // Cria um objeto apenas com os campos que foram alterados.
    const updates: { nome?: string; email?: string; password?: string } = {};
    if (currentUser && formData.nome.trim() !== currentUser.nome) updates.nome = formData.nome.trim();
    if (currentUser && formData.email.trim() !== currentUser.email) updates.email = formData.email.trim();
    if (formData.newPassword) updates.password = formData.newPassword;
    
    if (Object.keys(updates).length === 0) {
      setSuccess("Nenhuma alteração foi feita.");
      setIsEditing(false);
      return;
    }
    
    setIsUpdating(true);
    try {
      // Chama a função de atualização do contexto de autenticação.
      await updateUser(updates);
      setSuccess('Perfil atualizado com sucesso!');
      setIsEditing(false); // Sai do modo de edição após o sucesso.
    } catch (err: any) {
      setError(err.message || 'Falha ao atualizar o perfil.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-secondary p-8 sm:p-10 rounded-xl shadow-2xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-accent">
          Meu Perfil
        </h1>
        {/* Botão para entrar/sair do modo de edição. */}
        {!isEditing && (
            <Button onClick={handleEditToggle} variant="ghost">Editar Perfil</Button>
        )}
      </div>

       {/* Exibe mensagens de erro ou sucesso. */}
       {error && <p className="text-center text-sm text-red-400 bg-red-900/50 p-3 rounded-md mb-4">{error}</p>}
       {success && <p className="text-center text-sm text-green-400 bg-green-900/50 p-3 rounded-md mb-4">{success}</p>}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Campo de Nome */}
        <div>
          <label htmlFor="nome" className="block text-sm font-medium text-neutral-dark mb-1">Nome</label>
          <input id="nome" name="nome" type="text" value={formData.nome} onChange={handleChange} disabled={!isEditing || isUpdating}
            className="mt-1 text-lg text-neutral p-4 bg-primary rounded-lg shadow-sm w-full disabled:opacity-70 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-accent" />
        </div>
        {/* Campo de Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-neutral-dark mb-1">Email</label>
          <input id="email" name="email" type="email" value={formData.email} onChange={handleChange} disabled={!isEditing || isUpdating}
            className="mt-1 text-lg text-neutral p-4 bg-primary rounded-lg shadow-sm w-full disabled:opacity-70 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
        
        {/* Seção para alterar a senha, visível apenas no modo de edição. */}
        {isEditing && (
          <div className="pt-6 border-t border-neutral-dark/30">
            <h2 className="text-xl font-semibold text-accent mb-4">Alterar Senha</h2>
            <div className="space-y-4">
               <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-neutral-dark mb-1">Nova Senha (deixe em branco para não alterar)</label>
                <input id="newPassword" name="newPassword" type="password" value={formData.newPassword} onChange={handleChange} disabled={isUpdating} placeholder="••••••••"
                    className="mt-1 text-lg text-neutral p-4 bg-primary rounded-lg shadow-sm w-full disabled:opacity-70 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-accent" />
               </div>
               <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-neutral-dark mb-1">Confirmar Nova Senha</label>
                <input id="confirmPassword" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} disabled={isUpdating} placeholder="••••••••"
                    className="mt-1 text-lg text-neutral p-4 bg-primary rounded-lg shadow-sm w-full disabled:opacity-70 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-accent" />
               </div>
            </div>
          </div>
        )}

        {/* Botões de Ação (Salvar/Cancelar) */}
        {isEditing && (
             <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button type="submit" variant="primary" size="lg" isLoading={isUpdating} disabled={isUpdating} className="flex-1">
                    {isUpdating ? <LoadingSpinner size="sm" /> : 'Salvar Alterações'}
                </Button>
                <Button type="button" onClick={handleEditToggle} variant="secondary" size="lg" disabled={isUpdating} className="flex-1">
                    Cancelar
                </Button>
             </div>
        )}
      </form>
      
      {/* Botão de Logout */}
      {!isEditing && (
          <div className="pt-8 mt-4 text-center border-t border-neutral-dark/30">
            <Button onClick={handleLogout} variant="danger" size="lg">
              Sair da Conta (Logout)
            </Button>
          </div>
      )}
    </div>
  );
};

export default ProfilePage;