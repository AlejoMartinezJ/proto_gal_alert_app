import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Container, Divider } from '@mui/material';
import ShieldIcon from '@mui/icons-material/Shield';
import SearchIcon from '@mui/icons-material/Search';
import { useAlerta } from '../context/AlertaContext';
import { ModalTraza } from '../components/ModalTraza';
import { format } from 'date-fns';
import type { Alerta } from '../types';

const colorMap = {
  PENDIENTE: '#F59E0B',
  ASIGNADO: '#8B5CF6',
  DESPLIEGUE: '#3B82F6',
  INTERVENCION: '#EF4444',
  ATENDIDO: '#10B981',
  RECHAZADO: '#9CA3AF'
};

export const TrackingPublic: React.FC = () => {
  const { state } = useAlerta();
  const [telefono, setTelefono] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [resultados, setResultados] = useState<Alerta[]>([]);
  const [trazaAlertaId, setTrazaAlertaId] = useState<string | null>(null);

  const formatTimeAgo = (timestamp: string) => {
    const diffMs = new Date().getTime() - new Date(timestamp).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 60) return `hace ${diffMins} min`;
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return `hace ${hours}h y ${mins} min`;
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!telefono) return;
    
    // Filtramos alertas del teléfono y ordenamos por fecha descendente
    const alertasDelTelefono = state.alertas
      .filter(a => a.ciudadano_telefono === telefono)
      .sort((a, b) => new Date(b.timestamp_creacion).getTime() - new Date(a.timestamp_creacion).getTime());
      
    setResultados(alertasDelTelefono);
    setHasSearched(true);
  };

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <ShieldIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
        <Typography variant="h4" gutterBottom>Alerta Gal</Typography>
        <Typography variant="h6" color="text.secondary">Trazabilidad</Typography>
      </Box>

      <Box sx={{ bgcolor: 'background.paper', p: 4, borderRadius: 3, border: '1px solid rgba(255,255,255,0.08)', mb: 4 }}>
        <Typography variant="body1" sx={{ mb: 3, textAlign: 'center', fontWeight: 600 }}>
          Consulta el estado de tu reporte
        </Typography>

        <form onSubmit={handleSearch}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>Número de celular:</Typography>
          <TextField 
            fullWidth 
            type="tel"
            placeholder="Ej: 987654321" 
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            sx={{ mb: 3 }}
          />
          <Button 
            type="submit" 
            variant="contained" 
            size="large" 
            fullWidth 
            startIcon={<SearchIcon />}
          >
            Buscar mis incidencias
          </Button>
        </form>

        <Divider sx={{ my: 4 }}>o</Divider>

        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
          Escanea el QR en el punto de reporte<br/>
          (el QR te lleva directo aquí)
        </Typography>
      </Box>

      {hasSearched && (
        <Box>
          <Typography variant="h6" sx={{ mb: 2 }}>Tus reportes ({resultados.length})</Typography>
          
          {resultados.length === 0 ? (
            <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
              No se encontraron reportes para este número.
            </Typography>
          ) : (
            resultados.map(a => (
              <Box key={a.id} sx={{ mb: 2, p: 2, bgcolor: 'background.paper', borderRadius: 2, border: '1px solid rgba(255,255,255,0.05)' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: colorMap[a.estado] }} />
                  <Typography variant="caption" sx={{ color: colorMap[a.estado], fontWeight: 600 }}>
                    {a.estado} {a.estado === 'ATENDIDO' ? `· ${format(new Date(a.timestamp_creacion), 'dd/MM')}` : `· ${formatTimeAgo(a.timestamp_creacion)}`}
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ fontFamily: '"Roboto Mono"', color: 'text.secondary', mb: 1 }}>#{a.token}</Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>{a.tipo.replace('_', ' ')}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>📍 {a.ubicacion.referencia}</Typography>
                
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button size="small" variant="outlined" onClick={() => setTrazaAlertaId(a.id)}>Ver traza</Button>
                </Box>
              </Box>
            ))
          )}
        </Box>
      )}

      <ModalTraza open={!!trazaAlertaId} onClose={() => setTrazaAlertaId(null)} alertaId={trazaAlertaId} />
    </Container>
  );
};
