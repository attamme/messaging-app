import demoPic from '../assets/demo.jpg'

export default function Sidebar({ onLogout }) {
    return (
        <nav className="sidebar">
            <div className="sidebar-icons">
                <img src={demoPic} className="server-icon" alt="server-icon1" />
                <img src={demoPic} className="server-icon" alt="server-icon1" />
            </div>
            <button className="add-server">+</button>
            <button onClick={onLogout} className="logout-button">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                <span>Log out</span>
            </button>
        </nav>
    )
}
