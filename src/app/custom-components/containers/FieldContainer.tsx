import React, { ReactNode } from 'react'

interface Props {
    children?: ReactNode
}

const FieldContainer: React.FC<Props>  = ({children }) => {
    return( 
    <div className="row mb-3" >{children}</div>
    )
}

export default FieldContainer
