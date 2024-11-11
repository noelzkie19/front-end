import React from 'react'

interface Props {
    access: boolean
    title: string
    onClick: () => void
}



const CallToActionButton: React.FC<Props> = ({ access, title, onClick }) => {
    return (<>{access === true ? <button type='button' className="btn btn-primary btn-sm me-2" onClick={onClick}>{title}</button> : null}</>)
}

export default CallToActionButton
