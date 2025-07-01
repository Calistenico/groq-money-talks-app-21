
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ExternalLink, Phone } from 'lucide-react';

interface User {
  id: string;
  phone: string;
  created_at: string;
  status: 'Teste 7 dias' | 'Ativado' | 'Cancelado' | 'Vencido';
  activated_at: string | null;
  expires_at: string | null;
}

export const UsersList = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const loadUsers = async () => {
    try {
      // Primeiro verifica usuários expirados
      await supabase.rpc('check_expired_users');
      
      const { data, error } = await supabase
        .from('users')
        .select('id, phone, created_at, status, activated_at, expires_at')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao carregar usuários:', error);
        toast.error('Erro ao carregar usuários');
        return;
      }

      setUsers(data || []);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      toast.error('Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  const updateUserStatus = async (userId: string, newStatus: string) => {
    try {
      let updateData: any = { status: newStatus };
      
      // Se ativando o usuário, definir datas de ativação e expiração
      if (newStatus === 'Ativado') {
        const now = new Date();
        const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 dias
        updateData.activated_at = now.toISOString();
        updateData.expires_at = expiresAt.toISOString();
      }

      const { error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', userId);

      if (error) {
        console.error('Erro ao atualizar status:', error);
        toast.error('Erro ao atualizar status do usuário');
        return;
      }

      toast.success('Status do usuário atualizado com sucesso!');
      loadUsers(); // Recarregar lista
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast.error('Erro ao atualizar status do usuário');
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'Ativado':
        return 'default';
      case 'Teste 7 dias':
        return 'secondary';
      case 'Vencido':
        return 'destructive';
      case 'Cancelado':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatPhone = (phone: string) => {
    if (phone.length === 11) {
      return `(${phone.slice(0, 2)}) ${phone.slice(2, 7)}-${phone.slice(7)}`;
    }
    return phone;
  };

  const openWhatsApp = (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    const formattedPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
    window.open(`https://wa.me/${formattedPhone}`, '_blank');
  };

  useEffect(() => {
    loadUsers();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Usuários Cadastrados</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Carregando usuários...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Usuários Cadastrados ({users.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Telefone</TableHead>
              <TableHead>Data de Cadastro</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Expira em</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {formatPhone(user.phone)}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openWhatsApp(user.phone)}
                      className="h-8 w-8 p-0"
                    >
                      <Phone className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
                <TableCell>{formatDate(user.created_at)}</TableCell>
                <TableCell>
                  <Badge variant={getStatusBadgeVariant(user.status)}>
                    {user.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {user.expires_at ? formatDate(user.expires_at) : '-'}
                </TableCell>
                <TableCell>
                  <Select
                    value={user.status}
                    onValueChange={(value) => updateUserStatus(user.id, value)}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Teste 7 dias">Teste 7 dias</SelectItem>
                      <SelectItem value="Ativado">Ativado</SelectItem>
                      <SelectItem value="Cancelado">Cancelado</SelectItem>
                      <SelectItem value="Vencido">Vencido</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
