import { faDotCircle, faFileExport } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { AgGridReact } from 'ag-grid-react';
import { Guid } from 'guid-typescript';
import moment from 'moment';
import { useEffect, useReducer, useState } from 'react';
import { shallowEqual, useSelector } from 'react-redux';
import { Prompt, useHistory, useParams } from 'react-router-dom';
import Select from 'react-select';
import swal from 'sweetalert';
import { QueryFormView, SegmentConditions, TestSegment } from '.';
import { RootState } from '../../../../../setup';
import * as hubConnection from '../../../../../setup/hub/MessagingHub';
import {
	ElementStyle,
	HttpStatusCodeEnum,
	PROMPT_MESSAGES,
	SegmentPageAction,
	SegmentStateActionTypes,
	SegmentTypes
} from '../../../../constants/Constants';
import useConstant from '../../../../constants/useConstant';
import {
	ButtonsContainer,
	ContentContainer,
	DefaultGridPagination,
	FormGroupContainer,
	MainContainer,
	MlabButton
} from '../../../../custom-components';
import { useQuery, useUnload } from '../../../../custom-functions';
import { LookupModel } from '../../../../shared-models/LookupModel';
import { IAuthState } from '../../../auth';
import { USER_CLAIMS } from '../../../user-management/components/constants/UserClaims';
import {
	PlayerModel,
	SegmentConditionSaveRequestModel,
	SegmentSaveRequestModel,
	SegmentTestRequestModel,
	SegmentTestResponseModel,
	SegmentToStaticRequestModel
} from '../models';
import * as segmentManagement from '../redux/SegmentationRedux';
import { exportToCsv, testSegment, testSegmentResult, toStaticSegment, upsertSegment, validateSegmentName } from '../redux/SegmentationService';
import useSegmentConstant from '../useSegmentConstant';
import { initialSegmentState, segmentReducer } from '../utils/SegmentState';
import { useQueryForm, useValidateConditions } from './shared/hooks';
import useSegmentInputTypeOptions from './shared/hooks/useSegmentInputTypeOptions';
import { ColDef, ColGroupDef } from 'ag-grid-community';

interface Props {
	setSegmentTabType?: any;
	selectedSegmentOption?: any;
	setSegmentObjectName?: any;
	setSegmentObjectDesc?: any;
	segmentObjectVarianceList?: any;
	setSegmentObjectStatus: (e: any) => void;
	segmentObjectQuery?: any;
	segmentObjectConditions: any;
	setSegmentCondition: (e: any) => void;
	setSegmentObjectQuery: (e: any) => void;
	setSegmentObjectQueryJoins: (e: any) => void;
	segmentObjectInFilePlayerIds: any;
	setSegmentObjectInFilePlayerIds?: (e: any) => void;
}

