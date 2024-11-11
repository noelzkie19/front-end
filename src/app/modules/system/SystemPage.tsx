import React, {Suspense, lazy} from 'react';
import {shallowEqual, useSelector} from 'react-redux';
import {Redirect, Route, Switch, useHistory} from 'react-router-dom';
import swal from 'sweetalert';
import {PageLink, PageTitle} from '../../../_metronic/layout/core';
import {RootState} from '../../../setup';
import OperatorList from './components/operator/OperatorList';
import EditPaymentMethod from './components/player-configuration/EditPaymentMethod';

const CreateOperator = lazy(() => import('./components/operator/CreateOperator'));
const EditOperator = lazy(() => import('./components/operator/EditOperator'));
const CodeList = lazy(() => import('./components/code/CodeList'));
const MessageResponseLists = lazy(() => import('./components/message-response/MessageResponseLists'));
const MessageStatusList = lazy(() => import('./components/message-status/MessageStatusList'));
const MessageTypeList = lazy(() => import('./components/message-type/MessageTypeList'));
const SubTopicList = lazy(() => import('./components/sub-topic/SubTopicList'));
const TopicList = lazy(() => import('./components/topic//TopicList'));
const EditFeedbackAnswer = lazy(() => import('./components/feedback-answer/EditFeedbackAnswer'));
const EditFeedbackCategory = lazy(() => import('./components/feedback-category/EditFeedbackCategory'));
const EditPlayerConfiguration = lazy(() => import('./components/player-configuration/EditPlayerConfiguration'));
const EditSurveyQuestion = lazy(() => import('./components/survey-question/EditSurveyQuestion'));
const EditSurveyTemplate = lazy(() => import('./components/survey-template/EditSurveyTemplate'));
const PlayerConfigurationList = lazy(() => import('./components/player-configuration/PlayerConfigurationList'));
const SurveyQuestionList = lazy(() => import('./components/survey-question/SurveyQuestionList'));
const SurveyTemplateList = lazy(() => import('./components/survey-template/SurveyTemplateList'));
const FeedBacktypeList = lazy(() => import('./components/feedback-type/FeedBacktypeList'));
const EditVIPLevel = lazy(() => import('./components/player-configuration/EditVIPLevel'));
const EditRiskLevel = lazy(() => import('./components/player-configuration/EditRiskLevel'));
const EditLanguage = lazy(() => import('./components/player-configuration/EditLanguage'));
const EditPlayerStatus = lazy(() => import('./components/player-configuration/EditPlayerStatus'));
const EditPortal = lazy(() => import('./components/player-configuration/EditPortal'));
const EditPaymentGroup = lazy(() => import('./components/player-configuration/EditPaymentGroup'));
const EditMarketingChannel = lazy(() => import('./components/player-configuration/EditMarketingChannel'));
const EditCurrency = lazy(() => import('./components/player-configuration/EditCurrency'));
const ViewPlayerConfiguration = lazy(() => import('./components/player-configuration/ViewPlayerConfiguration'));
const EditCountry = lazy(() => import('./components/player-configuration/EditCountry'));
const PostChatSurvey = lazy(() => import('./components/post-chat-survey/PostChatSurveyList'));
const SkillMapping = lazy(() => import('./components/skill-mapping/SkillList'));
const AgentSurvey = lazy(() => import('./components/agent-survey/AgentSurvey'));
const StaffPerformance = lazy(() => import('./components/staff-performance/StaffPerformancePage'));

