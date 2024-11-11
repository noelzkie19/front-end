import { useState, useEffect, useContext } from 'react'
import { SelectFilter } from '../../../relationship-management/shared/components'
import { FieldMappingResponseModel } from '../../models/ticket-config/FieldMappingResponseModel'
import { LookupModel } from '../../../../shared-models/LookupModel'
import useConstant from '../../../../constants/useConstant'
import swal from 'sweetalert'
import { TicketContext } from '../../context/TicketContext'
import useTicketConstant from '../../constants/TicketConstant'
import { MlabButton } from '../../../../custom-components'
import { ElementStyle } from '../../../../constants/Constants'
interface AssigneeProps {
  field: FieldMappingResponseModel,
  viewOnly: boolean,
  updateDynamicTicket: any,
  assigneeList: any,
  autoAssignedId: any,
  fromModal: any,
  handleAutoAssign: any
}

const AssigneeField = ({ field, viewOnly, updateDynamicTicket , assigneeList , autoAssignedId , fromModal , handleAutoAssign }: AssigneeProps) => {
  const [selectedAssignee, setSelectedAssignee] = useState<LookupModel | null>();
  const [isDisabled, setIsDisabled] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { SwalServerErrorMessage, TicketManagementConstants } = useConstant();
  const [requiredField, setRequiredField] = useState<any>(false);
  const { ticketInformation } = useContext(TicketContext)
  const { TICKET_FIELD } = useTicketConstant()

  useEffect(() => {
    setIsDisabled(viewOnly)
    return () => { }
  }, [viewOnly])

  useEffect(() => {
    if(field){
        setRequiredField(field.isRequired)
    }
  },[field])
  useEffect(() => {    
    if (autoAssignedId === null || autoAssignedId === undefined || autoAssignedId === 0) return 
    
    setIsLoading(false)
    setIsDisabled(false)
    const filterWithAssigneeList = assigneeList.find((assignee: LookupModel) => assignee.value === (autoAssignedId?.toString() ?? '0'))
    if (filterWithAssigneeList) {
      (fromModal || ticketInformation.ticketId === 0) && setSelectedAssignee(filterWithAssigneeList);
      (fromModal || ticketInformation.ticketId === 0) && updateDynamicTicket(field.fieldId, filterWithAssigneeList.value.toString());
    } else {
      failedAutoAssignErrorPopUps()
    }
    
    setIsDisabled(viewOnly ?? false)
    return () => { }
  }, [autoAssignedId])

  useEffect(() => {
    if(ticketInformation && ticketInformation.ticketId > 0 && !fromModal) { // for edit and view
       const assigneeId = ticketInformation.ticketDetails.find((d: any) => d.ticketFieldId === TICKET_FIELD.Assignee)?.ticketTypeFieldMappingValue ?? '0'
       const selectedAssignee = assigneeList?.find((assignee: LookupModel) => assignee.value === assigneeId)

       if (!selectedAssignee) {
         updateDynamicTicket(field.fieldId, "")
         setSelectedAssignee(selectedAssignee)
       } else {
         setSelectedAssignee(selectedAssignee)
       }
       setIsDisabled(viewOnly ?? false)
    }

  },[assigneeList])
  
  const handleChangeAssignee = (selectedLookUp: any) => {
      setSelectedAssignee(selectedLookUp)
      updateDynamicTicket(field.fieldId, selectedLookUp.value.toString())
  }

  const failedAutoAssignErrorPopUps = () => {
    setSelectedAssignee(null)
    assigneeList.length > 0 ?
      swal(SwalServerErrorMessage.title, TicketManagementConstants.NoOnlineAssignee, SwalServerErrorMessage.icon) :  // There was no online assignee
      swal(SwalServerErrorMessage.title, TicketManagementConstants.NoConfiguredUser, SwalServerErrorMessage.icon); // Check configuration of team assignee
  }

  const autoAssign = () => {
    setIsLoading(true)
    setIsDisabled(true)
    handleAutoAssign()
  }
  return (
    <div className='d-flex w-100'>
      <div aria-label={`${field.fieldMappingId}-${field.fieldName}`} className='d-flex flex-column w-100' style={{ paddingRight: '1rem' }}>
        <div className={`col-form-label col-sm ${requiredField && 'required'}`} style={{ paddingTop: '0' }} >{field.fieldName}</div>
        <div className='d-flex align-items-center' >
          <div className='w-100' style={{ paddingRight: '1rem' }}>
            <SelectFilter
              key={field.fieldId}
              isMulti={false}
              options={assigneeList}
              label=""
              onChange={handleChangeAssignee}
              value={selectedAssignee}
              isRequired={field.isRequired}
              isDisabled={isDisabled}
              showToolTip={true}
              tooltipText='test'
            />
          </div>
          {fromModal && (
             <div aria-label={`${field.fieldMappingId}-${field.fieldName}`} className='col-lg-3 col-sm-6 my-2' style={{ paddingRight: '1rem' }}>
             <MlabButton
               type={'button'}
               label={'Autoassign'}
               loadingTitle='Please wait...'
               access={true}
               style={ElementStyle.primary}
               weight={'solid'}
               onClick={autoAssign}
               disabled={false}
               loading={isLoading}
             />
           </div>
           )
          }
         
        </div>
      </div>
    </div>

  )
}

export default AssigneeField