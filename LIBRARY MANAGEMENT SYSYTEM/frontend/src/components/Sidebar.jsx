import { ArrowLeftRight, BookOpen, ChevronRight, LayoutDashboard, LibraryBig, UsersRound, X } from 'lucide-react'

const navigation = [
  { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
  { id: 'books', label: 'Book catalog', icon: LibraryBig },
  { id: 'members', label: 'Members', icon: UsersRound },
  { id: 'circulation', label: 'Circulation', icon: ArrowLeftRight, badge: '2' },
]

export default function Sidebar({ activePage, onNavigate, isOpen, onClose, issuedCount }) {
  return (
    <>
      {isOpen && <button className="sidebar-scrim" aria-label="Close navigation" onClick={onClose} />}
      <aside className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
        <div className="brand-lockup">
          <div className="brand-mark"><BookOpen size={19} strokeWidth={1.8} /></div>
          <div><div className="brand-name">folio<span>.</span></div><div className="brand-caption">LIBRARY DESK</div></div>
          <button className="sidebar-close" aria-label="Close navigation" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="campus-switcher">
          <div className="campus-emblem">N</div>
          <div className="campus-copy"><span className="campus-label">CAMPUS LIBRARY</span><strong>College of India</strong></div>
          <ChevronRight className="campus-chevron" size={15} />
        </div>

        <div className="nav-overline">WORKSPACE</div>
        <nav className="nav-list" aria-label="Main navigation">
          {navigation.map(({ id, label, icon: Icon, badge }) => (
            <button key={id} className={`nav-item ${activePage === id ? 'nav-item-active' : ''}`} onClick={() => onNavigate(id)}>
              <Icon size={17} strokeWidth={1.8} />
              <span>{label}</span>
              {id === 'circulation' ? <span className="nav-badge">{issuedCount}</span> : badge && <span className="nav-badge">{badge}</span>}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="open-card">
            <div className="open-indicator"><span /> Open today</div>
            <strong>8:00 am – 8:00 pm</strong>
            <span className="open-note">Quiet study starts at 6 pm</span>
          </div>
          <div className="sidebar-user">
            <div className="user-avatar user-avatar-gold">SS</div>
            <div className="sidebar-user-copy"><strong>Sahebjeet Singh</strong><span>Library administrator</span></div>
            <span className="user-more" aria-hidden="true">···</span>
          </div>
        </div>
      </aside>
    </>
  )
}
