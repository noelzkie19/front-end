import {Guid} from 'guid-typescript';
import React, {useEffect, useState} from 'react';
import {ButtonGroup} from 'react-bootstrap-v5';
import {shallowEqual, useSelector} from 'react-redux';
import {useHistory, useParams} from 'react-router-dom';
import Select from 'react-select';
import swal from 'sweetalert';
import * as hubConnection from '../../../../../setup/hub/MessagingHub';
import {RootState} from '../../../../../setup/redux/RootReducer';
import {ElementStyle} from '../../../../constants/Constants';
import useConstant from '../../../../constants/useConstant';
import {
	ContentContainer,
	DefaultPrimaryButton,
	DefaultSecondaryButton,
	FooterContainer,
	FormGroupContainer,
	FormHeader,
	GridWithLoader,
	MainContainer,
	MlabButton,
} from '../../../../custom-components';
import {LookupModel} from '../../../../shared-models/LookupModel';
import {USER_CLAIMS} from '../../../user-management/components/constants/UserClaims';
import useRemProfileConstant from '../../constants/useRemProfileConstant';
import {RemProfileFilterRequestModel} from '../../models';
import {RemContactDetailsResponse} from '../../models/response/RemAgentProfileContactDetailsResponse';
import {RemProfileByIdResponseModel} from '../../models/response/RemProfileByIdResponseModel';
import {GetRemProfileById, GetRemProfileByIdResult} from '../../services/RemProfileApi';
import ChannelDetails from './ChannelDetails';
import { HubConnection } from '@microsoft/signalr';
import { AxiosResponse } from 'axios';

