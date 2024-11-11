import React, { useEffect } from 'react'
import { useLocation } from 'react-router'
import clsx from 'clsx'
import { useLayout } from '../core'
import { DrawerComponent } from '../../assets/ts/components'

const Content: React.FC = ({ children }) => {
  const { classes } = useLayout()
  const location = useLocation()
  useEffect(() => {
    DrawerComponent.hideAll()
  }, [location])

  return (
    <div id='kt_content_container' className='container mx-2' style={{ maxWidth: '100%' }}>
      {children}
    </div>
  )
}

export { Content }
