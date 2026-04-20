import { z } from 'zod'

export const clienteSchema = z.object({
  codigo:          z.string().min(1, 'Requerido').max(30),
  nombre:          z.string().min(2, 'Mínimo 2 caracteres').max(150),
  rfc:             z.string().max(13).optional().or(z.literal('')),
  telefono:        z.string().max(20).optional().or(z.literal('')),
  email:           z.string().email('Email inválido').optional().or(z.literal('')),
  direccion:       z.string().max(255).optional().or(z.literal('')),
  colonia:         z.string().max(100).optional().or(z.literal('')),
  municipio:       z.string().max(100).optional().or(z.literal('')),
  estado:          z.string().max(60).optional().or(z.literal('')),
  cp:              z.string().max(10).optional().or(z.literal('')),
  ruta_id:         z.number().optional().nullable(),
  zona_id:         z.number().optional().nullable(),
  lista_precio_id: z.number().optional().nullable(),
  credito_limite:  z.number().min(0).default(0),
  credito_dias:    z.number().int().min(0).max(90).default(0),
  activo:          z.boolean().default(true),
  notas:           z.string().optional().or(z.literal('')),
})

export type ClienteFormValues = z.infer<typeof clienteSchema>
