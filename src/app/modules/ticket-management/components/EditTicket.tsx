import {Guid} from 'guid-typescript';
import {useContext, useEffect, useState} from 'react';
import {Col} from 'react-bootstrap-v5';
import {shallowEqual, useSelector} from 'react-redux';
import {useHistory, useParams} from 'react-router-dom';
import swal from 'sweetalert';
import {RootState} from '../../../../setup';
import {ElementStyle} from '../../../constants/Constants';
import useConstant from '../../../constants/useConstant';
import {MlabButton} from '../../../custom-components';
import {usePromptOnUnload} from '../../../custom-helpers';
import {IAuthState} from '../../auth';
import useTicketConstant from '../constants/TicketConstant';
import {TICKET_DEFAULT} from '../constants/TicketDefault';
import {TicketContext} from '../context/TicketContext';
import {TicketInfoModel} from '../models/TicketInfoModel';
import {TicketPlayerModel} from '../models/TicketPlayerModel';
import {AddUserCollaboratorRequestModel} from '../models/request/AddUserCollaboratorRequestModel';
import {FmboTransactionDataRequestModel} from '../models/request/FmboTransactionDataRequestModel';
import {GetAssigneeListRequestModel} from '../models/request/GetAssigneeListRequestModel';
import {GetMlabRequestModel} from '../models/request/GetMlabRequestModel';
import {GetTicketThresholdRequestModel} from '../models/request/GetTicketThresholdRequestModel';
import {SaveTicketDetailsRequestModel} from '../models/request/SaveTicketDetailsRequestModel';
import {TicketDetailsRequestModel} from '../models/request/TicketDetailsRequestModel';
import {TicketPlayerRequestModel} from '../models/request/TicketPlayerRequestModel';
import {TransactionStatusReferenceResponseModel} from '../models/response/TransactionStatusReferenceResponseModel';
import {DynamicTicketModel} from '../models/ticket-config/DynamicTicketModel';
import {FieldMappingResponseModel} from '../models/ticket-config/FieldMappingResponseModel';
import {TextInputSearchValidationModel} from '../models/ticket-config/TextInputSearchValidationModel';
import TicketSectioning from '../shared/components/TicketSectioning';
import EditTicketModal from '../shared/components/modals/EditTicketModal';
import {useTicketConfigurationHooks} from '../shared/hooks/useTicketConfigurationHooks';
import {useTicketManagementHooks} from '../shared/hooks/useTicketManagementHooks';
import useTicketSharedEffectHooks from '../shared/hooks/useTicketSharedEffectHooks';
import {
	CheckForUnvalidatedTextInputSearch,
	IsNotPlatformOrPaymentStatus,
	UpdateTicketFieldValue,
	checkForUnvalidatedPlayers,
	moldingDynamicTicketForm,
	pushTo401,
	reactivateTicketField,
	splitTicketCode,
	textInputSearchValidationArr,
	ticketHeaderCode,
	updateTextInputSearchValidationList,
	updateTicketForm,
	updateUnverifyTextInputSearchValidationList,
	updatingDynamicTicketForm,
	validateFormTicketFields,
} from '../utils/helper';
import MainContainerSticky from '../../../custom-components/containers/SubCardContainerSticky';
import StatusActionButton from '../shared/components/StatusActionButton';

