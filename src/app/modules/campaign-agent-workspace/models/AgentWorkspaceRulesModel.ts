import {CampaignPlayerResponseModel} from './response/CampaignPlayerResponseModel'

interface IAgentWorkspaceRule {
  isValid: (item: CampaignPlayerResponseModel) => boolean
}

export class CampaignIsCompletedRule implements IAgentWorkspaceRule {
  isValid = (item: CampaignPlayerResponseModel) => {
    return item && item.campaignStatusId === 32
  }
}

export class WelcomeCallTagRule implements IAgentWorkspaceRule {
  isValid = (item: CampaignPlayerResponseModel) => {
    // Valid if the conditions are met
    return (
      // No Case Yet
      // No First Time Deposit
      (item.campaignType === 'Welcome call' && // For Welcome Call only
      item.ftdAmount !== undefined &&
      item.ftdAmount === 0 && item.caseInformationId == undefined)
    ); // Campaign is not Completed
  }
}

export class RetentionTagRule implements IAgentWorkspaceRule {
  isValid = (item: CampaignPlayerResponseModel) => {
    // Valid if the conditions are met
    return (
      item.campaignType === 'Retention Campaign' && // Retention only
      item.initialDepositAmount !== undefined &&
      item.initialDepositAmount === 0 &&
      item.caseInformationId == undefined
    )
  }
}

export class PlayerHasNoAgentRule implements IAgentWorkspaceRule {
  isValid = (item: CampaignPlayerResponseModel) => {
    return item && (item.agentName === '' || item.agentName == undefined)
  }
}
