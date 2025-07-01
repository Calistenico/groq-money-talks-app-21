
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WhatsAppSimulator } from './WhatsAppSimulator';
import { Transaction } from '@/hooks/useTransactions';
import { formatCurrency } from '@/utils/formatters';
import { getTodayTransactions } from '@/utils/dateUtils';
import { TrendingDown, TrendingUp, DollarSign } from 'lucide-react';

interface DashboardProps {
  transactions: Transaction[];
}

export const Dashboard = ({ transactions }: DashboardProps) => {
  const todayTransactions = getTodayTransactions(transactions);
  const todayExpenses = todayTransactions.filter(t => t.type === 'gasto');
  const todayIncome = todayTransactions.filter(t => t.type === 'lucro');
  
  const totalExpenses = todayExpenses.reduce((sum, t) => sum + t.value, 0);
  const totalIncome = todayIncome.reduce((sum, t) => sum + t.value, 0);
  const balance = totalIncome - totalExpenses;

  return (
    <div className="space-y-6">
      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-red-50 border-red-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-700">Gastos Hoje</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-700">{formatCurrency(totalExpenses)}</div>
            <p className="text-xs text-red-600">{todayExpenses.length} transações</p>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Ganhos Hoje</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">{formatCurrency(totalIncome)}</div>
            <p className="text-xs text-green-600">{todayIncome.length} transações</p>
          </CardContent>
        </Card>

        <Card className={`${balance >= 0 ? 'bg-blue-50 border-blue-200' : 'bg-red-50 border-red-200'}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className={`text-sm font-medium ${balance >= 0 ? 'text-blue-700' : 'text-red-700'}`}>
              Saldo Hoje
            </CardTitle>
            <DollarSign className={`h-4 w-4 ${balance >= 0 ? 'text-blue-600' : 'text-red-600'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${balance >= 0 ? 'text-blue-700' : 'text-red-700'}`}>
              {formatCurrency(balance)}
            </div>
            <p className={`text-xs ${balance >= 0 ? 'text-blue-600 font-medium' : 'text-red-600'}`}>
              {balance >= 0 ? 'Positivo' : 'Negativo'}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chat do WhatsApp - Funcionalidade Principal */}
        <div className="lg:col-span-1">
          <WhatsAppSimulator 
            transactions={transactions}
            onAddTransaction={(transaction) => {
              // A função addTransaction será chamada pelo hook useTransactions
              console.log('Nova transação via chat:', transaction);
            }}
          />
        </div>

        {/* Resumo Geral */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Resumo Geral</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total de Gastos</span>
                <span className="font-semibold text-red-600">
                  {formatCurrency(transactions.filter(t => t.type === 'gasto').reduce((sum, t) => sum + t.value, 0))}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total de Ganhos</span>
                <span className="font-semibold text-green-600">
                  {formatCurrency(transactions.filter(t => t.type === 'lucro').reduce((sum, t) => sum + t.value, 0))}
                </span>
              </div>
              <div className="border-t pt-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Saldo Total</span>
                  <span className={`font-bold ${
                    transactions.filter(t => t.type === 'lucro').reduce((sum, t) => sum + t.value, 0) -
                    transactions.filter(t => t.type === 'gasto').reduce((sum, t) => sum + t.value, 0) >= 0
                    ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatCurrency(
                      transactions.filter(t => t.type === 'lucro').reduce((sum, t) => sum + t.value, 0) -
                      transactions.filter(t => t.type === 'gasto').reduce((sum, t) => sum + t.value, 0)
                    )}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Últimas Transações */}
          <Card>
            <CardHeader>
              <CardTitle>Últimas Transações</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {transactions.slice(0, 5).map((transaction) => (
                  <div key={transaction.id} className="flex justify-between items-center py-2 border-b last:border-b-0">
                    <div className="flex items-center gap-2">
                      {transaction.type === 'lucro' ? (
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-600" />
                      )}
                      <span className="text-sm">{transaction.description}</span>
                    </div>
                    <span className={`font-medium ${
                      transaction.type === 'lucro' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'lucro' ? '+' : '-'}{formatCurrency(transaction.value)}
                    </span>
                  </div>
                ))}
                {transactions.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">
                    Nenhuma transação registrada ainda.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
