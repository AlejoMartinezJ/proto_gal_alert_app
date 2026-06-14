export type EstadoAlerta = 'PENDIENTE' | 'ASIGNADO' | 'DESPLIEGUE' | 'INTERVENCION' | 'ATENDIDO' | 'RECHAZADO';
export type Rol = 'ciudadanoA' | 'ciudadanoB' | 'operadora' | 'sereno';
export type TipoAlerta = 'ALTERACION_ORDEN' | 'CONSUMO_ALCOHOL' | 'PELEA' | 'OTRO';

export interface Ubicacion {
  lat: number;
  lng: number;
  referencia: string;
}

export interface HistorialEstado {
  estado: EstadoAlerta;
  timestamp: string;
  nota: string | null;
}

export interface Alerta {
  id: string;
  token: string;
  tipo: TipoAlerta;
  descripcion: string;
  ubicacion: Ubicacion;
  estado: EstadoAlerta;
  confirmaciones: number;
  weighted_score: number;
  ciudadano_telefono: string;
  timestamp_creacion: string;
  sereno_asignado: string | null;
  historial_estados: HistorialEstado[];
}

export interface Sereno {
  id: string;
  nombre: string;
  estado: 'LIBRE' | 'ATENDIENDO';
  lat: number;
  lng: number;
  zona: string;
  alerta_id: string | null;
}

export interface Ciudadano {
  id: string;
  telefono: string;
  lat: number;
  lng: number;
}
