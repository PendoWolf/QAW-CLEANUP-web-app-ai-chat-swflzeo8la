/// <reference types="vite/client" />

interface Window {
  pendo?: { trackAgent: (eventType: string, metadata: object) => void };
}
