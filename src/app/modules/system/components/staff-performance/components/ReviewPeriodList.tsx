import React, { useState, useEffect, useRef, useContext, useCallback } from 'react'
import swal from 'sweetalert';
import { AgGridReact } from 'ag-grid-react';
import { MainContainer, FormHeader, ContentContainer, FieldContainer, FieldLabel, DefaultGridPagination, TableIconButton, MlabButton } from '../../../../../custom-components'
import { Row, Col } from 'react-bootstrap-v5';
import Select from 'react-select'
import { ReviewPeriodListModel, REVIEW_PERIOD_LIST_DEFAULT } from '../../../models/staffperformance/response/ReviewPeriodListResponseModel';
import StaffPerformanceHeader from '../header/StaffPerformanceHeader';
import { PaginationModel } from '../../../../../common/model';
import gridOverlayTemplate, { gridOverlayNoRowsTemplate } from '../../../../../common-template/gridTemplates';
import { faPencilAlt, faToggleOff, faToggleOn } from '@fortawesome/free-solid-svg-icons';
import '../css/StaffPerformance.css';
import { ToggleTypeEnum, StatusTypeEnum, ElementStyle, PROMPT_MESSAGES } from '../../../../../constants/Constants';
import ReviewPeriodModal from '../modals/ReviewPeriodModal';
import { StatusOptions, ReviewPeriodRequestBuilder, } from '../utils/helpers';
import { StaffPerformanceContext } from '../context/StaffPerformanceContext';
import { LookupModel } from '../../../../../shared-models/LookupModel';
import useStaffPerformanceConstant from '../constant/useStaffPerformanceConstant';
import { useStaffPerformanceHooks } from '../hooks/useStaffPerformanceHooks';
import { RootState } from '../../../../../../setup';
import { useSelector, shallowEqual } from 'react-redux';
import { IAuthState } from '../../../../auth';
import { convertDateIntoISO } from '../../../../../utils/converter';
import { ReviewPeriodListRequestModel, REVIEW_PERIOD_REQUEST_DEFAULT } from '../../../models/staffperformance/request/ReviewPeriodListRequestModel';
import useFnsDateFormatter from '../../../../../custom-functions/helper/useFnsDateFormatter';
import { USER_CLAIMS } from '../../../../user-management/components/constants/UserClaims';
import { useHistory } from 'react-router-dom';
import useConstant from '../../../../../constants/useConstant';

