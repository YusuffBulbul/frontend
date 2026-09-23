import axios from 'axios'
import http from './http'
import type {
    AuthError,
    LoginRequest,
    LoginResponse,
    RegisterRequest,
    RegisterResponse,
} from '../types/auth'

const AUTH_FIELDS = new Set(['name', 'email', 'password'])

function toAuthError(error: unknown): AuthError {
    if (!axios.isAxiosError(error)) {
        return { message: 'Authentication request failed.' }
    }

    const data: unknown = error.response?.data
    if (typeof data !== 'object' || data === null) {
        return { message: 'Authentication request failed.' }
    }

    const payload = data as {
        message?: unknown
        validationErrors?: unknown
    }
    const fieldErrors =
        typeof payload.validationErrors === 'object' &&
        payload.validationErrors !== null
            ? Object.fromEntries(
                  Object.entries(payload.validationErrors).filter(
                      ([field, message]) =>
                          AUTH_FIELDS.has(field) && typeof message === 'string',
                  ),
              )
            : undefined

    return {
        message:
            typeof payload.message === 'string'
                ? payload.message
                : 'Authentication request failed.',
        ...(fieldErrors && Object.keys(fieldErrors).length > 0
            ? { fieldErrors }
            : {}),
    }
}

export async function login(request: LoginRequest): Promise<LoginResponse> {
    try {
        const response = await http.post<LoginResponse>('/api/auth/login', request)
        return response.data
    } catch (error) {
        throw toAuthError(error)
    }
}

export async function register(
    request: RegisterRequest,
): Promise<RegisterResponse> {
    try {
        const response = await http.post<RegisterResponse>(
            '/api/auth/register',
            request,
        )
        return response.data
    } catch (error) {
        throw toAuthError(error)
    }
}
