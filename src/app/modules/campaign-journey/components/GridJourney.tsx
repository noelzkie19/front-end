import { AgGridReact } from 'ag-grid-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Select from 'react-select';
import { DateRangePicker } from 'rsuite';
import { ElementStyle } from '../../../constants/Constants';
import { ButtonsContainer, ContentContainer, DefaultButton, DefaultGridPagination, FormContainer, FormGroupContainer, FormHeader, MainContainer, MlabButton } from '../../../custom-components';
import { JourneyGridModel } from '../models/JourneyGridModel';
import * as hubConnection from '../../../../setup/hub/MessagingHub';
import useConstant from '../../../constants/useConstant';
import { useSelector, shallowEqual } from 'react-redux';
import { RootState } from '../../../../setup';
import { Guid } from 'guid-typescript';
import swal from 'sweetalert';
import { JourneyGridRequestModel } from '../models/request/JourneyGridRequestModel';
import { GetJourneyGrid, GetJourneyNames, GetJourneyStatus, RequestJourneyGrid } from '../services/CampaignJourneyApi';
import { JourneyGridResponseModel } from '../models/response/JourneyGridResponseModel';
import { GRID_PAGINATION_ACTION } from '../constants/Journey';
import moment from 'moment';
import { USER_CLAIMS } from '../../user-management/components/constants/UserClaims';
import { useHistory } from 'react-router-dom';
import { LookupModel } from '../../../shared-models/LookupModel';
import { ColDef, ColGroupDef } from 'ag-grid-community';

