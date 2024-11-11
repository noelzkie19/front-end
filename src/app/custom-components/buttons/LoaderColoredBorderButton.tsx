import React from 'react'

interface Props {
    loading: boolean
    title: string
    loadingTitle: string
    disabled: boolean
    access?:boolean
}

const coloredBorder = {
    "border": "1px solid #009EF7",
    "minWidth": "90px"
}

const LoaderColoredBorderButton: React.FC<Props> = ({ title,loading,loadingTitle,disabled,access }) => {
    return (
        <>
        {access === true ?
        <button type='submit' className="btn btn-outline-primary btn-sm me-2" style={coloredBorder} disabled={disabled}>
            {!loading && <span className='indicator-label'>{ title }</span>}
            {loading && (
                <span className='indicator-progress' style={{ display: 'block' }}>
                    { loadingTitle }
                    <span className='spinner-border spinner-border-sm align-middle ms-2'></span>
                </span>
            )}
        </button> : null
        }
        </>
    )
}

export default LoaderColoredBorderButton
