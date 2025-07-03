
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { processMessage } from '@/utils/messageProcessor';
import { toast } from 'sonner';
import { Transaction } from '@/hooks/useTransactions';
import { Mic, MicOff, Send } from 'lucide-react';
import { useAudioRecording } from '@/hooks/useAudioRecording';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface WhatsAppSimulatorProps {
  transactions: Transaction[];
  onAddTransaction: (transaction: Omit<Transaction, 'id' | 'user_phone'>) => void;
}

export const WhatsAppSimulator = ({ transactions, onAddTransaction }: WhatsAppSimulatorProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: '🤖 Olá! Sou seu assistente financeiro!\nEnvie mensagens como:\n💸 "gastei 20 com marmita"\n💰 "ganhei 50 do freelance"\n📊 "saldo do dia", "lucro do dia"\n🎤 Ou use o microfone para gravar áudios!',
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const { isRecording, startRecording, stopRecording } = useAudioRecording();

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);

    // Processar mensagem
    const response = await processMessage(inputMessage, transactions, onAddTransaction);

    const botMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: response,
      isUser: false,
      timestamp: new Date()
    };

    setTimeout(() => {
      setMessages(prev => [...prev, botMessage]);
    }, 500);

    setInputMessage('');
    toast.success('Mensagem enviada!');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleVoiceRecord = async () => {
    if (isRecording) {
      console.log('🛑 Parando gravação...');
      const audioBlob = await stopRecording();
      if (audioBlob) {
        await transcribeAudio(audioBlob);
      }
    } else {
      console.log('🎙️ Iniciando gravação...');
      await startRecording();
    }
  };

  const transcribeAudio = async (audioBlob: Blob) => {
    try {
      setIsTranscribing(true);
      toast.info('🎤 Transcrevendo áudio...');
      
      console.log('📁 Convertendo áudio para base64...');
      console.log('📊 Tamanho do áudio:', audioBlob.size, 'bytes');
      console.log('🎵 Tipo do áudio:', audioBlob.type);
      
      // Verificar se o áudio tem tamanho mínimo
      if (audioBlob.size < 1000) {
        throw new Error('Áudio muito curto. Grave por pelo menos 1 segundo.');
      }
      
      // Converter para base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64Audio = (reader.result as string).split(',')[1];
          console.log('✅ Base64 convertido, tamanho:', base64Audio.length);
          
          console.log('🚀 Chamando função de transcrição...');
          const { data, error } = await supabase.functions.invoke('transcribe-audio', {
            body: { audio: base64Audio }
          });

          if (error) {
            console.error('❌ Erro da função:', error);
            throw new Error(error.message || 'Erro na função de transcrição');
          }

          if (data && data.text) {
            console.log('✅ Texto transcrito:', data.text);
            setInputMessage(data.text);
            toast.success('🎤 Áudio transcrito com sucesso!');
          } else {
            console.error('❌ Resposta sem texto:', data);
            throw new Error('Nenhum texto foi transcrito do áudio');
          }
          
        } catch (transcriptionError) {
          console.error('💥 Erro na transcrição:', transcriptionError);
          
          // Mensagens de erro mais específicas
          let errorMessage = 'Erro ao transcrever áudio';
          if (transcriptionError.message.includes('GROQ_API_KEY')) {
            errorMessage = 'API GROQ não configurada. Configure no painel admin.';
          } else if (transcriptionError.message.includes('inválida')) {
            errorMessage = 'Chave da API GROQ inválida. Verifique a configuração.';
          } else if (transcriptionError.message.includes('áudio inválidos')) {
            errorMessage = 'Formato de áudio inválido. Tente gravar novamente.';
          } else if (transcriptionError.message.includes('muito curto')) {
            errorMessage = transcriptionError.message;
          }
          
          toast.error(`❌ ${errorMessage}`);
        } finally {
          setIsTranscribing(false);
        }
      };
      
      reader.onerror = () => {
        console.error('💥 Erro ao ler arquivo de áudio');
        toast.error('❌ Erro ao processar arquivo de áudio');
        setIsTranscribing(false);
      };
      
      reader.readAsDataURL(audioBlob);
    } catch (error) {
      console.error('💥 Erro geral na transcrição:', error);
      toast.error('❌ Erro ao processar áudio');
      setIsTranscribing(false);
    }
  };

  return (
    <Card className="h-[90vh] md:h-[600px] flex flex-col max-w-full">
      <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-t-lg flex-shrink-0">
        <CardTitle className="flex items-center gap-2 text-sm md:text-base">
          <div className="w-3 h-3 bg-green-300 rounded-full animate-pulse"></div>
          Assistente Financeiro WhatsApp
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0 min-h-0">
        <ScrollArea className="flex-1 p-2 md:p-4 bg-gray-50 min-h-0">
          <div className="space-y-3 md:space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] md:max-w-[80%] p-2 md:p-3 rounded-lg text-sm md:text-base ${
                    message.isUser
                      ? 'bg-blue-500 text-white rounded-br-none'
                      : 'bg-white text-gray-800 rounded-bl-none shadow-sm border'
                  }`}
                >
                  <p className="whitespace-pre-line break-words">{message.text}</p>
                  <p className={`text-xs mt-1 ${
                    message.isUser ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {message.timestamp.toLocaleTimeString('pt-BR', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        
        <div className="p-2 md:p-4 border-t bg-white flex-shrink-0">
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Digite sua mensagem ou use o microfone..."
                className="text-sm md:text-base"
                disabled={isTranscribing}
              />
            </div>
            
            <Button
              onClick={handleVoiceRecord}
              variant="outline"
              size="icon"
              className={`flex-shrink-0 ${
                isRecording 
                  ? 'bg-red-500 text-white animate-pulse border-red-500' 
                  : isTranscribing 
                  ? 'bg-yellow-500 text-white border-yellow-500'
                  : 'hover:bg-gray-50'
              }`}
              disabled={isTranscribing}
              title={
                isTranscribing 
                  ? 'Transcrevendo áudio...' 
                  : isRecording 
                  ? 'Clique para parar a gravação' 
                  : 'Clique para gravar áudio'
              }
            >
              {isTranscribing ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : isRecording ? (
                <MicOff className="h-4 w-4" />
              ) : (
                <Mic className="h-4 w-4" />
              )}
            </Button>
            
            <Button 
              onClick={sendMessage}
              className="bg-green-500 hover:bg-green-600 flex-shrink-0"
              size="icon"
              disabled={!inputMessage.trim() || isTranscribing}
              title="Enviar mensagem"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          
          {isTranscribing && (
            <div className="mt-2 text-center">
              <p className="text-xs text-gray-500">🎤 Transcrevendo áudio, aguarde...</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
