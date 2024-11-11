import {faTrash} from '@fortawesome/free-solid-svg-icons';
import {AgGridReact} from 'ag-grid-react';
import {Guid} from 'guid-typescript';
import {useContext, useEffect, useRef, useState} from 'react';
import {Col, Row} from 'react-bootstrap-v5';
import {shallowEqual, useSelector} from 'react-redux';
import swal from 'sweetalert';
import {RootState} from '../../../../../../../../../setup';
import gridOverlayTemplate, {gridOverlayNoRowsTemplate} from '../../../../../../../../common-template/gridTemplates';
import {ElementStyle} from '../../../../../../../../constants/Constants';
import useConstant from '../../../../../../../../constants/useConstant';
import {FormGroupContainer, MainContainer, MlabButton, SmallGridPagination, TableIconButton} from '../../../../../../../../custom-components';
import {LookupModel} from '../../../../../../../../shared-models/LookupModel';
import {SelectFilter} from '../../../../../../../relationship-management/shared/components';
import {DefaultPageSetup} from '../../../../../../../system/components/constants/PlayerConfigEnums';
import {TicketContext} from '../../../../../../context/TicketContext';
import {AddUserCollaboratorRequestModel} from '../../../../../../models/request/AddUserCollaboratorRequestModel';
import {GetUserCollaboratorList, RemoveUserAsCollaborator, ValidateAddUserCollaborator} from '../../../../../../services/TicketManagementApi';

