import { createPortal } from 'react-dom'
import { ArrowDownRight, ArrowUpRight, BookOpen, ChevronLeft, ChevronRight, CircleCheck, CircleDashed, Clock3, UserRound, UsersRound } from 'lucide-react'

export function Modal({ open, title, description, onClose, children, size = 'normal' }) {
  if (!open) return null
  return createPortal(
    <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className={`modal-card ${size === 'wide' ? 'modal-wide' : ''}`} role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div className="modal-header">
          <div><h2 id="modal-title">{title}</h2>{description && <p>{description}</p>}</div>
          <button className="icon-button" aria-label="Close dialog" onClick={onClose}>×</button>
        </div>
        {children}
      </section>
    </div>,
    document.body
  )
}

export function StatusBadge({ value }) {
  const normalized = String(value || '').toLowerCase()
  const type = normalized.includes('overdue') ? 'overdue' : normalized.includes('issued') || normalized.includes('loan') ? 'issued' : normalized.includes('return') ? 'returned' : 'available'
  const Icon = type === 'overdue' ? Clock3 : type === 'issued' ? CircleDashed : type === 'returned' ? CircleCheck : CircleCheck
  return <span className={`status-badge status-${type}`}><Icon size={12} strokeWidth={2.2} />{value}</span>
}

export function StatCard({ label, value, note, icon, tone = 'ink', trend = 'up' }) {
  const icons = { books: BookOpen, members: UsersRound, issued: ArrowUpRight, available: CircleCheck }
  const Icon = icon || icons.books
  const showTrend = String(note).includes('%')
  const TrendIcon = trend === 'down' ? ArrowDownRight : ArrowUpRight
  return (
    <article className="stat-card">
      <div className={`stat-icon stat-icon-${tone}`}><Icon size={18} strokeWidth={1.8} /></div>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-foot"><span className={showTrend ? 'stat-trend' : 'stat-note'}>{showTrend && <TrendIcon size={12} />}{note}</span>{showTrend && <span>vs last month</span>}</div>
    </article>
  )
}

export function Pagination({ page, pageCount, total, pageSize, onChange }) {
  if (total <= pageSize) return <div className="table-count">Showing <strong>{total}</strong> {total === 1 ? 'record' : 'records'}</div>
  const start = (page - 1) * pageSize + 1
  const end = Math.min(page * pageSize, total)
  return (
    <div className="table-pagination">
      <span>Showing <strong>{start}–{end}</strong> of <strong>{total}</strong></span>
      <div className="pagination-actions">
        <button className="pagination-button" disabled={page <= 1} aria-label="Previous page" onClick={() => onChange(page - 1)}><ChevronLeft size={15} /></button>
        <span>{page} / {pageCount}</span>
        <button className="pagination-button" disabled={page >= pageCount} aria-label="Next page" onClick={() => onChange(page + 1)}><ChevronRight size={15} /></button>
      </div>
    </div>
  )
}

export function EmptyState({ icon: Icon = UserRound, title, message }) {
  return <div className="empty-state"><div className="empty-icon"><Icon size={21} /></div><strong>{title}</strong><span>{message}</span></div>
}