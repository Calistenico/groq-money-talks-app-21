
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { processMessage } from '@/utils/messageProcessor';
import { toast } from 'sonner';
import { Transaction } from '@/hooks/useTransactions';
import { Mic, MicOff } from 'lucide-react';
import { useAudioRecording } from '@/hooks/useAudioRecording';

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
      text: '🤖 Olá! Sou seu assistente financeiro!\nEnvie mensagens como:\n💸 "gastei 20 com marmita"\n💰 "ganhei 50 do freelance"\n📊 "saldo do dia", "lucro do dia"',
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
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
      const audioBlob = await stopRecording();
      if (audioBlob) {
        await transcribeAudio(audioBlob);
      }
    } else {
      await startRecording();
    }
  };

  const transcribeAudio = async (audioBlob: Blob) => {
    try {
      toast.info('Transcrevendo áudio...');
      
      // Converter para base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Audio = (reader.result as string).split(',')[1];
        
        const response = await fetch('/api/transcribe-audio', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ audio: base64Audio }),
        });

        if (response.ok) {
          const { text } = await response.json();
          setInputMessage(text);
          toast.success('Áudio transcrito com sucesso!');
        } else {
          toast.error('Erro ao transcrever áudio');
        }
      };
      
      reader.readAsDataURL(audioBlob);
    } catch (error) {
      console.error('Erro na transcrição:', error);
      toast.error('Erro ao transcrever áudio');
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
            <div className="flex-1 flex gap-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Digite sua mensagem..."
                className="flex-1 text-sm md:text-base"
              />
              <Button
                onClick={handleVoiceRecord}
                variant="outline"
                size="icon"
                className={`flex-shrink-0 ${isRecording ? 'bg-red-500 text-white animate-pulse' : ''}`}
              >
                {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
            </div>
            <Button 
              onClick={sendMessage}
              className="bg-green-500 hover:bg-green-600 flex-shrink-0"
              size="default"
            >
              Enviar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
