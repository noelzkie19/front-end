import {faUsers} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import React, {useEffect, useState} from 'react';
import {Col, OverlayTrigger, Row, Tooltip} from 'react-bootstrap-v5';
import {shallowEqual, useDispatch, useSelector} from 'react-redux';
import swal from 'sweetalert';
import {RootState} from '../../../../setup';
import * as hubConnection from '../../../../setup/hub/MessagingHub';
import {
	BasicFieldLabel,
	BasicTextInput,
	ButtonsContainer,
	DefaultGridPagination,
	DefaultPrimaryButton,
	DefaultSecondaryButton,
	DefaultSelect,
	FieldContainer,
	FormHeader,
	MainContainer,
	PaddedContainer,
} from '../../../custom-components';
import {useCaseTypeOptions, useSubtopicOptions, useTopicOptions} from '../../../custom-functions';
import {GetPlayerProfile} from '../../player-management/redux/PlayerManagementService';
import {USER_CLAIMS} from '../../user-management/components/constants/UserClaims';

import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import {
	CaseCampaignByIdRequest,
	CaseContributorByIdResponse,
	CaseContributorListRequest,
	CaseInformationRequest,
	ChangeCaseStatusRequest,
	CommunicationListRequest,
	CommunicationResponse,
	UpdateCaseInformationRequest,
} from '../models';

import {AgGridReact} from 'ag-grid-react';

import {parse} from 'date-fns';
import {Guid} from 'guid-typescript';
import {htmlDecode} from 'js-htmlencode';
import {Link, useHistory, useParams} from 'react-router-dom';
import {MessageTypeEnum} from '../../../constants/Constants';
import useConstant from '../../../constants/useConstant';
import {formatDate} from '../../../custom-functions/helper/dateHelper';
import useFnsDateFormatter from '../../../custom-functions/helper/useFnsDateFormatter';
import * as caseCommunication from '../redux/CaseCommunicationRedux';
import {
	GetCaseCampaignById,
	GetCaseContributorById,
	GetCaseInformationbyId,
	GetCommunicationList,
	SendChangeCaseStatus,
	SendGetCaseCampaignById,
	SendGetCaseContributorById,
	SendGetCaseInformationbyId,
	SendGetCommunicationList,
	UpdateCaseInformation,
} from '../services/CaseCommunicationApi';
import { ColDef, ColGroupDef } from 'ag-grid-community';

