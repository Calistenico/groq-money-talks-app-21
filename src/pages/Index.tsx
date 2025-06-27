
import { AuthForm } from '@/components/AuthForm';
import { Dashboard } from '@/components/Dashboard';
import { WhatsAppSimulator } from '@/components/WhatsAppSimulator';
import { Header } from '@/components/Header';
import { useAuth } from '@/hooks/useAuth';
import { useTransactions } from '@/hooks/useTransactions';
import { useIsMobile } from '@/hooks/use-mobile';

const Index = () => {
  const { user } = useAuth();
  const { transactions, addTransaction } = useTransactions();
  const isMobile = useIsMobile();

  if (!user) {
    return <AuthForm />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <Header />
      
      <div className="container mx-auto px-2 md:px-4 py-4 md:py-8">
        <div className={`grid gap-4 md:gap-8 ${
          isMobile 
            ? 'grid-cols-1' 
            : 'grid-cols-1 lg:grid-cols-2'
        }`}>
          {/* WhatsApp Simulator - Primeira no mobile */}
          <div className={isMobile ? 'order-1' : 'order-1 lg:order-2'}>
            <WhatsAppSimulator 
              transactions={transactions}
              onAddTransaction={addTransaction}
            />
          </div>
          
          {/* Dashboard - Segunda no mobile */}
          <div className={isMobile ? 'order-2' : 'order-2 lg:order-1'}>
            <Dashboard transactions={transactions} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
