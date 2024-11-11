export class RemProfileMockResponse {
	public static scheduleTemplateTable: any = [
		{
			scheduleTemplateSettingId: 1,
			languageId: 22,
			languageName: 'English',
			languageLocalTranslation: 'Support for Diamond from 9am to 6pm',
		},
		{
			scheduleTemplateSettingId: 2,
			languageId: 33,
			languageName: 'Tagalog',
			languageLocalTranslation: 'Support for Project 2 from 6am to 3pm',
		},
		{
			scheduleTemplateSettingId: 3,
			languageId: 44,
			languageName: 'German',
			languageLocalTranslation: 'Support for Project 3 from 7am to 4pm',
		},
		{
			scheduleTemplateSettingId: 4,
			languageId: 55,
			languageName: 'Italian',
			languageLocalTranslation: 'Support for Project 4 from 8am to 7pm',
		},
		{
			scheduleTemplateSettingId: 5,
			languageId: 66,
			languageName: 'Dannish',
			languageLocalTranslation: 'Support for Project 5 from 9am to 6pm',
		},
	];

	public static scheduleTemplateOptions: any = [
		{
			value: '1',
			label: 'Template Setting 1',
		},
		{
			value: '2',
			label: 'Template Setting 2',
		},
		{
			value: '3',
			label: 'Template Setting 3',
		},
		{
			value: '4',
			label: 'Template Setting 4',
		},
	];

	public static remProfileByIdDetails: any = [
		{
			remProfileId: 29,
			remProfileName: 'Profile mock data',
			agentId: 2,
			agentName: 'Princess Santillan',
			pseudoNamePP: 'pseduod data',
			onlineStatusId: 181,
			onlineStatus: 'Online',
			agentConfigStatusId: 184,
			agentConfigStatus: 'Deactivated',
			scheduleTemplateSettingId: 8,
			scheduleTemplateSettingName: 'ScheduleTemplateSettingName',
			createdBy: 0,
			updatedBy: 0,
			createdDate: '2022-07-22 20:28:32.453',
			updatedDate: '2022-07-22 20:28:32.453',
		},
	];

	public static remScheduleTemplateDetails: any = [
		{
			scheduleTemplateSettingId: 8,
			languageId: 1,
			languageName: 'test language',
			languageLocalTranslation: 'test language translation',
		},
	];

	public static remContactDetails: any = [
		{
			remContactDetailsId: 11,
			remProfileId: 29,
			messageTypeId: 11,
			contactDetailValue: '+6399999999',
			contactDetailsName: 'Email', //add
		},
		{
			remContactDetailsId: 11,
			remProfileId: 29,
			messageTypeId: 12,
			contactDetailValue: '+6388888888',
			contactDetailsName: 'Mobile',
		},
		{
			remContactDetailsId: 11,
			remProfileId: 29,
			messageTypeId: 13,
			contactDetailValue: '+6377777777',
			contactDetailsName: 'Viber',
		},
		{
			remContactDetailsId: 11,
			remProfileId: 29,
			messageTypeId: 14,
			contactDetailValue: '',
			contactDetailsName: 'Live Chat',
		},
		{
			remContactDetailsId: 11,
			remProfileId: 29,
			messageTypeId: 15,
			contactDetailValue: '',
			contactDetailsName: 'Live Person',
		},
	];

	public static liveChat: any = [
		{
			liveChatId: 27,
			remProfileId: 29,
			agentID: 'agent id',
			groupID: 'group id test',
			groupName: 'group name test',
		},
	];

	public static livePerson: any = [
		{
			livePersonId: 28,
			remProfileId: 29,
			engagementId: 'engagementId id',
			agentID: 'agentId test',
			skillID: 'skillId test',
			skillName: 'skill name test',
			section: 'secitonsss',
		},
	];
}
