# emlyon-middleware-api

Node.js + Express API that validates score submissions and forwards them to the Emlyon LMS.

## Tech stack

- Node.js 18+
- Express 5
- axios, helmet, cors, express-rate-limit
- AWS Lambda (Serverless Framework)

## Run locally

```bash
npm install
npm run dev
```

Default URL: `http://localhost:3001`

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start with nodemon |
| `npm start` | Start production server |

## API endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/`, `/health` | Health check |
| GET | `/api/info` | API metadata |
| POST | `/api/scores` | Submit candidate scores (Azure login + Emlyon forward) |

## Project structure

```
├── app.js                 # Local server entry
├── lambda.js              # AWS Lambda handler
├── config/                # Environment configuration
├── middleware/            # CORS, rate limit, errors
├── routes/                # Express routes
├── services/              # Azure auth + Emlyon API client
├── utils/                 # Payload mapper
└── validators/            # Request validation
```
