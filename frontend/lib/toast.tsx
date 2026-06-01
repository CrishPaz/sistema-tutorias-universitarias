'use client'

import { createContext, useCallback, useContext, useState } from 'react'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'

type ToastType = 'success' | 'error' | 'info'
interface Toast { id: number; message: string; type: ToastType }
type ToastFn = (message: string, type?: ToastType) => void

const ToastContext = createContext<ToastFn>(() => {})

export const useToast = () => useContext(ToastContext)

let _id = 0

const STYLE: Record<ToastType, { box: string; icon: React.ComponentType<{ className?: string }> }> = {
  success: { box: 'border-emerald-500/40 bg-emerald-950/80 text-emerald-200', icon: CheckCircle2 },
  error: { box: 'border-red-500/40 bg-red-950/80 text-red-200', icon: AlertCircle },
  info: { box: 'border-white/20 bg-zinc-900/90 text-zinc-200', icon: Info },
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const remove = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const toast = useCallback<ToastFn>((message, type = 'info') => {
    const id = ++_id
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => remove(id), 3500)
  }, [remove])

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-80 max-w-[90vw]">
        {toasts.map(t => {
          const s = STYLE[t.type]
          return (
            <div key={t.id}
              className={`flex items-start gap-3 p-4 rounded-2xl border backdrop-blur shadow-lg ${s.box} animate-in slide-in-from-bottom-2`}>
              <s.icon className="w-5 h-5 shrink-0 mt-0.5" />
              <span className="text-sm flex-1">{t.message}</span>
              <button onClick={() => remove(t.id)} className="opacity-70 hover:opacity-100"><X className="w-4 h-4" /></button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}
