import React from 'react'

// Logo de la page de connexion de l'admin (remplace le logo Payload).
const LogoKoren: React.FC = () => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
    {/* Emblème officiel (kuf) — carré grenat autoportant, lisible sur fond clair et sombre */}
    <img src="/favicon.svg" alt="Koren France" style={{ width: 84, height: 84 }} />
    <span style={{ fontSize: 17, letterSpacing: '4px', fontWeight: 600 }}>KOREN FRANCE</span>
  </div>
)

export default LogoKoren
