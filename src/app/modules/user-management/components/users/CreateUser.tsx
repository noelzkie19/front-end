import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import {useFormik} from 'formik';
import {Guid} from 'guid-typescript';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {Col, Row} from 'react-bootstrap-v5';
import {shallowEqual, useSelector} from 'react-redux';
import {useHistory} from 'react-router-dom';
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
import {CommunicationProviderAccountListbyIdResponseModel} from '../../models';
import {CommunicationProviderRequestModel} from '../../models/CommunicationProviderRequestModel';
import {TeamFilterModel} from '../../models/TeamFilerModel';
import {TeamModel} from '../../models/TeamModel';
import {UserIdRequestModel} from '../../models/UserIdRequestModel';
import {UserRequestModel} from '../../models/UserRequestModel';
import {
	ValidateCommunicationProvider,
	addUser,
	getTeamList,
	getTeamListResult,
	getUserById,
	getUserByIdInfo,
} from '../../redux/UserManagementService';
import {USER_CLAIMS} from '../constants/UserClaims';
import {AddCommunicationProviderModal, EditCommunicationProviderModal} from '../shared/compoments';
import CommunicationProviderAccountList from '../shared/compoments/CommunicationProviderAccountList';
import UserDetailsForm from '../shared/compoments/UserDetailsForm';
import {UseUserManagementHooks} from '../shared/hooks';
import {BuildTeamElements} from '../shared/utils/helper';

const teamScheema = Yup.object().shape({
	fullName: Yup.string(),
	email: Yup.string(),
	status: Yup.number(),
	teams: Yup.array(),
	createdBy: Yup.string(),
	queueId: Yup.string(),
	userId: Yup.string(),
});

interface TeamOption {
	value: string;
	label: string;
}

const initialValues = {
	fullName: '',
	email: '',
	status: 0,
	teams: Array<TeamOption>(),
	createdBy: '0',
	queueId: '',
	userId: '',
	ticketTeamAssignmentId: Array<OptionsSelectedModel>(),
	ticketCurrencyAssignmentId: Array<OptionsSelectedModel>(),
	mcoreUserId: '',
};

const createUserEnableSplashScreen = () => {
	const _enablesplashScreen = document.getElementById('splash-screen');
	if (_enablesplashScreen) {
		_enablesplashScreen.style.setProperty('display', 'flex');
		_enablesplashScreen.style.setProperty('opacity', '0.5');
	}
};

const createUserDisableSplashScreen = () => {
	const _disablesplashScreen = document.getElementById('splash-screen');
	if (_disablesplashScreen) {
		_disablesplashScreen.style.setProperty('display', 'none');
	}
};

const PaddedDiv = () => <div style={{margin: 20}} />;

