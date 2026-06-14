import React from 'react';
import { Box, ToggleButtonGroup, ToggleButton } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import DesktopWindowsIcon from '@mui/icons-material/DesktopWindows';
import ShieldIcon from '@mui/icons-material/Shield';
import { useAlerta } from '../context/AlertaContext';
import type { Rol } from '../types';

export const RoleSwitcher: React.FC = () => {
  const { state, dispatch } = useAlerta();

  const handleRoleChange = (
    _event: React.MouseEvent<HTMLElement>,
    newRole: Rol | null,
  ) => {
    if (newRole !== null) {
      dispatch({ type: 'CAMBIAR_ROL', payload: newRole });
    }
  };

  return (
    <Box 
      sx={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        zIndex: 9999, 
        display: 'flex', 
        justifyContent: 'center',
        bgcolor: 'rgba(10, 14, 26, 0.8)',
        backdropFilter: 'blur(8px)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        p: 1
      }}
    >
      <ToggleButtonGroup
        value={state.rolActivo}
        exclusive
        onChange={handleRoleChange}
        aria-label="role switcher"
        size="small"
      >
        <ToggleButton value="ciudadanoA" aria-label="ciudadanoA">
          <PersonIcon sx={{ mr: 1, fontSize: 18 }} /> Ciudadano A
        </ToggleButton>
        <ToggleButton value="ciudadanoB" aria-label="ciudadanoB">
          <PersonIcon sx={{ mr: 1, fontSize: 18 }} /> Ciudadano B
        </ToggleButton>
        <ToggleButton value="operadora" aria-label="operadora">
          <DesktopWindowsIcon sx={{ mr: 1, fontSize: 18 }} /> Operadora
        </ToggleButton>
        <ToggleButton value="sereno" aria-label="sereno">
          <ShieldIcon sx={{ mr: 1, fontSize: 18 }} /> Sereno
        </ToggleButton>
      </ToggleButtonGroup>
    </Box>
  );
};
