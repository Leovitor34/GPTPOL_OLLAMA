#!/bin/bash

echo "╔════════════════════════════════════════════╗"
echo "║         🚀 INICIANDO GPTPOL                ║"
echo "║         NEXORTECH SOLUTIONS                ║"
echo "╚════════════════════════════════════════════╝"

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Diretórios
PROJECT_DIR="/mnt/projetos_nexor/Servidor_Nexortech/Projetos/GPTPOL_OPENAI"
BACKEND_DIR="$PROJECT_DIR/backend"
FRONTEND_DIR="$PROJECT_DIR/frontend"
LOGS_DIR="$PROJECT_DIR/logs"
VENV_PATH="$BACKEND_DIR/venv/bin/activate"

# Criar diretório de logs se não existir
mkdir -p "$LOGS_DIR"

# Função para encerrar serviços em uma porta
kill_port() {
  if lsof -ti :$1 > /dev/null; then
    echo -e "${YELLOW}⚠️ Encerrando processo na porta $1...${NC}"
    lsof -ti :$1 | xargs -r kill -9
  fi
}

# Encerrar serviços conhecidos
echo -e "${YELLOW}🧹 Encerrando processos existentes...${NC}"
pkill -f uvicorn || true
pkill -f "npm run dev" || true
kill_port 8000
kill_port 3000

# Limpar logs
echo -e "${YELLOW}🧹 Limpando logs...${NC}"
: > "$LOGS_DIR/backend.log"
: > "$LOGS_DIR/frontend.log"

# Carregar variáveis do .env da raiz
if [ -f "$PROJECT_DIR/.env" ]; then
  echo -e "${YELLOW}📦 Carregando variáveis do .env...${NC}"
  export $(grep -v '^#' "$PROJECT_DIR/.env" | xargs -d '\n')
else
  echo -e "${RED}❌ Arquivo .env da raiz não encontrado!${NC}"
  exit 1
fi

# Carregar variáveis específicas do frontend (se houver .env no frontend)
if [ -f "$FRONTEND_DIR/.env" ]; then
  echo -e "${YELLOW}📦 Carregando variáveis do frontend (.env)...${NC}"
  export $(grep -v '^#' "$FRONTEND_DIR/.env" | xargs -d '\n')
fi

# Ativar venv
if [ -f "$VENV_PATH" ]; then
  echo -e "${YELLOW}🔄 Ativando ambiente virtual do backend...${NC}"
  source "$VENV_PATH"
else
  echo -e "${RED}❌ Ambiente virtual não encontrado em $VENV_PATH${NC}"
  exit 1
fi

# Iniciar backend
echo -e "${GREEN}🚀 Iniciando backend na porta 8000...${NC}"
cd "$BACKEND_DIR"
uvicorn main_api:app --host 0.0.0.0 --port 8000 > "$LOGS_DIR/backend.log" 2>&1 &

# Iniciar frontend (Next.js)
echo -e "${GREEN}🚀 Iniciando frontend (Next.js) na porta 3000...${NC}"
cd "$FRONTEND_DIR"
PORT=3000 npm run dev > "$LOGS_DIR/frontend.log" 2>&1 &

# Confirmação
sleep 2
echo -e "${GREEN}✅ GPTPOL INICIADO COM SUCESSO!${NC}"
echo -e "${YELLOW}🌐 Acesse o frontend: http://192.168.0.241:3000${NC}"
