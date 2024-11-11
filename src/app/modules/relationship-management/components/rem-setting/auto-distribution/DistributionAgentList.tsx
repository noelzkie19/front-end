import { useEffect, useRef, useState } from 'react';
import { DefaultGridPagination, FormGroupContainer, TableIconButton } from '../../../../../custom-components';
import { DefaultPageSetup } from '../../../../system/components/constants/PlayerConfigEnums';
import useAutoDistributionSettingHooks from '../../../shared/hooks/useAutoDistributionSettingHooks';
import { AgGridReact } from 'ag-grid-react';
import UpdateAgentMaximumPlayerCountModal from './modal/UpdateAgentMaximumPlayerCountModal';
import { faEye } from '@fortawesome/free-solid-svg-icons';
import { AutoDistributionSettingsFilterModel } from '../../../models/request/AutoDistributionSettingsFilterModel';
import gridOverlayTemplate, { gridOverlayNoRowsTemplate } from '../../../../../common-template/gridTemplates';
import { PaginationModel } from '../../../../../shared-models/PaginationModel';
import ViewAutoDistributionAgentModal from './modal/ViewAutoDistributionAgentModal';

type DistributionAgentsListProps = {
    search: AutoDistributionSettingsFilterModel;
    loading: boolean;
    setLoading: (e: any) => void;
};

