import React from 'react'
import { Button } from 'react-bootstrap-v5'

interface Props {
    access: boolean
    title: string
    onClick: () => void
    isDisable:boolean
}

const OutlinePrimaryButton: React.FC<Props> = ({ access, title, onClick, isDisable}) => {
        return (<>{access === true ? <button style={{ borderWidth: 1, borderStyle:'solid', borderColor: '#009EF7'}} type='button' className="btn btn-outline-primary btn-sm me-3" disabled={isDisable} onClick={onClick}>{title}</button> : null}</>)
}

export default OutlinePrimaryButton
