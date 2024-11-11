import {useFormik} from 'formik';
import {Guid} from 'guid-typescript';
import React, {useEffect, useState} from 'react';
import {ButtonGroup} from 'react-bootstrap-v5';
import {shallowEqual, useSelector} from 'react-redux';
import {useHistory, useParams} from 'react-router-dom';
import Select from 'react-select';
import swal from 'sweetalert';
import * as hubConnection from '../../../../../setup/hub/MessagingHub';
import {RootState} from '../../../../../setup/redux/RootReducer';
import {OptionListModel} from '../../../../common/model';
import {ElementStyle} from '../../../../constants/Constants';
import useConstant from '../../../../constants/useConstant';
import {
	ContentContainer,
	DefaultSecondaryButton,
	FooterContainer,
	FormContainer,
	FormGroupContainer,
	FormHeader,
	GridWithLoader,
	LoaderButton,
	MainContainer,
	MlabButton,
	PaddedContainer,
} from '../../../../custom-components';
import {usePromptOnUnload} from '../../../../custom-helpers';
import {LookupModel} from '../../../../shared-models/LookupModel';
import {IAuthState} from '../../../auth';
import {USER_CLAIMS} from '../../../user-management/components/constants/UserClaims';
import useRemProfileConstant from '../../constants/useRemProfileConstant';
import {
	LiveChatRequest,
	LivePersonRequest,
	RemAgentProfileContactDetailsRequest,
	RemAgentProfileDetailsRequest,
	RemProfileFilterRequestModel,
	ScheduleTemplateLanguageListResponse,
	ScheduleTemplateLanguageRequest,
} from '../../models';
import {RemAgentProfileRequest} from '../../models/request/RemAgentProfileRequest';
import {LiveChatResponse} from '../../models/response/LiveChatResponse';
import {LivePersonResponse} from '../../models/response/LivePersonResponse';
import {RemContactDetailsResponse} from '../../models/response/RemAgentProfileContactDetailsResponse';
import {RemProfileByIdResponseModel} from '../../models/response/RemProfileByIdResponseModel';
import {GetRemProfileById, GetRemProfileByIdResult, UpSertRemProfile} from '../../services/RemProfileApi';
import {GetScheduleTemplateLanguageSettingListAsync, SendGetScheduleTemplateLanguageSettingList} from '../../services/RemSettingApi';
import useAllScheduleTemplateList from '../../shared/hooks/useAllScheduleTemplateList';
import useMessageTypeContactDetails from '../../shared/hooks/useMessageTypeContactDetails';
import useRemLookups from '../../shared/hooks/useRemLookups';
import ChannelDetails from './ChannelDetails';
import { HubConnection } from '@microsoft/signalr';
import { AxiosResponse } from 'axios';

