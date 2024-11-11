import {faPencilAlt, faTrash} from '@fortawesome/free-solid-svg-icons';
import {AgGridReact} from 'ag-grid-react';
import {Guid} from 'guid-typescript';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {ButtonGroup, Col, Row} from 'react-bootstrap-v5';
import {shallowEqual, useSelector} from 'react-redux';
import {useHistory, useParams} from 'react-router-dom';
import Select from 'react-select';
import {RootState} from '../../../../../setup';
import * as hubConnection from '../../../../../setup/hub/MessagingHub';
import gridOverlayTemplate from '../../../../common-template/gridTemplates';
import {ElementStyle} from '../../../../constants/Constants';
import useConstant from '../../../../constants/useConstant';
import {BasicFieldLabel, BasicTextInput, DefaultGridPagination, FormHeader, MainContainer, MlabButton, TableIconButton} from '../../../../custom-components';
import {IAuthState} from '../../../auth';
import {USER_CLAIMS} from '../../../user-management/components/constants/UserClaims';
import {ScheduleTemplateByIdRequest, ScheduleTemplateLanguageListResponse, ScheduleTemplateLanguageRequest} from '../../models';
import {
	GetScheduleTemplateLanguageSettingListAsync,
	GetScheduleTeplateSettingById,
	SendGetScheduleTemplateLanguageSettingList,
	SendGetScheduleTeplateSettingById,
} from '../../services/RemSettingApi';
import {ActiveTemplateUsers} from '../../shared/components';
import { ColDef, ColGroupDef } from 'ag-grid-community';
import CellRenderRowIndex from '../../../../custom-components/grid-components/CellRenderRowIndex';

