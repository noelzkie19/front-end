import {CampaignMessageTypeEnum} from '../../../../constants/Constants';

export const BOOLEAN_OPTIONS = [
	{value: true, label: 'True'},
	{value: false, label: 'False'},
];

export const STATUS_OPTIONS = [
	{value: true, label: 'Active'},
	{value: false, label: 'Inactive'},
];

export const FILTER_STATUS_OPTIONS = [
	{value: '', label: ' - '},
	{value: true, label: 'Active'},
	{value: false, label: 'Inactive'},
];

export const FILTER_STATUS_OPTIONS_YESNO = [
	{value: '', label: ' - '},
	{value: true, label: 'Yes'},
	{value: false, label: 'No'},
];

export const FILTER_STATUS_OPTIONS_SELECT_ALL = [
	{value: '', label: 'Select All'},
	{value: true, label: 'Active'},
	{value: false, label: 'Inactive'},
];

export const FIELD_TYPE_OPTIONS = [
	{value: '1', label: 'Dropdown'},
	{value: '2', label: 'Dropdown With Search'},
	{value: '3', label: 'Dropdown Multi Select'},
	{value: '4', label: 'Dropdown Multi Select With Search'},
	{value: '5', label: 'Radio Button'},
	{value: '6', label: 'Text Input'},
	{value: '7', label: 'Multiline Text Input'},
];
export const CAMPAIGN_REPORT_PERIOD = [
	{value: '1', label: '+1'},
	{value: '2', label: '+2'},
	{value: '3', label: '+3'},
	{value: '4', label: '+4'},
	{value: '5', label: '+5'},
	{value: '6', label: '+6'},
	{value: '7', label: '+7'},
	{value: '8', label: '+8'},
	{value: '9', label: '+9'},
	{value: '10', label: '+10'},
	{value: '11', label: '+11'},
	{value: '13', label: '+13'},
	{value: '14', label: '+14'},
];
export const MESSAGE_TYPE_OPTIONS = [
	{
		label: CampaignMessageTypeEnum.Email,
		value: CampaignMessageTypeEnum.Email,
	},
	{
		label: CampaignMessageTypeEnum.WebPush,
		value: CampaignMessageTypeEnum.WebPush,
	},
	{
		label: CampaignMessageTypeEnum.FlyFoneCall,
		value: CampaignMessageTypeEnum.FlyFoneCall,
	},
	{
		label: CampaignMessageTypeEnum.CloudTalk,
		value: CampaignMessageTypeEnum.CloudTalk,
	},
	{
		label: CampaignMessageTypeEnum.Samespace,
		value: CampaignMessageTypeEnum.Samespace,
	},
];

export const PAYMENT_METHOD_VERIFIER = [
	{value: 1, label: 'FM'},
	{value: 2, label: 'SM'},
];