const EditRemProfile: React.FC = () => {
	const history = useHistory();
	usePromptOnUnload(true, 'Changes you made may not be saved.');
	const {EDIT_REM_PROFILE, AgentDetails, ScheduleDetails, LIVEPERSON, LIVECHAT, SwalConfirmMessage, SwalFailedMessage, validateRemProfileName} =
		useRemProfileConstant();

	const {access, userId} = useSelector<RootState>(({auth}) => auth, shallowEqual) as IAuthState;
	const [contactDetailsList, setContactDetailsList] = useState<Array<RemContactDetailsResponse>>([]);
	const [rowData, setRowData] = useState<Array<any>>([]);
	const [channel, setChannel] = useState<LookupModel | null>();
	const [remProfileResponse, setRemProfileResponse] = useState<RemProfileByIdResponseModel>();
	const [origRemProfileResponse, setOrigRemProfileResponse] = useState<RemProfileByIdResponseModel>();

	// build contact details option list
	const [removedChannelId, setRemovedChannelId] = useState<any>();
	const messageTypeData = useMessageTypeContactDetails();
	const [contactDetailsDropdown, setContactDetailsDropdown] = useState<Array<LookupModel>>([]);
	const [initContactChannel, setInitContactChannel] = useState<Array<RemContactDetailsResponse>>([]);
	const {id}: {id: number} = useParams();
	const {successResponse, HubConnected} = useConstant();
	//	get users
	const remLookUps = useRemLookups();

	const [agentName, setAgentName] = useState<LookupModel | null>();
	const templateOptionDropdown = useAllScheduleTemplateList();
	const [selectedScheduleTemplate, setSelectedScheduleTemplate] = useState<LookupModel | null>();

	const [sortColumn, setSortColumn] = useState<string>('scheduleTemplateSettingId');
	const [sortOrder, setSortOrder] = useState<string>('ASC');

	const [livePerson, setLivePerson] = useState<Array<LivePersonResponse>>([]);
	const [liveChat, setLiveChat] = useState<Array<LiveChatResponse>>([]);
	const {PageEvent} = useRemProfileConstant();
	const [loading, setLoading] = useState(false);

	let userAccessId = userId === undefined ? '1' : userId.toString();
	const initialValues = {
		remProfileId: 0,
		remProfileName: '',
		agentId: 0,
		pseudoNamePP: '',
		scheduleTemplateSettingId: 0,
		onlineStatusId: 0,
		agentConfigStatusId: 0,
		createdBy: 0,
		createdDate: '',
		updatedBy: 0,
		updatedDate: '',
		contactDetailsId: 0,
		remAgentName: '',
		contactDetailsList: Array<RemAgentProfileContactDetailsRequest>(),
		liveChatDetailsList: Array<LiveChatRequest>(),
		livePersonDetailsList: Array<LivePersonRequest>(),
		remProfileList: Array<RemAgentProfileRequest>(),
	};

	const columnDefs = [
		{
			headerName: ScheduleDetails.HEADER_NO,
			valueGetter: 'node.rowIndex + 1'.toString(),
			width: 100,
		},
		{
			headerName: ScheduleDetails.HEADER_LANGUAGE,
			field: 'languageName',
			autoWidth: true,
		},
		{
			headerName: ScheduleDetails.HEADER_LOCAL_TRANS_VALUE,
			field: 'languageLocalTranslation',
			autoWidth: true,
		},
	];

	// events
	useEffect(() => {
		getRemProfileDetailsById();
	}, []);

	useEffect(() => {
		if (!remProfileResponse) {
			getRemProfileDetailsById();
		}
	}, [contactDetailsList]);

	useEffect(() => {
		// removing channel in contact details
		const newContactList = contactDetailsList.filter((contact) => {
			return contact.messageTypeId !== removedChannelId;
		});
		setContactDetailsList([]);
		setContactDetailsList(newContactList);

		//live person
		if (!newContactList.find((nc) => nc.contactDetailsName === LIVEPERSON)) {
			setLivePerson([]);
		}
		if (!newContactList.find((nc) => nc.contactDetailsName === LIVECHAT)) {
			setLiveChat([]);
		}

		//add back to dropdown
		const toAdd = messageTypeData.find((cdo) => {
			return parseInt(cdo.value) === removedChannelId;
		});

		const newOption = [...contactDetailsDropdown];
		if (toAdd !== undefined) {
			newOption.push(toAdd);
		}

		setContactDetailsDropdown(newOption);
	}, [removedChannelId]);

	useEffect(() => {
		if (remProfileResponse) {
			if (contactDetailsDropdown.length === 0 && messageTypeData.length !== 0) {
				listDownChannel();
			}
		}
	}, [messageTypeData, initContactChannel]);

	useEffect(() => {
		if (!loading && rowData.length === 0) {
			if (document.getElementById('mlab-grid-loading-overlay') as HTMLInputElement) {
				(document.getElementById('mlab-grid-loading-overlay') as HTMLInputElement).innerText = 'No Rows To Show';
			}
		} else if (document.getElementById('mlab-grid-loading-overlay') as HTMLInputElement) {
			(document.getElementById('mlab-grid-loading-overlay') as HTMLInputElement).innerText = 'Please wait while your items are loading';
		}
	}, [loading]);

	const listDownChannel = () => {
		// Clean channel dropdown list based from saved channels vs all channels
		if (initContactChannel.length > 0) {
			const filteredChannel = messageTypeData.filter((ad) => initContactChannel.every((fd) => fd.messageTypeId !== parseInt(ad.value)));
			setContactDetailsDropdown(filteredChannel);
		} else setContactDetailsDropdown(messageTypeData);
	};

	const handleChangeChannel = (data: LookupModel) => {
		if (data) {
			setChannel(data);
		}
	};

	const getRemProfileDetailsById = () => {
		setTimeout(() => {
			//FETCH TO API
			const messagingHub = hubConnection.createHubConnenction();
			messagingHub
				.start()
				.then(() => {
					// CHECKING STATE CONNECTION
					if (messagingHub.state === HubConnected) {
						const request: RemProfileFilterRequestModel = {
							remProfileID: id,
							userId: userAccessId.toString(),
							queueId: Guid.create().toString(),
						};

						GetRemProfileById(request)
							.then((response) => {
								// IF REQUEST IS SUCCESS THEN CONSUME CALLBACK API
								processGetRemProfileByIdRecieved(messagingHub,response,request);
							})
							.catch(() => {
								messagingHub.stop();
								swal('Failed', 'failed load', 'error');
							});
					}
				})
				.catch((err) => console.log('Error while starting connection: ' + err));
		}, 1000);
	};
	const processGetRemProfileByIdRecieved = (messagingHub: HubConnection,response:AxiosResponse<any>,request:RemProfileFilterRequestModel)=>{
		if (response.status === successResponse) {
			messagingHub.on(request.queueId.toString(), (message) => {
				GetRemProfileByIdResult(message.cacheId)
					.then((data) => {
						let responseData = data.data;
						setRemProfileResponse(responseData);
						setOrigRemProfileResponse(JSON.parse(JSON.stringify(responseData)));
						// map values - rem agent details
						formik.setFieldValue('remProfileId', id);
						formik.setFieldValue('remProfileName', responseData.remProfileDetails.remProfileName);
						setAgentName({
							label: responseData.remProfileDetails.agentName,
							value: responseData.remProfileDetails.agentId ? responseData.remProfileDetails.agentId?.toString() : '',
						});
						formik.setFieldValue('pseudoNamePP', responseData.remProfileDetails.pseudoNamePP);
						formik.setFieldValue('agentId', responseData.remProfileDetails.agentId);

						// map schdule details
						setSelectedScheduleTemplate({
							label: responseData.remProfileDetails.scheduleTemplateSettingName,
							value: responseData.remProfileDetails.scheduleTemplateSettingId
								? responseData.remProfileDetails.scheduleTemplateSettingId?.toString()
								: '',
						});
						formik.setFieldValue('scheduleTemplateSettingId', responseData.remProfileDetails.scheduleTemplateSettingId);

						setRowData(responseData.scheduleTemplateDetails);

						//map contact details
						setContactDetailsList(responseData.contactDetails);
						setLiveChat(responseData.liveChatDetails);
						setLivePerson(responseData.livePersonDetails);
						setInitContactChannel(responseData.contactDetails);

						formik.setFieldValue('onlineStatusId', responseData.remProfileDetails.onlineStatusId);
						formik.setFieldValue('agentConfigStatusId', responseData.remProfileDetails.agentConfigStatusId);
					})
					.catch(() => {
						messagingHub.off(request.queueId.toString());
						messagingHub.stop();
					});
			});

			setTimeout(() => {
				if (messagingHub.state === HubConnected) {
					messagingHub.stop();
				}
			}, 30000);
		} else {
			messagingHub.stop();
			swal('Failed', response.data.message, 'error');
		}
	}
	const handleChangeAgent = (data: LookupModel) => {
		if (data) {
			setAgentName(data);
			formik.setFieldValue('agentId', data.value);
		}
	};

	const handleAddChannel = (contactTypeId: any, contactTypeName: any) => {
		if (contactTypeId) {
			setContactDetailsList((contactDetails) => [
				...contactDetailsList,
				{
					remContactDetailsId: 0,
					remProfileId: id,
					messageTypeId: parseInt(contactTypeId),
					contactDetailsName: contactTypeName,
					contactDetailValue: undefined,
					livePersonId: 0,
					liveChatId: 0,
				},
			]);
			const newOptionList: Array<OptionListModel> = contactDetailsDropdown.filter((dd) => {
				return dd.value !== contactTypeId;
			});

			setContactDetailsDropdown(newOptionList);

			//Live Person
			if (contactTypeName === LIVEPERSON) {
				setLivePerson(() => [
					{
						livePersonId: 0,
						remProfileId: id,
						engagementID: undefined,
						agentID: undefined,
						skillID: undefined,
						skillName: undefined,
						section: undefined,
					},
				]);
			}

			if (contactTypeName === LIVECHAT) {
				setLiveChat(() => [
					{
						liveChatId: 0,
						remProfileId: id,
						agentID: undefined,
						groupID: undefined,
						groupName: undefined,
					},
				]);
			}
			setChannel(null);
		}
	};

	const redirection = (id: any) => {
		history.push('/relationship-management/view-rem-profile/detail/' + id);
	};

	const redirectToSchedulePage = (templateId: any) => {
		const win: any = window.open(`/relationship-management/rem-view-schedule-template/view/${templateId}`, '_blank');
		win.focus();
	};

	const outsideEditRedirectPage = (promptNamePath: any) => {
		swal({
			title: SwalConfirmMessage.title,
			text: SwalConfirmMessage.textDiscard,
			icon: SwalConfirmMessage.icon,
			buttons: [SwalConfirmMessage.btnNo, SwalConfirmMessage.btnYes],
			dangerMode: true,
		}).then((willSave) => {
			if (willSave) {
				history.block(() => {});
				history.push(promptNamePath);
				const bc = new BroadcastChannel('MLAB_RemProfile');
				bc.postMessage({event: PageEvent.SEARCH, data: {sortColumn: 'a.UpdatedDate', sortOrder: 'DESC'}});
				bc.close();
			}
		});
	};

	const handleChangeTemplateName = (data: LookupModel) => {
		if (data) {
			const templateId = parseInt(data.value);
			setSelectedScheduleTemplate(data);
			formik.setFieldValue('scheduleTemplateSettingId', templateId);
			getTemplateLanguageDetails(parseInt(data.value));
		}
	};

	const getTemplateLanguageDetails = (templateId: any) => {
		setLoading(true);
		setRowData([]);
		setTimeout(() => {
			const getTemplateMessagingHub = hubConnection.createHubConnenction();

			getTemplateMessagingHub
				.start()
				.then(() => {
					if (getTemplateMessagingHub.state === HubConnected) {
						const request: ScheduleTemplateLanguageRequest = {
							scheduleTemplateSettingId: templateId,
							userId: userAccessId.toString(),
							queueId: Guid.create().toString(),
							pageSize: 10,
							offsetValue: 0,
							sortColumn: 'scheduleTemplateLanguageSettingId',
							sortOrder: 'ASC',
						};
						SendGetScheduleTemplateLanguageSettingList(request)
							.then((response) => {
								// IF REQUEST IS SUCCESS THEN CONSUME CALLBACK API
								processSendGetScheduleTemplateLanguageSettingListRecieved(getTemplateMessagingHub,response,request);
							})
							.catch(() => {
								getTemplateMessagingHub.stop();
								console.log('Problem in language template details');
								setLoading(false);
							});
					}
				})
				.catch((err) => {
					setLoading(false);
					console.log('Error while starting connection: ' + err);
				});
		}, 1000);
	};
	const processSendGetScheduleTemplateLanguageSettingListRecieved = (messagingHub: HubConnection,response:AxiosResponse<any>,request:ScheduleTemplateLanguageRequest)=>{
		if (response.status === successResponse) {
			messagingHub.on(request.queueId.toString(), (message) => {
				GetScheduleTemplateLanguageSettingListAsync(message.cacheId)
					.then((data) => {
						let resultData = Object.assign(new Array<ScheduleTemplateLanguageListResponse>(), data.data.scheduleTemplateLanguagesList);
						setRowData(resultData);
						setLoading(false);
						messagingHub.off(request.queueId.toString());
						messagingHub.stop();
					})
					.catch(() => {
						console.log('Problem in language template details');
						setLoading(false);
					});
				setLoading(false);
			});

			setTimeout(() => {
				if (messagingHub.state === HubConnected) {
					messagingHub.stop();
					setLoading(false);
				}
			}, 30000);
		} else {
			messagingHub.stop();
			console.log('Problem in language template details');
			setLoading(false);
		}
	}
	const onSort = (e: any) => {
		if (rowData != undefined && rowData.length > 0) {
			const sortDetail = e.api.getSortModel();
			if (sortDetail[0] != undefined) {
				setSortColumn(sortDetail[0]?.colId);
				setSortOrder(sortDetail[0]?.sort);
			} else {
				setSortColumn('');
				setSortOrder('');
			}
		}
	};

	const IsDirty = (oldValue?: RemProfileByIdResponseModel, newValue?: RemAgentProfileDetailsRequest) => {
		let _isDirty = false;
		
		IsDirtyRemProfile();
		IsDirtyLiveChat();
		IsDirtyLivePerson();
		
		oldValue?.contactDetails?.forEach((item) => {
			let messageType = newValue?.remContactDetailsList?.find((i) => i.messageTypeId == item.messageTypeId);
			
			if (messageType) {
				if (messageType.contactDetailValue !== item.contactDetailValue) {
					_isDirty = true;
					return;
				}
			}
		});

		return _isDirty;
	};
	const IsDirtyRemProfile =(oldValue?: RemProfileByIdResponseModel, newValue?: RemAgentProfileDetailsRequest)=>{
		if (oldValue?.remProfileDetails.remProfileName !== newValue?.remProfileName) return true;
		if (oldValue?.remProfileDetails.pseudoNamePP !== newValue?.pseudoNamePP) return true;
		if (oldValue?.remProfileDetails.agentId !== newValue?.agentId) return true;
		if (oldValue?.remProfileDetails.scheduleTemplateSettingId !== newValue?.scheduleTemplateSettingId) return true;
		if (oldValue?.contactDetails?.length != newValue?.remContactDetailsList?.length) return true;
		if (oldValue?.liveChatDetails?.length != newValue?.remLiveChatList?.length) return true;
		if (oldValue?.livePersonDetails?.length != newValue?.remLivePersonList?.length) return true;
	}
	const IsDirtyLiveChat =(oldValue?: RemProfileByIdResponseModel, newValue?: RemAgentProfileDetailsRequest)=>{
		//live chat
		if (oldValue?.liveChatDetails && oldValue?.liveChatDetails?.length > 0 && newValue?.remLiveChatList && newValue?.remLiveChatList?.length > 0) {
			if (oldValue?.liveChatDetails[0].agentID !== newValue?.remLiveChatList[0].agentID) return true;
			if (oldValue?.liveChatDetails[0].groupID !== newValue?.remLiveChatList[0].groupID) return true;
			if (oldValue?.liveChatDetails[0].groupName !== newValue?.remLiveChatList[0].groupName) return true;
		}
		
	}
	const IsDirtyLivePerson =(oldValue?: RemProfileByIdResponseModel, newValue?: RemAgentProfileDetailsRequest)=>{
		//live person
		if (
			oldValue?.livePersonDetails &&
			oldValue?.livePersonDetails?.length > 0 &&
			newValue?.remLivePersonList &&
			newValue?.remLivePersonList?.length > 0
		) {
			if (oldValue?.livePersonDetails[0].engagementID !== newValue?.remLivePersonList[0].engagementID) return true;
			if (oldValue?.livePersonDetails[0].agentID !== newValue?.remLivePersonList[0].agentID) return true;
			if (oldValue?.livePersonDetails[0].skillID !== newValue?.remLivePersonList[0].skillID) return true;
			if (oldValue?.livePersonDetails[0].skillName !== newValue?.remLivePersonList[0].skillName) return true;
			if (oldValue?.livePersonDetails[0].section !== newValue?.remLivePersonList[0].section) return true;
		}
	}
	const saveUpdatedRemProfileDetails = (values: any) => {
		contactDetailsList.filter((item) => {
			const channelContacts: RemAgentProfileContactDetailsRequest = {
				remContactDetailsId: 0,
				remProfileId: id,
				messageTypeId: item.messageTypeId?.toString(),
				contactDetailValue: item.contactDetailValue,
				createdBy: parseInt(userAccessId),
				updatedBy: parseInt(userAccessId),
			};
			values.contactDetailsList.push(channelContacts);
		});

		liveChat.filter((item) => {
			const lc: LiveChatRequest = {
				liveChatId: item.liveChatId,
				remProfileId: id,
				agentID: item.agentID,
				groupID: item.groupID,
				groupName: item.groupName,
				createdBy: parseInt(userAccessId),
				updatedBy: parseInt(userAccessId),
			};
			values.liveChatDetailsList.push(lc);
		});

		livePerson.filter((item) => {
			const lp: LivePersonRequest = {
				livePersonId: item.livePersonId,
				remProfileId: id,
				engagementID: item.engagementID,
				agentID: item.agentID,
				skillID: item.skillID,
				skillName: item.skillName,
				section: item.section,
				createdBy: parseInt(userAccessId),
				updatedBy: parseInt(userAccessId),
			};
			values.livePersonDetailsList.push(lp);
		});

		liveChat.map((obj) => ({...obj, createdBy: 2, updatedBy: 2}));

		livePerson.map((obj) => ({...obj, createdBy: 2, updatedBy: 2}));

		setTimeout(() => {
			//FETCH TO API
			const saveUpdatemessagingHub = hubConnection.createHubConnenction();
			saveUpdatemessagingHub
				.start()
				.then(() => {
					// CHECKING STATE CONNECTION
					if (saveUpdatemessagingHub.state === HubConnected) {
						const request: RemAgentProfileDetailsRequest = {
							queueId: Guid.create().toString(),
							userId: userAccessId.toString(),
							remProfileId: id,
							remProfileName: values.remProfileName,
							agentId: values.agentId,
							pseudoNamePP: values.pseudoNamePP,
							scheduleTemplateSettingId: values.scheduleTemplateSettingId,
							onlineStatusId: values.onlineStatusId,
							agentConfigStatusId: values.agentConfigStatusId,
							createdBy: parseInt(userAccessId),
							updatedBy: parseInt(userAccessId),
							remContactDetailsList: values.contactDetailsList,
							remLiveChatList: values.contactDetailsList.length > 0 ? values.liveChatDetailsList : [],
							remLivePersonList: values.contactDetailsList.length > 0 ? values.livePersonDetailsList : [],
							createdDate: new Date().toISOString().slice(0, 10).toString(),
							updatedDate: new Date().toISOString().slice(0, 10).toString(),
							isDirty: false,
						};
						request.isDirty = IsDirty(origRemProfileResponse, request);
						UpSertRemProfile(request)
							.then((response) => {
								//IF REQUEST IS SUCCESS THEN CONSUME CALLBACK API
								processEditUpSertRemProfileRecieved(saveUpdatemessagingHub,response,request);
							})
							.catch(() => {
								saveUpdatemessagingHub.stop();
								swal('Failed', 'Problem in adding rem profile details', 'error');
								formik.isSubmitting = false;
							});
					}
				})
				.catch((err) => console.log('Error while starting connection: ' + err));
		}, 1000);
	};
	const processEditUpSertRemProfileRecieved = (messagingHub: HubConnection,response: AxiosResponse<any>,request: RemAgentProfileDetailsRequest)=>{
		if (response.status === successResponse) {
			messagingHub.on(request.queueId.toString(), (message) => {
				let resultData = JSON.parse(message.remarks);

				if (resultData.Status === successResponse) {
					swal('Success', 'Transaction successfully submitted', 'success');

					let remProfileId = resultData.Data;
					redirection(remProfileId);
				} else {
					swal('Failed', 'Problem connecting to the server, Please refresh', 'error');
				}

				messagingHub.off(request.queueId.toString());
				messagingHub.stop();
			});

			setTimeout(() => {
				if (messagingHub.state === HubConnected) {
					messagingHub.stop();
					formik.isSubmitting = false;
					swal('Failed', 'Problem connecting to the server, Please refresh', 'error');
				}
			}, 30000);
		} else {
			messagingHub.stop();
			swal('Failed', response.data.message, 'error');
			formik.isSubmitting = false;
		}
	}
	const formik = useFormik({
		initialValues,
		onSubmit: async (values, {setStatus, setSubmitting, resetForm}) => {
			formik.setSubmitting(false);
			const liveChatValidation = liveChat?.filter((lv) => {
				return !lv.agentID && !lv.groupID && !lv.groupName;
			});

			const livePersonValidation = livePerson?.filter((lp) => {
				return !lp.engagementID && !lp.agentID && !lp.skillID && !lp.skillName && !lp.section;
			});

			const normalChannel = contactDetailsList.filter((cd) => {
				return !cd.contactDetailValue && cd.contactDetailsName !== LIVEPERSON && cd.contactDetailsName !== LIVECHAT;
			});

			if (
				!formik.values.remProfileName ||
				!formik.values.agentId ||
				!formik.values.pseudoNamePP ||
				!formik.values.scheduleTemplateSettingId ||
				liveChatValidation.length > 0 ||
				livePersonValidation.length > 0 ||
				normalChannel.length > 0
			) {
				swal(SwalFailedMessage.title, SwalFailedMessage.textMandatory, SwalFailedMessage.icon);
			} else {
				// Validation for Rem Profile Name
				const isExisting = await validateRemProfileName(values.remProfileName, id);
				if (isExisting) {
					swal(SwalFailedMessage.title, SwalFailedMessage.textExists, SwalFailedMessage.icon);
				} else {
					swal({
						title: SwalConfirmMessage.title,
						text: SwalConfirmMessage.textSaveChannel,
						icon: SwalConfirmMessage.icon,
						buttons: [SwalConfirmMessage.btnNo, SwalConfirmMessage.btnYes],
						dangerMode: true,
					}).then((onConfirm) => {
						if (onConfirm) {
							setSubmitting(true);
							saveUpdatedRemProfileDetails(values);
						}
					});
				}
			}
		},
	});

	return (
		<>
			<FormContainer onSubmit={formik.handleSubmit}>
				<MainContainer>
					<FormHeader headerLabel={EDIT_REM_PROFILE} />
					<ContentContainer>
						<FormGroupContainer>
							<div className='col-12'>
								<p className='form-control-plaintext fw-bolder'>ReM Agent Details</p>
							</div>
						</FormGroupContainer>
						<FormGroupContainer>
							<div className='col-lg-3'>
								<label className='col-form-label col-sm required'>{AgentDetails.REM_PROFILE_ID}</label>
								<input
									type='text'
									autoComplete='off'
									className='form-control form-control-sm'
									disabled={true}
									{...formik.getFieldProps('remProfileId')}
								/>
							</div>
							<div className='col-lg-3'>
								<label className='col-form-label col-sm required'>{AgentDetails.REM_PROFILE_NAME}</label>
								<input
									type='text'
									autoComplete='off'
									className='form-control form-control-sm'
									disabled={false}
									{...formik.getFieldProps('remProfileName')}
								/>
							</div>

							<div className='col-lg-3'>
								<label className='col-form-label col-sm required'>{AgentDetails.AGENT_NAME}</label>
								<Select
									size='small'
									autoComplete='off'
									style={{width: '100%'}}
									options={remLookUps?.users}
									onChange={handleChangeAgent}
									value={agentName}
									disabled={false}
								/>
							</div>
							<div className='col-lg-3'>
								<label className='col-form-label col-sm required'>{AgentDetails.PSEUDO_NAME}</label>
								<input
									type='text'
									autoComplete='off'
									className='form-control form-control-sm'
									disabled={false}
									{...formik.getFieldProps('pseudoNamePP')}
								/>
							</div>
						</FormGroupContainer>

						<div className='separator border-4 my-10' />

						<FormGroupContainer>
							<div className='col-12'>
								<p className='form-control-plaintext fw-bolder'>Schedule Details</p>
							</div>
						</FormGroupContainer>
						<FormGroupContainer>
							<div className='col-lg-2'>
								<label className='col-form-label required'>{ScheduleDetails.TEMPLATE_NAME}</label>
							</div>

							<div className='col-lg-4'>
								<Select
									autoComplete='off'
									size='small'
									style={{width: '100%'}}
									className='right'
									options={templateOptionDropdown}
									onChange={handleChangeTemplateName}
									value={selectedScheduleTemplate}
								/>
							</div>
							<div className='col-form-label col-2'>
								<ButtonGroup aria-label='Basic example'>
									<div className='d-flex justify-content-center flex-shrink-0 shadow-none'>
										<label className='btn-link cursor-pointer editRemProfileBtn' onClick={() => (selectedScheduleTemplate?.value ? redirectToSchedulePage(selectedScheduleTemplate?.value) : '')} onKeyDown={() => (selectedScheduleTemplate?.value ? redirectToSchedulePage(selectedScheduleTemplate?.value) : '')}>
											View
										</label>
									</div>
								</ButtonGroup>
							</div>
						</FormGroupContainer>

						<FormGroupContainer>
							<GridWithLoader
								rowData={rowData}
								columnDefs={columnDefs}
								sortColumn={sortColumn}
								sortOrder={sortOrder}
								isLoading={loading}
								setLoading={setLoading}
								height={350}
								onSortChanged={(e: any) => onSort(e)}
							></GridWithLoader>
						</FormGroupContainer>
						<div className='separator border-4 my-10' />

						<FormGroupContainer>
							<div className='col-lg-3'>
								<p className='form-control-plaintext fw-bolder'>Contact Details</p>
							</div>
						</FormGroupContainer>
						<FormGroupContainer>
							{/* <div className='col-sm-1 col-form-label text-end'></div> */}
							<label className='col-form-label col-lg-2'>{AgentDetails.CHANNELS}</label>
							<div className='col-lg-3'>
								<Select
									autoComplete='off'
									size='small'
									style={{width: '100%'}}
									className='right'
									options={contactDetailsDropdown.sort((a: any, b: any) => (a.label > b.label ? 1 : -1))}
									onChange={handleChangeChannel}
									value={channel}
								/>
							</div>
							<div className='col-form-button col-md-3 mb-10'>
								<MlabButton
									type={'button'}
									label={'Add'}
									access={access?.includes(USER_CLAIMS.RemProfileRead) && access?.includes(USER_CLAIMS.RemProfileWrite)}
									style={ElementStyle.primary}
									weight={'solid'}
									onClick={() => {
										handleAddChannel(channel?.value, channel?.label);
									}}
								/>
							</div>
						</FormGroupContainer>

						{contactDetailsList.map(
							(cd, index) =>
								cd.contactDetailsName !== LIVECHAT &&
								cd.contactDetailsName !== LIVEPERSON && (
									<ChannelDetails
										key={index}
										selectedTypeId={contactDetailsList[index].messageTypeId}
										idx={index}
										selectedTypeName={contactDetailsList[index].contactDetailsName}
										data={contactDetailsList}
										liveChat={liveChat.length == 0 ? remProfileResponse?.liveChatDetails : liveChat}
										livePerson={livePerson.length == 0 ? remProfileResponse?.livePersonDetails : livePerson}
										setRemovedChannelId={setRemovedChannelId}
										remProfileId={id}
									></ChannelDetails>
								)
						)}
						{/* For Live Chat and Live Person edit details */}
						{contactDetailsList.map(
							(cd, index) =>
								(cd.contactDetailsName === LIVECHAT || cd.contactDetailsName === LIVEPERSON) && (
									<ChannelDetails
										key={index}
										selectedTypeId={contactDetailsList[index].messageTypeId}
										idx={index}
										selectedTypeName={contactDetailsList[index].contactDetailsName}
										data={contactDetailsList}
										liveChat={liveChat.length == 0 ? remProfileResponse?.liveChatDetails : liveChat}
										livePerson={livePerson.length == 0 ? remProfileResponse?.livePersonDetails : livePerson}
										setRemovedChannelId={setRemovedChannelId}
										remProfileId={id}
									></ChannelDetails>
								)
						)}
					</ContentContainer>
					<FooterContainer>
						<PaddedContainer>
							<LoaderButton
								title={'Submit'}
								access={access?.includes(USER_CLAIMS.RemProfileRead) && access?.includes(USER_CLAIMS.RemProfileWrite)}
								loading={formik.isSubmitting}
								loadingTitle={' Please wait... '}
								disabled={formik.isSubmitting}
							/>
							<DefaultSecondaryButton
								access={true}
								title={'Back'}
								onClick={() => {
									outsideEditRedirectPage('/relationship-management/rem-profile/');
								}}
							/>
						</PaddedContainer>
					</FooterContainer>
				</MainContainer>
			</FormContainer>
		</>
	);
};

export default EditRemProfile;
