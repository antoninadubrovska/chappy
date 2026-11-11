import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "../api/auth";
import AuthForm from "../components/AuthForm";

function RegisterPage() {
	// form values
	const [username, setUsername] = useState("");
	const [displayName, setDisplayName] = useState("");
	const [password, setPassword] = useState("");

	const [error, setError] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	const navigate = useNavigate();

	async function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
		event.preventDefault();
		setError("");
		setIsLoading(true);

		try {
			// submit the registration data
			await register({ username, displayName, password });
			// redirect after successful registration
			navigate("/login", { state: { registered: true } });
		} catch (error) {
			setError(
				error instanceof Error
					? error.message
					: "Could not register user",
			);
		} finally {
			setIsLoading(false);
		}
	}

	return (
		<AuthForm
			title="Create an account"
			description="Join Chappy"
			submitLabel="Register"
			loadingLabel="Creating account..."
			error={error}
			isLoading={isLoading}
			onSubmit={handleSubmit}
		>
			<label htmlFor="username">Username</label>
			<input
				id="username"
				type="text"
				value={username}
				onChange={(event) => setUsername(event.target.value)}
				minLength={3}
				required
			/>

			<label htmlFor="displayName">Display name</label>
			<input
				id="displayName"
				type="text"
				value={displayName}
				onChange={(event) => setDisplayName(event.target.value)}
				required
			/>

			<label htmlFor="password">Password</label>
			<input
				id="password"
				type="password"
				value={password}
				onChange={(event) => setPassword(event.target.value)}
				minLength={8}
				pattern="(?=.*[A-Za-z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).+"
				title="Password must contain at least 8 characters: one letter, one number and one special character"
				required
			/>
		</AuthForm>
	);
}

export default RegisterPage;