const ViewScheduleTemplate: React.FC = () => {
	//Redux
	const {access, userId} = useSelector<RootState>(({auth}) => auth, shallowEqual) as IAuthState;

	//States
	const [templateName, setTemplateName] = useState<string>('');
	const [templateDescription, setTemplateDescription] = useState<string>('');
	const [rowData, setRowData] = useState<Array<ScheduleTemplateLanguageListResponse>>([]);
	const [isLoading, setIsLoading] = useState<boolean>(false);

	//Grid States
	const [pageSize, setPageSize] = useState<number>(10);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [recordCount, setRecordCount] = useState<number>(0);
	const [sortOrder, setSortOrder] = useState<string>('ASC');
	const [sortColumn, setSortColumn] = useState<string>('scheduleTemplateLanguageSettingId');

	//Hooks
	const {id}: {id: number} = useParams();
	const {page}: {page: string} = useParams();
	const {HubConnected, successResponse} = useConstant();
	const history = useHistory();
	let userAccessId = userId === undefined ? 1 : userId.toString();
	const gridRef: any = useRef();

	//Mount
	useEffect(() => {
		_getScheduleTemplateOnView();
		_getScheduleTemplateSettingLanguageList(10, 1, sortColumn, sortOrder);
	}, []);

	//Watchers
	useEffect(() => {
		// added interval due to loading overlay issue
		if (gridRef.current.api != null) {
			setTimeout(() => {
				if (isLoading) {
					onBtShowLoading();
				} else {
					if (rowData.length > 0) {
						onBtHide();
					} else {
						onBtShowNoRows();
					}
				}
			}, 10);
		}
	}, [isLoading]);

	//Api Methods
	const _getScheduleTemplateOnView = () => {
		setTimeout(() => {
			const messagingHub = hubConnection.createHubConnenction();
			messagingHub.start().then(() => {
				const request: ScheduleTemplateByIdRequest = {
					queueId: Guid.create().toString(),
					userId: userAccessId.toString(),
					ScheduleTeplateSettingId: id,
				};
				SendGetScheduleTeplateSettingById(request).then((response) => {
					if (response.status === successResponse) {
						messagingHub.on(request.queueId.toString(), (message) => {
							GetScheduleTeplateSettingById(message.cacheId)
								.then((data) => {
									setTemplateName(data.data.scheduleTemplateName);
									setTemplateDescription(data.data.scheduleTemplateDescription);
									messagingHub.off(request.queueId.toString());
									messagingHub.stop();
								})
								.catch(() => {});
						});

						setTimeout(() => {
							if (messagingHub.state === HubConnected) {
								messagingHub.stop();
							}
						}, 30000);
					} else {
						messagingHub.stop();
					}
				});
			});
		}, 1000);
	};

	const _getScheduleTemplateSettingLanguageList = (pageSize: number, currentPage: number, sortColumn: string, sortOrder: string) => {
		
		setRowData([])
		setTimeout(() => {
			setIsLoading(true);
			const messagingHub = hubConnection.createHubConnenction();
			messagingHub.start().then(() => {
				const request: ScheduleTemplateLanguageRequest = {
					queueId: Guid.create().toString(),
					userId: userAccessId.toString(),
					scheduleTemplateSettingId: id,
					pageSize: pageSize,
					offsetValue: (currentPage - 1) * pageSize,
					sortColumn: sortColumn,
					sortOrder: sortOrder,
				};
				SendGetScheduleTemplateLanguageSettingList(request).then((response) => {
					if (response.status === successResponse) {
						messagingHub.on(request.queueId.toString(), (message) => {
							GetScheduleTemplateLanguageSettingListAsync(message.cacheId)
								.then((data) => {
									let resultData = Object.assign(new Array<ScheduleTemplateLanguageListResponse>(), data.data.scheduleTemplateLanguagesList);
									setRowData(resultData);
									setRecordCount(data.data.totalRecordCount);
									setIsLoading(false);
									messagingHub.off(request.queueId.toString());
									messagingHub.stop();
								})
								.catch(() => {
									setIsLoading(false);
								});
						});
						setTimeout(() => {
							if (messagingHub.state === HubConnected) {
								messagingHub.stop();
							}
						}, 30000);
					} else {
						messagingHub.stop();
					}
				});
			});
		}, 1000);
	};

	//Methods
	const onGridReady = (params: any) => {
		params.api.sizeColumnsToFit();

	};

	//Table Methods
	const onPageSizeChanged = () => {
		const value: string = (document.getElementById('page-size') as HTMLInputElement).value;
		setPageSize(Number(value));
		setCurrentPage(1);

		if (rowData != undefined && rowData.length > 0) {
			_getScheduleTemplateSettingLanguageList(10, 1, sortColumn, sortOrder);
		}
	};

	const onClickFirst = () => {
		if (currentPage > 1) {
			setCurrentPage(1);
			_getScheduleTemplateSettingLanguageList(pageSize, 1, sortColumn, sortOrder);
		}
	};
	
	const onClickNext = () => {
		if (totalPage() > currentPage) {
			setCurrentPage(currentPage + 1);
			_getScheduleTemplateSettingLanguageList(pageSize, currentPage + 1, sortColumn, sortOrder);
		}
	};

	const onClickLast = () => {
		if (totalPage() > currentPage) {
			setCurrentPage(totalPage());
			_getScheduleTemplateSettingLanguageList(pageSize, totalPage(), sortColumn, sortOrder);
		}
	};

	const onClickPrevious = () => {
		if (currentPage > 1) {
			setCurrentPage(currentPage - 1);
			_getScheduleTemplateSettingLanguageList(pageSize, 1, sortColumn, sortOrder);
		}
	};

	const totalPage = () => {
		return Math.ceil(recordCount / pageSize) | 0;
	};

	const _backToRemSchedule = () => {
		history.push('/relationship-management/rem-schedule');
	};

	const _editSchedule = () => {
		history.push(`/relationship-management/edit-schedule-template/${id}`);
	};


	const onBtShowNoRows = useCallback(() => {
		gridRef.current.api.showNoRowsOverlay();
	}, []);

	const onBtShowLoading = useCallback(() => {
		gridRef.current.api.showLoadingOverlay();
	}, []);
	
	const onBtHide = useCallback(() => {
		gridRef.current.api.hideOverlay();
	}, []);

	const defaultColDef = useMemo(() => {
		return {
			resizable: true,
			sortable: true,
		};
	}, []);

	const columnDefs : (ColDef<ScheduleTemplateLanguageListResponse> | ColGroupDef<ScheduleTemplateLanguageListResponse>)[] =[
		{headerName: 'No', cellRenderer: CellRenderRowIndex},
		
		{headerName: 'Language', cellRenderer: (params: any) => { return params.data.languageName } },
		{headerName: 'Local Character Translation', cellRenderer: (params: any) => { return params.data.languageLocalTranslation }},
		{
			headerName: 'Action',
			sortable: false,
			cellRenderer: (params: any) => (
				<ButtonGroup aria-label='Basic example'>
					<div className='d-flex justify-content-center flex-shrink-0'>
						<div className='me-6'>
							<TableIconButton access={true} faIcon={faPencilAlt} isDisable={true} toolTipText={'Edit'} onClick={() => {}} />
						</div>
						<div className='me-6'>
							<TableIconButton access={true} faIcon={faTrash} isDisable={true} toolTipText={'Remove'} onClick={() => {}} />
						</div>
					</div>
				</ButtonGroup>
			),
		},
	];

	const renderViewRemAgGridNoColumn = (viewRemParams: any) => {
		return (<>{viewRemParams ? <div>{(viewRemParams.rowIndex + 1) + (currentPage - 1) * pageSize}</div> : null}</>)
	}

	//Components
	const ScheduleTemplate = () => {
		return (
			<MainContainer>
				<FormHeader headerLabel={'View Schedule Template'} />
				<div style={{margin: 20}}>
					<Row>
						<Col sm={12}>
							<BasicFieldLabel title={'Template Name'} />
							<BasicTextInput
								colWidth='col-sm-12'
								onChange={(e) => setTemplateName(e.target.value)}
								value={templateName}
								ariaLabel={'Template Name'}
								disabled={true}
							/>
						</Col>
						<Col sm={12} style={{marginTop: 10}}>
							<BasicFieldLabel title={'Schedule Template Description'} />
							<textarea
								className='form-control form-control-sm'
								value={templateDescription}
								onChange={(e) => setTemplateDescription(e.target.value)}
								disabled={true}
							/>
						</Col>
					</Row>
				</div>
			</MainContainer>
		);
	};

	const LanguageSetting = () => {
		return (
			<MainContainer>
				<div>
					<FormHeader headerLabel={'Language Setting'} />
					<Row style={{margin: 10}}>
						<Col sm={6}>
							<Row>
								<Col sm={4}>
									<BasicFieldLabel title={'Select Language *'} />
								</Col>
								<Col sm={8} style={{borderWidth: 1, borderColor: '#000'}}>
									<Select style={{width: '100%'}} options={[]} onChange={() => {}} value={[]} isDisabled={true} />
								</Col>
							</Row>
							<Row style={{marginTop: 20}}>
								<Col sm={4}>
									<BasicFieldLabel title={'Local Character Translation *'} />
								</Col>
								<Col sm={8}>
									<textarea className='form-control form-control-sm' value={''} onChange={() => {}} disabled={true} />
								</Col>
							</Row>
							<Row style={{marginTop: 20}}>
								<Col sm={4}>
									<MlabButton
										access={true}
										size={'sm'}
										label={'Add Language Setting'}
										style={ElementStyle.primary}
										type={'button'}
										weight={'solid'}
										loading={false}
										disabled={true}
										loadingTitle={' Please wait...'}
										onClick={() => {}}
									/>
								</Col>
								<Col sm={8}></Col>
							</Row>
							<Col sm={6}></Col>
						</Col>
					</Row>
					<Row style={{margin: 10}}>
						<Col sm={12}>
							<div className='ag-theme-quartz mt-5' style={{height: 500, width: '100%'}}>
								<AgGridReact
									rowData={rowData}
									defaultColDef={defaultColDef}
									onGridReady={onGridReady}
									rowBuffer={0}
									enableRangeSelection={true}
									pagination={false}
									paginationPageSize={pageSize}
									columnDefs={columnDefs}
									overlayNoRowsTemplate={gridOverlayTemplate}
									overlayLoadingTemplate={gridOverlayTemplate}
									ref={gridRef}
								/>

								<DefaultGridPagination
									showPageSizeChange={false}
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
						</Col>
					</Row>
				</div>
			</MainContainer>
		);
	};

	const FooterViewSchedule = () => {
		return (
			<MainContainer>
				<div style={{margin: 20}}>
					<Row>
						<Col sm={4}>
							{page === 'detail' && (
								<MlabButton
									access={access?.includes(USER_CLAIMS.RemSettingWrite)}
									size={'sm'}
									label={'Edit Setting'}
									style={ElementStyle.primary}
									type={'button'}
									weight={'solid'}
									loading={false}
									disabled={false}
									loadingTitle={' Please wait...'}
									onClick={_editSchedule}
								/>
							)}
							<MlabButton
								access={access?.includes(USER_CLAIMS.RemSettingRead)}
								size={'sm'}
								label={'Back'}
								style={ElementStyle.secondary}
								type={'button'}
								weight={'solid'}
								loading={false}
								disabled={false}
								loadingTitle={' Please wait...'}
								onClick={_backToRemSchedule}
							/>
						</Col>
						<Col sm={8}></Col>
					</Row>
				</div>
			</MainContainer>
		);
	};

	return (
		<>
			<ScheduleTemplate />
			<div style={{margin: 20}} />
			<LanguageSetting />
			<div style={{margin: 20}} />
			<ActiveTemplateUsers id={id} />
			<div style={{margin: 20}} />
			<FooterViewSchedule />
		</>
	);
};

export default ViewScheduleTemplate;