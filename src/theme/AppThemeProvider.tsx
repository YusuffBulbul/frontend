import { createContext, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { CssBaseline, IconButton, ThemeProvider, Tooltip, createTheme } from '@mui/material'
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined'
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined'

type ThemeMode = 'light' | 'dark'

interface ThemeModeContextValue {
    mode: ThemeMode
    toggleMode: () => void
}

const THEME_PREFERENCE_KEY = 'taskflow-theme-mode'
const ThemeModeContext = createContext<ThemeModeContextValue | undefined>(undefined)

function getStoredThemeMode(): ThemeMode {
    try {
        return window.localStorage.getItem(THEME_PREFERENCE_KEY) === 'dark' ? 'dark' : 'light'
    } catch {
        return 'light'
    }
}

export function AppThemeProvider({ children }: { children: ReactNode }) {
    const [mode, setMode] = useState<ThemeMode>(getStoredThemeMode)
    const theme = useMemo(
        () => createTheme({
            palette: {
                mode,
                background: mode === 'dark'
                    ? { default: '#101828', paper: '#182230' }
                    : { default: '#f5f7fb', paper: '#ffffff' },
            },
        }),
        [mode],
    )

    function toggleMode() {
        setMode((currentMode) => {
            const nextMode = currentMode === 'light' ? 'dark' : 'light'

            try {
                window.localStorage.setItem(THEME_PREFERENCE_KEY, nextMode)
            } catch {
                // Keep the selected mode for the current session when storage is unavailable.
            }

            return nextMode
        })
    }

    return (
        <ThemeModeContext.Provider value={{ mode, toggleMode }}>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                {children}
            </ThemeProvider>
        </ThemeModeContext.Provider>
    )
}

export function ThemeModeToggle() {
    const context = useContext(ThemeModeContext)

    if (!context) {
        throw new Error('ThemeModeToggle must be used within AppThemeProvider.')
    }

    const { mode, toggleMode } = context
    const label = mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'

    return (
        <Tooltip title={label}>
            <IconButton aria-label={label} aria-pressed={mode === 'dark'} onClick={toggleMode}>
                {mode === 'dark' ? <LightModeOutlinedIcon /> : <DarkModeOutlinedIcon />}
            </IconButton>
        </Tooltip>
    )
}
