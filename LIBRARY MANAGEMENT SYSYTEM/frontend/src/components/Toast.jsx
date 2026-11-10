import { AlertCircle, CheckCircle2, X } from 'lucide-react'

export default function Toast({ toast, onDismiss }) {
  if (!toast) return null
  const Icon = toast.type === 'error' ? AlertCircle : CheckCircle2
  return (
    <div className={`toast toast-${toast.type || 'success'}`} role={toast.type === 'error' ? 'alert' : 'status'}>
      <Icon size={19} />
      <span>{toast.message}</span>
      <button aria-label="Dismiss message" onClick={onDismiss}><X size={15} /></button>
    </div>
  )
}
