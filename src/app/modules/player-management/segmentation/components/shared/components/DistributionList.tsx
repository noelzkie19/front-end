import {faFileExport} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {Guid} from 'guid-typescript';
import moment from 'moment';
import React, {useEffect, useRef, useState} from 'react';
import {shallowEqual, useSelector} from 'react-redux';
import {useHistory, useParams} from 'react-router-dom';
import swal from 'sweetalert';
import {RootState} from '../../../../../../../setup';
import * as hubConnection from '../../../../../../../setup/hub/MessagingHub';
import {ElementStyle} from '../../../../../../constants/Constants';
import useConstant from '../../../../../../constants/useConstant';
import {ContentContainer, FormGroupContainer, GridWithLoaderAndPagination, MainContainer, MlabButton} from '../../../../../../custom-components';
import {usePromptOnUnload} from '../../../../../../custom-helpers';
import {IAuthState} from '../../../../../auth';
import {USER_CLAIMS} from '../../../../../user-management/components/constants/UserClaims';
import {SegmentDistributionByFilterRequestModel, SegmentDistributionUdtModel, SegmentSaveRequestModel} from '../../../models';
import {SegmentVarianceModel} from '../../../models/SegmentVarianceModel';
import {
	exportDistributionToCsv,
	GetSegmentDistributionByFilter,
	SendGetSegmentDistributionByFilter,
	upsertSegment,
} from '../../../redux/SegmentationService';
import useSegmentConstant from '../../../useSegmentConstant';
import {useTestSegment, useValidateConditions} from '../hooks';
import SegmentDistributionStatus from './SegmentDistributionStatus';
import {Variance} from './Variance';

const noDistributionStyle = {
	fontStyle: 'italic',
	color: '#818181',
};

interface Props {
	segmentTabType?: any;
	segmentInputType?: any;
	segmentObjectName?: any;
	segmentObjectDesc?: any;
	setSegmentObjectVarianceList?: any;
	segmentObjectVarianceList?: any;
	segmentObjectStatus?: any;
	segmentObjectQuery?: any;
	segmentObjectInFilePlayerIds?: any;
	segmentObjectConditions?: any;
	segmentObjectQueryJoins?: any;
	segmentObjectRespVarianceList?: any;
	segmentObjectIsReactivated?: any;
	segmentObjectQueryTableau?: any;
	segmentObjectCustomQuery?: any;
}

