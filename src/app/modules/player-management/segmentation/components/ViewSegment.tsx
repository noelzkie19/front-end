import { faFileExport } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { AgGridReact } from 'ag-grid-react';
import { Guid } from 'guid-typescript';
import moment from 'moment';
import React, { useEffect, useReducer, useState } from 'react';
import { Button } from 'react-bootstrap';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { shallowEqual, useSelector } from 'react-redux';
import { useHistory, useParams } from 'react-router-dom';
import Select from 'react-select';
import swal from 'sweetalert';
import { CustomQueryView, SegmentDistributionStatus } from '.';
import { RootState } from '../../../../../setup';
import * as hubConnection from '../../../../../setup/hub/MessagingHub';
import { MasterReferenceOptionListModel, MasterReferenceOptionModel } from '../../../../common/model';
import { GetMasterReferenceList } from '../../../../common/services';
import { ElementStyle, HttpStatusCodeEnum } from '../../../../constants/Constants';
import useConstant from '../../../../constants/useConstant';
import { ContentContainer, DefaultGridPagination, FormGroupContainer, MainContainer, MlabButton } from '../../../../custom-components';
import { LookupModel } from '../../../../shared-models/LookupModel';
import { IAuthState } from '../../../auth';
import { USER_CLAIMS } from '../../../user-management/components/constants/UserClaims';
import { InFileSegmentPlayerModel, PlayerModel, SegmentTestRequestModel } from '../models';
import { SegmentVarianceModel } from '../models/SegmentVarianceModel';
import { ISegmentationState } from '../redux/SegmentationRedux';
import { exportToCsv, getSegmentById, testSegment, testSegmentResult } from '../redux/SegmentationService';
import useSegmentConstant from '../useSegmentConstant';
import { initialSegmentState, segmentReducer } from '../utils/SegmentState';
import { QueryFormView, SegmentConditions, TestSegment } from './shared/components';
import { useQueryForm, useValidateConditions } from './shared/hooks';
import useSegmentInputTypeOptions from './shared/hooks/useSegmentInputTypeOptions';
import { ColDef, ColGroupDef } from 'ag-grid-community';

interface Props {
	setSegmentTabType?: any;
	selectedSegmentOption?: any;
	setSegmentObjectStatus: (e: any) => void;
	setSegmentObjectVarianceList: (e: any) => void;
	segmentObjectConditions?: any;
	setSegmentObjectInFilePlayerIds?: any;
	setSegmentCondition: (e: any) => void;
	setSegmentObjectQuery: (e: any) => void;
	setSegmentObjectQueryJoins: (e: any) => void;
	setSegmentObjectIsReactivated: (e: any) => void;
}

