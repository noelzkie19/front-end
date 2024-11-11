import {AgGridReact} from 'ag-grid-react';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {Col, Row} from 'react-bootstrap';
import {DefaultGridPagination, FormHeader, MainContainer} from '../../../../custom-components';
import {RemProfileFilterRequestModel, RemProfileListResponseModel} from '../../models';
import {RootState} from '../../../../../setup';
import useConstant from '../../../../constants/useConstant';
import * as hubConnection from '../../../../../setup/hub/MessagingHub';
import {Guid} from 'guid-typescript';
import {shallowEqual, useSelector} from 'react-redux';
import {GetRemProfileList, GetRemProfileListResult} from '../../services/RemProfileApi';
import gridOverlayTemplate, {gridOverlayNoRowsTemplate} from '../../../../common-template/gridTemplates';
import { HubConnection } from '@microsoft/signalr';
import { AxiosResponse } from 'axios';

interface IActiveTemplateUsers {
	id: number;
}

const ActiveTemplateUsers: React.FC<IActiveTemplateUsers> = ({id}) => {
	//Redux
	const userAccessId = useSelector<RootState>(({auth}) => auth.userId, shallowEqual) as number;

	//States
	const [pageSize, setPageSize] = useState<number>(10);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [recordCount, setRecordCount] = useState<number>(0);
	const [sortOrder, setSortOrder] = useState<string>('DESC');
	const [sortColumn, setSortColumn] = useState<string>('CreatedDate');
	const [remList, setRemList] = useState<Array<any>>([]);
	const [isLoading, setIsLoading] = useState<boolean>(false);

	//Hooks
	const gridRef: any = useRef();
	const {successResponse, HubConnected} = useConstant();

	//Watchers
	useEffect(() => {
		// added interval due to loading overlay issue
		if (gridRef.current.api != null) {
			setTimeout(() => {
				if (isLoading) {
					onBtShowLoading();
				} else if (remList.length > 0) {
					onBtHide();
				} else {
					onBtShowNoRows();
				}
			}, 10);
		}
	}, [isLoading]);

	// Methods
	const onGridReady = (params: any) => {
		params.api.sizeColumnsToFit();
	};

	const onBtShowLoading = useCallback(() => {
		gridRef.current.api.showLoadingOverlay();
	}, []);

	const onBtShowNoRows = useCallback(() => {
		gridRef.current.api.showNoRowsOverlay();
	}, []);

	const onBtHide = useCallback(() => {
		gridRef.current.api.hideOverlay();
	}, []);

	const defaultColDef = useMemo(() => {
		return {
			resizable: true,
			sortable: true,
		};
	}, []);

	useEffect(() => {
		if (id != 0) {
			_userloadRemList();
		}
	}, []);

	//Api Call Methods
	const _userloadRemList = (requestParam?: RemProfileFilterRequestModel) => {
		let request: RemProfileFilterRequestModel = {
			agentConfigStatusId: undefined,
			agentNameIds: undefined,
			onlineStatusId: undefined,
			pseudoNamePP: undefined,
			remProfileID: undefined,
			remProfileName: undefined,
			scheduleTemplateSettingId: id,
			pageSize: pageSize,
			offsetValue: (currentPage - 1) * pageSize,
			sortColumn: sortColumn,
			sortOrder: sortOrder,
			queueId: Guid.create().toString(),
			userId: userAccessId.toString(),
		};

		if (requestParam) {
			request = requestParam;
		}
		setTimeout(() => {
			setIsLoading(true);
			const messagingHub = hubConnection.createHubConnenction();
			messagingHub
				.start()
				.then(() => {
					if (messagingHub.state === HubConnected) {
						GetRemProfileList(request)
							.then((response) => {
								processGetRemProfileListResultRecieved(messagingHub,response,request);
							})
							.catch(() => {});
					}
				})
				.catch(() => {
					messagingHub.stop();
					setIsLoading(false);
				});
		}, 1000);
	};
	const processGetRemProfileListResultRecieved = (messagingHub:HubConnection,response:AxiosResponse<any>,request:RemProfileFilterRequestModel)=>{
		if (response.status === successResponse) {
			messagingHub.on(request.queueId.toString(), (message) => {
				GetRemProfileListResult(message.cacheId)
					.then((data) => {
						let resultData = data.data as RemProfileListResponseModel;
						setRemList(resultData.remProfileList);
						setRecordCount(resultData.totalRecordCount);
						setIsLoading(false);
						messagingHub.off(request.queueId.toString());
						messagingHub.stop();
					})
					.catch(() => {
						setIsLoading(false);
					});
			});
			setTimeout(() => {
				if (messagingHub.state === 'Connected') {
					messagingHub.stop();
				}
			}, 30000);
		} else {
			messagingHub.stop();
		}
	}
	//Custom pagination methods

	const paginationLoadList = (_pageSize: number, _currentPage: number, _sortColumn: string, _sortOrder: string) => {
		const request: any = {
			pageSize: _pageSize,
			offsetValue: (_currentPage - 1) * _pageSize,
			sortColumn: _sortColumn,
			sortOrder: _sortOrder,
			userId: userAccessId.toString(),
			queueId: Guid.create().toString(),
		};

		_userloadRemList(request);
	};

	const onClickFirst = () => {
		if (currentPage > 1) {
			setCurrentPage(1);
			paginationLoadList(pageSize, 1, sortColumn, sortOrder);
		}
	};

	const onClickPrevious = () => {
		if (currentPage > 1) {
			setCurrentPage(currentPage - 1);
			paginationLoadList(pageSize, currentPage - 1, sortColumn, sortOrder);
		}
	};

	const onClickNext = () => {
		if (totalPage() > currentPage) {
			setCurrentPage(currentPage + 1);
			paginationLoadList(pageSize, currentPage + 1, sortColumn, sortOrder);
		}
	};

	const onClickLast = () => {
		if (totalPage() > currentPage) {
			setCurrentPage(totalPage());
			paginationLoadList(pageSize, totalPage(), sortColumn, sortOrder);
		}
	};

	const totalPage = () => {
		return Math.ceil(recordCount / pageSize) | 0;
	};

	const onPageSizeChanged = () => {
		const value: string = (document.getElementById('page-size') as HTMLInputElement).value;
		setPageSize(Number(value));
		setCurrentPage(1);

		if (remList != undefined && remList.length > 0) {
			paginationLoadList(Number(value), 1, sortColumn, sortOrder);
		}
	};

	const onSort = (e: any) => {
		if (remList != undefined && remList.length > 0) {
			const sortDetail = e.api.getSortModel();
			if (sortDetail[0] != undefined) {
				setSortColumn(sortDetail[0]?.colId);
				setSortOrder(sortDetail[0]?.sort);
				_userloadRemList();
			} else {
				setSortColumn('');
				setSortOrder('');
				_userloadRemList();
			}
		}
	};

	const columnDefs = [
		{headerName: 'No', valueGetter: ('node.rowIndex + 1 + ' + (currentPage - 1) * pageSize).toString(), sortable: false, width: 60},
		{headerName: 'ReM Profile', field: 'remProfileName'},
		{headerName: 'Agent Name', field: 'agentName'},
	];

	return (
		<MainContainer>
			<FormHeader headerLabel={'Active Template Users'} />
			<Row style={{margin: 10}}>
				<Col sm={12}>
					<div className='ag-theme-quartz mt-5' style={{height: 500, width: '100%'}}>
						<AgGridReact
							ref={gridRef}
							rowData={remList}
							defaultColDef={defaultColDef}
							onGridReady={onGridReady}
							rowBuffer={0}
							enableRangeSelection={true}
							pagination={false}
							paginationPageSize={pageSize}
							columnDefs={columnDefs}
							onSortChanged={(e) => onSort(e)}
							overlayNoRowsTemplate={gridOverlayNoRowsTemplate}
							overlayLoadingTemplate={gridOverlayTemplate}
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

export default ActiveTemplateUsers;
