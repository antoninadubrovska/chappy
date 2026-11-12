import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { getChannels, type Channel } from "../api/channels";

function Sidebar() {
	const [isOpen, setIsOpen] = useState(false);

	function closeSidebar() {
		setIsOpen(false);
	}

	const [channels, setChannels] = useState<Channel[]>([]);
	const [error, setError] = useState("");

	useEffect(() => {
		getChannels()
			.then(setChannels)
			.catch((error) => {
				console.error(error);
				setError("Could not load channels");
			});
	}, []);

	return (
		<>
			<header className="mobile-header">
				<h2>Chappy</h2>

				<button
					type="button"
					onClick={() => setIsOpen(!isOpen)}
					aria-label={isOpen ? "Close menu" : "Open menu"}
				>
					{isOpen ? "✕" : "☰"}
				</button>
			</header>

			{isOpen && (
				<div className="sidebar-overlay" onClick={closeSidebar} />
			)}

			<aside className={`sidebar ${isOpen ? "open" : ""}`}>
				<h2 className="logo">Chappy</h2>

				<nav className="main-nav">
					<NavLink to="/" onClick={closeSidebar}>
						Home
					</NavLink>
					<NavLink to="/moreChannels" onClick={closeSidebar}>
						More channels
					</NavLink>
					<NavLink to="/aiChat" onClick={closeSidebar}>
						AI chat
					</NavLink>
				</nav>

				<section className="sidebar-section">
					<h3>Channels</h3>

					{/* TODO sort the channels */}

					{error && <p>{error}</p>}

					{channels.map((channel) => (
						<NavLink
							key={channel.channelId}
							// to uses the UUID, so the URL matches our database design
							to={`/channel/${channel.channelId}`}
							onClick={closeSidebar}
						>
							# {channel.name} {channel.isLocked && "🔑"}
						</NavLink>
					))}
				</section>

				<section className="sidebar-section">
					<h3>Direct messages</h3>

					<NavLink to="/dm/alice" onClick={closeSidebar}>
						Alice
					</NavLink>
					<NavLink to="/dm/anna" onClick={closeSidebar}>
						Anna
					</NavLink>
					<NavLink to="/dm/bob" onClick={closeSidebar}>
						Bob
					</NavLink>
				</section>

				<div className="sidebar-profile">
					<NavLink to="/userProfile" onClick={closeSidebar}>
						User profile
					</NavLink>
				</div>
			</aside>
		</>
	);
}

export default Sidebar;
