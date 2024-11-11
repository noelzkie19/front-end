import Select from 'react-select'
import {useFormik} from 'formik'
import React, {useEffect, useState} from 'react'
import {
  ButtonsContainer,
  ContentContainer,
  DefaultButton,
  FormContainer,
  FormGroupContainer,
  FormHeader,
  MainContainer,
  MlabButton,
  SearchTextInput,
  TableIconButton,
} from '../../../custom-components'
import swal from 'sweetalert';
import CommonLookups from '../../../custom-functions/CommonLookups'
import {useSelector, shallowEqual,useDispatch} from 'react-redux'
import {RootState} from '../../../../setup'
import {USER_CLAIMS} from '../../user-management/components/constants/UserClaims'
import {AgGridReact} from 'ag-grid-react'
import DefaultGridPagination from '../../../custom-components/grid-pagination/DefaultGridPagination'
import {CampaignListModel} from '../models/response/CampaignListModel'
import {useHistory} from 'react-router-dom'
import { CampaignListRequestModel } from '../models/request/CampaignListRequestModel'
import { getAllCampaign, getAllCampaignBySearchFilter, getAllCampaignCustomEventSettingName, getAllCampaignStatus, getAllCampaignType, getCampaignList, getCampaignListResult, getCampaignLookUp, getEligibilityType,getSearchFilter } from '../redux/CampaignManagementService'
import { CurrencyRowsMocks } from '../../system/_mocks_/CurrencyRowsMocks'
import * as hubConnection from '../../../../setup/hub/MessagingHub'
import { Guid } from 'guid-typescript'
import * as campaign from '../redux/CampaignManagementRedux'
import { CampaignFilterResponseModel } from '../models/response/CampaignFilterResponseModel';
import moment from 'moment';
import { LookupModel } from '../../../common/model';
import { Link } from 'react-router-dom';
import { ButtonGroup, InputGroup } from 'react-bootstrap-v5';
import { faClone, faPencilAlt } from '@fortawesome/free-solid-svg-icons';
import { CampaignModel, CampaignModelFactory } from '../models/request/CampaignModel';
import { ElementStyle, HttpStatusCodeEnum } from '../../../constants/Constants';
import { DateRangePicker } from 'rsuite';
import { CampaignLookUps } from '../models/options/CampaignLookUps';
import { getTaggingUsers } from '../../campaign-setting/redux/AutoTaggingService';
import { UserSelectionModel } from '../../campaign-setting/setting-auto-tagging/models/UserSelectionModel';
import { ColDef, ColGroupDef } from 'ag-grid-community';


