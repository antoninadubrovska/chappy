import { NavLink, Outlet } from 'react-router-dom'
import './App.css'

function App() {
    return (
        <div className="app">
            <header>
                <h2>Chappy</h2>

                <nav>
                    <NavLink to="/">Home</NavLink>
                    <NavLink to="/discover">More channels</NavLink>
                    <NavLink to="/ai">AI</NavLink>
                </nav>
            </header>

            <main>
                <Outlet />
            </main>
        </div>
    )
}

export default App