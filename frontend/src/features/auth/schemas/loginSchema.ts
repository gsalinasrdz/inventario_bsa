import { z } from 'zod'

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'El correo es obligatorio.')
    .email('Ingrese un correo electrónico válido.'),
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres.'),
})

export type LoginFormValues = z.infer<typeof loginSchema>
