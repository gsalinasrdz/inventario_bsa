<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Http\Resources\UserResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class AuthController extends Controller
{
    private int $maxAttempts;
    private int $lockoutMinutes;

    public function __construct()
    {
        $this->maxAttempts    = (int) config('auth.max_attempts', 5);
        $this->lockoutMinutes = (int) config('auth.lockout_minutes', 30);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $email   = strtolower(trim($request->input('email')));
        $lockKey = 'login_locked:' . $email;
        $attemptsKey = 'login_attempts:' . $email . ':' . $request->ip();

        // Verificar bloqueo activo
        if (Cache::has($lockKey)) {
            $unlockAt = Cache::get($lockKey . '_until', 'unos minutos');
            return response()->json([
                'success' => false,
                'error'   => [
                    'code'    => 'ACCOUNT_LOCKED',
                    'message' => "Cuenta bloqueada por múltiples intentos fallidos. Intente después de las {$unlockAt}.",
                ],
            ], 423);
        }

        // Verificar credenciales
        $user = User::where('email', $email)->first();

        if (!$user || !Hash::check($request->input('password'), $user->password)) {
            $attempts = Cache::increment($attemptsKey);
            Cache::put($attemptsKey, $attempts, now()->addMinutes($this->lockoutMinutes));

            if ($attempts >= $this->maxAttempts) {
                $unlockAt = now()->addMinutes($this->lockoutMinutes)->format('H:i');
                Cache::put($lockKey, true, now()->addMinutes($this->lockoutMinutes));
                Cache::put($lockKey . '_until', $unlockAt, now()->addMinutes($this->lockoutMinutes));

                return response()->json([
                    'success' => false,
                    'error'   => [
                        'code'    => 'ACCOUNT_LOCKED',
                        'message' => "Demasiados intentos fallidos. Cuenta bloqueada hasta las {$unlockAt}.",
                    ],
                ], 423);
            }

            $remaining = $this->maxAttempts - $attempts;
            return response()->json([
                'success' => false,
                'error'   => [
                    'code'    => 'INVALID_CREDENTIALS',
                    'message' => "Credenciales incorrectas. Intentos restantes: {$remaining}.",
                ],
            ], 401);
        }

        // Verificar usuario activo
        if (!$user->activo) {
            return response()->json([
                'success' => false,
                'error'   => [
                    'code'    => 'ACCOUNT_DISABLED',
                    'message' => 'Esta cuenta está desactivada. Contacte al administrador.',
                ],
            ], 403);
        }

        // Login exitoso - limpiar intentos y crear sesión
        Cache::forget($attemptsKey);
        Cache::forget($lockKey);
        Cache::forget($lockKey . '_until');

        $request->session()->regenerate();

        $user->update(['ultimo_acceso' => now()]);

        Auth::login($user);

        activity('auth')
            ->causedBy($user)
            ->withProperties([
                'ip'         => $request->ip(),
                'user_agent' => $request->userAgent(),
            ])
            ->log('Inicio de sesión exitoso');

        return response()->json([
            'success' => true,
            'data'    => [
                'user'        => new UserResource($user->load('roles')),
                'permissions' => $user->getAllPermissions()->pluck('name'),
            ],
            'message' => 'Sesión iniciada correctamente.',
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $user = $request->user();

        activity('auth')
            ->causedBy($user)
            ->withProperties(['ip' => $request->ip()])
            ->log('Cierre de sesión');

        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json([
            'success' => true,
            'message' => 'Sesión cerrada correctamente.',
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user()->load('roles');

        return response()->json([
            'success' => true,
            'data'    => [
                'user'        => new UserResource($user),
                'permissions' => $user->getAllPermissions()->pluck('name'),
            ],
        ]);
    }
}
