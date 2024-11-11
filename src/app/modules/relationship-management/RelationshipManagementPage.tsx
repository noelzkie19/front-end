import React from 'react';
import {shallowEqual, useSelector} from 'react-redux';
import {Route, Switch, useHistory} from 'react-router-dom';
import swal from 'sweetalert';
import {RootState} from '../../../setup';
import {PageLink, PageTitle} from '../../../_metronic/layout/core';
import {IAuthState} from '../auth';
import RemDistribution from './components/rem-distribution/RemDistribution';
import {AddRemProfile, EditRemProfile, RemProfileList} from './components/rem-profile';
import ViewRemProfile from './components/rem-profile/ViewRemProfile';
import {AddRemScheduleTemplate, EditRemScheduleTemplate, RemSchedule, ViewScheduleTemplate} from './components/rem-setting';
import SearchAutoDistributionSetting from './components/rem-setting/auto-distribution/SearchAutoDistributionSetting';

const accountBreadCrumbs: Array<PageLink> = [
	{
		title: 'Relationship Management',
		path: '/relationship-management/',
		isSeparator: false,
		isActive: false,
	},
	{
		title: '',
		path: '',
		isSeparator: true,
		isActive: false,
	},
];

const RelationshipManagementPage: React.FC = () => {
	//Redux
	const {expiresIn} = useSelector<RootState>(({auth}) => auth, shallowEqual) as IAuthState;

	//Constants
	const history = useHistory();
	let expiryDate = expiresIn !== undefined ? expiresIn.toString() : '';
	const expiration = new Date(expiryDate);
	let today = new Date();

	//Check Session if expire
	if (expiration <= today) {
		swal({
			title: 'Expired Session Detected',
			text: 'You are about to logout, Please click OK to proceed.',
			icon: 'warning',
			dangerMode: true,
		}).then((willLogout) => {
			if (willLogout) {
				history.push('/logout');
			}
		});
	}

	return (
		<Switch>
			<Route path='/relationship-management/rem-distribution'>
				<PageTitle breadcrumbs={accountBreadCrumbs}>ReM Distribution</PageTitle>
				<RemDistribution />
			</Route>
			<Route path='/relationship-management/rem-schedule'>
				<PageTitle breadcrumbs={accountBreadCrumbs}>ReM Setting</PageTitle>
				<RemSchedule />
			</Route>
			<Route path='/relationship-management/rem-view-schedule-template/:page/:id'>
				<PageTitle breadcrumbs={accountBreadCrumbs}>ReM Setting</PageTitle>
				<ViewScheduleTemplate />
			</Route>
			<Route path='/relationship-management/rem-profile'>
				<PageTitle breadcrumbs={accountBreadCrumbs}>ReM Profile</PageTitle>
				<RemProfileList />
			</Route>
			<Route path='/relationship-management/add-schedule-template'>
				<PageTitle breadcrumbs={accountBreadCrumbs}>ReM Setting</PageTitle>
				<AddRemScheduleTemplate />
			</Route>
			<Route path='/relationship-management/add-rem-profile'>
				<PageTitle breadcrumbs={accountBreadCrumbs}>Add ReM Profile</PageTitle>
				<AddRemProfile />
			</Route>
			<Route path='/relationship-management/edit-schedule-template/:id'>
				<PageTitle breadcrumbs={accountBreadCrumbs}>ReM Setting</PageTitle>
				<EditRemScheduleTemplate />
			</Route>
			<Route path='/relationship-management/edit-rem-profile/:id'>
				<PageTitle breadcrumbs={accountBreadCrumbs}>Edit ReM Profile</PageTitle>
				<EditRemProfile />
			</Route>
			<Route path='/relationship-management/view-rem-profile/:page/:id'>
				<PageTitle breadcrumbs={accountBreadCrumbs}>View ReM Profile</PageTitle>
				<ViewRemProfile />
			</Route>
			<Route path='/relationship-management/auto-distribution-setting'>
				<PageTitle breadcrumbs={accountBreadCrumbs}>ReM Auto Distribution Setting</PageTitle>
				<SearchAutoDistributionSetting />
			</Route>
		</Switch>
	);
};

export default RelationshipManagementPage;
