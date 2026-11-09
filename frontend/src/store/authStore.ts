import { create } from 'zustand'
import {
    login as loginRequest,
    getCurrentUser,
    type AuthUser,
    type LoginCredentials
} from '../api/auth'

type AuthState = {
    token: string | null
    user: AuthUser | null
    login: (credentials: LoginCredentials) => Promise<void>
    logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
    token: null,
    user: null,

    login: async (credentials) => {
        // 1. Get JWT from backend
        const { jwt } = await loginRequest(credentials)

        // 2. Get the authenticated user's profile
        const user = await getCurrentUser(jwt)

        // 3. Save both in Zustand
        set({
            token: jwt,
            user
        })
    },

    logout: () => {
        set({
            token: null,
            user: null
        })
    }
}))