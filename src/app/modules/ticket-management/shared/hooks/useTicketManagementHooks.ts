import {useContext, useState} from 'react';
import swal from 'sweetalert';
import * as hubConnection from "../../../../../setup/hub/MessagingHub";
import useConstant from '../../../../constants/useConstant';
import {OptionsSelectedModel} from '../../../system/models';
import {USER_CLAIMS} from '../../../user-management/components/constants/UserClaims';
import useTicketConstant from '../../constants/TicketConstant';
import {FMBO_DEFAULT, ICORE_DEFAULT} from '../../constants/TicketDefault';
import {IcoreTransactionDataResponseModel, MlabTransactionDataResponseModel, TransactionDataRequestModel} from '../../models';
import {TicketManagementLookupsModel} from '../../models/TicketManagementLookupsModel';
import {TransactionDataModel} from '../../models/TransactionDataModel';
import {FmboTransactionDataRequestModel} from '../../models/request/FmboTransactionDataRequestModel';
import {GetTicketCommentsRequestModel} from '../../models/request/GetTicketCommentsRequestModel';
import {PaymentMethodHiddenFieldsRequestModel} from '../../models/request/PaymentMethodHiddenFieldsRequestModel';
import {SaveTicketDetailsRequestModel} from '../../models/request/SaveTicketDetailsRequestModel';
import {SearchFilterRequestModel} from '../../models/request/SearchFilterRequestModel';
import {TicketStatusHierarchyRequestModel} from '../../models/request/TicketStatusHierarchyRequestModel';
import {FmboTransactionDataResponseModel} from '../../models/response/FmboTransactionDataResponseModel';
import {PaymentMethodHiddenFieldsResponseModel} from '../../models/response/PaymentMethodHiddenFieldsResponseModel';
import {TeamAssignmentResponseModel} from '../../models/response/TeamAssignmentResponseModel';
import {TicketCommentModel} from '../../models/response/TicketCommentModel';
import {TicketStatusHierarchyResponseModel} from '../../models/response/TicketStatusHierarchyResponseModel';
import {TicketStatusMappingResponseModel} from '../../models/response/TicketStatusMappingResponseModel';
import {TransactionFieldMappingResponseModel} from '../../models/response/TransactionFieldMappingResponseModel';
import {TransactionStatusReferenceResponseModel} from '../../models/response/TransactionStatusReferenceResponseModel';
import {GetSearchTicket, GetTicketComment, SaveTicketDetails, UpsertPopupTicketDetails, getFmboTransactionData, getHiddenPaymentMethodTickets, getIcoreTransactionData, getMlabTransactionData, getTeamAssignmentData, getTicketManagementLookups, getTicketStatusHierarchyByTicketType, getTicketStatusPopupMapping, getTransactionFieldMapping, requestSearchTicket, requestTicketCommentByTicketCommentId, ValidateAddUserCollaborator, UpsertTicketComment } from '../../services/TicketManagementApi';
import {pushTo401} from '../../utils/helper';
import { DynamicTicketModel } from '../../models/ticket-config/DynamicTicketModel';
import { GetMlabRequestModel } from '../../models/request/GetMlabRequestModel';
import { UpsertPopupTicketDetailsRequestModel } from '../../models/request/UpsertPopupTicketDetailsRequestModel';
import { Guid } from 'guid-typescript';
import { AddUserCollaboratorRequestModel } from '../../models/request/AddUserCollaboratorRequestModel';
import { TicketHistoryFieldsModel } from '../../models/udt/TicketHistoryFieldsModel';
import { TicketContext } from '../../context/TicketContext';
import { shallowEqual, useSelector } from 'react-redux';
import { RootState } from '../../../../../setup';
import { IAuthState } from '../../../auth';
import { TicketCommentRequestModel } from '../../models/request/TicketCommentRequestModel';

