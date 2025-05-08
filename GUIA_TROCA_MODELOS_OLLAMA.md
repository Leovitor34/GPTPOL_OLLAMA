# 🚀 Guia para Troca de Modelos Ollama no GPTPOL

Este guia documenta todas as etapas necessárias para trocar o modelo de IA usado no sistema GPTPOL.

## 📋 Checklist de Troca de Modelo

1. [Parar todos os serviços](#1-parar-todos-os-serviços)
2. [Remover o modelo atual](#2-remover-o-modelo-atual)
3. [Instalar o novo modelo](#3-instalar-o-novo-modelo)
4. [Atualizar arquivo de configuração](#4-atualizar-arquivo-de-configuração)
5. [Ajustar parâmetros do modelo](#5-ajustar-parâmetros-do-modelo)
6. [Reiniciar os serviços](#6-reiniciar-os-serviços)
7. [Verificar funcionamento](#7-verificar-funcionamento)

## 📝 Procedimentos Detalhados

### 1. Parar todos os serviços

```bash
bash stop-gptpol.sh
```

### 2. Remover o modelo atual

Listar modelos disponíveis:
```bash
ollama list
```

Remover o modelo atual:
```bash
ollama rm NOME_DO_MODELO_ATUAL
```

### 3. Instalar o novo modelo

```bash
ollama pull NOME_DO_NOVO_MODELO
```

### 4. Atualizar arquivo de configuração

Editar o arquivo `.env` na raiz do projeto:
```bash
# Atualizar a linha com o modelo
echo -e "# Configurações Gerais do GPTPOL\nAPI_URL=http://192.168.0.241:8000\nFRONTEND_URL=http://192.168.0.241:3000\nOLLAMA_API_URL=http://localhost:11434/api/generate\nOLLAMA_MODEL=NOME_DO_NOVO_MODELO" > .env
```

### 5. Ajustar parâmetros do modelo

Editar o arquivo `backend/main_api.py` e ajustar os parâmetros conforme necessário para o novo modelo:

#### Parâmetros recomendados por modelo:

##### Gemma 2 (27B)
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

##### Llama 3 (70B)
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

##### Mistral (8B)
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

##### Phi-3 (14B)
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

##### Wizard-Vicuna-Uncensored (30B)
```python
"options": {
    "num_ctx": 4096,           
    "num_thread": 8,           
    "temperature": 0.7,        
    "top_k": 50,               
    "top_p": 0.9,              
    "num_predict": 512,        
    "repeat_penalty": 1.1     
}
```

##### Mixtral (8x7B)
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

### 6. Reiniciar os serviços

```bash
bash start-gptpol.sh
```

### 7. Verificar funcionamento

- Acesse o frontend: http://192.168.0.241:3000
- Faça uma pergunta simples como "Qual a capital do Brasil?"
- Verifique se o sistema responde adequadamente

## 🔄 Procedimento de Emergência

Se após a troca, o sistema não funcionar corretamente:

1. Verifique os logs:
```bash
cat logs/backend.log
cat logs/frontend.log
```

2. Reinstale o modelo anterior:
```bash
ollama pull MODELO_ANTERIOR
```

3. Restabeleça a configuração anterior:
```bash
echo -e "# Configurações Gerais do GPTPOL\nAPI_URL=http://192.168.0.241:8000\nFRONTEND_URL=http://192.168.0.241:3000\nOLLAMA_API_URL=http://localhost:11434/api/generate\nOLLAMA_MODEL=MODELO_ANTERIOR" > .env
```

4. Reinicie os serviços:
```bash
bash stop-gptpol.sh && bash start-gptpol.sh
```

## 📊 Tabela Comparativa de Modelos

| Modelo | Tamanho | Resposta | Precisão | Memória Mín. | Uso Recomendado |
|--------|---------|----------|----------|--------------|-----------------|
| Gemma 2 (27B) | 27B | Rápida | Alta | 24GB | Assistente jurídico geral |
| Llama 3 (70B) | 70B | Lenta | Muito Alta | 40GB | Análises complexas |
| Mistral (8B) | 8B | Muito Rápida | Média | 8GB | Respostas rápidas |
| Phi-3 (14B) | 14B | Rápida | Alta | 16GB | Bom equilíbrio velocidade/qualidade |
| Mixtral (8x7B) | 8x7B | Média | Alta | 24GB | Multilíngue avançado |

## 🛠️ Ajustes Avançados

### Otimização de desempenho

Para modelos mais pesados, considere:
- Reduzir `num_ctx` para 2048
- Aumentar `num_thread` para 16
- Reduzir `num_predict` para 384

### Ajuste de qualidade vs. velocidade

Para respostas mais criativas:
- Aumentar `temperature` para 0.8-0.9
- Aumentar `top_p` para 0.95

Para respostas mais consistentes:
- Reduzir `temperature` para 0.5-0.6
- Reduzir `top_p` para 0.8

---

**© NEXORTECH - GPTPOL 2024** 