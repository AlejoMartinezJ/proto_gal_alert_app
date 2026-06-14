import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, Paper } from '@mui/material';
import ShieldIcon from '@mui/icons-material/Shield';

export const LoginModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [dni, setDni] = useState('');
  const [telefono, setTelefono] = useState('');
  const [correo, setCorreo] = useState('');

  useEffect(() => {
    // Limpiamos los datos al recargar la página para forzar el login en el prototipo
    localStorage.removeItem('alerta_gal_user');
    
    const user = localStorage.getItem('alerta_gal_user');
    if (!user) {
      setIsOpen(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dni || dni.length < 8) return;
    
    // Guardar en local storage para simular sesión persistente
    localStorage.setItem('alerta_gal_user', JSON.stringify({ dni, telefono, correo }));
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <Box sx={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      bgcolor: 'rgba(0, 0, 0, 0.6)',
      backdropFilter: 'blur(12px)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      p: 2
    }}>
      <Paper elevation={24} sx={{ p: 4, borderRadius: 4, width: '100%', maxWidth: 400, bgcolor: 'background.paper', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <ShieldIcon sx={{ fontSize: 56, color: 'primary.main', mb: 1 }} />
          <Typography variant="h5" sx={{ fontWeight: 800 }}>Alerta Gal</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>Identifícate para ingresar al sistema</Typography>
        </Box>

        <form onSubmit={handleLogin}>
          <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>DNI (Requerido)</Typography>
          <TextField 
            fullWidth 
            required
            placeholder="Ingresa tu número de DNI" 
            value={dni}
            onChange={(e) => setDni(e.target.value.replace(/[^0-9]/g, '').slice(0, 8))}
            sx={{ mb: 3 }}
            autoFocus
          />

          <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>Teléfono (Opcional)</Typography>
          <TextField 
            fullWidth 
            type="tel"
            placeholder="Ej: 987654321" 
            value={telefono}
            onChange={(e) => setTelefono(e.target.value.replace(/[^0-9]/g, '').slice(0, 9))}
            sx={{ mb: 3 }}
          />

          <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>Correo electrónico (Opcional)</Typography>
          <TextField 
            fullWidth 
            type="email"
            placeholder="correo@ejemplo.com" 
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            sx={{ mb: 4 }}
          />

          <Button 
            type="submit" 
            variant="contained" 
            size="large" 
            fullWidth 
            disabled={dni.length < 8}
            sx={{ py: 1.5, fontWeight: 'bold', fontSize: '1.1rem' }}
          >
            Ingresar
          </Button>
        </form>
      </Paper>
    </Box>
  );
};
