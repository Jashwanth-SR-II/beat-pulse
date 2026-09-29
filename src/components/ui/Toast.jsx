import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, AlertCircle, Info, X } from 'lucide-react'

const ToastContext = createContext(null)

let toastIdCounter = 0

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const dismiss = useCallback((id) => {
    setToasts((t) => t.filter((item) => item.id !== id))
  }, [])

  const toast = useCallback(
    (message, options = {}) => {
      const id = ++toastIdCounter
      const duration = options.duration ?? 3000
      setToasts((t) => [...t, { id, message, type: options.type || 'info' }])
      if (duration > 0) setTimeout(() => dismiss(id), duration)
      return id
    },
    [dismiss]
  )

  const api = {
    toast,
    success: (msg, opts) => toast(msg, { ...opts, type: 'success' }),
    error: (msg, opts) => toast(msg, { ...opts, type: 'error' }),
    info: (msg, opts) => toast(msg, { ...opts, type: 'info' }),
  }

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="fixed bottom-28 right-6 z-[100] flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => (
            <ToastItem key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

function ToastItem({ toast, onDismiss }) {
  const icons = {
    success: <Check className="w-4 h-4 text-accent" />,
    error: <AlertCircle className="w-4 h-4 text-red-400" />,
    info: <Info className="w-4 h-4 text-sky-400" />,
  }

  const borderColors = {
    success: 'border-accent/30',
    error: 'border-red-400/30',
    info: 'border-sky-400/30',
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 60, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 60, scale: 0.95 }}
      transition={{ type: 'spring', damping: 24, stiffness: 300 }}
      className={`pointer-events-auto flex items-center gap-3 px-4 py-3
                  bg-card border ${borderColors[toast.type]} rounded-xl shadow-2xl min-w-[280px] max-w-md`}
    >
      {icons[toast.type]}
      <p className="flex-1 text-sm">{toast.message}</p>
      <button
        onClick={onDismiss}
        className="text-text-muted hover:text-white transition"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