const ViewSegment: React.FC<Props> = ({
	setSegmentTabType,
	selectedSegmentOption,
	setSegmentObjectStatus,
	setSegmentObjectVarianceList,
	segmentObjectConditions,
	setSegmentObjectQuery,
	setSegmentObjectInFilePlayerIds,
	setSegmentCondition,
	setSegmentObjectQueryJoins,
	setSegmentObjectIsReactivated,
}) => {
	/**
	 * ? Redux
	 */
	const {userId, access} = useSelector<RootState>(({auth}) => auth, shallowEqual) as IAuthState;
	const {isStatic} = useSelector<RootState>(({segment}) => segment, shallowEqual) as ISegmentationState;

	/**
	 *  ? States
	 */
	const [segmentViewInputType, setSegmentViewInputType] = useState<any>(null);
	const [segmentType, setSegmentType] = useState<any>();
	const [segmentStatus, setSegmentStatus] = useState<boolean>();
	const [segmentName, setSegmentName] = useState<string>('');
	const [segmentDescription, setSegmentDescription] = useState<string>('');
	const [queryForm, setQueryForm] = useState<string>('');
	const [loading, setLoading] = useState<boolean>(false);
	const [filterPlayerId, setFilterPlayerId] = useState('');
	const [filterUserName, setFilterUserName] = useState('');
	const [pageSize, setPageSize] = useState<number>(10);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [recordCount, setRecordCount] = useState<number>(0);
	const [sortOrder, setSortOrder] = useState<string>('ASC');
	const [sortColumn, setSortColumn] = useState<string>('PlayerId');
	const [playerList, setPlayerList] = useState<Array<PlayerModel>>([]);
	const [conditionLogic, setConditionLogic] = useState<string>('AND');
	const [exportLoading, setExportLoading] = useState(false);
	const [validRedirect, setValidRedirect] = useState(false);
	const [segmentValueTypeId, setSegmentValueTypeId] = useState<string>('');
	const [segmentConditionInFilePlayersIdList, setSegmentConditionInFilePlayersIdList] = useState<Array<InFileSegmentPlayerModel>>([]);
	const [buttonStyle, setButtonStyle] = useState<any>({});
	const [disableDistributionEdit, setDisableDistributionEdit] = useState(false);
	const [isReactivated, setIsReactivated] = useState<boolean>();
	const [segmentTypeOptionList, setSegmentTypeOptionList] = useState<Array<LookupModel>>([]);
	const [segmentViewInputTypeOptionList, setSegmentViewInputTypeOptionList] = useState<Array<LookupModel>>([]);
	const [tableauEventQueueId, setTableauEventQueueId] = useState('');
	const [queryFormTableauPersisted, setQueryFormTableauPersisted] = useState('');
	const [segmentViewCustomQuery, setSegmentViewCustomQuery] = useState('');
	const [segmentErrorDisplay, setSegmentErrorDisplay] = useState('');
	/**
	 * ? Hooks
	 */
	const [segmentState, dispatch] = useReducer(segmentReducer, {...initialSegmentState});
	const {SegmentTypes, segmentTypeMasterRefId, SegmentInputTypes} = useSegmentConstant();
	const history = useHistory();
	const {segmentId} = useParams();
	const {stringQuery, stringQueryTableau, styledQuery, tableJoins} = useQueryForm(segmentState.segmentConditions);
	const {validateConditions} = useValidateConditions();
	const {getSegmentInputTypeList} = useSegmentInputTypeOptions();
	const {HubConnected, successResponse, SegmentGridColumns} = useConstant();

	/**
	 * ? Mount
	 */
	useEffect(() => {
		getSegmentInfo(segmentId).then().catch(() => { console.log('Problem in getting Segment Information'); });
	}, []);

	const onGridReady = (params: any) => {
		params.api.sizeColumnsToFit();
	};

	/**
	 * ? Events
	 */
	const handleChangeSegmentType = (data: LookupModel) => {
		if (data) {
			setSegmentType(data);
			setSegmentTabType(data.value);
		}
	};

	const handleChangeViewSegmentInputType = (data: LookupModel) => {
		if (data) {
			setSegmentViewInputType(data);
		}
	};

	const _testSegment = () => {
		testSegmentRequest(pageSize, currentPage, sortColumn, sortOrder);
	};

	/**
	 * ? Methods
	 */
	const testSegmentRequest = (_pageSize: number, _currentPage: number, _sortColumn: string, _sortOrder: string) => {
		let searchFilter = '';

		if (filterPlayerId !== '' && filterUserName.trim() !== '') {
			searchFilter = ` AND p.PlayerId = '${filterPlayerId}'` + ` AND p.Username like '%${filterUserName}%'`;
		}

		if (filterPlayerId !== '' && filterUserName.trim() === '') {
			searchFilter = ` AND p.PlayerId = '${filterPlayerId}'`;
		}

		if (filterPlayerId === '' && filterUserName.trim() !== '') {
			searchFilter = ` AND p.Username LIKE '%${filterUserName}%'`;
		}

		
		setLoading(true);
		setTimeout(() => {
			const parsedQueryForm = isStatic === true ? searchFilter : stringQuery + searchFilter;
			const messagingHubSegment = hubConnection.createHubConnenction();
			messagingHubSegment.start().then(() => {
				const request: SegmentTestRequestModel = {
					queryForm: parsedQueryForm,
					userId: userId?.toString() === undefined ? '' : userId?.toString(),
					queueId: Guid.create().toString(),
					pageSize: _pageSize,
					offsetValue: (_currentPage - 1) * _pageSize,
					sortColumn: _sortColumn,
					sortOrder: _sortOrder,
					queryJoins: tableJoins,
					segmentId: searchFilter == '' ? segmentId : undefined,
				};

				testSegment(request)
					.then((response) => {
						if (response.status === HttpStatusCodeEnum.Ok) {
							messagingHubSegment.on(request.queueId.toString(), (message) => {
								testSegmentResult(message.cacheId)
									.then((data) => {
										setPlayerList(data.data.players);
										setRecordCount(data.data.recordCount);
										if (data.data.recordCount === 0) {
											swal('Test Segment', 'No Record Found', 'info');
										}
										setLoading(false);
									})
									.catch(() => {
										setLoading(false);
									});
								messagingHubSegment.off(request.queueId.toString());
								messagingHubSegment.stop();
							});

							setTimeout(() => {
								if (messagingHubSegment.state === HubConnected) {
									messagingHubSegment.stop();
									setLoading(false);
								}
							}, 30000);
						} else {
							messagingHubSegment.stop();
							swal('Failed', response.data.message, 'error');
						}
					})
					.catch(() => {
						messagingHubSegment.stop();
						swal('Failed', 'Problem in getting message type list', 'error');
					});
			});
		}, 1000);
		
	};

	const getSegmentTypeOptionView = async () => {
		let options: Array<LookupModel> = [];
		await GetMasterReferenceList(segmentTypeMasterRefId)
			.then((responseSegment: any) => {
				if (responseSegment.status === successResponse) {
					let masterReferenceList = Object.assign(new Array<MasterReferenceOptionListModel>(), responseSegment.data);

					let tempList = Array<MasterReferenceOptionModel>();

					masterReferenceList
						.filter((x: MasterReferenceOptionListModel) => x.isParent === false)
						.forEach((itemRef: any) => {
							const OptionValue: MasterReferenceOptionModel = {
								masterReferenceParentId: itemRef.masterReferenceParentId,

								options: {label: itemRef.masterReferenceChildName, value: itemRef.masterReferenceId.toString()},
							};
							tempList.push(OptionValue);
						});
					options = tempList.flatMap((x) => x.options);
					setSegmentTypeOptionList(tempList.flatMap((x) => x.options));
				} else {
					console.log('Problem in master reference list');
				}
			})
			.catch(() => {
				console.log('Problem in master reference list');
			});
		return options;
	};

	const getSegmentInfo = async (_segmentId: number) => {
		const segmentTypeOptionsData = await getSegmentTypeOptionView();
		const inputTypeOptionsViewData = await getSegmentInputTypeList();
		setSegmentTypeOptionList(segmentTypeOptionsData);
		setSegmentViewInputTypeOptionList(inputTypeOptionsViewData);

		setLoading(true);
		getSegmentById(_segmentId)
			.then((response) => {
				if (response.status === HttpStatusCodeEnum.Ok) {
					assignSegmentInfo(response.data, segmentTypeOptionsData,inputTypeOptionsViewData, _segmentId)

					
				} else {
					swal('Failed', response.data.message, 'error');
				}
				setLoading(false);
			})
			.catch(() => {
				swal('Failed', 'Problem in getting Segment record', 'error');
				setLoading(false);
			});
	};

	const assignSegmentInfo = (responseData: any, segmentTypeOptionsData: any, inputTypeOptionsViewData: any, _segmentId: any) => {
		const data = Object.assign(responseData);
		setSegmentErrorDisplay('');

		//local state
		setSegmentTabType(data.segmentTypeId);
		setSegmentName(data.segmentName);
		setSegmentDescription(data.segmentDescription);
		setSegmentStatus(data.isActive);
		setDisableDistributionEdit(data.isActive && data.segmentTypeId.toString() === SegmentTypes.Distribution);
		setIsReactivated(data.isReactivated);
		setTableauEventQueueId(data.tableauEventQueueId);
		setQueryFormTableauPersisted(data.queryFormTableau);
		setSegmentViewCustomQuery(data.queryFormTableau);

		setSegmentType(segmentTypeOptionsData.filter((x: any) => x.value === data.segmentTypeId.toString()));
		if (data.segmentTypeId.toString() === SegmentTypes.Distribution) setButtonStyle({position: 'absolute', marginTop: '30px', width: '200px'});

		setSegmentViewInputType(inputTypeOptionsViewData.find((x: any) => x.value === data.inputTypeId.toString()));
		//parent state
		setSegmentObjectStatus(data.isActive);
		setSegmentValueTypeId(data.segmentTypeId.toString());
		setSegmentObjectInFilePlayerIds(data.InFileSegmentPlayer);
		setSegmentObjectVarianceList(data.segmentVariances);
		setSegmentObjectQueryJoins(data.queryJoins);
		setSegmentObjectIsReactivated(data.isReactivated);

		if (data.playerId == -2)
		{
			setSegmentErrorDisplay('Tableau query encountered syntax error.');
		}
		if (data.playerId == -3)
		{
			setSegmentErrorDisplay('Tableau query result exceeds 100K players. You may add new parameters to filter the number of records.');
		}

		const segmentVariances = data.segmentVariances.map((item: SegmentVarianceModel) => {
			const segmentVarianceList = {
				segmentId: _segmentId,
				varianceId: item.varianceId,
				varianceName: item.varianceName,
				percentage: item.percentage,
				isActive: item.isActive,
				createdBy: item.createdBy,
				updatedBy: item.updatedBy,
			};
			return segmentVarianceList;
		});

		const defaultSelectedCondition = data.segmentConditions.find((i: any) => i.parentKey === null);
		if (defaultSelectedCondition) {
			setConditionLogic(defaultSelectedCondition.segmentConditionLogicOperator);
		}
	}

	/**
	 * ? Table Events
	 */
	const searchResult = () => {
		if (playerList.length > 0) {
			setCurrentPage(1);
			testSegmentRequest(pageSize, 1, sortColumn, sortOrder);
		}
	};

	const onPageSizeChanged = () => {
		let value: string = (document.getElementById('page-size') as HTMLInputElement).value;
		setPageSize(Number(value));
		setCurrentPage(1);

		if (playerList != undefined && playerList.length > 0) {
			testSegmentRequest(Number(value), 1, sortColumn, sortOrder);
		}
	};

	const onViewClickFirst = () => {
		if (currentPage > 1) {
			setCurrentPage(1);
			testSegmentRequest(pageSize, 1, sortColumn, sortOrder);
		}
	};

	const onViewClickPrevious = () => {
		if (currentPage > 1) {
			setCurrentPage(currentPage - 1);
			testSegmentRequest(pageSize, currentPage - 1, sortColumn, sortOrder);
		}
	};

	const onViewClickNext = () => {
		if (totalPage() > currentPage) {
			setCurrentPage(currentPage + 1);
			testSegmentRequest(pageSize, currentPage + 1, sortColumn, sortOrder);
		}
	};

	const onViewClickLast = () => {
		if (totalPage() > currentPage) {
			setCurrentPage(totalPage());
			testSegmentRequest(pageSize, totalPage(), sortColumn, sortOrder);
		}
	};

	const totalPage = () => {
		return Math.ceil(recordCount / pageSize) | 0;
	};

	const columnViewSegmentDefs : (ColDef<PlayerModel> | ColGroupDef<PlayerModel>)[] = [
		{headerName: SegmentGridColumns.headerNumber, valueGetter: (`node.rowIndex + 1 + ` + (currentPage - 1) * pageSize).toString(), sortable: false, width: 60},	//row number ctr
		{headerName: SegmentGridColumns.headerPlayerId, field: `playerId`},	
		{headerName: SegmentGridColumns.headerUsername, field: 'userName'},
		{headerName: SegmentGridColumns.headerBrand, field: 'brandName'},	
		{headerName: SegmentGridColumns.headerCurrency, field: 'currencyName'},
		{headerName: SegmentGridColumns.headerVIPLevel, field: 'vipLevelName'},
		{headerName: SegmentGridColumns.headerAccountStatus, field: 'accountStatus'},
		{
			headerName: 'Registration Date',
			field: 'registrationDate',
			cellRenderer: (params: any) =>
				params.data.registrationDate && params.data.registrationDate !== null
					? moment(params.data.registrationDate).format('DD-MM-YYYY hh:mm:ss').toString()
					: '',
		},
	];
	
	const onSort = (e: any) => {
		setCurrentPage(1);

		if (playerList != undefined && playerList.length > 0) {
			let sortDetail = e.api.getSortModel();
			if (sortDetail[0] != undefined) {
				setSortColumn(sortDetail[0]?.colId);
				setSortOrder(sortDetail[0]?.sort);
				testSegmentRequest(pageSize, 1, sortDetail[0]?.colId, sortDetail[0]?.sort);
			} else {
				setSortColumn('');
				setSortOrder('');
				testSegmentRequest(pageSize, currentPage, '', '');
			}
		}
	};

	


	/**
	 *  ? Local Components
	 */
	const SegmentSection = () => (
		<>
			<div className='col-lg-3'>
				<label className='col-form-label required'>Segment Type</label>
				<Select
					autoComplete='off'
					size='small'
					style={{width: '100%'}}
					className='right'
					options={segmentTypeOptionList}
					onChange={handleChangeSegmentType}
					value={segmentType}
					isDisabled={true}
				/>
			</div>
			
		</>
	);

	const Separator = () => <div className='separator separator-dashed my-5'></div>;

	const SaveSegmentBtn = () => (
		<>
			<FormGroupContainer>
				<div className='col-lg-2' style={buttonStyle}>
					<MlabButton
						access={access?.includes(USER_CLAIMS.SegmentationWrite)}
						size={'sm'}
						label={'Edit Segment'}
						style={ElementStyle.primary}
						type={'button'}
						weight={'solid'}
						loading={loading}
						disabled={loading || disableDistributionEdit || (!segmentStatus && isReactivated)}
						loadingTitle={' Please wait...'}
						onClick={() => redirectToEditSegment(segmentId)}
					/>
				</div>
			</FormGroupContainer>
		</>
	);

	const TestSegmentBtn = () => (
		<FormGroupContainer>
			<div className='col-lg-2 mt-3'>
				<TestSegment
					loading={loading}
					queryForm={queryForm}
					segmentConditions={segmentState.segmentConditions}
					testSegment={_testSegment}
					tableauEventQueueId={tableauEventQueueId}
					queryFormTableauCurrent={stringQueryTableau}
					queryFormTableauPersisted={queryFormTableauPersisted}
					segmentInputType={segmentViewInputType}
				/>
			</div>
			<label className='col-lg-8 mt-2 form-label-sm' style={{color: 'red'}}>
				{segmentErrorDisplay}
			</label>
		</FormGroupContainer>
	);

	const PlayerListgrid = () => (
		<FormGroupContainer>
			<div className='ag-theme-quartz' style={{height: 400, width: '100%', marginBottom: '50px'}}>
				<AgGridReact
					rowData={playerList}
					defaultColDef={{
						sortable: true,
						resizable: true,
					}}
					onGridReady={onGridReady}
					rowBuffer={0}
					//enableRangeSelection={true} //deprecated in AgGridReactver.32.0.0
					pagination={false}
					paginationPageSize={pageSize}
					columnDefs={columnViewSegmentDefs}
					onSortChanged={(e) => onSort(e)}
				/>

				{/* </AgGridReact> */}
				<DefaultGridPagination
					recordCount={recordCount}
					currentPage={currentPage}
					pageSize={pageSize}
					onClickFirst={onViewClickFirst}
					onClickPrevious={onViewClickPrevious}
					onClickNext={onViewClickNext}
					onClickLast={onViewClickLast}
					onPageSizeChanged={onPageSizeChanged}
				/>
			</div>
		</FormGroupContainer>
	);

	//  Export
	const handleExportToCSV = () => {
		setExportLoading(true);
		const requestExport: SegmentTestRequestModel = {
			queryForm: stringQuery,
			userId: userId !== null && userId !== undefined ? userId.toString() : '',
			queueId: Guid.create().toString(),
			pageSize: recordCount,
			offsetValue: 0,
			sortColumn: sortColumn,
			sortOrder: sortOrder,
			segmentId: segmentId,
		};

		setExportLoading(true);
		exportToCsv(requestExport)
			.then((responseExport) => {
				const url = window.URL.createObjectURL(new Blob([responseExport.data]));
				const link = document.createElement('a');
				link.href = url;
				link.setAttribute('download', 'Test_Segment.csv');
				document.body.appendChild(link);
				link.click();
				setExportLoading(false);
			})
			.catch(() => {
				swal('Failed', 'Problem in getting message type list', 'error');
				setExportLoading(false);
			});
	};

	const ExportToCSV = () => (
		<div className='col mb-5 align-self-end export-csv'>
			{(access?.includes(USER_CLAIMS.SegmentationRead) || access?.includes(USER_CLAIMS.SegmentationWrite)) && (
				<Button size={'sm'} title={'Export to CSV'} style={{float: 'right'}} type={'button'} onClick={() => handleExportToCSV()}>
					{!exportLoading && (
						<>
							<span className='icon-export-sp'>
								<FontAwesomeIcon icon={faFileExport} title={'Export'} style={{color: 'white'}} />
							</span>
							&nbsp;Export to CSV
						</>
					)}

					{exportLoading && (
						<span className='indicator-progress' style={{display: 'block'}}>
							Please wait...
							<span className='spinner-border spinner-border-sm align-middle ms-2 export-load'></span>
						</span>
					)}
				</Button>
			)}
		</div>
	);

	const redirectToEditSegment = (_segmentId: any) => {
		history.push('/player-management/segment/edit/' + _segmentId);
	};

	return (
		<MainContainer>
			<ContentContainer>
				<FormGroupContainer>
					
				<SegmentSection />
					<div className='col-lg-3'>
						<label className='col-form-label required'>Input Type</label>
						<Select
							autoComplete='off'
							size='small'
							style={{width: '100%'}}
							className='right'
							options={segmentViewInputTypeOptionList}
							onChange={handleChangeViewSegmentInputType}
							value={segmentViewInputType}
							isDisabled={true}
						/>
					</div>
				<div className='col-lg-4'>
					<SegmentDistributionStatus
						isActive={segmentStatus}
						showIcon={segmentValueTypeId === SegmentTypes.Distribution}
						isReactivated={isReactivated}
					/>
				</div>
				</FormGroupContainer>
				<FormGroupContainer>
					<div className='col'>
						<label className='col-form-label col-sm required'>Segment Name</label>
						<input
							autoComplete='off'
							type='text'
							className='form-control form-control-sm'
							id='formGroupExampleInput'
							value={segmentName}
							onChange={(e) => setSegmentName(e.target.value)}
							disabled={true}
						/>
					</div>
				</FormGroupContainer>
				<FormGroupContainer>
					<div className='col'>
						<label className='col-form-label col-sm required'>Segment Description</label>
						<textarea
							autoComplete='off'
							className='form-control form-control-sm'
							id='exampleFormControlTextarea1'
							rows={2}
							value={segmentDescription}
							onChange={(e) => setSegmentDescription(e.target.value)}
							disabled={true}
						></textarea>
					</div>
				</FormGroupContainer>
				<Separator />
				{segmentViewInputType && segmentViewInputType.value === SegmentInputTypes.Condition && (
					<>
						<SegmentConditions
							segmentState={segmentState}
							dispatch={dispatch}
							setSegmentConditionInFilePlayersIdList={setSegmentConditionInFilePlayersIdList}
							setSegmentConditions={setSegmentCondition}
						/>
						<QueryFormView queryForm={styledQuery} />
					</>
				)}
				{segmentViewInputType && segmentViewInputType.value === SegmentInputTypes.CustomQuery && (
					<CustomQueryView readOnly={true} customQuery={segmentViewCustomQuery} setCustomQuery={setSegmentViewCustomQuery} />
				)}
				<Separator />
				<TestSegmentBtn />
				<FormGroupContainer>
					<div className='row mb-3'>
						<div className='col-lg-2'>
							<label>Player Id</label>
							<input
								type='text'
								className='form-control form-control-sm'
								value={filterPlayerId}
								onChange={(e) => setFilterPlayerId(e.target.value)}
							/>
						</div>
						<div className='col-lg-2'>
							<label>User Name</label>
							<input
								type='text'
								className='form-control form-control-sm user-name'
								onChange={(e) => setFilterUserName(e.target.value)}
								value={filterUserName}
							/>
						</div>
					</div>
				</FormGroupContainer>
				<FormGroupContainer>
					<div className='col mb-5 search-btn'>
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
							onClick={() => searchResult()}
						/>
					</div>

					<ExportToCSV />
				</FormGroupContainer>
				<PlayerListgrid />
				<Separator />
				{segmentType && <SaveSegmentBtn />}
				{!segmentType && <Skeleton style={{width: '30rem', height: '30px'}} />}
			</ContentContainer>
		</MainContainer>
	);
};

export default ViewSegment;