const EditTicket = ({getTicketSummary}: any) => {
	const [ticketMapping, setTicketMapping] = useState<FieldMappingResponseModel[]>();
	const [selectedTicketConfigCodeEdit, setSelectedTicketConfigCodeEdit] = useState<string>();
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const {userId, fullName} = useSelector<RootState>(({auth}) => auth, shallowEqual) as IAuthState;
	const {
		upsertTicketDetails,
		isUpsertLoading,
		isUpsertSuccess,
		getTicketStatusMapping,
		ticketStatusPopupMapping,
		validateAccess,
		getHiddenPaymentMethodTicketFields,
		hiddenTicketFields,
		transactionFieldMapping,
		mapTransactionStatusFields,
		getTransactionField,
		numberFetchApi,
		newTransactionData,
		validationForInvalidTransaction,
		searchTransactionData,
		fetchLatestTransactionData,
		validateAddUserAsCollaborator,
		setApiStatusDescription,
		extractHistoryData,
		updateStatus,
	} = useTicketManagementHooks();
	const {getCustomGrouping, ticketCustomGroupings} = useTicketConfigurationHooks();
	const {ticketCode}: {ticketCode: string} = useParams();
	const history = useHistory();
	const {SwalTicketManagementConfirmMessage, SwalTicketManagementFailedMessage, SwalFailedMessage, TicketManagementConstants} = useConstant();
	const [hasLeftSection, setHasLeftSection] = useState<boolean>(false);
	const [hasRightSection, setHasRightSection] = useState<boolean>(false);
	const [hasRightCustomSection, setHasRightCustomSection] = useState<boolean>(false);
	const [dynamicTicketForm, setDynamicTicketForm] = useState<DynamicTicketModel[]>([]); // to be filled initially after ticket type is selected
	const [ticketInfo, setTicketInfo] = useState<TicketInfoModel>(TICKET_DEFAULT);
	const [queriedPlayerId, setQueriedPlayerId] = useState<TicketPlayerModel[]>([]);
	const [textInputValidationArr, setTextInputValidationArr] = useState<TextInputSearchValidationModel[]>([]);
	const {TICKET_SECTION, TICKET_GROUP, MESSAGE, TICKET_FIELD, TICKET_COMPONENT, TICKET_TYPE, FMBO_TYPE, TRANSACTION_TAG, TICKET_STATUSES} =
		useTicketConstant();
	const userAccess = useSelector<RootState>(({auth}) => auth.access, shallowEqual) as string;
	const [showEditTicketModal, setShowEditTicketModal] = useState<boolean>(false);
	usePromptOnUnload(true, MESSAGE.LeaveConfirmation); // To have a pop up that triggers when page would be refreshed or closed
	const [paymentMethodExtId, setPaymentMethodExtId] = useState<number>(0);
	const {
		getTransactionStatusReferenceAsync,
		transactionStatusReference,
		setCurrentTicketInfo,
		getPlayerInfoByFilterAsync,
		getTicketThresholdsAsync,
		setCurrentPlatformStatus,
		setCurrentPaymentStatus,
		selectedPlayer,
		getLatestTransactionDataAsync,
		getAssigneeListAsync,
		assigneeList,
		getTicketInformationByTicketCodeAsync,
		ticketInformation,
		getTicketConfigTypesAsync,
		ticketConfigTypes,
		getFieldMappingAsync,
		ticketFieldMapping,
		selectedLatestTransactionData,
		setCurrentDepartmentId,
		fetchingError
	} = useContext(TicketContext);
	const [selectedTicketType, setSelectedTicketType] = useState<number>(0);

	useEffect(() => {
		getTransactionStatusReferenceAsync();
		getTicketConfigTypesAsync();
	}, []);

	useEffect(() => {
    if(fetchingError) {
      const platFormStatusId = ticketInformation.ticketDetails.find((d: any) => d.ticketFieldId === TICKET_FIELD.PlatformStatusId)?.ticketTypeFieldMappingValue ?? '0'
      setCurrentPlatformStatus(parseInt(platFormStatusId))
    }
  },[fetchingError])
 

	const validateUserInEditAsCollaborator = (ticketId: any, ticketTypeId: any) => {
		const requestObj: AddUserCollaboratorRequestModel = {
			userId: parseInt(userId ?? '0'),
			username: fullName ?? '',
			ticketId: ticketId,
			tIcketTypeId: ticketTypeId,
			createdBy: parseInt(userId ?? '0'),
		};

		validateAddUserAsCollaborator(requestObj);
	};

	useTicketSharedEffectHooks(getTicketSummary);

	useEffect(() => {
		if (numberFetchApi > 0 && newTransactionData) {
			if (newTransactionData.mlabTransactionData || newTransactionData.iCoreTransactionData || newTransactionData.fmboTransactionData) {
				const validatedData = validationForInvalidTransaction(newTransactionData);
				newTransactionData.iCoreTransactionData = validatedData.iCoreTransactionData;
				newTransactionData.fmboTransactionData = validatedData.fmboTransactionData;

				const updatedForm = updateTicketForm(transactionFieldMapping, dynamicTicketForm, newTransactionData);
				const getUpdatedTextSearchValidation: TextInputSearchValidationModel[] = updateTextInputSearchValidationList(
					updatedForm,
					textInputValidationArr
				);
				setTextInputValidationArr([...getUpdatedTextSearchValidation]);

				const dynamicformWithStatus = setApiStatusDescription(updatedForm, newTransactionData, transactionStatusReference);
				const dynamicFormDesc = mapTransactionStatusFields(dynamicformWithStatus, transactionStatusReference);
				setDynamicTicketForm(dynamicFormDesc ?? []);
			}
		}
	}, [numberFetchApi, newTransactionData]);

	useEffect(() => {
		if (!ticketConfigTypes || ticketConfigTypes.length === 0) return;
		const processedTicketCode = splitTicketCode(ticketCode, ticketConfigTypes);
		if (!processedTicketCode.ticketTypeId) {
			pushTo401(history);
		} else {
			validateAccess(userAccess, history, processedTicketCode.ticketTypeId, TICKET_COMPONENT.Edit);
			setSelectedTicketConfigCodeEdit(ticketHeaderCode(ticketConfigTypes , processedTicketCode.ticketTypeId , ticketCode));
			const ticketRequest: TicketDetailsRequestModel = {
				ticketTypeSequenceId: processedTicketCode.ticketTypeSequenceId,
				ticketTypeId: processedTicketCode.ticketTypeId,
			};
			getTicketInformationByTicketCodeAsync(ticketRequest);
			getTicketStatusMapping(processedTicketCode.ticketTypeId);
			getFieldMappingAsync(processedTicketCode.ticketTypeId.toString());
			getCustomGrouping(processedTicketCode.ticketTypeId.toString());
			getTicketStatusMapping(processedTicketCode.ticketTypeId);
			setSelectedTicketType(processedTicketCode.ticketTypeId);
		}

		return () => {};
	}, [ticketConfigTypes]);

	useEffect(() => {
		if (ticketFieldMapping.length > 0 && ticketInformation.ticketId > 0 && dynamicTicketForm){
			const queriedDataInTicketForm = UpdateTicketFieldValue(ticketInformation.ticketDetails, dynamicTicketForm);
			setDynamicTicketForm(queriedDataInTicketForm);

			setCurrentTicketInfo(ticketInformation);
			setTicketInfo(ticketInformation);			
			const { playerId, mlabPlayerId } = ticketInformation?.ticketPlayerIds[0] ?? { playerId: '', mlabPlayerId: 0}
			const request: TicketPlayerRequestModel = {
				BrandId: ticketInformation.ticketPlayerIds[0].brandID,
				PlayerId: playerId,
				PlayerUsername: '',
			};
			getPlayerInfoByFilterAsync(request);
			const thresholdRequest: GetTicketThresholdRequestModel = {
				mlabPlayerId: mlabPlayerId,
				ticketTypeId: ticketInformation.ticketTypeId,
			};
			getTicketThresholdsAsync(thresholdRequest);
			const statusId = ticketInformation.ticketDetails.find((d: any) => d.ticketFieldId === TICKET_FIELD.StatusId)?.ticketTypeFieldMappingValue ?? '';
			const paymentMethodId =
				ticketInformation.ticketDetails.find((d: any) => d.ticketFieldId === TICKET_FIELD.PaymentMethodId)?.ticketTypeFieldMappingValue ?? '';
			const departmentId = parseInt(
				ticketInformation.ticketDetails.find((d: any) => d.ticketFieldId === TICKET_FIELD.Department)?.ticketTypeFieldMappingValue ?? '0'
			);
	
			const adjustmentNoComma = ticketInformation.ticketDetails.find((d: any) => d.ticketFieldId === TICKET_FIELD.AdjustmentAmount)?.ticketTypeFieldMappingValue ?? '0'
			const adjustment = parseFloat(adjustmentNoComma.replace(/,/g, ''));
			setCurrentDepartmentId(departmentId);
			const assigneeRequest: GetAssigneeListRequestModel = {
				statusId: parseInt(statusId),
				ticketTypeId: ticketInformation.ticketTypeId,
				paymentMethodId: parseInt(paymentMethodId),
				mlabPlayerId: mlabPlayerId,
				ticketId: ticketInformation.ticketId,
				departmentId: departmentId,
				adjustmentAmount: parseInt(statusId) === TICKET_STATUSES.ForAdjustment ? adjustment : 0
			};

			getAssigneeListAsync(assigneeRequest);
			loadEditDetails(ticketFieldMapping, ticketInformation);
			validateUserInEditAsCollaborator(ticketInformation.ticketId, ticketInformation.ticketTypeId);
			getTransactionField(ticketInformation.ticketTypeId);
		}
	}, [ticketInformation, ticketFieldMapping]);

	useEffect(() => {
		if (selectedPlayer && selectedPlayer.mlabPlayerId > 0) {
			const ticketStatusId =
				ticketInformation.ticketDetails.find((d: any) => d.ticketFieldId === TICKET_FIELD.StatusId)?.ticketTypeFieldMappingValue ?? '';
			const platformTransactionid =
				ticketInformation.ticketDetails.find((d: any) => d.ticketFieldId === TICKET_FIELD.PlatformTransactionId)?.ticketTypeFieldMappingValue ?? '';
			if (
				parseInt(ticketStatusId) !== TICKET_STATUSES.Done &&
				parseInt(ticketStatusId) !== TICKET_STATUSES.Cancelled &&
				platformTransactionid !== ''
			) {
				const request = fetchLatestTransactionData(ticketInformation, selectedPlayer, userId);
				getLatestTransactionDataAsync(request);
			}
			else {
				const platFormTransactionStatusId =ticketInformation.ticketDetails.find((d: any) => d.ticketFieldId === TICKET_FIELD.PlatformStatusId)?.ticketTypeFieldMappingValue ?? '0'
				setCurrentPlatformStatus(parseInt(platFormTransactionStatusId))
			}
		}
	}, [selectedPlayer]);

	useEffect(() => {
		const paymentMethodEditId = Number(dynamicTicketForm.find((dEdit: any) => dEdit.fieldId === TICKET_FIELD.PaymentMethodId)?.fieldValue ?? 0);
		setPaymentMethodExtId(paymentMethodEditId);
	}, [dynamicTicketForm]);

	useEffect(() => {
		if (paymentMethodExtId) {
			getHiddenPaymentMethodTicketFields(TICKET_TYPE.MissingDeposit, paymentMethodExtId, TicketManagementConstants.EDIT);
		}
	}, [paymentMethodExtId]);

	useEffect(() => {
		if (!ticketCustomGroupings) return;
		const chkCustomRightSection = ticketCustomGroupings.some((fields: any) => fields.ticketCustomId === TICKET_GROUP.Player);
		setHasRightCustomSection(chkCustomRightSection);

		return () => {};
	}, [ticketCustomGroupings]);

	useEffect(() => {
		setIsLoading(isUpsertLoading);
		if (isUpsertSuccess && !isUpsertLoading) {
			setTimeout(() => {
				history.push(`/ticket-management/view-ticket/${ticketCode}`);
			}, 2000);
		}
		return () => {};
	}, [isUpsertLoading, isUpsertSuccess]);

	useEffect(() => {
		const extractHiddenFields = (fieldId: any) => {
			return hiddenTicketFields.find((hidden) => hidden.fieldId === fieldId);
		};
		const updateEditFields = (editFields: any[]) => {
			if (editFields && hiddenTicketFields) {
				return editFields.map((field: any) => {
					const hiddenEditField = extractHiddenFields(field.fieldId);
					if (hiddenEditField) {
						return {
							...field,
							isSupersedeHidden: true,
							isSupersedeOptional: hiddenEditField.isOptional,
							mode: TicketManagementConstants.PageModeEdit,
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
		if (ticketMapping !== undefined) {
			const ticketMappingUpdated = updateEditFields(ticketMapping);
			setTicketMapping(ticketMappingUpdated);
		}
		const dynamicFieldsUpdated = updateEditFields(dynamicTicketForm);
		if (dynamicFieldsUpdated.length > 0) {
			setDynamicTicketForm(dynamicFieldsUpdated);
		}
	}, [hiddenTicketFields]);

	useEffect(() => {
		if (selectedLatestTransactionData && selectedLatestTransactionData.iCoreTransactionData?.transactionId !== '' && transactionStatusReference) {
			const transactionId = selectedLatestTransactionData.iCoreTransactionData?.transactionId ?? '';
			const providerTransactionId = selectedLatestTransactionData?.fmboTransactionData?.providerTransactionId ?? '';
			if (transactionId !== '' && providerTransactionId !== '' && selectedLatestTransactionData) {
				setStatusDescription(selectedLatestTransactionData);
				setCurrentStatus();
				updateStatus(dynamicTicketForm, selectedLatestTransactionData);
			}
		}
	}, [selectedLatestTransactionData]);

	const setCurrentStatus = () => {
		const icore = transactionStatusReference?.find(
			(d: TransactionStatusReferenceResponseModel) =>
				d.apiStatusId === selectedLatestTransactionData.iCoreTransactionData?.transactionStatusId && d.transactionTag === TRANSACTION_TAG.ICORE
		);
		const fmbo = transactionStatusReference?.find(
			(d: TransactionStatusReferenceResponseModel) =>
				d.apiStatusId === selectedLatestTransactionData.fmboTransactionData?.paymentSystemTransactionStatusId &&
				d.transactionTag === TRANSACTION_TAG.FMBO
		);
		const icoreReferenceStatusId = icore?.staticReferenceId ?? 0;
		const fmboReferenceStatusId = fmbo?.staticReferenceId ?? 0;
		setCurrentPlatformStatus(icoreReferenceStatusId);
		setCurrentPaymentStatus(fmboReferenceStatusId);
	};

	const setStatusDescription = (transactionData: any) => {
		const updatedForm = setApiStatusDescription(dynamicTicketForm, transactionData, transactionStatusReference);
		const dynamicWithDesc = mapTransactionStatusFields(updatedForm, transactionStatusReference);
		setDynamicTicketForm(dynamicWithDesc ?? []);
	};

	const verifiedPlayerId = (playerId: string, mlabPlayerId: number) => {
		const affectedUpsertPlayer: Array<TicketPlayerModel> = [{ticketPlayerId: '0', brandID: 0, playerId: playerId, mlabPlayerId: mlabPlayerId}]; //This can only handle single player affected
		setQueriedPlayerId(affectedUpsertPlayer);
	};

	const handleTextInputSearching = async (fieldId: string | number, fieldValue: string) => {
		const hasUnvalidatedPlayersForEdit = await checkForUnvalidatedPlayers(queriedPlayerId);
		if (hasUnvalidatedPlayersForEdit) {
			swal(SwalFailedMessage.title, SwalTicketManagementFailedMessage.playerUnverified, SwalFailedMessage.icon);
			setTimeout(() => {
				setDynamicTicketForm([...dynamicTicketForm]);
			}, 1000); // refresh dynamic ticket form with same values to trigger set to false on search text input component
		}

		let request: GetMlabRequestModel = {
			transactionId: '',
			mlabPlayerId: queriedPlayerId != undefined ? queriedPlayerId[0].mlabPlayerId : 0,
			playerId: queriedPlayerId != undefined ? queriedPlayerId[0].playerId : '0',
			providerTransactionid: '',
			userId: parseInt(userId ?? '0'),
		};
		const fmboRequest: FmboTransactionDataRequestModel = {
			source: FMBO_TYPE.Deposit,
			transactionId: '',
			userId: request.userId ?? 0,
		};
		switch (fieldId) {
			case TICKET_FIELD.PlatformTransactionId:
				request.transactionId = fieldValue;
				searchTransactionData(request, true, fieldValue, '');
				break;
			case TICKET_FIELD.PaymentSystemTransactionId:
				request.transactionId = '';
				request.providerTransactionid = fieldValue;
				fmboRequest.transactionId = fieldValue;
				searchTransactionData(request, false, '', fieldValue, fmboRequest);
				break;
			default:
				break;
		}
	};

	const handleUpdateTicket = async () => {
		setIsLoading(true);
		const isFormFulfilled = await validateFormTicketFields(dynamicTicketForm);
		if (!isFormFulfilled) {
			swal(SwalFailedMessage.title, SwalFailedMessage.textMandatory, SwalFailedMessage.icon);
			setIsLoading(false);
			return;
		}
		const hasUnvalidatedPlayers = await checkForUnvalidatedPlayers(queriedPlayerId);
		if (hasUnvalidatedPlayers) {
			swal(SwalFailedMessage.title, SwalTicketManagementFailedMessage.playerUnverified, SwalFailedMessage.icon);
			setIsLoading(false);
			return;
		}
		const hasUnvalidatedSearchFields = await CheckForUnvalidatedTextInputSearch(textInputValidationArr, hiddenTicketFields);
		if (hasUnvalidatedSearchFields) {
			setIsLoading(false);
			return;
		}

		setShowEditTicketModal(true);
	};

	const updateTicket = () => {
		const request: SaveTicketDetailsRequestModel = {
			ticketId: ticketInfo.ticketId,
			ticketTypeId: ticketInfo.ticketTypeId,
			ticketPlayerIds: ticketInformation.ticketPlayerIds ?? [],
			ticketAttachments: ticketInfo.ticketAttachments,
			//exclude fieldId of the audit trails to prevent redundancy
			ticketDetails:
				dynamicTicketForm
					?.filter((x: any) => !TICKET_FIELD.AuditTrail.includes(parseInt(x.fieldId)))
					?.map((x) => ({
						ticketFieldMappingId: x.fieldMappingId,
						ticketFieldMappingValue: x.externalFieldValue?.toString() ?? (x.fieldValue ?? '').toString(),
					})) ?? [],
			ticketHistoryLabelType: extractHistoryData(dynamicTicketForm.filter(IsNotPlatformOrPaymentStatus)).filter((a) => a.oldValue !== null),
			queueId: Guid.create().toString(),
			userId: userId?.toString() ?? '0',
		};
		upsertTicketDetails(request);
	};

	const updateDynamicTicket = (fieldId: number, fieldValue: any, userInput: boolean = false) => {
		if (!dynamicTicketForm || dynamicTicketForm.length === 0) return
		const updatedForm = updatingDynamicTicketForm(dynamicTicketForm, fieldId, fieldValue)
		setDynamicTicketForm(updatedForm)
	}

	const handleDiscardChanges = () => {
		swal({
			title: SwalTicketManagementConfirmMessage.title,
			text: SwalTicketManagementConfirmMessage.textDiscarded,
			icon: SwalTicketManagementConfirmMessage.icon,
			buttons: [SwalTicketManagementConfirmMessage.btnNo, SwalTicketManagementConfirmMessage.btnYes],
			dangerMode: true,
		}).then((onConfirm) => {
			if(onConfirm) history.push(`/ticket-management/view-ticket/${ticketCode}`);
		});
	};

	const updateTextInputSearchValidation = (fieldMappingId: number) => {
		setTextInputValidationArr(updateUnverifyTextInputSearchValidationList(textInputValidationArr, fieldMappingId) ?? []);
	};

	const submitModal = () => {
		history.push(`/ticket-management/view-ticket/${ticketCode}`);
	};

	const handleCloseModal = () => {
		setShowEditTicketModal(false);
		setIsLoading(false);
	};

	const handleSubmitModal = async () => {
		setShowEditTicketModal(false);
		updateTicket();
	};

	const loadEditDetails = (ticketFieldMapping: any, ticketInformation: any) => {
		const activeFieldsEditTicket = ticketFieldMapping.filter((fields: any) => fields.hasEdit === true && fields.fieldId !== 1);
		const abstractTicketForm: DynamicTicketModel[] = moldingDynamicTicketForm(activeFieldsEditTicket);

		const chkLeftSection = activeFieldsEditTicket.some((fields: any) => fields.ticketSectionId === TICKET_SECTION.Left);
		setHasLeftSection(chkLeftSection);
		const chkRightSection = activeFieldsEditTicket.some((fields: any) => fields.ticketSectionId === TICKET_SECTION.Right);
		setHasRightSection(chkRightSection);
		const queriedDataInTicketForm = UpdateTicketFieldValue(ticketInformation.ticketDetails, abstractTicketForm);
		setTicketMapping(activeFieldsEditTicket);
		const reactivatedFields = reactivateTicketField(ticketFieldMapping, queriedDataInTicketForm);
		setTextInputValidationArr(
			updateTextInputSearchValidationList(queriedDataInTicketForm ?? [], textInputSearchValidationArr(activeFieldsEditTicket))
		);

		const dynamicFormDesc = mapTransactionStatusFields(queriedDataInTicketForm, transactionStatusReference);
		setDynamicTicketForm(dynamicFormDesc ?? []);

		const paymentMethodId = Number(reactivatedFields?.find((x) => x.fieldId === TICKET_FIELD.PaymentMethodId)?.fieldValue) || 0;

		if (paymentMethodId) {
			getHiddenPaymentMethodTicketFields(TICKET_TYPE.MissingDeposit, paymentMethodId, TicketManagementConstants.EDIT);
		}
	};

	return (
		<>
			<MainContainerSticky>
					<div className='p-4'>
						<Col sm={12}>
								<div className='d-flex align-items-baseline justify-content-between p-2'>
									<div className='d-flex align-items-center'>
										<p className='fw-bolder mb-0'>{selectedTicketConfigCodeEdit}</p>
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
											label={'Submit'}
											access={true}
											style={ElementStyle.primary}
											weight={'solid'}
											onClick={handleUpdateTicket}
											loading={isLoading}
											loadingTitle='Please wait...'
											disabled={isLoading}
										/>
										<MlabButton
											loading={isLoading}
											loadingTitle={'Please wait ...'}
											access={true}
											size={'sm'}
											label={'Cancel'}
											style={ElementStyle.secondary}
											type={'button'}
											weight={'solid'}
											onClick={handleDiscardChanges}
											disabled={isLoading}
										/>
									</div>
								</div>
							</Col>
					</div>
			</MainContainerSticky>
			<div style={{padding: '0.5rem'}}></div>
			<TicketSectioning
				ticketMapping={ticketMapping}
				hasLeftSection={hasLeftSection}
				hasRightSection={hasRightSection || hasRightCustomSection}
				selectedTicketConfig={selectedTicketType}
				ticketCustomGroupings={ticketCustomGroupings}
				isAddForm={false}
				updateDynamicTicket={updateDynamicTicket}
				dynamicTicketForm={dynamicTicketForm}
				ticketInfo={ticketInformation}
				setTicketInfo={setTicketInfo}
				userId={userId}
				handleTextInputSearching={handleTextInputSearching}
				displayComment={ticketCustomGroupings?.find((custom: any) => custom.ticketCustomId === TICKET_GROUP.Comment)?.hasEdit}
				updateTextInputSearchValidation={updateTextInputSearchValidation}
				showAutoAssign={false}
				assigneeList={assigneeList}
				ticketStatusPopupMapping={ticketStatusPopupMapping}
				ticketCode={ticketCode}
				submitModal={submitModal}
				allFieldMapping={ticketFieldMapping}
				transactionStatusReference={transactionStatusReference}
				verifiedPlayerId={verifiedPlayerId}
			/>
			<EditTicketModal
				showModal={showEditTicketModal}
				ticketStatus={''}
				handleCloseModal={handleCloseModal}
				dynamicTicketForm={dynamicTicketForm}
				userId={userId}
				handleSubmitModal={handleSubmitModal}
				ticketCode={ticketCode}
				updatingTicket={true}
				assigneeList={[]}
			></EditTicketModal>
		</>
	);
};

export default EditTicket;
