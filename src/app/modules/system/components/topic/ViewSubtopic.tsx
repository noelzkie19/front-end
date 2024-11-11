import React from 'react'

interface Props {
    value: number
}

const ViewSubtopic: React.FC<Props> = ( props ) => {

    const buttonClicked = () => {
        alert('topic ID is '+ props.value)
    }

    return (
        <>
            <button type="button" className="btn btn-outline-info btn-sm" onClick={() => buttonClicked()} data-bs-trigger="hover" data-bs-toggle="popover" title="View Sub Topics" >View Subtopic</button>
        </>
    )
}

export default ViewSubtopic
