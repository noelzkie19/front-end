import React, { Suspense, lazy } from 'react'
import { Redirect, Route, Switch } from 'react-router-dom'
import { PageLink, PageTitle } from '../../../_metronic/layout/core'
import UserList from './components/users/UserList'
import TeamList from './components/teams/TeamList'
import RoleList from './components/roles/RoleList'
import CreateRole from './components/roles/CreateRole'
import CreateTeam from './components/teams/CreateTeam'
import CreateUser from './components/users/CreateUser'
import EditRole from './components/roles/EditRole'
import EditTeam from './components/teams/EditTeam'
import EditUser from './components/users/EditUser'
import { RootState } from '../../../setup'
import { useSelector, shallowEqual } from 'react-redux'
import swal from 'sweetalert';
import { useHistory } from "react-router-dom";


// const TeamList = lazy(() => import('./components/teams/TeamList'));
// const RoleList = lazy(() => import('./components/roles/RoleList'));
// const CreateRole = lazy(() => import('./components/roles/CreateRole'));
// const CreateTeam = lazy(() => import('./components/teams/CreateTeam'));
// const CreateUser = lazy(() => import('./components/users/CreateUser'));
// const EditRole = lazy(() => import('./components/roles/EditRole'));
// const EditTeam = lazy(() => import('./components/teams/EditTeam'));
// const EditUser = lazy(() => import('./components/users/EditUser'));



const accountBreadCrumbs: Array<PageLink> = [
  {
    title: 'User Management',
    path: '/user-management/user-list',
    isSeparator: false,
    isActive: false,
  },
  {
    title: '',
    path: '',
    isSeparator: true,
    isActive: false,
  },
]

const UserManagementPage: React.FC = () => {

  const expiresIn = useSelector<RootState>(({ auth }) => auth.expiresIn, shallowEqual) as string
  const history = useHistory();

  const expiration = new Date(expiresIn)
  var today = new Date();

  if (expiration <= today) {
    swal({
      title: "Expired Session Detected",
      text: "You are about to logout, Please click OK to proceed.",
      icon: "warning",
      dangerMode: true,
    })
      .then((willLogout) => {
        if (willLogout) {
          history.push("/logout");
        }
      });
  }

  return (
    <>
      <Switch>
        <Route path='/user-management/user-list'>
          <PageTitle breadcrumbs={accountBreadCrumbs}>User List</PageTitle>
          <UserList />
        </Route>
        <Route path='/user-management/create-user'>
          <PageTitle breadcrumbs={accountBreadCrumbs}>Create User</PageTitle>
          <CreateUser />
        </Route>
        <Route path='/user-management/edit-user/:id'>
          <PageTitle breadcrumbs={accountBreadCrumbs}>Edit User</PageTitle>
          <EditUser />
        </Route>
        <Route path='/user-management/team-list'>
          <PageTitle breadcrumbs={accountBreadCrumbs}>Team List</PageTitle>
          <TeamList />
        </Route>
        <Route path='/user-management/create-team'>
          <PageTitle breadcrumbs={accountBreadCrumbs}>Create Team</PageTitle>
          <CreateTeam />
        </Route>
        <Route path='/user-management/edit-team'>
          <PageTitle breadcrumbs={accountBreadCrumbs}>Edit Team</PageTitle>
          <EditTeam />
        </Route>
        <Route path='/user-management/role-list'>
          <PageTitle breadcrumbs={accountBreadCrumbs}>Role List</PageTitle>
          <RoleList />
        </Route>
        <Route path='/user-management/create-role'>
          <PageTitle breadcrumbs={accountBreadCrumbs}>Create Role</PageTitle>
          <CreateRole />
        </Route>
        <Route path='/user-management/edit-role'>
          <PageTitle breadcrumbs={accountBreadCrumbs}>Edit Role</PageTitle>
          <EditRole />
        </Route>
        <Redirect from='/user-management' exact={true} to='/user-management/user-list' />
        <Redirect to='/user-management/user-list' />
      </Switch>
    </>
  )
}

export default UserManagementPage
