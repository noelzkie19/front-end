import React from 'react'

interface Props {
    access: boolean
    title: string
    onClick: () => void
    isDisable: boolean
}

const DisabledButton: React.FC<Props> = ({ access, title, onClick, isDisable}) => {
    return (<>{access === true ? <button type='button' className="btn btn-dark btn-sm me-2" onClick={onClick} disabled={isDisable}>{title}</button> : null}</>)
}

export default DisabledButton
