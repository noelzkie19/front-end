import React from 'react'

interface Props {
    onSubmit: () => void;
    onReset?: () => void;
}

const FormContainer: React.FC<Props> = ( {onSubmit, onReset, ...props}) => {
    return (
            <form className='form w-100' onSubmit={onSubmit} onReset={onReset} noValidate autoComplete='off'>
                {props.children}
            </form>
    )
}

export default FormContainer
