import {AgGridReact} from 'ag-grid-react';
import {Guid} from 'guid-typescript';
import {useCallback, useEffect, useRef, useState} from 'react';
import {shallowEqual, useSelector} from 'react-redux';
import {useHistory} from 'react-router-dom';
import swal from 'sweetalert';
import {RootState} from '../../../../../setup';
import * as hubConnection from '../../../../../setup/hub/MessagingHub';
import {HttpStatusCodeEnum} from '../../../../constants/Constants';
import {
	ContentContainer,
	DefaultGridPagination,
	DefaultSecondaryButton,
	FooterContainer,
	FormHeader,
	MainContainer,
	PaddedContainer,
} from '../../../../custom-components';
import {USER_CLAIMS} from '../../../user-management/components/constants/UserClaims';
import {useSystemOptionHooks} from '../../shared';
import {PLAYER_CONFIGURATION_SETTINGS} from '../constants/PlayerConfigurationRoutes';
import './player-configuration.css';

const ViewPlayerConfiguration: React.FC = () => {
	// States and Properties
	const history = useHistory();
	const gridRef: any = useRef();
	const userAccess = useSelector<RootState>(({auth}) => auth.access, shallowEqual) as string;
	const userAccessId = useSelector<RootState>(({auth}) => auth.userId, shallowEqual) as number;
	const configInfo = PLAYER_CONFIGURATION_SETTINGS.find((i) => i.view === window.location.pathname);
	const [loading, setLoading] = useState(false);
	const [configList, setConfigList] = useState([]);

	const {checkAccess} = useSystemOptionHooks();

	const [pageSize, setPageSize] = useState<number>(10);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [recordCount, setRecordCount] = useState<number>(0);
	const [sortOrder] = useState<string>('ASC');
	const [sortColumn] = useState<string>('SegmentId');

	if (configInfo === undefined || !checkAccess(userAccess, userAccessId, 'v')) {
		history.push('/error/401');
	}

	// Side Effects
	// useEffect(() => {
	// 	if (loading) {
	// 		onBtShowLoading();
	// 	} else {
	// 		onBtHide();
	// 	}
	// }, [loading]);

	// Methods
	const handleBack = () => {
		history.push('/system/player-configuration-list');
	};

	const onPageSizeChanged = () => {
		const value: string = (document.getElementById('page-size') as HTMLInputElement).value;
		setPageSize(Number(value));
		setCurrentPage(1);

		if (configList != undefined && configList.length > 0) {
			paginationLoadList(Number(value), 1, sortColumn, sortOrder);
		}
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

	const onGridReady = () => {
		gridRef.current.api.sizeColumnsToFit();
		loadPlayerConfigurationList();
	};

	const onBtShowLoading = useCallback(() => {
		gridRef.current.api.showLoadingOverlay();
	}, []);

	const onBtHide = useCallback(() => {
		gridRef.current.api.hideOverlay();
	}, []);

	const paginationLoadList = (_pageSize: number, _currentPage: number, _sortColumn: string, _sortOrder: string) => {
		if (typeof configInfo?.getList !== 'undefined') {
			const request =
				typeof configInfo.filterParams === 'undefined'
					? {
							userId: userAccessId.toString(),
							queueId: Guid.create().toString(),
					  }
					: {
							...configInfo.filterParams,
							userId: userAccessId.toString(),
							pageSize: _pageSize,
							offsetValue: (_currentPage - 1) * _pageSize,
					  };

			loadPlayerConfigurationList(request);
		}
	};

	const loadPlayerConfigurationList = (request?: any) => {
		if (typeof configInfo?.getList !== 'undefined') {
			setLoading(true);
			setTimeout(() => {
				const messagingHub = hubConnection.createHubConnenction();
				messagingHub.start().then(() => {
					if (request === undefined) {
						request =
							typeof configInfo.filterParams === 'undefined'
								? {
										userId: userAccessId.toString(),
										queueId: Guid.create().toString(),
								  }
								: {
										...configInfo.filterParams,
										userId: userAccessId.toString(),
								  };
					}

					configInfo?.getList(request).then((response: any) => {
						if (response.status === HttpStatusCodeEnum.Ok) {
							messagingHub.on(request.queueId.toString(), (message) => {
								configInfo
									.getListResult(message.cacheId)
									.then((returnData: any) => {
										if (configInfo.getData !== undefined) {
											setConfigList(configInfo.getData(returnData.data));
											setRecordCount(returnData.data.recordCount);
										} else {
											setConfigList(returnData.data);
										}

										setLoading(false);
										messagingHub.off(request.queueId.toString());
										messagingHub.stop();
									})
									.catch(() => {
										swal('Failed', `Error loading ${configInfo.name}`, 'error');
										setLoading(false);
									});
								setLoading(false);
							});
						} else {
							swal('Failed', response.data.message, 'error');
						}
					});
				});
			}, 1000);
		}
	};

	return (
		<MainContainer>
			<FormHeader headerLabel={`View ${configInfo?.name}`} />
			<ContentContainer>
				<div className='ag-theme-quartz' style={{height: 400, width: '100%', marginBottom: '50px'}}>
					<AgGridReact
						ref={gridRef}
						rowData={configList}
						columnDefs={configInfo?.colDef}
						overlayLoadingTemplate={'<span class="ag-overlay-loading-center">Please wait while your rows are loading</span>'}
						overlayNoRowsTemplate={'<span class="ag-overlay-loading-center">No Data</span>'}
						defaultColDef={{
							sortable: true,
							resizable: true,
						}}
						animateRows={true}
						onGridReady={onGridReady}
						rowBuffer={0}
						enableRangeSelection={true}
						rowClassRules={configInfo?.rowClassRules}
						{...(configInfo?.clientSidePagination !== undefined ? {pagination: true} : {})}
						{...(configInfo?.clientSidePagination !== undefined ? {paginationPageSize: 10} : {})}
					/>
					{configInfo?.clientSidePagination === undefined && (
						<DefaultGridPagination
							recordCount={recordCount}
							currentPage={currentPage}
							pageSize={pageSize}
							onClickFirst={onClickFirst}
							onClickPrevious={onClickPrevious}
							onClickNext={onClickNext}
							onClickLast={onClickLast}
							onPageSizeChanged={onPageSizeChanged}
							defaultColumns={configInfo?.colDef}
						/>
					)}
				</div>
			</ContentContainer>
			<FooterContainer>
				<PaddedContainer>
					<DefaultSecondaryButton access={userAccess.includes(USER_CLAIMS.PlayerConfigurationRead)} title={'Back'} onClick={handleBack} />
				</PaddedContainer>
			</FooterContainer>
		</MainContainer>
	);
};

export default ViewPlayerConfiguration;
