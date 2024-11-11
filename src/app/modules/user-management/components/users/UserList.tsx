
import * as Bootstrap from 'bootstrap';
import "datatables.net";
import "datatables.net-dt";
import {useFormik} from 'formik';
import {Guid} from "guid-typescript";
import $ from "jquery";
import React, {useEffect, useState} from 'react';
import {shallowEqual, useSelector} from 'react-redux';
import {useHistory} from "react-router-dom";
import Select from 'react-select';
import swal from 'sweetalert';
import * as Yup from 'yup';
import '../../../../../_metronic/assets/css/datatables.min.css';
import {RootState} from '../../../../../setup';
import * as hubConnection from '../../../../../setup/hub/MessagingHub';
import * as InternetConnectionHandler from '../../../../../setup/internet-connection/InternetConnectionHandler';
import * as sessionHandler from '../../../../../setup/session/SessionHandler';

import useConstant from '../../../../constants/useConstant';
import {BasicLabel} from '../../../../custom-components';
import useFnsDateFormatter from '../../../../custom-functions/helper/useFnsDateFormatter';
import {useSystemOptionHooks} from "../../../system/shared";
import {USER_CLAIMS} from '../../../user-management/components/constants/UserClaims';
import {LockUserRequestModel} from '../../models/LockUserRequestModel';
import {TeamsFilterModel} from '../../models/TeamsFilterModel';
import {UserFilterModel} from '../../models/UserFilterModel';
import {UserInfoListModel} from '../../models/UserInfoListModel';
import {getTeamsFilter, getUserList, getUserListResult, lockUser} from '../../redux/UserManagementService';

const userFilterSchema = Yup.object().shape({
    userIdRequest: Yup.string(),
    fullName: Yup.string(),
    email: Yup.string(),
    teams: Yup.string(),
    statuses: Yup.string(),
    queueId: Yup.string(),
    userId: Yup.string(),

})

const initialValues = {
    userIdRequest: '',
    fullName: '',
    email: '',
    teams: '',
    statuses: '',
    queueId: '',
    userId: '',
    messageTypeId: undefined,
    accountId: '',
}

interface TeamOption {
    value: string
    label: string
}
interface StatusOption {
    value: number
    label: string
}



