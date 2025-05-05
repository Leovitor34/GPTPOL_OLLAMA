# main_api.py

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv
import os
import openai

# Carregar variáveis do .env
load_dotenv()

# Inicializar OpenAI com chave da API
openai.api_key = os.getenv("OPENAI_API_KEY")

# Verificação de chave
if not openai.api_key:
    raise Exception("Chave da API OpenAI não encontrada no .env")

# App FastAPI
app = FastAPI()

# Modelo da requisição
class Pergunta(BaseModel):
    pergunta: str

# Rota raiz
@app.get("/")
async def root():
    return {"message": "API GPTPOL está ativa."}

# Rota que envia a pergunta para a OpenAI
@app.post("/perguntar")
async def perguntar(p: Pergunta):
    try:
        resposta = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "Você é um assistente jurídico para delegacias de polícia."},
                {"role": "user", "content": p.pergunta}
            ],
            temperature=0.3,
            max_tokens=512
        )
        return {"resposta": resposta.choices[0].message["content"].strip()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
