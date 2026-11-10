import { Mail, Plus, Search, SlidersHorizontal, Trash2, UserRound, UsersRound, X, Eye } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { EmptyState, Modal, Pagination, StatusBadge } from '../components/UI.jsx'

const PAGE_SIZE = 8
const dateLabel = (date) => date ? new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(`${date}T12:00:00`)) : '—'

export default function MembersPage({ members, loans, books, searchSeed = '', openAction, onAdd, onDelete, busy }) {
  const [query, setQuery] = useState(searchSeed)
  const [department, setDepartment] = useState('All departments')
  const [page, setPage] = useState(1)
  const [showAdd, setShowAdd] = useState(false)
  const [viewMember, setViewMember] = useState(null)

  useEffect(() => { setQuery(searchSeed); setPage(1) }, [searchSeed])
  useEffect(() => { setPage(1) }, [query, department])
  useEffect(() => { if (openAction?.action === 'add') setShowAdd(true) }, [openAction?.token])

  const departments = [...new Set(members.map((member) => member.department).filter(Boolean))].sort()
  const results = useMemo(() => members.filter((member) => {
    const searchable = `${member.name} ${member.email} ${member.department} ${member.id}`.toLowerCase()
    return searchable.includes(query.trim().toLowerCase()) && (department === 'All departments' || member.department === department)
  }), [members, query, department])
  const pageCount = Math.max(1, Math.ceil(results.length / PAGE_SIZE))
  const visible = results.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  async function submitMember(event) {
    event.preventDefault()
    if (await onAdd(Object.fromEntries(new FormData(event.currentTarget).entries()))) setShowAdd(false)
  }

  async function removeMember(member) {
    if (window.confirm(`Remove ${member.name} from the member register?`)) await onDelete(member)
  }

  const activeLoansFor = (memberId) => loans.filter((loan) => loan.memberId === memberId && !loan.returnedAt).length

  return (
    <div className="page-stack">
      <section className="page-title-row">
        <div><span className="eyebrow"><span className="eyebrow-line" />OUR READERS</span><h1>Members</h1><p>People are at the heart of every good library.</p></div>
        <button className="button button-primary" onClick={() => setShowAdd(true)}><Plus size={16} />Register a member</button>
      </section>
      <section className="table-panel">
        <div className="table-toolbar">
          <div className="table-toolbar-title"><div className="toolbar-icon toolbar-icon-green"><UsersRound size={17} /></div><div><strong>Member register</strong><span>{members.length} registered readers</span></div></div>
          <div className="filter-group">
            <label className="search-field"><Search size={15} /><input aria-label="Search members" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name, email, member ID…" />{query && <button aria-label="Clear search" onClick={() => setQuery('')}><X size={14} /></button>}</label>
            <label className="select-field"><SlidersHorizontal size={14} /><select aria-label="Filter by department" value={department} onChange={(event) => setDepartment(event.target.value)}><option>All departments</option>{departments.map((item) => <option key={item}>{item}</option>)}</select></label>
          </div>
        </div>
        <div className="table-scroll">
          <table className="data-table member-table">
            <thead><tr><th>MEMBER</th><th>DEPARTMENT</th><th>JOINED</th><th>ACTIVE LOANS</th><th>STATUS</th><th className="cell-actions">ACTIONS</th></tr></thead>
            <tbody>{visible.map((member, index) => {
              const activeCount = activeLoansFor(member.id)
              return <tr key={member.id}>
                <td><div className="member-cell"><div className={`member-avatar member-avatar-${index % 5}`}>{member.name.split(' ').map((word) => word[0]).slice(0, 2).join('')}</div><div><strong>{member.name}</strong><span><Mail size={12} />{member.email}</span></div></div></td>
                <td><span className="department-chip">{member.department}</span></td>
                <td><span className="date-label">{dateLabel(member.joinedAt)}</span></td>
                <td><span className={`loan-count ${activeCount ? 'loan-count-active' : ''}`}>{activeCount} {activeCount === 1 ? 'book' : 'books'}</span></td>
                <td><StatusBadge value={member.status || 'Active'} /></td>
                <td className="cell-actions"><button className="table-action" aria-label={`View ${member.name}`} title="View profile" onClick={() => setViewMember(member)}><Eye size={15} /></button><button className="table-action table-action-danger" aria-label={`Remove ${member.name}`} title="Remove member" disabled={busy || activeCount > 0} onClick={() => removeMember(member)}><Trash2 size={15} /></button></td>
              </tr>
            })}</tbody>
          </table>
          {!visible.length && <EmptyState icon={UserRound} title="No members found" message="Try another name or department, or register a reader." />}
        </div>
        <div className="table-footer"><Pagination page={page} pageCount={pageCount} total={results.length} pageSize={PAGE_SIZE} onChange={setPage} /><span className="table-footer-hint">Members with books on loan must return them before removal.</span></div>
      </section>

      <Modal open={showAdd} title="Welcome a new reader" description="Create a member record for your library community." onClose={() => setShowAdd(false)}>
        <form className="form-body" onSubmit={submitMember}>
          <div className="form-grid"><label className="form-field form-span-two"><span>Full name <em>*</em></span><input name="name" required placeholder="e.g. Jordan Lee" /></label><label className="form-field form-span-two"><span>Email address <em>*</em></span><input name="email" type="email" required placeholder="name@college.edu" /></label><label className="form-field form-span-two"><span>Department <em>*</em></span><input name="department" required placeholder="e.g. Fine Arts" /></label></div>
          <div className="form-note"><span>i</span> Member ID and join date will be assigned automatically.</div>
          <div className="modal-actions"><button type="button" className="button button-quiet" onClick={() => setShowAdd(false)}>Cancel</button><button type="submit" className="button button-primary" disabled={busy}>{busy ? 'Saving…' : <><Plus size={15} />Register member</>}</button></div>
        </form>
      </Modal>

      <Modal open={Boolean(viewMember)} title="Member profile" description="Reader details and current activity." onClose={() => setViewMember(null)}>
        {viewMember && <div className="member-detail-body"><div className="member-detail-avatar">{viewMember.name.split(' ').map((word) => word[0]).slice(0, 2).join('')}</div><h3>{viewMember.name}</h3><span className="member-profile-email">{viewMember.email}</span><StatusBadge value={viewMember.status || 'Active'} /><div className="detail-grid"><span>Member ID</span><strong>{viewMember.id}</strong><span>Department</span><strong>{viewMember.department}</strong><span>Joined</span><strong>{dateLabel(viewMember.joinedAt)}</strong><span>Books on loan</span><strong>{activeLoansFor(viewMember.id)}</strong><span>Current titles</span><strong className="member-titles">{loans.filter((loan) => loan.memberId === viewMember.id && !loan.returnedAt).map((loan) => books.find((book) => book.id === loan.bookId)?.title).filter(Boolean).join(', ') || 'None'}</strong></div></div>}
      </Modal>
    </div>
  )
}