const ViewCase: React.FC = () => {
	const history = useHistory();

	const userAccess = useSelector<RootState>(({auth}) => auth.access, shallowEqual) as string;
	const userAccessId = useSelector<RootState>(({auth}) => auth.userId, shallowEqual) as number;

	const dispatch = useDispatch();
	const {caseId}: {caseId: number} = useParams();
	const {HubConnected, successResponse, FnsDateFormatPatterns} = useConstant();
	let caseStatusNames = {
		CaseOpenStatus: 'Open',
		CaseClosedStatus: 'Closed',
	};

	// States
	const [selectedTopic, setSelectedTopic] = useState<string | any>('');
	const [selectedSubtopic, setSelectedSubtopic] = useState<string | any>('');
	const [selectedCaseType, setSelectedCaseType] = useState<string | any>('');

	const [userName, setUserName] = useState<string>('');
	const [brand, setBrand] = useState<string>('');
	const [currency, setCurrency] = useState<string>('');
	const [vipLevel, setVipLevel] = useState<string>('');
	const [paymentGroup, setPaymentGroup] = useState<string>('');
	const [deposited, setDeposited] = useState<string>('');
	const [marketingChannel, setMarketingChannel] = useState<string>('');
	const [marketingSource, setMarketingSource] = useState<string>('');
	const [caseCreator, setCaseCreator] = useState<string>('');
	const [createdDate, setCreatedDate] = useState<string>('');
	const [updatedBy, setUpdatedBy] = useState<string>('');
	const [updatedDate, setUpdatedDate] = useState<string>('');

	const [callListNote, setCallListNote] = useState<string>('');
	const [campaignName, setCampaignName] = useState<string>('');

	const [rowData, setRowData] = useState<Array<CommunicationResponse>>([]);
	const [communicationList, setCommunicationList] = useState<Array<CommunicationResponse>>([]);
	const [isEditCaseInformation, setIsEditCaseInformation] = useState<boolean>(true);
	const [isDisableCaseInformation, setIsDisableCaseInformation] = useState<boolean>(false);
	const [isDisableEditCase, setIsDisableEditCase] = useState<boolean>(false);
	const [isBackCaseInformation, setIsBackCaseInformation] = useState<boolean>(false);
	const [isSubmitCaseInformation, setIsSubmitCaseInformation] = useState<boolean>(false);
	const [isDisableTopic, setIsDisableTopic] = useState<boolean>(true);
	const [isDisableSubtopic, setIsDisableSubtopic] = useState<boolean>(true);
	const [isDisableAddCommunication, setIsDisableAddCommunication] = useState<boolean>(false);
	const [isCloseCase, setIsCloseCase] = useState<boolean>(true);
	const [isReOpenCase, setIsReOpenCase] = useState<boolean>(false);

	const [topicId, setTopicId] = useState<number>(0);
	const [caseCreatorId, setCaseCreatorId] = useState<number>(0);
	const [campaignId, setCampaignId] = useState<number>(0);
	const [caseStatusId, setCaseStatusId] = useState<number>(0);
	const [caseTypeId, setCaseTypeId] = useState<number>(0);
	const [caseStatus, setCaseStatus] = useState<string>('');
	const [caseContibutors, setCaseContibutors] = useState<Array<CaseContributorByIdResponse>>([]);
	const [mlabPlayerId, setMlabPlayerId] = useState<number>(0);

	// GRID PAGINATION STATE
	const [pageSize, setPageSize] = useState<number>(10);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [recordCount, setRecordCount] = useState<number>(0);
	const [sortOrder, setSortOrder] = useState<string>('ASC');
	const [sortColumn, setSortColumn] = useState<string>('CaseCommunicationId');
	const {mlabFormatDate} = useFnsDateFormatter();

	/**
	 *  ? Mounted
	 */
	useEffect(() => {
		//BEFORE LOADING, CHECK IF USER IS AUTHORIZED TO VIEW CASES
		if (!userAccess?.includes(USER_CLAIMS.ViewCaseRead) && !userAccess.includes(USER_CLAIMS.ViewCaseWrite)) {
			_redirectCaseInfoDenied(); // FIX FOR MLAB-4638
		}
		//BEFORE LOADING OF PAGE CHECK OF CASE INFORMATION ID WAS PASSED

		if (caseId !== 0) {
			_getCaseInformation();
			setPageSize(10);
			setCurrentPage(1);
			_getCommunications(10, 1, sortColumn, sortOrder);
			_getCaseContributor();
		} else {
			swal('Failed', 'Problem getting case information', 'error').catch(() => {});
		}
	}, []);

	const onGridReady = (params: any) => {
		params.api.paginationGoToPage(4);
		setRowData(communicationList);
		params.api.sizeColumnsToFit();
	};

	useEffect(() => {
		setRowData(communicationList);
	}, [communicationList]);

	const getPlayerProfile = (id: string, brandName: string) => {
		let request = {
			playerId: id,
			pageSource: 'Campaign Case',
			hasAccess: userAccess?.includes(USER_CLAIMS.ViewSensitiveDataRead) && userAccess.includes(USER_CLAIMS.ViewSensitiveDataWrite),
			brandName: brandName,
		};

		GetPlayerProfile(request)
			.then((response) => {
				if (response.status === successResponse) {
					const {username, brand, currency, vipLevel, paymentGroup, deposited, marketingChannel, marketingSource, mlabPlayerId} = response.data.data;
					setUserName(username);
					setBrand(brand);
					setCurrency(currency);
					setVipLevel(vipLevel);
					setPaymentGroup(paymentGroup);
					setDeposited(deposited === true ? 'Yes' : 'No');
					setMarketingChannel(marketingChannel);
					setMarketingSource(marketingSource);
					setMlabPlayerId(mlabPlayerId);
				}
			})
			.catch((ex) => {
				console.log('[ERROR] Player Profile: ' + ex);
				swal('Problem in getting profile').catch(() => {});
			});
	};

	const _redirectCaseInfoDenied = () => {
		history.push('/error/401');
	};

	const _getCaseInformation = async () => {
		setTimeout(() => {
			const messagingHub = hubConnection.createHubConnenction();
			messagingHub
				.start()
				.then(() => {
					const request: CaseInformationRequest = {
						queueId: Guid.create().toString(),
						userId: userAccessId.toString(),
						caseInformationId: caseId,
					};

					SendGetCaseInformationbyId(request)
						.then((response) => {
							// CHECKING OF RESPONSE FROM GATEWAY AND GETTING ACCESS RESTRICTION
							if (response.status === successResponse) {
								messagingHub.on(request.queueId.toString(), async (message) => {
									const hasResult = await getCaseInformationbyIdCallback(message.cacheId);
									if (!hasResult) {
										_redirectCaseInfoDenied();
									}
								});
							} else {
								console.log('Failed', 'Problem getting case information', 'error');
							}
						})
						.catch((err) => {
							console.log('Error while starting connection: ' + err);
						});
				})
				.catch((err) => console.log('Error while starting connection: ' + err));
		}, 1000);
	};

	const getCaseInformationbyIdCallback = async (_cacheId: string) => {
		return new Promise((resolve, reject) => {
			GetCaseInformationbyId(_cacheId)
				.then((data) => {
					if (data?.data) {
						// -- FETCH OF NEEDED ENDPOINT -- //
						_getCaseCampaignInformation(data.data.playerId, data.data.campaignId, data.data.brandName);
						getPlayerProfile(data.data.playerId, data.data.brandName);

						// -- CASE TEXT FIELD INFORMATION -- //
						setCaseCreator(data.data.caseCreatorName ?? '');
						setCaseStatus(data.data.caseStatusName);
						let createdDate = parse(data.data.createdDate ?? '', FnsDateFormatPatterns.mlabDateFormat, new Date());
						let updatedDate = parse(data.data.updatedDate ?? '', FnsDateFormatPatterns.mlabDateFormat, new Date());
						setCreatedDate(mlabFormatDate(createdDate) ?? '');
						setUpdatedBy(data.data.updatedByName);
						setUpdatedDate(mlabFormatDate(updatedDate) ?? '');

						// CALL PLAYER INFORMATION BASED ON CASE PLAYER ID

						setSelectedTopic({
							label: data.data.topicName,
							value: data.data.topicId.toString(),
						});

						setSelectedSubtopic({
							label: data.data.subtopicName,
							value: data.data.subtopicId.toString(),
						});

						setSelectedCaseType({
							label: data.data.caseTypeName,
							value: data.data.caseTypeId.toString(),
						});

						setTopicId(data.data.topicId);
						setCaseCreatorId(data.data.caseCreatorId);
						setCampaignId(data.data.campaignId);
						setCaseStatusId(data.data.caseStatusId);
						setCaseTypeId(data.data.caseTypeId);
						setCaseStatus(data.data.caseStatusName);

						// -- CHECK IF STATUS IS OPEN -- //
						if (data.data.caseStatusName === caseStatusNames.CaseOpenStatus) {
							setIsDisableTopic(true);
							setIsDisableSubtopic(true);
							setIsEditCaseInformation(true);
							setIsSubmitCaseInformation(false);
							setIsBackCaseInformation(false);
							setIsCloseCase(true);
							setIsReOpenCase(false);
							setIsDisableCaseInformation(false);
							setIsDisableAddCommunication(false);
						}

						if (data.data.caseStatusName === caseStatusNames.CaseClosedStatus) {
							setIsDisableAddCommunication(true);
							setIsDisableCaseInformation(true);
							setIsCloseCase(false);
							setIsReOpenCase(true);
						}
						resolve(true);
					} else {
						resolve(false);
					}
				})
				.catch(() => {
					console.log('error from callback function');
					resolve(false);
				});
		});
	};

	const getCommunicationListCallback = (_cacheId: string) => {
		GetCommunicationList(_cacheId)
			.then((data) => {
				let resultData = Object.assign(new Array<CommunicationResponse>(), data.data.communicationList);
				setCommunicationList(resultData);
				setRecordCount(data.data.totalRecordCount);
				if (resultData.find((item) => item.messageTypeName == 'Web Push' || item.messageTypeName == 'Email')) {
					setIsDisableEditCase(true);
					if (resultData.find((item) => item.messagetypeId == MessageTypeEnum.FlyFoneCall)) {
						setIsDisableEditCase(false);
					}
				}
			})
			.catch(() => {
				console.log('error from callback function');
			});
	};

	const _getCommunications = (pageSize: number, currentPage: number, sortColumn: string, sortOrder: string) => {
		setTimeout(() => {
			//FETCH TO API
			const messagingHub = hubConnection.createHubConnenction();
			messagingHub
				.start()
				.then(() => {
					// PARAMTER TO PASS ON API GATEWAY
					const request: CommunicationListRequest = {
						queueId: Guid.create().toString(),
						userId: userAccessId.toString(),
						pageSize: pageSize,
						offsetValue: (currentPage - 1) * pageSize,
						sortColumn: sortColumn,
						sortOrder: sortOrder,
						caseInformatIonId: caseId,
					};

					// CALLING OF GATEWAY API
					SendGetCommunicationList(request)
						.then((response) => {
							// CHECKING OF RESPONSE FROM GATEWAY
							if (response.status === successResponse) {
								messagingHub.on(request.queueId.toString(), (message) => {
									getCommunicationListCallback(message.cacheId);
								});
							} else {
								swal('Failed', 'Problem getting communications', 'error').catch(() => {});
							}
						})
						.catch((err) => console.log('Error while starting connection: ' + err));
				})
				.catch((err) => console.log('Error while starting connection: ' + err));
		}, 1000);
	};

	const _getCaseContributor = () => {
		setTimeout(() => {
			const messagingHub = hubConnection.createHubConnenction();
			messagingHub
				.start()
				.then(async () => {
					const request: CaseContributorListRequest = {
						queueId: Guid.create().toString(),
						userId: userAccessId.toString(),
						caseInformationId: caseId,
					};
					await SendGetCaseContributorById(request).then((response) => {
						if (response.status === successResponse) {
							messagingHub.on(request.queueId.toString(), (message) => {
								GetCaseContributorById(message.cacheId)
									.then((data) => {
										setCaseContibutors(data.data);
									})
									.catch(() => {
										// setLoading(false)
										console.log('error from callback function');
									});
							});
						} else {
							swal('Failed', 'Problem getting case contributor', 'error').catch(() => {});
						}
					});
				})
				.catch((err) => console.log('Error while starting connection: ' + err));
		}, 1000);
	};

	const getCaseCampaignByIdCallback = (_cacheId: string) => {
		GetCaseCampaignById(_cacheId)
			.then((data) => {
				setCallListNote(data.data.callListNote);
				setCampaignName(data.data.campaignName);
			})
			.catch(() => {
				console.log('error from callback function');
			});
	};

	const _getCaseCampaignInformation = (playerId: string, campaignId: number, brandName: string) => {
		setTimeout(() => {
			const messagingHub = hubConnection.createHubConnenction();
			messagingHub
				.start()
				.then(() => {
					const request: CaseCampaignByIdRequest = {
						queueId: Guid.create().toString(),
						userId: userAccessId.toString(),
						playerId: playerId,
						campaignId: campaignId,
						brandName: brandName,
					};

					SendGetCaseCampaignById(request)
						.then((response) => {
							if (response.status === successResponse) {
								messagingHub.on(request.queueId.toString(), (message) => {
									getCaseCampaignByIdCallback(message.cacheId);
								});
							} else {
								swal('Failed', 'Problem getting case information', 'error');
							}
						})
						.catch((err) => console.log('Error while starting connection: ' + err));
				})
				.catch((err) => console.log('Error while starting connection: ' + err));
		}, 1000);
	};

	/**
	 *  ? Events
	 */
	const onChangeSelectedTopic = (val: string | any) => {
		setSelectedTopic(val);
		setSelectedSubtopic('');
		setTopicId(val.value);
	};

	const onChangeSelectedSubTopic = (val: string) => {
		setSelectedSubtopic(val);
	};

	const onChangeCaseType = (val: string) => {
		setSelectedCaseType(val);
	};

	/**
	 *  ? Custom pagination
	 */
	const onPageSizeChanged = () => {
		let value: string = (document.getElementById('page-size') as HTMLInputElement).value;
		setPageSize(Number(value));
		setCurrentPage(1);

		if (communicationList != undefined && communicationList.length > 0) {
			_getCommunications(Number(value), 1, sortColumn, sortOrder);
		}
	};

	const onClickFirst = () => {
		if (currentPage > 1) {
			setCurrentPage(1);
			_getCommunications(pageSize, 1, sortColumn, sortOrder);
		}
	};

	const onClickPrevious = () => {
		if (currentPage > 1) {
			setCurrentPage(currentPage - 1);
			_getCommunications(pageSize, 1, sortColumn, sortOrder);
		}
	};

	const onClickNext = () => {
		if (totalPage() > currentPage) {
			setCurrentPage(currentPage + 1);
			_getCommunications(pageSize, currentPage + 1, sortColumn, sortOrder);
		}
	};

	const onClickLast = () => {
		if (totalPage() > currentPage) {
			setCurrentPage(totalPage());
			_getCommunications(pageSize, totalPage(), sortColumn, sortOrder);
		}
	};

	const totalPage = () => {
		return Math.ceil(recordCount / pageSize) | 0;
	};

	const getCommunicationContentWavFileFromFlyFone = (communicationContent: string = '') => {
		let regex: RegExp = /href="([^"]*)/;
		let decerializeHtmlCommunicationContent = htmlDecode(communicationContent);
		const voiceUri = RegExp(regex).exec(decerializeHtmlCommunicationContent);
		const voiceVal = voiceUri![1];

		return voiceVal;
	};

	const onSort = (e: any) => {
		setCurrentPage(1);

		if (communicationList != undefined && communicationList.length > 0) {
			let sortDetail = e.api.getSortModel();
			if (sortDetail[0] != undefined) {
				setSortColumn(sortDetail[0]?.colId);
				setSortOrder(sortDetail[0]?.sort);
				_getCommunications(pageSize, totalPage(), sortDetail[0]?.colId, sortDetail[0]?.sort);
			} else {
				setSortColumn('');
				setSortOrder('');
				_getCommunications(pageSize, totalPage(), '', '');
			}
		}
	};

	const _editCaseInformation = () => {
		setIsDisableTopic(false);
		setIsDisableSubtopic(false);
		setIsEditCaseInformation(false);
		setIsSubmitCaseInformation(true);
		setIsBackCaseInformation(true);
		setIsCloseCase(false);
	};

	const _back = () => {
		swal({
			title: 'Confirmation',
			text: 'This action will discard any changes made and return to the campaign workspace page, please confirm',
			icon: 'warning',
			buttons: ['No', 'Yes'],
			dangerMode: true,
		})
			.then((willUpdate) => {
				if (willUpdate) {
					setIsDisableTopic(true);
					setIsDisableSubtopic(true);
					setIsEditCaseInformation(true);
					setIsSubmitCaseInformation(false);
					setIsBackCaseInformation(false);
					setIsCloseCase(true);
				}
			})
			.catch(() => {});
	};

	const _addCommunication = () => {
		dispatch(caseCommunication.actions.communicationSurveyQuestionAnswer([]));
		dispatch(caseCommunication.actions.communicationFeedbackList([]));
		const win: any = window.open(`/campaign-workspace/add-communication/${caseId}`, '_blank');
		win.focus();
	};

	const postUpdateCaseInformation = () => {
		const request: UpdateCaseInformationRequest = {
			queueId: Guid.create().toString(),
			userId: userAccessId.toString(),
			caseInformationId: caseId,
			caseCreatorId: caseCreatorId,
			campaignId: campaignId,
			caseStatusId: caseStatusId,
			caseTypeId: caseTypeId,
			topicId: parseInt(selectedTopic.value),
			subtopicId: parseInt(selectedSubtopic.value),
			mlabPlayerId: mlabPlayerId,
		};

		setTimeout(() => {
			const messagingHub = hubConnection.createHubConnenction();
			messagingHub
				.start()
				.then(() => {
					if (messagingHub.state === HubConnected) {
						UpdateCaseInformation(request)
							.then((response) => {
								if (response.status === successResponse) {
									messagingHub.on(request.queueId.toString(), (message) => {
										let resultData = JSON.parse(message.remarks);

										if (resultData.Status === successResponse) {
											swal('Success', 'Transaction successfully submitted', 'success').catch(() => {});
											_getCaseInformation();
											_getCaseContributor();
										}

										messagingHub.off(request.queueId.toString());
										messagingHub.stop().catch(() => {});
									});
								}
							})
							.catch(() => {
								swal('Failed', 'Problem in Connection on Gateway', 'error').catch(() => {});
							});
					}
				})
				.catch((err) => console.log('Error while starting connection: ' + err));
		}, 1000);
	};

	const _submitCaseInformation = () => {
		// VALIDATE REQUIRED FIELDS
		let isError: boolean = false;

		if (selectedTopic.value === undefined) {
			isError = true;
		}

		if (selectedSubtopic.value === undefined) {
			isError = true;
		}

		if (isError === true) {
			swal('Failed', 'Unable to proceed, kindly fill up all mandatory fields', 'error').catch(() => {});
		} else {
			postUpdateCaseInformation();
		}
	};

	const postChangeStatus = () => {
		const request: ChangeCaseStatusRequest = {
			queueId: Guid.create().toString(),
			userId: userAccessId.toString(),
			caseInformationId: caseId,
			caseStatusId: caseStatus === 'Open' ? 46 : 2,
		};

		setTimeout(() => {
			const messagingHub = hubConnection.createHubConnenction();
			messagingHub
				.start()
				.then(() => {
					if (messagingHub.state === HubConnected) {
						SendChangeCaseStatus(request)
							.then((response) => {
								if (response.status === successResponse) {
									messagingHub.on(request.queueId.toString(), () => {
										swal('Success', 'Transaction successfully submitted', 'success').catch(() => {});
										_getCaseInformation();
										_getCaseContributor();
										messagingHub.off(request.queueId.toString());
										messagingHub.stop().catch(() => {});
									});
								}
							})
							.catch(() => {
								messagingHub.stop().catch(() => {});
								swal('Failed', 'Problem in Connection on Gateway', 'error').catch(() => {});
							});
					}
				})
				.catch((err) => console.log('Error while starting connection: ' + err));
		}, 1000);
	};

	const _changeCaseStatus = () => {
		swal({
			title: 'Confirmation',
			text:
				caseStatus === 'Open'
					? 'This action will change the Case status to Closed, please confirm'
					: 'This action will change the Case status to Open, please confirm',
			icon: 'warning',
			buttons: ['No', 'Yes'],
			dangerMode: true,
		})
			.then((willUpdate) => {
				if (willUpdate) {
					postChangeStatus();
				}
			})
			.catch(() => {});
	};

	/**
	 * ? Local Component
	 */
	const renderTooltip = (props: any) => (
		<Tooltip id='button-tooltip' {...props}>
			{caseContibutors.map((x: CaseContributorByIdResponse) => {
				return <BasicFieldLabel key={x.userContributorId} title={x.userContributorName} />;
			})}
		</Tooltip>
	);

	const tableLoader = (data: any) => {
		return (
			<div className='ag-custom-loading-cell' style={{paddingLeft: '10px', lineHeight: '25px'}}>
				<i className='fas fa-spinner fa-pulse'></i> <span> {data.loadingMessage}</span>
			</div>
		);
	};

	/**
	 * ? Tables
	 */

	const renderCommunicationListAction = (_props: any) => (
		<>
			{userAccess.includes(USER_CLAIMS.ViewCommunicationRead) === true && (
				<Link to={`/campaign-workspace/view-communication/${_props.data.caseCommunicationId}`} target='_blank'>
					{' '}
					View{' '}
				</Link>
			)}
			<label style={{marginLeft: 10, marginRight: 10}}>|</label>
			{userAccess.includes(USER_CLAIMS.CaseAndCommunicationWrite) === true && (
				<Link to={`/campaign-workspace/edit-communication/${_props.data.caseCommunicationId}`} target='_blank'>
					{''}
					Edit{' '}
				</Link>
			)}
			{_props.data.communicationContent?.includes('href') && (
				<>
					<label style={{marginLeft: 10, marginRight: 10}}>|</label>
					<a href={`${getCommunicationContentWavFileFromFlyFone(_props.data.communicationContent)}`} target='_blank' rel='noreferrer'>
						View Recording
					</a>
				</>
			)}
		</>
	);
	const communicationRecordColdefs : (ColDef<CommunicationResponse> | ColGroupDef<CommunicationResponse>)[] =[
		{headerName: 'No', valueGetter: ('node.rowIndex + 1 + ' + (currentPage - 1) * pageSize).toString(), sortable: false, width: 60},
		{headerName: 'Communication ID', field: 'caseCommunicationId'},
		{headerName: 'Message Type', field: 'messageTypeName'},
		{headerName: 'Message Status', field: 'messageStatusName'},
		{headerName: 'Message Reponse', field: 'messageResponseName'},
		{headerName: 'Created Date', field: 'createdDate', cellRenderer: (params: any) => formatDate(params.data.createdDate)},
		{headerName: 'Created by', field: 'createdByName'},
		{headerName: 'Reported Date', field: 'reportedDate', cellRenderer: (params: any) => formatDate(params.data.reportedDate)},
		{
			headerName: 'Action',
			sortable: false,
			cellRenderer: renderCommunicationListAction,
		},
	];

	return (
		<>
			<MainContainer>
				<FormHeader headerLabel={'Player Information'} />
				<div style={{margin: 40}}>
					<Row>
						<Col sm={3}>
							<BasicFieldLabel title={'Username'} />
							<BasicTextInput ariaLabel={'Username'} colWidth={'col-sm-12'} onChange={(e) => {}} disabled={true} value={userName} />
						</Col>
						<Col sm={3}>
							<BasicFieldLabel title={'Brand'} />
							<BasicTextInput ariaLabel={'brand'} colWidth={'col-sm-12'} onChange={(e) => {}} disabled={true} value={brand} />
						</Col>
						<Col sm={3}>
							<BasicFieldLabel title={'Currency'} />
							<BasicTextInput ariaLabel={'Currency'} colWidth={'col-sm-12'} onChange={(e) => {}} disabled={true} value={currency} />
						</Col>
						<Col sm={3}>
							<BasicFieldLabel title={'VIP Level'} />
							<BasicTextInput ariaLabel={'vipLevel'} colWidth={'col-sm-12'} onChange={(e) => {}} disabled={true} value={vipLevel} />
						</Col>
					</Row>

					<Row style={{marginTop: 20}}>
						<Col sm={3}>
							<BasicFieldLabel title={'Payment group'} />
							<BasicTextInput ariaLabel={'paymentGroup'} colWidth={'col-sm-12'} onChange={(e) => {}} disabled={true} value={paymentGroup} />
						</Col>
						<Col sm={3}>
							<BasicFieldLabel title={'Deposited'} />
							<BasicTextInput ariaLabel={'deposited'} colWidth={'col-sm-12'} onChange={(e) => {}} disabled={true} value={deposited} />
						</Col>
						<Col sm={3}>
							<BasicFieldLabel title={'Marketing  Channel'} />
							<BasicTextInput ariaLabel={marketingChannel} colWidth={'col-sm-12'} onChange={(e) => {}} disabled={true} value={marketingChannel} />
						</Col>
						<Col sm={3}>
							<BasicFieldLabel title={'Marketing  Source'} />
							<BasicTextInput ariaLabel={'marketingSource'} colWidth={'col-sm-12'} onChange={(e) => {}} disabled={true} value={marketingSource} />
						</Col>
					</Row>

					<Row style={{marginTop: 20, marginBottom: 20}}>
						<Col sm={3}>
							<BasicFieldLabel title={'Call List Note'} />
							<BasicTextInput ariaLabel={'callListNote'} colWidth={'col-sm-12'} onChange={(e) => {}} disabled={true} value={callListNote} />
						</Col>
					</Row>
				</div>
			</MainContainer>

			<div style={{margin: 20}}></div>

			<MainContainer>
				<FormHeader headerLabel={'Case Information'} />
				<div style={{margin: 40}}>
					<Row>
						<Col sm={3}>
							<BasicFieldLabel title={'Case ID'} />
							<BasicTextInput ariaLabel={'caseId'} colWidth={'col-sm-12'} value={caseId.toString()} onChange={(e) => {}} disabled={true} />
						</Col>
						<Col sm={3}>
							<BasicFieldLabel title={'Case Status'} />
							<BasicTextInput ariaLabel={'caseStatus'} colWidth={'col-sm-12'} value={caseStatus} onChange={(e) => {}} disabled={true} />
						</Col>
						<Col sm={3}>
							<BasicFieldLabel title={'Case Creator'} />
							<BasicTextInput ariaLabel={'caseCreator'} colWidth={'col-sm-12'} value={caseCreator} onChange={(e) => {}} disabled={true} />
						</Col>
						<Col sm={3}>
							<BasicFieldLabel title={'Case Type'} />
							<DefaultSelect
								data={useCaseTypeOptions()}
								onChange={onChangeCaseType}
								value={selectedCaseType}
								isSearchable={false}
								isDisabled={true}
							/>
						</Col>
					</Row>

					<Row style={{marginTop: 20, marginBottom: 20}}>
						<Col sm={3}>
							<BasicFieldLabel title={'Campaign Name'} />
							<BasicTextInput ariaLabel={'campaignName'} colWidth={'col-sm-12'} value={campaignName} onChange={(e) => {}} disabled={true} />
						</Col>
						<Col sm={3}>
							<BasicFieldLabel title={'Case Created Date'} />
							<BasicTextInput ariaLabel={'createdDate'} colWidth={'col-sm-12'} value={createdDate} onChange={(e) => {}} disabled={true} />
						</Col>
						<Col sm={3}>
							<BasicFieldLabel title={'Last Modified By'} />
							<BasicTextInput ariaLabel={'updatedBy'} colWidth={'col-sm-12'} value={updatedBy} onChange={(e) => {}} disabled={true} />
						</Col>
						<Col sm={3}>
							<BasicFieldLabel title={'Last Modified Date'} />
							<BasicTextInput ariaLabel={'updatedDate'} colWidth={'col-sm-12'} value={updatedDate} onChange={(e) => {}} disabled={true} />
						</Col>
					</Row>

					<Row style={{marginTop: 20, marginBottom: 20}}>
						<Col sm={3}>
							<BasicFieldLabel title={'Case Contributor'} />
							<div className='col-sm-10'>
								<OverlayTrigger placement='right' delay={{show: 250, hide: 400}} overlay={renderTooltip}>
									<FontAwesomeIcon icon={faUsers} className='fa-2x' style={{marginLeft: 20}} />
								</OverlayTrigger>
							</div>
						</Col>
						<Col sm={3}>
							<BasicFieldLabel title={'Topic'} />
							<DefaultSelect data={useTopicOptions()} onChange={onChangeSelectedTopic} value={selectedTopic} isDisabled={isDisableTopic} />
						</Col>
						<Col sm={3}>
							<BasicFieldLabel title={'Subtopic'} />
							<DefaultSelect
								data={useSubtopicOptions(topicId)}
								onChange={onChangeSelectedSubTopic}
								value={selectedSubtopic}
								isDisabled={isDisableSubtopic}
							/>
						</Col>
						<Col sm={3}></Col>
					</Row>
				</div>
			</MainContainer>

			<div style={{margin: 20}}></div>

			<MainContainer>
				<FormHeader headerLabel={'Communication Record'} />
				<div style={{margin: 40}}>
					<Row>
						<Col sm={3} style={{display: 'flex', justifyContent: 'flex-start'}}>
							<Row style={{marginTop: 10, marginLeft: 5}}>
								<DefaultPrimaryButton
									access={userAccess.includes(USER_CLAIMS.AddCommunicationWrite)}
									title={'Add Communication'}
									onClick={_addCommunication}
									isDisable={isDisableAddCommunication}
								/>
							</Row>
						</Col>
					</Row>

					<Row>
						<Col sm={12}>
							<div className='ag-theme-quartz mt-5' style={{height: 400, width: '100%', marginBottom: '50px'}}>
								<AgGridReact
									rowData={rowData}
									defaultColDef={{
										sortable: true,
										resizable: true,
									}}
									components={{
										tableLoader: tableLoader,
									}}
									onGridReady={onGridReady}
									onSortChanged={(e) => onSort(e)}
									rowBuffer={0}
									enableRangeSelection={true}
									pagination={false}
									columnDefs={communicationRecordColdefs}
									paginationPageSize={pageSize}
								/>

								<DefaultGridPagination
									pageSize={pageSize}
									currentPage={currentPage}
									recordCount={recordCount}
									onPageSizeChanged={onPageSizeChanged}
									onClickFirst={onClickFirst}
									onClickPrevious={onClickPrevious}
									onClickNext={onClickNext}
									onClickLast={onClickLast}
								/>
							</div>
						</Col>
					</Row>
				</div>
			</MainContainer>

			<div style={{margin: 20}}></div>

			<MainContainer>
				<div style={{marginLeft: 40}}>
					<PaddedContainer>
						<FieldContainer>
							<ButtonsContainer>
								{isReOpenCase === true && (
									<DefaultPrimaryButton
										isDisable={false}
										access={userAccess.includes(USER_CLAIMS.CreateCaseWrite)}
										title={'Reopen Case'}
										onClick={_changeCaseStatus}
									/>
								)}

								{isCloseCase === true && (
									<DefaultSecondaryButton
										isDisable={false}
										access={userAccess.includes(USER_CLAIMS.CreateCaseWrite)}
										title={'Close Case'}
										onClick={_changeCaseStatus}
									/>
								)}

								{isEditCaseInformation === true && (
									<DefaultPrimaryButton
										access={userAccess.includes(USER_CLAIMS.CreateCaseWrite)}
										isDisable={isDisableCaseInformation || isDisableEditCase}
										title={'Edit Case'}
										onClick={_editCaseInformation}
									/>
								)}

								{isSubmitCaseInformation === true && (
									<DefaultPrimaryButton
										isDisable={false}
										access={userAccess.includes(USER_CLAIMS.CreateCaseWrite)}
										title={'Submit'}
										onClick={_submitCaseInformation}
									/>
								)}

								{isBackCaseInformation === true && (
									<DefaultSecondaryButton isDisable={false} access={userAccess.includes(USER_CLAIMS.ViewCaseRead)} title={'Back'} onClick={_back} />
								)}
							</ButtonsContainer>
						</FieldContainer>
					</PaddedContainer>
				</div>
			</MainContainer>
		</>
	);
};

export default ViewCase;
