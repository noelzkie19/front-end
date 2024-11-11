import { BaseModel } from './../../../user-management/models/BaseModel';
import { CampaignIncentiveDataSourceModel, CampaignIncentiveDataSourceModelFactory } from './CampaignIncentiveDataSourceModel';
import { CampaignConfigurationGoalModel} from './CampaignConfigurationGoalModel';
import { CampaignConfigurationExchangeRateModel } from './CampaignConfigurationExchangeRateModel';
import { CampaignInformationCurrencyModel} from './CampaignInformationCurrencyModel';
import { CampaignConfigurationAutoTaggingModel} from './CampaignConfigurationAutoTaggingModel';
import { CampaignConfigurationModel, CampaignConfigurationModelFactory } from './CampaignConfigurationModel';
import { CampaignInformationModel, CampaignInformationModelFactory } from './CampaignInformationModel';
import { CampaignConfigurationCommunicationModel, CampaignConfigurationCommunicationModelFactory } from './CampaignConfigurationCommunicationModel';
import { CampaignCustomEventCountryRequestModel } from './CampaignCustomEventCountryRequestModel';
import { CampaignCommunicationCustomEventRequestModel } from './CampaignCommunicationCustomEventRequestModel';

export interface CampaignModel  extends BaseModel{
    campaignId: number,
    campaignStatusId: number ,
    campaignName : string,
    updatedBy : number,
    createdBy : number,
    campaignInformationModel : CampaignInformationModel,
    campaignConfigurationModel : CampaignConfigurationModel,
    campaignConfigurationAutoTaggingModel : Array<CampaignConfigurationAutoTaggingModel>,
    campaignInformationCurrencyModel: Array<CampaignInformationCurrencyModel>,
    campaignConfigurationExchangeRateModel:Array<CampaignConfigurationExchangeRateModel>
    campaignConfigurationGoalModel : Array<CampaignConfigurationGoalModel>,
    campaignIncentiveDataSourceModel : CampaignIncentiveDataSourceModel,
    campaignConfigurationCommunicationModel: CampaignConfigurationCommunicationModel,
    campaignCommunicationCustomEventModel: Array<CampaignCommunicationCustomEventRequestModel>,
    campaignCustomEventCountryModel: Array<CampaignCustomEventCountryRequestModel>,
    createdByName : string,
    updatedByName: string,
    createdDate: string,
    updatedDate: string,
    holdReason: string,
    campaignGuid: string,
}

export function CampaignModelFactory() {
    const obj: CampaignModel = {
        campaignId: 0,
        campaignStatusId: 0,
        campaignName : '',
        updatedBy : 0,
        createdBy : 0,
        campaignInformationModel :  CampaignInformationModelFactory(),
        campaignConfigurationModel : CampaignConfigurationModelFactory(),
        campaignConfigurationAutoTaggingModel :[],
        campaignInformationCurrencyModel: [],
        campaignConfigurationExchangeRateModel:[],
        campaignConfigurationGoalModel : [],
        campaignIncentiveDataSourceModel : CampaignIncentiveDataSourceModelFactory(),
        campaignConfigurationCommunicationModel : CampaignConfigurationCommunicationModelFactory(),
        campaignCommunicationCustomEventModel: [],
        campaignCustomEventCountryModel:[],
        queueId: "",
        userId: "",
        createdByName : "",
        updatedByName: "",
        createdDate: "",
        updatedDate: "",
        holdReason: "",
        campaignGuid: ""
        
    }
    return obj
}