export const ConvertToStatic: React.FC<Props> = ({
	setSegmentTabType,
	selectedSegmentOption,
	setSegmentObjectName,
	setSegmentObjectDesc,
	segmentObjectVarianceList,
	setSegmentObjectStatus,
	setSegmentObjectQuery,
	segmentObjectConditions,
	setSegmentCondition,
	setSegmentObjectQueryJoins,
	segmentObjectInFilePlayerIds,
	setSegmentObjectInFilePlayerIds,
}) => {
	// Hooks
	const query = useQuery();
	const history = useHistory();
	const {actionName, segmentId} = useParams();
	const {SwalConfirmMessage, SegmentInputTypes} = useSegmentConstant();
	const {successResponse, HubConnected, SwalSegmentMessage} = useConstant();
	const {userId, access} = useSelector<RootState>(({auth}) => auth, shallowEqual) as IAuthState;
	const [segmentState, dispatch] = useReducer(segmentReducer, {...initialSegmentState});
	const {stringQuery, styledQuery, getStaticQueryForm} = useQueryForm(segmentState.segmentConditions);
	const {validateConditions} = useValidateConditions();
	const {getSegmentInputTypeList} = useSegmentInputTypeOptions();

	// States and Variables

	const [loading, setLoading] = useState(false);
	const [saveLoading, setSaveLoading] = useState(false);
	const [exportLoading, setExportLoading] = useState(false);
	const [conditionLogic, setConditionLogic] = useState('AND');
	const [playerList, setPlayerList] = useState<Array<PlayerModel>>([]);
	const [filteredPlayerList, setFilteredPlayerList] = useState<Array<PlayerModel>>([]);
	const [filterPlayerId, setFilterPlayerId] = useState('');
	const [filterUserName, setFilterUserName] = useState('');

	const [segmentInfo, setSegmentInfo] = useState<SegmentSaveRequestModel>({
		segmentId: 0,
		segmentName: '',
		segmentDescription: '',
		isActive: true,
		isStatic: false,
		queryForm: '',
		segmentConditions: [],
		queueId: '',
		userId: userId !== null && userId !== undefined ? userId.toString() : '',
		queryFormTableau: '',
		inputTypeId: 0,
	} as SegmentSaveRequestModel);
	const [segmentName, setSegmentName] = useState('');
	const [segmentDescription, setSegmentDescription] = useState('');
	const [queryForm, setQueryForm] = useState('');
	const [userAction, setUserAction] = useState('');
	const [validRedirect, setValidRedirect] = useState(false);
	const [playerIds, setPlayerIds] = useState('');

	//server-side pagination states
	const [pageSize, setPageSize] = useState<number>(10);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [recordCount, setRecordCount] = useState<number>(0);
	const [sortOrder, setSortOrder] = useState<string>('ASC');
	const [sortColumn, setSortColumn] = useState<string>('PlayerId');

	const [gridApi, setGridApi] = useState(null);
	const [gridColumnApi, setGridColumnApi] = useState(null);
	const [segmentType, setSegmentType] = useState<LookupModel | null>();
	const [segmentStaticInputType, setSegmentStaticInputType] = useState<any>(null);
	const [segmentStaticInputTypeOptionList, setSegmentStaticInputTypeOptionList] = useState<Array<LookupModel>>([]);

	// temp dropdowns - should be from masterReference
	const segmentationType = [
		{value: '193', label: 'Normal'},
		{value: '194', label: 'Distribution'},
	];

	// Side Effects
	useUnload((e: any) => {
		e.preventDefault();
		e.returnValue = '';
	});

	useEffect(() => {
		initializeComponent();
		return () => {
			resetForm();
		};
	}, []);

	useEffect(() => {
		const updatedConditions = segmentState.segmentConditions.map((item: any) => {
			if (item.parentKey === '' || item.parentKey === null) {
				return {...item, segmentConditionLogicOperator: conditionLogic};
			}
			return item;
		});
		dispatch({type: SegmentStateActionTypes.SegmentConditions, payload: [...updatedConditions]});
	}, [conditionLogic]);

	useEffect(() => {
		setFilteredPlayerList(playerList);
	}, [playerList]);

	// Methods
	const resetForm = () => {
		dispatch({type: SegmentStateActionTypes.ResetState});
		setSegmentName('');
		setSegmentDescription('');
		setQueryForm('');
		setPlayerList([]);
		setValidRedirect(false);
	};

	const onPageSizeChanged = () => {
		var value: string = (document.getElementById('page-size') as HTMLInputElement).value;
		setPageSize(Number(value));
		setCurrentPage(1);

		if (playerList != undefined && playerList.length > 0) {
			testSegmentRequest(Number(value), 1, sortColumn, sortOrder, filterPlayerId, filterUserName);
		}
	};

	const onClickFirst = () => {
		if (currentPage > 1) {
			setCurrentPage(1);
			testSegmentRequest(pageSize, 1, sortColumn, sortOrder, filterPlayerId, filterUserName);
		}
	};

	const onClickPrevious = () => {
		if (currentPage > 1) {
			setCurrentPage(currentPage - 1);
			testSegmentRequest(pageSize, currentPage - 1, sortColumn, sortOrder, filterPlayerId, filterUserName);
		}
	};

	const onClickNext = () => {
		if (totalPage() > currentPage) {
			setCurrentPage(currentPage + 1);
			testSegmentRequest(pageSize, currentPage + 1, sortColumn, sortOrder, filterPlayerId, filterUserName);
		}
	};

	const onClickLast = () => {
		if (totalPage() > currentPage) {
			setCurrentPage(totalPage());
			testSegmentRequest(pageSize, totalPage(), sortColumn, sortOrder, filterPlayerId, filterUserName);
		}
	};

	const totalPage = () => {
		return Math.ceil(recordCount / pageSize) | 0;
	};

	const onSort = (e: any) => {
		setCurrentPage(1);

		if (playerList != undefined && playerList.length > 0) {
			var sortDetail = e.api.getSortModel();
			if (sortDetail[0] != undefined) {
				setSortColumn(sortDetail[0]?.colId);
				setSortOrder(sortDetail[0]?.sort);
				testSegmentRequest(pageSize, 1, sortDetail[0]?.colId, sortDetail[0]?.sort, filterPlayerId, filterUserName);
			} else {
				setSortColumn('');
				setSortOrder('');
				testSegmentRequest(pageSize, currentPage, '', '', filterPlayerId, filterUserName);
			}
		}
	};

	const initializeComponent = () => {
		if (!conditionLogic) {
			setConditionLogic('AND')
		}
		setSegmentName('');
		setSegmentDescription('');
		setQueryForm('');
		setPlayerList([]);
		setSegmentType({value: '1', label: 'Normal'}); //Segment Type distribution not applicable to convert to static
		setUserAction('Convert to Static');
		getToStaticSegment(Number(segmentId));
	};

	const handleChangeStaticSegmentInputType = (data: LookupModel) => {
		if (data) {
			setSegmentStaticInputType(data);
		}
	};

	const getToStaticSegment = async (segmentId: number) => {
		const inputTypeOptionsStaticData = await getSegmentInputTypeList();
		setSegmentStaticInputTypeOptionList(inputTypeOptionsStaticData);

		setLoading(true);
		const request: SegmentToStaticRequestModel = {
			queueId: Guid.create().toString(),
			userId: userId !== null && userId !== undefined ? userId.toString() : '',
			segmentId: segmentId,
		};
		await toStaticSegment(request)
			.then((returnData) => {
				const data = Object.assign(returnData.data);

				if (data?.players.length === 0) {
					setValidRedirect(true);
					swal({
						title: SwalSegmentMessage.titleConvertStatic,
						text: SwalSegmentMessage.textPlayerUnavailable,
						icon: 'error',
						dangerMode: true,
					}).then((onConfirm) => {
						if (onConfirm) {
							history.push('/player-management/segmentation-list');
						}
					});
				} else {
					data.segmentation.isStatic = true;
					setSegmentName(data.segmentation.segmentName + '_static');
					setSegmentDescription(data.segmentation.segmentDescription);
					data.segmentation.isActive = true; // Segment set to active initially
					setSegmentInfo(data.segmentation);
					dispatch(segmentManagement.actions.setSegmentInfo(data.segmentation));
					setPlayerList(data.players);
					setPlayerIds(data.playerIdList);
					setRecordCount(data.playerIdList.split(',').length);

					setSegmentStaticInputType(inputTypeOptionsStaticData.find((x: any) => x.value === SegmentInputTypes.Condition));

					setLoading(false);
				}
			})
			.catch(() => {
				setLoading(false);
				swal(SwalSegmentMessage.titleFailed, SwalSegmentMessage.textProblemConvert, SwalSegmentMessage.iconError);
			});
	};

	//pageSize, currentPage, sortColumn, sortOrder
	const testSegmentRequest = (
		paramPageSize: number = pageSize,
		paramCurrentPage: number = currentPage,
		paramSortColumn: string = sortColumn,
		paramSortOrder: string = sortOrder,
		paramSearchPlayerId: string = '',
		paramSearchUserName: string = ''
	) => {
		const isValid = validateConditions(segmentState.segmentConditions);

		// ---  ADD SEARCH FUNCTION  --- //
		let searchFilter = '';

		if (paramSearchPlayerId !== '' && paramSearchUserName.trim() !== '') {
			searchFilter = ` AND p.PlayerId = '${paramSearchPlayerId}'` + ` AND p.Username like '%${paramSearchUserName}%'`;
		}

		if (paramSearchPlayerId !== '' && paramSearchUserName.trim() === '') {
			searchFilter = ` AND p.PlayerId = '${paramSearchPlayerId}'`;
		}

		if (paramSearchPlayerId === '' && paramSearchUserName.trim() !== '') {
			searchFilter = ` AND p.Username LIKE '%${paramSearchUserName}%'`;
		}

		if (isValid) {
			setLoading(true);
			setTimeout(() => {
				/**** IMPORTANT ****
          New Strategy for Test Segment in consideration for Static Segments with Hundred Thousand Ids and upwards (Causes serious performance issues, should be handled at SP level)

          1. If Segment isStatic = true, pass only the searchFilter and segmentId 
            - If action = tostatic, this means that it is not yet saved (add mode as static), 
              the segmentId will be from the source segment
            - If action != tostatic, this means that it is already added and we can just 
              use the query from in the database 

            - IMPORTANT NOTE: the Query Form will be fetched directly from the Segment Table
            and will be concatenated as @QueryForm + @SearchFilter in the dynamic script

          2. If Segment isStatic = false, pass both queryForm + searchFilter
             - this meansthat the queryForm will be short and can be passed directly from the UI
        **** IMPORTANT ****/

				const staticQueryForm = getStaticQueryForm(playerIds);
				const parsedQueryForm = (actionName === SegmentPageAction.CONVERT_TO_STATIC) === true ? searchFilter : staticQueryForm + searchFilter;

				const messagingHub = hubConnection.createHubConnenction();
				messagingHub.start().then(() => {
					const request: SegmentTestRequestModel = {
						queryForm: parsedQueryForm,
						userId: userId !== null && userId !== undefined ? userId.toString() : '',
						queueId: Guid.create().toString(),
						pageSize: paramPageSize,
						offsetValue: (paramCurrentPage - 1) * paramPageSize,
						sortColumn: paramSortColumn,
						sortOrder: paramSortOrder,
						segmentId:
							actionName === SegmentPageAction.CONVERT_TO_STATIC || searchFilter == ''
								? segmentInfo.segmentId // If isStatic, pass the SegmentId of the Segment (if action = edit / clone) OR the Source Segment (If action = tostatic)
								: undefined,
					};

					testSegment(request)
						.then((response) => {
							if (response.status === HttpStatusCodeEnum.Ok) {
								messagingHub.on(request.queueId.toString(), (message) => {
									testSegmentResult(message.cacheId)
										.then((returnData) => {
											let resultData = Object.assign({}, returnData.data as SegmentTestResponseModel);
											setPlayerList(resultData.players);
											setRecordCount(resultData.recordCount);
											if (resultData === undefined || (resultData && resultData.players.length === 0)) {
												swal(SwalSegmentMessage.textTestSegment, SwalSegmentMessage.textNoRecord, SwalSegmentMessage.iconInfo);
											}
											setLoading(false);
										})
										.catch(() => {
											setLoading(false);
										});
									messagingHub.off(request.queueId.toString());
									messagingHub.stop();
								});

								setTimeout(() => {
									if (messagingHub.state === HubConnected) {
										messagingHub.stop();
										setLoading(false);
									}
								}, 30000);
							} else {
								messagingHub.stop();
								swal(SwalSegmentMessage.titleFailed, response.data.message, SwalSegmentMessage.iconError);
							}
						})
						.catch(() => {
							messagingHub.stop();
							swal(SwalSegmentMessage.titleFailed, SwalSegmentMessage.textProblemInMessageType, SwalSegmentMessage.iconError);
						});
				});
			}, 1000);
		}
	};

	const saveSegment = async () => {
		let isValid = validateConditions(segmentState.segmentConditions);

		if (segmentDescription.trim() === '' || segmentName.trim() === '') {
			isValid = false;
			swal(PROMPT_MESSAGES.FailedValidationTitle, SwalSegmentMessage.textSegmentMandatory, 'error');
		}

		const response = await validateSegmentName(segmentName, actionName === 'edit' ? segmentInfo.segmentId : undefined);
		if (response.data && response.data.status !== 200) {
			isValid = false;
			swal(PROMPT_MESSAGES.FailedValidationTitle, SwalSegmentMessage.textSegmentExists, 'error');
		}

		if (isValid) {
			swal({
				title: SwalConfirmMessage.title,
				text: SwalConfirmMessage.textSaveChannel,
				icon: SwalConfirmMessage.icon,
				buttons: [SwalConfirmMessage.btnNo, SwalConfirmMessage.btnYes],
				dangerMode: true,
			}).then((onConfirm) => {
				if (onConfirm) {
					setValidRedirect(true);
					saveValidatedData();
				}
			});
		}
	};

	const saveValidatedData = () => {
		setLoading(true);
		setSaveLoading(true);
		setTimeout(() => {
			const messagingHub = hubConnection.createHubConnenction();
			messagingHub
				.start()
				.then(() => {
					if (messagingHub.state === HubConnected) {
						let segmentRequest: SegmentSaveRequestModel = {
							segmentId: actionName === 'edit' ? segmentInfo.segmentId : 0,
							segmentName: segmentName,
							segmentDescription: segmentDescription,
							isActive: segmentInfo.isActive,
							isStatic: true,
							staticParentId: segmentId,
							queryForm: getStaticQueryForm(playerIds),
							queryFormTableau: '',
							segmentTypeId: parseInt(SegmentTypes.Normal), //default segment type for convert to static
							inputTypeId: parseInt(SegmentInputTypes.Condition),
							segmentConditions: segmentState.segmentConditions.map((i: any) => {
								const item: SegmentConditionSaveRequestModel = {
									segmentConditionId: actionName === 'edit' ? i.segmentConditionId : 0,
									segmentId: actionName === 'edit' ? segmentInfo.segmentId : 0,
									segmentName: segmentName,
									segmentConditionType: i.segmentConditionType.toString(),
									segmentConditionLogicOperator: i.segmentConditionLogicOperator,
									segmentConditionFieldId: i.segmentConditionFieldId,
									relationalOperatorId: i.relationalOperatorId,
									segmentConditionValue: actionName === SegmentPageAction.CONVERT_TO_STATIC ? playerIds : i.segmentConditionValue,
									segmentConditionValue2: i.segmentConditionValue2,
									key: i.key,
									parentKey: i.parentKey?.trim() === '' ? undefined : i.parentKey,
									createdBy: userId ? parseInt(userId) : 0,
									updatedBy: userId ? parseInt(userId) : 0,
								};
								return item;
							}),
							queueId: Guid.create().toString(),
							userId: userId !== null && userId !== undefined ? userId.toString() : '',
						};
						upsertSegment(segmentRequest)
							.then((response) => {
								if (response.status === successResponse) {
									messagingHub.on(segmentRequest.queueId.toString(), (message) => {
										let resultData = JSON.parse(message.remarks);

										if (resultData.Status === successResponse) {
											let segmentIdSaved = resultData.Data;
											setLoading(false);
											setSaveLoading(false);
											swal(PROMPT_MESSAGES.SuccessTitle, 'Successfully saved the template', 'success');
											redirectToViewSegment(segmentIdSaved);
										} else {
											swal(PROMPT_MESSAGES.FailedValidationTitle, 'Problem connecting to the server, Please refresh', 'error');
										}

										messagingHub.off(segmentRequest.queueId.toString());
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
							})
							.catch((err) => {
								setLoading(false);
								setSaveLoading(false);
								messagingHub.stop();
								console.log('Error while starting connection: ' + err);
							});
					}
				})
				.catch((err) => console.log('Error while starting connection: ' + err));
		}, 1000);
	};

	const redirectToViewSegment = (segmentId: any) => {
		history.push('/player-management/segment/view/' + segmentId);
	};

	const handleExportToCSV = () => {
		setExportLoading(true);
		const request: SegmentTestRequestModel = {
			queryForm: queryForm,
			segmentId: segmentId,
			userId: userId !== null && userId !== undefined ? userId.toString() : '',
			queueId: Guid.create().toString(),
			pageSize: recordCount,
			offsetValue: 0,
			sortColumn: sortColumn,
			sortOrder: sortOrder,
		};
		// preparing data
		setExportLoading(true);
		exportToCsv(request)
			.then((response) => {
				const url = window.URL.createObjectURL(new Blob([response.data]));
				const link = document.createElement('a');
				link.href = url;
				link.setAttribute('download', 'Test_Segment.csv');
				document.body.appendChild(link);
				link.click();
				setExportLoading(false);
			})
			.catch(() => {
				setExportLoading(false);
				swal(PROMPT_MESSAGES.FailedValidationTitle, 'Problem in getting message type list', 'error');
			});
	};

	const _testSegment = () => {
		testSegmentRequest();
	};

	const searchResult = () => {
		if (playerList.length > 0) {
			setCurrentPage(1);
			testSegmentRequest(pageSize, 1, sortColumn, sortOrder, filterPlayerId, filterUserName);
		}
	};

	const onGridReady = (params: any) => {
		setGridApi(params.api);
		setGridColumnApi(params.columnApi);
		params.api.sizeColumnsToFit();
	};

	const handleSegmentNameOnChange = (event: any) => {
		setSegmentName(event.target.value);
	};

	const handleSegmentDescOnChange = (event: any) => {
		setSegmentDescription(event.target.value);
	};

	const handleFilterPlayerIdChange = (event: any) => {
		setFilterPlayerId(event.target.value);
	};

	const handleFilterPlayerNameChange = (event: any) => {
		setFilterUserName(event.target.value);
	};

	// Table Content and Headers
	const columnCTSDefs: (ColDef<PlayerModel> | ColGroupDef<PlayerModel>)[] = [
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

	// Table Loader
	const tableLoader = (data: any) => {
		return (
			<div className='ag-custom-loading-cell' style={{paddingLeft: '10px', lineHeight: '25px'}}>
				<i className='fas fa-spinner fa-pulse'></i> <span> {data.loadingMessage}</span>
			</div>
		);
	};

	const handleChangeSegmentType = (data: LookupModel) => {
		if (data) {
			setSegmentType(data);
		}
	};

	return (
		<MainContainer>
			<Prompt
				message={() => {
					return validRedirect ? true : 'Are you sure you want to leave? Changes you made may not be saved.';
				}}
			/>

			<ContentContainer>
				<FormGroupContainer>
				<div className='col-lg-3'>
						<label className='col-form-label required'>Segment Type</label>

						<Select
							autoComplete='off'
							size='small'
							style={{width: '100%'}}
							className='right'
							options={segmentationType}
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
							options={segmentStaticInputTypeOptionList}
							onChange={handleChangeStaticSegmentInputType}
							value={segmentStaticInputType}
							isDisabled={true}
						/>
					</div>
					<div className='col-lg-2'>
						<FormGroupContainer>
						<label className='col-form-label'>Segment Status:</label>

						<label className='col-form-label px-5' style={segmentInfo.isActive ? {color: 'green'} : {}}>
							{segmentInfo && <><FontAwesomeIcon icon={faDotCircle} style={{marginRight: "5px"}} /> { (segmentInfo.isActive ? 'Active' : 'Inactive') } </> }
						</label>	
						</FormGroupContainer>
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
							onChange={handleSegmentNameOnChange}
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
				<SegmentConditions
					segmentState={segmentState}
					dispatch={dispatch}
					setSegmentConditionInFilePlayersIdList={setSegmentObjectInFilePlayerIds}
					setSegmentConditions={setSegmentCondition}
				/>
				<QueryFormView queryForm={styledQuery} />
				<div className='separator separator-dashed my-5'></div>
				<FormGroupContainer>
					<TestSegment
						loading={loading}
						segmentInputType={SegmentInputTypes.Condition}
						queryForm={queryForm}
						segmentConditions={segmentState.segmentConditions}
						testSegment={_testSegment}
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
						<div className='col-sm-2'>
							<div className='d-grid gap-2 pt-6'></div>
						</div>
					</div>
				</FormGroupContainer>
				<FormGroupContainer>
					<div className='col'>
						<MlabButton
							access={access?.includes(USER_CLAIMS.SegmentationRead) || access?.includes(USER_CLAIMS.SegmentationWrite)}
							size={'sm'}
							label={'Search'}
							style={ElementStyle.primary}
							type={'button'}
							weight={'solid'}
							loading={loading}
							disabled={loading || actionName === SegmentPageAction.VIEW}
							loadingTitle={' Please wait...'}
							onClick={() => searchResult()}
						/>
					</div>
					<div className='col align-self-end' style={{marginRight: '-7px'}}>
						<MlabButton
							type={'button'}
							weight={'solid'}
							style={ElementStyle.primary}
							access={access?.includes(USER_CLAIMS.SegmentationRead) || access?.includes(USER_CLAIMS.SegmentationWrite)}
							label={'Export to CSV'}
							loading={loading}
							disabled={loading || actionName === SegmentPageAction.VIEW}
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
				<FormGroupContainer>
					<div className='ag-theme-quartz mt-5' style={{height: 400, width: '100%', marginBottom: '50px'}}>
						<AgGridReact
							rowData={filteredPlayerList}
							defaultColDef={{
								sortable: true,
								resizable: true,
							}}
							components={{
								tableLoader: tableLoader,
							}}
							onGridReady={onGridReady}
							rowBuffer={0}
							//enableRangeSelection={true} //deprecated in AgGridReactver.32.0.0
							pagination={false}
							paginationPageSize={pageSize}
							columnDefs={columnCTSDefs}
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

				<FormGroupContainer>
					<ButtonsContainer>
						<MlabButton
							access={access?.includes(USER_CLAIMS.SegmentationWrite)}
							size={'sm'}
							label={'Save Segment'}
							style={ElementStyle.primary}
							type={'button'}
							weight={'solid'}
							loading={saveLoading}
							disabled={saveLoading}
							loadingTitle={' Please wait...'}
							onClick={() => saveSegment()}
						/>
					</ButtonsContainer>
				</FormGroupContainer>
			</ContentContainer>
		</MainContainer>
	);
};
