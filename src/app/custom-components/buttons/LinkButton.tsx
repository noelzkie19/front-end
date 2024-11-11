import React from 'react'
import button from 'react-bootstrap'

interface Props {
    title: string
    onClick: () => void
    hoverTitle?: string
}

const LinkButton: React.FC<Props> = ({ title, onClick, hoverTitle }) => {
    return (
        <div>
            <button type="button" className="btn btn-outline-info btn-sm" onClick={onClick} data-bs-trigger="hover" data-bs-toggle="popover" title={hoverTitle} >{title}</button>
        </div>
    )
}

export default LinkButton
