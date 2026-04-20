import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { clientesApi } from '../api/clientesApi'
import type { ClienteFilters } from '../types/cliente.types'
import type { ClienteFormValues } from '../schemas/clienteSchema'

export const CLIENTE_KEYS = {
  all:    ['clientes'] as const,
  list:   (f: ClienteFilters) => ['clientes', 'list', f] as const,
  detail: (id: number) => ['clientes', 'detail', id] as const,
  cuenta: (id: number) => ['clientes', 'cuenta', id] as const,
}

export function useClientes(filters: ClienteFilters = {}) {
  return useQuery({
    queryKey: CLIENTE_KEYS.list(filters),
    queryFn:  () => clientesApi.getAll(filters),
  })
}

export function useCliente(id: number) {
  return useQuery({
    queryKey: CLIENTE_KEYS.detail(id),
    queryFn:  () => clientesApi.getOne(id),
    enabled:  !!id,
  })
}

export function useEstadoCuenta(id: number) {
  return useQuery({
    queryKey: CLIENTE_KEYS.cuenta(id),
    queryFn:  () => clientesApi.estadoCuenta(id),
    enabled:  !!id,
  })
}

export function useCrearCliente() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: ClienteFormValues) => clientesApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CLIENTE_KEYS.all })
      toast.success('Cliente creado correctamente.')
    },
  })
}

export function useActualizarCliente() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<ClienteFormValues> }) =>
      clientesApi.update(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: CLIENTE_KEYS.all })
      qc.invalidateQueries({ queryKey: CLIENTE_KEYS.detail(id) })
      toast.success('Cliente actualizado correctamente.')
    },
  })
}

export function useEliminarCliente() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => clientesApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CLIENTE_KEYS.all })
      toast.success('Cliente eliminado.')
    },
  })
}
