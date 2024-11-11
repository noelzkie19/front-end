import { faFileExport } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { AgGridReact } from 'ag-grid-react';
import { Guid } from 'guid-typescript';
import moment from 'moment';
import { useEffect, useReducer, useState } from 'react';
import { shallowEqual, useSelector } from 'react-redux';
import { useHistory, useParams } from 'react-router-dom';
import Select from 'react-select';
import swal from 'sweetalert';
import { CustomQueryView, QueryFormView, SegmentConditions, SegmentDistributionStatus, TestSegment } from '.';
import { RootState } from '../../../../../setup';
import * as hubConnection from '../../../../../setup/hub/MessagingHub';
import { MasterReferenceOptionListModel, MasterReferenceOptionModel } from '../../../../common/model';
import { GetMasterReferenceList } from '../../../../common/services';
import { ElementStyle, HttpStatusCodeEnum, SegmentStateActionTypes } from '../../../../constants/Constants';
import useConstant from '../../../../constants/useConstant';
import { ContentContainer, DefaultGridPagination, FormGroupContainer, MainContainer, MlabButton } from '../../../../custom-components';
import { usePromptOnUnload } from '../../../../custom-helpers';
import { LookupModel } from '../../../../shared-models/LookupModel';
import { IAuthState } from '../../../auth';
import { USER_CLAIMS } from '../../../user-management/components/constants/UserClaims';
import { useQueryForm, useTestSegment, useValidateConditions } from '../components/shared/hooks';
import { InFileSegmentPlayerModel, PlayerModel, SegmentSaveRequestModel, SegmentTestRequestModel } from '../models';
import { SegmentVarianceModel } from '../models/SegmentVarianceModel';
import { exportToCsv, getSegmentById, upsertSegment } from '../redux/SegmentationService';
import useSegmentConstant from '../useSegmentConstant';
import { initialSegmentState, segmentReducer } from '../utils/SegmentState';
import useSegmentInputTypeOptions from './shared/hooks/useSegmentInputTypeOptions';
import { ColDef, ColGroupDef } from 'ag-grid-community';

interface Props {
	setSegmentObjectName?: any;
	setSegmentObjectDesc?: any;
	setSegmentTabType?: any;
	setSegmentQueryInputType?: any;
	selectedSegmentOption?: any;
	segmentObjectVarianceList?: any;
	segmentObjectQuery?: any;
	segmentObjectConditions: any;
	segmentObjectInFilePlayerIds: any;
	setSegmentCondition: (e: any) => void;
	setSegmentObjectQueryJoins: (e: any) => void;
	setSegmentObjectQuery: (e: any) => void;
	setSegmentObjectVarianceList: (e: any) => void;
	setSegmentObjectInFilePlayerIds: (e: any) => void;
	setSegmentObjectQueryTableau: (e: any) => void;
	setSegmentObjectStatus: (e: any) => void;
	setSegmentObjectCustomQueryClone: (e: any) => void;
}

