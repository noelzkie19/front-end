import React from 'react'

interface Props {
    access: boolean
    title: string
    onClick: () => void
    isDisable?:boolean
}

const SuccessButton: React.FC<Props> = ({ access, title, onClick, isDisable}) => {
        return (<>{access === true ? <button type='button' className="btn btn-success btn-sm me-2" disabled={isDisable} onClick={onClick}>{title}</button> : null}</>)
}

export default SuccessButton
