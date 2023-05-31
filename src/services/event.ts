export class EventEmitter {
  handlers: Record<string, any>
  constructor() {
    this.handlers = {}
  }

  on(event: any, handler: any) {
    if (!this.handlers[event]) this.handlers[event] = []
    this.handlers[event].push({
      once: false,
      func: handler,
    })
  }

  once(event: any, handler: any) {
    if (!this.handlers[event]) this.handlers[event] = []
    this.handlers[event].push({
      once: true,
      func: handler,
    })
  }

  off(event: any, handler?: any | null) {
    if (this.handlers[event]) {
      if (handler)
        this.handlers[event] = this.handlers[event].filter(
          (h: any) => h !== handler
        )
      else delete this.handlers[event]
    }
  }

  emit(event: any, value: any, error?: any | null) {
    if (this.handlers[event]) {
      this.handlers[event].forEach((handler: Record<string, any>) =>
        handler.func(value, error)
      )

      // Rmove all handlers marked as 'once'.
      this.handlers[event] = this.handlers[event].filter((h: any) => !h.once)
    }
  }
}
