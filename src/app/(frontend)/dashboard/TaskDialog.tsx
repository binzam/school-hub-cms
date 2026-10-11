'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { X } from 'lucide-react'
import React, { useEffect, useRef, useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'

import type { StudentTask } from '@/lib/getStudentTasks'
import { createTaskAction, updateTaskAction } from '@/lib/tasks/actions'
import { taskSchema, type TaskInput } from '@/lib/tasks/schema'

export default function TaskDialog({
  task,
  onClose,
}: {
  task: StudentTask | null // null = creating a new task
  onClose: () => void
}) {
  const ref = useRef<HTMLDialogElement>(null)
  const [pending, startTransition] = useTransition()
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<TaskInput>({
    resolver: zodResolver(taskSchema), // same schema the server action uses
    defaultValues: { title: task?.title ?? '', description: task?.description ?? '' },
  })

  // Native <dialog>: focus trapping, Escape to close and the backdrop come for free
  useEffect(() => {
    const el = ref.current
    if (el && !el.open) el.showModal()
  }, [])

  const onSubmit = handleSubmit((values) => {
    setServerError(null)
    startTransition(async () => {
      const res = task ? await updateTaskAction(task.id, values) : await createTaskAction(values)
      if (res.ok) {
        onClose()
        return
      }
      setServerError(res.error)
      for (const [name, messages] of Object.entries(res.fieldErrors ?? {})) {
        if (messages?.[0]) setError(name as keyof TaskInput, { message: messages[0] })
      }
    })
  })

  return (
    <dialog
      ref={ref}
      className="dialog"
      aria-labelledby="task-dialog-title"
      onClose={onClose}
      onClick={(e) => {
        // a click on the backdrop lands on the <dialog> element itself
        if (e.target === e.currentTarget) ref.current?.close()
      }}
    >
      <form onSubmit={onSubmit} noValidate className="dialog__form">
        <div className="dialog__head">
          <h2 id="task-dialog-title">{task ? 'Edit task' : 'New task'}</h2>
          <button
            type="button"
            className="task__btn"
            onClick={() => ref.current?.close()}
            aria-label="Close"
          >
            <X />
          </button>
        </div>

        <div className="field">
          <label htmlFor="title">Title</label>
          <input id="title" aria-invalid={!!errors.title} {...register('title')} />
          {errors.title && <p className="field__error">{errors.title.message}</p>}
        </div>

        <div className="field">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            rows={4}
            aria-invalid={!!errors.description}
            {...register('description')}
          />
          {errors.description && <p className="field__error">{errors.description.message}</p>}
        </div>

        {serverError && (
          <p className="error" role="alert">
            {serverError}
          </p>
        )}

        <div className="dialog__actions">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => ref.current?.close()}
            disabled={pending}
          >
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={pending}>
            {pending ? 'Saving…' : task ? 'Save changes' : 'Create task'}
          </button>
        </div>
      </form>
    </dialog>
  )
}
