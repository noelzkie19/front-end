import React from 'react'

const ButtonsContainer: React.FC = ( props ) => {
    return <div className="d-flex my-4 align-items-center">{props.children}</div>
}

export default ButtonsContainer
