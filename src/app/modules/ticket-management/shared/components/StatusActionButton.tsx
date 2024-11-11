import React, {useContext, useEffect, useState} from 'react'
import {ElementStyle} from '../../../../constants/Constants'
import {MlabButton} from '../../../../custom-components'
import useTicketConstant from '../../constants/TicketConstant'
import {TicketInfoModel} from '../../models/TicketInfoModel'
import {TransactionDataRequestModel} from '../../models/request/TransactionDataRequestModel'
import {TicketStatusHierarchyResponseModel} from '../../models/response/TicketStatusHierarchyResponseModel'
import {TicketStatusMappingResponseModel} from '../../models/response/TicketStatusMappingResponseModel'
import {TransactionStatusReferenceResponseModel} from '../../models/response/TransactionStatusReferenceResponseModel'
import {DynamicTicketModel} from '../../models/ticket-config/DynamicTicketModel'
import {UpdateTicketFieldValue, moldingDynamicTicketForm} from '../../utils/helper'
import {useTicketManagementHooks} from '../hooks/useTicketManagementHooks'
import EditTicketModal from './modals/EditTicketModal'
import { TicketContext } from '../../context/TicketContext'
import { GetAssigneeListRequestModel } from '../../models/request/GetAssigneeListRequestModel'
import { ValidateUserTierRequestModel } from '../../models/request/ValidateUserTierRequestModel'
import { TicketDetailModel } from '../../models/TicketDetailModel'
import { GetAllProcessorResponseModel } from '../../models/response/GetAllProcessorResponseModel'

export interface ActionButtonModel {
  dynamicTicketForm?: DynamicTicketModel[]
  userId?: any,
  ticketStatusPopupMapping: Array<TicketStatusMappingResponseModel>,
  stateData: TicketInfoModel,
  submitModal?: any
  ticketCode?: any
  allFieldMapping?: any
}

interface TicketStatus {
   statusId: string,
   statusName: string
}

