import React, {useEffect, useState} from 'react'
// import React, { useState, useEffect, useLayoutEffect } from 'react'
import "datatables.net"
import "datatables.net-dt"
import {useFormik} from 'formik'
import $ from "jquery"
import {shallowEqual, useSelector} from 'react-redux'
import {useHistory} from "react-router-dom"
import swal from 'sweetalert'
import * as Yup from 'yup'
import '../../../../../_metronic/assets/css/datatables.min.css'
import '../../../../../_metronic/assets/css/inputNumberPatch.css'
import '../../../../../_metronic/assets/sass/core/components/_variables.scss'
import {RootState} from '../../../../../setup'
import * as InternetConnectionHandler from '../../../../../setup/internet-connection/InternetConnectionHandler'
import * as sessionHandler from '../../../../../setup/session/SessionHandler'
import {PROMPT_MESSAGES} from '../../../../constants/Constants'
import useConstant from '../../../../constants/useConstant'
import {BrandModel} from '../../models/BrandModel'
import {CurrencyModel} from '../../models/CurrencyModel'
import {OperatorModel} from '../../models/OperatorModel'
import {addOperator, getAllCurrency, getBrandExistingList} from '../../redux/SystemService'

const operatorSchema = Yup.object().shape({
    operatorId: Yup.string(),
    operatorName: Yup.string(),
    operatorStatus: Yup.number(),
    brands: Yup.array(),
    createdBy: Yup.number()
})

const initialValues = {
    operatorId: '',
    operatorName: '',
    operatorStatus: 0,
    brands: Array<BrandModel>(),
    createdBy: 0
}

