import type { ReactNode } from 'react'
import { Box, Card, CardContent, Typography } from '@mui/material'

interface DashboardSummaryCardProps {
    label: string
    value: number
    icon: ReactNode
    accent: string
}

export default function DashboardSummaryCard({
    label,
    value,
    icon,
    accent,
}: DashboardSummaryCardProps) {
    return (
        <Card component="article" sx={{ height: '100%' }}>
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
