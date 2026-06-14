import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, IconButton, Typography, Box, Button, Rating } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import StarIcon from '@mui/icons-material/Star';
import { useAlerta } from '../context/AlertaContext';
import { format } from 'date-fns';

interface ModalTrazaProps {
  open: boolean;
  onClose: () => void;
  alertaId: string | null;
}

const colorMap = {
  PENDIENTE: '#F59E0B',
  ASIGNADO: '#8B5CF6',
  DESPLIEGUE: '#3B82F6',
  INTERVENCION: '#EF4444',
  ATENDIDO: '#10B981',
  RECHAZADO: '#9CA3AF'
};

export const ModalTraza: React.FC<ModalTrazaProps> = ({ open, onClose, alertaId }) => {
  const { state } = useAlerta();
  const [showRating, setShowRating] = useState(false);
  const [ratingValue, setRatingValue] = useState<number | null>(0);
  
  if (!alertaId) return null;
  
  const alerta = state.alertas.find(a => a.id === alertaId);
  if (!alerta) return null;

  const isOwner = state.rolActivo.startsWith('ciudadano') && alerta.ciudadano_telefono === state.ciudadanoActual.telefono;

  const handleShare = () => {
    navigator.clipboard.writeText(`${window.location.origin}/seguimiento`);
    alert('Link de seguimiento copiado');
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" sx={{ '& .MuiDialog-paper': { bgcolor: 'background.paper', borderRadius: 2 } }}>
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" sx={{ fontSize: '1rem' }}>
          Incidencia #{alerta.token}
        </Typography>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ color: 'text.secondary' }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent dividers sx={{ borderColor: 'divider' }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="body1" sx={{ fontWeight: 600 }}>{alerta.tipo.replace('_', ' ')}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            📍 {alerta.ubicacion.referencia}
          </Typography>
          <Typography variant="body2" sx={{ mt: 1, color: '#3B82F6' }}>
            👥 {alerta.confirmaciones} ciudadanos confirman esta incidencia
          </Typography>
        </Box>

        <Typography variant="subtitle2" sx={{ mb: 2, color: 'text.secondary', borderBottom: '1px solid rgba(255,255,255,0.08)', pb: 1 }}>
          Línea de tiempo
        </Typography>

        <Box sx={{ position: 'relative', pl: 2, ml: 1, borderLeft: '2px solid rgba(255,255,255,0.08)' }}>
          {alerta.historial_estados.map((h, i) => (
            <Box key={i} sx={{ mb: 3, position: 'relative' }}>
              <Box sx={{ 
                position: 'absolute', 
                left: -23, 
                top: 4, 
                width: 12, 
                height: 12, 
                borderRadius: '50%', 
                bgcolor: colorMap[h.estado] 
              }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: colorMap[h.estado] }}>
                  {h.estado}
                </Typography>
                <Typography variant="caption" sx={{ fontFamily: '"Roboto Mono", monospace', color: 'text.secondary' }}>
                  {format(new Date(h.timestamp), 'dd/MM · HH:mm:ss')}
                </Typography>
              </Box>
              {h.nota && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, pl: 1, borderLeft: '2px solid rgba(255,255,255,0.08)' }}>
                  {h.nota}
                </Typography>
              )}
            </Box>
          ))}
        </Box>

        {isOwner && (
          <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Button 
              variant="contained" 
              color="primary"
              startIcon={<ContentCopyIcon />} 
              onClick={handleShare}
              fullWidth
              sx={{ fontWeight: 'bold' }}
            >
              Compartir link de seguimiento
            </Button>

            {alerta.estado === 'ATENDIDO' && !showRating && (
              <Button 
                variant="contained" 
                sx={{ bgcolor: '#059669', '&:hover': { bgcolor: '#047857' }, fontWeight: 'bold' }}
                startIcon={<StarIcon />} 
                onClick={() => setShowRating(true)}
                fullWidth
              >
                Califica la atención
              </Button>
            )}

            {showRating && (
              <Box sx={{ mt: 2, textAlign: 'center', bgcolor: 'rgba(255,255,255,0.03)', p: 3, borderRadius: 2, border: '1px solid rgba(255,255,255,0.08)' }}>
                <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>¿Qué tal fue la atención?</Typography>
                <Rating
                  name="dummy-rating"
                  value={ratingValue}
                  onChange={(_event, newValue) => {
                    setRatingValue(newValue);
                    setTimeout(() => setShowRating(false), 800); // Hide after rating (dummy flow)
                  }}
                  size="large"
                />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Tu calificación nos ayuda a mejorar.
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};
