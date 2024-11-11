import React, {lazy, Suspense} from 'react';
import {shallowEqual, useSelector} from 'react-redux';
import {Redirect, Route, Switch, useHistory} from 'react-router-dom';
import swal from 'sweetalert';
import {PageLink, PageTitle} from '../../../_metronic/layout/core';
import {RootState} from '../../../setup';
import {DetailJourney} from '../campaign-journey/components/DetailJourney';
import {GridJourney} from '../campaign-journey/components/GridJourney';
import {JOURNEY_ACTION_MODE} from '../campaign-journey/constants/Journey';
import {Campaign} from '../campaign-management/components/Campaign';
import {CampaignList} from '../campaign-management/components/CampaignList';
import {ManageBot} from '../campaign-management/components/manage-bot';
import {SearchBroadcast} from '../campaign-management/components/manage-broadcast/SearchBroadcast';
import CustomEventList from '../campaign-setting/setting-custom-event/components/CustomEventList';
import CreateBroadcast from '../campaign-management/components/manage-broadcast/CreateBroadcast';
import ViewBroadcast from '../campaign-management/components/manage-broadcast/ViewBroadcast';
import EditBroadcast from '../campaign-management/components/manage-broadcast/EditBroadcast';

const AutoTaggingDetails = lazy(() => import('../campaign-setting/setting-auto-tagging/components/AutoTaggingDetails'));
const AddAutoTagging = lazy(() => import('../campaign-setting/setting-auto-tagging/components/AddAutoTagging'));
const ViewAutoTagging = lazy(() => import('../campaign-setting/setting-auto-tagging/components/ViewAutoTagging'));
const EditAutoTagging = lazy(() => import('../campaign-setting/setting-auto-tagging/components/EditAutoTagging'));
const AddGoalParameterPointSetting = lazy(
	() => import('../campaign-setting/setting-point-incentive/components/goal-parameter/AddGoalParameterPointSetting')
);
const EditGoalParameterPointSetting = lazy(
	() => import('../campaign-setting/setting-point-incentive/components/goal-parameter/EditGoalParameterPointSetting')
);
const PointIncentiveDetails = lazy(() => import('../campaign-setting/setting-point-incentive/components/PointIncentiveDetails'));
const AddPointIncentive = lazy(() => import('../campaign-setting/setting-point-incentive/components/point-incentive/AddPointIncentive'));
const EditPointIncentiveSetting = lazy(
	() => import('../campaign-setting/setting-point-incentive/components/point-incentive/EditPointIncentiveSetting')
);
const ViewPointIncentiveSetting = lazy(
	() => import('../campaign-setting/setting-point-incentive/components/point-incentive/ViewPointIncentiveSetting')
);
const ViewCampaignGoal  = lazy(() => import('../campaign-setting/setting-campaign-goal/components/ViewCampaignGoal'));
const EditCampaignGoal = lazy(() => import('../campaign-setting/setting-campaign-goal/components/EditCampaignGoal'));
const AddGoalSetting = lazy(() => import('../campaign-setting/setting-goal/components/AddGoalSetting'));
const AddCampaignGoal = lazy(() => import('../campaign-setting/setting-campaign-goal/components/AddCampaignGoal'));
const GoalSettingList = lazy(() => import('../campaign-setting/setting-goal/components/GoalSettingList'));
const EditCampaign = lazy(() => import('../campaign-management/components/EditCampaign'));
const ViewCampaign = lazy(() => import('../campaign-management/components/ViewCampaign'));

