import {RequestModel} from '../../../system/models/RequestModel';
import {LiveChatRequest} from './LiveChatRequest';
import {LivePersonRequest} from './LivePersonRequest';
import {RemAgentProfileContactDetailsRequest} from './RemAgentProfileContactDetailsRequest';

export interface RemAgentProfileDetailsRequest extends RequestModel {
	isDirty: boolean;
	remProfileId: number;
	remProfileName: string;
	agentId?: number;
	pseudoNamePP: string;
	scheduleTemplateSettingId?: number;
	onlineStatusId?: number;
	agentConfigStatusId?: number;
	createdBy?: number;
	createdDate?: string;
	updatedBy?: number;
	updatedDate?: string;
	remContactDetailsList?: Array<RemAgentProfileContactDetailsRequest>;
	remLiveChatList?: Array<LiveChatRequest>;
	remLivePersonList?: Array<LivePersonRequest>;
}
