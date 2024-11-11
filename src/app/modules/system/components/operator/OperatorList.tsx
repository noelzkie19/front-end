
import '@popperjs/core';
import * as Bootstrap from 'bootstrap';
import "datatables.net";
import "datatables.net-dt";
import {useFormik} from 'formik';
import $ from "jquery";
import React, {useEffect, useState} from 'react';
import {shallowEqual, useSelector} from 'react-redux';
import * as Yup from 'yup';
import '../../../../../_metronic/assets/css/datatables.min.css';
import {OperatorModel} from '../../models/OperatorModel';
//import * as System from '../../redux/SystemRedux'
import {useHistory} from "react-router-dom";
import swal from 'sweetalert';
import {RootState} from '../../../../../setup';
import * as InternetConnectionHandler from '../../../../../setup/internet-connection/InternetConnectionHandler';
import * as sessionHandler from '../../../../../setup/session/SessionHandler';
import useConstant from '../../../../constants/useConstant';
import {USER_CLAIMS} from '../../../user-management/components/constants/UserClaims';
import {getOperatorList} from '../../redux/SystemService';



const operatorFilterSchema = Yup.object().shape({
  operatorId: Yup.string(),
  operatorName: Yup.string(),
  brandId: Yup.string(),
  brandName: Yup.string(),
})

const initialValues = {
  operatorId: '',
  operatorName: '',
  brandId: '',
  brandName: '',
}


const OperatorList: React.FC = () => {

  // -----------------------------------------------------------------
  // STATES
  // -----------------------------------------------------------------
  const [loading, setLoading] = useState(false)
  const [operatorList, setOperatorList] = useState<Array<OperatorModel>>([])
  // const dispatch = useDispatch()

  const userAccess = useSelector<RootState>(({ auth }) => auth.access, shallowEqual) as string
  const expiresIn = useSelector<RootState>(({ auth }) => auth.expiresIn, shallowEqual) as string
  const history = useHistory();
  const {SwalFailedMessage, SwalOperatorMessage} = useConstant();
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

      if (Number.isInteger(parseInt(values.operatorId)) === false && (values.operatorId !== '')) {
        swal(SwalFailedMessage.title, SwalOperatorMessage.textErrorOperatorFilterType, SwalFailedMessage.icon);
        setLoading(false)
        setSubmitting(false)
        return;

      }
      if (Number.isInteger(parseInt(values.brandId)) === false && values.brandId !== '') {
        swal(SwalFailedMessage.title, SwalOperatorMessage.textErrorBrandFilterType, SwalFailedMessage.icon);
        setLoading(false)
        setSubmitting(false)
        return;
      }


      const convertedOperatorId = values.operatorId === '' ? 0 : parseInt(values.operatorId);
      const convertedBrandId = values.brandId === '' ? 0 : parseInt(values.brandId);

      $("#table-operator").DataTable({
        retrieve: true,
        dom: '<"table-operator"ltip>',
        columns: oprColumns,
        data: operatorList,
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
        getOperatorList(convertedOperatorId, values.operatorName, convertedBrandId, values.brandName).then((response) => {
          let resultData = Object.assign(new Array<OperatorModel>(), response.data);
          setOperatorList(resultData);
          setLoading(false)
          setSubmitting(false)

        })
          .catch(() => {
            setLoading(false)
            setSubmitting(false)
          });
        // resetForm({})
      }, 1000)
    },
  })

  // -----------------------------------------------------------------
  // MOUNTED
  // -----------------------------------------------------------------
  useEffect(() => {
    const table = $(".table-operator")
      .find('table')
      .DataTable();
    table.clear();
    table.rows.add(operatorList);
    table.on('order.dt search.dt', function () {
      table.column(0, { search: 'applied', order: 'applied' }).nodes().each(function (cell, i) {
        cell.innerHTML = i + 1;
      });
    }).draw();

    const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'))
    if (popoverTriggerList.length > 0) {       
      popoverTriggerList.forEach(function (popoverTriggerEl) {
        return new Bootstrap.Popover(popoverTriggerEl)
      })
    }
  }, [operatorList])

  // -----------------------------------------------------------------
  // METHOD
  // -----------------------------------------------------------------
  function ClearFilter() {

    initialValues.operatorId = ''
    initialValues.operatorName = ''
    initialValues.brandId = ''
    initialValues.brandName = ''

    formik.setFieldValue('operatorId', initialValues.operatorId);
    formik.setFieldValue('operatorName', initialValues.operatorName);
    formik.setFieldValue('brandId', initialValues.brandId);
    formik.setFieldValue('brandName', initialValues.brandName);
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
            <h5 className='fw-bolder m-0'>Search Operators</h5>
          </div>
        </div>
        <div className='card-body p-9'>
          <div className='d-flex align-items-center my-2'>
            <div className="row mb-3">
              <div className="row mb-3">
                <div className="col-sm-3">
                  <label htmlFor='operator-id' className="form-label-sm">Operator Id</label>
                </div>
                <div className="col-sm-9">
                  <input id='operator-id' type="text" className="form-control form-control-sm" aria-label="Operator Id"
                    {...formik.getFieldProps('operatorId')}
                  />
                </div>
              </div>
              <div className="row mb-3">
                <div className="col-sm-3">
                  <label htmlFor='operator-name' className="form-label-sm">Operator Name </label>
                </div>
                <div className="col-sm-9">
                  <input id='operator-name' type="text" className="form-control form-control-sm" aria-label="Operator Name"
                    {...formik.getFieldProps('operatorName')}
                  />
                </div>
              </div>
            </div>

            <div className="row mb-3">
              <div className="row mb-3">
                <div className="col-sm-3">
                  <label htmlFor='brand-id' className="form-label-sm">Brand Id</label>
                </div>
                <div className="col-sm-9">
                  <input id='brand-id' type="text" className="form-control form-control-sm" aria-label="Brand Id"
                    {...formik.getFieldProps('brandId')}
                  />
                </div>
              </div>
              <div className="row mb-3">
                <div className="col-sm-3">
                  <label htmlFor='brand-name' className="form-label-sm">Brand Name</label>
                </div>
                <div className="col-sm-9">
                  <input id='brand-name' type="text" className="form-control form-control-sm" aria-label="Brand Name"
                    {...formik.getFieldProps('brandName')}
                  />
                </div>
              </div>
            </div>


          </div>
          <div className="d-flex my-4">
            <button type='submit' className="btn btn-primary btn-sm me-2" disabled={formik.isSubmitting}>
              {!loading && <span className='indicator-label'>Search</span>}
              {loading && (
                <span className='indicator-progress' style={{ display: 'block' }}>
                  Please wait...{''}
                  <span className='spinner-border spinner-border-sm align-middle ms-2'></span>
                </span>
              )}
            </button>
            <button type='button' className="btn btn-secondary btn-sm me-2" onClick={ClearFilter}>Clear</button>

            {(userAccess.includes(USER_CLAIMS.OperatorAndBrandWrite) === true) && (
              <button onClick={() => history.push('/system/create-operator')} className="btn btn-primary btn-sm me-0"> Create New</button>
            )}
          </div>

          <table id="table-operator" className="table table-hover table-rounded table-striped border gy-3 gs-3" />
        </div>
      </div>

    </form>
  )
}
export default OperatorList;