const CreateOperator: React.FC = () => {

    // -----------------------------------------------------------------
    // GET REDUX STORE
    // -----------------------------------------------------------------
    const userAccessId = useSelector<RootState>(({ auth }) => auth.userId, shallowEqual) as number
    //const userAccess = useSelector<RootState>(({ auth }) => auth.access, shallowEqual) as string
    const expiresIn = useSelector<RootState>(({ auth }) => auth.expiresIn, shallowEqual) as string
    const history = useHistory();
    const {SwalFailedMessage, SwalConfirmMessage, SwalServerErrorMessage, SwalSuccessMessage, SwalOperatorMessage, successResponse} = useConstant();
    // -----------------------------------------------------------------
    // STATE
    // -----------------------------------------------------------------
    const [loading, setLoading] = useState(false)
    const [brandList, setBrandList] = useState<BrandModel[]>([])
    const [addedBrandId, setAddedBrandId] = useState('');
    const [addedBrandName, setAddedBrandName] = useState('');

    //const dispatch = useDispatch()


    // -----------------------------------------------------------------
    // MOUNTED
    // -----------------------------------------------------------------
    useEffect(() => {

        $("#table-brands").DataTable({
            retrieve: true,
            dom: '<"table-brands"ltip>',
            columns: cColumns,
            data: brandList,
            ordering: true,
            paging: true,
            pagingType: 'full_numbers',
            pageLength: 10,
            "order": [[1, 'asc']],
            language: {
                "emptyTable": "No Rows To Show"
              },
        });

    }, [brandList]);


    useEffect(() => {
        const table = $(".table-brands")
            .find('table')
            .DataTable();
        table.rows.add(brandList);
        table.on('order.dt search.dt', function () {
            table.column(0, { search: 'applied', order: 'applied' }).nodes().each(function (cell, i) {
                cell.innerHTML = i + 1;
            });
        }).draw();

    }, [brandList])

    const _validateForm = (operatorId: string, operatorName: string, operatorStatus: number, brands: Array<BrandModel>) => {
        let isValid: boolean = true;

        if (operatorId === '' || operatorName === '' || operatorStatus == 0 || brands.length === 0) {
            swal(SwalFailedMessage.title, SwalOperatorMessage.textErrorCreateOperator, SwalFailedMessage.icon);
            setLoading(false)
            isValid = false;
            return;
        }
        if (brands.length !== 0) {
            brands.forEach(brand => {
                let hasChecked: boolean = false;
                brand.currencies.forEach(currency => {
                    if (currency.status === 1) {
                        hasChecked = true;
                    }
                })
                if (hasChecked === false) {
                    swal(SwalFailedMessage.title, SwalOperatorMessage.textErrorCreateOperator, SwalFailedMessage.icon);
                    setLoading(false)
                    isValid = false;
                }
            })
        }
        return isValid;
    }

    const createOperator = (request: OperatorModel) => {
        addOperator(request)
            .then((response) => {
                if (response.data.status !== successResponse) {
                    swal(SwalServerErrorMessage.title, response.data.message, SwalServerErrorMessage.icon);
                } else {
                    clearInput()
                    formik.setFieldValue('operatorId', '');
                    formik.setFieldValue('operatorName', '');
                    formik.setFieldValue('operatorStatus', 0);
                    formik.setFieldValue('brands', []);
                    swal(SwalSuccessMessage.title, SwalSuccessMessage.textSuccess, SwalSuccessMessage.icon)
                    .then(() => {
                        window.location.href = '/system/operator-list'
                    })
                }
        }).catch((ex) => {
            console.log('problem in inserting operator' + ex)
        });
    }

    // -----------------------------------------------------------------
    // FORMIK FOR POST
    // -----------------------------------------------------------------
    const formik = useFormik({
        initialValues,
        validationSchema: operatorSchema,
        onSubmit: (values, { setStatus, setSubmitting, resetForm }) => {
            if (InternetConnectionHandler.isSlowConnection(history) === true 
                    || sessionHandler.isSessionExpired(expiresIn, history) === true) {
                return;
            }
            
            setLoading(true)
            setTimeout(() => {
                values.createdBy = userAccessId;
                values.brands = getCurrenciesValueByBrand();
                let isValid = _validateForm(values.operatorId, values.operatorName, values.operatorStatus, values.brands);
                if (isValid === true) {
                    swal({
                        title: PROMPT_MESSAGES.ConfirmSubmitTitle,
                        text: PROMPT_MESSAGES.ConfirmSubmitMessageAdd,
                        icon: SwalConfirmMessage.icon,
					    buttons: [SwalConfirmMessage.btnNo, SwalConfirmMessage.btnYes],
                        dangerMode: true
                    })
                        .then((willCreate) => {
                            if (willCreate) {
                                const request: OperatorModel = {
                                    operatorId: parseInt(values.operatorId),
                                    operatorName: values.operatorName,
                                    operatorStatus: values.operatorStatus,
                                    brands: values.brands,
                                    createdBy: values.createdBy
                                };
                                setSubmitting(true);
                                createOperator(request);
                            } else {
                                setLoading(false)
                                setSubmitting(false)
                            }
                        });
                }
                setLoading(false)
                setSubmitting(false)
            }, 1000)
        },
    })

    // -----------------------------------------------------------------
    // METHODS
    // -----------------------------------------------------------------
    function clearInput() {
        setBrandList([]);
        const table = $(".table-brands")
            .find('table')
            .DataTable();
        table.clear();
        table.on('order.dt search.dt', function () {
            table.column(0, { search: 'applied', order: 'applied' }).nodes().each(function (cell, i) {
                cell.innerHTML = i + 1;
            });
        }).draw();

        setAddedBrandId('');
        setAddedBrandName('')
    }

    function getCurrenciesValueByBrand(): Array<BrandModel> {
        let tempBrandList = JSON.parse(JSON.stringify(brandList)) as Array<BrandModel>
        tempBrandList.forEach(brand => {
            brand.currencies.forEach(currency => {
                let elementId = brand.name + "-" + currency.name + "-" + currency.id;
                let inputValue = document.getElementById(elementId) as HTMLInputElement;
                currency.status = inputValue.checked === true ? 1 : 2;
            })
        })
        return tempBrandList;
    }

    async function addBrand() {

        if (addedBrandId === '' || addedBrandName === '') {
            swal(SwalFailedMessage.title, SwalOperatorMessage.textErrorBrandValidation, SwalFailedMessage.icon);
        } else if (brandList.find((x) => x.id === parseInt(addedBrandId)) || brandList.find((x) => x.name.toLowerCase() === addedBrandName.toLowerCase())) {
            swal(SwalFailedMessage.title, SwalOperatorMessage.textErrorBrandDuplicate, SwalFailedMessage.icon);
        } else {
            await GetAllCurrencyList();
        }
    }

    const onChangeBrandIdInput = (val: string) => {
        setAddedBrandId(val);
    };
    const onChangeBrandNameInput = (val: string) => {
        setAddedBrandName(val);
    };

    async function GetAllCurrencyList() {

        setTimeout(() => {
            getBrandExistingList(addedBrandId, addedBrandName).then((response) => {
                if (response.data.status !== successResponse) {
                    swal(SwalServerErrorMessage.title, response.data.message, SwalServerErrorMessage.icon);

                } else {

                    getAllCurrency().then((response) => {
                        let allCurrencies = Object.assign(new Array<CurrencyModel>(), response.data);

                        allCurrencies.forEach(element => {
                            element.status = 2
                        });


                        let tempBrandList = Array<BrandModel>();
                        const brandItem: BrandModel = {
                            id: parseInt(addedBrandId),
                            name: addedBrandName,
                            status: 1,
                            currencies: allCurrencies,
                            createStatus: 0
                        }

                        tempBrandList.push(brandItem);

                        let previousBrandList = brandList;

                        tempBrandList.forEach(brand => {
                            previousBrandList.push(brand)
                        })


                        setBrandList(previousBrandList);

                        const table = $(".table-brands")
                            .find('table')
                            .DataTable();
                        table.rows.add(tempBrandList);

                        table.on('order.dt search.dt', function () {
                            table.column(0, { search: 'applied', order: 'applied' }).nodes().each(function (cell, i) {
                                cell.innerHTML = i + 1;
                            });
                        }).draw();

                        setAddedBrandId('');
                        setAddedBrandName('')

                    }).catch((ex) => {
                        console.log('problem in getting currencies' + ex)
                    });

                }

            })
                .catch((ex) => {
                    console.log('problem in getting exsting brands' + ex)
                });
        }, 1000);
    }

    function onClose() {
        swal({
            title: PROMPT_MESSAGES.ConfirmCloseTitle,
            text: PROMPT_MESSAGES.ConfirmCloseMessage,
            icon: SwalConfirmMessage.icon,
            buttons: [SwalConfirmMessage.btnNo, SwalConfirmMessage.btnYes],
            dangerMode: true
        }).then((willClose) => {
            if (willClose) {
                history.push("/system/operator-list");
             }
       })
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
                        <h5 className='fw-bolder m-0'>Create Operator</h5>
                    </div>
                </div>
                <div className='card-body p-9'>

                    <div className='d-flex align-items-center my-2'>
                        <div className="row mb-3">
                            <div className="row mb-3">
                                <div className="col-sm-2">
                                    <label htmlFor='create-operator-id' className="form-label-sm required">Operator Id </label>
                                </div>
                                <div className="col-sm-3">
                                    <input id='create-operator-id' type="number" className="form-control form-control-sm" aria-label="Operator Id"
                                        {...formik.getFieldProps('operatorId')}
                                    />
                                </div>
                            </div>
                            <div className="row mb-3">
                                <div className="col-sm-2">
                                    <label htmlFor='create-operator-name' className="form-label-sm required">Operator Name </label>
                                </div>
                                <div className="col-sm-3">
                                    <input id='create-operator-name' type="text" className="form-control form-control-sm" aria-label="Operator Name"
                                        {...formik.getFieldProps('operatorName')}
                                    />
                                </div>
                            </div>
                            <div className="row mb-3">
                                <div className="col-sm-2">
                                    <label htmlFor='create-status' className="form-label-sm required">Status</label>
                                </div>
                                <div className="col-sm-3">
                                    <select id='create-status' className="form-select form-select-sm" aria-label="Select status"
                                        {...formik.getFieldProps('operatorStatus')} 
                                    >
                                        <option value="0">Select</option>
                                        <option value="1">Active</option>
                                        <option value="2">Inactive</option>
                                    </select>
                                </div>
                            </div>
                            <div className="row mb-3">
                                <div className="separator border-4 my-10" />
                                <h6 className='fw-bolder m-0'>Brand</h6>
                                <br />
                                <br />

                                <div className="row mb-3">
                                    <div className="col-sm-2">
                                        <label htmlFor='create-brand-id' className="form-label-sm required">Brand Id</label>
                                    </div>
                                    <div className="col-sm-3">
                                        <input id="create-brand-id" type="number" className="form-control form-control-sm" aria-label="Brand Id" onChange={event => onChangeBrandIdInput(event.target.value)} value={addedBrandId} />
                                    </div>
                                </div>
                                <div className="row mb-3">
                                    <div className="col-sm-2">
                                        <label htmlFor='create-brand-name' className="form-label-sm required">Brand Name</label>
                                    </div>
                                    <div className="col-sm-3">
                                        <input id='create-brand-name' type="text" className="form-control form-control-sm" aria-label="Brand Id" onChange={event => onChangeBrandNameInput(event.target.value)} value={addedBrandName} />
                                    </div>
                                </div>
                            </div>
                            <div className="d-flex my-4 mb-10">
                                <button type='button' className="btn btn-primary btn-sm me-0" onClick={addBrand}>Add</button>
                            </div>

                            <table id="table-brands" className="table table-hover table-rounded table-striped border gy-3 gs-3" />

                            <div className="separator border-4 my-10" />                         

                            <div className="d-flex my-4">
                                <button type='submit' className="btn btn-primary btn-sm me-2" disabled={formik.isSubmitting}>
                                    {!loading && <span className='indicator-label'>Submit</span>}
                                    {loading && (
                                        <span className='indicator-progress' style={{ display: 'block' }}>
                                            Please wait...{''}
                                            <span className='spinner-border spinner-border-sm align-middle ms-2'></span>
                                        </span>
                                    )}
                                </button>

                                <button
                                    type='button'
                                    className='btn btn-sm btn-secondary'
                                    onClick={onClose}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </form>
    )
}
export default CreateOperator;

