import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, LogIn } from 'lucide-react'
import { useState } from 'react'
import { loginSchema, type LoginFormValues } from '../schemas/loginSchema'
import { useLogin } from '../hooks/useAuth'
import { cn } from '@/lib/utils'

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const loginMutation = useLogin()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = (data: LoginFormValues) => loginMutation.mutate(data)

  const isLoading = isSubmitting || loginMutation.isPending

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">Iniciar Sesión</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Ingrese sus credenciales para continuar
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
            Correo electrónico
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            autoFocus
            {...register('email')}
            className={cn(
              'w-full px-3 py-2.5 border rounded-lg text-sm',
              'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary',
              'transition-colors placeholder:text-muted-foreground',
              errors.email
                ? 'border-destructive bg-destructive/5'
                : 'border-input bg-white'
            )}
            placeholder="usuario@grupohls.mx"
            disabled={isLoading}
          />
          {errors.email && (
            <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
            Contraseña
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              {...register('password')}
              className={cn(
                'w-full px-3 py-2.5 pr-10 border rounded-lg text-sm',
                'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary',
                'transition-colors placeholder:text-muted-foreground',
                errors.password
                  ? 'border-destructive bg-destructive/5'
                  : 'border-input bg-white'
              )}
              placeholder="••••••••"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-gray-700"
              tabIndex={-1}
            >
              {showPassword
                ? <EyeOff className="w-4 h-4" />
                : <Eye className="w-4 h-4" />
              }
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-xs text-destructive">{errors.password.message}</p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className={cn(
            'w-full flex items-center justify-center gap-2',
            'bg-primary text-white font-medium py-2.5 px-4 rounded-lg',
            'hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50',
            'transition-colors text-sm',
            isLoading && 'opacity-70 cursor-not-allowed'
          )}
        >
          {isLoading ? (
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <LogIn className="w-4 h-4" />
          )}
          {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
        </button>
      </form>

      <p className="mt-6 text-xs text-center text-muted-foreground">
        Sistema de uso exclusivo para personal autorizado de Grupo HLS
      </p>
    </div>
  )
}
