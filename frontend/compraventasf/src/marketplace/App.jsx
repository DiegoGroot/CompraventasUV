import { useState } from 'react';
import Login from '../components/auth/Login';
import Register from '../components/auth/Register';

export default function App() {
  const [currentView, setCurrentView] = useState('login'); // 'login' | 'register' | 'home'

  return (
    <div>
      {currentView === 'login' && (
        <Login 
          onGoToRegister={() => setCurrentView('register')}
          onLoginSuccess={() => setCurrentView('home')}
        />
      )}

      {currentView === 'register' && (
        <Register 
          onGoToLogin={() => setCurrentView('login')}
        />
      )}

      {currentView === 'home' && (
        <div style={{ padding: 20, textAlign: 'center' }}>
          <h1>¡Bienvenido a Compraventas UV!</h1>
          <button onClick={() => setCurrentView('login')}>Cerrar sesión</button>
        </div>
      )}
    </div>
  );
}