const DistributionList: React.FC<Props> = ({
	segmentTabType,
	segmentInputType,
	segmentObjectName,
	segmentObjectDesc,
	setSegmentObjectVarianceList,
	segmentObjectVarianceList,
	segmentObjectStatus,
	segmentObjectQuery,
	segmentObjectInFilePlayerIds,
	segmentObjectConditions,
	segmentObjectQueryJoins,
	segmentObjectRespVarianceList,
	segmentObjectIsReactivated,
	segmentObjectQueryTableau,
	segmentObjectCustomQuery,
}) => {
	const gridRef: any = useRef();
	const {PageAction, SwalConfirmMessage, SegmentInputTypes} = useSegmentConstant();
	const {actionName, segmentId} = useParams();
	const history = useHistory();

	// Hooks
	const {HubConnected, successResponse} = useConstant();
	const {validateConditions, validateTestSegment, validateCustomQuery, validateRequiredFields} = useValidateConditions();
	usePromptOnUnload(actionName !== PageAction.VIEW, 'Changes you made may not be saved.');
	const {handleTestSegment} = useTestSegment();
	//	States
	const [playerList, setPlayerList] = useState<Array<SegmentDistributionUdtModel>>([]);
	const [pageSize, setPageSize] = useState<number>(10);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [recordCount, setRecordCount] = useState<number>(0);
	const [sortOrder, setSortOrder] = useState<string>('ASC');
	const [sortColumn, setSortColumn] = useState<string>('PlayerId');
	const [loading, setLoading] = useState(false);
	const [exportLoading, setExportLoading] = useState(false);
	const [varianceList, setVarianceList] = useState<Array<SegmentVarianceModel>>([]);
	const [exportRecordCount, setExportRecordCount] = useState<number>(0);

	const [playerId, setPlayerId] = useState<string>('');
	const [userName, setUserName] = useState<string>('');
	const [varianceName, setVarianceName] = useState<string>('');

	//	Redux
	const {userId, access} = useSelector<RootState>(({auth}) => auth, shallowEqual) as IAuthState;

	const includedInCampaignId = 27;

	// Mount
	useEffect(() => {
		getSegmentDistributionByFilter(pageSize, currentPage, sortColumn, sortOrder);
	}, [segmentId]);

	useEffect(() => {
		setSegmentObjectVarianceList(varianceList);
	}, [varianceList]);

	//	Grid and Pagination
	useEffect(() => {
		if (!loading && playerList.length === 0) {
			if (document.getElementById('mlab-grid-loading-overlay') as HTMLInputElement) {
				(document.getElementById('mlab-grid-loading-overlay') as HTMLInputElement).innerText = 'No Rows To Show';
			}
		} else {
			if (document.getElementById('mlab-grid-loading-overlay') as HTMLInputElement) {
				(document.getElementById('mlab-grid-loading-overlay') as HTMLInputElement).innerText = 'Please wait while your items are loading';
			}
		}
	}, [loading]);

	const handleSearchDistribution = () => {
		gridRef.current.columnApi.resetColumnState();
		setCurrentPage(1);
		getSegmentDistributionByFilter(pageSize, 1, 'playerId', 'ASC');
	};

	const onPageSizeChanged = () => {
		let value: string = (document.getElementById('page-size-distribution') as HTMLInputElement).value;

		setPageSize(Number(value));
		setCurrentPage(1);

		if (playerList != undefined && playerList.length > 0) {
			getSegmentDistributionByFilter(Number(value), 1, sortColumn, sortOrder);
		}
	};

	const onClickFirst = () => {
		if (currentPage > 1) {
			setCurrentPage(1);
			getSegmentDistributionByFilter(pageSize, 1, sortColumn, sortOrder);
		}
	};

	const onClickPrevious = () => {
		if (currentPage > 1) {
			setCurrentPage(currentPage - 1);
			getSegmentDistributionByFilter(pageSize, 1, sortColumn, sortOrder);
		}
	};

	const onClickNext = () => {
		if (totalPage() > currentPage) {
			setCurrentPage(currentPage + 1);
			getSegmentDistributionByFilter(pageSize, currentPage + 1, sortColumn, sortOrder);
		}
	};

	const onClickLast = () => {
		if (totalPage() > currentPage) {
			setCurrentPage(totalPage());
			getSegmentDistributionByFilter(pageSize, totalPage(), sortColumn, sortOrder);
		}
	};

	const totalPage = () => {
		return Math.ceil(recordCount / pageSize) | 0;
	};

	const onSort = (e: any) => {
		setCurrentPage(1);

		if (playerList != undefined && playerList.length > 0) {
			let sortDetail: any = e.api.getSortModel();
			if (sortDetail[0] != undefined) {
				setSortColumn(sortDetail[0]?.colId);
				setSortOrder(sortDetail[0]?.sort);
				getSegmentDistributionByFilter(pageSize, 1, sortDetail[0]?.colId, sortDetail[0]?.sort);
			} else {
				setSortColumn('');
				setSortOrder('');
				getSegmentDistributionByFilter(pageSize, 1, '', '');
			}
		}
	};

	// API Method
	const getSegmentDistributionByFilter = (_pageSize: number, _currentPage: number, _sortColumn: string, _sortOrder: string) => {
		const request: SegmentDistributionByFilterRequestModel = {
			userId: userId?.toString() === undefined ? '0' : userId?.toString(),
			queueId: Guid.create().toString(),
			userName: userName,
			varianceName: varianceName,
			playerId: playerId,
			pageSize: _pageSize,
			offsetValue: (_currentPage - 1) * _pageSize,
			sortColumn: _sortColumn,
			sortOrder: _sortOrder,
			currentPage: _currentPage,
			segmentId: segmentId,
		};
		setLoading(true);
		setPlayerList([]);
		setTimeout(() => {
			const messagingHub = hubConnection.createHubConnenction();
			messagingHub
				.start()
				.then(() => {
					if (messagingHub.state === HubConnected) {
						SendGetSegmentDistributionByFilter(request)
							.then((response) => {
								if (response.status === successResponse) {
									messagingHub.on(request.queueId.toString(), (message) => {
										GetSegmentDistributionByFilter(message.cacheId)
											.then((data) => {
												console.log('segment data load');
												console.log(data);

												setPlayerList(data.data.segmentDistributions);
												setRecordCount(data.data.totalRecordCount);

												setExportRecordCount(data.data.totalRecordCount);
												setLoading(false);
												messagingHub.off(request.queueId.toString());
												messagingHub.stop();
											})
											.catch(() => {
												setLoading(false);
											});
									});

									setTimeout(() => {
										if (messagingHub.state === HubConnected) {
											messagingHub.stop();
										}
									}, 30000);
								} else {
									messagingHub.stop();
									setLoading(false);
								}
							})
							.catch(() => {
								setLoading(false);
							});
					}
				})
				.catch(() => {
					messagingHub.stop();
					setLoading(false);
				});
		}, 1000);
	};

	const columnDefs = [
		{headerName: 'No', valueGetter: ('node.rowIndex + 1 + ' + (currentPage - 1) * pageSize).toString(), sortable: false, width: 80},
		{headerName: 'Player Id', field: 'playerId'},
		{headerName: 'Username', field: 'userName'},
		{headerName: 'Brand', field: 'brandName'},
		{headerName: 'Currency', field: 'currencyName'},
		{headerName: 'VIP Level', field: 'vipLevelName'},
		{headerName: 'Account Status', field: 'accountStatus'},
		{
			headerName: 'Registration Date',
			field: 'registrationDate',
			cellRenderer: (params: any) =>
				params.data.registrationDate && params.data.registrationDate !== null
					? moment(params.data.registrationDate).format('DD-MM-YYYY hh:mm:ss').toString()
					: '',
		},
		{headerName: 'Variance Name', field: 'varianceName'},
	];

	//	Export
	const handleDistributionExport = () => {
		setExportLoading(true);
		const request: SegmentDistributionByFilterRequestModel = {
			userId: userId?.toString() === undefined ? '0' : userId?.toString(),
			queueId: Guid.create().toString(),
			userName: userName,
			varianceName: varianceName,
			playerId: playerId,
			pageSize: exportRecordCount,
			offsetValue: 0,
			sortColumn: 'PlayerId',
			sortOrder: 'ASC',
			currentPage: 1,
			segmentId: segmentId,
		};
		setExportLoading(true);
		exportDistributionToCsv(request)
			.then((response) => {
				const url = window.URL.createObjectURL(new Blob([response.data]));
				const link = document.createElement('a');
				link.href = url;
				link.setAttribute('download', 'Variance_Distribution.csv');
				document.body.appendChild(link);
				link.click();
				setExportLoading(false);
			})
			.catch(() => {
				setExportLoading(false);
				swal('Failed', 'Problem in getting variance distribution list', 'error');
			});
	};

	// Local Components
	const SaveSegmentBtn = () => (
		<MlabButton
			access={access?.includes(USER_CLAIMS.SegmentationWrite)}
			size={'sm'}
			label={'Save Segment'}
			style={ElementStyle.primary}
			type={'button'}
			weight={'solid'}
			loading={loading}
			disabled={loading}
			loadingTitle={' Please wait...'}
			onClick={() => {
				saveSegment();
			}}
		/>
	);

	const redirectToEditSegment = (_segmentId: any) => {
		history.push('/player-management/segment/edit/' + _segmentId);
	};

	const EditSegmentBtn = () => (
		<MlabButton
			access={access?.includes(USER_CLAIMS.SegmentationWrite)}
			size={'sm'}
			label={'Edit Segment'}
			style={ElementStyle.primary}
			type={'button'}
			weight={'solid'}
			loadingTitle={' Please wait...'}
			onClick={() => {
				redirectToEditSegment(segmentId);
			}}
			disabled={segmentObjectStatus || (!segmentObjectStatus && segmentObjectIsReactivated)}
		/>
	);

	const saveSegment = async () => {
		let isSaveAddDistValid = true;

		isSaveAddDistValid = await validateRequiredFields(
			segmentInputType,
			segmentObjectName,
			segmentObjectDesc,
			segmentTabType,
			segmentObjectRespVarianceList,
			segmentId
		);

		// Validate condition if InputType = Condition
		if (isSaveAddDistValid && segmentInputType && segmentInputType === SegmentInputTypes.Condition) {
			isSaveAddDistValid = validateConditions(segmentObjectConditions);
		}

		// Validate custom query string if InputType = Custom Query
		if (isSaveAddDistValid && segmentInputType && segmentInputType === SegmentInputTypes.CustomQuery) {
			isSaveAddDistValid = await validateCustomQuery(segmentObjectCustomQuery);
		}

		if (isSaveAddDistValid) {
			const validateTestUponCreateSegment =
				segmentInputType && segmentInputType.value === SegmentInputTypes.Condition ? validateTestSegment(undefined, segmentObjectConditions) : false;

			if (validateTestUponCreateSegment) {
				handleTestSegment(10, 1, sortColumn, sortOrder, '', '', confirmSaveDistSegment, true);
			} else {
				confirmSaveDistSegment(SwalConfirmMessage.textSaveChannel);
			}
		}
	};

	const confirmSaveDistSegment = (confirmationMessage?: string) => {
		swal({
			title: SwalConfirmMessage.title,
			text: confirmationMessage !== undefined ? confirmationMessage : SwalConfirmMessage.textSaveChannel,
			icon: SwalConfirmMessage.icon,
			buttons: [SwalConfirmMessage.btnNo, SwalConfirmMessage.btnYes],
			dangerMode: true,
		}).then((onConfirm) => {
			if (onConfirm) {
				saveValidatedData();
			}
		});
	};

	const saveValidatedData = () => {
		setTimeout(() => {
			const messagingHub = hubConnection.createHubConnenction();
			messagingHub
				.start()
				.then(() => {
					if (messagingHub.state === HubConnected) {
						let segmentRequest: SegmentSaveRequestModel = {
							segmentId: actionName === PageAction.EDIT ? segmentId : 0, //add condition for edit
							segmentName: segmentObjectName,
							segmentDescription: segmentObjectDesc,
							isActive: segmentObjectStatus,
							isStatic: false,
							staticParentId: undefined,
							queryForm: segmentObjectQuery,
							segmentConditions: segmentObjectConditions,
							segmentTypeId: segmentTabType ? parseInt(segmentTabType) : undefined,
							queueId: Guid.create().toString(),
							userId: userId !== null && userId !== undefined ? userId.toString() : '',
							segmentVariances: segmentObjectRespVarianceList,
							InFileSegmentPlayer: segmentObjectInFilePlayerIds,
							queryJoins: segmentObjectQueryJoins,
							isReactivated: segmentObjectIsReactivated,
							queryFormTableau: segmentInputType === SegmentInputTypes.CustomQuery ? segmentObjectCustomQuery : segmentObjectQueryTableau,
							inputTypeId: segmentInputType,
						};

						upsertSegment(segmentRequest)
							.then((response) => {
								if (response.status === successResponse) {
									messagingHub.on(segmentRequest.queueId.toString(), (message) => {
										let resultData = JSON.parse(message.remarks);

										if (resultData.Status === successResponse) {
											let segmentIdSaved = resultData.Data;
											setLoading(false);
											swal('Successful!', 'Successfully saved the template', 'success').then((onSaveConfirm) => {
												if (onSaveConfirm) {
													setPlayerList([]);
													setRecordCount(0);
													redirectToViewSegment(segmentIdSaved);
												}
											});
										} else {
											swal('Failed', 'Problem connecting to the server, Please refresh', 'error');
										}

										messagingHub.off(segmentRequest.queueId.toString());
										messagingHub.stop();
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
									swal('Failed', response.data.message, 'error');
									setLoading(false);
								}
							})
							.catch((err) => {
								setLoading(false);
								messagingHub.stop();
								console.log('Error while starting connection: ' + err);
							});
					}
				})
				.catch((err) => console.log('Error while starting connection: ' + err));
			setLoading(false);
		}, 1000);
	};

	const redirectToViewSegment = (segmentId: any) => {
		history.push('/player-management/segment/view/' + segmentId);
	};

	return (
		<MainContainer>
			<ContentContainer>
				<FormGroupContainer>
					<div className='col-lg-6 variance-section'>
						<Variance
							disable={actionName === PageAction.VIEW}
							setVarianceList={setVarianceList}
							segmentObjectRespVarianceList={segmentObjectRespVarianceList}
						/>
					</div>

					<div className='col-lg-6'>
						<SegmentDistributionStatus isActive={segmentObjectStatus} showIcon={true} isReactivated={segmentObjectIsReactivated} />
					</div>
				</FormGroupContainer>
				<div className='separator separator-dashed my-5'></div>
				{!segmentObjectStatus && !segmentObjectIsReactivated && (
					<div style={noDistributionStyle} className='mt-5 mb-20'>
						*Variance per player not yet assigned. To do this, activate the segment status in Manage Segments Page.
					</div>
				)}
				{(segmentObjectStatus || segmentObjectIsReactivated) && actionName === PageAction.VIEW && (
					<>
						<FormGroupContainer>
							<div className='col-lg-2'>
								<label className=' col-form-label col-sm '>Player Id</label>
								<input
									type='text'
									value={playerId}
									onChange={(e) => setPlayerId(e.target.value)}
									autoComplete='off'
									className='form-control form-control-sm'
									disabled={false}
								/>
							</div>

							<div className='col-lg-3'>
								<label className='col-form-label col-sm '>Username</label>
								<input
									type='text'
									value={userName}
									onChange={(e) => setUserName(e.target.value)}
									autoComplete='off'
									className='form-control form-control-sm'
									disabled={false}
								/>
							</div>

							<div className='col-lg-3'>
								<label className='col-form-label col-sm '>Variance Name</label>
								<input
									type='text'
									value={varianceName}
									onChange={(e) => setVarianceName(e.target.value)}
									autoComplete='off'
									className='form-control form-control-sm'
									disabled={false}
								/>
							</div>
						</FormGroupContainer>
						<FormGroupContainer>
							<div className='col mt-5'>
								<MlabButton
									access={access?.includes(USER_CLAIMS.SegmentationRead) || access?.includes(USER_CLAIMS.SegmentationWrite)}
									size={'sm'}
									label={'Search'}
									style={ElementStyle.primary}
									type={'button'}
									weight={'solid'}
									loading={loading}
									disabled={loading}
									loadingTitle={' Please wait...'}
									onClick={() => handleSearchDistribution()}
								/>
							</div>

							<div className='col align-self-end'>
								<button
									disabled={playerList.length === 0}
									className='btn btn-primary btn-sm float-end'
									title={'Export to CSV'}
									type={'button'}
									onClick={() => handleDistributionExport()}
								>
									{exportLoading && (
										<span className='indicator-progress' style={{display: 'block'}}>
											Please wait...
											<span className='spinner-border spinner-border-sm align-middle ms-2'></span>
										</span>
									)}
									{!exportLoading && (
										<>
											<span>
												<FontAwesomeIcon icon={faFileExport} title={'Export'} style={{color: 'white'}} />
											</span>
											&nbsp;Export to CSV
										</>
									)}
								</button>
							</div>
						</FormGroupContainer>

						<FormGroupContainer>
							<div className='ag-theme-quartz pb-15 mb-15' style={{height: '500px', width: '100%', marginTop: '-10px'}}>
								<GridWithLoaderAndPagination
									gridRef={gridRef}
									rowData={playerList}
									columnDefs={columnDefs}
									sortColumn={sortColumn}
									sortOrder={sortOrder}
									isLoading={loading}
									height={500}
									onSortChanged={(e: any) => onSort(e)}
									//pagination details
									recordCount={recordCount}
									currentPage={currentPage}
									pageSize={pageSize}
									onClickFirst={onClickFirst}
									onClickPrevious={onClickPrevious}
									onClickNext={onClickNext}
									onClickLast={onClickLast}
									onPageSizeChanged={onPageSizeChanged}
									customId={'distribution'} //page-size-distribution | optional, for page that has more than one grid with page size selection
								></GridWithLoaderAndPagination>
							</div>
						</FormGroupContainer>
					</>
				)}
				<FormGroupContainer>
					<div className='form-group' style={{position: 'absolute', marginTop: '30px', width: '200px'}}>
						{actionName === PageAction.VIEW ? <EditSegmentBtn /> : <SaveSegmentBtn />}
					</div>
				</FormGroupContainer>
			</ContentContainer>
		</MainContainer>
	);
};

export default DistributionList;