const accountBreadCrumbs: Array<PageLink> = [
	{
		title: 'Campaign Management',
		path: '/campaign-management/manage-campaign',
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

const CampaignManagementPage: React.FC = () => {
	const expiresIn = useSelector<RootState>(({auth}) => auth.expiresIn, shallowEqual) as string;
	const history = useHistory();

	const expiration = new Date(expiresIn);
	var today = new Date();

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
		<>
			<Switch>
				<Route path='/campaign-management/campaign-setting/campaign-goal'>
					<PageTitle breadcrumbs={accountBreadCrumbs}>Campaign Goal Setting</PageTitle>

					<Suspense fallback={<div>Please wait...</div>}>
						<GoalSettingList />
					</Suspense>
				</Route>
				<Route path='/campaign-management/campaign-setting/add-auto-tagging'>
					<PageTitle breadcrumbs={accountBreadCrumbs}>Auto Tagging Setting</PageTitle>

					<Suspense fallback={<div>Please wait...</div>}>
						<AddAutoTagging />
					</Suspense>
				</Route>

				<Route path='/campaign-management/manage-journey'>
					<PageTitle breadcrumbs={accountBreadCrumbs}>Manage Journey</PageTitle>
					<GridJourney />
				</Route>
				<Route path='/campaign-management/journey/create'>
					<PageTitle breadcrumbs={accountBreadCrumbs}>Create Journey</PageTitle>
					<DetailJourney pageMode={JOURNEY_ACTION_MODE.Create} />
				</Route>
				<Route path='/campaign-management/journey/edit/:id'>
					<PageTitle breadcrumbs={accountBreadCrumbs}>Edit Journey</PageTitle>
					<Suspense fallback={<div>Please wait...</div>}>
						<DetailJourney pageMode={JOURNEY_ACTION_MODE.Edit} />
					</Suspense>
				</Route>
				<Route path='/campaign-management/journey/view/:id'>
					<PageTitle breadcrumbs={accountBreadCrumbs}>View Journey</PageTitle>
					<Suspense fallback={<div>Please wait...</div>}>
						<DetailJourney pageMode={JOURNEY_ACTION_MODE.View} />
					</Suspense>
				</Route>

				<Route path='/campaign-management/manage-campaign'>
					<PageTitle breadcrumbs={accountBreadCrumbs}>Manage Campaign</PageTitle>
					<CampaignList />
				</Route>
				<Route path='/campaign-management/campaign/create'>
					<PageTitle breadcrumbs={accountBreadCrumbs}>Create Campaign</PageTitle>
					<Campaign mode={'create'} />
				</Route>
				<Route path='/campaign-management/campaign/edit/:id'>
					<PageTitle breadcrumbs={accountBreadCrumbs}>Edit Campaign</PageTitle>

					<Suspense fallback={<div>Please wait...</div>}>
						<EditCampaign />
					</Suspense>
				</Route>
				<Route path='/campaign-management/campaign/view/:id'>
					<PageTitle breadcrumbs={accountBreadCrumbs}>View Campaign</PageTitle>

					<Suspense fallback={<div>Please wait...</div>}>
						<ViewCampaign />
					</Suspense>
				</Route>
				<Route path='/campaign-management/campaign/clone/:id'>
					<PageTitle breadcrumbs={accountBreadCrumbs}>Clone Campaign</PageTitle>
					<Campaign mode={'clone'} />
				</Route>
				<Route path='/campaign-management/campaign-setting/edit-auto-tagging/:paramCampaignSettingId'>
					<PageTitle breadcrumbs={accountBreadCrumbs}>Auto Tagging Setting</PageTitle>

					<Suspense fallback={<div>Please wait...</div>}>
						<EditAutoTagging />
					</Suspense>
				</Route>
				<Route path='/campaign-management/campaign-setting/view-auto-tagging/:paramCampaignSettingId'>
					<PageTitle breadcrumbs={accountBreadCrumbs}>Auto Tagging Setting</PageTitle>

					<Suspense fallback={<div>Please wait...</div>}>
						<ViewAutoTagging />
					</Suspense>
				</Route>
				<Route path='/campaign-management/campaign-setting/auto-tagging'>
					<PageTitle breadcrumbs={accountBreadCrumbs}>Auto Tagging Setting</PageTitle>

					<Suspense fallback={<div>Please wait...</div>}>
						<AutoTaggingDetails />
					</Suspense>
				</Route>
				<Route path='/campaign-management/campaign-setting/point-incentive'>
					<PageTitle breadcrumbs={accountBreadCrumbs}>Point Incentive Setting</PageTitle>

					<Suspense fallback={<div>Please wait...</div>}>
						<PointIncentiveDetails />
					</Suspense>
				</Route>

				<Route path='/campaign-management/campaign-setting/add-campaign-goal'>
					<PageTitle breadcrumbs={accountBreadCrumbs}>Campaign Goal Setting</PageTitle>

					<Suspense fallback={<div>Please wait...</div>}>
						{/* <AddGoalSetting /> */}
						<AddCampaignGoal />
					</Suspense>
				</Route>
				<Route path='/campaign-management/campaign-setting/clone-campaign-goal/:id'>
					<PageTitle breadcrumbs={accountBreadCrumbs}>Campaign Goal Setting</PageTitle>
					<Suspense fallback={<div>Please wait...</div>}>
						<AddCampaignGoal />
					</Suspense>
				</Route>
				<Route path='/campaign-management/campaign-setting/view-campaign-goal/:id'>
					<PageTitle breadcrumbs={accountBreadCrumbs}>View Campaign Goal Setting</PageTitle>

					<Suspense fallback={<div>Please wait...</div>}>
						<ViewCampaignGoal  />
					</Suspense>
				</Route>
				<Route path='/campaign-management/campaign-setting/add-goal-parameter'>
					<PageTitle breadcrumbs={accountBreadCrumbs}>Point Incentive Setting</PageTitle>

					<Suspense fallback={<div>Please wait...</div>}>
						<AddGoalParameterPointSetting />
					</Suspense>
				</Route>
				<Route path='/campaign-management/campaign-setting/edit-goal-parameter/:paramCampaignSettingId'>
					<PageTitle breadcrumbs={accountBreadCrumbs}>Point Incentive Setting</PageTitle>

					<Suspense fallback={<div>Please wait...</div>}>
						<EditGoalParameterPointSetting />
					</Suspense>
				</Route>
				<Route path='/campaign-management/campaign-setting/add-point-incentive'>
					<PageTitle breadcrumbs={accountBreadCrumbs}>Point Incentive Setting</PageTitle>

					<Suspense fallback={<div>Please wait...</div>}>
						<AddPointIncentive />
					</Suspense>
				</Route>

				<Route path='/campaign-management/campaign-setting/edit-point-incentive/:paramCampaignSettingId'>
					<PageTitle breadcrumbs={accountBreadCrumbs}>Point Incentive Setting</PageTitle>

					<Suspense fallback={<div>Please wait...</div>}>
						<EditPointIncentiveSetting />
					</Suspense>
				</Route>

				<Route path='/campaign-management/campaign-setting/view-point-incentive'>
					<PageTitle breadcrumbs={accountBreadCrumbs}>Point Incentive Setting</PageTitle>

					<Suspense fallback={<div>Please wait...</div>}>
						<ViewPointIncentiveSetting />
					</Suspense>
				</Route>

				<Route path='/campaign-management/campaign-setting/edit-campaign-goal/:id'>
					<PageTitle breadcrumbs={accountBreadCrumbs}>Edit Campaign Goal Setting</PageTitle>

					<Suspense fallback={<div>Please wait...</div>}>
						<EditCampaignGoal  />
					</Suspense>
				</Route>

				<Route path='/campaign-management/campaign-setting/custom-event-setting'>
					<PageTitle breadcrumbs={accountBreadCrumbs}>Custom Event Setting</PageTitle>

					<Suspense fallback={<div>Please wait...</div>}>
						<CustomEventList />
					</Suspense>
				</Route>

				<Route path='/campaign-management/manage-telegram-bot'>
					<PageTitle breadcrumbs={accountBreadCrumbs}>Manage Telegram BOT</PageTitle>

					<Suspense fallback={<div>Please wait...</div>}>
						<ManageBot />
					</Suspense>
				</Route>

				<Route path='/campaign-management/search-broadcast'>
					<PageTitle breadcrumbs={accountBreadCrumbs}>Search Broadcast</PageTitle>

					<Suspense fallback={<div>Please wait...</div>}>
						<SearchBroadcast />
					</Suspense>
				</Route>

				<Route path='/campaign-management/create-broadcast/:id'>
					<PageTitle breadcrumbs={accountBreadCrumbs}>Create Broadcast</PageTitle>

					<Suspense fallback={<div>Please wait...</div>}>
						<CreateBroadcast />
					</Suspense>
				</Route>
				<Route path='/campaign-management/view-broadcast/:id'>
					<PageTitle breadcrumbs={accountBreadCrumbs}>View Broadcast</PageTitle>

					<Suspense fallback={<div>Please wait...</div>}>
						<ViewBroadcast />
					</Suspense>
				</Route>
				<Route path='/campaign-management/edit-broadcast/:id'>
					<PageTitle breadcrumbs={accountBreadCrumbs}>Edit Broadcast</PageTitle>

					<Suspense fallback={<div>Please wait...</div>}>
						<EditBroadcast />
					</Suspense>
				</Route>

				<Redirect from='/campaign-management' exact={true} to='/campaign-management/manage-campaign' />
				<Redirect to='/campaign-management/manage-campaign' />
			</Switch>
		</>
	);
};

export default CampaignManagementPage;
