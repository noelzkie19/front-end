import React, { useEffect, useState } from 'react'
import { useFormik } from 'formik'
import { disableSplashScreen } from '../../../utils/helper'
import { JSONToCSVConverter } from '../../../custom-functions'
import * as hubConnection from '../../../../setup/hub/MessagingHub'
import { Guid } from "guid-typescript";
import { RootState } from '../../../../setup'
import { useSelector, shallowEqual } from 'react-redux';
import { USER_CLAIMS } from '../../../../app/modules/user-management/components/constants/UserClaims'
import { QueueFilterModel } from '../models/QueueFilterModel'
import { QueueRqstLstModel } from '../models/QueueRqstLstModel'
import { QueueHstoryLstModel } from '../models/QueueHstoryLstModel'
import { CreatedByFilterModel } from '../models/CreatedByFilterModel'
import { QueueStatusFilterModel } from '../models/QueueStatusFilterModel'
import { QueueActionFilterModel } from '../models/QueueActionFilterModel'
import { UserFilterModel } from '../../user-management/models/UserFilterModel'
import { UserInfoListModel } from '../../user-management/models/UserInfoListModel'
import { getQueueRequest, getQueueHistory, getDistinctQueueStatus, getDistinctQueueActions } from '../redux/AdministratorService'
import { getUserList, getUserListResult } from './../../user-management/redux/UserManagementService'
import {
    ContentContainer,
    MainContainer,
    FormHeader,
    FormContainer,
    ButtonsContainer,
    DefaultButton,
    FormGroupContainer,
    MlabButton
} from '../../../custom-components'
import Select from 'react-select'
import DefaultDateRangePicker from '../../../custom-components/date-range-pickers/DefaultDateRangePicker'
import { AgGridReact } from 'ag-grid-react'
import { ElementStyle } from '../../../constants/Constants'
import DefaultGridPagination from '../../../custom-components/grid-pagination/DefaultGridPagination'
import swal from 'sweetalert'
import { LookupModel } from '../../../common/model'
import LogsCleanerModal from '../modals/LogsCleanerModal'
import { ColDef, ColGroupDef } from 'ag-grid-community'

const initialValues = {
    createdBy: '',
    createdFrom: '2021-12-20',
    createdTo: '2021-12-21',
    status: '',
    action: ''
}

interface Option {
    value: string
    label: string
}

