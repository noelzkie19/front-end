import { SubModuleDetailModel } from "../../../../../models/SubModuleDetailModel";
import $ from 'jquery'
import { SECURABLE_NAMES } from "../../../../constants/SecurableNames";

export const playerConfigDetailClaim = (userAccessId: number): SubModuleDetailModel[] => {
    let vipLevelClaimRead = $('#vipLevelClaimRead');
    let vipLevelClaimWrite = $('#vipLevelClaimWrite');
    const vipLevelClaim: SubModuleDetailModel = {
        id: 38,
        description: SECURABLE_NAMES.VIPLevel,
        write: (vipLevelClaimWrite[0] as HTMLInputElement).checked,
        read: (vipLevelClaimRead[0] as HTMLInputElement).checked,
        createdBy: userAccessId,
        updatedBy: userAccessId,
    };

    let riskLevelClaimRead = $('#riskLevelClaimRead');
    let riskLevelClaimWrite = $('#riskLevelClaimWrite');
    const riskLevelClaim: SubModuleDetailModel = {
        id: 39,
        description: SECURABLE_NAMES.RiskLevel,
        write: (riskLevelClaimWrite[0] as HTMLInputElement).checked,
        read: (riskLevelClaimRead[0] as HTMLInputElement).checked,
        createdBy: userAccessId,
        updatedBy: userAccessId,
    };

    let paymentGroupClaimRead = $('#paymentGroupClaimRead');
    let paymentGroupClaimWrite = $('#paymentGroupClaimWrite');
    const paymentGroupClaim: SubModuleDetailModel = {
        id: 40,
        description: SECURABLE_NAMES.PaymentGroup,
        write: (paymentGroupClaimWrite[0] as HTMLInputElement).checked,
        read: (paymentGroupClaimRead[0] as HTMLInputElement).checked,
        createdBy: userAccessId,
        updatedBy: userAccessId,
    };

    let currencyClaimRead = $('#currencyClaimRead');
    let currencyClaimWrite = $('#currencyClaimWrite');
    const currencyClaim: SubModuleDetailModel = {
        id: 41,
        description: SECURABLE_NAMES.Currency,
        write: (currencyClaimWrite[0] as HTMLInputElement).checked,
        read: (currencyClaimRead[0] as HTMLInputElement).checked,
        createdBy: userAccessId,
        updatedBy: userAccessId,
    };

    let marketingChannelClaimRead = $('#marketingChannelClaimRead');
    let marketingChannelClaimWrite = $('#marketingChannelClaimWrite');
    const marketingChannelClaim: SubModuleDetailModel = {
        id: 42,
        description: SECURABLE_NAMES.MarketingChannel,
        write: (marketingChannelClaimWrite[0] as HTMLInputElement).checked,
        read: (marketingChannelClaimRead[0] as HTMLInputElement).checked,
        createdBy: userAccessId,
        updatedBy: userAccessId,
    };

    let signUpPortalClaimRead = $('#signUpPortalClaimRead');
    let signUpPortalClaimWrite = $('#signUpPortalClaimWrite');
    const signUpPortallClaim: SubModuleDetailModel = {
        id: 43,
        description: SECURABLE_NAMES.SignUpPortal,
        read: (signUpPortalClaimRead[0] as HTMLInputElement).checked,
        write: (signUpPortalClaimWrite[0] as HTMLInputElement).checked,
        createdBy: userAccessId,
        updatedBy: userAccessId,
    };

    let languageClaimRead = $('#languageClaimRead');
    let languageClaimWrite = $('#languageClaimWrite');
    const languageClaim: SubModuleDetailModel = {
        id: 44,
        description: SECURABLE_NAMES.Language,
        read: (languageClaimRead[0] as HTMLInputElement).checked,
        write: (languageClaimWrite[0] as HTMLInputElement).checked,
        createdBy: userAccessId,
        updatedBy: userAccessId,
    };

    let playerStatusClaimRead = $('#playerStatusClaimRead');
    let playerStatusClaimWrite = $('#playerStatusClaimWrite');
    const playerStatusClaim: SubModuleDetailModel = {
        id: 45,
        description: SECURABLE_NAMES.PlayerStatus,
        write: (playerStatusClaimWrite[0] as HTMLInputElement).checked,
        read: (playerStatusClaimRead[0] as HTMLInputElement).checked,
        createdBy: userAccessId,
        updatedBy: userAccessId,
    };

    let countryClaimRead = $('#countryClaimRead');
    let countryClaimWrite = $('#countryClaimWrite');
    const countryClaim: SubModuleDetailModel = {
        id: 46,
        description: SECURABLE_NAMES.Country,
        write: (countryClaimWrite[0] as HTMLInputElement).checked,
        read: (countryClaimRead[0] as HTMLInputElement).checked,
        createdBy: userAccessId,
        updatedBy: userAccessId,
    };

    let paymentMethodClaimRead = $('#paymentMethodClaimRead');
    let paymentMethodClaimWrite = $('#paymentMethodClaimWrite');
    const paymentMethodClaim: SubModuleDetailModel = {
        id: 63,
        description: SECURABLE_NAMES.PaymentMethod,
        write: (paymentMethodClaimWrite[0] as HTMLInputElement).checked,
        read: (paymentMethodClaimRead[0] as HTMLInputElement).checked,
        createdBy: userAccessId,
        updatedBy: userAccessId,
    };

    let playerConfigDetailItems: Array<SubModuleDetailModel> =
        [vipLevelClaim, riskLevelClaim, paymentGroupClaim,
            currencyClaim, marketingChannelClaim, signUpPortallClaim,
            languageClaim, playerStatusClaim, countryClaim, paymentMethodClaim];

    return playerConfigDetailItems
}