export const CampaignList = () => {
  const history = useHistory()
  // GET REDUX STORE
  const userAccess = useSelector<RootState>(({auth}) => auth.access, shallowEqual) as string
  const userAccessId = useSelector<RootState>(({ auth }) => auth.userId, shallowEqual) as number
  const campaignStatusesState = useSelector<RootState>(({ campaign }) => campaign.getAllCampaignStatus, shallowEqual) as Array<LookupModel>
  const campaignNameSearchFilterType = useSelector<RootState>(({ campaign }) => campaign.getSearchFilter, shallowEqual) as Array<LookupModel>
  const campaignType = useSelector<RootState>(({campaign}) => campaign.getCampaignType,shallowEqual) as LookupModel[]
  const campaignListState = useSelector<RootState>(({campaign}) => campaign.getCampaignList,shallowEqual) as CampaignListModel[]
  let campaignState = useSelector<RootState>(({campaign}) => campaign.campaign,shallowEqual) as CampaignModel
  
  const dispatch = useDispatch()

  const [filterCampaignCreatedDate, setFilterCampaignCreatedDate] = useState<any>()
  const [filterCampaignCreateDateFrom, setFilterCampaignCreateDateFrom] = useState<string>('')
  const [filterCampaignCreateDateTo, setFilterCampaignCreateDateTo] = useState<string>('')
  const [filterBrand, setFilterBrand] = useState<Array<LookupModel>>([])
  const [filterCurrency, setFilterCurrency] = useState<Array<LookupModel>>([])
  const [filterCampaignStatus, setFilterCampaignStatus] = useState<Array<LookupModel>>([])
  const [campaignDropdownList, setCampaignDropdownList] = useState<Array<LookupModel>>([])
  const [campaignTypeList, setCampaignTypeList] = useState<Array<LookupModel>>([])
  const [campaignTypeStatusList, setCampaignTypeStatusList] = useState<Array<LookupModel>>([])
 
  const [pageSize, setPageSize] = useState<number>(10)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [recordCount, setRecordCount] = useState<number>(0)
  const [sortOrder, setSortOrder] = useState<string>('desc')
  const [sortColumn, setSortColumn] = useState<string>('createdDate')
  const [loading, setLoading] = useState(false)
  const [loadingCampaignNames, setLoadingCampaignNames] = useState(false)

  const [showWarningMessage, setShowWarningMessage] = useState(false)
  const [filterCampaignName, setFilterCampaignName] = useState<Array<LookupModel>>([])
  const [filterCampaignId, setFilterCampaignId] = useState('')
  const [filterCampaignType, setFilterCampaignType] =  useState<LookupModel | null>()
  const [gridApi, setGridApi] = useState<any>();
  const [selectedCampaignNameFilterType, setSelectedCampaignNameFilterType] = useState<LookupModel | null>()

//COLUMN GRID
  const customComparator = (valueA: string, valueB: string) => {
    return valueA.toLowerCase().localeCompare(valueB.toLowerCase());
  };
  const columnDefs : (ColDef<CampaignListModel> | ColGroupDef<CampaignListModel>)[] =[
    { headerName: "No", valueGetter: ("node.rowIndex + 1 + " + (currentPage - 1) * pageSize).toString(), sortable: false, width: 60 },
    {headerName: 'Campaign Name', field: 'campaignName', minWidth: 250, comparator: customComparator,
    cellRenderer:(params: any) => 
    <>
      { 
        userAccess.includes(USER_CLAIMS.ViewCampaignRead)?
        <Link to= {`/campaign-management/campaign/view/${params.data.campaignId}`} target="_blank">{params.data.campaignName}</Link>
        :
        params?.data?.campaignName ?? params.data.campaignName
      } 
      </>
    },
    {headerName: 'Campaign Status', minWidth: 200, comparator: customComparator, cellRenderer: (params: any) => params.data.campaignStatusName },
    {headerName: 'Campaign Type', field: 'campaignTypeName', minWidth: 200, comparator: customComparator },
    {headerName: 'Brand', field: 'brandName', minWidth: 200, comparator: customComparator },
    {headerName: 'Currency', minWidth: 200, comparator: customComparator, cellRenderer: (params: any) => params.data.currencyName},
    {headerName: 'Campaign Start Date', field: 'campaignStartDate', minWidth: 200, comparator: customComparator,
    cellRenderer: (params: any) => {
      return params.data.campaignStartDate ? moment(new Date(params.data.campaignStartDate)).format('MM/DD/YYYY HH:mm') : '';
    }},
    {headerName: 'Campaign End Date', field: 'campaignEndDate', minWidth: 182,
    cellRenderer: (params: any) => {
      return params.data.campaignEndDate ?moment(new Date(params.data.campaignEndDate)).format('MM/DD/YYYY HH:mm') : '';
    }},
    {headerName: 'Campaign Report End Date', field: 'campaignReportEndDate', minWidth: 182,
    cellRenderer: (params: any) => {
      return params.data.campaignEndDate ?moment(new Date(params.data.campaignReportEndDate)).format('MM/DD/YYYY HH:mm') : '';
    }}
    ,    
    {headerName: 'Campaign Created Date', field: 'createdDate', minWidth: 200,
    cellRenderer: (params: any) => {
      return params.data.createdDate ?moment(params.data.createdDate).format('MM/DD/YYYY HH:mm') : '';
    }},
    {headerName: 'Campaign Created By', field: 'createdByName', minWidth: 200, comparator: customComparator},
    {headerName: 'Action', minWidth: 130, hide: !userAccess.includes(USER_CLAIMS.CreateCampaignWrite),
    cellRenderer:(params: any) => 
      <>
        {params.data != 0 ?
          <ButtonGroup aria-label="Basic example">
            <div className='d-flex justify-content-center flex-shrink-0 shadow-none'>
              <div className="me-4">
                <Link to= {`/campaign-management/campaign/edit/${params.data.campaignId}`} target="_blank">
                <TableIconButton access={userAccess.includes(USER_CLAIMS.EditCampaignWrite) && (params.data.campaignStatusName != 'Inactive' && params.data.campaignStatusName != 'Completed' ) } faIcon={faPencilAlt} toolTipText={'Edit'} onClick={() => null } />  
                </Link>  
              </div>
              <div className="me-4">
              <Link to= {`/campaign-management/campaign/clone/${params.data.campaignId}`} target="_blank">
              <TableIconButton access={userAccess.includes(USER_CLAIMS.CreateCampaignWrite)} faIcon={faClone} toolTipText={'Clone'} onClick={() => null } />  
              </Link>  
              </div>
            </div>
          </ButtonGroup>
          : null}
      </>
    }
  ]
  const tableLoader = (data: any) => {
    return (
        <div
            className="ag-custom-loading-cell"
            style={{ paddingLeft: '10px', lineHeight: '25px' }}
        >
            <i className="fas fa-spinner fa-pulse"></i>{' '}
            <span> {data.loadingMessage}</span>
        </div>
    )
}
//USE EFFECT
  useEffect(() => {
    loadCampaignLookUps()
    getCampaignType();
    getCampaignStatus();
    dispatch(campaign.actions.getCampaignList([]));
    return () => {
      dispatch(campaign.actions.clearCampaignState());
      dispatch(campaign.actions.getCampaignList([]));
    }
  }, [])

 useEffect(() => {
   if(filterCampaignType != undefined || selectedCampaignNameFilterType != undefined){
    setCampaignDropdownList([])
    setFilterCampaignName([])
    loadAllCampaign();
   }
  }, [filterCampaignType,selectedCampaignNameFilterType])
  
  const loadCampaignLookUps = () => {
    getCampaignLookUp().then((response) => {
      if (response.status === HttpStatusCodeEnum.Ok) {
        let resultData = Object.assign({}, response.data as CampaignLookUps)
        dispatch(campaign.actions.getAllCampaignGoalParameterPointSetting(resultData.goalParameterPointSetting))
        dispatch(campaign.actions.getAllCampaignGoalParameterValueSetting(resultData.goalParameterValueSetting))
        dispatch(campaign.actions.getAllAutoTaggingSetting(resultData.autoTaggingSettting))
      }
    })

    getTaggingUsers(21).then((response) => {
      if (response.status === HttpStatusCodeEnum.Ok) {
        let resultData = Object.assign(new Array<UserSelectionModel>(), response.data);
        dispatch(campaign.actions.getAllUserAgentForTagging([...resultData]))
      }
    });

    getAllCampaignStatus().then((response) => {
      if (response.status === HttpStatusCodeEnum.Ok) {
        dispatch(campaign.actions.getAllCampaignStatus([...response.data]))
        setCampaignTypeStatusList(response.data)
      }
    })

    getEligibilityType().then((response) => {
      if (response.status === HttpStatusCodeEnum.Ok) {
        dispatch(campaign.actions.getEligibilityType([...response.data]))
      }
    })

    getSearchFilter().then((response) => {
      if (response.status === HttpStatusCodeEnum.Ok) {
        dispatch(campaign.actions.getSearchFilter([...response.data]))
        let campaignSearchfilterType = response.data.find(a => a.label == "All");
        setSelectedCampaignNameFilterType(campaignSearchfilterType);
      }
    })

    getAllCampaignCustomEventSettingName().then((response) => {
        if (response.status === HttpStatusCodeEnum.Ok) {
          dispatch(campaign.actions.getAllCampaignCustomEvent(response.data))
        } else {
          swal('Failed', 'Error getting Message Type List', 'error')
        }
    })
  }

  function onChangeCreatedDate(val: any) {
    if (val != undefined && val.length > 0) {
      setFilterCampaignCreatedDate(val)
      setFilterCampaignCreateDateFrom(val[0])
      setFilterCampaignCreateDateTo(val[1])
    } 
    else{
      setFilterCampaignCreatedDate('')
      setFilterCampaignCreateDateFrom('')
      setFilterCampaignCreateDateTo('')
    }
  }

  function onChangeBrand(val: Array<LookupModel>) {
    setFilterBrand(val)
  }

  function onChangeCurrency(val: Array<LookupModel>) {
    setFilterCurrency(val)
  }
  function onChangeStatus(val: Array<LookupModel>) {
    setFilterCampaignStatus(val)
  }  

  function onChangeCampaignName(val: Array<LookupModel>) {
    setFilterCampaignName(val)
  }  
  
  function onChangeCampaignNameFilterType(val: LookupModel) {
    setSelectedCampaignNameFilterType(val)
  }  
  function onChangeCampaignType(val: LookupModel) {
    if(val != undefined){
      setFilterCampaignType(val)
    } 
    else{
      setFilterCampaignType(val)
      setCampaignDropdownList([])
    }
  }
  
  const validateCampaignFilter = () => {
    if ((filterCampaignId === '' || filterCampaignId === undefined)
      && (filterCampaignCreateDateFrom === '' || filterCampaignCreateDateFrom === undefined)
      && (filterCampaignCreateDateTo === '' || filterCampaignCreateDateTo == undefined)
      && (filterCampaignName.length == 0)
      && (filterCampaignStatus.length == 0)
      && (filterCampaignType == undefined)
      && (filterBrand.length == 0)
      && (filterCurrency.length == 0)
    )
    {
      return false;
    }

    return true;
  }

 const getCampaignType = () => {
    if(campaignType != undefined && campaignType.length == 0){
      getAllCampaignType().then((response) => {
        if (response.status === HttpStatusCodeEnum.Ok) {
          setCampaignTypeList(response.data);
          dispatch(campaign.actions.getCampaignType(response.data))
        } 
      })
    }
    else
    setCampaignTypeList(campaignType);
  }

  const loadAllCampaign = () => {
    let _campaignNameFilterType =   (selectedCampaignNameFilterType?.value != undefined ? parseInt(selectedCampaignNameFilterType?.value) : null) 
    let _campaignType = filterCampaignType?.value != undefined ? parseInt(filterCampaignType?.value.toString()) : 0;
    if(_campaignNameFilterType == null || _campaignType == 0) return false;
    setLoadingCampaignNames(true);
    getAllCampaignBySearchFilter('CampaignName',_campaignNameFilterType,_campaignType).then((response) => {
      if (response.status === HttpStatusCodeEnum.Ok) {
        setLoadingCampaignNames(false)
        let resultData = Object.assign(new Array<LookupModel>(),response.data);
        setCampaignDropdownList(resultData)
        dispatch(campaign.actions.getCampaignName([...resultData]))
      }
      else {
        swal('Failed', 'Error getting Message Type List', 'error')
      }
    });
  }

  const getCampaignStatus = () => {
    // Get Field Type
    if (campaignStatusesState.length > 0) {
      setCampaignTypeStatusList(campaignStatusesState)
    }
  }
  const initialValues = {
    campaignId: '',
  }

  const handleCreateCampaign = () => {
    campaignState =  CampaignModelFactory();
    dispatch(campaign.actions.campaign({...campaignState}))
  }
  
  const onGridReady = (params: any) => {
    setGridApi(params.api);
    params.api.sizeColumnsToFit()
  }

  const onSort = (e: any) => {
    if(campaignListState != undefined && campaignListState.length > 0){
        let sortDetail = e.api.getSortModel();
        if(sortDetail[0] != undefined)
        {
            setSortColumn(sortDetail[0]?.colId)
            setSortOrder(sortDetail[0]?.sort)
            loadCampaignList(pageSize, currentPage, sortDetail[0]?.colId, sortDetail[0]?.sort, filterCampaignId)
        }
        else
        {
            setSortColumn('')
            setSortOrder('')
            loadCampaignList(pageSize, currentPage,'', '', filterCampaignId)
        }
    }
  }
  
  const onClickFirst = () => {
    if (currentPage > 1) {
      setCurrentPage(1)
      loadCampaignList(pageSize, 1, sortColumn, sortOrder, filterCampaignId)
    }
  }

  const onClickPrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
      loadCampaignList(pageSize, currentPage-1, sortColumn, sortOrder, filterCampaignId)
    }
  }

  const onClickNext = () => {
    if (totalPage() > currentPage) {
      setCurrentPage(currentPage + 1)
      loadCampaignList(pageSize, currentPage+1, sortColumn, sortOrder, filterCampaignId)
    }
  }

  const onClickLast = () => {
    if (totalPage() > currentPage) {
      setCurrentPage(totalPage())
      loadCampaignList(pageSize, totalPage(), sortColumn, sortOrder, filterCampaignId)
    }
  }

  const totalPage = () => {
    return Math.ceil(recordCount / pageSize) | 0
  }
  
  const onPageSizeChanged = () => {
    let value: string = (document.getElementById('page-size') as HTMLInputElement).value
    setPageSize(Number(value));
    setCurrentPage(1)
    if(campaignListState != undefined && campaignListState.length > 0){
      loadCampaignList(Number(value), 1, sortColumn, sortOrder, filterCampaignId)
     }
  }
  
  async function loadCampaignList(
    pageSize: number, 
    currentPage : number, 
    sortColumn: string, 
    sortOrder: string,
    campaignId: string, 
    ){
    if(!validateCampaignFilter()){
      swal('Failed', 'Unable to proceed, please fill up the search filter', 'error')
      return;
    }
    setLoading(true);

    setTimeout(() => {
    const messagingHub = hubConnection.createHubConnenction();
    messagingHub
        .start()
        .then(() => {
            // CHECKING STATE CONNECTION
            if (messagingHub.state === 'Connected') { 
              // PARAMETER TO PASS ON API GATEWAY //
              const request: CampaignListRequestModel = {
                campaignId: campaignId == ''? undefined : Number(campaignId),
                campaignCreatedDateFrom:  filterCampaignCreateDateFrom == "" ? undefined : moment(new Date(filterCampaignCreateDateFrom)).format('MM/DD/YYYY HH:mm')  ,
                campaignCreatedDateTo: filterCampaignCreateDateTo == "" ? undefined :  moment(new Date(filterCampaignCreateDateTo)).format('MM/DD/YYYY HH:mm') , //filterCampaignCreateDateTo.toLocaleString(),
                campaignName: filterCampaignName == undefined ? "" :Object.assign(Array<LookupModel>(), filterCampaignName).map((el:any) => el.label).join(','),
                campaignStatusIds: filterCampaignStatus == undefined ? "" : Object.assign(Array<LookupModel>(), filterCampaignStatus).map((el:any) => el.value).join(','),
                campaignTypeIds:  filterCampaignType?.value != undefined ?  (filterCampaignType?.value.toString()) : undefined, //filterCampaignType == undefined ? undefined : Object.assign(Array<LookupModel>(), filterCampaignType).map((el:any) => el.value).join(','),
                brandIds:  filterBrand == undefined ? "" : Object.assign(Array<LookupModel>(), filterBrand).map((el:any) => el.value).join(','), 
                currencyIds: filterCurrency == undefined? undefined : Object.assign(Array<LookupModel>(), filterCurrency).map((el:any) => el.value).join(','),
                pageSize: pageSize,
                offsetValue: (currentPage - 1) * pageSize,
                sortColumn: sortColumn,
                sortOrder: sortOrder,
                userId: userAccessId.toString(),
                queueId: Guid.create().toString(),
            }
                gridApi.showLoadingOverlay();
                // REQUEST FIRST TO GATEWAY IF TRANSACTION WAS VALID
                getCampaignList(request)
                .then((response) => {
                    // IF REQUEST IS SUCCESS THEN CONSUME CALLBACK API
                    if (response.status === HttpStatusCodeEnum.Ok) {
                        messagingHub.on(request.queueId.toString(), message => {
                            // CALLBACK API
                            getCampaignListResult(message.cacheId)
                            .then((result) => {
                                let resultData = Object.assign({},result.data as CampaignFilterResponseModel)
                                setLoading(false)
                                if(resultData.recordCount > 0)
                                  gridApi.hideOverlay();
                                else
                                  gridApi.showNoRowsOverlay()

                                if (resultData.recordCount > 1000) {
																	setShowWarningMessage(true);
																	setRecordCount(1000);
																} else {
																	setRecordCount(resultData.recordCount);
																}
                                dispatch(campaign.actions.getCampaignList(resultData.campaignList))
                            })
                            .catch(() => {
                                setLoading(false)
                            })
                            messagingHub.off(request.queueId.toString());
                            messagingHub.stop();
                        });

                        setTimeout(() => {
                            if (messagingHub.state === 'Connected') {
                                messagingHub.stop();
                                setLoading(false);
                                gridApi.hideOverlay();
                            }
                        }, 30000)

                    } else {
                      if (response.status == HttpStatusCodeEnum.Conflict){
                        messagingHub.stop();
                        swal("Failed", response.data.message, "Error");
                        gridApi.hideOverlay();
                      }
                      else {
                        messagingHub.stop();
                        swal("Failed", response.data.message, "error");
                        gridApi.hideOverlay();
                      }
                    }
                })
                .catch(() => {
                    messagingHub.stop();
                    setLoading(false)
                    gridApi.hideOverlay();
                     swal("Failed", "Problem in getting campaign list", "error");
                })
            
            } else {
                setLoading(false)
                swal("Failed", "Problem connecting to the server, Please refresh", "error");
            }
        })
        .catch(_err => { swal("Failed", "Problem connecting to the server, Please refresh", "error")
        setLoading(false)})
    },1000);

}

  const onClickClearFilter = () => {
    setFilterCampaignCreatedDate('')
    setFilterCampaignCreateDateFrom('')
    setFilterCampaignCreateDateTo('')
    setFilterBrand([])
    setFilterCampaignName([])
    setFilterCampaignId('')
    setFilterCurrency([])
    setFilterCampaignType(null)
    setFilterCampaignStatus([])
    setSelectedCampaignNameFilterType(campaignNameSearchFilterType[0]);
    formik.setFieldValue('campaignId', initialValues.campaignId);
  }

  const formik = useFormik({
    initialValues,
    onSubmit: async (values, {setStatus, setSubmitting, resetForm}) => {
      setCurrentPage(1)
      loadCampaignList(pageSize, 1,
                      sortColumn,
                      sortOrder,
                      filterCampaignId
                      )
    },
  })

  return (
		<FormContainer onSubmit={formik.handleSubmit}>
			<MainContainer>
				<FormHeader headerLabel={'Search Campaign'} />
				<ContentContainer>
					<FormGroupContainer>
						<div className='col-lg-3'>
							<label>Campaign Created Date</label>
							<DateRangePicker
								format='yyyy-MM-dd HH:mm'
								onChange={onChangeCreatedDate}
								style={{width: '100%'}}
								value={filterCampaignCreatedDate}
								disabled={false}
							/>
						</div>
						<div className='col-lg-3'>
							<label>Campaign Type</label>
							<Select
								isClearable={true}
								size='small'
								options={campaignTypeList}
								style={{width: '100%'}}
								onChange={onChangeCampaignType}
								value={filterCampaignType}
							/>
						</div>
						<div className='col-lg-6'>
							<label>Campaign Name</label>
							<InputGroup>
								<div className='col-sm-3'>
									<Select
										isClearable={true}
										size='small'
										options={campaignNameSearchFilterType}
										onChange={onChangeCampaignNameFilterType}
										value={selectedCampaignNameFilterType}
									/>
								</div>
								<div className='col-sm-9'>
									<Select
										isLoading={loadingCampaignNames}
										isMulti
										size='small'
										options={campaignDropdownList}
										onChange={onChangeCampaignName}
										value={filterCampaignName}
									/>
								</div>
							</InputGroup>
						</div>
						<div className='col-lg-3'>
							<label>Campaign ID</label>
							<input
								type='text'
								className={'form-control form-control-sm '}
								onChange={(e: any) => setFilterCampaignId(e.target.value)}
								value={filterCampaignId}
								aria-label='Campaign Id'
							/>
						</div>
						<div className='col-lg-3'>
							<label>Campaign Status</label>
							<Select
								isMulti
								size='small'
								style={{width: '100%'}}
								options={campaignTypeStatusList}
								onChange={onChangeStatus}
								value={filterCampaignStatus}
							/>
						</div>
						<div className='col-lg-3'>
							<label>Brand</label>
							<Select isMulti size='small' style={{width: '100%'}} options={CommonLookups('brands')} onChange={onChangeBrand} value={filterBrand} />
						</div>
						<div className='col-lg-3'>
							<label>Currency</label>
							<Select
								isMulti
								size='small'
								style={{width: '100%'}}
								options={CommonLookups('currencies')}
								onChange={onChangeCurrency}
								value={filterCurrency}
							/>
						</div>
						<div className='col-lg-12 mt-3'></div>
					</FormGroupContainer>
					<FormGroupContainer>
						<ButtonsContainer>
							<MlabButton
								access={userAccess.includes(USER_CLAIMS.SearchCampaignRead || USER_CLAIMS.SearchCampaignWrite)}
								label='Search'
								style={ElementStyle.primary}
								type={'submit'}
								weight={'solid'}
								size={'sm'}
								loading={loading}
								loadingTitle={'Please wait...'}
								disabled={loading}
							/>
							<button type='button' className='btn btn-secondary btn-sm me-2' onClick={onClickClearFilter}>
								Clear
							</button>
							<Link to={`/campaign-management/campaign/create`} target='_blank'>
								<DefaultButton
									access={userAccess.includes(USER_CLAIMS.CreateCampaignWrite)}
									title={'Create Campaign'}
									onClick={() => handleCreateCampaign()}
								/>
							</Link>
						</ButtonsContainer>
					</FormGroupContainer>
					{showWarningMessage == true ? (
						<div className='col-lg-12 mt-3'>
							<span className='badge badge-light-danger' style={{fontSize: '0.99rem !important'}}>
								Result contain more than 1000 records, please refine your search criteria
							</span>
						</div>
					) : (
						''
					)}
					<FormGroupContainer>
						<div className='ag-theme-quartz mt-5' style={{height: 510, width: '100%', marginBottom: '50px', padding: '0 0 28px 0'}}>
							<AgGridReact
								rowData={campaignListState}
								defaultColDef={{
									sortable: true,
									resizable: true,
								}}
								onGridReady={onGridReady}
								rowBuffer={0}
								components={{
									tableLoader: tableLoader,
								}}
								//enableRangeSelection={true} //deprecated in AgGridReactver.32.0.0
								animateRows={true}
								pagination={false}
								paginationPageSize={pageSize}
								columnDefs={columnDefs}
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
								onPageSizeChanged={onPageSizeChanged}
							/>
						</div>
					</FormGroupContainer>
				</ContentContainer>
			</MainContainer>
		</FormContainer>
	);
}
