import React, {lazy, Suspense} from 'react';
import {shallowEqual, useSelector} from 'react-redux';
import {Redirect, Route, Switch, useHistory} from 'react-router-dom';
import swal from 'sweetalert';
import {PageLink, PageTitle} from '../../../_metronic/layout/core';
import {RootState} from '../../../setup';
import PlayerList from './components/players/PlayerLists';
import {ContactLogSummary} from './contact-details-log/components/contact-details-log-summary';
// import PlayerProfile from './components/player-profile/PlayerProfile'
// import PlayerCaseComm from './components/player-profile/PlayerCaseComm'
import {SearchLeads} from './search-leads/components/SearchLeads';
import {SegmentationList, SegmentationTabs} from './segmentation/components';

// const PlayerList = lazy(() => import('./components/players/PlayerLists'));
const PlayerProfile = lazy(() => import('./components/player-profile/PlayerProfile'));
const PlayerCaseComm = lazy(() => import('./components/player-profile/PlayerCaseComm'));

const accountBreadCrumbs: Array<PageLink> = [
	{
		title: 'Player Management',
		path: '/player-management/player-list',
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

const PlayerManagementPage: React.FC = () => {
	const expiresIn = useSelector<RootState>(({auth}) => auth.expiresIn, shallowEqual) as string;
	const history = useHistory();

	const expiration = new Date(expiresIn);
	var today = new Date();

	if (expiration < today) {
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
		<>
			<Switch>
				{/* route for topic */}
				<Route path='/player-management/player-list'>
					<PageTitle breadcrumbs={accountBreadCrumbs}>Player List</PageTitle>
					<PlayerList />
				</Route>
				<Route path='/player-management/player/profile/:playerId/:brandName'>
					<PageTitle breadcrumbs={accountBreadCrumbs}>Player Profile</PageTitle>

					<Suspense fallback={<div>Please wait...</div>}>
						<PlayerProfile />
					</Suspense>
				</Route>
				<Route path='/player-management/segmentation-list'>
					<PageTitle breadcrumbs={accountBreadCrumbs}>Segmentation</PageTitle>
					<SegmentationList />
				</Route>
				<Route path='/player-management/create-segment'>
					<PageTitle breadcrumbs={accountBreadCrumbs}>Segmentation</PageTitle>
					<SegmentationTabs />
				</Route>
				<Route path='/player-management/segment/:actionName/:segmentId'>
					<PageTitle breadcrumbs={accountBreadCrumbs}>Segmentation</PageTitle>
					<SegmentationTabs />
				</Route>
				<Route path='/player-management/view-contact-details'>
					<PageTitle breadcrumbs={accountBreadCrumbs}>Contact Log Summary</PageTitle>
					<ContactLogSummary />
				</Route>
				<Route path='/player-management/search-leads'>
					<PageTitle breadcrumbs={accountBreadCrumbs}>Search Leads</PageTitle>
					<SearchLeads />
				</Route>
				<Redirect from='/player-management' exact={true} to='/player-management/player-list' />
				<Redirect to='/player-management/player-list' />
			</Switch>
		</>
	);
};

export default PlayerManagementPage;
