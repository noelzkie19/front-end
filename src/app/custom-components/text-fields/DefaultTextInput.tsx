import React from 'react'
import { string } from 'yup/lib/locale'

interface Props {
    ariaLabel: string
    disabled?: boolean | undefined
}

const DefaultTextInput: React.FC<Props> = ({ariaLabel,disabled,...props}) => {
    return (
        <div className="col-sm-10">
            <input type="text" className="form-control form-control-sm" aria-label={ariaLabel}
                { ...props}
                disabled={disabled}
            />
        </div>
    )
}

export default DefaultTextInput
