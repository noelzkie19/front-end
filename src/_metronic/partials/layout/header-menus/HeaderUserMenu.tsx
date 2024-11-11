/* eslint-disable jsx-a11y/anchor-is-valid */
import { FC } from 'react'
import { Link } from 'react-router-dom'
import { toAbsoluteUrl } from '../../../helpers'

const HeaderUserMenu: FC = () => {
  // const user: UserModel = useSelector<RootState>(({ auth }) => auth.user, shallowEqual) as UserModel
  return (
    <div
      className='menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-gray-600 menu-state-bg menu-state-primary fw-bold py-4 fs-6 w-275px'
      data-kt-menu='true'
    >
      <div className='menu-item px-3'>
        <div className='menu-content d-flex align-items-center px-3'>
          <div className='symbol symbol-50px me-5'>
            <img alt='Logo' src={toAbsoluteUrl('/media/avatars/default_avatar.png')} />
          </div>

          <div className='d-flex flex-column'>
            <div className='fw-bolder d-flex align-items-center fs-5'>
              Profile
            </div>
            {/* <a href='#' className='fw-bold text-muted text-hover-primary fs-7'>
              {user.email}
            </a> */}
          </div>
        </div>
      </div>

      <div className='separator my-2'></div>

      {/* <div className='menu-item px-5'>
        <Link to='' className='menu-link px-5'>
          My Profile
        </Link>
      </div> */}

      <div className='separator my-2'></div>

      {/* <Languages /> */}

      <div className='menu-item px-5'>
        <Link to='/logout' className='menu-link px-5'>
          Sign Out
        </Link>
      </div>
    </div>
  )
}

export { HeaderUserMenu }
