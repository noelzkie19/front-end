import React from 'react'

const SideContainer: React.FC = (props) => {
    return (
        <div className="card bg-light">{props.children}</div>
    )
}

export default SideContainer


