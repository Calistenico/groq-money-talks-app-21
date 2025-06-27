
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export const AdminPanel = () => {
  const [evolutionApiKey, setEvolutionApiKey] = useState('cc2ad6931f7c17a9e98d10127c43dfbf');
  const [instanceName, setInstanceName] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [instanceData, setInstanceData] = useState<any>(null);

  const createInstance = async () => {
    if (!instanceName.trim()) {
      toast.error('Digite um nome para a instância');
      return;
    }

    try {
      toast.info('Criando instância...');
      
      const response = await fetch('https://v2.solucoesweb.uk/instance/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': evolutionApiKey
        },
        body: JSON.stringify({
          instanceName: instanceName,
          token: evolutionApiKey,
          qrcode: true,
          number: '',
          typebot: '',
          webhook: '',
          webhook_by_events: false,
          events: [],
          reject_call: false,
          msg_call: '',
          groups_ignore: false,
          always_online: false,
          read_messages: false,
          read_status: false,
          sync_full_history: false
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        setInstanceData(data);
        setIsConnected(true);
        toast.success('Instância criada com sucesso!');
        
        // Buscar QR Code
        await getQRCode();
      } else {
        throw new Error(data.message || 'Erro ao criar instância');
      }
    } catch (error) {
      console.error('Erro ao criar instância:', error);
      toast.error('Erro ao criar instância da Evolution API');
    }
  };

  const getQRCode = async () => {
    try {
      const response = await fetch(`https://v2.solucoesweb.uk/instance/connect/${instanceName}`, {
        method: 'GET',
        headers: {
          'apikey': evolutionApiKey
        }
      });

      const data = await response.json();
      
      if (data.base64) {
        setQrCode(data.base64);
      }
    } catch (error) {
      console.error('Erro ao buscar QR Code:', error);
      toast.error('Erro ao buscar QR Code');
    }
  };

  const checkInstanceStatus = async () => {
    if (!instanceName) return;
    
    try {
      const response = await fetch(`https://v2.solucoesweb.uk/instance/connectionState/${instanceName}`, {
        method: 'GET',
        headers: {
          'apikey': evolutionApiKey
        }
      });

      const data = await response.json();
      
      if (data.instance?.state === 'open') {
        toast.success('WhatsApp conectado com sucesso!');
        setQrCode('');
      }
    } catch (error) {
      console.error('Erro ao verificar status:', error);
    }
  };

  const sendWelcomeMessage = async (phone: string, email: string, tempPassword: string) => {
    try {
      const message = `👋 Olá, seja bem-vindo!\nAqui estão seus dados de acesso:\nUsuário: ${email}\nSenha: ${tempPassword}\nVocê ganhou 7 dias grátis para testar nosso sistema financeiro inteligente. Aproveite! 🎁`;
      
      const response = await fetch(`https://v2.solucoesweb.uk/message/sendText/${instanceName}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': evolutionApiKey
        },
        body: JSON.stringify({
          number: phone,
          text: message
        })
      });

      if (response.ok) {
        toast.success('Mensagem de boas-vindas enviada!');
      } else {
        throw new Error('Erro ao enviar mensagem');
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast.error('Erro ao enviar mensagem de boas-vindas');
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Painel Admin - Evolution API</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="apiKey">Chave da Evolution API</Label>
            <Input
              id="apiKey"
              type="password"
              value={evolutionApiKey}
              onChange={(e) => setEvolutionApiKey(e.target.value)}
              placeholder="Digite sua chave da Evolution API"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="instanceName">Nome da Instância</Label>
            <Input
              id="instanceName"
              value={instanceName}
              onChange={(e) => setInstanceName(e.target.value)}
              placeholder="Digite o nome da instância (ex: meu-whatsapp)"
            />
          </div>

          <Button 
            onClick={createInstance}
            className="w-full"
            disabled={isConnected}
          >
            {isConnected ? 'Instância Criada ✅' : 'Criar Instância'}
          </Button>

          {isConnected && (
            <div className="space-y-4">
              <div className="p-4 border rounded-lg bg-green-50">
                <h3 className="font-semibold text-green-800 mb-2">Status: Conectado</h3>
                <p className="text-sm text-green-600">Evolution API está funcionando corretamente</p>
                <p className="text-sm text-green-600">Instância: {instanceName}</p>
              </div>

              {qrCode && (
                <div className="text-center space-y-2">
                  <h3 className="font-semibold">Conectar WhatsApp</h3>
                  <div className="border p-4 rounded-lg bg-white">
                    <p className="text-sm text-gray-600 mb-2">Escaneie o QR Code com o WhatsApp</p>
                    <div className="flex justify-center">
                      <img 
                        src={`data:image/png;base64,${qrCode}`} 
                        alt="QR Code"
                        className="max-w-64 max-h-64"
                      />
                    </div>
                  </div>
                  <Button 
                    onClick={checkInstanceStatus}
                    variant="outline"
                    size="sm"
                  >
                    Verificar Conexão
                  </Button>
                </div>
              )}

              <div className="p-4 border rounded-lg bg-blue-50">
                <h3 className="font-semibold text-blue-800 mb-2">Teste de Mensagem</h3>
                <p className="text-sm text-blue-600 mb-2">Enviar mensagem de boas-vindas:</p>
                <Button 
                  onClick={() => sendWelcomeMessage('5511999999999', 'teste@email.com', '123456')}
                  variant="outline"
                  className="w-full"
                >
                  Enviar Mensagem de Teste
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
