import { z } from 'zod'

export const productoSchema = z.object({
  codigo_sku: z
    .string()
    .min(1, 'El SKU es obligatorio.')
    .max(50, 'Máximo 50 caracteres.'),
  codigo_barras: z.string().max(50).optional().or(z.literal('')),
  nombre: z
    .string()
    .min(1, 'El nombre es obligatorio.')
    .max(200, 'Máximo 200 caracteres.'),
  descripcion: z.string().max(1000).optional().or(z.literal('')),
  categoria_id: z
    .number({ required_error: 'Seleccione una categoría.' })
    .int().positive('Seleccione una categoría.'),
  marca_id: z
    .number({ required_error: 'Seleccione una marca.' })
    .int().positive('Seleccione una marca.'),
  presentacion_id: z
    .number({ required_error: 'Seleccione una presentación.' })
    .int().positive('Seleccione una presentación.'),
  tipo_envase_id: z.number().int().positive().optional(),
  proveedor_id: z.number().int().positive().optional(),
  es_retornable: z.boolean().default(false),
  stock_minimo: z
    .number({ required_error: 'El stock mínimo es obligatorio.' })
    .min(0, 'Debe ser mayor o igual a 0.'),
  stock_maximo: z.number().min(0).optional(),
  estado: z.enum(['ACTIVO', 'INACTIVO', 'DESCONTINUADO']).default('ACTIVO'),
})

export type ProductoFormValues = z.infer<typeof productoSchema>
