import {faCircleNotch, faPencilAlt} from '@fortawesome/free-solid-svg-icons';
import {Guid} from 'guid-typescript';
import React, {useEffect, useRef, useState} from 'react';
import {ButtonGroup} from 'react-bootstrap-v5';
import {shallowEqual, useSelector} from 'react-redux';
import Select from 'react-select';
import swal from 'sweetalert';
import {RootState} from '../../../../../setup';
import * as hubConnection from '../../../../../setup/hub/MessagingHub';
import {MasterReferenceOptionModel, OptionListModel} from '../../../../common/model';
import useConstant from '../../../../constants/useConstant';
import {BasicFieldLabel, ButtonsContainer, ContentContainer, FormGroupContainer, FormHeader, GridLinkLabel, GridWithLoaderAndPagination, MainContainer, RequiredLabel, TableIconButton} from '../../../../custom-components';
import {DefaultPageSetup} from '../../../system/components/constants/PlayerConfigEnums';

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {useHistory} from 'react-router-dom';
import {DateRangePicker} from 'rsuite';
import {useMasterReferenceOption} from '../../../../custom-functions';
import CommonLookups from '../../../../custom-functions/CommonLookups';
import useFnsDateFormatter from '../../../../custom-functions/helper/useFnsDateFormatter';
import useSystemHooks from '../../../../custom-functions/system/useSystemHooks';
import {USER_CLAIMS} from '../../../user-management/components/constants/UserClaims';
import {SearchBroadcastRequest} from '../../models/request/SearchBroadcastRequest';
import {SearchBroadcastDetailsResponse} from '../../models/response/SearchBroadcastDetailsResponse';
import {SearchBroadcastModel} from '../../models/response/SearchBroadcastModel';
import {GetBroadcastByFilterResult, GetBroadcastListByFilter} from '../../redux/ManageBroadcastApi';

