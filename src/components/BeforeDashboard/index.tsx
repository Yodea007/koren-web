import { Banner } from '@payloadcms/ui/elements/Banner'
import React from 'react'

import './index.scss'

const baseClass = 'before-dashboard'

const BeforeDashboard: React.FC = () => {
  return (
    <div className={baseClass}>
      <Banner className={`${baseClass}__banner`} type="success">
        <h4>Bienvenue dans l’administration Koren France</h4>
      </Banner>
      Gérez ici le catalogue (Livres, Lots, Auteurs), les pages, le blog et la newsletter.
    </div>
  )
}

export default BeforeDashboard
