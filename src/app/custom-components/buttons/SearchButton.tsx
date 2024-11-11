import React from 'react'

interface Props {
    access: boolean
    loading: boolean
    title: string
    loadingTitle: string
    onClick: () => void
}

const SearchButton: React.FC<Props> = ({ access, title, loading, loadingTitle, onClick }) => {
    return (
        access === true ?
        <button type="button" className="btn btn-dark btn-sm me-2" disabled={loading} onClick={onClick}>
            {!loading && <span className='indicator-label'>{ title }</span>}
            {loading && (
                <span className='indicator-progress' style={{ display: 'block' }}>
                    { loadingTitle }
                    <span className='spinner-border spinner-border-sm align-middle ms-2'></span>
                </span>
            )}
        </button> : null
    )
}

export default SearchButton
