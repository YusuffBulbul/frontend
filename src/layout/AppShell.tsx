import { useState } from 'react'
import {
    AppBar,
    Avatar,
    Box,
    Container,
    Divider,
    Drawer,
    IconButton,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    Toolbar,
    Typography,
} from '@mui/material'
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined'
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined'
import InsightsOutlinedIcon from '@mui/icons-material/InsightsOutlined'
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined'
import MenuIcon from '@mui/icons-material/Menu'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'

const DRAWER_WIDTH = 248

const navigationItems = [
    { label: 'Dashboard', path: '/dashboard', icon: <DashboardOutlinedIcon /> },
    { label: 'Tasks', path: '/tasks', icon: <AssignmentOutlinedIcon /> },
    { label: 'Analytics', path: '/analytics', icon: <InsightsOutlinedIcon /> },
]

function initials(name: string): string {
    return name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join('')
        .toUpperCase()
}

export default function AppShell() {
    const { logout, user } = useAuth()
    const location = useLocation()
    const navigate = useNavigate()
    const [mobileOpen, setMobileOpen] = useState(false)
    const [accountAnchor, setAccountAnchor] = useState<HTMLElement | null>(null)

    const navigation = (
        <>
            <Toolbar sx={{ px: 3 }}>
                <Typography color="primary" sx={{ fontWeight: 800 }} variant="h6">
                    TaskFlow
                </Typography>
            </Toolbar>
            <Divider />
            <List sx={{ px: 1.5, py: 2 }}>
                {navigationItems.map((item) => (
                    <ListItemButton
                        component={Link}
                        key={item.path}
                        onClick={() => setMobileOpen(false)}
                        selected={location.pathname === item.path}
                        to={item.path}
                        sx={{ borderRadius: 2, mb: 0.5 }}
                    >
                        <ListItemIcon>{item.icon}</ListItemIcon>
                        <ListItemText primary={item.label} />
                    </ListItemButton>
                ))}
            </List>
        </>
    )

    function handleLogout() {
        setAccountAnchor(null)
        logout()
        navigate('/login', { replace: true })
    }

    return (
        <Box sx={{ backgroundColor: '#f5f7fb', display: 'flex', minHeight: '100vh' }}>
            <AppBar
                color="inherit"
                elevation={0}
                position="fixed"
                sx={{
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
                }}
            >
                <Toolbar sx={{ gap: 1 }}>
                    <IconButton
                        aria-label="Open navigation"
                        edge="start"
                        onClick={() => setMobileOpen(true)}
                        sx={{ display: { md: 'none' } }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography sx={{ flexGrow: 1, fontWeight: 700 }} variant="h6">
                        Workspace
                    </Typography>
                    <IconButton
                        aria-label="Open user menu"
                        onClick={(event) => setAccountAnchor(event.currentTarget)}
                    >
                        <Avatar sx={{ bgcolor: 'primary.main', height: 34, width: 34 }}>
                            {user ? initials(user.name) : ''}
                        </Avatar>
                    </IconButton>
                    <Menu
                        anchorEl={accountAnchor}
                        onClose={() => setAccountAnchor(null)}
                        open={Boolean(accountAnchor)}
                    >
                        <Box sx={{ px: 2, py: 1.25 }}>
                            <Typography sx={{ fontWeight: 700 }}>{user?.name}</Typography>
                            <Typography color="text.secondary" variant="body2">
                                {user?.email}
                            </Typography>
                        </Box>
                        <Divider />
                        <MenuItem onClick={handleLogout}>
                            <ListItemIcon>
                                <LogoutOutlinedIcon fontSize="small" />
                            </ListItemIcon>
                            Logout
                        </MenuItem>
                    </Menu>
                </Toolbar>
            </AppBar>

            <Drawer
                open
                slotProps={{ paper: { sx: { boxSizing: 'border-box', width: DRAWER_WIDTH } } }}
                sx={{ display: { xs: 'none', md: 'block' }, width: DRAWER_WIDTH }}
                variant="permanent"
            >
                {navigation}
            </Drawer>
            <Drawer
                onClose={() => setMobileOpen(false)}
                open={mobileOpen}
                slotProps={{ paper: { sx: { width: DRAWER_WIDTH } } }}
                sx={{ display: { md: 'none' } }}
                variant="temporary"
            >
                {navigation}
            </Drawer>

            <Box component="main" sx={{ flexGrow: 1, minWidth: 0 }}>
                <Toolbar />
                <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 3, md: 4 } }}>
                    <Outlet />
                </Container>
            </Box>
        </Box>
    )
}
