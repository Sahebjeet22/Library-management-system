import { BookOpen, Eye, Plus, Search, SlidersHorizontal, Trash2, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { EmptyState, Modal, Pagination, StatusBadge } from '../components/UI.jsx'

const PAGE_SIZE = 8
const categories = ['Architecture', 'Design & Arts', 'History', 'Literature', 'Philosophy', 'Psychology', 'Technology']
const dateLabel = (date) => date ? new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(`${date}T12:00:00`)) : '—'

export default function BooksPage({ books, loans, searchSeed = '', openAction, onAdd, onDelete, busy }) {
  const [query, setQuery] = useState(searchSeed)
  const [category, setCategory] = useState('All categories')
  const [status, setStatus] = useState('All availability')
  const [page, setPage] = useState(1)
  const [showAdd, setShowAdd] = useState(false)
  const [viewBook, setViewBook] = useState(null)

  useEffect(() => { setQuery(searchSeed); setPage(1) }, [searchSeed])
  useEffect(() => { setPage(1) }, [query, category, status])
  useEffect(() => { if (openAction?.action === 'add') setShowAdd(true) }, [openAction?.token])

  const results = useMemo(() => books.filter((book) => {
    const searchable = `${book.title} ${book.author} ${book.isbn} ${book.id} ${book.category} ${book.shelf}`.toLowerCase()
    return searchable.includes(query.trim().toLowerCase()) && (category === 'All categories' || book.category === category) && (status === 'All availability' || book.status === status)
  }), [books, query, category, status])
  const pageCount = Math.max(1, Math.ceil(results.length / PAGE_SIZE))
  const visible = results.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const categoryOptions = [...new Set([...categories, ...books.map((book) => book.category).filter(Boolean)])].sort()

  async function submitBook(event) {
    event.preventDefault()
    const data = Object.fromEntries(new FormData(event.currentTarget).entries())
    if (await onAdd(data)) setShowAdd(false)
  }

  async function removeBook(book) {
    if (window.confirm(`Remove “${book.title}” from the catalog?`)) await onDelete(book)
  }

  return (
    <div className="page-stack">
      <section className="page-title-row">
        <div><span className="eyebrow"><span className="eyebrow-line" />THE ARCHIVE</span><h1>Book catalog</h1><p>Every volume has a place. Keep yours in order.</p></div>
        <button className="button button-primary" onClick={() => setShowAdd(true)}><Plus size={16} />Add a book</button>
      </section>

      <section className="table-panel">
        <div className="table-toolbar">
          <div className="table-toolbar-title"><div className="toolbar-icon"><BookOpen size={17} /></div><div><strong>Catalog records</strong><span>{books.length} titles across {new Set(books.map((book) => book.category)).size} collections</span></div></div>
          <div className="filter-group">
            <label className="search-field"><Search size={15} /><input aria-label="Search books" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by title, author, ISBN…" />{query && <button aria-label="Clear search" onClick={() => setQuery('')}><X size={14} /></button>}</label>
            <label className="select-field"><SlidersHorizontal size={14} /><select aria-label="Filter by category" value={category} onChange={(event) => setCategory(event.target.value)}><option>All categories</option>{categoryOptions.map((item) => <option key={item}>{item}</option>)}</select></label>
            <select className="select-plain" aria-label="Filter by availability" value={status} onChange={(event) => setStatus(event.target.value)}><option>All availability</option><option>Available</option><option>Issued</option></select>
          </div>
        </div>

        <div className="table-scroll">
          <table className="data-table book-table">
            <thead><tr><th>BOOK / AUTHOR</th><th>REFERENCE</th><th>COLLECTION</th><th>AVAILABILITY</th><th>SHELF</th><th className="cell-actions">ACTIONS</th></tr></thead>
            <tbody>
              {visible.map((book) => (
                <tr key={book.id}>
                  <td><div className="title-cell"><div className="table-book-mark"><BookOpen size={16} /></div><div><strong>{book.title}</strong><span>{book.author}</span></div></div></td>
                  <td><span className="mono-text">{book.id}</span><small className="secondary-line">ISBN {book.isbn || '—'}</small></td>
                  <td><span className="category-label">{book.category}</span><small className="secondary-line">{book.year || 'Year not set'}</small></td>
                                    <td><span className="mono-text">{book.availableCopies ?? 0} of {book.totalCopies ?? 0}</span><small className="secondary-line">copies free</small></td>
                  <td><span className="shelf-label">{book.shelf || 'Unassigned'}</span></td>
                  <td className="cell-actions"><button className="table-action" aria-label={`View ${book.title}`} title="View details" onClick={() => setViewBook(book)}><Eye size={15} /></button><button className="table-action table-action-danger" aria-label={`Remove ${book.title}`} title="Remove book" disabled={busy} onClick={() => removeBook(book)}><Trash2 size={15} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
          {!visible.length && <EmptyState icon={BookOpen} title="No books found" message="Try a different search or clear your filters." />}
        </div>
        <div className="table-footer"><Pagination page={page} pageCount={pageCount} total={results.length} pageSize={PAGE_SIZE} onChange={setPage} /><span className="table-footer-hint">Select a title to view its record.</span></div>
      </section>

      <Modal open={showAdd} title="Add to the catalog" description="Record a new volume in your library." onClose={() => setShowAdd(false)}>
        <form className="form-body" onSubmit={submitBook}>
          <div className="form-grid"><label className="form-field form-span-two"><span>Book title <em>*</em></span><input name="title" required placeholder="e.g. The Art of Looking" /></label>
            <label className="form-field"><span>Author <em>*</em></span><input name="author" required placeholder="Full name" /></label>
            <label className="form-field"><span>Category <em>*</em></span><select name="category" required defaultValue=""><option value="" disabled>Choose collection</option>{categoryOptions.map((item) => <option key={item}>{item}</option>)}</select></label>
            <label className="form-field"><span>ISBN</span><input name="isbn" placeholder="978-0-00-000000-0" /></label>
            <label className="form-field"><span>Shelf location</span><input name="shelf" placeholder="e.g. A-02-14" /></label>
            <label className="form-field"><span>Publication year</span><input name="year" type="number" min="1400" max="2100" placeholder="2024" /></label></div>
          <div className="form-note"><span>i</span> A catalog ID will be assigned automatically.</div>
          <div className="modal-actions"><button type="button" className="button button-quiet" onClick={() => setShowAdd(false)}>Cancel</button><button type="submit" className="button button-primary" disabled={busy}>{busy ? 'Saving…' : <><Plus size={15} />Add book</>}</button></div>
        </form>
      </Modal>

      <Modal open={Boolean(viewBook)} title="Catalog record" description="A closer look at this volume." onClose={() => setViewBook(null)}>
        {viewBook && <div className="detail-body"><div className="detail-cover"><BookOpen size={30} strokeWidth={1.2} /></div><h3 className="detail-title">{viewBook.title}</h3><p className="detail-subtitle">{viewBook.author}</p><StatusBadge value={viewBook.status} /><div className="detail-grid"><span>Catalog ID</span><strong>{viewBook.id}</strong><span>ISBN</span><strong>{viewBook.isbn || '—'}</strong><span>Collection</span><strong>{viewBook.category}</strong><span>Publication year</span><strong>{viewBook.year || '—'}</strong><span>Shelf location</span><strong>{viewBook.shelf || 'Unassigned'}</strong><span>Added to catalog</span><strong>{dateLabel(viewBook.addedAt)}</strong></div></div>}
      </Modal>
    </div>
  )
}
