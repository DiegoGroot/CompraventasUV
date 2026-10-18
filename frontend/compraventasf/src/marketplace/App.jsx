import { useState } from "react";
import Login from "../components/auth/Login";
import Marketplace from "../components/catalog/Marketplace";

export default function App() {
  // userEmail: correo del usuario logueado, o "Invitado" en modo exploración
  const [userEmail, setUserEmail] = useState(null);

  function salir() {
    localStorage.removeItem("token");
    setUserEmail(null);
  }

  return (
    <div>
      {userEmail ? (
        <Marketplace userEmail={userEmail} onLogout={salir} />
      ) : (
        <Login
          onLoginSuccess={(usuario) => setUserEmail(usuario?.correo || usuario?.username || "usuario")}
          onGuest={() => setUserEmail("Invitado")}
        />
      )}
    </div>
  );
}