const CreateUser: React.FC = () => {
	// Redux
	const userAccessId = useSelector<RootState>(({auth}) => auth.userId, shallowEqual) as number;
	const {access, userId, fullName} = useSelector<RootState>(({auth}) => auth, shallowEqual) as IAuthState;

	const expiresIn = useSelector<RootState>(({auth}) => auth.expiresIn, shallowEqual) as string;
	const history = useHistory();

	//CONSTANTS
	const {
		successResponse,
		HubConnected,
		SwalFailedMessage,
		SwalSuccessMessage,
		SwalConfirmMessage,
		message,
		SwalUserConfirmMessage,
		masterReferenceIds,
	} = useConstant();
	const {teamAssignment, getTeamAssignment} = useTicketManagementHooks();

	// STATES WITH MODELS
	const [loading, setLoading] = useState(false);
	const [teamDetailList, setTeamDetailList] = useState<Array<TeamModel>>([]);
	const [teamList, setTeamList] = useState<Array<TeamOption>>([]);
	const [isLoaded, setLoaded] = useState(false);
	const [selectedTeams, setSelectedTeams] = useState<Array<TeamOption>>([]);
	const [showAddCommunicationProviderModal, setShowAddCommunicationProviderModal] = useState(false);
	const [showEditCommunicationProviderModal, setShowEditCommunicationProviderModal] = useState(false);
	const [selectedCreateMessageType, setSelectedMessageType] = useState<string | any>('');
	const [selectedProviderAccountStatus, setSelectedProviderAccountStatus] = useState<string | any>('');
	const [textAccountId, setTextAccountId] = useState<string>('');
	const [addCommunicationProviderAccountList, setAddCommunicationProviderAccountList] = useState<
		Array<CommunicationProviderAccountListbyIdResponseModel>
	>([]);
	const [isLoadingAddModal, setIsLoadingAddModal] = useState<boolean>(false);
	const [isLoadingEditModal, setIsLoadingEditModal] = useState<boolean>(false);
	const [communicationProviderGuid, setCommunicationProviderGuid] = useState<string>('');

	const [selectedTeamAssignment, setSelectedTeamAssignment] = useState<Array<OptionsSelectedModel>>([]);
	const [selectedTicketCurrencyAssignment, setSelectedTicketCurrencyAssignment] = useState<Array<OptionsSelectedModel>>([]);

	// Pagination States
	const [gridPageSize, setGridPageSize] = useState<number>(10);
	const [gridCurrentPage, setGridCurrentPage] = useState<number>(1);
	const [gridTotalPages, setGridTotalPages] = useState<number>(1);
	const gridRef: any = useRef();

	const {getMessageTypeOptionList, messageTypeOptionList} = useSystemOptionHooks();
	const {getCommunicationProviderAccountStatusOptions, communicationProviderStatusOptions} = UseUserManagementHooks();
	const ArrayOptionMessageTypeObj = messageTypeOptionList.filter(
		({value}) => !addCommunicationProviderAccountList.some(({messageTypeId}) => messageTypeId.toString() === value)
	);
	const [subscriptionCreate, setSubscriptionCreate] = useState<any>('');

	useEffect(() => {
		getTeamAssignment();
	}, []);
	const currencyList = useCurrencies(userAccessId);

	/**
	 *  ? states
	 */

	const subcriptionOptions = useMasterReferenceOption(masterReferenceIds.parentId.Subscription.toString())
		.filter((x: MasterReferenceOptionModel) => x.masterReferenceParentId !== 0)
		.map((x: MasterReferenceOptionModel) => x.options);

	const validateFieldsWhenSameSpace = () => {
		return selectedCreateMessageType.value === MessageTypeEnum.Samespace.toString() && subscriptionCreate.value === undefined;
	};

	/**
	 *  ? Formik
	 */
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
			values.ticketTeamAssignmentId = selectedTeamAssignment;
			values.ticketCurrencyAssignmentId = selectedTicketCurrencyAssignment;
			values.createdBy = userAccessId.toString();
			const userIdInit = 0;
			setLoading(true);
			let isValid: boolean = true;

			if (values.fullName === '' || values.email === '' || values.status.toString() === '0' || values.teams.length === 0) {
				swal(SwalFailedMessage.title, SwalFailedMessage.textMandatory, SwalFailedMessage.icon);
				setSubmitting(false);
				setLoading(false);
				isValid = false;
			}
			if (validateEmail(values.email) === false) {
				swal(SwalFailedMessage.title, SwalFailedMessage.textEmailAddressWrongFormat, SwalFailedMessage.icon);
				setLoading(false);
				setSubmitting(false);
				isValid = false;
			}

			setTimeout(() => {
				if (isValid === true) {
					swal({
						title: 'Confirmation',
						text: SwalConfirmMessage.textSaveConfirm,
						icon: 'warning',
						buttons: ['No', 'Yes'],
						dangerMode: true,
					}).then((willCreateUser) => {
						if (willCreateUser) {
							formik.setSubmitting(true);
							setLoading(true);
							const createFormSubmitMessagingHub = hubConnection.createHubConnenction();
							createFormSubmitMessagingHub
								.start()
								.then(() => {
									if (createFormSubmitMessagingHub.state === HubConnected) {
										const request: UserRequestModel = {
											userIdRequest: userIdInit,
											createdBy: userAccessId,
											email: values.email,
											fullName: values.fullName,
											status: parseInt(values.status.toString()),
											ticketTeamAssignmentId: values.ticketTeamAssignmentId,
											ticketCurrencyAssignmentId: values.ticketCurrencyAssignmentId,
											mcoreUserId: values.mcoreUserId,
											teams: values.teams,
											updatedBy: userAccessId,
											queueId: values.queueId,
											userId: values.userId,
											userPassword: '',
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

										addUser(request)
											.then((response) => {
												if (response.status === successResponse) {
													createFormSubmitMessagingHub.on(request.queueId.toString(), (message) => {
														let resultData = JSON.parse(message.remarks);

														if (resultData.Status !== successResponse) {
															swal('Failed', resultData.Message, 'error');
															setLoading(false);
															setSubmitting(false);
														} else {
															resetForm({});
															clearInput();
															formik.setFieldValue('fullName', '');
															formik.setFieldValue('email', '');
															formik.setFieldValue('status', 0);
															formik.setFieldValue('mcoreUserId', '');
															setAddCommunicationProviderAccountList([]);
															swal('Successful!', 'Record successfully submitted', 'success').then((onSuccess) => {
																if (onSuccess) {
																	history.push(`/user-management/user-list`);
																	setSubmitting(false);
																}
															});
														}
														createFormSubmitMessagingHub.off(request.queueId.toString());
														createFormSubmitMessagingHub.stop();
														setLoading(false);
													});

													setTimeout(() => {
														if (createFormSubmitMessagingHub.state === HubConnected) {
															createFormSubmitMessagingHub.stop();
															setLoading(false);
															setSubmitting(false);
														}
													}, 30000);
												} else {
													createFormSubmitMessagingHub.stop();
													swal('Failed', response.data.message, 'error');
													formik.setSubmitting(false);
												}
											})
											.catch(() => {
												createFormSubmitMessagingHub.stop();
												swal('Failed', 'Problem creating the user', 'error');
												setLoading(false);
												setSubmitting(false);
											});
									} else {
										swal('Failed', 'Problem connecting to the server, Please refresh', 'error');
									}
								})
								.catch((err) => console.log('Error while starting connection: ' + err));
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

	function validateEmail(email: string) {
		const re =
			/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		return re.test(email);
	}

	useEffect(() => {
		const pathArray = window.location.pathname.split('/');
		let pageAction: string = '';
		let pageId: string = '';

		if (isLoaded === false) {
			if (InternetConnectionHandler.isSlowConnection(history) === true) {
				return;
			}

			createUserEnableSplashScreen();
			setTimeout(() => {
				const createInitialMessagingHub = hubConnection.createHubConnenction();

				createInitialMessagingHub
					.start()
					.then(() => {
						if (createInitialMessagingHub.state === HubConnected) {
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
										createInitialMessagingHub.on(request.queueId.toString(), (message) => {
											getTeamListResult(message.cacheId)
												.then((data) => {
													let teamListData = Object.assign(new Array<TeamModel>(), data.data);
													let teamTempList = Array<TeamOption>();

													teamListData.forEach((team) => {
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
														pageAction = pathArray[3];
														pageId = pathArray[4];

														if (pageAction === 'clone') {
															const request: UserIdRequestModel = {
																queueId: Guid.create().toString(),
																userId: userAccessId.toString(),
																userIdRequest: parseInt(pageId),
															};

															getUserById(request)
																.then((response) => {
																	if (response.data.status === successResponse) {
																		createInitialMessagingHub.on(request.queueId.toString(), (message) => {
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

																						setSelectedTeams(teamSelectedItem);
																						BuildTeamElements(teamSelectedItem, resultData.teams);
																					}
																				})
																				.catch((ex) => {
																					swal('Failed', 'Problem in getting record of the user selected', 'error');
																				});
																			createInitialMessagingHub.off(request.queueId.toString());
																			createInitialMessagingHub.stop();
																			createUserDisableSplashScreen();
																		});
																	} else {
																		createUserDisableSplashScreen();
																		swal('Failed', response.data.message, 'error');
																	}
																})
																.catch((ex) => {
																	createUserDisableSplashScreen();
																	swal('Failed', 'Problem in getting team info', 'error');
																});
														}
													}
												})
												.catch(() => {
													createUserDisableSplashScreen();
													swal('Failed', 'Problem in getting team list', 'error');
												});
											createInitialMessagingHub.off(request.queueId.toString());
											createUserDisableSplashScreen();
										});

										setTimeout(() => {
											if (createInitialMessagingHub.state === HubConnected) {
												createInitialMessagingHub.stop();
												createUserDisableSplashScreen();
												setLoading(false);
											}
										}, 30000);
									} else {
										createInitialMessagingHub.stop();
										createUserDisableSplashScreen();
										swal('Failed', response.data.message, 'error');
									}
								})
								.catch(() => {
									createInitialMessagingHub.stop();
									createUserDisableSplashScreen();
								});
						} else {
							createUserDisableSplashScreen();
							swal('Failed', 'Problem connecting to the server, Please refresh', 'error');
						}
					})
					.catch((err) => {
						createUserDisableSplashScreen();
					});
			}, 1000);

			setLoaded(true);
		}
	});

	useEffect(() => {
		getMessageTypeOptionList('');
		getCommunicationProviderAccountStatusOptions();
	}, []);

	const onPaginationChanged = useCallback(() => {
		if (gridRef.current.api) {
			//new implem
			setGridPageSize(gridRef.current.api.paginationGetPageSize());
			setGridCurrentPage(gridRef.current.api.paginationGetCurrentPage() + 1);
			setGridTotalPages(gridRef.current.api.paginationGetTotalPages());
		}
	}, []);

	// METHODS

	const onGridReady = (params: any) => {
		params.api.sizeColumnsToFit();
	};

	const onChangeAddSubscription = useCallback((event: any) => {
		setSubscriptionCreate(event);
	}, []);

	function clearInput() {
		const container = document.getElementById('tblAccordion');

		if (container) {
			container.innerHTML = '';
		}

		setSelectedTeams([]);
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

	function onClose() {
		swal({
			title: SwalUserConfirmMessage.title,
			text: SwalUserConfirmMessage.textDiscard,
			icon: SwalUserConfirmMessage.icon,
			buttons: [SwalUserConfirmMessage.btnNo, SwalUserConfirmMessage.btnYes],
			dangerMode: true,
		}).then((onConfirm) => {
			if (onConfirm) {
				history.push('/user-management/user-list');
			}
		});
	}

	const addUserValidateCommunicationProvider = async () => {
		let addUserCommunicationProvider: CommunicationProviderRequestModel = {
			userId: 0,
			providerId: selectedCreateMessageType.value,
			providerAccount: textAccountId,
			action: 'add',
		};
		const addUserResponse = await ValidateCommunicationProvider(addUserCommunicationProvider);
		return addUserResponse.data;
	};

	const createUserSubmitCommunicationProvider = (_action: string) => {
		let createUserRequestObj: CommunicationProviderAccountListbyIdResponseModel = {
			communicationProviderGuid: Guid.create().toString(),
			accountId: textAccountId,
			chatUserAccountId: 0,
			chatUserAccountStatus: selectedProviderAccountStatus.label,
			messageTypeId: selectedCreateMessageType.value,
			messageTypeName: selectedCreateMessageType.label,
			subscriptionId: parseInt(subscriptionCreate.value),
		};
		swal(SwalSuccessMessage.title, SwalSuccessMessage.textSuccess, SwalSuccessMessage.icon).then((isAdded) => {
			if (isAdded) {
				if (_action === 'add') {
					setAddCommunicationProviderAccountList([...addCommunicationProviderAccountList, createUserRequestObj]);
					setShowAddCommunicationProviderModal(false);
				} else {
					//on update
					setAddCommunicationProviderAccountList([
						createUserRequestObj,
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

	const createUserAddCommunicationProvider = async () => {
		console.log(validateFieldsWhenSameSpace());

		if (
			textAccountId === '' ||
			selectedCreateMessageType.value === undefined ||
			selectedProviderAccountStatus.value === undefined ||
			validateFieldsWhenSameSpace()
		) {
			return swal(SwalFailedMessage.title, SwalFailedMessage.textMandatory, SwalFailedMessage.icon);
		}

		const createUserHasNoDuplicate = await addUserValidateCommunicationProvider();
		if (createUserHasNoDuplicate === false) {
			swal({
				title: SwalConfirmMessage.title,
				text: SwalConfirmMessage.textSaveSubtopic,
				icon: SwalConfirmMessage.icon,
				buttons: [SwalConfirmMessage.btnNo, SwalConfirmMessage.btnYes],
				dangerMode: true,
			}).then((onConfirm) => {
				if (onConfirm) {
					createUserSubmitCommunicationProvider('add');
				}
			});
		} else {
			return swal(SwalFailedMessage.title, SwalFailedMessage.textAccountIdExists, SwalFailedMessage.icon);
		}
	};

	const createUserRemoveCommunicationProvider = (_createUserRemoveData: CommunicationProviderAccountListbyIdResponseModel) => {
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
						(communicationListObj: CommunicationProviderAccountListbyIdResponseModel) => communicationListObj !== _createUserRemoveData
					)
				);
			}
		});
	};

	/**
	 *  ? Events
	 */
	const onChangeSelectedMessageType = useCallback(
		(event: any) => {
			setSelectedMessageType(event);
			if (event.value !== MessageTypeEnum.Samespace.toString()) setSubscriptionCreate('');
		},
		[selectedCreateMessageType]
	);

	const onChangeSelectedProviderAccountStatus = useCallback(
		(event: any) => {
			setSelectedProviderAccountStatus(event);
		},
		[selectedProviderAccountStatus]
	);

	const addCommunicationCreateModal = useCallback(() => {
		setIsLoadingAddModal(true);
		setSelectedMessageType([]);
		setTextAccountId('');
		setSelectedProviderAccountStatus({label: 'Active', value: '1'});
		setShowAddCommunicationProviderModal(true);

		setTimeout(() => {
			setIsLoadingAddModal(false);
		}, 1000);
	}, [showAddCommunicationProviderModal]);

	const closeAddCommunicationCreateModal = () => {
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
				setShowAddCommunicationProviderModal(false);
			}
		});
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

	const editCommunicationProvider = useCallback(
		(_data: CommunicationProviderAccountListbyIdResponseModel) => {
			const {messageTypeId, messageTypeName, accountId, chatUserAccountStatus, communicationProviderGuid, subscriptionId} = _data;
			setSelectedMessageType({label: messageTypeName, value: messageTypeId});
			setTextAccountId(accountId);
			setSelectedProviderAccountStatus(
				chatUserAccountStatus.toString() === 'Inactive' ? {label: 'Inactive', value: '0'} : {label: 'Active', value: '1'}
			);
			setCommunicationProviderGuid(communicationProviderGuid);
			setShowEditCommunicationProviderModal(true);
			setSubscriptionCreate(subcriptionOptions.find((obj) => parseInt(obj.value) === subscriptionId));
		},
		[showEditCommunicationProviderModal, subcriptionOptions]
	);

	const updateCommunicationProvider = async () => {
		setIsLoadingEditModal(true);
		if (textAccountId === '' || selectedCreateMessageType.value === undefined || selectedProviderAccountStatus.value === undefined) {
			return swal(SwalFailedMessage.title, SwalFailedMessage.textMandatory, SwalFailedMessage.icon).then((isFailed) => {
				if (isFailed) {
					setIsLoadingEditModal(false);
				}
			});
		}

		const hasNoDuplicate = await addUserValidateCommunicationProvider();
		if (hasNoDuplicate === false) {
			swal({
				title: SwalConfirmMessage.title,
				text: message.genericSaveConfirmation,
				icon: SwalConfirmMessage.icon,
				buttons: [SwalConfirmMessage.btnNo, SwalConfirmMessage.btnYes],
				dangerMode: true,
			}).then((onConfirm) => {
				if (onConfirm) {
					createUserSubmitCommunicationProvider('edit');
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

	// RETURN ELEMENTS
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
						<h5 className='fw-bolder m-0'>Create User</h5>
					</div>
				</div>
				<div className='card-body p-9'>
					<div className='d-flex align-items-center my-2'>
						<div className='row mb-3'>
							<UserDetailsForm formik={formik} />
							<div className='row mb-3'>
								<div className='col-sm-3'>
									<label className='form-label-sm required'>Status</label>
								</div>
								<div className='col-sm-6'>
									<select className='form-select form-select-sm' aria-label='Select status' {...formik.getFieldProps('status')}>
										<option value='0'>Select</option>
										<option value='1'>Active</option>
										<option value='2'>Inactive</option>
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
									<div className='form-label-sm'>MCORE User ID</div>
								</div>
								<div className='col-sm-6'>
									<input type='text' className='form-control form-control-sm' aria-label='MCORE UserID' {...formik.getFieldProps('mcoreUserId')} />
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
										aria-label='Ticket Team Assignment'
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
										aria-label='Ticket Currency Assignment'
									/>
								</div>
							</div>

							<div className='row mb-3'></div>
							<Row>
								<Col>
									<MlabButton
										access={access?.includes(USER_CLAIMS.UserManagementWrite)}
										size={'sm'}
										label={'Add Communication Provider Account'}
										style={ElementStyle.primary}
										type={'button'}
										weight={'solid'}
										onClick={addCommunicationCreateModal}
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
								removeCommunicationProvider={createUserRemoveCommunicationProvider}
								editCommunicationProvider={editCommunicationProvider}
							/>
							<PaddedDiv />

							<div className='separator border-4 my-10' />
							<h6 className='fw-bolder m-0'>Team Detail</h6>
							<br />
							<br />

							<div className='accordion' id='tblAccordion'></div>

							<div className='d-flex my-4'>
								<button type='submit' className='btn btn-primary btn-sm me-2' disabled={formik.isSubmitting}>
									{!loading && <span className='indicator-label'>Submit</span>}
									{loading && (
										<span className='indicator-progress' style={{display: 'block'}}>
											Please wait...
											<span className='spinner-border spinner-border-sm align-middle ms-2'></span>
										</span>
									)}
								</button>
								<button type='button' className='btn btn-sm btn-secondary' onClick={onClose}>
									Close
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Modals */}
			<AddCommunicationProviderModal
				setShowAddCommunicationProviderModal={setShowAddCommunicationProviderModal}
				showAddCommunicationProviderModal={showAddCommunicationProviderModal}
				messageTypeOptionList={ArrayOptionMessageTypeObj}
				onChangeSelectedMessageType={onChangeSelectedMessageType}
				onChangeAddSelectedProviderAccountStatus={onChangeSelectedProviderAccountStatus}
				selectedMessageType={selectedCreateMessageType}
				selectedAddProviderAccountStatus={selectedProviderAccountStatus}
				setSelectedProviderAccountStatus={setSelectedProviderAccountStatus}
				addTextAccountId={textAccountId}
				setAddTextAccountId={setTextAccountId}
				communicationProviderStatusOptions={communicationProviderStatusOptions}
				addCommunicationProvider={createUserAddCommunicationProvider}
				closeAddCommunicationModal={closeAddCommunicationCreateModal}
				isLoadingAddModal={isLoadingAddModal}
				subscription={subscriptionCreate}
				subcriptionOption={subcriptionOptions}
				onChangeAddSubscription={onChangeAddSubscription}
			/>

			<EditCommunicationProviderModal
				textAccountId={textAccountId}
				setTextAccountId={setTextAccountId}
				communicationProviderStatusOptions={communicationProviderStatusOptions}
				messageTypeOptionList={ArrayOptionMessageTypeObj}
				onChangeSelectedMessageType={onChangeSelectedMessageType}
				onChangeSelectedProviderAccountStatus={onChangeSelectedProviderAccountStatus}
				selectedMessageType={selectedCreateMessageType}
				selectedProviderAccountStatus={selectedProviderAccountStatus}
				setShowEditCommunicationProviderModal={setShowEditCommunicationProviderModal}
				showEditCommunicationProviderModal={showEditCommunicationProviderModal}
				updateCommunicationProvider={updateCommunicationProvider}
				isLoadingEditModal={isLoadingEditModal}
				closeEditCommunicationModal={closeEditCommunicationModal}
				onChangeEditSubscription={onChangeAddSubscription}
				subcriptionOptionEdit={subcriptionOptions}
				subscriptionEdit={subscriptionCreate}
			/>
		</form>
	);
};
export default CreateUser;
