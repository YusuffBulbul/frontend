import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
} from '@mui/material'
import type { TaskResponse } from '../types/task'

interface DeleteTaskDialogProps {
    open: boolean
    task: TaskResponse | null
    isDeleting: boolean
    onClose: () => void
    onConfirm: () => void
}

export default function DeleteTaskDialog({
    open,
    task,
    isDeleting,
    onClose,
    onConfirm,
}: DeleteTaskDialogProps) {
    function handleClose() {
        if (!isDeleting) onClose()
    }

    return (
        <Dialog
            fullWidth
            maxWidth="xs"
            open={open}
            aria-describedby="delete-task-dialog-description"
            aria-labelledby="delete-task-dialog-title"
            onClose={handleClose}
        >
            <DialogTitle id="delete-task-dialog-title">Delete task</DialogTitle>
            <DialogContent>
                <DialogContentText id="delete-task-dialog-description">
                    Are you sure you want to delete “{task?.title ?? ''}”? This action cannot be undone.
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button disabled={isDeleting} onClick={handleClose}>
                    Cancel
                </Button>
                <Button
                    color="error"
                    disabled={isDeleting || !task}
                    onClick={onConfirm}
                    variant="contained"
                >
                    {isDeleting ? 'Deleting…' : 'Delete'}
                </Button>
            </DialogActions>
        </Dialog>
    )
}
