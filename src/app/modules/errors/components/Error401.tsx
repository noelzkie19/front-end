import {FC} from 'react'

const Error401: FC = () => {
  return (
    <>
      <h1 className='fw-bolder fs-4x text-gray-700 mb-10'>Access Denied</h1>

      <div className='fw-bold fs-3 text-gray-400 mb-15'>
        You do not have permission to view this page or the data is restricted. <br /> Please check your credentials and try again.
      </div>
    </>
  )
}

export {Error401}
