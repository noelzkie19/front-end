import { useEffect, useState } from 'react'
import { TicketFieldSizes } from '../../constants/useConstant'
import { DynamicTicketModel } from '../../models/ticket-config/DynamicTicketModel'
import { formatCurrencyValue } from '../../utils/helper'
import { useTicketManagementHooks } from '../hooks/useTicketManagementHooks'

const CurrencyInput = ({ fields, dynamicTicketForm, updateDynamicTicket, currentTicketId, viewOnly, showForModal, defaultSize }: any) => {
  const [currencyInput, setCurrencyInput] = useState<string>("");
  const [requiredField, setRequiredField] = useState<boolean>(false);
  const [isDisabled, setIsDisabled] = useState<boolean>(false);
  const inputMaxLength = 16;

  const { formatFieldSelector } = useTicketManagementHooks();

  const onChangeCurrencyInput = (event: any) => {
    const currencyValue = event.target.value.replace(/[^0-9.]/g, '')
    const currencyWithoutComma =  removeCommaFromCurrency(currencyValue); // remove comma
    const wholeNumberLength = currencyWithoutComma.split('.')[0]; //count whole number
    if (wholeNumberLength.length <= inputMaxLength) {
      setCurrencyInput(currencyValue.trim())
    }
  }

  useEffect(() => {
    if (!viewOnly) return
    setIsDisabled(true)
    return () => { }
  }, [viewOnly])

  useEffect(() => {
    if (!fields.fieldConstraint || currentTicketId === 0 || viewOnly) return;
    const constraints = JSON.parse(fields.fieldConstraint);
    if (constraints?.ActiveOnEdit !== undefined) {
      setIsDisabled(!constraints.ActiveOnEdit);
    }
  
    if (constraints?.ActiveOnModal && showForModal) {
      setIsDisabled(false);
    }
  
    if (fields.isSupersedeOptional !== undefined) {
      setRequiredField(false);
    }
  }, [fields]);

  useEffect(() => {
    if (!dynamicTicketForm || dynamicTicketForm.length === 0) return;
  
    const isRequired = fields.isSupersedeOptional === undefined && fields.isRequired;
    setRequiredField(isRequired);
  
    const dynamicForm = dynamicTicketForm.find((d: DynamicTicketModel) => d.fieldMappingId === fields.fieldMappingId
    );
  
    if (!dynamicForm || !dynamicForm.fieldValue) return;
  
    const isRquired = dynamicForm.isSupersedeOptional === undefined && dynamicForm.fieldRequired;
    setRequiredField(isRquired);
    const unformattedCurrency = removeCommaFromCurrency(dynamicForm.fieldValue);
    setCurrencyInput(getFormattedValue(unformattedCurrency));
  
    if (!showForModal) {
      setIsDisabled(!dynamicForm.fieldActive || viewOnly);
      if (!viewOnly) {
        activeConstraints(dynamicForm);
      }
    }
  }, [dynamicTicketForm]);

  const activeConstraints = (dynamicForm: DynamicTicketModel) => {
    if (currentTicketId === 0) return 
    const fieldConstraints = JSON.parse(fields.fieldConstraint)
    const isActive = fieldConstraints?.hasOwnProperty("ActiveOnEdit")
    if (isActive) {
      setIsDisabled(!fieldConstraints['ActiveOnEdit'])
    } else {
      !dynamicForm.fieldActive ? setIsDisabled(true) : setIsDisabled(!dynamicForm.fieldActive)
    }
  }

  const handleOnBlur = () => {
    const currencyWithoutComma =  removeCommaFromCurrency(currencyInput); // remove comma
    
    updateDynamicTicket(fields.fieldId, currencyWithoutComma.trim());
    setCurrencyInput(getFormattedValue(currencyWithoutComma));
  }

  const getFormattedValue = (currencyInput: any) => {
    const getConstraints = JSON.parse(fields.fieldConstraint)
    const formattedCurrencyValue = currencyInput === "" ? "" : formatCurrencyValue(currencyInput, getConstraints['DecimalPlace'])

    return formattedCurrencyValue
  }

  const removeCommaFromCurrency = (currencyInput: any) => {
    const currencyValue = currencyInput.replace(/,/g, '');
    return currencyValue;
  }

  return (
    <div id={formatFieldSelector(fields.fieldMappingId, fields.fieldName)} className={TicketFieldSizes[(showForModal || defaultSize) ? "Default" : fields.fieldSizeName as keyof typeof TicketFieldSizes]}>
      <div className={`col-form-label col-sm ${requiredField && 'required'}`} >{fields.fieldName}</div>
      <input
        aria-label={`${fields.fieldMappingId}-${fields.fieldName}`}
        className='w-100 border border-secondary border-1 form-control form-control-sm'
        type='text'
        value={currencyInput}
        disabled={isDisabled}
        onChange={(event: any) => { onChangeCurrencyInput(event) }}
        onBlur={() => handleOnBlur()}
      >
      </input>
    </div>
  )
}

export default CurrencyInput