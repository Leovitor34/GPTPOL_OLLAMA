GPTPOL_OPENAI/
├── frontend/                 ✅ FRONTEND (Next.js ou React)
│   └── .env                  ✅ Já criado
│   └── (demais arquivos do frontend)
│
├── backend/                  ✅ BACKEND (FastAPI + IA + Scraping)
│   ├── main_api.py           🔹 Entrada da API
│   ├── rpa_engine.py         🔹 Robô que acessa e extrai dados do IP-e
│   ├── data_manager.py       🔹 Processa e salva os dados no SQLite
│   ├── query_handler.py      🔹 Traduz perguntas para SQL via OpenAI
│   ├── config_manager.py     🔹 Lê e protege configurações e senhas
│   ├── models.py             🔹 Define as tabelas SQLite
│   ├── config.ini            🔹 Configurações gerais do sistema
│   ├── requirements.txt      🔹 Bibliotecas necessárias (será usado no pip install)
│   └── .env                  🔐 Segredos como API da OpenAI e IP-e
│
└── .gitignore                🔐 Deve conter `.env`, `__pycache__/`, etc.


# 🧠 GPTPOL_OPENAI — Sistema de Assistência Inteligente para Inquéritos Policiais

**Desenvolvido por:** NEXORTECH  
**Coordenador do Projeto:** Léo Vitor  
**Tecnologias:** FastAPI • Next.js • OpenAI API • SQLite • RPA (Selenium/Playwright)  

---

## 🎯 Objetivo do Projeto

O sistema **GPTPOL_OPENAI** foi criado com a missão de **otimizar o trabalho de escrivães e investigadores** no gerenciamento de **inquéritos policiais (IPs)**. O projeto visa automatizar a consulta, organização e análise do acervo de IPs com inteligência artificial.

---

## 🧱 Arquitetura Geral

### 1. 🖥️ Frontend (`frontend/`)
- Desenvolvido com **Next.js** (baseado no repositório [FRONTEND_DEEPSEEK](https://github.com/Leovitor34/FRONTEND_DEEPSEEK)).
- Responsável por:
  - Exibir painéis e tabelas com os IPs.
  - Permitir o acionamento de ações como “Atualizar Acervo”.
  - Fornecer uma **interface de chat** para perguntas em linguagem natural.
- Se comunica **apenas com o backend via API interna**.

### 2. 🔁 Backend (`backend/`)
- Construído com **FastAPI + Python**.
- Responsável por:
  - Executar a automação do sistema IP-e (sem API oficial).
  - Armazenar os dados em **SQLite local**.
  - Processar perguntas via **OpenAI** e responder com base nos dados locais.

#### Submódulos:
- `main_api.py` – Entrada principal da API.
- `rpa_engine.py` – Realiza screen scraping no sistema IP-e.
- `data_manager.py` – Processa e armazena os dados.
- `query_handler.py` – Conecta com a OpenAI e traduz perguntas em SQL.
- `config_manager.py` – Lida com configurações e variáveis sensíveis.
- `models.py` – Define as tabelas do banco de dados.
- `config.ini` – Arquivo de configuração geral.
- `.env` – Armazena chaves de API e senhas (adicionado ao `.gitignore`).
- `requirements.txt` – Lista de bibliotecas do backend.

---

## 🧠 Fluxo de Funcionamento

1. **Usuário clica** no botão "Atualizar Acervo" no frontend.
2. O **backend executa o robô (RPA)** para acessar o IP-e e extrair dados.
3. Os dados são **processados e armazenados** em SQLite local.
4. O usuário pode fazer **perguntas em linguagem natural** (ex: "quais IPs vencem essa semana?").
5. A pergunta é **interpretada pela OpenAI**, convertida em SQL e respondida com base no banco local.

---

## 🔒 Segurança

- Todas as chaves e credenciais são armazenadas de forma segura em `.env`.
- O arquivo `.env` está incluído no `.gitignore` e nunca é enviado ao GitHub.
- Futura integração com **VPN e autenticação segura** será considerada.

---

## ✅ Status Atual

- [x] Estrutura de diretórios definida.
- [x] Frontend clonado e configurado.
- [x] `.env` criado para backend e frontend.
- [ ] Instalação das bibliotecas.
- [ ] Implementação dos módulos Python.
- [ ] Integração OpenAI + Banco de Dados.
- [ ] Deploy completo e testes finais.

---

## 🧭 Protocolo de Desenvolvimento

**Atenção:** Este projeto segue o protocolo rígido da **NEXORTECH**:  
- Nenhuma etapa pode ser pulada.  
- Cada comando ou modificação deve ser validada com `print` ou confirmação.  
- Tudo deve ser documentado e executado com máxima organização e controle.

---

## 🧠 Visão de Futuro

- Integração com o sistema SGIP.
- Alertas automáticos de vencimento de prazos.
- Consultas inteligentes com IA treinada nos procedimentos da Polícia Civil.

---

**"A nova origem da inteligência artificial começa aqui."**  
🚨 Projeto mantido por **NEXORTECH – Inteligência a serviço da Justiça**
