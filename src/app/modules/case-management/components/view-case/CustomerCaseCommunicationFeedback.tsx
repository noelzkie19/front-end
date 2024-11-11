import {faTrash} from '@fortawesome/free-solid-svg-icons';
import {AgGridReact} from 'ag-grid-react';
import React from 'react';
import {ButtonGroup} from 'react-bootstrap';
import {shallowEqual, useSelector} from 'react-redux';
import {RootState} from '../../../../../setup';
import {FormGroupContainerBordered, TableIconButton} from '../../../../custom-components';
import {CustomerCaseCommunicationFeedbackModel} from '../../models/CustomerCaseCommunicationFeedbackModel';
import { ColDef, ColGroupDef } from 'ag-grid-community';

interface Props {
	communicationFeedback: Array<CustomerCaseCommunicationFeedbackModel>;
}
export const CustomerCaseCommunicationFeedback: React.FC<Props> = (Props) => {
	// Props
	const {communicationFeedback} = Props;

	// Get Redux Store
	const userAccess = useSelector<RootState>(({auth}) => auth.access, shallowEqual) as string;

	const onGridReady = (params: any) => {
		params.api.paginationGoToPage(4);
		params.api.sizeColumnsToFit();
	};

	const _removeFeedback = (data: string) => {
		//do nothing
	};

	// Table Content and Header
	const columnDefs : (ColDef<CustomerCaseCommunicationFeedbackModel> | ColGroupDef<CustomerCaseCommunicationFeedbackModel>)[] =[
		{
			headerName: 'No',
			field: 'feedbackTypeName',
			cellRenderer: (params: any) => <>{params ? <div>{params.rowIndex + 1}</div> : null}</>,
			width: 100,
		},
		{headerName: 'Feedback Type', field: 'feedbackTypeName'},
		{headerName: 'Feedback Category', field: 'feedbackCategoryName'},
		{headerName: 'Feedback Answer', field: 'feedbackAnswerName'},
		{headerName: 'Feedback Details', field: 'communicationFeedbackDetails'},
		{headerName: 'Solution Provided', field: 'communicationSolutionProvided'},
		{
			headerName: 'Action',
			cellRenderer: (params: any) => (
				<>
					{params.data.messageTypeId != 0 ? (
						<ButtonGroup aria-label='Basic example'>
							<div className='d-flex justify-content-center flex-shrink-0'>
								<TableIconButton
									access={true}
									faIcon={faTrash}
									isDisable={true}
									toolTipText={'Remove'}
									iconColor={'text-danger'}
									onClick={() => _removeFeedback(params.data)}
								/>
							</div>
						</ButtonGroup>
					) : null}
				</>
			),
		},
	];

	return (
		<FormGroupContainerBordered>
			<div className='row'>
				<label className='fw-bolder fs-6'>Feedback List&nbsp;</label>
				<div className='ag-theme-quartz mt-5' style={{height: 400, width: '100%', marginBottom: 20}}>
					<AgGridReact
						rowData={communicationFeedback}
						defaultColDef={{
							sortable: true,
							resizable: true,
						}}
						onGridReady={onGridReady}
						rowBuffer={0}
						rowSelection={'multiple'}
						pagination={true}
						paginationPageSize={10}
						columnDefs={columnDefs}
					/>
				</div>
			</div>
		</FormGroupContainerBordered>
	);
};

export default CustomerCaseCommunicationFeedback;
