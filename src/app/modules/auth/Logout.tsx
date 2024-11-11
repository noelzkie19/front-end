import { useEffect } from 'react'
import { Redirect, Switch } from 'react-router-dom'
import * as auth from './redux/AuthRedux'
import {updateUserStatusById} from '../system/redux/SystemService';
import useConstant from '../../constants/useConstant';
import { UpdateUserStatusOnlineModel } from '../system/models/UpdateUserOnlineStatusModel';
import { shallowEqual, useDispatch, useSelector} from 'react-redux';
import { RootState } from '../../../setup';

export function Logout() {
  const dispatch = useDispatch()
  const {successResponse} = useConstant();
  const userAccessId = useSelector<RootState>(({auth}) => auth.userId, shallowEqual) as number;
  const expiresIn = useSelector<RootState>(({ auth }) => auth.expiresIn, shallowEqual) as string;

  useEffect(() => {
    const request: UpdateUserStatusOnlineModel = {
      userId: userAccessId,
      isOnline: false
    };
  
  const expiration = new Date(expiresIn);
	const today = new Date();
  const isRemember = localStorage.getItem('isRemember');
  
	if (expiration > today) {
    updateUserStatusById(request)
    .then((response) => {
      if (response.status === successResponse) {
        dispatch(auth.actions.logout());

        if (isRemember && isRemember == 'true') {
          clearLocalStorage();
        } 
        else {
          localStorage.clear();
        }
    }
    })
    .catch((ex) => {
      console.log('User status tagging failed: ' + ex);
    });
  }
  else {
    dispatch(auth.actions.logout());
    if (isRemember && isRemember == 'true') {
      clearLocalStorage();
    } 
    else {
      localStorage.clear();
    }
  }
  }, [dispatch])

  const clearLocalStorage = () => {
    var storedEmail = localStorage.getItem('storedEmail') || '';
        var storedPassword = localStorage.getItem('storedPassword')||'';
        localStorage.clear();
        localStorage.setItem('isRemember', 'true');
        localStorage.setItem('storedEmail',storedEmail);
        localStorage.setItem('storedPassword',storedPassword);
  }

  return (
    <Switch>
      <Redirect to='/auth/login' />
    </Switch>
  )
}