const oprColumns = [
  {
    className: 'align-middle',
    data: null,
    title: 'No',
  },
  {
    className: 'align-middle',
    data: 'operatorId',
    title: 'Operator ID',
  },
  {
    className: 'align-middle',
    data: 'operatorName',
    title: 'Operator Name',
  },
  {
    className: 'align-middle',
    data: 'operatorStatus',
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
    },
    title: 'Status',
  },
  {
    className: 'align-middle',
    data: 'brands',
    render: function (data: any, row: any) {
      let result: string;
      result = '';
      for (let item of data) {
        result = result + item.id + ',';
      }
      result = result.slice(0, -1);
      return `<button type="button" class="btn btn-outline-info btn-sm" data-bs-trigger="hover" data-bs-toggle="popover" title="Brand Ids" data-bs-content="` + result + `">View</button>`;
    },
    title: 'BrandId',

  },
  {
    className: 'align-middle',
    data: 'brands',
    title: 'Brand Name',
    render: function (data: any, row: any) {
      let result: string;
      result = '';
      for (let item of data) {
        result = result + item.name + ',';
      }
      result = result.slice(0, -1);
      return `<button type="button" class="btn btn-outline-info btn-sm" data-bs-trigger="hover" data-bs-toggle="popover" title="Brand Names" data-bs-content="` + result + `">View</button>`;
    }

  },
  {
    className: 'align-middle',
    data: null,
    render: function (data: any, row: any) {
      return `<div class='d-flex justify-content-center flex-shrink-0'>
                        <a
                        href='/system/edit-operator/` + data.operatorId + `' 
                        class='btn btn-outline-primary btn-sm px-4 fw-bolder'
                        > Edit</a>         
                   </div>`;
    },
    title: 'Action',
  }
];