import React, {useEffect, useRef, useState} from 'react'
import {shallowEqual, useSelector} from 'react-redux'
import Select from 'react-select'
import {RootState} from '../../../../../setup'

import {useFormik} from 'formik'
import {USER_CLAIMS} from '../../../user-management/components/constants/UserClaims'

import "datatables.net"
import "datatables.net-dt"
import '../../../../../_metronic/assets/css/datatables.min.css'

import {
    ButtonsContainer,
    ContentContainer,
    DefaultButton,
    FormContainer,
    FormGroupContainer,
    FormHeader,
    MainContainer,
    SearchTextInput
} from '../../../../custom-components'

import {AgGridReact} from 'ag-grid-react'
import swal from 'sweetalert'
import gridOverlayTemplate from '../../../../common-template/gridTemplates'
import noRowResultTemplate from '../../../../common-template/noRowResultTemplate'
import {LookupModel} from '../../../../common/model'
import DefaultDateRangePicker from '../../../../custom-components/date-range-pickers/DefaultDateRangePicker'
import DefaultGridPagination from '../../../../custom-components/grid-pagination/DefaultGridPagination'
import {useBrands, useCurrencies} from '../../../../custom-functions'
import CommonLookups from '../../../../custom-functions/CommonLookups'
import useVIPLevels from '../../../../custom-functions/useVIPLevels'
import {PlayerFilterRequestModel} from '../../models/PlayerFilterRequestModel'
import {PlayerModel} from '../../models/PlayerModel'
import {GetPlayerList} from '../../redux/PlayerManagementService'
import ImportPlayersModal from './ImportPlayersModal'
import { ColDef, ColGroupDef } from 'ag-grid-community';

const initialValues = {
    playerId: '',
    username: '',
    marketingSource: ''
}

