import {useEffect, useState} from 'react'
import {DefaultDatePicker} from '../../../../custom-components'
import {TicketFieldSizes} from '../../constants/useConstant'
import {DynamicTicketModel} from '../../models/ticket-config/DynamicTicketModel'
import {useTicketManagementHooks} from '../hooks/useTicketManagementHooks'

const DatetimePicker = ({ field, dynamicTicketForm, updateDynamicTicket, currentTicketId, viewOnly, defaultSize }: any) => {
  const [selectedDate, setSelectedDate] = useState<any>();
  const [isDisabled, setIsDisabled] = useState<boolean>(false)
  const [requiredField, setRequiredField] = useState<boolean>(false);
  const {formatFieldSelector } = useTicketManagementHooks();
  
  const onChangeSelectedDate = (val: any) => {
    updateDynamicTicket(field.fieldId, val)
    setSelectedDate(val);
  }
  useEffect(() => {
    if (!dynamicTicketForm || dynamicTicketForm.length === 0) return
    const isDateTimeRequired = field.isSupersedeOptional !== undefined ? false : field.isRequired
    setRequiredField(isDateTimeRequired) 
    let findDynamicRecord = dynamicTicketForm.find((record: DynamicTicketModel) => record.fieldMappingId === field.fieldMappingId)
    const isDynamicDateTimeRequired = findDynamicRecord.isSupersedeOptional !== undefined ? false : findDynamicRecord.fieldRequired 
    setRequiredField(isDynamicDateTimeRequired) 
    if (!findDynamicRecord) return
    if (findDynamicRecord.fieldValue === '') {
      setSelectedDate('')
    }
    if (!findDynamicRecord.fieldValue) return
    setSelectedDate(new Date(findDynamicRecord.fieldValue))
    if (!findDynamicRecord.fieldActive) {
      setIsDisabled(true)
    }
    return () => { }
  }, [dynamicTicketForm])

  useEffect(() => {
    setIsDisabled(viewOnly)
    return () => {
    }
  }, [viewOnly])

  useEffect(() => {
    if (field.fieldConstraint === null) return
    if (currentTicketId !== 0) { // Guard Clause so logic would not proceed on AddTickeForm
      if (viewOnly) return // Guard Clause so logic would not proceed on ViewTickeForm
      const getConstraints = JSON.parse(field.fieldConstraint)
      const isActiveConstraints = getConstraints.hasOwnProperty("ActiveOnEdit") // confirm if specific property exists
      if (isActiveConstraints) {
        setIsDisabled(!getConstraints['ActiveOnEdit'])
      }
    }
    return () => { }
  }, [field])


  return (
    <div id={formatFieldSelector(field.fieldMappingId,field.fieldName)}  aria-label={`${field.fieldMappingId}-${field.fieldName}`} className={TicketFieldSizes[(defaultSize) ? "Default" :  field.fieldSizeName as keyof typeof TicketFieldSizes]}>
      <div className={`col-form-label col-sm ${requiredField && 'required'}`}>{field.fieldName}</div>
      <DefaultDatePicker
        format='dd/MM/yyyy HH:mm:ss'
        onChange={onChangeSelectedDate}
        value={selectedDate}
        disabled={isDisabled}
      />
    </div>
  )
}

export default DatetimePicker