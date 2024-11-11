import {faPencilAlt, faToggleOff, faToggleOn} from '@fortawesome/free-solid-svg-icons';
import {AgGridReact} from 'ag-grid-react';
import {useFormik} from 'formik';
import {Guid} from 'guid-typescript';
import React, {useEffect, useState} from 'react';
import {Tooltip} from 'react-bootstrap';
import {ButtonGroup, Col, OverlayTrigger, Row} from 'react-bootstrap-v5';
import {shallowEqual, useDispatch, useSelector} from 'react-redux';
import {useHistory} from 'react-router-dom';
import Select from 'react-select';
import swal from 'sweetalert';
import * as Yup from 'yup';
import {RootState} from '../../../../../setup';
import * as hubConnection from '../../../../../setup/hub/MessagingHub';
import {ElementStyle, HttpStatusCodeEnum, PROMPT_MESSAGES, StatusTypeEnum, ToggleTypeEnum} from '../../../../constants/Constants';
import {
	ButtonsContainer,
	ContentContainer,
	DefaultGridPagination,
	DefaultSecondaryButton,
	DefaultTableButton,
	FieldContainer,
	FieldLabel,
	FooterContainer,
	FormContainer,
	FormHeader,
	LoaderButton,
	MainContainer,
	MlabBadge,
	PaddedContainer,
	TableIconButton,
} from '../../../../custom-components';
import {useCurrencies} from '../../../../custom-functions';
import useSystemHooks from '../../../../custom-functions/system/useSystemHooks';
import {LookupModel} from '../../../../shared-models/LookupModel';
import {USER_CLAIMS} from '../../../user-management/components/constants/UserClaims';
import {OptionsSelectedModel, SubTopicModel, SubtopicRequestModel, TopicOptions} from '../../models';
import {LanguageTranslationListModel} from '../../models/response/LanguageTranslationListModel';
import {SubTopicLanguageTranslationResponseModel} from '../../models/response/SubTopicLanguageTranslationResponseModel';
import {SubtopicUdtResponseModel} from '../../models/response/SubtopicUdtResponseModel';
import * as system from '../../redux/SystemRedux';
import {getSubtopicListRequest, sendSubtopicListRequest, updateSubtopicStatus} from '../../redux/SystemService';
import {useSystemOptionHooks} from '../../shared';
import {SystemCodeListHeader} from '../../shared/components';
import LanguageTranslationView from '../topic/LanguageTranslationView';
import './SubTopic.css';
import CreateSubTopic from './CreateSubTopic';
import EditSubtopic from './EditSubtopic';
import { ColDef, ColGroupDef } from 'ag-grid-community';


const subTopicFilterSchema = Yup.object().shape({
	topicName: Yup.string(),
});

const initialValues = {
	subTopicName: '',
	brand: '',
	subTopicStatus: '',
	currency: '',
	topic: '',
};

const STATUS_ACTIVE = '1';
const STATUS_INACTIVE = '0';
const STATE_CONNECTED = 'Connected';
const RESPONSE_OK = 200;

