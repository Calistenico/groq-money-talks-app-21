
import { useState, useRef } from 'react';
import { toast } from 'sonner';

export const useAudioRecording = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/wav' });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      toast.success('Gravação iniciada');
    } catch (error) {
      toast.error('Erro ao acessar o microfone');
      console.error('Erro:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      toast.success('Gravação finalizada');
    }
  };

  const transcribeAudio = async (blob: Blob): Promise<string> => {
    // Aqui seria implementada a integração com GROQ
    // Por enquanto, retornamos uma mensagem simulada
    toast.info('Transcrição com GROQ será implementada em breve');
    return 'Transcrição simulada do áudio';
  };

  return {
    isRecording,
    audioBlob,
    startRecording,
    stopRecording,
    transcribeAudio
  };
};
