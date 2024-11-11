import {faPencilAlt} from '@fortawesome/free-solid-svg-icons';
import {AgGridReact} from 'ag-grid-react';
import React, {useEffect, useRef, useState} from 'react';
import {ButtonGroup} from 'react-bootstrap-v5';
import {shallowEqual, useSelector} from 'react-redux';
import {RootState} from '../../../../../setup';
import gridOverlayTemplate, {gridOverlayNoRowsTemplate} from '../../../../common-template/gridTemplates';
import {PaginationModel} from '../../../../common/model';
import {AppConfigSettingDataType} from '../../../../constants/Constants';
import {DefaultGridPagination, FormGroupContainer, TableIconButton} from '../../../../custom-components';
import {formatDate} from '../../../../custom-functions/helper/dateHelper';
import {IAuthState} from '../../../auth';
import {USER_CLAIMS} from '../../../user-management/components/constants/UserClaims';
import {AppConfigSettingFilterResponseModel} from '../../models/response/AppConfigSettingFilterResponseModel';
import { AppConfigSettingResponseModel } from '../../models/response/AppConfigSettingResponseModel';
import { ColDef, ColGroupDef } from 'ag-grid-community';

type AppConfigSettingGridProps = {
	loading: boolean;
	appConfigSettingResponse: AppConfigSettingFilterResponseModel;
	editAppConfigSetting: (param: any) => void;
	searchAppConfigSetting: (pagination: PaginationModel) => void;
};

const AppConfigSettingGrid: React.FC<AppConfigSettingGridProps> = ({
	loading,
	appConfigSettingResponse,
	editAppConfigSetting,
	searchAppConfigSetting,
}: AppConfigSettingGridProps) => {
	const gridRef: any = useRef();
	const {access, userId} = useSelector<RootState>(({auth}) => auth, shallowEqual) as IAuthState;
	const [pagination, setPagination] = useState<PaginationModel>({
		pageSize: 10,
		currentPage: 1,
		recordCount: 1,
		sortOrder: 'DESC',
		sortColumn: 'ISNULL(st.UpdatedDate, st.CreatedDate)',
	});

	const columnDefs: (ColDef<AppConfigSettingResponseModel> | ColGroupDef<AppConfigSettingResponseModel>)[] =  [
			{headerName: 'Id', field: 'appConfigSettingId'},
			{headerName: 'Key', field: 'key'},
			{
				headerName: 'Value',
				field: 'value',
				cellRenderer: (params: any) =>
					params.data.dataType == AppConfigSettingDataType.DateTime ? formatDate(params.data.value) : params.data.value,
			},
			{headerName: 'DataType', field: 'dataType'},
			{
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
										access={access?.includes(USER_CLAIMS.AdminWrite)}
										faIcon={faPencilAlt}
										toolTipText={'Edit'}
										onClick={() => editAppConfigSetting(params.data)}
										isDisable={false}
									/>
								</div>
							</div>
						</ButtonGroup>
					</>
				),
			},
		]

	// Side Effects
	useEffect(() => {
		if (!loading && appConfigSettingResponse.appConfigSettingList.length === 0) {
			if (document.getElementById('mlab-grid-loading-overlay') as HTMLInputElement) {
				(document.getElementById('mlab-grid-loading-overlay') as HTMLInputElement).innerText = 'No Rows To Show';
			}
		} else {
			if (document.getElementById('mlab-grid-loading-overlay') as HTMLInputElement) {
				(document.getElementById('mlab-grid-loading-overlay') as HTMLInputElement).innerText = 'Please wait while your items are loading';
			}
		}
	}, [loading]);

	const onGridReady = (params: any) => {
		//params.api.sizeColumnsToFit();
	};

	const onPageSizeChanged = () => {
		const value: string = (document.getElementById('page-size') as HTMLInputElement).value;
		const newPagination = {...pagination, pageSize: Number(value), currentPage: 1};
		setPagination(newPagination);

		if (appConfigSettingResponse.appConfigSettingList != undefined && appConfigSettingResponse.appConfigSettingList.length > 0) {
			searchAppConfigSetting(newPagination);
		}
	};

	const onClickFirst = () => {
		if (pagination.currentPage > 1) {
			const newPagination = {...pagination, currentPage: 1};
			setPagination(newPagination);
			searchAppConfigSetting(newPagination);
		}
	};

	const onClickPrevious = () => {
		if (pagination.currentPage > 1) {
			const newPagination = {...pagination, currentPage: pagination.currentPage - 1};
			setPagination(newPagination);
			searchAppConfigSetting(newPagination);
		}
	};

	const onClickNext = () => {
		if (totalPage() > pagination.currentPage) {
			const newPagination = {...pagination, currentPage: pagination.currentPage + 1};
			setPagination(newPagination);
			searchAppConfigSetting(newPagination);
		}
	};

	const onClickLast = () => {
		if (totalPage() > pagination.currentPage) {
			const newPagination = {...pagination, currentPage: totalPage()};
			setPagination(newPagination);
			searchAppConfigSetting(newPagination);
		}
	};

	const totalPage = () => {
		return Math.ceil(appConfigSettingResponse.recordCount / pagination.pageSize) | 0;
	};

	const onSort = (e: any) => {
		if (appConfigSettingResponse.appConfigSettingList != undefined && appConfigSettingResponse.appConfigSettingList.length > 0) {
			const sortDetail = e.api.getSortModel();
			if (sortDetail[0] != undefined) {
				const newPagination = {...pagination, sortColumn: sortDetail[0]?.colId, sortOrder: sortDetail[0]?.sort};
				setPagination(newPagination);
				searchAppConfigSetting(newPagination);
			} else {
				const newPagination = {...pagination, sortColumn: '', sortOrder: ''};
				setPagination(newPagination);
				searchAppConfigSetting(newPagination);
			}
		}
	};

	return (
		<FormGroupContainer>
			<div className='ag-theme-quartz' style={{height: 500, width: '100%', marginBottom: '50px'}}>
				<AgGridReact
					rowStyle={{userSelect: 'text'}}
					rowData={appConfigSettingResponse.appConfigSettingList}
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
					//enableRangeSelection={true} //deprecated in AgGridReactv32.0.0
					pagination={false}
					paginationPageSize={pagination.pageSize}
					columnDefs={columnDefs}
					onSortChanged={(e) => onSort(e)}
					overlayNoRowsTemplate={gridOverlayNoRowsTemplate}
					overlayLoadingTemplate={gridOverlayTemplate}
					ref={gridRef}
				/>

				<DefaultGridPagination
					recordCount={appConfigSettingResponse.recordCount}
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

export default AppConfigSettingGrid;
