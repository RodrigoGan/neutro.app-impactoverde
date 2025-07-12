import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Leaf, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import log from '@/lib/logger';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    log.info('🔍 [Login] Tentativa de login:', { email });

    try {
      const result = await login(email, password);
      
      if (result.error) {
        log.error('❌ [Login] Erro no login:', result.error);
        setError(result.error);
      } else {
        log.info('✅ [Login] Login realizado com sucesso');
        navigate('/dashboard/standard');
      }
    } catch (err) {
      log.error('❌ [Login] Erro inesperado:', err);
      setError('Erro inesperado ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = () => {
    navigate('/register');
  };

  // Credenciais de teste para facilitar o desenvolvimento
  const handleTestLogin = async () => {
    setEmail('teste@neutro.com');
    setPassword('123456');
    setLoading(true);
    setError(null);

    log.info('🔍 [Login] Tentativa de login com credenciais de teste');

    try {
      const result = await login('teste@neutro.com', '123456');
      
      if (result.error) {
        log.error('❌ [Login] Erro no login de teste:', result.error);
        setError('Credenciais de teste inválidas. Crie um usuário primeiro.');
      } else {
        log.info('✅ [Login] Login de teste realizado com sucesso');
        navigate('/dashboard/standard');
      }
    } catch (err) {
      log.error('❌ [Login] Erro inesperado no login de teste:', err);
      setError('Erro inesperado ao fazer login de teste');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative">
      {/* Imagem de fundo em todas as resoluções */}
      <img
        src="/Image/garden-5315602_1280.jpg"
        alt="Natureza"
        className="fixed inset-0 w-full h-full object-cover z-0"
      />
      <div className="fixed inset-0 bg-black/40 z-10" />
      {/* Conteúdo central */}
      <div className="relative z-20 w-full max-w-md mx-auto">
        <Card className="w-full shadow-lg">
          <CardHeader className="space-y-1 text-center">
            <Leaf className="h-10 w-10 mx-auto mb-2 text-green-700" />
            <CardTitle className="text-2xl font-bold">Bem-vindo de volta</CardTitle>
            <CardDescription>
              Faça login para continuar gerando impacto positivo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              
              {/* Mensagem de erro */}
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 text-red-800 rounded-lg border border-red-200">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                    disabled={loading}
                  />
                  <Label htmlFor="remember" className="text-sm">Lembrar-me</Label>
                </div>
                <Button variant="link" className="text-sm text-green-700" disabled={loading}>
                  Esqueceu a senha?
                </Button>
              </div>
              <Button 
                type="submit" 
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold"
                disabled={loading}
              >
                {loading ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>

            {/* Botão de login de teste para desenvolvimento */}
            <div className="mt-4">
              <Button 
                type="button"
                variant="outline"
                className="w-full text-sm"
                onClick={handleTestLogin}
                disabled={loading}
              >
                {loading ? 'Entrando...' : 'Login de Teste (Dev)'}
              </Button>
              <p className="text-xs text-gray-500 mt-1 text-center">
                Use para testar o sistema sem criar conta
              </p>
            </div>

            <div className="mt-6 text-center">
              <span className="text-neutral-700">Ainda não faz parte?</span>
              <Button variant="link" className="text-green-700 font-bold ml-2" onClick={handleRegister} disabled={loading}>
                Junte-se ao movimento!
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login; 