export const SearchBroadcast = () => {
    const gridRef: any = useRef();
	const {successResponse, HubConnected, SearchBroadcastConstants} = useConstant();
    const [pageSize, setPageSize] = useState<number>(DefaultPageSetup.pageSizeDefault);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [recordCount, setRecordCount] = useState<number>(0);
	const [sortOrder, setSortOrder] = useState<string>('DESC');
	const [sortColumn, setSortColumn] = useState<string>('BroadcastConfigurationId');
	const [loading, setLoading] = useState(false);
    const defaultMessageType = {value: '7', label: 'Telegram'}
    const {getMasterReference} = useSystemHooks();
	const broadcastStatusOptions =  useMasterReferenceOption(SearchBroadcastConstants.BroadcastStatusParentId)
	.filter((x: MasterReferenceOptionModel) => x.masterReferenceParentId === parseInt(SearchBroadcastConstants.BroadcastStatusParentId))
	.map((x: MasterReferenceOptionModel) => x.options);
    const {mlabFormatDate} = useFnsDateFormatter();
    
    const userAccessId = useSelector<RootState>(({auth}) => auth.userId, shallowEqual) as number;
	const userAccess = useSelector<RootState>(({auth}) => auth.access, shallowEqual) as string;
    const history = useHistory();
    
    // Search Fields
    const [broadcastId, setBroadcastId] = useState<string>('')
    const [broadcastName, setBroadcastName] = useState<string>('')
	const [broadcastDateRange, setBroadcastDateRange] = useState<any>()
    const [broadcastStartDate, setBroadcastStartDate] = useState<string>('')
    const [broadcastEndDate, setBroadcastEndDate] = useState<string>('')
    const [broadcastStatusId, setBroadcastStatusId] = useState<Array<OptionListModel>>([])
    const [broadcastMessageTypeId, setBroadcastMessageTypeId] = useState<Array<OptionListModel>>([])
    const [broadcastListResult, setBroadcastListResult] = useState<Array<SearchBroadcastModel>>([])  

    // dropdown values 
    const [reloadPage, setReloadPage] = useState<boolean>(false);
        
    // effects
    useEffect(() => {
        if(!userAccess?.includes(USER_CLAIMS.BroadcastRead))
			history.push('/error/401');
       else{
        setBroadcastMessageTypeId([defaultMessageType]);
        getMasterReference(SearchBroadcastConstants.BroadcastStatusParentId)
       }
            
    }, [])

    useEffect(() => {
        if (reloadPage) {
            loadBroadcastList()
            setReloadPage(false)    //reset value
        }
    }, [reloadPage])
    
	useEffect(() => {
		if (!loading && broadcastListResult?.length === 0) {
			if (document.getElementById('mlab-grid-loading-overlay') as HTMLInputElement) {
				(document.getElementById('mlab-grid-loading-overlay') as HTMLInputElement).innerText = 'No Rows To Show';
			}
		} else if (loading) {
			if (document.getElementById('mlab-grid-loading-overlay') as HTMLInputElement) {
				(document.getElementById('mlab-grid-loading-overlay') as HTMLInputElement).innerText = 'Please wait while your items are loading';
			}
		}
	}, [loading]);


    const clearSearchFields = () => {

        setBroadcastId('')
        setBroadcastName('')
        setBroadcastStartDate('');
        setBroadcastEndDate('');
        setBroadcastStatusId([]);
        setBroadcastDateRange('')   
    }

	const handleEditBroadcast = (id: any) => {
        window.open('/campaign-management/edit-broadcast/' + id);
    }

	const handleViewBroadcast = (id: any) => {
        window.open('/campaign-management/view-broadcast/' + id);
    }

    const actionButtonElem = (params: any) => {
		const {data} = params;
		return (
			<ButtonGroup aria-label='Basic example'>
				<div className='d-flex justify-content-center flex-shrink-0'>
				
                    {data?.statusName === 'Active' || data?.statusName === 'In progress' ? (
                        <div className='me-4'>
							<TableIconButton
								access={userAccess.includes(USER_CLAIMS.BroadcastWrite)}
								faIcon={faPencilAlt}
								toolTipText={'Edit Broadcast'}
								onClick={()=> {handleEditBroadcast(data.broadcastConfigurationId)}}
								isDisable={false}
							/>
						
						</div>
                       
                    )
                    : (
                       ''
                    )}
                </div>
			</ButtonGroup>
		);
	};

    const viewBroadcastLink = (params: any) => {
        const {data} = params;
        return (
            <GridLinkLabel
            access={userAccess.includes(USER_CLAIMS.BroadcastRead)}
            title={data.broadcastName}
            disabled={false}
            onClick={() => handleViewBroadcast(data.broadcastConfigurationId)}
        />
        )
    }


    const columnDefs = [
		{headerName: 'Broadcast Id', field: 'broadcastId', autoWidth: true, width:150},
		{headerName: 'Broadcast Name', field: 'broadcastName', autoWidth: true, width:200, cellRenderer: viewBroadcastLink},
		{headerName: 'Message Type', field: 'messageTypeName', autoWidth: true, width: 130},
        {headerName: 'Broadcast Date', field: 'broadcastDate', width: 170, cellRenderer: (params: any) => mlabFormatDate(params.data.broadcastDate)},
        {headerName: 'Status', field: 'statusName', width: 120},
        {headerName: 'Recipient', field: 'recipient', width: 100},
        {headerName: 'Delivered', field: 'delivered', width: 100},
        {headerName: 'Created Date', field: 'createdDate', width: 180, cellRenderer: (params: any) => mlabFormatDate(params.data.createdDate)},
        {headerName: 'Created By', field: 'createdBy', width: 180},
        {headerName: 'Last Modified Date', field: 'updatedDate', width: 180, cellRenderer: (params: any) => mlabFormatDate(params.data.updatedDate)},
        {headerName: 'Last Modified By', field: 'updatedBy', width: 180},
		{headerName: 'Action', field: '', sortable: false, width: 120, cellRenderer: actionButtonElem},
	];

    const onSortBroadcastList = (e: any) => {
		if (broadcastListResult != undefined && broadcastListResult.length > 0 ) {
			const sortDetail = e.api.getSortModel();
			if (sortDetail[0] != undefined) {
				setSortColumn(sortDetail[0]?.colId);
				setSortOrder(sortDetail[0]?.sort);
				loadBroadcastList(sortDetail[0]?.colId, sortDetail[0]?.sort);
			} else {
				setSortColumn('');
				setSortOrder('');
				loadBroadcastList();
			}
		}
	};
	const totalPage = () => {
		return Math.ceil(recordCount / pageSize) | 0;
	};
	const onPaginationBroadcastClickFirst = () => {
		if (currentPage > 1) {
			setCurrentPage(1);
			paginationBroadcastLoadList(pageSize, 1, sortColumn, sortOrder);
		}
	};

	const onPaginationBroadcastClickPrevious = () => {
		if (currentPage > 1) {
			setCurrentPage(currentPage - 1);
			paginationBroadcastLoadList(pageSize, currentPage - 1, sortColumn, sortOrder);
		}
	};

	const onPaginationBroadcastClickNext = () => {
		if (totalPage() > currentPage) {
			setCurrentPage(currentPage + 1);
			paginationBroadcastLoadList(pageSize, currentPage + 1, sortColumn, sortOrder);
		}
	};

	const onPaginationBroadcastClickLast = () => {
		if (totalPage() > currentPage) {
			setCurrentPage(totalPage());
			paginationBroadcastLoadList(pageSize, totalPage(), sortColumn, sortOrder);
		}
	};

	const paginationBroadcastLoadList = (_pageSize: number, _currentPage: number, _sortColumn: string, _sortOrder: string) => {
        if (isValidToSearch()) {
            
            loadBroadcastList(_sortColumn, _sortOrder, (_currentPage - 1) * _pageSize, _pageSize);
        }
	};

	const onPaginationPageSizeChanged = () => {
		const value: string = (document.getElementById('page-size') as HTMLInputElement).value;
        
		setPageSize(Number(value));
		setCurrentPage(1);
		if (broadcastListResult != undefined && broadcastListResult.length > 0) {
			paginationBroadcastLoadList(Number(value), 1, sortColumn, sortOrder);
		}
	};

    const isValidToSearch = () => {
        if (!broadcastStartDate && !broadcastEndDate) {
            swal(SearchBroadcastConstants.SwalSearchBroadcastMessage.titleFailed,
                SearchBroadcastConstants.SwalSearchBroadcastMessage.requiredFields,
                SearchBroadcastConstants.SwalSearchBroadcastMessage.iconError);
            
                return false;
        }
        else return true
       
    }

    const submitSearch = () => {
        gridRef.current.api.resetColumnState();
        if (isValidToSearch()) {
            loadBroadcastList(sortColumn, sortOrder);
        }

    }

    const loadBroadcastList = ( _sortColumn?: string, _sortOrder?: string,  _offsetValue?: number, _pageSize?: number) => {
      const pageNumber = _pageSize ?? pageSize;
      let request: SearchBroadcastRequest = {
        	broadcastId: broadcastId ? Number(broadcastId) : undefined,
            broadcastName: broadcastName ,
            broadcastStartDate: mlabFormatDate(broadcastStartDate) ?? null,
			broadcastEndDate: mlabFormatDate(broadcastEndDate) ?? null,
			broadcastStatusId: broadcastStatusId.map((i: any) => i.value).join(','), 
			messageTypeId: broadcastMessageTypeId?.map((i: any) => i.value).join(',') , 
       
            pageSize: pageNumber,
			offsetValue: _offsetValue, 
			sortColumn: _sortColumn ?? sortColumn,
			sortOrder: _sortOrder ?? sortOrder,

			queueId: Guid.create().toString(),
			userId: userAccessId.toString(),
		};

		setLoading(true);
		setBroadcastListResult([]);
            setTimeout(() => {
                const messagingHub = hubConnection.createHubConnenction();
                messagingHub.start().then(() => {
                    if (messagingHub.state !== HubConnected) {
                        return;
                    }
                    processGetBroadcastFilter(request, messagingHub)
                });
            }, 1000);
			
	};

	const handleOnchangeBroadcastId = (data: any) => {
		setBroadcastId(data.target.value);
	}

	const handleOnchangeBroadcastName = (data: any) => {
		setBroadcastName(data.target.value);
	}

	const handleOnChangeStatus = (val: Array<OptionListModel>) => {
        setBroadcastStatusId(val);
    }

	const handleOnChangeMessageTypeId = (val: Array<OptionListModel>) => {
        setBroadcastMessageTypeId(val);
    }

	const handleOnChangeBroadcastDateRange = (val: any) => {
        
        if (val !== undefined && val.length > 0) {
            setBroadcastDateRange(val);
            setBroadcastStartDate(val[0]);
            setBroadcastEndDate(val[1]);
        } else {
            setBroadcastDateRange('');
            setBroadcastStartDate('');
            setBroadcastEndDate('');
        }
    };
    
    const stopHubAndLoading = (messagingHub: any, queueId: string) => {
        messagingHub.off(queueId);
        messagingHub.stop();
        setLoading(false);
    };
    

    const processGetBroadcastFilter = async (request: SearchBroadcastRequest, messagingHub: any) => {
        try {
            const response = await GetBroadcastListByFilter(request);
            
            if (response.status === successResponse) {
                messagingHub.on(request.queueId.toString(), async (message: any) => {
                    try {
                        const returnData = await GetBroadcastByFilterResult(message.cacheId);
                    
                        if (returnData.status !== successResponse) {
                            swal('Failed', 'Error getting broadcast search result list', 'error');
                        } else {
                            let resultData = returnData.data as SearchBroadcastDetailsResponse;
                            setBroadcastListResult(resultData.broadcastList );
                            setRecordCount(resultData.rowCount);
                        }

                        stopHubAndLoading(messagingHub, request.queueId.toString())
                    } catch {
                        
                        stopHubAndLoading(messagingHub, request.queueId.toString())
                        swal('Failed', 'Problem getting search broadcast list', 'error');

                    }
                });
            } else {
                stopHubAndLoading(messagingHub, request.queueId.toString())
                swal('Failed', 'Problem getting search broadcast list', 'error');
            }
        } catch {
            
            stopHubAndLoading(messagingHub, request.queueId.toString())
            swal('Failed', 'Problem getting search broadcast list', 'error');
        }
    }

    
    

 
  
  return (
    <MainContainer>
			<FormHeader headerLabel={'Search Broadcast'}  />
			<ContentContainer>
					<FormGroupContainer>
						<div className='col-lg-2'>
							<BasicFieldLabel title={'Broadcast ID'} />
                            <div className='input-group'>
                                <input
                                    type='text'
                                    aria-autocomplete='none'
                                    autoComplete='off'
                                    className='form-control form-control-sm'
                                    aria-label='broadcast id'
                                    value={broadcastId}
                                    onChange={handleOnchangeBroadcastId}
                                />
                            </div>
						</div>
                        <div className='col-lg-2'>
							<BasicFieldLabel title={'Broadcast Name'} />
                            <div className='input-group'>
                            <input
                                    type='text'
                                    aria-autocomplete='none'
                                    autoComplete='off'
                                    className='form-control form-control-sm'
                                    aria-label='broadcast name'
                                    value={broadcastName}
                                    onChange={handleOnchangeBroadcastName}
                                />
                            </div>
						</div>
                        <div className='col-lg-3'>
							<RequiredLabel title={'Broadcast Date'} />
                            <div className='col-lg-12'>
								<DateRangePicker format='dd/MM/yyyy HH:mm:ss'
									onChange={handleOnChangeBroadcastDateRange}
									style={{width: '100%'}}
									value={broadcastDateRange} />
                            </div>
						</div>
                        <div className='col-lg-2'>
							<BasicFieldLabel title={'Status'} />
                            <div className='col-lg-12'>
                                <Select
                                    isMulti
                                    size="small"
                                    style={{ width: '100%' }}
                                    options={broadcastStatusOptions}
                                    onChange={handleOnChangeStatus}
                                    value={broadcastStatusId}
                                    isClearable={true}
                                />
                            </div>
						</div>
                        <div className='col-lg-3'>
							<BasicFieldLabel title={'Message Type'} />
                            <div className='col-lg-12'>
                                <Select
                                    isMulti
                                    isDisabled={true}
                                    size="small"
                                    style={{ width: '100%' }}
                                    options={CommonLookups('messageTypes')}
                                    onChange={handleOnChangeMessageTypeId}
                                    value={broadcastMessageTypeId}
                                    isClearable={true}
                                />
                            </div>
						</div>

					</FormGroupContainer>

                    <FormGroupContainer>
                        <ButtonsContainer>
                        {userAccess.includes(USER_CLAIMS.BroadcastRead) && (
                            <button type='submit' onClick={submitSearch} className="btn btn-primary btn-sm me-2 my-2" disabled={false}>
                                {!loading && <span className='indicator-label'>Search</span>}
                                {loading && (
                                    <span className='indicator-progress' style={{ display: 'block' }}>
                                    Please wait...
                                    <FontAwesomeIcon icon={faCircleNotch} spin className='ms-2' />
                                    </span>
                                )}
                            </button>
                        )}
                            <button type='button' className="btn btn-secondary btn-sm me-2" onClick={clearSearchFields}>Clear</button>
                        </ButtonsContainer>

                        <div className="row pb-15" style={{paddingRight:'0px'}}>
                            <GridWithLoaderAndPagination
                                gridRef={gridRef}
                                rowData={broadcastListResult}
                                columnDefs={columnDefs}
                                sortColumn={sortColumn}
                                sortOrder={sortOrder}
                                isLoading={loading}
                                height={500}
                                onSortChanged={(e: any) => onSortBroadcastList(e)}
                                //pagination details
                                noTopPad={true}
                                recordCount={recordCount}
                                currentPage={currentPage}
                                pageSize={pageSize}
                                onClickFirst={onPaginationBroadcastClickFirst}
                                onClickPrevious={onPaginationBroadcastClickPrevious}
                                onClickNext={onPaginationBroadcastClickNext}
                                onClickLast={onPaginationBroadcastClickLast}
                                onPageSizeChanged={onPaginationPageSizeChanged}
                            ></GridWithLoaderAndPagination>
                        </div>
                       
                    </FormGroupContainer>
			</ContentContainer>
			
			
		</MainContainer>
  )
}