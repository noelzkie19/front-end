import React, { Component } from 'react'
type Props = {
    toggle: boolean
    toggleHandle: () => void
    filterComponent: React.ReactNode
    contentComponent: React.ReactNode
}
const FilterDrawerContainer : React.FC<Props> = (props: Props) => {

    return (
        <div className="d-flex flex-column flex-lg-row">
            <div className={ props.toggle ? 'flex-column flex-lg-row-auto w-100 w-lg-300px w-xxl-350px mb-8 mb-lg-0 me-lg-3 me-5' : 'flex-column flex-lg-row-auto w-100 w-lg-250px w-xxl-325px mb-8 mb-lg-0 me-lg-3 me-5 mlab-custom-hide' }>
                {props.filterComponent}
            </div>
            <div className="flex-lg-row-fluid">
                {props.contentComponent}
            </div>
        </div>
    )
}


export default FilterDrawerContainer