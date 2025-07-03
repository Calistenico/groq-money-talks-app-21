
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Função para processar base64 em chunks para evitar problemas de memória
function processBase64InChunks(base64String: string, chunkSize = 32768) {
  try {
    console.log(`Processando base64 de tamanho: ${base64String.length}`);
    
    const chunks: Uint8Array[] = [];
    let position = 0;
    
    while (position < base64String.length) {
      const chunk = base64String.slice(position, position + chunkSize);
      const binaryChunk = atob(chunk);
      const bytes = new Uint8Array(binaryChunk.length);
      
      for (let i = 0; i < binaryChunk.length; i++) {
        bytes[i] = binaryChunk.charCodeAt(i);
      }
      
      chunks.push(bytes);
      position += chunkSize;
    }

    const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
    const result = new Uint8Array(totalLength);
    let offset = 0;

    for (const chunk of chunks) {
      result.set(chunk, offset);
      offset += chunk.length;
    }

    console.log(`Base64 processado com sucesso. Tamanho final: ${result.length} bytes`);
    return result;
  } catch (error) {
    console.error('Erro ao processar base64:', error);
    throw new Error('Erro ao processar áudio base64');
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('=== INICIANDO TRANSCRIÇÃO DE ÁUDIO ===');
    
    const { audio } = await req.json();
    
    if (!audio) {
      throw new Error('Nenhum dado de áudio fornecido');
    }

    console.log('Áudio recebido, tamanho do base64:', audio.length);

    // Processar áudio em chunks para evitar problemas de memória
    const audioBytes = processBase64InChunks(audio);

    // Preparar FormData para GROQ API
    const formData = new FormData();
    const audioBlob = new Blob([audioBytes], { type: 'audio/webm' });
    formData.append('file', audioBlob, 'audio.webm');
    formData.append('model', 'whisper-large-v3');
    formData.append('response_format', 'json');
    formData.append('language', 'pt');
    formData.append('temperature', '0');

    console.log('Enviando para GROQ API...');

    // Obter chave da GROQ das secrets do Supabase
    const groqApiKey = Deno.env.get('GROQ_API_KEY');
    
    if (!groqApiKey) {
      console.error('❌ GROQ_API_KEY não encontrada nos secrets');
      throw new Error('Chave da API GROQ não configurada. Configure a GROQ_API_KEY nos secrets do Supabase.');
    }
    
    console.log('✅ GROQ_API_KEY encontrada, iniciando transcrição...');
    console.log('🔑 Chave GROQ (primeiros 10 chars):', groqApiKey.substring(0, 10) + '...');

    // Chamar GROQ API
    const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
      },
      body: formData,
    });

    console.log('Status da resposta GROQ:', response.status);
    console.log('Headers da resposta:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erro da GROQ API:', errorText);
      console.error('Status:', response.status);
      console.error('StatusText:', response.statusText);
      
      if (response.status === 401) {
        throw new Error('Chave da API GROQ inválida ou expirada. Verifique a configuração.');
      } else if (response.status === 400) {
        throw new Error('Dados de áudio inválidos. Tente gravar novamente.');
      } else {
        throw new Error(`Erro da GROQ API (${response.status}): ${errorText}`);
      }
    }

    const result = await response.json();
    console.log('✅ Transcrição concluída:', result);

    if (!result.text) {
      console.error('❌ Nenhum texto retornado:', result);
      throw new Error('Nenhum texto transcrito recebido da GROQ API');
    }

    console.log('🎤 Texto transcrito:', result.text);

    return new Response(
      JSON.stringify({ text: result.text }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('=== ERRO NA TRANSCRIÇÃO ===');
    console.error('Erro detalhado:', error);
    console.error('Stack trace:', error.stack);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Verifique os logs do console para mais detalhes'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
