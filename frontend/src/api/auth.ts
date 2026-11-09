
export type LoginCredentials = {
    username: string
    password: string
}

export type RegistrationData = {
    username: string
    displayName: string
    password: string
}

export type AuthUser = {
    userId: string
    username: string
    displayName: string
}

type TokenResponse = {
    jwt: string
}

// Login: send credentials and receive a JWT
export async function login(credentials: LoginCredentials): Promise<TokenResponse> {
	// Get JWT from backend
    const response = await fetch('/api/users/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
    })

    if (!response.ok) {
        throw new Error('Invalid username or password')
    }

    return response.json()
}

// Registration: create a new user
export async function register(data: RegistrationData): Promise<AuthUser> {
	// 	create a new account
    const response = await fetch('/api/users/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })

    if (!response.ok) {
        const result = await response.json()
        throw new Error(result.message || 'Could not register user')
    }

    return response.json()
}

// Get the currently authenticated user's profile using JWT 
export async function getCurrentUser(token: string): Promise<AuthUser> {
    const response = await fetch('/api/users/me', {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })

    if (!response.ok) {
        throw new Error('Could not retrieve user profile')
    }

    return response.json()
}
