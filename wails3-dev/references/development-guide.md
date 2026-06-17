# Wails v3 Development Best Practices

Detailed reference for Phase 5 execution. The service model, binding generation, app lifecycle, the dev/build/package loop, and cross-platform pitfalls.

## The Service Model

A wails3 service is a plain Go struct. Its **exported methods** are automatically exposed to the frontend as typed functions. Resources are constructed at startup and cleaned up at shutdown.

### Anatomy of a service

```go
package env

type Environment struct {
	ID           string `json:"id"`
	Name         string `json:"name"`
	TopDir       string `json:"topDir"`
	Chip         string `json:"chip"`
	CreatedAt    string `json:"createdAt"`
}

type Service struct {
	mu      sync.RWMutex
	envs    []Environment
	dataDir string
}

// NewService is the constructor. Inject dependencies, load state.
func NewService(deps ...any) *Service {
	s := &Service{dataDir: appdir.DataDir()}
	s.load()
	return s
}

// Exported methods become the frontend API. Return typed structs.
func (s *Service) ListEnvironments() []Environment {
	s.mu.RLock()
	defer s.mu.RUnlock()
	return s.envs
}
```

Rules:

- **One responsibility per service.** Group by domain (auth, env, config, build, file…). Do not build a god-service.
- **Inject dependencies via the constructor.** Pass other services or runners in; never reach for globals.
- **Exported methods only are bound.** Unexported helpers stay private.
- **Return typed structs with `json` tags.** The generator turns `Environment` into a TS interface and `ListEnvironments()` into `(): Promise<Environment[]>`. Avoid `interface{}`/`any` returns — they erase the type the frontend gets.
- **Guard shared state with a mutex.** The frontend can fire concurrent calls.
- **Errors:** return Go `error` as the second return value; the binding layer surfaces it as a rejected Promise on the JS side.

See `examples/minimal-service.go` and `examples/app-bootstrap.go`.

## App Bootstrap (main.go)

1. Construct every service.
2. Register them with `application.New(...)` under `Services: []application.Service`.
3. Embed the built frontend via `//go:embed all:frontend/dist` and pass it as `Assets`.
4. Create the window(s).
5. Wire `app.OnShutdown` for cleanup (flush queues, disconnect, release handles).
6. `app.Run()`.

Key `application.Options`:

- `Name`, `Description` — shown in OS window/taskbar metadata.
- `Services` — the bound service list.
- `Assets` — embedded frontend; use `application.AssetFileServerFS(assets)`.
- `Mac.ApplicationShouldTerminateAfterLastWindowClosed` — common UX toggle.

Window options worth setting explicitly: `Title`, `Width`, `Height`, `MinWidth`, `MinHeight`, `Frameless`, `BackgroundType`, `URL`. Proven app uses a 940×590 frameless transparent window — match conventions per project.

## Binding Generation

After changing any exported service method signature or any struct returned from a service:

```bash
wails3 generate bindings -ts
```

- The `-ts` flag is **required**. Without it, Wails emits `.js` files and the frontend loses type safety.
- Output lands under `frontend/bindings/...`, grouped by Go package → struct → methods.
- Never hand-edit generated bindings. They are regenerated from Go on every change.
- The frontend imports them as normal TS modules; `@wailsio/runtime` provides the call/event plumbing.

## Frontend Wiring

The frontend is a standard Vite project. Conventions from the proven stack:

- **Svelte 5 + Tailwind v4 + Vite + `@wailsio/runtime`.** Tailwind v4 uses the Vite plugin (`@tailwindcss/vite`), configured in `vite.config.ts` — no separate `tailwind.config` file required.
- Call services via the generated bindings, e.g. `import { ListEnvironments } from '../bindings/ctv-desktop/internal/env'`.
- Keep all Go-facing calls behind thin frontend modules (e.g. `src/lib/`), so components stay declarative.
- Icons: `@lucide/svelte` (or the framework-equivalent). Match the existing icon set for existing projects.

## Lifecycle & Cleanup

- `app.OnShutdown(func(){...})` runs before exit. Use it to: stop background workers/queues, close network connections, flush persisted state.
- Long-running work (compilation, file scanning) belongs in goroutines spawned from service methods, not blocking the IPC call.
- For cancellable work, return control to the frontend immediately and push progress via events (`application.Event.Emit`) or a queue the frontend polls.

## Dev Loop

```bash
task dev
```

Runs (per `build/config.yml` `dev_mode`):

- `wails3 build DEV=true` on Go change (debounced).
- `wails3 task common:dev:frontend` — Vite dev server in background.
- `wails3 task run` — launch the native window.

Only `*.go`, plus `*.js`/`*.ts` included via the `//wails:include` directive, are watched. The `frontend/` dir is excluded from Go-watch (Vite handles it).

## Build & Package

```bash
task build     # native build (with CGO if available)
task package   # produce distributable (.exe/.app/.deb/.rpm)
```

Build metadata lives in `build/config.yml` under `info` (companyName, productName, productIdentifier, version, copyright). After editing `info` or `fileAssociations`:

```bash
wails3 task common:update:build-assets
```

This regenerates platform assets (icons, manifests, Info.plist) and **overwrites manual edits to those assets**, so keep such config in `config.yml`, not in the generated files.

### Cross-compilation

Native cross-compile needs CGO disabled or a matching C toolchain. For targets without a local C compiler, use the Docker cross-builder (one-time ~800MB setup):

```bash
task setup:docker
```

Then build for foreign platforms inside the Docker image rather than fighting cross-toolchains.

## Cross-Platform Pitfalls

- **Paths.** Use `path` (forward slashes) for any remote/POSIX path or embedded-asset path; reserve `filepath` for paths that are genuinely local to the running OS. Mixing them on Windows corrupts UNC/mapped-drive handling.
- **UNC paths & mapped drives.** On Windows, users often map a share to `Z:` while the same data is a POSIX path on the build host. Never assume the two strings are interchangeable; convert explicitly.
- **Window chrome.** `Frameless` behavior and `WindowsWindow.DisableFramelessWindowDecorations` differ per OS — test each.
- **Menus & dialogs.** Native menu/dialog APIs are platform-specific; gate by OS or accept minor visual divergence.
- **Encodings.** If the app reads files that may be GBK/GB2312/UTF-16LE, detect encoding before decode; do not assume UTF-8.

## Testing Approach

- Keep services pure and injectable so they can be unit-tested without the Wails runtime.
- Use a "test mode" flag (as the proven app does) so services return mock data without a live backend.
- Exercise the full app with `task dev`; verify window/menu/frame behavior on each target platform before packaging.
