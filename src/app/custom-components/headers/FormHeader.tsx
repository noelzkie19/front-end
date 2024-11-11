import React, {ReactNode} from 'react';

interface headerOptions {
    headerLabel: string;
    additionalElements?: ReactNode;
    additionalElementPlacement?: any;
}

const FormHeader: React.FC<headerOptions> = ({headerLabel, additionalElements, additionalElementPlacement }) => {
    return (
        <div
          className='card-header cursor-pointer'
          role='button'
          data-bs-toggle='collapse'
          data-bs-target='#kt_account_deactivate'
          aria-expanded='true'
          aria-controls='kt_account_deactivate'
        >
          <div className='card-title m-0' style={ additionalElementPlacement === 'left'
                                                  ? { justifyContent: 'space-between', width: '100%' }
                                                  : {}
                                              }>
            <h5 className='fw-bolder m-0'>{headerLabel}</h5>

            {additionalElements && (
              <div className='additional-elements'>{additionalElements}</div>
            )}
          </div>

          
        </div>
    )
}

export default FormHeader
