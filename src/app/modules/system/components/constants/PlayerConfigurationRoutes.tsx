import {Guid} from 'guid-typescript';
import {PlayerConfigurationRoute} from '../../../../common/model';
import {
	getCurrencyList,
	getCurrencyListResult,
	getMarketingChannelList,
	getMarketingChannelListResult,
	getPaymentGroupList,
	getPaymentGroupListResult,
	getPaymentMethodList,
	getPaymentMethodListResult,
	getPlayerConfigCountry,
	getPlayerConfigCountryResult,
	getPlayerConfigLanguage,
	getPlayerConfigLanguageResult,
	getPlayerConfigPlayerStatus,
	getPlayerConfigPlayerStatusResult,
	getPlayerConfigPortal,
	getPlayerConfigPortalResult,
	getRiskLevelList,
	getRiskLevelListResult,
	getVIPLevelList,
	getVIPLevelListResult,
} from '../../redux/SystemService';
import {
	CountryPlayerConfig,
	CurrencyPlayerConfig,
	DefaultPageSetup,
	DefaultUserSetup,
	LanguagePlayerConfig,
	MarketingChannelPlayerConfig,
	PaymentGroupPlayerConfig,
	PaymentMethodPlayerConfig,
	PlayerConfigCommons,
	PlayerConfigTypes,
	PlayerStatusPlayerConfig,
	PortalPlayerConfig,
	RiskLevelPlayerConfig,
	VIPLevelPlayerConfig,
} from './PlayerConfigEnums';
import { PAYMENT_METHOD_VERIFIER } from './SelectOptions';
import moment from 'moment';

