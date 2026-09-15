import { useState } from 'react'
import type { FormEvent } from 'react'
import {
    Alert,
    Button,
    Card,
    CardContent,
    Stack,
    TextField,
    Typography,
} from '@mui/material'
import { createTask } from '../api/taskApi'
import type { Task } from '../types/task'

interface CreateTaskFormProps {
    onCreated: (task: Task) => void
}

export default function CreateTaskForm({
                                           onCreated,
                                       }: CreateTaskFormProps) {
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()

        if (!title.trim()) {
            setError('Title is required.')
            return
        }

        try {
            setSubmitting(true)
            setError(null)

            const task = await createTask({
                userId: 'user-1',
                title: title.trim(),
                description: description.trim(),
            })

            onCreated(task)
            setTitle('')
            setDescription('')
        } catch {
            setError('Task could not be created.')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <Card>
            <CardContent>
                <form onSubmit={handleSubmit}>
                    <Stack spacing={2}>
                        <Typography variant="h6">New Task</Typography>

                        {error && <Alert severity="error">{error}</Alert>}

                        <TextField
                            label="Title"
                            value={title}
                            onChange={(event) => setTitle(event.target.value)}
                            required
                            fullWidth
                            slotProps={{
                                htmlInput: {
                                    maxLength: 120,
                                },
                            }}
                        />

                        <TextField
                            label="Description"
                            value={description}
                            onChange={(event) =>
                                setDescription(event.target.value)
                            }
                            multiline
                            minRows={3}
                            fullWidth
                            slotProps={{
                                htmlInput: {
                                    maxLength: 1000,
                                },
                            }}
                        />

                        <Button
                            type="submit"
                            variant="contained"
                            disabled={submitting}
                        >
                            {submitting ? 'Creating...' : 'Create Task'}
                        </Button>
                    </Stack>
                </form>
            </CardContent>
        </Card>
    )
}