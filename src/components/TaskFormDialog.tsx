import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import {
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    FormHelperText,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    TextField,
} from '@mui/material'
import {
    createTask,
    getTaskErrorMessage,
    updateTask,
} from '../api/taskApi'
import type { TaskResponse, TaskStatus } from '../types/task'
import { KANBAN_STATUSES, TASK_STATUS_LABELS } from '../utils/taskGrouping'

type TaskFormMode = 'create' | 'edit'
type TaskFormField = 'title' | 'description' | 'status'

interface TaskFormDialogProps {
    mode: TaskFormMode
    open: boolean
    task?: TaskResponse | null
    onClose: () => void
    onCreated: (task: TaskResponse) => void
    onError: (message: string) => void
    onUpdated: (task: TaskResponse) => void
}

interface FormValues {
    title: string
    description: string
    status: TaskStatus
}

type FieldErrors = Partial<Record<TaskFormField, string>>

const EMPTY_FORM: FormValues = {
    description: '',
    status: 'TODO',
    title: '',
}

function valuesFor(mode: TaskFormMode, task?: TaskResponse | null): FormValues {
    if (mode === 'edit' && task) {
        return {
            description: task.description ?? '',
            status: task.status,
            title: task.title,
        }
    }
    return { ...EMPTY_FORM }
}

function validate(values: FormValues, mode: TaskFormMode): FieldErrors {
    const errors: FieldErrors = {}
    const title = values.title.trim()
    const description = values.description.trim()

    if (!title) errors.title = 'Title is required.'
    else if (title.length > 120) errors.title = 'Title must be 120 characters or fewer.'
    if (description.length > 1000) {
        errors.description = 'Description must be 1000 characters or fewer.'
    }
    if (mode === 'edit' && !KANBAN_STATUSES.includes(values.status)) {
        errors.status = 'Select a valid task status.'
    }
    return errors
}

export default function TaskFormDialog({
    mode,
    open,
    task,
    onClose,
    onCreated,
    onError,
    onUpdated,
}: TaskFormDialogProps) {
    const [values, setValues] = useState<FormValues>(() => valuesFor(mode, task))
    const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
    const [submitting, setSubmitting] = useState(false)
    const submittingRef = useRef(false)
    const isMountedRef = useRef(true)

    useEffect(() => {
        isMountedRef.current = true
        return () => {
            isMountedRef.current = false
        }
    }, [])

    useEffect(() => {
        if (open) {
            setValues(valuesFor(mode, task))
            setFieldErrors({})
        }
    }, [mode, open, task])

    function updateValue(field: TaskFormField, value: string) {
        setValues((current) => ({ ...current, [field]: value }))
        setFieldErrors((current) => {
            if (!current[field]) return current
            const next = { ...current }
            delete next[field]
            return next
        })
    }

    function handleClose() {
        if (!submitting && !submittingRef.current) onClose()
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        if (submitting || submittingRef.current) return

        const errors = validate(values, mode)
        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors)
            return
        }

        submittingRef.current = true
        setSubmitting(true)
        try {
            if (mode === 'edit' && task) {
                const updatedTask = await updateTask(task.id, {
                    description: values.description.trim(),
                    status: values.status,
                    title: values.title.trim(),
                })
                if (isMountedRef.current) {
                    onUpdated(updatedTask)
                    onClose()
                }
            } else {
                const createdTask = await createTask({
                    description: values.description.trim(),
                    title: values.title.trim(),
                })
                if (isMountedRef.current) {
                    onCreated(createdTask)
                    onClose()
                }
            }
        } catch (requestError: unknown) {
            if (isMountedRef.current) {
                onError(getTaskErrorMessage(
                    requestError,
                    mode === 'edit' ? 'Task could not be updated.' : 'Task could not be created.',
                ))
            }
        } finally {
            submittingRef.current = false
            if (isMountedRef.current) setSubmitting(false)
        }
    }

    const title = mode === 'edit' ? 'Edit task' : 'Create task'

    return (
        <Dialog
            fullWidth
            maxWidth="sm"
            open={open}
            aria-labelledby="task-form-dialog-title"
            onClose={handleClose}
        >
            <form onSubmit={handleSubmit}>
                <DialogTitle id="task-form-dialog-title">{title}</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ pt: 1 }}>
                        <TextField
                            autoFocus
                            error={Boolean(fieldErrors.title)}
                            fullWidth
                            helperText={fieldErrors.title}
                            label="Title"
                            value={values.title}
                            onChange={(event) => updateValue('title', event.target.value)}
                            required
                            slotProps={{ htmlInput: { maxLength: 120 } }}
                        />
                        <TextField
                            error={Boolean(fieldErrors.description)}
                            fullWidth
                            helperText={fieldErrors.description}
                            label="Description"
                            multiline
                            minRows={3}
                            value={values.description}
                            onChange={(event) => updateValue('description', event.target.value)}
                            slotProps={{ htmlInput: { maxLength: 1000 } }}
                        />
                        {mode === 'edit' && (
                            <FormControl error={Boolean(fieldErrors.status)} fullWidth>
                                <InputLabel id="task-form-status-label">Status</InputLabel>
                                <Select
                                    label="Status"
                                    labelId="task-form-status-label"
                                    value={values.status}
                                    onChange={(event) => updateValue('status', event.target.value as TaskStatus)}
                                >
                                    {KANBAN_STATUSES.map((status) => (
                                        <MenuItem key={status} value={status}>
                                            {TASK_STATUS_LABELS[status]}
                                        </MenuItem>
                                    ))}
                                </Select>
                                {fieldErrors.status && <FormHelperText>{fieldErrors.status}</FormHelperText>}
                            </FormControl>
                        )}
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button disabled={submitting} onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button disabled={submitting} type="submit" variant="contained">
                        {submitting ? <CircularProgress aria-label="Saving task" size={20} /> : mode === 'edit' ? 'Save changes' : 'Create task'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    )
}
