// Example: Wails v3 app bootstrap (main.go pattern).
//
// Demonstrates: service construction, registration, embedded frontend,
// window creation, and shutdown cleanup. Adapt package names to the project.
package main

import (
	"embed"
	"log"
	"os"
	"path/filepath"

	"github.com/wailsapp/wails/v3/pkg/application"

	"my-app/internal/env"
	"my-app/internal/logger"
	"my-app/internal/notes"
)

//go:embed all:frontend/dist
var assets embed.FS

func main() {
	closeLog := logger.Init()
	defer closeLog()

	// 1. Construct services. Inject dependencies via constructors.
	envSvc := env.NewService()
	notesSvc := notes.NewService()

	// 2. Create the application with services + embedded assets.
	app := application.New(application.Options{
		Name:        "My App",
		Description: "Cross-platform desktop app",
		Services: []application.Service{
			application.NewService(envSvc),
			application.NewService(notesSvc),
		},
		Assets: application.AssetOptions{
			Handler: application.AssetFileServerFS(assets),
		},
		Mac: application.MacOptions{
			ApplicationShouldTerminateAfterLastWindowClosed: true,
		},
	})

	// 3. Create the main window. Match per-project conventions for size/chrome.
	win := app.Window.NewWithOptions(application.WebviewWindowOptions{
		Title:     "My App",
		Width:     940,
		Height:    590,
		MinWidth:  940,
		MinHeight: 590,
		URL:       "/",
	})
	_ = win

	// 4. Register shutdown cleanup: flush queues, stop workers, disconnect.
	app.OnShutdown(func() {
		// notesSvc.OnShutdown()
		// envSvc.Close()
	})

	// 5. Run.
	if err := app.Run(); err != nil {
		log.Fatal(err)
	}
}

// resolveBinDir is an optional pattern for locating sibling binaries
// (e.g. embedded CLI tools extracted next to the executable).
func resolveBinDir() string {
	if exePath, err := os.Executable(); err == nil {
		candidate := filepath.Join(filepath.Dir(exePath), "bin")
		if _, err := os.Stat(candidate); err == nil {
			return candidate
		}
	}
	wd, _ := os.Getwd()
	return filepath.Join(wd, "bin")
}
