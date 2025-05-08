import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import os from 'os';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json(
        { error: 'Nenhum arquivo enviado' },
        { status: 400 }
      );
    }

    // Verificar o tipo de arquivo
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Tipo de arquivo não suportado' },
        { status: 400 }
      );
    }

    // Converter arquivo para buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Criar nome único para o arquivo
    const fileName = `${uuidv4()}-${file.name}`;
    
    // Salvar arquivo temporariamente para processamento
    const tempDir = os.tmpdir();
    const tempFilePath = join(tempDir, fileName);
    await writeFile(tempFilePath, buffer);

    // Para este exemplo, apenas extraímos o texto do arquivo se for txt
    // Para outros tipos, seria necessário usar bibliotecas específicas
    let extractedText = '';
    
    if (file.type === 'text/plain') {
      extractedText = buffer.toString('utf-8');
    } else {
      // Simulando extração de texto para outros tipos
      extractedText = `Conteúdo extraído do arquivo: ${file.name}\n\nEste é um texto de exemplo extraído automaticamente do arquivo enviado. Em um sistema real, o texto seria extraído usando bibliotecas específicas para cada tipo de arquivo (PDF, DOCX, etc).`;
    }

    // Responder com o texto extraído
    return NextResponse.json({
      success: true,
      text: extractedText,
      fileInfo: {
        name: file.name,
        type: file.type,
        size: file.size,
      }
    });
  } catch (error) {
    console.error('Erro ao processar o arquivo:', error);
    return NextResponse.json(
      { error: 'Erro ao processar o arquivo', detail: error.message },
      { status: 500 }
    );
  }
} 