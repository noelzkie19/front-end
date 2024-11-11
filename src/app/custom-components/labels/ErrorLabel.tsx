import React from 'react'

interface Props {
    hasErrors : boolean
    errorMessage : string
}

const ErrorLabel: React.FC<Props> = ({ hasErrors, errorMessage}) => {
    return (
        <>
        {hasErrors === true ?
            <div className='mb-lg-15 alert alert-danger'>
              <div className='alert-text font-weight-bold'>
                {errorMessage}
              </div>
            </div>
          :
            null
          }
        </>
    )
}

export default ErrorLabel
