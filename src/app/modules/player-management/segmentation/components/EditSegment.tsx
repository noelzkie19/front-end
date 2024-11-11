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
import { MasterReferenceOptionModel } from '../../../../common/model';
import { MasterReferenceOptionListModel } from '../../../../common/model/system/options/MasterReferenceOptionListModel';
import { GetMasterReferenceList } from '../../../../common/services';
import { ElementStyle, HttpStatusCodeEnum, PROMPT_MESSAGES, SegmentStateActionTypes } from '../../../../constants/Constants';
import useConstant from '../../../../constants/useConstant';
import { ContentContainer, DefaultGridPagination, FormGroupContainer, MainContainer, MlabButton } from '../../../../custom-components';
import { usePromptOnUnload } from '../../../../custom-helpers';
import { LookupModel } from '../../../../shared-models/LookupModel';
import { IAuthState } from '../../../auth';
import { USER_CLAIMS } from '../../../user-management/components/constants/UserClaims';
import { InFileSegmentPlayerModel, PlayerModel, SegmentSaveRequestModel, SegmentTestRequestModel } from '../models';
import { exportToCsv, getSegmentById, upsertSegment } from '../redux/SegmentationService';
import useSegmentConstant from '../useSegmentConstant';
import { initialSegmentState, segmentReducer } from '../utils/SegmentState';
import { QueryFormView, SegmentConditions, TestSegment } from './shared/components';
import { useQueryForm, useTestSegment, useValidateConditions } from './shared/hooks';
import useSegmentInputTypeOptions from './shared/hooks/useSegmentInputTypeOptions';
import { ColDef, ColGroupDef } from 'ag-grid-community';

interface Props {
	setSegmentQueryInputType?: any;
	setSegmentTabType?: any;
	selectedSegmentOption?: any;
	setSegmentObjectName?: any;
	setSegmentObjectDesc?: any;
	segmentObjectQuery?: any;
	segmentObjectConditions: any;
	segmentObjectVarianceList?: any;
	segmentObjectInFilePlayerIds: any;
	setSegmentObjectStatus: (e: any) => void;
	setSegmentCondition: (e: any) => void;
	setSegmentObjectQuery: (e: any) => void;
	setSegmentObjectQueryJoins: (e: any) => void;
	setSegmentObjectVarianceList: (e: any) => void;
	setSegmentObjectInFilePlayerIds: (e: any) => void;
	setSegmentObjectIsReactivated: (e: any) => void;
	setSegmentObjectQueryTableau: (e: any) => void;
	setSegmentObjectCustomQueryEdit: (e: any) => void;
}

