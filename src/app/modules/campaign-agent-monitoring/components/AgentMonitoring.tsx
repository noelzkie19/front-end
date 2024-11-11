import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { AgGridReact } from 'ag-grid-react'
import { useFormik } from 'formik'
import { Guid } from 'guid-typescript'
import React, { useEffect, useState } from 'react'
import { shallowEqual, useSelector } from 'react-redux'
import Select from 'react-select'
import swal from 'sweetalert'
import { RootState } from '../../../../setup'
import { ContentContainer, FormContainer, FormGroupContainer, FormHeader, MainContainer, MlabButton } from '../../../custom-components'
import DefaultGridPagination from '../../../custom-components/grid-pagination/DefaultGridPagination'
import { USER_CLAIMS } from '../../user-management/components/constants/UserClaims'
import DailyReport from './modals/DailyReport'
import { HasMultipleStatus, IsDisabledAgentStatusBasedOnCampaignStatus, IsDisabledDailyReportBasedOnCampaignStatus } from '../utils/helpers'
import { ElementStyle } from '../../../constants/Constants'
import useAgentMonitoringConstants from '../constants/useAgentMonitoringConstants'
import { useAgentMonitoringHooks } from '../hooks/useAgentMonitoringHooks'
import gridOverlayTemplate, { gridOverlayNoRowsTemplate } from '../../../common-template/gridTemplates'
//Services
import { GetAutoTaggingNameList, GetCampaignAgentList } from '../../campaign-agent-monitoring/redux/AgentMonitoringService'
import { getAllCampaignsList } from '../../campaign-agent-workspace/redux/AgentWorkspaceService'
import { getCallListValidationFilter } from '../../campaign-call-list-validation/redux/CallListValidationService'
import { getAllCampaignType } from '../../campaign-management/redux/CampaignManagementService'

//Models
import { faIdCard } from '@fortawesome/free-solid-svg-icons'
import { LookupModel } from '../../../common/model/LookupModel'
import useConstant from '../../../constants/useConstant'
import { formatDate } from '../../../custom-functions/helper/dateHelper'
import { CallValidationFilterRequestModel } from '../../campaign-call-list-validation/models/request/CallValidationFilterRequestModel'
import { AgentListRequestModel } from '../models/request/AgentListRequestModel'
import { UpsertAgentStatusModel } from '../models/request/AgentStatusRequestModel'
import { TaggedNameRequestModel } from '../models/request/TaggedNameRequestModel'
import { AgentResponseModel } from '../models/response/AgentResponseModel'
import { DailyReportResponseModel } from '../models/response/DailyReportResponseModel'

interface DropdownOption {
  value: string
  label: string
}

const initialValues = {
  defaultItem: '',
}

