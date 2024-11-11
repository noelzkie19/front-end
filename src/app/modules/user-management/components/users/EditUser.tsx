import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import clsx from 'clsx';
import {useFormik} from 'formik';
import {Guid} from 'guid-typescript';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {Col, Row} from 'react-bootstrap-v5';
import {shallowEqual, useSelector} from 'react-redux';
import {useHistory, useParams} from 'react-router-dom';
import Select from 'react-select';
import swal from 'sweetalert';
import * as Yup from 'yup';
import '../../../../../_metronic/assets/sass/core/components/_transitions.scss';
import {RootState} from '../../../../../setup';
import * as hubConnection from '../../../../../setup/hub/MessagingHub';
import * as InternetConnectionHandler from '../../../../../setup/internet-connection/InternetConnectionHandler';
import * as sessionHandler from '../../../../../setup/session/SessionHandler';
import {MasterReferenceOptionModel} from '../../../../common/model';
import {ElementStyle, MessageTypeEnum} from '../../../../constants/Constants';
import useConstant from '../../../../constants/useConstant';
import {MlabButton} from '../../../../custom-components';
import {useMasterReferenceOption} from '../../../../custom-functions';
import useCurrencies from '../../../../custom-functions/useCurrencies';
import {IAuthState} from '../../../auth';
import {OptionsSelectedModel} from '../../../system/models';
import {useSystemOptionHooks} from '../../../system/shared';
import {useTicketManagementHooks} from '../../../ticket-management/shared/hooks/useTicketManagementHooks';
import {USER_CLAIMS} from '../../../user-management/components/constants/UserClaims';
import {CommunicationProviderAccountListbyIdResponseModel} from '../../models';
import {CommunicationProviderRequestModel} from '../../models/CommunicationProviderRequestModel';
import {TeamFilterModel} from '../../models/TeamFilerModel';
import {TeamModel} from '../../models/TeamModel';
import {UserIdRequestModel} from '../../models/UserIdRequestModel';
import {UserRequestModel} from '../../models/UserRequestModel';
import {
	ValidateCommunicationProvider,
	getTeamList,
	getTeamListResult,
	getUserById,
	getUserByIdInfo,
	updateUser,
} from '../../redux/UserManagementService';
import {AddCommunicationProviderModal, EditCommunicationProviderModal} from '../shared/compoments';
import CommunicationProviderAccountList from '../shared/compoments/CommunicationProviderAccountList';
import UserDetailsForm from '../shared/compoments/UserDetailsForm';
import {UseUserManagementHooks} from '../shared/hooks';
import {BuildTeamElements} from '../shared/utils/helper';

const teamScheema = Yup.object().shape({
	userIdRequest: Yup.string(),
	fullName: Yup.string(),
	email: Yup.string(),
	status: Yup.number(),
	teams: Yup.array(),
	createdBy: Yup.string(),
	queueId: Yup.string(),
	userId: Yup.string(),
	updatedBy: Yup.string(),
});

interface TeamOption {
	value: string;
	label: string;
}

const initialValues = {
	userIdRequest: '',
	fullName: '',
	email: '',
	status: 0,
	teams: Array<TeamOption>(),
	createdBy: '',
	password: '',
	queueId: '',
	userId: '',
	updatedBy: '',
	ticketTeamAssignmentId: Array<OptionsSelectedModel>(),
	ticketCurrencyAssignmentId: Array<OptionsSelectedModel>(),
	mcoreUserId: '',
};

const editUserEnableSplashScreen = () => {
	const _editUserSplashScreen = document.getElementById('splash-screen');
	if (_editUserSplashScreen) {
		_editUserSplashScreen.style.setProperty('display', 'flex');
		_editUserSplashScreen.style.setProperty('opacity', '0.5');
	}
};

const editUserDisableSplashScreen = () => {
	const _editUserSplashScreen = document.getElementById('splash-screen');
	if (_editUserSplashScreen) {
		_editUserSplashScreen.style.setProperty('display', 'none');
	}
};

const PaddedDiv = () => <div style={{margin: 20}} />;

