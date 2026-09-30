import { z } from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { ResetPassword } from '@/features/auth/password/reset-password'

const searchSchema = z.object({
  token: z.string().optional().catch(undefined),
})

export const Route = createFileRoute('/(auth)/reset-password')({
  component: ResetPassword,
  validateSearch: searchSchema,
})
