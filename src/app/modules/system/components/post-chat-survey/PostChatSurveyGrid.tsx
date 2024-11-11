import {faPencilAlt, faToggleOff, faToggleOn} from '@fortawesome/free-solid-svg-icons';
import {AgGridReact} from 'ag-grid-react';
import React, {useEffect, useRef, useState} from 'react';
import {ButtonGroup} from 'react-bootstrap-v5';
import {shallowEqual, useSelector} from 'react-redux';
import {RootState} from '../../../../../setup';
import gridOverlayTemplate, {gridOverlayNoRowsTemplate} from '../../../../common-template/gridTemplates';
import {PaginationModel} from '../../../../common/model';
import { StatusTypeEnum, ToggleTypeEnum } from '../../../../constants/Constants';
import {DefaultGridPagination, FormGroupContainer, TableIconButton} from '../../../../custom-components';
import {formatDate} from '../../../../custom-functions/helper/dateHelper';
import {IAuthState} from '../../../auth';
import {USER_CLAIMS} from '../../../user-management/components/constants/UserClaims';
import {PostChatSurveyFilterResponseModel, PostChatSurveyListResponseModel} from '../../models';
import { ColDef, ColGroupDef } from 'ag-grid-community';


type PostChatSurveyGridProps = {
	loading: boolean;
	postChatSurveyResponse: PostChatSurveyFilterResponseModel;
	editPostChatSurvey: (param: any) => void;
	searchPostChatSurvey: (pagination: PaginationModel) => void;
	togglePostChatSurvey: (param: any) => void;
	viewPostChatSurvey: (param: any) => void;
};

