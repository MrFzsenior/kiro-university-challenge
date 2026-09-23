# New Endpoint Checklist

- [ ] Model created/updated with interface + indexes
- [ ] Pure domain logic (if any) extracted to `src/domain/` and property-tested
- [ ] Service function added (no `req`/`res`, throws via `createError`)
- [ ] Controller handler added (thin, try/catch, `next(err)`)
- [ ] Route wired with validators + `validate` + auth middleware
- [ ] Route mounted in `src/index.ts` (if a new router)
- [ ] Response uses the standard envelope
- [ ] `npx tsc --noEmit` passes
- [ ] `npm test` passes
