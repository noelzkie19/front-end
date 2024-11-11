import React from 'react';
import {shallowEqual, useSelector} from 'react-redux';
import {Route, Switch, useHistory} from 'react-router-dom';
import swal from 'sweetalert';
import {PageLink, PageTitle} from '../../../_metronic/layout/core';
import {RootState} from '../../../setup';
import {AddCommunication, CreateCaseCommunication, EditCase, EditCommunication, ViewCase, ViewCommunication} from './components';

const accountBreadCrumbs: Array<PageLink> = [
	{
		title: 'Campaign Management',
		path: '/campaign-workspace/create-case',
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

const CaseCommunicationPage: React.FC = () => {
	
	const expiresIn = useSelector<RootState>(({auth}) => auth.expiresIn, shallowEqual) as string;
	const history = useHistory();

	const expiration = new Date(expiresIn);
	var today = new Date();

	// -----------------------------------------------------------------
	// CHECK SESSION EXPIRES
	// -----------------------------------------------------------------
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

	// -----------------------------------------------------------------
	// RETURN ELEMENTS
	// -----------------------------------------------------------------
	return (
		<>
			<Switch>
				<Route path='/campaign-management/create-case'>
					<PageTitle breadcrumbs={accountBreadCrumbs}>Create Case</PageTitle>
					<CreateCaseCommunication />
				</Route>
				<Route path='/campaign-workspace/view-case'>
					<PageTitle breadcrumbs={accountBreadCrumbs}>View Case</PageTitle>
					<ViewCase />
				</Route>

				<Route path='/campaign-workspace/edit-case'>
					<PageTitle breadcrumbs={accountBreadCrumbs}>Edit Case</PageTitle>
					<EditCase />
				</Route>

				<Route path='/campaign-workspace/add-communication'>
					<PageTitle breadcrumbs={accountBreadCrumbs}>Add Communication</PageTitle>
					<AddCommunication />
				</Route>

				<Route path='/campaign-workspace/edit-communication'>
					<PageTitle breadcrumbs={accountBreadCrumbs}>Edit Communication</PageTitle>
					<EditCommunication />
				</Route>

				<Route path='/campaign-workspace/view-communication'>
					<PageTitle breadcrumbs={accountBreadCrumbs}>View Communication</PageTitle>
					<ViewCommunication />
				</Route>
			</Switch>
		</>
	);
};

export default CaseCommunicationPage;
