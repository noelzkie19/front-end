import React from 'react';
import {Redirect, Route, Switch} from 'react-router-dom';
import {PageLink, PageTitle} from '../../../_metronic/layout/core';
import {RootState} from '../../../setup';
import {useSelector, shallowEqual} from 'react-redux';
import swal from 'sweetalert';
import {useHistory} from 'react-router-dom';
import {MsMonitoring} from '../../modules/administrator/components/MsMonitoring';
import {USER_CLAIMS} from '../../../app/modules/user-management/components/constants/UserClaims';
import AppConfigSettingList from '../administrator/components/AppConfigSetting/AppConfigSettingList';
import SubscriptionList from '../administrator/components/EventSubscription/SubscriptionList';

const accountBreadCrumbs: Array<PageLink> = [
	{
		title: 'Administrator',
		path: '/administrator/ms-monitoring',
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

const AdministratorPage: React.FC = () => {
	const expiresIn = useSelector<RootState>(({auth}) => auth.expiresIn, shallowEqual) as string;
	const userAccessId = useSelector<RootState>(({auth}) => auth.userId, shallowEqual) as number;
	const userAccess = useSelector<RootState>(({auth}) => auth.access, shallowEqual) as string;
	const history = useHistory();

	const expiration = new Date(expiresIn);
	var today = new Date();

	if (userAccessId != 0 && !(userAccess.includes(USER_CLAIMS.AdminRead) === true || userAccess.includes(USER_CLAIMS.AdminWrite) === true)) {
		history.push('/error/404');
	} else {
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
	}
	return (
		<>
			<Switch>
				<Route path='/administrator/ms-monitoring'>
					<PageTitle breadcrumbs={accountBreadCrumbs}>MicroService Monitoring</PageTitle>
					<MsMonitoring />
				</Route>
				<Route path='/administrator/app-config-setting'>
					<PageTitle breadcrumbs={accountBreadCrumbs}>App Config Setting</PageTitle>
					<AppConfigSettingList />
				</Route>
				<Route path='/administrator/event-subscription-setting'>
					<PageTitle breadcrumbs={accountBreadCrumbs}>Event Subscription Setting</PageTitle>
					<SubscriptionList />
				</Route>
				<Redirect from='/administrator' exact={true} to='/administrator/ms-monitoring' />
				<Redirect to='/administrator/ms-monitoring' />
			</Switch>
		</>
	);
};

export default AdministratorPage;
