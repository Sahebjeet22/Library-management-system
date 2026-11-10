import { ArrowLeftRight, BookOpen, CalendarClock, Check, Clock3, Plus, Search, SlidersHorizontal, Undo2, UsersRound, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { EmptyState, Modal, Pagination, StatusBadge, StatCard } from '../components/UI.jsx'

const PAGE_SIZE = 8
const today = () => new Date().toISOString().slice(0, 10)
const dateLabel = (date) => date ? new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(`${date}T12:00:00`)) : '—'
const loanStatus = (loan) => loan.returnedAt ? 'Returned' : loan.dueAt < today() ? 'Overdue' : 'Issued'

export default function CirculationPage({ loans, books, members, openAction, onIssue, onReturn, busy }) {
  const [view, setView] = useState('active')
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('All statuses')
  const [page, setPage] = useState(1)
  const [showIssue, setShowIssue] = useState(false)
  const activeLoans = loans.filter((loan) => !loan.returnedAt)
  const overdue = activeLoans.filter((loan) => loanStatus(loan) === 'Overdue').length
  const returnedThisMonth = loans.filter((loan) => loan.returnedAt && loan.returnedAt.slice(0, 7) === today().slice(0, 7)).length
  const bookMap = Object.fromEntries(books.map((book) => [book.id, book]))
  const memberMap = Object.fromEntries(members.map((member) => [member.id, member]))
  const availableBooks = books.filter((book) => book.status === 'Available')
  const eligibleMembers = members.filter((member) => (member.status || 'Active') === 'Active')

  useEffect(() => { setPage(1) }, [view, status, query])
  useEffect(() => { if (openAction?.action === 'issue') setShowIssue(true) }, [openAction?.token])

  const results = useMemo(() => loans.filter((loan) => {
    const currentStatus = loanStatus(loan)
    const belongs = view === 'active' ? !loan.returnedAt : Boolean(loan.returnedAt)
    const book = bookMap[loan.bookId]
    const member = memberMap[loan.memberId]
    const searchable = `${loan.id} ${book?.title || ''} ${book?.author || ''} ${member?.name || ''} ${member?.id || ''}`.toLowerCase()
    return belongs && searchable.includes(query.trim().toLowerCase()) && (status === 'All statuses' || currentStatus === status)
  }), [loans, view, query, status, books, members])
  const pageCount = Math.max(1, Math.ceil(results.length / PAGE_SIZE))
  const visible = results.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  async function submitIssue(event) {
    event.preventDefault()
    const data = Object.fromEntries(new FormData(event.currentTarget).entries())
    if (await onIssue(data)) setShowIssue(false)
  }

  async function processReturn(loan) {
    const book = bookMap[loan.bookId]
    if (window.confirm(`Mark “${book?.title || 'this book'}” as returned?`)) await onReturn(loan)
  }

  return (
    <div className="page-stack">
      <section className="page-title-row">
        <div><span className="eyebrow"><span className="eyebrow-line" />LOAN REGISTER</span><h1>Circulation</h1><p>From the shelf to a reader, and safely back again.</p></div>
        <button className="button button-primary" onClick={() => setShowIssue(true)}><Plus size={16} />Issue a book</button>
      </section>

      <section className="stats-grid circulation-stats">
        <StatCard label="Currently on loan" value={activeLoans.length} note="Active loans" icon={ArrowLeftRight} tone="ink" />
        <StatCard label="Past due date" value={overdue} note={overdue ? 'Needs attention' : 'All on track'} icon={CalendarClock} tone="gold" trend="down" />
        <StatCard label="Returned this month" value={returnedThisMonth} note="Completed loans" icon={Check} tone="sage" />
        <StatCard label="Registered readers" value={members.length} note="Eligible to borrow" icon={UsersRound} tone="blue" />
      </section>

      <section className="table-panel">
        <div className="table-toolbar circulation-toolbar">
          <div className="circulation-tabs" role="tablist" aria-label="Circulation view">
            <button role="tab" aria-selected={view === 'active'} className={view === 'active' ? 'circulation-tab circulation-tab-active' : 'circulation-tab'} onClick={() => { setView('active'); setStatus('All statuses') }}>On loan <span>{activeLoans.length}</span></button>
            <button role="tab" aria-selected={view === 'returned'} className={view === 'returned' ? 'circulation-tab circulation-tab-active' : 'circulation-tab'} onClick={() => { setView('returned'); setStatus('All statuses') }}>Return history <span>{loans.filter((loan) => loan.returnedAt).length}</span></button>
          </div>
          <div className="filter-group">
            <label className="search-field"><Search size={15} /><input aria-label="Search circulation records" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search title, member, loan ID…" />{query && <button aria-label="Clear search" onClick={() => setQuery('')}><X size={14} /></button>}</label>
            <label className="select-field"><SlidersHorizontal size={14} /><select aria-label="Filter by loan status" value={status} onChange={(event) => setStatus(event.target.value)}><option>All statuses</option>{view === 'active' ? <><option>Issued</option><option>Overdue</option></> : <option>Returned</option>}</select></label>
          </div>
        </div>
        <div className="table-scroll">
          <table className="data-table circulation-table">
            <thead><tr><th>BOOK & READER</th><th>LOAN ID</th><th>ISSUED</th><th>{view === 'active' ? 'DUE DATE' : 'RETURNED'}</th><th>STATUS</th><th className="cell-actions">ACTION</th></tr></thead>
            <tbody>{visible.map((loan) => {
              const book = bookMap[loan.bookId]
              const member = memberMap[loan.memberId]
              const currentStatus = loanStatus(loan)
              return <tr key={loan.id}>
                <td><div className="loan-book-cell"><div className="table-book-mark"><BookOpen size={16} /></div><div><strong>{book?.title || 'Catalog item'}</strong><span><span className="loan-member-dot">{member?.name?.split(' ').map((part) => part[0]).slice(0, 2).join('') || '—'}</span>{member?.name || 'Member record unavailable'}</span></div></div></td>
                <td><span className="mono-text">{loan.id}</span></td>
                <td><span className="date-label">{dateLabel(loan.issuedAt)}</span></td>
                <td><span className={`date-label ${currentStatus === 'Overdue' ? 'date-overdue' : ''}`}>{dateLabel(view === 'active' ? loan.dueAt : loan.returnedAt)}</span></td>
                <td><StatusBadge value={currentStatus} /></td>
                <td className="cell-actions">{view === 'active' ? <button className="button button-return" disabled={busy} onClick={() => processReturn(loan)}><Undo2 size={14} />Process return</button> : <span className="returned-mark"><Check size={14} />Complete</span>}</td>
              </tr>
            })}</tbody>
          </table>
          {!visible.length && <EmptyState icon={view === 'active' ? Clock3 : Undo2} title={view === 'active' ? 'No active loans' : 'No return records yet'} message={query || status !== 'All statuses' ? 'Try clearing the search or filters.' : view === 'active' ? 'Issue a book to start a circulation record.' : 'Completed returns will be listed here.'} />}
        </div>
        <div className="table-footer"><Pagination page={page} pageCount={pageCount} total={results.length} pageSize={PAGE_SIZE} onChange={setPage} /><span className="table-footer-hint">Borrowing period: 14 days from issue date.</span></div>
      </section>

      <Modal open={showIssue} title="Issue a book" description="Pair a library copy with its reader." onClose={() => setShowIssue(false)}>
        <form className="form-body" onSubmit={submitIssue}>
          <div className="issue-step"><span>01</span><div><strong>Choose a book</strong><small>Only available copies are listed.</small></div></div>
          <label className="form-field"><span>Available title <em>*</em></span><select name="bookId" required defaultValue=""><option value="" disabled>Select a book</option>{availableBooks.map((book) => <option key={book.id} value={book.id}>{book.title} — {book.author}</option>)}</select></label>
          <div className="issue-step issue-step-second"><span>02</span><div><strong>Choose a reader</strong><small>Due date will be set to 14 days.</small></div></div>
          <label className="form-field"><span>Registered member <em>*</em></span><select name="memberId" required defaultValue=""><option value="" disabled>Select a member</option>{eligibleMembers.map((member) => <option key={member.id} value={member.id}>{member.name} · {member.id}</option>)}</select></label>
          {(!availableBooks.length || !eligibleMembers.length) && <div className="form-warning">{!availableBooks.length ? 'There are no available copies to issue.' : 'Register or activate a member before issuing a book.'}</div>}
          <div className="issue-due-note"><CalendarClock size={15} /><span>Return due <strong>{new Intl.DateTimeFormat('en', { month: 'long', day: 'numeric' }).format(new Date(Date.now() + 14 * 86400000))}</strong> (14 days)</span></div>
          <div className="modal-actions"><button type="button" className="button button-quiet" onClick={() => setShowIssue(false)}>Cancel</button><button type="submit" className="button button-primary" disabled={busy || !availableBooks.length || !eligibleMembers.length}>{busy ? 'Issuing…' : <><ArrowLeftRight size={15} />Confirm issue</>}</button></div>
        </form>
      </Modal>
    </div>
  )
}
