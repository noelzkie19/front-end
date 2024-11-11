export const enum PlayerConfigCommons {
	ICoreIdHeader = 'iCore ID',
	ICoreIdField = 'iCoreId',
	Complete = 'Complete',
	IsComplete = 'isComplete',
	Asc = 'ASC',
	Yes = 'Yes',
	No = 'No',
	CreatedDate = 'createdDate',
	CreatedDateHeader = 'Created Date',
	CreatedBy = 'createdBy',
	CreatedByHeader = 'Created By',
	LastModifiedDate = 'updatedDate',
	LastModifiedDateHeader = 'Last Modified Date',
	LastModifiedBy = 'updatedBy',
	LastModifiedByHeader = 'Last Modified By'
}

export const enum DefaultUserSetup {
	userIdDefault = 0,
}

export const enum DefaultPageSetup {
	pageSizeDefault = 10,
	offsetValueDefault = 0,
}

export const enum PlayerConfigTypes {
	VIPLevelTypeId = 1,
	RiskLevelTypeId = 2,
	PlayerStatusTypeId = 3,
	PortalTypeId = 4,
	LanguageTypeId = 5,
	PaymentGroupTypeId = 6,
	MarketingChannelTypeId = 7,
	CurrencyTypeId = 8,
	CountryTypeId = 9,
	PaymentMethodTypeId = 10,
}

export const enum VIPLevelPlayerConfig {
	VIPLevel = 'VIP Level',
	VIPLevelId = 'vipLevelId',
	VIPLevelIDHeader = 'VIP Level ID',
	VIPLevelName = 'vipLevelName',
	VIPLevelNameHeader = 'VIP Level Name',
	BrandName = 'brandName',
	BrandNameHeader = 'Brand',
	VIPGroupHeader = 'VIP Group',
	VIPGroup = 'vipGroupId',
}

export const enum RiskLevelPlayerConfig {
	RiskLevel = 'Risk Level',
	RiskLevelId = 'riskLevelId',
	RiskLevelIdHeader = 'Risk Level Id',
	RiskLevelName = 'riskLevelName',
	RiskLevelNameHeader = 'Risk Level Name',
}

export const enum PlayerStatusPlayerConfig {
	PlayerStatus = 'Player Status',
	PlayerStatusId = 'id',
	PlayerStatusIdHeader = 'Player Status Id',
	PlayerStatusName = 'playerStatusName',
	PlayerStatusNameHeader = 'Player Status Name',
}

export const enum PortalPlayerConfig {
	Portal = 'Portal',
	PortalId = 'id',
	PortalIdHeader = 'Portal Id',
	SignUpPortalName = 'signUpPortalName',
	PortalNameHeader = 'Portal Name',
}

export const enum LanguagePlayerConfig {
	Language = 'Language',
	LanguageId = 'id',
	LanguageIdHeader = 'Language Id',
	LanguageName = 'languageName',
	LanguageNameHeader = 'Language Name',
	LanguageCode = 'languageCode',
	LanguageCodeHeader = 'Language Code',
}

export const enum PaymentGroupPlayerConfig {
	PaymentGroup = 'Payment Group',
	PaymentGroupId = 'id',
	PaymentGroupIdHeader = 'Payment Group Id',
	PaymentGroupName = 'paymentGroupName',
	PaymentGroupNameHeader = 'Payment Group Name',
}

export const enum MarketingChannelPlayerConfig {
	MarketingChannel = 'Marketing Channel',
	MarketingChannelId = 'id',
	MarketingChannelIdHeader = 'Marketing Channel Id',
	MarketingChannelName = 'marketingChannelName',
	MarketingChannelNameHeader = 'Marketing Channel Name',
}

export const enum CurrencyPlayerConfig {
	Currency = 'Currency',
	CurrencyId = 'currencyId',
	CurrencyIdHeader = 'Currency Id',
	CurrencyName = 'currencyName',
	CurrencyNameHeader = 'Currency Name',
	CurrencyCode = 'currencyCode',
	CurrencyCodeHeader = 'Currency Code',
}

export const enum CountryPlayerConfig {
	Country = 'Country',
	CountryId = 'countryId',
	CountryIdHeader = 'Country Id',
	CountryName = 'countryName',
	CountryNameHeader = 'Country Name',
	CountryCode = 'countryCode',
	CountryCodeHeader = 'Country Code',
}

export const enum PaymentMethodPlayerConfig {
	PaymentMethod = 'Payment Method',
	PaymentMethodId = 'paymentMethodExtId',
	PaymentMethodIdHeader = 'Payment Method ID',
	PaymentMethodName = 'paymentMethodExtName',
	PaymentMethodNameHeader = 'Payment Method Name',
	PaymentMethodVerifier = 'verifier',
	PaymentMethodVerifierHeader = 'Verifier',
	PaymentMethodStatus = 'status',
	PaymentMethodStatusHeader = 'Status',
	PaymentMethodCommProviderAccount = 'communicationProviderAccount',
	PaymentMethodCommProviderAccountHeader = 'Communication Provider Account',
}

export const StatusCode = {
	OK: 200,
	Connected: 'Connected',
};

export const enum InfoDataSourceId {
	MLab = 127,
	ICore = 126,
}
