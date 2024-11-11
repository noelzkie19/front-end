import {useContext, useEffect, useState} from 'react'
import {Col} from 'react-bootstrap-v5'
import {shallowEqual, useSelector} from 'react-redux'
import {useHistory, useParams} from 'react-router-dom'
import {RootState} from '../../../../setup'
import {ElementStyle} from '../../../constants/Constants'
import useConstant from '../../../constants/useConstant'
import { MlabButton} from '../../../custom-components'
import {IAuthState} from '../../auth'
import {USER_CLAIMS} from '../../user-management/components/constants/UserClaims'
import useTicketConstant from '../constants/TicketConstant'
import {TICKET_DEFAULT} from '../constants/TicketDefault'
import {TicketInfoModel} from '../models/TicketInfoModel'
import {DynamicTicketModel} from '../models/ticket-config/DynamicTicketModel'
import {FieldMappingResponseModel} from '../models/ticket-config/FieldMappingResponseModel'
import TicketSectioning from '../shared/components/TicketSectioning'
import {useTicketConfigurationHooks} from '../shared/hooks/useTicketConfigurationHooks'
import {useTicketManagementHooks} from '../shared/hooks/useTicketManagementHooks'
import useTicketSharedEffectHooks from '../shared/hooks/useTicketSharedEffectHooks'
import { UpdateTicketFieldValue, moldingDynamicTicketForm, pushTo401, splitTicketCode, ticketHeaderCode, updatingDynamicTicketForm} from '../utils/helper'
import { TicketContext } from '../context/TicketContext'
import { TransactionStatusReferenceResponseModel } from '../models/response/TransactionStatusReferenceResponseModel'
import { TicketPlayerRequestModel } from '../models/request/TicketPlayerRequestModel'
import { GetTicketThresholdRequestModel } from '../models/request/GetTicketThresholdRequestModel'
import { GetAssigneeListRequestModel } from '../models/request/GetAssigneeListRequestModel'
import { TicketDetailsRequestModel } from '../models/request/TicketDetailsRequestModel'
import { AddUserCollaboratorRequestModel } from '../models/request/AddUserCollaboratorRequestModel'
import MainContainerSticky from '../../../custom-components/containers/SubCardContainerSticky'
import StatusActionButton from '../shared/components/StatusActionButton'
const ViewTicket = ({ getTicketSummary }: any) => {
  const { TicketManagementConstants } = useConstant();
  const { getPlayerInfoByFilterAsync, getTicketThresholdsAsync , setForModal, getTransactionStatusReferenceAsync, transactionStatusReference , 
    setCurrentTicketInfo , selectedLatestTransactionData , setCurrentPlatformStatus, setCurrentPaymentStatus , selectedPlayer , getLatestTransactionDataAsync, 
    getAssigneeListAsync , getTicketInformationByTicketCodeAsync , ticketInformation , getTicketConfigTypesAsync , getFieldMappingAsync , 
    ticketFieldMapping , ticketConfigTypes , setCurrentDepartmentId , isFetchingApi , fetchingError, assigneeList , getAllProcessorListAsync} = useContext(TicketContext);
  const history = useHistory();
  const [ticketMapping, setTicketMapping] = useState<FieldMappingResponseModel[]>();
  const [selectedTicketConfigCodeView, setSelectedTicketConfigCodeView] = useState<string>();
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const { isUpsertLoading, getTicketStatusMapping, ticketStatusPopupMapping , validateAccess , getHiddenPaymentMethodTicketFields, hiddenTicketFields, mapTransactionStatusFields , fetchLatestTransactionData, validateAddUserAsCollaborator , setApiStatusDescription , updateStatus } = useTicketManagementHooks();
  const { getCustomGrouping, ticketCustomGroupings } = useTicketConfigurationHooks()
  const { ticketCode }: { ticketCode: string } = useParams();
  const [hasLeftSection, setHasLeftSection] = useState<boolean>(false)
  const [hasRightSection, setHasRightSection] = useState<boolean>(false)
  const [hasRightCustomSection, setHasRightCustomSection] = useState<boolean>(false)
  const [dynamicTicketForm, setDynamicTicketForm] = useState<DynamicTicketModel[]>([]); // to be filled initially after ticket type is selected
  const [ticketInfo, setTicketInfo] = useState<TicketInfoModel>(TICKET_DEFAULT);
  const { TICKET_SECTION, TICKET_GROUP , TICKET_COMPONENT, TICKET_FIELD, TICKET_TYPE , TRANSACTION_TAG , TICKET_STATUSES} = useTicketConstant();
  const userAccess = useSelector<RootState>(({ auth }) => auth.access, shallowEqual) as string;
  const { userId, fullName } = useSelector<RootState>(({ auth }) => auth, shallowEqual) as IAuthState;
  const [refreshComment, setRefreshComment] = useState<boolean>(false)
  const [paymentMethodExtId, setPaymentMethodExtId] = useState<number>(0);
  const [selectedTicketType, setSelectedTicketType] = useState<number>(0);
  const [doneFetching, setDoneFetching] = useState<boolean>(false)

  useEffect(() => {
    getTransactionStatusReferenceAsync()
    getTicketConfigTypesAsync()
    setForModal(false)
    getAllProcessorListAsync()
  },[])

  const validateUserInViewAsCollaborator = (ticketId: any, ticketTypeId: any) => {
    const requestObj: AddUserCollaboratorRequestModel = {
        userId: parseInt(userId ?? "0"),
        username: fullName ?? "",
        ticketId: ticketId,
        tIcketTypeId: ticketTypeId,
        createdBy: parseInt(userId ?? "0")
    }
    validateAddUserAsCollaborator(requestObj);
  }
  
  useTicketSharedEffectHooks(
    getTicketSummary
  )

  useEffect(() => {
    if (!userAccess.includes(USER_CLAIMS.ManageTicketsRead) && !userAccess.includes(USER_CLAIMS.ManageTicketsWrite)) {
      history.push('/error/401');
    }
  })

 useEffect(() => {
    if(fetchingError) {
      const platFormStatusId = ticketInformation.ticketDetails.find((d: any) => d.ticketFieldId === TICKET_FIELD.PlatformStatusId)?.ticketTypeFieldMappingValue ?? '0'
      setCurrentPlatformStatus(parseInt(platFormStatusId))
    }
  },[fetchingError])
 
  useEffect(() => {
    if (!ticketConfigTypes || ticketConfigTypes.length === 0) return
    const processedTicketCode = splitTicketCode(ticketCode, ticketConfigTypes)
    if (!processedTicketCode.ticketTypeId) {
      pushTo401(history)
    } else {
      validateAccess(userAccess, history, processedTicketCode.ticketTypeId , TICKET_COMPONENT.View)
      setSelectedTicketConfigCodeView(ticketHeaderCode(ticketConfigTypes, processedTicketCode.ticketTypeId , ticketCode))
      const ticketRequest: TicketDetailsRequestModel ={
        ticketTypeSequenceId: processedTicketCode.ticketTypeSequenceId,
        ticketTypeId: processedTicketCode.ticketTypeId 
      } 
      getTicketInformationByTicketCodeAsync(ticketRequest);
      getTicketStatusMapping(processedTicketCode.ticketTypeId)
      getFieldMappingAsync(processedTicketCode.ticketTypeId.toString())
      getCustomGrouping(processedTicketCode.ticketTypeId.toString())
      setSelectedTicketType(processedTicketCode.ticketTypeId)
    }
    return () => { }
  }, [ticketConfigTypes])

  useEffect(() => {
    setIsLoading(isUpsertLoading)
    return () => { }
  }, [isUpsertLoading])

  useEffect(() => {
    if (!ticketCustomGroupings) return
    const chkCustomRightSection = ticketCustomGroupings.some((fields: any) => fields.ticketCustomId === TICKET_GROUP.Player)
    setHasRightCustomSection(chkCustomRightSection)

    return () => { }
  }, [ticketCustomGroupings])

  useEffect(()=> {
    if(ticketInformation && ticketInformation.ticketId > 0) {
      
      if(ticketFieldMapping.length > 0 && ticketInformation.ticketId > 0 && transactionStatusReference.length > 0){
        getPlayer()
        getThreshold()
        getAssignee()
        loadDetails(ticketFieldMapping, ticketInformation)
        validateUserInViewAsCollaborator(ticketInformation.ticketId, ticketInformation.ticketTypeId);
      }
   
    }
  },[ticketInformation, ticketFieldMapping , transactionStatusReference])

  useEffect(() => {
    if(selectedPlayer && selectedPlayer.mlabPlayerId > 0 && !doneFetching){
      
      const ticketStatusId = ticketInformation.ticketDetails.find((d: any) => d.ticketFieldId === TICKET_FIELD.StatusId)?.ticketTypeFieldMappingValue ?? ''
      const transactionId = ticketInformation.ticketDetails.find((d: any) => d.ticketFieldId === TICKET_FIELD.PlatformTransactionId)?.ticketTypeFieldMappingValue ?? ''
      if(parseInt(ticketStatusId) !== TICKET_STATUSES.Done && parseInt(ticketStatusId) !== TICKET_STATUSES.Cancelled && transactionId !== '' && transactionId !== '') {
        const request = fetchLatestTransactionData(ticketInformation, selectedPlayer, userId)
        getLatestTransactionDataAsync(request)
      }
      else {
        const platFormStatusId = ticketInformation.ticketDetails.find((d: any) => d.ticketFieldId === TICKET_FIELD.PlatformStatusId)?.ticketTypeFieldMappingValue ?? '0'
        setCurrentPlatformStatus(parseInt(platFormStatusId))
      }
    } 
  },[selectedPlayer])

  useEffect(() => {
    if (dynamicTicketForm) {
      const paymentMethodViewId = Number(dynamicTicketForm.find((d: any) => d.fieldId === TICKET_FIELD.PaymentMethodId)?.fieldValue || 0);
      setPaymentMethodExtId(paymentMethodViewId)
    }
    
  }, [dynamicTicketForm])

  useEffect(() => {
    if (paymentMethodExtId) {
     getHiddenPaymentMethodTicketFields( TICKET_TYPE.MissingDeposit, paymentMethodExtId, TicketManagementConstants.VIEW )
   }
   }, [paymentMethodExtId])


   useEffect(() => {
    const updateViewFields = (viewFields: any[]) => {
      if (viewFields && hiddenTicketFields) {
        return viewFields.map((field: any) => {
        const hiddenField = hiddenTicketFields.find(hidden => hidden.fieldId === field.fieldId);
        if (hiddenField) {
          return {
          ...field,
          isSupersedeHidden: true,
          isSupersedeOptional: hiddenField.isOptional,
          mode: TicketManagementConstants.PageModeView,
          };
        } else {
          return {
          ...field,
          isSupersedeHidden: undefined,
          isSupersedeOptional: undefined,
          mode: undefined,
          };
        }
        });
      }
      return [];
    };
    console.log('hidden ', ticketMapping, hiddenTicketFields, dynamicTicketForm)
    if (ticketMapping !== undefined) {
      const ticketViewMappingUpdated = updateViewFields(ticketMapping)
      setTicketMapping(ticketViewMappingUpdated);
    }
    const dynamicViewFieldsUpdated = updateViewFields(dynamicTicketForm)
    if (dynamicViewFieldsUpdated.length > 0) {
      setDynamicTicketForm(dynamicViewFieldsUpdated);
    }
}, [hiddenTicketFields]);

  useEffect(() => {
    if(transactionStatusReference && selectedLatestTransactionData && selectedLatestTransactionData.iCoreTransactionData?.transactionId !== ''){
     
      const transactionId = selectedLatestTransactionData.iCoreTransactionData?.transactionId ?? ''
			const providerTransactionId = selectedLatestTransactionData?.fmboTransactionData?.providerTransactionId ?? ''
			if((transactionId !== '' && providerTransactionId !== '' && selectedLatestTransactionData)) {
        setDescription(selectedLatestTransactionData)
        updateStatus(dynamicTicketForm,selectedLatestTransactionData)
        setCurrentStatus()
        setDoneFetching(true)
			}
    }

  },[selectedLatestTransactionData])

  const setDescription = (transactionData: any) => {
    const updatedForm = setApiStatusDescription(dynamicTicketForm,transactionData, transactionStatusReference)
    const dynamicFormWithDesc = mapTransactionStatusFields(updatedForm,transactionStatusReference)
    setDynamicTicketForm(dynamicFormWithDesc ?? [])
  }

  const setCurrentStatus = () => {
      const icoreData = transactionStatusReference?.find((d: TransactionStatusReferenceResponseModel) => d.apiStatusId === selectedLatestTransactionData.iCoreTransactionData?.transactionStatusId && d.transactionTag === TRANSACTION_TAG.ICORE)
      const fmboData = transactionStatusReference?.find((d: TransactionStatusReferenceResponseModel) => d.apiStatusId === selectedLatestTransactionData.fmboTransactionData?.paymentSystemTransactionStatusId && d.transactionTag === TRANSACTION_TAG.FMBO)
      const icoreReferenceStatusId = icoreData?.staticReferenceId ?? 0
      const fmboReferenceStatusId = fmboData?.staticReferenceId ?? 0
      setCurrentPlatformStatus(icoreReferenceStatusId)
      setCurrentPaymentStatus(fmboReferenceStatusId)
  }
  
  const updateTicket = () => {
    history.push(`/ticket-management/edit-ticket/${ticketCode}`); 
  }

  const updateDynamicTicket = (fieldId: number, fieldValue: any, userInput: boolean = false) => {
    if (!dynamicTicketForm || dynamicTicketForm.length === 0) return
    const updatedForm = updatingDynamicTicketForm(dynamicTicketForm, fieldId, fieldValue)
    setDynamicTicketForm(updatedForm)
  }

  const submitModal = () => {
    const processedTicketCode = splitTicketCode(ticketCode, ticketConfigTypes)
    const ticketRequest: TicketDetailsRequestModel ={
      ticketTypeSequenceId: processedTicketCode.ticketTypeSequenceId,
      ticketTypeId: processedTicketCode.ticketTypeId 
    } 
    getTicketInformationByTicketCodeAsync(ticketRequest);
    setRefreshComment(true)
  }

  const refreshTicketComment = () => {
    setRefreshComment(false)
  };

  const handleCloseTicket = () => {
    history.push(`/ticket-management/search-ticket`);
  }

  const loadDetails = (ticketFieldMapping: any, ticketInformation: any)=> {
    if(ticketFieldMapping.length > 0){
      const activeFieldsViewTicket = ticketFieldMapping.filter((fields: any) => fields.hasView === true && fields.fieldId !== 1)
      const abstractTicketForm: DynamicTicketModel[] = moldingDynamicTicketForm(activeFieldsViewTicket)
  
      const chkLeftSection = activeFieldsViewTicket.some((fields: any) => fields.ticketSectionId === TICKET_SECTION.Left)
      setHasLeftSection(chkLeftSection)
      const chkRightSection = activeFieldsViewTicket.some((fields: any) => fields.ticketSectionId === TICKET_SECTION.Right)
      setHasRightSection(chkRightSection)

      const queriedDataInTicketForm = UpdateTicketFieldValue(ticketInformation.ticketDetails, abstractTicketForm)
      
      setTicketMapping(activeFieldsViewTicket)
      const dynamicFormWithDesc = mapTransactionStatusFields(queriedDataInTicketForm,transactionStatusReference)
      setDynamicTicketForm(dynamicFormWithDesc ?? [])

      const paymentMethodIdView = Number(queriedDataInTicketForm?.find((x: any) => x.fieldId === TICKET_FIELD.PaymentMethodId)?.fieldValue) || 0;
  
      if (paymentMethodIdView > 0) {
          getHiddenPaymentMethodTicketFields( TICKET_TYPE.MissingDeposit, paymentMethodIdView, TicketManagementConstants.VIEW )
          // setPaymentMethodExtId(paymentMethodIdView)
      }

      return () => { }
    }
  }

  const getPlayer =() => {
    setCurrentTicketInfo(ticketInformation)
    setTicketInfo(ticketInformation)
    const playerId =  ticketInformation.ticketPlayerIds[0].playerId
    const request: TicketPlayerRequestModel = {
      BrandId: ticketInformation.ticketPlayerIds[0].brandID,
      PlayerId: playerId,
      PlayerUsername: ''
    }
    getPlayerInfoByFilterAsync(request)
  }

  const getThreshold = () => {
    const mlabPlayerId =  ticketInformation.ticketPlayerIds[0].mlabPlayerId
    const thresholdRequest: GetTicketThresholdRequestModel = {
			mlabPlayerId: mlabPlayerId,
			ticketTypeId: ticketInformation.ticketTypeId
			}
			getTicketThresholdsAsync(thresholdRequest)
  }

  const getAssignee = () => {
      const ticketPaymentMethodId = ticketInformation.ticketDetails.find((d: any) => d.ticketFieldId === TICKET_FIELD.PaymentMethodId)?.ticketTypeFieldMappingValue ?? ''
      const ticketStatusId = ticketInformation.ticketDetails.find((d: any) => d.ticketFieldId === TICKET_FIELD.StatusId)?.ticketTypeFieldMappingValue ?? ''
      const departmentId = parseInt(ticketInformation.ticketDetails.find((d: any) => d.ticketFieldId === TICKET_FIELD.Department)?.ticketTypeFieldMappingValue ?? '0' )
      const adjustmentWithOutComma = ticketInformation.ticketDetails.find((d: any) => d.ticketFieldId === TICKET_FIELD.AdjustmentAmount)?.ticketTypeFieldMappingValue ?? '0'
      const adjustmentAmount = parseFloat(adjustmentWithOutComma.replace(/,/g, ''));
      setCurrentDepartmentId(departmentId)
      const getAssigneeRequest: GetAssigneeListRequestModel = {
        statusId: parseInt(ticketStatusId),
        ticketTypeId: ticketInformation.ticketTypeId,
        paymentMethodId: parseInt(ticketPaymentMethodId),
        mlabPlayerId: ticketInformation.ticketPlayerIds[0].mlabPlayerId ?? 0,
        ticketId: ticketInformation.ticketId,
        departmentId: departmentId,
        adjustmentAmount: parseInt(ticketStatusId) === TICKET_STATUSES.ForAdjustment ? adjustmentAmount : 0
      }

      getAssigneeListAsync(getAssigneeRequest)
   
  }

  return (
    <>
      <MainContainerSticky>
        <div className='p-4'>
          <Col sm={12}>
            <div className='d-flex align-items-baseline justify-content-between'>
              <div className='d-flex align-items-center'>
                <p className='fw-bolder mb-0'>{selectedTicketConfigCodeView}</p>
                <StatusActionButton
                  dynamicTicketForm={dynamicTicketForm}
                  stateData={ticketInfo}
                  ticketStatusPopupMapping={ticketStatusPopupMapping}
                  userId={userId}
                  submitModal={submitModal}
                  ticketCode={ticketCode}
                  allFieldMapping={ticketFieldMapping}
                />
              </div>
              <div>
                <MlabButton
                  type={'button'}
                  label={'Edit'}
                  access={true}
                  style={ElementStyle.primary}
                  weight={'solid'}
                  onClick={updateTicket}
                  loading={isLoading}
                  loadingTitle='Please wait...'
                  disabled={isFetchingApi}
                />
                <MlabButton
                  loading={isLoading}
                  loadingTitle={'Please wait ...'}
                  access={true}
                  size={'sm'}
                  label={'Close'}
                  style={ElementStyle.secondary}
                  type={'button'}
                  weight={'solid'}
                  onClick={handleCloseTicket}
                  disabled={isLoading || isFetchingApi}
                />
              </div>
            </div>
          </Col>
        </div>
      </MainContainerSticky>
      <div style={{ padding: '0.5rem' }}></div>
      <TicketSectioning
        ticketMapping={ticketMapping}
        hasLeftSection={hasLeftSection}
        hasRightSection={(hasRightSection || hasRightCustomSection)}
        ticketCustomGroupings={ticketCustomGroupings}
        isAddForm={false}
        dynamicTicketForm={dynamicTicketForm}
        viewOnly={true}
        ticketInfo={ticketInformation}
        setTicketInfo={setTicketInfo}
        selectedTicketConfig={selectedTicketType}
        displayComment={ticketCustomGroupings?.find((custom: any) => custom.ticketCustomId === TICKET_GROUP.Comment)?.hasView}
        userId={userId}
        ticketStatusPopupMapping={ticketStatusPopupMapping}
        ticketCode={ticketCode}
        submitModal={submitModal}
        refreshComment={refreshComment}
        refreshTicketComment={refreshTicketComment}
        allFieldMapping = {ticketFieldMapping}
        updateDynamicTicket={updateDynamicTicket}
        assigneeList = {assigneeList}
      />
    </>
  )
}

export default ViewTicket
