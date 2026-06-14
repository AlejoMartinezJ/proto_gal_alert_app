import type { Alerta, Ciudadano, Sereno } from './types';

export const mockSerenos: Sereno[] = [
  { id: "S001", nombre: "Juan Quispe", estado: "LIBRE",
    lat: -18.0138, lng: -70.2528, zona: "Zona A", alerta_id: null },
  { id: "S002", nombre: "María Flores", estado: "ATENDIENDO",
    lat: -18.0155, lng: -70.2545, zona: "Zona B", alerta_id: "ALB-4310" },
  { id: "S003", nombre: "Carlos Mamani", estado: "LIBRE",
    lat: -18.0130, lng: -70.2510, zona: "Zona A", alerta_id: null },
];

export const mockAlertas: Alerta[] = [
  {
    id: "ALB-4321-1306-1432",
    token: "4321-1306-1432",
    tipo: "ALTERACION_ORDEN",
    descripcion: "Persona en estado de ebriedad alterando el orden en entrada del mercado",
    ubicacion: { lat: -18.0142, lng: -70.2536,
                 referencia: "Puerta norte Mercado Santa Rosa" },
    estado: "PENDIENTE",
    confirmaciones: 2,
    weighted_score: 1.8,
    ciudadano_telefono: "987654321",
    timestamp_creacion: "2026-06-13T14:32:05",
    sereno_asignado: null,
    historial_estados: [
      { estado: "PENDIENTE", timestamp: "2026-06-13T14:32:05", nota: null }
    ]
  },
  {
    id: "ALB-5555-1306-1500",
    token: "5555-1306-1500",
    tipo: "PELEA",
    descripcion: "Pelea en la calle principal",
    ubicacion: { lat: -18.0135, lng: -70.2520,
                 referencia: "Cruce de Av. Municipal con Los Alamos" },
    estado: "PENDIENTE",
    confirmaciones: 1,
    weighted_score: 1.0,
    ciudadano_telefono: "955555555",
    timestamp_creacion: "2026-06-13T15:00:00",
    sereno_asignado: null,
    historial_estados: [
      { estado: "PENDIENTE", timestamp: "2026-06-13T15:00:00", nota: null }
    ]
  },
  {
    id: "ALB-4321-1006-0923",
    token: "4321-1006-0923",
    tipo: "CONSUMO_ALCOHOL",
    descripcion: "Grupo consumiendo alcohol en vía pública",
    ubicacion: { lat: -18.0148, lng: -70.2541,
                 referencia: "Costado mercado, Jr. Tacna" },
    estado: "ATENDIDO",
    confirmaciones: 4,
    weighted_score: 3.2,
    ciudadano_telefono: "987654321",
    timestamp_creacion: "2026-06-10T09:23:00",
    sereno_asignado: "S001",
    historial_estados: [
      { estado: "PENDIENTE",    timestamp: "2026-06-10T09:23:00", nota: null },
      { estado: "ASIGNADO",     timestamp: "2026-06-10T09:26:15", nota: "Sereno: Juan Quispe" },
      { estado: "DESPLIEGUE",   timestamp: "2026-06-10T09:27:02", nota: "T. estimado: 3 min" },
      { estado: "INTERVENCION", timestamp: "2026-06-10T09:29:48", nota: null },
      { estado: "ATENDIDO",     timestamp: "2026-06-10T09:35:20",
        nota: "Disuasión verbal · Situación resuelta" }
    ]
  }
];

export const mockCiudadanoA: Ciudadano = {
  id: "C001",
  telefono: "999888777", // Ciudadano A: No tiene alertas activas, ve lista cercana
  lat: -18.0140,
  lng: -70.2530
};

export const mockCiudadanoB: Ciudadano = {
  id: "C002",
  telefono: "987654321", // Ciudadano B: Tiene la alerta ALB-4321 activa
  lat: -18.0145,
  lng: -70.2533
};

export const mockSerenoActual: Sereno = mockSerenos[0]; // Juan Quispe
