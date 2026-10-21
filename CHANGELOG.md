# Changelog

All notable changes to this project are documented in this file. The format
follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and this
project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-10-21

First release. The API records LLM usage against a project, an intent and a
user, prices it from a built-in model table, and serves the aggregates over
HTTP or the CLI.

### Added

- **Cost tracker** (`src/tracker.ts`): `trackUsage` prices an input/output
  token pair for a known model and stores a record carrying `projectId`,
  `intentId`, `userId` and free-form `metadata`; `getFullSummary` and the
  per-project, per-intent and per-user summaries aggregate spend and token
  counts.
- **Model pricing table** (`src/models.ts`): per-1M-token input and output
  prices for the GPT-4, GPT-4o, GPT-3.5, Claude 3 (opus, sonnet, haiku),
  Gemini 1.5 and Llama 3 families.
- **Storage** (`src/storage.ts`): a single JSON file (`cost_data.json`) in a
  data directory (`./data` by default), rewritten in full on every change.
- **HTTP API** (`src/api.ts`, Hono): `GET /health`, `POST /track`,
  `GET /summary`, `GET /summary/project/:id`, `GET /summary/intent/:id`,
  `GET /summary/user/:id` and `GET /records` with query filters.
- **CLI** (`src/index.ts`, Commander): `serve`, `report` and `clear`, with
  `--port` for `serve` and `--data` to choose the storage directory.
- **Tests** (`tests/index.test.ts`): usage tracking and retrieval, summary
  aggregation, and record filtering.

### Notes

- Requires [Bun](https://bun.sh) 1.0 or newer; `bun install` then
  `bun start` serves on port 3000 by default.
- Storage is one JSON file per data directory. It is intended for a single
  writer process: the file is rewritten whole on each change and the write is
  not atomic, so do not point two servers at the same directory.

[1.0.0]: https://github.com/Retsumdk/agent-cost-attribution-api/releases/tag/v1.0.0
