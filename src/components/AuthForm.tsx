
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { Shield, Star, Gift } from 'lucide-react';

export const AuthForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const { signIn, signUp, loading } = useAuth();

  const formatPhone = (value: string) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '');
    
    // Formata como (XX) XXXXX-XXXX
    if (numbers.length <= 2) {
      return `(${numbers}`;
    } else if (numbers.length <= 7) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    } else {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setPhone(formatted);
  };

  const getCleanPhone = (formattedPhone: string) => {
    return formattedPhone.replace(/\D/g, '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const cleanPhone = getCleanPhone(phone);
    
    if (cleanPhone.length !== 11) {
      return;
    }
    
    if (password.length < 4) {
      return;
    }

    let success = false;
    if (isLogin) {
      success = await signIn(cleanPhone, password);
    } else {
      success = await signUp(cleanPhone, password);
      if (success) {
        setIsLogin(true);
        setPassword('');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-green-600 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header com branding */}
        <div className="text-center mb-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6 border border-white/20">
            <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">
              GESTOR FINANCEIRO
            </h1>
            <h2 className="text-2xl font-semibold text-yellow-300">
              ELITE
            </h2>
            
            <div className="flex flex-col items-center gap-3 mt-6">
              <Badge className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 text-sm font-semibold">
                <Gift className="h-4 w-4 mr-2" />
                7 DIAS GRÁTIS PARA TESTAR
              </Badge>
              
              <Badge className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 text-sm font-semibold">
                <Star className="h-4 w-4 mr-2" />
                PLANOS A PARTIR DE R$ 14,50
              </Badge>
            </div>
          </div>
        </div>

        {/* Card de Login/Cadastro */}
        <Card className="backdrop-blur-lg bg-white/95 border-white/20 shadow-2xl">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl font-bold text-gray-800 flex items-center justify-center gap-2">
              <Shield className="h-6 w-6 text-blue-600" />
              {isLogin ? 'Fazer Login' : 'Criar Conta'}
            </CardTitle>
            <CardDescription className="text-gray-600">
              {isLogin 
                ? 'Entre com seu número e senha' 
                : 'Crie sua conta e ganhe 7 dias grátis!'
              }
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-gray-700 font-medium">
                  Número WhatsApp (com DDD)
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={handlePhoneChange}
                  placeholder="(11) 99999-9999"
                  maxLength={15}
                  required
                  className="h-12 text-lg border-2 focus:border-blue-500 transition-colors"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700 font-medium">
                  Senha
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 4 caracteres"
                  minLength={4}
                  required
                  className="h-12 text-lg border-2 focus:border-blue-500 transition-colors"
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 shadow-lg transition-all duration-200 transform hover:scale-105"
                disabled={loading}
              >
                {loading ? 'Processando...' : (isLogin ? 'Entrar' : 'Criar Conta Grátis')}
              </Button>
            </form>
            
            <div className="text-center pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-blue-600 hover:text-blue-700 font-medium transition-colors underline decoration-2 underline-offset-4"
              >
                {isLogin ? 'Não tem conta? Crie uma aqui' : 'Já tem conta? Entre aqui'}
              </button>
            </div>

            {!isLogin && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
                <div className="flex items-center gap-2 text-green-800">
                  <Gift className="h-5 w-5" />
                  <span className="font-semibold">Benefícios do teste grátis:</span>
                </div>
                <ul className="mt-2 text-sm text-green-700 space-y-1">
                  <li>• Controle completo de gastos e receitas</li>
                  <li>• Relatórios detalhados por período</li>
                  <li>• Integração com WhatsApp</li>
                  <li>• Sem compromisso ou cobrança</li>
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <p className="text-white/80 text-sm">
            Transforme sua vida financeira hoje mesmo!
          </p>
        </div>
      </div>
    </div>
  );
};
