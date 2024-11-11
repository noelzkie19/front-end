import React from 'react'

const PaddedContainer: React.FC = (props) => {
    return <div className='d-flex'>{props.children}</div>
}

export default PaddedContainer