const ViewRemProfile: React.FC = () => {
	const history = useHistory();
	const {VIEW_REM_PROFILE, AgentDetails, ScheduleDetails, PageEvent, VIEW, LIVECHAT, LIVEPERSON} = useRemProfileConstant();

	const userAccessId = useSelector<RootState>(({auth}) => auth.userId, shallowEqual) as number;
	const userAccess = useSelector<RootState>(({auth}) => auth.access, shallowEqual) as string;
	const [contactDetailsList, setContactDetailsList] = useState<Array<RemContactDetailsResponse>>([]);
	const [rowData, setRowData] = useState<Array<any>>([]);
	const [remProfileResponse, setRemProfileResponse] = useState<RemProfileByIdResponseModel>();

	// build contact details option list
	const [removedChannelId, setRemovedChannelId] = useState<any>();
	const {id}: {id: number} = useParams();
	const {page}: {page: string} = useParams();
	const {successResponse, HubConnected} = useConstant();

	const [agentName, setAgentName] = useState<LookupModel | null>();
	const [selectedScheduleTemplate, setSelectedScheduleTemplate] = useState<LookupModel | null>();

	const [sortColumn, setSortColumn] = useState<string>('scheduleTemplateSettingId');
	const [sortOrder, setSortOrder] = useState<string>('ASC');

	const [loading, setLoading] = useState(true);

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
		if (!loading && rowData.length === 0) {
			if (document.getElementById('mlab-grid-loading-overlay') as HTMLInputElement) {
				(document.getElementById('mlab-grid-loading-overlay') as HTMLInputElement).innerText = 'No Rows To Show';
			}
		} else if (document.getElementById('mlab-grid-loading-overlay') as HTMLInputElement) {
			(document.getElementById('mlab-grid-loading-overlay') as HTMLInputElement).innerText = 'Please wait while your items are loading';
		}
	}, [loading]);

	const redirectToSchedulePage = (templateId: any) => {
		const win: any = window.open(`/relationship-management/rem-view-schedule-template/view/${templateId}`, '_blank');
		win.focus();
	};

	const redirectToEditPage = (remProfileId: any) => {
		history.push('/relationship-management/edit-rem-profile/' + remProfileId);
	};

	const redirectToSearchPage = (promptNamePath: any) => {
		history.block(() => {});
		history.push(promptNamePath);
		setTimeout(() => {
			const bc = new BroadcastChannel('MLAB_RemProfile');
			bc.postMessage({event: PageEvent.SEARCH, data: {sortColumn: 'ISNULL(a.UpdatedDate,a.CreatedDate)', sortOrder: 'DESC'}});
			bc.close();
		}, 1000);
	};
	const getRemProfileDetailsById = () => {
		setTimeout(() => {
			setLoading(true);
			setRowData([]);
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
								processGetRemProfileByIdRecived(messagingHub,response,request);
								
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
	const processGetRemProfileByIdRecived = (messagingHub: HubConnection,response: AxiosResponse<any>,request: RemProfileFilterRequestModel)=>{
		if (response.status === successResponse) {
			messagingHub.on(request.queueId.toString(), (message) => {
				GetRemProfileByIdResult(message.cacheId)
					.then((data) => {
						let responseData = data.data;
						setRemProfileResponse(responseData);
						setRowData(responseData.scheduleTemplateDetails);
						setLoading(false);
						setAgentName({
							label: responseData?.remProfileDetails?.agentName,
							value: responseData?.remProfileDetails?.agentId ? responseData?.remProfileDetails?.agentId?.toString() : '',
						});
						setSelectedScheduleTemplate({
							label: responseData?.remProfileDetails?.scheduleTemplateSettingName,
							value: responseData?.remProfileDetails?.scheduleTemplateSettingId
								? responseData?.remProfileDetails?.scheduleTemplateSettingId?.toString()
								: '',
						});
						setContactDetailsList(responseData.contactDetails);
					})
					.catch(() => {
						setLoading(false);
					});
				messagingHub.off(request.queueId.toString());
				messagingHub.stop();
				setLoading(false);
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

	return (
			<MainContainer>
				<FormHeader headerLabel={VIEW_REM_PROFILE} />
				<ContentContainer>
					<FormGroupContainer>
						<div className='col-12'>
							<p className='form-control-plaintext fw-bolder'>ReM Agent Details</p>
						</div>
					</FormGroupContainer>
					<FormGroupContainer>
						<div className='col-lg-3'>
							<label className='col-form-label col-sm'>{AgentDetails.REM_PROFILE_ID}</label>
							<input type='text' autoComplete='off' className='form-control form-control-sm' disabled={true} value={id} />
						</div>
						<div className='col-lg-3'>
							<label className='col-form-label col-sm'>{AgentDetails.REM_PROFILE_NAME}</label>
							<input
								type='text'
								autoComplete='off'
								className='form-control form-control-sm'
								disabled={true}
								value={remProfileResponse?.remProfileDetails?.remProfileName}
							/>
						</div>

						<div className='col-lg-3'>
							<label className='col-form-label col-sm'>{AgentDetails.AGENT_NAME}</label>
							<Select size='small' autoComplete='off' style={{width: '100%'}} value={agentName} isDisabled={true} />
						</div>
						<div className='col-lg-3'>
							<label className='col-form-label col-sm'>{AgentDetails.PSEUDO_NAME}</label>
							<input
								type='text'
								autoComplete='off'
								className='form-control form-control-sm'
								disabled={true}
								value={remProfileResponse?.remProfileDetails?.pseudoNamePP}
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
							<label className='col-form-label '>{ScheduleDetails.TEMPLATE_NAME}</label>
						</div>

						<div className='col-lg-4'>
							<Select size='small' style={{width: '100%'}} className='right' value={selectedScheduleTemplate} isDisabled={true} />
						</div>
						<div className='col-form-label col-md-3'>
							<ButtonGroup aria-label='Basic example'>
								<div className='d-flex justify-content-center flex-shrink-0 shadow-none'>
									<label
										className='btn-link cursor-pointer viewRemProfileBtn' onClick={() => (selectedScheduleTemplate?.value ? redirectToSchedulePage(selectedScheduleTemplate?.value) : '')} onKeyDown={() => (selectedScheduleTemplate?.value ? redirectToSchedulePage(selectedScheduleTemplate?.value) : '')}>
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
						<label className='col-form-label col-lg-2'>{AgentDetails.CHANNELS}</label>
						<div className='col-lg-3'>
							<Select autoComplete='off' size='small' style={{width: '100%'}} className='right' isDisabled={true} />
						</div>
						<div className='col-form-button col-md-3 mb-10'>
							<MlabButton type={'button'} label={'Add'} access={true} style={ElementStyle.primary} weight={'solid'} disabled={true} />
						</div>
					</FormGroupContainer>
					{remProfileResponse && (
						<>
							{contactDetailsList.map(
								(cd, index) =>
									cd.contactDetailsName !== LIVECHAT &&
									cd.contactDetailsName !== LIVEPERSON && (
										<ChannelDetails
											key={index}
											selectedTypeId={contactDetailsList[index]?.messageTypeId}
											idx={index}
											selectedTypeName={contactDetailsList[index]?.contactDetailsName}
											data={contactDetailsList}
											liveChat={remProfileResponse?.liveChatDetails}
											livePerson={remProfileResponse?.livePersonDetails}
											setRemovedChannelId={setRemovedChannelId}
											remProfileId={id}
											isForViewing={true}
										></ChannelDetails>
									)
							)}
							{/* Live person and live chat section */}
							{contactDetailsList.map(
								(cd, index) =>
									(cd.contactDetailsName === LIVECHAT || cd.contactDetailsName === LIVEPERSON) && (
										<ChannelDetails
											key={index}
											selectedTypeId={contactDetailsList[index]?.messageTypeId}
											idx={index}
											selectedTypeName={contactDetailsList[index]?.contactDetailsName}
											data={contactDetailsList}
											liveChat={remProfileResponse?.liveChatDetails}
											livePerson={remProfileResponse?.livePersonDetails}
											setRemovedChannelId={setRemovedChannelId}
											remProfileId={id}
											isForViewing={true}
										></ChannelDetails>
									)
							)}
						</>
					)}
				</ContentContainer>
				<FooterContainer>
					<div>
						{page !== VIEW && (
							<DefaultPrimaryButton
								title={'Edit Profile'}
								access={userAccess.includes(USER_CLAIMS.RemProfileRead) && userAccess.includes(USER_CLAIMS.RemProfileWrite)}
								onClick={() => redirectToEditPage(id)}
							/>
						)}

						<DefaultSecondaryButton access={true} title={'Back'} onClick={() => redirectToSearchPage('/relationship-management/rem-profile/')} />
					</div>
				</FooterContainer>
			</MainContainer>
	);
};

export default ViewRemProfile;