export const MsMonitoring: React.FC = () => {

    const [loading, setLoading] = useState(false)
    const messagingHub = hubConnection.createHubConnenction()
    const userAccessId = useSelector<RootState>(({ auth }) => auth.userId, shallowEqual) as number
    const userAccess = useSelector<RootState>(({ auth }) => auth.access, shallowEqual) as string
    const [userList, setUserList] = useState<Array<UserInfoListModel>>([])
    const [showLogCleanerModal, setShowLogCleanerModal] = useState(false)

    const [queueRqstLst, setQueueRqstLst] = useState<Array<QueueRqstLstModel>>([])
    const [queueHstoryLst, setQueueHstoryLst] = useState<Array<QueueHstoryLstModel>>([])

    //dropdown model
    const [userOptionLst, setUserOptionLst] = useState<Array<Option>>([])
    const [statusOptionLst, setStatusOptionLst] = useState<Array<Option>>([])
    const [actionOptionLst, setActionOptionLst] = useState<Array<Option>>([])

    //filter model
    const [filterCreatedDate, setFilterCreatedDate] = useState<any>()
    const [filterCreatedStartDate, setfilterCreatedStartDate] = useState<any>()
    const [filterCreatedEndDate, setfilterCreatedEndDate] = useState<any>()
    const [filterUser, setFilterUser] = useState<LookupModel | null>()
    const [filterStatus, setFilterStatus] = useState<LookupModel | null>()
    const [filterAction, setFilterAction] = useState<LookupModel | null>()

    useEffect(() => {
        getUserListDropDown();
        getQueueStatusDropDown();
        getQueueActionsDropDown();
    }, [queueRqstLst, queueHstoryLst])

    const customComparator = (valueA: string, valueB: string) => {
        return valueA.toLowerCase().localeCompare(valueB.toLowerCase());
    };

    //#region Queue Request Table and Pagination
    const [rqstPageSize, setRqstPageSize] = useState<number>(10)
    const [currentRqstPage, setCurrentRqstPage] = useState<number>(1)
    const [rqstRecordCount, setRqstRecordCount] = useState<number>(0)
    const [rqstSortOrder, setRqstSortOrder] = useState<string>('')
    const [rqstSortColumn, setRqstSortColumn] = useState<string>('')

    const rqstColumnDefs : (ColDef<QueueRqstLstModel> | ColGroupDef<QueueRqstLstModel>)[] = [
        { headerName: "No", valueGetter: ("node.rowIndex + 1 + " + (currentRqstPage - 1) * rqstPageSize).toString(), sortable: false, width: 60 },
        { headerName: 'Queue Id', field: 'queueId', comparator: customComparator },
        { headerName: 'Queue Name', field: 'queueName', comparator: customComparator },
        { headerName: 'User Id', field: 'userId', comparator: customComparator },
        { headerName: 'Created By', field: 'createdByUser', comparator: customComparator },
        { headerName: 'Created Date', field: 'createdDate' },
        { headerName: 'Redis Cache Request Id', field: 'redisCacheRequestId' },
        { headerName: 'Queue Status', field: 'queueStatus', comparator: customComparator },
        { headerName: 'Updated By', field: 'updatedBy', comparator: customComparator },
        { headerName: 'Updated Date', field: 'updatedDate', comparator: customComparator },
        { headerName: 'Redis Cache Response Id', field: 'redisCacheResponseId', comparator: customComparator },
        { headerName: 'Remarks', field: 'remarks', comparator: customComparator },
        { headerName: 'Action', field: 'action', comparator: customComparator },
    ]

    const tableLoaderRqst = (data: any) => {
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

    const onGridReadyRqst = (params: any) => {
        params.api.sizeColumnsToFit();
    };

    const onSortRqst = (e: any) => {

        setCurrentRqstPage(1)

        if (queueRqstLst != undefined && queueRqstLst.length > 0) {
            let sortDetail = e.api.getSortModel();
            if (sortDetail[0] != undefined) {

                setRqstSortColumn(sortDetail[0]?.colId)
                setRqstSortOrder(sortDetail[0]?.sort)
                loadRqstQueueList(rqstPageSize, 1, sortDetail[0]?.colId, sortDetail[0]?.sort)
            }
            else {
                setRqstSortColumn('')
                setRqstSortOrder('')
                loadRqstQueueList(rqstPageSize, 1, '', '')
            }
        }
    }

    const onPageSizeChangedRqst = () => {

        let value: string = (document.getElementById('page-size') as HTMLInputElement).value;
        setRqstPageSize(Number(value));
        setCurrentRqstPage(1)

        if (queueRqstLst != undefined && queueRqstLst.length > 0) {
            loadRqstQueueList(Number(value), 1, rqstSortColumn, rqstSortOrder)
        }
    };

    const onClickFirstRqst = () => {
        if (currentRqstPage > 1) {
            setCurrentRqstPage(1);
            loadRqstQueueList(rqstPageSize, 1, rqstSortColumn, rqstSortOrder)
        }
    }

    const onClickPreviousRqst = () => {
        if (currentRqstPage > 1) {
            setCurrentRqstPage(currentRqstPage - 1);
            loadRqstQueueList(rqstPageSize, currentRqstPage - 1, rqstSortColumn, rqstSortOrder)
        }
    }

    const onClickNextRqst = () => {
        if (rqstTotalPage() > currentRqstPage) {
            setCurrentRqstPage(currentRqstPage + 1);
            loadRqstQueueList(rqstPageSize, currentRqstPage + 1, rqstSortColumn, rqstSortOrder)
        }
    }

    const onClickLastRqst = () => {
        if (rqstTotalPage() > currentRqstPage) {
            setCurrentRqstPage(rqstTotalPage());
            loadRqstQueueList(rqstPageSize, rqstTotalPage(), rqstSortColumn, rqstSortOrder)
        }
    }

    const rqstTotalPage = () => {
        let recCount = Math.ceil(rqstRecordCount / 10) * 10;
        return (recCount / rqstPageSize) | 0
    }

    //load table
    async function loadRqstQueueList(pageSize: number,
        currentRqstPage: number,
        rqstSortColumn: string,
        rqstSortOrder: string) {

        let searchRequest = assembleParameters(pageSize, currentRqstPage, rqstSortColumn, rqstSortColumn);

        await getQueueRequest(searchRequest)
            .then((response) => {
                if (response.status === 200) {
                    let resultDataRqst = Object.assign(new Array<QueueRqstLstModel>(), response.data.queueRequests)
                    setRqstRecordCount(response.data.recordCount)
                    setQueueRqstLst(resultDataRqst);
                } else {
                    swal('Failed', response.data.message, 'error')
                    disableSplashScreen()
                }
            }).catch((ex) => {
                setLoading(false)
            })
    }

    //#endregion

    //#region Queue History Table and Pagination
    const [hstoryPageSize, setHstoryPageSize] = useState<number>(10)
    const [currentHstoryPage, setCurrentHstoryPage] = useState<number>(1)
    const [hstoryRecordCount, setHstoryRecordCount] = useState<number>(0)
    const [hstorySortOrder, setHstorySortOrder] = useState<string>('')
    const [hstorySortColumn, setHstorySortColumn] = useState<string>('')

    const hstoryColumnDefs : (ColDef<QueueHstoryLstModel> | ColGroupDef<QueueHstoryLstModel>)[] = [
        { headerName: "No", valueGetter: ("node.rowIndex + 1 + " + (currentHstoryPage - 1) * hstoryPageSize).toString(), sortable: false, width: 60 },
        { headerName: 'Queue Id', field: 'queueId', comparator: customComparator },
        { headerName: 'Queue Name', field: 'queueName', comparator: customComparator },
        { headerName: 'User Id', field: 'userId', comparator: customComparator },
        { headerName: 'Created By', field: 'createdByUser', comparator: customComparator },
        { headerName: 'Created Date', field: 'createdDate' },
        { headerName: 'Queue Status', field: 'queueStatus', comparator: customComparator },
        { headerName: 'Redis Cache Id', field: 'redisCacheId', comparator: customComparator },
        { headerName: 'Action', field: 'action', comparator: customComparator },
    ]

    const tableLoaderHstory = (data: any) => {
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

    const onGridReadyHstory = (params: any) => {
        params.api.sizeColumnsToFit();
    };

    const onSortHstory = (e: any) => {

        setCurrentHstoryPage(1)

        if (queueHstoryLst != undefined && queueHstoryLst.length > 0) {
            let sortDetail = e.api.getSortModel();
            if (sortDetail[0] != undefined) {

                setHstorySortColumn(sortDetail[0]?.colId)
                setHstorySortOrder(sortDetail[0]?.sort)
                loadHstoryQueueList(hstoryPageSize, 1, sortDetail[0]?.colId, sortDetail[0]?.sort)
            }
            else {
                setRqstSortColumn('')
                setRqstSortOrder('')
                loadHstoryQueueList(hstoryPageSize, 1, '', '')
            }
        }
    }

    const onPageSizeChangedHstory = () => {

        let value: string = (document.getElementById('page-size') as HTMLInputElement).value;
        setHstoryPageSize(Number(value));
        setCurrentHstoryPage(1)

        if (queueHstoryLst != undefined && queueHstoryLst.length > 0) {
            loadHstoryQueueList(Number(value), 1, hstorySortColumn, hstorySortOrder)
        }
    };

    const onClickFirstHstory = () => {
        if (currentHstoryPage > 1) {
            setCurrentHstoryPage(1);
            loadHstoryQueueList(hstoryPageSize, 1, hstorySortColumn, hstorySortOrder)
        }
    }

    const onClickPreviousHstory = () => {
        if (currentHstoryPage > 1) {
            setCurrentHstoryPage(currentHstoryPage - 1);
            loadHstoryQueueList(hstoryPageSize, currentHstoryPage - 1, hstorySortColumn, hstorySortOrder)
        }
    }

    const onClickNextHstory = () => {
        if (hstoryTotalPage() > currentHstoryPage) {
            setCurrentHstoryPage(currentHstoryPage + 1);
            loadHstoryQueueList(hstoryPageSize, currentHstoryPage + 1, hstorySortColumn, hstorySortOrder)
        }
    }

    const onClickLastHstory = () => {
        if (hstoryTotalPage() > currentHstoryPage) {
            setCurrentHstoryPage(hstoryTotalPage());
            loadHstoryQueueList(hstoryPageSize, hstoryTotalPage(), hstorySortColumn, hstorySortOrder)
        }
    }

    const hstoryTotalPage = () => {
        let recCount = Math.ceil(hstoryRecordCount / 10) * 10;
        return (recCount / hstoryPageSize) | 0
    }

    //load table
    async function loadHstoryQueueList(pageSize: number,
        currentHstoryPage: number,
        hstorySortColumn: string,
        hstorySortOrder: string) {

        let searchRequest = assembleParameters(pageSize, currentHstoryPage, hstorySortColumn, hstorySortOrder);
        await getQueueHistory(searchRequest).then((response) => {
            if (response.status === 200) {
                let resultDataHstory = Object.assign(new Array<QueueHstoryLstModel>(), response.data.queueHistory)
                setHstoryRecordCount(response.data.recordCount)
                setQueueHstoryLst(resultDataHstory)
            } else {
                swal('Failed', response.data.message, 'error')
                disableSplashScreen()
            }
        }).catch((ex) => {
            setLoading(false)
        })
    }

    //#endregion

    //datepicker function
    function onChangeCreatedDate(val: any) {
        if (val != undefined) {
            setFilterCreatedDate(val)
            setfilterCreatedStartDate(val[0]);
            setfilterCreatedEndDate(val[1]);
        }
    }

    //dropdown
    function onChangeUser(val: LookupModel) {
        setFilterUser(val);
    }

    function onChangeStatus(val: LookupModel) {
        setFilterStatus(val);
    }

    function onChangeAction(val: LookupModel) {
        setFilterAction(val);
    }

    //clear button
    const onClickClearFilter = () => {
        setFilterUser(null)
        setFilterStatus(null)
        setFilterAction(null)
        setFilterCreatedDate('');

        setRqstRecordCount(0)
        setHstoryRecordCount(0)
        setCurrentRqstPage(1)
        setCurrentHstoryPage(1)
        setQueueHstoryLst([])
        setQueueRqstLst([])
    }

    const getUserListDropDown = () => {
        setTimeout(() => {
            messagingHub.start()
                .then(() => {
                    if (messagingHub.state === 'Connected') {
                        console.log('connected')
                        const request: UserFilterModel = {
                            email: '',
                            fullName: '',
                            statuses: '',
                            teams: '',
                            userIdRequest: 0,
                            queueId: Guid.create().toString(),
                            userId: userAccessId.toString()
                        }
                        getUserList(request).then((response) => {

                            if (response.status === 200) {

                                messagingHub.on(request.queueId.toString(), message => {
                                    getUserListResult(message.cacheId)
                                        .then((data) => {
                                            let userListData = Object.assign(new Array<CreatedByFilterModel>(), data.data);
                                            //setUserList(resultData)
                                            let userTempList = Array<Option>();
                                            //default for administrator
                                            userTempList.push({
                                                value: '0',
                                                label: 'Administrator'
                                            });
                                            userListData.map(user => {
                                                const userOption: Option = {
                                                    value: user.userId.toString(),
                                                    label: user.fullname
                                                };
                                                userTempList.push(userOption)
                                            })
                                            setUserOptionLst(userTempList.filter(
                                                (thing, i, arr) => arr.findIndex(t => t.value === thing.value) === i
                                            ));

                                        })
                                        .catch(() => {
                                        });

                                    messagingHub.off(request.queueId.toString());
                                    messagingHub.stop();
                                    setLoading(false)

                                });

                                setTimeout(() => {
                                    if (messagingHub.state === 'Connected') {
                                        messagingHub.stop();
                                        setLoading(false)
                                    }
                                }, 30000)

                            }
                            else {
                                messagingHub.stop();
                                setLoading(false)
                                swal("Failed", response.data.message, "error");
                                // dispatch(userManagement.actions.getUserList(request));
                            }

                        })
                            .catch(() => {
                                messagingHub.stop();
                                setLoading(false)
                                // swal("Failed", "Problem in getting user list", "error");
                            })
                    }
                    else {
                        setLoading(false)
                        swal("Failed", "Problem connecting to the server, Please refresh", "error");
                    }

                })
                .catch(err => console.log('Error while starting connection: ' + err))

        }, 1000)

    }

    const getQueueStatusDropDown = () => {
        setTimeout(() => {
            getDistinctQueueStatus().then((response) => {
                if (response.status === 200) {
                    let dstinctQueueStatus = Object.assign(new Array<QueueStatusFilterModel>(), response.data);
                    let queueStatTempList = Array<Option>();
                    dstinctQueueStatus.map((qStat: { id: { toString: () => any }; queueStatus: any }) => {
                        const statusOption: Option = {
                            value: qStat.id.toString(),
                            label: qStat.queueStatus,
                        };
                        queueStatTempList.push(statusOption)
                    })
                    setStatusOptionLst(queueStatTempList.filter(
                        (thing, i, arr) => arr.findIndex(t => t.value === thing.value) === i
                    ));
                }
                else {
                    //  disableSplashScreen()
                    console.log("Problem in getting queue status list")
                }
            }).catch(() => {
                    // disableSplashScreen()
                    console.log("Problem in getting queue status list")
            })
        }, 1000);
    }

    const getQueueActionsDropDown = () => {
        setTimeout(() => {
            getDistinctQueueActions().then((response) => {
                if (response.status === 200) {
                    let dstinctQueueActions = Object.assign(new Array<QueueActionFilterModel>(), response.data);
                    let queueActionTempList = Array<Option>();
                    dstinctQueueActions.map((qAct: { id: { toString: () => any }; action: any }) => {
                        const actionOption: Option = {
                            value: qAct.id.toString(),
                            label: qAct.action,
                        };
                        queueActionTempList.push(actionOption)
                    })
                    setActionOptionLst(queueActionTempList.filter(
                        (thing, i, arr) => arr.findIndex(t => t.value === thing.value) === i
                    ));
                }
                else {
                    //  disableSplashScreen()
                    console.log("Problem in getting queue status list")
                }
            }).catch(() => {
                    // disableSplashScreen()
                    console.log("Problem in getting queue status list")
            })
        }, 1000);
    }

    function assembleParameters(
        pageSize: number,
        currentPage: number,
        sortColumn: string,
        sortOrder: string) {

        const searchRequest: QueueFilterModel = {
            pageSize: pageSize,
            offsetValue: (currentPage - 1) * pageSize,
            sortColumn: sortColumn,
            sortOrder: sortOrder,
            createdBy: filterUser == undefined || filterUser.value == '' ? undefined : filterUser.value,
            createdFrom: filterCreatedStartDate == '' ? undefined : filterCreatedStartDate,
            createdTo: filterCreatedEndDate == '' ? undefined : filterCreatedEndDate,
            action: filterAction == undefined || filterAction.label == '' ? undefined : filterAction.label,
            status: filterStatus == undefined || filterStatus.label == '' ? undefined : filterStatus.label
        }

        return searchRequest;

    }

    const handleShowLogCleanerModal = () => {
        setShowLogCleanerModal(!showLogCleanerModal)
    }

    const handleDeleteLogCleaner = () => {
        handleShowLogCleanerModal()
        formik.resetForm()
    }

    const deleteQueue = () => {
        handleShowLogCleanerModal()
    }

    // // -----------------------------------------------------------------
    // // FORMIK
    // // -----------------------------------------------------------------
    const formik = useFormik({
        initialValues,
        //validationSchema: queueFilterSchema,
        onSubmit: async (values, { setStatus, setSubmitting, resetForm }) => {

            if (filterCreatedDate == null || filterCreatedDate == '') {
                swal("Failed", "Unable to proceed, please fill up the search filter", "error");
                return;
            }

            setLoading(true)
            setCurrentRqstPage(1)
            setCurrentHstoryPage(1)

            setTimeout(() => {

                loadRqstQueueList(rqstPageSize, 1,
                    rqstSortColumn,
                    rqstSortOrder
                )

                loadHstoryQueueList(hstoryPageSize, 1,
                    hstorySortColumn,
                    hstorySortOrder
                )

                setLoading(false)
                setSubmitting(false)
                disableSplashScreen()
            }, 1000)
        },
    })

    const handleExportToCsv = () => {
        JSONToCSVConverter(JSON.stringify(queueHstoryLst), 'queue-history-search-result', true)
        JSONToCSVConverter(JSON.stringify(queueRqstLst), 'queue-request-search-result', true)
    }

    return (
        <FormContainer onSubmit={formik.handleSubmit}>

            <MainContainer>
                <FormHeader headerLabel={'MICROSERVICE MONITORING'} />
                <ContentContainer>
                    <FormGroupContainer>
                        <div className='col-lg-3'>
                            <label>Created Date*</label>
                            <DefaultDateRangePicker
                                format='yyyy-MM-dd HH:mm:ss'
                                maxDays={180}
                                onChange={onChangeCreatedDate}
                                value={filterCreatedDate}
                            />
                        </div>
                        <div className='col-lg-3'>
                            <label>Created By</label>
                            <Select
                                size="small"
                                style={{ width: '100%' }}
                                options={userOptionLst}
                                onChange={onChangeUser}
                                value={filterUser}
                            />
                        </div>
                        <div className='col-lg-3'>
                            <label>Status</label>
                            <Select
                                size="small"
                                style={{ width: '100%' }}
                                options={statusOptionLst}
                                onChange={onChangeStatus}
                                value={filterStatus}
                            />
                        </div>

                        <div className='col-lg-3'>
                            <label>Action</label>
                            <Select
                                size="small"
                                style={{ width: '100%' }}
                                options={actionOptionLst}
                                onChange={onChangeAction}
                                value={filterAction}
                            />
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
                            <DefaultButton access={userAccessId == 0 && (userAccess.includes(USER_CLAIMS.AdminRead) === true || userAccess.includes(USER_CLAIMS.AdminWrite) === true)} title={'Logs Cleaner'} onClick={handleDeleteLogCleaner} />
                            <MlabButton
                                access={userAccessId == 0}
                                label='Export to CSV'
                                style={ElementStyle.primary}
                                type={'button'}
                                weight={'solid'}
                                size={'sm'}
                                onClick={handleExportToCsv}
                                disabled={loading} />
                        </ButtonsContainer>
                        <div className="ag-theme-quartz mt-5" style={{ height: 510, width: '100%', marginBottom: '50px', padding: '0 0 28px 0' }}>
                            <FormHeader headerLabel={'Queue Request Search Result'} />
                            <AgGridReact
                                rowData={queueRqstLst}
                                defaultColDef={{
                                    sortable: true,
                                    resizable: true,
                                }}
                                components={{
                                    tableLoader: tableLoaderRqst,
                                }}
                                onGridReady={onGridReadyRqst}
                                rowBuffer={0}
                                //enableRangeSelection={true} //deprecated in AgGridReactv32.0.0
                                pagination={false}
                                paginationPageSize={rqstPageSize}
                                columnDefs={rqstColumnDefs}
                                onSortChanged={(e) => onSortRqst(e)}
                            />
                            <DefaultGridPagination
                                recordCount={rqstRecordCount}
                                currentPage={currentRqstPage}
                                pageSize={rqstPageSize}
                                onClickFirst={onClickFirstRqst}
                                onClickPrevious={onClickPreviousRqst}
                                onClickNext={onClickNextRqst}
                                onClickLast={onClickLastRqst}
                                onPageSizeChanged={onPageSizeChangedRqst}
                            />
                        </div>

                        <div className="ag-theme-quartz mt-5" style={{ height: 510, width: '100%', marginBottom: '50px', padding: '0 0 28px 0' }}>
                        <div className='col-lg-12 mt-10'></div>
                            <FormHeader headerLabel={'Queue History Search Result'} />
                            <AgGridReact
                                rowData={queueHstoryLst}
                                defaultColDef={{
                                    sortable: true,
                                    resizable: true,
                                }}
                                components={{
                                    tableLoader: tableLoaderHstory,
                                }}
                                onGridReady={onGridReadyHstory}
                                rowBuffer={0}
                                //enableRangeSelection={true} //deprecated in AgGridReactv32.0.0
                                pagination={false}
                                paginationPageSize={hstoryPageSize}
                                columnDefs={hstoryColumnDefs}
                                onSortChanged={(e) => onSortHstory(e)}
                            />
                            <DefaultGridPagination
                                recordCount={rqstRecordCount}
                                currentPage={currentHstoryPage}
                                pageSize={hstoryPageSize}
                                onClickFirst={onClickFirstHstory}
                                onClickPrevious={onClickPreviousHstory}
                                onClickNext={onClickNextHstory}
                                onClickLast={onClickLastHstory}
                                onPageSizeChanged={onPageSizeChangedHstory}
                            />
                        </div>
                    </FormGroupContainer>
                </ContentContainer>
            </MainContainer>
            <LogsCleanerModal
                logCleaner={null}
                modal={showLogCleanerModal}
                toggle={handleShowLogCleanerModal}
                saveFilter={deleteQueue}
            />
        </FormContainer>

    )
}

export default MsMonitoring