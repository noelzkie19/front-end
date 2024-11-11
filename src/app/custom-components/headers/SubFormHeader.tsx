import React from 'react'

interface headerOptions {
    headerLabel: string;
}

const SubFormHeader: React.FC<headerOptions> = ({ headerLabel }) => {
    return (
        <div
            className='card-header'
        >
            <div className='card-title'>
                <label className='fs-bolder'>{headerLabel}</label>
            </div>
        </div>
    )
}

export default SubFormHeader
