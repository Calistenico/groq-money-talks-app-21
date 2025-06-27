
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export const AdminPanel = () => {
  const [apiKey, setApiKey] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [qrCode, setQrCode] = useState('');

  const handleConnect = async () => {
    if (!apiKey.trim()) {
      toast.error('Digite a chave da Evolution API');
      return;
    }

    try {
      // Simular conexão com Evolution API
      toast.success('API conectada com sucesso!');
      setIsConnected(true);
      
      // Simular geração de QR Code
      setQrCode('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==');
    } catch (error) {
      toast.error('Erro ao conectar com a Evolution API');
    }
  };

  const handleSendWelcomeMessage = async () => {
    try {
      // Simular envio de mensagem de boas-vindas
      toast.success('Mensagem de boas-vindas configurada!');
    } catch (error) {
      toast.error('Erro ao configurar mensagem de boas-vindas');
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
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Digite sua chave da Evolution API"
            />
          </div>

          <Button 
            onClick={handleConnect}
            className="w-full"
            disabled={isConnected}
          >
            {isConnected ? 'API Conectada ✅' : 'Conectar API'}
          </Button>

          {isConnected && (
            <div className="space-y-4">
              <div className="p-4 border rounded-lg bg-green-50">
                <h3 className="font-semibold text-green-800 mb-2">Status: Conectado</h3>
                <p className="text-sm text-green-600">Evolution API está funcionando corretamente</p>
              </div>

              {qrCode && (
                <div className="text-center space-y-2">
                  <h3 className="font-semibold">Conectar WhatsApp</h3>
                  <div className="border p-4 rounded-lg bg-white">
                    <p className="text-sm text-gray-600 mb-2">Escaneie o QR Code com o WhatsApp</p>
                    <div className="w-48 h-48 mx-auto bg-gray-200 flex items-center justify-center">
                      <p className="text-gray-500">QR Code será gerado aqui</p>
                    </div>
                  </div>
                </div>
              )}

              <Button 
                onClick={handleSendWelcomeMessage}
                variant="outline"
                className="w-full"
              >
                Configurar Mensagem de Boas-vindas
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
