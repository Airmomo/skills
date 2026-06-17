# Wails v3 Project Conventions

Derived from a proven production wails3 app (`ctv-desktop`). Use this as the reference layout and the recommended default stack for new projects.

## Recommended Default Stack

| Layer | Choice |
|---|---|
| Backend | Go + Wails v3 services |
| Frontend | Svelte 5 + TypeScript |
| Styling | Tailwind CSS v4 (via `@tailwindcss/vite`) |
| Bundler | Vite |
| Runtime bridge | `@wailsio/runtime` |
| Icons | `@lucide/svelte` |
| Build orchestrator | Task (Taskfile) |
| Package manager | pnpm |

This stack is framework-agnostic at the service/binding layer — swap Svelte for Vue/React/Solid if the user prefers; only the frontend wiring changes.

## Project Layout

```
my-app/
├── main.go                     # bootstrap: services + embed + window
├── go.mod / go.sum
├── Taskfile.yml                # entry Taskfile, includes per-OS build Taskfiles
├── internal/                   # backend services (one package per domain)
│   ├── auth/
│   │   └── service.go
│   ├── env/
│   │   └── service.go
│   ├── config/
│   │   └── service.go
│   └── logger/
│       └── logger.go
├── frontend/                   # standard Vite project
│   ├── package.json
│   ├── vite.config.ts
│   ├── svelte.config.js
│   ├── tsconfig.json
│   ├── index.html
│   ├── bindings/               # GENERATED — do not edit (`wails3 generate bindings -ts`)
│   ├── dist/                   # build output, embedded via //go:embed
│   ├── public/
│   └── src/
│       ├── pages/
│       ├── lib/                # thin wrappers over generated bindings
│       └── components/
├── build/                      # wails3 build system (do not hand-edit generated assets)
│   ├── Taskfile.yml            # common build tasks
│   ├── config.yml              # app metadata + dev_mode + fileAssociations
│   ├── windows/                # per-OS Taskfiles + assets
│   ├── darwin/
│   └── linux/
├── embedded/                   # optional: files embedded into the binary (e.g. CLI tools)
└── scripts/                    # project helper scripts (sync, build-cross, ...)
```

## Taskfile.yml (entry)

```yaml
version: '3'

vars:
  APP_NAME: "my-app"
  PACKAGE_MANAGER: '{{.PACKAGE_MANAGER | default "pnpm"}}'
  VITE_PORT: '{{.WAILS_VITE_PORT | default 9245}}'

includes:
  common: ./build/Taskfile.yml
  windows: ./build/windows/Taskfile.yml
  darwin: ./build/darwin/Taskfile.yml
  linux:  ./build/linux/Taskfile.yml

tasks:
  build:    { cmds: [task: "{{OS}}:build"] }
  package:  { cmds: [task: "{{OS}}:package"] }
  run:      { cmds: [task: "{{OS}}:run"] }
  dev:
    cmds:
      - wails3 dev -config ./build/config.yml -port {{.VITE_PORT}}
```

`{{OS}}` dispatches to the platform-specific Taskfile, so the same `task build` works everywhere.

## build/config.yml essentials

```yaml
version: '3'

info:
  companyName: "MyCompany"
  productName: "My App"
  productIdentifier: "com.mycompany.my-app"   # unique; reverse-DNS
  description: "What the app does"
  copyright: "(c) 2026, MyCompany"
  version: "0.1.0"

dev_mode:
  root_path: .
  log_level: warn
  debounce: 1000
  ignore:
    dir: [".git", "node_modules", "frontend", "bin"]
    file: [".DS_Store", ".gitignore", "*_test.go"]
    watched_extension: ["*.go", "*.js", "*.ts"]
    git_ignore: true
  executes:
    - cmd: wails3 build DEV=true
      type: blocking
    - cmd: wails3 task common:dev:frontend
      type: background
    - cmd: wails3 task run
      type: primary
```

After editing `info`, run `wails3 task common:update:build-assets` (regenerates platform assets — overwrites manual edits there).

## main.go Bootstrap Pattern

```go
package main

import (
	"embed"
	"log"

	"github.com/wailsapp/wails/v3/pkg/application"

	"my-app/internal/env"
	"my-app/internal/logger"
)

//go:embed all:frontend/dist
var assets embed.FS

func main() {
	closeLog := logger.Init()
	defer closeLog()

	envSvc := env.NewService()

	app := application.New(application.Options{
		Name:        "My App",
		Description: "One-line description",
		Services: []application.Service{
			application.NewService(envSvc),
		},
		Assets: application.AssetOptions{
			Handler: application.AssetFileServerFS(assets),
		},
		Mac: application.MacOptions{
			ApplicationShouldTerminateAfterLastWindowClosed: true,
		},
	})

	app.Window.NewWithOptions(application.WebviewWindowOptions{
		Title:    "My App",
		Width:    940,
		Height:   590,
		MinWidth: 940,
		MinHeight: 590,
		URL:      "/",
	})

	app.OnShutdown(func() {
		// stop workers, flush state, disconnect
	})

	if err := app.Run(); err != nil {
		log.Fatal(err)
	}
}
```

Full version in `examples/app-bootstrap.go`.

## Frontend package.json (proven deps)

```json
{
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build:dev": "vite build --minify false --mode development",
    "build": "vite build --mode production",
    "preview": "vite preview",
    "check": "svelte-check --tsconfig ./tsconfig.json"
  },
  "dependencies": {
    "@lucide/svelte": "^1.16.0",
    "@wailsio/runtime": "latest"
  },
  "devDependencies": {
    "@sveltejs/vite-plugin-svelte": "^7.0.0",
    "@tailwindcss/vite": "^4.3.0",
    "@tsconfig/svelte": "^5.0.8",
    "svelte": "^5.46.4",
    "svelte-check": "^4.4.8",
    "tailwindcss": "^4.3.0",
    "typescript": "^5.2.2",
    "vite": "^8.0.5"
  }
}
```

`vite.config.ts` wires `@tailwindcss/vite` and `@sveltejs/vite-plugin-svelte`; a `import "tailwindcss"` line in the global stylesheet activates Tailwind v4 (no config file needed).

## Conventions Checklist (new project)

- [ ] `main.go` constructs services, registers them, embeds `frontend/dist`, opens one window, wires `OnShutdown`.
- [ ] One `internal/<domain>/` package per responsibility; services are structs with `NewService` constructors.
- [ ] Service methods return typed structs with `json` tags.
- [ ] `frontend/bindings/` regenerated via `wails3 generate bindings -ts`; never edited by hand.
- [ ] `Taskfile.yml` includes `build/{common,windows,darwin,linux}/Taskfile.yml`.
- [ ] `build/config.yml` populated under `info`; assets regenerated after edits.
- [ ] `.gitignore` excludes `frontend/node_modules`, `frontend/dist`, `bin/`, build outputs.
