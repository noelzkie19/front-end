import { AgGridReact } from 'ag-grid-react'
import { addDays, endOfDay, endOfMonth, startOfDay, startOfMonth, subDays, subMonths } from 'date-fns'
import { Guid } from 'guid-typescript'
import moment from 'moment'
import { useEffect, useState } from 'react'
import { InputGroup } from 'react-bootstrap-v5'
import { shallowEqual, useDispatch, useSelector } from 'react-redux'
import Select from 'react-select'
import { DateRangePicker } from 'rsuite'
import swal from 'sweetalert'
import * as hubConnection from '../../../../setup/hub/MessagingHub'
import { RootState } from '../../../../setup/redux/RootReducer'
import { LookupModel } from '../../../common/model'
import { CampaignStatusEnum, ElementStyle } from '../../../constants/Constants'
import useConstant from '../../../constants/useConstant'
import { ButtonsContainer, DefaultGridPagination, FormGroupContainer, MlabButton } from '../../../custom-components'
import CommonLookups from '../../../custom-functions/CommonLookups'
import { USER_CLAIMS } from '../../user-management/components/constants/UserClaims'
import { CampaignCSVPlayerListModel } from '../models/request/CampaignCSVPlayerListModel'
import { CampaignImportPlayerModel } from '../models/request/CampaignImportPlayerModel'
import { CampaignModel } from '../models/request/CampaignModel'
import { UploadPlayerFilterModel } from '../models/request/UploadPlayerFilterModel'
import { CampaignUploadPlayerList } from '../models/response/CampaignUploadPlayerList'
import { RetentionCampaignPlayerListModel } from '../models/response/RetentionCampaignPlayerListModel'
import * as campaign from '../redux/CampaignManagementRedux'
import {
  exportToCsvCampaignPlayerList,
  getCampaignUploadPlayerList,
  getCampaignUploadPlayerListResult,
  removeImportPlayer,
  removeImportPlayerResult
} from '../redux/CampaignManagementService'
import { CampaignUploadPlayerModal } from './CampaignUploadPlayerModal'
import { ColDef, ColGroupDef } from 'ag-grid-community';


