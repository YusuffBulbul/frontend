import type { ReactNode } from 'react'
import { Box, Card, CardContent, Typography } from '@mui/material'
import { Link } from 'react-router-dom'

interface DashboardSummaryCardProps {
    label: string
    value: number
    icon: ReactNode
    accent: string
    to?: string
}

export default function DashboardSummaryCard({
    label,
    value,
    icon,
    accent,
    to,
}: DashboardSummaryCardProps) {
    return (
        <Card
            component={to ? Link : 'article'}
            to={to}
            sx={{
                color: 'inherit',
                height: '100%',
                textDecoration: 'none',
                transition: 'box-shadow 160ms ease, transform 160ms ease',
                '&:hover, &:focus-visible': { boxShadow: 4, transform: 'translateY(-2px)' },
            }}
        >
            <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ alignItems: 'flex-start', display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                    <Box>
                        <Typography color="text.secondary" variant="body2">
                            {label}
                        </Typography>
                        <Typography sx={{ fontWeight: 800, mt: 0.5 }} variant="h4">
                            {value}
                        </Typography>
                    </Box>
                    <Box
                        aria-hidden="true"
                        sx={{
                            alignItems: 'center',
                            backgroundColor: accent,
                            borderRadius: 2,
                            display: 'flex',
                            height: 40,
                            justifyContent: 'center',
                            width: 40,
                        }}
                    >
                        {icon}
                    </Box>
                </Box>
            </CardContent>
        </Card>
    )
}
