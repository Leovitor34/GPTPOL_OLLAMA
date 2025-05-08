# 🚀 Guia Completo de Troca de Modelos Ollama no GPTPOL

## 📋 Lições Aprendidas da Última Troca

Durante a última troca de modelos, identificamos problemas críticos que precisam ser evitados:

1. **Incompatibilidade .env vs Backend:** O backend continuou usando um modelo antigo mesmo após a atualização do arquivo .env
2. **Erro 500:** O modelo especificado não estava disponível no Ollama
3. **Reinicialização parcial:** Nem todos os serviços foram corretamente reiniciados após as alterações

## 📁 Arquivos que Precisam ser Modificados

| Arquivo | Localização | Tipo de Modificação | Importância |
|---------|------------|---------------------|-------------|
| `.env` | `/mnt/projetos_nexor/Servidor_Nexortech/Projetos/GPTPOL_OLLAMA/.env` | Variável `OLLAMA_MODEL` | **CRÍTICA** |
| `main_api.py` | `/mnt/projetos_nexor/Servidor_Nexortech/Projetos/GPTPOL_OLLAMA/backend/main_api.py` | Parâmetros do modelo | **CRÍTICA** |
| `typewriter.js` | `/mnt/projetos_nexor/Servidor_Nexortech/Projetos/GPTPOL_OLLAMA/frontend/config/typewriter.js` | Configurações de velocidade | Recomendada |

## 🔍 Detalhamento das Modificações por Arquivo

### 1. Arquivo `.env`

**Localização:** `/mnt/projetos_nexor/Servidor_Nexortech/Projetos/GPTPOL_OLLAMA/.env`

**Descrição:** Arquivo de configuração de ambiente que define o modelo a ser utilizado pelo backend.

**Modificação necessária:**
- Alterar a variável `OLLAMA_MODEL` para o nome do novo modelo

**Exemplo:**
```
# Configurações Gerais do GPTPOL
API_URL=http://192.168.0.241:8000
FRONTEND_URL=http://192.168.0.241:3000
OLLAMA_API_URL=http://localhost:11434/api/generate
OLLAMA_MODEL=gemma2:27b  # <-- Modificar esta linha
```

**Comando para modificar:**
```bash
echo -e "# Configurações Gerais do GPTPOL\nAPI_URL=http://192.168.0.241:8000\nFRONTEND_URL=http://192.168.0.241:3000\nOLLAMA_API_URL=http://localhost:11434/api/generate\nOLLAMA_MODEL=NOVO_MODELO" > .env
```

### 2. Arquivo `main_api.py`

**Localização:** `/mnt/projetos_nexor/Servidor_Nexortech/Projetos/GPTPOL_OLLAMA/backend/main_api.py`

**Descrição:** API principal do backend que contém a comunicação com o modelo Ollama e os parâmetros de configuração do modelo.

**Seções que precisam ser modificadas:**

1. **Função `gerar_resposta_ollama` (aproximadamente linha 130-170):**
   - Modificar a seção `options` para os parâmetros recomendados do novo modelo

   ```python
   def gerar_resposta_ollama(prompt):
       try:
           payload = {
               "model": OLLAMA_MODEL,
               "prompt": prompt,
               "stream": False,
               "options": {
                   "num_ctx": 4096,           # Ajustar para o modelo específico
                   "num_thread": 12,          # Ajustar para o modelo específico
                   "temperature": 0.7,        # Ajustar para o modelo específico
                   "top_k": 40,               # Ajustar para o modelo específico
                   "top_p": 0.9,              # Ajustar para o modelo específico
                   "num_predict": 512,        # Ajustar para o modelo específico
                   "repeat_penalty": 1.1,     # Ajustar para o modelo específico
                   "stop": ["<end>", "</answer>"] # Ajustar para o modelo específico
               }
           }
   ```

2. **Função `gerar_resposta_ollama_stream` (aproximadamente linha 230-270):**
   - Modificar a seção `options` para os parâmetros recomendados do novo modelo
   - **IMPORTANTE:** Os parâmetros desta seção devem ser idênticos aos da função acima

   ```python
   async def gerar_resposta_ollama_stream(prompt):
       try:
           payload = {
               "model": OLLAMA_MODEL,
               "prompt": prompt,
               "stream": True,  # Habilitando streaming
               "options": {
                   "num_ctx": 4096,           # Ajustar para o modelo específico
                   "num_thread": 12,          # Ajustar para o modelo específico
                   "temperature": 0.7,        # Ajustar para o modelo específico
                   "top_k": 40,               # Ajustar para o modelo específico
                   "top_p": 0.9,              # Ajustar para o modelo específico
                   "num_predict": 512,        # Ajustar para o modelo específico
                   "repeat_penalty": 1.1,     # Ajustar para o modelo específico
                   "stop": ["<end>", "</answer>"] # Ajustar para o modelo específico
               }
           }
   ```

