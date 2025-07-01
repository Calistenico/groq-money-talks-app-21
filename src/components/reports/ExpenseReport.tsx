
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { CalendarDays, TrendingDown, TrendingUp, DollarSign } from 'lucide-react';

interface Transaction {
  id: string;
  type: string;
  value: number;
  description: string;
  timestamp: string;
}

interface ReportData {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  transactions: Transaction[];
}

export const ExpenseReport = () => {
  const { user } = useAuth();
  const [reportData, setReportData] = useState<ReportData>({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
    transactions: []
  });
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);

  const generateReport = async () => {
    if (!user?.phone) {
      toast.error('Usuário não autenticado');
      return;
    }

    if (!startDate || !endDate) {
      toast.error('Por favor, selecione as datas de início e fim');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_phone', user.phone)
        .gte('timestamp', startDate)
        .lte('timestamp', endDate + 'T23:59:59')
        .order('timestamp', { ascending: false });

      if (error) {
        console.error('Erro ao carregar relatório:', error);
        toast.error('Erro ao carregar relatório');
        return;
      }

      const transactions = data || [];
      let totalIncome = 0;
      let totalExpense = 0;

      transactions.forEach(transaction => {
        if (transaction.type === 'income') {
          totalIncome += Number(transaction.value);
        } else {
          totalExpense += Number(transaction.value);
        }
      });

      setReportData({
        totalIncome,
        totalExpense,
        balance: totalIncome - totalExpense,
        transactions
      });

      toast.success('Relatório gerado com sucesso!');
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      toast.error('Erro ao gerar relatório');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  // Definir data padrão para últimos 30 dias
  useEffect(() => {
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    setEndDate(today.toISOString().split('T')[0]);
    setStartDate(thirtyDaysAgo.toISOString().split('T')[0]);
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Relatório de Gastos por Período
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate">Data de Início</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="endDate">Data de Fim</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
          
          <Button 
            onClick={generateReport}
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Gerando relatório...' : 'Gerar Relatório'}
          </Button>
        </CardContent>
      </Card>

      {reportData.transactions.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Receitas</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(reportData.totalIncome)}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Gastos</p>
                    <p className="text-2xl font-bold text-red-600">
                      {formatCurrency(reportData.totalExpense)}
                    </p>
                  </div>
                  <TrendingDown className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Saldo</p>
                    <p className={`text-2xl font-bold ${reportData.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(reportData.balance)}
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Transações do Período</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {reportData.transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(transaction.timestamp)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${
                        transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}{formatCurrency(Number(transaction.value))}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};
