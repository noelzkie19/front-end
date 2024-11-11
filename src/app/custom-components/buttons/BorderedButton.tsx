import React from 'react'

interface Props {
    access: boolean
    title: string
    onClick: () => void
    isColored?: boolean
    isDisabled?: boolean
}

const adjustButton = {
    "minWidth": "90px"
}

const coloredBorder = {
    "border": "1px solid #28adf8",
    // "color": "#28adf8",
}

const grayBorder = {
    "border": "1px solid #6a6a6a",
     "color": "#0e0e0e",
}




const BorderedButton: React.FC<Props> = ({ access, title, onClick, isColored, isDisabled }) => {
    return (<>{access === true ? 
        <button type='button' 
            className={`btn ${isColored ? 'btn-primary': 'btn-outline-secondary'} btn-sm me-2`} disabled={isDisabled} style={ isColored ? {...adjustButton, ...coloredBorder} : {...adjustButton, ...grayBorder}} 
        onClick={onClick}>{title}</button> : null}</>)
}

export default BorderedButton
