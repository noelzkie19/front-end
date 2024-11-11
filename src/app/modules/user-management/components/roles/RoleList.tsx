import "datatables.net";
import "datatables.net-dt";
import {useFormik} from 'formik';
import {Guid} from "guid-typescript";
import $ from "jquery";
import React, {useEffect, useState} from 'react';
import {shallowEqual, useSelector} from 'react-redux';
import {useHistory} from "react-router-dom";
import swal from 'sweetalert';
import * as Yup from 'yup';
import '../../../../../_metronic/assets/css/datatables.min.css';
import {RootState} from '../../../../../setup';
import * as InternetConnectionHandler from '../../../../../setup/internet-connection/InternetConnectionHandler';
import * as sessionHandler from '../../../../../setup/session/SessionHandler';
import {ElementStyle} from '../../../../constants/Constants';
import {MlabButton} from '../../../../custom-components';
import {USER_CLAIMS} from '../../../user-management/components/constants/UserClaims';
import {RoleFilterModel} from '../../models/RoleFilterModel';
import {RoleModel} from '../../models/RoleModel';
import {UseUserRoleHooks} from '../shared/hooks/UseUserRoleHooks';

const operatorFilterSchema = Yup.object().shape({
    roleId: Yup.string(),
    roleName: Yup.string(),
    roleStatus: Yup.string(),
    queueId: Yup.string(),
    userId: Yup.string(),
})

const initialValues = {
    roleId: '',
    roleName: '',
    roleStatus: '0',
    queueId: '',
    userId: ''
}


