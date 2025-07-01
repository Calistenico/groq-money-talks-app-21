
import { useAuth } from "@/hooks/useAuth";
import { useTransactions } from "@/hooks/useTransactions";
import { AuthForm } from "@/components/AuthForm";
import { Dashboard } from "@/components/Dashboard";
import { ExpenseReport } from "@/components/reports/ExpenseReport";
import { Header } from "@/components/Header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Home } from "lucide-react";
import { WhatsAppSimulator } from "@/components/WhatsAppSimulator";

const Index = () => {
  const { user, loading } = useAuth();
  const { transactions, addTransaction, loading: transactionsLoading } = useTransactions();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <Header />
      
      <main className="container mx-auto px-4 py-6">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:w-96 mx-auto">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Relatórios
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <div className="space-y-6">
              <Dashboard transactions={transactions} />
              
              {/* Chat Principal - Sempre visível */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-bold mb-4 text-center">💬 Assistente Financeiro WhatsApp</h2>
                <WhatsAppSimulator 
                  transactions={transactions}
                  onAddTransaction={addTransaction}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="reports">
            <ExpenseReport />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
