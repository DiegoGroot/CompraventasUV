import { useState } from "react";
import Login from "../components/auth/Login";
import Marketplace from "../components/catalog/Marketplace";

export default function App() {
  const [userEmail, setUserEmail] = useState(null);

  return (
    <div>
      {userEmail ? (
        <Marketplace 
          userEmail={userEmail} 
          onLogout={() => setUserEmail(null)} 
        />
      ) : (
        <Login 
          onLoginSuccess={(email) => setUserEmail(email)} 
        />
      )}
    </div>
  );
}