import React, { useState } from 'react';
import { Box, Typography, Tabs, Tab, Button, Dialog, DialogTitle, DialogContent, List, ListItem, ListItemText, ListItemButton, Select, MenuItem, FormControl, InputLabel, AppBar, Toolbar } from '@mui/material';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useAlerta } from '../context/AlertaContext';
import { format } from 'date-fns';
import { QRCodeSVG } from 'qrcode.react';
import { ModalTraza } from '../components/ModalTraza';

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

const getMarkerIcon = (estado: string) => {
  const color = colorMap[estado as keyof typeof colorMap] || '#3B82F6';
  return new L.DivIcon({
    html: `<svg viewBox="0 0 24 24" fill="${color}" width="32" height="32" style="filter: drop-shadow(0px 3px 3px rgba(0,0,0,0.5));">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
    </svg>`,
    className: '',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });
};

export const OperatorView: React.FC = () => {
  const { state, dispatch } = useAlerta();
  const [tabValue, setTabValue] = useState(0);
  const [trazaAlertaId, setTrazaAlertaId] = useState<string | null>(null);
  
  // Modals state
  const [contactarAlerta, setContactarAlerta] = useState<string | null>(null);
  const [asignarAlerta, setAsignarAlerta] = useState<string | null>(null);
  const [rechazarAlerta, setRechazarAlerta] = useState<string | null>(null);
  const [rechazoMotivo, setRechazoMotivo] = useState('No corresponde a Serenazgo');
  const [showQr, setShowQr] = useState(false);
  const [mapFilter, setMapFilter] = useState<string>('TODOS');

  const formatTimeAgo = (timestamp: string) => {
    const diffMs = new Date().getTime() - new Date(timestamp).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 60) return `hace ${diffMins} min`;
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return `hace ${hours}h y ${mins} min`;
  };

  const getAverageTimes = () => {
    let assignMs = 0, assignCount = 0;
    let closeMs = 0, closeCount = 0;

    state.alertas.forEach(a => {
      const pending = a.historial_estados.find(h => h.estado === 'PENDIENTE');
      const assigned = a.historial_estados.find(h => h.estado === 'ASIGNADO');
      const closed = a.historial_estados.find(h => h.estado === 'ATENDIDO');

      if (pending && assigned) {
        assignMs += new Date(assigned.timestamp).getTime() - new Date(pending.timestamp).getTime();
        assignCount++;
      }
      if (assigned && closed) {
        closeMs += new Date(closed.timestamp).getTime() - new Date(assigned.timestamp).getTime();
        closeCount++;
      }
    });

    const formatMs = (ms: number) => {
      if (ms === 0) return '--';
      const mins = Math.floor(ms / 60000);
      if (mins < 60) return `${mins}m`;
      return `${Math.floor(mins / 60)}h ${mins % 60}m`;
    };

    return { 
      avgAssign: formatMs(assignCount ? assignMs / assignCount : 0), 
      avgClose: formatMs(closeCount ? closeMs / closeCount : 0) 
    };
  };

  const { avgAssign, avgClose } = getAverageTimes();

  const pendientes = state.alertas.filter(a => a.estado === 'PENDIENTE');
  const activas = state.alertas.filter(a => ['ASIGNADO', 'DESPLIEGUE', 'INTERVENCION'].includes(a.estado));
  const atendidas = state.alertas.filter(a => a.estado === 'ATENDIDO');
  const rechazadas = state.alertas.filter(a => a.estado === 'RECHAZADO');

  const getActiveList = () => {
    switch (tabValue) {
      case 0: return pendientes;
      case 1: return activas;
      case 2: return atendidas;
      case 3: return rechazadas;
      default: return [];
    }
  };

  const handleAsignar = (serenoId: string) => {
    if (asignarAlerta) {
      dispatch({ type: 'ASIGNAR_SERENO', payload: { alerta_id: asignarAlerta, sereno_id: serenoId } });
      setAsignarAlerta(null);
    }
  };

  const handleRechazar = () => {
    if (rechazarAlerta) {
      dispatch({ type: 'RECHAZAR_ALERTA', payload: { alerta_id: rechazarAlerta, motivo: rechazoMotivo } });
      setRechazarAlerta(null);
    }
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppBar position="static" color="transparent" sx={{ borderBottom: '1px solid rgba(255,255,255,0.08)', bgcolor: 'background.paper', zIndex: 2000, pt: 6 }}>
        <Toolbar variant="dense" sx={{ justifyContent: 'space-between', mt: 2, mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h6" sx={{ fontSize: '1.2rem', fontWeight: 800 }}>Alerta Gal</Typography>
            <Typography variant="subtitle1" color="text.secondary">Central de operaciones</Typography>
            <Box sx={{ bgcolor: 'rgba(255,255,255,0.1)', px: 1, py: 0.5, borderRadius: 1, ml: 2 }}>
              <Typography variant="caption" sx={{ fontFamily: '"Roboto Mono"' }}>{format(new Date(), 'HH:mm:ss')}</Typography>
            </Box>
          </Box>
          <Button variant="contained" color="primary" onClick={() => setShowQr(true)}>Compartir QR para seguimiento</Button>
        </Toolbar>
      </AppBar>

      <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Left Column - Responsive Google Maps Style */}
        <Box sx={{ width: '100%', maxWidth: 600, minWidth: 500, flexShrink: 0, borderRight: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', bgcolor: 'background.default', zIndex: 10 }}>
          <Tabs value={tabValue} onChange={(_e, v) => setTabValue(v)} variant="fullWidth">
            <Tab label={`Pendientes (${pendientes.length})`} />
            <Tab label={`Activas (${activas.length})`} />
            <Tab label="Atendidas" />
            <Tab label="Rechazadas" />
          </Tabs>
          
          <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
            {getActiveList().map(a => (
              <Box key={a.id} sx={{ mb: 2, p: 2, bgcolor: 'background.paper', borderRadius: 2, border: '1px solid rgba(255,255,255,0.05)' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Box sx={{ textAlign: 'left' }}>
                    <Typography variant="h6" sx={{ fontWeight: 800 }}>{a.tipo.replace('_', ' ')}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>📍 {a.ubicacion.referencia}</Typography>
                    <Typography variant="body2" sx={{ mt: 0.5, color: '#3B82F6' }}>👥 {a.confirmaciones} confirmaciones</Typography>
                    <Typography variant="caption" sx={{ fontFamily: '"Roboto Mono"', color: 'text.secondary', display: 'block', mt: 0.5 }}>#{a.token}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Box sx={{ width: 14, height: 14, borderRadius: '50%', bgcolor: colorMap[a.estado] }} />
                      <Typography variant="h6" sx={{ color: colorMap[a.estado], fontWeight: 800, fontSize: '1rem' }}>
                        {a.estado}
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      {formatTimeAgo(a.timestamp_creacion)}
                    </Typography>
                  </Box>
                </Box>
                
                <Box sx={{ mt: 2, display: 'flex', gap: 1, width: '100%' }}>
                  {a.estado === 'PENDIENTE' && (
                    <>
                      <Button size="small" variant="contained" color="success" sx={{ flex: 1, textTransform: 'none' }} onClick={() => setContactarAlerta(a.ciudadano_telefono)}>📞 Contactar</Button>
                      <Button size="small" variant="contained" color="secondary" sx={{ flex: 1, textTransform: 'none' }} onClick={() => setAsignarAlerta(a.id)}>✓ Asignar</Button>
                      <Button size="small" variant="contained" color="error" sx={{ textTransform: 'none' }} onClick={() => setRechazarAlerta(a.id)}>✗ Rechazar</Button>
                    </>
                  )}
                  {a.estado !== 'PENDIENTE' && (
                    <Button size="small" variant="contained" sx={{ flex: 1, textTransform: 'none', bgcolor: '#059669', '&:hover': { bgcolor: '#047857' } }} onClick={() => setTrazaAlertaId(a.id)}>Ver traza completa</Button>
                  )}
                </Box>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Right Column - Map */}
        <Box sx={{ flex: 1, position: 'relative' }}>
          <Box sx={{ position: 'absolute', top: 16, left: 16, right: 16, zIndex: 1000, bgcolor: 'rgba(17, 24, 39, 0.9)', backdropFilter: 'blur(4px)', p: 1.5, borderRadius: 2, border: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'flex-start', flexWrap: 'wrap', gap: 3 }}>
            <Typography variant="body2">Alertas activas: <strong>{pendientes.length + activas.length}</strong></Typography>
            <Typography variant="body2">Serenos: <strong>{state.serenos.filter(s => s.estado === 'ATENDIENDO').length} / {state.serenos.length}</strong></Typography>
            <Typography variant="body2">Atendidas hoy: <strong>{atendidas.length}</strong></Typography>
            <Typography variant="body2">T prom. atención: <strong>{avgAssign}</strong></Typography>
            <Typography variant="body2">T prom. cierre: <strong>{avgClose}</strong></Typography>
          </Box>

          <MapContainer 
            center={[-18.0142, -70.2536]} 
            zoom={15} 
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; CARTO'
            />
            {/* Alertas */}
            {state.alertas
              .filter(a => a.estado !== 'ATENDIDO' && a.estado !== 'RECHAZADO')
              .filter(a => mapFilter === 'TODOS' || a.estado === mapFilter)
              .map(a => (
              <Marker key={a.id} position={[a.ubicacion.lat, a.ubicacion.lng]} icon={getMarkerIcon(a.estado)}>
                <Popup>{a.tipo} - {a.estado}</Popup>
              </Marker>
            ))}
          </MapContainer>
          
          {/* Leyenda y Filtro */}
          <Box sx={{ position: 'absolute', bottom: 24, right: 24, zIndex: 1000, bgcolor: 'rgba(17, 24, 39, 0.9)', p: 2, borderRadius: 2, border: '1px solid rgba(255,255,255,0.08)', minWidth: 150 }}>
            <Typography variant="caption" sx={{ display: 'block', mb: 1.5, fontWeight: 'bold', color: 'text.secondary' }}>FILTRO DE ESTADO</Typography>
            {['TODOS', ...Object.keys(colorMap)].map(status => (
              <Box 
                key={status} 
                sx={{ 
                  display: 'flex', alignItems: 'center', gap: 1, mb: 1, cursor: 'pointer', 
                  opacity: mapFilter === status || mapFilter === 'TODOS' ? 1 : 0.4,
                  transition: 'opacity 0.2s'
                }} 
                onClick={() => setMapFilter(status)}
              >
                {status !== 'TODOS' ? (
                  <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: (colorMap as any)[status] }} />
                ) : (
                  <Box sx={{ width: 12, height: 12, borderRadius: '50%', border: '2px solid white' }} />
                )}
                <Typography variant="body2" sx={{ fontWeight: mapFilter === status ? 700 : 400 }}>{status}</Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      {/* Modals */}
      <ModalTraza open={!!trazaAlertaId} onClose={() => setTrazaAlertaId(null)} alertaId={trazaAlertaId} />

      <Dialog open={!!contactarAlerta} onClose={() => setContactarAlerta(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Contactar ciudadano</DialogTitle>
        <DialogContent dividers>
          <List>
            <ListItem disablePadding sx={{ mb: 1 }}>
              <ListItemButton component="a" href={`tel:${contactarAlerta}`} sx={{ borderRadius: 1, border: '1px solid rgba(255,255,255,0.1)' }}>
                <ListItemText primary={`📞 Llamar al ${contactarAlerta}`} />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton component="a" href={`https://wa.me/51${contactarAlerta}`} target="_blank" sx={{ borderRadius: 1, border: '1px solid rgba(255,255,255,0.1)' }}>
                <ListItemText primary={`💬 WhatsApp al ${contactarAlerta}`} />
              </ListItemButton>
            </ListItem>
          </List>
        </DialogContent>
      </Dialog>

      <Dialog open={!!asignarAlerta} onClose={() => setAsignarAlerta(null)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Asignar unidad (Sereno)</DialogTitle>
        <DialogContent dividers>
          <List>
            {state.serenos.map(s => (
              <ListItem key={s.id} sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', py: 2 }}>
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>{s.nombre}</Typography>
                  <Typography variant="body2" color={s.estado === 'LIBRE' ? 'success.main' : 'warning.main'} sx={{ mt: 0.5, fontWeight: 'bold' }}>
                    {s.estado === 'LIBRE' ? '🟢 LIBRE' : '🟠 ATENDIENDO'} · <span style={{ fontWeight: 'normal', color: '#9CA3AF' }}>{s.zona}</span>
                  </Typography>
                </Box>
                {s.estado === 'LIBRE' && (
                  <Button variant="contained" size="small" onClick={() => handleAsignar(s.id)} sx={{ px: 3 }}>Asignar</Button>
                )}
              </ListItem>
            ))}
          </List>
        </DialogContent>
      </Dialog>

      <Dialog open={!!rechazarAlerta} onClose={() => setRechazarAlerta(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Rechazar alerta</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>Seleccione un motivo para rechazar y cerrar esta incidencia.</Typography>
          <FormControl fullWidth size="small">
            <InputLabel>Motivo de rechazo</InputLabel>
            <Select value={rechazoMotivo} onChange={(e) => setRechazoMotivo(e.target.value)} label="Motivo de rechazo">
              <MenuItem value="No corresponde a Serenazgo">No corresponde a Serenazgo</MenuItem>
              <MenuItem value="Broma / falsa alarma">Broma / falsa alarma</MenuItem>
              <MenuItem value="Duplicado">Duplicado</MenuItem>
              <MenuItem value="Información insuficiente">Información insuficiente</MenuItem>
              <MenuItem value="Otro">Otro</MenuItem>
            </Select>
          </FormControl>
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button onClick={() => setRechazarAlerta(null)} color="inherit">Cancelar</Button>
            <Button color="error" variant="contained" onClick={handleRechazar} sx={{ px: 3 }}>Rechazar definitivamente</Button>
          </Box>
        </DialogContent>
      </Dialog>

      <Dialog open={showQr} onClose={() => setShowQr(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ textAlign: 'center', fontWeight: 'bold' }}>Seguimiento Ciudadano</DialogTitle>
        <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 4, bgcolor: '#F9FAFB' }}>
          <Box sx={{ bgcolor: 'white', p: 3, borderRadius: 3, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
            <QRCodeSVG value={`${window.location.origin}/seguimiento`} size={240} />
          </Box>
          <Typography variant="body1" sx={{ mt: 4, textAlign: 'center', color: '#1F2937', fontWeight: 600 }}>
            Escanea este código para ver el estado de tus incidencias en tiempo real.
          </Typography>
        </DialogContent>
      </Dialog>
    </Box>
  );
};
