import React from 'react'

const MainContainer: React.FC = ( props ) => {
    return (
        <div className='card card-custom'>{props.children}</div>
    )
}

export default MainContainer


