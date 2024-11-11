import { ChatStatisticsAbandonment } from "./ChatStatisticsAbandonment";
import { ChatStatisticsAgentSegment } from "./ChatStatisticsAgentSegment";
import { ChatStatisticsAgentSegmentRecordCount } from "./ChatStatisticsAgentSegmentRecordCount";
import { ChatStatisticsCaseCommDetails } from "./ChatStatisticsCaseCommDetails";
import { ChatStatisticsChatInformation } from "./ChatStatisticsChatInformation";
import { ChatStatisticsSkillSegment } from "./ChatStatisticsSkillSegment";
import { ChatStatisticsSkillSegmentRecordCount } from "./ChatStatisticsSkillSegmentRecordCount";

export interface CaseCommunicationChatStatisticModel {
    chatStatisticsCaseCommDetailsModel: ChatStatisticsCaseCommDetails,
    chatInformationModel: ChatStatisticsChatInformation,
    chatAbandonmentModel: ChatStatisticsAbandonment,
    chatAgentSegmentModel: Array<ChatStatisticsAgentSegment>,
    chatStatisticsAgentSegmentRecordCountModel: ChatStatisticsAgentSegmentRecordCount,
    chatStatisticsSkillSegmentModel: Array<ChatStatisticsSkillSegment>,
    chatStatisticsSkillSegmentRecordCountModel: ChatStatisticsSkillSegmentRecordCount,
}