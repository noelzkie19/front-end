import {faPencilAlt, faToggleOff, faToggleOn} from '@fortawesome/free-solid-svg-icons';
import '@popperjs/core';
import {AgGridReact} from 'ag-grid-react';
import {useFormik} from 'formik';
import {Guid} from 'guid-typescript';
import React, {useEffect, useState} from 'react';
import {Tooltip} from 'react-bootstrap';
import {ButtonGroup, Col, OverlayTrigger, Row} from 'react-bootstrap-v5';
import {shallowEqual, useDispatch, useSelector} from 'react-redux';
import {Link, useHistory} from 'react-router-dom';
import Select from 'react-select';
import swal from 'sweetalert';
import * as Yup from 'yup';
import {RootState} from '../../../../../setup';
import * as hubConnection from '../../../../../setup/hub/MessagingHub';
import {LookupModel} from '../../../../common/model/LookupModel';
import {ElementStyle, HttpStatusCodeEnum, PROMPT_MESSAGES, StatusTypeEnum, ToggleTypeEnum} from '../../../../constants/Constants';
import useConstant from '../../../../constants/useConstant';
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
	FormGroupContainer,
	FormHeader,
	LoaderButton,
	MainContainer,
	MlabBadge,
	PaddedContainer,
	TableIconButton,
} from '../../../../custom-components';
import CommonLookups from '../../../../custom-functions/CommonLookups';
import {IAuthState} from '../../../auth';
import {USER_CLAIMS} from '../../../user-management/components/constants/UserClaims';
import {GetTopiCaseTypeModel, OptionsSelectedModel, TopicRequestModel, TopicResponseModel} from '../../models';
import {LanguageTranslationListModel} from '../../models/response/LanguageTranslationListModel';
import {TopicLanguageTranslationResponseModel} from '../../models/response/TopicLanguageTranslationResponseModel';
import {UpdateTopicStatusRequestModel} from '../../models/topic/request/UpdateTopicStatusRequestModel';
import * as system from '../../redux/SystemRedux';
import {SendUpdateTopicStatus, getTopicList, sendTopicList} from '../../redux/SystemService';
import {useSystemOptionHooks} from '../../shared';
import {SystemCodeListHeader} from '../../shared/components';
import '../sub-topic/SubTopic.css';
import LanguageTranslationView from './LanguageTranslationView';
import { ColDef, ColGroupDef } from 'ag-grid-community';
import CreateTopic from './CreateTopic';
import ReorderTopic from './ReorderTopic';
import EditTopic from './EditTopic';
import ReorderTopicSubtopic from './ReorderTopicSubtopic';

const topicFilterSchema = Yup.object().shape({
	topicName: Yup.string(),
});

const initialValues = {
	topicName: '',
};

