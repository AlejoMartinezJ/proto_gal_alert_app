import React, { createContext, useContext, useReducer, useState } from 'react';
import { Snackbar, Alert } from '@mui/material';
import type { ReactNode } from 'react';
import type { Alerta, Sereno, Ciudadano, Rol, EstadoAlerta } from '../types';
import { mockAlertas, mockSerenos, mockCiudadanoA, mockCiudadanoB, mockSerenoActual } from '../mockData';

interface AlertaStore {
  alertas: Alerta[];
  serenos: Sereno[];
  rolActivo: Rol;
  ciudadanoActual: Ciudadano;
  serenoActual: Sereno;
}

type Action =
  | { type: 'CREAR_ALERTA'; payload: Alerta }
  | { type: 'CONFIRMAR_ALERTA'; payload: string }
  | { type: 'CAMBIAR_ROL'; payload: Rol }
  | { type: 'ASIGNAR_SERENO'; payload: { alerta_id: string; sereno_id: string } }
  | { type: 'CAMBIAR_ESTADO_ALERTA'; payload: { alerta_id: string; estado: EstadoAlerta; nota?: string } }
  | { type: 'RECHAZAR_ALERTA'; payload: { alerta_id: string; motivo: string } };

const initialState: AlertaStore = {
  alertas: mockAlertas,
  serenos: mockSerenos,
  rolActivo: 'ciudadanoA',
  ciudadanoActual: mockCiudadanoA,
  serenoActual: mockSerenoActual,
};

function alertaReducer(state: AlertaStore, action: Action): AlertaStore {
  switch (action.type) {
    case 'CREAR_ALERTA':
      return {
        ...state,
        alertas: [action.payload, ...state.alertas]
      };
    case 'CONFIRMAR_ALERTA':
      return {
        ...state,
        alertas: state.alertas.map(a => 
          a.id === action.payload ? { ...a, confirmaciones: a.confirmaciones + 1 } : a
        )
      };
    case 'CAMBIAR_ROL':
      return {
        ...state,
        rolActivo: action.payload,
        ciudadanoActual: action.payload === 'ciudadanoA' ? mockCiudadanoA : 
                         action.payload === 'ciudadanoB' ? mockCiudadanoB : state.ciudadanoActual
      };
    case 'ASIGNAR_SERENO':
      return {
        ...state,
        alertas: state.alertas.map(a => 
          a.id === action.payload.alerta_id ? { 
            ...a, 
            estado: 'ASIGNADO', 
            sereno_asignado: action.payload.sereno_id,
            historial_estados: [...a.historial_estados, { estado: 'ASIGNADO', timestamp: new Date().toISOString(), nota: `Sereno asignado: ${action.payload.sereno_id}` }]
          } : a
        ),
        serenos: state.serenos.map(s => 
          s.id === action.payload.sereno_id ? { ...s, estado: 'ATENDIENDO', alerta_id: action.payload.alerta_id } : s
        )
      };
    case 'CAMBIAR_ESTADO_ALERTA':
      return {
        ...state,
        alertas: state.alertas.map(a =>
          a.id === action.payload.alerta_id ? {
            ...a,
            estado: action.payload.estado,
            historial_estados: [...a.historial_estados, { estado: action.payload.estado, timestamp: new Date().toISOString(), nota: action.payload.nota || null }]
          } : a
        ),
        serenos: action.payload.estado === 'ATENDIDO' || action.payload.estado === 'RECHAZADO'
          ? state.serenos.map(s => s.alerta_id === action.payload.alerta_id ? { ...s, estado: 'LIBRE', alerta_id: null } : s)
          : state.serenos
      };
    case 'RECHAZAR_ALERTA':
      return {
        ...state,
        alertas: state.alertas.map(a =>
          a.id === action.payload.alerta_id ? {
            ...a,
            estado: 'RECHAZADO',
            historial_estados: [...a.historial_estados, { estado: 'RECHAZADO', timestamp: new Date().toISOString(), nota: action.payload.motivo }]
          } : a
        )
      };
    default:
      return state;
  }
}

const AlertaContext = createContext<{
  state: AlertaStore;
  dispatch: React.Dispatch<Action>;
} | undefined>(undefined);

export function AlertaProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(alertaReducer, initialState);
  const [pushInfo, setPushInfo] = useState<{ open: boolean, message: string }>({ open: false, message: '' });

  // Wrap dispatch to handle side effects like notifications
  const dispatchWithSideEffects = (action: Action) => {
    if (action.type === 'CREAR_ALERTA') {
      if (Notification.permission === 'granted') {
        new Notification('Alerta Gal: Nueva incidencia reportada', {
          body: `${action.payload.tipo.replace('_', ' ')} en ${action.payload.ubicacion.referencia}`,
          icon: '/vite.svg'
        });
      }
      setPushInfo({ open: true, message: `Notificación: Nueva incidencia de ${action.payload.tipo.replace('_', ' ')} reportada` });
    } else if (action.type === 'CAMBIAR_ESTADO_ALERTA') {
      if (Notification.permission === 'granted') {
        new Notification(`Alerta Gal: Actualización de incidencia`, {
          body: `El reporte ha cambiado a estado: ${action.payload.estado}`,
          icon: '/vite.svg'
        });
      }
      setPushInfo({ open: true, message: `Notificación: Una incidencia cambió a estado ${action.payload.estado}` });
    } else if (action.type === 'ASIGNAR_SERENO') {
      if (Notification.permission === 'granted') {
        new Notification(`Alerta Gal: Unidad en camino`, {
          body: `Se ha asignado una unidad de Serenazgo para atender la emergencia`,
          icon: '/vite.svg'
        });
      }
      setPushInfo({ open: true, message: `Notificación: Unidad de Serenazgo asignada a emergencia` });
    }
    dispatch(action);
  };

  return (
    <AlertaContext.Provider value={{ state, dispatch: dispatchWithSideEffects }}>
      {children}
      <Snackbar 
        open={pushInfo.open} 
        autoHideDuration={6000} 
        onClose={() => setPushInfo({ ...pushInfo, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{ mt: 6 }}
      >
        <Alert onClose={() => setPushInfo({ ...pushInfo, open: false })} severity="info" sx={{ width: '100%', boxShadow: 3, bgcolor: 'rgba(30, 41, 59, 0.95)', color: 'white' }}>
          {pushInfo.message}
        </Alert>
      </Snackbar>
    </AlertaContext.Provider>
  );
}

export function useAlerta() {
  const context = useContext(AlertaContext);
  if (context === undefined) {
    throw new Error('useAlerta must be used within an AlertaProvider');
  }
  return context;
}