const AgentMonitoring: React.FC = () => {
  //Redux
  const userAccessId = useSelector<RootState>(({ auth }) => auth.userId, shallowEqual) as number
  const userAccess = useSelector<RootState>(({ auth }) => auth.access, shallowEqual) as string
  const { successResponse, SwalConfirmMessage, SwalFailedMessage, SwalServerErrorMessage } = useConstant()
  const { AGENT_MONITORING_MESSAGES } = useAgentMonitoringConstants();
  const { toggleAgentStatus, isSuccess, isLoading } = useAgentMonitoringHooks();

  // -----------------------------------------------------------------
  // STATES
  // -----------------------------------------------------------------
  const [showDailyReportModal, setShowDailyReportModal] = useState(false)
  const [campaignAgentId, setCampaignAgentId] = useState<number>(0)
  const [campaignAgentName, setCampaignAgentName] = useState<string>('')
  const [selectedCampaignIds, setSelectedCampaignIds] = useState('')
  const [selectedAutoTagIds, setSelectedAutoTagIds] = useState('')
  const [selectedAgentNames, setSelectedAgentNames] = useState('')
  const [selectedCampaignTypeId, setSelectedCampaignTypeId] = useState('')

  const [gridApi, setGridApi] = useState<any>()
  const [gridColumnApi, setGridColumnApi] = useState(null)
  const [loading, setLoading] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [tableLoading, setTableLoading] = useState<boolean>(false)
  const [rowData, setRowData] = useState<Array<AgentResponseModel>>([])
  const [selectedRows, setSelectedRows] = useState<any>([]);

  const [pageSize, setPageSize] = useState<number>(10)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [recordCount, setRecordCount] = useState<number>(0)
  const [sortOrder, setSortOrder] = useState<string>('ASC')
  const [sortColumn, setSortColumn] = useState<string>('CampaignName')

  //Dropdown
  const [autoTagIds, setAutoTagIds] = useState<Array<DropdownOption>>([])
  const [agentNames, setAgentNames] = useState<Array<DropdownOption>>([])
  const [campaignNames, setCampaignNames] = useState<Array<DropdownOption>>([])
  const [selectedDailyReportDetail, setSelectedDailyReportDetail] = useState<Array<DailyReportResponseModel>>([])
  const [campaignTypeOptions, setCampaignTypeOptions] = useState<Array<LookupModel>>([])

  const onGridReady = (params: any) => {
    setGridApi(params.api)
    setGridColumnApi(params.columnApi)
    params.api.sizeColumnsToFit()
  }

  const onClear = () => {
    setSelectedRows([])
    setRowData([])
    setCampaignNames([])
    setAutoTagIds([])
    setAgentNames([])
    setSelectedCampaignTypeId('')
    setSelectedCampaignIds('')
    setSelectedAutoTagIds('')
    setSelectedAgentNames('')
  }

  useEffect(() => {
    if (!isLoaded) {
      getAllCampaignType().then((response) => {
        if (response.status === successResponse) {
          setCampaignTypeOptions(response.data)
        }
      })
      setIsLoaded(true)
    }
  },[])

  useEffect(() => {
    if (isSuccess) {
      loadAgentMonitoringList(pageSize, currentPage, sortColumn, sortOrder)
      setSelectedRows([])
      if (gridApi) {
        let rowData = gridApi.getSelectedRows(); 
        const updatedRowData = rowData.filter((row : any) => !selectedRows.includes(row));
        gridApi.setRowData(updatedRowData);
      }
    };
    return () => { }
  }, [isSuccess])

  useEffect(() => {
    if (gridApi) {
      const existingSelection = gridApi.getSelectedRows();
      const result =  existingSelection.filter((item1: any) =>
        rowData?.find((item2: any) => item2.campaignAgentId === item1.campaignAgentId)
      )
      setSelectedRows(result)
    }
    setTableLoading(false)
    return () => { }
  }, [rowData])

  // -----------------------------------------------------------------
  //  API CALL METHODS
  // -----------------------------------------------------------------
  const _getAgentNames = (Id: number) => {
    const request: CallValidationFilterRequestModel = {
      campaignId: Id,
    }

    setAgentNames([])

    getCallListValidationFilter(request).then((response) => {
      if (response.status === successResponse) {
        const resultFilters = response.data
        if (resultFilters?.agentNames) {
          //Agent names
          let agentNameOptions = Array<DropdownOption>()

          resultFilters.agentNames.forEach((item) => {
            let dropdownOption: DropdownOption = {
              value: item.agentId.toString(),
              label: item.agentName,
            }
            agentNameOptions.push(dropdownOption)
          })
          setAgentNames(agentNameOptions)
        }
      } else {
        swal(SwalFailedMessage.title, AGENT_MONITORING_MESSAGES.Call_List_Validation_Error, SwalFailedMessage.icon)
      }
    })
  }

  const _getAutoTaggingNameList = (Id: number) => {
    setAutoTagIds([])
    const requestTagged: TaggedNameRequestModel = {
      campaignId: Id,
    }
    GetAutoTaggingNameList(requestTagged)
      .then((response) => {
        if (response.status === successResponse) {
          //Agent names
          let autoTagNameOptions = Array<DropdownOption>()

          response.data.forEach((item) => {
            let dropdownOption: DropdownOption = {
              value: item.autoTaggedId.toString(),
              label: item.autoTaggedName,
            }
            autoTagNameOptions.push(dropdownOption)
          })
          setAutoTagIds(autoTagNameOptions)
        }
      })
      .catch((ex) => {
        console.log(ex)
      })
  }

  // -----------------------------------------------------------------
  //  EVENT METHODS
  // -----------------------------------------------------------------
  function GetSelectedCommonOptions(selectedOptions: string): string {
    let results: string = ''
    results = Object.assign(Array<LookupModel>(), selectedOptions)
      .map((el) => el.value)
      .join(',')
    return results
  }

  function onChangeSelectedCampaigTypeId(val: string) {
    setSelectedCampaignTypeId(val)
    setCampaignNames([])
    setSelectedCampaignIds('')
    setSelectedAgentNames('')
    setSelectedAutoTagIds('')

    let campaignType = JSON.parse(JSON.stringify(val))
    getAllCampaignsList(parseInt(campaignType.value)).then((response) => {
      if (response.status === successResponse) {
        if (response.data.length > 0) {
          let campaignOptions = Array<DropdownOption>()
          response.data.forEach((item) => {
            let dropdownOption: DropdownOption = {
              value: item.value!,
              label: item.label,
            }
            campaignOptions.push(dropdownOption)
          })
          setCampaignNames(campaignOptions)
        }
      }
    })
  }

  function onChangeSelectedCampaignIds(val: any) {
    let passedValue: DropdownOption = val
    setSelectedCampaignIds(val)
    setSelectedAgentNames('')
    setSelectedAutoTagIds('')

    _getAgentNames(parseInt(passedValue.value))
    _getAutoTaggingNameList(parseInt(passedValue.value))
  }

  function onChangeSelectedAutoTagIds(val: any) {
    setSelectedAutoTagIds(val)
    setSelectedAgentNames('')
  }

  function onChangeSelectedAgentnames(val: string) {
    setSelectedAgentNames(val)
  }

  const toggleDailyReportModal = (id: number, agentName: string) => {
    setCampaignAgentId(id)
    setCampaignAgentName(agentName)
    setShowDailyReportModal(!showDailyReportModal)
    loadAgentMonitoringList(pageSize, currentPage, sortColumn, sortOrder)
  }

  const onChangeStatus = (agentId: number, currentStatus: boolean, isBundle: boolean) => {
    let current = currentStatus === true ? 'offline' : 'online'

    swal({
      title: 'Change Status',
      text: 'This will change the status of  the agent to ' + current + '. Please confirm',
      icon: 'warning',
      buttons: {
        cancel: {
          text: SwalConfirmMessage.btnNo,
          value: null,
          visible: true,
        },
        confirm: {
          text: SwalConfirmMessage.btnYes,
          value: true,
          visible: true,
        },
      },
      dangerMode: true,
    }).then((successOnchange) => {
      if (successOnchange) {
        const agentList: UpsertAgentStatusModel[] = !isBundle ? [
          {
            campaignAgentId: agentId,
          }
        ] : selectedRows.map((data: any) => {
          return {
            campaignAgentId: data.campaignAgentId,
          }
        });
        toggleAgentStatus(agentList, Guid.create().toString(), userAccessId.toString())
      } else {
        let currentRows = Object.assign(new Array<AgentResponseModel>(), rowData)
        currentRows.forEach((row) => {
          if (row.campaignAgentId === agentId) {
            row.status = currentStatus
          }
        })
        setRowData(currentRows)
      }
    })
  }

  // -----------------------------------------------------------------
  // FORMIK FORM POST
  // -----------------------------------------------------------------
  const formik = useFormik({
    initialValues,
    onSubmit: async (values, { setStatus, setSubmitting, resetForm }) => {  
      setTableLoading(true)    
      setLoading(true)
      setTimeout(() => {
        loadAgentMonitoringList(pageSize, 1, sortColumn, sortOrder)
        setLoading(false)
      }, 1000)
    },
  })

  async function loadAgentMonitoringList(pageSize: number, currentPage: number, sortColumn: string, sortOrder: string) {
    let campaign = JSON.parse(JSON.stringify(selectedCampaignIds))
    let campaignIdSelected = parseInt(campaign.value)
    let campaignType = JSON.parse(JSON.stringify(selectedCampaignTypeId))
    let campaignTypeIdSelected = parseInt(campaignType.value)

    if (isNaN(campaignTypeIdSelected) || isNaN(campaignIdSelected)) {
      if (isNaN(campaignTypeIdSelected)) swal(SwalFailedMessage.title, AGENT_MONITORING_MESSAGES.Select_Campaign_Type, SwalFailedMessage.icon);
      if (isNaN(campaignIdSelected)) swal(SwalFailedMessage.title, AGENT_MONITORING_MESSAGES.Select_Campaign_Name, SwalFailedMessage.icon);
      return
    }

    let tagId = JSON.parse(JSON.stringify(selectedAutoTagIds))
    let offSetValue = (currentPage - 1) * pageSize

    const request: AgentListRequestModel = {
      campaignId: campaignIdSelected === 0 ? undefined : campaignIdSelected,
      autoTaggedId: tagId.value === '0' ? undefined : parseInt(tagId.value),
      agentName: undefined,
      pageSize: pageSize,
      offsetValue: offSetValue < 0 ? 0 : offSetValue,
      sortColumn: sortColumn,
      sortOrder: sortOrder,
      agentId: selectedAgentNames === '' || selectedAgentNames.length === 0 ? undefined : GetSelectedCommonOptions(selectedAgentNames),
    }

    // THIS WILL BE ON AG GRID DATA
    await GetCampaignAgentList(request)
      .then((response) => {
        setTableLoading(false)
        if (response.status === successResponse) {
          let agentList = response.data
          if (agentList) {
            setRecordCount(agentList.recordCount)
            setRowData(agentList.agents)
            setSelectedDailyReportDetail(agentList.dailyReports)
          }
          setLoading(false)
        }
      })
      .catch((ex) => {
        setLoading(false)
        swal(SwalServerErrorMessage.title, SwalServerErrorMessage.textError, SwalServerErrorMessage.icon)
      })
  }

  const tableLoader = (data: any) => {
    return (
      <div className='ag-custom-loading-cell' style={{ paddingLeft: '10px', lineHeight: '25px' }}>
        <i className='fas fa-spinner fa-pulse'></i> <span> {data.loadingMessage}</span>
      </div>
    )
  }

  // -----------------------------------------------------------------
  // CUSTOM PAGINATION METHODS
  // -----------------------------------------------------------------
  const onPageSizeChanged = () => {
    let value: string = (document.getElementById('page-size') as HTMLInputElement).value
    setPageSize(Number(value))
    setCurrentPage(1)

    if (rowData != undefined && rowData.length > 0) {
      loadAgentMonitoringList(Number(value), 1, sortColumn, sortOrder)
    }
    setRowData([])
    setSelectedRows([])
    setTableLoading(true)
  }

  const onClickFirst = () => {
    if (currentPage > 1) {
      setCurrentPage(1)
      loadAgentMonitoringList(pageSize, 1, sortColumn, sortOrder)
      setRowData([])
      setSelectedRows([])
      setTableLoading(true)
    }
  }

  const onClickPrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
      loadAgentMonitoringList(pageSize, currentPage - 1, sortColumn, sortOrder)
      setRowData([])
      setSelectedRows([])
      setTableLoading(true)
    }
  }

  const onClickNext = () => {
    if (totalPage() > currentPage) {
      setCurrentPage(currentPage + 1)
      loadAgentMonitoringList(pageSize, currentPage + 1, sortColumn, sortOrder)
      setRowData([])
      setSelectedRows([])
      setTableLoading(true)
    }
  }

  const onClickLast = () => {
    if (totalPage() > currentPage) {
      setCurrentPage(totalPage())
      loadAgentMonitoringList(pageSize, totalPage(), sortColumn, sortOrder)
      setRowData([])
      setSelectedRows([])
      setTableLoading(true)
    }
  }

  const totalPage = () => {
    return Math.ceil(recordCount / pageSize) | 0
  }

  const onSelectionChanged = () => {
    if (gridApi) {
      const selectedRows = gridApi.getSelectedRows();
      setSelectedRows(selectedRows);
    }
  };

  const onSort = (e: any) => {
    setCurrentPage(1)
    if (rowData != undefined && rowData.length > 0) {
      let sortDetail = e.api.getSortModel()
      if (sortDetail[0] != undefined) {
        setSortColumn(sortDetail[0]?.colId)
        setSortOrder(sortDetail[0]?.sort)
        loadAgentMonitoringList(pageSize, 1, sortDetail[0]?.colId, sortDetail[0]?.sort)
      } else {
        loadAgentMonitoringList(pageSize, 1, sortColumn, sortOrder)
      }
    }
  }

  // -----------------------------------------------------------------
  // Renderer
  // -----------------------------------------------------------------

  const agentStatusRenderer = (params: any) => {
    return (
      <>
        {params ? (
          <div className='form-check form-switch form-check-custom form-check-solid d-flex justify-content-center flex-shrink-0'>
            <input
              className='form-check-input'
              type='checkbox'
              value=''
              defaultChecked={params.data.status}
              onClick={() => onChangeStatus(params.data.campaignAgentId, params.data.status, false)}
              disabled={!userAccess.includes(USER_CLAIMS.UpdateAgentStatusWrite) || IsDisabledAgentStatusBasedOnCampaignStatus(params.data.campaignStatus) || selectedRows.length > 1}
            />
          </div>
        ) : null}
      </>
    )
  }

  const actionColumnRenderer = (params: any) => {
    return (
      <>
        {
          IsDisabledDailyReportBasedOnCampaignStatus(params.data.campaignStatus) || !userAccess.includes(USER_CLAIMS.UpdateAgentStatusWrite)  || selectedRows.length > 1 ?
            (
              <div className='d-flex justify-content-left flex-shrink-0 mt-1'>
                <h2>
                  <FontAwesomeIcon icon={faIdCard} color='#ccc' />
                </h2>
              </div>
            ) : (
              <div className='d-flex justify-content-left flex-shrink-0 mt-1'>
                <h2>
                  <button
                    className='align-middle fw-bolder bg-transparent text-primary'
                    onClick={() => toggleDailyReportModal(params.data.campaignAgentId, params.data.agentName)}
                  >
                    <FontAwesomeIcon icon={faIdCard} />
                  </button>
                </h2>
              </div>
            )}
      </>
    )
  }

  const lastTaggedDateAndTimeRenderer = (params: any) => {
    return (
      <>{formatDate(params.data.lastTaggedDateAndTime)}</>
    )
  }

  const disabledCheckBoxRenderer = (params: any) => {
    return (
      <> {(!userAccess.includes(USER_CLAIMS.UpdateAgentStatusWrite) || IsDisabledAgentStatusBasedOnCampaignStatus(params.data.campaignStatus)) && <input style={{ position: 'absolute', left: '1.5rem' }} type="checkbox" disabled />}</>
    )
  }
  // -----------------------------------------------------------------
  // TABLE CONTENT
  // -----------------------------------------------------------------
  const columnDefs: any = [
    {
      headerName: '',
      width: 50,
      minWidth: 50,
      headerCheckboxSelection: true,
      headerCheckboxSelectionFilteredOnly: true,
      checkboxSelection: true,
      pinned: 'left',
      lockPinned: true,
      cellClass: 'locked-pinned',
      wrapText: true,
      isPinned: true,
      cellRenderer: disabledCheckBoxRenderer
    },
    { headerName: 'Campaign Type', field: 'campaignType' },
    { headerName: 'Campaign Name', field: 'campaignName' },
    { headerName: 'Agent Name', field: 'agentName' },
    {
      headerName: 'Status',
      field: 'status',
      cellRenderer: agentStatusRenderer
    },
    { headerName: 'Tagged Count for the Campaign Period', field: 'taggedCountForTheCampaignPeriod' },
    { headerName: 'Tagged Count Today', field: 'taggedCountToday' },
    {
      headerName: 'Last Tagged Date And Time',
      field: 'lastTaggedDateAndTime',
      cellRenderer: lastTaggedDateAndTimeRenderer,
    },
    { headerName: 'Auto Tagging Configuration Name', field: 'autoTaggingName' },
    {
      headerName: 'Action',
      cellRenderer: actionColumnRenderer
    },
  ]

  const handleRowSelectable = (params: any) => {
    return !IsDisabledAgentStatusBasedOnCampaignStatus(params.data.campaignStatus) && userAccess.includes(USER_CLAIMS.UpdateAgentStatusWrite)
  }

  return (
    <>
      <FormContainer onSubmit={formik.handleSubmit}>
        <MainContainer>
          <FormHeader headerLabel={'Agent Monitoring'} />
          <ContentContainer>
            <FormGroupContainer>
              <div className='col-lg-3'>
                <span className='form-label-sm required'>Campaign Type</span>
                <div className='col-lg-12 pt-2'>
                  <Select
                    menuPlacement='auto'
                    menuPosition='fixed'
                    size='small'
                    style={{ width: '100%' }}
                    options={campaignTypeOptions}
                    onChange={onChangeSelectedCampaigTypeId}
                    value={selectedCampaignTypeId}
                  />
                </div>
              </div>
              <div className='col-lg-3'>
                <span className='form-label-sm required'>Campaign Name</span>
                <div className='col-lg-12 pt-2'>
                  <Select
                    menuPlacement='auto'
                    menuPosition='fixed'
                    size='small'
                    style={{ width: '100%' }}
                    options={campaignNames}
                    onChange={onChangeSelectedCampaignIds}
                    value={selectedCampaignIds}
                  />
                </div>
              </div>

              <div className='col-lg-3'>
                <span className='form-label-sm'>Auto Tagging Configuration</span>
                <div className='col-lg-12 pt-2'>
                  <Select
                    menuPlacement='auto'
                    menuPosition='fixed'
                    size='small'
                    style={{ width: '100%' }}
                    options={autoTagIds}
                    onChange={onChangeSelectedAutoTagIds}
                    value={selectedAutoTagIds}
                    isClearable={true}
                  />
                </div>
              </div>

              <div className='col-lg-3'>
                <span className='form-label-sm'>Agent Name</span>
                <div className='col-lg-12 pt-2'>
                  <Select
                    menuPlacement='auto'
                    menuPosition='fixed'
                    isMulti
                    size='small'
                    style={{ width: '100%' }}
                    options={agentNames}
                    onChange={onChangeSelectedAgentnames}
                    value={selectedAgentNames}
                  />
                </div>
              </div>

            </FormGroupContainer>

            <div className='d-flex  pt-5 bd-highlight'>
              <button type='submit' className='btn btn-primary btn-sm me-2'>
                {!loading && <span className='indicator-label'>Search</span>}
                {loading && (
                  <span className='indicator-progress' style={{ display: 'block' }}>
                    Please wait...
                    <div className='spinner-border spinner-border-sm align-middle ms-2'></div>
                  </span>
                )}
              </button>
              <button type='button' className='btn btn-secondary btn-sm me-2' onClick={onClear}>
                Clear
              </button>
              {userAccess.includes(USER_CLAIMS.UpdateAgentStatusWrite) && selectedRows.length > 1 && !HasMultipleStatus(selectedRows) && <MlabButton
                access={true}
                label='Change Status'
                style={ElementStyle.primary}
                type={'button'}
                weight={'solid'}
                size={'sm'}
                loading={isLoading}
                loadingTitle={'Please wait...'}
                disabled={false}
                onClick={() => onChangeStatus(0, selectedRows[0].status, true)}
              />}
            </div>
            {selectedRows.length > 1 && <div className='d-flex  pt-5 bd-highlight'>
              <div className='fst-italic' style={{
                color: HasMultipleStatus(selectedRows) ? '#FF0000' : '#ccc'
              }}>*{selectedRows.length ?? 0} item(s) selected. {HasMultipleStatus(selectedRows) && AGENT_MONITORING_MESSAGES.Multiple_Statuses}</div>
            </div>}
            <div className='ag-theme-quartz mt-5' style={{ height: '40rem', width: '100%', marginBottom: '50px', padding: '0 0 28px 0' }}>
              <AgGridReact
                rowData={rowData}
                defaultColDef={{
                  sortable: true,
                  resizable: true,
                }}
                components={{
                  tableLoader: tableLoader,
                }}
                overlayNoRowsTemplate={tableLoading ? gridOverlayTemplate : gridOverlayNoRowsTemplate}
                onGridReady={onGridReady}
                rowBuffer={0}
                //enableRangeSelection={true} //deprecated in AgGridReactv32.0.0
                pagination={false}
                paginationPageSize={pageSize}
                columnDefs={columnDefs}
                onSelectionChanged={onSelectionChanged}
                onSortChanged={(e) => onSort(e)}
                rowSelection={'multiple'}
                isRowSelectable={handleRowSelectable}
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
          </ContentContainer>
        </MainContainer>
      </FormContainer>
      <DailyReport
        modal={showDailyReportModal}
        toggle={toggleDailyReportModal}
        campaignAgentId={campaignAgentId}
        campaignAgentName={campaignAgentName}
        selectedDailyReportDetail={selectedDailyReportDetail}
        selectedCampaignIds={selectedCampaignIds}
      />
    </>
  )
}
export default AgentMonitoring
