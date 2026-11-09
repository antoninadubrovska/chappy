
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import AuthForm from '../components/AuthForm'

function LoginPage() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const login = useAuthStore((state) => state.login)
    const navigate = useNavigate()

    async function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
        event.preventDefault()
        setError('')
        setIsLoading(true)

        try {
            await login({ username, password })
            navigate('/')
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Could not log in')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <AuthForm
            title="Welcome to Chappy"
            description="Log in to your account"
            submitLabel="Log in"
            loadingLabel="Logging in..."
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
                required
            />

            <label htmlFor="password">Password</label>
            <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
            />
        </AuthForm>
    )
}

export default LoginPage