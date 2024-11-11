import {useEffect, useRef, useState} from 'react';
import {Button, Modal, OverlayTrigger, Tooltip} from 'react-bootstrap-v5';
import {shallowEqual, useSelector} from 'react-redux';
import {RootState} from '../../../../setup';
import {CaseTypeEnum} from '../../../constants/Constants';
import {GridWithLoaderAndPagination} from '../../../custom-components';
import useFnsDateFormatter from '../../../custom-functions/helper/useFnsDateFormatter';
import {IAuthState} from '../../auth';
import {DefaultPageSetup} from '../../system/components/constants/PlayerConfigEnums';
import {USER_CLAIMS} from '../../user-management/components/constants/UserClaims';
import {ServiceCommunicationHistoryFilterRequestModel} from '../models/request/ServiceCommunicationHistoryFilterRequestModel';
import {ServiceCommunicationHistoryModel} from '../models/response/ServiceCommunicationHistoryModel';
import {GetServiceCommunicationHistory} from '../redux/AgentWorkspaceService';

interface Props {
	campaignId: number;
	playerId: string;
	modal: boolean;
	toggle: () => void;
	brandName: string;
}

const CommunicationHistoryModal = ({campaignId, playerId, modal, toggle, brandName}: Props) => {
	const {mlabFormatDate} = useFnsDateFormatter();
	const {access} = useSelector<RootState>(({auth}) => auth, shallowEqual) as IAuthState;
	const hasViewCaseAccess = access?.includes(USER_CLAIMS.ViewCaseRead);

	const customCellCreatedDateRender = (params: any) => {
		const {data} = params;
		const formattedDate = mlabFormatDate(data.createdDate);

		return <>{formattedDate}</>;
	};

	const renderRecordingLink = (_param: any) => {
		return (
			_param.data.recordingUrl && (
				<OverlayTrigger placement='top' delay={{show: 250, hide: 400}} overlay={renderCommunicationHistoryTooltip(_param.data.recordingUrl)}>
					<button type='button' className='btn btn-sm' onClick={() => handRedirectRecordingLink(_param.data.recordingUrl)}>
						<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none'>
							<path d='M12 14a3 3 0 0 0 3-3V5a3 3 0 1 0-6 0v6a3 3 0 0 0 3 3z' fill='#009ef7' />
							<path
								d='M19 11a1 1 0 0 0-2 0 5 5 0 1 1-10 0 1 1 0 1 0-2 0 7 7 0 0 0 6 6.93V21h-3a1 1 0 1 0 0 2h8a1 1 0 1 0 0-2h-3v-3.07A7 7 0 0 0 19 11z'
								fill='#009ef7'
							/>
						</svg>
					</button>
				</OverlayTrigger>
			)
		);
	};

	const renderCallDuration = (_param: any) => {
		return _param.data.recordingUrl && <>{_param.data.duration}</>;
	};

	const renderCommunicationHistoryTooltip = (message: any) => (
		<Tooltip id='case-list-button-tooltip'>
			<>{message}</>
		</Tooltip>
	);

	const handRedirectRecordingLink = (_recordingLink: string) => {
		window.open(_recordingLink, '_blank');
	};

	const customCellCaseIdRender = (params: any) => {
		const {data} = params;

		let caseIdUrl = '';
		if (data.caseTypeId == CaseTypeEnum.CustomerService) {
			caseIdUrl = `/case-management/service-case/${data.caseId}`;
		} else {
			caseIdUrl = `/campaign-workspace/view-case/${data.caseId}`;
		}

		return (
			<>
				{hasViewCaseAccess ? (
					<a href={caseIdUrl} target='_blank' rel='noreferrer'>
						{data.caseId}
					</a>
				) : (
					data.caseId
				)}
			</>
		);
	};
	const customCellCommunicationIdRender = (params: any) => {
		const {data} = params;

		let communicationIdUrl = '';
		if (data.caseTypeId == CaseTypeEnum.CustomerService) {
			communicationIdUrl = `/case-management/service-case/${data.caseId}#${data.communicationId}`;
		} else {
			communicationIdUrl = `/campaign-workspace/view-communication/${data.communicationId}`;
		}

		return (
			<>
				{hasViewCaseAccess ? (
					<a href={communicationIdUrl} target='_blank' rel='noreferrer'>
						{data.communicationId}
					</a>
				) : (
					data.communicationId
				)}
			</>
		);
	};

	const columnDefs = [
		{headerName: 'Case ID', field: 'caseId', flex: 1, cellRenderer: customCellCaseIdRender},
		{headerName: 'Communication ID', field: 'communicationId', flex: 1, cellRenderer: customCellCommunicationIdRender},
		{headerName: 'Message Type', field: 'messageType', flex: 1},
		{headerName: 'Message Status', field: 'messageStatus', flex: 1},
		{headerName: 'Message Response', field: 'messageResponse', flex: 1},
		{headerName: 'Recording Link', field: 'recordingUrl', flex: 1, cellRenderer: renderRecordingLink},
		{headerName: 'Call Duration', field: 'duration', flex: 1, cellRenderer: renderCallDuration},
		{headerName: 'Created By', field: 'createdBy', flex: 1},
		{headerName: 'Created Date', field: 'createdDate', flex: 1, cellRenderer: customCellCreatedDateRender},
	];
	const gridRef: any = useRef();
	const [communicationHistoryList, setCommunicationHistoryList] = useState<Array<ServiceCommunicationHistoryModel>>([]);
	const [pageSize, setPageSize] = useState<number>(DefaultPageSetup.pageSizeDefault);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [recordCount, setRecordCount] = useState<number>(0);
	const [sortOrder, setSortOrder] = useState<string>('DESC');
	const [sortColumn, setSortColumn] = useState<string>('CreatedDate');
	const [loading, setLoading] = useState(false);

	const onSort = (e: any) => {
		if (communicationHistoryList != undefined && communicationHistoryList.length > 0) {
			const sortDetail = e.api.getSortModel();
			if (sortDetail[0] != undefined) {
				setSortColumn(sortDetail[0]?.colId);
				setSortOrder(sortDetail[0]?.sort);
				getCommunicationHistory(sortDetail[0]?.colId, sortDetail[0]?.sort);
			} else {
				setSortColumn('');
				setSortOrder('');
				getCommunicationHistory();
			}
		}
	};
	const totalPage = () => {
		return Math.ceil(recordCount / pageSize) | 0;
	};
	const onPaginationClickFirst = () => {
		if (currentPage > 1) {
			setCurrentPage(1);
			paginationLoadList(pageSize, 1, sortColumn, sortOrder);
		}
	};

	const onPaginationClickPrevious = () => {
		if (currentPage > 1) {
			setCurrentPage(currentPage - 1);
			paginationLoadList(pageSize, currentPage - 1, sortColumn, sortOrder);
		}
	};

	const onPaginationClickNext = () => {
		if (totalPage() > currentPage) {
			setCurrentPage(currentPage + 1);
			paginationLoadList(pageSize, currentPage + 1, sortColumn, sortOrder);
		}
	};

	const onPaginationClickLast = () => {
		if (totalPage() > currentPage) {
			setCurrentPage(totalPage());
			paginationLoadList(pageSize, totalPage(), sortColumn, sortOrder);
		}
	};

	const paginationLoadList = (_pageSize: number, _currentPage: number, _sortColumn: string, _sortOrder: string) => {
		getCommunicationHistory(_sortColumn, _sortOrder, (_currentPage - 1) * _pageSize, _pageSize);
	};
	const onPaginationPageSizeChanged = () => {
		const value: string = (document.getElementById('page-size') as HTMLInputElement).value;
		setPageSize(Number(value));
		setCurrentPage(1);
		if (communicationHistoryList != undefined && communicationHistoryList.length > 0) {
			paginationLoadList(Number(value), 1, sortColumn, sortOrder);
		}
	};
	const getCommunicationHistory = async (_sortColumn?: string, _sortOrder?: string, _offsetValue?: number, _pageSize?: number) => {
		let request: ServiceCommunicationHistoryFilterRequestModel = {
			campaignId: campaignId,
			playerId: playerId,
			pageSize: pageSize,
			offsetValue: (currentPage - 1) * pageSize,
			sortColumn: _sortColumn ?? sortColumn,
			sortOrder: _sortOrder ?? sortOrder,
			brandName: brandName,
		};
		setLoading(true);
		setCommunicationHistoryList([]);

		GetServiceCommunicationHistory(request)
			.then((response) => {
				if (response) {
					setCommunicationHistoryList(response.data.campaignServiceCommunications);
					setRecordCount(response.data.recordCount);
					setLoading(false);
				}
			})
			.catch(() => {
				setLoading(false);
			});
	};

	useEffect(() => {
		if (!loading && communicationHistoryList.length === 0) {
			if (document.getElementById('mlab-grid-loading-overlay') as HTMLInputElement) {
				(document.getElementById('mlab-grid-loading-overlay') as HTMLInputElement).innerText = 'No Rows To Show';
			}
		} else if (document.getElementById('mlab-grid-loading-overlay') as HTMLInputElement) {
			(document.getElementById('mlab-grid-loading-overlay') as HTMLInputElement).innerText = 'Please wait while your items are loading';
		}
	}, [loading]);

	useEffect(() => {
		if (modal && campaignId !== 0 && playerId !== '0' && playerId !== '') {
			//get the deposit attempts
			getCommunicationHistory();
		} else {
			setCommunicationHistoryList([]);
		}
	}, [modal, campaignId, playerId]);

	return (
		<Modal show={modal} size={'xl'} onHide={() => toggle()}>
			<Modal.Header>
				<Modal.Title>Communication History</Modal.Title>
				{/* <div className='btn btn-icon btn-sm btn-light-primary' onClick={() => toggle()}>
            <KTSVG className='svg-icon-2' path='/media/icons/duotone/Navigation/Close.svg' />
          </div> */}
			</Modal.Header>
			<Modal.Body>
				<GridWithLoaderAndPagination
					gridRef={gridRef}
					rowData={communicationHistoryList}
					columnDefs={columnDefs}
					sortColumn={sortColumn}
					sortOrder={sortOrder}
					isLoading={loading}
					height={500}
					onSortChanged={(e: any) => onSort(e)}
					//pagination details
					recordCount={recordCount}
					currentPage={currentPage}
					pageSize={pageSize}
					onClickFirst={onPaginationClickFirst}
					onClickPrevious={onPaginationClickPrevious}
					onClickNext={onPaginationClickNext}
					onClickLast={onPaginationClickLast}
					onPageSizeChanged={onPaginationPageSizeChanged}
				></GridWithLoaderAndPagination>
			</Modal.Body>
			<Modal.Footer className='d-flex bd-highlights'>
				<Button variant='secondary' onClick={toggle}>
					Close
				</Button>
			</Modal.Footer>
		</Modal>
	);
};

const tableLoader = (data: any) => {
	return (
		<div className='ag-custom-loading-cell' style={{paddingLeft: '10px', lineHeight: '25px'}}>
			<i className='fas fa-spinner fa-pulse'></i> <span> {data.loadingMessage}</span>
		</div>
	);
};

export default CommunicationHistoryModal;
