import '@popperjs/core';
import * as Bootstrap from 'bootstrap';
import "datatables.net";
import "datatables.net-dt";
import {useFormik} from 'formik';
import {Guid} from "guid-typescript";
import $ from "jquery";
import React, {useEffect, useState} from 'react';
import Select from 'react-select';
import swal from 'sweetalert';
import * as Yup from 'yup';
import '../../../../../_metronic/assets/css/datatables.min.css';
import * as hubConnection from '../../../../../setup/hub/MessagingHub';
import * as InternetConnectionHandler from '../../../../../setup/internet-connection/InternetConnectionHandler';
import {GetAllOperator, getAllBrand, getAllCurrency} from '../../../system/redux/SystemService';
import {USER_CLAIMS} from '../../../user-management/components/constants/UserClaims';
import {TeamModel} from '../../models/TeamModel';
import {getRolesFilter, getTeamList, getTeamListResult} from '../../redux/UserManagementService';

import {shallowEqual, useSelector} from 'react-redux';
import {useHistory} from "react-router-dom";
import {RootState} from '../../../../../setup';
import * as sessionHandler from '../../../../../setup/session/SessionHandler';


import {BrandInfoModel} from '../../../system/models/BrandInfoModel';
import {CurrencyModel} from '../../../system/models/CurrencyModel';
import {OperatorInfoModel} from '../../../system/models/OperatorInfoModel';
import {RolesFilterModel} from '../../models/RolesFilterModel';
import {TeamFilterModel} from '../../models/TeamFilerModel';

const operatorFilterSchema = Yup.object().shape({
    teamId: Yup.string(),
    teamName: Yup.string(),
    queueId: Yup.string(),
    userId: Yup.string(),
})

const initialValues = {
    teamId: '',
    teamName: '',
    queueId: '',
    userId: ''
}

interface RoleOption {
    value: string
    label: string
}
interface OperatorOption {
    value: number
    label: string
}
interface BrandOption {
    value: number
    label: string
}
interface CurrencyOption {
    value: number
    label: string
}
interface StatusOption {
    value: number
    label: string
}


