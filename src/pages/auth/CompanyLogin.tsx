import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2 } from 'lucide-react';
import Logo from '@/components/Logo';

const CompanyLogin: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulando login bem-sucedido
    navigate('/company-dashboard');
  };

  return (
    <Layout>
      <div className="container py-8 px-4 md:px-6 max-w-md mx-auto">
        <div className="text-center mb-8">
          <Logo size="md" showText={true} showSlogan={true} className="mx-auto mb-6" />
          <h1 className="text-2xl font-bold mb-2">Login da Empresa Coletora</h1>
          <p className="text-neutral-600">
            Acesse seu painel para gerenciar sua frota, coletores e coletas.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Login</CardTitle>
            <CardDescription>
              Use suas credenciais para acessar o sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="empresa@email.com"
                  defaultValue="empresa@teste.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Sua senha"
                  defaultValue="123456"
                />
              </div>
              <Button type="submit" className="w-full">
                Entrar
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <p className="text-sm text-center text-muted-foreground">
              Ainda não tem uma conta?
            </p>
            <Button variant="outline" className="w-full" asChild>
              <a href="/register/company">Cadastrar Empresa</a>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </Layout>
  );
};

export default CompanyLogin; 