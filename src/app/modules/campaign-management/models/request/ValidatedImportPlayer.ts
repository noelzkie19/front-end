import {CampaignCSVPlayerListModel} from './CampaignCSVPlayerListModel'
import {ValidatedPlayerListModel} from './ValidatedPlayerListModel'

export interface ValidatedImportPlayer {
  validatedPlayerList: ValidatedPlayerListModel
  campaignCSVPlayerList: Array<CampaignCSVPlayerListModel>
}
