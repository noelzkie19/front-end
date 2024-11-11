import {faPencilAlt, faToggleOff, faToggleOn} from '@fortawesome/free-solid-svg-icons';
import {AgGridReact} from 'ag-grid-react';
import React, {useEffect, useRef, useState} from 'react';
import {ButtonGroup} from 'react-bootstrap-v5';
import {shallowEqual, useSelector} from 'react-redux';
import {RootState} from '../../../../../setup';
import gridOverlayTemplate, {gridOverlayNoRowsTemplate} from '../../../../common-template/gridTemplates';
import {PaginationModel} from '../../../../common/model';
import {StatusTypeEnum, ToggleTypeEnum} from '../../../../constants/Constants';
import {DefaultGridPagination, FormGroupContainer, TableIconButton} from '../../../../custom-components';
import {formatDate} from '../../../../custom-functions/helper/dateHelper';
import {IAuthState} from '../../../auth';
import {USER_CLAIMS} from '../../../user-management/components/constants/UserClaims';
import {SkillFilterResponseModel, SkillResponseModel} from '../../models';
import { ColDef, ColGroupDef } from 'ag-grid-community';


type SkillGridProps = {
	loading: boolean;
	skillResponse: SkillFilterResponseModel;
	editSkill: (param: any) => void;
	searchSkill: (pagination: PaginationModel) => void;
	toggleSkill: (param: any) => void;
};