const DistributionAgentList = ({
    search,
    loading,
    setLoading,
}: DistributionAgentsListProps) => {
    const gridRef: any = useRef();
    const { getDistributionAgentList, autoDistributionAgentsList, autoDistributionAgentsTotalCount, generateParam } = useAutoDistributionSettingHooks();

    const [agentDetails, setAgentDetails] = useState<any>();
    const [updateModalShow, setUpdateModalShow] = useState<boolean>(false);
    const [viewModalShow, setViewModalShow] = useState<boolean>(false);
    const [searchFilter, setSearchFilter] = useState<any>();

    // Grid pagination states
    const [pageSize, setPageSize] = useState<number>(DefaultPageSetup.pageSizeDefault);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [sortOrder, setSortOrder] = useState<string>('');
    const [sortColumn, setSortColumn] = useState<string>('');

    useEffect(() => {
        let intervalId: any;

        const fetchListData = () => {
            getDistributionAgentList(searchFilter);
        };

        if (searchFilter) {
            fetchListData();
            intervalId = setInterval(fetchListData, 5000);
        }

        return () => clearInterval(intervalId);
    }, [searchFilter])

    useEffect(() => {
        if (search !== undefined) {
            handleAgentPaginationLoad(1, 10, "", "");
        }
    }, [search]);

    useEffect(() => {
        if (autoDistributionAgentsList) {
            setLoading(false);
        }
    }, [autoDistributionAgentsList])

    useEffect(() => {
        if (!loading && autoDistributionAgentsList.length === 0) {
            if (document.getElementById('auto-distribution-agent-list')?.querySelector('#mlab-grid-loading-overlay') as HTMLInputElement) {
                (document.getElementById('auto-distribution-agent-list')?.querySelector('#mlab-grid-loading-overlay') as HTMLInputElement).innerText = 'No Rows To Show';
            }
        } else if (document.getElementById('auto-distribution-agent-list')?.querySelector('#mlab-grid-loading-overlay') as HTMLInputElement) {
            (document.getElementById('auto-distribution-agent-list')?.querySelector('#mlab-grid-loading-overlay') as HTMLInputElement).innerText = 'Please wait while your items are loading';
        }
    }, [loading]);

    const handleAgentPaginationLoad = (_currentPage: number, _pageSize: number, _sortColumn: string, _sortOrder: string) => {
        const paginationAgent: PaginationModel = {
            currentPage: _currentPage,
            pageSize: _pageSize,
            offsetValue: (_currentPage - 1) * pageSize,
            sortColumn: _sortColumn,
            sortOrder: _sortOrder,
        }

        const requestAgentsObj = generateParam(search, paginationAgent)
        setSearchFilter(requestAgentsObj);
        getDistributionAgentList(requestAgentsObj);
    }

    const customCellMaxPlayerCountRender = (params: any) => {
        return (
            <button type="button"
                className='btn-link cursor-pointer'
                style={{ backgroundColor: 'transparent' }}
                onClick={() => { handleShowMaxPlayerCountModal(params.data) }}>
                {params.data.maxPlayersCount}
            </button>
        );
    };

    const customCellViewConfiguration = (params: any) => {
        return (
            <TableIconButton
                access={true}
                faIcon={faEye}
                toolTipText={'View Configuration'}
                onClick={() => { handleShowAgentModal(params.data); }}
                isDisable={false}
            />)
    }

    const agentListColumnDefs = [
        {
            field: 'remProfileName',
            headerName: 'Agent Name',
            cellRenderer: (params: any) => params.data.remProfileName ?? '',
            minWidth: 400,
        },
        {
            field: 'adc.RemProfileId',
            headerName: 'Configuration List',
            cellRenderer: customCellViewConfiguration,
            minWidth: 300,
        },
        {
            field: 'maxPlayersCount',
            headerName: 'Maximum Player Count',
            cellRenderer: customCellMaxPlayerCountRender,
            minWidth: 200,
        },
        {
            field: 'totalPlayerCount',
            headerName: 'Total Player Count',
            cellRenderer: (params: any) => params.data.totalPlayerCount ?? '',
            minWidth: 200,
        },
    ];

    const onGridReadyAgentList = (params: any) => {
        params.api.sizeColumnsToFit();
    };

    const onPageSizeChangedAgentList = () => {
        const value: string = (document.getElementById('page-size') as HTMLInputElement).value;
        setPageSize(Number(value));
        setCurrentPage(1);

        if (autoDistributionAgentsList != undefined && autoDistributionAgentsList.length > 0) {
            handleAgentPaginationLoad(1, Number(value), sortColumn, sortOrder);
        }
    };

    const onClickFirstAgentList = () => {
        if (currentPage > 1) {
            setCurrentPage(1);
            handleAgentPaginationLoad(1, pageSize, sortColumn, sortOrder);
        }
    };

    const onClickPreviousAgentList = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
            handleAgentPaginationLoad(currentPage - 1, pageSize, sortColumn, sortOrder);
        }
    };

    const onClickNextAgentList = () => {
        if (totalPage() > currentPage) {
            setCurrentPage(currentPage + 1);
            handleAgentPaginationLoad(currentPage + 1, pageSize, sortColumn, sortOrder);
        }
    };

    const onClickLastAgentList = () => {
        if (totalPage() > currentPage) {
            setCurrentPage(totalPage());
            handleAgentPaginationLoad(totalPage(), pageSize, sortColumn, sortOrder);
        }
    };

    const totalPage = () => {
        return Math.ceil(autoDistributionAgentsTotalCount / pageSize) | 0;
    };

    const onSort = (e: any) => {
        if (autoDistributionAgentsList != undefined && autoDistributionAgentsList.length > 0) {
            const sortDetail = e.api.getSortModel();
            if (sortDetail[0] != undefined) {
                setSortColumn(sortDetail[0]?.colId);
                setSortOrder(sortDetail[0]?.sort);
                handleAgentPaginationLoad(currentPage, pageSize, sortDetail[0]?.colId, sortDetail[0]?.sort);
            } else {
                setSortColumn('');
                setSortOrder('');
                handleAgentPaginationLoad(currentPage, pageSize, '', '');
            }
        }
    };

    const handleShowMaxPlayerCountModal = (details: any) => {
        setAgentDetails(details);
        setUpdateModalShow(true);
    }

    const closeUpdateModal = () => {
        setUpdateModalShow(false);
        getDistributionAgentList(searchFilter);
    }

    const handleShowAgentModal = (details: number) => {
        setAgentDetails(details);
        setViewModalShow(true);
    }

    const closeViewModal = () => {
        setViewModalShow(false);
    }


    return (
        <FormGroupContainer>
            <div className='ag-theme-quartz' style={{ height: 400, width: '100%', marginBottom: '50px' }} id='auto-distribution-agent-list'>
                <AgGridReact
                    rowData={autoDistributionAgentsList}
                    defaultColDef={{
                        sortable: true,
                        resizable: true,
                    }}
                    suppressCopyRowsToClipboard={true}
                    onGridReady={onGridReadyAgentList}
                    rowBuffer={0}
                    enableRangeSelection={true}
                    pagination={false}
                    paginationPageSize={pageSize}
                    columnDefs={agentListColumnDefs}
                    overlayNoRowsTemplate={gridOverlayNoRowsTemplate}
                    onSortChanged={(e) => onSort(e)}
                    ref={gridRef}
                />
                <DefaultGridPagination
                    recordCount={autoDistributionAgentsTotalCount}
                    currentPage={currentPage}
                    pageSize={pageSize}
                    onClickFirst={onClickFirstAgentList}
                    onClickPrevious={onClickPreviousAgentList}
                    onClickNext={onClickNextAgentList}
                    onClickLast={onClickLastAgentList}
                    onPageSizeChanged={onPageSizeChangedAgentList}
                />
            </div>
            <UpdateAgentMaximumPlayerCountModal showForm={updateModalShow} closeModal={closeUpdateModal} selectedRow={agentDetails} />
            <ViewAutoDistributionAgentModal showForm={viewModalShow} closeModal={closeViewModal} selectedRow={agentDetails} />
        </FormGroupContainer>
    );
};

export default DistributionAgentList;
