import axios, { AxiosHeaders } from 'axios'
import { notifySessionExpired } from '../auth/authEvents'
import { clearSession, getAccessToken } from '../auth/tokenStorage'

const http = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || '',
    headers: {
        'Content-Type': 'application/json',
    },
})

function isAuthEndpoint(url: string | undefined): boolean {
    return (
        url === '/api/auth/login' ||
        url === '/api/auth/register' ||
        url?.startsWith('/api/auth/login?') === true ||
        url?.startsWith('/api/auth/register?') === true
    )
}

http.interceptors.request.use((config) => {
    const headers = AxiosHeaders.from(config.headers)

    if (isAuthEndpoint(config.url)) {
        headers.delete('Authorization')
    } else {
        const accessToken = getAccessToken()
        if (accessToken) {
            headers.set('Authorization', `Bearer ${accessToken}`)
        }
    }

    config.headers = headers
    return config
})

http.interceptors.response.use(
    (response) => response,
    (error: unknown) => {
        if (
            axios.isAxiosError(error) &&
            error.response?.status === 401 &&
            !isAuthEndpoint(error.config?.url)
        ) {
            clearSession()
            notifySessionExpired()
        }
        return Promise.reject(error)
    },
)

export default http
