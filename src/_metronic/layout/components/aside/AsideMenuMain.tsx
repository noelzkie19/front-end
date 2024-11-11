/* eslint-disable react/jsx-no-target-blank */
import { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import swal from 'sweetalert';
import * as auth from '../../../../app/modules/auth/redux/AuthRedux';
import { USER_CLAIMS } from '../../../../app/modules/user-management/components/constants/UserClaims';
import { RootState } from '../../../../setup';
import { AsideMenuItem } from './AsideMenuItem';
import { AsideMenuItemWithSub } from './AsideMenuItemWithSub';
import { getFilterIDByUserId } from '../../../../app/modules/ticket-management/services/TicketManagementApi';
import useConstant from '../../../../app/constants/useConstant';

export function AsideMenuMain() {
	const intl = useIntl();
	const userAccessId = useSelector<RootState>(({ auth }) => auth.userId, shallowEqual) as number;
	const userAccess = useSelector<RootState>(({ auth }) => auth.access, shallowEqual) as string;
	const expiresIn = useSelector<RootState>(({ auth }) => auth.expiresIn, shallowEqual) as string;
	const history = useHistory();
	const dispatch = useDispatch();
	const [time, setTime] = useState<any>();
	const expiration = new Date(expiresIn);
	var today = new Date();
	const { successResponse } = useConstant();
	const [filterId, setFilterId] = useState<any>();

	const isExpired = expiration <= today;

	if (isExpired) {
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

	//Listening if the User is logged out
	useEffect(() => {
		const interval = setInterval(() => {
			let isLoggedIn = localStorage.getItem('isLoggedIn');
			if (isLoggedIn === 'false') dispatch(auth.actions.logout());
			const newTime = new Date().toLocaleTimeString();
			setTime(newTime);
		}, 1000);
		return () => {
			clearInterval(interval);
		};
	}, [time]);

	useEffect(() => {
		
		if (expiration <= today) {
			getFilterIDByUserId(userAccessId.toString())
			.then((response) => {
				if (response.status === successResponse) {
					const filterId: any = [0, null, undefined].indexOf(response.data) === -1 ? response.data : "";
					setFilterId(filterId);
				}
			})
		}

	}, [])
	return (
		<>
			{userAccess !== undefined ? (
				<>
					{(userAccess.includes(USER_CLAIMS.HomeRead) === true || userAccess.includes(USER_CLAIMS.HomeWrite) === true) && (
						<AsideMenuItem
							to='/dashboard'
							icon='/media/icons/duotone/Design/PenAndRuller.svg'
							title={intl.formatMessage({ id: 'MENU.DASHBOARD' })}
							fontIcon='bi-app-indicator'
						/>
					)}

					{(userAccess.includes(USER_CLAIMS.SystemRead) === true || userAccess.includes(USER_CLAIMS.SystemWrite) === true) && (
						<AsideMenuItemWithSub to='/system' title='System' icon='/media/icons/duotone/General/Settings-3.svg' fontIcon='bi-person'>
							{(userAccess.includes(USER_CLAIMS.OperatorAndBrandRead) === true ||
								userAccess.includes(USER_CLAIMS.OperatorAndBrandWrite) === true) && (
									<AsideMenuItem to='/system/operator-list' title='Operator List' hasBullet={true} />
								)}
							{(userAccess.includes(USER_CLAIMS.CodeListRead) === true || userAccess.includes(USER_CLAIMS.CodeListWrite) === true) && (
								<AsideMenuItem to='/system/code-list' title='Code List' hasBullet={true} />
							)}
							{(userAccess.includes(USER_CLAIMS.SurveyQuestionAndAnswerRead) === true ||
								userAccess.includes(USER_CLAIMS.SurveyQuestionAndAnswerWrite) === true) && (
									<AsideMenuItem to='/system/survey-question-list' title='Survey Question' hasBullet={true} />
								)}
							{(userAccess.includes(USER_CLAIMS.SurveyTemplateRead) === true || userAccess.includes(USER_CLAIMS.SurveyTemplateWrite) === true) && (
								<AsideMenuItem to='/system/survey-template-list' title='Survey Template' hasBullet={true} />
							)}
							{(userAccess.includes(USER_CLAIMS.PlayerConfigurationRead) === true ||
								userAccess.includes(USER_CLAIMS.PlayerConfigurationWrite) === true) && (
									<AsideMenuItem to='/system/player-configuration-list' title='Player Configuration' hasBullet={true} />
								)}
							{userAccess.includes(USER_CLAIMS.PostChatSurveyRead) === true && (
								<AsideMenuItem to='/system/post-chat-survey-list' title='Post Chat Survey' hasBullet={true} />
							)}
							{userAccess.includes(USER_CLAIMS.SkillMappingRead) === true && (
								<AsideMenuItem to='/system/skill-mapping' title='Skill Mapping' hasBullet={true} />
							)}
							{(userAccess.includes(USER_CLAIMS.StaffPerformanceRead) === true || userAccess.includes(USER_CLAIMS.StaffPerformanceWrite) === true) && (
								<AsideMenuItem to='/system/staff-performance-setting' title='Staff Performance Setting' hasBullet={true} />
							)}
						</AsideMenuItemWithSub>
					)}

					{(userAccess.includes(USER_CLAIMS.UserManagementRead) === true || userAccess.includes(USER_CLAIMS.UserManagementWrite) === true) && (
						<AsideMenuItemWithSub
							to='/user-management'
							title='User Management'
							icon='/media/icons/duotone/General/Settings-2.svg'
							fontIcon='bi-person'
						>
							{(userAccess.includes(USER_CLAIMS.UsersRead) === true || userAccess.includes(USER_CLAIMS.UsersWrite) === true) && (
								<AsideMenuItem to='/user-management/user-list' title='User List' hasBullet={true} />
							)}
							{(userAccess.includes(USER_CLAIMS.TeamsRead) === true || userAccess.includes(USER_CLAIMS.TeamsWrite) === true) && (
								<AsideMenuItem to='/user-management/team-list' title='Team List' hasBullet={true} />
							)}
							{(userAccess.includes(USER_CLAIMS.RolesRead) === true || userAccess.includes(USER_CLAIMS.RolesWrite) === true) && (
								<AsideMenuItem to='/user-management/role-list' title='Role List' hasBullet={true} />
							)}
						</AsideMenuItemWithSub>
					)}

					{(userAccess.includes(USER_CLAIMS.PlayerRead) === true || userAccess.includes(USER_CLAIMS.PlayerWrite) === true) && (
						<AsideMenuItemWithSub to='' icon='/media/icons/duotone/General/User.svg' title='Player Management' fontIcon='bi-layers'>
							{userAccess.includes(USER_CLAIMS.ViewContactDetailsLogRead) === true && (
								<AsideMenuItem to='/player-management/view-contact-details' title='View Contact Details' hasBullet={true} />
							)}
							{(userAccess.includes(USER_CLAIMS.PlayerSearchRead) === true || userAccess.includes(USER_CLAIMS.PlayerSearchWrite) === true) && (
								<AsideMenuItem to='/player-management/player-list' title='Player List' hasBullet={true} />
							)}
							{(userAccess.includes(USER_CLAIMS.SegmentationRead) === true || userAccess.includes(USER_CLAIMS.SegmentationWrite) === true) && (
								<AsideMenuItem to='/player-management/segmentation-list' title='Segmentation' hasBullet={true} />
							)}
							{(userAccess.includes(USER_CLAIMS.SearchLeadsRead) === true || userAccess.includes(USER_CLAIMS.SearchLeadsWrite) === true) && (
								<AsideMenuItem to='/player-management/search-leads' title='Search Leads' hasBullet={true} />
							)}
						</AsideMenuItemWithSub>
					)}


					{(userAccess.includes(USER_CLAIMS.CampaignRead) === true || userAccess.includes(USER_CLAIMS.CampaignWrite) === true) && (
						<AsideMenuItemWithSub to='' icon='/media/icons/duotone/Communication/Group-chat.svg' title='Campaign Management' fontIcon='bi-layers'>
							{(userAccess.includes(USER_CLAIMS.ManageJourneyRead) === true || userAccess.includes(USER_CLAIMS.ManageJourneyWrite) === true) && (
								<AsideMenuItem to='/campaign-management/manage-journey' title='Manage Journey' hasBullet={true} />
							)}
							{(userAccess.includes(USER_CLAIMS.ManageCampaignRead) === true || userAccess.includes(USER_CLAIMS.ManageCampaignWrite) === true) && (
								<AsideMenuItem to='/campaign-management/manage-campaign' title='Manage Campaign' hasBullet={true} />
							)}

							{/* Campaign Setting Group */}
							{(userAccess.includes(USER_CLAIMS.CampaignSettingRead) === true || userAccess.includes(USER_CLAIMS.CampaignSettingWrite) === true) && (
								<AsideMenuItemWithSub to='' title='Campaign Setting' fontIcon='bi-layers' hasBullet={true}>
									<>
										{(userAccess.includes(USER_CLAIMS.SearchGoalSettingRead) === true ||
											userAccess.includes(USER_CLAIMS.SearchGoalSettingWrite) === true) && (
												<AsideMenuItem to='/campaign-management/campaign-setting/campaign-goal' title='Campaign Goal Setting' hasBullet={true} />
											)}
										{(userAccess.includes(USER_CLAIMS.SearchAutoTaggingRead) === true ||
											userAccess.includes(USER_CLAIMS.SearchAutoTaggingWrite) === true) && (
												<AsideMenuItem to='/campaign-management/campaign-setting/auto-tagging' title='Auto Tagging Setting' hasBullet={true} />
											)}
										{(userAccess.includes(USER_CLAIMS.IncentiveGoalSettingRead) === true ||
											userAccess.includes(USER_CLAIMS.IncentiveGoalSettingWrite) === true) && (
												<AsideMenuItem to='/campaign-management/campaign-setting/point-incentive' title='Point Incentive Setting' hasBullet={true} />
											)}
										{(userAccess.includes(USER_CLAIMS.CustomEventSettingRead) === true ||
											userAccess.includes(USER_CLAIMS.CustomEventSettingWrite) === true) && (
												<AsideMenuItem to='/campaign-management/campaign-setting/custom-event-setting' title='Custom Event Setting' hasBullet={true} />
											)}
										{/* Engagement Hub */}
										{userAccess.includes(USER_CLAIMS.TelegramBotSettingRead) === true && (
											<AsideMenuItem to='/campaign-management/manage-telegram-bot' title='Manage Telegram BOT' hasBullet={true} />
										)}
									</>
								</AsideMenuItemWithSub>
							)}

							{(userAccess.includes(USER_CLAIMS.BroadcastRead) === true || userAccess.includes(USER_CLAIMS.BroadcastWrite) === true) && (
								<AsideMenuItem to='/campaign-management/search-broadcast' title='Search Broadcast' hasBullet={true} />
							)}

						</AsideMenuItemWithSub>
					)}

					{(userAccess.includes(USER_CLAIMS.CampaignWorkspaceRead) === true || userAccess.includes(USER_CLAIMS.CampaignWorkspaceWrite) === true) && (
						<AsideMenuItemWithSub to='' icon='/media/icons/duotone/Communication/Call.svg' title='Campaign Workspace' fontIcon='bi-layers'>
							{(userAccess.includes(USER_CLAIMS.AgentWorkSpaceRead) === true || userAccess.includes(USER_CLAIMS.AgentWorkSpaceWrite) === true) && (
								<AsideMenuItem to='/campaign-workspace/agent-workspace' title='Agent Workspace' hasBullet={true} />
							)}
							{(userAccess.includes(USER_CLAIMS.CallListValidationRead) === true ||
								userAccess.includes(USER_CLAIMS.CallListValidationWrite) === true) && (
									<AsideMenuItem to='/campaign-workspace/call-list-validation' title='Call List Validation' hasBullet={true} />
								)}
							{(userAccess.includes(USER_CLAIMS.AgentMonitoringRead) === true || userAccess.includes(USER_CLAIMS.AgentMonitoringWrite) === true) && (
								<AsideMenuItem to='/campaign-workspace/agent-monitoring' title='Agent Monitoring' hasBullet={true} />
							)}
						</AsideMenuItemWithSub>
					)}

					{(userAccess.includes(USER_CLAIMS.CampaignDashboardRead) === true || userAccess.includes(USER_CLAIMS.CampaignDashboardWrite) === true) && (
						<AsideMenuItemWithSub to='' icon='/media/icons/duotone/Shopping/Chart.svg' title='Campaign Dashboard' fontIcon='bi-layers'>
							{(userAccess.includes(USER_CLAIMS.SurveyAndFeedbackRead) === true ||
								userAccess.includes(USER_CLAIMS.SurveyAndFeedbackWrite) === true) && (
									<AsideMenuItem to='/campaign-dashboard/survey-and-feedback' title='Survey and Feedback' hasBullet={true} />
								)}

							{(userAccess.includes(USER_CLAIMS.CampaignPerformanceRead) === true ||
								userAccess.includes(USER_CLAIMS.CampaignPerformanceWrite) === true) && (
									<AsideMenuItem to='/campaign-dashboard/campaign-performance' title='Campaign Performance' hasBullet={true} />
								)}
						</AsideMenuItemWithSub>
					)}

					{(userAccess.includes(USER_CLAIMS.RelationshipManagementRead) === true ||
						userAccess.includes(USER_CLAIMS.RelationshipManagementWrite) === true) && (
							<AsideMenuItemWithSub to='' icon='/media/icons/duotone/Communication/Group-chat.svg' title='Relationship Management' fontIcon='bi-layers'>
								{userAccess.includes(USER_CLAIMS.RemDistributionRead) && (
									<AsideMenuItem to='/relationship-management/rem-distribution' title='ReM Distribution' hasBullet={true} />
								)}
								{userAccess.includes(USER_CLAIMS.RemProfileRead) && (
									<AsideMenuItem to='/relationship-management/rem-profile' title='ReM Profile' hasBullet={true} />
								)}
								{userAccess.includes(USER_CLAIMS.RemSettingRead) && (
									<AsideMenuItemWithSub to='' title='ReM Setting' fontIcon='bi-layers' hasBullet={true}>
										<AsideMenuItem to='/relationship-management/rem-schedule' title='Schedule' hasBullet={true} />
										{userAccess.includes(USER_CLAIMS.RemAutoDistributionSettingRead) && (
											<AsideMenuItem to='/relationship-management/auto-distribution-setting' title='Auto Distribution Setting' hasBullet={true} />
										)}
									</AsideMenuItemWithSub>
								)}
							</AsideMenuItemWithSub>
						)}

					{
						//ToDo: Uncomment the following once the securable object implemented
						(userAccess.includes(USER_CLAIMS.CaseManagementRead) === true || userAccess.includes(USER_CLAIMS.CaseManagementWrite) === true) && (
							<AsideMenuItemWithSub to='' icon='/media/icons/duotone/Clothes/Briefcase.svg' title='Case Management' fontIcon='bi-layers'>
								{userAccess.includes(USER_CLAIMS.SearchCaseCommunicationRead) && (
									<AsideMenuItem to='/case-management/search-case-communication' title='Search Case and Communication' hasBullet={true} />
								)}
								{userAccess.includes(USER_CLAIMS.PCSQuestionnairesRead) === true && (
									<AsideMenuItem to='/case-management/pcs-questionnaires' title='PCS Questionnaires' hasBullet={true} />
								)}
							</AsideMenuItemWithSub>
						)
					}

					{(userAccess.includes(USER_CLAIMS.CommunicationReviewReportRead) === true ||
						userAccess.includes(USER_CLAIMS.CommunicationReviewReportWrite) === true) && (
							<AsideMenuItemWithSub to='' icon='/media/icons/duotone/Shopping/Chart-bar1.svg' title='Reports' fontIcon='bi-layers'>
								<AsideMenuItem to='/reports/search-communication-review-report' title='Communication Review' hasBullet={true} />
							</AsideMenuItemWithSub>
						)}

					{(userAccessId == 0 || userAccess.includes(USER_CLAIMS.TicketsRead) === true || userAccess.includes(USER_CLAIMS.TicketsWrite) === true) && (
						<AsideMenuItemWithSub to='' icon='/media/icons/duotone/Shopping/Ticket.svg' title='Tickets' fontIcon='bi-layers'>
							{
								(userAccess.includes(USER_CLAIMS.ManageTicketsRead) === true || userAccess.includes(USER_CLAIMS.ManageTicketsWrite) === true
							  || userAccess.includes(USER_CLAIMS.MissingDepositeRead) || userAccess.includes(USER_CLAIMS.MissingDepositWrite)
							  || (userAccess.includes(USER_CLAIMS.ReporterRoleRead) || userAccess.includes(USER_CLAIMS.ReporterRoleWrite) &&
							  	  userAccess.includes(USER_CLAIMS.ManageTicketsRead) || userAccess.includes(USER_CLAIMS.ManageTicketsWrite) )
							  )
							  && (
								<AsideMenuItem to={'/ticket-management/search-ticket/' + (filterId ?? "")} title='Manage Tickets' hasBullet={true} />
							)}
						</AsideMenuItemWithSub>
					)}

					{(userAccessId == 0 || userAccess.includes(USER_CLAIMS.AdminRead) === true || userAccess.includes(USER_CLAIMS.AdminWrite) === true) && (
						<AsideMenuItemWithSub to='' icon='/media/icons/duotone/Tools/Tools.svg' title='Administrator' fontIcon='bi-layers'>
							<AsideMenuItem to='/administrator/ms-monitoring' title='MicroService Monitoring' hasBullet={true} />
							<AsideMenuItem to='/administrator/app-config-setting' title='App Config Setting' hasBullet={true} />
							<AsideMenuItem to='/administrator/event-subscription-setting' title='Event Subscription Setting' hasBullet={true} />
						</AsideMenuItemWithSub>
					)}

					<AsideMenuItem to='/logout' icon='/media/icons/duotone/General/Lock.svg' title='Sign Out' fontIcon='bi-app-indicator' />
				</>
			) : null}
		</>
	);
}