const TopicList: React.FC = () => {
	//  Get redux store
	const {userId, access} = useSelector<RootState>(({auth}) => auth, shallowEqual) as IAuthState;

	const dispatch = useDispatch();
	const messagingHub = hubConnection.createHubConnenction();

	//  States
	const [selectedStatuses, setSelectedStatuses] = useState<any>('');
	const [loading, setLoading] = useState<boolean>(false);

	const [gridApi, setGridApi] = useState<any>(null);
	const [rowData, setRowData] = useState<Array<TopicResponseModel>>([]);
	const [topicId, setTopicId] = useState<number>(0);
	const [topicName, setTopicName] = useState<string>('');
	const [filterCaseType, setFilterCaseType] = useState<any>();
	const [filterCurrency, setFilterCurrency] = useState<Array<LookupModel>>([]);
	const [filterBrand, setFilterBrand] = useState<Array<LookupModel>>([]);
	const [languageTranslationList, setLanguageTranslationList] = useState<Array<LanguageTranslationListModel>>([]);
	const [topicLanguageTranslationList, setTopicLanguageTranslationList] = useState<Array<TopicLanguageTranslationResponseModel>>([]);

	const [modalEditTopicShow, setModalEditTopicShow] = useState<boolean>(false);
	const [modalReorderSubtopicShow, setModalReorderSubtopicShow] = useState<boolean>(false);
	const [modalShow, setModalShow] = useState<boolean>(false);
	const [modalReorderShow, setModalReorderShow] = useState<boolean>(false);
	const [modalLanguageShow, setLanguageModalShow] = useState<boolean>(false);

	const [pageSize, setPageSize] = useState<number>(10);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [recordCount, setRecordCount] = useState<number>(0);
	const [sortOrder, setSortOrder] = useState<string>('asc');
	const [sortColumn, setSortColumn] = useState<string>('position');

	//  Variables
	const history = useHistory();
	const {HubConnected, successResponse} = useConstant();

	const {getCaseTypeOptions, caseTypeOptionList, isCaseTypeLoading, getSystemCodelist, codeListInfo} = useSystemOptionHooks();

	useEffect(() => {
		getCaseTypeOptions();
		getSystemCodelist(1);
		_getTopicList(pageSize, 1, sortColumn, sortOrder);
	}, []);

	// // Topic Language aList
	useEffect(() => {
		if (languageTranslationList !== undefined && languageTranslationList.length > 0) setLanguageModalShow(true);
	}, [languageTranslationList]);

	const onGridReady = (params: any) => {
		setGridApi(params.api);
		params.api.paginationGoToPage(4);
		params.api.sizeColumnsToFit();
	};

	const backToCodelistFromTopic = () => {
		history.push('/system/code-list');
	};

	const viewSubtopic = (_caseTypeName: string, _topicId: number, _topicName: string) => (
		<Link to={{pathname: '/system/sub-topic-list'}} target={'_blank'}>
			<DefaultTableButton
				access={access?.includes(USER_CLAIMS.TopicRead)}
				title={'View Subtopic'}
				onClick={() => {
					const clear: GetTopiCaseTypeModel = {
						caseTypeId: 0,
						caseTypeName: '',
						topicId: 0,
						topicName: '',
					};

					dispatch(system.actions.getTopicCaseTypeInfo(clear));

					let _caseTypeId = caseTypeOptionList.find((obj) => obj.label === _caseTypeName)?.value ?? '0';
					const request: GetTopiCaseTypeModel = {
						caseTypeId: parseInt(_caseTypeId),
						caseTypeName: _caseTypeName,
						topicId: _topicId,
						topicName: _topicName,
					};
					dispatch(system.actions.getTopicCaseTypeInfo(request));
				}}
			/>
		</Link>
	);

	function onChangeCurrency(val: Array<LookupModel>) {
		setFilterCurrency(val);
	}
	function onChangeBrand(val: Array<LookupModel>) {
		setFilterBrand(val);
	}
	const submitSearchToTopicList = () => {
		_getTopicList(pageSize, 1, sortColumn, sortOrder);
	};

	const onChangeCaseType = (val: any) => {
		setFilterCaseType(val);
	};
	//  Formik posts
	const formik = useFormik({
		initialValues,
		validationSchema: topicFilterSchema,
		onSubmit: (values, {setStatus, setSubmitting, resetForm}) => {
			setSubmitting(true);
			setLoading(true);
			setCurrentPage(1);
			submitSearchToTopicList();
			setSubmitting(false);
			setLoading(false);
		},
	});

	const onChangeSelectedStatues = (val: string) => {
		setSelectedStatuses(val);
	};
	const onPageSizeChanged = () => {
		let pageSize: any = document.getElementById('page-size');
		setPageSize(Number(pageSize.value));
		gridApi.paginationSetPageSize(Number(pageSize.value));
		if (rowData !== undefined && rowData.length > 0) {
			_getTopicList(Number(pageSize.value), 1, sortColumn, sortOrder);
		}
	};

	const _reorderTopic = () => {
		setModalReorderShow(true);
	};
	const onChangeTopicStatus = (_topicId: number, _isActive: boolean) => {
		let status_msg = StatusTypeEnum.Inactive;

		if (!_isActive) status_msg = StatusTypeEnum.Active;

		swal({
			title: PROMPT_MESSAGES.ConfirmCloseTitle,
			text: 'This action will change the record status to ' + status_msg + '. Please confirm',
			icon: ElementStyle.warning,
			buttons: ['No', 'Yes'],
			dangerMode: true,
		})
			.then(async (handleAction) => {
				if (handleAction) {
					const request: UpdateTopicStatusRequestModel = {
						queueId: Guid.create().toString(),
						isActive: !_isActive,
						topicId: _topicId,
						userId: userId?.toString() ?? '0',
					};
					await SendUpdateTopicStatus(request).then((response) => {
						if (response.status === HttpStatusCodeEnum.Ok) {
							setCurrentPage(1);
							swal(PROMPT_MESSAGES.SuccessTitle, 'Subtopic status successfully updated!', 'success').catch(() => {});
							_getTopicList(pageSize, 1, sortColumn, sortOrder);
						} else {
							swal(PROMPT_MESSAGES.FailedValidationTitle, 'Error updating Topic', 'error').catch(() => {});
						}
					});
				}
			})
			.catch(() => {});
	};

	const getTopicListRequest = async (_pageSizeParam: number, _currentPageParam: number, _sortColumnParam: string, _sortOrderParam: string) => {
		const request: TopicRequestModel = {
			queueId: Guid.create().toString(),
			userId: userId?.toString() ?? '0',
			topicName: topicName,
			topicStatus:
				selectedStatuses === undefined
					? ''
					: Object.assign(Array<OptionsSelectedModel>(), selectedStatuses)
							.map((el: any) => el.value)
							.join(','),
			caseTypeId: filterCaseType === undefined ? '0' : filterCaseType?.value.toString(),
			currencyIds:
				filterCurrency === undefined
					? ''
					: Object.assign(Array<LookupModel>(), filterCurrency)
							.map((el: any) => el.value)
							.join(','),
			brandIds:
				filterBrand === undefined
					? ''
					: Object.assign(Array<LookupModel>(), filterBrand)
							.map((el: any) => el.value)
							.join(','),
			pageSize: _pageSizeParam,
			offsetValue: (_currentPageParam - 1) * pageSize,
			sortColumn: _sortColumnParam,
			sortOrder: _sortOrderParam,
		};

		return request;
	};

	const getTopicListCallBack = (_cacheId: string) => {
		getTopicList(_cacheId)
			.then((data) => {
				let resultData = Object.assign({}, data.data);
				setRecordCount(resultData.recordCount);
				resultData.topicList.forEach((topic) => {
					topic.withTranslation = resultData.topicLanguageList.some((a) => a.topicId === topic.id);
				});
				setRowData(resultData.topicList);
				setTopicLanguageTranslationList(resultData.topicLanguageList);
				gridApi.hideOverlay();
			})
			.catch(() => {
				setLoading(false);
			});
	};

	const _getTopicList = (_pageSize: number, _currentPage: number, _sortColumn: string, _sortOrder: string) => {
		setTimeout(() => {
			messagingHub
				.start()
				.then(async () => {
					if (messagingHub.state === HubConnected) {
						let topicListRequest = await getTopicListRequest(_pageSize, _currentPage, _sortColumn, _sortOrder);
						sendTopicList(topicListRequest)
							.then((response) => {
								if (response.status === successResponse) {
									messagingHub.on(topicListRequest.queueId.toString(), (message) => {
										getTopicListCallBack(message.cacheId);
										messagingHub.off(topicListRequest.queueId.toString());
										messagingHub.stop().catch(() => {});
									});
								}
							})
							.catch(() => {
								messagingHub.stop().catch(() => {});
								swal('Failed', 'Problem in getting topic list', 'error').catch(() => {});
							});
					} else {
						swal('Failed', 'Problem connecting to the server, Please refresh', 'error').catch(() => {});
					}
				})
				.catch((err) => console.log('Error while starting connection: ' + err));
		}, 1000);
	};

	const _addTopic = () => {
		setModalShow(true);
	};

	const editTopic = (_topicId: number) => {
		setModalEditTopicShow(true);
		setTopicId(_topicId);
	};

	const reorderTopicSubtopic = (_topicId: number) => {
		setModalReorderSubtopicShow(true);
		setTopicId(_topicId);
	};

	const onClickFirst = () => {
		if (currentPage > 1) {
			setCurrentPage(1);
			_getTopicList(pageSize, 1, sortColumn, sortOrder);
		}
	};

	const onClickPrevious = () => {
		if (currentPage > 1) {
			setCurrentPage(currentPage - 1);
			_getTopicList(pageSize, currentPage - 1, sortColumn, sortOrder);
		}
	};

	const onClickNext = () => {
		if (totalPage() > currentPage) {
			setCurrentPage(currentPage + 1);
			_getTopicList(pageSize, currentPage + 1, sortColumn, sortOrder);
		}
	};

	const onClickLast = () => {
		if (totalPage() > currentPage) {
			setCurrentPage(totalPage());
			_getTopicList(pageSize, totalPage(), sortColumn, sortOrder);
		}
	};

	const totalPage = () => {
		return Math.ceil(recordCount / pageSize) | 0;
	};

	const onSort = (e: any) => {
		if (rowData !== undefined && rowData.length > 0) {
			let sortDetail = e.api.getSortModel();
			if (sortDetail[0] !== undefined) {
				setSortColumn(sortDetail[0]?.colId);
				setSortOrder(sortDetail[0]?.sort);
				_getTopicList(pageSize, currentPage, sortDetail[0]?.colId, sortDetail[0]?.sort);
			} else {
				setSortColumn('position');
				setSortOrder('asc');
				_getTopicList(pageSize, currentPage, 'position', 'asc');
			}
		}
	};

	const getTopicLanguages = (topicId: any) => {
		let topicLanguageList = topicLanguageTranslationList.filter((a: any) => a.topicId === topicId);
		let _topicLanguageList = Array<LanguageTranslationListModel>();
		topicLanguageList.forEach((a: any) => {
			const languageTranslation: LanguageTranslationListModel = {
				languageId: a.topicLanguageId,
				languageName: a.languageName,
				languageTranslation: a.topicLanguageTranslation,
			};
			_topicLanguageList.push(languageTranslation);
		});
		setLanguageTranslationList(_topicLanguageList);
	};

	const renderCreatTopicAction = (_props: any) => (
		<>
			{_props.data.id !== 0 ? (
				<ButtonGroup aria-label='Basic example'>
					<div className='d-flex justify-content-center flex-shrink-0'>
						<div className='me-4'>
							<TableIconButton
								access={access?.includes(USER_CLAIMS.TopicWrite)}
								faIcon={faPencilAlt}
								isDisable={_props.data.isActive === true}
								toolTipText={'Edit'}
								onClick={() => editTopic(_props.data.id)}
							/>
						</div>
						<div className='me-4'>
							<TableIconButton
								access={access?.includes(USER_CLAIMS.SubtopicWrite)}
								faIcon={_props.data.isActive === false ? faToggleOff : faToggleOn}
								toolTipText={_props.data.isActive === true ? ToggleTypeEnum.Deactivate : ToggleTypeEnum.Activate}
								onClick={() => onChangeTopicStatus(_props.data.id, _props.data.isActive)}
							/>
						</div>
						{viewSubtopic(_props.data.caseTypeName, _props.data.id, _props.data.topicName)}
						<DefaultTableButton
							access={access?.includes(USER_CLAIMS.TopicRead)}
							title={'Change Subtopic Order'}
							onClick={() => reorderTopicSubtopic(_props.data.id)}
						/>
					</div>
				</ButtonGroup>
			) : null}
		</>
	);

	const renderCreatTopicTranslation = (_props: any) => (
		<>
			{_props.data.id !== 0 ? (
				<ButtonGroup aria-label='Basic example'>
					<div className='d-flex justify-content-center flex-shrink-0'>
						<DefaultTableButton
							access={access?.includes(USER_CLAIMS.TopicWrite)}
							title={'View'}
							onClick={() => {
								getTopicLanguages(_props.data.id);
							}}
							isDisabled={!_props.data.withTranslation}
							customWidth={'90px'}
						/>
					</div>
				</ButtonGroup>
			) : null}
		</>
	);

	const renderCreateTopicCurrency = (_props: any) => (
		<>
			{_props.data.currencies !== null ? (
				<>
					<OverlayTrigger
						placement='right'
						delay={{show: 250, hide: 400}}
						overlay={<Tooltip id='button-tooltip-2'>{_props.data.currencies}</Tooltip>}
					>
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

	const renderCreateTopicBrand = (_props: any) => (
		<>
			{_props.data.currencies !== null ? (
				<>
					<OverlayTrigger placement='right' delay={{show: 250, hide: 400}} overlay={<Tooltip id='button-tooltip-2'>{_props.data.brands}</Tooltip>}>
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

	const renderCreateTopicStatus = (_props: any) => (
		<>
			{_props.data.isActive === true && <MlabBadge label={'Active'} weight={'light'} type={'badge'} style={ElementStyle.success} />}
			{_props.data.isActive === false && <MlabBadge label={'Inactive'} weight={'light'} type={'badge'} style={ElementStyle.primary} />}
		</>
	);

	const renderCreateTopicPosition = (_props: any) => <>{_props ? <div>{_props.data.position.toString()}</div> : null}</>;

	const lowerCaseTopicName = (valueA: string, valueB: string) => {
		return valueA.toLowerCase().localeCompare(valueB.toLowerCase());
	};

	//  Table content
	const columnDefs: (ColDef<TopicResponseModel> | ColGroupDef<TopicResponseModel>)[] =  [
		{
			headerName: 'Order',
			field: 'position',
			minWidth: 80,
			cellRenderer: renderCreateTopicPosition,
		},
		{headerName: 'Case Type', field: 'caseTypeName', minWidth: 200},
		{headerName: 'Topic Name', field: 'topicName', minWidth: 200, comparator: lowerCaseTopicName},
		{
			headerName: 'Topic Status',
			field: 'isActive',
			minWidth: 150,
			cellRenderer: renderCreateTopicStatus,
		},
		{
			headerName: 'Brand',
			field: 'brands',
			minWidth: 100,
			cellRenderer: renderCreateTopicBrand,
		},

		{
			headerName: 'Currency',
			field: 'currencies',
			minWidth: 100,
			cellRenderer: renderCreateTopicCurrency,
		},
		{
			headerName: 'With Translation',
			field: 'withTranslation',
			minWidth: 150,
			cellRenderer: renderCreatTopicTranslation,
		},
		{
			headerName: 'Action',
			field: 'position',
			minWidth: 500,
			sortable: false,
			cellRenderer: renderCreatTopicAction,
		},
	];

	const tableLoader = (data: any) => {
		return (
			<div className='ag-custom-loading-cell' style={{paddingLeft: '10px', lineHeight: '25px'}}>
				<i className='fas fa-spinner fa-pulse'></i> <span> {data.loadingMessage}</span>
			</div>
		);
	};

	//  Return
	return (
		<FormContainer onSubmit={formik.handleSubmit}>
			<MainContainer>
				<FormHeader headerLabel={'Search Topic'} />

				<ContentContainer>
					<SystemCodeListHeader codeListInfo={codeListInfo} />
					<div className='separator border-4 my-8' />
					<FormGroupContainer>
						<Row>
							<Col sm={3}>
								<FieldContainer>
									<FieldLabel fieldSize={'12'} title={'Topic Name'} />
									<div className={'col-sm-12'}>
										<input
											type='text'
											className={'form-control form-control-sm '}
											onChange={(e: any) => setTopicName(e.target.value)}
											value={topicName}
											aria-label='Topic Name'
										/>
									</div>
								</FieldContainer>
							</Col>
							<Col sm={3}>
								<FieldContainer>
									<div className={'col-sm-12'}>
										<label className='form-label-sm'>Case Type</label>
									</div>
									<div className='col-lg-12'>
										<Select
											menuPlacement='auto'
											menuPosition='fixed'
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
							<Col sm={3}>
								<FieldContainer>
									<FieldLabel fieldSize={'12'} title={'Topic Status'} />
									<div className='col-lg-12'>
										<Select
											menuPlacement='auto'
											menuPosition='fixed'
											isMulti
											size='small'
											style={{width: '100%'}}
											options={[
												{value: '1', label: 'Active'},
												{value: '0', label: 'Inactive'},
											]}
											onChange={onChangeSelectedStatues}
											value={selectedStatuses}
										/>
									</div>
								</FieldContainer>
							</Col>
						</Row>
						<Row>
							<Col sm={3}>
								<FieldContainer>
									<FieldLabel fieldSize={'12'} title={'Brand'} />
									<div className='col-lg-12'>
										<Select
											menuPlacement='auto'
											menuPosition='fixed'
											isMulti
											size='small'
											style={{width: '100%'}}
											options={CommonLookups('brands')}
											onChange={onChangeBrand}
											value={filterBrand}
										/>
									</div>
								</FieldContainer>
							</Col>
							<Col sm={3}>
								<FieldContainer>
									<FieldLabel fieldSize={'12'} title={'Currency'} />
									<div className='col-lg-12'>
										<Select
											menuPlacement='auto'
											menuPosition='fixed'
											isMulti
											size='small'
											style={{width: '100%'}}
											options={CommonLookups('currencies')}
											onChange={onChangeCurrency}
											value={filterCurrency}
										/>
									</div>
								</FieldContainer>
							</Col>
						</Row>
					</FormGroupContainer>

					<FormGroupContainer>
						<ButtonsContainer>
							<LoaderButton
								access={access?.includes(USER_CLAIMS.TopicRead)}
								loading={loading}
								title={'Search'}
								loadingTitle={' Please wait...'}
								disabled={formik.isSubmitting}
							/>
							<DefaultSecondaryButton access={access?.includes(USER_CLAIMS.TopicWrite)} title={'Add New'} onClick={() => _addTopic()} />
							<DefaultSecondaryButton access={access?.includes(USER_CLAIMS.TopicWrite)} title={'Change Order'} onClick={() => _reorderTopic()} />
						</ButtonsContainer>
					</FormGroupContainer>

					<div className='ag-theme-quartz topicList-table' style={{height: 400, width: '100%'}}>
						<AgGridReact
							rowData={rowData}
							defaultColDef={{
								sortable: true,
								resizable: true,
							}}
							onGridReady={onGridReady}
							components={{
								tableLoader: tableLoader,
							}}
							//enableRangeSelection={true} //deprecated in AgGridReactver.32.0.0
							animateRows={true}
							rowBuffer={0}
							pagination={false}
							paginationPageSize={pageSize}
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
						<DefaultSecondaryButton access={access?.includes(USER_CLAIMS.TopicRead)} title={'Back'} onClick={backToCodelistFromTopic} />
					</PaddedContainer>
				</FooterContainer>
				{/* Modals */}
				<CreateTopic showForm={modalShow} setModalShow={setModalShow} />
				<ReorderTopic showForm={modalReorderShow} setModalReorderShow={setModalReorderShow} searchTopicList={submitSearchToTopicList} />
				<EditTopic
					showForm={modalEditTopicShow}
					setModalEditTopicShow={setModalEditTopicShow}
					topicId={topicId}
					searchToTopicList={submitSearchToTopicList}
				/>
				<ReorderTopicSubtopic showForm={modalReorderSubtopicShow} setModalReorderSubtopicShow={setModalReorderSubtopicShow} topicId={topicId} />
				<LanguageTranslationView
					headerTitle={'Topic'}
					languageTranslationList={languageTranslationList}
					setModalLanguageTranslationShow={setLanguageModalShow}
					showForm={modalLanguageShow}
				/>
			</MainContainer>
		</FormContainer>
	);
};

export default TopicList;
