import React from 'react'

interface Props {
    access: boolean
    title: string
    onClick: () => void
}

const DefaultSubmitButton: React.FC<Props> = ({ access, title, onClick }) => {
    return (<>{access === true ? <button type='submit' className="btn btn-dark btn-sm me-2" onClick={onClick}>{title}</button> : null}</>)
}

export default DefaultSubmitButton
