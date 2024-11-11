import React, { useState, useEffect } from 'react'
import * as Yup from 'yup'
import clsx from 'clsx'
import { Link, useLocation } from 'react-router-dom'
import { useFormik } from 'formik'
import { createNewPassword } from '../redux/AuthCRUD'
import * as hubConnection from '../../../../setup/hub/MessagingHub'
import { Guid } from "guid-typescript";
import { useHistory } from "react-router-dom";
import swal from 'sweetalert';


const initialValues = {
    newPassword: '',
    confirmPassword: '',
    queueId: '',
    userId: '',
}

export function CreateNewPassword() {
    // -----------------------------------------------------------------
    // STATES
    // -----------------------------------------------------------------
    const [loading, setLoading] = useState(false)
    const [hasErrors, setHasErrors] = useState<boolean | undefined>(undefined)
    const [errorMessage, setErrorMessage] = useState<string>('')
    const [isSuccess, setSuccess] = useState(false)
    const history = useHistory();

    let passwordId: string | null = (new URLSearchParams(useLocation().search).get("passwordid"));
    let actionId: string | null = (new URLSearchParams(useLocation().search).get("actionid"));

    // -----------------------------------------------------------------
    // MOUNTED
    // -----------------------------------------------------------------
    useEffect(() => {
        validatePasswordId()
    })

    // -----------------------------------------------------------------
    // METHOD
    // -----------------------------------------------------------------
    const validatePasswordId = (): void => {
        if (passwordId === '' || passwordId === null) {
            setErrorMessage('Please ask administrator to generate again')
            return;
        }
    }

    const validateActionId = (): void => {
        if (actionId === '' || actionId === null) {
            setErrorMessage('Please ask administrator to generate again')
            return;
        }
    }

    // -----------------------------------------------------------------
    // FORMIK FORM POST
    // -----------------------------------------------------------------
    const formik = useFormik({
        initialValues,
        onSubmit: (values, { setStatus, setSubmitting }) => {
            values.queueId = Guid.create().toString();
            validatePasswordId()
            validateActionId()
            values.userId = '0';
            setLoading(true)
            setHasErrors(false)
            setSubmitting(true)
            setSuccess(false)

            let newPassword = passwordValidate(values.newPassword)
            let confirmPassword = passwordValidate(values.confirmPassword)

            if (newPassword === false || confirmPassword === false) {

                if (newPassword)
                    setErrorMessage('Unable to proceed, New Password and the Confirmation is not matched')
                else
                    setErrorMessage('Unable to proceed, Password must be 8-16 character, combination of letter, number and special character')

                setHasErrors(true)
                setLoading(false)
                setSubmitting(false)
                return;
            }

            setTimeout(() => {

                // [if success then check SignalR result by importing messageHub component]
                const messagingHub = hubConnection.createHubConnenction();
                messagingHub
                    .start()
                    .then(() => {
                        if (messagingHub.state === 'Connected') {

                            createNewPassword(passwordId, values.newPassword, values.confirmPassword, values.queueId, values.userId, actionId)
                                .then(({ data }) => {
                                    // [Check return if success 200]

                                    if (data.status === 200) {

                                        messagingHub.on(values.queueId.toString(), message => {

                                            let resultData = JSON.parse(message.remarks);

                                            if (resultData.Status === 200) {
                                                setHasErrors(false)
                                                setLoading(false)
                                                setSubmitting(false)
                                                setSuccess(true)
                                            } else {
                                                setHasErrors(true)
                                                setErrorMessage(resultData.Message)
                                                setLoading(false)
                                                setSubmitting(false)
                                                setSuccess(false)
                                            }
                                            messagingHub.off(values.queueId.toString());
                                            messagingHub.stop();

                                        })
                                        setTimeout(() => {
                                            if (messagingHub.state === 'Connected') {
                                                messagingHub.stop();
                                                setLoading(false)
                                                setHasErrors(false)
                                                setSubmitting(false)
                                                setSuccess(true)
                                            }
                                        }, 15000)



                                    } else {

                                        setHasErrors(true)
                                        setLoading(false)
                                        setSubmitting(false)
                                        setErrorMessage(data.message)
                                        setSuccess(false)
                                    }
                                    // setHasErrors(false)
                                    // setLoading(false)
                                })
                                .catch(() => {
                                    setHasErrors(true)
                                    setLoading(false)
                                    setSubmitting(false)
                                    setStatus('The login detail is incorrect')
                                    setSuccess(false)
                                })
                        }
                    })

            }, 1000)
        },
    })

    function passwordValidate(p: string) {
        return /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,16}$/.test(p);
    }

    function onClose() {

        if (isSuccess) {
            history.push("/login");
        }
        else {
            swal({
                title: "Confirmation",
                text: "Any changes will be discarded, please confirm",
                icon: "warning",
                buttons: ["No", "Yes"],
                dangerMode: true
            })
                .then((willClose) => {
                    if (willClose) {
                        history.push("/login");
                    }
                })
        }
    }

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
                    <h1 className='text-dark mb-3'>Create New Password</h1>
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

                {hasErrors === false && isSuccess && (
                    <div className='mb-10 bg-light-info p-8 rounded'>
                        <div className='text-info'>Successfully Create Password. Please try to login using the new password</div>
                    </div>
                )}
                {/* end::Title */}

                {/* begin::Form group */}
                <div className='fv-row mb-10'>
                    <div className='d-flex justify-content-between mt-n5'>
                        <div className='d-flex flex-stack mb-2'>
                            {/* begin::Label */}
                            <label className='form-label fw-bolder text-dark fs-6 mb-0'>New Password</label>
                            {/* end::Label */}
                            {/* begin::Link */}


                            {/* end::Link */}
                        </div>
                    </div>
                    <input
                        type='password'
                        autoComplete='off'
                        {...formik.getFieldProps('newPassword')}
                        className='form-control form-control-lg form-control-solid'
                    />
                </div>


                {/* begin::Form group */}
                <div className='fv-row mb-10'>
                    <div className='d-flex justify-content-between mt-n5'>
                        <div className='d-flex flex-stack mb-2'>
                            {/* begin::Label */}
                            <label className='form-label fw-bolder text-dark fs-6 mb-0'>Confirm Password</label>
                            {/* end::Label */}
                            {/* begin::Link */}


                            {/* end::Link */}
                        </div>
                    </div>
                    <input
                        type='password'
                        autoComplete='off'
                        {...formik.getFieldProps('confirmPassword')}
                        className='form-control form-control-lg form-control-solid'
                    />
                </div>

                {/* begin::Form group */}
                <div className='d-flex flex-wrap justify-content-center pb-lg-0'>
                    <button
                        type='submit'
                        id='kt_password_reset_submit'
                        className='btn btn-lg btn-primary fw-bolder me-4'
                        disabled={formik.isSubmitting || !formik.isValid || isSuccess}
                    >
                        {!loading && <span className='indicator-label'>Submit</span>}
                        {loading && (
                            <span className='indicator-progress' style={{ display: 'block' }}>
                                Please wait...
                                <span className='spinner-border spinner-border-sm align-middle ms-2'></span>
                            </span>
                        )}
                    </button>
                    {/* <Link to='/auth/login'> */}
                    <button
                        type='button'
                        id='kt_login_password_reset_form_cancel_button'
                        className='btn btn-lg btn-light-primary fw-bolder'
                        onClick={onClose}
                    >
                        Close
                    </button>
                    {/* </Link>{' '} */}
                </div>
                {/* end::Form group */}
            </form>
        </>
    )
}