const ReviewPeriodList = () => {
  const { setSelectedReviewPeriod, getStaffPerformanceInfoAsync } = useContext(StaffPerformanceContext)
  const { userId, access } = useSelector<RootState>(({ auth }) => auth, shallowEqual) as IAuthState;
  const { mlabFormatDate } = useFnsDateFormatter();
  const { STAFF_PERFORMANCE_MODULE } = useStaffPerformanceConstant()
  const { getReviewPeriodList, reviewPeriodList, getLoading, upsertReviewPeriodData, successfullUpsert } = useStaffPerformanceHooks();
  const history = useHistory();
  const { SwalConfirmMessage } = useConstant()

  const [gridApi, setGridApi] = useState<any>();
  const gridRef: any = useRef();
  const nameRef: any = useRef();
  const [pagination, setPagination] = useState<PaginationModel>({
    pageSize: 20,
    currentPage: 1,
    recordCount: 1,
    sortOrder: STAFF_PERFORMANCE_MODULE.ReviewPeriod.DefaultSortOrder,
    sortColumn: STAFF_PERFORMANCE_MODULE.ReviewPeriod.DefaultSortColumn
  });

  const [reviewPeriodName, setReviewPeriodName] = useState<string>('')
  const [reviewPeriodStatus, setReviewPeriodStatus] = useState<LookupModel[] | null>(null)
  const [reviewPeriodTable, setReviewPeriodTable] = useState<ReviewPeriodListModel[] | null>()
  const [reviewPeriodListRq, setReviewPeriodListRq] = useState<ReviewPeriodListRequestModel>(REVIEW_PERIOD_REQUEST_DEFAULT)
  const [showModal, setShowModal] = useState<boolean>(false)
  const [orderAscending, setOrderAscending] = useState<boolean>(true) // state for handling asc/desc of the order column

  useEffect(() => {
    if (!access?.includes(USER_CLAIMS.CommunicationReviewPeriodRead) && !access?.includes(USER_CLAIMS.CommunicationReviewPeriodWrite)) history.push('/error/401');
    getStaffPerformanceInfoAsync(STAFF_PERFORMANCE_MODULE.ReviewPeriod.Id)
    nameRef?.current?.focus()
    return () => { }
  }, [])

  useEffect(() => {
    handleUpsertSuccess();
    return () => { }
  }, [successfullUpsert])

  useEffect(() => {    
    if (!reviewPeriodList) return
    const numberedList = (reviewPeriodList.reviewPeriodList ?? [])?.reduce((acc: any, curr: any, idx: number) => {
      let numberColumn = orderAscending ? ((pagination.currentPage * pagination.pageSize) - pagination.pageSize) + idx + 1 : (reviewPeriodList?.totalRecords ?? 0) - (((pagination.currentPage * pagination.pageSize) - pagination.pageSize) + idx)
      acc.push({ ...curr, rowNumber: numberColumn })
      return acc
    }, [])
      setReviewPeriodTable(numberedList.length === 0 ? null : numberedList)
    return () => { }
  }, [reviewPeriodList, orderAscending])

  useEffect(() => {    
    const request = ReviewPeriodRequestBuilder(userId, reviewPeriodListRq?.communicationReviewPeriodName ?? reviewPeriodName, handlerReviewPeriodStatus(), pagination)
    getReviewPeriodList(request)
    return () => { }
  }, [pagination])

  const handlerReviewPeriodStatus = () => {
    return reviewPeriodListRq?.status ?? (reviewPeriodStatus?.length === 1 ? reviewPeriodStatus[0]?.value : null)
  }

  const handlePopUpModal = (periodId = 0) => {
    const selectedPeriod: any = reviewPeriodTable?.find((period) => period.communicationReviewPeriodId === periodId)
    selectedPeriod ? setSelectedReviewPeriod(selectedPeriod) : setSelectedReviewPeriod(REVIEW_PERIOD_LIST_DEFAULT)
    setShowModal(!showModal)
  }

  const handleUpsertSuccess = () => {
    setShowModal(false)
    handleSearchReviewPeriod()
  }

  const handleSearchReviewPeriod = () => {
    setReviewPeriodTable([])    
    const request = ReviewPeriodRequestBuilder(userId, reviewPeriodName, handlerReviewPeriodStatus() , pagination)
    setReviewPeriodListRq(request)
    getReviewPeriodList(request)
  }

  const handleUpdateReviewPeriodStatus = (data: ReviewPeriodListModel) => {
    setSelectedReviewPeriod(data)
    const toggledResult = StatusOptions.find((status: LookupModel) => status.value !== Number(data.status).toString())
    swal({
      title: PROMPT_MESSAGES.ConfirmCloseTitle,
      text: STAFF_PERFORMANCE_MODULE.ReviewPeriod.ConfirmToggleStatus(toggledResult?.label ?? ''),      
      icon: SwalConfirmMessage.icon,
      buttons: [SwalConfirmMessage.btnNo, SwalConfirmMessage.btnYes],
      dangerMode: true,
    })
      .then(async (handleAction) => {
        if (handleAction) {
          const upsertRequest = {
            ...data,
            status: Number(toggledResult?.value),
            rangeStart: convertDateIntoISO(data.rangeStart),
            rangeEnd: convertDateIntoISO(data.rangeEnd),
            validationPeriod: convertDateIntoISO(data.validationPeriod),
            userId: userId?.toString() ?? '0'
          }
          upsertReviewPeriodData(upsertRequest)
        }
      })
      .catch(() => { });
  }

  const statusColumnRenderer = useCallback(({ data }: any) => {
    return <div>{data.status ? StatusTypeEnum.Active : StatusTypeEnum.Inactive}</div>;
  },[]);

  const dateRangeRenderer = useCallback(({ data }: any) => {
    return <div>{`${mlabFormatDate(data.rangeStart)} - ${mlabFormatDate(data.rangeEnd)}`}</div>;
  },[]);

  const validationPeriodRenderer = useCallback(({ data }: any) => {    
    return <div>{`${mlabFormatDate(data.validationPeriod)}`}</div>;
  },[])

  const actionColumnRenderer = useCallback(({ data }: any) => {
    return (
      <div className='d-flex align-center'>
        <div>
          <TableIconButton
            access={true}
            isDisable={data.status || !access?.includes(USER_CLAIMS.CommunicationReviewPeriodWrite)}
            iconColor=''
            faIcon={faPencilAlt}
            toolTipText={'Edit'}
            onClick={() => { !data.status && handlePopUpModal(data.communicationReviewPeriodId) }}
          />
        </div>
        <div className='icon-spacing'></div>
        <div>
          <TableIconButton
            access={true}
            isDisable={!access?.includes(USER_CLAIMS.CommunicationReviewPeriodWrite)}
            faIcon={data.status ? faToggleOff : faToggleOn}
            toolTipText={data.status ? ToggleTypeEnum.Deactivate : ToggleTypeEnum.Activate}
            onClick={() => { handleUpdateReviewPeriodStatus(data) }}
          />
        </div>
      </div>
    );
  },[reviewPeriodTable]);

  const customOrderComparator = (e: any) => {
    // Get the column state
    let columnState = gridApi.getSortModel();
    // Find the column state for the specific column
    let columnSortState = columnState.find((column: any) => column.colId === 'rowNumber');
    setOrderAscending(columnSortState.sort.toLowerCase() !== STAFF_PERFORMANCE_MODULE.ReviewPeriod.DefaultSortOrder.toLowerCase())
  }

  const customComparator = (e: any) => {
    return reviewPeriodTable
  }

  const gridOptions: any = {
    columnDefs: [
      {
        headerName: 'Order',
        field: 'rowNumber',
        comparator: customOrderComparator
      },

      {
        headerName: 'Period Name',
        field: 'communicationReviewPeriodName',
        comparator: customComparator
      },
      {
        headerName: 'Communication Start From Range',
        field: 'rangeStart',
        cellRenderer: dateRangeRenderer,
        comparator: customComparator
      },
      {
        headerName: 'Validation Period',
        field: 'validationPeriod',
        cellRenderer: validationPeriodRenderer,
        comparator: customComparator
      },
      {
        headerName: 'Status',
        field: 'status',
        cellRenderer: statusColumnRenderer,
      },
      {
        headerName: 'Action',
        field: 'action',
        cellRenderer: actionColumnRenderer,
        minWidth: 100,
        sortable: false
      },
    ],
  };

  const onGridReady = (params: any) => {
    
    setGridApi(params.api);
    params.api.sizeColumnsToFit();
    gridRef.current.api.hideOverlay();
  };

  const onPageSizeChanged = (newPageSize: string) => {
    const newPagination = { ...pagination, pageSize: Number(newPageSize), currentPage: STAFF_PERFORMANCE_MODULE.ReviewPeriod.DefaultPageStart };
    setPagination(newPagination);
  };

  const onClickFirst = () => {
    if (pagination.currentPage > STAFF_PERFORMANCE_MODULE.ReviewPeriod.DefaultPageStart) {
      const newPagination = { ...pagination, currentPage: 1 };
      setPagination(newPagination);
    }
  };

  const onClickPrevious = () => {
    if (pagination.currentPage > STAFF_PERFORMANCE_MODULE.ReviewPeriod.DefaultPageStart) {
      const newPagination = { ...pagination, currentPage: pagination.currentPage - 1 };
      setPagination(newPagination);
    }
  };

  const onClickNext = () => {
    if (reviewPeriodTotalPage() > pagination.currentPage) {
      const newPagination = { ...pagination, currentPage: pagination.currentPage + 1 };
      setPagination(newPagination);
    }
  };

  const onClickLast = () => {
    if (reviewPeriodTotalPage() > pagination.currentPage) {
      const newPagination = { ...pagination, currentPage: reviewPeriodTotalPage() };
      setPagination(newPagination);
    }
  };

  const reviewPeriodTotalPage = () => {
    return Math.ceil(reviewPeriodList?.totalRecords / pagination.pageSize) | STAFF_PERFORMANCE_MODULE.ReviewPeriod.DefaultPageTotal;
  };

  const onUpdateGridCustomDisplay = async () => {
    gridRef.current.api.showLoadingOverlay();
  };

  const sortingRowOrder = (sorting: any) => { // this logic is intended only for order column which has a field name of row number
    if (!sorting) return STAFF_PERFORMANCE_MODULE.ReviewPeriod.DefaultSortOrder
    const output = (STAFF_PERFORMANCE_MODULE.ReviewPeriod.SortingOrder.find((order: any) => (order ?? STAFF_PERFORMANCE_MODULE.ReviewPeriod.DefaultSortOrder).toLowerCase()  !== sorting.toLowerCase()) )     
    return output ?? STAFF_PERFORMANCE_MODULE.ReviewPeriod.DefaultSortOrder
  }

  const onSort = (e: any) => {
    const sortDetail = e.api.getSortModel();
    const sortColumnConfig = !sortDetail[0]?.colId || sortDetail[0]?.colId === 'rowNumber' ? STAFF_PERFORMANCE_MODULE.ReviewPeriod.DefaultSortColumn : sortDetail[0]?.colId;
    const sortOrderConfig = !sortDetail[0]?.colId || sortDetail[0]?.colId === 'rowNumber' ?  sortingRowOrder(sortDetail[0]?.sort) : sortDetail[0]?.sort;    
    sortDetail[0]?.colId === 'rowNumber' ? setOrderAscending(sortDetail[0]?.sort.toLowerCase() === STAFF_PERFORMANCE_MODULE.ReviewPeriod.DefaultSortOrder.toLowerCase()) : setOrderAscending(sortDetail[0]?.sort ?? true)
    setPagination({ ...pagination, sortColumn: sortColumnConfig, sortOrder: sortOrderConfig })
  }
  return (
    <MainContainer>
      <FormHeader headerLabel={STAFF_PERFORMANCE_MODULE.ReviewPeriod.Header} />
      <ContentContainer>
        <StaffPerformanceHeader />
        <div className='separator border-4 my-8' />
        <Row>
          <Col>
            <FieldContainer>
              <FieldLabel fieldSize={'12'} title={'Period Name'} />
              <div className={'col-sm-12'}>
                <input
                  type='text'
                  className={'form-control form-control-sm '}
                  onChange={(e: any) => setReviewPeriodName(e.currentTarget.value)}
                  value={reviewPeriodName}
                  aria-label='Period Name'
                  ref={nameRef}
                />
              </div>
            </FieldContainer>
          </Col>
          <Col>
            <FieldContainer>
              <FieldLabel fieldSize={'12'} title={' Status'} />
              <div className='col-lg-12'>
                <Select
                  menuPlacement='auto'
                  menuPosition='fixed'
                  isMulti={true}
                  size='small'
                  style={{ width: '100%' }}
                  options={StatusOptions}
                  onChange={(e: any) => {
                    setReviewPeriodStatus(e ?? null)
                  }}
                  isDisabled={!access?.includes(USER_CLAIMS.CommunicationReviewPeriodWrite)}
                  value={reviewPeriodStatus}
                  isClearable={true}
                />
              </div>
            </FieldContainer>
          </Col>
        </Row>
        <Row>
          <Col>
            <MlabButton
              access={true}
              label='Search'
              style={ElementStyle.primary}
              type={'button'}
              weight={'solid'}
              size={'sm'}
              loading={getLoading}
              loadingTitle={'Please wait...'}
              disabled={getLoading}
              onClick={handleSearchReviewPeriod}
            />
            <MlabButton
              access={access?.includes(USER_CLAIMS.CommunicationReviewPeriodWrite)}
              label='Add New'
              style={ElementStyle.primary}
              type={'button'}
              weight={'solid'}
              size={'sm'}
              loading={false}
              loadingTitle={'Please wait...'}
              disabled={false}
              onClick={() => { handlePopUpModal(0) }}
            />
          </Col>
        </Row>
        <div style={{ padding: '0.5rem' }}></div>
        <Row>
          <Col sm={12}>
            <div className='ag-theme-quartz' style={{ height: 500, width: '100%', marginBottom: '50px' }}>
              <AgGridReact
                rowStyle={{ userSelect: 'text' }}
                rowData={reviewPeriodTable}
                columnDefs={gridOptions.columnDefs}
                defaultColDef={{
                  sortable: true,
                  resizable: true,
                }}
                onGridReady={onGridReady}
                onSortChanged={(e) => onSort(e)}
                rowSelection={'multiple'}
                alwaysShowHorizontalScroll={false}
                animateRows={true}
                rowBuffer={0}
                pagination={false}
                paginationPageSize={pagination.pageSize}
                ref={gridRef}
                overlayNoRowsTemplate={getLoading ? gridOverlayTemplate : gridOverlayNoRowsTemplate}
                overlayLoadingTemplate={gridOverlayTemplate}
                suppressHorizontalScroll={false}
              />
              <DefaultGridPagination
                recordCount={reviewPeriodList?.totalRecords ?? 0}
                currentPage={pagination.currentPage}
                pageSize={pagination.pageSize}
                onClickFirst={onClickFirst}
                onClickPrevious={onClickPrevious}
                onClickNext={onClickNext}
                onClickLast={onClickLast}
                onUpdateGridCustomDisplay={onUpdateGridCustomDisplay}
                onPageSizeChanged={(newPageSize) => {
                  onPageSizeChanged(newPageSize);
                }}
                pageSizes={[20, 30, 50, 100]}
              />
            </div>
          </Col>
        </Row>
        <div style={{ padding: '0.5rem' }}></div>
        <MlabButton
          access={true}
          label='Back'
          style={ElementStyle.secondary}
          type={'button'}
          weight={'solid'}
          size={'sm'}
          loading={false}
          loadingTitle={'Please wait...'}
          disabled={false}
          onClick={() => window.open("/system/staff-performance-setting", "_self")}
        />
      </ContentContainer>
      <ReviewPeriodModal
        showModal={showModal}
        handleShowModal={handlePopUpModal}
        handleUpsertSuccess={handleUpsertSuccess}
      />
    </MainContainer>
  )
}

export default ReviewPeriodList