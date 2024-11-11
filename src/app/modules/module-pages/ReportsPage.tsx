import React from 'react';
import {Redirect, Route, Switch, useHistory} from 'react-router-dom';
import {PageLink, PageTitle} from '../../../_metronic/layout/core';
import {RootState} from '../../../setup';
import {useSelector, shallowEqual} from 'react-redux';
import swal from 'sweetalert';
import CommunicationReviewReportList from '../reports/components/CommunicationReviewReportList';

const accountBreadCrumbs: Array<PageLink> = [
	{
		title: 'Reports',
		path: '/reports/search-communication-review-report',
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

const ReportsPage: React.FC = () => {
	const expiresIn = useSelector<RootState>(({auth}) => auth.expiresIn, shallowEqual) as string;
	const history = useHistory();

	const expiration = new Date(expiresIn);
	let today = new Date();

	if (expiration <= today) {
		swal({ 
			icon: 'warning',
			dangerMode: true,
			text: 'You are about to logout, Please click OK to proceed.',
			title: 'Expired Session Detected',
		}).then((willLogout) => {
			if (willLogout) {
				history.push('/logout');
			}
		});
	}

	return (
			<Switch>
				<Route path='/reports/search-communication-review-report'>
					<PageTitle breadcrumbs={accountBreadCrumbs}>Search Communication Review Report</PageTitle>
                    <CommunicationReviewReportList />
				</Route>
				<Redirect to='/reports/search-communication-review-report' />
			</Switch>
	);
};

export default ReportsPage;
