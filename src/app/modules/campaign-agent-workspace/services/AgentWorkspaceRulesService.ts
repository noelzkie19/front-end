import { CampaignIsCompletedRule, PlayerHasNoAgentRule, RetentionTagRule, WelcomeCallTagRule } from './../models/AgentWorkspaceRulesModel';
import { CampaignPlayerResponseModel } from "../models";

export class AgentWorkspaceRulesService {
    taggingEnabledRule = (item: CampaignPlayerResponseModel) => {
        const rulesArray: Array<boolean> = [
            !(new CampaignIsCompletedRule().isValid(item)) // Campaign Not Completed Rule
        ]

        // Check if Retention or Welcome Call
        switch (item.campaignType) {
          case 'Retention Campaign':
            rulesArray.push(new RetentionTagRule().isValid(item)) // Retention Rule
            break;
          case 'Welcome call':
            rulesArray.push(new WelcomeCallTagRule().isValid(item)) // Welcome Call Rule
            break;
          default:
            rulesArray.push(false)
        }

        //All Rules must be satisfied
        return rulesArray.every(i => i)
    }

    playerHasNoAgentRule = (item: CampaignPlayerResponseModel) => {
        return new PlayerHasNoAgentRule().isValid(item)
    }

    tagRule = (item: CampaignPlayerResponseModel) => {
        const rulesArray: Array<boolean> = [
            this.playerHasNoAgentRule(item),
            !(new CampaignIsCompletedRule().isValid(item)), // Campaign Not Completed Rule
        ]

        switch (item.campaignType) {
            case 'Retention Campaign':
              rulesArray.push(new RetentionTagRule().isValid(item)) // Retention Rule
              break;
            case 'Welcome call':
              rulesArray.push(new WelcomeCallTagRule().isValid(item)) // Welcome Call Rule
              break;
            default:
              rulesArray.push(false)
          }

        return rulesArray.every(i => i)
    }

    retagRule = (item: CampaignPlayerResponseModel) => {
        const rulesArray: Array<boolean> = [
            !this.playerHasNoAgentRule(item),
            !(new CampaignIsCompletedRule().isValid(item)), // Campaign Not Completed Rule
        ]

        switch (item.campaignType) {
            case 'Retention Campaign':
              rulesArray.push(new RetentionTagRule().isValid(item)) // Retention Rule
              break;
            case 'Welcome call':
              rulesArray.push(new WelcomeCallTagRule().isValid(item)) // Welcome Call Rule
              break;
            default:
              rulesArray.push(false)
          }

        return rulesArray.every(i => i)
    }

    tagtomeRule = (item: CampaignPlayerResponseModel) => {
        const rulesArray: Array<boolean> = [
            !(new CampaignIsCompletedRule().isValid(item)), // Campaign Not Completed Rule
        ]

        switch (item.campaignType) {
            case 'Retention Campaign':
              rulesArray.push(new RetentionTagRule().isValid(item)) // Retention Rule
              break;
            case 'Welcome call':
              rulesArray.push(new WelcomeCallTagRule().isValid(item)) // Welcome Call Rule
              break;
            default:
              rulesArray.push(false)
          }

        return rulesArray.every(i => i)
    }
}