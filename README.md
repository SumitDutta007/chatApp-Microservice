# Chat application

The project is split into four independently deployable services:

- `frontend/` - Next.js application for Vercel.
- `backend/user/` - authentication and user API for Render.
- `backend/chat/` - chat and Socket.IO API for Render.
- `backend/mail/` - OTP mail worker for Render.

## Configuration

Each service has an `.env.example` file. Copy it to a local environment file
and replace placeholder values. Never commit `.env` files or credentials.

The user and chat services require the same `JWT_SECRET`. The chat service
calls the user service through `USER_SERVICE`, and both HTTP and Socket.IO
origins are restricted to `CLIENT_URL`.

RabbitMQ is configured through `RABBITMQ_URL`, so local development can use a
local broker and Render can use the broker URL supplied by the selected
RabbitMQ provider. Image messages continue to use Cloudinary, configured by
the `CLOUDINARY_*` variables.

The mail worker supports Resend through `RESEND_API_KEY` and `EMAIL_FROM`.
When `RESEND_API_KEY` is absent, it falls back to local Gmail SMTP using
`SMTP_USER` and `SMTP_PASSWORD`. Prefer Resend or another HTTPS email API on
Render Free because outbound SMTP ports may be blocked there.

## Deployment

Deploy each backend directory as its own Render service. Use:

- `npm install` as the install command
- `npm run build` as the build command
- `npm start` as the start command

Deploy `frontend/` as a Vercel Next.js project and set its two
`NEXT_PUBLIC_*` variables to the deployed Render service URLs.

## Docker local development

Docker Desktop is required. The root Compose file starts RabbitMQ and all
four application services:

```powershell
docker compose up --build
```

Open the frontend at `http://localhost:3000` and the bundled RabbitMQ
dashboard at `http://localhost:15673` using the credentials configured in
`docker-compose.yml`. Stop the stack with:

```powershell
docker compose down
```

The Compose file uses Docker service names for backend-to-backend traffic.
Do not copy those internal values into a browser environment; the frontend
must use public URLs.
