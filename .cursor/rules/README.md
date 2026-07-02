# fit project rules

Rules in this folder are **fit-specific**. Portable coding standards live in `~/dotfiles/cursor/` and Cursor **User Rules**.

## This repo keeps

| Rule                   | Scope                                                 |
| ---------------------- | ----------------------------------------------------- |
| `api-contracts.mdc`    | `{ data, error }` envelope and Zod validation         |
| `validation.mdc`       | pnpm, `tsc --noEmit`, ESLint commands for this repo   |
| `testing.mdc`          | Playwright paths, verify workflow, fit E2E commands   |
| `architecture-fit.mdc` | Next.js/Expo layout for `app/`, `components/`, `lib/` |
| `security-fit.mdc`     | Fit API envelope + path-scoped security notes         |
| `naming-scripts.mdc`   | `act:`, `db:`, `test:` package.json script naming     |
| `coderabbit-cli.mdc`   | CodeRabbit CLI usage                                  |

## Personal rules (not in this repo)

Always-on preferences and file-scoped portable rules are maintained in:

- `~/dotfiles/cursor/user-rules.md` → paste into **Cursor Settings → Rules → User Rules**
- `~/dotfiles/cursor/rules/*.mdc` → copied into `imported/` locally (gitignored)

### Setup on a new clone

From the project root:

```bash
mkdir -p .cursor/rules/imported && cp ~/dotfiles/cursor/rules/*.mdc .cursor/rules/imported/
```

Or use the copy script once it exists in dotfiles:

```bash
~/dotfiles/cursor/scripts/copy-rules-to-project.sh
```

Alternative: **Cursor Settings → Rules → Remote Rule (GitHub)** pointing at your dotfiles/cursor-rules repo.

See `~/dotfiles/cursor/README.md` for full setup.
