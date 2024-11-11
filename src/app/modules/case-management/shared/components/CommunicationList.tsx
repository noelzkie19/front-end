import {faPencilAlt} from '@fortawesome/free-solid-svg-icons';
import React, {useEffect, useRef, useState} from 'react';
import {ButtonGroup, Col, Row} from 'react-bootstrap-v5';
import {useHistory} from 'react-router-dom';
import swal from 'sweetalert';
import useConstant from '../../../../constants/useConstant';
import {GridWithLoaderAndPagination, MainContainer, TableIconButton} from '../../../../custom-components';
import {CustomerCaseCommListRequestModel} from '../../models/CustomerCaseCommListRequestModel';
import {CustomerCaseCommModel} from '../../models/CustomerCaseCommModel';
import {GetCustomerCaseCommListAsync} from '../../services/CustomerCaseApi';

interface Props {
	caseId: number;
}

const CommunicationList: React.FC<Props> = (Props) => {
	const {caseId} = Props;

	/**
	 *  ? States
	 */
	const [customerCaseCommList, setCustomerCaseCommList] = useState<Array<CustomerCaseCommModel>>([]);
	const [loading, setLoading] = useState(false);

	const gridRef: any = useRef();
	const [pageSize, setPageSize] = useState<number>(10);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [recordCount, setRecordCount] = useState<number>(0);
	const [sortOrder, setSortOrder] = useState<string>('ASC');
	const [sortColumn, setSortColumn] = useState<string>('CaseCommunicationId');

	/**
	 *  ? Hooks
	 */
	const history = useHistory();
	const {SwalConfirmMessage} = useConstant();

	/**
	 * Tables
	 */
	const columnDefs = [
		{
			headerName: 'Communication ID',
			field: 'caseCommunicationId',
			cellRenderer: (params: any) => (
				<label
					className='btn-link cursor-pointer'
					onClick={() => {
						viewCommunication(params.data.caseCommunicationId);
					}}
				>
					{params.data.caseCommunicationId}
				</label>
			),
		},
		{headerName: 'Purpose', field: 'purpose'},
		{headerName: 'External ID', field: 'externalCommunicationId'},
		{headerName: 'Message Type', field: 'messageType'},
		{headerName: 'Message Status', field: 'messageStatus'},
		{headerName: 'Communication Owner', field: 'communicationOwner'},
		{headerName: 'Created Date', field: 'createdDate'},
		{headerName: 'Reported Date', field: 'reportedDate'},
		{
			headerName: 'Action',
			width: 100,
			cellRenderer: (params: any) => (
				<ButtonGroup aria-label='Basic example'>
					<div className='d-flex justify-content-center flex-shrink-0'>
						<div className='me-4'>
							<TableIconButton
								access={true}
								faIcon={faPencilAlt}
								toolTipText={'Edit'}
								onClick={() => editCommunication(params.data.caseCommunicationId)}
								isDisable={false}
							/>
						</div>
					</div>
				</ButtonGroup>
			),
		},
	];

	/**
	 *  ? Events
	 */
	useEffect(() => {
		getCustomerCaseCommList(caseId, pageSize, 1, sortColumn, sortOrder);
	}, [caseId]);

	/**
	 *  ? Methods
	 */
	const editCommunication = (_communicationId: number) => {
		swal({
			title: SwalConfirmMessage.title,
			text: 'Edit Case is in progress. This action will discard any changes made. Please confirm.',
			icon: SwalConfirmMessage.icon,
			buttons: [SwalConfirmMessage.btnNo, SwalConfirmMessage.btnYes],
			dangerMode: true,
		}).then((willSave) => {
			if (willSave) {
				history.push(`/case-management/edit-communication/${_communicationId}`);
			}
		});
	};
	const viewCommunication = (_communicationId: number) => {};

	/**
	 *  ? Table events
	 */
	const onPageSizeChanged = () => {
		const value: string = (document.getElementById('page-size') as HTMLInputElement).value;
		setPageSize(Number(value));
		setCurrentPage(1);

		if (customerCaseCommList != undefined && customerCaseCommList.length > 0) {
			getCustomerCaseCommList(caseId, Number(value), 1, sortColumn, sortOrder);
		}
	};

	const onClickFirst = () => {
		if (currentPage > 1) {
			setCurrentPage(1);
			getCustomerCaseCommList(caseId, pageSize, 1, sortColumn, sortOrder);
		}
	};

	const onClickPrevious = () => {
		if (currentPage > 1) {
			setCurrentPage(currentPage - 1);
			getCustomerCaseCommList(caseId, pageSize, currentPage - 1, sortColumn, sortOrder);
		}
	};

	const onClickNext = () => {
		if (totalPage() > currentPage) {
			setCurrentPage(currentPage + 1);
			getCustomerCaseCommList(caseId, pageSize, currentPage + 1, sortColumn, sortOrder);
		}
	};

	const onClickLast = () => {
		if (totalPage() > currentPage) {
			setCurrentPage(totalPage());
			getCustomerCaseCommList(caseId, pageSize, totalPage(), sortColumn, sortOrder);
		}
	};

	const totalPage = () => {
		return Math.ceil(recordCount / pageSize) | 0;
	};

	const onSort = (e: any) => {
		setCurrentPage(1);

		if (customerCaseCommList != undefined && customerCaseCommList.length > 0) {
			let sortDetail: any = e.api.getSortModel();
			if (sortDetail[0] != undefined) {
				setSortColumn(sortDetail[0]?.colId);
				setSortOrder(sortDetail[0]?.sort);
				getCustomerCaseCommList(caseId, pageSize, 1, sortDetail[0]?.colId, sortDetail[0]?.sort);
			} else {
				setSortColumn('');
				setSortOrder('');
				getCustomerCaseCommList(caseId, pageSize, 1, '', '');
			}
		}
	};

	const getCustomerCaseCommList = (_customerCaseId: number, _pageSize: number, _currentPage: number, _sortColumn: string, _sortOrder: string) => {
		const request: CustomerCaseCommListRequestModel = {
			caseInformationId: _customerCaseId,
			pageSize: _pageSize,
			offsetValue: (_currentPage - 1) * _pageSize,
			sortColumn: _sortColumn,
			sortOrder: _sortOrder,
		};

		GetCustomerCaseCommListAsync(request)
			.then((response) => {
				if (response.status === 200) {
					let customerCaseList: Array<CustomerCaseCommModel> = response.data.caseCommunicationList;
					if (customerCaseList != null) {
						setCustomerCaseCommList(customerCaseList);
						setRecordCount(response.data.recordCount);
						return;
					}
				}
			})
			.catch((ex) => {
				console.log('[ERROR] Customer Case: ' + ex);
				swal('Failed', 'Problem in getting customer case communication list', 'error');
			});
	};

	return (
		<MainContainer>
			<div style={{margin: 20}}>
				<Row>
					<Col sm='6'>
						<h5 className='fw-bolder'>{`Communication List`}</h5>
					</Col>
				</Row>
				<div className='ag-theme-quartz mt-5' style={{height: 400, width: '100%'}}>
					<GridWithLoaderAndPagination
						gridRef={gridRef}
						rowData={customerCaseCommList}
						columnDefs={columnDefs}
						sortColumn={sortColumn}
						sortOrder={sortOrder}
						isLoading={loading}
						height={350}
						onSortChanged={(e: any) => onSort(e)}
						//pagination details
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
			</div>
		</MainContainer>
	);
};

export default CommunicationList;
