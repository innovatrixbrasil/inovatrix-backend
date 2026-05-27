# inovatrix-backend

Backend API multi-tenant para integracao com WhatsApp Business (Meta) - Inovatrix Brasil.

## Stack

- Node.js + TypeScript
- Express.js
- Prisma ORM + PostgreSQL
- JWT Authentication
- Meta Graph API v18.0

## Estrutura

```
src/
  config/       # Configuracao do banco de dados
  controllers/  # authController, metaController, webhookController
  routes/       # Rotas da API
  server.ts     # Entry point
prisma/
  schema.prisma # Modelos Tenant e Message
```

## Instalacao

```bash
# 1. Clone o repositorio
git clone https://github.com/innovatrixbrasil/inovatrix-backend.git
cd inovatrix-backend

# 2. Instale as dependencias
npm install

# 3. Configure as variaveis de ambiente
cp .env.example .env
# Edite o .env com suas credenciais

# 4. Gere o cliente Prisma
npm run prisma:generate

# 5. Execute as migrations
npm run prisma:migrate

# 6. Inicie o servidor
npm run dev
```

## Variaveis de Ambiente

Veja o arquivo `.env.example` para todas as variaveis necessarias.

## Endpoints

| Metodo | Rota | Descricao |
|--------|------|-----------|
| POST | /api/auth/register | Cadastro de novo tenant |
| POST | /api/auth/login | Login do tenant |
| POST | /api/meta/callback | Callback OAuth da Meta |
| GET | /api/meta/status | Status da integracao Meta |
| GET | /api/webhook | Verificacao do webhook Meta |
| POST | /api/webhook | Recepcao de mensagens |
| GET | /health | Health check |

## Deploy

Recomendado: Railway, Render ou servidor proprio com Node.js 20+.

---

Inovatrix Brasil - api.inovatrix.com.br