const accountBreadCrumbs: Array<PageLink> = [
	{
		title: '',
		path: '/system/operator-list',
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

const surveyQuestionBreadCrumbs: Array<PageLink> = [
	{
		title: 'System',
		path: '/system/survey-question-list',
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

const UserManagementPage: React.FC = () => {
	const expiresIn = useSelector<RootState>(({ auth }) => auth.expiresIn, shallowEqual) as string;
	const history = useHistory();

	const expiration = new Date(expiresIn);
	const today = new Date();

	if (expiration <= today) {
		swal({
			title: 'Expired Session Detected',
			text: 'You are about to logout, Please click OK to proceed.',
			icon: 'warning',
			dangerMode: true,
		}).then((sessionExpired) => {
			if (sessionExpired) {
				history.push('/logout');
			}
		});
	}

	return (
		<Switch>
			<Route path='/system/operator-list'>
				<PageTitle breadcrumbs={accountBreadCrumbs}>Operator List</PageTitle>
				<OperatorList />
			</Route>
			<Route path='/system/create-operator'>
				<PageTitle breadcrumbs={accountBreadCrumbs}>Create Operator</PageTitle>

				<Suspense fallback={<div>Please wait...</div>}>
					<CreateOperator />
				</Suspense>
			</Route>
			<Route path='/system/edit-operator'>
				<PageTitle breadcrumbs={accountBreadCrumbs}>Edit Operator</PageTitle>

				<Suspense fallback={<div>Please wait...</div>}>
					<EditOperator />
				</Suspense>
			</Route>
			<Route path='/system/code-list'>
				<PageTitle breadcrumbs={accountBreadCrumbs}>Code List</PageTitle>
				
				<Suspense fallback={<div>Please wait...</div>}>
					<CodeList />
				</Suspense>
			</Route>
			<Route path='/system/topic-list'>
				<PageTitle breadcrumbs={accountBreadCrumbs}>Topic</PageTitle>

				<Suspense fallback={<div>Please wait...</div>}>
					<TopicList />
				</Suspense>
			</Route>
			<Route path='/system/sub-topic-list'>
				<PageTitle breadcrumbs={accountBreadCrumbs}>Subtopic</PageTitle>

				<Suspense fallback={<div>Please wait...</div>}>
					<SubTopicList />
				</Suspense>
			</Route>
			{/* end route for topic */}
			{/* route for message type */}
			<Route path='/system/message-type-list'>
				<PageTitle breadcrumbs={accountBreadCrumbs}>Message Type</PageTitle>

				<Suspense fallback={<div>Please wait...</div>}>
					<MessageTypeList />
				</Suspense>
			</Route>
			{/* Message Status */}
			<Route path='/system/message-status-list/:messageTypeParentId?'>
				<PageTitle breadcrumbs={accountBreadCrumbs}>Message Status</PageTitle>

				<Suspense fallback={<div>Please wait...</div>}>
					<MessageStatusList />
				</Suspense>
			</Route>
			{/* Message Response */}
			<Route path='/system/message-response-list'>
				<PageTitle breadcrumbs={accountBreadCrumbs}>Message Response</PageTitle>

				<Suspense fallback={<div>Please wait...</div>}>
					<MessageResponseLists />
				</Suspense>
			</Route>
			{/* end */}
			<Route path='/system/feedback-type-list'>
				<PageTitle breadcrumbs={surveyQuestionBreadCrumbs}>Feedback Type</PageTitle>

				<Suspense fallback={<div>Please wait...</div>}>
					<FeedBacktypeList />
				</Suspense>
			</Route>
			<Route path='/system/feedback-category-list'>
				<PageTitle breadcrumbs={surveyQuestionBreadCrumbs}>Feedback Category</PageTitle>

				<Suspense fallback={<div>Please wait...</div>}>
					<EditFeedbackCategory />
				</Suspense>
			</Route>
			<Route path='/system/feedback-answer-list/:id?'>
				<PageTitle breadcrumbs={surveyQuestionBreadCrumbs}>Feedback Answer</PageTitle>

				<Suspense fallback={<div>Please wait...</div>}>
					<EditFeedbackAnswer />
				</Suspense>
			</Route>
			<Route path='/system/survey-question-list'>
				<PageTitle breadcrumbs={surveyQuestionBreadCrumbs}>Survey Question List</PageTitle>

				<Suspense fallback={<div>Please wait...</div>}>
					<SurveyQuestionList />
				</Suspense>
			</Route>
			<Route path='/system/edit-survey-question'>
				<PageTitle breadcrumbs={surveyQuestionBreadCrumbs}>Edit Survey Question</PageTitle>

				<Suspense fallback={<div>Please wait...</div>}>
					<EditSurveyQuestion />
				</Suspense>
			</Route>
			<Route path='/system/survey-template-list'>
				<PageTitle breadcrumbs={surveyQuestionBreadCrumbs}>Survey Template List</PageTitle>

				<Suspense fallback={<div>Please wait...</div>}>
					<SurveyTemplateList />
				</Suspense>
			</Route>
			<Route path='/system/edit-survey-template'>
				<PageTitle breadcrumbs={surveyQuestionBreadCrumbs}>Edit Survey Template</PageTitle>

				<Suspense fallback={<div>Please wait...</div>}>
					<EditSurveyTemplate />
				</Suspense>
			</Route>
			<Route path='/system/player-configuration-list'>
				<PageTitle breadcrumbs={surveyQuestionBreadCrumbs}>Player Configuration</PageTitle>

				<Suspense fallback={<div>Please wait...</div>}>
					<PlayerConfigurationList />
				</Suspense>
			</Route>
			<Route path='/system/edit-player-configuration'>
				<PageTitle breadcrumbs={surveyQuestionBreadCrumbs}>Edit Player Configuration</PageTitle>

				<Suspense fallback={<div>Please wait...</div>}>
					<EditPlayerConfiguration />
				</Suspense>
			</Route>
			<Route path='/system/edit-vip-level'>
				<PageTitle breadcrumbs={surveyQuestionBreadCrumbs}>VIP Level</PageTitle>

				<Suspense fallback={<div>Please wait...</div>}>
					<EditVIPLevel />
				</Suspense>
			</Route>

			<Route path='/system/view-vip-level'>
				<PageTitle breadcrumbs={surveyQuestionBreadCrumbs}>VIP Level</PageTitle>

				<Suspense fallback={<div>Please wait...</div>}>
					<ViewPlayerConfiguration />
				</Suspense>
			</Route>

			<Route path='/system/edit-risk-level'>
				<PageTitle breadcrumbs={surveyQuestionBreadCrumbs}>Risk Level</PageTitle>

				<Suspense fallback={<div>Please wait...</div>}>
					<EditRiskLevel />
				</Suspense>
			</Route>

			<Route path='/system/view-risk-level'>
				<PageTitle breadcrumbs={surveyQuestionBreadCrumbs}>Risk Level</PageTitle>

				<Suspense fallback={<div>Please wait...</div>}>
					<ViewPlayerConfiguration />
				</Suspense>
			</Route>

			<Route path='/system/edit-language'>
				<PageTitle breadcrumbs={surveyQuestionBreadCrumbs}>Language</PageTitle>

				<Suspense fallback={<div>Please wait...</div>}>
					<EditLanguage />
				</Suspense>
			</Route>

			<Route path='/system/view-language'>
				<PageTitle breadcrumbs={surveyQuestionBreadCrumbs}>Language</PageTitle>

				<Suspense fallback={<div>Please wait...</div>}>
					<ViewPlayerConfiguration />
				</Suspense>
			</Route>

			<Route path='/system/edit-player-status'>
				<PageTitle breadcrumbs={surveyQuestionBreadCrumbs}>Player Status</PageTitle>

				<Suspense fallback={<div>Please wait...</div>}>
					<EditPlayerStatus />
				</Suspense>
			</Route>

			<Route path='/system/view-player-status'>
				<PageTitle breadcrumbs={surveyQuestionBreadCrumbs}>Player Status</PageTitle>

				<Suspense fallback={<div>Please wait...</div>}>
					<ViewPlayerConfiguration />
				</Suspense>
			</Route>

			<Route path='/system/edit-portal'>
				<PageTitle breadcrumbs={surveyQuestionBreadCrumbs}>Portal</PageTitle>

				<Suspense fallback={<div>Please wait...</div>}>
					<EditPortal />
				</Suspense>
			</Route>

			<Route path='/system/view-portal'>
				<PageTitle breadcrumbs={surveyQuestionBreadCrumbs}>Portal</PageTitle>

				<Suspense fallback={<div>Please wait...</div>}>
					<ViewPlayerConfiguration />
				</Suspense>
			</Route>

			<Route path='/system/edit-payment-group'>
				<PageTitle breadcrumbs={surveyQuestionBreadCrumbs}>Payment Group</PageTitle>

				<Suspense fallback={<div>Please wait...</div>}>
					<EditPaymentGroup />
				</Suspense>
			</Route>

			<Route path='/system/view-payment-group'>
				<PageTitle breadcrumbs={surveyQuestionBreadCrumbs}>Payment Group</PageTitle>

				<Suspense fallback={<div>Please wait...</div>}>
					<ViewPlayerConfiguration />
				</Suspense>
			</Route>

			<Route path='/system/edit-marketing-channel'>
				<PageTitle breadcrumbs={surveyQuestionBreadCrumbs}>Marketing Channel</PageTitle>

				<Suspense fallback={<div>Please wait...</div>}>
					<EditMarketingChannel />
				</Suspense>
			</Route>

			<Route path='/system/view-marketing-channel'>
				<PageTitle breadcrumbs={surveyQuestionBreadCrumbs}>Marketing Channel</PageTitle>

				<Suspense fallback={<div>Please wait...</div>}>
					<ViewPlayerConfiguration />
				</Suspense>
			</Route>

			<Route path='/system/edit-currency'>
				<PageTitle breadcrumbs={surveyQuestionBreadCrumbs}>Currency</PageTitle>

				<Suspense fallback={<div>Please wait...</div>}>
					<EditCurrency />
				</Suspense>
			</Route>
			<Route path='/system/view-currency'>
				<PageTitle breadcrumbs={surveyQuestionBreadCrumbs}>Currency</PageTitle>

				<Suspense fallback={<div>Please wait...</div>}>
					<ViewPlayerConfiguration />
				</Suspense>
			</Route>

			<Route path='/system/edit-country'>
				<PageTitle breadcrumbs={surveyQuestionBreadCrumbs}>Country</PageTitle>

				<Suspense fallback={<div>Please wait...</div>}>
					<EditCountry />
				</Suspense>
			</Route>
			<Route path='/system/view-country'>
				<PageTitle breadcrumbs={surveyQuestionBreadCrumbs}>Country</PageTitle>

				<Suspense fallback={<div>Please wait...</div>}>
					<ViewPlayerConfiguration />
				</Suspense>
			</Route>
			<Route path='/system/edit-payment-method'>
				<PageTitle breadcrumbs={surveyQuestionBreadCrumbs}>Payment Method</PageTitle>

				<Suspense fallback={<div>Please wait...</div>}>
					<EditPaymentMethod />
				</Suspense>
			</Route>

			<Route path='/system/view-payment-Method'>
				<PageTitle breadcrumbs={surveyQuestionBreadCrumbs}>Payment Method</PageTitle>

				<Suspense fallback={<div>Please wait...</div>}>
					<ViewPlayerConfiguration />
				</Suspense>
			</Route>
			<Route path='/system/post-chat-survey-list'>
				<PageTitle>Post Chat Survey Setting</PageTitle>

				<Suspense fallback={<div>Please wait...</div>}>
					<PostChatSurvey />
				</Suspense>
			</Route>
			<Route path='/system/skill-mapping'>
				<PageTitle>Skill Mapping</PageTitle>

				<Suspense fallback={<div>Please wait...</div>}>
					<SkillMapping />
				</Suspense>
			</Route>

			<Route path='/system/agent-survey'>
				<PageTitle>Agent Survey</PageTitle>

				<Suspense fallback={<div>Please wait...</div>}>
					<AgentSurvey />
				</Suspense>
			</Route>
			<Route path='/system/staff-performance-setting'>
				<PageTitle>Staff Performance Setting</PageTitle>
				<Suspense fallback={<div>Please wait...</div>}>
					<StaffPerformance />
				</Suspense>
			</Route>			
			<Redirect from='/system' exact={true} to='/system/operator-list' />
			<Redirect to='/system/operator-list' />
		</Switch>
	);
};

export default UserManagementPage;