export const useTicketManagementHooks = () => {
	const { HubConnected, successResponse, SwalServerErrorMessage , TicketManagementConstants, SwalFailedMessage } = useConstant();
	const [icoreTransactionData, setIcoreTransactionData] = useState<IcoreTransactionDataResponseModel>();
	const [fmboTransactionData, setFmboTransactionData] = useState<FmboTransactionDataResponseModel>();
	const [isLoadingTransactionData, setIsLoadingTransactionData] = useState<boolean>(false);
	const [isLoadingFmboTransactionData, setIsLoadingFmboTransactionData] = useState<boolean>(false);
	const [mlabTransactionData, setMlabTransactionData] = useState<MlabTransactionDataResponseModel>();
	const [isUpsertLoading, setIsUpsertLoading] = useState<boolean>(false);
	const [isUpsertSuccess, setIsUpsertSuccess] = useState<boolean>(false);

	const [ticketStatusHierarchy, setTicketStatusHierarchy] = useState<TicketStatusHierarchyResponseModel[]>([])

	const [commentList, setCommentList] = useState<Array<TicketCommentModel>>([]);
	const [remainingCommentCount, setRemainingCommentCount] = useState<number>(0);
	const [teamAssignment, setTeamAssignment] = useState<Array<OptionsSelectedModel>>([]);
	const [ticketStatusPopupMapping, setTicketStatusPopupMapping] = useState<Array<TicketStatusMappingResponseModel>>([]);
	const [searchTicketData, setSearchTicketData] = useState<any>();
	const [ticketManagementLookups, setTicketManagementLookups] = useState<TicketManagementLookupsModel>();
	const [transactionFieldMapping, setTransactionFieldMapping] = useState<Array<TransactionFieldMappingResponseModel>>([]);
	const {TICKET_TYPE , TICKET_COMPONENT } = useTicketConstant();
	const [hiddenTicketFields, setHiddenTicketFields] = useState<Array<PaymentMethodHiddenFieldsResponseModel>>([]);
	const [integrationEnabled, setIntegrationEnabled] = useState<boolean>(false);
	const { TICKET_FIELD ,TRANSACTION_TAG , FMBO_TYPE , MLAB_TRANSACTION_STATUS } = useTicketConstant();
	const [newTransactionData, setNewTransactionData] = useState<TransactionDataModel>();
	const [numberFetchApi, setNumberFetchApi] = useState<number>(0);
	const [isUpsertTicketSuccess, setIsUpsertTicketSuccess] = useState<boolean>(false);
	const { allLookUpOptions, allOldValue , ticketInformation , transactionStatusReference } = useContext(TicketContext);
	const { userId } = useSelector<RootState>(({ auth }) => auth, shallowEqual) as IAuthState;

	const getIcoreTransaction = (_request: TransactionDataRequestModel) => {
		setIsLoadingTransactionData(true);
		setIcoreTransactionData(undefined);
		getIcoreTransactionData(_request)
			.then((response) => {
				if (response.status === successResponse) {
					setIcoreTransactionData(response.data);
					setIsLoadingTransactionData(false);
				} else {
					swal(SwalServerErrorMessage.title, TicketManagementConstants.NoTxnId, SwalServerErrorMessage.icon);
				}
			})
			.catch((ex: any) => {
				console.log('[ERROR] getIcoreTransaction: ' + ex);
				swal(SwalServerErrorMessage.title, TicketManagementConstants.Error, SwalServerErrorMessage.icon);
				setIsLoadingTransactionData(false);
			});
	};

	const getFmboTransaction = (request: FmboTransactionDataRequestModel) => {
		setIsLoadingFmboTransactionData(true);
		getFmboTransactionData(request)
			.then((response) => {
				setIntegrationEnabled(response.data.isIntegrationEnabled)
				if (response.status === successResponse && response.data.isIntegrationEnabled) {
					setFmboTransactionData(response.data.responseData);
					setIsLoadingFmboTransactionData(false);
				}else if(!response.data.isIntegrationEnabled){
					setIsLoadingFmboTransactionData(false);
				}
				else {
					swal(SwalServerErrorMessage.title, TicketManagementConstants.NoTxnId, SwalServerErrorMessage.icon);
				}
			})
			.catch((ex: any) => {
				console.log('[ERROR] getIcoreTransaction: ' + ex);
				swal(SwalServerErrorMessage.title, TicketManagementConstants.Error, SwalServerErrorMessage.icon);
				setIsLoadingFmboTransactionData(false);
			});
	};

	const getTeamAssignment = async () => {
		try {
			const response: any = await getTeamAssignmentData();
			if (response.status === successResponse) {
				let allTeamAssignments = Object.assign(new Array<TeamAssignmentResponseModel>(), response.data);
				let optionTempList = Array<OptionsSelectedModel>();

				allTeamAssignments.forEach((item: TeamAssignmentResponseModel) => {
					const teamAssignmentOption: OptionsSelectedModel = {
						value: item.ticketTeamAssignmentId.toString(),
						label: item.ticketTeamAssignmentName,
					};
					optionTempList.push(teamAssignmentOption);
				});

				setTeamAssignment(optionTempList);
			} else {
				swal(SwalServerErrorMessage.title, SwalServerErrorMessage.textError, SwalServerErrorMessage.icon);
			}
		} catch (ex) {
			swal(SwalServerErrorMessage.title, 'Error on fetching data Team Assignments', SwalServerErrorMessage.icon);
		}
	};

	const getMlabTransaction = async (request: GetMlabRequestModel) => {
		try {
			const response: any = await getMlabTransactionData(request);
			if (response.status === successResponse) {
				setMlabTransactionData(response.data);
			}
		} catch (ex) {
			swal(SwalServerErrorMessage.title, TicketManagementConstants.Error, SwalServerErrorMessage.icon);
		}
	}

	const getTicketStatusHierarchy = async (request: TicketStatusHierarchyRequestModel) => {
		try {
			const response: any = await getTicketStatusHierarchyByTicketType(request);
			if (response.status === successResponse) {
				setTicketStatusHierarchy(response.data);
			} else {
				swal(SwalServerErrorMessage.title, TicketManagementConstants.NoHierarchy, SwalServerErrorMessage.icon);
			}
		} catch (ex) {
			swal(SwalServerErrorMessage.title, TicketManagementConstants.Error, SwalServerErrorMessage.icon);
		}
	}

	const upsertTicketDetails = (request: SaveTicketDetailsRequestModel) => {
		setIsUpsertLoading(true)
		setIsUpsertSuccess(false)
		setTimeout(() => {
			const messagingHub = hubConnection.createHubConnenction();
			messagingHub.start()
				.then(() => {
					if (messagingHub.state === HubConnected) {
						saveTicketDetails(request, messagingHub);
					}
				})
				.catch((error: any) => {
					swal(SwalServerErrorMessage.title, SwalServerErrorMessage.textErrorStartingConnection, SwalServerErrorMessage.icon);
					setIsUpsertLoading(false)
					setIsUpsertSuccess(false)
				})
		}, 1000);
	}

	const saveTicketDetails = (request: any, messagingHub: any) => {
		SaveTicketDetails(request).then((response: any) => {
			if (response.status === successResponse) {
				upsertTicketDetailsPostAction(messagingHub, request);
			} else {
				swal(SwalServerErrorMessage.title, SwalServerErrorMessage.textError, SwalServerErrorMessage.icon);
				setIsUpsertSuccess(false)
			}
		})
	}

	const upsertTicketDetailsPostAction = async (messagingHub: any, request: any) => {
		messagingHub.on(request.queueId, (message: any) => {
			let resultData = JSON.parse(message.remarks);
			if (resultData.Status === successResponse) {
				setIsUpsertSuccess(true)
			} else {
				swal(SwalServerErrorMessage.title, SwalServerErrorMessage.textError, SwalServerErrorMessage.icon);
				setIsUpsertSuccess(false)
			}
			setIsUpsertLoading(false)
			messagingHub.off(request.queueId);
			messagingHub.stop();
		});
	};

	const getTicketComment = async (request: GetTicketCommentsRequestModel) => {
		setTimeout(() => {
			const messagingHub = hubConnection.createHubConnenction();
			messagingHub.start()
				.then(() => {
					if (messagingHub.state === HubConnected) {
						getTicketCommentByTicketCommentId(request, messagingHub)
					}
				})
				.catch((error: any) => {
					swal(SwalServerErrorMessage.title, SwalServerErrorMessage.textErrorStartingConnection, SwalServerErrorMessage.icon);
				})
		}, 1000);
	}

	const getTicketCommentByTicketCommentId = (request: any, messagingHub: any) => {
		requestTicketCommentByTicketCommentId(request)
			.then((response: any) => {
				if (response.status === successResponse) {
					getTicketCommentPostAction(messagingHub, request);
				} else {
					swal(SwalServerErrorMessage.title, SwalServerErrorMessage.textError, SwalServerErrorMessage.icon);
				}
			})
	}

	const getTicketCommentPostAction = (messagingHub: any, request: any) => {
		messagingHub.on(request.queueId, (message: any) => {
			GetTicketComment(message.cacheId)
				.then((responseData) => {
					if (responseData.status === successResponse && responseData.data) {
						let resultData = { ...responseData.data };
						const commentList = resultData.commentList;
						const remainingCount = resultData.totalCommentListCount - commentList.length
						setCommentList(commentList);
						setRemainingCommentCount(remainingCount);

						messagingHub.off(request.queueId);
						messagingHub.stop();
					} else {
						swal(SwalServerErrorMessage.title, SwalServerErrorMessage.textError, SwalServerErrorMessage.icon);
					}
				})
				.catch((error: any) => {
					swal(SwalServerErrorMessage.title, SwalServerErrorMessage.textError, SwalServerErrorMessage.icon);
					console.log(error);
				})
		});
	}

	const getTicketStatusMapping = async (ticketTypeId: number) => {
		try {
			const response: any = await getTicketStatusPopupMapping(ticketTypeId);
			if (response.status === successResponse) {
				setTicketStatusPopupMapping(response.data);
			} else {
				swal(SwalServerErrorMessage.title, SwalServerErrorMessage.textError, SwalServerErrorMessage.icon);
			}
		} catch (ex) {
			swal(SwalFailedMessage.title, SwalFailedMessage.textNoTicketStatusMappingFound, SwalFailedMessage.icon);
		}
	}

	const searchTicket = async (request: SearchFilterRequestModel) => {
		setTimeout(() => {
			const messagingHub = hubConnection.createHubConnenction();
			messagingHub.start()
				.then(() => {
					if (messagingHub.state === HubConnected) {
						searchTicketRequest(request, messagingHub);
					}
				})
				.catch((error: any) => {
					swal(SwalServerErrorMessage.title, SwalServerErrorMessage.textErrorStartingConnection, SwalServerErrorMessage.icon);
				})
		}, 1000);
	}

	const searchTicketRequest = (request: any, messagingHub: any) => {
		requestSearchTicket(request)
			.then((response: any) => {
				if (response.status === successResponse) {
					getSearchTicket(messagingHub, request);
				} else {
					swal(SwalServerErrorMessage.title, SwalServerErrorMessage.textError, SwalServerErrorMessage.icon);
				}
			})
	}

	const getSearchTicket = (messagingHub: any, request: any) => {
		messagingHub.on(request.queueId, (message: any) => {
			GetSearchTicket(message.cacheId)
				.then((responseData) => {
					if (responseData.status === successResponse) {
						let resultData = { ...responseData.data };
						setSearchTicketData(resultData);

						messagingHub.off(request.queueId);
						messagingHub.stop();
					} else {
						swal(SwalServerErrorMessage.title, SwalServerErrorMessage.textError, SwalServerErrorMessage.icon);
					}
				})
				.catch((error: any) => {
					swal(SwalServerErrorMessage.title, SwalServerErrorMessage.textError, SwalServerErrorMessage.icon);
					console.log(error);
				})
		});
	}

	const getTicketManagementLookup = async () => {
		try {
			const response: any = await getTicketManagementLookups();
			if (response.status === successResponse) {
				setTicketManagementLookups(response.data);
			} else {
				swal('Error', 'No Lookups Found', 'error');
			}
		} catch (ex) {
			swal('Failed', 'Error on fetching data', 'error');
		}
	}

	const getTransactionField = async (ticketTypeId: number) => {
		try {
			const response: any = await getTransactionFieldMapping(ticketTypeId);
			if (response.status === successResponse) {
				setTransactionFieldMapping(response.data);
			} else {
				swal(SwalServerErrorMessage.title, SwalServerErrorMessage.textError, SwalServerErrorMessage.icon);
			}
		} catch (ex) {
			swal(SwalFailedMessage.title, SwalFailedMessage.textNoTransactionFieldMappingFound, SwalFailedMessage.icon);
		}
	} 
	
	const hasYesNoMissingWithdrawalReporterAccess = (userAccess: any,selectedTicketTypeId: number) => 
		userAccess.includes(USER_CLAIMS.MissingWithdrawalReporterRead) && !userAccess.includes(USER_CLAIMS.MissingWithdrawalReporterWrite && selectedTicketTypeId === TICKET_TYPE.MissingWithdrawal)
	
	const validateSearchRole = (tag: any, currentAccess: any, history: any, selectedTicketTypeId: number) => {
		if(tag !== TICKET_COMPONENT.Search){
			return true;
		}
		const accessMapping = {
			[TICKET_TYPE.MissingDeposit]: currentAccess.hasNoMissingDepositAccess,
			[TICKET_TYPE.MissingWithdrawal]: currentAccess.hasNoMissingWithdrawalAccess,
			[TICKET_TYPE.Task]: currentAccess.hasNoTaskTicketAccess,
			[TICKET_TYPE.Issue]: currentAccess.hasNoIssueTicketAccess
		};

		if (accessMapping[selectedTicketTypeId]) {
			pushTo401(history);
		}
	}
	const hasYesNoAccess = (currentAccess: any, selectedTicketTypeId: number) => {
		if((currentAccess.hasYesNoMissingDepositAccess && selectedTicketTypeId === TICKET_TYPE.MissingDeposit)
		|| (currentAccess.hasYeNoIssueTicketAccess && selectedTicketTypeId === TICKET_TYPE.Issue) 
		|| (currentAccess.hasYeNoTaskTicketAccess && selectedTicketTypeId === TICKET_TYPE.Task)
		|| (currentAccess.hasYeNoMissingWithdrawalAccess && selectedTicketTypeId === TICKET_TYPE.MissingWithdrawal)){
			return true;
		}
	}
	const validateAddEdit = (userAccess: any, currentAccess: any,history: any, selectedTicketTypeId: number, tag: any) =>{
		if((!currentAccess.hasManageTicketAccess && !currentAccess.hasMissingDepositAccess) // no - no access
		|| (currentAccess.hasYesNoManageTicketAccess && tag === TICKET_COMPONENT.Edit) // yes-no access in edit
		|| (currentAccess.hasYesNoMissingDepositAccess && tag === TICKET_COMPONENT.Edit  && selectedTicketTypeId === TICKET_TYPE.MissingDeposit ) // yes-no access in edit missing deposit
		|| (currentAccess.hasYesNoReporterRoleAccess && tag === TICKET_COMPONENT.Edit  && selectedTicketTypeId === TICKET_TYPE.MissingDeposit) // yes-no access in edit reporter role
		|| (hasYesNoMissingWithdrawalReporterAccess(userAccess,selectedTicketTypeId) && tag === TICKET_COMPONENT.Edit)
		|| (currentAccess.hasYeNoMissingWithdrawalAccess && selectedTicketTypeId === TICKET_TYPE.MissingWithdrawal)
		|| noMissingDepositAccessWhenSelected(currentAccess,selectedTicketTypeId) // no-no missing deposit
		|| noMissingWithdrawalAccessWhenSelected(currentAccess,selectedTicketTypeId) // no-no missing withdrawal
		|| noIssueTicketAccessWhenSelected(currentAccess,selectedTicketTypeId) //no-no Issue access
		|| noTaskTicketAccessWhenSelected(currentAccess,selectedTicketTypeId) //no-no task access
		|| hasYesNoAccess(currentAccess,selectedTicketTypeId)
		) {
			pushTo401(history);
	}
	}
	const validateAccess = (userAccess: any, history: any, selectedTicketTypeId: number, tag: any) => {
		const currentAccess = getAccess(userAccess);
		const reporterRoleAccess = getReporterRoleAccess(userAccess)
		validateReporterRole(reporterRoleAccess,tag, selectedTicketTypeId , history)
		if(tag === TICKET_COMPONENT.Search)
			validateSearchRole(tag,currentAccess,history,selectedTicketTypeId);

		else if(tag === TICKET_COMPONENT.Add || tag === TICKET_COMPONENT.Edit){
			validateAddEdit(userAccess,currentAccess,history,selectedTicketTypeId,tag);
		}
	  }
	  const noMissingDepositAccessWhenSelected = (currentAccess: any,selectedTicketTypeId: number) => currentAccess.hasNoMissingDepositAccess && selectedTicketTypeId === TICKET_TYPE.MissingDeposit ;
	  const noMissingWithdrawalAccessWhenSelected = (currentAccess: any,selectedTicketTypeId: number) => currentAccess.hasNoMissingWithdrawalAccess && selectedTicketTypeId === TICKET_TYPE. MissingWithdrawal;
	  const noIssueTicketAccessWhenSelected = (currentAccess: any,selectedTicketTypeId: number) => currentAccess.hasNoIssueTicketAccess && selectedTicketTypeId === TICKET_TYPE.Issue;
	  const noTaskTicketAccessWhenSelected = (currentAccess: any,selectedTicketTypeId: number) => currentAccess.hasNoTaskTicketAccess && selectedTicketTypeId === TICKET_TYPE.Task;
	  
	  const getAccess = (userAccess: any) =>{
		const hasManageTicketAccess = userAccess.includes(USER_CLAIMS.ManageTicketsRead) || userAccess.includes(USER_CLAIMS.ManageTicketsWrite);
		const hasMissingDepositAccess = userAccess.includes(USER_CLAIMS.MissingDepositeRead) || userAccess.includes(USER_CLAIMS.MissingDepositWrite);
		const hasTaskTicketAccess = userAccess.includes(USER_CLAIMS.TicketsRead) || userAccess.includes(USER_CLAIMS.TicketsWrite);
		const hasIssueTicketAccess = userAccess.includes(USER_CLAIMS.IssueRead) || userAccess.includes(USER_CLAIMS.IssueWrite);
		const hasMissingWithdrawalAccess = userAccess.includes(USER_CLAIMS.MissingWithdrawalRead) || userAccess.includes(USER_CLAIMS.MissingWithdrawalWrite);

		const hasYesNoManageTicketAccess = userAccess.includes(USER_CLAIMS.ManageTicketsRead) && !userAccess.includes(USER_CLAIMS.ManageTicketsWrite)
		const hasYesNoMissingDepositAccess = userAccess.includes(USER_CLAIMS.MissingDepositeRead) && !userAccess.includes(USER_CLAIMS.MissingDepositWrite)
		const hasYesNoReporterRoleAccess = userAccess.includes(USER_CLAIMS.ReporterRoleRead) && !userAccess.includes(USER_CLAIMS.ReporterRoleWrite)
		const hasYeNoTaskTicketAccess =  userAccess.includes(USER_CLAIMS.TaskRead) && !userAccess.includes(USER_CLAIMS.TaskWrite)
		const hasYeNoIssueTicketAccess =  userAccess.includes(USER_CLAIMS.IssueRead) && !userAccess.includes(USER_CLAIMS.IssueWrite)
		const hasYeNoMissingWithdrawalAccess =  userAccess.includes(USER_CLAIMS.MissingWithdrawalRead) && !userAccess.includes(USER_CLAIMS.MissingWithdrawalWrite)

		const hasNoMissingDepositAccess = !userAccess.includes(USER_CLAIMS.MissingDepositeRead) && !userAccess.includes(USER_CLAIMS.MissingDepositWrite);
		const hasNoTaskTicketAccess = !userAccess.includes(USER_CLAIMS.TaskRead) && !userAccess.includes(USER_CLAIMS.TaskWrite);
		const hasNoIssueTicketAccess = !userAccess.includes(USER_CLAIMS.IssueRead) && !userAccess.includes(USER_CLAIMS.IssueWrite);
		const hasNoMissingWithdrawalAccess = !userAccess.includes(USER_CLAIMS.MissingWithdrawalRead) && !userAccess.includes(USER_CLAIMS.MissingWithdrawalWrite);

		return {
			hasManageTicketAccess,
			hasMissingDepositAccess,
			hasYesNoManageTicketAccess,
			hasYesNoMissingDepositAccess,
			hasYesNoReporterRoleAccess,
			hasNoMissingDepositAccess,
			hasTaskTicketAccess,
			hasIssueTicketAccess,
			hasMissingWithdrawalAccess,
			hasNoTaskTicketAccess,
			hasNoIssueTicketAccess,
			hasNoMissingWithdrawalAccess,
			hasYeNoTaskTicketAccess,
			hasYeNoIssueTicketAccess,
			hasYeNoMissingWithdrawalAccess
		}
	  }

	  const getReporterRoleAccess = (userAccess: any) => {
		const hasYesYesReporterRoleAccess = userAccess.includes(USER_CLAIMS.ReporterRoleRead) && userAccess.includes(USER_CLAIMS.ReporterRoleWrite)
		const hasYesYesMWReporterRoleAccess = userAccess.includes(USER_CLAIMS.MissingWithdrawalReporterRead) && userAccess.includes(USER_CLAIMS.MissingWithdrawalReporterWrite)
		
		return {
			hasYesYesReporterRoleAccess,
			hasYesYesMWReporterRoleAccess
		}
	  }

	  const validateReporterRole = (reporterRoleAccess: any, tag: any , selectedTicketTypeId: any, history: any) => {
		if(
		(reporterRoleAccess.hasYesYesReporterRoleAccess && tag === TICKET_COMPONENT.Edit  && selectedTicketTypeId === TICKET_TYPE.MissingDeposit) // yes-yes access in edit reporter role
		|| (reporterRoleAccess.hasYesYesMWReporterRoleAccess && tag === TICKET_COMPONENT.Edit  && selectedTicketTypeId === TICKET_TYPE.MissingWithdrawal))  // yes-yes access in edit reporter role
		{
			pushTo401(history);
		}
	
	  }

	  const getHiddenPaymentMethodTicketFields = async ( ticketTypeId: number,paymentMethodExtId: number, pageMode: string ) => {
		// reset
		const parentContainer = document.querySelector('.ticket-left-dynamic-fields');
		const divElements = parentContainer?.querySelectorAll('div');

		const hideClass = 'hidden-field';
		const showClass = 'show-field';

		setHiddenTicketFields([])
		if (parentContainer) {
			parentContainer.querySelectorAll('div').forEach(div => {
			div.classList.remove(hideClass);
			div.classList.remove(showClass);
			});
		}
		//	reassign values
		const request: PaymentMethodHiddenFieldsRequestModel = {
			ticketTypeId: ticketTypeId,
			paymentMethodExtId: paymentMethodExtId,
			pageMode: pageMode
		}
		const hiddenFields =  await getHiddenPaymentMethodTickets(request).then((response) => {
								if (response.status === successResponse) {
									setHiddenTicketFields(response.data)
									return response.data;
								} else {
									swal(SwalServerErrorMessage.title, SwalServerErrorMessage.textError, SwalServerErrorMessage.icon);
								}
							})
							.catch(() => {
								swal(SwalServerErrorMessage.title, SwalServerErrorMessage.textError, SwalServerErrorMessage.icon);
							});
		
		if (divElements) {
			hiddenFields?.forEach(hidden => {
				const idContainingFieldId = formatFieldSelector(hidden.fieldMappingId, hidden.fieldName);
				const correspondingDiv = document.getElementById(idContainingFieldId);
				if (correspondingDiv) {
					
					if (pageMode === TicketManagementConstants.ADD) {
						correspondingDiv.classList.add(hideClass);
						correspondingDiv.classList.remove(showClass);
					} else {
						correspondingDiv.classList.remove(hideClass);
						correspondingDiv.classList.add(showClass);
					}
				}
			});
		}
					
	}

	const formatFieldSelector = (fieldMappingId: any, fieldName: any) => {
		// Format field name - replace spaces with dashes for ID attribute
		const formattedFieldName = fieldName.replace(/\s+/g, '-');
		
		return `${fieldMappingId}-${formattedFieldName}`;
	}

	const mapTransactionStatusFields = (queriedData: DynamicTicketModel[], transactionStatusReference: TransactionStatusReferenceResponseModel[]) => {
		
		if(!queriedData){
			return
		}
		const queriedForm =  queriedData.map((d: DynamicTicketModel) => {
		  if (d.fieldId === TICKET_FIELD.PlatformStatusId || d.fieldId === TICKET_FIELD.PaymentSystemTransactionStatusId) {
			const transactionTag = d.fieldId === TICKET_FIELD.PlatformStatusId ? TRANSACTION_TAG.ICORE : TRANSACTION_TAG.FMBO;
			const updatedData = { ...d }; // Create a copy of the object
			updatedData.externalFieldValue = d.fieldValue;
			const transactionStatus = transactionStatusReference.find((e: TransactionStatusReferenceResponseModel) => 
			  e.staticReferenceId === parseInt(d.fieldValue) && e.transactionTag === transactionTag
			);
			if (transactionStatus) {
			  updatedData.fieldValue = transactionStatus.staticReferenceDescription;
			  updatedData.externalFieldValue = transactionStatus.staticReferenceId.toString()
			}
			return updatedData;
		  } else {
			return d; // Return unmodified data for other fields
		  }
		});
	  
		return queriedForm
	  }

	  const getSourceRequest = (selectedTicketTypeId: number) => {
		switch(selectedTicketTypeId){
			case 3:
				return FMBO_TYPE.Deposit;
			case 4:
				return FMBO_TYPE.Withdrawal;
			default:
				return 0;
		}
	}

	const searchTransactionData = async (request: any, isIcoreFirst: any,
		searchedPlatformTransactionId: string, searchedPaymentSystemId: string, fmboRequest?: any) => {
		
		try {
			const newTransactionData: TransactionDataModel = {
				userId: request.userId,
				searchedPlatformTransactionId: searchedPlatformTransactionId,
				searchedPaymentSystemId: searchedPaymentSystemId
				};

			await getMlabTransactionData(request).then((mlab: any) =>{
				if(mlab.status === successResponse && mlab.data.transactionStatusId !== MLAB_TRANSACTION_STATUS.Approved){
					newTransactionData.isIcoreFirst = true
					setNewTransactionData(newTransactionData)
					request.transactionId = mlab.data.transactionId
					getIcoreFirst(request, newTransactionData, fmboRequest);
				}
				else if (isIcoreFirst) {
					newTransactionData.isIcoreFirst = isIcoreFirst
					getIcoreFirst(request, newTransactionData, fmboRequest);
				}
				else if (!isIcoreFirst) {
					newTransactionData.isIcoreFirst = isIcoreFirst
					getFmboFirst(request, newTransactionData , fmboRequest);
				}
			})
		} catch (ex) {
			swal(SwalServerErrorMessage.title, TicketManagementConstants.Error, SwalServerErrorMessage.icon);
		}
		
	}

	const getIcoreFirst = (request: any, newTransactionData: any, fmboRequest?: any) =>{
		getIcoreTransactionData(request).then((icore: any) => {
			if(icore.status === successResponse){
				newTransactionData.iCoreTransactionData = icore.data;
				const fmboRequestObj: FmboTransactionDataRequestModel = {
					source: fmboRequest?.source,
					transactionId: icore.data.providerTransactionId ,
					userId: request.userId
				}
				setNewTransactionData({ ...newTransactionData });
				setNumberFetchApi(1)
				getFmboTransactionData(fmboRequestObj).then((fmbo: any) => {
					if(fmbo.status === successResponse){
						newTransactionData.fmboTransactionData = fmbo.data.responseData
						setNewTransactionData({ ...newTransactionData });
						setNumberFetchApi(2)
					}else{
						swal(SwalServerErrorMessage.title, TicketManagementConstants.NoTxnId, SwalServerErrorMessage.icon);
					}
				})
			}else{
				swal(SwalServerErrorMessage.title, TicketManagementConstants.NoTxnId, SwalServerErrorMessage.icon);
			}
		})
	}

	const getFmboFirst = (request: any, newTransactionData: any,fmboRequest: any) =>{
		getFmboTransactionData(fmboRequest).then((fmbo: any) => {
			if (fmbo.status === successResponse) {
				newTransactionData.fmboTransactionData = fmbo.data.responseData;
				request.transactionId = fmbo.data.responseData.transactionId;
				setNewTransactionData({ ...newTransactionData });
				setNumberFetchApi(1)
				getIcoreTransactionData(request).then((icore: any) => {
					if (icore.status === successResponse) {
						newTransactionData.iCoreTransactionData = icore.data;
						setNumberFetchApi(2)
						setNewTransactionData({ ...newTransactionData });
					} else {
						swal(SwalServerErrorMessage.title, TicketManagementConstants.NoTxnId, SwalServerErrorMessage.icon);
					}
				
				})
			} else {
				swal(SwalServerErrorMessage.title, TicketManagementConstants.NoTxnId, SwalServerErrorMessage.icon);
			}
		});
	}

	const validationForInvalidTransaction = (newTransactionData: any) =>{
		if( newTransactionData?.iCoreTransactionData && newTransactionData?.fmboTransactionData &&
			newTransactionData?.iCoreTransactionData?.providerTransactionId !== newTransactionData.searchedPaymentSystemId && newTransactionData.searchedPaymentSystemId !== ''
			&& !newTransactionData?.mlabTransactionData){
			swal(SwalServerErrorMessage.title, TicketManagementConstants.IcoreTransactionNotMatch + ' ' + newTransactionData?.iCoreTransactionData?.providerTransactionId, SwalServerErrorMessage.icon);
			newTransactionData.fmboTransactionData = FMBO_DEFAULT
			return;
		}

		if( newTransactionData?.iCoreTransactionData && newTransactionData?.fmboTransactionData &&
			newTransactionData?.fmboTransactionData?.transactionId !== newTransactionData.searchedPlatformTransactionId && newTransactionData.searchedPlatformTransactionId !== ''
			&& !newTransactionData?.mlabTransactionData){
			swal(SwalServerErrorMessage.title, TicketManagementConstants.FmboTransactionNotMatch + ' ' + newTransactionData?.fmboTransactionData?.transactionId , SwalServerErrorMessage.icon);
			newTransactionData.iCoreTransactionData = ICORE_DEFAULT
			return;
		}

		return newTransactionData
	}

	const upsertPopupTicketDetailsAsync = async (ticketInformation: any, dynamicTicketForm: any, userId: any, ticketHistoryLabelType?: any) => {
		try {
			const parentStatus = ticketInformation.ticketDetails.find((d: any) => d.ticketFieldId === TICKET_FIELD.StatusId)?.ticketTypeFieldMappingValue ?? '0';
            const currentStatusId: number = parseInt(parentStatus);
			const request: UpsertPopupTicketDetailsRequestModel = {
				ticketId: ticketInformation.ticketId,
				ticketTypeId: ticketInformation.ticketTypeId,
				ticketDetails: dynamicTicketForm.filter((d: any) => d.fieldId === TICKET_FIELD.PlatformStatusId || d.fieldId === TICKET_FIELD.PaymentSystemTransactionStatusId)?.map((x: any) => ({
				  ticketFieldMappingId: x.fieldMappingId,
				  ticketFieldMappingValue: x.externalFieldValue?.toString() ?? (x.fieldValue ?? '').toString(),
				})) ?? [],
				comment: '',
				queueId: Guid.create().toString(),
				icoreStatusId: 0,
				fmboStatusId: 0,
				userId: userId?.toString() ?? '0',
				sendUpdateEmail: false,
				ticketHistoryLabelType: ticketHistoryLabelType ?? [],
				parentStatusId: currentStatusId,
				childStatusId: currentStatusId
			  };
			if(request.ticketDetails.length > 0){
				UpsertPopupTicketDetails(request).then((response: any) => {
					if (response.status === successResponse) {
						setIsUpsertTicketSuccess(true)
					} else {
						swal(SwalServerErrorMessage.title, SwalServerErrorMessage.textError, SwalServerErrorMessage.icon);
						const requestObj: TicketCommentRequestModel = {
							ticketId: ticketInformation?.ticketId ?? 0,
							ticketTypeId: ticketInformation?.ticketTypeId ?? 0,
							comment: SwalServerErrorMessage.textError ?? "",
							ticketCommentId: 0,
							queueId: Guid.create().toString(),
							userId: userId?.toString() ?? "0"
						};
				
						UpsertTicketComment(requestObj);
				
					}
				})
			}
		
		
		} catch (ex) {
			swal(SwalFailedMessage.title, SwalFailedMessage.textUpsertPopUpFailed, SwalFailedMessage.icon);
		}
	}

	const fetchLatestTransactionData = (ticketInformation: any, selectedPlayer: any, userId: any) => {
		const transactionId = ticketInformation.ticketDetails.find((d: any) => d.ticketFieldId === TICKET_FIELD.PlatformTransactionId)?.ticketTypeFieldMappingValue ?? ''
		const tranRequest: TransactionDataRequestModel = {
			mlabPlayerId: selectedPlayer.mlabPlayerId,
			playerId: selectedPlayer.playerId, //This can only handle single player affected
			transactionId: transactionId,
			providerTransactionid: '',
			userId: parseInt(userId ?? '0'),
			ticketTypeId: ticketInformation.ticketTypeId
		};
		return tranRequest
	}

	


	const validateAddUserAsCollaborator = (requestObj: AddUserCollaboratorRequestModel) => {
		ValidateAddUserCollaborator(requestObj).then((response: any) => {
			if(response.status !== successResponse) {
				swal(SwalServerErrorMessage.title, SwalServerErrorMessage.textError, SwalServerErrorMessage.icon);
			}
		})
	}

	const setApiStatusDescription = (dynamicTicketForm: any, transactionData: any, transactionStatusReference: any) => {
		const icoreDataStatusId = transactionData?.iCoreTransactionData?.transactionStatusId ?? '';
		const fmboDataStatusId = transactionData?.fmboTransactionData?.paymentSystemTransactionStatusId ?? '';
	
		const transactionStatusIdFromApi = transactionStatusReference.find(
			(d: any) => d.apiStatusId === icoreDataStatusId && d.transactionTag === TRANSACTION_TAG.ICORE
		)?.staticReferenceId; // Assuming you want the `transactionStatusId` property
	
		const fmboTransactionStatusIdFromApi = transactionStatusReference.find(
			(d: any) => d.apiStatusId === fmboDataStatusId && d.transactionTag === TRANSACTION_TAG.FMBO
		)?.staticReferenceId; // Assuming you want the `transactionStatusId` property
	
		dynamicTicketForm.map((d: any) => {
			if (d.fieldId === TICKET_FIELD.PlatformStatusId) {
				d.fieldValue = transactionData.transactionStatusId ?? transactionStatusIdFromApi;
			} else if (d.fieldId === TICKET_FIELD.PaymentSystemTransactionStatusId) {
				d.fieldValue = transactionData.paymentSystemTransactionStatusId ?? fmboTransactionStatusIdFromApi;
			}
		});
	
		return dynamicTicketForm;
	};
	const extractHistoryData = (dynamicTicketForm: DynamicTicketModel[]) => {
		const extractLabelValueById: any = (currValue: any, currFieldId: any) => { 
			const optionList: any = allLookUpOptions.filter(x => x.fieldId === currFieldId).map(o => o.optionList)
			return optionList[0]?.filter((x: any) => (x?.value ?? "").toString() === currValue).map((y: any) => y.label)[0]
		}

		const extractOldValue: any = (fieldId: any, fieldValue: any) => {
			const hasOldValue = allOldValue.filter(i => i.ticketFieldId === fieldId)
			if(hasOldValue.length > 0) {
				return hasOldValue.filter(a => a.ticketTypeFieldMappingValue !== fieldValue).map(z => z.ticketTypeFieldMappingValue)[0] ?? null // return null if no changes
			} else {
				return "" // return empty string if no old values
			}
		}

		let historyData: TicketHistoryFieldsModel[] = [];
		
		dynamicTicketForm?.filter(x => (x.fieldValue ?? '').toString() !== "" && x.externalFieldValue?.toString() !== "").forEach(y => {
		  const fieldValue = (y.fieldValue ?? '').toString()
		  const oldValue = extractOldValue(y.fieldId, fieldValue)

		  let historyValue = {
			fieldMappingId: y.fieldMappingId,
			oldValue: extractLabelValueById(oldValue, y.fieldId) ?? oldValue,
			newValue: extractLabelValueById(fieldValue, y.fieldId) ?? fieldValue,
		  }
	  
		  historyData.push(historyValue);
		})
	  
		return historyData
	  }

	  const updateStatus = (dynamicTicketForm: any, selectedLatestTransactionData: any) => {
		if (!dynamicTicketForm || !transactionStatusReference) return;
	  
		const { ticketDetails } = ticketInformation;
		const historyData: TicketHistoryFieldsModel[] = [];
	  
		const getFieldMappingValue = (fieldId: number) => 
		  ticketDetails.find((d: any) => d.ticketFieldId === fieldId)?.ticketTypeFieldMappingValue;
	  
		const getStatusDescription = (statusId: number, tag: string) => 
		  transactionStatusReference.find((d: TransactionStatusReferenceResponseModel) => d.staticReferenceId === statusId && d.transactionTag === tag)?.staticReferenceDescription ?? '';
	  
		const getTransactionData = (apiStatusId: number, tag: string) => 
		  transactionStatusReference.find((d: TransactionStatusReferenceResponseModel) => d.apiStatusId === apiStatusId && d.transactionTag === tag);
	  
		const oldPlatformStatus = parseInt(getFieldMappingValue(TICKET_FIELD.PlatformStatusId) ?? '0');
		const oldPaymentSystemStatus = parseInt(getFieldMappingValue(TICKET_FIELD.PaymentSystemTransactionStatusId) ?? '0');
	  
		const oldPlatformStatusDesc = getStatusDescription(oldPlatformStatus, TRANSACTION_TAG.ICORE);
		const oldPaymentSystemStatusDesc = getStatusDescription(oldPaymentSystemStatus, TRANSACTION_TAG.FMBO);
	  
		const icoreTransactionData = getTransactionData(selectedLatestTransactionData.iCoreTransactionData?.transactionStatusId, TRANSACTION_TAG.ICORE);
		const fmboTransactionData = getTransactionData(selectedLatestTransactionData.fmboTransactionData?.paymentSystemTransactionStatusId, TRANSACTION_TAG.FMBO);
	  
		const statusUpdates = [
		  { fieldId: TICKET_FIELD.PlatformStatusId, oldDesc: oldPlatformStatusDesc, newData: icoreTransactionData },
		  { fieldId: TICKET_FIELD.PaymentSystemTransactionStatusId, oldDesc: oldPaymentSystemStatusDesc, newData: fmboTransactionData }
		];
	  
		statusUpdates.forEach(({ fieldId, oldDesc, newData }) => {
		  if (newData) {
			dynamicTicketForm.forEach((d: any) => {
			  if (d.fieldId === fieldId) {
				const newDesc = newData.staticReferenceDescription ?? '';
				d.fieldValue = newDesc;
				d.externalFieldValue = newData.staticReferenceId.toString();
	  
				historyData.push({
				  fieldMappingId: d.fieldMappingId,
				  oldValue: oldDesc,
				  newValue: newDesc,
				});
			  }
			});
		  }
		});
	  
		upsertPopupTicketDetailsAsync(ticketInformation, dynamicTicketForm, userId, historyData)
	  };
	  

	return {
		getIcoreTransaction,
		icoreTransactionData,
		isLoadingTransactionData,
		setIsLoadingTransactionData,
		mlabTransactionData,
		getMlabTransaction,
		isUpsertLoading,
		isUpsertSuccess,
		upsertTicketDetails,
		getTicketStatusHierarchy,
		ticketStatusHierarchy,
		getTicketComment,
		commentList,
		remainingCommentCount,
		teamAssignment,
		getTeamAssignment,
		getTicketStatusMapping,
		ticketStatusPopupMapping,
		searchTicketData,
		searchTicket,
		ticketManagementLookups,
		getTicketManagementLookup,
		getFmboTransaction,
		fmboTransactionData,
		isLoadingFmboTransactionData,
		getTransactionField,
		transactionFieldMapping,
		// upsertTransactionData,
		validateAccess,
		getHiddenPaymentMethodTicketFields,
		hiddenTicketFields,
		formatFieldSelector,
		integrationEnabled,
		mapTransactionStatusFields,
		newTransactionData,
		searchTransactionData,
		validationForInvalidTransaction,
		numberFetchApi,
		isUpsertTicketSuccess,
		upsertPopupTicketDetailsAsync,
		fetchLatestTransactionData,
		validateAddUserAsCollaborator,
		setApiStatusDescription,
		getSourceRequest,
		extractHistoryData,
		updateStatus
	};
};