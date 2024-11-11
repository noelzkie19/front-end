import React from 'react'
import { AlertLabelModel } from '../models/AlertLabelModel'

interface Props {
    alert? : AlertLabelModel
}

const AlertLabel: React.FC<Props> = ({ alert }) => {
    return (
        <>
          { alert != null && alert.hasAlert === true ?
            <div className={'mb-lg-15 alert alert-' + alert.status}>
              <div className='alert-text font-weight-bold'>
                {alert.message}
              </div>
            </div>
          :
            null
          }
        </>
    )
}

export default AlertLabel
