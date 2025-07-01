
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
  const [isCreating, setIsCreating] = useState(false);

  const createInstance = async () => {
    if (!instanceName.trim()) {
      toast.error('Digite um nome para a instância');
      return;
    }

    setIsCreating(true);
    
    try {
      toast.info('Criando instância...');
      console.log('Tentando criar instância com:', { instanceName, evolutionApiKey });
      
      // Payload exato do seu script que funciona
      const payload = {
        instanceName: instanceName.trim(),
        token: "",
        qrcode: true,
        integration: "WHATSAPP-BAILEYS"
      };
      
      console.log('Payload enviado:', payload);
      
      const response = await fetch('https://v2.solucoesweb.uk/instance/create', {
        method: 'POST',
        headers: {
          'apikey': evolutionApiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      const responseText = await response.text();
      console.log('Response completa (texto):', responseText);
      
      let data;
      try {
        data = JSON.parse(responseText);
        console.log('Response parseada:', data);
      } catch (parseError) {
        console.error('Erro ao fazer parse da resposta:', parseError);
        throw new Error(`Resposta inválida da API: ${responseText.substring(0, 200)}...`);
      }
      
      if (response.ok) {
        console.log('✅ Instância criada com sucesso:', data);
        setInstanceData(data);
        setIsConnected(true);
        toast.success('Instância criada com sucesso!');
        
        // Verificar se QR Code veio na resposta
        if (data.qrcode && data.qrcode.base64) {
          setQrCode(data.qrcode.base64);
          toast.success('QR Code gerado! Escaneie com o WhatsApp');
        } else {
          // Aguardar um pouco antes de buscar QR Code
          setTimeout(() => {
            getQRCode();
          }, 2000);
        }
      } else {
        console.error('❌ Erro na resposta da API:', data);
        let errorMessage = `Erro ${response.status}: ${data?.message || data?.error || response.statusText}`;
        toast.error(errorMessage);
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('🚨 Erro detalhado ao criar instância:', error);
      
      if (error.message.includes('fetch')) {
        toast.error('Erro de conexão. Verifique sua internet e tente novamente.');
      } else if (!error.message.includes('Erro')) {
        toast.error(`Erro de conexão: ${error.message}`);
      }
    } finally {
      setIsCreating(false);
    }
  };

  const getQRCode = async () => {
    try {
      console.log('🔍 Buscando QR Code para instância:', instanceName);
      
      const response = await fetch(`https://v2.solucoesweb.uk/instance/connect/${instanceName}`, {
        method: 'GET',
        headers: {
          'apikey': evolutionApiKey
        }
      });

      console.log('QR Response status:', response.status);
      const responseText = await response.text();
      console.log('QR Response:', responseText);

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Erro ao fazer parse do QR:', parseError);
        toast.error('Erro ao processar resposta do QR Code');
        return;
      }
      
      if (response.ok) {
        if (data.base64) {
          setQrCode(data.base64);
          toast.success('QR Code gerado! Escaneie com o WhatsApp');
        } else if (data.code) {
          setQrCode(data.code);
          toast.success('QR Code gerado! Escaneie com o WhatsApp');
        } else {
          console.log('QR Code não disponível ainda, tentando novamente em 3s...');
          toast.info('Aguardando QR Code...');
          setTimeout(() => {
            getQRCode();
          }, 3000);
        }
      } else {
        console.error('Erro ao buscar QR Code:', data);
        toast.error(`Erro ao buscar QR Code: ${data?.message || 'Erro desconhecido'}`);
      }
    } catch (error) {
      console.error('Erro ao buscar QR Code:', error);
      toast.error('Erro de conexão ao buscar QR Code');
    }
  };

  const checkInstanceStatus = async () => {
    if (!instanceName) return;
    
    try {
      console.log('🔄 Verificando status da instância:', instanceName);
      
      const response = await fetch(`https://v2.solucoesweb.uk/instance/connectionState/${instanceName}`, {
        method: 'GET',
        headers: {
          'apikey': evolutionApiKey
        }
      });

      console.log('Status response:', response.status);
      const responseText = await response.text();
      console.log('Status response text:', responseText);

      const data = JSON.parse(responseText);
      console.log('Status da instância:', data);
      
      if (data.instance?.state === 'open') {
        toast.success('WhatsApp conectado com sucesso!');
        setQrCode('');
      } else if (data.instance?.state === 'connecting') {
        toast.info('Conectando ao WhatsApp...');
      } else if (data.instance?.state === 'close') {
        toast.warning('WhatsApp desconectado');
      } else {
        toast.info(`Status: ${data.instance?.state || 'Desconhecido'}`);
      }
    } catch (error) {
      console.error('Erro ao verificar status:', error);
      toast.error('Erro ao verificar status da instância');
    }
  };

  const logoutInstance = async () => {
    try {
      console.log('🚪 Desligando instância:', instanceName);
      
      const response = await fetch(`https://v2.solucoesweb.uk/instance/logout/${instanceName}`, {
        method: 'DELETE',
        headers: {
          'apikey': evolutionApiKey
        }
      });

      const data = await response.json();
      console.log('Logout response:', data);
      
      if (response.ok) {
        toast.success('Instância desligada com sucesso!');
        setQrCode('');
      } else {
        toast.error('Erro ao desligar instância');
      }
    } catch (error) {
      console.error('Erro ao desligar instância:', error);
      toast.error('Erro ao desligar instância');
    }
  };

  const deleteInstance = async () => {
    try {
      console.log('🗑️ Excluindo instância:', instanceName);
      
      const response = await fetch(`https://v2.solucoesweb.uk/instance/delete/${instanceName}`, {
        method: 'DELETE',
        headers: {
          'apikey': evolutionApiKey
        }
      });

      const data = await response.json();
      console.log('Delete response:', data);
      
      if (response.ok) {
        toast.success('Instância excluída com sucesso!');
        setIsConnected(false);
        setQrCode('');
        setInstanceData(null);
        setInstanceName('');
      } else {
        toast.error('Erro ao excluir instância');
      }
    } catch (error) {
      console.error('Erro ao excluir instância:', error);
      toast.error('Erro ao excluir instância');
    }
  };

  const sendTestMessage = async () => {
    try {
      const message = `👋 Teste de mensagem do sistema!\nData: ${new Date().toLocaleString()}\nSistema funcionando corretamente! 🎉`;
      
      console.log('📤 Enviando mensagem de teste...');
      
      const response = await fetch(`https://v2.solucoesweb.uk/message/sendText/${instanceName}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': evolutionApiKey
        },
        body: JSON.stringify({
          number: '5544991082160',
          text: message
        })
      });

      const responseText = await response.text();
      console.log('Resposta do envio:', responseText);

      if (response.ok) {
        toast.success('Mensagem de teste enviada com sucesso!');
      } else {
        throw new Error('Erro ao enviar mensagem de teste');
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast.error('Erro ao enviar mensagem de teste');
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
              placeholder="Ex: financeiro, meuwhatsapp"
            />
            <p className="text-xs text-gray-500">
              Use apenas letras, números e hífen. Sem espaços ou caracteres especiais.
            </p>
          </div>

          <Button 
            onClick={createInstance}
            className="w-full"
            disabled={isConnected || isCreating}
          >
            {isCreating ? 'Criando...' : isConnected ? 'Instância Criada ✅' : 'Criar Instância'}
          </Button>

          {/* Debug da resposta */}
          {instanceData && (
            <div className="p-4 border rounded-lg bg-gray-50">
              <h3 className="font-semibold mb-2">✅ Resposta da API:</h3>
              <pre className="text-xs bg-white p-2 rounded border overflow-auto max-h-32 whitespace-pre-wrap">
                {JSON.stringify(instanceData, null, 2)}
              </pre>
            </div>
          )}

          {isConnected && (
            <div className="space-y-4">
              <div className="p-4 border rounded-lg bg-green-50">
                <h3 className="font-semibold text-green-800 mb-2">✅ Status: Conectado</h3>
                <p className="text-sm text-green-600">Evolution API está funcionando</p>
                <p className="text-sm text-green-600">Instância: <strong>{instanceName}</strong></p>
                
                <div className="flex gap-2 mt-3">
                  <Button 
                    onClick={checkInstanceStatus}
                    variant="outline"
                    size="sm"
                  >
                    🔄 Verificar Status
                  </Button>
                  <Button 
                    onClick={logoutInstance}
                    variant="outline"
                    size="sm"
                  >
                    🚪 Desligar
                  </Button>
                  <Button 
                    onClick={deleteInstance}
                    variant="outline"
                    size="sm"
                    className="text-red-600 border-red-600 hover:bg-red-50"
                  >
                    🗑️ Excluir
                  </Button>
                </div>
              </div>

              {qrCode && (
                <div className="text-center space-y-2">
                  <h3 className="font-semibold">📱 Conectar WhatsApp</h3>
                  <div className="border p-4 rounded-lg bg-white">
                    <p className="text-sm text-gray-600 mb-2">Escaneie o QR Code com o WhatsApp</p>
                    <div className="flex justify-center">
                      <img 
                        src={qrCode.startsWith('data:') ? qrCode : `data:image/png;base64,${qrCode}`}
                        alt="QR Code"
                        className="max-w-64 max-h-64 border rounded"
                      />
                    </div>
                  </div>
                  <Button 
                    onClick={checkInstanceStatus}
                    variant="outline"
                    size="sm"
                  >
                    🔄 Verificar Conexão
                  </Button>
                </div>
              )}

              <div className="p-4 border rounded-lg bg-blue-50">
                <h3 className="font-semibold text-blue-800 mb-2">📤 Teste de Mensagem</h3>
                <p className="text-sm text-blue-600 mb-2">Enviar mensagem de teste:</p>
                <Button 
                  onClick={sendTestMessage}
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
