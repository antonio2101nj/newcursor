import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthForm = ({ type, onLoginSuccess, onAuthSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);

    try {
      if (type === 'login') {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        setMessage('Login bem-sucedido!');
        onAuthSuccess();
      } else if (type === 'register') {
        const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName } } });
        if (error) throw error;
        setMessage('Cadastro bem-sucedido! Verifique seu email para confirmar.');
        // No caso de auto-confirm, podemos chamar onAuthSuccess aqui também
        onAuthSuccess();
      } else if (type === 'reset') {
        const { error } = await supabase.auth.resetPasswordForEmail(email);
        if (error) throw error;
        setMessage('Link de recuperação de senha enviado para seu email.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6 text-green-600">
          {type === 'login' && 'Login'}
          {type === 'register' && 'Cadastre-se'}
          {type === 'reset' && 'Recuperar Senha'}
        </h2>
        <form onSubmit={handleSubmit}>
          {type === 'register' && (
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="fullName">
                Nome Completo
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="fullName"
                type="text"
                placeholder="Seu nome completo"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
          )}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
              Email
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="email"
              type="email"
              placeholder="Seu email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          {(type === 'login' || type === 'register') && (
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                Senha
              </label>
              <div className="relative">
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="********"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? '👁️' : '🙈'}
                </button>
              </div>
            </div>
          )}
          <div className="flex items-center justify-between">
            <button
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Carregando...' : (
                type === 'login' ? 'Entrar' :
                type === 'register' ? 'Cadastrar' :
                'Enviar Link de Recuperação'
              )}
            </button>
          </div>
          {message && <p className="text-center text-sm mt-4 text-green-600">{message}</p>}
          {error && <p className="text-center text-sm mt-4 text-red-500">{error}</p>}
        </form>

        {type === 'login' && (
          <div className="mt-4 text-center">
            <a
              href="#"
              className="inline-block align-baseline font-bold text-sm text-green-500 hover:text-green-800"
              onClick={() => onLoginSuccess('reset')}
            >
              Esqueceu a senha?
            </a>
            <p className="text-sm mt-2">
              Não tem uma conta?{' '}
              <a
                href="#"
                className="font-bold text-green-500 hover:text-green-800"
                onClick={() => onLoginSuccess('register')}
              >
                Cadastre-se
              </a>
            </p>
          </div>
        )}

        {(type === 'register' || type === 'reset') && (
          <div className="mt-4 text-center">
            <a
              href="#"
              className="inline-block align-baseline font-bold text-sm text-green-500 hover:text-green-800"
              onClick={() => onLoginSuccess('login')}
            >
              Voltar para o Login
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthForm;