const SubTopicList: React.FC = () => {
	/**
	 *  ? Redux
	 */
	const userAccess = useSelector<RootState>(({auth}) => auth.access, shallowEqual) as string;
	const subTopicPostData = useSelector<RootState>(({system}) => system.postSubTopic, shallowEqual) as any;
	const userAccessId = useSelector<RootState>(({auth}) => auth.userId, shallowEqual) as number;
	const {getTopicCaseTypeInfo} = useSelector<RootState>(({system}) => system, shallowEqual) as system.ISystemState;

	/**
	 *  ? hooks
	 */
	const {getTopicOptions, topicOptions} = useSystemHooks();
	const history = useHistory();
	const {getCaseTypeOptions, caseTypeOptionList, isCaseTypeLoading, getSystemCodelist, codeListInfo} = useSystemOptionHooks();
	const dispatch = useDispatch();

	/**
	 *  ? States
	 */
	const [modalShow, setModalShow] = useState<boolean>(false);
	const [editModalShow, setEditModalShow] = useState<boolean>(false);
	const [gridApi, setGridApi] = useState<any>();
	const [rowData, setRowData] = useState<Array<SubtopicUdtResponseModel>>([]);
	const [editData, setEditData] = useState<any>([]);
	const [languageTranslationList, setLanguageTranslationList] = useState<Array<LanguageTranslationListModel>>([]);
	const [subTopicLanguageList, setSubTopicLanguageList] = useState<Array<SubTopicLanguageTranslationResponseModel>>([]);
	const [modalLanguageShow, setLanguageModalShow] = useState<boolean>(false);
	const [pageSize, setPageSize] = useState<number>(10);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [recordCount, setRecordCount] = useState<number>(0);
	const [sortOrder, setSortOrder] = useState<string>('asc');
	const [sortColumn, setSortColumn] = useState<string>('subtopicId');
	const [filterCaseType, setFilterCaseType] = useState<any>({
		label: getTopicCaseTypeInfo?.caseTypeName,
		value: getTopicCaseTypeInfo?.caseTypeId.toString(),
	});
	const [filterCurrency, setFilterCurrency] = useState<Array<LookupModel>>();
	const [filterStatus, setFilterStatus] = useState<Array<OptionsSelectedModel>>([]);
	const [filterSubtopicName, setfilterSubtopicName] = useState<string>('');
	const [selectedTopics, setSelectedTopics] = useState<Array<any>>(
		getTopicCaseTypeInfo?.topicId === 0
			? []
			: [{label: getTopicCaseTypeInfo?.topicName + '(' + getTopicCaseTypeInfo?.caseTypeName + ')', value: getTopicCaseTypeInfo?.topicId}]
	);

	/**
	 *  ? Mounted
	 */
	useEffect(() => {
		getCaseTypeOptions();
		getTopicOptions();
		_getSubtopicList(pageSize, 1, sortColumn, sortOrder, '');
		getSystemCodelist(2);
	}, []);

	// Topic Language aList
	useEffect(() => {
		if (languageTranslationList !== undefined && languageTranslationList.length > 0) setLanguageModalShow(true);
	}, [languageTranslationList]);

	const onGridReady = (params: any) => {
		setGridApi(params.api);
		params.api.sizeColumnsToFit();
	};

	const submitSearch = () => {
		// CHECK IF THERE IS PENDING ACTION NEED TO BE POST
		const isProcced = _validateTransaction('SEARCH');
		if (isProcced) {
			_getSubtopicList(pageSize, 1, sortColumn, sortOrder);
		} else {
			swal({
				title: 'Confirmation',
				text: 'Any changes will be discarded, please confirm',
				icon: 'warning',
				buttons: ['No', 'Yes'],
				dangerMode: true,
			})
				.then((handleAction) => {
					if (handleAction) {
						_getSubtopicList(pageSize, 1, sortColumn, sortOrder);
					}
				})
				.catch(() => {});
		}
	};
	const onClickFirst = () => {
		if (currentPage > 1) {
			setCurrentPage(1);
			_getSubtopicList(pageSize, 1, sortColumn, sortOrder);
		}
	};

	const onClickPrevious = () => {
		if (currentPage > 1) {
			setCurrentPage(currentPage - 1);
			_getSubtopicList(pageSize, currentPage - 1, sortColumn, sortOrder);
		}
	};

	const onClickNext = () => {
		if (totalPage() > currentPage) {
			setCurrentPage(currentPage + 1);
			_getSubtopicList(pageSize, currentPage + 1, sortColumn, sortOrder);
		}
	};

	const onClickLast = () => {
		if (totalPage() > currentPage) {
			setCurrentPage(totalPage());
			_getSubtopicList(pageSize, totalPage(), sortColumn, sortOrder);
		}
	};

	const totalPage = () => {
		return Math.ceil(recordCount / pageSize) | 0;
	};

	const onPageSizeChanged = () => {
		let pageSize: any | null = document.getElementById('page-size');
		setPageSize(Number(pageSize.value));
		setCurrentPage(1);
		gridApi.paginationSetPageSize(Number(pageSize.value));
		if (rowData !== undefined && rowData.length > 0) {
			_getSubtopicList(Number(pageSize.value), 1, sortColumn, sortOrder);
		}
	};

	const onSort = (e: any) => {
		if (rowData !== undefined && rowData.length > 0) {
			let sortDetail = e.api.getSortModel();
			if (sortDetail[0] !== undefined) {
				setSortColumn(sortDetail[0]?.colId);
				setSortOrder(sortDetail[0]?.sort);
				_getSubtopicList(pageSize, currentPage, sortDetail[0]?.colId, sortDetail[0]?.sort);
			} else {
				setSortColumn('subTopicId');
				setSortOrder('asc');
				_getSubtopicList(pageSize, currentPage, 'subTopicId', 'asc');
			}
		}
	};
	// FORMIK FORM POST
	const formik = useFormik({
		initialValues,
		validationSchema: subTopicFilterSchema,
		onSubmit: (values, {setStatus, setSubmitting, resetForm}) => {
			setSubmitting(true);
			setCurrentPage(1);
			submitSearch();
			setSubmitting(false);
		},
	});

	// METHODS
	const _back = () => {
		history.push('/system/code-list');
	};

	const onChangeSelectedStatues = (val: Array<OptionsSelectedModel>) => {
		setFilterStatus(val);
	};

	function onChangeSelectedCurrency(val: Array<LookupModel>) {
		setFilterCurrency(val);
	}

	const onChangeCaseType = (val: any) => {
		setFilterCaseType(val);
		setSelectedTopics([]);
	};

	const postUpdateSubtopicStatus = async (_newStatus: boolean, _subtopicId: number) => {
		await updateSubtopicStatus(_subtopicId, userAccessId.toString(), _newStatus).then((response) => {
			if (response.status === HttpStatusCodeEnum.Ok) {
				setCurrentPage(1);
				swal(PROMPT_MESSAGES.SuccessTitle, 'Subtopic status successfully updated!', 'success').catch(() => {});
				_getSubtopicList(pageSize, 1, sortColumn, sortOrder);
			} else {
				swal(PROMPT_MESSAGES.FailedValidationTitle, 'Error updating Subtopic', 'error').catch(() => {});
			}
		});
	};

	const _deActivateSubtopic = (params: any) => {
		const isProceed = _validateTransaction('CHANGE_STATUS');
		let status_msg = params.data.statusName === StatusTypeEnum.Inactive ? StatusTypeEnum.Active : StatusTypeEnum.Inactive;
		if (isProceed) {
			swal({
				title: PROMPT_MESSAGES.ConfirmCloseTitle,
				text: 'This action will change the record status to ' + status_msg + '. Please confirm',
				icon: ElementStyle.warning,
				buttons: ['No', 'Yes'],
				dangerMode: true,
			})
				.then(async (handleAction) => {
					if (handleAction) {
						const newStatus = params.data.statusName === StatusTypeEnum.Inactive ? true : false;
						await postUpdateSubtopicStatus(newStatus, params.data.subtopicId);
					}
				})
				.catch(() => {});
		} else {
			// IF ANOTHER TRANSACTION EXIST THEN VERIFY EXISTING TRANSACTION WILL BE REMOVED AND TABLE WILL BE BACK TO ORIGINAL STATE
			swal({
				title: 'Confirmation',
				text: 'Pending actions not posted will be lost if your proceed, please confirm',
				icon: 'warning',
				buttons: ['No', 'Yes'],
				dangerMode: true,
			})
				.then((handleAction) => {
					if (handleAction) {
						_getSubtopicList(pageSize, 1, sortColumn, sortOrder);
					}
				})
				.catch(() => {});
		}
	};

	const onChangeSelectedTopics = (val: Array<TopicOptions>) => {
		setSelectedTopics(val);
	};

	const _editSubtopicSelected = (action: string, data: any) => {
		setEditData(data);
		setEditModalShow(true);
	};

	const _addSubtopic = () => {
		const isProcced = _validateTransaction('ADD');
		if (isProcced) {
			setModalShow(true);
		} else {
			swal({
				title: 'Confirmation',
				text: 'Pending actions not posted will be lost if your proceed, please confirm',
				icon: 'warning',
				buttons: ['No', 'Yes'],
				dangerMode: true,
			})
				.then((handleAction) => {
					if (handleAction) {
						dispatch(system.actions.getSubtopicList([]));
						_getSubtopicList(pageSize, 1, sortColumn, sortOrder);
					}
				})
				.catch(() => {});
		}
	};

	const _validateTransaction = (action: string) => {
		let toPostData = subTopicPostData ? subTopicPostData : [];

		if (toPostData.length === 0) {
			return true;
		} else {
			const isExist = toPostData.some((item: SubTopicModel) => item.action === action);
			return isExist;
		}
	};

	const _closeModals = () => {
		swal({
			title: 'Confirmation',
			text: 'Any changes will be discarded, please confirm',
			icon: 'warning',
			buttons: ['No', 'Yes'],
			dangerMode: true,
		})
			.then((handleAction) => {
				if (handleAction) {
					setEditModalShow(false);
					setModalShow(false);
				}
			})
			.catch(() => {});
	};

	const getSubtopStatusFilter = () => {
		if (filterStatus.length > 1 || filterStatus.length === 0) return null;
		if (filterStatus[0].value === STATUS_ACTIVE) return STATUS_ACTIVE;
		if (filterStatus[0].value === STATUS_INACTIVE) return STATUS_INACTIVE;
	};

	async function getSubtopicListPostRequest(_pageSize: number, _currentPage: number, _sortColumn: string, _sortOrder: string) {
		const request: SubtopicRequestModel = {
			queueId: Guid.create().toString(),
			userId: userAccessId.toString(),
			subtopicName: filterSubtopicName,
			status: getSubtopStatusFilter(),
			topicId: 0,
			topicIds: Object.assign(Array<TopicOptions>(), selectedTopics)
				.map((el) => el.value)
				.join(','),
			currencyIds:
				filterCurrency === undefined
					? ''
					: Object.assign(Array<LookupModel>(), filterCurrency)
							.map((el: any) => el.value)
							.join(','),
			caseTypeId: filterCaseType === undefined || filterCaseType === null ? 0 : Number(filterCaseType.value),
			pageSize: _pageSize,
			offsetValue: (_currentPage - 1) * _pageSize,
			sortColumn: _sortColumn,
			sortOrder: _sortOrder,
		};

		return request;
	}

	const getSubtopicListRequestCallBack = (_cacheId: string) => {
		getSubtopicListRequest(_cacheId)
			.then((data) => {
				let resultData = Object.assign({}, data.data);
				setRecordCount(resultData.recordCount);
				resultData.subtopicList.forEach((subTopic) => {
					subTopic.withTranslation = resultData.subtopicLanguageList.some((a) => a.subtopicId === subTopic.subtopicId);
				});
				setRowData(resultData.subtopicList);
				setSubTopicLanguageList(resultData.subtopicLanguageList);
				gridApi.hideOverlay();
			})
			.catch(() => {});
	};

	const _getSubtopicList = (pageSize: number, currentPage: number, sortColumn: string, sortOrder: string, defaultTopicId = '') => {
		setTimeout(() => {
			const messagingHub = hubConnection.createHubConnenction();
			messagingHub
				.start()
				.then(async () => {
					if (messagingHub.state === STATE_CONNECTED) {
						const request = await getSubtopicListPostRequest(pageSize, currentPage, sortColumn, sortOrder);

						gridApi?.showLoadingOverlay();
						sendSubtopicListRequest(request)
							.then((response) => {
								if (response.status === RESPONSE_OK) {
									messagingHub.on(request.queueId.toString(), (message) => {
										getSubtopicListRequestCallBack(message.cacheId);
										messagingHub.off(request.queueId.toString());
										messagingHub.stop().catch(() => {});
									});
								} else {
									swal('Failed', response.data.message, 'error').catch(() => {});
									messagingHub.stop().catch(() => {});
								}
							})
							.catch(() => {
								swal('Failed', 'Problem in getting topic list', 'error').catch(() => {});
								messagingHub.stop().catch(() => {});
							});
					} else {
						swal('Failed', 'Problem connecting to the server, Please refresh', 'error').catch(() => {});
					}
				})
				.catch((err) => console.log('Error while starting connection: ' + err));
		}, 1000);
	};

	const tableLoader = (data: any) => {
		return (
			<div className='ag-custom-loading-cell' style={{paddingLeft: '10px', lineHeight: '25px'}}>
				<i className='fas fa-spinner fa-pulse'></i> <span> {data.loadingMessage}</span>
			</div>
		);
	};

	const getsubTopicLanguages = (subtopicId: any) => {
		let subtopicLanguageList1 = subTopicLanguageList.filter((a: any) => a.subtopicId === subtopicId);
		let languageTranslationList = Array<LanguageTranslationListModel>();
		subtopicLanguageList1.forEach((a: any) => {
			const languageTranslation: LanguageTranslationListModel = {
				languageId: a.subTopicLanguageId,
				languageName: a.languageName,
				languageTranslation: a.subtopicLanguageTranslation,
			};
			languageTranslationList.push(languageTranslation);
		});
		setLanguageTranslationList(languageTranslationList);
	};

	const renderSubtopicListStatusName = (_props: any) => (
		<>
			{_props.data.statusName === StatusTypeEnum.Active && (
				<MlabBadge label={_props.data.statusName} weight={'light'} type={'badge'} style={ElementStyle.success} />
			)}
			{_props.data.statusName === StatusTypeEnum.Inactive && (
				<MlabBadge label={_props.data.statusName} weight={'light'} type={'badge'} style={ElementStyle.primary} />
			)}
		</>
	);

	const renderSubtopicListIncludedToTopic = (_props: any) => (
		<>
			{_props.data.topic !== null && _props.data.topic !== '' ? (
				<>
					<OverlayTrigger placement='right' delay={{show: 250, hide: 400}} overlay={<Tooltip id='button-tooltip-2'>{_props.data.topic}</Tooltip>}>
						<button type='button' className='btn btn-outline-primary btn-sm'>
							View
						</button>
					</OverlayTrigger>
				</>
			) : (
				<>
					<button type='button' disabled={true} className='btn btn-outline-primary btn-sm'>
						View
					</button>
				</>
			)}
		</>
	);

	const renderSubtopicListCurrency = (_props: any) => (
		<>
			{_props.data.currency !== null && _props.data.currency !== '' ? (
				<>
					<OverlayTrigger placement='right' delay={{show: 250, hide: 400}} overlay={<Tooltip id='button-tooltip-2'>{_props.data.currency}</Tooltip>}>
						<button type='button' className='btn btn-outline-primary btn-sm'>
							View
						</button>
					</OverlayTrigger>
				</>
			) : (
				<>
					<button type='button' disabled={true} className='btn btn-outline-primary btn-sm'>
						View
					</button>
				</>
			)}
		</>
	);

	const renderSubtopicListWithTranslation = (_props: any) => (
		<>
			{_props.data.subtopicId != null ? (
				<ButtonGroup aria-label='Basic example'>
					<div className='d-flex justify-content-center flex-shrink-0'>
						<DefaultTableButton
							access={userAccess.includes(USER_CLAIMS.SubtopicWrite)}
							title={'View'}
							onClick={() => {
								getsubTopicLanguages(_props.data.subtopicId);
							}}
							isDisabled={!_props.data.withTranslation}
							customWidth={'90px'}
						/>
					</div>
				</ButtonGroup>
			) : null}
		</>
	);

	const renderSubtopicListActions = (_props: any) => (
		<>
			{_props.data.id !== 0 ? (
				<ButtonGroup aria-label='Basic example'>
					<div className='d-flex justify-content-center flex-shrink-0'>
						<div className='me-4'>
							<TableIconButton
								access={userAccess.includes(USER_CLAIMS.SubtopicWrite)}
								faIcon={faPencilAlt}
								toolTipText={'Edit'}
								onClick={() => _editSubtopicSelected('EDIT', _props)}
								isDisable={_props.data.statusName === StatusTypeEnum.Active ? true : false}
							/>
						</div>
						<div className='me-4'>
							<TableIconButton
								access={userAccess.includes(USER_CLAIMS.SubtopicWrite)}
								faIcon={_props.data.statusName === StatusTypeEnum.Inactive ? faToggleOff : faToggleOn}
								toolTipText={_props.data.statusName === StatusTypeEnum.Inactive ? ToggleTypeEnum.Activate : ToggleTypeEnum.Deactivate}
								onClick={() => _deActivateSubtopic(_props)}
							/>
						</div>
					</div>
				</ButtonGroup>
			) : null}
		</>
	);

	const lowerCaseSubTopicName = (valueA: string, valueB: string) => {
		return valueA.toLowerCase().localeCompare(valueB.toLowerCase());
	};

	const columnDefs : (ColDef<SubtopicUdtResponseModel> | ColGroupDef<SubtopicUdtResponseModel>)[] = [
		{headerName: 'Subtopic ID', field: 'subtopicId'},
		{headerName: 'Subtopic Name', field: 'subtopicName', comparator: lowerCaseSubTopicName},
		{
			headerName: 'Status',
			cellRenderer: renderSubtopicListStatusName,
		},
		{
			headerName: 'Included to Topic',
			field: 'topic',
			autoHeight: true,
			sortable: false,
			cellRenderer: renderSubtopicListIncludedToTopic,
		},

		{
			headerName: 'Currency',
			field: 'currency',
			sortable: false,
			cellRenderer: renderSubtopicListCurrency,
		},
		{
			headerName: 'With Translation',
			field: 'withTranslation',
			minWidth: 150,
			sortable: false,
			cellRenderer: renderSubtopicListWithTranslation,
		},
		{
			headerName: 'Action',
			field: 'position',
			sortable: false,
			cellRenderer: renderSubtopicListActions,
		},
	];

	return (
		<FormContainer onSubmit={formik.handleSubmit}>
			<MainContainer>
				<FormHeader headerLabel={'Search SubTopic'} />

				<ContentContainer>
					<SystemCodeListHeader codeListInfo={codeListInfo} />
					<div className='separator border-4 my-8' />
					<Row>
						<Col sm={4}>
							<FieldContainer>
								<FieldLabel fieldSize={'12'} title={'Subtopic Name'} />
								<div className={'col-sm-12'}>
									<input
										type='text'
										className={'form-control form-control-sm '}
										onChange={(e: any) => setfilterSubtopicName(e.target.value)}
										value={filterSubtopicName}
										aria-label='SubTopic Name'
									/>
								</div>
							</FieldContainer>
						</Col>
						<Col sm={3}>
							<FieldContainer>
								<FieldLabel title={'Status'} />
								<div className='col-sm-12'>
									<Select
										isMulti
										size='small'
										style={{width: '100%'}}
										options={[
											{value: '1', label: 'Active'},
											{value: '0', label: 'Inactive'},
										]}
										onChange={onChangeSelectedStatues}
										value={filterStatus}
									/>
								</div>
							</FieldContainer>
						</Col>
						<Col sm={5}>
							<FieldContainer>
								<FieldLabel fieldSize={'12'} title={'Topic Case Type'} />
								<div className='col-sm-12'>
									<Select
										isClearable
										size='small'
										style={{width: '100%'}}
										options={caseTypeOptionList}
										onChange={onChangeCaseType}
										isLoading={isCaseTypeLoading}
										value={filterCaseType}
									/>
								</div>
							</FieldContainer>
						</Col>
					</Row>
					<Row>
						<Col sm={4}>
							<FieldContainer>
								<FieldLabel title={'Currency'} />
								<div className='col-sm-12'>
									<Select
										isMulti
										size='small'
										style={{width: '100%'}}
										options={useCurrencies()}
										onChange={onChangeSelectedCurrency}
										value={filterCurrency}
									/>
								</div>
							</FieldContainer>
						</Col>
						<Col sm={8}>
							<FieldContainer>
								<FieldLabel fieldSize={'12'} title={'Included to Topic'} />
								<div className='col-sm-12'>
									<Select
										isMulti
										size='small'
										style={{width: '100%'}}
										options={topicOptions
											.filter((obj) => (filterCaseType === null ? obj.caseTypeId > 0 : obj.caseTypeId.toString() === filterCaseType?.value))
											.flatMap((obj) => [
												{
													label: obj.topicName + '(' + obj.caseTypeName + ')',
													value: obj.topicId,
												},
											])}
										onChange={onChangeSelectedTopics}
										value={selectedTopics}
									/>
								</div>
							</FieldContainer>
						</Col>
					</Row>
					<ButtonsContainer>
						<LoaderButton
							access={userAccess.includes(USER_CLAIMS.SubtopicRead)}
							loading={false}
							title={'Search'}
							loadingTitle={' Please wait...'}
							disabled={formik.isSubmitting}
						/>
						<DefaultSecondaryButton access={userAccess.includes(USER_CLAIMS.SubtopicWrite)} title={'Add New'} onClick={() => _addSubtopic()} />
					</ButtonsContainer>

					<div className='ag-theme-quartz' style={{height: 400, width: '100%'}}>
						<AgGridReact
							rowData={rowData}
							defaultColDef={{
								sortable: true,
								resizable: true,
							}}
							components={{
								tableLoader: tableLoader,
							}}
							animateRows={true}
							onGridReady={onGridReady}
							rowBuffer={10}
							//enableRangeSelection={true} //deprecated in AgGridReactver.32.0.0
							pagination={false}
							paginationPageSize={10}
							columnDefs={columnDefs}
							onSortChanged={(e) => onSort(e)}
						/>
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
				</ContentContainer>

				<FooterContainer>
					<PaddedContainer>
						<DefaultSecondaryButton access={userAccess.includes(USER_CLAIMS.SubtopicRead)} title={'Back'} onClick={_back} />
					</PaddedContainer>
				</FooterContainer>

				{/* modal for add topic*/}
				<CreateSubTopic setModalShow={setModalShow} showForm={modalShow} closeModal={_closeModals} />

				{/* modal for edit subtopic*/}
				<EditSubtopic search={submitSearch} setModalShow={setEditModalShow} showForm={editModalShow} closeModal={_closeModals} data={editData} />

				{/* show the language transactions */}
				<LanguageTranslationView
					headerTitle={'Sub Topic'}
					languageTranslationList={languageTranslationList}
					setModalLanguageTranslationShow={setLanguageModalShow}
					showForm={modalLanguageShow}
				/>
			</MainContainer>
		</FormContainer>
	);
};

export default SubTopicList;
