import {faMinusSquare, faPlusSquare} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {Guid} from 'guid-typescript';
import moment from 'moment';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import DatePicker from 'react-datepicker';
import {shallowEqual, useSelector} from 'react-redux';
import {useHistory, useParams} from 'react-router-dom';
import Select from 'react-select';
import swal from 'sweetalert';
import {RootState} from '../../../../../setup';
import * as hubConnection from '../../../../../setup/hub/MessagingHub';
import {ElementStyle} from '../../../../constants/Constants';
import useConstant from '../../../../constants/useConstant';
import {
	BasicFieldLabel,
	ContentContainer,
	FormContainer,
	FormGroupContainer,
	FormHeader,
	GridWithLoaderAndPagination,
	MLabQuillEditor,
	MainContainer,
	MlabButton,
	RequiredLabel,
} from '../../../../custom-components';
import CommonLookups from '../../../../custom-functions/CommonLookups';
import useFnsDateFormatter from '../../../../custom-functions/helper/useFnsDateFormatter';
import {LookupModel} from '../../../../shared-models/LookupModel';
import {IAuthState} from '../../../auth';
import {DefaultPageSetup} from '../../../system/components/constants/PlayerConfigEnums';
import {USER_CLAIMS} from '../../../user-management/components/constants/UserClaims';
import {GetBroadcastConfigurationByIdRequest} from '../../models/request/GetBroadcastConfigurationByIdRequest';
import {GetBroadcastConfigurationRecipientsStatusProgressByIdRequest} from '../../models/request/GetBroadcastConfigurationRecipientsStatusProgressByIdRequest';
import {BroadcastConfigurationRecipientModelResponse} from '../../models/response/BroadcastConfigurationRecipientModelResponse';
import {GetBroadcastConfigurationByIdResponse} from '../../models/response/GetBroadcastConfigurationByIdResponse';
import {GetBroadcastConfigurationRecipientsStatusProgressByIdResponse} from '../../models/response/GetBroadcastConfigurationRecipientsStatusProgressByIdResponse';
import {
	CancelBroadcast,
	GetBroadcastConfigurationById,
	GetBroadcastConfigurationByIdResult,
	GetBroadcastConfigurationRecipientsStatusProgressById,
	GetBroadcastConfigurationRecipientsStatusProgressByIdResult,
} from '../../redux/ManageBroadcastApi';
import ViewLabel from './ViewLabel';

interface Upload {
	base64textString: string;
	imageName: string;
	showImage: boolean;
}

