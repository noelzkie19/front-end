import swal from 'sweetalert';
import useConstant from '../../../constants/useConstant';
import {LiveChatResponse} from '../models/response/LiveChatResponse';
import {LivePersonResponse} from '../models/response/LivePersonResponse';
import {ValidateRemProfileName} from '../services/RemProfileApi';

const useRemProfileConstant = () => {
	const {successResponse} = useConstant();

	const ADD_REM_PROFILE = 'Add ReM Profile';
	const EDIT_REM_PROFILE = 'Edit ReM Profile';
	const VIEW_REM_PROFILE = 'View ReM Profile';
	const ContactDetailsParentId = '161';
	const MobileId = '162';
	const WhatsAppId = '163';
	const LineId = '164';
	const TelegramId = '165';
	const ViberId = '166';
	const ZaloId = '167';
	const KakaotalkId = '168';
	const LiveChatId = '169';
	const LivePersonId = '170';
	const LIVEPERSON = 'Live Person';
	const LIVECHAT = 'Live Chat';
	const VIEW = 'view';

	enum PageEvent {
		SEARCH = 'Search',
	}

	enum AgentDetails {
		REM_PROFILE_ID = 'ReM Profile ID',
		REM_PROFILE_NAME = 'ReM Profile Name',
		AGENT_NAME = 'Agent Name',
		PSEUDO_NAME = 'Pseudo Name (PP)',
		CHANNELS = 'Channels',
	}

	enum ScheduleDetails {
		TEMPLATE_NAME = 'Template Name',
		HEADER_NO = 'No',
		HEADER_LANGUAGE = 'Language',
		HEADER_LOCAL_TRANS_VALUE = 'Local Translation Value',
		HEADER_ACTION = 'Action',
	}

	enum LivePersonFields {
		livePersonId = 'livePersonId',
		engagementId = 'engagementId',
		agentId = 'agentId',
		skillId = 'skillId',
		skillName = 'skillName',
		section = 'section',
	}

	enum LiveChatFields {
		liveChatId = 'liveChatId',
		liveChatAgentId = 'liveChatAgentId',
		liveChatGroupId = 'liveChatGroupId',
		liveChatGroupName = 'liveChatGroupName',
	}

	enum OnlineStatus {
		offline = '181',
		online = '182',
	}

	enum AgentConfigStatus {
		active = '184',
		inActive = '185',
	}

	enum SwalConfirmMessage {
		title = 'Confirmation',
		textDiscard = 'This action will discard any changes made, please confirm',
		textSaveChannel = 'This action will save the new channel request, please confirm',
		icon = 'warning',
		btnYes = 'Yes',
		btnNo = 'No',
	}

	enum SwalFailedMessage {
		title = 'Failed',
		textMandatory = 'Unable to proceed, kindly fill up the mandatory fields',
		textExists = 'Unable to proceed, ReM Profile Name already exists.',
		icon = 'error',
	}

	const ContactDetails: Array<any> = [
		{
			ContactTypeName: 'Mobile',
			ContactTypeId: 162,
			ContactTypeIcon: 'fa-envelope',
		},
		{
			ContactTypeName: 'WhatsApp',
			ContactTypeId: 163,
			ContactTypeIcon: 'fa-whatsapp',
		},
		{
			ContactTypeName: 'Line',
			ContactTypeId: 164,
			ContactTypeIcon: 'fa-line',
		},
		{
			ContactTypeName: 'Telegram',
			ContactTypeId: 165,
			ContactTypeIcon: 'fa-telegram',
		},
		{
			ContactTypeName: 'Viber',
			ContactTypeId: 166,
			ContactTypeIcon: 'fa-viber',
		},
		{
			ContactTypeName: 'Zalo',
			ContactTypeId: 167,
			ContactTypeIcon: 'fa-zalo',
		},
		{
			ContactTypeName: 'Kakaotalk',
			ContactTypeId: 168,
			ContactTypeIcon: 'fa-kakaotalk',
		},
		{
			ContactTypeName: 'Live Chat',
			ContactTypeId: 169,
			ContactTypeIcon: 'fa-comment-dots',
		},
		{
			ContactTypeName: 'Live Person',
			ContactTypeId: 170,
			ContactTypeIcon: 'fa-headset',
		},
	];

	const LivePersonEmpty: Array<LivePersonResponse> = [
		{
			livePersonId: 0,
			remProfileId: 0,
			engagementID: undefined,
			agentID: undefined,
			skillID: undefined,
			skillName: undefined,
			section: undefined,
		},
	];

	const LiveChatEmpty: Array<LiveChatResponse> = [
		{
			liveChatId: 0,
			remProfileId: 0,
			agentID: undefined,
			groupID: undefined,
			groupName: undefined,
		},
	];

	//	Function
	const validateRemProfileName: any = async (name: any, id: any) => {
		return await ValidateRemProfileName({remProfileName: name, remProfileId: id})
			.then((response) => {
				if (response.status === successResponse) {
					return response.data;
				} else {
					swal('Failed', 'Connection error Please close the form and try again 1', 'error');
				}
			})
			.catch(() => {
				swal('Failed', 'Connection error Please close the form and try again 2', 'error');
			});
	};

	return {
		ADD_REM_PROFILE,
		EDIT_REM_PROFILE,
		VIEW_REM_PROFILE,
		AgentDetails,
		ScheduleDetails,
		ContactDetails,
		ContactDetailsParentId,
		MobileId,
		WhatsAppId,
		LineId,
		TelegramId,
		ViberId,
		ZaloId,
		KakaotalkId,
		LiveChatId,
		LivePersonId,
		LivePersonFields,
		LiveChatFields,
		LIVEPERSON,
		LIVECHAT,
		AgentConfigStatus,
		OnlineStatus,
		LiveChatEmpty,
		LivePersonEmpty,
		PageEvent,
		VIEW,
		SwalConfirmMessage,
		SwalFailedMessage,
		validateRemProfileName,
	};
};

export default useRemProfileConstant;