3. **Funções `perguntar_stream` e `perguntar` (aproximadamente linhas 290-340):**
   - Verificar e ajustar o `prompt_context` se necessário para o modelo específico:

   ```python
   # Instrução específica para o assistente jurídico
   prompt_context = "Você é um assistente jurídico policial brasileiro. Responda de forma técnica, direta e concisa em português correto: "
   ```

### 3. Arquivo `typewriter.js`

**Localização:** `/mnt/projetos_nexor/Servidor_Nexortech/Projetos/GPTPOL_OLLAMA/frontend/config/typewriter.js`

**Descrição:** Configurações do efeito de digitação que pode precisar de ajustes dependendo da velocidade de resposta do modelo.

**Modificações recomendadas para modelos mais rápidos (ex: Mistral):**
```javascript
const typewriterConfig = {
  // Velocidade base de digitação em milissegundos (menor = mais rápido)
  baseSpeed: 10,  // Reduzir para modelos mais rápidos
  
  // Variação de velocidade - multiplicador mínimo e máximo
  speedVariation: {
    min: 0.7,  // Ajustar para digitação mais rápida
    max: 1.2   // Ajustar para digitação mais rápida
  },
  
  // Efeito de "pensar" - pausa antes de começar a digitar (ms)
  thinkingDelay: 200,  // Reduzir para modelos mais rápidos
  
  // Outros parâmetros...
};
```

**Modificações recomendadas para modelos mais lentos (ex: Llama 3 70B):**
```javascript
const typewriterConfig = {
  // Velocidade base de digitação em milissegundos (menor = mais rápido)
  baseSpeed: 15,  // Aumentar para modelos mais lentos
  
  // Variação de velocidade - multiplicador mínimo e máximo
  speedVariation: {
    min: 0.8,  // Ajustar para digitação mais consistente
    max: 1.4   // Ajustar para digitação mais variada
  },
  
  // Efeito de "pensar" - pausa antes de começar a digitar (ms)
  thinkingDelay: 400,  // Aumentar para simular o tempo de processamento
  
  // Outros parâmetros...
};
```

## 🔧 Ajustes de Parâmetros por Modelo

### Gemma 2 (27B)

**Arquivo `main_api.py` - Seção options:**
```python
"options": {
    "num_ctx": 4096,           
    "num_thread": 12,          
    "temperature": 0.7,        
    "top_k": 40,               
    "top_p": 0.9,              
    "num_predict": 512,        
    "repeat_penalty": 1.1,     
    "stop": ["<end>", "</answer>"] 
}
```

**Arquivo `typewriter.js`:**
```javascript
baseSpeed: 12,
speedVariation: {
  min: 0.8,
  max: 1.3
},
thinkingDelay: 250,
```

### Llama 3 (70B)

**Arquivo `main_api.py` - Seção options:**
```python
"options": {
    "num_ctx": 4096,           
    "num_thread": 12,          
    "temperature": 0.7,        
    "top_k": 50,               
    "top_p": 0.95,             
    "num_predict": 1024,       
    "repeat_penalty": 1.1,     
    "stop": ["<|end_of_text|>", "</s>"] 
}
```

**Arquivo `typewriter.js`:**
```javascript
baseSpeed: 15,
speedVariation: {
  min: 0.8,
  max: 1.4
},
thinkingDelay: 400,
```

### Mistral (7B)

**Arquivo `main_api.py` - Seção options:**
```python
"options": {
    "num_ctx": 4096,           
    "num_thread": 8,           
    "temperature": 0.7,        
    "top_k": 40,               
    "top_p": 0.9,              
    "num_predict": 512,        
    "repeat_penalty": 1.1     
}
```

**Arquivo `typewriter.js`:**
```javascript
baseSpeed: 10,
speedVariation: {
  min: 0.7,
  max: 1.2
},
thinkingDelay: 200,
```

### Phi-3 (14B)

**Arquivo `main_api.py` - Seção options:**
```python
"options": {
    "num_ctx": 4096,           
    "num_thread": 8,           
    "temperature": 0.8,        
    "top_k": 40,               
    "top_p": 0.9,              
    "num_predict": 512,        
    "repeat_penalty": 1.1     
}
```

**Arquivo `typewriter.js`:**
```javascript
baseSpeed: 12,
speedVariation: {
  min: 0.7,
  max: 1.3
},
thinkingDelay: 250,
```

### Mixtral (8x7B)

**Arquivo `main_api.py` - Seção options:**
```python
"options": {
    "num_ctx": 4096,           
    "num_thread": 10,          
    "temperature": 0.7,        
    "top_k": 40,               
    "top_p": 0.9,              
    "num_predict": 512,        
    "repeat_penalty": 1.1     
}
```

