import React from 'react'

interface Props {
    loading: boolean
    title: string
    loadingTitle: string
    disabled: boolean
    access?:boolean
}

const LoaderButton: React.FC<Props> = ({ title,loading,loadingTitle,disabled,access }) => {
    return (
        <>
        {access === true ?
        <button type='submit' className="btn btn-primary btn-sm me-2" disabled={disabled}>
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

export default LoaderButton
