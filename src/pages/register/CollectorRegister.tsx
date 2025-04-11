
import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { UserSearch } from 'lucide-react';
import Logo from '@/components/Logo';

const CollectorRegister = () => {
  return (
    <Layout>
      <div className="container py-8 px-4 md:px-6 max-w-md mx-auto">
        <div className="text-center mb-8">
          <Logo size="md" showText={true} showSlogan={true} className="mx-auto mb-6" />
          <h1 className="text-2xl font-bold mb-2">Cadastro de Coletor Individual</h1>
          <p className="text-neutral-600">
            Junte-se à rede Neutro e comece a transformar a reciclagem em impacto positivo.
          </p>
        </div>
        
        <Card>
          <CardHeader className="space-y-1">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-neutro/10 rounded-full">
                <UserSearch className="h-8 w-8 text-neutro" />
              </div>
            </div>
            <CardTitle className="text-xl text-center">Informações Pessoais</CardTitle>
            <CardDescription className="text-center">
              Preencha seus dados para criar sua conta de coletor
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo</Label>
              <Input id="name" placeholder="Digite seu nome completo" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" placeholder="seu@email.com" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input id="phone" placeholder="(00) 00000-0000" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cpf">CPF</Label>
              <Input id="cpf" placeholder="000.000.000-00" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input id="password" type="password" placeholder="Crie uma senha segura" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirmar Senha</Label>
              <Input id="confirm-password" type="password" placeholder="Confirme sua senha" />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button className="w-full">Criar Conta</Button>
            <div className="text-center text-sm text-neutral-600">
              Ao criar uma conta, você concorda com nossos{' '}
              <Link to="/terms" className="text-neutro hover:underline">
                Termos de Uso
              </Link>{' '}
              e{' '}
              <Link to="/privacy" className="text-neutro hover:underline">
                Política de Privacidade
              </Link>
            </div>
          </CardFooter>
        </Card>
        
        <div className="text-center mt-6">
          <p className="text-neutral-600 text-sm">Já tem uma conta?</p>
          <Button asChild variant="link">
            <Link to="/login">Fazer login</Link>
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default CollectorRegister;