const CollaboratorGrid: React.FC = () => {
	const {ticketInformation} = useContext(TicketContext);
	const [rowData, setRowData] = useState<any>();
	const [isSubmit, setIsSubmit] = useState<boolean>(false);
	const {SwalCampaignMessage, SwalConfirmMessage, successResponse, SwalSuccessRecordMessage, SwalSuccessDeleteRecordMessage} = useConstant();
	const [userCollaboratorList, setUserCollaboratorList] = useState<Array<LookupModel>>([]);
	const [filteredUserCollaboratorList, setFilteredUserCollaboratorList] = useState<Array<LookupModel>>([]);
	const [selectedCollaborator, setSelectedCollaborator] = useState<LookupModel | null>();
	const [hasUserSelected, setHasUserSelected] = useState<boolean>(true);
	const {historyFilter, ticketHistoryAsync, ticketCollaboratorData, getTicketCollaboratorListAsync} = useContext(TicketContext);

	// sort and pagination
	const pageSize: number = DefaultPageSetup.pageSizeDefault;
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [sortOrder, setSortOrder] = useState<string>('DESC');
	const [sortColumn, setSortColumn] = useState<string>('TicketCollaboratorId');
	const gridHeight: number = 416;
	const gridRef: any = useRef();

	// user Id
	const userId = useSelector<RootState>(({auth}) => auth.userId, shallowEqual) as string;

	useEffect(() => {
		if (ticketInformation && ticketInformation.ticketId > 0) {
			getTicketCollaborator();
			getUserCollaboratorList();
		}
	}, [ticketInformation]);

	useEffect(() => {
		if (ticketCollaboratorData) {
			const gridList = ticketCollaboratorData?.collaboratordGridDetailsList;
			setRowData(gridList ?? []);

			if (userCollaboratorList.length > 0) {
				const newUserCollaboratorList: Array<LookupModel> = userCollaboratorList.filter(
					(u: any) => !gridList?.some((g: any) => u.value === g.ticketCollaboratorUserId)
				);
				setFilteredUserCollaboratorList(newUserCollaboratorList);
			}
		}
	}, [ticketCollaboratorData]);

	const getTicketCollaborator = (_sortColumn?: string, _sortOrder?: string, _offsetValue?: number, _pageSize?: number) => {
		const request: any = {
			ticketId: ticketInformation.ticketId,
			ticketTypeId: ticketInformation.ticketTypeId,
			sortOrder: _sortOrder ?? sortOrder,
			sortColumn: _sortColumn ?? sortColumn,
			offsetValue: _offsetValue ?? (currentPage - 1) * pageSize,
			pageSize: _pageSize ?? pageSize,
			userId: userId.toString() ?? '0',
			queueId: Guid.create().toString(),
		};

		if (ticketInformation && ticketInformation.ticketId > 0) {
			getTicketCollaboratorListAsync(request);
		}
	};

	const getUserCollaboratorList = () => {
		GetUserCollaboratorList().then((response: any) => {
			if (response.status === successResponse) {
				setUserCollaboratorList(response.data);
			}
		});
	};

	const onGridReady = (params: any) => {
		params.api.sizeColumnsToFit();
	};

	const hanldeSubmit = () => {
		setIsSubmit(true);
		swal({
			title: SwalCampaignMessage.titleConfirmation,
			text: SwalCampaignMessage.textConfirmSaveCampaignCustomEvent,
			icon: SwalCampaignMessage.iconWarning,
			buttons: [SwalConfirmMessage.btnNo, SwalConfirmMessage.btnYes],
			dangerMode: true,
		}).then((response) => {
			if (response) {
				submitUserCollaborator();
				setIsSubmit(false);
				setSelectedCollaborator(null);
				if (ticketInformation && ticketInformation.ticketId > 0) {
					ticketHistoryAsync(historyFilter);
				}
				setHasUserSelected(true);
			} else {
				setIsSubmit(false);
			}
		});
	};

	const submitUserCollaborator = () => {
		const requestObj: AddUserCollaboratorRequestModel = {
			userId: parseInt(selectedCollaborator?.value ?? '0'),
			username: selectedCollaborator?.label ?? '',
			ticketId: ticketInformation.ticketId,
			tIcketTypeId: ticketInformation.ticketTypeId,
			createdBy: parseInt(userId ?? '0'),
		};

		ValidateAddUserCollaborator(requestObj).then((response: any) => {
			if (response.status === successResponse) {
				swal(SwalSuccessRecordMessage.title, SwalSuccessRecordMessage.textSuccess, SwalSuccessRecordMessage.icon).then((response) => {
					if (response) {
						getTicketCollaborator();
					}
				});
			}
		});
	};

	const handleRemove = (param: any) => {
		swal({
			title: SwalCampaignMessage.titleConfirmation,
			text: SwalConfirmMessage.textConfirmRemove,
			icon: SwalCampaignMessage.iconWarning,
			buttons: [SwalConfirmMessage.btnNo, SwalConfirmMessage.btnYes],
			dangerMode: true,
		}).then((response) => {
			if (response) {
				const request: any = {
					ticketCollaboratorID: param.ticketCollaboratorID,
					ticketId: param.ticketId,
					ticketTypeId: param.ticketTypeId,
					userId: param.ticketCollaboratorUserId,
				};

				removeUserAsCollaborator(request);
			}
		});
	};

	const removeUserAsCollaborator = (request: any) => {
		RemoveUserAsCollaborator(request).then((response: any) => {
			if (response.status === successResponse) {
				swal(SwalSuccessDeleteRecordMessage.title, SwalSuccessDeleteRecordMessage.textSuccess, SwalSuccessDeleteRecordMessage.icon).then(
					(response) => {
						if (response) {
							getTicketCollaborator();
						}
					}
				);
			}
		});
	};

	const renderActionButton = (param: any) => {
		return (
			<div style={{textAlign: 'center'}}>
				{!param.data.isReporter && (
					<TableIconButton access={true} faIcon={faTrash} toolTipText={'Delete'} iconColor={'text-danger'} onClick={() => handleRemove(param.data)} />
				)}
			</div>
		);
	};

	const columnDefs = [
		{headerName: 'Collaborator Name', field: 'ticketCollaboratorUserName', minWidth: 200},
		{headerName: 'Action', field: 'action', width: 100, cellRenderer: renderActionButton, sortable: false},
	];

	const onClickPrevious = () => {
		if (currentPage > 1) {
			setCurrentPage(currentPage - 1);
			paginationLoadTicketList(sortColumn, sortOrder, currentPage - 1, pageSize);
		}
	};

	const onClickNext = () => {
		if (totalPage() > currentPage) {
			setCurrentPage(currentPage + 1);
			paginationLoadTicketList(sortColumn, sortOrder, currentPage + 1, pageSize);
		}
	};

	const onClickFirst = () => {
		if (currentPage > 1) {
			setCurrentPage(1);
			paginationLoadTicketList(sortColumn, sortOrder, 1, pageSize);
		}
	};

	const onClickLast = () => {
		if (totalPage() > currentPage) {
			setCurrentPage(totalPage());
			paginationLoadTicketList(sortColumn, sortOrder, totalPage(), pageSize);
		}
	};

	const totalPage = () => {
		return Math.ceil((ticketCollaboratorData?.rowCount ?? 0) / pageSize) | 0;
	};

	const paginationLoadTicketList = (_sortColumn: string, _sortOrder: string, _currentPage: number, _pageSize: number) => {
		loadTicketList(_sortColumn, _sortOrder, (_currentPage - 1) * _pageSize, _pageSize);
	};

	const loadTicketList = (_sortColumn?: string, _sortOrder?: string, _offsetValue?: number, _pageSize?: number) => {
		if (ticketInformation && ticketInformation.ticketId > 0) {
			getTicketCollaborator(_sortColumn, _sortOrder, _offsetValue, _pageSize);
		}
	};

	const collaboratorOnChange = (e: any) => {
		setHasUserSelected(false);
		setSelectedCollaborator(e);
	};

	const onSort = (e: any) => {
		const sortDetail = e.api.getSortModel();
		if (sortDetail[0] != undefined) {
			setSortColumn(sortDetail[0]?.colId);
			setSortOrder(sortDetail[0]?.sort);
			loadTicketList(sortDetail[0]?.colId, sortDetail[0]?.sort, (currentPage - 1) * pageSize, pageSize);
		} else {
			setSortColumn('');
			setSortOrder('');
			loadTicketList('TicketCollaboratorId', 'DESC', (currentPage - 1) * pageSize, pageSize);
		}
	};

	return (
		<MainContainer>
			<FormGroupContainer>
				<Row className='collab-add-container'>
					<Col lg={8}>
						<SelectFilter
							isRequired={false}
							isMulti={false}
							label='Add Collaborator'
							options={filteredUserCollaboratorList}
							onChange={(val: any) => collaboratorOnChange(val)}
							value={selectedCollaborator}
						/>
					</Col>
					<Col lg={4}>
						<MlabButton
							type={'button'}
							label={'Add'}
							access={true}
							style={ElementStyle.primary}
							weight={'solid'}
							onClick={hanldeSubmit}
							loading={isSubmit}
							loadingTitle='Please wait...'
							disabled={isSubmit || hasUserSelected}
						/>
					</Col>
				</Row>
				<Row>
					<div className='ag-theme-quartz' style={{height: gridHeight, width: '100%', marginBottom: '50px'}}>
						<AgGridReact
							rowStyle={{userSelect: 'text'}}
							rowData={rowData}
							defaultColDef={{
								sortable: true,
								resizable: true,
							}}
							columnDefs={columnDefs}
							onGridReady={onGridReady}
							rowBuffer={0}
							rowSelection={'multiple'}
							pagination={false}
							ref={gridRef}
							alwaysShowHorizontalScroll={false}
							animateRows={true}
							paginationPageSize={pageSize}
							onSortChanged={(e) => onSort(e)}
							overlayNoRowsTemplate={gridOverlayNoRowsTemplate}
							overlayLoadingTemplate={gridOverlayTemplate}
						/>
						<SmallGridPagination
							recordCount={ticketCollaboratorData?.rowCount ?? 0}
							currentPage={currentPage}
							pageSize={pageSize}
							onClickFirst={onClickFirst}
							onClickPrevious={onClickPrevious}
							onClickNext={onClickNext}
							onClickLast={onClickLast}
						/>
					</div>
				</Row>
			</FormGroupContainer>
		</MainContainer>
	);
};

export default CollaboratorGrid;
