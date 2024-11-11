import {faPencilAlt, faTrash} from '@fortawesome/free-solid-svg-icons';
import {AgGridReact} from 'ag-grid-react';
import React from 'react';
import {ButtonGroup} from 'react-bootstrap-v5';
import {FormHeader, LocalGridPagination, MainContainer, TableIconButton} from '../../../../../custom-components';
import {CommunicationProviderAccountListbyIdResponseModel} from '../../../models';
import { ColDef, ColGroupDef } from 'ag-grid-community';

interface Props {
	rowData: Array<CommunicationProviderAccountListbyIdResponseModel>;
	onGridReady: (e: any) => void;
	gridPageSize: number;
	gridRef: any;
	onPaginationChanged: () => void;
	gridCurrentPage: number;
	setGridPageSize: (e: number) => void;
	gridTotalPages: number;
	customPageSizeElementId: string;
	removeCommunicationProvider: (e: CommunicationProviderAccountListbyIdResponseModel) => void;
	editCommunicationProvider: (e: CommunicationProviderAccountListbyIdResponseModel) => void;
}
const CommunicationProviderAccountList: React.FC<Props> = (Props) => {
	const {
		rowData,
		onGridReady,
		gridPageSize,
		onPaginationChanged,
		gridRef,
		gridCurrentPage,
		setGridPageSize,
		gridTotalPages,
		customPageSizeElementId,
		removeCommunicationProvider,
		editCommunicationProvider,
	} = Props;

	const columnDefs : (ColDef<CommunicationProviderAccountListbyIdResponseModel> | ColGroupDef<CommunicationProviderAccountListbyIdResponseModel>)[] = [
		{headerName: 'Message Type', field: 'messageTypeName'},
		{headerName: 'Account ID', field: 'accountId'},
		{
			headerName: 'Status',
			field: 'chatUserAccountStatus',
		},
		{
			headerName: 'Action',
			field: 'chatUserAccountId',
			cellRenderer: (params: any) => (
				<ButtonGroup aria-label='Basic example'>
					<div className='d-flex justify-content-center flex-shrink-0'>
						<div className='me-6'>
							<TableIconButton
								access={true}
								faIcon={faPencilAlt}
								// isDisable={disableLanguage}
								toolTipText={'Edit'}
								onClick={() => editCommunicationProvider(params.data)}
							/>
						</div>
						<div className='me-6'>
							<TableIconButton
								access={true}
								faIcon={faTrash}
								// isDisable={disableLanguage}
								toolTipText={'Remove'}
								iconColor={'text-danger'}
								onClick={() => removeCommunicationProvider(params.data)}
							/>
						</div>
					</div>
				</ButtonGroup>
			),
		},
	];

	return (
		<MainContainer>
			<div style={{marginTop: 20, marginBottom: 20}}>
				<h5 className='fw-bolder'>{'Communication Provider Account List'}</h5>
			</div>
			<div className='ag-theme-quartz topicList-table' style={{height: 400, width: '100%'}}>
				<AgGridReact
					rowData={rowData}
					defaultColDef={{
						sortable: true,
						resizable: true,
					}}
					onGridReady={onGridReady}
					rowBuffer={0}
					//enableRangeSelection={true} //deprecated in AgGridReactver.32.0.0
					columnDefs={columnDefs}
					ref={gridRef}
					paginationPageSize={gridPageSize}
					pagination={true}
					suppressPaginationPanel={true}
					suppressScrollOnNewData={true}
					onPaginationChanged={onPaginationChanged}
				/>

				<LocalGridPagination
					recordCount={rowData.length}
					gridCurrentPage={gridCurrentPage}
					gridPageSize={gridPageSize}
					setGridPageSize={setGridPageSize}
					gridTotalPages={gridTotalPages}
					gridRef={gridRef}
					customId={customPageSizeElementId}
				/>
			</div>
		</MainContainer>
	);
};

export default CommunicationProviderAccountList;
