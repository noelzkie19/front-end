import {faSearch} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import React, {useEffect, useState} from 'react';
import swal from 'sweetalert';
import useConstant from '../../../../constants/useConstant';
import {TicketFieldSizes} from '../../constants/useConstant';
import {DynamicTicketModel} from '../../models/ticket-config/DynamicTicketModel';
import {getTransactionIdValidationByTicket} from '../../services/TicketManagementApi';
import {useTicketManagementHooks} from '../hooks/useTicketManagementHooks';

const TextInputWithSearch = ({ fields, handleTextInputSearching, dynamicTicketForm, updateDynamicTicket, viewOnly, updateTextInputSearchValidation, stateData, fromModal, defaultSize }: any) => {
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchValue, setSearchValue] = useState<string>('');
  const [isDisabled, setIsDisabled] = useState<boolean>(false);
  const { SwalServerErrorMessage, successResponse } = useConstant();
  const [requiredField, setRequiredField] = useState<boolean>(false);
  const {formatFieldSelector } = useTicketManagementHooks();
  const handleTextInputSearch = async () => {
    if (isDisabled) return
    setIsSearching(true)
    if (stateData.ticketId === 0) {
      getExistingTransactionsByTicket(searchValue, stateData.ticketTypeId, fields.fieldId)
    } else {
      handleTextInputSearching(fields.fieldId, searchValue.trim())
      setIsSearching(false)
    }
  }

  useEffect(() => {
    if (!viewOnly) return
    setIsDisabled(true)
    return () => { }
  }, [viewOnly])

  useEffect(() => {
    if (fields.fieldConstraint === null) return
    if (stateData.ticketId !== 0) { // Guard Clause so logic would not proceed on AddTickeForm
      if (viewOnly) return // Guard Clause so logic would not proceed on ViewTickeForm
      const getConstraints = JSON.parse(fields.fieldConstraint)
      const isOptionalEditable = fields.isSupersedeOptional 
      const optionalHasValue = dynamicTicketForm.find((record: DynamicTicketModel) => record.fieldMappingId === fields.fieldMappingId)
      const disableOptional = !isOptionalEditable && optionalHasValue?.fieldValue != null
      const isActiveConstraints = getConstraints.hasOwnProperty("ActiveOnEdit") // confirm if specific property exists
      if (isActiveConstraints) {
        // setIsDisabled(!getConstraints['ActiveOnEdit'])
        setIsDisabled(!getConstraints['ActiveOnEdit'] && disableOptional)
      }
    }
    if(fields.isSupersedeOptional !== undefined) 
    {
      setRequiredField(false)
    }
    return () => { }
  }, [fields])

  useEffect(() => {
    if (!dynamicTicketForm || dynamicTicketForm.length === 0) return
    setIsSearching(false)
    const isFieldRequired = fields.isSupersedeOptional !== undefined ? false : fields.isRequired

    setRequiredField(isFieldRequired) 
    let findDynamicRecord = dynamicTicketForm.find((record: DynamicTicketModel) => record.fieldMappingId === fields.fieldMappingId)
    
    const isDynamicRequired = findDynamicRecord.isSupersedeOptional !== undefined ? false : findDynamicRecord.fieldRequired 
    setRequiredField(isDynamicRequired) 
    if (!findDynamicRecord) return
    if (findDynamicRecord.fieldValue === '' || findDynamicRecord.fieldValue === null) {
      setSearchValue('')
    }
    if (!findDynamicRecord.fieldValue) return
    if (findDynamicRecord.fieldValue.trim() === "") return
    setSearchValue(findDynamicRecord.fieldValue)
    if (!findDynamicRecord.fieldActive) {
      setIsDisabled(true)
    } else {
      setIsDisabled(viewOnly ?? !findDynamicRecord.fieldActive)
    }
    return () => { }
  }, [dynamicTicketForm])

  const onChangeSearchInput = (e: any) => {
    setSearchValue(e.currentTarget.value)
    updateDynamicTicket(fields.fieldId, e.currentTarget.value)
    updateTextInputSearchValidation(fields.fieldMappingId)
  }

  const clearHiddenFieldsOnActionButton = () => {
    const parentContainer = document.querySelector('.ticket-left-dynamic-fields');

    if (parentContainer) {
        
        const hiddenFieldDivs = parentContainer.querySelectorAll('.hidden-field');
    

        if (hiddenFieldDivs.length > 0) {
            hiddenFieldDivs.forEach(hiddenFieldDiv => {
            hiddenFieldDiv.classList.remove('hidden-field');
        });
        } else {
            console.log('Div element with class "hidden-field" not found.');
        }
    } else {
        console.log('Parent container not found.');
    }
}


  const getExistingTransactionsByTicket = async (transactionId: string, ticketTypeId: number, fieldId: number) => {
    try {
      const response: any = await getTransactionIdValidationByTicket(transactionId, ticketTypeId, fieldId);
      if (response.status === successResponse) {
        swal({
          title: SwalServerErrorMessage.title,
          content: {
            element: "div",
            attributes: {
              innerHTML: `<div style="color: red;">This ${fields.fieldName} exists in ${response.data.ticketCode} that is still ${response.data.statusName}, please check</div>`
            },
          },
          icon: SwalServerErrorMessage.icon,
        });
        setIsSearching(false)
      } else {
        handleTextInputSearching(fields.fieldId, searchValue.trim())
        clearHiddenFieldsOnActionButton()
        setTimeout(() => { setIsSearching(false) }, 5000) // create delay when changing of state if transaction Id does not exist
      }

    } catch (ex) {
      swal('Failed', 'Error on fetching data', 'error');
    }
  }

  return (
    <div id={formatFieldSelector(fields.fieldMappingId,fields.fieldName)} className={TicketFieldSizes[(fromModal || defaultSize) ? "Default" : fields.fieldSizeName as keyof typeof TicketFieldSizes]}>
      <div className='d-flex align-items-center'>
        <div className={`col-form-label col-sm ${requiredField && 'required'}`}  >{`${fields.fieldName}`}</div>
        {isSearching && <div style={{ fontStyle: 'italic' }}>Searching for Transactions</div>}
      </div>
      <div className='' style={{ position: 'relative' }}>
        <input
          type='text'
          aria-label={`${fields.fieldMappingId}-${fields.fieldName}`}
          className='form-control form-control-sm w-100'
          style={{
            paddingTop: '0'
          }}
          onChange={onChangeSearchInput}
          disabled={isDisabled}
          value={searchValue}
        />
        {isSearching ?
          <div
            style={{
              position: 'absolute',
              right: '10px',
              bottom: '10px'
            }}
            className='spinner-border spinner-border-sm align-middle ms-2'></div> :
          <button onClick={handleTextInputSearch} className='text-input-search-btn' style={{ backgroundColor: `${isDisabled ? '#eff2f5' : '#ffffff'}` }}>
            <FontAwesomeIcon icon={faSearch} size="lg" />
          </button>
        }
      </div>
    </div>
  )
}

export default TextInputWithSearch