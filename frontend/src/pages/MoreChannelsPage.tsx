import { useEffect, useState } from "react";
import { getUsers, type User } from "../api/users";



function MoreChannelsPage() {
	const [users, setUsers] = useState<User[]>([]);
	const [error, setError] = useState("");

    useEffect(() => {
        getUsers()
            .then(setUsers)
            .catch(error => {
                console.error(error)
                setError('Could not load users')
            })
    }, [])

	return (
		<section>
			<h1>More channels</h1>
			<h2>Users</h2>

			{error && <p>{error}</p>}

			{users.length === 0 && !error && <p>No users found.</p>}

			<ul>
				{users.map((user) => (
					<li key={user.userId}>{user.username}</li>
				))}
			</ul>
		</section>
	);
}

export default MoreChannelsPage;
