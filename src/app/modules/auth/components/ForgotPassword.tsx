import React, { useState } from 'react'
import * as Yup from 'yup'
import clsx from 'clsx'
import { Link } from 'react-router-dom'
import { useFormik } from 'formik'
import { requestPassword } from '../redux/AuthCRUD'
import * as hubConnection from '../../../../setup/hub/MessagingHub'
import { Guid } from 'guid-typescript'
import swal from 'sweetalert'

const initialValues = {
  email: '',
  queueId: '',
  userId: '',
}

const forgotPasswordSchema = Yup.object().shape({
  email: Yup.string()
    .email('Email address not found, please input the correct email address or contact administrator')
    .min(3, 'Minimum 3 symbols')
    .max(50, 'Maximum 50 symbols')
    .required('Email is required'),
})

export function ForgotPassword() {

  // -----------------------------------------------------------------
  // STATES
  // -----------------------------------------------------------------
  const [loading, setLoading] = useState(false)
  const [hasErrors, setHasErrors] = useState<boolean | undefined>(undefined)
  const [errorMessage, setErrorMessage] = useState<string>('')

  // -----------------------------------------------------------------
  // FORMIK FORM POST
  // -----------------------------------------------------------------
  const formik = useFormik({
    initialValues,
    onSubmit: (values, { setStatus, setSubmitting }) => {
      values.queueId = Guid.create().toString();
      values.userId = '0';
      setLoading(true)
      setHasErrors(undefined)
      setTimeout(() => {

        // [if success then check SignalR result by importing messageHub component]
        const messagingHub = hubConnection.createHubConnenction();

        messagingHub
          .start()
          .then(() => {
            if (messagingHub.state === 'Connected') {

              requestPassword(values.email.toLowerCase(), values.queueId, values.userId)
                .then(({ data }) => {
                  // [Check if SUCCESS 200]
                  if (data.status === 200) {

                    messagingHub.on(values.queueId.toString(), message => {

                      let resultData = JSON.parse(message.remarks);
                      console.log(resultData)

                      if (resultData.Status === 200) {
                        setHasErrors(false)
                        setLoading(false)
                      } else {
                        setHasErrors(true)
                        setErrorMessage(resultData.Message)
                        setLoading(false)
                        setSubmitting(false)
                      }
                      messagingHub.off(values.queueId.toString());
                      messagingHub.stop();
                    })

                      setTimeout(() => {
                        if (messagingHub.state === 'Connected') {
                            messagingHub.stop();
                            setLoading(false)
                            setSubmitting(false)
                            swal("The server is taking too long to response.");
                        }
                    }, 15000)

                  } else {
                    setHasErrors(true)
                    setLoading(false)
                    setSubmitting(false)
                    setErrorMessage(data.message)
                  }

                })
                .catch(() => {
                  setHasErrors(true)
                  setLoading(false)
                  setSubmitting(false)
                  setStatus('The login detail is incorrect')
                })


            }
          })

      }, 1000)
    },
  })

  // -----------------------------------------------------------------
  // RETURN ELEMENTS
  // -----------------------------------------------------------------
  return (
    <>
      <form
        className='form w-100 fv-plugins-bootstrap5 fv-plugins-framework'
        noValidate
        id='kt_login_password_reset_form'
        onSubmit={formik.handleSubmit}
      >
        <div className='text-center mb-10'>
          {/* begin::Title */}
          <h1 className='text-dark mb-3'>Reset Password ?</h1>
          {/* end::Title */}
        </div>

        {/* begin::Title */}
        {hasErrors === true && (
          <div className='mb-lg-15 alert alert-danger'>
            <div className='alert-text font-weight-bold'>
              {errorMessage ? errorMessage : 'Sorry, looks like there are some errors detected, please try again.'}
            </div>
          </div>
        )}

        {hasErrors === false && (
          <div className='mb-10 bg-light-info p-8 rounded'>
            <div className='text-info'>Sent password reset. Please check your email</div>
          </div>
        )}
        {/* end::Title */}

        {/* begin::Form group */}
        <div className='fv-row mb-10'>
          <label className='form-label fw-bolder text-gray-900 fs-6'>Email</label>
          <input
            type='email'
            placeholder='user@domain.com'
            autoComplete='off'
            {...formik.getFieldProps('email')}
            className='form-control form-control-lg form-control-solid'
          />
        </div>
        {/* end::Form group */}

        <div className='text-center mb-10'>
          {/* begin::Link */}
          <div className='text-gray-400 fs-6'>Please enter your email address and click Send Reset Password Link button. An email will be sent to your email with a link to reset your password
          </div>
          {/* end::Link */}
        </div>


        {/* begin::Form group */}
        <div className='d-flex flex-wrap justify-content-center pb-lg-0'>
          <button
            type='submit'
            id='kt_password_reset_submit'
            className='btn btn-lg btn-primary fw-bolder me-4'
            disabled={formik.isSubmitting}
          >
            {!loading && <span className='indicator-label'>Send Reset Password Link</span>}

            {loading && (
              <span className='indicator-progress' style={{ display: 'block' }}>
                Please wait...
                <span className='spinner-border spinner-border-sm align-middle ms-2'></span>
              </span>
            )}
          </button>
          <Link to='/auth/login'>
            <button
              type='button'
              id='kt_login_password_reset_form_cancel_button'
              className='btn btn-lg btn-light-primary fw-bolder'
            >
              Close
            </button>
          </Link>{' '}
        </div>
        {/* end::Form group */}
      </form>
    </>
  )
}
