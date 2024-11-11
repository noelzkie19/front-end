import { faFileExport } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { AgGridReact } from 'ag-grid-react';
import { Guid } from 'guid-typescript';
import moment from 'moment';
import React, { useEffect, useReducer, useState } from 'react';
import { Button } from 'react-bootstrap';
import { shallowEqual, useSelector } from 'react-redux';
import { useHistory, useParams } from 'react-router-dom';
import Select from 'react-select';
import swal from 'sweetalert';
import { CustomQueryView, QueryFormView, SegmentConditions, SegmentDistributionStatus, TestSegment } from '.';
import { RootState } from '../../../../../setup';
import * as hubConnection from '../../../../../setup/hub/MessagingHub';
import { MasterReferenceOptionListModel, MasterReferenceOptionModel } from '../../../../common/model';
import { GetMasterReferenceList } from '../../../../common/services';
import { ElementStyle, HttpStatusCodeEnum, PROMPT_MESSAGES, SegmentStateActionTypes } from '../../../../constants/Constants';
import useConstant from '../../../../constants/useConstant';
import { ContentContainer, DefaultGridPagination, FormGroupContainer, MainContainer, MlabButton } from '../../../../custom-components';
import { usePromptOnUnload } from '../../../../custom-helpers';
import { LookupModel } from '../../../../shared-models/LookupModel';
import { IAuthState } from '../../../auth';
import { USER_CLAIMS } from '../../../user-management/components/constants/UserClaims';
import { InFileSegmentPlayerModel, PlayerModel, SegmentSaveRequestModel, SegmentTestRequestModel } from '../models';
import * as segmentManagement from '../redux/SegmentationRedux';
import { exportToCsv, upsertSegment } from '../redux/SegmentationService';
import useSegmentConstant from '../useSegmentConstant';
import { initialSegmentState, segmentReducer } from '../utils/SegmentState';
import { useQueryForm, useTestSegment, useValidateConditions } from './shared/hooks';
import useSegmentInputTypeOptions from './shared/hooks/useSegmentInputTypeOptions';
import { ColDef, ColGroupDef } from 'ag-grid-community';

interface Props {
	setSegmentQueryInputType?: any;
	setSegmentTabType?: any;
	selectedSegmentOption?: any;
	setSegmentObjectName?: any;
	setSegmentObjectDesc?: any;
	segmentObjectVarianceList?: any;
	segmentObjectConditions?: any;
	setSegmentObjectStatus: (e: any) => void;
	setSegmentObjectInFilePlayerIds?: any;
	setSegmentCondition: (e: any) => void;
	setSegmentObjectQuery: (e: any) => void;
	setSegmentObjectQueryJoins: (e: any) => void;
	setSegmentObjectQueryTableau: (e: any) => void;
	setSegmentObjectCustomQueryAdd: (e: any) => void;
}

