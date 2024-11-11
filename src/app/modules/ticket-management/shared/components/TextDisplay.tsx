import React, {useEffect, useState} from 'react'
import {TicketFieldSizes} from '../../constants/useConstant'
import {DynamicTicketModel} from '../../models/ticket-config/DynamicTicketModel'
import {useTicketManagementHooks} from '../hooks/useTicketManagementHooks'

const TextDisplay = ({ field, dynamicTicketForm, currentTicketId, viewOnly, defaultSize }: any) => {
  const [textValue, setTextValue] = useState<string>("")
  const [labelColor, setLabelColor] = useState<string>()
  const [requiredField, setRequiredField] = useState<boolean>(false);
  const {formatFieldSelector } = useTicketManagementHooks();
  const [isVisible, setIsVisible] = useState<boolean>(true);
  
  useEffect(() => {
    if (!dynamicTicketForm || dynamicTicketForm.length === 0) return
    const isTextRequired = field.isSupersedeOptional !== undefined ? false : field.isRequired
    setRequiredField(isTextRequired) 
    let findDynamicRecord = dynamicTicketForm.find((record: DynamicTicketModel) => record.fieldMappingId === field.fieldMappingId)
    const isDynamicTextRequired = findDynamicRecord.isSupersedeOptional !== undefined ? false : findDynamicRecord.fieldRequired 
    setRequiredField(isDynamicTextRequired) 
    if (!findDynamicRecord) return
    if (findDynamicRecord.fieldValue === '') {
      setTextValue('')
    }
    if (!findDynamicRecord.fieldValue) return
    setTextValue(findDynamicRecord.fieldValue)
    return () => { }
  }, [dynamicTicketForm])


  useEffect(() => {
    if (field.fieldConstraint === null) return

    const getConstraints = JSON.parse(field.fieldConstraint)
    const getCodeConstraints = getConstraints.hasOwnProperty("EmphasisCode") // confirm if specific property exists
    const isVisible = getConstraints.hasOwnProperty("IsVisible")

    if(isVisible) {
      setIsVisible(getConstraints['IsVisible'])
    }

    if (currentTicketId !== 0) { // Guard Clause so logic would not proceed on AddTickeForm
      if (viewOnly) return // Guard Clause so logic would not proceed on ViewTickeForm
    
      if (getCodeConstraints) {
        setLabelColor(`text-${getConstraints['EmphasisCode']}`)
      }

    }
  

    if(field.isSupersedeOptional !== undefined) 
    {
      setRequiredField(false)
    }
    return () => { }
  }, [field])

  return (

  
    <div id={formatFieldSelector(field.fieldMappingId,field.fieldName)} aria-label={`${field.fieldMappingId}-${field.fieldName}`} className={TicketFieldSizes[(defaultSize) ? "Default" : field.fieldSizeName as keyof typeof TicketFieldSizes]}>
     

     {isVisible && (
          <div>
            <div className={`col-form-label col-sm ${requiredField ? 'required' : ''} ${labelColor || ''}`}>
              {field.fieldName}
            </div>
            <input
              type='text'
              className='form-control form-control-sm w-100'
              style={{ paddingTop: '0' }}
              disabled={true}
              value={textValue}
            />
          </div>
        )}
    </div>
  )
}

export default TextDisplay