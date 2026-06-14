import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme';
import { AlertaProvider, useAlerta } from './context/AlertaContext';
import { RoleSwitcher } from './components/RoleSwitcher';
import { CitizenView } from './views/CitizenView';
import { OperatorView } from './views/OperatorView';
import { SerenView } from './views/SerenView';
import { TrackingPublic } from './views/TrackingPublic';
import { LoginModal } from './components/LoginModal';

const MainView: React.FC = () => {
  const { state } = useAlerta();

  useEffect(() => {
    // Solicitar permiso de notificaciones al cargar
    if ('Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
  }, []);

  return (
    <>
      <LoginModal />
      <RoleSwitcher />
      {state.rolActivo.startsWith('ciudadano') && <CitizenView />}
      {state.rolActivo === 'operadora' && <OperatorView />}
      {state.rolActivo === 'sereno' && <SerenView />}
    </>
  );
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AlertaProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<MainView />} />
            <Route path="/r" element={<MainView />} /> {/* Shortcut for reporting */}
            <Route path="/seguimiento" element={<TrackingPublic />} />
          </Routes>
        </BrowserRouter>
      </AlertaProvider>
    </ThemeProvider>
  );
}

export default App;