const AddSegment: React.FC<Props> = ({
	setSegmentQueryInputType,
	setSegmentTabType,
	selectedSegmentOption,
	setSegmentObjectName,
	setSegmentObjectDesc,
	segmentObjectVarianceList,
	segmentObjectConditions,
	setSegmentObjectStatus,
	setSegmentObjectQuery,
	setSegmentObjectInFilePlayerIds,
	setSegmentCondition,
	setSegmentObjectQueryJoins,
	setSegmentObjectQueryTableau,
	setSegmentObjectCustomQueryAdd,
}) => {
	//  redux
	const {userId, access} = useSelector<RootState>(({auth}) => auth, shallowEqual) as IAuthState;

	//constants/hooks
	const {SegmentTypes, SwalConfirmMessage, segmentTypeMasterRefId, SegmentInputTypes} = useSegmentConstant();
	const {successResponse, HubConnected} = useConstant();
	usePromptOnUnload(true, 'Changes you made may not be saved.');
	const {segmentLoading, handleTestSegment, recordCount, playerList, handleSetStringQuery, handleSetTableJoins, handleSetSegmentState} =
		useTestSegment();
	const {segmentInputTypeOption, getSegmentInputTypeList} = useSegmentInputTypeOptions();

	//  States
	const history = useHistory();
	const {segmentId} = useParams();
	const [segmentState, dispatch] = useReducer(segmentReducer, {...initialSegmentState});
	const [loading, setLoading] = useState(false);
	const [exportLoading, setExportLoading] = useState(false);
	const [filteredPlayerList, setFilteredPlayerList] = useState<Array<PlayerModel>>([]);
	const [filterPlayerId, setFilterPlayerId] = useState('');
	const [filterUserName, setFilterUserName] = useState('');
	const [segmentTypeOptionList, setSegmentTypeOptionList] = useState<Array<LookupModel>>([]);

	const [segmentAddInputType, setSegmentAddInputType] = useState<LookupModel | null>(null);
	const [segmentType, setSegmentType] = useState<LookupModel | null>(selectedSegmentOption);
	const [segmentStatus, setSegmentStatus] = useState<any>(true);
	const [segmentName, setSegmentName] = useState('');
	const [segmentDescription, setSegmentDescription] = useState('');
	const [segmentConditionInFilePlayersIdList, setSegmentConditionInFilePlayersIdList] = useState<Array<InFileSegmentPlayerModel>>([]);
	const {stringQuery, styledQuery, stringQueryMLab, stringQueryTableau, tableJoins} = useQueryForm(segmentState.segmentConditions);
	const [segmentAddCustomQuery, setSegmentAddCustomQuery] = useState('');
	const {validateConditions, validateTestSegment, validateCustomQuery, validateRequiredFields} = useValidateConditions();

	//Pagination
	const [pageSize, setPageSize] = useState<number>(10);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [sortOrder, setSortOrder] = useState<string>('ASC');
	const [sortColumn, setSortColumn] = useState<string>('PlayerId');

	const [gridApi, setGridApi] = useState(null);
	const [gridColumnApi, setGridColumnApi] = useState(null);

	//  Effects
	useEffect(() => {
		initializeComponent();
		getSegmentTypeOptionList();
		setDefaultInputType();
	}, []);

	useEffect(() => {
		setSegmentObjectInFilePlayerIds(segmentConditionInFilePlayersIdList);
	}, [segmentConditionInFilePlayersIdList]);

	useEffect(() => {
		setSegmentType(selectedSegmentOption);
		setSegmentStatus(selectedSegmentOption && (selectedSegmentOption?.value == SegmentTypes.Distribution ? false : true));
		setSegmentObjectStatus(selectedSegmentOption && (selectedSegmentOption?.value == SegmentTypes.Distribution ? false : true));
		dispatch({type: SegmentStateActionTypes.SegmentType, payload: selectedSegmentOption && selectedSegmentOption.value});
	}, [selectedSegmentOption]);

	useEffect(() => {
		setFilteredPlayerList(playerList);
	}, [playerList]);

	useEffect(() => {
		setSegmentObjectQuery(stringQueryMLab);
		setSegmentObjectQueryJoins(tableJoins);
		setSegmentObjectQueryTableau(stringQueryTableau);
		handleSetStringQuery(stringQuery);
		handleSetTableJoins(tableJoins);
		handleSetSegmentState(segmentState.segmentConditions);
	}, [stringQuery]);

	useEffect(() => {
		setSegmentObjectCustomQueryAdd(segmentAddCustomQuery);
	}, [segmentAddCustomQuery]);

	//  Methods
	const initializeComponent = () => {
		dispatch(segmentManagement.actions.resetForm());
		dispatch(segmentManagement.actions.setIsStatic(false));
		dispatch(segmentManagement.actions.setSegmentInfo({} as SegmentSaveRequestModel));
		dispatch(segmentManagement.actions.setSegmentConditions([]));
		setSegmentName('');
		setSegmentDescription('');

		//	Set default status upon change of segment type
		setSegmentStatus(segmentType && (segmentType.value === SegmentTypes.Distribution ? false : true));
	};

	const setDefaultInputType = async () => {
		const inputTypeOptionsAddData = await getSegmentInputTypeList();
		if (!access?.includes(USER_CLAIMS.CreateCustomQueryWrite)) {
			const inputTypeCondition = inputTypeOptionsAddData.find((x: LookupModel) => x.value === SegmentInputTypes.Condition);
			inputTypeCondition && setSegmentAddInputType(inputTypeCondition);
		}
	};

	const handleChangeSegmentType = (data: LookupModel) => {
		if (data) {
			setSegmentType(data);
			setSegmentTabType(data.value);
			setSegmentStatus(data && (data.value === SegmentTypes.Distribution ? false : true));
			setSegmentObjectStatus(data && (data.value === SegmentTypes.Distribution ? false : true));
			dispatch({type: SegmentStateActionTypes.SegmentType, payload: data.value});
		}
	};

	const handleChangeAddSegmentInputType = (data: LookupModel) => {
		if (data) {
			setSegmentAddInputType(data);
			setSegmentQueryInputType(data.value.toString());

			// Clear Custom Query and Condition Values for Add
			setSegmentAddCustomQuery('');
			dispatch({type: SegmentStateActionTypes.SegmentConditions, payload: [], invoker: 'Add Segment - Change Input Type'});
			setSegmentCondition([]); // Clear conditions from Clone Segment
		}
	};

	const handleSegmentNameValueOnChange = (event: any) => {
		setSegmentName(event.target.value);
		setSegmentObjectName(event.target.value);
	};

	const handleSegmentDescOnChange = (event: any) => {
		setSegmentDescription(event.target.value);
		setSegmentObjectDesc(event.target.value);
	};

	const _testSegment = () => {
		handleTestSegment(pageSize, currentPage, sortColumn, sortOrder, filterPlayerId, filterUserName);
	};

	const getSegmentTypeOptionList = async () => {
		let optionList: Array<LookupModel> = [];
		await GetMasterReferenceList(segmentTypeMasterRefId)
			.then((response: any) => {
				if (response.status === HttpStatusCodeEnum.Ok) {
					let masterReferenceList = Object.assign(new Array<MasterReferenceOptionListModel>(), response.data);
					let tempList = Array<MasterReferenceOptionModel>();

					masterReferenceList
						.filter((x: MasterReferenceOptionListModel) => x.isParent === false)
						.forEach((item: any) => {
							const optionVal: MasterReferenceOptionModel = {
								masterReferenceParentId: item.masterReferenceParentId,
								options: {label: item.masterReferenceChildName, value: item.masterReferenceId.toString()},
							};
							tempList.push(optionVal);
						});
					optionList = tempList.flatMap((x) => x.options);
					setSegmentTypeOptionList(tempList.flatMap((x) => x.options));
				} else {
					console.log('Problem in master reference list');
				}
			})
			.catch(() => {
				console.log('Problem in master reference list');
			});
		return optionList;
	};

	//  Save
	const saveAddSegment = async () => {
		let isSaveAddValid = true;

		isSaveAddValid = await validateRequiredFields(
			segmentAddInputType?.value ?? '',
			segmentName,
			segmentDescription,
			segmentType?.value ?? '',
			segmentObjectVarianceList, 0
		);

		// Validate condition if InputType = Condition
		if (isSaveAddValid === true && segmentAddInputType && segmentAddInputType.value === SegmentInputTypes.Condition) {
			isSaveAddValid = validateConditions(segmentObjectConditions);
		}

		// Validate custom query string if InputType = Custom Query
		if (isSaveAddValid === true && segmentAddInputType && segmentAddInputType.value === SegmentInputTypes.CustomQuery) {
			isSaveAddValid = await validateCustomQuery(segmentAddCustomQuery);
		}

		if (isSaveAddValid) {
			const validateTestUponCreateSegment =
				segmentAddInputType && segmentAddInputType.value === SegmentInputTypes.Condition
					? validateTestSegment(undefined, segmentState.segmentConditions)
					: false;

			if (validateTestUponCreateSegment) {
				handleTestSegment(10, 1, sortColumn, sortOrder, '', '', confirmSaveAddSegment, true);
			} else {
				confirmSaveAddSegment(SwalConfirmMessage.textSaveChannel);
			}
		}
	};

	const confirmSaveAddSegment = (confirmationMessage?: string) => {
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
		setLoading(true);
		setTimeout(() => {
			const messagingHub = hubConnection.createHubConnenction();
			messagingHub
				.start()
				.then(() => {
					if (messagingHub.state === HubConnected) {
						let segmentRequestInsert: SegmentSaveRequestModel = {
							segmentId: 0,
							segmentName: segmentName,
							segmentDescription: segmentDescription,
							isActive: segmentStatus,
							isStatic: false,
							staticParentId: undefined,
							queryForm: stringQueryMLab,
							segmentConditions: segmentObjectConditions,
							segmentTypeId: segmentType ? parseInt(segmentType?.value) : undefined,
							queueId: Guid.create().toString(),
							userId: userId !== null && userId !== undefined ? userId.toString() : '',
							segmentVariances: segmentObjectVarianceList,
							InFileSegmentPlayer: segmentConditionInFilePlayersIdList,
							queryJoins: tableJoins,
							isReactivated: false,
							queryFormTableau:
								segmentAddInputType && segmentAddInputType.value === SegmentInputTypes.CustomQuery ? segmentAddCustomQuery : stringQueryTableau,
							inputTypeId: segmentAddInputType && segmentAddInputType.value ? parseInt(segmentAddInputType.value) : 0,
						};

						upsertSegment(segmentRequestInsert)
							.then((response) => {
								if (response.status === successResponse) {
									messagingHub.on(segmentRequestInsert.queueId.toString(), (message) => {
										let resultData = JSON.parse(message.remarks);

										if (resultData.Status === successResponse) {
											let segmentIdSaved = resultData.Data;

											setLoading(false);
											swal(PROMPT_MESSAGES.SuccessTitle, 'Successfully saved the template', 'success');
											redirectViewSegment(segmentIdSaved);
										} else {
											swal(PROMPT_MESSAGES.FailedValidationTitle, 'Problem connecting to the server, Please refresh', 'error');
										}
										messagingHub.off(segmentRequestInsert.queueId.toString());
										messagingHub.stop();
									});

									setTimeout(() => {
										if (messagingHub.state === HubConnected) {
											messagingHub.stop();
										}
									}, 30000);
								} else {
									messagingHub.stop();
									swal(PROMPT_MESSAGES.FailedValidationTitle, response.data.message, 'error');
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
		}, 1000);
	};

	const redirectViewSegment = (segmentId: any) => {
		history.push('/player-management/segment/view/' + segmentId);
	};

	// Table Loader
	const tableLoaderAddSegment = (data: any) => {
		return (
			<div className='ag-custom-loading-cell' style={{paddingLeft: '10px', lineHeight: '25px'}}>
				<i className='fas fa-spinner fa-pulse'></i> <span> {data.loadingMessage}</span>
			</div>
		);
	};

	// test segment methods
	const searchResult = () => {
		if (playerList.length > 0) {
			setCurrentPage(1);
			handleTestSegment(pageSize, 1, sortColumn, sortOrder, filterPlayerId, filterUserName);
		}
	};

	const handleFilterPlayerIdChange = (event: any) => {
		setFilterPlayerId(event.target.value);
	};

	const onGridReady = (params: any) => {
		setGridApi(params.api);
		setGridColumnApi(params.columnApi);
		params.api.sizeColumnsToFit();
	};

	const handleFilterPlayerNameChange = (event: any) => {
		setFilterUserName(event.target.value);
	};

	// Table Content and Headers
	const columnDefsAdd : (ColDef<PlayerModel> | ColGroupDef<PlayerModel>)[] = [
		{headerName: 'No', valueGetter: ('node.rowIndex + 1 + ' + (currentPage - 1) * pageSize).toString(), sortable: false, width: 60},
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
	];

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
			queryJoins: tableJoins,
		};

		setExportLoading(true);
		exportToCsv(requestExport)
			.then((response) => {
				const urlAdd = window.URL.createObjectURL(new Blob([response.data]));
				const linkAdd = document.createElement('a');
				linkAdd.href = urlAdd;
				linkAdd.setAttribute('download', 'Test_Segment.csv');
				document.body.appendChild(linkAdd);
				linkAdd.click();
				setExportLoading(false);
			})
			.catch(() => {
				setExportLoading(false);
				swal(PROMPT_MESSAGES.FailedValidationTitle, 'Problem in getting message type list', 'error');
			});
	};

	//  Grid
	const onClickPrevious = () => {
		if (currentPage > 1) {
			setCurrentPage(currentPage - 1);
			handleTestSegment(pageSize, currentPage - 1, sortColumn, sortOrder, filterPlayerId, filterUserName);
		}
	};

	const onClickFirst = () => {
		if (currentPage > 1) {
			setCurrentPage(1);
			handleTestSegment(pageSize, 1, sortColumn, sortOrder, filterPlayerId, filterUserName);
		}
	};

	const onClickNext = () => {
		if (totalPage() > currentPage) {
			setCurrentPage(currentPage + 1);
			handleTestSegment(pageSize, currentPage + 1, sortColumn, sortOrder, filterPlayerId, filterUserName);
		}
	};

	const onClickLast = () => {
		if (totalPage() > currentPage) {
			setCurrentPage(totalPage());
			handleTestSegment(pageSize, totalPage(), sortColumn, sortOrder, filterPlayerId, filterUserName);
		}
	};

	const totalPage = () => {
		return Math.ceil(recordCount / pageSize) | 0;
	};

	const onSort = (e: any) => {
		setCurrentPage(1);

		if (playerList != undefined && playerList.length > 0) {
			let sortAddDetail = e.api.getSortModel();
			if (sortAddDetail[0] != undefined) {
				setSortColumn(sortAddDetail[0]?.colId);
				setSortOrder(sortAddDetail[0]?.sort);
				handleTestSegment(pageSize, 1, sortAddDetail[0]?.colId, sortAddDetail[0]?.sort, filterPlayerId, filterUserName);
			} else {
				setSortColumn('');
				setSortOrder('');
				handleTestSegment(pageSize, currentPage, '', '', filterPlayerId, filterUserName);
			}
		}
	};

	const onPageSizeChanged = () => {
		var value: string = (document.getElementById('page-size') as HTMLInputElement).value;
		setPageSize(Number(value));
		setCurrentPage(1);

		if (playerList != undefined && playerList.length > 0) {
			handleTestSegment(Number(value), 1, sortColumn, sortOrder, filterPlayerId, filterUserName);
		}
	};

	return (
		<MainContainer>
			<ContentContainer>
			<FormGroupContainer>
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
						/>
					</div>

					<div className='col-lg-3' >
						<label className='col-form-label required'>Input Type</label>
						<Select
							autoComplete='off'
							size='small'
							style={{width: '100%'}}
							className='right'
							options={segmentInputTypeOption}
							onChange={handleChangeAddSegmentInputType}
							value={segmentAddInputType}
							isDisabled={!access?.includes(USER_CLAIMS.CreateCustomQueryWrite)}
						/>
					</div>
					
					<div className='col-lg-2'>
						<SegmentDistributionStatus isActive={segmentStatus} showIcon={false} />
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
							onChange={handleSegmentNameValueOnChange}
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
							onChange={handleSegmentDescOnChange}
						></textarea>
					</div>
				</FormGroupContainer>
				<div className='separator separator-dashed my-5'></div>
				{segmentAddInputType && segmentAddInputType.value === SegmentInputTypes.Condition && (
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
				{segmentAddInputType && segmentAddInputType.value === SegmentInputTypes.CustomQuery && (
					<CustomQueryView customQuery={segmentAddCustomQuery} setCustomQuery={setSegmentAddCustomQuery} />
				)}

				<div className='separator separator-dashed my-5'></div>

				<FormGroupContainer>
					<TestSegment
						loading={segmentLoading}
						queryForm={stringQuery}
						segmentConditions={segmentState.segmentConditions}
						testSegment={_testSegment}
						segmentInputType={segmentAddInputType}
					/>
				</FormGroupContainer>

				{/* Start Test Segment Condition */}
				<FormGroupContainer>
					<div className='row mb-3'>
						<div className='col-lg-3'>
							<label>Player Id</label>
							<input
								type='text'
								className='form-control form-control-sm'
								value={filterPlayerId}
								onChange={handleFilterPlayerIdChange}
							/>
						</div>
						<div className='col-lg-3'>
							<label>User Name</label>
							<input type='text' className='form-control form-control-sm' value={filterUserName} onChange={handleFilterPlayerNameChange} />
						</div>
					</div>
				</FormGroupContainer>
				<FormGroupContainer>
					<div className='col mb-5'>
						<MlabButton
							access={access?.includes(USER_CLAIMS.SegmentationRead) || access?.includes(USER_CLAIMS.SegmentationWrite)}
							size={'sm'}
							label={'Search'}
							style={ElementStyle.primary}
							type={'button'}
							weight={'solid'}
							loading={segmentLoading}
							disabled={segmentLoading}
							loadingTitle={' Please wait...'}
							onClick={() => searchResult()}
						/>
					</div>

					<div className='col mb-5 align-self-end '>
						{(access?.includes(USER_CLAIMS.SegmentationRead) || access?.includes(USER_CLAIMS.SegmentationWrite)) && (
							<Button size={'sm'} title={'Export to CSV'} style={{float: 'right'}} type={'button'} onClick={() => handleExportToCSV()}>
								{!exportLoading && (
									<>
										<span>
											<FontAwesomeIcon icon={faFileExport} title={'Export'} style={{color: 'white'}} />
										</span>
										&nbsp;Export to CSV
									</>
								)}

								{exportLoading && (
									<span className='indicator-progress' style={{display: 'block'}}>
										Please wait...
										<span className='spinner-border spinner-border-sm align-middle ms-2'></span>
									</span>
								)}
							</Button>
						)}
					</div>
				</FormGroupContainer>
				<FormGroupContainer>
					<div className='ag-theme-quartz ' style={{height: 400, width: '100%', marginBottom: '50px'}}>
						<AgGridReact
							rowData={filteredPlayerList}
							defaultColDef={{
								sortable: true,
								resizable: true,
							}}
							components={{
								tableLoader: tableLoaderAddSegment,
							}}
							onGridReady={onGridReady}
							rowBuffer={0}
							//enableRangeSelection={true} //deprecated in AgGridReactver.32.0.0
							pagination={false}
							paginationPageSize={pageSize}
							columnDefs={columnDefsAdd}
							onSortChanged={(e) => onSort(e)}
						/>

						{/* </AgGridReact> */}
						<DefaultGridPagination
							recordCount={recordCount}
							currentPage={currentPage}
							pageSize={pageSize}
							onClickFirst={onClickFirst}
							onClickPrevious={onClickPrevious}
							onClickNext={onClickNext}
							onClickLast={onClickLast}
							onPageSizeChanged={onPageSizeChanged}
						/>
					</div>
				</FormGroupContainer>
				{/* End test segment condition */}

				<div className='separator separator-dashed my-5'></div>
				<FormGroupContainer>
					<div
						className='col-lg-2'
						style={segmentType && segmentType?.value === SegmentTypes.Distribution ? {position: 'absolute', marginTop: '30px', width: '200px'} : {}}
					>
						<MlabButton
							access={access?.includes(USER_CLAIMS.SegmentationWrite)}
							size={'sm'}
							label={'Save Segment'}
							style={ElementStyle.primary}
							type={'button'}
							weight={'solid'}
							loading={loading}
							disabled={
								loading || (segmentType && segmentType?.value === SegmentTypes.Distribution && segmentObjectVarianceList?.length === 0) ? true : false
							}
							loadingTitle={' Please wait...'}
							onClick={() => saveAddSegment()}
						/>
					</div>
				</FormGroupContainer>
			</ContentContainer>
		</MainContainer>
	);
};

export default AddSegment;
function sePromptOnUnload(arg0: boolean, arg1: string) {
	throw new Error('Function not implemented.');
}