const TeamList: React.FC = () => {

    // Redux
    const userAccessId = useSelector<RootState>(({ auth }) => auth.userId, shallowEqual) as number
    const userAccess = useSelector<RootState>(({ auth }) => auth.access, shallowEqual) as string
    const expiresIn = useSelector<RootState>(({ auth }) => auth.expiresIn, shallowEqual) as string
    const history = useHistory();

    // States
    const [loading, setLoading] = useState(false)
    const [teamList, setTeamList] = useState<Array<TeamModel>>([])
    const [roleList, setRoleList] = useState<Array<RoleOption>>([])
    const [operatorList, setOperatorList] = useState<Array<OperatorOption>>([])
    const [brandList, setBrandList] = useState<Array<BrandOption>>([])
    const [currencyList, setCurrencyList] = useState<Array<CurrencyOption>>([])
    const [isfilterLoaded, setFilterLoaded] = useState(false);

    const [selectedStatuses, setSelectedStatuses] = useState('');
    const [selectedRoles, setSelectedRoles] = useState('');
    const [selectedOperators, setSelectedOperators] = useState('');
    const [selectedBrands, setSelectedBrands] = useState('');
    const [selectedCurrencies, setSelectedCurrencies] = useState('')

    const statusOptions = [
        { value: '1', label: 'Active' },
        { value: '2', label: 'Inactive' }
    ];



    // formik
    const formik = useFormik({
        initialValues,
        validationSchema: operatorFilterSchema,
        onSubmit: (values, { setStatus, setSubmitting, resetForm }) => {
            if (InternetConnectionHandler.isSlowConnection(history) === true) {
                return;
            }
            if (sessionHandler.isSessionExpired(expiresIn, history) === true) {
                return;
            }


            if (Number.isInteger(parseInt(values.teamId)) === false && (values.teamId !== '')) {
                swal("Failed", "Team Id should be a number", "error");
                setLoading(false)
                setSubmitting(false)
                return;

            }

            values.queueId = Guid.create().toString();
            values.userId = userAccessId.toString();

         
            $("#table-teams").DataTable({
                retrieve: true,
                dom: '<"table-teams"ltip>',
                columns,
                data: teamList,
                ordering: true,
                paging: true,
                pagingType: 'full_numbers',
                pageLength: 10,
                "order": [[1, 'asc']],
                language: {
                    "emptyTable": "No Rows To Show"
                  },
            });
            setLoading(true)
            setTimeout(() => {
                setTeamList([]);
                console.log('selectedRoles')
                console.log(selectedRoles)

                const messagingHub = hubConnection.createHubConnenction();

                messagingHub
                    .start()
                    .then(() => {

                        if (messagingHub.state === 'Connected') {

                            const request: TeamFilterModel = {
                                brands: Object.assign(Array<BrandOption>(), selectedBrands).map(el => el.value).join(','),
                                currencies: Object.assign(Array<CurrencyOption>(), selectedCurrencies).map(el => el.value).join(','),
                                operators: Object.assign(Array<OperatorOption>(), selectedOperators).map(el => el.value).join(','),
                                roles: Object.assign(Array<RoleOption>(), selectedRoles).map(el => el.value).join(','),
                                teamId: values.teamId === '' ? 0 : parseInt(values.teamId),
                                teamName: values.teamName,
                                teamStatuses: Object.assign(Array<StatusOption>(), selectedStatuses).map(el => el.value).join(','),
                                queueId: values.queueId,
                                userId: values.userId
                            }

                            console.log('request')
                            console.log(request)
                            getTeamList(request)
                                .then((response) => {
                                    if (response.status === 200) {
                                        messagingHub.on(request.queueId.toString(), message => {
                                            getTeamListResult(message.cacheId)
                                                .then((data) => {
                                                    console.log('data.data')
                                                    console.log(data.data)
                                                    let resultData = Object.assign(new Array<TeamModel>(), data.data);
                                                    setTeamList(resultData)
                                                    setLoading(false)
                                                    setSubmitting(false)
                                                })
                                                .catch(() => {
                                                    setLoading(false)
                                                    setSubmitting(false)
                                                })
                                            messagingHub.off(request.queueId.toString());
                                            messagingHub.stop();

                                        });

                                        setTimeout(() => {
                                            if (messagingHub.state === 'Connected') {
                                                messagingHub.stop();
                                                setLoading(false)
                                                setSubmitting(false)
                                            }
                                        }, 30000)

                                    } else {
                                        messagingHub.stop();
                                        setLoading(false)
                                        setSubmitting(false)
                                        swal("Failed", response.data.message, "error");
                                    }
                                })
                                .catch(() => {
                                    messagingHub.stop();
                                    setLoading(false)
                                    setSubmitting(false)
                                })

                        } else {
                            messagingHub.stop();
                            setLoading(false)
                            setSubmitting(false)
                        }
                    })
                    .catch(err => console.log('Error while starting connection: ' + err))
            }, 1000)
        },
    })

    // -----------------------------------------------------------------
    // MOUNTED
    // -----------------------------------------------------------------
    useEffect(() => {

        if (isfilterLoaded === false) {
            if (InternetConnectionHandler.isSlowConnection(history) === true) {
                return;
            }
            // enableSplashScreen()

            setTimeout(() => {
                getRolesFilter().then((response) => {

                    if (response.status === 200) {

                        let roleTempList = Array<RoleOption>();
                        let roleListData = Object.assign(new Array<RolesFilterModel>(), response.data);
                        console.log('roleListData')
                        console.log(roleListData)
                        roleListData.forEach(role => {
                            const roleOption: RoleOption = {
                                value: role.roleId.toString(),
                                label: role.roleName,
                            };
                            roleTempList.push(roleOption)
                        })
                        setRoleList(roleTempList.filter(
                            (thing, i, arr) => arr.findIndex(t => t.value === thing.value) === i
                        ));
                        // disableSplashScreen()

                    } else {
                        // disableSplashScreen()
                        console.log("Problem in getting role list")
                    }

                })
                    .catch(() => {
                        // disableSplashScreen()
                        console.log("Problem in getting role list")
                    })



                // Getting operators
                GetAllOperator().then((response) => {
                    if (response.status === 200) {
                        let allOperators = Object.assign(new Array<OperatorInfoModel>(), response.data);
                        let operatorTempList = Array<OperatorOption>();

                        allOperators.forEach(item => {
                            const operatorOption: OperatorOption = {
                                value: item.operatorId,
                                label: item.operatorName,
                            };
                            operatorTempList.push(operatorOption)
                        })
                        setOperatorList(operatorTempList.filter(
                            (thing, i, arr) => arr.findIndex(t => t.value === thing.value) === i
                        ));
                    }
                    else {
                        // disableSplashScreen()
                        console.log("Problem in getting operaror list")
                    }

                })
                    .catch(() => {
                        //disableSplashScreen()
                        console.log("Problem in getting operaror list")
                    })

                //Getting Role
                getAllBrand().then((response) => {
                    if (response.status === 200) {
                        let allBrands = Object.assign(new Array<BrandInfoModel>(), response.data);
                        let brandTempList = Array<BrandOption>();
                        allBrands.forEach(item => {
                            const brandOption: BrandOption = {
                                value: item.brandId,
                                label: item.brandName,
                            };
                            brandTempList.push(brandOption)
                        })
                        setBrandList(brandTempList.filter(
                            (thing, i, arr) => arr.findIndex(t => t.value === thing.value) === i
                        ));

                    }
                    else {
                        //  disableSplashScreen()
                        console.log("Problem in getting brand list")
                    }
                })
                    .catch(() => {
                        // disableSplashScreen()
                        console.log("Problem in getting brand list")
                    })


                // Getting Curremcy
                getAllCurrency().then((response) => {
                    if (response.status === 200) {
                        let allCurrencies = Object.assign(new Array<CurrencyModel>(), response.data);
                        let currencyTempList = Array<CurrencyOption>();

                        allCurrencies.forEach(item => {
                            const currencyOption: BrandOption = {
                                value: item.id,
                                label: item.name,
                            };
                            currencyTempList.push(currencyOption)
                        })
                        setCurrencyList(currencyTempList.filter(
                            (thing, i, arr) => arr.findIndex(t => t.value === thing.value) === i
                        ));
                    }
                    else {
                        // disableSplashScreen()
                        console.log("Problem in curremcy brand list")
                    }
                })
                    .catch(() => {
                        //disableSplashScreen()
                        console.log("Problem in curremcy brand list")
                    })

            }, 1000)
            setFilterLoaded(true)
        }
    });

    useEffect(() => {


        const table = $(".table-teams")
            .find('table')
            .DataTable();
        table.clear();
        table.rows.add(teamList);
        table.on('order.dt search.dt', function () {
            table.column(0, { search: 'applied', order: 'applied' }).nodes().each(function (cell, i) {
                cell.innerHTML = i + 1;
            });
        }).draw();

        table.on('draw.dt', function () {
            var popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'))
            if (popoverTriggerList.length > 0) {
                var popoverList = popoverTriggerList.map(function (popoverTriggerEl) {

                    return new Bootstrap.Popover(popoverTriggerEl)
                })
            }

            teamList.forEach(team => {
                if (userAccess.includes(USER_CLAIMS.TeamsWrite) === false) {
                    $("#team-clone-" + team.id).hide()
                }
            });
        });

        teamList.forEach(team => {
            if (userAccess.includes(USER_CLAIMS.TeamsWrite) === false) {
                $("#team-clone-" + team.id).hide()
            }
        });


    }, [teamList])

    // -----------------------------------------------------------------
    // METHODS
    // -----------------------------------------------------------------
    function ClearFilter() {
        //setTeamList([]);
        setSelectedStatuses('');
        setSelectedRoles('')
        setSelectedOperators('')
        setSelectedBrands('')
        setSelectedCurrencies('')

        initialValues.teamId = ''
        initialValues.teamName = ''
        initialValues.queueId = ''
        initialValues.userId = ''

        formik.setFieldValue('teamId', initialValues.teamId);
        formik.setFieldValue('teamName', initialValues.teamName);

        // const table = $(".table-teams")
        //     .find('table')
        //     .DataTable();
        // table.clear();
        // table.on('order.dt search.dt', function () {
        //     table.column(0, { search: 'applied', order: 'applied' }).nodes().each(function (cell, i) {
        //         cell.innerHTML = i + 1;
        //     });
        // }).draw();
    }

    function onChangeSelectedStatues(val: string) {
        setSelectedStatuses(val)
    }

    function onChangeSelectedRoles(val: string) {
        setSelectedRoles(val);
    }

    function onChangeSelectedOperators(val: string) {
        setSelectedOperators(val);
    }

    function onChangeSelectedBrands(val: string) {
        setSelectedBrands(val);
    }

    function onChangeSelectedCurrencies(val: string) {
        setSelectedCurrencies(val);
    }

    // -----------------------------------------------------------------
    // RETURN ELEMENTS
    // -----------------------------------------------------------------
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
                        <h5 className='fw-bolder m-0'>Search Teams</h5>
                    </div>
                </div>
                <div className='card-body p-9'>
                    <div className='d-flex'>

                        <div className="row mb-3 ">
                            <div className="row mb-3">
                                <div className="col-sm-2">
                                    <label className="form-label-sm">Team Id</label>
                                </div>
                                <div className="col-sm-6 mr-auto">
                                    <input type="text" className="form-control form-control-sm" aria-label="Team Id"
                                        {...formik.getFieldProps('teamId')}
                                    />
                                </div>
                            </div>
                            <div className="row mb-3">
                                <div className="col-sm-2">
                                    <label className="form-label-sm">Team Name </label>
                                </div>
                                <div className="col-sm-6">
                                    <input type="text" className="form-control form-control-sm" aria-label="Team Name"
                                        {...formik.getFieldProps('teamName')}
                                    />
                                </div>
                            </div>
                            <div className="row mb-3">
                                <div className="col-sm-2">
                                    <label className="form-label-sm">Team Status</label>
                                </div>
                                <div className="col-sm-6">
                                    <Select
                                        isMulti
                                        options={statusOptions}
                                        onChange={onChangeSelectedStatues}
                                        value={selectedStatuses}
                                    />
                                </div>
                            </div>
                            <div className="row mb-3 mr-auto">
                                <div className="col-sm-2">
                                    <label className="form-label-sm">Roles Name</label>
                                </div>
                                <div className="col-sm-6">
                                    <Select
                                        {...formik.getFieldProps('roles')}
                                        isMulti
                                        options={roleList}
                                        onChange={onChangeSelectedRoles}
                                        value={selectedRoles}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="row mb-3">
                            <div className="row mb-3">
                                <div className="col-sm-2">
                                    <label className="form-label-sm">Operator Name</label>
                                </div>
                                <div className="col-sm-10">
                                    <Select
                                        isMulti
                                        options={operatorList}
                                        onChange={onChangeSelectedOperators}
                                        value={selectedOperators}
                                    />
                                </div>
                            </div>
                            <div className="row mb-3">
                                <div className="col-sm-2">
                                    <label className="form-label-sm">Brand Name</label>
                                </div>
                                <div className="col-sm-10">
                                    <Select
                                        isMulti
                                        options={brandList}
                                        onChange={onChangeSelectedBrands}
                                        value={selectedBrands}
                                    />
                                </div>
                            </div>
                            <div className="row mb-3">
                                <div className="col-sm-2">
                                    <label className="form-label-sm">Currency</label>
                                </div>
                                <div className="col-sm-10">
                                    <Select
                                        isMulti
                                        options={currencyList}
                                        onChange={onChangeSelectedCurrencies}
                                        value={selectedCurrencies}
                                    />
                                </div>
                            </div>
                        </div>


                    </div>
                    <div className="d-flex my-4">
                        <button type='submit' className="btn btn-primary btn-sm me-2">
                            {!loading && <span className='indicator-label'>Search</span>}
                            {loading && (
                                <span className='indicator-progress' style={{ display: 'block' }}>
                                    Please wait...
                                    <span className='spinner-border spinner-border-sm align-middle ms-2'></span>
                                </span>
                            )}
                        </button>
                        <button type='button' className="btn btn-secondary btn-sm me-2" onClick={ClearFilter}>Clear</button>
                        {(userAccess.includes(USER_CLAIMS.TeamsWrite) === true) && (
                            <a onClick={() => history.push('/user-management/create-team')} className="btn btn-primary btn-sm me-0" role="button"> Create New</a>
                        )}
                    </div>

                    <table id="table-teams" className="table table-hover table-rounded table-striped border gy-3 gs-3" />
                </div>
            </div>

        </form>
    )

}
export default TeamList;

