import { Banner } from '@payloadcms/ui/elements/Banner'
import Link from 'next/link'
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
        <a href="/" target="_blank">
          Visit your website
        </a>
        <span>|</span>
        <Link href="/admin/system">Go to system</Link>
        <span>|</span>
        <a href="https://github.com/payloadcms/payload" target="_blank">
          GitHub/Payload
        </a>
        <span>|</span>
        <a href="https://github.com/xc2f/www" target="_blank">
          GitHub/www
        </a>
      </div>
      {/* <SeedButton /> */}
    </div>
  )
}

export default BeforeDashboard
