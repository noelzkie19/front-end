import {Guid} from 'guid-typescript';
import {useContext, useEffect, useState} from 'react';
import {Col} from 'react-bootstrap-v5';
import {shallowEqual, useSelector} from 'react-redux';
import {useHistory} from 'react-router-dom';
import swal from 'sweetalert';
import {RootState} from '../../../../setup';
import * as hubConnection from '../../../../setup/hub/MessagingHub';
import {ElementStyle} from '../../../constants/Constants';
import useConstant from '../../../constants/useConstant';
import {MlabButton} from '../../../custom-components';
import {usePromptOnUnload} from '../../../custom-helpers';
import {LookupModel} from '../../../shared-models/LookupModel';
import {disableSplashScreen, enableSplashScreen} from '../../../utils/helper';
import {IAuthState} from '../../auth';
import useTicketConstant from '../constants/TicketConstant';
import {TICKET_DEFAULT} from '../constants/TicketDefault';
import {TicketContext} from '../context/TicketContext';
import {TicketInfoModel} from '../models/TicketInfoModel';
import {TicketPlayerModel} from '../models/TicketPlayerModel';
import {FmboTransactionDataRequestModel} from '../models/request/FmboTransactionDataRequestModel';
import {GetAssigneeListRequestModel} from '../models/request/GetAssigneeListRequestModel';
import {GetAutoAssignedIdRequestModel} from '../models/request/GetAutoAssignedIdRequestModel';
import {GetMlabRequestModel} from '../models/request/GetMlabRequestModel';
import {SaveTicketDetailsRequestModel} from '../models/request/SaveTicketDetailsRequestModel';
import {DynamicTicketModel} from '../models/ticket-config/DynamicTicketModel';
import {TextInputSearchValidationModel} from '../models/ticket-config/TextInputSearchValidationModel';
import {SaveTicketDetails} from '../services/TicketManagementApi';
import TicketSectioning from '../shared/components/TicketSectioning';
import {useTicketConfigurationHooks} from '../shared/hooks/useTicketConfigurationHooks';
import {useTicketManagementHooks} from '../shared/hooks/useTicketManagementHooks';
import {
	CheckForUnvalidatedTextInputSearch,
	checkForUnvalidatedPlayers,
	moldingDynamicTicketForm,
	textInputSearchValidationArr,
	ticketHeaderCode,
	updateTextInputSearchValidationList,
	updateTicketForm,
	updateUnverifyTextInputSearchValidationList,
	validateFormTicketFields,
} from '../utils/helper';
import MainContainerSticky from '../../../custom-components/containers/SubCardContainerSticky';
import StatusActionButton from '../shared/components/StatusActionButton';
import { GetAllProcessorResponseModel } from '../models/response/GetAllProcessorResponseModel';
const AddTicket = () => {
	const history = useHistory();
	const [ticketMapping, setTicketMapping] = useState<any>();
	const [ticketCustomGroupMapping, setTicketCustomGroupMapping] = useState<any>();
	const [selectedTicketConfig, setSelectedTicketConfig] = useState<LookupModel>();
	const [selectedTicketConfigCode, setSelectedTicketConfigCode] = useState<string>('');
	const [hasLeftSection, setHasLeftSection] = useState<boolean>(false);
	const [hasRightSection, setHasRightSection] = useState<boolean>(false);
	const [hasRightCustomSection, setHasRightCustomSection] = useState<boolean>(false);
	const [queriedPlayerId, setQueriedPlayerId] = useState<TicketPlayerModel[]>([]);
	const [dynamicTicketForm, setDynamicTicketForm] = useState<DynamicTicketModel[]>([]); // to be filled initially after ticket type is selected
	const [callSign, setCallSign] = useState<string>('');
	const [paymentMethodName, setPaymentMethodName] = useState<string>('');
	const [saveLoading, setSaveLoading] = useState<boolean>(false);
	const [textInputValidationArr, setTextInputValidationArr] = useState<TextInputSearchValidationModel[]>([]);
	const {
		getTransactionField,
		transactionFieldMapping,
		validateAccess,
		getHiddenPaymentMethodTicketFields,
		hiddenTicketFields,
		searchTransactionData,
		newTransactionData,
		validationForInvalidTransaction,
		numberFetchApi,
		setApiStatusDescription,
		mapTransactionStatusFields,
		extractHistoryData,
		getSourceRequest,
	} = useTicketManagementHooks();
	const {getCustomGrouping, ticketCustomGroupings} = useTicketConfigurationHooks();
	const {
		SwalFailedMessage,
		SwalTicketManagementConfirmMessage,
		SwalTicketManagementFailedMessage,
		HubConnected,
		successResponse,
		SwalServerErrorMessage,
		SwalTicketSuccessRecordMessage,
		TicketManagementConstants,
	} = useConstant();
	const [ticketInfo, setTicketInfo] = useState<TicketInfoModel>(TICKET_DEFAULT);
	const {userId} = useSelector<RootState>(({auth}) => auth, shallowEqual) as IAuthState;
	const [ticketTypeOptionList, setTicketTypeOptionList] = useState<LookupModel[]>([]);
	const {TICKET_SECTION, TICKET_GROUP, TICKET_FIELD, TICKET_COMPONENT, TICKET_TYPE, TICKET_TYPE_STATUS, WITHDRAWAL_MISSING_TYPE} =
		useTicketConstant();
	const userAccess = useSelector<RootState>(({auth}) => auth.access, shallowEqual) as string;
	const [selectedTicketTypeId, setSelectedTicketTypeId] = useState<number>(0);
	const [paymentMethodExtId, setPaymentMethodExtId] = useState<number>(0);
	const {
		getTransactionStatusReferenceAsync,
		transactionStatusReference,
		selectedPlayer,
		getAssigneeListAsync,
		assigneeList,
		isFetchedPlayer,
		getAutoAssignedId,
		autoAssignedId,
		setCurrentPaymentMethod,
		currentPaymentMethodId,
		isFetchedAssigneeList,
		getTicketConfigTypesAsync,
		ticketConfigTypes,
		getFieldMappingAsync,
		ticketFieldMapping,
		setCurrentDepartmentId,
		currentDepartment,
		processorData,
		getAllProcessorListAsync
	} = useContext(TicketContext);
	const [ticketTypeStatus, setTicketTypeStatus] = useState<string>('');


	usePromptOnUnload(true, ''); // To have a pop up that triggers when page would be refreshed or closed

	useEffect(() => {
		validateAccess(userAccess, history, 0, TICKET_COMPONENT.Add);
		getTransactionStatusReferenceAsync();
		getTicketConfigTypesAsync();
		getAllProcessorListAsync()
	}, []);

	useEffect(() => {
		if (newTransactionData && numberFetchApi > 0) {
			if (newTransactionData.iCoreTransactionData || newTransactionData.fmboTransactionData || newTransactionData.mlabTransactionData) {
				const validateData = validationForInvalidTransaction(newTransactionData);
				newTransactionData.iCoreTransactionData = validateData ? validateData.iCoreTransactionData : newTransactionData.iCoreTransactionData;
				newTransactionData.fmboTransactionData = validateData ? validateData.fmboTransactionData : newTransactionData.fmboTransactionData;

				setForm(newTransactionData);
			}
		}
	}, [newTransactionData, numberFetchApi]);

	const setForm = (newTransactionData: any) => {
		const newForm = updateTicketForm(transactionFieldMapping, dynamicTicketForm, newTransactionData);
		const getUpdatedSearchValidation: TextInputSearchValidationModel[] = updateTextInputSearchValidationList(newForm, textInputValidationArr);
		setTextInputValidationArr([...getUpdatedSearchValidation]);

		
		if(selectedTicketTypeId === TICKET_TYPE.MissingWithdrawal && newTransactionData.fmboTransactionData){
			
			const paymentProcessor = newTransactionData.fmboTransactionData.paymentProcessor ?? '';
			if(!processorData.find((d: GetAllProcessorResponseModel) => d.paymentProcessorName.toLowerCase().toString() === paymentProcessor.toLowerCase())){
				swal(SwalFailedMessage.title,TicketManagementConstants.NoProcessor.replace("{0}", paymentProcessor), SwalFailedMessage.icon);
				newForm.map((d: any) => {
					if (d.fieldId === TICKET_FIELD.PaymentProcessor) {
						d.fieldValue = ""
					}
				});
			}
		
		}

		 if (selectedTicketTypeId === TICKET_TYPE.MissingWithdrawal || selectedTicketTypeId === TICKET_TYPE.MissingDeposit) {
			const getIndex = newForm.findIndex((item: any) => item.fieldId === TICKET_FIELD.TransactionAmount);
			const replaceIndex = newForm.findIndex((item: any) => item.fieldId === TICKET_FIELD.MissingAmount);

			newForm[replaceIndex].fieldValue = newForm[getIndex].fieldValue;
			setDynamicTicketForm([...newForm]);
		}

		const formWithStatus = setApiStatusDescription(newForm, newTransactionData, transactionStatusReference);
		const dynamicFormWithDesc = mapTransactionStatusFields(formWithStatus, transactionStatusReference);
		setDynamicTicketForm(dynamicFormWithDesc ?? []);
	};

	useEffect(() => {
		// supersede fields
		if (paymentMethodExtId) {
			// call to get fields to hide
			getHiddenPaymentMethodTicketFields(selectedTicketTypeId, paymentMethodExtId, TicketManagementConstants.ADD);
		}
	}, [paymentMethodExtId]);

	useEffect(() => {
		const updateFields = (fields: any[]) => {
			if (fields && hiddenTicketFields) {
				return fields.map((field: any) => {
					const hiddenField = hiddenTicketFields.find((hidden) => hidden.fieldId === field.fieldId);
					if (hiddenField) {
						return {
							...field,
							isSupersedeHidden: true,
							isSupersedeOptional: hiddenField.isOptional,
							mode: TicketManagementConstants.PageModeAdd,
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
		const ticketMappingUpdated = updateFields(ticketMapping);
		const dynamicFieldsUpdated = updateFields(dynamicTicketForm);
		if (ticketMappingUpdated.length > 0) {
			setTicketMapping(ticketMappingUpdated);
		}

		if (dynamicFieldsUpdated.length > 0) {
			setDynamicTicketForm(dynamicFieldsUpdated);
		}
	}, [hiddenTicketFields]);

	useEffect(() => {
		// set hidden fields
		const paymentMethodAddId = Number(dynamicTicketForm.find((dAdd: any) => dAdd.fieldId === TICKET_FIELD.PaymentMethodId)?.fieldValue || 0);
		setPaymentMethodExtId(paymentMethodAddId);
	}, [dynamicTicketForm]);

	useEffect(() => {
		if (paymentMethodExtId) {
			getHiddenPaymentMethodTicketFields(TICKET_TYPE.MissingDeposit, paymentMethodExtId, TicketManagementConstants.ADD);
		}
	}, [paymentMethodExtId]);

	useEffect(() => {
		if (!ticketCustomGroupings) return;
		setTicketCustomGroupMapping(ticketCustomGroupings);
		return () => {};
	}, [ticketCustomGroupings]);

	useEffect(() => {
		if (!ticketFieldMapping) return;

		const activeFieldsAddTicket = ticketFieldMapping.filter((fields: any) => fields.hasAdd === true && fields.fieldId !== 1);
		const abstractTicketForm: DynamicTicketModel[] = moldingDynamicTicketForm(activeFieldsAddTicket);
		setDynamicTicketForm(abstractTicketForm);
		const forValidationOfTextInputSearch: TextInputSearchValidationModel[] = textInputSearchValidationArr(activeFieldsAddTicket);
		setTextInputValidationArr(forValidationOfTextInputSearch);
		const chkLeftSection = activeFieldsAddTicket.some((fields: any) => fields.ticketSectionId === TICKET_SECTION.Left);
		setHasLeftSection(chkLeftSection);
		const chkRightSection = activeFieldsAddTicket.some((fields: any) => fields.ticketSectionId === TICKET_SECTION.Right);
		setHasRightSection(chkRightSection);
		setTicketMapping(activeFieldsAddTicket);
		disableSplashScreen();
		return () => {};
	}, [ticketFieldMapping]);

	useEffect(() => {
		if (!ticketCustomGroupMapping) return;
		const chkCustomRightSection = ticketCustomGroupMapping.some((fields: any) => fields.ticketCustomId === TICKET_GROUP.Player);
		setHasRightCustomSection(chkCustomRightSection);
		return () => {};
	}, [ticketCustomGroupMapping]);

	useEffect(() => {
		if (ticketConfigTypes.length < 1) return;
		const ticketTypeLookUp = ticketTypeOptionList.reduce((acc: any, curr: any) => {
			acc.push({value: curr.ticketId, label: curr.ticketName});
			return acc;
		}, []);
		setTicketTypeOptionList(ticketTypeLookUp);
		return () => {};
	}, [ticketConfigTypes]);

	useEffect(() => {
		if (selectedTicketTypeId > 0) {
			disableSplashScreen();
			validateAccess(userAccess, history, selectedTicketTypeId, TICKET_COMPONENT.Add);
			getTransactionField(selectedTicketTypeId);
		}
	}, [selectedTicketTypeId]);

	const changeTicketType = (ticketType: LookupModel) => {
		enableSplashScreen();
		getFieldMappingAsync(ticketType.value);
		getCustomGrouping(ticketType.value);
		setSelectedTicketConfig(ticketType);
		setTicketInfo({...ticketInfo, ticketTypeId: parseInt(ticketType?.value ?? '0')});
		setSelectedTicketConfigCode(ticketHeaderCode(ticketConfigTypes, ticketType.value, null));
		setTicketTypeStatus(getTicketTypeStatus(ticketType));
		setCallSign(ticketConfigTypes?.find((ticket: any) => ticket.ticketId === ticketType.value)?.ticketCode ?? '');
		setSelectedTicketTypeId(parseInt(ticketType.value));
	};

	const getTicketTypeStatus = (ticketType: any) => ticketConfigTypes?.find((ticket: any) => ticket.ticketId === ticketType.value)?.status ?? '';
	const isDraftTicketType = () => ticketTypeStatus === TICKET_TYPE_STATUS.Draft;
	const verifiedPlayerId = (playerId: string, mlabPlayerId: number) => {
		const affectedPlayer: Array<TicketPlayerModel> = [{ticketPlayerId: '0', brandID: 0, playerId: playerId, mlabPlayerId: mlabPlayerId}]; //This can only handle single player affected
		setQueriedPlayerId(affectedPlayer);
		setTicketInfo({...ticketInfo, ticketPlayerIds: [{ticketPlayerId: '0', brandID: 0, playerId: playerId, mlabPlayerId: mlabPlayerId}]});
		if (mlabPlayerId === 0) {
			// Invalidate transactionId in the form
			const unvalidateTransactionId = textInputValidationArr.map((data: TextInputSearchValidationModel) => {
				return {...data, fieldValidated: false};
			});
			const reEnableFields = dynamicTicketForm.map((data: DynamicTicketModel) => {
				if (data.fieldId === TICKET_FIELD.Summary) {
					return {...data, fieldActive: !data.fieldValue};
				} else {
					return {...data, fieldActive: true};
				}
			});
			setDynamicTicketForm(reEnableFields);
			setTextInputValidationArr(unvalidateTransactionId);
		}
	};

	const handleTextInputSearching = async (fieldId: string | number, fieldValue: string) => {
		const hasUnvalidatedPlayersForAdd = await checkForUnvalidatedPlayers(queriedPlayerId);
		const sourceTypeId = getSourceRequest(selectedTicketTypeId);
		if (hasUnvalidatedPlayersForAdd) {
			swal(SwalFailedMessage.title, SwalTicketManagementFailedMessage.playerUnverified, SwalFailedMessage.icon);
			setTimeout(() => {
				setDynamicTicketForm([...dynamicTicketForm]);
			}, 1000); // refresh dynamic ticket form with same values to trigger set to false on search text input component
			return;
		}
		const mlabRequest: GetMlabRequestModel = {
			transactionId: '',
			mlabPlayerId: queriedPlayerId != undefined ? queriedPlayerId[0].mlabPlayerId : 0,
			playerId: queriedPlayerId != undefined ? queriedPlayerId[0].playerId : '0',
			providerTransactionid: '',
			userId: parseInt(userId ?? '0'),
		};
		const newFmboRequest: FmboTransactionDataRequestModel = {
			source: sourceTypeId,
			transactionId: '',
			userId: mlabRequest.userId ?? 0,
		};
		searchByField(fieldId, mlabRequest, newFmboRequest, fieldValue);
	};

	const searchByField = (fieldId: any, mlabRequest: any, newFmboRequest: any, fieldValue: any) => {
		if (fieldId === TICKET_FIELD.PlatformTransactionId) {
			mlabRequest.transactionId = fieldValue;
			searchTransactionData(mlabRequest, true, fieldValue, '', newFmboRequest);
		} else if (fieldId === TICKET_FIELD.PaymentSystemTransactionId) {
			mlabRequest.transactionId = '';
			mlabRequest.providerTransactionid = fieldValue;
			newFmboRequest.transactionId = fieldValue;
			searchTransactionData(mlabRequest, false, '', fieldValue, newFmboRequest);
		}
	};

	const handleSave = async () => {
		console.log(dynamicTicketForm);

		if (isDraftTicketType()) return;

		setSaveLoading(true);
		const hasUnvalidatedPlayers = await checkForUnvalidatedPlayers(queriedPlayerId);
		if (hasUnvalidatedPlayers) {
			swal(SwalFailedMessage.title, SwalTicketManagementFailedMessage.playerUnverified, SwalFailedMessage.icon);
			setSaveLoading(false);
			return;
		}
		const hasUnvalidatedSearchFields = await CheckForUnvalidatedTextInputSearch(textInputValidationArr, hiddenTicketFields);
		if (hasUnvalidatedSearchFields) {
			setSaveLoading(false);
			return;
		}
		const isFormFulfilled = await validateFormTicketFields(dynamicTicketForm);
		if (isFormFulfilled) {
			swal({
				title: SwalTicketManagementConfirmMessage.title,
				text: `A ${callSign} ticket will be created, please confirm`,
				icon: SwalTicketManagementConfirmMessage.icon,
				buttons: [SwalTicketManagementConfirmMessage.btnNo, SwalTicketManagementConfirmMessage.btnYes],
				dangerMode: true,
			}).then((response) => {
				if (response) {
					saveTicketDetails();
				} else {
					setSaveLoading(false);
				}
			});
		} else {
			swal(SwalFailedMessage.title, SwalFailedMessage.textMandatory, SwalFailedMessage.icon);
			setSaveLoading(false);
		}
	};

	const saveTicketDetails = async () => {

		if(selectedTicketTypeId === TICKET_TYPE.MissingWithdrawal) {
			dynamicTicketForm.map((d: any) => {
				if (d.fieldId === TICKET_FIELD.Department) {
					d.fieldValue = currentDepartment.toString()
				}
			});
		}
	
		const request: SaveTicketDetailsRequestModel = {
			ticketId: ticketInfo.ticketId,
			ticketTypeId: parseInt(selectedTicketConfig?.value ?? '0'),
			ticketPlayerIds: queriedPlayerId ?? [],
			ticketAttachments: ticketInfo.ticketAttachments,
			ticketDetails:
				dynamicTicketForm?.map((x: any) => ({
					ticketFieldMappingId: x.fieldMappingId,
					ticketFieldMappingValue: x.externalFieldValue?.toString() ?? (x.fieldValue ?? '').toString(),
				})) ?? [],
			ticketHistoryLabelType: extractHistoryData(dynamicTicketForm),
			queueId: Guid.create().toString(),
			userId: userId?.toString() ?? '0',
		};
		setTimeout(() => {
			const messagingHub = hubConnection.createHubConnenction();
			messagingHub
				.start()
				.then(() => {
					if (messagingHub.state === HubConnected) {
						SaveTicketDetails(request).then((response: any) => {
							if (response.status === successResponse) {
								saveTicketDetailsPostAction(messagingHub, request);
							} else {
								setSaveLoading(false);
								swal(SwalServerErrorMessage.title, SwalServerErrorMessage.textError, SwalServerErrorMessage.icon);
							}
						});
					}
				})
				.catch((error: any) => {
					setSaveLoading(false);
					swal(SwalServerErrorMessage.title, SwalServerErrorMessage.textErrorStartingConnection, SwalServerErrorMessage.icon);
					console.log(SwalServerErrorMessage.textErrorStartingConnection, error);
				});
		}, 1000);
	};

	const saveTicketDetailsPostAction = async (messagingHub: any, request: any) => {
		messagingHub.on(request.queueId, (message: any) => {
			let resultData = JSON.parse(message.remarks);
			if (resultData.Status === successResponse) {
				
				swal({
					title: SwalTicketSuccessRecordMessage.title,
					text: SwalTicketSuccessRecordMessage.textSuccess,
					icon: SwalTicketSuccessRecordMessage.icon,
					buttons: false as any // This removes all buttons
				});
				history.push(`/ticket-management/view-ticket/${callSign}-${resultData.Data}`);
			} else {
				swal(SwalServerErrorMessage.title, SwalServerErrorMessage.textError, SwalServerErrorMessage.icon);
			}
			setSaveLoading(false);
			messagingHub.off(request.queueId);
			messagingHub.stop();
		});
	};

	const updateDynamicTicket = (fieldId: number, fieldValue: any, fieldLabel: string = '') => {
		const updateDynamicForm = dynamicTicketForm?.find((field: any) => field.fieldId === fieldId);
		const updatedData = {...updateDynamicForm, fieldValue: fieldValue};
		const filteredData: any = dynamicTicketForm?.filter((field: any) => field.fieldId !== fieldId);
		const updatedForm = [...filteredData, updatedData];

		//change payment method and player id
		if (fieldId === TICKET_FIELD.PaymentMethodId) {
			updateAssigneeList(updatedForm);
		}

		if (selectedTicketTypeId === TICKET_TYPE.MissingWithdrawal) {
			const missingTypeIndex = updatedForm.findIndex((item: any) => item.fieldId === TICKET_FIELD.MissingType);
			const transactionValue = updatedForm.find((item: any) => item.fieldId === TICKET_FIELD.TransactionAmount).fieldValue;
			const missingValue = updatedForm.find((item: any) => item.fieldId === TICKET_FIELD.MissingAmount).fieldValue;

			const diff: number = transactionValue - missingValue;
			if (diff > 0) {
				updatedForm[missingTypeIndex].fieldValue = WITHDRAWAL_MISSING_TYPE.Partial;
			} else {
				updatedForm[missingTypeIndex].fieldValue = WITHDRAWAL_MISSING_TYPE.Full;
			}
		}

		if (fieldId === TICKET_FIELD.PaymentMethodId || fieldId === TICKET_FIELD.PlatformTransactionId) {
			fieldId === TICKET_FIELD.PaymentMethodId && fieldLabel !== '' && setPaymentMethodName(fieldLabel); // store label name for payment method

			const transactionIdValue =
				updatedForm?.find((data: DynamicTicketModel) => data.fieldId === TICKET_FIELD.PlatformTransactionId).fieldValue ?? ''; //get transactionId
			const paymentMethodLabel = fieldId === TICKET_FIELD.PaymentMethodId ? fieldLabel : paymentMethodName;
			let updatedFormWithTicketSummary = updatedForm.reduce((acc: DynamicTicketModel[], curr: DynamicTicketModel) => {
				if (curr.fieldId === TICKET_FIELD.Summary) {
					callSign && transactionIdValue && paymentMethodLabel
						? acc.push({
								...curr,
								fieldValue: `${callSign !== '' ? callSign.trim() : ''}${transactionIdValue !== '' ? '-' + transactionIdValue.trim() : ''}${
									paymentMethodLabel !== '' ? '-' + paymentMethodLabel.trim() : ''
								}`,
								fieldActive: false,
								fieldRequired: false,
						  })
						: acc.push(curr);
				} else {
					acc.push(curr);
				}
				return acc;
			}, []);
			setDynamicTicketForm(updatedFormWithTicketSummary);
		} else {
			setDynamicTicketForm(updatedForm);
		}
	};

	const updateAssigneeList = (updatedForm?: any) => {
		let departmentId = 0
		const paymentMethodId = updatedForm?.find((data: DynamicTicketModel) => data.fieldId === TICKET_FIELD.PaymentMethodId)?.fieldValue ?? '0';
		const paymentProcessor = updatedForm?.find((data: DynamicTicketModel) => data.fieldId === TICKET_FIELD.PaymentProcessor)?.fieldValue ?? '';
		const selecteDepartmentId = processorData.find((d: GetAllProcessorResponseModel) => d.paymentProcessorId.toString() === paymentProcessor)?.departmentId
		if(selectedTicketTypeId === TICKET_TYPE.MissingWithdrawal && processorData && paymentProcessor && selecteDepartmentId) {
			departmentId = Number(selecteDepartmentId)
		}else {
			departmentId = Number(updatedForm?.find((data: DynamicTicketModel) => data.fieldId === TICKET_FIELD.Department)?.fieldValue ?? '0');
		}
		
		setCurrentDepartmentId(departmentId);
		if (paymentMethodId && selectedTicketTypeId === TICKET_TYPE.MissingDeposit
			|| selectedTicketTypeId === TICKET_TYPE.MissingWithdrawal && selecteDepartmentId
		) {
			setCurrentPaymentMethod(parseInt(paymentMethodId));
			const assigneeRequest: GetAssigneeListRequestModel = {
				statusId: 0,
				ticketTypeId: selectedTicketTypeId,
				paymentMethodId: parseInt(paymentMethodId),
				mlabPlayerId: selectedPlayer.mlabPlayerId,
				ticketId: 0,
				departmentId: departmentId,
				adjustmentAmount: 0
			};
			getAssigneeListAsync(assigneeRequest);
		}
	};

	useEffect(() => {
		if (assigneeList && isFetchedAssigneeList) {
			const paymentMethodId = currentPaymentMethodId ?? 0;
			const autoAssignedRequest: GetAutoAssignedIdRequestModel = {
				statusId: 0,
				ticketTypeId: selectedTicketTypeId,
				paymentMethodId: paymentMethodId,
				mlabPlayerId: selectedPlayer.mlabPlayerId,
				ticketId: 0,
				ticketCode: '',
				statusDescription: '',
				departmentId: currentDepartment,
				adjustmentAmount: 0
			};

			if (paymentMethodId > 0) {
				getAutoAssignedId(autoAssignedRequest);
			}
		}
	}, [assigneeList, isFetchedAssigneeList]);

	const updateTextInputSearchValidation = (fieldMappingId: number) => {
		setTextInputValidationArr(updateUnverifyTextInputSearchValidationList(textInputValidationArr, fieldMappingId) ?? []);
	};

	useEffect(() => {
		if (isFetchedPlayer && selectedPlayer.mlabPlayerId > 0) {
			updateAssigneeList(dynamicTicketForm);
		}
	}, [selectedPlayer]);

	

	return (
		<>
			{selectedTicketConfig &&
			<MainContainerSticky>
					<div className='p-4'>
						<Col sm={12}>
							<div className='d-flex align-items-baseline justify-content-between'>
								<div className='d-flex align-items-center'>
										<p className='fw-bolder mb-0'>{selectedTicketConfigCode}</p>
										<StatusActionButton
										dynamicTicketForm={dynamicTicketForm}
										stateData={ticketInfo}
										ticketStatusPopupMapping={[]}
										userId={userId}
										submitModal={null}
										ticketCode={null}
										allFieldMapping={ticketFieldMapping}
										/>
									</div>
								<MlabButton
									type={'button'} label={'Submit'}
									access={true}
									style={ElementStyle.primary}
									weight={'solid'}
									onClick={handleSave}
									loading={saveLoading}
									loadingTitle='Please wait...'
									disabled={saveLoading}
								/>
							</div>
						</Col>
					</div>
			</MainContainerSticky>
			}

			<div style={{padding: '0.5rem'}}></div>
			<TicketSectioning
				ticketMapping={ticketMapping}
				changeTicketType={changeTicketType}
				selectedTicketConfig={selectedTicketConfig}
				handleTextInputSearching={handleTextInputSearching}
				hasLeftSection={hasLeftSection}
				hasRightSection={hasRightSection || hasRightCustomSection}
				ticketCustomGroupings={ticketCustomGroupings}
				isAddForm={false}
				updateDynamicTicket={updateDynamicTicket}
				dynamicTicketForm={dynamicTicketForm}
				viewOnly={false}
				ticketInfo={ticketInfo}
				setTicketInfo={setTicketInfo}
				userId={userId}
				displayComment={ticketCustomGroupings?.find((custom: any) => custom.ticketCustomId === TICKET_GROUP.Comment)?.hasAdd}
				updateTextInputSearchValidation={updateTextInputSearchValidation}
				showAutoAssign={true}
				assigneeList={assigneeList}
				autoAssignedId={autoAssignedId}
				transactionStatusReference={transactionStatusReference}
				verifiedPlayerId={verifiedPlayerId}
				superSedeFields={hiddenTicketFields}
			/>
		</>
	);
};
export default AddTicket;
