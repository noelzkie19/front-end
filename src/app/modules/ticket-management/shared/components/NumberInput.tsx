import {useEffect, useState} from 'react'
import {TicketFieldSizes} from '../../constants/useConstant'
import {DynamicTicketModel} from '../../models/ticket-config/DynamicTicketModel'
import {countDecimalCharacters} from '../../utils/helper'
import {useTicketManagementHooks} from '../hooks/useTicketManagementHooks'

const NumberInput = ({ fields, dynamicTicketForm, updateDynamicTicket, currentTicketId, viewOnly , showForModal, defaultSize }: any) => {
  const [numberInput, setNumberInput] = useState<string>()
  const [isDisabled, setIsDisabled] = useState<boolean>(false)
  const [labelColor, setLabelColor] = useState<string>()
  const [requiredField, setRequiredField] = useState<boolean>(false);
  
  const {formatFieldSelector } = useTicketManagementHooks();

  const onChangeNumberInput = (event: any) => {
    let numericValue = event.target.value.replace(/[^0-9.]/g, '');
    // Replace consecutive dots with a single dot
    numericValue = numericValue.replace(/(\.\.+)/g, '.');
    // Ensure at most one decimal point
    const parts = numericValue.split('.');
    if (parts.length > 2) {
      numericValue = parts[0] + '.' + parts.slice(1).join('');
    }

    const getConstraints = JSON.parse(fields.fieldConstraint)
    const injectDecimalConstraint = countDecimalCharacters(numericValue, getConstraints)
    if (injectDecimalConstraint) return

    setNumberInput(numericValue.trim())
    updateDynamicTicket(fields.fieldId, numericValue.trim())
  }

  useEffect(() => {
    if (!viewOnly) return
    setIsDisabled(true)
    return () => { }
  }, [viewOnly])

  useEffect(() => {
    if (fields.fieldConstraint === null) return
    if (currentTicketId !== 0) { // Guard Clause so logic would not proceed on AddTickeForm
      if (viewOnly) return // Guard Clause so logic would not proceed on ViewTickeForm
      const getConstraints = JSON.parse(fields.fieldConstraint)
      const getCodeConstraints = getConstraints?.hasOwnProperty("EmphasisCode") // confirm if specific property exists
      if (getCodeConstraints) {
        setLabelColor(`text-${getConstraints['EmphasisCode']}`)
      }
      const isActiveConstraints = getConstraints?.hasOwnProperty("ActiveOnEdit") // confirm if specific property exists
      const isActiveModal = getConstraints?.hasOwnProperty("ActiveOnModal")
      if (isActiveConstraints) {        
        setIsDisabled(!getConstraints['ActiveOnEdit'])
      }

      if(isActiveModal && showForModal){
        setIsDisabled(false)
      }
    }

    // Supersede required to optional fields\
    if(fields.isSupersedeOptional !== undefined) 
    {
      setRequiredField(false)
    }

    return () => { }
  }, [fields])

  useEffect(() => {
    if (!dynamicTicketForm || dynamicTicketForm.length === 0) return

    const isFieldRequired = fields.isSupersedeOptional !== undefined ? false : fields.isRequired
    setRequiredField(isFieldRequired)
    let findDynamicRecord = dynamicTicketForm.find((record: DynamicTicketModel) => record.fieldMappingId === fields.fieldMappingId)

    if (!findDynamicRecord) return
    
    if (!findDynamicRecord.fieldValue) return

    
    const isDynamicRequired = findDynamicRecord.isSupersedeOptional !== undefined ? false : findDynamicRecord.fieldRequired 
    setRequiredField(isDynamicRequired)
    setNumberInput(findDynamicRecord.fieldValue)
    
    if(!showForModal){
      setIsDisabled(!findDynamicRecord.fieldActive)
      if (viewOnly) {
        setIsDisabled(true)
        return
      } 
      activeConstraintsImplementation(findDynamicRecord)
    }

    return () => { }
  }, [dynamicTicketForm])

  const activeConstraintsImplementation = (findDynamicRecord: DynamicTicketModel) => {
    if (currentTicketId === 0) return //Active On Edit should not trigger on Add Ticket 
    const getConstraints = JSON.parse(fields.fieldConstraint)
    const isActiveConstraints = getConstraints?.hasOwnProperty("ActiveOnEdit") 
    if (isActiveConstraints) {
      setIsDisabled(!getConstraints['ActiveOnEdit'])
    } else {
      !findDynamicRecord.fieldActive ? setIsDisabled(true) : setIsDisabled(!findDynamicRecord.fieldActive)
    }
  }

  
  return (
    <div id={formatFieldSelector(fields.fieldMappingId,fields.fieldName)}  className={TicketFieldSizes[(showForModal || defaultSize) ? "Default" :fields.fieldSizeName as keyof typeof TicketFieldSizes]}>
      <div className={`col-form-label col-sm ${requiredField && 'required'}  ${labelColor ?? ''}`} >{fields.fieldName}</div>
      <input
        aria-label={`${fields.fieldMappingId}-${fields.fieldName}`}
        className='w-100 border border-secondary border-1 form-control form-control-sm'
        type='text'
        value={numberInput}
        disabled={isDisabled}        
        onChange={(event: any) => { onChangeNumberInput(event) }}>          
      </input>
    </div>
  )
}

export default NumberInput