const RoleList: React.FC = () => {

    // -----------------------------------------------------------------
    // GET REDUX STORE
    // -----------------------------------------------------------------
    const userAccessId = useSelector<RootState>(({ auth }) => auth.userId, shallowEqual) as number
    const userAccess = useSelector<RootState>(({ auth }) => auth.access, shallowEqual) as string
    const expiresIn = useSelector<RootState>(({ auth }) => auth.expiresIn, shallowEqual) as string
    const history = useHistory();

    // -----------------------------------------------------------------
    // STATES
    // -----------------------------------------------------------------
    const [loading, setLoading] = useState(false)
    const [roleList, setRoleList] = useState<Array<RoleModel>>([])
    //  const dispatch = useDispatch()

    // -----------------------------------------------------------------
    // Hooks
    // -----------------------------------------------------------------
    const { roleMasterList, getRoleMasterList} = UseUserRoleHooks();

    // -----------------------------------------------------------------
    // FORMIK FORM POST
    // -----------------------------------------------------------------
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


            values.queueId = Guid.create().toString();
            values.userId = userAccessId.toString();

            if (Number.isInteger(parseInt(values.roleId)) === false && (values.roleId !== '')) {
                swal("Failed", "Role Id should be a number", "error");
                setLoading(false)
                setSubmitting(false)
                return;

            }


            const convertedRoleId = values.roleId === '' ? 0 : parseInt(values.roleId);

            $("#table-roles").DataTable({
                retrieve: true,
                dom: '<"table-roles"ltip>',
                columns,
                data: roleList,
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
                setRoleList([]);
                const request: RoleFilterModel = {
                    queueId: values.queueId,
                    roleId: convertedRoleId,
                    roleName: values.roleName,
                    status: parseInt(values.roleStatus),
                    userId: values.userId
                }
                LoadRoleMasterList(request)
                setSubmitting(false);
            }, 1000)
        },
    })

    const LoadRoleMasterList = async(request: RoleFilterModel) => {
       await getRoleMasterList(request);
    }

    // -----------------------------------------------------------------
    // MOUNTED
    // -----------------------------------------------------------------
    useEffect(() => {

        const table = $(".table-roles")
            .find('table')
            .DataTable();
        table.clear();
        table.rows.add(roleList);
        table.on('order.dt search.dt', function () {
            table.column(0, { search: 'applied', order: 'applied' }).nodes().each(function (cell, i) {
                cell.innerHTML = i + 1;
            });
        }).draw();

        table.on('draw.dt', function () {
            roleList.forEach(role => {
                if (userAccess.includes(USER_CLAIMS.RolesWrite) === false) {
                    $("#role-clone-" + role.roleId).hide()
                }
            });
        })

        roleList.forEach(role => {
            if (userAccess.includes(USER_CLAIMS.RolesWrite) === false) {
                $("#role-clone-" + role.roleId).hide()
            }
        });


    }, [roleList])

    useEffect(() => {
        if (!roleMasterList) return
        setRoleList(roleMasterList);
        setLoading(false);
    },[roleMasterList])

    // -----------------------------------------------------------------
    // METHODS
    // -----------------------------------------------------------------
    function ClearFilter() {

        initialValues.roleId = ''
        initialValues.roleName = ''
        initialValues.roleStatus = '0'
        initialValues.queueId = ''
        initialValues.userId = ''
        formik.setFieldValue('roleId', initialValues.roleId);
        formik.setFieldValue('roleName', initialValues.roleName);
        formik.setFieldValue('roleStatus', initialValues.roleStatus);
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
                    data-bs-toggle='collapse'
                    data-bs-target='#kt_account_deactivate'
                    aria-expanded='true'
                    aria-controls='kt_account_deactivate'
                >
                    <div className='card-title m-0'>
                        <h5 className='fw-bolder m-0'>Search Roles</h5>
                    </div>
                </div>
                <div className='card-body p-9'>
                    <div className='d-flex align-items-center my-2'>
                        {/* <div className="row mb-3"> */}
                        <div className="row mb-3">
                            <div className="col-sm-4">
                                <label className="form-label-sm">Role Id</label>
                            </div>
                            <div className="col-sm-10">
                                <input type="text" className="form-control form-control-sm" aria-label="Role Id"
                                    {...formik.getFieldProps('roleId')}
                                />
                            </div>
                        </div>
                        <div className="row mb-3">
                            <div className="col-sm-4">
                                <label className="form-label-sm">Role Name </label>
                            </div>
                            <div className="col-sm-10">
                                <input type="text" className="form-control form-control-sm" aria-label="Role Name"
                                    {...formik.getFieldProps('roleName')}
                                />
                            </div>
                        </div>
                        <div className="row mb-3">
                            <div className="col-sm-4">
                                <label className="form-label-sm">Status</label>
                            </div>
                            <div className="col-sm-10">
                                <select className="form-select form-select-sm" aria-label="Select status"
                                    {...formik.getFieldProps('roleStatus')}
                                >
                                    <option value="0"></option>
                                    <option value="1">Active</option>
                                    <option value="2">Inactive</option>
                                </select>
                            </div>
                        </div>
                        {/* </div> */}

                    </div>
                    <div className="d-flex my-4">
                        <button type='submit' className="btn btn-primary btn-sm me-2" disabled={formik.isSubmitting}>
                            {!loading && <span className='indicator-label'>Search</span>}
                            {loading && (
                                <div className='indicator-progress d-flex' >
                                    <div>Please wait...</div>
                                    <div className='spinner-border spinner-border-sm align-middle ms-2'></div>
                                </div>
                            )}
                        </button>
                        <button type='button' className="btn btn-secondary btn-sm me-2" onClick={ClearFilter}>Clear</button>
                        <MlabButton
                            access={userAccess.includes(USER_CLAIMS.RolesWrite)}
                            label='Create New'
                            style={ElementStyle.primary}
                            type={'button'}
                            weight={'solid'}
                            size={'sm'}
                            loading={loading}
                            loadingTitle={'Please wait...'}
                            disabled={loading}
                            onClick={() => history.push('/user-management/create-role')}
                        />
                    </div>

                    <table id="table-roles" className="table table-hover table-rounded table-striped border gy-3 gs-3" />
                </div>
            </div>

        </form>
    )
}
export default RoleList;

const columns = [
    {
        title: 'No',
        data: null,
        className: 'align-middle'
    },
    {
        title: 'Role ID',
        data: 'roleId',
        className: 'align-middle'
    },
    {
        title: 'Role Name',
        data: 'roleName',
        className: 'align-middle'
    },
    {
        title: 'Role Description',
        data: 'roleDescription',
        className: 'align-middle'
    },
    {
        title: 'Role Status',
        data: 'status',
        className: 'align-middle',
        render: function (data: any, row: any) {
            let statusFlag: string = '';
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
        title: 'Action',
        data: null,

        render: function (data: any, row: any) {
            return `<div class='d-flex justify-content-center flex-shrink-0'>
                          <a
                          href='/user-management/edit-role/` + data.roleId + `' 
                          class='btn btn-outline-primary btn-sm px-4 fw-bolder'
                          > Edit</a>  
                          <a id='role-clone-` + data.roleId + `'
                          href='/user-management/create-role/clone/` + data.roleId + `' 
                          class='btn btn-outline-primary btn-sm px-4 fw-bolder'
                          > Clone</a>               
                 </div>`;
        }
    }
];
