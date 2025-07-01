
import { useState } from 'react';
import { AdminPanel } from '@/components/AdminPanel';
import { UsersList } from '@/components/admin/UsersList';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Users, Settings, Shield } from 'lucide-react';

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    if (email === 'otaldopirataofc@gmail.com' && password === 'admin123') {
      setIsAuthenticated(true);
      toast.success('Login realizado com sucesso!');
    } else {
      toast.error('Credenciais inválidas');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-2xl border-slate-700 bg-slate-800/90 backdrop-blur">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Shield className="h-8 w-8 text-blue-400" />
            </div>
            <CardTitle className="text-2xl text-white">Painel Administrativo</CardTitle>
            <p className="text-slate-300">Acesso restrito - Evolution API</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="Email do administrador"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
              />
            </div>
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
              />
            </div>
            <Button 
              onClick={handleLogin} 
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Entrar no Painel
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Painel Administrativo</h1>
            <p className="text-slate-600">Gestor Financeiro Elite - Evolution API</p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => setIsAuthenticated(false)}
            className="border-slate-300 hover:bg-slate-100"
          >
            Sair
          </Button>
        </div>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:w-96">
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Usuários
            </TabsTrigger>
            <TabsTrigger value="evolution" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Evolution API
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <UsersList />
          </TabsContent>

          <TabsContent value="evolution">
            <AdminPanel />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
