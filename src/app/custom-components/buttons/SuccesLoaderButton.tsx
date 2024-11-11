import React from 'react'

interface Props {
    loading: boolean
    title: string
    loadingTitle: string
    disabled: boolean
    onClick? : () => void
}

const SuccesLoaderButton: React.FC<Props> = ({ title,loading,loadingTitle,disabled,onClick }) => {
    return (
        <button type='submit' className="btn btn-primary btn-sm me-2" disabled={disabled} onClick={onClick}>
            {!loading && <span className='indicator-label'>{ title }</span>}
            {loading && (
                <span className='indicator-progress' style={{ display: 'block' }}>
                    { loadingTitle }
                    <span className='spinner-border spinner-border-sm align-middle ms-2'></span>
                </span>
            )}
        </button>
    )
}

export default SuccesLoaderButton
