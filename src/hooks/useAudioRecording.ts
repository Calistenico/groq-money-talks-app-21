
import { useState, useRef } from 'react';
import { toast } from 'sonner';

export const useAudioRecording = () => {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      console.log('Iniciando gravação de áudio...');
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        }
      });
      
      // Verificar se o navegador suporta os codecs necessários
      const options = { mimeType: 'audio/webm;codecs=opus' };
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        console.warn('Codec preferido não suportado, usando padrão');
        options.mimeType = 'audio/webm';
      }
      
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        console.log('Dados de áudio disponíveis:', event.data.size);
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onerror = (event) => {
        console.error('Erro no MediaRecorder:', event);
        toast.error('Erro durante a gravação');
      };

      mediaRecorder.start(100); // Capturar dados a cada 100ms
      setIsRecording(true);
      toast.info('Gravação iniciada...');
      
    } catch (error) {
      console.error('Erro ao iniciar gravação:', error);
      if (error.name === 'NotAllowedError') {
        toast.error('Permissão de microfone negada');
      } else if (error.name === 'NotFoundError') {
        toast.error('Microfone não encontrado');
      } else {
        toast.error('Erro ao acessar microfone');
      }
    }
  };

  const stopRecording = (): Promise<Blob | null> => {
    return new Promise((resolve) => {
      const mediaRecorder = mediaRecorderRef.current;
      
      if (!mediaRecorder || mediaRecorder.state === 'inactive') {
        console.warn('MediaRecorder não está ativo');
        resolve(null);
        return;
      }

      mediaRecorder.onstop = () => {
        console.log('Gravação finalizada, processando chunks:', chunksRef.current.length);
        
        if (chunksRef.current.length === 0) {
          console.warn('Nenhum chunk de áudio capturado');
          toast.error('Nenhum áudio foi capturado');
          resolve(null);
          return;
        }

        const audioBlob = new Blob(chunksRef.current, { 
          type: 'audio/webm;codecs=opus' 
        });
        
        console.log('Blob de áudio criado:', {
          size: audioBlob.size,
          type: audioBlob.type
        });
        
        // Parar todas as tracks do stream
        mediaRecorder.stream.getTracks().forEach(track => {
          track.stop();
          console.log('Track parada:', track.kind);
        });
        
        setIsRecording(false);
        toast.success('Gravação finalizada!');
        resolve(audioBlob);
      };

      console.log('Parando gravação...');
      mediaRecorder.stop();
    });
  };

  return {
    isRecording,
    startRecording,
    stopRecording
  };
};
