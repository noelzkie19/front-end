import {faMinusSquare, faPlusSquare} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {right} from '@popperjs/core';
import {AgGridReact} from 'ag-grid-react';
import {useFormik} from 'formik';
import {Guid} from 'guid-typescript';
import moment from 'moment';
import {useEffect, useRef, useState} from 'react';
import {shallowEqual, useSelector} from 'react-redux';
import Select from 'react-select';
import {RootState} from '../../../../../setup';
import * as hubConnection from '../../../../../setup/hub/MessagingHub';
import gridOverlayTemplate from '../../../../common-template/gridTemplates';
import noRowResultTemplate from '../../../../common-template/noRowResultTemplate';
import {ElementStyle, HttpStatusCodeEnum} from '../../../../constants/Constants';
import {BasicTextInput, DefaultDateRangePicker, DefaultGridPagination, FormContainer, MlabButton} from '../../../../custom-components';
import {formatDate} from '../../../../custom-functions/helper/dateHelper';
import {RemHistoryListResponse} from '../../../relationship-management/models/response/RemHistoryListResponse';
import {ExportRemHistoryToCsv, GetRemHistoryList, GetRemHistoryListResult} from '../../../relationship-management/services/RemHistoryApi';
import useRemAssignStatusOptionsList from '../../../relationship-management/shared/hooks/useRemAssignStatusOptionsList';
import useRemLookups from '../../../relationship-management/shared/hooks/useRemLookups';
import {USER_CLAIMS} from '../../../user-management/components/constants/UserClaims';
import {RemHistoryFilterBaseRequestModel} from '../../models/RemHistoryFilterBaseRequestModel';
import {RemHistoryFilterRequestModel} from '../../models/RemHistoryFilterRequestModel';
import { ColDef, ColGroupDef } from 'ag-grid-community';
import { RemHistoryModel } from '../../../relationship-management/models/response/RemHistoryModel';

type PlayerRemHistoryProps = {
	mlabPlayerId: number;
};

