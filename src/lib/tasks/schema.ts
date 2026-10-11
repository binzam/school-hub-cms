import { z } from 'zod'

export const taskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Title is required')
    .max(120, 'Keep the title under 120 characters'),
  description: z.string().trim().max(1000, 'Keep the description under 1000 characters'),
})

export type TaskInput = z.infer<typeof taskSchema>