const EditUser: React.FC = () => {
	// GET REDUX STORE
	const userAccessId = useSelector<RootState>(({auth}) => auth.userId, shallowEqual) as number;
	const userAccess = useSelector<RootState>(({auth}) => auth.access, shallowEqual) as string;
	const expiresIn = useSelector<RootState>(({auth}) => auth.expiresIn, shallowEqual) as string;
	const history = useHistory();
	const {access, userId, fullName} = useSelector<RootState>(({auth}) => auth, shallowEqual) as IAuthState;

	//CONSTANTS
	const {successResponse, HubConnected, SwalFailedMessage, SwalSuccessMessage, SwalConfirmMessage, message, masterReferenceIds} = useConstant();
	const {teamAssignment, getTeamAssignment} = useTicketManagementHooks();

	// STATES
	const [userIdDisplay, setuserIdDisplay] = useState('');
	const [loading, setLoading] = useState(false);
	const [teamDetailList, setTeamDetailList] = useState<Array<TeamModel>>([]);
	const [teamList, setTeamList] = useState<Array<TeamOption>>([]);
	const [selectedTeams, setSelectedTeams] = useState<Array<TeamOption>>([]);
	const [isLoaded, setLoaded] = useState(false);

	const {id}: {id: number} = useParams();

	const [showAddCommunicationProviderModal, setShowAddCommunicationProviderModal] = useState(false);
	const [showEditCommunicationProviderModal, setShowEditCommunicationProviderModal] = useState(false);

	// Communication Provider States
	const [selectedMessageType, setSelectedMessageType] = useState<string | any>('');
	const [textAccountId, setTextAccountId] = useState<string>('');
	const [selectedProviderAccountStatus, setSelectedProviderAccountStatus] = useState<string | any>('');
	const [addCommunicationProviderAccountList, setAddCommunicationProviderAccountList] = useState<
		Array<CommunicationProviderAccountListbyIdResponseModel>
	>([]);
	const [communicationProviderGuid, setCommunicationProviderGuid] = useState<string>('');
	const [isLoadingEditModal, setIsLoadingEditModal] = useState<boolean>(false);
	const [textChatUserAccountId, setTextChatUserAccountId] = useState<number>(0);
	const [isLoadingAddModal, setIsLoadingAddModal] = useState<boolean>(false);

	// Pagination States
	const [gridPageSize, setGridPageSize] = useState<number>(10);
	const [gridCurrentPage, setGridCurrentPage] = useState<number>(1);
	const [gridTotalPages, setGridTotalPages] = useState<number>(1);
	const [selectedTeamAssignment, setSelectedTeamAssignment] = useState<Array<OptionsSelectedModel>>([]);
	const [selectedTicketCurrencyAssignment, setSelectedTicketCurrencyAssignment] = useState<Array<OptionsSelectedModel>>([]);
	const currencyList = useCurrencies(userAccessId);
	const [updatedSubscription, setUpdatedSubscription] = useState<any>('');

	const {getMessageTypeOptionList, messageTypeOptionList} = useSystemOptionHooks();
	const {
		getCommunicationProviderAccountStatusOptions,
		communicationProviderStatusOptions,
		getCommunicationProviderAccountList,
		communicationProviderAccountList,
	} = UseUserManagementHooks();
	const ArrayOptionMessageTypeObj = messageTypeOptionList.filter(
		({value}) => !addCommunicationProviderAccountList.some(({messageTypeId}) => messageTypeId.toString() === value)
	);

	// Ref
	const gridRef: any = useRef();
	useEffect(() => {
		getTeamAssignment();
	}, []);

	const subcriptionOptions = useMasterReferenceOption(masterReferenceIds.parentId.Subscription.toString())
		.filter((x: MasterReferenceOptionModel) => x.masterReferenceParentId !== 0)
		.map((x: MasterReferenceOptionModel) => x.options);

	const validateEditFieldsWhenSameSpace = () => {
		return selectedMessageType.value === MessageTypeEnum.Samespace.toString() && updatedSubscription.value === undefined;
	};

	const formik = useFormik({
		initialValues,
		validationSchema: teamScheema,
		onSubmit: async (values, {setStatus, setSubmitting, resetForm}) => {
			if (InternetConnectionHandler.isSlowConnection(history) === true) {
				return;
			}

			if (sessionHandler.isSessionExpired(expiresIn, history) === true) {
				return;
			}

			values.queueId = Guid.create().toString();
			values.userId = userAccessId.toString();
			values.teams = selectedTeams;
			values.updatedBy = userAccessId.toString();
			values.createdBy = userAccessId.toString();
			values.ticketTeamAssignmentId = selectedTeamAssignment;
			values.ticketCurrencyAssignmentId = selectedTicketCurrencyAssignment;

			setLoading(true);
			let isValid: boolean = true;

			if (validateEmail(values.email) === false) {
				swal('Failed', 'Email address is in wrong format', 'error');
				setLoading(false);
				setSubmitting(false);
				isValid = false;
			}

			if (values.fullName === '' || values.email === '' || values.status.toString() === '0' || values.teams.length === 0) {
				swal('Failed', 'Unable to proceed, kindly fill up all mandatory fields', 'error');
				setLoading(false);
				setSubmitting(false);
				isValid = false;
			}

			if (values.password !== '') {
				let resultPass = passwordValidate(values.password);
				if (resultPass === false) {
					swal('Failed', 'Unable to proceed, Password must be 8-16 character, combination of letter, number and special character', 'error');
					setLoading(false);
					setSubmitting(false);
					isValid = false;
				}
			}
			setTimeout(() => {
				if (isValid === true) {
					swal({
						title: 'Confirmation',
						text: 'This action will save the changes made. Please confirm',
						icon: 'warning',
						buttons: ['No', 'Yes'],
						dangerMode: true,
					}).then((willUpdate) => {
						if (willUpdate) {
							formik.setSubmitting(true);
							setLoading(true);
							const formSubmitMessagingHub = hubConnection.createHubConnenction();
							formSubmitMessagingHub
								.start()
								.then(() => {
									if (formSubmitMessagingHub.state === HubConnected) {
										const request: UserRequestModel = {
											userIdRequest: parseInt(values.userIdRequest) ?? 0,
											createdBy: parseInt(values.createdBy),
											email: values.email,
											fullName: values.fullName,
											status: parseInt(values.status.toString()),
											teams: values.teams,
											updatedBy: parseInt(values.updatedBy),
											queueId: values.queueId,
											userId: values.userId,
											userPassword: values.password,
											ticketTeamAssignmentId: values.ticketTeamAssignmentId,
											ticketCurrencyAssignmentId: values.ticketCurrencyAssignmentId,
											mcoreUserId: values.mcoreUserId,
											communicationProviders: addCommunicationProviderAccountList.map((providerAccountListObj) => {
												return {
													chatUserAccountId: providerAccountListObj.chatUserAccountId,
													messageTypeId: providerAccountListObj.messageTypeId.toString(),
													accountID: providerAccountListObj.accountId,
													chatUserAccountStatus: providerAccountListObj.chatUserAccountStatus.toString() === 'Active' ? '1' : '0',
													subscriptionId: providerAccountListObj.subscriptionId,
												};
											}),
										};

										updateUser(request)
											.then((response) => {
												if (response.status === successResponse) {
													formSubmitMessagingHub.on(request.queueId.toString(), (message) => {
														let resultData = JSON.parse(message.remarks);

														if (resultData.Status !== successResponse) {
															swal('Failed', resultData.Message, 'error');
															setLoading(false);
															setSubmitting(false);
														} else {
															swal('Successful!', 'Record successfully submitted', 'success').then((onSuccess) => {
																if (onSuccess) {
																	history.push(`/user-management/user-list`);
																	setSubmitting(false);
																}
															});
														}
														formSubmitMessagingHub.off(request.queueId.toString());
														formSubmitMessagingHub.stop();
														setLoading(false);
														setSubmitting(false);
													});
													setTimeout(() => {
														if (formSubmitMessagingHub.state === HubConnected) {
															formSubmitMessagingHub.stop();
															setLoading(false);
															setSubmitting(false);
														}
													}, 30000);
												} else {
													formSubmitMessagingHub.stop();
													swal('Failed', response.data.message, 'error');
												}
											})
											.catch(() => {
												formSubmitMessagingHub.stop();
												swal('Failed', 'Problem updating the user', 'error');
												setLoading(false);
												setSubmitting(false);
											});
									} else {
										swal('Failed', 'Problem connecting to the server, Please refresh', 'error');
									}
								})
								.catch((err) => {
									swal('Failed', err, 'error');
								});
						} else {
							setLoading(false);
							setSubmitting(false);
						}
					});
				}

				setLoading(false);
				setSubmitting(false);
			}, 1000);
		},
	});

	function passwordValidate(p: string) {
		return /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,16}$/.test(p);
	}

	useEffect(() => {
		getMessageTypeOptionList('');
		getCommunicationProviderAccountStatusOptions();

		let request: UserIdRequestModel = {
			queueId: Guid.create().toString(),
			userId: userId?.toString() || '0',
			userIdRequest: id,
		};
		getCommunicationProviderAccountList(request);
	}, []);

	useEffect(() => {
		setAddCommunicationProviderAccountList(
			communicationProviderAccountList.map((obj) => {
				return {
					accountId: obj.accountId,
					chatUserAccountId: obj.chatUserAccountId,
					chatUserAccountStatus: obj.chatUserAccountStatus === 'True' ? 'Active' : 'Inactive',
					communicationProviderGuid: Guid.create().toString(),
					messageTypeId: obj.messageTypeId,
					messageTypeName: obj.messageTypeName,
					subscriptionId: obj.subscriptionId,
				};
			})
		);
	}, [communicationProviderAccountList]);

	useEffect(() => {
		const pathArray = window.location.pathname.split('/');
		let pageId: string = '';

		if (isLoaded === false) {
			if (InternetConnectionHandler.isSlowConnection(history) === true) {
				return;
			}
			editUserEnableSplashScreen();
			setTimeout(() => {
				const initializationMessagingHub = hubConnection.createHubConnenction();
				initializationMessagingHub
					.start()
					.then(() => {
						if (initializationMessagingHub.state === HubConnected) {
							// Getting All Team
							const request: TeamFilterModel = {
								brands: '',
								currencies: '',
								operators: '',
								roles: '',
								teamId: 0,
								teamName: '',
								teamStatuses: '',
								queueId: Guid.create().toString(),
								userId: userAccessId.toString(),
							};

							getTeamList(request)
								.then((response) => {
									if (response.status === successResponse) {
										initializationMessagingHub.on(request.queueId.toString(), (message) => {
											getTeamListResult(message.cacheId)
												.then((data) => {
													let teamListData = Object.assign(new Array<TeamModel>(), data.data);
													let teamTempList = Array<TeamOption>();

													teamListData.map((team) => {
														if (team.status == 1) {
															const roleOption: TeamOption = {
																value: team.id,
																label: team.name,
															};
															teamTempList.push(roleOption);
														}
													});
													setTeamList(teamTempList.filter((thing, i, arr) => arr.findIndex((t) => t.value === thing.value) === i));

													setTeamDetailList(teamListData);

													if (pathArray.length >= 4) {
														pageId = pathArray[3];

														const request: UserIdRequestModel = {
															queueId: Guid.create().toString(),
															userId: userAccessId.toString(),
															userIdRequest: parseInt(pageId),
														};

														getUserById(request)
															.then((response) => {
																if (response.data.status === successResponse) {
																	initializationMessagingHub.on(request.queueId.toString(), (message) => {
																		getUserByIdInfo(message.cacheId)
																			.then((data) => {
																				let resultData = Object.assign({}, data.data);
																				if (resultData) {
																					let teamSelectedItem = Array<TeamOption>();

																					resultData.teams.map((item) => {
																						const teamOption: TeamOption = {
																							value: item.id,
																							label: item.name,
																						};

																						teamSelectedItem.push(teamOption);
																					});

																					let ticketTeamAssignmentSelectedItem = Array<OptionsSelectedModel>();

																					resultData.ticketTeamAssignments.map((item) => {
																						const option: OptionsSelectedModel = {
																							value: item.ticketTeamAssignmentId.toString(),
																							label: item.ticketTeamAssignmentName,
																						};

																						ticketTeamAssignmentSelectedItem.push(option);
																					});

																					let ticketCurrencyAssignmentSelectedItem = Array<OptionsSelectedModel>();

																					resultData.ticketCurrencyAssignments.map((item) => {
																						const option: OptionsSelectedModel = {
																							value: item.currencyId?.toString() ?? '0',
																							label: item.currencyName ?? '',
																						};

																						ticketCurrencyAssignmentSelectedItem.push(option);
																					});
																					setuserIdDisplay(resultData.userId);

																					initialValues.userIdRequest = resultData.userId!;
																					initialValues.fullName = resultData.fullname!;
																					initialValues.email = resultData.email!;
																					initialValues.status = resultData.status!;
																					initialValues.createdBy = resultData.createdBy!;
																					initialValues.mcoreUserId = resultData.mCoreUserId!;

																					formik.setFieldValue('userId', initialValues.userId);
																					formik.setFieldValue('fullName', initialValues.fullName);
																					formik.setFieldValue('email', initialValues.email);
																					formik.setFieldValue('status', initialValues.status);
																					formik.setFieldValue('createdBy', initialValues.createdBy);
																					formik.setFieldValue('mcoreUserId', initialValues.mcoreUserId);
																					formik.setFieldValue('userIdRequest', initialValues.userIdRequest);

																					setSelectedTeams(teamSelectedItem);
																					setSelectedTeamAssignment(ticketTeamAssignmentSelectedItem);
																					setSelectedTicketCurrencyAssignment(ticketCurrencyAssignmentSelectedItem);

																					BuildTeamElements(teamSelectedItem, resultData.teams);
																				}
																			})
																			.catch((ex) => {
																				swal('Failed', 'Problem in getting record of the user selected', 'error');
																			});
																		initializationMessagingHub.off(request.queueId.toString());
																		initializationMessagingHub.stop();
																	});
																} else {
																	swal('Failed', response.data.message, 'error');
																	editUserDisableSplashScreen();
																}
															})
															.catch((ex) => {
																editUserDisableSplashScreen();
															});
													}
												})
												.catch(() => {
													editUserDisableSplashScreen();
												});
											initializationMessagingHub.off(request.queueId.toString());
											editUserDisableSplashScreen();
										});
										setTimeout(() => {
											if (initializationMessagingHub.state === HubConnected) {
												initializationMessagingHub.stop();
												setLoading(false);
												editUserDisableSplashScreen();
											}
										}, 30000);
									} else {
										editUserDisableSplashScreen();
										swal('Failed', response.data.message, 'error');
									}
								})
								.catch(() => {
									editUserDisableSplashScreen();
								});
							// end getting role
						} else {
							editUserDisableSplashScreen();
							swal('Failed', 'Problem connecting to the server, Please refresh', 'error');
						}
					})
					.catch((err) => {
						editUserDisableSplashScreen();
					});
			}, 1000);
			setLoaded(true);
		}
	}, []);

	/**
	 *  ? Methods
	 */

	function validateEmail(email: string) {
		const re =
			/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		return re.test(email);
	}

	function onChangeSelectedTeams(val: Array<TeamOption>) {
		setSelectedTeams(val);
		BuildTeamElements(val, teamDetailList);
	}
	function onChangeSelectedTeamAssignment(val: Array<OptionsSelectedModel>) {
		setSelectedTeamAssignment(val);
	}
	function onChangeSelectedTicketCurrencyAssignment(val: Array<OptionsSelectedModel>) {
		setSelectedTicketCurrencyAssignment(val);
	}
	function enabledResetPassword() {
		let resetPasswordInput = document.getElementById('resetPassword') as HTMLInputElement;
		resetPasswordInput.disabled = !resetPasswordInput.disabled;
		if (resetPasswordInput.disabled === false) {
			resetPasswordInput.value = '';
			resetPasswordInput.focus();
		} else {
			resetPasswordInput.value = 'password';
			resetPasswordInput.focus();
		}
	}

	const onChangeEditSubscription = useCallback((event: any) => {
		setUpdatedSubscription(event);
	}, []);

	const onGridReady = (params: any) => {
		params.api.sizeColumnsToFit();
	};

	const onPaginationChanged = useCallback(() => {
		if (gridRef.current.api) {
			//new implem
			setGridPageSize(gridRef.current.api.paginationGetPageSize());
			setGridCurrentPage(gridRef.current.api.paginationGetCurrentPage() + 1);
			setGridTotalPages(gridRef.current.api.paginationGetTotalPages());
		}
	}, []);

	const removeCommunicationProvider = (_data: CommunicationProviderAccountListbyIdResponseModel) => {
		swal({
			title: SwalConfirmMessage.title,
			text: SwalConfirmMessage.textConfirmRemove,
			icon: SwalConfirmMessage.icon,
			buttons: [SwalConfirmMessage.btnNo, SwalConfirmMessage.btnYes],
			dangerMode: true,
		}).then((willSave) => {
			if (willSave) {
				setAddCommunicationProviderAccountList(
					addCommunicationProviderAccountList.filter(
						(communicationListObj: CommunicationProviderAccountListbyIdResponseModel) => communicationListObj !== _data
					)
				);
			}
		});
	};

	const editCommunicationProvider = (_data: CommunicationProviderAccountListbyIdResponseModel) => {
		const {messageTypeId, messageTypeName, accountId, chatUserAccountId, chatUserAccountStatus, communicationProviderGuid, subscriptionId} = _data;
		setSelectedMessageType({label: messageTypeName, value: messageTypeId});
		setTextAccountId(accountId);
		setTextChatUserAccountId(chatUserAccountId);
		setSelectedProviderAccountStatus(
			chatUserAccountStatus.toString() === 'Inactive' ? {label: 'Inactive', value: '1'} : {label: 'Active', value: '0'}
		);
		setCommunicationProviderGuid(communicationProviderGuid);
		setShowEditCommunicationProviderModal(true);
		setUpdatedSubscription(subcriptionOptions.find((obj) => parseInt(obj.value) === subscriptionId));
	};

	const editUserValidateCommunicationProvider = async () => {
		// This Will Validate Regardless of Action

		let editUserCommunicationProvider: CommunicationProviderRequestModel = {
			userId: id,
			providerId: selectedMessageType.value,
			providerAccount: textAccountId,
			action: 'upd',
		};
		const response = await ValidateCommunicationProvider(editUserCommunicationProvider);
		return response.data;
	};

	const editUserSubmitCommunicationProvider = (_action: string) => {
		
		let editUserRequestObj: CommunicationProviderAccountListbyIdResponseModel = {
			communicationProviderGuid: Guid.create().toString(),
			accountId: textAccountId,
			chatUserAccountId: 0,
			chatUserAccountStatus: selectedProviderAccountStatus?.label,
			messageTypeId: parseInt(selectedMessageType?.value),
			messageTypeName: selectedMessageType?.label,
			subscriptionId:  parseInt(updatedSubscription?.value),
		};
		
		swal(SwalSuccessMessage.title, SwalSuccessMessage.textSuccess, SwalSuccessMessage.icon).then((isAdded) => {
			if (isAdded) {
				if (_action === 'add') {
					setAddCommunicationProviderAccountList([...addCommunicationProviderAccountList, editUserRequestObj]);
					setShowAddCommunicationProviderModal(false);
				} else {
					//on update
					setAddCommunicationProviderAccountList([
						editUserRequestObj,
						...addCommunicationProviderAccountList.filter((toRemoveObj) => toRemoveObj.communicationProviderGuid !== communicationProviderGuid),
					]);
					setTimeout(() => {
						setShowEditCommunicationProviderModal(false);
						setIsLoadingEditModal(false);
					}, 1000);
				}
			}
		});
	};

	const editUserAddCommunicationProvider = async () => {
		if (
			textAccountId === '' ||
			selectedMessageType.value === undefined ||
			selectedProviderAccountStatus.value === undefined ||
			validateEditFieldsWhenSameSpace()
		) {
			return swal(SwalFailedMessage.title, SwalFailedMessage.textMandatory, SwalFailedMessage.icon);
		}
		const editUserAddHasNoDuplicate: boolean = await editUserValidateCommunicationProvider();
		if (editUserAddHasNoDuplicate === false) {
			swal({
				title: SwalConfirmMessage.title,
				text: SwalConfirmMessage.textSaveSubtopic,
				icon: SwalConfirmMessage.icon,
				buttons: [SwalConfirmMessage.btnNo, SwalConfirmMessage.btnYes],
				dangerMode: true,
			}).then((onConfirm) => {
				if (onConfirm) {
					editUserSubmitCommunicationProvider('add');
				}
			});
		} else {
			return swal(SwalFailedMessage.title, SwalFailedMessage.textAccountIdExists, SwalFailedMessage.icon);
		}
	};

	const editUserUpdateCommunicationProvider = async () => {
		setIsLoadingEditModal(true);
		if (
			textAccountId === '' ||
			selectedMessageType.value === undefined ||
			selectedProviderAccountStatus.value === undefined ||
			validateEditFieldsWhenSameSpace()
		) {
			return swal(SwalFailedMessage.title, SwalFailedMessage.textMandatory, SwalFailedMessage.icon).then((isFailed) => {
				if (isFailed) {
					setIsLoadingEditModal(false);
				}
			});
		}

		const editUserUpdateHasNoDuplicate = await editUserValidateCommunicationProvider();
		if (editUserUpdateHasNoDuplicate === false) {
			swal({
				title: SwalConfirmMessage.title,
				text: message.genericSaveConfirmation,
				icon: SwalConfirmMessage.icon,
				buttons: [SwalConfirmMessage.btnNo, SwalConfirmMessage.btnYes],
				dangerMode: true,
			}).then((onConfirm) => {
				if (onConfirm) {
					editUserSubmitCommunicationProvider('edit');
				} else {
					setIsLoadingEditModal(false);
				}
			});
		} else {
			return swal(SwalFailedMessage.title, SwalFailedMessage.textAccountIdExists, SwalFailedMessage.icon).then((isFailed) => {
				if (isFailed) {
					setIsLoadingEditModal(false);
				}
			});
		}
	};

	const closeEditCommunicationModal = () => {
		swal({
			title: SwalConfirmMessage.title,
			text: SwalConfirmMessage.textDiscard,
			icon: SwalConfirmMessage.icon,
			buttons: [SwalConfirmMessage.btnNo, SwalConfirmMessage.btnYes],
			dangerMode: true,
		}).then((willSave) => {
			if (willSave) {
				setSelectedMessageType([]);
				setTextAccountId('');
				setSelectedProviderAccountStatus([]);
				setCommunicationProviderGuid('');
				setShowEditCommunicationProviderModal(false);
			}
		});
	};

	/**
	 *  ? Events
	 */
	const onChangeSelectedMessageType = useCallback(
		(event: any) => {
			setSelectedMessageType(event);
			if (event.value !== MessageTypeEnum.Samespace.toString()) setUpdatedSubscription('');
		},
		[selectedMessageType]
	);

	const onChangeSelectedProviderAccountStatus = useCallback(
		(event: any) => {
			setSelectedProviderAccountStatus(event);
		},
		[selectedProviderAccountStatus]
	);

	function onClose() {
		swal({
			title: 'Confirmation',
			text: 'This action will discard any changes made and return to User Search page, please confirm',
			icon: 'warning',
			buttons: ['No', 'Yes'],
			dangerMode: true,
		}).then((willClose) => {
			if (willClose) {
				history.push('/user-management/user-list');
			}
		});
	}

	const addCommunicationModal = useCallback(() => {
		setIsLoadingAddModal(true);
		setSelectedMessageType([]);
		setTextAccountId('');
		setSelectedProviderAccountStatus({label: 'Active', value: '1'});
		setShowAddCommunicationProviderModal(true);

		setTimeout(() => {
			setIsLoadingAddModal(false);
		}, 1000);
	}, [showAddCommunicationProviderModal]);

	const closeAddCommunicationModal = () => {
		swal({
			title: SwalConfirmMessage.title,
			text: SwalConfirmMessage.textDiscard,
			icon: SwalConfirmMessage.icon,
			buttons: [SwalConfirmMessage.btnNo, SwalConfirmMessage.btnYes],
			dangerMode: true,
		}).then((willSave) => {
			if (willSave) {
				setSelectedMessageType([]);
				setTextAccountId('');
				setSelectedProviderAccountStatus([]);
				setUpdatedSubscription([]);
				setShowAddCommunicationProviderModal(false);
			}
		});
	};

	return (
		<form className='form w-100' onSubmit={formik.handleSubmit} noValidate>
			<div className='card card-custom'>
				<div
					className='card-header cursor-pointer'
					role='button'
					data-bs-toggle='collapse'
					data-bs-target='#kt_account_deactivate'
					aria-expanded='true'
					aria-controls='kt_account_deactivate'
				>
					<div className='card-title m-0'>
						<h5 className='fw-bolder m-0'>Edit User</h5>
					</div>
				</div>
				<div className='card-body p-9'>
					<div className='d-flex align-items-center my-2'>
						<div className='row mb-3'>
							<div className='row mb-3'>
								<div className='col-sm-3'>
									<label className='form-label-lg fw-bold '>User Id </label>
								</div>
								<div className='col-sm-6'>
									<label className='form-label-lg fw-bold '>{userIdDisplay}</label>
								</div>
							</div>
							<br />
							<UserDetailsForm formik={formik} hasDisabledFields={true} />
							<div className='row mb-3'>
								<div className='col-sm-3'>
									<label className='form-label-sm required'>Password </label>
								</div>
								<div className='col-sm-6'>
									<input
										id='resetPassword'
										disabled
										type='password'
										autoComplete='off'
										placeholder='********'
										{...formik.getFieldProps('password')}
										className={clsx(
											'form-control form-control-sm form-control-solid',
											{
												'is-invalid': formik.touched.password && formik.errors.password,
											},
											{
												'is-valid': formik.touched.password && !formik.errors.password,
											}
										)}
									/>
								</div>
							</div>
							<div className='row mb-3'>
								<div className='col-sm-3'>
									<label className='form-label-sm required'>Status</label>
								</div>
								<div className='col-sm-6'>
									<select className='form-select form-select-sm' aria-label='Select status' {...formik.getFieldProps('status')}>
										<option value='0'>Select</option>
										<option value='1'>Active</option>
										<option value='2'>Inactive</option>
										<option value='3'>Locked</option>
									</select>
								</div>
							</div>
							<div className='row mb-3'>
								<div className='col-sm-3'>
									<label className='form-label-sm required'>Teams</label>
								</div>
								<div className='col-sm-6'>
									<Select {...formik.getFieldProps('teams')} isMulti options={teamList} onChange={onChangeSelectedTeams} value={selectedTeams} />
								</div>
							</div>
							<div className='row mb-3'>
								<div className='col-sm-3'>
									<label className='form-label-lg fw-bold '>Created By</label>
								</div>
								<div className='col-sm-6'>
									<input type='text' className='form-control form-control-sm' disabled aria-label='Email' {...formik.getFieldProps('createdBy')} />
								</div>
							</div>
							<div className='row mb-3'>
								<div className='col-sm-3'>
									<div className='form-label-sm'>MCORE User ID</div>
								</div>
								<div className='col-sm-6'>
									<input type='text' className='form-control form-control-sm' aria-label='MCORE User ID' {...formik.getFieldProps('mcoreUserId')} />
								</div>
							</div>
							<div className='row mb-3'>
								<div className='col-sm-3'>
									<div className='form-label-sm'>Ticket Team Assignment</div>
								</div>
								<div className='col-sm-6'>
									<Select
										{...formik.getFieldProps('teamAssignment')}
										isMulti
										options={teamAssignment}
										onChange={onChangeSelectedTeamAssignment}
										value={selectedTeamAssignment}
									/>
								</div>
							</div>
							<div className='row mb-3'>
								<div className='col-sm-3'>
									<div className='form-label-sm'>Ticket Currency Assignment</div>
								</div>
								<div className='col-sm-6'>
									<Select
										{...formik.getFieldProps('ticketCurrencyAssignment')}
										isMulti
										options={currencyList}
										onChange={onChangeSelectedTicketCurrencyAssignment}
										value={selectedTicketCurrencyAssignment}
									/>
								</div>
							</div>

							<Row style={{marginTop: 20}}>
								<Col>
									<MlabButton
										access={access?.includes(USER_CLAIMS.UserManagementWrite)}
										size={'sm'}
										label={'Add Communication Provider Account'}
										style={ElementStyle.primary}
										type={'button'}
										weight={'solid'}
										onClick={addCommunicationModal}
									/>
								</Col>
							</Row>
							<CommunicationProviderAccountList
								customPageSizeElementId='create-user'
								gridCurrentPage={gridCurrentPage}
								gridPageSize={gridPageSize}
								gridRef={gridRef}
								gridTotalPages={gridTotalPages}
								onGridReady={onGridReady}
								onPaginationChanged={onPaginationChanged}
								rowData={addCommunicationProviderAccountList}
								setGridPageSize={setGridPageSize}
								removeCommunicationProvider={removeCommunicationProvider}
								editCommunicationProvider={editCommunicationProvider}
							/>
							<PaddedDiv />
							<PaddedDiv />

							<div className='d-flex my-4'>
								<button type='button' className='btn btn-secondary btn-sm me-0' onClick={enabledResetPassword}>
									Reset Password
								</button>
							</div>

							<div className='separator border-4 my-10' />
							<h6 className='fw-bolder m-0'>Team Detail</h6>
							<br />
							<br />

							<div className='accordion' id='tblAccordion'></div>

							<div className='d-flex my-4'>
								{userAccess.includes(USER_CLAIMS.UsersWrite) === true && (
									<button type='submit' className='btn btn-primary btn-sm me-2' disabled={formik.isSubmitting}>
										{!loading && <span className='indicator-label'>Submit</span>}
										{loading && (
											<span className='indicator-progress' style={{display: 'block'}}>
												Please wait...
												<span className='spinner-border spinner-border-sm align-middle ms-2'></span>
											</span>
										)}
									</button>
								)}

								<button type='button' className='btn btn-sm btn-secondary' onClick={onClose}>
									Close
								</button>
							</div>
						</div>
						{/* Modals */}
						<AddCommunicationProviderModal
							setShowAddCommunicationProviderModal={setShowAddCommunicationProviderModal}
							showAddCommunicationProviderModal={showAddCommunicationProviderModal}
							messageTypeOptionList={ArrayOptionMessageTypeObj}
							onChangeSelectedMessageType={onChangeSelectedMessageType}
							onChangeAddSelectedProviderAccountStatus={onChangeSelectedProviderAccountStatus}
							selectedMessageType={selectedMessageType}
							selectedAddProviderAccountStatus={selectedProviderAccountStatus}
							setSelectedProviderAccountStatus={setSelectedProviderAccountStatus}
							addTextAccountId={textAccountId}
							setAddTextAccountId={setTextAccountId}
							communicationProviderStatusOptions={communicationProviderStatusOptions}
							addCommunicationProvider={editUserAddCommunicationProvider}
							closeAddCommunicationModal={closeAddCommunicationModal}
							isLoadingAddModal={isLoadingAddModal}
							subscription={updatedSubscription}
							subcriptionOption={subcriptionOptions}
							onChangeAddSubscription={onChangeEditSubscription}
						/>

						<EditCommunicationProviderModal
							textAccountId={textAccountId}
							setTextAccountId={setTextAccountId}
							communicationProviderStatusOptions={communicationProviderStatusOptions}
							messageTypeOptionList={ArrayOptionMessageTypeObj}
							onChangeSelectedMessageType={onChangeSelectedMessageType}
							onChangeSelectedProviderAccountStatus={onChangeSelectedProviderAccountStatus}
							selectedMessageType={selectedMessageType}
							selectedProviderAccountStatus={selectedProviderAccountStatus}
							setShowEditCommunicationProviderModal={setShowEditCommunicationProviderModal}
							showEditCommunicationProviderModal={showEditCommunicationProviderModal}
							updateCommunicationProvider={editUserUpdateCommunicationProvider}
							isLoadingEditModal={isLoadingEditModal}
							closeEditCommunicationModal={closeEditCommunicationModal}
							onChangeEditSubscription={onChangeEditSubscription}
							subcriptionOptionEdit={subcriptionOptions}
							subscriptionEdit={updatedSubscription}
						/>
					</div>
				</div>
			</div>
		</form>
	);
};
export default EditUser;
