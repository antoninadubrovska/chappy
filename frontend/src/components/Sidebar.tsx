import { useState } from 'react'
import { NavLink } from 'react-router-dom'

function Sidebar() {
    const [isOpen, setIsOpen] = useState(false)

    function closeSidebar() {
        setIsOpen(false)
    }

    return (
        <>
            <header className="mobile-header">
                <h2>Chappy</h2>

                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    aria-label={isOpen ? 'Close menu' : 'Open menu'}
                >
                    {isOpen ? '✕' : '☰'}
                </button>
            </header>

            {isOpen && (
                <div
                    className="sidebar-overlay"
                    onClick={closeSidebar}
                />
            )}

            <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
                <h2 className="logo">Chappy</h2>

                <nav className="main-nav">
                    <NavLink to="/" onClick={closeSidebar}>Home</NavLink>
                    <NavLink to="/moreChannels" onClick={closeSidebar}>
                        More channels
                    </NavLink>
                    <NavLink to="/aiChat" onClick={closeSidebar}>
                        AI chat
                    </NavLink>
                </nav>

                <section className="sidebar-section">
                    <h3>Channels</h3>

                    <NavLink to="/channel/general" onClick={closeSidebar}>
                        # general
                    </NavLink>
                    <NavLink to="/channel/special" onClick={closeSidebar}>
                        # special
                    </NavLink>
                    <NavLink to="/channel/scrumptious" onClick={closeSidebar}>
                        # scrumptious
                    </NavLink>
                    <NavLink to="/channel/private" onClick={closeSidebar}>
                        # private 🔑
                    </NavLink>
                </section>

                <section className="sidebar-section">
                    <h3>Direct messages</h3>

                    <NavLink to="/dm/alice" onClick={closeSidebar}>Alice</NavLink>
                    <NavLink to="/dm/anna" onClick={closeSidebar}>Anna</NavLink>
                    <NavLink to="/dm/bob" onClick={closeSidebar}>Bob</NavLink>
                </section>

                <div className="sidebar-profile">
                    <NavLink to="/userProfile" onClick={closeSidebar}>
                        User profile
                    </NavLink>
                </div>
            </aside>
        </>
    )
}

export default Sidebar