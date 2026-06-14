import React, { useState } from 'react';
import { Box, Fab, Typography, Button } from '@mui/material';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useAlerta } from '../context/AlertaContext';
import { BottomSheet } from '../components/BottomSheet';
import type { SheetState } from '../components/BottomSheet';
import { ReportForm } from '../components/ReportForm';
import { ModalTraza } from '../components/ModalTraza';

// Fix Leaflet default icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const colorMap = {
  PENDIENTE: '#F59E0B',
  ASIGNADO: '#8B5CF6',
  DESPLIEGUE: '#3B82F6',
  INTERVENCION: '#EF4444',
  ATENDIDO: '#9CA3AF',
  RECHAZADO: '#9CA3AF'
};

const userLocationIcon = new L.DivIcon({
  html: `<div style="background-color: #10B981; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 8px rgba(0,0,0,0.5);"></div>`,
  className: '',
  iconSize: [16, 16],
  iconAnchor: [8, 8]
});

const defaultIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const grayIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
  className: 'grayscale-marker'
});

const serenoIcon = new L.DivIcon({
  html: '<div style="width: 24px; height: 24px; background-color: #3B82F6; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 8px rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; font-size: 14px;">🚓</div>',
  className: '',
  iconSize: [24, 24],
  iconAnchor: [12, 12]
});

const getAlertIcon = (estado: string) => {
  return (estado === 'RECHAZADO' || estado === 'ATENDIDO') ? grayIcon : defaultIcon;
};