const StatusActionButton = ({ dynamicTicketForm , userId, ticketStatusPopupMapping , submitModal , ticketCode , allFieldMapping }: ActionButtonModel) => {
  const {processorData ,selectedLatestTransactionData ,getLatestTransactionDataAsync, isFetchedPlayer , fetchingLatestTransaction, isForModal , selectedPlayer , transactionStatusReference ,  currentPaymentSystemStatusId, currentPlatformStatusId, setForModal  , ticketInformation , setCurrentDepartmentId , setDefaultAutoAssignee, isFetchingApi ,validateUserTier , isUserValidTier, getAssigneePopupListAsync, setDefaultAssigneeList, assigneePopupList} = useContext(TicketContext);
  const [actionButtonPerStatus, setActionButtonPerStatus] = useState<any>([])

  const {getTicketStatusHierarchy , ticketStatusHierarchy, getTransactionField  , setApiStatusDescription , mapTransactionStatusFields , updateStatus} = useTicketManagementHooks()
  const [showEditStatusModal, setShowEditStatusModal] = useState<boolean>(false);
  const [selectedTicketStatus, setSelectedTicketStatus] = useState<TicketStatus>();
  const [fieldsPerStatus, setFieldsPerStatus] = useState<any>([])
  const {TICKET_FIELD , TRANSACTION_TAG , TRANSACTION_STATUSES ,TICKET_STATUSES , TICKET_TYPE , DEPARTMENT } = useTicketConstant()
  const [popUpDynamicTicketForm, setPopUpDynamicTicketForm] = useState<DynamicTicketModel[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [transactionId, setTransactionId] = useState<string>('');
  const [populatedForm, setPopulatedForm] = useState<DynamicTicketModel[]>([]);
  const [parentStatusId, setParentStatusId] = useState<string>('');
  const [filteredMapping, setFilteredMapping] = useState<any>([])

  useEffect(() => {
    if(selectedPlayer && selectedPlayer.mlabPlayerId > 0){
      getTransactionField(ticketInformation.ticketTypeId)
      const statusId = ticketInformation.ticketDetails.find((d: any) => d.ticketFieldId === TICKET_FIELD.StatusId)?.ticketTypeFieldMappingValue ?? '0'
      const adjustmentNoComma = dynamicTicketForm?.find((ticketForm: DynamicTicketModel) => ticketForm.fieldId === TICKET_FIELD.AdjustmentAmount)?.fieldValue ?? '0'
			const adjustmentAmount = parseFloat(adjustmentNoComma.replace(/,/g, ''));
      const request: ValidateUserTierRequestModel = {
        ticketTypeId: ticketInformation.ticketTypeId,
        userId: userId,
        mlabPlayerId: selectedPlayer.mlabPlayerId,
        adjustmentAmount: parseInt(statusId) === TICKET_STATUSES.ForAdjustment ? adjustmentAmount : 0
      }
      
     validateUserTier(request)
    }
  },[selectedPlayer])

  useEffect(() =>{
    if(isFetchedPlayer && selectedPlayer  && selectedPlayer.mlabPlayerId > 0 && ticketStatusHierarchy.length === 0 && currentPlatformStatusId > 0) {
      const isVipTag = selectedPlayer.isForVipCredit
      const isWithPending = (currentPaymentSystemStatusId === TRANSACTION_STATUSES.FMBO.PROCESSED && currentPlatformStatusId === TRANSACTION_STATUSES.ICORE.PENDING) ?? false
      if(isVipTag && isWithPending && currentPlatformStatusId > 0 && currentPaymentSystemStatusId > 0){
          getTicketStatusHierarchy({ ticketTypeId: ticketInformation.ticketTypeId, isForVip: true, userId: parseInt(userId ?? null) })
      }
      else if(!isWithPending && isVipTag){
          getTicketStatusHierarchy({ ticketTypeId: ticketInformation.ticketTypeId, isForVip: false, userId: parseInt(userId ?? null) })
      }else if(!isVipTag){
          getTicketStatusHierarchy({ ticketTypeId: ticketInformation.ticketTypeId, isForVip: false, userId: parseInt(userId ?? null) })
      }
    }
  },[isFetchedPlayer , selectedPlayer , currentPlatformStatusId, currentPaymentSystemStatusId , selectedLatestTransactionData])

  useEffect(() => {
    if(!dynamicTicketForm) return
    if(dynamicTicketForm.length > 0) {
      const transactionId = dynamicTicketForm?.find((ticketForm: DynamicTicketModel) => ticketForm.fieldId === TICKET_FIELD.PlatformTransactionId)?.fieldValue ?? ''
      const parentStatus = dynamicTicketForm?.find((ticketForm: DynamicTicketModel) => ticketForm.fieldId === TICKET_FIELD.StatusId)?.fieldValue ?? ''
      setTransactionId(transactionId)
      setParentStatusId(parentStatus)
    }
  },[dynamicTicketForm])

  useEffect(() => {
    if(!ticketStatusHierarchy) return
    if(ticketStatusHierarchy.length > 0 && parentStatusId !== "" && isUserValidTier !== null) {

      //for processor
      let paymentProcessor = ''
      let isForSmVerification = false
      if(ticketInformation.ticketTypeId === TICKET_TYPE.MissingWithdrawal) {
        paymentProcessor = ticketInformation.ticketDetails?.find((data: TicketDetailModel) => data.ticketFieldId === TICKET_FIELD.PaymentProcessor)?.ticketTypeFieldMappingValue ?? '';
        isForSmVerification = processorData.find((d: GetAllProcessorResponseModel) => d.paymentProcessorId.toString() === paymentProcessor)?.isForSmVerification ?? false  
      }
   
      const getActionButtonPerStatus = ticketStatusHierarchy?.filter((buttonConfig) => buttonConfig.parentStatusId.toString() === parentStatusId)
      if (!getActionButtonPerStatus) return
      let actionButtonMapping = getActionButtonPerStatus?.reduce((acc: any[], curr: TicketStatusHierarchyResponseModel) => {
        acc.push({
          actionButtonStatusId: curr.childStatusId.toString(),
          actionButtonStatusName: curr.childStatusName,
          actionButtonStatusTag: curr.childStatusColorCode ? curr.childStatusColorCode : 'primary',
          actionButtonIsTransactionVerification: curr.isForTransactionVerification,
          actionButtonIsHide: 
          (ticketInformation.ticketTypeId === TICKET_TYPE.MissingWithdrawal && !isForSmVerification && curr.childStatusId === TICKET_STATUSES.ForSmVerification) || 
          (curr.childStatusId === TICKET_STATUSES.ForPlayerVerification && !isUserValidTier)
        });
        return acc;
      }, []);
      setActionButtonPerStatus(actionButtonMapping)
    }
  },[ticketStatusHierarchy, parentStatusId, isUserValidTier])

  useEffect(() => {
    if ((selectedLatestTransactionData.iCoreTransactionData?.transactionId !== "" && filteredMapping && isForModal)){
      setIsLoading(false)
      const platFormStatusId = selectedLatestTransactionData?.iCoreTransactionData?.transactionStatusId ?? 0
      const paymentSystemStatusId = selectedLatestTransactionData?.fmboTransactionData?.paymentSystemTransactionStatusId ?? 0
      const platFormStatusValue = transactionStatusReference?.find((d: TransactionStatusReferenceResponseModel) => d.apiStatusId === platFormStatusId && d.transactionTag === TRANSACTION_TAG.ICORE)?.staticReferenceDescription ?? ''
      const paymentSystemTransactionStatusValue = transactionStatusReference?.find((d: TransactionStatusReferenceResponseModel) => d.apiStatusId === paymentSystemStatusId && d.transactionTag === TRANSACTION_TAG.FMBO)?.staticReferenceDescription ?? ''
    
      populateDynamicField(selectedLatestTransactionData, allFieldMapping)
      filteredMapping.map((mapping: any ) => {     
            if (mapping.fieldId === TICKET_FIELD.PlatformStatusId) {                    
              mapping.fieldValue = platFormStatusValue
            }  else if(mapping.fieldId === TICKET_FIELD.PaymentSystemTransactionStatusId){
              mapping.fieldValue = paymentSystemTransactionStatusValue
            }
        })
      setFieldsPerStatus(filteredMapping)
      setForModal(false)
      updateStatus(dynamicTicketForm, selectedLatestTransactionData);
    }

  },[selectedLatestTransactionData , filteredMapping])

  const getTransactions = () => {
      // fetch icore and fmbo
      const request: TransactionDataRequestModel = {
        transactionId: transactionId,
        mlabPlayerId: selectedPlayer.mlabPlayerId,
        playerId: selectedPlayer.playerId, //This can only handle single player affected
        providerTransactionid: '',
        userId: parseInt(userId ?? '0'),
        ticketTypeId: ticketInformation.ticketTypeId
      };
      getLatestTransactionDataAsync(request)
      setIsLoading(true)
  }

  const handleUpdateTicketStatus = (ticketStatusId: any, ticketStatusName: any, isTransactionVerification: any) => {
    setDefaultAutoAssignee()
    const paymentMethod = dynamicTicketForm?.find((ticketForm: DynamicTicketModel) => ticketForm.fieldId === TICKET_FIELD.PaymentMethodId);
    const parentStatusId = dynamicTicketForm?.find((ticketForm: DynamicTicketModel) => ticketForm.fieldId === TICKET_FIELD.StatusId)?.fieldValue;
    const paymentMethodId = paymentMethod ? parseInt(paymentMethod.fieldValue) : 0;

    const statusFields = ticketStatusPopupMapping.filter(d => d.parentStatusId === parseInt(parentStatusId ?? '0') &&  d.childStatusId === parseInt(ticketStatusId));
    const ticketStatus: TicketStatus = {
      statusId: ticketStatusId,
      statusName: ticketStatusName
    }    
  const orderedFields = statusFields.slice().sort((a, b) => a.order - b.order); 
  const filteredFieldMapping = allFieldMapping.reduce((acc: any, curr: any) => { 
   const isInStatusMapping = orderedFields.find(statusField => statusField.ticketTypeFieldMappingId === curr.fieldMappingId)   
    if (isInStatusMapping) {          
      const fieldValue = ticketInformation?.ticketDetails?.find((statusField: any) => statusField.ticketTypeFieldMappingId === curr.fieldMappingId)?.ticketTypeFieldMappingValue
      acc.push({...curr, fieldValue: fieldValue, isForReview: isInStatusMapping.isForReview , alternativeLabel: isInStatusMapping.alternativeLabel, isRequired: isInStatusMapping.isRequired})
    }
   return acc
  },[])
  .sort((a: any, b: any) => {
      // Find the index of a and b in orderedFields
      const indexA = orderedFields.findIndex(statusField => statusField.ticketTypeFieldMappingId === a.fieldMappingId);
      const indexB = orderedFields.findIndex(statusField => statusField.ticketTypeFieldMappingId === b.fieldMappingId);
      return indexA - indexB;
  });

    setFilteredMapping(filteredFieldMapping)
    const popUpDynamicForm: DynamicTicketModel[] = moldingDynamicTicketForm(filteredFieldMapping)

    if (ticketInformation.ticketId > 0 && dynamicTicketForm) {
      const queriedDataInTicketForm = UpdateTicketFieldValue(ticketInformation.ticketDetails.filter((d: any) => d.ticketFieldId !== TICKET_FIELD.Assignee), popUpDynamicForm)
      setPopUpDynamicTicketForm(queriedDataInTicketForm)
    }    
    if(isTransactionVerification && transactionId !== ''){
      setForModal(true)
      getTransactions()
    }
    setFieldsPerStatus(filteredFieldMapping)
    getAssigneePerDeparment(ticketStatusId,paymentMethodId)

    setSelectedTicketStatus(ticketStatus);

    setShowEditStatusModal(true)
  }

  const getAssigneePerDeparment = (ticketStatusId: any, paymentMethodId: any) => {
    
    let departmentId = 0;
    if(ticketInformation.ticketTypeId === TICKET_TYPE.MissingWithdrawal) {
    
        if(ticketStatusId === TICKET_STATUSES.ForSmVerification.toString()) {
           departmentId = DEPARTMENT.SM
        }else if(ticketStatusId === TICKET_STATUSES.ForFmVerification.toString()) {
           departmentId = DEPARTMENT.FM
        }else if(ticketStatusId === TICKET_STATUSES.Reopen.toString()) {
          departmentId = DEPARTMENT.FM
        }else {
          departmentId =  parseInt(dynamicTicketForm?.find((ticketForm: DynamicTicketModel) => ticketForm.fieldId === TICKET_FIELD.Department)?.fieldValue ?? '0');
        }
        setCurrentDepartmentId(departmentId)
    }
    
    const adjustmentWithOutComma = dynamicTicketForm?.find((ticketForm: DynamicTicketModel) => ticketForm.fieldId === TICKET_FIELD.AdjustmentAmount)?.fieldValue ?? '0'
    const adjustmentAmount = parseFloat(adjustmentWithOutComma.replace(/,/g, ''));
    const assigneeRequest: GetAssigneeListRequestModel = {
      statusId: parseInt(ticketStatusId),
      ticketTypeId: ticketInformation.ticketTypeId,
      paymentMethodId: paymentMethodId,
      mlabPlayerId: selectedPlayer.mlabPlayerId,
      ticketId: ticketInformation.ticketId,
      departmentId: departmentId,
      adjustmentAmount: ticketStatusId === TICKET_STATUSES.ForAdjustment ? adjustmentAmount : 0
    }

    getAssigneePopupListAsync(assigneeRequest)
  }

  const handleCloseModal = () => {
    setShowEditStatusModal(false)
  }

  const handleSubmitModal = () => {
    setShowEditStatusModal(false)
    submitModal()
    setDefaultAutoAssignee()
    setDefaultAssigneeList()
  }

  const populateDynamicField = (transactionData: any , allFieldMapping: any) => {
    const newForm: DynamicTicketModel[] = moldingDynamicTicketForm(allFieldMapping)
    if(fetchingLatestTransaction) {
      const updatedForm = setApiStatusDescription(newForm, transactionData, transactionStatusReference)
      const dynamicFormWithDesc = mapTransactionStatusFields(updatedForm,transactionStatusReference)
      const formWithDesc  = dynamicFormWithDesc?.filter((d: any) => d.fieldId === TICKET_FIELD.PaymentSystemTransactionStatusId 
      || d.fieldId === TICKET_FIELD.PlatformStatusId)
      updateStatus(updatedForm, selectedLatestTransactionData)
      setPopulatedForm(formWithDesc ?? [])
    }
  }


  return (
    <>
      {actionButtonPerStatus.length > 0 && !isFetchingApi && (
      <div className='px-5'>
        {actionButtonPerStatus.map((btn: any, idx: number) => {
          let keyValue = idx;
          return (
            <React.Fragment key={keyValue}>

              {!btn.actionButtonIsHide && 
                  <MlabButton
                  type={'button'}
                  label={btn.actionButtonStatusName}
                  access={true}
                  style={ElementStyle[btn.actionButtonStatusTag as keyof typeof ElementStyle]}
                  weight={'solid'}
                  onClick={() => { handleUpdateTicketStatus(btn.actionButtonStatusId , btn.actionButtonStatusName , btn.actionButtonIsTransactionVerification) }}
                  loading={false}
                  loadingTitle='Please wait...'
                />
              }
            
            </React.Fragment>
          );
        })}
      </div>
      )}
       {showEditStatusModal && 
            <EditTicketModal showModal={showEditStatusModal} 
            ticketStatus={selectedTicketStatus} 
            handleCloseModal={handleCloseModal}
            fieldMapping={fieldsPerStatus}
            dynamicTicketForm={popUpDynamicTicketForm}
            userId={userId}
            handleSubmitModal={handleSubmitModal}
            ticketCode={ticketCode}
            allFieldMapping={allFieldMapping}
            isLoading={isLoading}
            transactionData={selectedLatestTransactionData}
            populatedForm={populatedForm}
            ticketStatusHierarchy={ticketStatusHierarchy}
            assigneeList = {assigneePopupList}
            ></EditTicketModal>
      }
        
    </>
  )
}

export default StatusActionButton