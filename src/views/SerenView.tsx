import React, { useState } from 'react';
import { Box, Typography, Button, TextField, Select, MenuItem, FormControl, InputLabel, Dialog, DialogTitle, DialogContent } from '@mui/material';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useAlerta } from '../context/AlertaContext';
import { BottomSheet } from '../components/BottomSheet';
import type { SheetState } from '../components/BottomSheet';
import MapIcon from '@mui/icons-material/Map';
import NavigationIcon from '@mui/icons-material/Navigation';
import MenuBookIcon from '@mui/icons-material/MenuBook';

const serenoLocationIcon = new L.DivIcon({
  html: '<div style="width: 16px; height: 16px; background-color: #10B981; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.5);"></div>',
  className: '',
  iconSize: [16, 16],
  iconAnchor: [8, 8]
});

// Fix Leaflet icons
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
  ATENDIDO: '#10B981',
  RECHAZADO: '#9CA3AF'
};

export const SerenView: React.FC = () => {
  const { state, dispatch } = useAlerta();
  const [sheetState, setSheetState] = useState<SheetState>('half');
  const [actividad, setActividad] = useState('Disuasión verbal');
  const [resultado, setResultado] = useState('Situación resuelta');
  const [observaciones, setObservaciones] = useState('');
  const [showInstructivos, setShowInstructivos] = useState(false);

  const sereno = state.serenos.find(s => s.id === state.serenoActual.id) || state.serenoActual;
  const alerta = state.alertas.find(a => a.id === sereno.alerta_id);

  const handleCambiarEstado = (nuevoEstado: any, nota?: string) => {
    if (alerta) {
      dispatch({ type: 'CAMBIAR_ESTADO_ALERTA', payload: { alerta_id: alerta.id, estado: nuevoEstado, nota } });
    }
  };

  const handleCerrarCaso = () => {
    handleCambiarEstado('ATENDIDO', `${actividad} · ${resultado} ${observaciones ? `(${observaciones})` : ''}`);
    setActividad('Disuasión verbal');
    setResultado('Situación resuelta');
    setObservaciones('');
  };

  return (
    <Box sx={{ height: '100vh', width: '100vw', position: 'relative', bgcolor: 'background.default' }}>
      <MapContainer 
        center={[sereno.lat, sereno.lng]} 
        zoom={16} 
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; CARTO'
        />
        <Marker position={[sereno.lat, sereno.lng]} icon={serenoLocationIcon}>
          <Popup>Tú estás aquí</Popup>
        </Marker>
        {alerta && (
          <Marker position={[alerta.ubicacion.lat, alerta.ubicacion.lng]}>
            <Popup>Incidencia: {alerta.tipo}</Popup>
          </Marker>
        )}
      </MapContainer>

      <BottomSheet currentState={sheetState} onStateChange={setSheetState}>
        {!alerta ? (
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <Typography variant="h6" color="text.secondary">Sin alertas asignadas</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Patrullaje preventivo en curso.
            </Typography>
          </Box>
        ) : (
          <Box>
            <Typography variant="h6" sx={{ mb: 2, textAlign: 'center' }}>
              {alerta.estado === 'ASIGNADO' ? 'Nuevas alertas asignadas' : 'Alerta en curso'}
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
              <Box sx={{ textAlign: 'left' }}>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>{alerta.tipo.replace('_', ' ')}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>📍 {alerta.ubicacion.referencia}</Typography>
                <Typography variant="caption" sx={{ fontFamily: '"Roboto Mono"', color: 'text.secondary', display: 'block', mt: 0.5 }}>#{alerta.token}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mr: 1, mt: 0.5 }}>
                <Box sx={{ width: 14, height: 14, borderRadius: '50%', bgcolor: (colorMap as any)[alerta.estado] }} />
                <Typography variant="h6" sx={{ color: (colorMap as any)[alerta.estado], fontWeight: 800, fontSize: '1.15rem' }}>
                  {alerta.estado}
                </Typography>
              </Box>
            </Box>

            {alerta.estado === 'ASIGNADO' && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 3 }}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button variant="outlined" startIcon={<MapIcon />} fullWidth component="a" href={`https://www.google.com/maps/dir/?api=1&destination=${alerta.ubicacion.lat},${alerta.ubicacion.lng}`} target="_blank" onClick={() => handleCambiarEstado('DESPLIEGUE', 'T. estimado: 3 min')} sx={{ color: '#F59E0B', borderColor: '#F59E0B', '&:hover': { borderColor: '#F59E0B', bgcolor: 'rgba(245, 158, 11, 0.1)' } }}>Google Maps</Button>
                  <Button variant="outlined" startIcon={<NavigationIcon />} fullWidth component="a" href={`waze://?ll=${alerta.ubicacion.lat},${alerta.ubicacion.lng}&navigate=yes`} onClick={() => handleCambiarEstado('DESPLIEGUE', 'T. estimado: 3 min')} sx={{ color: '#33CCFF', borderColor: '#33CCFF', '&:hover': { borderColor: '#33CCFF', bgcolor: 'rgba(51, 204, 255, 0.1)' } }}>Waze</Button>
                </Box>
                <Button variant="contained" color="info" size="large" onClick={() => handleCambiarEstado('DESPLIEGUE', 'T. estimado: 3 min')}>
                  ✓ Aceptar · Marcar EN DESPLIEGUE
                </Button>
              </Box>
            )}

            {alerta.estado === 'DESPLIEGUE' && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="body2" sx={{ mb: 2, color: 'info.main' }}>En camino · ~3 min al punto</Typography>
                <Button variant="contained" color="warning" size="large" fullWidth onClick={() => handleCambiarEstado('INTERVENCION')}>
                  ✓ Llegué al lugar · Marcar INTERVENCIÓN
                </Button>
              </Box>
            )}

            {alerta.estado === 'INTERVENCION' && (
              <Box sx={{ mt: 3 }}>
                <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                  <InputLabel>Actividad realizada</InputLabel>
                  <Select value={actividad} onChange={e => setActividad(e.target.value)} label="Actividad realizada">
                    <MenuItem value="Disuasión verbal">Disuasión verbal</MenuItem>
                    <MenuItem value="Retención">Retención</MenuItem>
                    <MenuItem value="Derivación a PNP">Derivación a PNP</MenuItem>
                    <MenuItem value="Otro">Otro</MenuItem>
                  </Select>
                </FormControl>
                
                <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                  <InputLabel>Resultado</InputLabel>
                  <Select value={resultado} onChange={e => setResultado(e.target.value)} label="Resultado">
                    <MenuItem value="Situación resuelta">Situación resuelta</MenuItem>
                    <MenuItem value="Controlada">Controlada</MenuItem>
                    <MenuItem value="Requiere PNP">Requiere PNP</MenuItem>
                    <MenuItem value="Otro">Otro</MenuItem>
                  </Select>
                </FormControl>

                <TextField 
                  fullWidth 
                  size="small" 
                  label="Observaciones (opcional)" 
                  value={observaciones}
                  onChange={e => setObservaciones(e.target.value)}
                  sx={{ mb: 3 }}
                  multiline
                  rows={2}
                />

                <Button variant="contained" color="success" size="large" fullWidth onClick={handleCerrarCaso}>
                  ✓ Cerrar caso · Marcar ATENDIDO
                </Button>
              </Box>
            )}

            <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <Button 
                variant="text" 
                color="inherit" 
                startIcon={<MenuBookIcon />} 
                fullWidth 
                onClick={() => setShowInstructivos(true)}
              >
                Ver instructivos de intervención
              </Button>
            </Box>
          </Box>
        )}
      </BottomSheet>

      <Dialog open={showInstructivos} onClose={() => setShowInstructivos(false)}>
        <DialogTitle>Documentación Guía</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Aquí se mostrarán los instructivos y protocolos de intervención según el tipo de incidencia, para guiar al sereno paso a paso.
          </Typography>
        </DialogContent>
      </Dialog>
    </Box>
  );
};
