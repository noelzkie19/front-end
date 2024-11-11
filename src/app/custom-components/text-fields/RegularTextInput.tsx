import React from 'react'

interface Props {
    ariaLabel: string
    disabled?: boolean | undefined
}

const RegularTextInput: React.FC<Props> = ({ariaLabel,disabled,...props}) => {
    return (
        <input type="text" className="form-control form-control-sm" aria-label={ariaLabel}
            { ...props}
            disabled={disabled}
        />
    )
}

export default RegularTextInput
