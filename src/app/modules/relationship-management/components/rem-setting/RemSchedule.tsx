import {faPencilAlt} from '@fortawesome/free-solid-svg-icons';
import {HubConnection} from '@microsoft/signalr';
import {ColDef, ColGroupDef} from 'ag-grid-community';
import {AgGridReact} from 'ag-grid-react';
import {AxiosResponse} from 'axios';
import {Guid} from 'guid-typescript';
import moment from 'moment';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {Col, Row} from 'react-bootstrap-v5';
import {shallowEqual, useSelector} from 'react-redux';
import {useHistory} from 'react-router-dom';
import Select from 'react-select';
import {RootState} from '../../../../../setup';
import * as hubConnection from '../../../../../setup/hub/MessagingHub';
import gridOverlayTemplate, {gridOverlayNoRowsTemplate} from '../../../../common-template/gridTemplates';
import {ElementStyle} from '../../../../constants/Constants';
import useConstant from '../../../../constants/useConstant';
import {
	BasicFieldLabel,
	BasicTextInput,
	DefaultGridPagination,
	FormHeader,
	MainContainer,
	MlabButton,
	TableIconButton,
} from '../../../../custom-components';
import {useUserOptionList} from '../../../../custom-functions';
import {formatDate} from '../../../../custom-functions/helper/dateHelper';
import {IAuthState} from '../../../auth';
import {OptionsSelectedModel} from '../../../system/models';
import {USER_CLAIMS} from '../../../user-management/components/constants/UserClaims';
import useRemSettingConstant from '../../constants/useRemSettingConstant';
import {ScheduleTemplateListRequest, ScheduleTemplateResponse} from '../../models';
import {ExportRemSettingToCsv, GetScheduleTeplateSettingList, SendGetScheduleTeplateSettingList} from '../../services/RemSettingApi';

