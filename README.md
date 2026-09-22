# Sports Club Management API

A RESTful API for managing sports club registrations, members, programs, and gamification — built as part of the [Kiro University Challenge](https://kiro.dev/2026/university/).

## Overview

This project demonstrates all 7 lessons of the Kiro University Challenge:

1. **Spec-driven development** — Features planned with Kiro Specs before implementation
2. **Steering documents** — Persistent project context via `.kiro/steering/`
3. **Hooks** — Automated workflows on file save and task completion
4. **MCP** — Extended tooling via Model Context Protocol
5. **Agent customization** — Custom agents for domain-specific tasks
6. **CLI usage** — Kiro CLI integration in the workflow
7. **Kiro Web** — Web-based interactions

## Tech Stack

- **Runtime:** Node.js 20+
- **Language:** TypeScript
- **Framework:** Express
- **Database:** MongoDB (Mongoose)
- **Auth:** JWT + OTP
- **Testing:** Vitest

## Getting Started

```bash
npm install
cp .env.example .env
npm run dev
```

## Project Structure

```
src/
├── controllers/     # Route handlers
├── models/          # Mongoose schemas
├── routes/          # Express routers
├── services/        # Business logic
├── middleware/       # Auth, validation, error handling
└── index.ts         # Entry point
.kiro/
├── steering/        # Persistent Kiro context
├── specs/           # Feature specs
└── hooks/           # Automated workflows (type-check, tests)
```

## Automation Hooks

Hooks in `.kiro/hooks/` run automatically on session events:

| Hook | Trigger | Action |
|------|---------|--------|
| `type-check-on-save` | Any `.ts` file saved | `npx tsc --noEmit` |
| `test-on-service-save` | A file in `src/services/` saved | `npm test` |
| `test-after-task` | A spec task completes | `npm test` |

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/otp/request` | Request OTP |
| POST | `/api/auth/otp/verify` | Verify OTP & get token |
| GET | `/api/programs` | List all programs |
| POST | `/api/programs` | Create program (admin) |
| POST | `/api/registrations` | Register for a program |
| GET | `/api/members/me` | Get current member profile |
| GET | `/api/members/me/points` | Get gamification points |

## License

MIT