const UserList: React.FC = () => {

    const {HubConnected, successResponse, SwalFailedMessage, SwalUserListMessage, SwalServerErrorMessage, FnsDateFormatPatterns} = useConstant();

    // -----------------------------------------------------------------
    // GET REDUX STORE
    // -----------------------------------------------------------------
    const userAccessId = useSelector<RootState>(({ auth }) => auth.userId, shallowEqual) as number
    const userAccess = useSelector<RootState>(({ auth }) => auth.access, shallowEqual) as string
    const expiresIn = useSelector<RootState>(({ auth }) => auth.expiresIn, shallowEqual) as string
    const history = useHistory();
    const messagingHub = hubConnection.createHubConnenction();
    const { mlabFormatDate } = useFnsDateFormatter();
    // -----------------------------------------------------------------
    // STATES WITH MODEL
    // -----------------------------------------------------------------
    const [loading, setLoading] = useState(false)
    const [userList, setUserList] = useState<Array<UserInfoListModel>>([])
    const [teamList, setTeamList] = useState<Array<TeamOption>>([])
    const [selectedStatuses, setSelectedStatuses] = useState('');
    const [selectedTeams, setSelectedTeams] = useState('');
    const [isfilterLoaded, setFilterLoaded] = useState(false);
    const [selectedMessageTypeId, setSelectedMessageTypeId] = useState<any>();

    const statusOptions = [
        { value: '1', label: 'Active' },
        { value: '2', label: 'Inactive' },
        { value: '3', label: 'Locked' },
    ];

    // Comm Provider Account
    const { getMessageTypeOptionList, messageTypeOptionList} = useSystemOptionHooks();

    
    const columns = [
        {
            title: 'No',
            data: null,
            className: 'align-middle',
        },
        {
            title: 'User ID',
            data: 'userId',
            className: 'align-middle',
            width: '50px'
        },
        {
            title: 'Full Name',
            data: 'fullname',
            className: 'align-middle',
            width: '170px'
        },
        {
            title: 'Email',
            data: 'email',
            className: 'align-middle',
            width: '130px'
        },
        {
            title: 'Teams',
            data: 'teamName',
            className: 'align-middle',
            orderable: false,
            render: function (data: any, row: any) {
            const dataResult = data ?? ''
            return data ? `<button type="button" class="btn  btn-sm" data-bs-trigger="hover" data-bs-toggle="popover" title="Team" data-bs-content="` + dataResult + `">
                <svg  xmlns="http://www.w3.org/2000/svg" height="16" width="18" viewBox="0 0 576 512">
                        <path fill="#009ef7" d="M288 32c-80.8 0-145.5 36.8-192.6 80.6C48.6 156 17.3 208 2.5 243.7c-3.3 7.9-3.3 16.7 0 24.6C17.3 304 48.6 356 95.4 399.4C142.5 443.2 207.2 480 288 480s145.5-36.8 192.6-80.6c46.8-43.5 78.1-95.4 93-131.1c3.3-7.9 3.3-16.7 0-24.6c-14.9-35.7-46.2-87.7-93-131.1C433.5 68.8 368.8 32 288 32zM144 256a144 144 0 1 1 288 0 144 144 0 1 1 -288 0zm144-64c0 35.3-28.7 64-64 64c-7.1 0-13.9-1.2-20.3-3.3c-5.5-1.8-11.9 1.6-11.7 7.4c.3 6.9 1.3 13.8 3.2 20.7c13.7 51.2 66.4 81.6 117.6 67.9s81.6-66.4 67.9-117.6c-11.1-41.5-47.8-69.4-88.6-71.1c-5.8-.2-9.2 6.1-7.4 11.7c2.1 6.4 3.3 13.2 3.3 20.3z"/>
                    </svg>
            </button>` : '';

            }
        },
        {
            title: 'Status',
            data: 'status',
            className: 'align-middle',
            render: function (data: any, row: any) {
                let statusFlag: string;
                statusFlag = '';
                if (data === 1) {
                    statusFlag = 'Active'
                }
                else if (data === 2) {
                    statusFlag = 'Inactive'
                } else if (data === 3) {
                    statusFlag = 'Locked'
                }
                return statusFlag;
            }
        },
        {
            title: 'Communication Provider Account',
            data: 'communicationProviderAccount',
            className: 'align-middle',
            width: '100px',
            orderable: false,
            render: function (data: any, row: any) {
                const dataResult = data ?? ''
                return data ? `<div class='d-flex justify-content-center flex-shrink-0' >
                <button type="button" class="btn btn-sm " data-bs-trigger="hover" data-bs-toggle="popover" 
                title="Communication Provider Account" data-bs-content="` + dataResult + `">
                    <svg  xmlns="http://www.w3.org/2000/svg" height="16" width="18" viewBox="0 0 576 512">
                        <path fill="#009ef7" d="M288 32c-80.8 0-145.5 36.8-192.6 80.6C48.6 156 17.3 208 2.5 243.7c-3.3 7.9-3.3 16.7 0 24.6C17.3 304 48.6 356 95.4 399.4C142.5 443.2 207.2 480 288 480s145.5-36.8 192.6-80.6c46.8-43.5 78.1-95.4 93-131.1c3.3-7.9 3.3-16.7 0-24.6c-14.9-35.7-46.2-87.7-93-131.1C433.5 68.8 368.8 32 288 32zM144 256a144 144 0 1 1 288 0 144 144 0 1 1 -288 0zm144-64c0 35.3-28.7 64-64 64c-7.1 0-13.9-1.2-20.3-3.3c-5.5-1.8-11.9 1.6-11.7 7.4c.3 6.9 1.3 13.8 3.2 20.7c13.7 51.2 66.4 81.6 117.6 67.9s81.6-66.4 67.9-117.6c-11.1-41.5-47.8-69.4-88.6-71.1c-5.8-.2-9.2 6.1-7.4 11.7c2.1 6.4 3.3 13.2 3.3 20.3z"/>
                    </svg>
                </button> </div>`: '';
    
            }
        },
        {
            title: 'Created Date',
            data: 'createdDate',
            className: 'align-middle',
            type: 'date',
            render: function (data: any, type: any, row: any) {
                if (type === 'display' || type === 'filter') {
                    return mlabFormatDate(data, FnsDateFormatPatterns.mlabDateFormat)
                }
                return data;
            },
        },
        {
            title: 'Created By',
            data: 'createdBy',
            className: 'align-middle',
        },
        {
            title: 'Last Modified Date',
            data: 'updatedDate',
            className: 'align-middle',
            type: 'date',
            render: function (data: any, type: any, row: any) {
                if (type === 'display' || type === 'filter') {
                    return mlabFormatDate(data, FnsDateFormatPatterns.mlabDateFormat)
                }
                return data;
            },
        },
        {
            title: 'Last Modified By',
            data: 'updatedBy',
            className: 'align-middle',
            
        },
        {
            title: 'Action',
            data: null,
            width: '60px',
            className: 'align-middle',
            orderable: false,
            render: function (data: any, row: any) {
                let lockedHtml: string = ''

                if (data.status === 3) {
                    lockedHtml = `<a title='Unlock'
                class='btn btn-sm px-2 fw-bolder'
                id='user-`+ data.userId + `'>
                        <svg xmlns="http://www.w3.org/2000/svg" height="14" width="12" viewBox="0 0 448 512">
                            <path fill="#009ef7" d="M224 64c-44.2 0-80 35.8-80 80v48H384c35.3 0 64 28.7 64 64V448c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V256c0-35.3 28.7-64 64-64H80V144C80 64.5 144.5 0 224 0c57.5 0 107 33.7 130.1 82.3c7.6 16 .8 35.1-15.2 42.6s-35.1 .8-42.6-15.2C283.4 82.6 255.9 64 224 64zm32 320c17.7 0 32-14.3 32-32s-14.3-32-32-32H192c-17.7 0-32 14.3-32 32s14.3 32 32 32h64z"/>
                        </svg>
                </a> 
            `;
                } else if (data.status === 1) {
                    lockedHtml = `<a title='Lock'
                    class='btn btn-sm px-2 fw-bolder'
                    id='user-`+ data.userId + `'>
                        <svg xmlns="http://www.w3.org/2000/svg" height="14" width="12" viewBox="0 0 448 512">
                            <path fill="#009ef7" d="M144 144v48H304V144c0-44.2-35.8-80-80-80s-80 35.8-80 80zM80 192V144C80 64.5 144.5 0 224 0s144 64.5 144 144v48h16c35.3 0 64 28.7 64 64V448c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V256c0-35.3 28.7-64 64-64H80z"/>
                        </svg>
                    </a> `;
                }
            
                return `<div class='d-flex justify-content-center flex-shrink-0' style='cursor: pointer' >
                <a title='Edit'
                    href='/user-management/edit-user/${data.userId}'
                    target="_blank" rel="noopener noreferrer"
                    class="btn btn-sm px-2 fw-bolder"
                > <svg xmlns="http://www.w3.org/2000/svg" height="14" width="14" viewBox="0 0 512 512">
                <path fill="#009ef7" d="M410.3 231l11.3-11.3-33.9-33.9-62.1-62.1L291.7 89.8l-11.3 11.3-22.6 22.6L58.6 322.9c-10.4 10.4-18 23.3-22.2 37.4L1 480.7c-2.5 8.4-.2 17.5 6.1 23.7s15.3 8.5 23.7 6.1l120.3-35.4c14.1-4.2 27-11.8 37.4-22.2L387.7 253.7 410.3 231zM160 399.4l-9.1 22.7c-4 3.1-8.5 5.4-13.3 6.9L59.4 452l23-78.1c1.4-4.9 3.8-9.4 6.9-13.3l22.7-9.1v32c0 8.8 7.2 16 16 16h32zM362.7 18.7L348.3 33.2 325.7 55.8 314.3 67.1l33.9 33.9 62.1 62.1 33.9 33.9 11.3-11.3 22.6-22.6 14.5-14.5c25-25 25-65.5 0-90.5L453.3 18.7c-25-25-65.5-25-90.5 0zm-47.4 168l-144 144c-6.2 6.2-16.4 6.2-22.6 0s-6.2-16.4 0-22.6l144-144c6.2-6.2 16.4-6.2 22.6 0s6.2 16.4 0 22.6z"/>
                </svg>
                </a>
                ${lockedHtml} 
                </div>`
            }
        }
    ];

    // -----------------------------------------------------------------
    // FORMIK FORM POST
    // -----------------------------------------------------------------
    const formik = useFormik({
        initialValues,
        validationSchema: userFilterSchema,
        onSubmit: (values, { setStatus, setSubmitting, resetForm }) => {

            if (InternetConnectionHandler.isSlowConnection(history) === true) {
                return;
            }

            if (sessionHandler.isSessionExpired(expiresIn, history) === true) {
                return;
            }

            values.userId = userAccessId.toString()

            let convertedStatuses = JSON.parse(JSON.stringify(selectedStatuses))

            if (Number.isInteger(parseInt(values.userIdRequest)) === false && (values.userIdRequest !== '')) {

                swal(SwalFailedMessage.title, SwalUserListMessage.textErrorRoleId, SwalFailedMessage.icon);
                setLoading(false)
                setSubmitting(false)
                return;
            }

            const convertedUserIdRequest = values.userIdRequest === '' ? 0 : parseInt(values.userIdRequest);
         
            $("#table-users").DataTable({
                retrieve: true,
                dom: '<"table-users"ltip>',
                columns,
                data: userList,
                ordering: true,
                paging: true,
                pagingType: 'full_numbers',
                pageLength: 10,
                "order": [[1, 'asc']],
                language: {
                    "emptyTable": "No Rows To Show"
                  }
            });

            setLoading(true)
            setTimeout(() => {
                setUserList([]);
                messagingHub.start()
                    .then(() => {
                        if (messagingHub.state === HubConnected) {
                            const request: UserFilterModel = {
                                email: values.email,
                                fullName: values.fullName,
                                statuses: convertedStatuses !== undefined ? convertedStatuses.value : '',
                                teams: Object.assign(Array<TeamOption>(), selectedTeams).map(el => el.value).join(', '),
                                userIdRequest: convertedUserIdRequest,
                                queueId: Guid.create().toString(),
                                userId: userAccessId.toString(),
                                communicationProviderMessageTypeId: parseInt(selectedMessageTypeId?.value ?? ''),
                                communicationProviderAccountId: values.accountId,
                            }
                            getUserList(request).then((response) => {
                                if (response.status === successResponse) {
                                    messagingHub.on(request.queueId.toString(), message => {
                                        getUserListResult(message.cacheId)
                                            .then((data) => {
                                                let resultData = Object.assign(new Array<UserInfoListModel>(), data.data);
                                                setUserList(resultData);

                                            })
                                            .catch(() => {
                                            });
                                        messagingHub.off(request.queueId.toString());
                                        messagingHub.stop();
                                        setLoading(false);
                                        setSubmitting(false);
                                    });

                                    setTimeout(() => {
                                        if (messagingHub.state === HubConnected) {
                                            messagingHub.stop();
                                            setLoading(false);
                                            setSubmitting(false);
                                        }
                                    }, 30000)
                                }
                                else {
                                    messagingHub.stop();
                                    setLoading(false);
                                    setSubmitting(false);
                                    swal(SwalFailedMessage.title, response.data.message, SwalFailedMessage.icon);
                                }
                            })
                            .catch(() => {
                                messagingHub.stop();
                                setLoading(false);
                                setSubmitting(false);
                            })
                        }
                        else {
                            setLoading(false);
                            setSubmitting(false);
                            swal(SwalServerErrorMessage.title, SwalServerErrorMessage.textError, SwalServerErrorMessage.icon);
                        }
                    })
                    .catch(err => console.log('Error while starting connection: ' + err))
            }, 1000)
        },
    });

    // -----------------------------------------------------------------
    // MOUNTED
    // -----------------------------------------------------------------
    useEffect(() => {
        getMessageTypeOptionList('');
    }, [])
    

    useEffect(() => {
        if (isfilterLoaded === false) {

            if (InternetConnectionHandler.isSlowConnection(history) === true) {
                return;
            }
            setTimeout(() => {
                teamsPopulate()
            }, 1000);
            setFilterLoaded(true)
        }

        dataTableDrawing()
    

    }, [userList])



    // Methods

    const teamsPopulate = () => {
        getTeamsFilter().then((response) => {
            if (response.status === successResponse) {
                let teamListData = Object.assign(new Array<TeamsFilterModel>(), response.data);
                let teamTempList = Array<TeamOption>();
         
                teamListData.forEach((team) => {
                    const roleOption: TeamOption = {
                        value: team.teamId.toString(),
                        label: team.teamName,
                    };
                    teamTempList.push(roleOption)
                });
                setTeamList(teamTempList.filter(
                    (thing, i, arr) => arr.findIndex(t => t.value === thing.value) === i
                ));
            }
            else {
                swal(SwalFailedMessage.title, SwalUserListMessage.textErrorGetTeamList, SwalFailedMessage.icon);
            }
        })
        .catch(() => {
            swal(SwalFailedMessage.title, SwalUserListMessage.textErrorGetTeamList, SwalFailedMessage.icon);
        })
    }

    const dataTableDrawing = () => {

        const table = $(".table-users")
        .find('table')
        .DataTable();
            table.clear();
            table.rows.add(userList);
            table.on('order.dt search.dt', function () {
                table.column(0, { search: 'applied', order: 'applied' }).nodes().each(function (cell, i) {
                    cell.innerHTML = i + 1;
                });
            }).draw();

            table.on('draw.dt', function () {
                let popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'))
                let popoverInstances: Bootstrap.Popover[] = [];
                try {
                    if (popoverTriggerList.length > 0) {
                
                        popoverTriggerList.forEach(function (popoverTriggerEl) {
                            popoverInstances.push(new Bootstrap.Popover(popoverTriggerEl));
                        });
                        
                    }    
                } catch (error) {
                    console.log('Error found in data table drawing ', error, popoverInstances)
                }
                
            });

           

            userList.forEach(user => {
                if (userAccess.includes(USER_CLAIMS.UsersWrite) === true) {
                    $("#user-" + user.userId).on('click', (event: JQuery.ClickEvent) => { locked("#user-" + user.userId) });
                } else {
                    $("#user-" + user.userId).hide()
                }

            });

    }

    function ClearFilter() {
        setSelectedStatuses('');
        setSelectedTeams('');
        setSelectedMessageTypeId(null);

        initialValues.userIdRequest = ''
        initialValues.fullName = ''
        initialValues.email = ''
        initialValues.teams = ''
        initialValues.statuses = ''
        initialValues.queueId = ''
        initialValues.userId = ''
        initialValues.messageTypeId = undefined
        initialValues.accountId = ''
        formik.setFieldValue('userIdRequest', initialValues.userIdRequest);
        formik.setFieldValue('fullName', initialValues.fullName);
        formik.setFieldValue('email', initialValues.email);
        formik.setFieldValue('accountId', initialValues.accountId);
    }

    function onChangeSelectedStatues(val: string) {
        setSelectedStatuses(val)
    }

    function onChangeSelectedTeams(val: string) {
        setSelectedTeams(val);
    }

    function onChangeSelectedCommProviderMessageTypeId(val: any) {
      
        setSelectedMessageTypeId(val);
    }

    function locked(eventId: string) {

        if (sessionHandler.isSessionExpired(expiresIn, history) === true) {
            return;
        }

        swal({
            title: SwalUserListMessage.titleConfirmation,
            text: SwalUserListMessage.textConfirmChangeUserStatus,
            icon: SwalUserListMessage.iconWarning,
            buttons: [SwalUserListMessage.btnNo, SwalUserListMessage.btnYes],
            dangerMode: true
        })
            .then((proceedLock) => {
                if (proceedLock) {
                    let lockUserId: string = eventId.split('-')[1];

                    let buttonLock = document.getElementById(eventId.replace('#', '')) as HTMLInputElement;
                    let newStatus: number = 1;

                    if (buttonLock.title === 'Lock') {
                        newStatus = 3;
                    } else { newStatus = 1 }


                    setTimeout(() => {
                        messagingHub
                            .start()
                            .then(() => {
                                if (messagingHub.state === HubConnected) {

                                    const lockRequest: LockUserRequestModel = {
                                        queueId: Guid.create().toString(),
                                        userId: userAccessId.toString(),
                                        userIdRequest: parseInt(lockUserId),
                                        UserStatusId: newStatus,
                                        updateBy: userAccessId
                                    }
                                    lockUser(lockRequest)
                                        .then((response) => {
                                            if (response.status === successResponse) {
                                                messagingHub.on(lockRequest.queueId.toString(), message => {
                                                    let resultData = JSON.parse(message.remarks);

                                                    if (resultData.Status !== successResponse) {
                                                        swal(SwalFailedMessage.title, resultData.Message, SwalFailedMessage.icon);
                                                        setLoading(false)
                                                    } else {
                                                        swal(SwalUserListMessage.titleSuccessful, SwalUserListMessage.textChangesApplied, SwalUserListMessage.iconSuccess);

                                                        const convertedUserIdRequest = initialValues.userIdRequest === '' ? 0 : parseInt(initialValues.userIdRequest);
                                                        const request: UserFilterModel = {
                                                            email: initialValues.email,
                                                            fullName: initialValues.fullName,
                                                            statuses: selectedStatuses ? Object.assign(Array<StatusOption>(), selectedStatuses).map(el => el.value).join(',') : '',
                                                            teams: Object.assign(Array<TeamOption>(), selectedTeams).map(el => el.value).join(', '),
                                                            userIdRequest: convertedUserIdRequest,
                                                            queueId: Guid.create().toString(),
                                                            userId: userAccessId.toString(),
                                                            communicationProviderMessageTypeId: parseInt(selectedMessageTypeId?.value ?? ''),
                                                            communicationProviderAccountId: initialValues.accountId,
                                                        }
                                                        getUserList(request).then((response) => {
                                                            if (response.status === successResponse) {
                                                                messagingHub.on(request.queueId.toString(), message => {
                                                                    getUserListResult(message.cacheId)
                                                                        .then((data) => {
                                                                            let resultData = Object.assign(new Array<UserInfoListModel>(), data.data);
                                                                           
                                                                            setUserList(resultData)
                                                                        })
                                                                        .catch(() => {
                                                                            swal(SwalUserListMessage.titleFailed,SwalUserListMessage.textErrorGetUserList,SwalUserListMessage.iconError);
                                                                        });
                                                                    messagingHub.off(request.queueId.toString());
                                                                    messagingHub.stop()
                                                                });
                                                            }
                                                            else {
                                                                messagingHub.stop();
                                                                swal(SwalUserListMessage.titleFailed, response.data.message, SwalUserListMessage.iconError);
                                                            }
                                                        })
                                                            .catch(() => {
                                                                messagingHub.stop();
                                                            })
                                                        // end getting role
                                                    }
                                                });
                                            } else {
                                                messagingHub.stop();
                                                swal(SwalUserListMessage.titleFailed,  response.data.message, SwalUserListMessage.iconError);
                                            }
                                        })
                                        .catch(() => {
                                            messagingHub.stop();
                                            swal(SwalUserListMessage.titleFailed, SwalUserListMessage.textErrorUserLock, SwalUserListMessage.iconError);
                                        })
                                }
                                else {
                                    swal(SwalUserListMessage.titleFailed, SwalServerErrorMessage.textError, SwalUserListMessage.iconError);
                                }

                            })
                            .catch(err => console.log('Error while starting connection: ' + err))
                        setLoading(false)
                    }, 1000)
                }
            });
    }

    // UI render
    return (
        <form
            className='form w-100'
            onSubmit={formik.handleSubmit}
            noValidate
        >
            <div className='card card-custom'>
                <div
                    className='card-header cursor-pointer'
                    role='button'
                    data-bs-toggle='collapse'
                    data-bs-target='#kt_account_deactivate'
                    aria-expanded='true'
                    aria-controls='kt_account_deactivate'
                >
                    <div className='card-title m-0'>
                        <h5 className='fw-bolder m-0'>Search Users</h5>
                    </div>
                </div>
                <div className='card-body'>
           
                    <div className='d-flex'>
                        <div className='row'>
                            <div className="col-lg-4">
                                <div className="row">
                                    <div className="row mb-3">
                                        <div className="col-sm-3">
                                            <label className="form-label-sm">User Id</label>
                                        </div>
                                        <div className="col-sm-9 mr-auto">
                                            <input type="text" className="form-control form-control-sm" aria-label="User Id"
                                                {...formik.getFieldProps('userIdRequest')}
                                            />
                                        </div>
                                    </div>
                                    <div className="row mb-3">
                                        <div className="col-sm-3">
                                            <label className="form-label-sm">Full Name </label>
                                        </div>
                                        <div className="col-sm-9">
                                            <input type="text" className="form-control form-control-sm" aria-label="Full Name"
                                                {...formik.getFieldProps('fullName')}
                                            />
                                        </div>
                                    </div>
                                    <div className="row mb-3">
                                        <div className="col-sm-3">
                                            <label className="form-label-sm">Status</label>
                                        </div>
                                        <div className="col-sm-9">
                                            <Select
                                                // isMulti
                                                options={statusOptions}
                                                onChange={onChangeSelectedStatues}
                                                value={selectedStatuses}
                                            />
                                        </div>
                                    </div>

                                </div>
                            </div>
                                <div className="col-lg-3">
                                    <div className="row">
                                        <div className="row mb-3 mr-auto">
                                            <div className="col-sm-3">
                                                <label className="form-label-sm">Email</label>
                                            </div>
                                            <div className="col-sm-9">
                                                <input type="text" className="form-control form-control-sm" aria-label="Email"
                                                    {...formik.getFieldProps('email')}
                                                />
                                            </div>
                                        </div>
                                        <div className="row mb-3">
                                            <div className="col-sm-3">
                                                <label className="form-label-sm">Teams</label>
                                            </div>
                                            <div className="col-sm-9">
                                                <Select
                                                    isMulti
                                                    options={teamList}
                                                    onChange={onChangeSelectedTeams}
                                                    value={selectedTeams}
                                                />
                                            </div>
                                        </div>
                                        <div className="row mb-3 mr-auto">
                                            <div className="col-sm-3" />
                                            <div className="col-sm-9" />
                                        </div>
                                    </div>
                                </div>
                           
                            <div className="col-lg-5">
                                <div className="row">
                                    <div className="row mb-3">
                                        <div className="col-lg-6">
                                            <BasicLabel title={'Communication Provider Message Type'} />
                                        </div>
                                        <div className="col-lg-6">
                                            <Select id="communicationProviderMessageType"
                                                options={messageTypeOptionList}
                                                onChange={onChangeSelectedCommProviderMessageTypeId}
                                                value={selectedMessageTypeId}
                                            />
                                        </div>
                                    </div>

                                    <div className="row mb-3">
                                        <div className="col-lg-6">
                                            <BasicLabel title={'Communication Provider Account Id'} />
                                        </div>
                                        <div className="col-lg-6">
                                            <input type="text" className="form-control form-control-sm" aria-label="Account Id" id="communicationProviderAccountId"
                                                {...formik.getFieldProps('accountId')}
                                            />
                                        </div>
                                    </div>
                               </div>
                            </div>
                        </div>
                        </div>
                            <div className="d-flex my-4 ">
                            <button type='submit' className="btn btn-primary btn-sm me-2" disabled={formik.isSubmitting}>
                                {!loading && <span className='indicator-label'>Search</span>}
                                {loading && (
                                    <span className='indicator-progress' style={{ display: 'block' }}>
                                        Please wait...
                                        <span className='spinner-border spinner-border-sm align-middle ms-2'></span>
                                    </span>
                                )}
                            </button>
                            <button type='button' className="btn btn-secondary btn-sm me-2" onClick={ClearFilter}>Clear</button>
                            {(userAccess.includes(USER_CLAIMS.UsersWrite) === true) && (
                                <a onClick={() => window.open('/user-management/create-user')} className="btn btn-primary btn-sm me-0" role="button"> Create New</a>
                            )}
                        </div>

                        <table id="table-users" className="table table-hover table-rounded table-striped border gy-3 gs-3" />
                    </div>
                 
                </div>

        </form>
    )
    
}
export default UserList;