const RemSchedule: React.FC = () => {
	//Redux
	const {access, userId} = useSelector<RootState>(({auth}) => auth, shallowEqual) as IAuthState;

	//Constant
	const {HubConnected, successResponse} = useConstant();
	const {defaultOptionValue} = useRemSettingConstant();
	const {userList} = useUserOptionList();
	let userOptions = userList.flatMap((x) => [{label: x.label, value: x.value}]);
	let userAccessId = userId === undefined ? 1 : userId.toString();

	//States
	const [templateName, setTemplateName] = useState<string>('');
	const [createdBy, setCreatedBy] = useState<any>(defaultOptionValue);
	const [updatedBy, setUpdatedBy] = useState<any>(defaultOptionValue);
	const [rowData, setRowData] = useState<Array<ScheduleTemplateResponse>>([]);
	const [isLoadingSearch, setIsLoadingSearch] = useState<boolean>(false);

	// Grid pagination states
	const [pageSize, setPageSize] = useState<number>(10);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [recordCount, setRecordCount] = useState<number>(0);
	const [sortOrder, setSortOrder] = useState<string>('');
	const [sortColumn, setSortColumn] = useState<string>('');

	//Hooks
	const gridRef: any = useRef();
	const history = useHistory();

	//Watchers
	useEffect(() => {
		// added interval due to loading overlay issue
		if (gridRef.current.api != null) {
			setTimeout(() => {
				if (isLoadingSearch) {
					onBtShowLoading();
				} else if (rowData.length > 0) {
					onBtHide();
				} else {
					onBtShowNoRows();
				}
			}, 10);
		}
	}, [isLoadingSearch]);

	//Events
	const onChangeCreatedBy = (val: OptionsSelectedModel) => {
		setCreatedBy(val);
	};
	const onChangeUpdatedBy = (val: OptionsSelectedModel) => {
		setUpdatedBy(val);
	};
	const onGridReady = (params: any) => {
		params.api.sizeColumnsToFit();
	};

	//Methods
	const onBtShowLoading = useCallback(() => {
		gridRef.current.api.showLoadingOverlay();
	}, []);

	const onBtShowNoRows = useCallback(() => {
		gridRef.current.api.showNoRowsOverlay();
	}, []);

	const onBtHide = useCallback(() => {
		gridRef.current.api.hideOverlay();
	}, []);

	const searchTemplateList = useCallback(() => {
		setIsLoadingSearch(true);
		gridRef.current.api.resetColumnState();
		_getScheduleTemplateSettingList(10, 1, sortColumn, sortOrder);
	}, [createdBy, updatedBy, templateName]);

	const _clearForms = () => {
		setTemplateName('');
		setCreatedBy(defaultOptionValue);
		setUpdatedBy(defaultOptionValue);
	};

	const exportToCSV = () => {
		const request: ScheduleTemplateListRequest = {
			queueId: Guid.create().toString(),
			userId: userAccessId.toString(),
			scheduleTemplateName: templateName,
			createdBy: createdBy?.value === undefined ? null : createdBy?.value,
			updatedBy: updatedBy?.value === undefined ? null : updatedBy?.value,
			pageSize: recordCount,
			offsetValue: 0,
			sortColumn: sortColumn,
			sortOrder: sortOrder,
		};

		ExportRemSettingToCsv(request)
			.then((response) => {
				const urlRemSched = window.URL.createObjectURL(new Blob(['\ufeff', response.data]));
				const link = document.createElement('a');
				link.href = urlRemSched;
				link.setAttribute('download', `REM Setting ${moment(new Date()).format('DD/MM/yyyy')}.csv`);
				document.body.appendChild(link);
				link.click();
			})
			.catch(() => {
				sweetAlert('Failed', 'Problem in exporting list', 'error');
			});
	};

	const _addScheduleTemplate = () => {
		// navigate to new tab
		const win: any = window.open(`/relationship-management/add-schedule-template/`, '_blank');
		win.focus();
	};

	const _viewSchedule = (templateId: number) => {
		// redirect to page

		history.push(`/relationship-management/rem-view-schedule-template/view/${templateId}`);
	};

	const _editSchedule = (templateId: number) => {
		// redirect to page
		const win: any = window.open(`/relationship-management/edit-schedule-template/${templateId}`, '_blank');
		win.focus();
	};

	//Api Call Methods
	const _getScheduleTemplateSettingList = (pageSize: number, currentPage: number, sortColumn: string, sortOrder: string) => {
		setTimeout(() => {
			setIsLoadingSearch(true);
			gridRef.current.api.showLoadingOverlay();
			const messagingHub = hubConnection.createHubConnenction();
			messagingHub.start().then(() => {
				const request: ScheduleTemplateListRequest = {
					queueId: Guid.create().toString(),
					userId: userAccessId.toString(),
					scheduleTemplateName: templateName,
					createdBy: createdBy?.value === undefined ? null : createdBy?.value,
					updatedBy: updatedBy?.value === undefined ? null : updatedBy?.value,
					pageSize: pageSize,
					offsetValue: (currentPage - 1) * pageSize,
					sortColumn: sortColumn,
					sortOrder: sortOrder,
				};

				SendGetScheduleTeplateSettingList(request).then((response) => {
					processSendGetScheduleTeplateSettingListRecieved(messagingHub, response, request);
				});
			});
		}, 1000);
	};
	const processSendGetScheduleTeplateSettingListRecieved = (
		messagingHub: HubConnection,
		response: AxiosResponse<any>,
		request: ScheduleTemplateListRequest
	) => {
		if (response.status === successResponse) {
			messagingHub.on(request.queueId.toString(), (message) => {
				GetScheduleTeplateSettingList(message.cacheId)
					.then((data) => {
						let resultData = Object.assign(new Array<ScheduleTemplateResponse>(), data.data.scheduleTemplateResponseList);
						setRowData(resultData);
						setRecordCount(data.data.totalRecordCount);
						messagingHub.off(request.queueId.toString());
						messagingHub.stop();
						setIsLoadingSearch(false);
					})
					.catch(() => {
						setIsLoadingSearch(false);
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
	};
	//Table Methods
	const onPageSizeChanged = () => {
		let value: string = (document.getElementById('page-size') as HTMLInputElement).value;
		setPageSize(Number(value));
		setCurrentPage(1);

		if (rowData != undefined && rowData.length > 0) {
			_getScheduleTemplateSettingList(Number(value), 1, sortColumn, sortOrder);
		}
	};

	const onClickFirst = () => {
		if (currentPage > 1) {
			setCurrentPage(1);
			_getScheduleTemplateSettingList(pageSize, 1, sortColumn, sortOrder);
		}
	};

	const onClickPrevious = () => {
		if (currentPage > 1) {
			setCurrentPage(currentPage - 1);
			_getScheduleTemplateSettingList(pageSize, 1, sortColumn, sortOrder);
		}
	};

	const onClickNext = () => {
		if (totalPage() > currentPage) {
			setCurrentPage(currentPage + 1);
			_getScheduleTemplateSettingList(pageSize, currentPage + 1, sortColumn, sortOrder);
		}
	};

	const onClickLast = () => {
		if (totalPage() > currentPage) {
			setCurrentPage(totalPage());
			_getScheduleTemplateSettingList(pageSize, totalPage(), sortColumn, sortOrder);
		}
	};

	const totalPage = () => {
		return Math.ceil(recordCount / pageSize) | 0;
	};

	const onSort = (e: any) => {
		setCurrentPage(1);
		if (rowData !== undefined && rowData.length > 0) {
			let sortDetail = e.api.getSortModel();
			if (sortDetail[0] != undefined) {
				setSortColumn(sortDetail[0]?.colId);
				setSortOrder(sortDetail[0]?.sort);
				_getScheduleTemplateSettingList(pageSize, 1, sortDetail[0]?.colId, sortDetail[0]?.sort);
			} else {
				_getScheduleTemplateSettingList(pageSize, 1, '', '');
			}
		}
	};
	const customCellScheduleTemplateNameRender = (params: any) => {
		return (
			<label
				className='btn-link cursor-pointer'
				onClick={() => {
					_viewSchedule(params.data.scheduleTemplateSettingId);
				}}
				onKeyDown={() => {
					_viewSchedule(params.data.scheduleTemplateSettingId);
				}}
			>
				{params.data.scheduleTemplateName}
			</label>
		);
	};
	const customCellCreatedDateRender = (params: any) => {
		return <label>{formatDate(params.data.createdDate)}</label>;
	};
	const customCellUpdatedDateRender = (params: any) => {
		return <label>{formatDate(params.data.updatedDate)}</label>;
	};
	const customCellActionRender = (params: any) => {
		return (
			<>
				<TableIconButton
					access={access?.includes(USER_CLAIMS.RemSettingWrite)}
					faIcon={faPencilAlt}
					isDisable={false}
					toolTipText={'Edit'}
					onClick={() => {
						_editSchedule(params.data.scheduleTemplateSettingId);
					}}
				/>
			</>
		);
	};
	//Components
	const columnDefs: (ColDef<ScheduleTemplateResponse> | ColGroupDef<ScheduleTemplateResponse>)[] = [
		{
			headerName: 'Schedule Template Name',
			field: 'scheduleTemplateName',
			cellRenderer: customCellScheduleTemplateNameRender,
		},
		{
			headerName: 'Created Date',
			field: 'createdDate',
			cellRenderer: customCellCreatedDateRender,
		},
		{headerName: 'Created By', field: 'createdByName'},
		{
			headerName: 'Last Modified Date',
			field: 'updatedDate',
			cellRenderer: customCellUpdatedDateRender,
		},
		{headerName: 'Last Modified By', field: 'updatedByName'},
		{
			headerName: 'Action',
			field: 'scheduleTeplateSettingId',
			sortable: false,
			cellRenderer: customCellActionRender,
		},
	];

	return (
		<MainContainer>
			<FormHeader headerLabel={'Schedule'} />
			{/* Header Contents */}
			<div style={{margin: 20}}>
				<Row>
					<Col sm={4}>
						<BasicFieldLabel title={'Template Name'} />
						<BasicTextInput
							colWidth='col-sm-12'
							onChange={(e) => setTemplateName(e.target.value)}
							value={templateName}
							ariaLabel={'Template Name'}
							disabled={false}
						/>
					</Col>
					<Col sm={4}>
						<BasicFieldLabel title={'Created By'} />
						<div className='col-sm-12'>
							<Select
								size='small'
								style={{width: '100%'}}
								isSearchable={true}
								options={userOptions}
								onChange={onChangeCreatedBy}
								value={createdBy}
								isDisabled={false}
							/>
						</div>
					</Col>
					<Col sm={4}>
						<BasicFieldLabel title={'Modified By'} />
						<div className='col-sm-12'>
							<Select
								size='small'
								style={{width: '100%'}}
								isSearchable={true}
								options={userOptions}
								onChange={onChangeUpdatedBy}
								value={updatedBy}
								isDisabled={false}
							/>
						</div>
					</Col>
				</Row>
			</div>
			<div style={{marginLeft: 20, marginRight: 20}}>
				<Row>
					<Col sm={12}>
						<MlabButton
							access={access?.includes(USER_CLAIMS.RemSettingRead)}
							size={'sm'}
							label={'Search'}
							style={ElementStyle.primary}
							type={'button'}
							weight={'solid'}
							loading={isLoadingSearch}
							disabled={isLoadingSearch}
							loadingTitle={' Please wait...'}
							onClick={searchTemplateList}
						/>
						<MlabButton
							access={access?.includes(USER_CLAIMS.RemSettingWrite)}
							size={'sm'}
							label={'Add New Schedule'}
							style={ElementStyle.primary}
							type={'button'}
							weight={'solid'}
							loading={false}
							disabled={false}
							loadingTitle={' Please wait...'}
							onClick={_addScheduleTemplate}
						/>
						<MlabButton
							access={access?.includes(USER_CLAIMS.RemSettingRead)}
							size={'sm'}
							label={'Clear'}
							style={ElementStyle.primary}
							type={'button'}
							weight={'solid'}
							loading={false}
							disabled={false}
							loadingTitle={'Please wait...'}
							onClick={_clearForms}
						/>
						<MlabButton
							access={access?.includes(USER_CLAIMS.RemSettingRead)}
							size={'sm'}
							label={'Export to CSV'}
							style={ElementStyle.primary}
							type={'button'}
							weight={'solid'}
							loading={false}
							disabled={rowData.length == 0}
							loadingTitle={'Please wait...'}
							onClick={exportToCSV}
						/>
					</Col>
				</Row>
			</div>
			<Row style={{margin: 10}}>
				<Col sm={12}>
					<div className='ag-theme-quartz mt-5' style={{height: 500, width: '100%'}}>
						<AgGridReact
							rowData={rowData}
							defaultColDef={{
								sortable: true,
								resizable: true,
							}}
							suppressCopyRowsToClipboard={true}
							rowSelection={'multiple'}
							onGridReady={onGridReady}
							rowBuffer={0}
							enableRangeSelection={true}
							pagination={false}
							paginationPageSize={pageSize}
							// columnDefs={columnDefs}
							columnDefs={columnDefs}
							onSortChanged={(e) => onSort(e)}
							overlayNoRowsTemplate={gridOverlayNoRowsTemplate}
							overlayLoadingTemplate={gridOverlayTemplate}
							ref={gridRef}
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
				</Col>
			</Row>
		</MainContainer>
	);
};

export default RemSchedule;