const ViewBroadcast: React.FC = () => {
	const {access} = useSelector<RootState>(({auth}) => auth, shallowEqual) as IAuthState;
	const userAccessId = useSelector<RootState>(({auth}) => auth.userId, shallowEqual) as number;
	const userAccess = useSelector<RootState>(({auth}) => auth.access, shallowEqual) as string;
	const {mlabFormatDate} = useFnsDateFormatter();

	//custom
	const messageTypeOptions = CommonLookups('messageTypes');
	//States
	const {id}: {id: string} = useParams();
	const editorKey: number = 4;
	const [pageSize, setPageSize] = useState<number>(DefaultPageSetup.pageSizeDefault);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [recordCount, setRecordCount] = useState<number>(0);
	const [sortOrder, setSortOrder] = useState<string>('DESC');
	const [sortColumn, setSortColumn] = useState<string>('BroadcastConfigurationRecipientId');
	const [loading, setLoading] = useState(false);
	const {UpsertBroadcastConstants, successResponse, HubConnected, tinyMCEKey} = useConstant();
	const [convertedContent, setConvertedContent] = useState<string>('');
	const [imageData, setImageData] = useState<Upload>({
		base64textString: '',
		imageName: '',
		showImage: false,
	});
	const [broadcastName, setBroadcastName] = useState<string>('');
	const [broadcastId, setBroadcastId] = useState<any>();
	const [broadcastStatus, setBroadcastStatus] = useState<any>();
	const [broadcastStatusId, setBroadcastStatusId] = useState<any>();
	const [selectedBroadcastDate, setSelectedBroadcastDate] = useState<any>();
	const [viewBroadcastConfigurationRecipients, setViewBroadcastConfigurationRecipients] = useState<
		Array<BroadcastConfigurationRecipientModelResponse>
	>([]);
	const [selectedMessageTypeOption, setSelectedMessageTypeOption] = useState<LookupModel>(UpsertBroadcastConstants.MessageTypeOptionDefault);
	const [recipientToggle, setRecipientToggle] = useState<boolean>(true);
	const [total, setTotal] = useState<number>(0);
	const [totalDelivered, setTotalDelivered] = useState<number>(0);
	const [totalNotDelivered, setTotalNotDelivered] = useState<number>(0);
	const [totalPending, setTotalPending] = useState<number>(0);
	const [isEnableCancelBroadcast, setIsEnableCancelBroadcast] = useState<boolean>(false);
	const gridRef: any = useRef();
	let interval: any;
	const history = useHistory();

	const customPlayerIdRender = (params: any) => {
		const {data} = params;
		if (data.playerId == 0) return '';
		else return data.playerId;
	};

	const columnDefs = [
		{headerName: 'Recipient ID', field: 'broadcastConfigurationRecipientId', flex: 1},
		{headerName: 'Recipient Type', field: 'recipientType', flex: 1},
		{headerName: 'Player ID', field: 'playerId', flex: 1, cellRenderer: customPlayerIdRender},
		{headerName: 'Username', field: 'username', flex: 1},
		{headerName: 'Brand', field: 'brand', flex: 1},
		{headerName: 'Currency', field: 'currency', flex: 1},
		{headerName: 'VIP Level', field: 'viP_Level', flex: 1},
		{headerName: 'Leads ID', field: 'leadId', flex: 1},
		{headerName: 'Leads Name', field: 'leadName', flex: 1},
		{headerName: 'Broadcast Result', field: 'broadcastResult', flex: 1},
		{headerName: 'Reason', field: 'broadcastResultReason', flex: 2},
	];
	const styleHideDetails = {
		display: 'none',
	};

	//useEffects
	useEffect(() => {
		if (!access?.includes(USER_CLAIMS.BroadcastRead)) history.push('/error/401');

		getAllRecipientByFilterView();
		getRecipientStatusProgressView();
	}, []);

	useEffect(() => {
		if (messageTypeOptions.length > 0) {
			let telegram = messageTypeOptions.find((d) => d.value.toString() === UpsertBroadcastConstants.MessageTypeOptionDefault.value);
			if (telegram) {
				setSelectedMessageTypeOption(telegram);
			}
		}
	}, [messageTypeOptions]);

	useEffect(() => {
		if (
			broadcastStatusId == UpsertBroadcastConstants.BroadcastStatusInProgressId ||
			broadcastStatusId == UpsertBroadcastConstants.BroadcastStatusId
		) {
			setIsEnableCancelBroadcast(true);
		} else {
			setIsEnableCancelBroadcast(false);
		}
	}, [broadcastStatusId]);

	const onViewClickNext = () => {
		if (totalPage() > currentPage) {
			setCurrentPage(currentPage + 1);
			paginationLoadListView(pageSize, currentPage + 1, sortColumn, sortOrder);
		}
	};

	const onViewClickLast = () => {
		if (totalPage() > currentPage) {
			setCurrentPage(totalPage());
			paginationLoadListView(pageSize, totalPage(), sortColumn, sortOrder);
		}
	};

	const paginationLoadListView = (_pageSize: number, _currentPage: number, _sortColumn: string, _sortOrder: string) => {
		getAllRecipientByFilterView(_sortColumn, _sortOrder, (_currentPage - 1) * _pageSize, _pageSize);
	};
	const onPageSizeChanged = () => {
		const value: string = (document.getElementById('page-size') as HTMLInputElement).value;
		setPageSize(Number(value));
		setCurrentPage(1);
		if (viewBroadcastConfigurationRecipients != undefined && viewBroadcastConfigurationRecipients.length > 0) {
			paginationLoadListView(Number(value), 1, sortColumn, sortOrder);
		}
	};

	const totalPage = () => {
		return Math.ceil(recordCount / pageSize) | 0;
	};
	const onViewSort = (e: any) => {
		if (viewBroadcastConfigurationRecipients != undefined && viewBroadcastConfigurationRecipients.length > 0) {
			const sortDetail = e.api.getSortModel();
			if (sortDetail[0] != undefined) {
				setSortColumn(sortDetail[0]?.colId);
				setSortOrder(sortDetail[0]?.sort);
				getAllRecipientByFilterView(sortDetail[0]?.colId, sortDetail[0]?.sort);
			} else {
				setSortColumn('');
				setSortOrder('');
				getAllRecipientByFilterView();
			}
		}
	};

	const onViewPaginationClickPrevious = () => {
		if (currentPage > 1) {
			setCurrentPage(currentPage - 1);
			paginationLoadListView(pageSize, currentPage - 1, sortColumn, sortOrder);
		}
	};

	const onViewPaginationClickFirst = () => {
		if (currentPage > 1) {
			setCurrentPage(1);
			paginationLoadListView(pageSize, 1, sortColumn, sortOrder);
		}
	};
	const handleMessageEditorChange = useCallback((_content: string) => {
		setConvertedContent(_content);
	}, []);
	const handleMessageTypeOptionChange = (data: any) => {
		console.log(data);
		setSelectedMessageTypeOption(data);
	};

	const onClickEligibilityToggle = () => {
		setRecipientToggle(!recipientToggle);
	};
	const getAllRecipientByFilterView = async (_sortColumn?: string, _sortOrder?: string, _offsetValue?: number, _pageSize?: number) => {
		let request: GetBroadcastConfigurationByIdRequest = {
			broadcastConfigurationId: Number(id),
			pageSize: pageSize,
			offsetValue: (currentPage - 1) * pageSize,
			sortColumn: _sortColumn ?? sortColumn,
			sortOrder: _sortOrder ?? sortOrder,

			queueId: Guid.create().toString(),
			userId: userAccessId.toString(),
		};

		setLoading(true);
		setViewBroadcastConfigurationRecipients([]);
		setTimeout(() => {
			const messagingHubView = hubConnection.createHubConnenction();
			messagingHubView.start().then(() => {
				if (messagingHubView.state !== HubConnected) {
					return;
				}
				processGetBroadcastConfigurationByIdView(request, messagingHubView);
			});
		}, 1000);
	};
	const processGetBroadcastConfigurationByIdView = async (request: GetBroadcastConfigurationByIdRequest, messagingHubView: any) => {
		try {
			const responseGetBroadcastConfigurationById = await GetBroadcastConfigurationById(request);

			if (responseGetBroadcastConfigurationById.status === successResponse) {
				messagingHubView.on(request.queueId.toString(), async (message: any) => {
					try {
						const returnData = await GetBroadcastConfigurationByIdResult(message.cacheId);

						if (returnData.status !== successResponse) {
							swal(
								UpsertBroadcastConstants.SwalUpsertBroadcastMessage.titleFailed,
								UpsertBroadcastConstants.SwalUpsertBroadcastMessage.getBroadcastError,
								UpsertBroadcastConstants.SwalUpsertBroadcastMessage.iconError
							);
						} else {
							let resultData = returnData.data as GetBroadcastConfigurationByIdResponse;
							console.log(resultData);
							setViewBroadcastConfigurationRecipients(resultData.broadcastConfigurationRecipients);
							setBroadcastId(resultData.broadcastConfiguration.broadcastConfigurationId);
							setBroadcastName(resultData.broadcastConfiguration.broadcastName);
							setBroadcastStatus(resultData.broadcastConfiguration.broadcastStatus);
							setBroadcastStatusId(resultData.broadcastConfiguration.broadcastStatusId);

							setSelectedBroadcastDate(new Date(mlabFormatDate(resultData.broadcastConfiguration.broadcastDate, 'MM/d/yyyy HH:mm:ss')));

							if (imageData.base64textString == '')
								setImageData({base64textString: resultData.broadcastConfiguration.attachment, imageName: '', showImage: true});

							if (convertedContent == '') {
								setConvertedContent(resultData.broadcastConfiguration.message);
							}
							setRecordCount(resultData.recordCount);
						}

						messagingHubView.off(request.queueId.toString());
						messagingHubView.stop();
						setLoading(false);
					} catch {
						setLoading(false);
						swal(
							UpsertBroadcastConstants.SwalUpsertBroadcastMessage.titleFailed,
							UpsertBroadcastConstants.SwalUpsertBroadcastMessage.getBroadcastError,
							UpsertBroadcastConstants.SwalUpsertBroadcastMessage.iconError
						);
					}
				});
			} else {
				setLoading(false);
				swal(
					UpsertBroadcastConstants.SwalUpsertBroadcastMessage.titleFailed,
					UpsertBroadcastConstants.SwalUpsertBroadcastMessage.getBroadcastError,
					UpsertBroadcastConstants.SwalUpsertBroadcastMessage.iconError
				);
			}
		} catch {
			setLoading(false);
			swal(
				UpsertBroadcastConstants.SwalUpsertBroadcastMessage.titleFailed,
				UpsertBroadcastConstants.SwalUpsertBroadcastMessage.getBroadcastError,
				UpsertBroadcastConstants.SwalUpsertBroadcastMessage.iconError
			);
		}
	};
	const getRecipientStatusProgressView = async () => {
		let request: GetBroadcastConfigurationRecipientsStatusProgressByIdRequest = {
			broadcastConfigurationId: Number(id),

			queueId: Guid.create().toString(),
			userId: userAccessId.toString(),
		};

		setTimeout(() => {
			const messagingHubView = hubConnection.createHubConnenction();
			messagingHubView.start().then(() => {
				if (messagingHubView.state !== HubConnected) {
					return;
				}
				processGetRecipientStatusProgressView(request, messagingHubView);
			});
		}, 1000);
	};
	const processGetRecipientStatusProgressView = async (
		request: GetBroadcastConfigurationRecipientsStatusProgressByIdRequest,
		messagingHubView: any
	) => {
		try {
			const responseGetBroadcastConfigurationRecipientsStatusProgressById = await GetBroadcastConfigurationRecipientsStatusProgressById(request);

			if (responseGetBroadcastConfigurationRecipientsStatusProgressById.status === successResponse) {
				messagingHubView.on(request.queueId.toString(), async (message: any) => {
					try {
						const returnData = await GetBroadcastConfigurationRecipientsStatusProgressByIdResult(message.cacheId);

						if (returnData.status !== successResponse) {
							swal(
								UpsertBroadcastConstants.SwalUpsertBroadcastMessage.titleFailed,
								UpsertBroadcastConstants.SwalUpsertBroadcastMessage.getBroadcastProgressError,
								UpsertBroadcastConstants.SwalUpsertBroadcastMessage.iconError
							);
						} else {
							let resultData = returnData.data as GetBroadcastConfigurationRecipientsStatusProgressByIdResponse;
							console.log('processGetRecipientStatusProgress', resultData);
							setTotal(resultData.total);
							setTotalDelivered(resultData.totalDelivered);
							setTotalNotDelivered(resultData.totalNotDelivered);
							setTotalPending(resultData.totalPending);
							setBroadcastStatusId(resultData.broadcastStatusId);
							setBroadcastStatus(resultData.broadcastStatus);

							if (resultData.totalPending == 0) clearInterval(interval);
						}
						messagingHubView.off(request.queueId.toString());
						messagingHubView.stop();
						setLoading(false);
					} catch {
						setLoading(false);
						swal(
							UpsertBroadcastConstants.SwalUpsertBroadcastMessage.titleFailed,
							UpsertBroadcastConstants.SwalUpsertBroadcastMessage.getBroadcastProgressError,
							UpsertBroadcastConstants.SwalUpsertBroadcastMessage.iconError
						);
					}
				});
			} else {
				setLoading(false);
				swal(
					UpsertBroadcastConstants.SwalUpsertBroadcastMessage.titleFailed,
					UpsertBroadcastConstants.SwalUpsertBroadcastMessage.getBroadcastProgressError,
					UpsertBroadcastConstants.SwalUpsertBroadcastMessage.iconError
				);
			}
		} catch {
			setLoading(false);
			swal(
				UpsertBroadcastConstants.SwalUpsertBroadcastMessage.titleFailed,
				UpsertBroadcastConstants.SwalUpsertBroadcastMessage.getBroadcastProgressError,
				UpsertBroadcastConstants.SwalUpsertBroadcastMessage.iconError
			);
		}
	};
	const onChangeBroadcastDateView = (val: any) => {
		setSelectedBroadcastDate(val);
	};

	const onViewEditClick = () => {
		window.location.href = `/campaign-management/edit-broadcast/${id}`;
	};
	const onCancelBroadcastEditClickView = () => {
		swal({
			title: UpsertBroadcastConstants.SwalUpsertBroadcastMessage.titleConfirmation,
			text: UpsertBroadcastConstants.SwalUpsertBroadcastMessage.cancelBroadcast, //'',
			icon: UpsertBroadcastConstants.SwalUpsertBroadcastMessage.iconWarning,
			buttons: ['No', 'Yes'],
			dangerMode: true,
		}).then(async (willUpdate) => {
			if (willUpdate) {
				const isSuccess = await cancelBroadcastView(+id, userAccessId);
				if (isSuccess) {
					setBroadcastStatusId(UpsertBroadcastConstants.BroadcastStatusInCanceledId);
				} else {
					swal(
						UpsertBroadcastConstants.SwalUpsertBroadcastMessage.titleFailed,
						UpsertBroadcastConstants.SwalUpsertBroadcastMessage.cancelBroadcastError,
						UpsertBroadcastConstants.SwalUpsertBroadcastMessage.iconError
					);
				}
			}
		});
	};
	const cancelBroadcastView = async (broadcastConfigurationId: number, userId: number) => {
		let isSuccess = true;
		await CancelBroadcast(broadcastConfigurationId, userId).then((response) => {
			if (response.status === successResponse) {
				isSuccess = response.data;
			} else isSuccess = false;
		});
		return isSuccess;
	};
	const cancelButton = (
		<>
			{isEnableCancelBroadcast && (
				<MlabButton
					access={userAccess.includes(USER_CLAIMS.UpdateTelegramBotWrite)}
					size='sm'
					label='Cancel Broadcast'
					style={ElementStyle.danger}
					type='button'
					weight='solid'
					disabled={false}
					onClick={onCancelBroadcastEditClickView}
				/>
			)}
		</>
	);

	const toolbarOptions = [['bold', 'italic', 'underline', 'strike'], ['blockquote'], ['emoji']];

	return (
		<MainContainer>
			<FormHeader headerLabel={UpsertBroadcastConstants.HeaderView} additionalElements={cancelButton} additionalElementPlacement={'left'} />
			<ContentContainer>
				<FormContainer onSubmit={() => {}}>
					<MainContainer>
						<FormGroupContainer>
							<div className='row' style={{zIndex: 2}}>
								<div className='col-lg-2 mt-1'>
									<RequiredLabel title={'Broadcast Name'} />
									<input type='textbox' className='form-control form-control-sm' aria-label='Trigger' value={broadcastName} disabled={true} />
								</div>
								<div className='col-lg-2 mt-1'>
									<RequiredLabel title={'Broadcast ID'} />
									<input type='textbox' className='form-control form-control-sm' aria-label='Trigger' value={broadcastId} disabled={true} />
								</div>
								<div className='col-lg-2 mt-1'>
									<RequiredLabel title={'Broadcast Status'} />
									<input type='textbox' className='form-control form-control-sm' aria-label='Trigger' value={broadcastStatus} disabled={true} />
								</div>
								<div className='col-lg-2 mt-1'>
									<RequiredLabel title={'Broadcast Date'} />
									<DatePicker
										dateFormat='yyyy-MM-dd HH:mm:ss'
										selected={selectedBroadcastDate}
										onChange={onChangeBroadcastDateView}
										className='form-control form-control-sm'
										timeFormat='HH:mm'
										placeholderText='Broadcast Date'
										disabled={true}
										minDate={moment().toDate()}
										timeIntervals={1}
										showTimeSelect
									/>
								</div>
								<div className='col-lg-2 mt-1'>
									<BasicFieldLabel title={'Message Type'} />
									<Select
										style={{width: '100%'}}
										options={messageTypeOptions}
										onChange={handleMessageTypeOptionChange}
										value={selectedMessageTypeOption}
										isDisabled={true}
									/>
								</div>
							</div>
							<div className='row'>
								<div className='col-lg-12 mt-1'>
									<BasicFieldLabel title={'Attachment'} />
									<br />
									<img src={imageData.base64textString} alt={imageData.imageName} width='10%' />
								</div>
							</div>
							<div className='row'>
								<div className='col-lg-12 mt-1'>
									<RequiredLabel title={'Message'} />
								</div>
							</div>
							<div className='row mt-1'>
								<div className='col-lg-6 mt-1'>
									<br />
									<div className='mt-5'>
										<MLabQuillEditor
											isUploadToMlabStorage={false}
											uploadToMlabStorage={undefined}
											isReadOnly={true}
											quillValue={convertedContent}
											setQuillValue={(content: string) => {
												handleMessageEditorChange(content);
											}}
											hasImageToEditor={false}
											toolbarPropsOptions={toolbarOptions}
										/>
									</div>
								</div>
							</div>
							<div className='row mt-5' style={{border: '1px solid #e9ecef', marginLeft: '10px', marginRight: '10px'}}>
								<div className='col-lg-4 mt-3'>
									<h6>Recipients</h6>
								</div>

								<div className='col-lg-8 mt-3'>
									<FontAwesomeIcon
										style={{float: 'right', cursor: 'hand'}}
										icon={recipientToggle ? faMinusSquare : faPlusSquare}
										onClick={onClickEligibilityToggle}
									/>
								</div>
							</div>
							<div className='row pb-15' style={recipientToggle ? {} : styleHideDetails}>
								<div className='row pb-15'>
									<div className='col-lg-1 mt-1'>
										<ViewLabel title='Total Recipient' />
										<h6>{total}</h6>
									</div>
									<div className='col-lg-1 mt-1'>
										<ViewLabel title='Total Pending' />
										<h6>{totalPending}</h6>
									</div>
									<div className='col-lg-1 mt-1'>
										<ViewLabel title='Total Delivered' />
										<h6>{totalDelivered}</h6>
									</div>
									<div className='col-lg-2 mt-1'>
										<ViewLabel title='Total Not Delivered' />
										<h6>{totalNotDelivered}</h6>
									</div>
								</div>

								<GridWithLoaderAndPagination
									gridRef={gridRef}
									rowData={viewBroadcastConfigurationRecipients}
									columnDefs={columnDefs}
									sortColumn={sortColumn}
									sortOrder={sortOrder}
									isLoading={loading}
									height={500}
									onSortChanged={(e: any) => onViewSort(e)}
									//pagination details
									recordCount={recordCount}
									currentPage={currentPage}
									pageSize={pageSize}
									onClickFirst={onViewPaginationClickFirst}
									onClickPrevious={onViewPaginationClickPrevious}
									onClickNext={onViewClickNext}
									onClickLast={onViewClickLast}
									onPageSizeChanged={onPageSizeChanged}
								></GridWithLoaderAndPagination>
							</div>
						</FormGroupContainer>
						<FormGroupContainer>
							<div className='row'>
								<div className='col-lg-12 mt-1'>
									<button
										type='button'
										className='btn btn-primary btn-sm me-2'
										onClick={onViewEditClick}
										disabled={broadcastStatusId != UpsertBroadcastConstants.BroadcastStatusId}
									>
										Edit Broadcast
									</button>
								</div>
							</div>
						</FormGroupContainer>
					</MainContainer>
				</FormContainer>
			</ContentContainer>
		</MainContainer>
	);
};
export default ViewBroadcast;
