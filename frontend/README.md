# Frontend

This Next.js app is deployed as a standalone Vercel project.

## Local development

1. Copy `.env.example` to `.env.local`.
2. Set `NEXT_PUBLIC_USER_SERVICE_URL` to the user service URL.
3. Set `NEXT_PUBLIC_CHAT_SERVICE_URL` to the chat service URL.
4. Run `npm install` and `npm run dev`.

Vercel must define both `NEXT_PUBLIC_*` variables with the public Render URLs
for the user and chat services.