export const CitizenView: React.FC = () => {
  const { state, dispatch } = useAlerta();
  const [sheetState, setSheetState] = useState<SheetState>('collapsed');
  const [reportFormOpen, setReportFormOpen] = useState(false);
  const [trazaAlertaId, setTrazaAlertaId] = useState<string | null>(null);

  const activeAlerta = state.alertas.find(a => 
    a.ciudadano_telefono === state.ciudadanoActual.telefono && 
    (a.estado !== 'RECHAZADO' && a.estado !== 'ATENDIDO' || new Date(a.timestamp_creacion).getTime() > Date.now() - 24 * 60 * 60 * 1000)
  );
  const nearbyAlertas = state.alertas.filter(a => a.estado === 'PENDIENTE' || a.id === activeAlerta?.id);
  const assignedSereno = activeAlerta?.sereno_asignado ? state.serenos.find(s => s.id === activeAlerta.sereno_asignado) : null;

  const handleConfirm = (id: string) => {
    dispatch({ type: 'CONFIRMAR_ALERTA', payload: id });
  };

  return (
    <Box sx={{ height: '100vh', width: '100vw', position: 'relative', bgcolor: 'background.default' }}>
      <MapContainer 
        center={[state.ciudadanoActual.lat, state.ciudadanoActual.lng]} 
        zoom={16} 
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        <Marker position={[state.ciudadanoActual.lat, state.ciudadanoActual.lng]} icon={userLocationIcon}>
          <Popup>Tú estás aquí</Popup>
        </Marker>
        {nearbyAlertas.map(a => (
          <Marker key={a.id} position={[a.ubicacion.lat, a.ubicacion.lng]} icon={getAlertIcon(a.estado)}>
            <Popup>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>{a.tipo.replace('_', ' ')}</Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>{a.ubicacion.referencia}</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button size="small" variant="contained" color="secondary" onClick={() => handleConfirm(a.id)}>
                  ¡Yo también lo veo!
                </Button>
                <Button size="small" variant="outlined" onClick={() => setTrazaAlertaId(a.id)}>
                  Ver traza completa
                </Button>
              </Box>
            </Popup>
          </Marker>
        ))}

        {assignedSereno && (activeAlerta?.estado === 'DESPLIEGUE' || activeAlerta?.estado === 'INTERVENCION') && (
          <Marker position={[assignedSereno.lat, assignedSereno.lng]} icon={serenoIcon}>
            <Popup>
              <strong>Unidad asignada</strong><br/>
              Aproximándose al lugar...
            </Popup>
          </Marker>
        )}
      </MapContainer>

      <Fab 
        color="primary" 
        variant="extended" 
        sx={{ 
          position: 'absolute', 
          bottom: 100, 
          left: '50%', 
          transform: 'translateX(-50%)',
          zIndex: 900, // Behind the bottom sheet when expanded (which is 1000)
          px: 3,
          py: 2,
          fontSize: '1rem',
          fontWeight: 600,
          whiteSpace: 'nowrap',
          minWidth: 'auto',
          display: 'flex',
          alignItems: 'center'
        }}
        onClick={() => setReportFormOpen(true)}
      >
        <ReportProblemIcon sx={{ mr: 1, fontSize: '1.2rem' }} /> 
        <span>Reportar incidencia</span>
      </Fab>

      <BottomSheet currentState={sheetState} onStateChange={setSheetState}>
        {activeAlerta && (
          <Box>
            <Typography variant="h6" sx={{ mb: 2, textAlign: 'center' }}>Tus incidencias</Typography>
            <Box sx={{ mb: 3, p: 2, bgcolor: 'rgba(255,255,255,0.03)', borderRadius: 2, border: '1px solid rgba(255,255,255,0.08)' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
              <Box sx={{ textAlign: 'left' }}>
                <Typography variant="subtitle2" color="text.secondary">Tu reporte activo</Typography>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>{activeAlerta.tipo.replace('_', ' ')}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>📍 {activeAlerta.ubicacion.referencia}</Typography>
                <Typography variant="body2" sx={{ mt: 0.5, color: '#3B82F6' }}>👥 {activeAlerta.confirmaciones} vecinos confirman</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mr: 1, mt: 0.5 }}>
                <Box sx={{ width: 14, height: 14, borderRadius: '50%', bgcolor: (colorMap as any)[activeAlerta.estado] || '#3B82F6' }} />
                <Typography variant="h6" sx={{ color: (colorMap as any)[activeAlerta.estado] || '#3B82F6', fontWeight: 800, fontSize: '1.15rem' }}>{activeAlerta.estado}</Typography>
              </Box>
            </Box>
            <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary', textAlign: 'left' }}>
              {activeAlerta.estado === 'PENDIENTE' && "Buscando unidad cercana..."}
              {activeAlerta.estado === 'ASIGNADO' && "Un sereno fue asignado. Está preparándose."}
              {activeAlerta.estado === 'DESPLIEGUE' && "Unidad en camino. Llegará pronto."}
              {activeAlerta.estado === 'INTERVENCION' && "Unidad en el lugar. Interviniendo."}
              {activeAlerta.estado === 'ATENDIDO' && "Incidencia completada y cerrada."}
              {activeAlerta.estado === 'RECHAZADO' && "Incidencia rechazada. No se enviará unidad."}
            </Typography>
            <Box sx={{ mt: 2, display: 'flex', gap: 1, width: '100%' }}>
              <Button size="small" variant="contained" color="secondary" onClick={() => handleConfirm(activeAlerta.id)} sx={{ flex: 1, textTransform: 'none', fontSize: '0.95rem', fontWeight: 'bold' }}>¡Yo también lo veo!</Button>
              <Button size="small" variant="contained" onClick={() => setTrazaAlertaId(activeAlerta.id)} sx={{ flex: 1, textTransform: 'none', fontSize: '0.95rem', bgcolor: '#059669', '&:hover': { bgcolor: '#047857' }, fontWeight: 'bold' }}>Ver traza completa</Button>
            </Box>
          </Box>
          </Box>
        )}

        <Typography variant="h6" sx={{ mb: 2, textAlign: 'center' }}>Incidencias en tu zona</Typography>

        {nearbyAlertas.filter(a => a.id !== activeAlerta?.id).map(a => (
          <Box key={a.id} sx={{ p: 2, mb: 2, bgcolor: 'background.paper', borderRadius: 2, border: '1px solid rgba(255,255,255,0.05)' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
              <Box sx={{ textAlign: 'left' }}>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>{a.tipo.replace('_', ' ')}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>📍 {a.ubicacion.referencia}</Typography>
                <Typography variant="body2" sx={{ mt: 0.5, color: '#3B82F6' }}>👥 {a.confirmaciones} vecinos confirman</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mr: 1, mt: 0.5 }}>
                <Box sx={{ width: 14, height: 14, borderRadius: '50%', bgcolor: (colorMap as any)[a.estado] || '#3B82F6' }} />
                <Typography variant="h6" sx={{ color: (colorMap as any)[a.estado] || '#3B82F6', fontWeight: 800, fontSize: '1.15rem' }}>{a.estado}</Typography>
              </Box>
            </Box>
            <Box sx={{ mt: 2, display: 'flex', gap: 1, width: '100%' }}>
              <Button size="small" variant="contained" color="secondary" onClick={() => handleConfirm(a.id)} sx={{ flex: 1, textTransform: 'none', fontSize: '0.95rem', fontWeight: 'bold' }}>¡Yo también lo veo!</Button>
              <Button size="small" variant="contained" onClick={() => setTrazaAlertaId(a.id)} sx={{ flex: 1, textTransform: 'none', fontSize: '0.95rem', bgcolor: '#059669', '&:hover': { bgcolor: '#047857' }, fontWeight: 'bold' }}>Ver traza completa</Button>
            </Box>
          </Box>
        ))}
      </BottomSheet>

      <ReportForm open={reportFormOpen} onClose={() => setReportFormOpen(false)} />
      <ModalTraza open={!!trazaAlertaId} onClose={() => setTrazaAlertaId(null)} alertaId={trazaAlertaId} />
    </Box>
  );
};
