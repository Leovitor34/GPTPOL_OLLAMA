import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    console.log('API frontend debug - Recebendo requisição');
    const body = await request.json();
    
    // Log detalhado dos parâmetros recebidos
    console.log(`[DEBUG API] Corpo da requisição:`, body);
    console.log(`[DEBUG API] Modo Thinkkn recebido: ${body.thinkknMode}`);
    
    // Verificar mais detalhes do valor thinkknMode para depuração
    const thinkknModeType = typeof body.thinkknMode;
    const thinkknModeJson = JSON.stringify(body.thinkknMode);
    
    console.log(`[DEBUG API] Tipo do valor thinkknMode: ${thinkknModeType}`);
    console.log(`[DEBUG API] Valor JSON de thinkknMode: ${thinkknModeJson}`);
    
    // Tentar também enviar para o backend para confirmar que o valor está chegando lá
    try {
      const backendResponse = await fetch('http://localhost:8000/api/debug', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          pergunta: "Debug do modo Thinkkn",
          thinkknMode: body.thinkknMode // Enviar o valor exato que recebemos
        }),
      });
      
      const backendData = await backendResponse.json();
      console.log(`[DEBUG API] Resposta do backend:`, backendData);
      
      return NextResponse.json({ 
        success: true, 
        body: body,
        backend_response: backendData,
        thinkknMode: {
          value: body.thinkknMode,
          type: thinkknModeType,
          json: thinkknModeJson
        },
        message: 'Valores recebidos e enviados ao backend com sucesso' 
      });
    } catch (backendError) {
      console.error('[DEBUG API] Erro ao comunicar com backend:', backendError);
      
      return NextResponse.json({ 
        success: true, 
        body: body,
        thinkknMode: {
          value: body.thinkknMode,
          type: thinkknModeType,
          json: thinkknModeJson
        },
        backend_error: backendError.message,
        message: 'Valores recebidos com sucesso, mas erro ao comunicar com backend' 
      });
    }
  } catch (error) {
    console.error('[DEBUG API] Erro no processamento:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
} 