export const PLAYER_CONFIGURATION_SETTINGS: Array<PlayerConfigurationRoute> = [
	{
		id: PlayerConfigTypes.VIPLevelTypeId,
		name: VIPLevelPlayerConfig.VIPLevel,
		route: '/system/edit-vip-level',
		view: '/system/view-vip-level',
		colDef: [
			{
				field: VIPLevelPlayerConfig.VIPLevelId,
				headerName: VIPLevelPlayerConfig.VIPLevelIDHeader,
			},
			{
				field: PlayerConfigCommons.ICoreIdField,
				headerName: PlayerConfigCommons.ICoreIdHeader,
			},
			{
				field: VIPLevelPlayerConfig.VIPLevelName,
				headerName: VIPLevelPlayerConfig.VIPLevelNameHeader,
			},
			{
				field: VIPLevelPlayerConfig.BrandName,
				headerName: VIPLevelPlayerConfig.BrandNameHeader,
			},
			{
				headerName: PlayerConfigCommons.Complete,
				cellRenderer: (params: any) => (params.data.isComplete === true ? PlayerConfigCommons.Yes : PlayerConfigCommons.No),
			},
		],
		filterParams: {
			pageSize: DefaultPageSetup.pageSizeDefault,
			offsetValue: DefaultPageSetup.offsetValueDefault,
			sortColumn: VIPLevelPlayerConfig.VIPLevelId,
			sortOrder: PlayerConfigCommons.Asc,
			userId: DefaultUserSetup.userIdDefault,
			queueId: Guid.create().toString(),
			playerConfigurationTypeId: PlayerConfigTypes.VIPLevelTypeId,
			playerConfigurationName: '',
			playerConfigurationCode: '',
			playerConfigurationId: undefined,
		},
		rowClassRules: {
			'rag-red': 'data.isComplete !== true',
		},
		getList: getVIPLevelList,
		getListResult: getVIPLevelListResult,
		getData: (data: any) => {
			return data.vipLevelList;
		},
	},
	{
		id: PlayerConfigTypes.RiskLevelTypeId,
		name: RiskLevelPlayerConfig.RiskLevel,
		route: '/system/edit-risk-level',
		view: '/system/view-risk-level',
		colDef: [
			{
				field: RiskLevelPlayerConfig.RiskLevelId,
				headerName: RiskLevelPlayerConfig.RiskLevelIdHeader,
			},
			{
				field: PlayerConfigCommons.ICoreIdField,
				headerName: PlayerConfigCommons.ICoreIdHeader,
			},
			{
				field: RiskLevelPlayerConfig.RiskLevelName,
				headerName: RiskLevelPlayerConfig.RiskLevelNameHeader,
			},
		],
		filterParams: {
			pageSize: DefaultPageSetup.pageSizeDefault,
			offsetValue: DefaultPageSetup.offsetValueDefault,
			sortColumn: RiskLevelPlayerConfig.RiskLevelId,
			sortOrder: PlayerConfigCommons.Asc,
			userId: DefaultUserSetup.userIdDefault,
			queueId: Guid.create().toString(),
			playerConfigurationTypeId: PlayerConfigTypes.RiskLevelTypeId,
			playerConfigurationName: '',
			playerConfigurationCode: '',
			playerConfigurationId: undefined,
		},
		getList: getRiskLevelList,
		getListResult: getRiskLevelListResult,
		getData: (data: any) => {
			return data.riskLevelList;
		},
	},
	{
		id: PlayerConfigTypes.PlayerStatusTypeId,
		name: PlayerStatusPlayerConfig.PlayerStatus,
		route: '/system/edit-player-status',
		view: '/system/view-player-status',
		colDef: [
			{
				field: PlayerStatusPlayerConfig.PlayerStatusId,
				headerName: PlayerStatusPlayerConfig.PlayerStatusIdHeader,
			},
			{
				field: PlayerConfigCommons.ICoreIdField,
				headerName: PlayerConfigCommons.ICoreIdHeader,
			},
			{
				field: PlayerStatusPlayerConfig.PlayerStatusName,
				headerName: PlayerStatusPlayerConfig.PlayerStatusNameHeader,
			},
		],
		filterParams: {
			pageSize: DefaultPageSetup.pageSizeDefault,
			offsetValue: DefaultPageSetup.offsetValueDefault,
			sortColumn: PlayerStatusPlayerConfig.PlayerStatusId,
			sortOrder: PlayerConfigCommons.Asc,
			userId: DefaultUserSetup.userIdDefault,
			queueId: Guid.create().toString(),
			playerConfigurationTypeId: PlayerConfigTypes.PlayerStatusTypeId,
			playerConfigurationName: '',
			playerConfigurationCode: '',
			playerConfigurationId: undefined,
		},
		getList: getPlayerConfigPlayerStatus,
		getListResult: getPlayerConfigPlayerStatusResult,
		getData: (data: any) => {
			return data.playerStatusList;
		},
	},
	{
		id: PlayerConfigTypes.PortalTypeId,
		name: PortalPlayerConfig.Portal,
		route: '/system/edit-portal',
		view: '/system/view-portal',
		colDef: [
			{
				field: PortalPlayerConfig.PortalId,
				headerName: PortalPlayerConfig.PortalIdHeader,
			},
			{
				field: PlayerConfigCommons.ICoreIdField,
				headerName: PlayerConfigCommons.ICoreIdHeader,
			},
			{
				field: PortalPlayerConfig.SignUpPortalName,
				headerName: PortalPlayerConfig.PortalNameHeader,
			},
		],
		filterParams: {
			pageSize: DefaultPageSetup.pageSizeDefault,
			offsetValue: DefaultPageSetup.offsetValueDefault,
			sortColumn: PortalPlayerConfig.PortalId,
			sortOrder: PlayerConfigCommons.Asc,
			userId: DefaultUserSetup.userIdDefault,
			queueId: Guid.create().toString(),
			playerConfigurationTypeId: PlayerConfigTypes.PortalTypeId,
			playerConfigurationName: '',
			playerConfigurationCode: '',
			playerConfigurationId: undefined,
		},
		getList: getPlayerConfigPortal,
		getListResult: getPlayerConfigPortalResult,
		getData: (data: any) => {
			return data.portalList;
		},
	},
	{
		id: PlayerConfigTypes.LanguageTypeId,
		name: LanguagePlayerConfig.Language,
		route: '/system/edit-language',
		view: '/system/view-language',
		colDef: [
			{
				field: LanguagePlayerConfig.LanguageId,
				headerName: LanguagePlayerConfig.LanguageIdHeader,
			},
			{
				field: PlayerConfigCommons.ICoreIdField,
				headerName: PlayerConfigCommons.ICoreIdHeader,
			},
			{
				field: LanguagePlayerConfig.LanguageName,
				headerName: LanguagePlayerConfig.LanguageNameHeader,
			},
			{
				field: LanguagePlayerConfig.LanguageCode,
				headerName: LanguagePlayerConfig.LanguageCodeHeader,
			},
			{
				headerName: PlayerConfigCommons.Complete,
				cellRenderer: (params: any) => (params.data.isComplete === true ? PlayerConfigCommons.Yes : PlayerConfigCommons.No),
			},
		],
		filterParams: {
			pageSize: DefaultPageSetup.pageSizeDefault,
			offsetValue: DefaultPageSetup.offsetValueDefault,
			sortColumn: LanguagePlayerConfig.LanguageId,
			sortOrder: PlayerConfigCommons.Asc,
			userId: DefaultUserSetup.userIdDefault,
			queueId: Guid.create().toString(),
			playerConfigurationTypeId: PlayerConfigTypes.LanguageTypeId,
			playerConfigurationName: '',
			playerConfigurationCode: '',
			playerConfigurationId: undefined,
		},
		getList: getPlayerConfigLanguage,
		getListResult: getPlayerConfigLanguageResult,
		getData: (data: any) => {
			return data.languageList;
		},
		rowClassRules: {
			'rag-red':
				'data.id === "" || data.id === undefined || data.languageName === "" || data.languageName === undefined || data.languageCode === "" || data.languageCode === undefined',
		},
	},
	{
		id: PlayerConfigTypes.PaymentGroupTypeId,
		name: PaymentGroupPlayerConfig.PaymentGroup,
		route: '/system/edit-payment-group',
		view: '/system/view-payment-group',
		colDef: [
			{
				field: PaymentGroupPlayerConfig.PaymentGroupId,
				headerName: PaymentGroupPlayerConfig.PaymentGroupIdHeader,
			},
			{
				field: PlayerConfigCommons.ICoreIdField,
				headerName: PlayerConfigCommons.ICoreIdHeader,
			},
			{
				field: PaymentGroupPlayerConfig.PaymentGroupName,
				headerName: PaymentGroupPlayerConfig.PaymentGroupNameHeader,
			},
		],
		filterParams: {
			pageSize: DefaultPageSetup.pageSizeDefault,
			offsetValue: DefaultPageSetup.offsetValueDefault,
			sortColumn: PaymentGroupPlayerConfig.PaymentGroupId,
			sortOrder: PlayerConfigCommons.Asc,
			userId: DefaultUserSetup.userIdDefault,
			queueId: Guid.create().toString(),
			playerConfigurationTypeId: PlayerConfigTypes.PaymentGroupTypeId,
			playerConfigurationName: '',
			playerConfigurationCode: '',
			playerConfigurationId: undefined,
		},
		getData: (data: any) => {
			return data.paymentGroupList;
		},
		getList: getPaymentGroupList,
		getListResult: getPaymentGroupListResult,
	},
	{
		id: PlayerConfigTypes.MarketingChannelTypeId,
		name: MarketingChannelPlayerConfig.MarketingChannel,
		route: '/system/edit-marketing-channel',
		view: '/system/view-marketing-channel',
		colDef: [
			{
				field: MarketingChannelPlayerConfig.MarketingChannelId,
				headerName: MarketingChannelPlayerConfig.MarketingChannelIdHeader,
			},
			{
				field: PlayerConfigCommons.ICoreIdField,
				headerName: PlayerConfigCommons.ICoreIdHeader,
			},
			{
				field: MarketingChannelPlayerConfig.MarketingChannelName,
				headerName: MarketingChannelPlayerConfig.MarketingChannelNameHeader,
			},
		],
		filterParams: {
			pageSize: DefaultPageSetup.pageSizeDefault,
			offsetValue: DefaultPageSetup.offsetValueDefault,
			sortColumn: MarketingChannelPlayerConfig.MarketingChannelId,
			sortOrder: PlayerConfigCommons.Asc,
			userId: DefaultUserSetup.userIdDefault,
			queueId: Guid.create().toString(),
			playerConfigurationTypeId: PlayerConfigTypes.MarketingChannelTypeId,
			playerConfigurationName: '',
			playerConfigurationCode: '',
			playerConfigurationId: undefined,
		},
		getData: (data: any) => {
			return data.marketingChannelList;
		},
		getList: getMarketingChannelList,
		getListResult: getMarketingChannelListResult,
	},
	{
		id: PlayerConfigTypes.CurrencyTypeId,
		name: CurrencyPlayerConfig.Currency,
		route: '/system/edit-currency',
		view: '/system/view-currency',
		colDef: [
			{
				field: CurrencyPlayerConfig.CurrencyId,
				headerName: CurrencyPlayerConfig.CurrencyIdHeader,
			},
			{
				field: PlayerConfigCommons.ICoreIdField,
				headerName: PlayerConfigCommons.ICoreIdHeader,
			},
			{
				field: CurrencyPlayerConfig.CurrencyName,
				headerName: CurrencyPlayerConfig.CurrencyNameHeader,
			},
			{
				field: CurrencyPlayerConfig.CurrencyCode,
				headerName: CurrencyPlayerConfig.CurrencyCodeHeader,
			},
			{
				headerName: PlayerConfigCommons.Complete,
				cellRenderer: (params: any) => (params.data.isComplete === true ? PlayerConfigCommons.Yes : PlayerConfigCommons.No),
			},
		],
		filterParams: {
			pageSize: DefaultPageSetup.pageSizeDefault,
			offsetValue: DefaultPageSetup.offsetValueDefault,
			sortColumn: CurrencyPlayerConfig.CurrencyId,
			sortOrder: PlayerConfigCommons.Asc,
			userId: DefaultUserSetup.userIdDefault,
			queueId: Guid.create().toString(),
			playerConfigurationTypeId: PlayerConfigTypes.CurrencyTypeId,
			playerConfigurationName: undefined,
			playerConfigurationCode: undefined,
			playerConfigurationId: undefined,
		},
		getList: getCurrencyList,
		getListResult: getCurrencyListResult,
		getData: (data: any) => {
			return data.currencyList;
		},
		rowClassRules: {
			'rag-red': 'data.isComplete !== true',
		},
	},
	{
		id: PlayerConfigTypes.CountryTypeId,
		name: CountryPlayerConfig.Country,
		route: '/system/edit-country',
		view: '/system/view-country',
		colDef: [
			{
				field: CountryPlayerConfig.CountryId,
				headerName: CountryPlayerConfig.CountryIdHeader,
			},
			{
				field: PlayerConfigCommons.ICoreIdField,
				headerName: PlayerConfigCommons.ICoreIdHeader,
			},
			{
				field: CountryPlayerConfig.CountryName,
				headerName: CountryPlayerConfig.CountryNameHeader,
			},
			{
				field: CountryPlayerConfig.CountryCode,
				headerName: CountryPlayerConfig.CountryCodeHeader,
			},
			{
				headerName: PlayerConfigCommons.Complete,
				cellRenderer: (params: any) => (params.data.isComplete === true ? PlayerConfigCommons.Yes : PlayerConfigCommons.No),
			},
		],
		filterParams: {
			pageSize: DefaultPageSetup.pageSizeDefault,
			offsetValue: DefaultPageSetup.offsetValueDefault,
			sortColumn: CountryPlayerConfig.CountryName,
			sortOrder: PlayerConfigCommons.Asc,
			userId: DefaultUserSetup.userIdDefault,
			queueId: Guid.create().toString(),
			playerConfigurationTypeId: PlayerConfigTypes.CountryTypeId,
			playerConfigurationName: '',
			playerConfigurationCode: '',
			playerConfigurationId: undefined,
		},
		getList: getPlayerConfigCountry,
		getListResult: getPlayerConfigCountryResult,
		getData: (data: any) => {
			return data.countryList;
		},
		rowClassRules: {
			'rag-red': 'data.isComplete !== true',
		},
	},
	{
		id: PlayerConfigTypes.PaymentMethodTypeId,
		name: PaymentMethodPlayerConfig.PaymentMethod,
		route: '/system/edit-payment-method',
		view: '/system/view-payment-method',
		colDef: [
			{
				field: PaymentMethodPlayerConfig.PaymentMethodId,
				headerName: PaymentMethodPlayerConfig.PaymentMethodIdHeader,
				width:180
			},
			{
				field: PlayerConfigCommons.ICoreIdField,
				headerName: PlayerConfigCommons.ICoreIdHeader,
				width:100
			},
			{
				field: PaymentMethodPlayerConfig.PaymentMethodName,
				headerName: PaymentMethodPlayerConfig.PaymentMethodNameHeader,
				minWidth:250
			},
			{
				field: PaymentMethodPlayerConfig.PaymentMethodVerifier,
				headerName: PaymentMethodPlayerConfig.PaymentMethodVerifierHeader,
				width:100,
				cellRenderer: (params: any) => (PAYMENT_METHOD_VERIFIER.find((i) => i.value === params.data.verifier)?.label ?? '')
			},
			{
				field: PaymentMethodPlayerConfig.PaymentMethodStatus,
				headerName: PaymentMethodPlayerConfig.PaymentMethodStatusHeader,
				width:100,
				cellRenderer: (params: any) => (params.data.status === true ? 'Active' : 'Inactive')
			},
			{
				field: PaymentMethodPlayerConfig.PaymentMethodCommProviderAccount,
				headerName: PaymentMethodPlayerConfig.PaymentMethodCommProviderAccountHeader,
				minWidth:250
			},
			{
				field: PlayerConfigCommons.CreatedDate,
				headerName: PlayerConfigCommons.CreatedDateHeader,
				cellRenderer: (params: any) =>
				params.data.createdDate && params.data.createdDate !== null
					? moment(params.data.createdDate).format('DD-MM-YYYY hh:mm:ss').toString()
					: '',
			},
			{
				field: PlayerConfigCommons.CreatedBy,
				headerName: PlayerConfigCommons.CreatedByHeader,
			},
			{
				field: PlayerConfigCommons.LastModifiedDate,
				headerName: PlayerConfigCommons.LastModifiedDateHeader,
				cellRenderer: (params: any) =>
				params.data.updatedDate && params.data.updatedDate !== null
					? moment(params.data.updatedDate).format('DD-MM-YYYY hh:mm:ss').toString()
					: '',
			},
			{
				field: PlayerConfigCommons.LastModifiedBy,
				headerName: PlayerConfigCommons.LastModifiedByHeader,
			},
		],
		filterParams: {
			pageSize: DefaultPageSetup.pageSizeDefault,
			offsetValue: DefaultPageSetup.offsetValueDefault,
			sortColumn: PaymentMethodPlayerConfig.PaymentMethodId,
			sortOrder: PlayerConfigCommons.Asc,
			userId: DefaultUserSetup.userIdDefault,
			queueId: Guid.create().toString(),
			playerConfigurationTypeId: PlayerConfigTypes.PaymentMethodTypeId,
			playerConfigurationName: '',
			playerConfigurationCode: '',
			playerConfigurationId: undefined,
		},
		getData: (data: any) => {
			return data.paymentMethodList;
		},
		getList: getPaymentMethodList,
		getListResult: getPaymentMethodListResult,
	},
];