const EditSegment: React.FC<Props> = ({
	setSegmentQueryInputType,
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
	setSegmentObjectVarianceList,
	setSegmentObjectInFilePlayerIds,
	setSegmentObjectIsReactivated,
	setSegmentObjectQueryTableau,
	segmentObjectInFilePlayerIds,
	setSegmentObjectCustomQueryEdit,
}) => {
	/**
	 * ? Redux
	 */
	const {userId, access} = useSelector<RootState>(({auth}) => auth, shallowEqual) as IAuthState;

	/**
	 *  ? States
	 */
	const [segmentEditInputType, setSegmentEditInputType] = useState<any>(null);
	const [segmentType, setSegmentType] = useState<any>();
	const [segmentStatus, setSegmentStatus] = useState<boolean>(false);
	const [segmentName, setSegmentName] = useState<string>('');
	const [segmentDescription, setSegmentDescription] = useState<string>('');
	const [segmentIsReactivated, setSegmentIsReactivated] = useState<boolean>();
	const [queryForm, setQueryForm] = useState<string>('');
	const [loading, setLoading] = useState<boolean>(false);
	const [filterPlayerId, setFilterPlayerId] = useState('');
	const [filterUserName, setFilterUserName] = useState('');
	const [pageSize, setPageSize] = useState<number>(10);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [sortOrder, setSortOrder] = useState<string>('ASC');
	const [sortColumn, setSortColumn] = useState<string>('PlayerId');
	const [conditionLogic, setConditionLogic] = useState<string>('AND');
	const [buttonStyle, setButtonStyle] = useState<any>({});
	const [exportLoading, setExportLoading] = useState(false);
	const [segmentConditionInFilePlayersIdList, setSegmentConditionInFilePlayersIdList] = useState<Array<InFileSegmentPlayerModel>>([]);
	const [segmentTypeOptionList, setSegmentTypeOptionList] = useState<Array<LookupModel>>([]);
	const [tableauEventQueueId, setTableauEventQueueId] = useState('');
	const [queryFormTableauPersisted, setQueryFormTableauPersisted] = useState('');
	const [segmentEditInputTypeOptionList, setSegmentEditInputTypeOptionList] = useState<Array<LookupModel>>([]);
	const [segmentEditCustomQuery, setSegmentEditCustomQuery] = useState('');

	/**
	 * ? Hooks
	 */
	const {SegmentTypes, segmentTypeMasterRefId, SwalConfirmMessage, SegmentInputTypes} = useSegmentConstant();
	const {segmentId} = useParams();
	const [segmentState, dispatch] = useReducer(segmentReducer, {...initialSegmentState});
	const {stringQuery, stringQueryMLab, stringQueryTableau, styledQuery, tableJoins} = useQueryForm(segmentState.segmentConditions);
	const {validateConditions, validateTestSegment, validateCustomQuery, validateRequiredFields} = useValidateConditions();
	const {HubConnected, successResponse, SwalServerErrorMessage} = useConstant();
	const history = useHistory();
	usePromptOnUnload(true, 'Changes you made may not be saved.');
	const {segmentLoading, handleTestSegment, recordCount, playerList, handleSetStringQuery, handleSetTableJoins, handleSetSegmentState, handleSetInputType, handleSetSegmentCustomQuery} =
		useTestSegment();
	const {getSegmentInputTypeList} = useSegmentInputTypeOptions();

	// Effects
	useEffect(() => {
		getSegmentInfo(segmentId);
	}, []);

	useEffect(() => {
		setSegmentObjectQuery(stringQueryMLab);
		setSegmentObjectQueryJoins(tableJoins);
		setSegmentObjectQueryTableau(stringQueryTableau);
		handleSetStringQuery(stringQuery);
		handleSetTableJoins(tableJoins);
		handleSetSegmentState(segmentState.segmentConditions);
	}, [stringQuery]);

	useEffect(() => {
		setSegmentObjectCustomQueryEdit(segmentEditCustomQuery);
		handleSetSegmentCustomQuery(segmentEditCustomQuery);
	}, [segmentEditCustomQuery]);

	useEffect(() => {
		setSegmentObjectInFilePlayerIds(segmentConditionInFilePlayersIdList);
	}, [segmentConditionInFilePlayersIdList]);

	// Methods
	const getSegmentTypeEditOptions = async () => {
		let optionsEdit: Array<LookupModel> = [];
		await GetMasterReferenceList(segmentTypeMasterRefId)
			.then((response: any) => {
				if (response.status === 200) {
					let masterReferenceList = Object.assign(new Array<MasterReferenceOptionListModel>(), response.data);

					let masterRefList = Array<MasterReferenceOptionModel>();

					masterReferenceList
						.filter((x: MasterReferenceOptionListModel) => x.isParent === false)
						.forEach((item: any) => {
							const editOptionVal: MasterReferenceOptionModel = {
								masterReferenceParentId: item.masterReferenceParentId,

								options: {label: item.masterReferenceChildName, value: item.masterReferenceId.toString()},
							};
							masterRefList.push(editOptionVal);
						});
					optionsEdit = masterRefList.flatMap((x) => x.options);
					setSegmentTypeOptionList(masterRefList.flatMap((x) => x.options));
				} else {
					console.log('Problem in master reference list');
				}
			})
			.catch(() => {
				console.log('Problem in master reference list');
			});
		return optionsEdit;
	};

	const handleChangeSegmentType = (data: LookupModel) => {
		if (data) {
			setSegmentType(data);
			dispatch({type: SegmentStateActionTypes.SegmentType, payload: data.value});
		}
	};

	const handleChangeSegmentName = (_segmentName: string) => {
		setSegmentObjectName(_segmentName);
		setSegmentName(_segmentName);
	};

	const handleChangeSegmentDescription = (_segmentDescription: string) => {
		setSegmentDescription(_segmentDescription);
		setSegmentObjectDesc(_segmentDescription);
	};

	const handleChangeEditSegmentInputType = (data: LookupModel) => {
		if (data) {
			setSegmentEditInputType(data);
			setSegmentQueryInputType(data.value.toString());
			handleSetInputType(data);

			// Clear Custom Query and Condition Values for Edit
			setSegmentEditCustomQuery('');
			dispatch({type: SegmentStateActionTypes.SegmentConditions, payload: [], invoker: 'Edit Segment - Change Input Type'});
			setSegmentCondition([]); // Clear conditions from Edit Segment
		}
	};

	const onGridReady = (params: any) => {
		params.api.sizeColumnsToFit();
	};

	/**
	 * ? Methods
	 */
	const _testSegment = () => {
		handleTestSegment(pageSize, currentPage, sortColumn, sortOrder, filterPlayerId, filterUserName);
	};

	const getSegmentInfo = async (_segmentId: number) => {
		const segmentTypeOptionsData = await getSegmentTypeEditOptions();
		const inputTypeOptionsEditData = await getSegmentInputTypeList();
		setSegmentTypeOptionList(segmentTypeOptionsData);
		setSegmentEditInputTypeOptionList(inputTypeOptionsEditData);

		setLoading(true);
		getSegmentById(_segmentId)
			.then((response) => {
				if (response.status === HttpStatusCodeEnum.Ok) {
					const data = Object.assign(response.data);
					// local states
					setSegmentName(data.segmentName);
					setSegmentDescription(data.segmentDescription);
					setSegmentStatus(data.isActive);
					setSegmentObjectStatus(data.isActive);
					setSegmentType(segmentTypeOptionsData.find((x: any) => x.value === data.segmentTypeId.toString()));

					setSegmentObjectVarianceList(data.segmentVariances);
					setSegmentObjectInFilePlayerIds(data.segmentObjectInFilePlayerIds);
					setSegmentConditionInFilePlayersIdList(data.segmentConditionInFilePlayersIdList);
					dispatch({type: SegmentStateActionTypes.SegmentType, payload: data.segmentTypeId});
					setSegmentIsReactivated(data.isReactivated);
					setSegmentObjectIsReactivated(data.isReactivated);
					setTableauEventQueueId(data.tableauEventQueueId);
					setQueryFormTableauPersisted(data.queryFormTableau);
					setSegmentEditInputType(inputTypeOptionsEditData.find((x: any) => x.value === data.inputTypeId.toString()));
					setSegmentEditCustomQuery(data.queryFormTableau);
					handleSetInputType(inputTypeOptionsEditData.find((x: any) => x.value === data.inputTypeId.toString()));

					if (data.segmentTypeId.toString() === SegmentTypes.Distribution) setButtonStyle({position: 'absolute', marginTop: '30px', width: '200px'});

					// props states
					setSegmentObjectName(data.segmentName);
					setSegmentObjectDesc(data.segmentDescription);
					setSegmentTabType(data.segmentTypeId.toString());
					setSegmentQueryInputType(data.inputTypeId.toString());

					const defaultSelectedCondition = data.segmentConditions.find((i: any) => i.parentKey === null);
					if (defaultSelectedCondition) {
						setConditionLogic(defaultSelectedCondition.segmentConditionLogicOperator);
					}
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

	const redirectToViewSegment = (segmentId: any) => {
		history.push('/player-management/segment/view/' + segmentId);
	};

	const saveEditSegment = async () => {
		let isSaveEditValid = true;

		isSaveEditValid = await validateRequiredFields(
			segmentEditInputType?.value,
			segmentName,
			segmentDescription,
			segmentType?.value,
			segmentObjectVarianceList,
			segmentId,
		);

		// Validate condition if InputType = Condition
		if (isSaveEditValid === true && segmentEditInputType && segmentEditInputType.value === SegmentInputTypes.Condition) {
			isSaveEditValid = validateConditions(segmentObjectConditions);
		}

		// Validate custom query string if InputType = Custom Query
		if (isSaveEditValid === true && segmentEditInputType && segmentEditInputType.value === SegmentInputTypes.CustomQuery) {
			isSaveEditValid = await validateCustomQuery(segmentEditCustomQuery);
		}

		if (isSaveEditValid) {
			const validateTestUponCreateSegment =
				segmentEditInputType && segmentEditInputType.value === SegmentInputTypes.Condition
					? validateTestSegment(undefined, segmentState.segmentConditions)
					: false;

			if (validateTestUponCreateSegment) {
				handleTestSegment(10, 1, sortColumn, sortOrder, '', '', confirmSaveEditSegment, true);
			} else {
				confirmSaveEditSegment(SwalConfirmMessage.textSaveChannel);
			}
		}
	};

	const confirmSaveEditSegment = (confirmationMessage?: string) => {
		swal({
			title: SwalConfirmMessage.title,
			text: confirmationMessage !== undefined ? confirmationMessage : SwalConfirmMessage.textSaveChannel,
			icon: SwalConfirmMessage.icon,
			buttons: [SwalConfirmMessage.btnNo, SwalConfirmMessage.btnYes],
			dangerMode: true,
		}).then((onConfirm) => {
			if (onConfirm) {
				saveValidatedDataEdit();
			}
		});
	};

	const saveValidatedDataEdit = () => {
		setTimeout(() => {
			setLoading(true);
			const messagingHub = hubConnection.createHubConnenction();
			messagingHub
				.start()
				.then(() => {
					if (messagingHub.state === HubConnected) {
						let segmentRequest: SegmentSaveRequestModel = {
							segmentId: segmentId,
							segmentName: segmentName,
							segmentDescription: segmentDescription,
							isActive: segmentStatus,
							isStatic: false,
							staticParentId: undefined,
							queryForm: stringQueryMLab,
							segmentConditions: segmentObjectConditions,
							segmentTypeId: segmentType ? parseInt(segmentType.value) : undefined,
							queueId: Guid.create().toString(),
							userId: userId?.toString() ?? '',
							queryJoins: tableJoins,
							segmentVariances: segmentObjectVarianceList,
							InFileSegmentPlayer: segmentObjectInFilePlayerIds,
							isReactivated: segmentIsReactivated,
							queryFormTableau: segmentEditInputType?.value === SegmentInputTypes.CustomQuery ? segmentEditCustomQuery : stringQueryTableau,
							inputTypeId: segmentEditInputType && segmentEditInputType.value ? parseInt(segmentEditInputType.value) : 0,
						};

						saveEditRequest(segmentRequest, messagingHub);
					}
				})
				.catch((err) => console.log('Error while starting connection: ' + err));
		}, 1000);
	};

	const saveEditRequest = (segmentRequest: any, messagingHub: any) => {
		upsertSegment(segmentRequest)
			.then((response) => {
				if (response.status === successResponse) {
					processSavingHub(segmentRequest, messagingHub);
				} else {
					messagingHub.stop();
					swal('Failed', response.data.message, 'error');
					console.log(response.data.message);
				}
			})
			.catch((err) => {
				setLoading(false);
				messagingHub.stop();
				console.log('Error while starting connection: ' + err);
			});
	};

	const processSavingHub = (segmentRequest: any, messagingHub: any) => {
		messagingHub.on(segmentRequest.queueId.toString(), (message: any) => {
			let resultData = JSON.parse(message.remarks);
			if (resultData.Status === successResponse) {
				let segmentIdSaved = resultData.Data;
				setLoading(false);
				swal(PROMPT_MESSAGES.SuccessTitle, 'Successfully saved the template', 'success').then((onConfirmSubmit) => {
					if (onConfirmSubmit) {
						redirectToViewSegment(segmentIdSaved);
					}
				});
			} else {
				swal(SwalServerErrorMessage.title, SwalServerErrorMessage.textError, SwalServerErrorMessage.icon);
			}

			messagingHub.off(segmentRequest.queueId.toString());
			messagingHub.stop();

			setTimeout(() => {
				if (messagingHub.state === HubConnected) {
					messagingHub.stop();
				}
			}, 30000);
		});
	};

	/**
	 * ? Table Events
	 */
	const searchResult = () => {
		if (playerList.length > 0) {
			setCurrentPage(1);
			handleTestSegment(pageSize, 1, sortColumn, sortOrder, filterPlayerId, filterUserName);
		}
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

	const onPageSizeChanged = () => {
		let value: string = (document.getElementById('page-size') as HTMLInputElement).value;
		setPageSize(Number(value));
		setCurrentPage(1);

		if (playerList != undefined && playerList.length > 0) {
			handleTestSegment(Number(value), 1, sortColumn, sortOrder, filterPlayerId, filterUserName);
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

	const totalPage = () => {
		return Math.ceil(recordCount / pageSize) | 0;
	};

	const onSort = (e: any) => {
		setCurrentPage(1);

		if (playerList != undefined && playerList.length > 0) {
			let sortEditDetail = e.api.getSortModel();
			if (sortEditDetail[0] != undefined) {
				setSortColumn(sortEditDetail[0]?.colId);
				setSortOrder(sortEditDetail[0]?.sort);
				handleTestSegment(pageSize, 1, sortEditDetail[0]?.colId, sortEditDetail[0]?.sort, filterPlayerId, filterUserName);
			} else {
				setSortColumn('');
				setSortOrder('');
				handleTestSegment(pageSize, currentPage, '', '', filterPlayerId, filterUserName);
			}
		}
	};

	const columnDefsEdit : (ColDef<PlayerModel> | ColGroupDef<PlayerModel>)[] = [
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

	/**
	 *  ? Local Components
	 */

	const Separator = () => <div className='separator separator-dashed my-5'></div>;

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
						onClick={saveEditSegment}
					/>
				</div>
			</FormGroupContainer>
		</>
	);

	const TestSegmentBtn = () => (
		<FormGroupContainer>
			<TestSegment
				loading={segmentLoading}
				queryForm={queryForm}
				segmentConditions={segmentState.segmentConditions}
				testSegment={_testSegment}
				tableauEventQueueId={tableauEventQueueId}
				queryFormTableauCurrent={segmentEditInputType?.value === SegmentInputTypes.CustomQuery ? segmentEditCustomQuery : stringQueryTableau}
				queryFormTableauPersisted={queryFormTableauPersisted}
				segmentInputType={segmentEditInputType}
			/>
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
					columnDefs={columnDefsEdit}
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
	);

	//  Export
	const handleExportToCSV = () => {
		setExportLoading(true);
		const request: SegmentTestRequestModel = {
			queryForm: stringQuery,
			userId: userId !== null && userId !== undefined ? userId.toString() : '',
			queueId: Guid.create().toString(),
			pageSize: recordCount,
			offsetValue: 0,
			sortColumn: sortColumn,
			sortOrder: sortOrder,
			queryJoins: tableJoins,
		};

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
				swal('Failed', 'Problem in getting message type list', 'error');
			});
	};

	const ExportToCSV = () => (
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
	);
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
							options={segmentEditInputTypeOptionList}
							onChange={handleChangeEditSegmentInputType}
							value={segmentEditInputType}
							isDisabled={true}
						/>
					</div>
					
			<div className='col-lg-2'>
				<SegmentDistributionStatus isActive={segmentStatus} showIcon={false} isReactivated={segmentIsReactivated} />
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
							onChange={(e) => handleChangeSegmentName(e.target.value)}
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
							onChange={(e) => handleChangeSegmentDescription(e.target.value)}
						></textarea>
					</div>
				</FormGroupContainer>
				<Separator />
				{segmentEditInputType && segmentEditInputType.value === SegmentInputTypes.Condition && (
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
				{segmentEditInputType && segmentEditInputType.value === SegmentInputTypes.CustomQuery && (
					<CustomQueryView customQuery={segmentEditCustomQuery} setCustomQuery={setSegmentEditCustomQuery} />
				)}
				<Separator />
				<TestSegmentBtn />
				<FormGroupContainer>
					<div className='row mb-3'>
						<div className='col-lg-3'>
							<label>Player Id</label>
							<input
								type='text'
								className='form-control form-control-sm'
								value={filterPlayerId}
								onChange={(e) => setFilterPlayerId(e.target.value)}
							/>
						</div>
						<div className='col-lg-3'>
							<label>User Name</label>
							<input
								type='text'
								className='form-control form-control-sm'
								value={filterUserName}
								onChange={(e) => setFilterUserName(e.target.value)}
							/>
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
							loading={loading}
							disabled={loading}
							loadingTitle={' Please wait...'}
							onClick={() => searchResult()}
						/>
					</div>
					<ExportToCSV />
				</FormGroupContainer>
				<PlayerListgrid />
				{segmentType && <SaveSegmentBtn />}
				{!segmentType && <Skeleton style={{width: '30rem', height: '30px'}} />}
			</ContentContainer>
		</MainContainer>
	);
};

export default EditSegment;
