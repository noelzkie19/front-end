import {all} from 'redux-saga/effects'
import {combineReducers} from 'redux'

import * as auth from '../../app/modules/auth'
import * as system from '../../app/modules/system'
import * as caseCommunication from '../../app/modules/case-communication'
import * as agentWorkspace from '../../app/modules/campaign-agent-workspace'
import * as campaign from '../../app/modules/campaign-management'
import * as campaignSetting from '../../app/modules/campaign-setting/redux/AutoTaggingRedux'
import * as campaignGoalSetting from '../../app/modules/campaign-setting/setting-goal'
import * as segment from '../../app/modules/player-management/segmentation'
import * as callList from '../../app/modules/campaign-call-list-validation'

export const rootReducer = combineReducers({
  auth: auth.reducer,
  system: system.reducer,
  segment: segment.reducer,
  campaignSetting: campaignSetting.reducer,
  agentWorkspace: agentWorkspace.reducer,
  callList: callList.reducer,
  campaign: campaign.reducer,
  caseCommunication: caseCommunication.reducer,
  campaignGoalSetting: campaignGoalSetting.reducer,
})

export type RootState = ReturnType<typeof rootReducer>

export function* rootSaga() {
  yield all([auth.saga()])
}
