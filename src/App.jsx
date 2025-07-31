import React, { useState, useEffect } from 'react';
import './App.css';
import AdminPanel from './components/AdminPanel';
import UserPanel from './components/UserPanel';
import AuthForm from './components/AuthForm';
import { Button } from './components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Settings, Users, LogOut } from 'lucide-react';
import { supabase } from './lib/supabase';

function App() {
  const [currentView, setCurrentView] = useState('home');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true); // Adicionado estado de carregamento

  useEffect(() => {
    console.log('useEffect: Iniciando verificação de autenticação...');

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('onAuthStateChange: Evento disparado:', event);
      if (session) {
        setIsAuthenticated(true);
        setUser(session.user);
        console.log('onAuthStateChange: Usuário autenticado, buscando perfil...');
        // Fetch user role
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();

        if (error) {
          console.error('onAuthStateChange: Erro ao buscar role do usuário:', error);
          setUserRole(null);
        } else if (profile) {
          console.log('onAuthStateChange: Role do usuário encontrado:', profile.role);
          setUserRole(profile.role);
        }
      } else {
        console.log('onAuthStateChange: Usuário desautenticado.');
        setIsAuthenticated(false);
        setUser(null);
        setUserRole(null);
        setCurrentView('home'); // Reset view on logout
      }
      console.log('onAuthStateChange: Finalizando carregamento.');
      setLoading(false); // Finaliza o carregamento após a verificação de autenticação
    });

    // Initial check
    supabase.auth.getSession().then(async ({ data: { session }, error }) => {
      console.log('getSession: Verificação inicial de sessão.');
      if (error) {
        console.error('getSession: Erro ao obter sessão:', error);
      }
      if (session) {
        setIsAuthenticated(true);
        setUser(session.user);
        console.log('getSession: Sessão encontrada, buscando perfil...');
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();

        if (profileError) {
          console.error('getSession: Erro ao buscar role do usuário:', profileError);
          setUserRole(null);
        } else if (profile) {
          console.log('getSession: Role do usuário encontrado:', profile.role);
          setUserRole(profile.role);
        }
      }
      console.log('getSession: Finalizando carregamento.');
      setLoading(false); // Finaliza o carregamento após a verificação inicial
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleAuthSuccess = () => {
    // onAuthStateChange will handle setting isAuthenticated and user/role
    setCurrentView('home');
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error logging out:', error.message);
    } else {
      setIsAuthenticated(false);
      setUser(null);
      setUserRole(null);
      setCurrentView('home');
    }
  };

  const renderAuthForm = () => {
    return <AuthForm type={authMode} onLoginSuccess={setAuthMode} onAuthSuccess={handleAuthSuccess} />;
  };

  const renderMainApp = () => {
    if (loading) {
      return <div className="min-h-screen flex items-center justify-center text-green-700 text-2xl">Carregando...</div>; // Tela de carregamento
    }

    if (currentView === 'admin') {
      return <AdminPanel user={user} userRole={userRole} onBack={() => setCurrentView('home')} />;
    } else if (currentView === 'user') {
      return <UserPanel user={user} userRole={userRole} onBack={() => setCurrentView('home')} />;
    } else {
      return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex flex-col items-center justify-center p-4">
          <div className="max-w-4xl w-full">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-green-800 mb-2">
                PLAN DE VITALIDAD
              </h1>
              <p className="text-green-600 text-lg">
                Sistema de Gestão de Conteúdo para Saúde e Bem-estar
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {userRole === 'admin' && (
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader className="text-center">
                    <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                      <Settings className="w-8 h-8 text-green-600" />
                    </div>
                    <CardTitle className="text-green-800">Painel Administrativo</CardTitle>
                    <CardDescription>
                      Gerencie e publique conteúdos de saúde, vídeos educativos e documentos
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full bg-green-600 hover:bg-green-700" onClick={() => setCurrentView('admin')}>
                      Acessar Painel Admin
                    </Button>
                  </CardContent>
                </Card>
              )}

              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="text-center">
                  <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <Users className="w-8 h-8 text-green-600" />
                  </div>
                  <CardTitle className="text-green-800">Painel do Usuário</CardTitle>
                  <CardDescription>
                    Acesse conteúdos, vídeos e documentos sobre saúde e bem-estar
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full bg-green-600 hover:bg-green-700" onClick={() => setCurrentView('user')}>
                    Acessar Painel Usuário
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="text-center mt-8">
              <p className="text-green-600 text-sm">
                Versão de teste - Focada em upload e visualização de arquivos
              </p>
            </div>
          </div>
          <div className="mt-8">
            <Button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              <LogOut className="mr-2 h-4 w-4" /> Sair
            </Button>
          </div>
        </div>
      );
    }
  };

  return isAuthenticated ? renderMainApp() : renderAuthForm();
}

export default App;