const cColumns = [
    {
        className: 'align-middle',
        data: null,
        title: 'No',
    },
    {   
        className: 'align-middle',
        data: 'id',
        title: 'Brand ID',
    },
    {   
        className: 'align-middle',
        data: 'name',
        title: 'Brand Name',

    },
    {
        className: 'align-middle',
        data: 'status',
        render: function (data: any, row: any) {
            let statusFlag: string;
            statusFlag = '';
            if (data === 1) {
                statusFlag = 'Active'
            }
            else if (data === 2) {
                statusFlag = 'InActive'
            }
            return statusFlag;
        },
        title: 'Brand Status',
    },
    {
        title: 'Currencies',
        data: 'currencies',
        className: 'align-middle',
        render: function (data: any, type: any, row: any, meta: any) {
            let result: string;
            result = '';
            for (let item of data) {
                let checkId = row.name + '-' + item.name + '-' + item.id;
                result = result + `<div className="mb-10">
                     <div className="form-check form-check-custom form-check-solid">
                        <input className="form-check-input" type="checkbox" value="" id='` + checkId + `'/>
                        <label className="form-check-label" for="flexCheckDefault">
                        ` + item.name + ` 
                        </label>
                  </div>
                </div>`;
            }
            return result;
            ;
        }
    },

];