**Arquivo `typewriter.js`:**
```javascript
baseSpeed: 12,
speedVariation: {
  min: 0.8,
  max: 1.3
},
thinkingDelay: 300,
```

## 📝 Processo Completo de Troca de Modelo

1. **Parar todos os serviços:**
   ```bash
   bash stop-gptpol.sh
   ```

2. **Verificar modelo atual:**
   ```bash
   cat .env | grep OLLAMA_MODEL
   ```

3. **Listar e remover o modelo atual:**
   ```bash
   ollama list
   ollama rm MODELO_ATUAL
   ```

4. **Instalar o novo modelo:**
   ```bash
   ollama pull NOVO_MODELO
   ```

5. **Atualizar arquivo .env:**
   ```bash
   echo -e "# Configurações Gerais do GPTPOL\nAPI_URL=http://192.168.0.241:8000\nFRONTEND_URL=http://192.168.0.241:3000\nOLLAMA_API_URL=http://localhost:11434/api/generate\nOLLAMA_MODEL=NOVO_MODELO" > .env
   ```

6. **Editar o arquivo main_api.py:**
   ```bash
   nano backend/main_api.py
   ```
   - Localizar e modificar as duas seções `options` nas funções `gerar_resposta_ollama` e `gerar_resposta_ollama_stream`
   - Salvar com Ctrl+O, Enter, Ctrl+X

7. **[Opcional] Editar arquivo typewriter.js:**
   ```bash
   nano frontend/config/typewriter.js
   ```
   - Ajustar parâmetros para o novo modelo conforme recomendações acima
   - Salvar com Ctrl+O, Enter, Ctrl+X

8. **Iniciar serviços:**
   ```bash
   bash start-gptpol.sh
   ```

9. **Verificar logs se necessário:**
   ```bash
   cat logs/backend.log
   cat logs/frontend.log
   ```

## 🧪 Protocolo de Testes de API

Para garantir o funcionamento adequado após a troca de modelos, siga este protocolo de testes:

### 1. Verificar o serviço Ollama
```bash
# Verificar se o serviço Ollama está rodando
ps aux | grep ollama

# Se não estiver rodando, iniciar o serviço
ollama serve
```

### 2. Testar a conexão com o modelo
```bash
# Verificar os modelos disponíveis
ollama list

# Testar o modelo diretamente via linha de comando
echo "Qual a capital do Brasil?" | ollama run NOME_DO_MODELO
```

### 3. Testar API do Backend
```bash
# Testar conexão básica com o backend
curl http://localhost:8000/ | python -m json.tool

# Testar a API de perguntas
curl -X POST http://localhost:8000/perguntar \
  -H "Content-Type: application/json" \
  -d '{"pergunta":"Qual a capital do Brasil?"}' | python -m json.tool

# Testar a API de streaming (deve retornar um fluxo de dados)
curl -N -X POST http://localhost:8000/perguntar_stream \
  -H "Content-Type: application/json" \
  -d '{"pergunta":"Qual a capital do Brasil?"}'
```

### 4. Verificar Logs de Erros
```bash
# Verificar logs do backend por erros
grep -i "erro\|error\|exceção\|exception" logs/backend.log | tail -n 20

# Verificar logs do frontend por erros
grep -i "erro\|error\|exceção\|exception" logs/frontend.log | tail -n 20
```

### 5. Teste Completo no Navegador
1. Abra o navegador e acesse http://192.168.0.241:3000
2. Crie um novo chat e faça uma pergunta simples
3. Verifique se a resposta aparece corretamente, sem erros 500
4. Tente uma pergunta mais complexa para avaliar o desempenho do modelo

## ⚠️ Possíveis Problemas e Soluções

| Problema | Causa Provável | Solução |
|----------|----------------|---------|
| Erro 500 no servidor | Modelo especificado no .env não existe | Verificar nome do modelo (`ollama list`) e corrigir no .env |
| Erro "Failed to fetch" | Backend não está respondendo | Verificar logs do backend e reiniciar serviços |
| Mensagem "operando em modo offline" | Problemas na comunicação com Ollama | Verificar se o Ollama está rodando e responde a consultas |
| Muito tempo para responder | Parâmetros inadequados para o modelo | Ajustar parâmetros de contexto e threads no main_api.py |
| Respostas truncadas | Valor de num_predict muito baixo | Aumentar parâmetro num_predict nas opções |
| Backend usa modelo incorreto | Arquivo .env não está sendo lido corretamente | Reiniciar completamente todos os serviços, incluindo o backend |
| Falha no carregamento do modelo | Memória insuficiente | Verificar uso de memória e liberar recursos ou escolher modelo menor |

---

**© NEXORTECH - GPTPOL 2024** 