const PlayerRemHistory = ({mlabPlayerId}: PlayerRemHistoryProps) => {
	const remLookups = useRemLookups();
	const gridRef: any = useRef();
	const userId = useSelector<RootState>(({auth}) => auth.userId, shallowEqual) as number;
	const userAccess = useSelector<RootState>(({auth}) => auth.access, shallowEqual) as string;
	const [gridApi, setGridApi] = useState<any>();
	const [loading, setLoading] = useState(false);
	const remAssignStatusOptions = useRemAssignStatusOptionsList();

	const [remHistory, setRemHistory] = useState<RemHistoryListResponse>({
		remHistoryList: [],
		recordCount: 0,
	});

	useEffect(() => {
		setTimeout(() => {
			if (loading) gridRef.current.api.showLoadingOverlay();
			else {
				if (remHistory.remHistoryList.length > 0) {
					gridRef.current.api.hideOverlay();
				}
			}
		}, 10);
	}, [loading]);

	const columnDefs : (ColDef<RemHistoryModel> | ColGroupDef<RemHistoryModel>)[] = [
		{
			field: 'userName',
			headerName: 'Username',
			cellRenderer: (params: any) => params.data.username ?? '',
		},
		{
			field: 'actionType',
			headerName: 'Action Type',
			cellRenderer: (params: any) => params.data.actionType ?? '',
		},
		{
			field: 'assigmentDate',
			headerName: 'Assignment Date',
			cellRenderer: (params: any) => formatDate(params.data.assignmentDate) ?? '',
		},

		{
			field: 'remProfileName',
			headerName: 'ReM Profile Name',
			cellRenderer: (params: any) => (
				<>
					{userAccess.includes(USER_CLAIMS.PlayerProfileRead) ? (
						<a href={'/relationship-management/view-rem-profile/view/' + params.data.remProfileId} target='_blank'>
							{params.data.remProfileName}
						</a>
					) : (
						params.data.remProfileName
					)}
				</>
			),
		},
		{
			field: 'remAgentName',
			headerName: 'Agent Name',
			cellRenderer: (params: any) => params.data.agentName ?? '',
		},
		{
			field: 'pseudoName',
			headerName: 'Pseudo Name',
			cellRenderer: (params: any) => params.data.pseudoName ?? '',
		},
	];
	const [remHistoryToggle, setRemHistoryToggle] = useState<boolean>(false);
	const [pageSize, setPageSize] = useState<number>(20);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [sortOrder, setSortOrder] = useState<string>('DESC');
	const [sortColumn, setSortColumn] = useState<string>('a.RemHistoryID');

	const formik = useFormik({
		initialValues: {
			assignmentDate: [],
			actionTypeIds: [],
			remProfileIds: [],
			remAgentIds: [],
			pseudoName: '',
		},
		onSubmit: async (values, {setStatus, setSubmitting, resetForm}) => {
			// TODO: Load Top 10 Latest ReM History
		},
	});

	const createRequest = () => {
		let remHistoryFilterBaseRequestModel: RemHistoryFilterBaseRequestModel = {
			assignmentDateStart: formik.values.assignmentDate[0],
			assignmentDateEnd: formik.values.assignmentDate[1],
			mlabPlayerId: mlabPlayerId,
			actionTypeIds: formik.values.actionTypeIds.length > 0 ? formik.values.actionTypeIds.map((i: any) => i.value).join(',') : undefined,
			remProfileIds: formik.values.remProfileIds.length > 0 ? formik.values.remProfileIds.map((i: any) => i.value).join(',') : undefined,
			agentIds: formik.values.remAgentIds.length > 0 ? formik.values.remAgentIds.map((i: any) => i.value).join(',') : undefined,
			pseudoName: formik.values.pseudoName,
		};

		return remHistoryFilterBaseRequestModel;
	}

	const handleFilterSearch = () => {
		const remHistoryFilter = createRequest();

		let request: RemHistoryFilterRequestModel = {
			...remHistoryFilter,
			currentPage: currentPage,
			offsetValue: (currentPage - 1) * 100000,
			pageSize: 100000,
			sortColumn: sortColumn,
			sortOrder: sortOrder,
			queueId: Guid.create().toString(),
			userId: userId.toString(),
		};

		handleSearch(request);
	};

	const handleExportFilterSearch = () => {
		const remHistoryFilter = createRequest();

		let request: RemHistoryFilterRequestModel = {
			...remHistoryFilter,
			currentPage: currentPage,
			offsetValue: (currentPage - 1) * pageSize,
			pageSize: pageSize,
			sortColumn: sortColumn,
			sortOrder: sortOrder,
			queueId: Guid.create().toString(),
			userId: userId.toString(),
		};

		ExportRemHistoryToCsv(request)
			.then((response) => {
				const urlRem = window.URL.createObjectURL(new Blob(['\ufeff', response.data]));
				const link = document.createElement('a');
				link.href = urlRem;
				link.setAttribute('download', `REM History ${moment(new Date()).format('DD/MM/yyyy')}.csv`);
				document.body.appendChild(link);
				link.click();
			})
			.catch(() => {
				sweetAlert('Failed', 'Problem in exporting list', 'error');
			});
	};

	const handleSearch = (request: RemHistoryFilterRequestModel) => {
		setLoading(true);
		setTimeout(() => {
			const messagingHub = hubConnection.createHubConnenction();
			messagingHub
				.start()
				.then(() => {
					if (messagingHub.state === 'Connected') {
						GetRemHistoryList(request)
							.then((response) => {
								if (response.status === HttpStatusCodeEnum.Ok) {
									messagingHub.on(request.queueId.toString(), (message) => {
										GetRemHistoryListResult(message.cacheId)
											.then((data) => {
												let resultData = Object.assign({}, data.data as RemHistoryListResponse);

												setRemHistory(resultData);
												setLoading(false);
												messagingHub.off(request.queueId.toString());
												messagingHub.stop();
											})
											.catch(() => {});
									});

									setTimeout(() => {
										if (messagingHub.state === 'Connected') {
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

	const clearFilter = () => {
		formik.resetForm();
	};

	const styleHideDetails = {
		display: 'none',
	};

	const onGridReady = (params: any) => {
		setGridApi(params.api);
	};

	const onSort = async (e: any) => {
		setCurrentPage(1);
		if (remHistory.remHistoryList && remHistory.recordCount > 0) {
			const sortDetail = e.api.getSortModel();
			if (sortDetail[0] != undefined) {
				setSortColumn(sortDetail[0]?.colId);
				setSortOrder(sortDetail[0]?.sort);
				handleFilterSearch();
			} else {
				setSortOrder('DESC');
				setSortColumn('a.RemHistoryID');
				handleFilterSearch();
			}
		}
	};

	const onPageSizeChanged = () => {
		const rowData = remHistory.remHistoryList;
		const value: string = (document.getElementById('page-size') as HTMLInputElement).value;
		setPageSize(Number(value));
		setCurrentPage(1);

		if (rowData != undefined && rowData.length > 0) {
			handleFilterSearch();
		}
	};

	const onClickFirst = () => {
		if (currentPage > 1) {
			setCurrentPage(1);
			handleFilterSearch();
		}
	};

	const onClickPrevious = () => {
		if (currentPage > 1) {
			setCurrentPage(currentPage - 1);
			handleFilterSearch();
		}
	};

	const onClickNext = () => {
		if (totalPage() > currentPage) {
			setCurrentPage(currentPage + 1);
			handleFilterSearch();
		}
	};

	const onClickLast = () => {
		if (totalPage() > currentPage) {
			setCurrentPage(totalPage());
			handleFilterSearch();
		}
	};

	const totalPage = () => {
		return Math.ceil(remHistory.recordCount / pageSize) | 0;
	};

	const onClickToggle = () => {
		setRemHistoryToggle(!remHistoryToggle);
	};
	return (
		<>
			<div className='col-lg-6'>
				<h6>Relationship Management History</h6>
			</div>

			<div className='col-lg-6'>
				<div
					className='btn btn-icon w-auto px-0'
					style={{float: right, marginTop: '-10px'}}
					data-kt-toggle='true'
					data-kt-toggle-state='active'
					onClick={onClickToggle}
				>
					<FontAwesomeIcon icon={remHistoryToggle ? faMinusSquare : faPlusSquare} />
				</div>
			</div>
			<FormContainer onSubmit={formik.handleSubmit}>
				<div className='row' style={remHistoryToggle ? {} : styleHideDetails}>
					<div className='col-lg-4  mt-3'>
						<label></label>
						<label>Assignment History Period</label>
						<DefaultDateRangePicker
							format='dd/MM/yyyy HH:mm:ss'
							maxDays={180}
							onChange={(val: any) => formik.setFieldValue('assignmentDate', val)}
							value={formik.values.assignmentDate}
						/>
					</div>

					<div className='col-lg-4  mt-3'>
						<label>Action Type</label>
						<Select
							isMulti
							size='small'
							style={{width: '100%'}}
							options={remLookups.remActionTypes}
							onChange={(val: any) => formik.setFieldValue('actionTypeIds', val)}
							value={formik.values.actionTypeIds}
							isClearable={true}
						/>
					</div>

					<div className='col-lg-4  mt-3'>
						<label>ReM Profile Name</label>
						<Select
							isMulti
							size='small'
							style={{width: '100%'}}
							options={remLookups.remProfileNames}
							onChange={(val: any) => formik.setFieldValue('remProfileIds', val)}
							value={formik.values.remProfileIds}
							isClearable={true}
						/>
					</div>

					<div className='col-lg-4  mt-3'>
						<label>ReM Agent Name</label>
						<Select
							isMulti
							size='small'
							style={{width: '100%'}}
							options={remLookups.remAgentNames}
							onChange={(val: any) => formik.setFieldValue('remAgentIds', val)}
							value={formik.values.remAgentIds}
							isClearable={true}
						/>
					</div>

					<div className='col-lg-4  mt-3'>
						<label>Pseudo Name</label>
						<BasicTextInput
							disabled={false}
							ariaLabel={'Pseudo Name'}
							value={formik.values.pseudoName}
							onChange={(val: any) => formik.setFieldValue('pseudoName', val.target.value)}
						/>
					</div>

					<div className='col-lg-12  mt-5'>
						<button
							type='submit'
							className='btn btn-primary btn-sm me-2'
							onClick={handleFilterSearch}
							disabled={formik.isSubmitting || !userAccess.includes(USER_CLAIMS.RemProfileRead)}
						>
							{!loading && <span className='indicator-label'>Search</span>}
							{loading && (
								<span className='indicator-progress' style={{display: 'block'}}>
									Please wait...
									<span className='spinner-border spinner-border-sm align-middle ms-2'></span>
								</span>
							)}
						</button>

						<MlabButton access={true} label={'Clear'} style={ElementStyle.secondary} type={'button'} weight={'solid'} onClick={clearFilter} />

						<MlabButton
							access={true}
							size={'sm'}
							label={'Export to CSV'}
							style={ElementStyle.primary}
							type={'button'}
							weight={'solid'}
							loading={false}
							disabled={remHistory.remHistoryList.length == 0}
							loadingTitle={'Please wait...'}
							onClick={handleExportFilterSearch}
						/>
					</div>

					<div className='ag-theme-quartz mt-5' style={{height: 500, width: '100%', marginBottom: '50px', position: 'relative', padding: 0}}>
						<AgGridReact
							ref={gridRef}
							rowStyle={{userSelect: 'text'}}
							rowData={remHistory.remHistoryList}
							defaultColDef={{
								sortable: true,
								resizable: true,
							}}
							onGridReady={onGridReady}
							rowBuffer={0}
							//enableRangeSelection={true} //deprecated in AgGridReactver.32.0.0
							pagination={false}
							paginationPageSize={pageSize}
							columnDefs={columnDefs}
							overlayLoadingTemplate={gridOverlayTemplate}
							overlayNoRowsTemplate={noRowResultTemplate}
							onSortChanged={(e) => onSort(e)}
							animateRows={true}
						/>

						<DefaultGridPagination
							recordCount={remHistory.recordCount}
							currentPage={currentPage}
							pageSize={pageSize}
							onClickFirst={onClickFirst}
							onClickPrevious={onClickPrevious}
							onClickNext={onClickNext}
							onClickLast={onClickLast}
							onPageSizeChanged={onPageSizeChanged}
						/>
					</div>
				</div>
			</FormContainer>
		</>
	);
};

export default PlayerRemHistory;
