import {LiveChatResponse} from './LiveChatResponse';
import {LivePersonResponse} from './LivePersonResponse';
import {RemContactDetailsResponse} from './RemAgentProfileContactDetailsResponse';
import {RemProfileByIdScheduleTemplateModelReponse} from './RemProfileByIdScheduleTemplateModelReponse';
import {RemProfileModel} from './RemProfileModel';

export interface RemProfileByIdResponseModel {
	remProfileDetails: RemProfileModel;
	scheduleTemplateDetails: Array<RemProfileByIdScheduleTemplateModelReponse>;
	contactDetails: Array<RemContactDetailsResponse>;
	liveChatDetails: Array<LiveChatResponse>;
	livePersonDetails: Array<LivePersonResponse>;
}
