import {useFormik} from 'formik';
import {Guid} from 'guid-typescript';
import React, {useEffect, useState} from 'react';
import {ButtonGroup} from 'react-bootstrap-v5';
import {shallowEqual, useSelector} from 'react-redux';
import {useHistory} from 'react-router-dom';
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
import {RemAgentProfileDetailsRequest, ScheduleTemplateLanguageListResponse, ScheduleTemplateLanguageRequest} from '../../models';
import {LiveChatRequest} from '../../models/request/LiveChatRequest';
import {LivePersonRequest} from '../../models/request/LivePersonRequest';
import {RemAgentProfileContactDetailsRequest} from '../../models/request/RemAgentProfileContactDetailsRequest';
import {RemAgentProfileRequest} from '../../models/request/RemAgentProfileRequest';
import {RemContactDetailsResponse} from '../../models/response/RemAgentProfileContactDetailsResponse';
import {UpSertRemProfile} from '../../services/RemProfileApi';
import {GetScheduleTemplateLanguageSettingListAsync, SendGetScheduleTemplateLanguageSettingList} from '../../services/RemSettingApi';
import useAllScheduleTemplateList from '../../shared/hooks/useAllScheduleTemplateList';
import useMessageTypeContactDetails from '../../shared/hooks/useMessageTypeContactDetails';
import useRemLookups from '../../shared/hooks/useRemLookups';
import ChannelDetails from './ChannelDetails';
import { HubConnection } from '@microsoft/signalr';
import { AxiosResponse } from 'axios';

