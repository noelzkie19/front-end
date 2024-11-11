import clsx from 'clsx'
import React, {FC, useEffect, useState} from 'react'
import { useSelector, shallowEqual } from 'react-redux'
import { RootState } from '../../../../setup'
import {KTSVG, toAbsoluteUrl} from '../../../helpers'
import {HeaderUserMenu} from '../../../partials'
import {useLayout} from '../../core'
import { useIdleTimer } from 'react-idle-timer'
import { StatusColor } from '../../../../app/constants/Constants'
import { SetIdleUser } from '../../../../app/common/services'
import useConstant from '../../../../app/constants/useConstant'

const toolbarButtonMarginClass = 'ms-1 ms-lg-3',
  toolbarUserAvatarHeightClass = 'symbol-30px symbol-md-40px'

const Topbar: FC = () => {
  const {config} = useLayout()
  const currentUser = useSelector<RootState>(({ auth }) => auth.fullName, shallowEqual) as string
  const [statusColor, setStatusColor] = useState(StatusColor.Online); 
  const [userStatusIdle, setUserStatusIdle ] = useState(false);
  const IDLE_TIMEOUT = 3600000; //1Hr Idle
  const {successResponse} = useConstant();

  useEffect(() => {
    setStatusColor(!userStatusIdle ? StatusColor.Online : StatusColor.Idle);
  }, [userStatusIdle])

  const onIdle = () => {
    changeUserIdleStatus(true);
    setUserStatusIdle(true);
  }
  const changeUserIdleStatus = (isIdle: boolean) => {
    SetIdleUser(isIdle)
    .then((response) => {
      if (response.status === successResponse) {
        setUserStatusIdle(isIdle);
      }
    });
  }
  const onActive = () => {
    changeUserIdleStatus(false);
    setUserStatusIdle(false);
  }

  useIdleTimer({
    onIdle,
    onActive,
    timeout: IDLE_TIMEOUT,
    throttle: 500,
    crossTab: true
  })
  return (
    <div className='d-flex align-items-stretch flex-shrink-0'>
      {/* begin::User */}
      <div
        className={clsx('d-flex justify-content-end', toolbarButtonMarginClass)}
        id='kt_header_user_menu_toggle'
      >
        {/* begin::Toggle */}
        <div
          className={clsx('d-flex cursor-pointer symbol py-1', toolbarUserAvatarHeightClass)}
          data-kt-menu-trigger='click'
          data-kt-menu-attach='parent'
          data-kt-menu-placement='bottom-end'
          data-kt-menu-flip='bottom'
        >
          <div className="d-flex flex-column justify-content-center text-end me-1 py-auto">
            <span className="text-dark-75 fw-bold">Hi! {currentUser}</span>
          </div>
          <img alt="Pic" className='border border-3 border-primary rounded-circle mh-100' src={toAbsoluteUrl('/media/avatars/default_avatar.png')}/>
          <div className='idle-icon' style={
            {
              position: 'absolute',
              bottom: '4px',
              right: '32px',
              width: '16px',
              height: '16px',
              backgroundColor: statusColor,
              borderRadius: '50%',
              border: '2px solid white'
            }}>
          </div>
        </div>
        <HeaderUserMenu />
        {/* end::Toggle */}
      </div>
      {/* end::User */}

      {/* begin::Aside Toggler */}
      {config.header.left === 'menu' && (
        <div className='d-flex align-items-center d-lg-none ms-2 me-n3' title='Show header menu'>
          <div
            className='btn btn-icon btn-active-light-primary w-30px h-30px w-md-40px h-md-40px'
            id='kt_header_menu_mobile_toggle'
          >
            <KTSVG path='/media/icons/duotone/Text/Toggle-Right.svg' className='svg-icon-1' />
          </div>
        </div>
      )}
    </div>
  )
}

export {Topbar}