const PlayerList: React.FC = () => {

    // GET REDUX STORE
    const userAccess = useSelector<RootState>(({ auth }) => auth.access, shallowEqual) as string
    const userAccessId = useSelector<RootState>(({auth}) => auth.userId, shallowEqual) as number;
	
    // STATES WITH MODELS
    const [modalShow, setModalShow] = useState<boolean>(false)
    const [loading, setLoading] = useState(false)
    const [playerList, setPlayerList] = useState<Array<PlayerModel>>([])
    const [pageSize, setPageSize] = useState<number>(10)
    const [currentPage, setCurrentPage] = useState<number>(1)
    const [recordCount, setRecordCount] = useState<number>(0)
    const [sortOrder, setSortOrder] = useState<string>('')
    const [sortColumn, setSortColumn] = useState<string>('')

    // filters
    const [filterRegistrationDate, setFilterRegistrationDate] = useState<any>()
    const [filterRegistrationStartDate, setFilterRegistrationStartDate] = useState<string>('')
    const [filterRegistrationEndDate, setFilterRegistrationEndDate] = useState<string>('')
    const [filterPlayerId, setFilterPlayerId] = useState<string>('')
    const [filterUsername, setFilterUsername] = useState<string>('')
    const [filterMarketingSource, setFilterMarketingSource] = useState<string>('')

    const [filterBrands, setFilterBrands] = useState<Array<LookupModel>>([])
    const [filterVIPLevels, setFilterVIPLevels] = useState<Array<LookupModel>>([])
    const [filterMarketingChannels, setFilterMarketingChannels] = useState<Array<LookupModel>>([])
    const [filterRiskLevels, setFilterRiskLevels] = useState<Array<LookupModel>>([])

    const [filterStatus, setFilterStatus] = useState<LookupModel | null>()
    const [filterInternalAccount, setFilterInternalAccount] = useState<LookupModel | null>()
    const [filterCurrency, setFilterCurrency] = useState<LookupModel | null>()
    const gridRef: any = useRef();
    const brandOptions = useBrands(userAccessId);
    const currencyOptions = useCurrencies(userAccessId);
    const vipLevelOptions = useVIPLevels(userAccessId);

    useEffect(() => {

        // if(playerList.length === 0){
        //     gridRef.current.api.showNoRowsOverlay();
        // }

        setTimeout(() => {
            if(loading)
                gridRef.current.api.showLoadingOverlay();
            else{
                if(playerList.length > 0){
                    gridRef.current.api.hideOverlay();
                }
            }
        }, 10)

    }, [loading])    
    

    // -----------------------------------------------------------------
    // TABLE CONTENT + ((currentPage-1) * pageSize)
    // -----------------------------------------------------------------
    const customComparator = (valueA: string, valueB: string) => {
        return valueA.toLowerCase().localeCompare(valueB.toLowerCase());
      };

    const columnDefs : (ColDef<PlayerModel> | ColGroupDef<PlayerModel>)[] = [
        { headerName: "No", valueGetter: ("node.rowIndex + 1 + " + (currentPage - 1) * pageSize).toString(), sortable: false, width: 60 },
        {
            headerName: 'Player ID',
            field: 'playerId',
            width: 100,
            cellRenderer: (params: any) =>
                <>
                    { userAccess.includes(USER_CLAIMS.PlayerProfileRead)?
                        <a href={'player/profile/' + params.data.playerId + '/' + params.data.brand} target='_blank'>{params.data.playerId}</a>
                        :
                        params.data.playerId
                    } 
                </>
        },
        { headerName: 'Username', field: 'username', comparator: customComparator },
        { headerName: 'Brand', field: 'brand', comparator: customComparator },
        { headerName: 'Currency', field: 'currency', comparator: customComparator },
        { headerName: 'VIP Level', field: 'vipLevel', comparator: customComparator },
        { headerName: 'Risk Level', field: 'riskLevelName', comparator: customComparator },
        { headerName: 'Registration Date', field: 'registrationDate' },
        { headerName: 'Status', field: 'status' },
        { headerName: 'Marketing Channel', field: 'marketingChannel', comparator: customComparator },
        { headerName: 'Marketing Source', field: 'marketingSource', comparator: customComparator },
        { headerName: 'Referrer URL', field: 'referrerURL', comparator: customComparator  },
        { headerName: 'Referred By', field: 'referredBy', comparator: customComparator  },
        {
            headerName: 'Internal Account',
            field: 'internalAccount',
            width: 100,
            cellRenderer: (params: any) =>
                <>
                    { params.data.internalAccount === true?
                        "Yes"
                        :
                        "No"
                    } 
                </>
        },
    ]

    // -----------------------------------------------------------------
    // CUSTOM PAGINATION METHODS
    // -----------------------------------------------------------------

    const onPageSizeChanged = () => {

        let value: string = (document.getElementById('page-size') as HTMLInputElement).value;
        setPageSize(Number(value));
        setCurrentPage(1)

        if (playerList !== undefined && playerList.length > 0) {
            loadPlayerList(Number(value), 1, sortColumn, sortOrder, filterPlayerId, filterUsername, filterMarketingSource)
        }
    };

    const onClickFirst = () => {
        if (currentPage > 1) {
            setCurrentPage(1);
            loadPlayerList(pageSize, 1, sortColumn, sortOrder, filterPlayerId, filterUsername, filterMarketingSource)
        }
    }

    const onClickPrevious = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
            loadPlayerList(pageSize, currentPage - 1, sortColumn, sortOrder, filterPlayerId, filterUsername, filterMarketingSource)
        }
    }

    const onClickNext = () => {
        if (totalPage() > currentPage) {
            setCurrentPage(currentPage + 1);
            loadPlayerList(pageSize, currentPage + 1, sortColumn, sortOrder, filterPlayerId, filterUsername, filterMarketingSource)
        }
    }

    const onClickLast = () => {        
        if (totalPage() > currentPage) {
            setCurrentPage(totalPage());
            loadPlayerList(pageSize, totalPage(), sortColumn, sortOrder, filterPlayerId, filterUsername, filterMarketingSource)
        }
    }

    const totalPage = () => {
        return Math.ceil(recordCount / pageSize) | 0
    }

    const onSort = (e: any) => {

        setCurrentPage(1)

        if (playerList !== undefined && playerList.length > 0) {
            let sortDetail = e.api.getSortModel();
            if (sortDetail[0] !== undefined) {
                setSortColumn(sortDetail[0]?.colId)
                setSortOrder(sortDetail[0]?.sort)
                loadPlayerList(pageSize, 1, sortDetail[0]?.colId, sortDetail[0]?.sort, filterPlayerId, filterUsername, filterMarketingSource)
            }
            else {
                setSortColumn('')
                setSortOrder('')
                loadPlayerList(pageSize, 1, '', '', filterPlayerId, filterUsername, filterMarketingSource)
            }
        }
    }

    // METHODS
    async function loadPlayerList(
        _pageSize: number,
        _currentPage: number,
        _sortColumn: string,
        _sortOrder: string,
        playerId: string,
        username: string,
        marketingSource: string) {    
            
        setLoading(true)
        const request: PlayerFilterRequestModel = {
            pageSize: _pageSize,
            offsetValue: (_currentPage - 1) * _pageSize,
            startDate: filterRegistrationStartDate === '' ? undefined : filterRegistrationStartDate,
            endDate: filterRegistrationEndDate === '' ? undefined : filterRegistrationEndDate,
            brands: filterBrands,
            statusId: filterStatus === undefined || filterStatus?.value === '' ? undefined : Number(filterStatus?.value),
            internalAccount: filterInternalAccount === undefined ? undefined : filterInternalAccount?.value === 'true',
            playerId: playerId === undefined || playerId === "" ? undefined : playerId,
            currencyId: filterCurrency === undefined || filterCurrency?.value === '' ? undefined : Number(filterCurrency?.value),
            marketingChannels: filterMarketingChannels,
            riskLevels: filterRiskLevels,
            username: username === '' ? undefined : username,
            vipLevels: filterVIPLevels,
            marketingSource: marketingSource === '' ? undefined : marketingSource,
            sortColumn: _sortColumn,
            sortOrder: _sortOrder,
            userId: userAccessId
        }
        
      
        await GetPlayerList(request)
            .then((response) => {
                setLoading(true)
                if (response.status === 200) {
                    let players = response.data?.players;

                    setRecordCount(response.data.recordCount)
                    setPlayerList(players)
                    setLoading(false)
                }
            }).catch(() => {
                setLoading(false)
            })

    }

    function onChangeBrand(val: Array<LookupModel>) {
        setFilterBrands(val);
    }
    function onChangeStatus(val: LookupModel) {
        setFilterStatus(val);
    }
    function onChangeInternalAccount(val: LookupModel) {        
        setFilterInternalAccount(val);
    }
    function onChangeCurrency(val: LookupModel) {
        setFilterCurrency(val);
    }
    function onChangeMarketingChannel(val: Array<LookupModel>) {
        setFilterMarketingChannels(val);
    }
    function onChangeRiskLevel(val: Array<LookupModel>) {
        setFilterRiskLevels(val);
    }
    function onChangeVIPLevel(val: Array<LookupModel>) {
        setFilterVIPLevels(val);
    }
    function onChangeRegistrationDate(val: any) {

        if (val !== undefined) {
            setFilterRegistrationDate(val)
            setFilterRegistrationStartDate(val[0]);
            setFilterRegistrationEndDate(val[1]);
        }
    }

    const onClickClearFilter = () => {

        setFilterRegistrationDate('')
        setFilterBrands([])
        setFilterStatus(null)
        setFilterInternalAccount(null)
        setFilterCurrency(null)
        setFilterMarketingChannels([])
        setFilterRiskLevels([])
        setFilterVIPLevels([])
        setPlayerList([])

        setRecordCount(0)
        setCurrentPage(1)

        formik.setFieldValue('playerId', initialValues.playerId);
        formik.setFieldValue('username', initialValues.username);
        formik.setFieldValue('marketingSource', initialValues.marketingSource);

    }

    function hasCriteria(playerId: string, username: string, marketingSource: string) {
        
       return !((filterRegistrationDate == null || filterRegistrationDate == '')
            && filterBrands.length === 0
            && filterStatus == null
            && filterInternalAccount == null
            && filterCurrency == null
            && filterMarketingChannels.length === 0
            && filterRiskLevels.length === 0
            && filterVIPLevels.length === 0
            && (playerId === null || playerId === '')
            && (username === null || username === '')
            && (marketingSource == null || marketingSource === ''))
         
    }

    // -----------------------------------------------------------------
    // FORMIK FORM POST
    // -----------------------------------------------------------------
    const formik = useFormik({
        initialValues,
        onSubmit: async (values, { setStatus, setSubmitting, resetForm }) => {
            
            setFilterPlayerId(values.playerId)
            setFilterUsername(values.username)
            setFilterMarketingSource(values.marketingSource)

            //validation
            if(!hasCriteria(values.playerId, values.username, values.marketingSource))
            {  
                swal("Failed", "Unable to proceed, please fill up the search filter", "error");
                return;          
            }

            setLoading(true)
            setCurrentPage(1)

            loadPlayerList(pageSize, 1,
                sortColumn,
                sortOrder,
                values.playerId,
                values.username,
                values.marketingSource)
        },
    })

    // -----------------------------------------------------------------
    // MOUNTED
    // -----------------------------------------------------------------

    const onGridReady = (params: any) => {
        params.api.autoSizeAllColumns();
    };

    // -----------------------------------------------------------------
    // RETURN
    // -----------------------------------------------------------------
    return (

        <FormContainer onSubmit={formik.handleSubmit}>

            <MainContainer>
                <FormHeader headerLabel={'Player Search'} />
                <ContentContainer>
                    <FormGroupContainer>
                        <div className='col-lg-3'>
                            <label>Registration Date</label>
                            <DefaultDateRangePicker
                                format='yyyy-MM-dd HH:mm:ss'
                                maxDays={180}
                                onChange={onChangeRegistrationDate}
                                value={filterRegistrationDate}
                            />
                        </div>
                        <div className='col-lg-3'>
                            <label>Brand</label>
                            <Select
                                isMulti
                                size="small"
                                style={{ width: '100%' }}
                                options={brandOptions}
                                onChange={onChangeBrand}
                                value={filterBrands}
                                isClearable={true}
                            />
                        </div>
                        <div className='col-lg-3'>
                            <label>Status</label>
                            <Select
                                size="small"
                                style={{ width: '100%' }}
                                options={CommonLookups('playerStatuses')}
                                onChange={onChangeStatus}
                                value={filterStatus}
                                isClearable={true}
                            />
                        </div>
                        <div className='col-lg-3'>
                            <label>Internal Account</label>
                            <Select
                                size="small"
                                style={{ width: '100%' }}
                                options={CommonLookups('internalAccounts')}
                                onChange={onChangeInternalAccount}
                                value={filterInternalAccount}
                                isClearable={true}
                            />
                        </div>

                        <div className='col-lg-12 mt-3'></div>

                        <div className='col-lg-3'>
                            <label>Player ID</label>
                            <SearchTextInput ariaLabel={'Player Id'}  {...formik.getFieldProps('playerId')} />
                        </div>
                        <div className='col-lg-3'>
                            <label>Currency</label>
                            <Select
                                size="small"
                                style={{ width: '100%' }}
                                options={currencyOptions}
                                onChange={onChangeCurrency}
                                value={filterCurrency}
                                isClearable={true}
                            />
                        </div>
                        <div className='col-lg-3'>
                            <label>Marketing Channel</label>
                            <Select
                                isMulti
                                size="small"
                                style={{ width: '100%' }}
                                options={CommonLookups('marketingChannels')}
                                onChange={onChangeMarketingChannel}
                                value={filterMarketingChannels}
                                isClearable={true}
                            />
                        </div>
                        <div className='col-lg-3'>
                            <label>Risk Level</label>
                            <Select
                                isMulti
                                size="small"
                                style={{ width: '100%' }}
                                options={CommonLookups('riskLevels')}
                                onChange={onChangeRiskLevel}
                                value={filterRiskLevels}
                                isClearable={true}
                            />
                        </div>

                        <div className='col-lg-12 mt-3'></div>

                        <div className='col-lg-3'>
                            <label>Username</label>
                            <SearchTextInput ariaLabel={'Username'}  {...formik.getFieldProps('username')} />
                        </div>
                        <div className='col-lg-3'>
                            <label>VIP Level</label>
                            <Select
                                isMulti
                                size="small"
                                style={{ width: '100%' }}
                                options={vipLevelOptions}
                                onChange={onChangeVIPLevel}
                                value={filterVIPLevels}
                                isClearable={true}
                            />
                        </div>
                        <div className='col-lg-3'>
                            <label>Marketing Source</label>
                            <SearchTextInput ariaLabel={'Marketing Source'}  {...formik.getFieldProps('marketingSource')} />
                        </div>

                        <div className='col-lg-12 mt-3'></div>

                    </FormGroupContainer>

                    <FormGroupContainer>

                        <ButtonsContainer>
                            <button type='submit' className="btn btn-primary btn-sm me-2" disabled={formik.isSubmitting}>
                                {!loading && <span className='indicator-label'>Search</span>}
                                {loading && (
                                    <span className='indicator-progress' style={{ display: 'block' }}>
                                    Please wait...
                                    <span className='spinner-border spinner-border-sm align-middle ms-2'></span>
                                    </span>
                                )}
                            </button>
                            <button type='button' className="btn btn-secondary btn-sm me-2" onClick={onClickClearFilter}>Clear</button>
                            <DefaultButton access={userAccess.includes(USER_CLAIMS.ImportPlayerListWrite)} title={'Import Player'} onClick={() => setModalShow(true)} />

                            {/* <ManageThresholdModal /> */}
                        </ButtonsContainer>



                        <div className="ag-theme-quartz mt-5" style={{ height: 510, width: '100%', marginBottom: '50px', padding: '0 0 28px 0' }}>

                                <AgGridReact   
                                    ref={gridRef}                                 
                                    rowData={playerList}
                                    defaultColDef={{
                                        sortable: true,
                                        resizable: true,
                                      }}
                                    onGridReady={onGridReady}
                                    rowBuffer={0}
                                    //enableRangeSelection={true} //deprecated in AgGridReactver.32.0.0
                                    pagination={false}
                                    paginationPageSize={pageSize}
                                    columnDefs={columnDefs}       
                                    onSortChanged={(e) => onSort(e)}  
                                    overlayLoadingTemplate={gridOverlayTemplate}   
                                    overlayNoRowsTemplate={noRowResultTemplate}
                                    animateRows={true}         
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

                {/* modal for add topic*/}
                <ImportPlayersModal showForm={modalShow} closeModal={() => setModalShow(false)} />
                {/* end modal for add topic */}

            </MainContainer>

        </FormContainer>
    )
}

export default PlayerList