const PostChatSurveyGrid: React.FC<PostChatSurveyGridProps> = ({
	loading,
	postChatSurveyResponse,
	editPostChatSurvey,
	searchPostChatSurvey,
	togglePostChatSurvey,
	viewPostChatSurvey
}: PostChatSurveyGridProps) => {
	const gridRef: any = useRef();
	const {access} = useSelector<RootState>(({auth}) => auth, shallowEqual) as IAuthState;
	const [pagination, setPagination] = useState<PaginationModel>({
		pageSize: 10,
		currentPage: 1,
		recordCount: 1,
		sortOrder: 'DESC',
		sortColumn: 'ISNULL(pcs.UpdatedDate, pcs.CreatedDate)',
	});

	const postChatSurveyQuestionId = (params: any) => 
		<>
			{access?.includes(USER_CLAIMS.PostChatSurveyRead) ? (
				<a href={'#'} onClick={() => viewPostChatSurvey(params.data)}>
					{params.data.questionId}
				</a>
			) : (
				params.data.questionId
			)}
		</>
	
	const postChatSurveyAction = (params: any) => 
		<ButtonGroup aria-label='Basic example'>
			<div className='d-flex justify-content-center flex-shrink-0'>
				<div className='me-4'>
					<TableIconButton
						isDisable={params.data.isActive}
						access={access?.includes(USER_CLAIMS.PostChatSurveyWrite)}
						faIcon={faPencilAlt}
						toolTipText={'Edit'}
						onClick={() => editPostChatSurvey(params.data.postChatSurveyId)}
					/>
				</div>
				<div className='me-4'>
					<TableIconButton
						access={access?.includes(USER_CLAIMS.PostChatSurveyWrite)}
						faIcon={params.data.isActive ? faToggleOff: faToggleOn}
						toolTipText={params.data.isActive ? ToggleTypeEnum.Deactivate : ToggleTypeEnum.Activate}
						onClick={() => togglePostChatSurvey(params.data)}
					/>
				</div>
			</div>
		</ButtonGroup>

	const columnDefs : (ColDef<PostChatSurveyListResponseModel> | ColGroupDef<PostChatSurveyListResponseModel>)[] = [
			{headerName: 'Brand', field: 'brand'},
			{headerName: 'Message Type', field: 'messageType'},
			{
				headerName: 'Question ID',
				field: 'questionId',
				cellRenderer: postChatSurveyQuestionId,
			},
			{headerName: 'License', field: 'license'},
			{headerName: 'Skill', field: 'skills'},
			{headerName: 'Survey ID', field: 'surveyId'},
			{headerName: 'Question Message', field: 'questionMessage'},
			{headerName: 'Question Message (EN)', field: 'questionMessageEN'},
	
			{headerName: 'Free Text', field: 'freeText',
			cellRenderer: (params: any) => params.data.freeText.charAt(0).toUpperCase() + params.data.freeText.slice(1),
			},
			{
				headerName: 'Status',
				cellRenderer: (params: any) => params.data.isActive ? StatusTypeEnum.Active : StatusTypeEnum.Inactive ,
			},
			{
				field: 'updatedDate',
				headerName: 'Last Modified Date',
				cellRenderer: (params: any) => params.data.updatedDate ? formatDate(params.data.updatedDate) : formatDate(params.data.createdDate),
			},
			{
				headerName: 'Action',
				sortable: false,
				cellRenderer: postChatSurveyAction,
			},
		]

	// Side Effects
	useEffect(() => {
		if (!loading && postChatSurveyResponse.postChatSurveyList.length === 0) {
			if (document.getElementById('mlab-grid-loading-overlay') as HTMLInputElement) {
				(document.getElementById('mlab-grid-loading-overlay') as HTMLInputElement).innerText = 'No Rows To Show';
			}
		} else if (document.getElementById('mlab-grid-loading-overlay') as HTMLInputElement) {
				(document.getElementById('mlab-grid-loading-overlay') as HTMLInputElement).innerText = 'Please wait while your items are loading';
		}
	}, [loading]);

	const onGridReady = (params: any) => {
	};

	const onPageSizeChanged = () => {
		const value: string = (document.getElementById('page-size') as HTMLInputElement).value;
		const newPagination = {...pagination, pageSize: Number(value), currentPage: 1};
		setPagination(newPagination);

		if (postChatSurveyResponse.postChatSurveyList != undefined && postChatSurveyResponse.postChatSurveyList.length > 0) {
			searchPostChatSurvey(newPagination);
		}
	};

	const onClickFirst = () => {
		if (pagination.currentPage > 1) {
			const newPagination = {...pagination, currentPage: 1};
			setPagination(newPagination);
			searchPostChatSurvey(newPagination);
		}
	};

	const onClickPrevious = () => {
		if (pagination.currentPage > 1) {
			const newPagination = {...pagination, currentPage: pagination.currentPage - 1};
			setPagination(newPagination);
			searchPostChatSurvey(newPagination);
		}
	};

	const onClickNext = () => {
		if (totalPage() > pagination.currentPage) {
			const newPagination = {...pagination, currentPage: pagination.currentPage + 1};
			setPagination(newPagination);
			searchPostChatSurvey(newPagination);
		}
	};

	const onClickLast = () => {
		if (totalPage() > pagination.currentPage) {
			const newPagination = {...pagination, currentPage: totalPage()};
			setPagination(newPagination);
			searchPostChatSurvey(newPagination);
		}
	};

	const totalPage = () => {
		return Math.ceil(postChatSurveyResponse.recordCount / pagination.pageSize) | 0;
	};

	const onSort = (e: any) => {
		if (postChatSurveyResponse.postChatSurveyList != undefined && postChatSurveyResponse.postChatSurveyList.length > 0) {
			const sortDetail = e.api.getSortModel();
			if (sortDetail[0] != undefined) {
				const newPagination = {...pagination, sortColumn: sortDetail[0]?.colId, sortOrder: sortDetail[0]?.sort};
				setPagination(newPagination);
				searchPostChatSurvey(newPagination);
			} else {
				const newPagination = {...pagination, sortColumn: '', sortOrder: ''};
				setPagination(newPagination);
				searchPostChatSurvey(newPagination);
			}
		}
	};
	return (
		<FormGroupContainer>
			<div className='ag-theme-quartz' style={{height: 500, width: '100%', marginBottom: '50px'}}>
				<AgGridReact
					rowStyle={{userSelect: 'text'}}
					rowData={postChatSurveyResponse.postChatSurveyList}
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
					paginationPageSize={postChatSurveyResponse.recordCount}
					columnDefs={columnDefs}
					onSortChanged={(e) => onSort(e)}
					overlayNoRowsTemplate={gridOverlayNoRowsTemplate}
					overlayLoadingTemplate={gridOverlayTemplate}
					ref={gridRef}
				/>

				<DefaultGridPagination
					recordCount={postChatSurveyResponse.recordCount}
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

export default PostChatSurveyGrid;