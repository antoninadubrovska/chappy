import * as z from 'zod'

// complete stored user, including the password hash
export const userSchema = z.object({
    userId: z.string(),
    username: z.string().min(3),
    displayName: z.string().min(1),
    passwordHash: z.string(),
    createdAt: z.string()
})

export type User = z.infer<typeof userSchema>

// information supplied during registration
export const userRegistrationSchema = z.object({
    username: z.string().trim().min(3),
    displayName: z.string().trim().min(1),
    password: z.string().min(8)
})

export type UserRegistration = z.infer<typeof userRegistrationSchema>

// public user information returned by API
export const publicUserSchema = userSchema.omit({
    passwordHash: true
})

export type PublicUser = z.infer<typeof publicUserSchema>


// info supplied during login
export const loginCredentialsSchema = z.object({
    username: z.string().trim().min(3),
    password: z.string().min(8)
})

export type LoginCredentials = z.infer<typeof loginCredentialsSchema>

// response returned after successful login
export type TokenResponse = {
    jwt: string
}

// info stored inside JWT
export type JwtPayload = {
    userId: string
}