const columns = [
    {
        title: 'No',
        data: null,
        className: 'align-middle',
    },
    {
        title: 'Team ID',
        data: 'id',
        className: 'align-middle',
    },
    {
        title: 'Team Name',
        data: 'name',
        className: 'align-middle',
    },
    {
        title: 'Team Status',
        data: 'status',
        className: 'align-middle',
        render: function (data: any, row: any) {
            var statusFlag: string;
            statusFlag = '';
            if (data === 1) {
                statusFlag = 'Active'
            }
            else if (data === 2) {
                statusFlag = 'Inactive'
            } else {
                statusFlag = 'Active'
            }
            return statusFlag;
        }
    },
    {
        title: 'Operator Name',
        data: 'operators',
        className: 'align-middle',
        render: function (data: any, row: any) {
            var result: string;
            result = '';
            for (let item of data) {
                if (result.indexOf(item.operatorName) === -1) {
                    result = result + item.operatorName + ',';
                }
            }
            result = result.slice(0, -1);
            return `<button type="button" class="btn btn-outline-info btn-sm" data-bs-trigger="hover" data-bs-toggle="popover" title="Operator Names" data-bs-content="` + result + `">View</button>`;

        }


    },
    {
        title: 'Brands Name',
        data: 'brands',
        className: 'align-middle',
        render: function (data: any, row: any) {
            var result: string;
            result = '';
            console.log('brands')
            console.log(data)
            for (let item of data) {
                if (result.indexOf(item.brandName) === -1) {
                    result = result + item.brandName + ',';

                }
            }
            result = result.slice(0, -1);
            return `<button type="button"  class="btn btn-outline-info btn-sm" data-bs-trigger="hover" data-bs-toggle="popover" title="Brand Names" data-bs-content="` + result + `">View</a>`;

        }
    },
    {
        title: 'Currency',
        data: 'currencies',
        className: 'align-middle',
        render: function (data: any, row: any) {
            var result: string;
            result = '';
            console.log('japs')
            console.log(data)
            for (let item of data) {
                if (result.indexOf(item.currencyName) === -1) {
                    result = result + item.currencyName + ',';
                }
            }
            result = result.slice(0, -1);
            return `<button type="button" class="btn btn-outline-info btn-sm" data-bs-trigger="hover" data-bs-toggle="popover" title="Currencies" data-bs-content="` + result + `">View</button>`;
        }


    },
    {
        title: 'Roles Name',
        data: 'roles',
        className: 'align-middle',
        render: function (data: any, row: any) {
            var result: string;
            result = '';
            for (let item of data) {
                if (result.indexOf(item.roleName) === -1) {
                    result = result + item.roleName + ',';
                }

            }
            result = result.slice(0, -1);
            return `<button type="button" class="btn btn-outline-info btn-sm" data-bs-trigger="hover" data-bs-toggle="popover" title="Role Names" data-bs-content="` + result + `">View</button>`;

        }

    },
    {
        title: 'Action',
        data: null,
        render: function (data: any, row: any) {
            return `<div class='d-flex justify-content-center flex-shrink-0'>
                          <a
                          href='/user-management/edit-team/` + data.id + `' 
                          class='btn btn-outline-primary btn-sm px-4 fw-bolder'
                          > Edit</a> 
                          <a id='team-clone-` + data.id + `'
                          href='/user-management/create-team/clone/` + data.id + `' 
                          class='btn btn-outline-primary btn-sm px-4 fw-bolder'
                          > Clone</a>             
                 </div>`;
        }
    }
];