const Ranges = [
  {
    label: 'today',
    value: [startOfDay(new Date()), endOfDay(new Date())],
  },
  {
    label: 'yesterday',
    value: [startOfDay(addDays(new Date(), -1)), endOfDay(addDays(new Date(), -1))],
  },
  {
    label: 'Last 1 Week',
    value: [startOfDay(subDays(new Date(), 6)), endOfDay(new Date())],
  },
  {
    label: 'Current month',
    value: [startOfMonth(new Date()), endOfMonth(new Date())],
  },
  {
    label: 'Last 1 Month',
    value: [startOfMonth(subMonths(new Date(), 1)), endOfMonth(subMonths(new Date(), 1))],
  },
  {
    label: 'Since Last Month',
    value: [startOfMonth(subMonths(new Date(), 1)), endOfDay(new Date())],
  },
  {
    label: 'Last 4 Months',
    value: [startOfMonth(subMonths(new Date(), 4)), endOfMonth(subMonths(new Date(), 1))],
  },
  {
    label: 'Last 6 Months',
    value: [startOfMonth(subMonths(new Date(), 6)), endOfMonth(subMonths(new Date(), 1))],
  },
]
const bonusAbuserOptions = [
  {
    label: 'Yes',
    value: '1',
  },
  {
    label: 'No',
    value: '0',
  },
]
export const CampaignUploadPlayer = () => {
  ///REDUX
  const userAccess = useSelector<RootState>(({auth}) => auth.access, shallowEqual) as string
  const userAccessId = useSelector<RootState>(({auth}) => auth.userId, shallowEqual) as number
  const campaignState = useSelector<RootState>(({campaign}) => campaign.campaign, shallowEqual) as CampaignModel
  const mode = useSelector<RootState>(({campaign}) => campaign.mode, shallowEqual) as string
  const campaignStatusIdState = useSelector<RootState>(({campaign}) => campaign.campaignStatusId, shallowEqual) as number
  const dispatch = useDispatch()
	const {successResponse, HubConnected} = useConstant();

  ///Variables and Objects
  const [filterBrand, setFilterBrand] = useState<Array<LookupModel> | null>()
  const [filterPlayerId, setFilterPlayerId] = useState('')
  const [filterUsername, setFilterUsername] = useState('')
  const [filterStatus, setFilterStatus] = useState<Array<LookupModel> | null>()
  const [filterLastDepositDate, setFilterfilterLastDepositDate] = useState<any>(['', ''])
  const [filterLastBetDate] = useState<any>()
  const [filterLastBetProduct] = useState<LookupModel | null>()
  const [filterBonusAbuser, setFilterBonusAbuser] = useState<LookupModel | null>()
  const [filterDepositAmountFrom, setFilterDepositAmountFrom] = useState<string | undefined>()
  const [filterDepositAmountTo, setFilterDepositAmountTo] = useState<string | undefined>()
  const [gridApi, setGridApi] = useState<any>()
  const [lastDepositDateCustomCalendar] = useState<any>(Ranges)
  const bonusAbuserList = bonusAbuserOptions
  const [retentionPlayerList, setRetentionPlayerList] = useState<Array<RetentionCampaignPlayerListModel>>([])
  const [campaignUploadPlayerList] = useState<Array<CampaignUploadPlayerList>>([])
  const [campaignGuid, setCampaignGuid] = useState<string>('')
  const [selectedRows, setSelectedRows] = useState<Array<any>>([])
  const [removeBtnLoading, setRemoveBtnLoading] = useState(false)
  const [isViewMode, setIsViewMode] = useState<boolean>(false)
  const [exportBtnLoading, setExportBtnLoading] = useState(false)

  const [exportFilters, setExportFilters] = useState<UploadPlayerFilterModel>()
  ///Pagingation
  const [pageSize, setPageSize] = useState<number>(10)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [recordCount, setRecordCount] = useState<number>(0)
  const [sortOrder, setSortOrder] = useState<string>('desc')
  const [sortColumn, setSortColumn] = useState<string>('RegistrationDate')
  const [loading, setLoading] = useState(false)
  const [modalShow, setModalShow] = useState<boolean>(false)
  const customComparator = (valueA: string, valueB: string) => {
    return valueA.toLowerCase().localeCompare(valueB.toLowerCase())
  }
  const numberValueFormatter = (params: any) => {
    return params.value.toFixed(2)
  }
  const statusCellRenderer = (params: any)=>   <>
  {params && params.data.status === 'Active' && <span className='badge badge-light-success'> {params.data.status}</span>}
  {params && params.data.status === 'Created' && <span className='badge badge-light-primary'> {params.data.status}</span>}
  {params && params.data.status !== 'Active' && params.data.status !== 'Created' && (
    <span className='badge badge-light-warning'> {params.data.status}</span>
  )}
</>
  ///Grid Columns
  const columnDefs : (ColDef<RetentionCampaignPlayerListModel> | ColGroupDef<RetentionCampaignPlayerListModel>)[] = [
    {
      field: 'playerID',
      headerName: 'Player ID',
      width: 200,
      minWidth: 180,
      headerCheckboxSelection: true,
      headerCheckboxSelectionFilteredOnly: true,
      checkboxSelection: true,
      wrapText: true,
    },
    {headerName: 'Username', field: 'username', minWidth: 150, comparator: customComparator},
    {headerName: 'Brand', field: 'brand', minWidth: 150, comparator: customComparator},
    {
      headerName: 'Status',
      field: 'status',
      minWidth: 100,
      comparator: customComparator,
      cellRenderer: statusCellRenderer
    },
    {
      headerName: 'Last Deposit Date',
      field: 'lastDepositDate',
      minWidth: 150,
      comparator: customComparator,
      cellRenderer: (params: any) => {
        return params.data.lastDepositDate ? moment(new Date(params.data.lastDepositDate)).format('MM/DD/YYYY HH:mm') : ''
      },
    },
    {headerName: 'Last Deposit Amount', field: 'lastDepositAmount', minWidth: 150, type: 'rightAligned', valueFormatter: numberValueFormatter},
    {headerName: 'Bonus Abuser', field: 'bonusAbuser', minWidth: 100},
    {headerName: 'Last Bet Product', field: 'lastBetProduct', minWidth: 100},
    {
      headerName: 'Last Bet Date',
      field: 'lastBetDate',
      minWidth: 100,
      comparator: customComparator,
    },
  ]

  useEffect(() => {
    setIsViewMode(false)
    if (mode === 'view') {
      setIsViewMode(true)
    }
  }, [mode])
  const initializeRetentionPlayer = () => {
    setTimeout(() => {
      setFilterfilterLastDepositDate(['', ''])
      if ((campaignState.campaignId !== 0 || campaignGuid !== '') && loading !== true) {
        loadCampaignPlayerList(pageSize, 1, sortColumn, sortOrder)
      }
    })
  }
  //-------------------------------------PAGINATION---------------------------//
  const onSort = (e: any) => {
    if (campaignUploadPlayerList !== undefined) {
      let sortDetail = e.api.getSortModel()
      if (sortDetail[0] !== undefined) {
        setSortColumn(sortDetail[0]?.colId)
        setSortOrder(sortDetail[0]?.sort)
        loadCampaignPlayerList(pageSize, currentPage, sortDetail[0]?.colId, sortDetail[0]?.sort)
      } else {
        setSortColumn('')
        setSortOrder('')
        loadCampaignPlayerList(pageSize, currentPage, '', '')
      }
    }
  }
  const onClickFirst = () => {
    if (currentPage > 1) {
      setCurrentPage(1)
      loadCampaignPlayerList(pageSize, 1, sortColumn, sortOrder)
    }
  }

  const onClickPrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
      loadCampaignPlayerList(pageSize, 1, sortColumn, sortOrder)
    }
  }

  const onClickNext = () => {
    if (totalPage() > currentPage) {
      setCurrentPage(currentPage + 1)
      loadCampaignPlayerList(pageSize, currentPage + 1, sortColumn, sortOrder)
    }
  }

  const onClickLast = () => {
    if (totalPage() > currentPage) {
      setCurrentPage(totalPage())
      loadCampaignPlayerList(pageSize, totalPage(), sortColumn, sortOrder)
    }
  }

  const totalPage = () => {
    return Math.ceil(recordCount / pageSize) | 0
  }
  const onPageSizeChanged = (value: any) => {
    setPageSize(Number(value))
    setCurrentPage(1)
    if (campaignUploadPlayerList !== undefined && campaignUploadPlayerList.length > 0) {
      loadCampaignPlayerList(Number(value), 1, sortColumn, sortOrder)
    }
  }
  const onSelectionChanged = () => {
    let selectedRows = gridApi?.getSelectedRows()
    setSelectedRows(selectedRows)
  }
  //--------------------------------------END PAGINATION----------------------//
  const onGridReady = (params: any) => {
    //setRowData(systemData)
    setGridApi(params.api)
    params.api.sizeColumnsToFit()
    initializeRetentionPlayer()
  }
  const onAddPlayer = () => {
    if (campaignState.campaignId <= 0 && campaignState.campaignGuid === '') {
      let tempCampaignGuid = Guid.create().toString()
      setCampaignGuid(tempCampaignGuid)
      campaignState.campaignGuid = tempCampaignGuid
      dispatch(campaign.actions.campaign({...campaignState}))
    }
    setModalShow(true)
  }
  const onRemovePlayer = () => {
    if (selectedRows.length <= 0)
      swal('Failed', 'None of the Players in the list was selected, please tick the checkbox first of the player you wish to remove', 'error')
    else {
      removeCampaignPlayer()
    }
  }
  const onChangeBrand = (value: any) => {
    setFilterBrand(value)
  }
  const onChangeStatus = (value: any) => {
    setFilterStatus(value)
  }
  const onChangeBonusAbuser = (value: any) => {
    setFilterBonusAbuser(value)
  }
  const onChangeLastDepositAmountFrom = (event: any) => {
    if (event.target.value !== undefined && event.target.value !== '') {
      if (event.target.value.length > 6) return false
      setFilterDepositAmountFrom(event.target.value)
    } else {
      setFilterDepositAmountFrom('')
    }
  }
  const onChangeLastDepositAmountTo = (event: any) => {
    if (event.target.value != undefined && event.target.value !== '') {
      if (event.target.value.length > 6) return false
      setFilterDepositAmountTo(event.target.value)
    } else {
      setFilterDepositAmountTo('')
    }
  }
  const onChangeLastDepositDate = (value: any) => {
    if (value.length > 0) {
      setFilterfilterLastDepositDate(value)
    } else {
      setFilterfilterLastDepositDate([])
    }
  }
  const onClickClearFilter = () => {
    setFilterBrand([])
    setFilterPlayerId('')
    setFilterUsername('')
    setFilterStatus([])
    setFilterBonusAbuser(null)
    setFilterfilterLastDepositDate(['', ''])
    setFilterDepositAmountFrom('')
    setFilterDepositAmountTo('')
  }
  const tableLoader = (data: any) => {
    return (
      <div className='ag-custom-loading-cell' style={{paddingLeft: '10px', lineHeight: '25px'}}>
        <i className='fas fa-spinner fa-pulse'></i> <span> {data.loadingMessage}</span>
      </div>
    )
  }

  const campaignPlayerModelRequest = () => {
    const request: UploadPlayerFilterModel = {
      campaignId: campaignState.campaignId,
      guid: campaignState.campaignGuid,
      playerId: filterPlayerId === '' ? '' : filterPlayerId,
      brand:
        filterBrand === undefined
          ? ''
          : Object.assign(Array<LookupModel>(), filterBrand)
              .map((el: any) => el.value)
              .join(','),
      status:
        filterStatus === undefined
          ? ''
          : Object.assign(Array<LookupModel>(), filterStatus)
              .map((el: any) => el.value)
              .join(','),
   
      username: filterUsername,
      lastDepositAmountFrom: filterDepositAmountFrom !== undefined && filterDepositAmountFrom !== '' ? +filterDepositAmountFrom : undefined,
      lastDepositAmountTo: filterDepositAmountTo !== undefined && filterDepositAmountTo !== '' ? +filterDepositAmountTo : undefined,
      bonusAbuser: filterBonusAbuser?.value !== undefined ? +filterBonusAbuser?.value : undefined,
      pageSize: recordCount,
      offsetValue: 0,
      sortColumn: sortColumn === '' ? 'RegistrationDate' : sortColumn,
      sortOrder: sortOrder === '' ? 'Desc' : sortOrder,
      userId: userAccessId.toString(),
      queueId: Guid.create().toString(),
    }
    return request;
  } 
  const onExportToCSVCampaignPlayer = () => {
    if (retentionPlayerList.length <= 0) {
      swal('Failed', 'No Player list to Export', 'error')
      return
    }
    setExportBtnLoading(true)

    const request = campaignPlayerModelRequest();
    request.pageSize = recordCount;
    request.offsetValue = 0;
    request.lastDepositDateFrom= filterLastDepositDate.length === 0 ? undefined : moment(new Date(filterLastDepositDate[0])).format('MM/DD/YYYY HH:mm')
    request.lastDepositDateTo= filterLastDepositDate.length === 0 ? undefined : moment(new Date(filterLastDepositDate[1])).format('MM/DD/YYYY HH:mm')
   
    if (exportFilters !== undefined) exportFilters.pageSize = recordCount

    let exportFilterRequest = exportFilters ?? request
    exportToCsvCampaignPlayerList(exportFilterRequest)
      .then((response) => {
        if (response.status === 200) {
          const url = window.URL.createObjectURL(new Blob([response.data]))
          const link = document.createElement('a')
          link.href = url
          link.setAttribute('download', 'Campaign_Players.csv')
          document.body.appendChild(link)
          link.click()
          setLoading(false)
          swal('Successful', ' Player List has been exported to the local drive', 'success')
          setExportBtnLoading(false)
        } else {
          setLoading(false)
          swal('Failed', 'Problem in exporting the result', 'error')
        }
      })
      .catch(() => {
        setLoading(false)
        swal('Failed', 'Problem in getting campaign list', 'error')
      })
  }
  const onCloseModal = () => {
    setModalShow(false)
  }
  
  const onSearch = () => {
    setCurrentPage(1)
    if (validateDepositAmountFilter(null)) {
      if (campaignState.campaignGuid !== '' || campaignState.campaignId !== 0) {
        loadCampaignPlayerList(pageSize, 1, sortColumn, sortOrder)
      }
    }
  }
  const successUpload = () => {
    loadCampaignPlayerList(10, 1, sortColumn, sortOrder)
  }
  const campaignPlayerList = () => {
    let _ =  selectedRows.map((n) => {
      const campaignPlayerModel: CampaignCSVPlayerListModel = {
        brand: n.brand,
        playerId: n.playerId.toString(),
        userName: n.username,
      }
      return campaignPlayerModel
    })
    return _;
  }
  const campaignImportPlayerRequest =(_campaignPlayerList: CampaignCSVPlayerListModel[]) => {
    const request: CampaignImportPlayerModel = {
      campaignCSVPlayerListModel: _campaignPlayerList,
      campaignId: campaignState.campaignId,
      guidId: campaignState.campaignGuid,
      queueId: Guid.create().toString(),
      userId: userAccessId.toString(),
    }
    return request;
  }
  const removeCampaignPlayer = () => {
    setRemoveBtnLoading(true)

    let _campaignPlayerList = campaignPlayerList();

    const request = campaignImportPlayerRequest(_campaignPlayerList);

    setTimeout(() => {
      const messagingHub = hubConnection.createHubConnenction()
      messagingHub.start().then(() => {
        if (messagingHub.state !== HubConnected) {
          return;
        }
        removeImportPlayer(request).then((response) => {
          if (response.status === successResponse) {
            messagingHub.on(request.queueId.toString(), (message) => {
              // CALLBACK API
              removeImportPlayerResult(message.cacheId)
                .then((result) => {
                  if (result.data.status === successResponse) {
                    setLoading(false)
                    swal('Success', 'Transaction successfully submitted', 'success')
                    onSearch()
                    setRemoveBtnLoading(false)
                    setSelectedRows([])
                  }
                })
                .catch(() => {
                  setLoading(false)
                })
              messagingHub.off(request.queueId.toString())
              messagingHub.stop()
            })
          }
        })
      })
    })
  }
  const validateDepositAmountFilter = (e: any) => {
    let valid = true
    let _filterDepositAmountFrom = filterDepositAmountFrom !== undefined ? +filterDepositAmountFrom : 0
    let _filterDepositAmountTo = filterDepositAmountTo !== undefined ? +filterDepositAmountTo : 0
    if (filterDepositAmountTo && filterDepositAmountFrom && _filterDepositAmountFrom >= _filterDepositAmountTo) {
      valid = false
      swal('Failed', 'Last Deposit Amount From should be always less than the Last Deposit Amount To', 'error').then((ok) => {
        let depostAmountFilterFrom = document.getElementById('defapostAmountFilterFrom') as HTMLInputElement
        depostAmountFilterFrom.focus()
      })
    }
    return valid
  }
  const errorCampaignPlayerFetch = () => {
    setLoading(false)
    swal('Failed', 'Problem connecting to the server, Please refresh', 'error')
  }

  const setRetentionPlayerListRequest = (result: any) => {
    let resultData = Object.assign({}, result.data)
    setLoading(false)
    setRetentionPlayerList([])
    if (resultData.recordCount === 0) {
      gridApi.showNoRowsOverlay()
      return;
    }
    gridApi.hideOverlay()
    setRetentionPlayerList(resultData.campaignUploadPlayerList)
    dispatch(campaign.actions.campaignRetentionPlayers(resultData.campaignUploadPlayerList))
    setRecordCount(resultData.recordCount)
  }
  const setCampiangPlayerListFilter = (pageSize: number, currentPage: number, sortColumn: string, sortOrder: string, request: any) => {
    request.sortColumn = sortColumn === '' ? 'RegistrationDate' : sortColumn
    request.sortOrder = sortOrder === '' ? 'Desc' : sortOrder
    request.lastDepositDateFrom =  filterLastDepositDate.length === 0 ? undefined : filterLastDepositDate[0]
    request.lastDepositDateTo =  filterLastDepositDate.length === 0 ? undefined : filterLastDepositDate[1]
    request.pageSize = pageSize;
    request.offsetValue =  (currentPage - 1) * pageSize
    setExportFilters(request)
  }
  const loadCampaignPlayerList = (pageSize: number, currentPage: number, sortColumn: string, sortOrder: string) => {
    setTimeout(() => {
      setLoading(true)
      const messagingHub = hubConnection.createHubConnenction();
      messagingHub
        .start()
        .then(() => {
          // CHECKING STATE CONNECTION
          if (messagingHub.state !== HubConnected) 
          {  
            errorCampaignPlayerFetch() 
            return;
          }
            // PARAMETER TO PASS ON API GATEWAY //
            const request = campaignPlayerModelRequest();

            setCampiangPlayerListFilter(pageSize , currentPage , sortColumn , sortOrder , request);
            debugger
            gridApi?.showLoadingOverlay()
            // REQUEST FIRST TO GATEWAY IF TRANSACTION WAS VALID
            getCampaignUploadPlayerList(request)
              .then((response) => {
                // IF REQUEST IS SUCCESS THEN CONSUME CALLBACK API
                if (response.status !== successResponse) {
                  messagingHub.stop()
                  swal('Failed', response.data.message, 'error')
                  gridApi.hideOverlay()
                  return;
                }
                messagingHub.on(request.queueId.toString(), (message) => {
                  // CALLBACK API
                  getCampaignUploadPlayerListResult(message.cacheId)
                    .then((result) => {
                      setRetentionPlayerListRequest(result);
                    })
                    .catch(() => {
                      setLoading(false)
                    })
                  messagingHub.off(request.queueId.toString())
                  messagingHub.stop()
                })

                setTimeout(() => {
                  if (messagingHub.state === HubConnected) {
                    messagingHub.stop()
                    setLoading(false)
                    gridApi.hideOverlay()
                  }
                }, 30000)
              })
              .catch(() => {
                messagingHub.stop()
                gridApi.hideOverlay()
                errorCampaignPlayerFetch()
              })
        })
        .catch(() => {
          errorCampaignPlayerFetch()
        })
    }, 1000)
  }
  return (
    <FormGroupContainer>
      <div className='col-lg-4'>
        <label>Player ID</label>
        <input
          type='text'
          className={'form-control form-control-sm '}
          onChange={(e: any) => setFilterPlayerId(e.target.value)}
          value={filterPlayerId}
          aria-label='Campaign Id'
        />
      </div>

      <div className='col-lg-4'>
        <label>Status</label>
        <Select
          isMulti
          size='small'
          style={{width: '100%'}}
          options={CommonLookups('playerStatuses')}
          onChange={onChangeStatus}
          value={filterStatus}
        />
      </div>
      <div className='col-lg-4'>
        <label>Last Deposit Date</label>
        <DateRangePicker
          ranges={lastDepositDateCustomCalendar}
          format='yyyy-MM-dd HH:mm'
          onChange={onChangeLastDepositDate}
          style={{width: '100%'}}
          value={filterLastDepositDate}
          disabled={false}
          preventOverflow={true}
        />
      </div>
      <div className='col-lg-4'>
        <label>Username</label>
        <input
          type='text'
          className={'form-control form-control-sm '}
          onChange={(e: any) => setFilterUsername(e.target.value)}
          value={filterUsername}
          aria-label='Campaign Id'
        />
      </div>
      <div className='col-lg-4'>
        <label>Brand</label>
        <Select isMulti size='small' style={{width: '100%'}} options={CommonLookups('brands')} onChange={onChangeBrand} value={filterBrand} />
      </div>
      <div className='col-lg-4'>
        <label>Last Bet Date</label>
        <DateRangePicker
          format='yyyy-MM-dd HH:mm'
          onChange={onChangeLastDepositDate}
          style={{width: '100%'}}
          value={filterLastBetDate}
          disabled={true}
        />
      </div>
      <div className='col-lg-4'>
        <label>Last Deposit Amount</label>
        <InputGroup>
          <span className='mt-2' style={{marginRight: '5px'}}>
            From
          </span>
          <div className='col-sm-4 col-lg-4'>
            <input
              type='number'
              max={999998}
              placeholder={'0-999,998'}
              min={0}
              maxLength={6}
              className={'form-control form-control-sm '}
              onChange={(e: any) => onChangeLastDepositAmountFrom(e)}
              value={filterDepositAmountFrom}
              aria-label='Last Deposit Amount'
              id='depostAmountFilterFrom'
            />
          </div>
          <span className='mt-2' style={{marginRight: '5px', marginLeft: '5px'}}>
            To
          </span>
          <div className='col-sm-4 col-lg-4'>
            <input
              type='number'
              max={999999}
              maxLength={6}
              placeholder={'1-999,999'}
              min={1}
              className={'form-control form-control-sm '}
              onChange={(e: any) => onChangeLastDepositAmountTo(e)}
              value={filterDepositAmountTo}
              aria-label='Last Deposit Amount'
            />
          </div>
        </InputGroup>
      </div>
      <div className='col-lg-4'>
        <label>Bonus Abuser </label>
        <Select
          size='small'
          style={{width: '100%'}}
          isClearable={true}
          options={bonusAbuserList}
          onChange={onChangeBonusAbuser}
          value={filterBonusAbuser}
        />
      </div>

      <div className='col-lg-4'>
        <label>Last Bet Product</label>
        <Select
          size='small'
          style={{width: '100%'}}
          options={CommonLookups('brands')}
          onChange={onChangeBrand}
          isClearable={true}
          value={filterLastBetProduct}
          isDisabled={true}
        />
      </div>

      <div className='col-lg-12 mt-3'></div>
      <ButtonsContainer>
        <MlabButton
          access={true}
          label='Search'
          style={ElementStyle.primary}
          type={'submit'}
          weight={'solid'}
          size={'sm'}
          loading={loading}
          loadingTitle={'Please wait...'}
          disabled={loading}
          onClick={onSearch}
        />

        <button type='button' className='btn btn-secondary btn-sm me-2' onClick={onClickClearFilter}>
          Clear
        </button>
      </ButtonsContainer>

      <ButtonsContainer>
        <MlabButton
          access={userAccess.includes(USER_CLAIMS.EditCampaignWrite) === true || userAccess.includes(USER_CLAIMS.EditCampaignRead) === true}
          label='Add Players'
          style={ElementStyle.primary}
          type={'button'}
          weight={'solid'}
          size={'sm'}
          loadingTitle={'Please wait...'}
          disabled={isViewMode || (campaignStatusIdState != CampaignStatusEnum.Draft && campaignStatusIdState != CampaignStatusEnum.Onhold && campaignStatusIdState != CampaignStatusEnum.Activate)}
          onClick={onAddPlayer}
        />

        <MlabButton
          access={userAccess.includes(USER_CLAIMS.EditCampaignWrite) === true || userAccess.includes(USER_CLAIMS.EditCampaignRead) === true}
          label='Remove Players'
          style={ElementStyle.primary}
          type={'button'}
          weight={'solid'}
          size={'sm'}
          loading={removeBtnLoading}
          loadingTitle={'Please wait...'}
          disabled={
            removeBtnLoading ||
            isViewMode ||
            (campaignStatusIdState != CampaignStatusEnum.Draft && campaignStatusIdState != CampaignStatusEnum.Onhold && campaignStatusIdState != CampaignStatusEnum.Activate)
          }
          onClick={onRemovePlayer}
        />
        <MlabButton
          access={userAccess.includes(USER_CLAIMS.EditCampaignWrite) === true || userAccess.includes(USER_CLAIMS.EditCampaignRead) === true}
          label='Export'
          style={ElementStyle.primary}
          type={'button'}
          weight={'solid'}
          size={'sm'}
          loading={exportBtnLoading}
          loadingTitle={'Please wait...'}
          disabled={exportBtnLoading || isViewMode}
          onClick={onExportToCSVCampaignPlayer}
        />
      </ButtonsContainer>
      <div className='ag-theme-quartz mt-5' style={{height: 510, width: '100%', marginBottom: '50px', padding: '0 0 28px 0'}}>
        <AgGridReact
          rowData={retentionPlayerList}
          rowStyle={{userSelect: 'text'}}
          defaultColDef={{
            sortable: true,
            resizable: true,
          }}
          onGridReady={onGridReady}
          rowBuffer={0}
          components={{
            tableLoader: tableLoader,
          }}
          rowSelection={'multiple'}
          //enableRangeSelection={true} //deprecated in AgGridReactver.32.0.0
          animateRows={true}
          pagination={false}
          paginationPageSize={pageSize}
          columnDefs={columnDefs}
          onSelectionChanged={onSelectionChanged}
          onSortChanged={(e) => onSort(e)}
        />
        <DefaultGridPagination
          recordCount={recordCount}
          currentPage={currentPage}
          pageSize={pageSize}
          onClickFirst={onClickFirst}
          onClickPrevious={onClickPrevious}
          onClickNext={onClickNext}
          onClickLast={onClickLast}
          onPageSizeChanged={(e: any) => onPageSizeChanged(e)}
        />
      </div>
      <CampaignUploadPlayerModal
        tempCampaignGuid={campaignGuid}
        onHide={() => setModalShow(false)}
        showForm={modalShow}
        closeModal={() => onCloseModal()}
        successUpload={() => successUpload()}
      />
    </FormGroupContainer>
  )
}
