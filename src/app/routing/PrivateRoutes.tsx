import React, {Suspense} from 'react';
import {Redirect, Route, Switch} from 'react-router-dom';
import {FallbackView} from '../../_metronic/partials';
import CampaignDashboardPage from '../modules/module-pages/CampaignDashboardPage';
import PlayerManagementPage from '../modules/player-management/PlayerManagementPage';
import SystemPage from '../modules/system/SystemPage';
import UserManagementPage from '../modules/user-management/UserManagementPage';
import {DashboardWrapper} from '../pages/dashboard/DashboardWrapper';
const CampaignManagementPage = React.lazy(() => import('../modules/module-pages/CampaignManagementPage'));
const CampaignWorkspacePage = React.lazy(() => import('../modules/module-pages/CampaignWorkspacePage'));
const AdministratorPage = React.lazy(() => import('../modules/module-pages/AdministratorPage'));
const RelationshipManagementPage = React.lazy(() => import('../modules/relationship-management/RelationshipManagementPage'));
const CaseManagementPage = React.lazy(() => import('../modules/module-pages/CaseManagementPage'));
const ReportsPage = React.lazy(() => import('../modules/module-pages/ReportsPage'))
const TicketsPage = React.lazy(() => import('../modules/ticket-management/TicketsPage'))

export function PrivateRoutes() {
	return (
		<Suspense fallback={<FallbackView />}>
			<Switch>
				<Route path='/dashboard' component={DashboardWrapper} />
				<Route path='/campaign-dashboard' component={CampaignDashboardPage} />
				<Route path='/user-management' component={UserManagementPage} />
				<Route path='/player-management' component={PlayerManagementPage} />
				<Route path='/system' component={SystemPage} />
				<Route path='/campaign-management'>
					<Suspense fallback={<div>Please wait...</div>}>
						<CampaignManagementPage />
					</Suspense>
				</Route>
				<Route path='/campaign-workspace'>
					<Suspense fallback={<div>Please wait...</div>}>
						<CampaignWorkspacePage />
					</Suspense>
				</Route>
				<Route path='/relationship-management'>
					<Suspense fallback={<div>Please wait...</div>}>
						<RelationshipManagementPage />
					</Suspense>
				</Route>
				<Route path='/case-management' component={CaseManagementPage} />
				<Route path='/case-management'>
					<Suspense fallback={<div>Please wait...</div>}>
						<CaseManagementPage />
					</Suspense>
				</Route>
				
				<Route path='/reports' component={ReportsPage} />
				<Route path='/reports'>
					<Suspense fallback={<div>Please wait...</div>}>
						<ReportsPage />
					</Suspense>
				</Route>

				<Route path='/ticket-management' component={TicketsPage} />
				<Route path='/ticket-management'>
					<Suspense fallback={<div>Please wait...</div>}>
						<TicketsPage />
					</Suspense>
				</Route>
				<Route path='/administrator' component={AdministratorPage} />
				<Route path='/administrator'>
					<Suspense fallback={<div>Please wait...</div>}>
						<AdministratorPage />
					</Suspense>
				</Route>
				<Redirect from='/auth' to='/dashboard' />
				<Redirect exact from='/' to='/dashboard' />
				<Redirect to='error/404' />
			</Switch>
		</Suspense>
	);
}
