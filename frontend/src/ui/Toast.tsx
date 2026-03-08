'use client'

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface Toast {
  id: string
  type: ToastType
  message: string
  duration?: number
}

interface ToastContextType {
  toast: (payload: Omit<Toast, 'id'>) => void
  success: (message: string, duration?: number) => void
  error: (message: string, duration?: number) => void
  info: (message: string, duration?: number) => void
  warning: (message: string, duration?: number) => void
  removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const addToast = useCallback((payload: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9)
    const newToast = { ...payload, id }
    setToasts((prev) => [...prev, newToast])

    if (payload.duration !== Infinity) {
      setTimeout(() => {
        removeToast(id)
      }, payload.duration || 5000)
    }
  }, [removeToast])

  const success = useCallback((message: string, duration?: number) => {
    addToast({ type: 'success', message, duration })
  }, [addToast])

  const error = useCallback((message: string, duration?: number) => {
    addToast({ type: 'error', message, duration })
  }, [addToast])

  const info = useCallback((message: string, duration?: number) => {
    addToast({ type: 'info', message, duration })
  }, [addToast])

  const warning = useCallback((message: string, duration?: number) => {
    addToast({ type: 'warning', message, duration })
  }, [addToast])

  return (
    <ToastContext.Provider value={{ toast: addToast, success, error, info, warning, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  )
}

function ToastContainer({ toasts, removeToast }: { toasts: Toast[]; removeToast: (id: string) => void }) {
  return (
    <div className="fixed top-4 left-1/2 z-50 flex -translate-x-1/2 flex-col items-center gap-2 pointer-events-none w-full px-4">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={() => removeToast(toast.id)} />
      ))}
    </div>
  )
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: () => void }) {
  const iconMap = {
    success: <CheckCircle className="w-5 h-5 text-green-500" />,
    error: <AlertCircle className="w-5 h-5 text-red-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />,
    warning: <AlertTriangle className="w-5 h-5 text-yellow-500" />,
  }

  const bgMap = {
    success: 'bg-white border-green-100',
    error: 'bg-white border-red-100',
    info: 'bg-white border-blue-100',
    warning: 'bg-white border-yellow-100',
  }

  return (
    <div
      className={cn(
        "pointer-events-auto flex w-full max-w-sm items-center gap-4 rounded-xl border p-4 shadow-lg transition-all duration-300 animate-in slide-in-from-top-full fade-in",
        bgMap[toast.type]
      )}
    >
      <div className="shrink-0 flex items-center">
        {iconMap[toast.type]}
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-900 wrap-break-word">
          {toast.message}
        </p>
      </div>
      <button
        onClick={onRemove}
        className="shrink-0 flex items-center justify-center rounded-md p-1 text-gray-400 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
