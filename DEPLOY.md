# DEPLOY — Terra da Esperança

Guia de implantação do sistema. Existem duas formas de executar o projeto: **modo desenvolvimento** (para apresentação e testes) e **modo Docker completo** (todos os serviços em contêineres).

---

## Arquivos de Deploy

| Arquivo | Descrição |
|---------|-----------|
| `docker-compose.yml` | Sobe apenas o banco de dados PostgreSQL (usado no modo dev) |
| `docker-compose.prod.yml` | Sobe os três serviços: banco, backend e frontend |
| `server/Dockerfile` | Imagem Docker do backend FastAPI |
| `client/Dockerfile` | Imagem Docker do frontend Next.js |
| `server/.env.example` | Template das variáveis de ambiente do backend |
| `client/.env.local.example` | Template das variáveis de ambiente do frontend |

---

## Pré-requisitos

| Ferramenta | Versão mínima | Verificar |
|------------|---------------|-----------|
| Node.js | 20+ | `node -v` |
| Python | 3.12+ | `python --version` |
| Docker Desktop | Qualquer | `docker -v` |
| Docker Compose | v2+ | `docker compose version` |

---

## Opção 1 — Modo Desenvolvimento (Apresentação)

> Recomendado para rodar localmente e apresentar ao professor.
> Banco em Docker, backend e frontend direto na máquina.

### Primeira vez — instalação

```bash
# 1. Dependências do orquestrador raiz
npm install

# 2. Dependências do frontend
cd client
npm install
cd ..

# 3. Ambiente virtual Python + dependências do backend
cd server
python -m venv venv

# Windows:
venv\Scripts\activate
# Linux/Mac:
# source venv/bin/activate

pip install -r requirements.txt
cd ..
```

### Variáveis de ambiente

```bash
# Backend — cria o arquivo .env na pasta server/
copy server\.env.example server\.env

# Frontend — cria o arquivo .env.local na pasta client/
copy client\.env.local.example client\.env.local
```

> Os valores padrão já funcionam para desenvolvimento local.
> Não é necessário alterar nada para rodar pela primeira vez.

### Executar

```bash
npm run dev
```

Isso inicia em paralelo:
- `DB` — PostgreSQL no Docker (porta `5432`)
- `API` — FastAPI com uvicorn (porta `8000`)
- `WEB` — Next.js (porta `3000`)

| Serviço | URL |
|---------|-----|
| **Sistema (frontend)** | http://localhost:3000 |
| **API REST** | http://localhost:8000 |
| **Documentação da API** | http://localhost:8000/docs |

---

## Opção 2 — Deploy Completo com Docker

> Todos os serviços em contêineres. Ideal para simular um ambiente de produção.

### Variáveis de ambiente (produção)

Crie um arquivo `.env` na raiz do projeto:

```bash
# raiz do projeto — valores de exemplo, altere conforme necessário
POSTGRES_USER=terra_user
POSTGRES_PASSWORD=senha_segura_aqui
POSTGRES_DB=terra_da_esperanca
SECRET_KEY=chave-jwt-secreta-longa-e-aleatoria
ACCESS_TOKEN_EXPIRE_MINUTES=60
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

> **Importante:** nunca versione o arquivo `.env` com dados reais. Ele está no `.gitignore`.

### Build e execução

```bash
# Constrói as imagens e sobe todos os contêineres
docker compose -f docker-compose.prod.yml up --build

# Para rodar em segundo plano (detached):
docker compose -f docker-compose.prod.yml up --build -d
```

### Verificar status

```bash
docker compose -f docker-compose.prod.yml ps
```

Saída esperada quando tudo está saudável:

```
NAME          STATUS          PORTS
terra_db      Up (healthy)    5432/tcp
terra_api     Up              0.0.0.0:8000->8000/tcp
terra_web     Up              0.0.0.0:3000->3000/tcp
```

### Parar os contêineres

```bash
docker compose -f docker-compose.prod.yml down

# Para remover também os dados do banco (cuidado!):
docker compose -f docker-compose.prod.yml down -v
```

---

## Primeiro Acesso ao Sistema

Na primeira inicialização, o backend cria automaticamente um **super admin** padrão:

| Campo | Valor |
|-------|-------|
| E-mail | `admin@terradaesperanca.org` |
| Senha | `Admin@2025` |
| Perfil | Super Administrador |

> **Redefina a senha imediatamente após o primeiro login** usando a opção "Alterar senha" na barra lateral.

O super admin pode criar outros usuários com os perfis:
- **Administrador** — acesso total ao sistema
- **Técnico** — acesso a prontuários e evoluções
- **Voluntário** — acesso básico de consulta

---

## Verificação de Saúde da API

```bash
curl http://localhost:8000/
# Resposta esperada: {"status": "ok", "projeto": "Terra da Esperança"}
```

Documentação interativa dos endpoints:

```
http://localhost:8000/docs
```

---

## Solução de Problemas Comuns

### Backend não conecta ao banco

```
OperationalError: could not connect to server
```

**Causa:** O PostgreSQL ainda está iniciando.
**Solução:** O backend tenta reconectar por até 30 segundos automaticamente. Aguarde e observe os logs.

---

### Erro de porta já em uso

```
Error: listen EADDRINUSE :::3000
Error starting server: error binding to 0.0.0.0:8000
```

**Solução:** Encerre o processo que está usando a porta ou altere a porta no comando de execução.

```bash
# Verificar o processo na porta 3000 (Windows)
netstat -ano | findstr :3000

# Matar o processo pelo PID
taskkill /PID <PID> /F
```

---

### Docker sem memória suficiente no build do frontend

**Solução:** No Docker Desktop → Settings → Resources → Memory, aumente para pelo menos **4 GB**.

---

### Módulo Python não encontrado

```
ModuleNotFoundError: No module named 'fastapi'
```

**Causa:** O ambiente virtual não está ativado.
**Solução:**

```bash
# Windows
server\venv\Scripts\activate

# Depois execute novamente
uvicorn app.main:app --reload --port 8000
```

---

## Estrutura dos Serviços

```
┌─────────────────────────────────────────────┐
│                 Navegador                   │
│          http://localhost:3000              │
└──────────────────┬──────────────────────────┘
                   │ HTTP
┌──────────────────▼──────────────────────────┐
│           Next.js (Frontend)                │
│              porta 3000                     │
└──────────────────┬──────────────────────────┘
                   │ REST API (JSON)
┌──────────────────▼──────────────────────────┐
│          FastAPI (Backend)                  │
│              porta 8000                     │
└──────────────────┬──────────────────────────┘
                   │ SQL (SQLAlchemy)
┌──────────────────▼──────────────────────────┐
│        PostgreSQL 16 (Docker)               │
│              porta 5432                     │
└─────────────────────────────────────────────┘
```
