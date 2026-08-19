// Lien « Statistiques » dans la barre latérale de l'admin → dashboard Vercel Analytics
// (les données de visite vivent chez Vercel ; pas d'API publique pour les rapatrier ici).
import React from 'react'

const LienStatistiques: React.FC = () => (
  <a
    href="https://vercel.com/yodea007s-projects/koren-web/analytics"
    target="_blank"
    rel="noopener noreferrer"
    className="nav__link"
    style={{ display: 'flex', alignItems: 'center', gap: 6 }}
  >
    📈 Statistiques de visite ↗
  </a>
)

export default LienStatistiques
