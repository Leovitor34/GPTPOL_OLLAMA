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
SERVICE_CHECK_TIMEOUT=15

# Criar diretório de logs
mkdir -p "$LOGS_DIR"

# Verificação de serviço rodando
check_service_running() {
    local port=$1
    local timeout=$SERVICE_CHECK_TIMEOUT
    local count=0
    echo -e "${YELLOW}⏳ Aguardando porta $port...${NC}"
    while [ $count -lt $timeout ]; do
        if nc -z localhost $port >/dev/null 2>&1; then return 0; fi
        echo -n "."
        sleep 1
        count=$((count + 1))
    done
    echo ""
    return 1
}

# Verificação de porta ocupada
check_port_in_use() {
    local port=$1
    if lsof -i :$port -t >/dev/null 2>&1; then
        echo -e "${RED}⚠️ Porta $port em uso. Encerrando processo...${NC}"
        lsof -ti :$port | xargs -r kill -9
        sleep 2
    fi
}

# Encerrar processos existentes
echo -e "${YELLOW}🧹 Encerrando processos existentes...${NC}"
pkill -f uvicorn || true
pkill -f "npm run dev" || true
sleep 2

# Limpar logs
echo -e "${YELLOW}🧹 Limpando logs...${NC}"
> "$LOGS_DIR/backend.log"
> "$LOGS_DIR/frontend.log"

# Verificar e liberar portas
check_port_in_use 8000
check_port_in_use 3000

# Criar ambiente virtual se não existir
if [ ! -d "$BACKEND_DIR/venv" ]; then
    echo -e "${YELLOW}⚙️ Criando ambiente virtual...${NC}"
    python3 -m venv "$BACKEND_DIR/venv" || {
        echo -e "${RED}❌ Falha ao criar o ambiente virtual!${NC}"
        exit 1
    }
fi

# Ativar venv
echo -e "${YELLOW}🔄 Ativando venv...${NC}"
if [ -f "$VENV_PATH" ]; then
    source "$VENV_PATH" || {
        echo -e "${RED}❌ Erro ao ativar venv em $VENV_PATH${NC}"
        exit 1
    }
else
    echo -e "${RED}❌ venv não encontrado em $VENV_PATH${NC}"
    exit 1
fi

# Instalar dependências
if [ -f "$BACKEND_DIR/requirements.txt" ]; then
    echo -e "${YELLOW}📦 Instalando dependências do backend...${NC}"
    pip install -r "$BACKEND_DIR/requirements.txt"
else
    echo -e "${RED}⚠️ requirements.txt não encontrado em $BACKEND_DIR${NC}"
fi

# Iniciar Backend
echo -e "${YELLOW}🚀 Iniciando Backend (FastAPI)...${NC}"
cd "$BACKEND_DIR"
python -m uvicorn main_api:app --host 0.0.0.0 --port 8000 > "$LOGS_DIR/backend.log" 2>&1 &
BACKEND_PID=$!
echo -e "${GREEN}✅ Backend iniciado (PID: $BACKEND_PID)${NC}"

if check_service_running 8000; then
    echo -e "${GREEN}✅ Backend rodando na porta 8000${NC}"
else
    echo -e "${RED}❌ Falha no backend!${NC}"
    tail -n 20 "$LOGS_DIR/backend.log"
fi

# Iniciar Frontend (Next.js)
echo -e "${YELLOW}🚀 Iniciando Frontend (Next.js)...${NC}"
cd "$FRONTEND_DIR"
npm install
npm run dev > "$LOGS_DIR/frontend.log" 2>&1 &
FRONTEND_PID=$!
echo -e "${GREEN}✅ Frontend iniciado (PID: $FRONTEND_PID)${NC}"

if check_service_running 3000; then
    echo -e "${GREEN}✅ Frontend rodando na porta 3000${NC}"
else
    echo -e "${RED}❌ Falha no frontend!${NC}"
    tail -n 20 "$LOGS_DIR/frontend.log"
fi

# Resultado final
echo ""
echo "╔═════════════════════════════════════════════════════╗"
echo "║ ✅ GPTPOL INICIALIZADO COM SUCESSO                  ║"
echo "╠═════════════════════════════════════════════════════╣"
echo "║ • 🌐 Frontend: http://localhost:3000               ║"
echo "║ • 🔧 Backend:  http://localhost:8000               ║"
echo "║ • 🤖 IA:       via OpenAI API (chave no .env)     ║"
echo "╠═════════════════════════════════════════════════════╣"
echo "║ 📝 Logs: $LOGS_DIR                                 ║"
echo "║ 🛑 Para parar: ./stop-gptpol.sh                     ║"
echo "╚═════════════════════════════════════════════════════╝"
