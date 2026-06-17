// Example: a minimal, idiomatic Wails v3 service.
//
// Copy this as internal/<domain>/service.go and adapt. Exported methods become
// the frontend API; structs with `json` tags become TypeScript types after
// `wails3 generate bindings -ts`.
package notes

import (
	"crypto/rand"
	"fmt"
	"sync"
	"time"
)

// Note is a typed payload. Its `json` tags define the TS interface fields.
type Note struct {
	ID        string `json:"id"`
	Title     string `json:"title"`
	Body      string `json:"body"`
	CreatedAt string `json:"createdAt"`
}

// Service holds domain state. Inject deps via NewService; guard shared state
// with a mutex because the frontend can issue concurrent calls.
type Service struct {
	mu    sync.RWMutex
	notes map[string]Note
}

// NewService is the constructor. Wails calls it once at startup.
func NewService() *Service {
	return &Service{notes: make(map[string]Note)}
}

// List returns every note. Typed return → typed TS binding.
func (s *Service) List() []Note {
	s.mu.RLock()
	defer s.mu.RUnlock()
	out := make([]Note, 0, len(s.notes))
	for _, n := range s.notes {
		out = append(out, n)
	}
	return out
}

// Get returns a single note. A Go error becomes a rejected Promise on the
// frontend side.
func (s *Service) Get(id string) (Note, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	n, ok := s.notes[id]
	if !ok {
		return Note{}, fmt.Errorf("note %q not found", id)
	}
	return n, nil
}

// Create adds a note and returns it. Non-exported helpers stay private.
func (s *Service) Create(title, body string) Note {
	s.mu.Lock()
	defer s.mu.Unlock()
	n := Note{
		ID:        newID(),
		Title:     title,
		Body:      body,
		CreatedAt: time.Now().Format(time.RFC3339),
	}
	s.notes[n.ID] = n
	return n
}

// OnShutdown is optional; if present, Wails calls it at exit for cleanup.
// Alternatively, register cleanup via app.OnShutdown in main.go.
func (s *Service) OnShutdown() {
	// flush state, close handles, stop workers
}

// newID is a private helper — unexported, so it is NOT bound to the frontend.
func newID() string {
	var b [8]byte
	_, _ = rand.Read(b[:])
	return fmt.Sprintf("%x", b[:])
}
