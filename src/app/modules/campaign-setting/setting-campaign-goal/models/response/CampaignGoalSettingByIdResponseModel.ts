import {ActiveEndedCampaignListModel, BaseRequestModel, CampaignGoalSettingListModel, GoalTypeGameActivityUdtModel} from '..';
import {GoalTypeCommunicationRecordUdtModel} from '../GoalTypeCommunicationRecordUdtModel';
import {GoalTypeDepositCurrencyMinMaxUdtModel} from '../GoalTypeDepositCurrencyMinMaxUdtModel';
import {GoalTypeDepositUdtModel} from '../GoalTypeDepositUdtModel';
import {GoalTypeGameActivityCurrMinMaxUdtModel} from '../GoalTypeGameActivityCurrMinMaxUdtModel';
import {GoalTypeListConfigurationModel} from '../GoalTypeListConfigurationModel';

export interface CampaignGoalSettingByIdResponseModel extends BaseRequestModel {
	campaignGoalSettingList: CampaignGoalSettingListModel;
	goalTypeCommunicationRecordList: Array<GoalTypeCommunicationRecordUdtModel>;
	goalTypeDepositList: Array<GoalTypeDepositUdtModel>;
	goalTypeDepositCurrencyMinMaxList: Array<GoalTypeDepositCurrencyMinMaxUdtModel>;
	goalTypeGameActivityTypeList: Array<GoalTypeGameActivityUdtModel>;
	goalTypeGameActivityCurrencyMinMaxList: Array<GoalTypeGameActivityCurrMinMaxUdtModel>;
	goalTypeCommunicationRecordDepositList: Array<GoalTypeListConfigurationModel>;
	campaignList: Array<ActiveEndedCampaignListModel>;
}
