from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv
import os
import openai
from fastapi.middleware.cors import CORSMiddleware

# Verificar se o arquivo .env existe antes de carregar
if not os.path.exists(".env"):
    raise Exception("Arquivo .env não encontrado. Certifique-se de que ele está na raiz do projeto.")
load_dotenv()

# Inicializar OpenAI com chave da API
openai.api_key = os.getenv("OPENAI_API_KEY")

# Verificação de chave da API
if not openai.api_key:
    raise Exception("Chave da API OpenAI não encontrada no arquivo .env. Adicione 'OPENAI_API_KEY' com um valor válido.")

# App FastAPI
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permitir todas as origens
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
        # Conexão com a API OpenAI
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
    except openai.error.OpenAIError as e:
        # Tratamento de erro específico da API OpenAI
        raise HTTPException(status_code=500, detail=f"Erro na API OpenAI: {str(e)}")
    except Exception as e:
        # Tratamento de erros gerais
        raise HTTPException(status_code=500, detail=f"Erro inesperado: {str(e)}")