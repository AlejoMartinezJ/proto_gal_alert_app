import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, Typography, Dialog, DialogTitle, DialogContent, Alert } from '@mui/material';
import LocalBarIcon from '@mui/icons-material/LocalBar';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import GavelIcon from '@mui/icons-material/Gavel';
import QuestionMarkIcon from '@mui/icons-material/QuestionMark';
import PlaceIcon from '@mui/icons-material/Place';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { useAlerta } from '../context/AlertaContext';
import type { TipoAlerta, Alerta } from '../types';
import { format } from 'date-fns';

interface ReportFormProps {
  open: boolean;
  onClose: () => void;
}

const LocationPicker = ({ position, setPosition }: { position: [number, number], setPosition: (pos: [number, number]) => void }) => {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });
  return position ? <Marker position={position} /> : null;
};

export const ReportForm: React.FC<ReportFormProps> = ({ open, onClose }) => {
  const { state, dispatch } = useAlerta();
  const [tipo, setTipo] = useState<TipoAlerta>('ALTERACION_ORDEN');
  const [referencia, setReferencia] = useState('');
  const [telefono, setTelefono] = useState(state.ciudadanoActual.telefono);
  const [submittedToken, setSubmittedToken] = useState<string | null>(null);
  const [position, setPosition] = useState<[number, number]>([state.ciudadanoActual.lat, state.ciudadanoActual.lng]);
  const [isMapOpen, setIsMapOpen] = useState(false);
  
  // Resincronizar posición y teléfono cuando se abre por primera vez el reporte
  useEffect(() => {
    if (open && !isMapOpen) {
      setPosition([state.ciudadanoActual.lat, state.ciudadanoActual.lng]);
      setTelefono(state.ciudadanoActual.telefono);
    }
  }, [open, state.ciudadanoActual, isMapOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!referencia || !telefono) return;

    const now = new Date();
    const last4 = telefono.slice(-4);
    const dateStr = format(now, 'ddMM');
    const timeStr = format(now, 'HHmm');
    const token = `${last4}-${dateStr}-${timeStr}`;

    const nuevaAlerta: Alerta = {
      id: `ALB-${token}`,
      token,
      tipo,
      descripcion: "",
      ubicacion: { lat: position[0], lng: position[1], referencia },
      estado: 'PENDIENTE',
      confirmaciones: 1,
      weighted_score: 1.0,
      ciudadano_telefono: telefono,
      timestamp_creacion: now.toISOString(),
      sereno_asignado: null,
      historial_estados: [
        { estado: 'PENDIENTE', timestamp: now.toISOString(), nota: null }
      ]
    };

    dispatch({ type: 'CREAR_ALERTA', payload: nuevaAlerta });
    setSubmittedToken(token);
  };

  if (submittedToken) {
    return (
      <Dialog open={open} onClose={() => { setSubmittedToken(null); onClose(); }} fullWidth maxWidth="xs" sx={{ '& .MuiDialog-paper': { bgcolor: 'background.paper', borderRadius: 2 } }}>
        <DialogContent sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h5" color="success.main" gutterBottom>
            ✓ Alerta enviada
          </Typography>
          <Typography variant="h6" gutterBottom>
            #{submittedToken}
          </Typography>
          <Button variant="contained" onClick={() => { setSubmittedToken(null); onClose(); }} sx={{ mt: 2 }}>
            Ver seguimiento
          </Button>
        </DialogContent>
      </Dialog>
    );
  }

  // Full screen map picker dialog
  if (isMapOpen) {
    return (
      <Dialog fullScreen open={isMapOpen}>
        <Box sx={{ height: '100vh', width: '100vw', position: 'relative' }}>
          <MapContainer center={position} zoom={16} style={{ height: '100%', width: '100%' }} zoomControl={false}>
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; CARTO'
            />
            <LocationPicker position={position} setPosition={setPosition} />
          </MapContainer>
          <Box sx={{ 
            position: 'absolute', 
            top: 20, 
            left: '50%', 
            transform: 'translateX(-50%)',
            bgcolor: 'rgba(17, 24, 39, 0.9)', 
            px: 2, py: 1, 
            borderRadius: 2, 
            zIndex: 1000,
            backdropFilter: 'blur(4px)',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <Typography variant="body2">Toca el mapa para ajustar el punto</Typography>
          </Box>
          <Box sx={{ 
            position: 'absolute', 
            bottom: 40, 
            left: 20, 
            right: 20, 
            zIndex: 1000 
          }}>
            <Button 
              variant="contained" 
              color="primary" 
              fullWidth 
              size="large" 
              onClick={() => setIsMapOpen(false)}
              sx={{ py: 1.5, fontSize: '1.1rem', boxShadow: 6 }}
            >
              ✓ Seleccionar esta ubicación
            </Button>
          </Box>
        </Box>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs" sx={{ '& .MuiDialog-paper': { bgcolor: 'background.paper', borderRadius: 2 } }}>
      <DialogTitle>Reportar incidencia</DialogTitle>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <Typography variant="subtitle2" sx={{ mb: 1, mt: 1 }}>¿Qué está pasando?</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, mb: 3 }}>
            <Box>
              <Button 
                fullWidth 
                variant={tipo === 'CONSUMO_ALCOHOL' ? 'contained' : 'outlined'} 
                color={tipo === 'CONSUMO_ALCOHOL' ? 'warning' : 'inherit'}
                onClick={() => setTipo('CONSUMO_ALCOHOL')}
                startIcon={<LocalBarIcon />}
                sx={{ py: 1, flexDirection: 'column', gap: 1, '& .MuiButton-startIcon': { margin: 0 } }}
              >
                Alcohol
              </Button>
            </Box>
            <Box>
              <Button 
                fullWidth 
                variant={tipo === 'ALTERACION_ORDEN' ? 'contained' : 'outlined'} 
                color={tipo === 'ALTERACION_ORDEN' ? 'secondary' : 'inherit'}
                onClick={() => setTipo('ALTERACION_ORDEN')}
                startIcon={<VolumeUpIcon />}
                sx={{ py: 1, flexDirection: 'column', gap: 1, '& .MuiButton-startIcon': { margin: 0 } }}
              >
                Ruido
              </Button>
            </Box>
            <Box>
              <Button 
                fullWidth 
                variant={tipo === 'PELEA' ? 'contained' : 'outlined'} 
                color={tipo === 'PELEA' ? 'error' : 'inherit'}
                onClick={() => setTipo('PELEA')}
                startIcon={<GavelIcon />}
                sx={{ py: 1, flexDirection: 'column', gap: 1, '& .MuiButton-startIcon': { margin: 0 } }}
              >
                Pelea
              </Button>
            </Box>
            <Box>
              <Button 
                fullWidth 
                variant={tipo === 'OTRO' ? 'contained' : 'outlined'} 
                color={tipo === 'OTRO' ? 'primary' : 'inherit'}
                onClick={() => setTipo('OTRO')}
                startIcon={<QuestionMarkIcon />}
                sx={{ py: 1, flexDirection: 'column', gap: 1, '& .MuiButton-startIcon': { margin: 0 } }}
              >
                Otro
              </Button>
            </Box>
          </Box>

          <Typography variant="subtitle2" sx={{ mb: 1 }}>¿Dónde?</Typography>
          <Button 
            variant="outlined" 
            fullWidth 
            startIcon={<PlaceIcon />} 
            onClick={() => setIsMapOpen(true)}
            sx={{ mb: 2, py: 1.5, justifyContent: 'flex-start', color: 'text.primary', borderColor: 'rgba(255,255,255,0.2)' }}
          >
            Fijar punto en el mapa
          </Button>
          
          <TextField 
            fullWidth 
            size="small" 
            placeholder="Referencia: Ej: Puerta norte del Mercado" 
            value={referencia}
            onChange={(e) => setReferencia(e.target.value)}
            required
            sx={{ mb: 3 }}
          />

          <Typography variant="subtitle2" sx={{ mb: 1 }}>Número de teléfono (para seguimiento)</Typography>
          <TextField 
            fullWidth 
            size="small" 
            type="tel"
            placeholder="Tu número de celular" 
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            required
            sx={{ mb: 3 }}
          />

          <Button type="submit" variant="contained" color="primary" fullWidth size="large" sx={{ py: 1.5, fontSize: '1.1rem' }}>
            ⚠ Enviar alerta
          </Button>

          <Box sx={{ mt: 3 }}>
            <Alert severity="info" sx={{ bgcolor: 'rgba(59, 130, 246, 0.1)', color: 'text.secondary', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
              <Typography variant="caption" sx={{ display: 'block' }}>
                <strong>📵 ¿Sin conexión a datos?</strong><br />
                Envía SMS al <strong>[XXXX-XXXX]</strong>:<br />
                ALERTA [tipo] [referencia]<br />
                Ej: ALERTA ALCOHOL Mercado Santa Rosa
              </Typography>
            </Alert>
          </Box>
        </form>
      </DialogContent>
    </Dialog>
  );
};
