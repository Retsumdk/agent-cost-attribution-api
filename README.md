# Agent Cost Attribution API

Granular cost tracking attributing LLM spend to specific user intents or projects. Built by Retsumdk.

## Features

- **Granular Attribution**: Track costs by `projectId`, `intentId`, and `userId`.
- **Multi-Model Support**: Built-in pricing for GPT-4, GPT-3.5, Claude 3, Gemini 1.5, and Llama 3.
- **Persistent Storage**: Robust JSON-based storage for cost records.
- **Reporting API**: Summaries and filtered record retrieval.
- **CLI Interface**: Start the server or generate reports from the command line.

## Installation

```bash
bun install
```

## Usage

### Starting the Server

```bash
bun start
# or
bun src/index.ts serve --port 3000
```

### Tracking Usage

Send a POST request to `/track`:

```bash
curl -X POST http://localhost:3000/track \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4o",
    "inputTokens": 1000,
    "outputTokens": 500,
    "projectId": "project-alpha",
    "intentId": "summarize-document",
    "userId": "user-123",
    "metadata": { "docId": "doc_999" }
  }'
```

### Generating Reports

```bash
bun report
```

## API Reference

- `GET /health`: Health check.
- `POST /track`: Record LLM usage.
- `GET /summary`: Get global cost summary.
- `GET /summary/project/:id`: Get summary for a specific project.
- `GET /summary/intent/:id`: Get summary for a specific intent.
- `GET /summary/user/:id`: Get summary for a specific user.
- `GET /records`: List all records with query param filters.

## Architecture

The system uses a simple but effective architecture:
- **Tracker**: The core engine that calculates costs and manages recording.
- **Storage**: A thread-safe persistence layer using atomic JSON writes.
- **API**: A Hono-based web server for remote interaction.
- **CLI**: A Commander-based entrypoint for operations.

## License

MIT
