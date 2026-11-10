import { Bell, BookOpen, Check, Menu, Search, X } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Sidebar from './components/Sidebar.jsx'
import Toast from './components/Toast.jsx'
import Dashboard from './pages/Dashboard.jsx'
import BooksPage from './pages/BooksPage.jsx'
import MembersPage from './pages/MembersPage.jsx'
import CirculationPage from './pages/CirculationPage.jsx'
import { isPreviewMode, libraryApi } from './services/libraryApi.js'

const titles = {
  dashboard: ['Overview', 'A considered view of your library.'],
  books: ['Book catalog', 'Every volume, accounted for.'],
  members: ['Members', 'A community of readers.'],
  circulation: ['Circulation', 'Borrowed, returned, and ready for another reader.'],
}

export default function App() {
  const [activePage, setActivePage] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [books, setBooks] = useState([])
  const [members, setMembers] = useState([])
  const [loans, setLoans] = useState([])
  const [loading, setLoading] = useState(true)
  const [loaded, setLoaded] = useState(false)
  const [busy, setBusy] = useState(false)
  const [apiError, setApiError] = useState('')
  const [toast, setToast] = useState(null)
  const [globalSearch, setGlobalSearch] = useState('')
  const [searchContext, setSearchContext] = useState({ page: '', query: '' })
  const [modalRequest, setModalRequest] = useState({ page: '', action: '', token: 0 })
  const toastTimer = useRef(null)

  const receiveSnapshot = useCallback((snapshot) => {
    setBooks(Array.isArray(snapshot.books) ? snapshot.books : [])
    setMembers(Array.isArray(snapshot.members) ? snapshot.members : [])
    setLoans(Array.isArray(snapshot.loans) ? snapshot.loans : [])
    setLoaded(true)
    setApiError('')
  }, [])

  const refresh = useCallback(async () => {
    try {
      receiveSnapshot(await libraryApi.getSnapshot())
    } catch (error) {
      setApiError(error.message || 'Unable to reach the library service.')
      throw error
    }
  }, [receiveSnapshot])

  useEffect(() => {
    let mounted = true
    libraryApi.getSnapshot().then((snapshot) => {
      if (mounted) receiveSnapshot(snapshot)
    }).catch((error) => {
      if (mounted) setApiError(error.message || 'Unable to reach the library service.')
    }).finally(() => {
      if (mounted) setLoading(false)
    })
    return () => { mounted = false }
  }, [receiveSnapshot])

  useEffect(() => () => window.clearTimeout(toastTimer.current), [])

  const notify = useCallback((message, type = 'success') => {
    setToast({ message, type })
    window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(null), 4200)
  }, [])

  const perform = useCallback(async (operation, successMessage) => {
    setBusy(true)
    try {
      await operation()
      await refresh()
      notify(successMessage)
      return true
    } catch (error) {
      notify(error.message || 'Something went wrong. Please try again.', 'error')
      return false
    } finally {
      setBusy(false)
    }
  }, [notify, refresh])

  const requestDialog = (page, action) => {
    setActivePage(page)
    setModalRequest({ page, action, token: Date.now() })
  }

  const navigate = (page) => {
    setActivePage(page)
    setSidebarOpen(false)
    setGlobalSearch('')
    setSearchContext({ page: '', query: '' })
  }

  const query = globalSearch.trim().toLowerCase()
  const globalResults = useMemo(() => {
    if (query.length < 2) return []
    const foundBooks = books.filter((book) => `${book.title} ${book.author} ${book.id} ${book.isbn}`.toLowerCase().includes(query)).slice(0, 3).map((book) => ({ key: book.id, label: book.title, detail: `${book.author} · ${book.id}`, page: 'books', query: book.title, kind: 'Book' }))
    const foundMembers = members.filter((member) => `${member.name} ${member.email} ${member.department} ${member.id}`.toLowerCase().includes(query)).slice(0, 3).map((member) => ({ key: member.id, label: member.name, detail: `${member.email} · ${member.id}`, page: 'members', query: member.name, kind: 'Member' }))
    const foundLoans = loans.filter((loan) => {
      const book = books.find((item) => item.id === loan.bookId)
      const member = members.find((item) => item.id === loan.memberId)
      return `${loan.id} ${book?.title || ''} ${member?.name || ''}`.toLowerCase().includes(query)
    }).slice(0, 2).map((loan) => ({ key: loan.id, label: books.find((book) => book.id === loan.bookId)?.title || 'Loan record', detail: `${members.find((member) => member.id === loan.memberId)?.name || 'Member'} · ${loan.id}`, page: 'circulation', query: loan.id, kind: 'Loan' }))
    return [...foundBooks, ...foundMembers, ...foundLoans].slice(0, 7)
  }, [books, members, loans, query])

  const selectSearchResult = (result) => {
    setActivePage(result.page)
    setSearchContext({ page: result.page, query: result.query })
    setSidebarOpen(false)
    setGlobalSearch('')
  }

  const currentTitle = titles[activePage] || titles.dashboard
  const overdueCount = loans.filter((loan) => !loan.returnedAt && loan.dueAt < new Date().toISOString().slice(0, 10)).length
  const routeSeed = (page) => searchContext.page === page ? searchContext.query : ''

  if (loading && !loaded) {
    return <div className="loading-screen"><div className="loading-mark"><BookOpen size={21} /></div><div className="loading-rule" /><span>Opening the reading room…</span></div>
  }

  if (!loaded && apiError) {
    return <div className="connection-screen"><div className="connection-mark"><BookOpen size={23} /></div><span className="eyebrow"><span className="eyebrow-line" />LIBRARY DESK</span><h1>The catalog is taking a moment.</h1><p>{apiError}</p><button className="button button-primary" onClick={() => { setLoading(true); refresh().catch(() => {}).finally(() => setLoading(false)) }}>Try again</button><span className="connection-help">Check that the C++ API is running and its URL is configured.</span></div>
  }

  return (
    <div className="app-shell">
      <Sidebar activePage={activePage} onNavigate={navigate} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} issuedCount={loans.filter((loan) => !loan.returnedAt).length} />
      <div className="main-region">
        <header className="topbar">
          <div className="topbar-leading"><button className="mobile-menu-button" aria-label="Open navigation" onClick={() => setSidebarOpen(true)}><Menu size={19} /></button><div className="topbar-heading"><span className="topbar-overline">College of India</span><strong>{currentTitle[0]}</strong></div></div>
          <div className="topbar-center">
            <div className={`global-search-wrap ${globalSearch ? 'global-search-active' : ''}`}>
              <Search size={16} /><input value={globalSearch} onChange={(event) => setGlobalSearch(event.target.value)} onKeyDown={(event) => {
                if (event.key === 'Escape') setGlobalSearch('')
                if (event.key === 'Enter' && globalResults[0]) selectSearchResult(globalResults[0])
              }} placeholder="Search books, readers, loans…" aria-label="Search the library" />
              {globalSearch && <button aria-label="Clear search" className="global-search-clear" onClick={() => setGlobalSearch('')}><X size={14} /></button>}
              {globalSearch.trim().length >= 2 && <div className="search-results" role="listbox" aria-label="Search results">
                <div className="search-results-caption">SEARCH THE LIBRARY</div>
                {globalResults.length ? globalResults.map((result) => (
                  <button className="search-result" key={`${result.kind}-${result.key}`} role="option" onClick={() => selectSearchResult(result)}><span className={`search-result-icon search-result-${result.kind.toLowerCase()}`}>{result.kind === 'Book' ? <BookOpen size={15} /> : result.kind === 'Member' ? <span className="search-initial">M</span> : <span className="search-initial">↔</span>}</span><span className="search-result-copy"><strong>{result.label}</strong><small>{result.detail}</small></span><span className="search-result-kind">{result.kind}</span></button>
                )) : <div className="search-no-results">No matches in the catalog.</div>}
                <div className="search-results-footer">Press <kbd>↵</kbd> to open the first result</div>
              </div>}
            </div>
          </div>
          <div className="topbar-actions">
            {isPreviewMode && <span className="preview-pill"><span />Preview data</span>}
            <button className="notification-button" aria-label={`${overdueCount} overdue books`} title={`${overdueCount} overdue books`} onClick={() => navigate('circulation')}><Bell size={17} />{overdueCount > 0 && <span className="notification-dot" />}</button>
            <span className="topbar-divider" />
            <div className="topbar-admin"><div className="user-avatar topbar-avatar">SS</div><div><strong>Sahebjeet Singh</strong><span>Administrator</span></div></div>
          </div>
        </header>

        <main className="page-content">
          {apiError && loaded && <div className="api-warning" role="status"><span>{apiError}</span><button onClick={() => refresh().catch(() => {})}>Retry connection</button></div>}
          {activePage === 'dashboard' && <Dashboard books={books} members={members} loans={loans} onNavigate={navigate} onOpenAddBook={() => requestDialog('books', 'add')} onOpenAddMember={() => requestDialog('members', 'add')} onOpenIssue={() => requestDialog('circulation', 'issue')} />}
          {activePage === 'books' && <BooksPage books={books} loans={loans} searchSeed={routeSeed('books')} openAction={modalRequest.page === 'books' ? modalRequest : null} onAdd={(payload) => perform(() => libraryApi.addBook(payload), 'Book added to the catalog.')} onDelete={(book) => perform(() => libraryApi.deleteBook(book.id), 'Book removed from the catalog.')} busy={busy} />}
          {activePage === 'members' && <MembersPage members={members} loans={loans} books={books} searchSeed={routeSeed('members')} openAction={modalRequest.page === 'members' ? modalRequest : null} onAdd={(payload) => perform(() => libraryApi.addMember(payload), 'Member registered successfully.')} onDelete={(member) => perform(() => libraryApi.deleteMember(member.id), 'Member removed from the register.')} busy={busy} />}
          {activePage === 'circulation' && <CirculationPage loans={loans} books={books} members={members} openAction={modalRequest.page === 'circulation' ? modalRequest : null} onIssue={(payload) => perform(() => libraryApi.issueBook(payload), 'Book issued. Due date set for 14 days from today.')} onReturn={(loan) => perform(() => libraryApi.returnBook(loan.id), 'Return processed. The copy is available again.')} busy={busy} />}
          <footer className="page-footer"><span><BookOpen size={14} />Library Desk <span className="footer-dot">·</span> College of India</span><span>Built for thoughtful stewardship.</span></footer>
        </main>
      </div>
      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  )
}
