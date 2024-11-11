import React from 'react'
import { Button } from 'react-bootstrap-v5'

interface Props {
    access: boolean
    title: string
    onClick: () => void
    disabled: boolean 
}

const GridLinkButton: React.FC<Props> = ({access,title,onClick,disabled}) => {
    return (
        <>
            {access === true? <Button variant="link" onClick={onClick} disabled={disabled}>{title}</Button> : null}    
        </>
    )
}

export default GridLinkButton