const CloneSegment: React.FC<Props> = ({
	setSegmentTabType,
	setSegmentQueryInputType,
	selectedSegmentOption,
	setSegmentObjectName,
	setSegmentObjectDesc,
	segmentObjectVarianceList,
	segmentObjectInFilePlayerIds,
	segmentObjectConditions,
	setSegmentObjectStatus,
	setSegmentObjectQuery,
	setSegmentCondition,
	setSegmentObjectQueryJoins,
	setSegmentObjectVarianceList,
	setSegmentObjectInFilePlayerIds,
	setSegmentObjectQueryTableau,
	setSegmentObjectCustomQueryClone,
}) => {
	// Hooks
	const {userId, access} = useSelector<RootState>(({auth}) => auth, shallowEqual) as IAuthState;
	const history = useHistory();
	const {segmentId} = useParams();
	const {SegmentTypes, segmentTypeMasterRefId, SwalConfirmMessage, SegmentInputTypes} = useSegmentConstant();
	const [segmentState, dispatch] = useReducer(segmentReducer, {...initialSegmentState});
	const {HubConnected, successResponse, SwalFailedMessage, SwalServerErrorMessage} = useConstant();
	const {stringQuery, stringQueryMLab, stringQueryTableau, styledQuery, tableJoins} = useQueryForm(segmentState.segmentConditions);
	const {validateConditions, validateTestSegment, validateCustomQuery, validateRequiredFields} = useValidateConditions();
	usePromptOnUnload(true, 'Changes you made may not be saved.');

	const {segmentLoading, handleTestSegment, recordCount, playerList, handleSetStringQuery, handleSetTableJoins, handleSetSegmentState} =
		useTestSegment();
	const {getSegmentInputTypeList} = useSegmentInputTypeOptions();

	// States
	const [loading, setLoading] = useState<boolean>(false);
	const [exportLoading, setExportLoading] = useState<boolean>(false);
	const [filteredPlayerList, setFilteredPlayerList] = useState<Array<PlayerModel>>([]);
	const [filterPlayerId, setFilterPlayerId] = useState<string>('');
	const [filterUserName, setFilterUserName] = useState<string>('');
	const [segmentName, setSegmentName] = useState<string>('');
	const [segmentDescription, setSegmentDescription] = useState<string>('');
	const [buttonStyle, setButtonStyle] = useState<any>({});
	const [segmentTypeOptionList, setSegmentTypeOptionList] = useState<Array<LookupModel>>([]);

	//server-side pagination states
	const [pageSize, setPageSize] = useState<number>(10);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [sortOrder, setSortOrder] = useState<string>('ASC');
	const [sortColumn, setSortColumn] = useState<string>('PlayerId');
	const [segmentType, setSegmentType] = useState<any>();
	const [segmentStatus, setSegmentStatus] = useState<boolean>(true);
	const [segmentConditionInFilePlayersIdList, setSegmentConditionInFilePlayersIdList] = useState<Array<InFileSegmentPlayerModel>>([]);
	const [segmentValueTypeId, setSegmentValueTypeId] = useState<string>('');
	const [segmentCloneInputType, setSegmentCloneInputType] = useState<any>(null);
	const [segmentCloneCustomQuery, setSegmentCloneCustomQuery] = useState('');
	const [segmentCloneInputTypeOptionList, setSegmentCloneInputTypeOptionList] = useState<Array<LookupModel>>([]);

	// Effectd
	useEffect(() => {
		getSegmentInfo(segmentId);
	}, []);

	useEffect(() => {
		console.log(stringQuery);
		setSegmentObjectQuery(stringQueryMLab);
		setSegmentObjectQueryJoins(tableJoins);
		handleSetStringQuery(stringQuery);
		handleSetTableJoins(tableJoins);
		handleSetSegmentState(segmentObjectConditions);
		setSegmentObjectQueryTableau(stringQueryTableau);
	}, [stringQuery]);

	useEffect(() => {
		setSegmentObjectCustomQueryClone(segmentCloneCustomQuery);
	}, [segmentCloneCustomQuery]);

	// Methods
	const getSegmentTypeCloneOptions = async () => {
		let optionClone: Array<LookupModel> = [];
		await GetMasterReferenceList(segmentTypeMasterRefId)
			.then((response: any) => {
				if (response.status === 200) {
					let masterReferenceList = Object.assign(new Array<MasterReferenceOptionListModel>(), response.data);
					let tempList = Array<MasterReferenceOptionModel>();
					masterReferenceList
						.filter((x: MasterReferenceOptionListModel) => x.isParent === false)
						.forEach((item: any) => {
							const OptionValue: MasterReferenceOptionModel = {
								masterReferenceParentId: item.masterReferenceParentId,
								options: {label: item.masterReferenceChildName, value: item.masterReferenceId.toString()},
							};
							tempList.push(OptionValue);
						});
					optionClone = tempList.flatMap((x) => x.options);
					setSegmentTypeOptionList(tempList.flatMap((x) => x.options));
				} else {
					console.log('Problem in master reference list');
				}
			})
			.catch(() => {
				console.log('Problem in master reference list');
			});
		return optionClone;
	};

	const totalPage = () => {
		return Math.ceil(recordCount / pageSize) | 0;
	};

	const onClickFirst = () => {
		if (currentPage > 1) {
			setCurrentPage(1);
			handleTestSegment(pageSize, 1, sortColumn, sortOrder, filterPlayerId, filterUserName);
		}
	};

	const onClickLast = () => {
		if (totalPage() > currentPage) {
			setCurrentPage(totalPage());
			handleTestSegment(pageSize, totalPage(), sortColumn, sortOrder, filterPlayerId, filterUserName);
		}
	};

	const onClickNext = () => {
		if (totalPage() > currentPage) {
			setCurrentPage(currentPage + 1);
			handleTestSegment(pageSize, currentPage + 1, sortColumn, sortOrder, filterPlayerId, filterUserName);
		}
	};
	const onClickPrevious = () => {
		if (currentPage > 1) {
			setCurrentPage(currentPage - 1);
			handleTestSegment(pageSize, currentPage - 1, sortColumn, sortOrder, filterPlayerId, filterUserName);
		}
	};

	const onPageSizeChanged = () => {
		let pageSizeVal: string = (document.getElementById('page-size') as HTMLInputElement).value;
		setPageSize(Number(pageSizeVal));
		setCurrentPage(1);

		if (playerList != undefined && playerList.length > 0) {
			handleTestSegment(Number(pageSizeVal), 1, sortColumn, sortOrder, filterPlayerId, filterUserName);
		}
	};

	const onSort = (e: any) => {
		setCurrentPage(1);

		if (playerList != undefined && playerList.length > 0) {
			let sortCloneDetail = e.api.getSortModel();
			if (sortCloneDetail[0] != undefined) {
				setSortColumn(sortCloneDetail[0]?.colId);
				setSortOrder(sortCloneDetail[0]?.sort);
				handleTestSegment(pageSize, 1, sortCloneDetail[0]?.colId, sortCloneDetail[0]?.sort, filterPlayerId, filterUserName);
			} else {
				setSortColumn('');
				setSortOrder('');
				handleTestSegment(pageSize, currentPage, '', '', filterPlayerId, filterUserName);
			}
		}
	};

	const tableCloneLoader = (data: any) => {
		return (
			<div className='ag-custom-loading-cell' style={{paddingLeft: '10px', lineHeight: '25px'}}>
				<i className='fas fa-spinner fa-pulse'></i> <span> {data.loadingMessage}</span>
			</div>
		);
	};

	const redirectCloneToView = (segmentId: any) => {
		history.push('/player-management/segment/view/' + segmentId);
	};

	/**
	 * ? Handle Events
	 */
	const handleSegmentNameOnChange = (_segmentName: string) => {
		setSegmentName(_segmentName);
		setSegmentObjectName(_segmentName);
	};

	const handleSegmentDescOnChange = (_segmentDescription: string) => {
		setSegmentDescription(_segmentDescription);
		setSegmentObjectDesc(_segmentDescription);
	};

	const handleChangeCloneSegmentInputType = (data: LookupModel) => {
		if (data) {
			setSegmentCloneInputType(data);
			setSegmentQueryInputType(data.value.toString());

			// Clear Custom Query and Condition Values for Clone
			setSegmentCloneCustomQuery('');
			dispatch({type: SegmentStateActionTypes.SegmentConditions, payload: [], invoker: 'Clone Segment - Change Input Type'});
			setSegmentCondition([]); // Clear conditions from Clone Segment
		}
	};

	const handleFilterPlayerIdChange = (event: any) => {
		setFilterPlayerId(event.target.value);
	};

	const handleFilterPlayerNameChange = (event: any) => {
		setFilterUserName(event.target.value);
	};

	const onGridReady = (params: any) => {
		params.api.sizeColumnsToFit();
	};

	/**
	 *  ? Methods
	 */
	const getSegmentInfo = async (_segmentId: number) => {
		const segmentTypeOptionsData = await getSegmentTypeCloneOptions();
		const inputTypeOptionsCloneData = await getSegmentInputTypeList();
		setSegmentTypeOptionList(segmentTypeOptionsData);
		setSegmentCloneInputTypeOptionList(inputTypeOptionsCloneData);

		setLoading(true);
		getSegmentById(_segmentId)
			.then((response) => {
				if (response.status === HttpStatusCodeEnum.Ok) {
					const data = Object.assign(response.data);

					// Local States
					setSegmentName('');
					setSegmentDescription('');
					setSegmentStatus(data.segmentTypeId.toString() === SegmentTypes.Normal ? true : false);
					setSegmentType(segmentTypeOptionsData.find((x: any) => x.value === data.segmentTypeId.toString()));
					setSegmentValueTypeId(data.segmentTypeId.toString());
					setSegmentCloneCustomQuery(data.queryFormTableau);

					if (data.segmentTypeId.toString() === SegmentTypes.Distribution) setButtonStyle({position: 'absolute', marginTop: '30px', width: '200px'});

					if (!access?.includes(USER_CLAIMS.CreateCustomQueryWrite)) {
						const inputTypeCondition = inputTypeOptionsCloneData.find((x: LookupModel) => x.value === SegmentInputTypes.Condition);
						inputTypeCondition && setSegmentCloneInputType(inputTypeCondition);
					} else {
						setSegmentCloneInputType(inputTypeOptionsCloneData.find((x: any) => x.value === data.inputTypeId.toString()));
					}

					// Props states
					let clonedData = Array<SegmentVarianceModel>();
					data.segmentVariances.forEach((element: SegmentVarianceModel) => {
						let structuredCloneData: SegmentVarianceModel = {
							createdBy: 0,
							isActive: element.isActive,
							percentage: element.percentage,
							segmentId: 0,
							updatedBy: 0,
							varianceId: 0,
							varianceName: element.varianceName,
						};
						clonedData.push(structuredCloneData);
					});

					setSegmentObjectVarianceList(clonedData);
					setSegmentObjectInFilePlayerIds(data.segmentObjectInFilePlayerIds);
					setSegmentConditionInFilePlayersIdList(data.segmentConditionInFilePlayersIdList);
					setSegmentObjectName('');
					setSegmentObjectDesc('');
					setSegmentTabType(data.segmentTypeId.toString());
					setSegmentObjectStatus(false);
					setSegmentQueryInputType(data.inputTypeId.toString());

					//Set Segment Type upon cloning
					dispatch({type: SegmentStateActionTypes.SegmentType, payload: data.segmentTypeId.toString()});
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

	const saveSegmentClone = async () => {
		let isSaveCloneValid = true;

		isSaveCloneValid = await validateRequiredFields(
			segmentCloneInputType?.value ?? '',
			segmentName,
			segmentDescription,
			segmentType.value ?? '',
			segmentObjectVarianceList,
			segmentId
		);

		// Validate condition if InputType = Condition
		if (isSaveCloneValid === true && segmentCloneInputType && segmentCloneInputType.value === SegmentInputTypes.Condition) {
			isSaveCloneValid = validateConditions(segmentObjectConditions);
		}

		// Validate custom query string if InputType = Custom Query
		if (isSaveCloneValid === true && segmentCloneInputType && segmentCloneInputType.value === SegmentInputTypes.CustomQuery) {
			isSaveCloneValid = await validateCustomQuery(segmentCloneCustomQuery);
		}

		if (isSaveCloneValid) {
			const validateTestUponCreateSegment =
				segmentCloneInputType && segmentCloneInputType.value === SegmentInputTypes.Condition
					? validateTestSegment(undefined, segmentState.segmentConditions)
					: false;

			if (validateTestUponCreateSegment) {
				handleTestSegment(10, 1, sortColumn, sortOrder, '', '', confirmSaveCloneSegment, true);
			} else {
				confirmSaveCloneSegment(SwalConfirmMessage.textSaveChannel);
			}
		}
	};

	const confirmSaveCloneSegment = (confirmationMessage: string = SwalConfirmMessage.textSaveChannel) => {
		swal({
			title: SwalConfirmMessage.title,
			text: confirmationMessage,
			icon: SwalConfirmMessage.icon,
			buttons: [SwalConfirmMessage.btnNo, SwalConfirmMessage.btnYes],
			dangerMode: true,
		}).then((onConfirm) => {
			if (onConfirm) {
				saveValidatedDataClone();
			}
		});
	};

	const saveValidatedDataClone = () => {
		setLoading(true);
		setTimeout(() => {
			const messagingHub = hubConnection.createHubConnenction();
			messagingHub
				.start()
				.then(() => {
					if (messagingHub.state === HubConnected) {
						let requestClone: SegmentSaveRequestModel = {
							segmentId: 0,
							segmentName: segmentName,
							segmentDescription: segmentDescription,
							isActive: segmentStatus,
							isStatic: false,
							staticParentId: undefined,
							queryForm: stringQueryMLab,
							segmentConditions: segmentObjectConditions,
							segmentTypeId: segmentType ? parseInt(segmentType.value) : undefined,
							queueId: Guid.create().toString(),
							userId: userId !== null && userId !== undefined ? userId.toString() : '',
							queryJoins: tableJoins,
							segmentVariances: segmentObjectVarianceList,
							InFileSegmentPlayer: segmentObjectInFilePlayerIds,
							isReactivated: false,
							queryFormTableau:
								segmentCloneInputType && segmentCloneInputType.value === SegmentInputTypes.CustomQuery ? segmentCloneCustomQuery : stringQueryTableau,
							inputTypeId: segmentCloneInputType && segmentCloneInputType.value ? parseInt(segmentCloneInputType.value) : 0,
						};
						upsertSegment(requestClone)
							.then((response) => {
								if (response.status === successResponse) {
									messagingHub.on(requestClone.queueId.toString(), (message) => {
										let resultData = JSON.parse(message.remarks);

										if (resultData.Status === successResponse) {
											let segmentIdSaved = resultData.Data;

											setLoading(false);
											swal('Successful!', 'Successfully saved the template', 'success');
											redirectCloneToView(segmentIdSaved);
										} else {
											swal(SwalServerErrorMessage.title, SwalServerErrorMessage.textError, SwalServerErrorMessage.icon);
										}

										messagingHub.off(requestClone.queueId.toString());
										messagingHub.stop();
									});

									setTimeout(() => {
										if (messagingHub.state === HubConnected) {
											messagingHub.stop();
										}
									}, 30000);
								} else {
									messagingHub.stop();
									swal(SwalFailedMessage.title, response.data.message, 'error');
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

	const handleExportToCSV = () => {
		setExportLoading(true);
		const requestCloneExprt: SegmentTestRequestModel = {
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
		exportToCsv(requestCloneExprt)
			.then((response) => {
				const urlClone = window.URL.createObjectURL(new Blob([response.data]));
				const linkClone = document.createElement('a');
				linkClone.href = urlClone;
				linkClone.setAttribute('download', 'Test_Segment.csv');
				document.body.appendChild(linkClone);
				linkClone.click();
				setExportLoading(false);
			})
			.catch(() => {
				setExportLoading(false);
				swal('Failed', 'Problem in getting message type list', 'error');
			});
	};

	const _testSegment = () => {
		handleTestSegment(pageSize, 1, sortColumn, sortOrder, filterPlayerId, filterUserName);
	};

	const searchResult = () => {
		if (playerList.length > 0) {
			setCurrentPage(1);
			handleTestSegment(pageSize, 1, sortColumn, sortOrder, filterPlayerId, filterUserName);
		}

		if (playerList.length !== 0) {
			setCurrentPage(1);
			handleTestSegment(pageSize, 1, sortColumn, sortOrder, filterPlayerId, filterUserName);
		}
	};

	const handleChangeSegmentType = (data: LookupModel) => {
		if (data) setSegmentType(data);
	};

	// Table content
	const columnDefsClone : (ColDef<PlayerModel> | ColGroupDef<PlayerModel>)[] = [
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

	//	Elements

	const SaveSegmentBtn = () => (
		<>
			<div className='separator separator-dashed my-5'></div>
			<FormGroupContainer>
				<div className='col-lg-2' style={buttonStyle}>
					<MlabButton
						access={access?.includes(USER_CLAIMS.SegmentationWrite)}
						size={'sm'}
						label={'Save Segment'}
						style={ElementStyle.primary}
						type={'button'}
						weight={'solid'}
						loading={loading || segmentLoading}
						disabled={loading || segmentLoading}
						loadingTitle={' Please wait...'}
						onClick={saveSegmentClone}
					/>
				</div>
			</FormGroupContainer>
		</>
	);

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
							isDisabled={true}
						/>
					</div>
					<div className='col-lg-3'>
						<label className='col-form-label required'>Input Type</label>
						<Select
							autoComplete='off'
							size='small'
							style={{width: '100%'}}
							className='right'
							options={segmentCloneInputTypeOptionList}
							onChange={handleChangeCloneSegmentInputType}
							value={segmentCloneInputType}
							isDisabled={true}
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
							onChange={(e) => handleSegmentNameOnChange(e.target.value)}
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
							onChange={(e) => handleSegmentDescOnChange(e.target.value)}
						></textarea>
					</div>
				</FormGroupContainer>
				<div className='separator separator-dashed my-5'></div>
				{segmentCloneInputType && segmentCloneInputType.value === SegmentInputTypes.Condition && (
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
				{segmentCloneInputType && segmentCloneInputType.value === SegmentInputTypes.CustomQuery && (
					<CustomQueryView customQuery={segmentCloneCustomQuery} setCustomQuery={setSegmentCloneCustomQuery} />
				)}
				<div className='separator separator-dashed my-5'></div>

				<FormGroupContainer>
					<TestSegment
						loading={segmentLoading}
						queryForm={stringQuery}
						segmentConditions={segmentState.segmentConditions}
						testSegment={_testSegment}
						segmentInputType={segmentCloneInputType}
					/>
				</FormGroupContainer>

				<FormGroupContainer>
					<div className='row mb-3'>
						<div className='col-lg-3'>
							<label>Player Id</label>
							<input type='text' className='form-control form-control-sm' value={filterPlayerId} onChange={handleFilterPlayerIdChange} />
						</div>
						<div className='col-lg-3'>
							<label>User Name</label>
							<input type='text' className='form-control form-control-sm' value={filterUserName} onChange={handleFilterPlayerNameChange} />
						</div>
					</div>
				</FormGroupContainer>
				<FormGroupContainer>
					<FormGroupContainer>
						<div className='col'>
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
						<div className='col align-self-end' style={{marginRight: '-25px'}}>
							<MlabButton
								type={'button'}
								weight={'solid'}
								style={ElementStyle.primary}
								access={access?.includes(USER_CLAIMS.SegmentationRead) || access?.includes(USER_CLAIMS.SegmentationWrite)}
								label={'Export to CSV'}
								loading={exportLoading}
								disabled={exportLoading}
								loadingTitle={' Please wait...'}
								onClick={() => handleExportToCSV()}
								additionalClassStyle={'float-end'}
							>
								<span>
									<FontAwesomeIcon icon={faFileExport} title={'Export'} style={{color: 'white'}} />
								</span>
								&nbsp;Export to CSV
							</MlabButton>
						</div>
					</FormGroupContainer>
				</FormGroupContainer>
				<FormGroupContainer>
					<div className='ag-theme-quartz mt-5' style={{height: 400, width: '100%', marginBottom: '50px'}}>
						<AgGridReact
							rowData={playerList}
							defaultColDef={{
								sortable: true,
								resizable: true,
							}}
							components={{
								tableLoader: tableCloneLoader,
							}}
							onGridReady={onGridReady}
							rowBuffer={0}
							//enableRangeSelection={true} //deprecated in AgGridReactver.32.0.0
							pagination={false}
							paginationPageSize={pageSize}
							columnDefs={columnDefsClone}
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

				<SaveSegmentBtn />
			</ContentContainer>
		</MainContainer>
	);
};

export default CloneSegment;
