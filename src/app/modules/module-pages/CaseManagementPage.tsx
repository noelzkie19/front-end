import React, {useEffect, useState} from 'react';
import {shallowEqual, useSelector} from 'react-redux';
import {Redirect, Route, Switch, useHistory, useLocation} from 'react-router-dom';
import swal from 'sweetalert';
import {PageLink, PageTitle} from '../../../_metronic/layout/core';
import {USER_CLAIMS} from '../../../app/modules/user-management/components/constants/UserClaims';
import {RootState} from '../../../setup';
import {
	CreateCustomerServiceCase,
	CustomerServiceAddCommunication,
	CustomerServiceEditCommunication,
	EditCustomerServiceCase,
	SearchPCSQuestionares,
} from '../case-management/components';
import CaseCommunicationList from '../case-management/components/search-case/CaseCommunicationList';
import {CustomerCase} from '../case-management/components/view-case/CustomerCase';
import {CaseCommunicationContextProvider} from '../case-management/context/CaseCommunicationContext';

const breadcrumbMap = {
	'/case-management/service-case': 'View Case',
	'/case-management/search-case-communication': 'Search Case and Communication',
	'/case-management/create-case': 'Create Case',
	'/case-management/edit-case': 'Edit Case',
	'/case-management/add-communication': 'Add Communication',
	'/case-management/edit-communication': 'Edit Communication',
	'/case-management/pcs-questionnaires': 'PCS Questionnaires',
};

const CaseManagementPage: React.FC = () => {
	const expiresIn = useSelector<RootState>(({auth}) => auth.expiresIn, shallowEqual) as string;
	const userAccessId = useSelector<RootState>(({auth}) => auth.userId, shallowEqual) as number;
	const userAccess = useSelector<RootState>(({auth}) => auth.access, shallowEqual) as string;
	const history = useHistory();
	const [breadcrumbs, setBreadcrumbs] = useState<PageLink[]>([]);
	const location = useLocation();

	const expiration = new Date(expiresIn);
	var today = new Date();

	if (
		userAccessId != 0 &&
		!(userAccess.includes(USER_CLAIMS.CaseManagementRead) === true || userAccess.includes(USER_CLAIMS.CaseManagementWrite) === true)
	) {
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

	useEffect(() => {
		const path = location.pathname;

		const defaultTitle = 'Default Title';
		const breadcrumbTitle = Object.keys(breadcrumbMap).find((key) => path.startsWith(key)) ?? defaultTitle;

		const newBreadcrumbs = [
			{
				title: 'Case Management',
				path: '/case-management/service-case',
				isSeparator: false,
				isActive: false,
			},
			{
				title: breadcrumbTitle,
				path: '',
				isSeparator: true,
				isActive: false,
			},
		];

		setBreadcrumbs(newBreadcrumbs);
	}, [location]);

	return (
		<Switch>
			<CaseCommunicationContextProvider>
				<Route path='/case-management/service-case/:caseId'>
					<PageTitle dynamicBreadCrumbs={breadcrumbs}>View Case</PageTitle>
					<CustomerCase />
				</Route>
				<Route path='/case-management/search-case-communication'>
					<PageTitle dynamicBreadCrumbs={breadcrumbs}>Search Case and Communication</PageTitle>
					<CaseCommunicationList />
				</Route>
				<Route path='/case-management/create-case'>
					<PageTitle dynamicBreadCrumbs={breadcrumbs}>Create Case</PageTitle>
					<CreateCustomerServiceCase />
				</Route>
				<Route path='/case-management/edit-case/:caseId'>
					<PageTitle dynamicBreadCrumbs={breadcrumbs}>Edit Case</PageTitle>
					<EditCustomerServiceCase />
				</Route>
				<Route path='/case-management/add-communication/:caseId'>
					<PageTitle dynamicBreadCrumbs={breadcrumbs}>Edit Case</PageTitle>
					<CustomerServiceAddCommunication />
				</Route>
				<Route path='/case-management/edit-communication/:communicationId'>
					<PageTitle dynamicBreadCrumbs={breadcrumbs}>Edit Case</PageTitle>
					<CustomerServiceEditCommunication />
				</Route>

				<Route path='/case-management/pcs-questionnaires'>
					<PageTitle dynamicBreadCrumbs={breadcrumbs}>PCS Questionnaires</PageTitle>
					<SearchPCSQuestionares />
				</Route>
			</CaseCommunicationContextProvider>
			<Redirect to='/case-management/search-case-communication' />
		</Switch>
	);
};

export default CaseManagementPage;
