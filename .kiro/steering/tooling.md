# Tooling: Powers & MCP

## Kiro Power — `api-conventions`

This project ships a Kiro power at `.kiro/powers/api-conventions/`. It packages the API layering conventions as an on-demand skill so they load automatically when relevant, instead of living only in a steering file that is always in context.

- Activate it when adding or modifying endpoints, controllers, services, or Mongoose models.
- The `add-endpoint` skill is the source of truth for the `route → controller → service → model` flow.

## MCP — `fetch`

The `fetch` MCP server is configured in `.kiro/settings/mcp.json`.

- Use it to pull live documentation from the web (Express, Mongoose, fast-check) into context when the local codebase or knowledge is not enough.
- Prefer official documentation URLs.
- `uvx` (from `uv`) must be installed for this server to run.

## Prerequisites

- Node.js 20+ and npm — for the app and tests.
- `uv` / `uvx` — for the `fetch` MCP server. Install: https://docs.astral.sh/uv/getting-started/installation/
