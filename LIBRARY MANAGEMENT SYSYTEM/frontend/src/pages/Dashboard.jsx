import { ArrowRight, ArrowUpRight, BookMarked, BookOpen, CircleCheck, Clock3, Plus, Sparkles, UserPlus, UsersRound } from 'lucide-react'
import { StatCard, StatusBadge } from '../components/UI.jsx'

const ArrowLeftRight = ArrowRight

const todayLabel = () => new Intl.DateTimeFormat('en', { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date())

const dateLabel = (date) => {
  if (!date) return ''
  const parsed = new Date(`${date}T12:00:00`)
  return isNaN(parsed) ? '' : new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(parsed)
}

const sortDesc = (list, key) => [...list].sort((a, b) => String(b[key] || '').localeCompare(String(a[key] || '')))

export default function Dashboard({ books = [], members = [], loans = [], onNavigate, onOpenAddBook, onOpenAddMember, onOpenIssue }) {
  const today = new Date().toISOString().slice(0, 10)
  const activeLoans = loans.filter((loan) => !loan.returnedAt)
  const overdueCount = activeLoans.filter((loan) => (loan.dueAt || '') < today).length
  const bookMap = Object.fromEntries(books.map((book) => [book.id, book]))
  const memberMap = Object.fromEntries(members.map((member) => [member.id, member]))
  const availableCount = books.filter((book) => (book.availableCopies ?? 0) > 0).length
  const categories = [...books.reduce((map, book) => map.set(book.category || 'Uncategorized', (map.get(book.category || 'Uncategorized') || 0) + 1), new Map()).entries()]
    .sort((a, b) => b[1] - a[1]).slice(0, 5)
  const maxCategory = Math.max(1, ...categories.map(([, count]) => count))
  const latestBooks = sortDesc(books, 'addedAt').slice(0, 4)
  const recentLoans = sortDesc(activeLoans, 'issuedAt').slice(0, 4)

  return (
    <div className="page-stack dashboard-page">
      <section className="dashboard-intro">
        <div>
          <div className="eyebrow"><span className="eyebrow-line" />{todayLabel()}</div>
          <h1>A well-kept library<br className="intro-break" /> makes room for ideas.</h1>
          <p>Here’s the story of your collection today.</p>
        </div>
        <button className="button button-primary intro-action" onClick={onOpenIssue}><ArrowLeftRight size={16} />Issue a book<ArrowRight size={15} /></button>
        <div className="intro-watermark" aria-hidden="true"><BookOpen size={124} strokeWidth={0.65} /></div>
      </section>

      <section className="stats-grid" aria-label="Library summary">
        <StatCard label="Total books" value={books.length.toLocaleString()} note="6.8%" icon={BookOpen} tone="ink" />
        <StatCard label="Registered members" value={members.length.toLocaleString()} note="4.2%" icon={UsersRound} tone="sage" />
        <StatCard label="Books on loan" value={activeLoans.length.toLocaleString()} note={`${overdueCount} overdue`} icon={BookMarked} tone="gold" trend="down" />
        <StatCard label="Available now" value={availableCount.toLocaleString()} note="In collection" icon={CircleCheck} tone="blue" />
      </section>

      <section className="dashboard-content-grid">
        <article className="panel collection-panel">
          <div className="panel-heading">
            <div><span className="panel-kicker">THE COLLECTION</span><h2>Catalog at a glance</h2></div>
            <button className="text-link" onClick={() => onNavigate('books')}>Browse catalog<ArrowRight size={14} /></button>
          </div>
          <div className="category-list">
            {categories.map(([category, count], index) => (
              <div className="category-row" key={category}>
                <div className="category-info"><span className={`category-dot category-dot-${index}`} /><span>{category}</span><strong>{count}</strong></div>
                <div className="category-track"><span className={`category-fill category-fill-${index}`} style={{ width: `${Math.max(10, (count / maxCategory) * 100)}%` }} /></div>
              </div>
            ))}
            {!categories.length && <div className="small-empty">Add a book to see the collection take shape.</div>}
          </div>
          <div className="collection-footer"><span><span className="mini-dot mini-dot-green" />Available <strong>{availableCount}</strong></span><span><span className="mini-dot mini-dot-gold" />On loan <strong>{activeLoans.length}</strong></span></div>
        </article>

        <article className="panel activity-panel">
          <div className="panel-heading">
            <div><span className="panel-kicker">CIRCULATION</span><h2>Currently on loan</h2></div>
            <button className="round-icon-link" aria-label="Open circulation" onClick={() => onNavigate('circulation')}><ArrowRight size={15} /></button>
          </div>
          <div className="activity-list">
            {recentLoans.map((loan) => {
              const book = bookMap[loan.bookId] || bookMap[loan.isbn]
              const member = memberMap[loan.memberId]
              const overdue = (loan.dueAt || '') < today
              return (
                <div className="activity-item" key={loan.id}>
                  <div className={`activity-icon ${overdue ? 'activity-icon-warn' : ''}`}>{overdue ? <Clock3 size={15} /> : <BookOpen size={15} />}</div>
                  <div className="activity-copy"><strong>{loan.bookTitle || book?.title || 'Catalog item'}</strong><span>{loan.memberName || member?.name || 'Library member'} · Due {dateLabel(loan.dueAt)}</span></div>
                  <StatusBadge value={overdue ? 'Overdue' : 'Issued'} />
                </div>
              )
            })}
            {!recentLoans.length && <div className="small-empty">Nothing is checked out. A good day for a quiet read.</div>}
          </div>
          <button className="panel-bottom-link" onClick={() => onNavigate('circulation')}>View circulation register <ArrowRight size={14} /></button>
        </article>

        <article className="panel acquisitions-panel">
          <div className="panel-heading">
            <div><span className="panel-kicker">FRESH ON THE SHELVES</span><h2>Recently cataloged</h2></div>
            <button className="round-icon-link" aria-label="Add a book" onClick={onOpenAddBook}><Plus size={16} /></button>
          </div>
          <div className="acquisition-list">
            {latestBooks.map((book) => (
              <div className="acquisition-row" key={book.id || book.isbn}>
                <div className="book-cover-mini"><BookOpen size={16} strokeWidth={1.6} /></div>
                <div className="acquisition-copy"><strong>{book.title}</strong><span>{book.author} · {book.category}</span></div>
                <span className="acquisition-date">{dateLabel(book.addedAt)}</span>
              </div>
            ))}
            {!latestBooks.length && <div className="small-empty">New arrivals will appear here.</div>}
          </div>
        </article>

        <article className="panel quick-panel">
          <div className="panel-heading"><div><span className="panel-kicker">AT YOUR DESK</span><h2>Quick actions</h2></div><Sparkles className="quick-sparkle" size={17} /></div>
          <div className="quick-actions">
            <button className="quick-action" onClick={onOpenAddBook}><span className="quick-action-icon quick-action-ink"><Plus size={16} /></span><span><strong>Add a title</strong><small>Grow the catalog</small></span><ArrowUpRight size={15} /></button>
            <button className="quick-action" onClick={onOpenAddMember}><span className="quick-action-icon quick-action-green"><UserPlus size={16} /></span><span><strong>Register member</strong><small>Welcome a reader</small></span><ArrowUpRight size={15} /></button>
            <button className="quick-action" onClick={onOpenIssue}><span className="quick-action-icon quick-action-gold"><ArrowLeftRight size={16} /></span><span><strong>Issue a book</strong><small>Start a new loan</small></span><ArrowUpRight size={15} /></button>
          </div>
          <div className="desk-note"><span className="open-pulse" /><span>Reading room is open until <strong>8:00 pm</strong></span></div>
        </article>
      </section>
    </div>
  )
}