const SkillGrid: React.FC<SkillGridProps> = ({loading, skillResponse, editSkill, searchSkill, toggleSkill}: SkillGridProps) => {
	const gridRef: any = useRef();
	const {access, userId} = useSelector<RootState>(({auth}) => auth, shallowEqual) as IAuthState;
	
	const columnDefs : (ColDef<SkillResponseModel> | ColGroupDef<SkillResponseModel>)[] = [
			{headerName: 'Skill Id', field: 'skillId'},
			{headerName: 'Skill Name', field: 'skillName'},
			{headerName: 'Brand', field: 'brandName'},
			{headerName: 'License ID', field: 'licenseId'},
			{headerName: 'Message Type', field: 'messageTypeName'},
			{headerName: 'Player Username', field: 'playerName'},
			{headerName: 'Agent Username', field: 'agentUserName'},
			{headerName: 'Team Name', field: 'teamName'},
			{headerName: 'Topic', field: 'topicName'},
			{headerName: 'Subtopic', field: 'subtopicName'},
			{
				field: 'isActive',
				headerName: 'Status',
				cellRenderer: (params: any) => (params.data.isActive ? StatusTypeEnum.Active : StatusTypeEnum.Inactive),
			},
			{
				field: 'createdDate',
				headerName: 'Last Modified Date',
				cellRenderer: (params: any) =>
					formatDate(params.data.updatedDate) == '' ? formatDate(params.data.createdDate) : formatDate(params.data.updatedDate),
			},
			{
				headerName: 'Action',
				sortable: false,
				cellRenderer: (params: any) => (
					<>
						<ButtonGroup aria-label='Basic example'>
							<div className='d-flex justify-content-center flex-shrink-0'>
								<div className='me-4'>
									<TableIconButton
										access={access?.includes(USER_CLAIMS.SkillMappingWrite)}
										faIcon={faPencilAlt}
										toolTipText={'Edit'}
										onClick={() => editSkill(params.data)}
										isDisable={params.data.isActive}
									/>
								</div>
								<div className='me-4'>
									<TableIconButton
										access={access?.includes(USER_CLAIMS.SkillMappingWrite)}
										faIcon={params.data.isActive ? faToggleOff : faToggleOn}
										toolTipText={params.data.isActive ? ToggleTypeEnum.Deactivate : ToggleTypeEnum.Activate}
										onClick={() => toggleSkill(params.data)}
									/>
								</div>
							</div>
						</ButtonGroup>
					</>
				),
			},
		]

	const [pagination, setPagination] = useState<PaginationModel>({
		pageSize: 10,
		currentPage: 1,
		recordCount: 1,
		sortOrder: 'DESC',
		sortColumn: 'ISNULL(st.UpdatedDate, st.CreatedDate)',
	});

	// Side Effects
	useEffect(() => {
		if (!loading && skillResponse.skillList.length === 0) {
			if (document.getElementById('mlab-grid-loading-overlay') as HTMLInputElement) {
				(document.getElementById('mlab-grid-loading-overlay') as HTMLInputElement).innerText = 'No Rows To Show';
			}
		} else {
			if (document.getElementById('mlab-grid-loading-overlay') as HTMLInputElement) {
				(document.getElementById('mlab-grid-loading-overlay') as HTMLInputElement).innerText = 'Please wait while your items are loading';
			}
		}
	}, [loading]);

	const onClickFirst = () => {
		if (pagination.currentPage > 1) {
			const newPagination = {...pagination, currentPage: 1};
			setPagination(newPagination);
			searchSkill(newPagination);
		}
	};

	const onClickPrevious = () => {
		if (pagination.currentPage > 1) {
			const newPagination = {...pagination, currentPage: pagination.currentPage - 1};
			setPagination(newPagination);
			searchSkill(newPagination);
		}
	};

	const onClickNext = () => {
		if (totalPage() > pagination.currentPage) {
			const newPagination = {...pagination, currentPage: pagination.currentPage + 1};
			setPagination(newPagination);
			searchSkill(newPagination);
		}
	};

	const onClickLast = () => {
		if (totalPage() > pagination.currentPage) {
			const newPagination = {...pagination, currentPage: totalPage()};
			setPagination(newPagination);
			searchSkill(newPagination);
		}
	};

	
	const onGridReady = (params: any) => {
		params.api.sizeColumnsToFit();
	};

	const totalPage = () => {
		return Math.ceil(skillResponse.recordCount / pagination.pageSize) | 0;
	};

	const onPageSizeChanged = () => {
		const value: string = (document.getElementById('page-size') as HTMLInputElement).value;
		const newPagination = {...pagination, pageSize: Number(value), currentPage: 1};
		setPagination(newPagination);

		if (skillResponse.skillList != undefined && skillResponse.skillList.length > 0) {
			searchSkill(newPagination);
		}
	};

	const onSort = (e: any) => {
		if (skillResponse.skillList != undefined && skillResponse.skillList.length > 0) {
			const sortDetail = e.api.getSortModel();
			if (sortDetail[0] != undefined) {
				const newPagination = {...pagination, sortColumn: sortDetail[0]?.colId, sortOrder: sortDetail[0]?.sort};
				setPagination(newPagination);
				searchSkill(newPagination);
			} else {
				const newPagination = {...pagination, sortColumn: '', sortOrder: ''};
				setPagination(newPagination);
				searchSkill(newPagination);
			}
		}
	};

	return (
		<FormGroupContainer>
			<div className='ag-theme-quartz' style={{height: 500, width: '100%', marginBottom: '50px'}}>
				<AgGridReact
					rowStyle={{userSelect: 'text'}}
					rowData={skillResponse.skillList}
					defaultColDef={{
						sortable: true,
						resizable: true,
					}}
					suppressExcelExport={true}
					rowSelection={'multiple'}
					alwaysShowHorizontalScroll={false}
					animateRows={true}
					onGridReady={onGridReady}
					rowBuffer={0}
					//enableRangeSelection={true} //deprecated in AgGridReactver.32.0.0
					pagination={false}
					paginationPageSize={pagination.pageSize}
					columnDefs={columnDefs}
					onSortChanged={(e) => onSort(e)}
					overlayNoRowsTemplate={gridOverlayNoRowsTemplate}
					overlayLoadingTemplate={gridOverlayTemplate}
					ref={gridRef}
				/>

				<DefaultGridPagination
					recordCount={skillResponse.recordCount}
					currentPage={pagination.currentPage}
					pageSize={pagination.pageSize}
					onClickFirst={onClickFirst}
					onClickPrevious={onClickPrevious}
					onClickNext={onClickNext}
					onClickLast={onClickLast}
					onPageSizeChanged={onPageSizeChanged}
				/>
			</div>
		</FormGroupContainer>
	);
};

export default SkillGrid;
