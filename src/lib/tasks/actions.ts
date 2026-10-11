'use server'

import { revalidatePath } from 'next/cache'
import { headers as getHeaders } from 'next/headers'
import { getPayload } from 'payload'
import { z } from 'zod'

import config from '@/payload.config'
import { createTask, deleteTask, updateTask } from './operations'
import { taskSchema } from './schema'

export type ActionResult =
  { ok: true } | { ok: false; error: string; fieldErrors?: Record<string, string[] | undefined> }

const idSchema = z.number().int().positive()

// Every action starts here: who is calling, and are they a student?
// Server Actions are public HTTP endpoints, so never rely on the UI hiding a button.
async function requireStudent() {
  const payload = await getPayload({ config: await config })
  const { user } = await payload.auth({ headers: await getHeaders() })
  if (!user || user.role !== 'student') return null
  return { payload, user }
}

const NOT_ALLOWED: ActionResult = { ok: false, error: 'You must be signed in as a student.' }

export async function createTaskAction(input: unknown): Promise<ActionResult> {
  const ctx = await requireStudent()
  if (!ctx) return NOT_ALLOWED

  const parsed = taskSchema.safeParse(input)
  if (!parsed.success) {
    return {
      ok: false,
      error: 'Please fix the highlighted fields.',
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
    }
  }

  try {
    await createTask(ctx.payload, ctx.user, parsed.data)
  } catch (err) {
    ctx.payload.logger.error(err)
    return { ok: false, error: 'Could not create the task. Please try again.' }
  }

  revalidatePath('/dashboard')
  return { ok: true }
}

export async function updateTaskAction(id: unknown, input: unknown): Promise<ActionResult> {
  const ctx = await requireStudent()
  if (!ctx) return NOT_ALLOWED

  const parsedId = idSchema.safeParse(id)
  const parsed = taskSchema.safeParse(input)
  if (!parsedId.success) return { ok: false, error: 'Invalid task.' }
  if (!parsed.success) {
    return {
      ok: false,
      error: 'Please fix the highlighted fields.',
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
    }
  }

  try {
    // Payload's access rule limits students to their own tasks, so someone
    // else's id fails here even if the request is forged
    await updateTask(ctx.payload, ctx.user, parsedId.data, parsed.data)
  } catch (err) {
    ctx.payload.logger.error(err)
    return { ok: false, error: 'Could not update the task.' }
  }

  revalidatePath('/dashboard')
  return { ok: true }
}

export async function deleteTaskAction(id: unknown): Promise<ActionResult> {
  const ctx = await requireStudent()
  if (!ctx) return NOT_ALLOWED

  const parsedId = idSchema.safeParse(id)
  if (!parsedId.success) return { ok: false, error: 'Invalid task.' }

  try {
    await deleteTask(ctx.payload, ctx.user, parsedId.data)
  } catch (err) {
    ctx.payload.logger.error(err)
    return { ok: false, error: 'Could not delete the task.' }
  }

  revalidatePath('/dashboard')
  return { ok: true }
}
