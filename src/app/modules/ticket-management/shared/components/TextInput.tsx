import {useEffect, useState} from 'react'
import {TicketFieldSizes} from '../../constants/useConstant'
import {useTicketManagementHooks} from '../hooks/useTicketManagementHooks'

const TextInput = ({ field, dynamicTicketForm, updateDynamicTicket, currentTicketId, viewOnly , fromModal, defaultSize }: any) => {
  const [inputValue, setInputValue] = useState<string>("")
  const [isDisabled, setIsDisabled] = useState<boolean>(false)
  const [labelColor, setLabelColor] = useState<string>()
  const [requiredField, setRequiredField] = useState<boolean>(false);

  const {formatFieldSelector } = useTicketManagementHooks();
  useEffect(() => {
    if (field.fieldConstraint === null) return
    if (currentTicketId !== 0) { // Guard Clause so logic would not proceed on AddTickeForm
      if (viewOnly) return // Guard Clause so logic would not proceed on ViewTickeForm
      const getConstraints = JSON.parse(field.fieldConstraint)
      const isActiveConstraints = getConstraints.hasOwnProperty("ActiveOnEdit") // confirm if specific property exists
      const isActiveModal = getConstraints.hasOwnProperty("ActiveOnModal")
      if (isActiveConstraints) {
        setIsDisabled(!getConstraints['ActiveOnEdit'])
      }

      if(isActiveModal && fromModal){
        setIsDisabled(false)
      }
    }

    if(field.isSupersedeOptional !== undefined) 
    {
      setRequiredField(false)
    }

    return () => { }
  }, [field])

  useEffect(() => {
    if (!dynamicTicketForm || dynamicTicketForm.length === 0) return
    const isTextInputFieldRequired = field.isSupersedeOptional !== undefined ? false : field.isRequired
    setRequiredField(isTextInputFieldRequired)
    let findDynamicRecord = dynamicTicketForm.find((record: any) => record.fieldMappingId === field.fieldMappingId)
    if (!findDynamicRecord) return
    if (findDynamicRecord.fieldValue === '') {
      setInputValue('')
    }
    if (!findDynamicRecord.fieldValue) return
    setInputValue(findDynamicRecord.fieldValue)
    
    const isDynamicTextInputRequired = findDynamicRecord.isSupersedeOptional !== undefined ? false : findDynamicRecord.fieldRequired 
    setRequiredField(isDynamicTextInputRequired) 
    if(!fromModal) {
      setIsDisabled(!findDynamicRecord.fieldActive)
      if (viewOnly) {
        setIsDisabled(true)
        return
      } 
      activeConstraintsImplementation(findDynamicRecord)
      
    }
    return () => { }
  }, [dynamicTicketForm])

  const activeConstraintsImplementation = ( findDynamicRecord: any) => {
    if (currentTicketId === 0) return //Active On Edit should not trigger on Add Ticket 
    const getConstraints = JSON.parse(field.fieldConstraint)
    const isActiveConstraints = getConstraints.hasOwnProperty("ActiveOnEdit") 
    if (isActiveConstraints) {
      setIsDisabled(!getConstraints['ActiveOnEdit'])
    } else {
      !findDynamicRecord.fieldActive ? setIsDisabled(true) : setIsDisabled(!findDynamicRecord.fieldActive)
    }
  }

 

  useEffect(() => {
    if (field.fieldConstraint === null) return
    if (currentTicketId !== 0) { // Guard Clause so logic would not proceed on AddTickeForm
      if (viewOnly) return // Guard Clause so logic would not proceed on ViewTickeForm
      const getConstraints = JSON.parse(field.fieldConstraint)
      const getCodeConstraints = getConstraints.hasOwnProperty("EmphasisCode") // confirm if specific property exists
      if (getCodeConstraints) {
        setLabelColor(`text-${getConstraints['EmphasisCode']}`)
      }
    }
    return () => { }
  }, [field])


  const onChangeTextInput = (e: any) => {
    //Text Input Constraints Logic
    const getConstraints = JSON.parse(field.fieldConstraint)
    if (getConstraints !== null) {
      const maxLengthConstraint = getConstraints.hasOwnProperty("MaxLength")
      if (maxLengthConstraint) {
        if (e.currentTarget.value.length > getConstraints["MaxLength"]) return
      }
    }
    //Text Input Constraints Logic
    setInputValue(e.currentTarget.value)
    updateDynamicTicket(field.fieldId, e.currentTarget.value)

    // setIsDisabled(false)

  }

  useEffect(() => {
    if (!viewOnly) return

    if(!fromModal) {      
      setIsDisabled(true)
    }
    return () => { }
  }, [viewOnly])
  return (
    <div id={formatFieldSelector(field.fieldMappingId,field.fieldName)} aria-label={`${field.fieldMappingId}-${field.fieldName}`} className={TicketFieldSizes[(fromModal || defaultSize) ? "Default" : field.fieldSizeName as keyof typeof TicketFieldSizes]}>
      <div className={`col-form-label col-sm ${requiredField && 'required'} ${labelColor ?? ''}`} >{field.fieldName}</div>
      <input
        type='text'
        className='form-control form-control-sm w-100'
        style={{
          paddingTop: '0'
        }}
        onChange={onChangeTextInput}
        disabled={isDisabled}
        value={inputValue}
      />
    </div>
  )
}

export default TextInput