export const GridJourney = () => {
    
    const history = useHistory();
    const {HubConnected, successResponse} = useConstant();
    const userAccess = useSelector<RootState>(({auth}) => auth.access, shallowEqual) as string;
    const userAccessId = useSelector<RootState>(({ auth }) => auth.userId, shallowEqual) as number;

    // States
    const [searchLoading, setSearchLoading] = useState<boolean>(false);
    const [loadingJourneyName, setLoadingJourneyName] = useState<boolean>(false);
    const [loadingJourneyStatus, setLoadingJourneyStatus] = useState<boolean>(false);
    const [showWarningMessage, setShowWarningMessage] = useState<boolean>(false);
    
    const [optionsJourneyName, setOptionsJourneyName] = useState<Array<LookupModel>>();
    const [optionsJourneyStatus, setOptionsJourneyStatus] = useState<Array<LookupModel>>();

    const [filterJourneyCreatedDate, setFilterJourneyCreatedDate] = useState<any>()
    const [filterJourneyCreateDateFrom, setFilterJourneyCreateDateFrom] = useState<string>('')
    const [filterJourneyCreateDateTo, setFilterJourneyCreateDateTo] = useState<string>('')
    const [filterJourneyName, setFilterJourneyName] = useState<Array<LookupModel>>([]);
    const [filterJourneyStatus, setFilterJourneyStatus] = useState<Array<LookupModel>>([]);

    const [gridApi, setGridApi] = useState<any>();
    const [gridRowData, setGridRowData] = useState<Array<JourneyGridModel>>([]);
    const [sortColumn, setSortColumn] = useState<string>('SortedDate');
    const [sortOrder, setSortOrder] = useState<string>('desc');

    const [pageSize, setPageSize] = useState<number>(20);
    const [recordCount, setRecordCount] = useState<number>(0);
    const [currentPage, setCurrentPage] = useState<number>(1);

    useEffect(() => {
        loadFilterOptions();
    }, []);

    // AG-Grid
    const defaultColDef = useMemo(() => ({
        resizable: true,
        sortable: true
    }), []);

    const customComparator = (valueA: string, valueB: string) => {
        return valueA.toLowerCase().localeCompare(valueB.toLowerCase());
    };

    const tableLoader = (data: any) => {
        return (
            <div className="ag-custom-loading-cell" style={{ paddingLeft: '10px', lineHeight: '25px' }}>
                <i className="fas fa-spinner fa-pulse"></i>
                {' '}
                <span> {data.loadingMessage} </span>
            </div>
        );
    };

    const columnDefs : (ColDef<JourneyGridModel> | ColGroupDef<JourneyGridModel>)[] = [
        {
            headerName: 'No',
            valueGetter: ("node.rowIndex + 1 + " + (currentPage - 1) * pageSize).toString(),
            sortable: false,
            width: 80,
            minWidth: 80,
        },
        {
            headerName: 'Journey Name',
            field:  'journeyName',
            minWidth: 350,
            comparator: customComparator,
            cellRenderer: (params: any) => 
            <>
            { 
                userAccess.includes(USER_CLAIMS.ViewJourneyRead) ?
                <Link to={`/campaign-management/journey/view/${params.data.journeyId}`} target="_blank">{params.data.journeyName}</Link> :
                params?.data?.journeyName ?? params.data.journeyName
            } 
            </>
        },
        {
            headerName: 'Journey Status',
            field:  'journeyStatus',
            minWidth: 200,
            comparator: customComparator,
        },
        {
            headerName: 'Journey Created Date',
            field:  'createdDate',
            minWidth: 200,
            comparator: customComparator,
            cellRenderer: (params: any) => {
                return params.data.createdDate ? moment(new Date(params.data.createdDate)).format('DD/MM/YYYY HH:mm:ss') : '';
            },
        },
        {
            headerName: 'Player List Count',
            field:  'totalPlayerListCount',
            minWidth: 200,
        },
        {
            headerName: 'Call List Count',
            field:  'totalCallListCount',
            minWidth: 200,
        }
    ];

    const handleGridReady = (params: any) => {
        setGridApi(params.api);
    };

    //Functions
    const loadFilterOptions = async () => {
        getJourneyNameOptions();
        setLoadingJourneyName(true);

        getJourneyStatusOptions();
        setLoadingJourneyStatus(true);
    }

    const getJourneyNameOptions = async () => {
        GetJourneyNames().then((response) => {
            if (response.status === successResponse) {
                let resultData = Object.assign(new Array<LookupModel>(), response.data);
                setOptionsJourneyName(resultData);
                setLoadingJourneyName(false);
            }
        })
        .catch((error) => {
            console.log('Error while loading journey name options: ', error);
        });
    };

    const getJourneyStatusOptions = async () => {
        GetJourneyStatus().then((response) => {
            if (response.status === successResponse) {
                let resultData = Object.assign(new Array<LookupModel>(), response.data);
                setOptionsJourneyStatus(resultData);
                setLoadingJourneyStatus(false);
            }
        })
        .catch((error) => {
            console.log('Error while loading journey status options: ', error);
        });
    };

    const loadGridData = async (pageSize: number, currentPage : number, sortColumn: string, sortOrder: string) => {
        setTimeout(() => {
            const messagingHub = hubConnection.createHubConnenction();
            messagingHub
                .start()
                .then(() => { 
                    const request: JourneyGridRequestModel = {
                        createdDateFrom: filterJourneyCreateDateFrom !== "" ? moment(new Date(filterJourneyCreateDateFrom)).format('MM/DD/YYYY HH:mm:ss') : undefined,
                        createdDateTo: filterJourneyCreateDateTo !== "" ? moment(new Date(filterJourneyCreateDateTo)).format('MM/DD/YYYY HH:mm:ss') : undefined,
                        journeyId: filterJourneyName !== undefined ? Object.assign(Array<LookupModel>(), filterJourneyName).map((item:any) => item.value).join(',') : "",
                        journeyStatus: filterJourneyStatus !== undefined ? Object.assign(Array<LookupModel>(), filterJourneyStatus).map((item:any) => item.label).join(',') : "",
                        pageSize: pageSize,
                        offsetValue: (currentPage - 1) * pageSize,
                        sortColumn: sortColumn,
                        sortOrder: sortOrder,
                        userId: userAccessId.toString(),
                        queueId: Guid.create().toString(),
                    };

                    //Checking state connection
                    if (messagingHub.state === HubConnected) { 
                        gridApi.showLoadingOverlay();
                        RequestJourneyGrid(request).then((response) => {
                            if (response.status === successResponse) {
                                messagingHub.on(request.queueId, message => {
                                    GetJourneyGrid(message.cacheId).then((responseData) => {
                                        let resultData = Object.assign({}, responseData.data as JourneyGridResponseModel);

                                        if (resultData.totalRecordCount > 0) {
                                            gridApi.hideOverlay();
                                        } else {
                                            gridApi.showNoRowsOverlay();
                                        }

                                        if (resultData.totalRecordCount > 1000) {
                                            setShowWarningMessage(true);
                                            setRecordCount(1000);
                                        } else {
                                            setRecordCount(resultData.totalRecordCount);
                                        }

                                        setGridRowData(resultData.journeyGridModel);
                                        setSearchLoading(false);

                                        messagingHub.off(request.queueId);
                                        messagingHub.stop();
                                    })
                                    .catch(() => {
                                        setSearchLoading(false);
                                    })
                                });
                                setTimeout(() => {
                                    if (messagingHub.state === HubConnected) {
                                        setSearchLoading(false);
                                        gridApi.hideOverlay();
                                        messagingHub.stop();
                                    }
                                }, 30000)
                            }
                        })
                        .catch((error) => {
                            setSearchLoading(false);
                            gridApi.hideOverlay();
                            messagingHub.stop();
                            swal("Failed", "Problem in getting journey grid" + error, "error");
                        })
                    }
                })
                .catch((error) => {
                    setSearchLoading(false);
                    console.log('Error while starting connection: ', error);
                })
        }, 1000);
    };

    const handleFilterJourneyCreatedDate = (val: any) => {
        if (val !== undefined && val.length > 0) {
            setFilterJourneyCreatedDate(val);
            setFilterJourneyCreateDateFrom(val[0]);
            setFilterJourneyCreateDateTo(val[1]);
        } else {
            setFilterJourneyCreatedDate('');
            setFilterJourneyCreateDateFrom('');
            setFilterJourneyCreateDateTo('');
        }
    };

    const handleFilterJourneyName = (val: Array<LookupModel>) => {
        setFilterJourneyName(val);
    };

    const handleFilterJourneyStatus = (val: Array<LookupModel>) => {
        setFilterJourneyStatus(val);
    };

    const handleFilterClear = () => {
        setFilterJourneyCreatedDate('');
        setFilterJourneyCreateDateFrom('');
        setFilterJourneyCreateDateTo('');
        setFilterJourneyName([]);
        setFilterJourneyStatus([]);
    };

    const handleSort = (e: any) => {
        if(gridRowData !== undefined && gridRowData.length > 0) {
            let sortDetail = e.api.getSortModel();
            if (sortDetail[0] !== undefined) {
                setSortColumn(sortDetail[0]?.colId);
                setSortOrder(sortDetail[0]?.sort);
                loadGridData(pageSize, currentPage, sortDetail[0]?.colId, sortDetail[0]?.sort);
            } else {
                setSortColumn('');
                setSortOrder('');
                loadGridData(pageSize, currentPage,'', '');
            }
        }
    };

    const totalPage = () => {
        return Math.ceil(recordCount / pageSize) | 0;
    };

    const handlePageClick = (actionType: number) => {
        switch (actionType) {
            case GRID_PAGINATION_ACTION.OnFirst:
                if (currentPage > 1) {
                    setCurrentPage(1);
                    loadGridData(pageSize, 1, sortColumn, sortOrder);
                }
                break;
            case GRID_PAGINATION_ACTION.OnPrev:
                if (currentPage > 1) {
                    setCurrentPage(currentPage - 1);
                    loadGridData(pageSize, currentPage - 1, sortColumn, sortOrder);
                }
                break;
            case GRID_PAGINATION_ACTION.OnNext:
                if (totalPage() > currentPage) {
                    setCurrentPage(currentPage + 1);
                    loadGridData(pageSize, currentPage + 1, sortColumn, sortOrder);
                }
                break;
            case GRID_PAGINATION_ACTION.OnLast:
                if (totalPage() > currentPage) {
                    setCurrentPage(totalPage());
                    loadGridData(pageSize, totalPage(), sortColumn, sortOrder);
                }
                break;
            case GRID_PAGINATION_ACTION.OnPageSize:
                let value: string = (document.getElementById('page-size') as HTMLInputElement).value;
                setPageSize(Number(value));
                setCurrentPage(1);
                if(gridRowData !== undefined && gridRowData.length > 0) {
                    loadGridData(Number(value), 1, sortColumn, sortOrder);
                }
                break;
        };
    };

    const handleSearch = () => {
        loadGridData(pageSize, 1, sortColumn, sortOrder);
        setSearchLoading(true);
    }

    return (
        <MainContainer>
            <FormHeader headerLabel='Search Journey'></FormHeader>
            <ContentContainer>
                <FormGroupContainer>
                    {/** Fields */}
                    <div className='col-lg-3'>
						<label>Journey Created Date</label>
                        <DateRangePicker format='dd/MM/yyyy HH:mm:ss'
							onChange={handleFilterJourneyCreatedDate}
							style={{width: '100%'}}
							value={filterJourneyCreatedDate} />
					</div>
                    <div className='col-lg-3'>
						<label>Journey Name</label>
                        <Select isClearable={true}
                            isLoading={loadingJourneyName}
                            isMulti
							size='small'
							options={optionsJourneyName}
							style={{width: '100%'}}
							onChange={handleFilterJourneyName}
							value={filterJourneyName} />
					</div>
                    <div className='col-lg-3'>
						<label>Journey Status</label>
                        <Select isClearable={true}
                            isLoading={loadingJourneyStatus}
                            isMulti
							size='small'
							options={optionsJourneyStatus}
							style={{width: '100%'}}
							onChange={handleFilterJourneyStatus}
							value={filterJourneyStatus} />
					</div>
                    <div className='col-lg-12 mt-3'></div>
                </FormGroupContainer>
                <FormGroupContainer>
                    <ButtonsContainer>
                        {
                            (userAccess.includes(USER_CLAIMS.SearchJourneyRead) === true || userAccess.includes(USER_CLAIMS.SearchJourneyWrite) === true) && (
                                <button className="btn btn-primary btn-sm me-2" 
                                    type='submit'
                                    disabled={searchLoading}
                                    onClick={handleSearch}>
                                    {
                                        !searchLoading && (
                                            <span className='indicator-label'>Search</span>
                                    )}
                                    {
                                        searchLoading && (
                                            <span className='indicator-progress' style={{display: 'block'}}>
                                                Please wait...
                                            <span className='spinner-border spinner-border-sm align-middle ms-2'></span>
                                        </span>
                                    )}
                                </button>
                            )
                        }
                        <button className='btn btn-secondary btn-sm me-2' 
                            type='button' 
                            onClick={handleFilterClear} >
							Clear
						</button>
                        <Link to={`/campaign-management/journey/create`} target='_blank'>
							<DefaultButton title={'Create Journey'}
                                access={userAccess.includes(USER_CLAIMS.CreateJourneyWrite)} 
                                onClick={() => true}/>
						</Link>
                    </ButtonsContainer>
                </FormGroupContainer>
                {
                    showWarningMessage == true ? (
						<div className='col-lg-12 mt-3'>
							<span className='badge badge-light-danger' style={{fontSize: '0.99rem !important'}}>
								Result contain more than 1000 records, please refine your criteria
							</span>
						</div>
					) : ('')
                }
                <FormGroupContainer>
                    <div className='ag-theme-quartz mt-5' style={{height: 510, width: '100%', marginBottom: '50px', padding: '0 0 28px 0'}}>
                        <AgGridReact animateRows={true}
                            defaultColDef={defaultColDef}
                            columnDefs={columnDefs}
                            //enableRangeSelection={true} //deprecated in AgGridReactv32.0.0
                            rowData={gridRowData}
                            onGridReady={handleGridReady}
                            onSortChanged={handleSort}
                            rowBuffer={0}
							components={{ tableLoader: tableLoader }}
                            pagination={false}
                            paginationPageSize={pageSize} />
                        <DefaultGridPagination
							recordCount={recordCount}
							currentPage={currentPage}
							pageSize={pageSize}
							onClickFirst={() => handlePageClick(GRID_PAGINATION_ACTION.OnFirst)}
							onClickPrevious={() => handlePageClick(GRID_PAGINATION_ACTION.OnPrev)}
							onClickNext={() => handlePageClick(GRID_PAGINATION_ACTION.OnNext)}
							onClickLast={() => handlePageClick(GRID_PAGINATION_ACTION.OnLast)}
							onPageSizeChanged={() => handlePageClick(GRID_PAGINATION_ACTION.OnPageSize)}
                            pageSizes={[20, 30, 50, 100]}
						/>
                    </div>
                </FormGroupContainer>  
            </ContentContainer>
        </MainContainer>
    );
}
