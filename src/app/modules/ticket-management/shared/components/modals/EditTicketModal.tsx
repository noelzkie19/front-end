import { ModalFooter, Row } from "react-bootstrap-v5";
import { DefaultSecondaryButton, FieldContainer, FormModal, MlabButton } from "../../../../../custom-components";
import { ElementStyle } from "../../../../../constants/Constants";
import { useContext, useEffect, useState } from "react";
import AddComment from "../groups/custom-groupings/tabs/CommentTab/AddComment";
import { DynamicFormField } from "../DynamicFormField";
import swal from 'sweetalert';
import useConstant from "../../../../../constants/useConstant";
import { Guid } from 'guid-typescript';
import { DynamicTicketModel } from "../../../models/ticket-config/DynamicTicketModel";
import useTicketConstant from "../../../constants/TicketConstant";
import { IsNotPlatformOrPaymentStatus, validateFormTicketFields } from "../../../utils/helper";
import { GetAdjustmentBusinessTypeList, UpdateHoldWithdrawal, UpdateManualBalanceCorrection, UpsertPopupTicketDetails, UpsertTicketComment } from "../../../services/TicketManagementApi";
import { UpsertPopupTicketDetailsRequestModel } from "../../../models/request/UpsertPopupTicketDetailsRequestModel";
import { TransactionDataModel } from "../../../models/TransactionDataModel";
import { ManualBalanceCorrectionRequestModel } from "../../../models/request/ManualBalanceCorrectionRequestModel";
import { HoldWithdrawalRequestModel } from "../../../models/request/HoldWithdrawalRequestModel";
import "../../css/EditTicketModal.css";
import { TransactionStatusReferenceResponseModel } from "../../../models/response/TransactionStatusReferenceResponseModel";
import { TicketCommentRequestModel } from "../../../models/request/TicketCommentRequestModel";
import { shallowEqual, useSelector } from "react-redux";
import { RootState } from "../../../../../../setup";
import { LookupModel } from "../../../../../shared-models/LookupModel";
import { TicketContext } from "../../../context/TicketContext";
import { AddUserCollaboratorRequestModel } from "../../../models/request/AddUserCollaboratorRequestModel";
import { useTicketManagementHooks } from "../../hooks/useTicketManagementHooks";
import { GetAutoAssignedIdRequestModel } from "../../../models/request/GetAutoAssignedIdRequestModel";
import { GetAssigneeListRequestModel } from "../../../models/request/GetAssigneeListRequestModel";

