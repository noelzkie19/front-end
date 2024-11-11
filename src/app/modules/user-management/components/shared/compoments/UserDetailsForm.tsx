import React from 'react'

interface UserDetailsProps{
  formik: any
  hasDisabledFields?: boolean
}
const UserDetailsForm = ({formik, hasDisabledFields = false}: UserDetailsProps) => {
  return (
    <>
      <div className='row mb-3'>
        <div className='col-sm-3'>
          <div className='form-label-sm required'>Full Name</div>
        </div>
        <div className='col-sm-6'>
          <input type='text' className='form-control form-control-sm' aria-label='Full Name' {...formik.getFieldProps('fullName')} />
        </div>
      </div>
      <div className='row mb-3'>
        <div className='col-sm-3'>
          <div className='form-label-sm required'>Email </div>
        </div>
        <div className='col-sm-6'>
          <input
            type='email'
            className='form-control form-control-sm'
            disabled={hasDisabledFields}
            aria-label='Email'
            placeholder='user@domain.com'
            {...formik.getFieldProps('email')}
          />
        </div>
      </div>
    </>
  )
}

export default UserDetailsForm