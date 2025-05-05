#!/bin/bash

echo "╔════════════════════════════════════════════╗"
echo "║      🛑 ENCERRANDO GPTPOL - NEXORTECH      ║"
echo "╚════════════════════════════════════════════╝"

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Encerrar processos
echo -e "${YELLOW}🔍 Procurando e encerrando processos do Backend (uvicorn)...${NC}"
pkill -f uvicorn && echo -e "${GREEN}✅ Backend encerrado com sucesso.${NC}" || echo -e "${RED}⚠️ Nenhum processo uvicorn em execução.${NC}"

echo -e "${YELLOW}🔍 Procurando e encerrando processos do Frontend (Next.js)...${NC}"
pkill -f "npm run dev" && echo -e "${GREEN}✅ Frontend encerrado com sucesso.${NC}" || echo -e "${RED}⚠️ Nenhum processo Next.js em execução.${NC}"

# Opcional: liberar portas manualmente
for port in 8000 3000; do
    if lsof -ti :$port > /dev/null; then
        echo -e "${YELLOW}⚠️ Porta $port ainda em uso. Forçando liberação...${NC}"
        lsof -ti :$port | xargs kill -9
        echo -e "${GREEN}✅ Porta $port liberada.${NC}"
    fi
done

echo ""
echo -e "${GREEN}🎯 GPTPOL finalizado com sucesso.${NC}"