interface ModalProps {
    showModal: boolean
    ticketStatus: any
    handleCloseModal: () => void
    fieldMapping?: any
    dynamicTicketForm?: any
    userId?: any
    handleSubmitModal: () => void
    fromSearchPage?: boolean
    ticketCode?: any
    updatingTicket?: boolean
    allFieldMapping?: any,
    isLoading?: any,
    transactionData?: TransactionDataModel,
    populatedForm?: any,
    ticketStatusHierarchy?: any,
    assigneeList: any
}
const EditTicketModal = ({ showModal, ticketStatus, handleCloseModal, fieldMapping, dynamicTicketForm, userId,
    handleSubmitModal, fromSearchPage, ticketCode, updatingTicket, allFieldMapping, isLoading, transactionData, populatedForm, ticketStatusHierarchy , assigneeList }: ModalProps) => {
    const [confirmation, setConfirmation] = useState('');
    const { SwalServerErrorMessage, SwalTicketSuccessRecordMessage, successResponse, SwalFailedMessage, SwalSuccessMessage, SwalAPIIntegrationMessage } = useConstant();
    const [saveLoading, setSaveLoading] = useState<boolean>(false);
    const [currentDynamicTicketForm, setCurrentDynamicTicketForm] = useState<DynamicTicketModel[]>([]);
    const [convertedComment, setConvertedComment] = useState<string>('');
    const { TICKET_FIELD, TICKET_STATUSES, WAGER_MULTIPLIER, TRANSACTION_TAG, HOLD_WITHDRAWAL, TRANSACTION_STATUSES, LOWER_THRESHOLD_REASON, VENDOR_TRANSACITON_STATUS_TYPE, TICKET_TYPE , DEPARTMENT } = useTicketConstant()
    const [modalHeader, setModalHeader] = useState<any>()
    const [headerTitleName, setHeaderTitleName] = useState<string>('')
    const [withDirtyForm, setWithDirtyForm] = useState<boolean>(false);
    const { SwalTicketManagementConfirmMessage } = useConstant();
    const [checkedMBC, setCheckedMBC] = useState<boolean>(true);
    const [checkedHoldWithdrawal, setCheckedHoldWithdrawal] = useState<boolean>(false);
    const mcoreUserId = useSelector<RootState>(({ auth }) => auth.mcoreUserId, shallowEqual) as string;
    const username = useSelector<RootState>(({ auth }) => auth.fullName, shallowEqual) as string;
    const [adjustmentBusinessList, setAdjustmentBusinessList] = useState<Array<LookupModel>>([]);
    const { selectedTicketThresholds, transactionStatusReference, selectedPlayer, ticketInformation, allLookUpOptions, currentDepartment, assigneePopupList , getAutoAssignedId, autoAssignedId , getAssigneePopupListAsync , setDefaultAutoAssignee } = useContext(TicketContext);
    const { validateAddUserAsCollaborator, extractHistoryData } = useTicketManagementHooks();
    const [statusId, setStatusId] = useState<number>(0);

    useEffect(() => {
        setHeaderTitleName('Edit Status');
        GetAdjustmentBusinessTypeList().then((response: any) => {
            if (response.status === successResponse) {
                setAdjustmentBusinessList(response.data)
                let lookUpOptValue = allLookUpOptions;
                if (response.data.length > 0) {
                    const isOptionListExist = lookUpOptValue.filter(a => a.fieldId === TICKET_FIELD.AdjustmentBusinessReasonType)
                    if (isOptionListExist.length > 0) {
                      lookUpOptValue.map(x => {
                        if (x.fieldId === TICKET_FIELD.AdjustmentBusinessReasonType) {
                          x.optionList = response.data
                        }
                      })
                    } else {
                      lookUpOptValue.push({
                        fieldId: TICKET_FIELD.AdjustmentBusinessReasonType,
                        optionList: response.data
                      })
                    }
                  } else {
                    lookUpOptValue.push({
                      fieldId: TICKET_FIELD.AdjustmentBusinessReasonType,
                      optionList: response.data
                    })
                  }
            }
        })
        setDefaultAutoAssignee()
    }, [])

    useEffect(() => {
        if (ticketStatus) {
            setConfirmation(ticketStatus.statusName ? `Please confirm to set ticket status to ` : '');
            filterDynamicForm()
            setStatusId(ticketStatus.statusId)
        }
    }, [ticketStatus]);

    useEffect(() => {
        if (convertedComment) {
            setWithDirtyForm(true)
        }
    }, [convertedComment])

    useEffect(() => {
        setModalHeader(getModalHeaderContent())
        if (fromSearchPage) {
            setHeaderTitleName('Reassign')
        }
        return () => { }
    }, [fromSearchPage, updatingTicket, confirmation, ticketStatus])

    useEffect(() => {
        if (fromSearchPage && fieldMapping && currentDynamicTicketForm.length === 0) {
            filterDynamicForm()
        }
    }, [fieldMapping])

    const getModalHeaderContent = () => {
        if (updatingTicket) {
            return <p className="form-label-sm">Please confirm for updating the ticket, you can also leave a comment.</p>;
        } else if (confirmation && !fromSearchPage) {
            return <label className="form-label-sm">{confirmation} <strong>{ticketStatus.statusName}</strong></label>;
        } else {
            return <p className="form-label-sm">Please confirm to <strong>re-assign</strong> ticket</p>;
        }
    }


    const handleSubmit = async () => {
        setSaveLoading(true)
        if (fromSearchPage) {
            const isValid = currentDynamicTicketForm.filter(x => x.fieldValue !== "" && x.fieldId !== TICKET_FIELD.StatusId).length > 0
       
            if (isValid) {
                upsertPopupTicketDetails();
            } else {
                swal(SwalFailedMessage.title, SwalFailedMessage.textMandatory, SwalFailedMessage.icon);
                setSaveLoading(false);
            }
        } else {
            upsertPopupTicketDetails();
        }
    }

    const upsertPopupTicketDetails = async () => {
        const icoreStatusId = transactionData?.iCoreTransactionData?.transactionStatusId ?? 0
        const fmboStatusId = transactionData?.fmboTransactionData?.paymentSystemTransactionStatusId ?? 0

        const icoreReferenceStatusId = transactionStatusReference?.find((d: TransactionStatusReferenceResponseModel) => d.apiStatusId === icoreStatusId && d.transactionTag === TRANSACTION_TAG.ICORE)?.staticReferenceId ?? 0
        const fmboReferenceStatusId = transactionStatusReference?.find((d: TransactionStatusReferenceResponseModel) => d.apiStatusId === fmboStatusId && d.transactionTag === TRANSACTION_TAG.FMBO)?.staticReferenceId ?? 0

        if (icoreReferenceStatusId === TRANSACTION_STATUSES.ICORE.PENDING && fmboReferenceStatusId === TRANSACTION_STATUSES.FMBO.REJECT) {
            swal(SwalFailedMessage.title, SwalFailedMessage.textICorePendingFMBORejectStatus, SwalFailedMessage.icon).then(() => {
                handleSubmitModal();
            });
            setSaveLoading(false);
        } else {
            const isAutoApprovedThreshold = validateHigherLowerThreshold(currentDynamicTicketForm);

            const status = ticketInformation.ticketDetails.find((d: any) => d.ticketFieldId === TICKET_FIELD.StatusId)?.ticketTypeFieldMappingValue ?? '0';
            const currentStatusId: number = parseInt(status);
            const postTicketIntegration = triggerTicketIntegraitonAPI(parseInt(ticketStatus.statusId ?? "0"), icoreReferenceStatusId, fmboReferenceStatusId, isAutoApprovedThreshold, currentStatusId)
            const request = createRequestObject(icoreReferenceStatusId, fmboReferenceStatusId, currentStatusId, postTicketIntegration);
            const isFormFulfilled = await validateFormTicketFields(currentDynamicTicketForm);
            
            if (isFormFulfilled) {
                const assigneeId = currentDynamicTicketForm.find((d: any) => d.fieldId === TICKET_FIELD.Assignee)?.fieldValue

                if(assigneeId) {
                    const fullName  = assigneePopupList.find((d: any) => d.value === assigneeId)?.label.split(',')[0];
                    validateUserInSearchAsCollaborator(request.ticketId, request.ticketTypeId, fullName , parseInt(assigneeId ?? '0'));
                }   
               
               
                UpsertPopupTicketDetails(request).then((response: any) => {
                    if (response.status === successResponse) {
                        //validate user as collaborator in re-assign modal
                        if(fromSearchPage) {
                            validateUserInSearchAsCollaborator(request.ticketId, request.ticketTypeId);
                        }
                        if (postTicketIntegration) {
                            executeIntegrationAPI(currentStatusId, isAutoApprovedThreshold);
                        } else {
                            successSwal()
                        }
                       
                    } else {
                        swal(SwalServerErrorMessage.title, SwalServerErrorMessage.textError, SwalServerErrorMessage.icon);
                    }
                    setSaveLoading(false);
                })
            } else {
                swal(SwalFailedMessage.title, SwalFailedMessage.textMandatory, SwalFailedMessage.icon);
                setSaveLoading(false);
            }
        }
    };

    const validateUserInSearchAsCollaborator = (ticketId: any, ticketTypeId: any, assigneeFullName?: any, assigneeId?: any) => {
        const requestObj: AddUserCollaboratorRequestModel = {
            userId: assigneeId ?? parseInt(userId ?? "0"),
            username: assigneeFullName ??  username ?? "",
            ticketId: ticketId,
            tIcketTypeId: ticketTypeId,
            createdBy: parseInt(userId ?? "0")
        }

        validateAddUserAsCollaborator(requestObj);
    }

    const executeIntegrationAPI = (currentStatusId: any, isAutoApprovedThreshold: any) => {
        if ((currentStatusId === TICKET_STATUSES.ForCrediting)) {
            swal({
                title: SwalTicketSuccessRecordMessage.title,
                text: SwalTicketSuccessRecordMessage.textSuccess,
                icon: SwalTicketSuccessRecordMessage.icon,
                buttons: false as any, // This removes all buttons,
                timer: 3000 // Timer in milliseconds (3 seconds)
            }).then((d: any) => {
                handleSubmitModal()
                setSaveLoading(false);
            })
        }
        if ((currentStatusId === TICKET_STATUSES.ForAdjustment || parseInt(ticketStatus.statusId ?? "0") === TICKET_STATUSES.VerificationComplete)) {
            if (parseInt(ticketStatus.statusId ?? "0") === TICKET_STATUSES.VerificationComplete && checkedHoldWithdrawal) {
                updateHoldWithdrawal();
            }
            else if ((currentStatusId === TICKET_STATUSES.ForAdjustment || parseInt(ticketStatus.statusId ?? "0") === TICKET_STATUSES.VerificationComplete)
            ) {
                if (checkedMBC) {
                    updateMBC(isAutoApprovedThreshold);
                }
            
            }
        }

        mbcForWithdrawal(isAutoApprovedThreshold,currentStatusId)
    }

    const mbcForWithdrawal = (isAutoApprovedThreshold: any, currentStatusId: any) => {
        if(ticketInformation.ticketTypeId === TICKET_TYPE.MissingWithdrawal && parseInt(ticketStatus.statusId ?? "0") === TICKET_STATUSES.ForAdjustment) {
            if(isAutoApprovedThreshold) {
                updateMBC(isAutoApprovedThreshold);
            }
            else if (currentStatusId !== TICKET_STATUSES.ForAdjustment) {
                swal({
                    title: SwalTicketSuccessRecordMessage.title,
                    text: SwalTicketSuccessRecordMessage.textSuccess,
                    icon: SwalTicketSuccessRecordMessage.icon,
                    buttons: false as any, // This removes all buttons,
                    timer: 3000 // Timer in milliseconds (3 seconds)
                }).then((d: any) => {
                    handleSubmitModal()
                    setSaveLoading(false);
                })
            }
           
        }
    }
    const triggerTicketIntegraitonAPI = (childStatus: any, icoreStatus: any, fmboStatus: any, thresholdAutoApproved: any, currentStatusId: any) => {
        let isTriggered: boolean = false;
        
        switch (childStatus) {
            case TICKET_STATUSES.VerificationComplete:
                if (((fmboStatus === TRANSACTION_STATUSES.FMBO.PROCESSED || fmboStatus === TRANSACTION_STATUSES.FMBO.REJECT) && icoreStatus === TRANSACTION_STATUSES.ICORE.DECLINED && thresholdAutoApproved) 
                    || checkedHoldWithdrawal) {
                    isTriggered = true;
                }

                break;
            case TICKET_STATUSES.ForPlayerVerification:
                if(ticketInformation.ticketTypeId === TICKET_TYPE.MissingDeposit || (currentStatusId === TICKET_STATUSES.ForAdjustment && ticketInformation.ticketTypeId === TICKET_TYPE.MissingWithdrawal)) 
                {
                    isTriggered = true;
                }
            break;
            case TICKET_STATUSES.ForAdjustment:
                if(ticketInformation.ticketTypeId === TICKET_TYPE.MissingWithdrawal) {
                    isTriggered = true;
                }
            break;
            default:
                break;
        }

        return isTriggered;
    }

    const createRequestObject = (icoreReferenceStatusId: any, fmboReferenceStatusId: any, currentStatusId: any, postTicketIntegration: any) => {
        //for missing deposit
        let newDynamicTicketForm = currentDynamicTicketForm
        if(ticketInformation.ticketTypeId === TICKET_TYPE.MissingDeposit){
            newDynamicTicketForm = currentDynamicTicketForm.filter(IsNotPlatformOrPaymentStatus);
        }

        const sendTicketUpdateEmail = ticketInformation.ticketId !== 0 && !postTicketIntegration;
        const request: UpsertPopupTicketDetailsRequestModel = {
            ticketId: ticketInformation.ticketId,
            ticketTypeId: ticketInformation.ticketTypeId,
            ticketDetails: newDynamicTicketForm?.map((x: any) => ({
                ticketFieldMappingId: x.fieldMappingId,
                ticketFieldMappingValue: x.externalFieldValue?.toString() ?? (x.fieldValue ?? '').toString(),
            })) ?? [],
            comment: convertedComment,
            queueId: Guid.create().toString(),
            icoreStatusId: icoreReferenceStatusId ?? 0,
            fmboStatusId: fmboReferenceStatusId ?? 0,
            userId: userId?.toString() ?? '0',
            sendUpdateEmail: sendTicketUpdateEmail,
            ticketHistoryLabelType: extractHistoryData(newDynamicTicketForm).filter(x => x.oldValue !== null),
            parentStatusId: currentStatusId,
            childStatusId: parseInt(ticketStatus.statusId ?? 0)
        };
        if (allFieldMapping) {
           
            validateStatus(request , currentStatusId)
            validatePopulatedForm(icoreReferenceStatusId, fmboReferenceStatusId, request)
            validateDepartment(request)
            
            if([TICKET_STATUSES.ForPlayerVerification.toString(), TICKET_STATUSES.Done.toString()].indexOf(ticketStatus.statusId) === -1) {
                const ticketResultField = getTicketResultField(request.ticketDetails, ticketStatus.statusId);
                request.ticketDetails.push(ticketResultField);
            }

            if (currentStatusId === TICKET_STATUSES.ForAdjustment) {
                setWagerAndReason(request);
            }
        }
        return request;
    }

    const validateStatus = (request: any, currentStatusId: any) => {
        const statusField = allFieldMapping.find((d: any) => d.fieldId === TICKET_FIELD.StatusId)
        if (statusField) {
            let fieldStatusValue = ticketStatus.statusId;
            const statusDetails: any = {
                ticketFieldMappingId: statusField.fieldMappingId,
                ticketFieldMappingValue: fieldStatusValue
            }
            request.ticketDetails.push(statusDetails)
            request.ticketHistoryLabelType.push({
                fieldMappingId: statusDetails.ticketFieldMappingId,
                oldValue: extractLabelValueById(currentStatusId.toString(), TICKET_FIELD.StatusId),
                newValue: extractLabelValueById(fieldStatusValue.toString(), TICKET_FIELD.StatusId),
            })
        }
    }

    const validatePopulatedForm = (icoreReferenceStatusId: any, fmboReferenceStatusId: any, request: any) => {
        if (populatedForm && (icoreReferenceStatusId > 0 || fmboReferenceStatusId > 0)) {
            const populatedTicketDetails = populatedForm?.map((x: any) => ({
                ticketFieldMappingId: x.fieldMappingId,
                ticketFieldMappingValue: x.externalFieldValue?.toString() ?? (x.fieldValue ?? '').toString(),
            })) ?? []
            const newTicketDetails = populatedTicketDetails.filter((detail: any) => {
                return !request.ticketDetails.some((existingDetail: any) => existingDetail.ticketFieldMappingId === detail.ticketFieldMappingId);
            });
            request.ticketDetails.push(...newTicketDetails);
        }
    }

    const validateDepartment = (request: any) => {
        const departmentField = allFieldMapping.find((d: any) => d.fieldId === TICKET_FIELD.Department)
        if(departmentField){
            
            let department;

            switch (ticketStatus.statusId) {
                case TICKET_STATUSES.ForFmVerification.toString():
                    department = DEPARTMENT.FM;
                    break;
                case TICKET_STATUSES.ForSmVerification.toString():
                    department = DEPARTMENT.SM;
                    break;
                case TICKET_STATUSES.Reopen.toString():
                    department = DEPARTMENT.FM;
                    break;
                default:
                    department = currentDepartment;
                    break;
            }
            
            const departmentDetails: any = {
                ticketFieldMappingId: departmentField.fieldMappingId,
                ticketFieldMappingValue: department.toString() ?? '0'
            }
            request.ticketDetails.push(departmentDetails)
        }
    }

    const extractLabelValueById = (currValue: any, currFieldId: any) => {
        const optionList: any = allLookUpOptions.filter(x => x.fieldId === currFieldId).map(o => o.optionList)
        return optionList[0]?.filter((x: any) => (x?.value ?? "").toString() === currValue).map((y: any) => y.label)[0]
    }

    const getTicketResultField = (ticketDetails: any, childStatus: any) => {
        let ticketResultValue: any = {}
        if(allFieldMapping) {
            let ticketResultFieldValue: any = "";
            const fieldDetail: any = (fieldId: any) => {
                return allFieldMapping.find((d: any) => d.fieldId === fieldId)
            }
            const ticketFieldDetail: any = (fieldId: any) => {
                return ticketDetails.find((x: any)=> x.ticketFieldMappingId === fieldDetail(fieldId).fieldMappingId)
            }
            const ticketResultField = fieldDetail(TICKET_FIELD.TicketResult)
            const childStatusId = parseInt(childStatus)
            switch(childStatusId) {
                case TICKET_STATUSES.Cancelled :
                    if(ticketInformation.ticketTypeId === TICKET_TYPE.MissingWithdrawal) {
                        ticketResultFieldValue = `${extractLabelValueById(childStatus.toString(), TICKET_FIELD.StatusId)} - ${extractLabelValueById(ticketFieldDetail(TICKET_FIELD.CancelReasonMW).ticketFieldMappingValue, TICKET_FIELD.CancelReasonMW) ?? ""}`
                    }else if(ticketInformation.ticketTypeId === TICKET_TYPE.MissingDeposit) (
                        ticketResultFieldValue = `${extractLabelValueById(childStatus.toString(), TICKET_FIELD.StatusId)} - ${extractLabelValueById(ticketFieldDetail(TICKET_FIELD.CancelReasonMD).ticketFieldMappingValue, TICKET_FIELD.CancelReasonMD) ?? ""}`
                    )
                   break;
                case TICKET_STATUSES.Pending:
                    ticketResultFieldValue = `${extractLabelValueById(childStatus.toString(), TICKET_FIELD.StatusId)} - ${extractLabelValueById(ticketFieldDetail(TICKET_FIELD.PendingReason).ticketFieldMappingValue, TICKET_FIELD.PendingReason) ?? ""}`
                    break;
                case TICKET_STATUSES.ForInternalTransfer: 
                case TICKET_STATUSES.ForVendorPayout:
                    ticketResultFieldValue = `Resend Reprocess - ${extractLabelValueById(childStatus.toString(), TICKET_FIELD.StatusId)}`
                    break;
                case TICKET_STATUSES.Declined: 
                    ticketResultFieldValue = `${extractLabelValueById(childStatus.toString(), TICKET_FIELD.StatusId)}`
                    break;
                case TICKET_STATUSES.ForAdjustment:
                    ticketResultFieldValue = `${extractLabelValueById(TICKET_STATUSES.AdjustmentApproved.toString(), TICKET_FIELD.StatusId)}`
                    break;
                case TICKET_STATUSES.ForCrediting:
                    ticketResultFieldValue = `Credit Approved`
                    break;
            }
            
            ticketResultValue = {
                ticketFieldMappingId: ticketResultField.fieldMappingId,
                ticketFieldMappingValue: ticketResultFieldValue
            }
        }

        return ticketResultValue
    }

    const setWagerAndReason = (request: any) => {
        const wager = allFieldMapping.find((d: any) => d.fieldId === TICKET_FIELD.WagerMultiplier)
        const reason = allFieldMapping.find((d: any) => d.fieldId === TICKET_FIELD.Reason)
        if (wager) {
            request.ticketDetails.filter((d: any) => d.ticketFieldMappingId === wager.fieldMappingId).map((x: any) => x.ticketFieldMappingValue = WAGER_MULTIPLIER.WagerMultiplierTag.toString())
        }

        if(reason) {
            request.ticketDetails.filter((d: any) => d.ticketFieldMappingId === reason.fieldMappingId).map((x: any) => x.ticketFieldMappingValue = ticketCode + " - " + (transactionData?.fmboTransactionData?.remarks ?? ""))
        }
    }

    const updateMBC = (isAutoApproved: any) => {
        const status = ticketInformation.ticketDetails.find((d: any) => d.ticketFieldId === TICKET_FIELD.StatusId)?.ticketTypeFieldMappingValue ?? '0';
        const currentStatusId: number = parseInt(status)
        const adjustmentAmount = currentStatusId === TICKET_STATUSES.ForAdjustment ? ticketInformation?.ticketDetails?.find((statusField: any) => statusField.ticketFieldId === TICKET_FIELD.AdjustmentAmount)?.ticketTypeFieldMappingValue : currentDynamicTicketForm.find((d: any) => d.fieldId === TICKET_FIELD.AdjustmentAmount)?.fieldValue;
        const adjustmentBusinessReason = currentDynamicTicketForm.find((d: any) => d.fieldId === TICKET_FIELD.AdjustmentBusinessReasonType);
        const remarks: any = transactionData?.fmboTransactionData?.remarks;
        const currencyMethod: any = ticketInformation?.ticketDetails?.find((statusField: any) => statusField.ticketFieldId === TICKET_FIELD.CurrencyMethod)?.ticketTypeFieldMappingValue
        const thresholdReasonId =  ticketInformation.ticketTypeId === TICKET_TYPE.MissingDeposit ? LOWER_THRESHOLD_REASON.SYSTEM_ERROR : LOWER_THRESHOLD_REASON.MISSING_WITHDRAWAL ;
        const adjustmentBusinessReasonName = adjustmentBusinessList.find((d: any) => d.value === (isAutoApproved ? thresholdReasonId :
             parseInt(adjustmentBusinessReason?.fieldValue ?? "0")))?.label
        
       
        const request: ManualBalanceCorrectionRequestModel = {
            MlabPlayerId: selectedPlayer.mlabPlayerId,
            PlayerId: selectedPlayer.playerId,
            UserId: parseInt(mcoreUserId ?? "0"),
            ManualCorrectionReason: isAutoApproved ? thresholdReasonId : parseInt(adjustmentBusinessReason?.fieldValue ?? "0"),
            Amount: parseFloat(adjustmentAmount ?? "0"),
            Explanation: ticketCode + " - " + remarks,
            WagerMultiplier: WAGER_MULTIPLIER.WagerMultiplierTag,
        }
        UpdateManualBalanceCorrection(request).then((response: any) => {
            if (response.status === successResponse) {
                if (response.data.isIntegrationEnabled) {
                    const result = response.data.responseData;
                    if (result?.statusCode !== SwalSuccessMessage.title) {
                        insertIntegrationStatusInComment(SwalAPIIntegrationMessage.textErrorMBC(result?.errorMessage))
                        handleSubmitModal()
                    } else {
                        insertIntegrationStatusInComment(SwalAPIIntegrationMessage.textSuccessMBC(currencyMethod, adjustmentAmount, username, mcoreUserId, adjustmentBusinessReasonName))
                        if(checkedHoldWithdrawal) {
                            updateHoldWithdrawal();
                        }else {
                            successSwal()
                        }   
                   }
                }
            } else {
                swal(SwalServerErrorMessage.title, SwalServerErrorMessage.textError, SwalServerErrorMessage.icon);
            }
            setSaveLoading(false);
        })
    }

    const successSwal = () => {
        swal({
            title: SwalTicketSuccessRecordMessage.title,
            text: SwalTicketSuccessRecordMessage.textSuccess,
            icon: SwalTicketSuccessRecordMessage.icon,
            buttons: false as any, // This removes all buttons,
            timer: 3000 // Timer in milliseconds (3 seconds)
        }).then((d: any) => {
            handleSubmitModal()
        })
    }

    const updateHoldWithdrawal = () => {

        if(ticketInformation.ticketTypeId === TICKET_TYPE.MissingDeposit) {
            const request: HoldWithdrawalRequestModel = {
                UserId: parseInt(mcoreUserId ?? "0"),
                UpdatePlayerSettings: [{
                    Key: HOLD_WITHDRAWAL.Key,
                    Value: HOLD_WITHDRAWAL.Value
                }],
                PlayerIds: [selectedPlayer.playerId]
            }

            UpdateHoldWithdrawal(request).then((response: any) => {
                if (response.status === successResponse) {
                    if (response.data.isIntegrationEnabled) {
                        const result = response.data.responseData;
                        if (result?.statusCode !== SwalSuccessMessage.title) {
                            insertIntegrationStatusInComment(SwalAPIIntegrationMessage.textErrorHoldWithdrawal(result?.errorMessage))
                            handleSubmitModal()
                        } else {
                            insertIntegrationStatusInComment(SwalAPIIntegrationMessage.textSuccessHoldWithdrawal)
                            successSwal()
                        }
                    }
                } else {
                    swal(SwalServerErrorMessage.title, SwalServerErrorMessage.textError, SwalServerErrorMessage.icon);
                }
                setSaveLoading(false);
            })
        } else{
            successSwal()
            setSaveLoading(false);
        }
       
    }

    const filterDynamicForm = () => {
        if (fieldMapping?.length > 0 && ticketStatus) {
            const updatedForm = dynamicTicketForm.filter((field: any) =>
                fieldMapping.some((d: any) => d.fieldMappingId === field.fieldMappingId)
            );

            if(fromSearchPage) {
                const statusField = dynamicTicketForm?.find((ticketForm: DynamicTicketModel) => ticketForm.fieldId === TICKET_FIELD.StatusId);
                if (statusField) {
                    statusField.fieldValue = ticketStatus.statusId;
                    updatedForm.push(statusField);
                }
            }
       
            setCurrentDynamicTicketForm(updatedForm)
        }
    }

    const validateHigherLowerThreshold = (currentDynamicTicketForm: any) => {
        const adjustmentAmount = currentDynamicTicketForm.find((d: any) => d.fieldId === TICKET_FIELD.AdjustmentAmount)
        if (adjustmentAmount) {
            const isAutoApproved = selectedTicketThresholds?.find((d: any) => (parseFloat(adjustmentAmount.fieldValue) >= d.amountMin 
                                    && parseFloat(adjustmentAmount.fieldValue) <= d.amountMax) || (d.amountMax === 0 && parseFloat(adjustmentAmount.fieldValue) >= d.amountMax) )?.isAutoApproved
            return isAutoApproved ?? false;
        }

        return false;
    }

    const setHoldWithdrawalValue = (fieldId: number, fieldValue: any) => {
        if (fieldId === TICKET_FIELD.VendorTransactionStatus) {
            if (fieldValue === VENDOR_TRANSACITON_STATUS_TYPE.VendorDidNotConfirmToReceiveTheFUnd) {
                setCheckedHoldWithdrawal(true);
            }
            if (fieldValue === VENDOR_TRANSACITON_STATUS_TYPE.VendorReceivedTheFund) {
                setCheckedHoldWithdrawal(false);
            }
        }
    }
    const updateDynamicTicketForm = (fieldId: number, fieldValue: any) => {
        if (fieldId !== undefined) {

            setHoldWithdrawalValue(fieldId, fieldValue);

            if(fieldId === TICKET_FIELD.AdjustmentAmount && parseInt(ticketStatus.statusId) === TICKET_STATUSES.ForAdjustment) {
                adjustmentAmountChange(fieldValue)
            }

            const updateDynamicForm = currentDynamicTicketForm?.find((field: any) => field.fieldId === fieldId);
            if (updateDynamicForm) {
                const updatedData = { ...updateDynamicForm, fieldValue: fieldValue, fieldId: fieldId };
                const index = currentDynamicTicketForm.findIndex((field: any) => field.fieldId === fieldId);
                if (index !== -1) {
                    const newDynamicTicketForm = [...currentDynamicTicketForm];
                    newDynamicTicketForm[index] = updatedData;
                    setCurrentDynamicTicketForm(newDynamicTicketForm);
                    setWithDirtyForm(true)
                } else {
                    console.error(`Field with ID ${fieldId} not found.`);
                }
            }
        } else {
            console.error("Field ID cannot be undefined.");
        }
    }

    const adjustmentAmountChange = (fieldValue: any) => {
        const adjustmentAmount = parseFloat(fieldValue.replace(/,/g, ''));
        const paymentMethodId = parseInt(ticketInformation.ticketDetails.find((d: any) => d.ticketFieldId === TICKET_FIELD.PaymentMethodId)?.ticketTypeFieldMappingValue ?? '0');
        const assigneeRequest: GetAssigneeListRequestModel = {
          statusId: parseInt(ticketStatus.statusId),
          ticketTypeId: ticketInformation.ticketTypeId,
          paymentMethodId: paymentMethodId,
          mlabPlayerId: selectedPlayer.mlabPlayerId,
          ticketId: ticketInformation.ticketId,
          departmentId: currentDepartment,
          adjustmentAmount: parseInt(ticketStatus.statusId) === TICKET_STATUSES.ForAdjustment ? adjustmentAmount : 0
        }
    
        getAssigneePopupListAsync(assigneeRequest)
    }

    const closeModal = () => {
        if (withDirtyForm) {
            swal({
                title: SwalTicketManagementConfirmMessage.title,
                text: SwalTicketManagementConfirmMessage.textDiscarded,
                icon: SwalTicketManagementConfirmMessage.icon,
                buttons: [SwalTicketManagementConfirmMessage.btnNo, SwalTicketManagementConfirmMessage.btnYes],
                dangerMode: true,
            }).then((response: any) => {
                if (response) {
                    handleCloseModal();
                    setWithDirtyForm(false)
                }
            });
        } else {
            handleCloseModal();
            setWithDirtyForm(false)
        }
    };

    const renderForReviewSection = (fieldMapping: any) => {
        let checkBoxFields: any;
        let displayFields: any = [];
        let ticketDetails: any = ticketInformation?.ticketDetails;
        const adjustedAmount: any = ticketDetails?.find((statusField: any) => statusField.ticketFieldId === TICKET_FIELD.AdjustmentAmount)?.ticketTypeFieldMappingValue
        const remarks: any = transactionData?.fmboTransactionData?.remarks ?? "";
        const currentStatusId: number = parseInt(ticketDetails?.find((statusField: any) => statusField.ticketFieldId === TICKET_FIELD.StatusId)?.ticketTypeFieldMappingValue ?? "0")
        const currentStatusName: any = ticketStatusHierarchy?.find(((x: any) => x.parentStatusId === currentStatusId))?.parentStatusName
        const currencyMethod: any = ticketDetails?.find((statusField: any) => statusField.ticketFieldId === TICKET_FIELD.CurrencyMethod)?.ticketTypeFieldMappingValue
        let isForReview: boolean = false;
        let wagerMultiplier: any = {};
        let reasonRemarks: any = {};

        // For checkbox        
        if (currentStatusId === TICKET_STATUSES.ForAdjustment || currentStatusId === TICKET_STATUSES.ForCrediting) {
            if (currentStatusId !== TICKET_STATUSES.ForCrediting) {
                checkBoxFields =
                    <div className="d-flex checkbox-container">
                        <input
                            className='form-check-input'
                            type='checkbox'
                            id='addManualBalanceCorrection'
                            onChange={(e: any) => handleMBCOnChange(e)}
                            checked={checkedMBC}
                        />
                        <div className='form-check-label'>Add Manual Balance Correction</div>
                    </div>

            } 
            else {
                isForReview = true
            }

            displayFields.push(<span>Current Status: {currentStatusName} </span>);
            displayFields.push(<span>Amount that will be added = {currencyMethod} {adjustedAmount} </span>);
            displayFields.push(<span className="amount-note">Amount is truncated for specific currency </span>);

        }
        else if (currentStatusId === TICKET_STATUSES.ForFmVerification || currentStatusId === TICKET_STATUSES.ForSmVerification) {
            checkBoxFields =   
                <div className="d-flex checkbox-container">
                        <input
                            className='form-check-input'
                            type='checkbox'
                            id='checkedHoldWithdrawal'
                            onChange={(e: any) => handleHoldWithdrawalChange(e)}
                            checked={checkedHoldWithdrawal}
                        />
                        <div className='form-check-label'>Hold Withdrawal</div>
                </div>
        }
        // For text display
        fieldMapping.filter((field: any) => field.isForReview === true).map((field: any, index: number) => {
            isForReview = field.isForReview;
            switch (field.fieldId) {
                case TICKET_FIELD.WagerMultiplier:
                    displayFields.push(<span>{field.fieldName} = {WAGER_MULTIPLIER.WagerMultiplierTag} </span>)
                    break;
                case TICKET_FIELD.StatusId:
                    displayFields.push(<span>{field.alternativeLabel} = {currentStatusName}</span>)
                    break;
                case TICKET_FIELD.Reason:
                    displayFields.push(<span>{field.fieldName} = {ticketCode} - {remarks} </span>)
                    break;
                default:
                    displayFields.push(<span>{field.fieldName} = {field.fieldValue}</span>)
                    break;
            }
        })

        return (
            isForReview &&
            <div className={(currentStatusId === TICKET_STATUSES.ForAdjustment || currentStatusId === TICKET_STATUSES.ForCrediting) ? "for-review-container" : ""}>
                {checkBoxFields}
                <div><span><strong>For Review</strong></span></div>
                {displayFields.map((x: any, idx: any) => <div key={x + idx}>{x}</div>)}
            </div>
        )
    }

    const handleMBCOnChange = (e: any) => {
        setCheckedMBC(e.target.checked);
    }

    const handleHoldWithdrawalChange = (e: any) => {
        setCheckedHoldWithdrawal(e.target.checked);
    }

    const insertIntegrationStatusInComment = async (errorMessage: any) => {
        const requestObj: TicketCommentRequestModel = {
            ticketId: ticketInformation?.ticketId ?? 0,
            ticketTypeId: ticketInformation?.ticketTypeId ?? 0,
            comment: errorMessage ?? "",
            ticketCommentId: 0,
            queueId: Guid.create().toString(),
            userId: userId?.toString() ?? "0"
        };

        await UpsertTicketComment(requestObj);

    }

    const handleAutoAssign =() => {
        const paymentMethodId = ticketInformation.ticketDetails.find((d: any) => d.ticketFieldId === TICKET_FIELD.PaymentMethodId)?.ticketTypeFieldMappingValue ?? '0'
        if (!paymentMethodId) return
        const adjustmentWithOutComma = currentDynamicTicketForm.find((d: any) => d.fieldId === TICKET_FIELD.AdjustmentAmount)?.fieldValue ?? '0'
        const adjustmentAmount = parseFloat(adjustmentWithOutComma.replace(/,/g, ''));
        const autoAssignedRequest: GetAutoAssignedIdRequestModel ={
          statusId: statusId,
          ticketTypeId: ticketInformation.ticketTypeId,
          paymentMethodId: parseInt(paymentMethodId),
          mlabPlayerId: ticketInformation?.ticketPlayerIds[0]?.mlabPlayerId ?? 0,
          ticketId: ticketInformation.ticketId,
          ticketCode: ticketCode,
          statusDescription: ticketStatus.statusName,
          departmentId: currentDepartment,
          adjustmentAmount: parseInt(ticketStatus.statusId) === TICKET_STATUSES.ForAdjustment ? adjustmentAmount : 0
        }
    
        getAutoAssignedId(autoAssignedRequest)
    }
    

    return (
        <FormModal headerTitle={headerTitleName} haveFooter={false} show={showModal} onHide={closeModal}>
            <FieldContainer>
                <div className='col-sm-9'>
                    {modalHeader}
                </div>
                
                <Row className="m-1">
                    {fieldMapping ? renderForReviewSection(fieldMapping) : null}
                </Row>
                <Row className="m-1">
                    {/* filter(//do not inclued for review is true). */}
                    {fieldMapping ? fieldMapping.filter((field: any) => field.isForReview === false || field.isForReview === undefined).map((field: any, index: number) => {
                        let idx = index
                        return (
                            <DynamicFormField
                                key={idx}
                                field={field}
                                dynamicTicketForm={dynamicTicketForm}
                                updateDynamicTicket={updateDynamicTicketForm}
                                ticketInformation={ticketInformation}
                                showAutoAssign={true}
                                viewOnly={false}
                                ticketCode={ticketCode} 
                                statusId={statusId}
                                autoAssignedId = {autoAssignedId}
                                statusDescription={ticketStatus?.statusName}
                                fromSearchPage={fromSearchPage}
                                fromModal={true}
                                businessReasonList={adjustmentBusinessList}
                                assigneeList ={assigneeList}
                                handleAutoAssign = {handleAutoAssign}
                            />
                        )
                    }) : null}
                </Row>

            </FieldContainer>
            <AddComment setComment={setConvertedComment} isFromModal={true} />
            <ModalFooter style={{ border: 0 }}>
                {
                    (
                        (!checkedMBC)
                    ) && (
                        <div className="amount-note">Please add Manual Balance Correction manually <a href={`https://mcorebo.com/BOPortal/Player/Finance/` + selectedPlayer.playerId}><strong>Click Here to open the MCORE BO</strong></a></div>
                    )
                }
                {
                    (
                        (parseInt(ticketInformation?.ticketDetails?.find((statusField: any) => statusField.ticketFieldId === TICKET_FIELD.StatusId)?.ticketTypeFieldMappingValue ?? '0') === TICKET_STATUSES.ForCrediting)
                    ) && (
                        <div className="amount-note">Please credit the balance manually <a href={`https://account.fmbo.cc/`}><strong>Click Here to open the PMS/FMBO</strong></a></div>
                    )
                }
                <MlabButton
                    size={'sm'}
                    label={'Submit'}
                    style={ElementStyle.primary}
                    type={'button'}
                    weight={'solid'}
                    loading={isLoading || saveLoading}
                    disabled={isLoading || saveLoading}
                    loadingTitle={' Please wait...'}
                    onClick={handleSubmit}
                    access={true}
                ></MlabButton>
                <DefaultSecondaryButton access={true} title={'Close'} onClick={closeModal} />
            </ModalFooter>
        </FormModal>
    )
}

export default EditTicketModal;