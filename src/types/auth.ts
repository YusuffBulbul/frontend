export interface LoginRequest {
    email: string
    password: string
}

export interface RegisterRequest {
    name: string
    email: string
    password: string
}

export interface AuthResponse {
    accessToken: string
    tokenType: string
    expiresIn: number
    userId: string
    name: string
    email: string
    roles: string[]
}

export type LoginResponse = AuthResponse
export type RegisterResponse = AuthResponse

export interface AuthenticatedUser {
    userId: string
    name: string
    email: string
    roles: string[]
}

export interface StoredAuthSession {
    accessToken: string
    tokenType: string
    expiresIn: number
    expiresAt: number
    user: AuthenticatedUser
}

export interface AuthError {
    message: string
    fieldErrors?: Partial<Record<'name' | 'email' | 'password', string>>
}
