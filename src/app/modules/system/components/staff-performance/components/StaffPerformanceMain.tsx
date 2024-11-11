import {faEdit} from "@fortawesome/free-solid-svg-icons";
import {AgGridReact} from "ag-grid-react";
import {useContext, useEffect, useRef, useState} from "react";
import {shallowEqual, useSelector} from "react-redux";
import {useHistory} from "react-router-dom";
import {RootState} from "../../../../../../setup";
import gridOverlayTemplate, {gridOverlayNoRowsTemplate} from "../../../../../common-template/gridTemplates";
import {ContentContainer, DefaultGridPagination, FormHeader, MainContainer, TableIconButton} from "../../../../../custom-components";
import {pushTo401} from "../../../../ticket-management/utils/helper";
import {USER_CLAIMS} from "../../../../user-management/components/constants/UserClaims";
import {StaffPerformanceRequestModel} from "../../../models/staffperformance/request/StaffPerformanceRequestModel";
import {DefaultPageSetup} from "../../constants/PlayerConfigEnums";
import useStaffPerformanceConstant from "../constant/useStaffPerformanceConstant";
import {StaffPerformanceContext} from "../context/StaffPerformanceContext";

const StaffPerformanceMain: React.FC = () => {
    const [gridHeight, setGridHeight] = useState<number>(500);
    const { DEFAULT_PAGE_CONFIG } = useStaffPerformanceConstant();

    // AG GRID
    const [rowData, setRowData] = useState<any>([]);

    // sort and pagination
    const [pageSize, setPageSize] = useState<number>(DefaultPageSetup.pageSizeDefault);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [sortOrder, setSortOrder] = useState<string>(DEFAULT_PAGE_CONFIG.SortOrder);
    const [sortColumn, setSortColumn] = useState<string>(DEFAULT_PAGE_CONFIG.SortColumn);
    const gridRef: any = useRef();
    const { staffPerformanceSettingData, getStaffPermormanceSettingListAsync } = useContext(StaffPerformanceContext)

    const defaultPageSize = 10;

    const userAccess = useSelector<RootState>(({ auth }) => auth.access, shallowEqual) as string;
    const history = useHistory();

    useEffect(() => {
        !userAccess?.includes(USER_CLAIMS.StaffPerformanceRead) && !userAccess?.includes(USER_CLAIMS.StaffPerformanceWrite) && pushTo401(history);

        const request: StaffPerformanceRequestModel = createRequestObj(sortColumn, sortOrder, (currentPage - 1) * pageSize, pageSize)
        getStaffPermormanceSettingListAsync(request);
    }, [])

    useEffect(() => {
        setRowData(staffPerformanceSettingData?.staffPerformanceSettingList);
    }, [staffPerformanceSettingData])

    const createRequestObj = (_sortColumn?: string, _sortOrder?: string, _offsetValue?: number, _pageSize?: number) => {
        const requestObj: StaffPerformanceRequestModel = {
            sortOrder: _sortOrder ?? DEFAULT_PAGE_CONFIG.SortOrder,
            sortColumn: _sortColumn ?? DEFAULT_PAGE_CONFIG.SortColumn,
            offsetValue: _offsetValue ?? 0,
            pageSize: _pageSize ?? DefaultPageSetup.pageSizeDefault
        }

        return requestObj;
    }

    const actionButtons = (_params: any) => {
        let url = "";

        switch (_params.data.id) {
            case 400:
                url = "";
                break;
            case 401:
                url = "";
                break;
            case 403:
                url = "";
                break;
            case 404:
                url = "";
                break;
            case 405:
                url = "/system/staff-performance-setting/review-period";
                break;
            default:
                url = "";
                break;
        }

        return (
            <TableIconButton
                access={true}
                faIcon={faEdit}
                toolTipText={'Edit Page'}
                onClick={() => window.open(url, "_self")}
                isDisable={url === ""}
            />
        )
    }

    const columnDefs = [

        { headerName: 'No', field: 'position', width: 200 },
        { headerName: 'Setting Name', field: 'settingName', minWidth: 450, resizable: true},
        { headerName: 'Parent', field: 'parent', minWidth: 450, resizable: true },
        { headerName: 'Action', field: 'action', minWidth: 100, cellRenderer: actionButtons, sortable: false, isPinned: true }
    ]

    const onGridReady = (params: any) => {
        
        params.api.sizeColumnsToFit();
    };

    // GRID AND PAGINATION
    const onSort = (e: any) => {
        if (staffPerformanceSettingData?.staffPerformanceSettingList != undefined && staffPerformanceSettingData?.staffPerformanceSettingList.length > 0) {
            const sortDetail = e.api.getSortModel();
            if (sortDetail[0] != undefined) {
                setSortColumn(sortDetail[0]?.colId);
                setSortOrder(sortDetail[0]?.sort);
                loadStaffPerformanceList(sortDetail[0]?.colId, sortDetail[0]?.sort, (currentPage - 1) * pageSize, pageSize);
            } else {
                setSortColumn('');
                setSortOrder('');
                loadStaffPerformanceList();
            }
        }
    };

    const onPageSizeChanged = (e: any) => {
        setPageSize(parseInt(e));
        setCurrentPage(1);
        const value: string = (document.getElementById('page-size') as HTMLInputElement).value;

        if (staffPerformanceSettingData !== undefined) {
            if (staffPerformanceSettingData?.staffPerformanceSettingList !== undefined && staffPerformanceSettingData?.staffPerformanceSettingList.length > 0) {
                loadStaffPerformanceList(sortColumn, sortOrder, 0, parseInt(e));
            }
        }

        switch (Number(value)) {
            case defaultPageSize:
                setGridHeight(500);
                break;
            case 50:
                setGridHeight(800);
                break;
            default:
                setGridHeight(1200);
                break;
        }
    };

    const paginationLoadStaffPerformanceList = (_sortColumn: string, _sortOrder: string, _currentPage: number, _pageSize: number) => {
        loadStaffPerformanceList(_sortColumn, _sortOrder, (_currentPage - 1) * _pageSize, _pageSize);
    };

    const totalPage = () => {
        return Math.ceil((staffPerformanceSettingData?.rowCount ?? 0) / pageSize) | 0;
    };
    const onClickFirst = () => {
        if (currentPage > 1) {
            setCurrentPage(1);
            paginationLoadStaffPerformanceList(sortColumn, sortOrder, 1, pageSize);
        }
    };

    const onClickNext = () => {
        if (totalPage() > currentPage) {
            setCurrentPage(currentPage + 1);
            paginationLoadStaffPerformanceList(sortColumn, sortOrder, currentPage + 1, pageSize);
        }
    };

    const onClickPrevious = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
            paginationLoadStaffPerformanceList(sortColumn, sortOrder, currentPage - 1, pageSize);
        }
    };

    const onClickLast = () => {
        if (totalPage() > currentPage) {
            setCurrentPage(totalPage());
            paginationLoadStaffPerformanceList(sortColumn, sortOrder, totalPage(), pageSize);
        }
    };

    const loadStaffPerformanceList = (_sortColumn?: string, _sortOrder?: string, _offsetValue?: number, _pageSize?: number) => {
        const request: StaffPerformanceRequestModel = createRequestObj(_sortColumn, _sortOrder, _offsetValue, _pageSize)
        getStaffPermormanceSettingListAsync(request);
    }

    return (
        <MainContainer>
            <FormHeader headerLabel="Staff Performance Setting" />
            <ContentContainer>
                <div className='ag-theme-quartz' style={{ height: gridHeight, width: '100%', marginBottom: '50px' }}>
                    <AgGridReact
                        rowStyle={{ userSelect: 'text' }}
                        rowData={rowData}
                        defaultColDef={{
                            sortable: true,
                            resizable: true,
                        }}
                        columnDefs={columnDefs}
                        onSortChanged={(e) => onSort(e)}
                        onGridReady={onGridReady}
                        rowBuffer={0}
                        enableRangeSelection={true}
                        pagination={false}
                        overlayNoRowsTemplate={gridOverlayNoRowsTemplate}
                        overlayLoadingTemplate={gridOverlayTemplate}
                        ref={gridRef}
                        alwaysShowHorizontalScroll={false}
                        animateRows={true}
                        paginationPageSize={pageSize}
                    />
                    <DefaultGridPagination
                        recordCount={staffPerformanceSettingData?.rowCount ?? 0}
                        currentPage={currentPage}
                        pageSize={pageSize}
                        onClickFirst={onClickFirst}
                        onClickPrevious={onClickPrevious}
                        onClickNext={onClickNext}
                        onClickLast={onClickLast}
                        onPageSizeChanged={onPageSizeChanged}
                    />
                </div>
            </ContentContainer>
        </MainContainer>
    )
}

export default StaffPerformanceMain;