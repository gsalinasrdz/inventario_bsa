<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Spatie\Activitylog\Models\Activity;

class AuditLogController extends Controller
{
    public function index(Request $request)
    {
        $query = Activity::with('causer')
            ->latest();

        if ($request->filled('log_name')) {
            $query->inLog($request->log_name);
        }

        if ($request->filled('subject_type')) {
            $query->where('subject_type', 'like', '%' . $request->subject_type . '%');
        }

        if ($request->filled('causer_id')) {
            $query->where('causer_id', $request->causer_id)
                  ->where('causer_type', \App\Models\User::class);
        }

        if ($request->filled('evento')) {
            $query->where('event', $request->evento);
        }

        if ($request->filled('fecha_desde')) {
            $query->whereDate('created_at', '>=', $request->fecha_desde);
        }

        if ($request->filled('fecha_hasta')) {
            $query->whereDate('created_at', '<=', $request->fecha_hasta);
        }

        $logs = $query->paginate($request->integer('per_page', 30));

        return response()->json([
            'data' => $logs->map(fn($a) => $this->formatActivity($a)),
            'meta' => [
                'total'     => $logs->total(),
                'page'      => $logs->currentPage(),
                'last_page' => $logs->lastPage(),
                'from'      => $logs->firstItem(),
                'to'        => $logs->lastItem(),
            ],
        ]);
    }

    private function formatActivity(Activity $a): array
    {
        return [
            'id'           => $a->id,
            'log_name'     => $a->log_name,
            'evento'       => $a->event,
            'descripcion'  => $a->description,
            'subject_type' => class_basename($a->subject_type ?? ''),
            'subject_id'   => $a->subject_id,
            'propiedades'  => [
                'antes'   => $a->properties->get('old'),
                'despues' => $a->properties->get('attributes'),
            ],
            'usuario'      => $a->causer ? [
                'id'     => $a->causer->id,
                'nombre' => "{$a->causer->nombre} {$a->causer->apellido}",
                'email'  => $a->causer->email,
            ] : null,
            'ip'          => $a->properties->get('ip'),
            'created_at'  => $a->created_at,
        ];
    }
}
