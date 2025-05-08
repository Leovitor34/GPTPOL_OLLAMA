import { NextResponse } from 'next/server';

// Função para enviar a resposta em stream
export async function POST(request) {
  try {
    const body = await request.json();
    const { prompt, thinkknMode, chatId } = body;
    
    // Usar o endpoint de streaming com tempo limite otimizado
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 segundos de timeout
    
    try {
      // Iniciar a requisição ao backend
      const backendResponse = await fetch('http://localhost:8000/perguntar_stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          pergunta: prompt,
          thinkknMode: true  // Forçando o modo de pensamento a ser sempre ativado
        }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      if (!backendResponse.ok) {
        // Se o backend retornou erro, criar uma resposta padrão sem exibir o erro
        return NextResponse.json({ 
          success: true, 
          data: { 
            role: "assistant", 
            content: "Desculpe, não consegui processar sua solicitação. Por favor, tente novamente com uma pergunta diferente.",
            timestamp: Date.now()
          } 
        });
      }

      // Implementação otimizada para processamento rápido
      const reader = backendResponse.body.getReader();
      let completeResponse = "";
      let readerDone = false;
      let thinkTagProcessed = false;
      
      // Adicionar ao processamento do stream para manter controle do estado
      global.currentThinkState = "";
      
      // Processar a resposta de forma mais eficiente, sem esperar pelo stream completo
      const processFullResponse = async () => {
        try {
          while (!readerDone) {
            const { done, value } = await reader.read();
            if (done) {
              readerDone = true;
              break;
            }
            
            const chunk = new TextDecoder().decode(value);
            const lines = chunk.split('\n');
            
            for (const line of lines) {
              if (!line.trim()) continue;
              try {
                const data = JSON.parse(line);
                if (data.token) {
                  const formattedToken = formatThinkTags(data.token);
                  completeResponse += formattedToken;
                  global.currentThinkState = completeResponse; // Manter estado
                }
                if (data.error) {
                  console.error("Erro no streaming:", data.error);
                }
              } catch (e) {
                // Ignorar linhas que não são JSON válido
              }
            }
          }
          
          // No final do processamento, limpar o estado
          global.currentThinkState = "";
          
          // Retornar a resposta completa para processamento
          return completeResponse;
        } catch (e) {
          console.error("Erro ao processar stream:", e);
          return "Desculpe, ocorreu um erro ao processar sua solicitação.";
        }
      };

      // Iniciar o processamento e aguardar até ter uma resposta completa
      const fullResponse = await processFullResponse();

      // Se a resposta estiver vazia ou incompleta, retornar mensagem de erro
      if (!fullResponse.trim() || fullResponse === "<think>") {
        return NextResponse.json({ 
          success: true, 
          data: { 
            role: "assistant", 
            content: "Desculpe, não consegui processar sua solicitação. Por favor, tente novamente.",
            timestamp: Date.now()
          } 
        });
      }

      // Formatando a resposta no formato esperado pelo frontend
      return NextResponse.json({ 
        success: true, 
        data: { 
          role: "assistant", 
          content: fullResponse,
          timestamp: Date.now()
        } 
      });
    } catch (error) {
      clearTimeout(timeoutId);
      
      // Retornar uma resposta padrão em caso de erro
      return NextResponse.json({ 
        success: true, 
        data: { 
          role: "assistant", 
          content: "Desculpe, ocorreu um erro ao processar sua solicitação. Por favor, tente novamente mais tarde.",
          timestamp: Date.now()
        } 
      });
    }
  } catch (error) {
    // Retornar uma resposta padrão em caso de erro
    return NextResponse.json({ 
      success: true, 
      data: { 
        role: "assistant", 
        content: "Desculpe, ocorreu um erro ao processar sua solicitação. Por favor, tente novamente mais tarde.",
        timestamp: Date.now()
      } 
    });
  }
}

// Adicionar esta função no mesmo nível das outras funções:
function formatThinkTags(text) {
  // Se o texto for nulo ou vazio, retorna como está
  if (!text) return text;

  try {
    // Transformar o conteúdo dentro das tags <think> de maneira simples
    if (text.includes('<think>')) {
      // Apenas aplicar a classe CSS thinking-text
      return text.replace(/<think>/g, '<think><span class="thinking-text">');
    } 
    else if (text.includes('</think>')) {
      // Fecha a tag span quando encontrar </think>
      return text.replace(/<\/think>/g, '</span></think>');
    }
    
    // Verifica se o texto já está dentro de tags <think> (sem tags explícitas)
    const parentText = global.currentThinkState || "";
    if (parentText.includes('<think>') && !parentText.includes('</think>')) {
      // Estamos dentro de um bloco de pensamento - aplicar apenas a classe
      return text;
    }
    
    return text;
  } catch (error) {
    console.error("Erro ao formatar tags think:", error);
    return text; // Em caso de erro, retorna o texto original
  }
}