import React from 'react'

interface TicketContainerProps {
    children: any,
    color: string
}

const TicketManagementContainer = ({children, color}: TicketContainerProps) => {
  return (
    <div className='card card-custom' style={{backgroundColor: `${color}`}}>{children}</div>
  )
}

export default TicketManagementContainer