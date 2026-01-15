import { Banner } from '@payloadcms/ui/elements/Banner'
import React from 'react'

import './index.scss'

const baseClass = 'before-dashboard'

const BeforeDashboard: React.FC = () => {
  return (
    <div className={baseClass}>
      <Banner className={`${baseClass}__banner`} type="success">
        <h4>Welcome to your dashboard!</h4>
      </Banner>
      <div className="row">
        <a href="/admin/system">Go to system</a>
        <span>|</span>
        <a href="/" target="_blank">
          Visit your website
        </a>
        <span>|</span>
        <a href="https://payloadcms.com/docs/getting-started/what-is-payload" target="_blank">
          Visit payload docs
        </a>
      </div>
    </div>
  )
}

export default BeforeDashboard
