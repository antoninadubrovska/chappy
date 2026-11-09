import { Outlet } from "react-router-dom";
import Sidebar from "./components/Sidebar";

function App() {
	return (
		<div className="app">
			{/* <header>
                <h2>Chappy</h2>

                <nav>
                    <NavLink to="/">Home</NavLink>
                    <NavLink to="/discover">More channels</NavLink>
                    <NavLink to="/ai">AI</NavLink>
                </nav>
            </header> */}
			<Sidebar />

			<main className="main-content">
				<Outlet />
			</main>
		</div>
	);
}

export default App;