const AddRemProfile: React.FC = () => {
	const history = useHistory();
	usePromptOnUnload(true, 'Changes you made may not be saved.');
	const {access, userId} = useSelector<RootState>(({auth}) => auth, shallowEqual) as IAuthState;
	const [contactDetailsList, setContactDetailsList] = useState<Array<RemContactDetailsResponse>>([]);
	const [rowData, setRowData] = useState<Array<any>>([]);
	const {
		ADD_REM_PROFILE,
		AgentDetails,
		ScheduleDetails,
		OnlineStatus,
		AgentConfigStatus,
		LIVEPERSON,
		LIVECHAT,
		SwalConfirmMessage,
		SwalFailedMessage,
		validateRemProfileName,
	} = useRemProfileConstant();
	const [channel, setChannel] = useState<LookupModel | null>();
	const [agentName, setAgentName] = useState<LookupModel | null>();
	const [selectedScheduleTemplate, setSelectedScheduleTemplate] = useState<LookupModel | null>();
	const {successResponse, HubConnected} = useConstant();
	const [loading, setLoading] = useState(false);
	// build contact details option list
	const messageTypeData = useMessageTypeContactDetails();
	const [removedChannelId, setRemovedChannelId] = useState<any>();
	const [contactDetailsDropdown, setContactDetailsDropdown] = useState(messageTypeData);
	const [sortColumn, setSortColumn] = useState<string>('scheduleTemplateSettingId');
	const [sortOrder, setSortOrder] = useState<string>('ASC');
	const [livePerson, setLivePerson] = useState<Array<LivePersonRequest>>([]);
	const [liveChat, setLiveChat] = useState<Array<LiveChatRequest>>([]);

	//	get list of agents
	const remLookUps = useRemLookups();
	//	get schedule template list
	const templateOptionDropdown = useAllScheduleTemplateList();
	let userAccessId = userId === undefined ? '1' : userId.toString();

	const initialValues = {
		remProfileId: 0,
		remProfileName: '',
		agentId: 0,
		pseudoNamePP: '',
		scheduleTemplateSettingId: 0,
		onlineStatusId: 181,
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

	// events
	useEffect(() => {
		if (contactDetailsDropdown.length === 0) {
			setContactDetailsDropdown(messageTypeData);
		}
	}, []);

	useEffect(() => {
		if (!loading && rowData.length === 0) {
			if (document.getElementById('mlab-grid-loading-overlay') as HTMLInputElement) {
				(document.getElementById('mlab-grid-loading-overlay') as HTMLInputElement).innerText = 'No Rows To Show';
			}
		} else if (document.getElementById('mlab-grid-loading-overlay') as HTMLInputElement) {
			(document.getElementById('mlab-grid-loading-overlay') as HTMLInputElement).innerText = 'Please wait while your items are loading';
		}
	}, [loading]);

	useEffect(() => {
		const newContactListAdd = contactDetailsList.filter((contact) => {
			return contact.messageTypeId !== removedChannelId;
		});

		setContactDetailsList([]);
		setContactDetailsList(newContactListAdd);

		if (!newContactListAdd.find((nc) => nc.contactDetailsName === LIVEPERSON)) {
			setLivePerson([]);
		}

		if (!newContactListAdd.find((nc) => nc.contactDetailsName === LIVECHAT)) {
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
		if (contactDetailsDropdown.length === 0 && messageTypeData.length !== 0) {
			setContactDetailsDropdown(messageTypeData);
		}
	}, [messageTypeData]);

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

	//	Methods
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

	const handleChangeChannel = (data: LookupModel) => {
		if (data) {
			setChannel(data);
		}
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
		setTimeout(() => {
			const messagingHubAddRemProfile = hubConnection.createHubConnenction();
			setLoading(true);
			setRowData([]);
			messagingHubAddRemProfile
				.start()
				.then(() => {
					if (messagingHubAddRemProfile.state === HubConnected) {
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
								processSendGetScheduleTemplateLanguageSettingListRecievedAddRemProfile(messagingHubAddRemProfile,response,request);
							})
							.catch(() => {
								messagingHubAddRemProfile.stop();
								console.log('Problem in language template details');
							});
					}
				})
				.catch((err) => console.log('Error while starting connection: ' + err));
		}, 1000);
	};
	const processSendGetScheduleTemplateLanguageSettingListRecievedAddRemProfile = (messagingHub: HubConnection,response:AxiosResponse<any>,request:ScheduleTemplateLanguageRequest)=>{
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
				}
			}, 30000);
		} else {
			messagingHub.stop();
			console.log('Problem in language template details');
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
			if (contactTypeName === LIVEPERSON) {
				setLivePerson((liveperson) => [
					{
						livePersonId: 0,
						remProfileId: 0,
						engagementId: undefined,
						agentID: undefined,
						skillID: undefined,
						skillName: undefined,
						section: undefined,
					},
				]);
			}

			if (contactTypeName === LIVECHAT) {
				setLiveChat((livechat) => [
					{
						liveChatId: 0,
						remProfileId: 0,
						agentID: undefined,
						groupID: undefined,
						groupName: undefined,
						createdBy: parseInt(userAccessId),
						updatedBy: parseInt(userAccessId),
					},
				]);
			}

			setContactDetailsList((contactDetails) => [
				...contactDetailsList,
				{
					remContactDetailsId: 0,
					remProfileId: 0,
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
			setChannel(null);
		}
	};

	const outsideRedirectionPage = (promptNamePath: any) => {
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
			}
		});
	};

	const redirection = (id: any) => {
		history.push('/relationship-management/view-rem-profile/detail/' + id);
	};

	const redirectToSchedulePage = (templateId: any) => {
		const win: any = window.open(`/relationship-management/rem-view-schedule-template/view/${templateId}`, '_blank');
		win.focus();
	};

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
				setSubmitting(false);
			} else {
				// Validation for Rem Profile Name
				const isExisting = await validateRemProfileName(values.remProfileName, 0);
				if (isExisting) {
					swal(SwalFailedMessage.title, SwalFailedMessage.textExists, SwalFailedMessage.icon);
					setSubmitting(false);
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
							saveRemProfileDetails(values);
						}
					});
				}
			}
		},
	});

	const saveRemProfileDetails = (values: any) => {
		//build data model request
		//contact details | non live chat and live person
		contactDetailsList.filter((item) => {
			const channelContacts: RemAgentProfileContactDetailsRequest = {
				remContactDetailsId: 0,
				remProfileId: 0,
				messageTypeId: item.messageTypeId ? item.messageTypeId?.toString() : '',
				contactDetailValue: item.contactDetailValue,
				createdBy: parseInt(userAccessId),
				updatedBy: parseInt(userAccessId),
			};
			values.contactDetailsList.push(channelContacts);
		});

		setTimeout(() => {
			//FETCH TO API
			const messagingHub = hubConnection.createHubConnenction();
			messagingHub
				.start()
				.then(() => {
					// CHECKING STATE CONNECTION
					if (messagingHub.state === HubConnected) {
						const request: RemAgentProfileDetailsRequest = {
							queueId: Guid.create().toString(),
							userId: userAccessId.toString(),
							remProfileId: 0,
							remProfileName: values.remProfileName,
							agentId: values.agentId,
							pseudoNamePP: values.pseudoNamePP,
							scheduleTemplateSettingId: values.scheduleTemplateSettingId,
							onlineStatusId: parseInt(OnlineStatus.offline),
							agentConfigStatusId: parseInt(AgentConfigStatus.inActive),
							createdBy: parseInt(userAccessId),
							updatedBy: parseInt(userAccessId),
							remContactDetailsList: values.contactDetailsList,
							remLiveChatList: liveChat,
							remLivePersonList: livePerson,
							createdDate: new Date().toISOString().slice(0, 10).toString(),
							updatedDate: new Date().toISOString().slice(0, 10).toString(),
							isDirty: true,
						};
						UpSertRemProfile(request)
							.then((response) => {
								//IF REQUEST IS SUCCESS THEN CONSUME CALLBACK API
								processUpSertRemProfileRecieved(messagingHub,response,request);
								
							})
							.catch(() => {
								messagingHub.stop();
								swal('Failed', 'Problem in adding rem profile details', 'error');
							});
					}
				})
				.catch((err) => console.log('Error while starting connection: ' + err));
		}, 1000);
	};
	const processUpSertRemProfileRecieved = (messagingHub: HubConnection,response:AxiosResponse<any>,request:RemAgentProfileDetailsRequest)=>{
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
				}
			}, 30000);
		} else {
			messagingHub.stop();
			swal('Failed', response.data.message, 'error');
		}
	}
	return (
		<FormContainer onSubmit={formik.handleSubmit}>
			<MainContainer>
				<FormHeader headerLabel={ADD_REM_PROFILE} />
				<ContentContainer>
					<FormGroupContainer>
						<div className='col-12'>
							<p className='form-control-plaintext fw-bolder'>ReM Agent Details</p>
						</div>
					</FormGroupContainer>
					<FormGroupContainer>
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
						<div className='col-lg-2 '>
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
									<label className='btn-link cursor-pointer addRemProfileBtn' onClick={() => (selectedScheduleTemplate?.value ? redirectToSchedulePage(selectedScheduleTemplate?.value) : '')} onKeyDown={() => (selectedScheduleTemplate?.value ? redirectToSchedulePage(selectedScheduleTemplate?.value) : '')}>
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
							height={350}
							onSortChanged={(e: any) => onSort(e)}
						></GridWithLoader>
					</FormGroupContainer>
					<div className='separator border-4 my-10' />

					<FormGroupContainer>
						<div className='col-12'>
							<p className='form-control-plaintext fw-bolder'>Contact Details</p>
						</div>
					</FormGroupContainer>
					<FormGroupContainer>
						<label className='col-form-label col-lg-2 '>{AgentDetails.CHANNELS}</label>
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
								access={true}
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
									setRemovedChannelId={setRemovedChannelId}
									remProfileId={0}
									liveChat={liveChat}
									livePerson={livePerson}
								></ChannelDetails>
							)
					)}
					{/* For Live Chat and Live Person area */}
					{contactDetailsList.map(
						(cd, index) =>
							(cd.contactDetailsName === LIVECHAT || cd.contactDetailsName === LIVEPERSON) && (
								<ChannelDetails
									key={index}
									selectedTypeId={contactDetailsList[index].messageTypeId}
									idx={index}
									selectedTypeName={contactDetailsList[index].contactDetailsName}
									data={contactDetailsList}
									setRemovedChannelId={setRemovedChannelId}
									remProfileId={0}
									liveChat={liveChat}
									livePerson={livePerson}
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
								outsideRedirectionPage('/relationship-management/rem-profile');
							}}
						/>
					</PaddedContainer>
				</FooterContainer>
			</MainContainer>
		</FormContainer>
	);
};

export default AddRemProfile;
