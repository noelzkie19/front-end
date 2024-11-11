import { useEffect, useState } from 'react'
import { Accordion, Button, Card } from 'react-bootstrap';
import ToggleComponent from './ToggleComponent';
import { MainModuleModel } from '../../../models/MainModuleModel';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircle, faToggleOn } from '@fortawesome/free-solid-svg-icons';
import { SECURABLE_NAMES } from '../../constants/SecurableNames';

interface Props {
    CardHeaderEditStyles: any,
    CardBodyEditStyles: any,
    SecurableObjects?: Array<MainModuleModel>,
}

const SystemSecurableObjects = ({ CardHeaderEditStyles, CardBodyEditStyles, SecurableObjects }: Props) => {
    const [systemRead, setSystemRead] = useState(false);
    const [systemWrite, setSystemWrite] = useState(false);
    const [codeListRead, setCodeListRead] = useState(false);
    const [codeListWrite, setCodeListWrite] = useState(false);
    const [messageTypeRead, setMessageTypeRead] = useState(false);
    const [messageTypeWrite, setMessageTypeWrite] = useState(false);
    const [messageStatusRead, setMessageStatusRead] = useState(false);
    const [messageStatusWrite, setMessageStatusWrite] = useState(false);
    const [messageResponseRead, setMessageResponseRead] = useState(false);
    const [messageResponseWrite, setMessageResponseWrite] = useState(false);
    const [operatorAndBrandRead, setOperatorAndBrandRead] = useState(false);
    const [operatorAndBrandWrite, setOperatorAndBrandWrite] = useState(false);
    const [subTopicRead, setSubTopicRead] = useState(false);
    const [subTopicWrite, setSubTopicWrite] = useState(false);
    const [topicRead, setTopicRead] = useState(false);
    const [topicWrite, setTopicWrite] = useState(false);

    const [feedbackTypeRead, setFeedbackTypeRead] = useState(false);
    const [feedbackTypeWrite, setFeedbackTypeWrite] = useState(false);
    const [feedbackCategoryRead, setFeedbackCategoryRead] = useState(false);
    const [feedbackCategoryWrite, setFeedbackCategoryWrite] = useState(false);
    const [feedbackAnswerRead, setFeedbackAnswerRead] = useState(false);
    const [feedbackAnswerWrite, setFeedbackAnswerWrite] = useState(false);
    const [postChatSurveyRead, setPostChatSurveyRead] = useState(false);
    const [postChatSurveyWrite, setPostChatSurveyWrite] = useState(false);
    const [playerConfigurationRead, setPlayerConfigurationRead] = useState(false);
    const [playerConfigurationWrite, setPlayerConfigurationWrite] = useState(false);
    const [skillMappingRead, setSkillMappingRead] = useState(false);
    const [skillMappingWrite, setSkillMappingWrite] = useState(false);
    const [surveyQuestionRead, setSurveyQuestionRead] = useState(false);
    const [surveyQuestionWrite, setSurveyQuestionWrite] = useState(false);
    const [surveyTemplateRead, setSurveyTemplateRead] = useState(false);
    const [surveyTemplateWrite, setSurveyTemplateWrite] = useState(false);

    const [vipLevelRead, setVIPLevelRead] = useState(false);
    const [vipLevelWrite, setVIPLevelWrite] = useState(false);
    const [riskLevelRead, setRiskLevelRead] = useState(false);
    const [riskLevelWrite, setRiskLevelWrite] = useState(false);
    const [paymentGroupRead, setPaymentGroupRead] = useState(false);
    const [paymentGroupWrite, setPaymentGroupWrite] = useState(false);
    const [paymentMethodRead, setPaymentMethodRead] = useState(false);
    const [paymentMethodWrite, setPaymentMethodWrite] = useState(false);
    const [currencyRead, setCurrencyRead] = useState(false);
    const [currencyWrite, setCurrencyWrite] = useState(false);
    const [marketingChannelRead, setMarketingChannelRead] = useState(false);
    const [marketingChannelWrite, setMarketingChannelWrite] = useState(false);
    const [signUpPortalRead, setSignUpPortalRead] = useState(false);
    const [signUpPortalWrite, setSignUpPortalWrite] = useState(false);
    const [languageRead, setLanguageRead] = useState(false);
    const [languageWrite, setLanguageWrite] = useState(false);
    const [playerStatusRead, setPlayerStatusRead] = useState(false);
    const [playerStatusWrite, setPlayerStatusWrite] = useState(false);
    const [countryRead, setCountryRead] = useState(false);
    const [countryWrite, setCountryWrite] = useState(false);
    const [staffPerformanceRead, setStaffPerformanceRead] = useState(false);
    const [staffPerformanceWrite, setStaffPerformanceWrite] = useState(false);
    const [communicationReviewPeriodRead, setCommunicationReviewPeriodRead] = useState(false);
    const [communicationReviewPeriodWrite, setCommunicationReviewPeriodWrite] = useState(false);

    let systemClaimRead = document.getElementById('systemClaimRead') as HTMLInputElement;
    let systemClaimWrite = document.getElementById('systemClaimWrite') as HTMLInputElement;
    let operatorAndBrandClaimRead = document.getElementById('operatorAndBrandClaimRead') as HTMLInputElement;
    let operatorAndBrandClaimWrite = document.getElementById('operatorAndBrandClaimWrite') as HTMLInputElement;
    let codeListClaimRead = document.getElementById('codeListClaimRead') as HTMLInputElement;
    let codeListClaimWrite = document.getElementById('codeListClaimWrite') as HTMLInputElement;
    let playerConfigurationClaimRead = document.getElementById('playerConfigurationClaimRead') as HTMLInputElement;
    let playerConfigurationClaimWrite = document.getElementById('playerConfigurationClaimWrite') as HTMLInputElement;
    let surveyQuestionClaimRead = document.getElementById('surveyQuestionClaimRead') as HTMLInputElement;
    let surveyQuestionClaimWrite = document.getElementById('surveyQuestionClaimWrite') as HTMLInputElement;
    let surveyTemplateClaimRead = document.getElementById('surveyTemplateClaimRead') as HTMLInputElement;
    let surveyTemplateClaimWrite = document.getElementById('surveyTemplateClaimWrite') as HTMLInputElement;

    let skillMappingClaimRead = document.getElementById('skillMappingClaimRead') as HTMLInputElement;
    let skillMappingClaimWrite = document.getElementById('skillMappingClaimWrite') as HTMLInputElement;
    let postChatSurveyClaimRead = document.getElementById('postChatSurveyClaimRead') as HTMLInputElement;
    let postChatSurveyClaimWrite = document.getElementById('postChatSurveyClaimWrite') as HTMLInputElement;

    let staffPerformanceClaimRead = document.getElementById('staffPerformanceClaimRead') as HTMLInputElement;
    let staffPerformanceClaimWrite = document.getElementById('staffPerformanceClaimWrite') as HTMLInputElement;
    let communicationReviewPeriodClaimRead = document.getElementById('communicationReviewPeriodClaimRead') as HTMLInputElement;
    let communicationReviewPeriodClaimWrite = document.getElementById('communicationReviewPeriodClaimWrite') as HTMLInputElement;


    let topicClaimRead = document.getElementById('topicClaimRead') as HTMLInputElement;
    let topicClaimWrite = document.getElementById('topicClaimWrite') as HTMLInputElement;
    let subtopicClaimRead = document.getElementById('subtopicClaimRead') as HTMLInputElement;
    let subtopicClaimWrite = document.getElementById('subtopicClaimWrite') as HTMLInputElement;
    let messageTypeClaimRead = document.getElementById('messageTypeClaimRead') as HTMLInputElement;
    let messageTypeClaimWrite = document.getElementById('messageTypeClaimWrite') as HTMLInputElement;
    let messageStatusClaimRead = document.getElementById('messageStatusClaimRead') as HTMLInputElement;
    let messageStatusClaimWrite = document.getElementById('messageStatusClaimWrite') as HTMLInputElement;
    let messageResponseClaimRead = document.getElementById('messageResponseClaimRead') as HTMLInputElement;
    let messageResponseClaimWrite = document.getElementById('messageResponseClaimWrite') as HTMLInputElement;
    let feedbackTypeClaimRead = document.getElementById('feedbackTypeClaimRead') as HTMLInputElement;
    let feedbackTypeClaimWrite = document.getElementById('feedbackTypeClaimWrite') as HTMLInputElement;
    let feedbackAnswerClaimRead = document.getElementById('feedbackAnswerClaimRead') as HTMLInputElement;
    let feedbackAnswerClaimWrite = document.getElementById('feedbackAnswerClaimWrite') as HTMLInputElement;
    let feedbackCategoryClaimRead = document.getElementById('feedbackCategoryClaimRead') as HTMLInputElement;
    let feedbackCategoryClaimWrite = document.getElementById('feedbackCategoryClaimWrite') as HTMLInputElement;

    let countryClaimRead = document.getElementById('countryClaimRead') as HTMLInputElement;
    let countryClaimWrite = document.getElementById('countryClaimWrite') as HTMLInputElement;
    let currencyClaimRead = document.getElementById('currencyClaimRead') as HTMLInputElement;
    let currencyClaimWrite = document.getElementById('currencyClaimWrite') as HTMLInputElement;
    let vipLevelClaimRead = document.getElementById('vipLevelClaimRead') as HTMLInputElement;
    let vipLevelClaimWrite = document.getElementById('vipLevelClaimWrite') as HTMLInputElement;
    let riskLevelClaimRead = document.getElementById('riskLevelClaimRead') as HTMLInputElement;
    let riskLevelClaimWrite = document.getElementById('riskLevelClaimWrite') as HTMLInputElement;
    let paymentGroupClaimRead = document.getElementById('paymentGroupClaimRead') as HTMLInputElement;
    let paymentGroupClaimWrite = document.getElementById('paymentGroupClaimWrite') as HTMLInputElement;
    let paymentMethodClaimRead = document.getElementById('paymentMethodClaimRead') as HTMLInputElement;
    let paymentMethodClaimWrite = document.getElementById('paymentMethodClaimWrite') as HTMLInputElement;
    let marketingChannelClaimRead = document.getElementById('marketingChannelClaimRead') as HTMLInputElement;
    let marketingChannelClaimWrite = document.getElementById('marketingChannelClaimWrite') as HTMLInputElement;
    let signUpPortalClaimRead = document.getElementById('signUpPortalClaimRead') as HTMLInputElement;
    let signUpPortalClaimWrite = document.getElementById('signUpPortalClaimWrite') as HTMLInputElement;
    let languageClaimRead = document.getElementById('languageClaimRead') as HTMLInputElement;
    let languageClaimWrite = document.getElementById('languageClaimWrite') as HTMLInputElement;
    let playerStatusClaimRead = document.getElementById('playerStatusClaimRead') as HTMLInputElement;
    let playerStatusClaimWrite = document.getElementById('playerStatusClaimWrite') as HTMLInputElement;

    useEffect(() => {
        if (!SecurableObjects) return
        let systemClaims = SecurableObjects?.find((obj) => obj.description === SECURABLE_NAMES.System);

        if (!systemClaims) return
        let { read, write, subMainModuleDetails }: any = systemClaims;
        systemClaimRead.checked = read
        setSystemRead(read)
        systemClaimWrite.checked = write
        setSystemWrite(write)

        if (!subMainModuleDetails) return

        operatorAndBrandClaimRead.checked = subMainModuleDetails?.find((obj: any) => obj.description === SECURABLE_NAMES.OperatorAndBrand)?.read!;
        operatorAndBrandClaimWrite.checked = subMainModuleDetails?.find((obj: any) => obj.description === SECURABLE_NAMES.OperatorAndBrand)?.write!;
        surveyQuestionClaimRead.checked = subMainModuleDetails?.find((obj: any) => obj.description === SECURABLE_NAMES.SurveyQuestion)?.read!;
        surveyQuestionClaimWrite.checked = subMainModuleDetails?.find((obj: any) => obj.description === SECURABLE_NAMES.SurveyQuestion)?.write!;
        surveyTemplateClaimRead.checked = subMainModuleDetails?.find((obj: any) => obj.description === SECURABLE_NAMES.SurveyTemplate)?.read!;
        surveyTemplateClaimWrite.checked = subMainModuleDetails?.find((obj: any) => obj.description === SECURABLE_NAMES.SurveyTemplate)?.write!;
        skillMappingClaimRead.checked = subMainModuleDetails?.find((obj: any) => obj.description === SECURABLE_NAMES.SkillMapping)?.read!;
        skillMappingClaimWrite.checked = subMainModuleDetails?.find((obj: any) => obj.description === SECURABLE_NAMES.SkillMapping)?.write!;
        postChatSurveyClaimRead.checked = subMainModuleDetails?.find((obj: any) => obj.description === SECURABLE_NAMES.PostChatSurvey)?.read!;
        postChatSurveyClaimWrite.checked = subMainModuleDetails?.find((obj: any) => obj.description === SECURABLE_NAMES.PostChatSurvey)?.write!;

        staffPerformanceClaimRead.checked = subMainModuleDetails?.find((obj: any) => obj.description === SECURABLE_NAMES.StaffPerformance)?.read;
        staffPerformanceClaimWrite.checked = subMainModuleDetails?.find((obj: any) => obj.description === SECURABLE_NAMES.StaffPerformance)?.write;

        codeListSubModules(subMainModuleDetails);
        playerConfiSubModules(subMainModuleDetails);
        staffPerformanceSubModules(subMainModuleDetails);

        changeSystemRuleStatus();
        return () => { }
    }, [SecurableObjects])

    const codeListSubModules = (subMainModuleDetails: any) => {
        //Code List
        const { read: codeListRead, write: codeListWrite, subModuleDetails: codeListSubModules } = subMainModuleDetails?.find((obj: any) => obj.description === SECURABLE_NAMES.CodeList) ?? { read: false, write: false, subModuleDetails: [] };
        codeListClaimRead.checked = codeListRead;
        codeListClaimWrite.checked = codeListWrite;
        
        const { read: topicRead, write: topicWrite } = codeListSubModules?.find((obj: any) => obj.description === SECURABLE_NAMES.Topic) ?? {read: false, write: false};
        topicClaimRead.checked = topicRead;
        topicClaimWrite.checked = topicWrite;

        const { read: subTopicRead, write: subTopicWrite } = codeListSubModules?.find((obj: any) => obj.description === SECURABLE_NAMES.Subtopic) ?? {read: false, write: false};
        subtopicClaimRead.checked = subTopicRead;
        subtopicClaimWrite.checked = subTopicWrite;

        const { read: messageTypeRead, write: messageTypeWrite } = codeListSubModules?.find((obj: any) => obj.description === SECURABLE_NAMES.MessageType) ?? {read: false, write: false};
        messageTypeClaimRead.checked = messageTypeRead;
        messageTypeClaimWrite.checked = messageTypeWrite;

        const { read: messageStatusRead, write: messageStatusWrite } = codeListSubModules?.find((obj: any) => obj.description === SECURABLE_NAMES.MessageStatus) ?? {read: false, write: false};
        messageStatusClaimRead.checked = messageStatusRead;
        messageStatusClaimWrite.checked = messageStatusWrite;

        const { read: messageResponseRead, write: messageResponseWrite } = codeListSubModules?.find((obj: any) => obj.description === SECURABLE_NAMES.MessageResponse) ?? {read: false, write: false};
        messageResponseClaimRead.checked = messageResponseRead;
        messageResponseClaimWrite.checked = messageResponseWrite;

        const { read: feedbackTypeRead, write: feedbackTypeWrite } = codeListSubModules?.find((obj: any) => obj.description === SECURABLE_NAMES.FeedbackType) ?? {read: false, write: false};
        feedbackTypeClaimRead.checked = feedbackTypeRead;
        feedbackTypeClaimWrite.checked = feedbackTypeWrite;

        const { read: feedbackCategoryRead, write: feedbackCategoryWrite } = codeListSubModules?.find((obj: any) => obj.description === SECURABLE_NAMES.FeedbackCategory) ?? {read: false, write: false};
        feedbackCategoryClaimRead.checked = feedbackCategoryRead;
        feedbackCategoryClaimWrite.checked = feedbackCategoryWrite;

        const { read: feedbackAnswerRead, write: feedbackAnswerWrite } = codeListSubModules?.find((obj: any) => obj.description === SECURABLE_NAMES.FeedbackAnswer) ?? {read: false, write: false};
        feedbackAnswerClaimRead.checked = feedbackAnswerRead;
        feedbackAnswerClaimWrite.checked = feedbackAnswerWrite;
    }

    const playerConfiSubModules = (subMainModuleDetails: any) => {
        // Player Configuration
        const { read: playerConfigurationRead, write: playerConfigurationWrite, subModuleDetails: playerConfigurationSubModules } = subMainModuleDetails?.find((obj: any) => obj.description === SECURABLE_NAMES.PlayerConfiguration) ?? { read: false, write: false, subModuleDetails: [] };
        playerConfigurationClaimRead.checked = playerConfigurationRead;
        playerConfigurationClaimWrite.checked = playerConfigurationWrite;

        const { read: vipLevelRead, write: vipLevelWrite } = playerConfigurationSubModules?.find((obj: any) => obj.description === SECURABLE_NAMES.VIPLevel) ?? {read: false, write: false};
        vipLevelClaimRead.checked = vipLevelRead;
        vipLevelClaimWrite.checked = vipLevelWrite;

        const { read: riskLevelRead, write: riskLevelWrite } = playerConfigurationSubModules?.find((obj: any) => obj.description === SECURABLE_NAMES.RiskLevel) ?? {read: false, write: false};
        riskLevelClaimRead.checked = riskLevelRead;
        riskLevelClaimWrite.checked = riskLevelWrite;

        const { read: paymenGroupRead, write: paymentGroupWrite } = playerConfigurationSubModules?.find((obj: any) => obj.description === SECURABLE_NAMES.PaymentGroup) ?? {read: false, write: false};
        paymentGroupClaimRead.checked = paymenGroupRead;
        paymentGroupClaimWrite.checked = paymentGroupWrite;

        const { read: paymentMethodRead, write: paymentMethodWrite } = playerConfigurationSubModules?.find((obj: any) => obj.description === SECURABLE_NAMES.PaymentMethod) ?? {read: false, write: false};
        paymentMethodClaimRead.checked = paymentMethodRead;
        paymentMethodClaimWrite.checked = paymentMethodWrite;

        const { read: currencyRead, write: currencyWrite } = playerConfigurationSubModules?.find((obj: any) => obj.description === SECURABLE_NAMES.Currency) ?? {read: false, write: false};
        currencyClaimRead.checked = currencyRead;
        currencyClaimWrite.checked = currencyWrite;

        const { read: marketingChannelRead, write: marketingChannelWrite } = playerConfigurationSubModules?.find((obj: any) => obj.description === SECURABLE_NAMES.MarketingChannel) ?? {read: false, write: false};
        marketingChannelClaimRead.checked = marketingChannelRead;
        marketingChannelClaimWrite.checked = marketingChannelWrite;

        const { read: signUpPortalRead, write: signUpPortalWrite } = playerConfigurationSubModules?.find((obj: any) => obj.description === SECURABLE_NAMES.SignUpPortal) ?? {read: false, write: false};
        signUpPortalClaimRead.checked = signUpPortalRead;
        signUpPortalClaimWrite.checked = signUpPortalWrite;

        const { read: languageRead, write: languageWrite } = playerConfigurationSubModules?.find((obj: any) => obj.description === SECURABLE_NAMES.Language) ?? {read: false, write: false};
        languageClaimRead.checked = languageRead;
        languageClaimWrite.checked = languageWrite;

        const { read: playerStatusRead, write: playerStatusWrite } = playerConfigurationSubModules?.find((obj: any) => obj.description === SECURABLE_NAMES.PlayerStatus) ?? {read: false, write: false};
        playerStatusClaimRead.checked = playerStatusRead;
        playerStatusClaimWrite.checked = playerStatusWrite

        const { read: countryRead, write: countryWrite } = playerConfigurationSubModules?.find((obj: any) => obj.description === SECURABLE_NAMES.Country) ?? {read: false, write: false};
        countryClaimRead.checked = countryRead;
        countryClaimWrite.checked = countryWrite
    }

    const staffPerformanceSubModules = (subMainModuleDetails: any) => {
        const { read: staffPerformanceRead, write: staffPerformancerite, subModuleDetails: staffPerformanceSubModules } = subMainModuleDetails?.find((obj: any) => obj.description === SECURABLE_NAMES.StaffPerformance) ?? { read: false, write: false, subModuleDetails: [] };
        staffPerformanceClaimRead.checked = staffPerformanceRead;
        staffPerformanceClaimWrite.checked = staffPerformancerite;

        const { read: communicationReviewPeriodRead, write: communicationReviewPeriodWrite } = staffPerformanceSubModules?.find((obj: any) => obj.description === SECURABLE_NAMES.CommunicationReviewPeriod) ?? { read: false, write: false };
        communicationReviewPeriodClaimRead.checked = communicationReviewPeriodRead;
        communicationReviewPeriodClaimWrite.checked = communicationReviewPeriodWrite;

    }
    function changeSystemRuleStatus() {
        if ((systemClaimRead.checked === true || systemClaimRead.checked === false) && systemClaimWrite.checked === true) {
            codeListClaimRead.disabled = false;
            codeListClaimWrite.disabled = false;
            operatorAndBrandClaimRead.disabled = false;
            operatorAndBrandClaimWrite.disabled = false;
            playerConfigurationClaimRead.disabled = false;
            playerConfigurationClaimWrite.disabled = false;
            postChatSurveyClaimRead.disabled = false;
            postChatSurveyClaimWrite.disabled = false;
            surveyQuestionClaimRead.disabled = false;
            surveyQuestionClaimWrite.disabled = false;
            surveyTemplateClaimRead.disabled = false;
            surveyTemplateClaimWrite.disabled = false;
            skillMappingClaimRead.disabled = false;
            skillMappingClaimWrite.disabled = false;
            
            staffPerformanceClaimRead.disabled = false;
            staffPerformanceClaimWrite.disabled = false;

            setOperatorAndBrandRead(false);
            setOperatorAndBrandWrite(false);
            setCodeListRead(false);
            setCodeListWrite(false);
            setPlayerConfigurationRead(false);
            setPlayerConfigurationWrite(false);
            setSurveyQuestionRead(false);
            setSurveyQuestionWrite(false);
            setSurveyTemplateRead(false);
            setSurveyTemplateWrite(false);
            setSkillMappingRead(false);
            setSkillMappingWrite(false);
            setPostChatSurveyRead(false);
            setPostChatSurveyWrite(false);

            setStaffPerformanceRead(false);
            setStaffPerformanceWrite(false);
  

        } else if (systemClaimRead.checked === true && systemClaimWrite.checked === false) {
            operatorAndBrandClaimRead.disabled = false;
            operatorAndBrandClaimWrite.disabled = true;
            codeListClaimRead.disabled = false;
            codeListClaimWrite.disabled = true;
            playerConfigurationClaimRead.disabled = false;
            playerConfigurationClaimWrite.disabled = true;
            postChatSurveyClaimRead.disabled = false;
            postChatSurveyClaimWrite.disabled = true;
            surveyQuestionClaimRead.disabled = false;
            surveyQuestionClaimWrite.disabled = true;
            surveyTemplateClaimRead.disabled = false;
            surveyTemplateClaimWrite.disabled = true;
            skillMappingClaimRead.disabled = false;
            skillMappingClaimWrite.disabled = true;

            operatorAndBrandClaimWrite.checked = false;
            codeListClaimWrite.checked = false;
            playerConfigurationClaimWrite.checked = false;
            surveyQuestionClaimWrite.checked = false;
            surveyTemplateClaimWrite.checked = false;
            skillMappingClaimWrite.checked = false;

            staffPerformanceClaimRead.disabled = false;
            staffPerformanceClaimWrite.disabled = true;

            setOperatorAndBrandWrite(false);
            setCodeListWrite(false);
            setPlayerConfigurationWrite(false);
            setSurveyQuestionWrite(false);
            setSurveyTemplateWrite(false);
            setSkillMappingWrite(false);
            setPostChatSurveyWrite(false);
           
            setStaffPerformanceWrite(false);

        } else if (systemClaimRead.checked === false && systemClaimWrite.checked === false) {
            operatorAndBrandClaimRead.disabled = true;
            operatorAndBrandClaimWrite.disabled = true;
            codeListClaimRead.disabled = true;
            codeListClaimWrite.disabled = true;
            playerConfigurationClaimRead.disabled = true;
            playerConfigurationClaimWrite.disabled = true;
            surveyQuestionClaimRead.disabled = true;
            surveyQuestionClaimWrite.disabled = true;
            surveyTemplateClaimRead.disabled = true;
            surveyTemplateClaimWrite.disabled = true;
            skillMappingClaimRead.disabled = true;
            skillMappingClaimWrite.disabled = true;
            postChatSurveyClaimRead.disabled = true;
            postChatSurveyClaimWrite.disabled = true;

            staffPerformanceClaimRead.disabled = true;
            staffPerformanceClaimWrite.disabled = true;

            operatorAndBrandClaimRead.checked = false;
            operatorAndBrandClaimWrite.checked = false;
            codeListClaimRead.checked = false;
            codeListClaimWrite.checked = false;
            playerConfigurationClaimRead.checked = false;
            playerConfigurationClaimWrite.checked = false;
            surveyQuestionClaimRead.checked = false;
            surveyQuestionClaimWrite.checked = false;
            surveyTemplateClaimRead.checked = false;
            surveyTemplateClaimWrite.checked = false;
            skillMappingClaimRead.checked = false;
            skillMappingClaimWrite.checked = false;
            postChatSurveyClaimRead.checked = false;
            postChatSurveyClaimWrite.checked = false;
            staffPerformanceClaimRead.disabled = false;
            staffPerformanceClaimWrite.disabled = false;

            setOperatorAndBrandRead(false);
            setOperatorAndBrandWrite(false);
            setCodeListRead(false);
            setCodeListWrite(false);
            setPlayerConfigurationRead(false);
            setPlayerConfigurationWrite(false);
            setSurveyQuestionRead(false);
            setSurveyQuestionWrite(false);
            setSurveyTemplateRead(false);
            setSurveyTemplateWrite(false);
            setSkillMappingRead(false);
            setSkillMappingWrite(false);
            setPostChatSurveyRead(false);
            setPostChatSurveyWrite(false);
            setStaffPerformanceRead(false);
            setStaffPerformanceWrite(false);

        }
        changeEditCodeListStatus();
        changePlayerConfiguration();
        changeStaffPerformance();
    }

    function changeEditCodeListStatus() {


        if (codeListClaimRead.checked === true && codeListClaimWrite.checked === true) {
            messageTypeClaimRead.disabled = false;
            messageTypeClaimWrite.disabled = false;
            messageStatusClaimRead.disabled = false;
            messageStatusClaimWrite.disabled = false;
            messageResponseClaimRead.disabled = false;
            messageResponseClaimWrite.disabled = false;
            subtopicClaimRead.disabled = false;
            subtopicClaimWrite.disabled = false;
            topicClaimRead.disabled = false;
            topicClaimWrite.disabled = false;
            feedbackTypeClaimRead.disabled = false;
            feedbackTypeClaimWrite.disabled = false;
            feedbackCategoryClaimRead.disabled = false;
            feedbackCategoryClaimWrite.disabled = false;
            feedbackAnswerClaimRead.disabled = false;
            feedbackAnswerClaimWrite.disabled = false;

            setTopicRead(false);
            setTopicWrite(false);
            setSubTopicRead(false);
            setSubTopicWrite(false);
            setMessageTypeRead(false);
            setMessageTypeWrite(false);
            setMessageStatusRead(false);
            setMessageStatusWrite(false);
            setMessageResponseRead(false);
            setMessageResponseWrite(false);
            setFeedbackTypeRead(false);
            setFeedbackTypeWrite(false);
            setFeedbackCategoryRead(false);
            setFeedbackCategoryWrite(false);
            setFeedbackAnswerRead(false);
            setFeedbackAnswerWrite(false);
        } else if (codeListClaimRead.checked === true && codeListClaimWrite.checked === false) {
            topicClaimRead.disabled = false;
            topicClaimWrite.disabled = true;
            subtopicClaimRead.disabled = false;
            subtopicClaimWrite.disabled = true;
            messageTypeClaimRead.disabled = false;
            messageTypeClaimWrite.disabled = true;
            messageStatusClaimRead.disabled = false;
            messageStatusClaimWrite.disabled = true;
            messageResponseClaimRead.disabled = false;
            messageResponseClaimWrite.disabled = true;
            feedbackTypeClaimRead.disabled = false;
            feedbackTypeClaimWrite.disabled = true;
            feedbackCategoryClaimRead.disabled = false;
            feedbackCategoryClaimWrite.disabled = true;
            feedbackAnswerClaimRead.disabled = false;
            feedbackAnswerClaimWrite.disabled = true;
            topicClaimWrite.checked = false;
            subtopicClaimWrite.checked = false;
            messageTypeClaimWrite.checked = false;
            messageStatusClaimWrite.checked = false;
            messageResponseClaimWrite.checked = false;
            feedbackTypeClaimWrite.checked = false;
            feedbackCategoryClaimWrite.checked = false;
            feedbackAnswerClaimWrite.checked = false;

            setTopicWrite(false);
            setSubTopicWrite(false);
            setFeedbackTypeWrite(false);
            setFeedbackCategoryWrite(false);
            setFeedbackAnswerWrite(false);
            setMessageTypeWrite(false);
            setMessageStatusWrite(false);
            setMessageResponseWrite(false);
        } else if (codeListClaimRead.checked === false && codeListClaimWrite.checked === true) {
            topicClaimRead.disabled = false;
            topicClaimWrite.disabled = false;
            subtopicClaimRead.disabled = false;
            subtopicClaimWrite.disabled = false;
            messageTypeClaimRead.disabled = false;
            messageTypeClaimWrite.disabled = false;
            messageStatusClaimRead.disabled = false;
            messageStatusClaimWrite.disabled = false;
            messageResponseClaimRead.disabled = false;
            messageResponseClaimWrite.disabled = false;
            feedbackTypeClaimRead.disabled = false;
            feedbackTypeClaimWrite.disabled = false;
            feedbackCategoryClaimRead.disabled = false;
            feedbackCategoryClaimWrite.disabled = false;
            feedbackAnswerClaimRead.disabled = false;
            feedbackAnswerClaimWrite.disabled = false;

            setSubTopicRead(false);
            setSubTopicWrite(false);
            setTopicRead(false);
            setTopicWrite(false);
            setMessageTypeRead(false);
            setMessageTypeWrite(false);
            setMessageStatusRead(false);
            setMessageStatusWrite(false);
            setMessageResponseRead(false);
            setMessageResponseWrite(false);
            setFeedbackTypeRead(false);
            setFeedbackTypeWrite(false);
            setFeedbackAnswerRead(false);
            setFeedbackAnswerWrite(false);
            setFeedbackCategoryRead(false);
            setFeedbackCategoryWrite(false);
        } else if (codeListClaimRead.checked === false && codeListClaimWrite.checked === false) {
            topicClaimRead.disabled = true;
            topicClaimWrite.disabled = true;
            subtopicClaimRead.disabled = true;
            subtopicClaimWrite.disabled = true;
            messageTypeClaimRead.disabled = true;
            messageTypeClaimWrite.disabled = true;
            messageStatusClaimRead.disabled = true;
            messageStatusClaimWrite.disabled = true;
            messageResponseClaimRead.disabled = true;
            messageResponseClaimWrite.disabled = true;
            feedbackTypeClaimRead.disabled = true;
            feedbackTypeClaimWrite.disabled = true;
            feedbackCategoryClaimRead.disabled = true;
            feedbackCategoryClaimWrite.disabled = true;
            feedbackAnswerClaimRead.disabled = true;
            feedbackAnswerClaimWrite.disabled = true;
            topicClaimRead.checked = false;
            topicClaimWrite.checked = false;
            subtopicClaimRead.checked = false;
            subtopicClaimWrite.checked = false;
            messageTypeClaimRead.checked = false;
            messageTypeClaimWrite.checked = false;
            messageStatusClaimRead.checked = false;
            messageStatusClaimWrite.checked = false;
            messageResponseClaimRead.checked = false;
            messageResponseClaimWrite.checked = false;
            feedbackTypeClaimRead.checked = false;
            feedbackTypeClaimWrite.checked = false;
            feedbackCategoryClaimRead.checked = false;
            feedbackCategoryClaimWrite.checked = false;
            feedbackAnswerClaimRead.checked = false;
            feedbackAnswerClaimWrite.checked = false;

            setTopicRead(false);
            setTopicWrite(false);
            setSubTopicRead(false);
            setSubTopicWrite(false);
            setMessageTypeRead(false);
            setMessageTypeWrite(false);
            setMessageStatusRead(false);
            setMessageStatusWrite(false);
            setMessageResponseRead(false);
            setMessageResponseWrite(false);
            setFeedbackTypeRead(false);
            setFeedbackTypeWrite(false);
            setFeedbackCategoryRead(false);
            setFeedbackCategoryWrite(false);
            setFeedbackAnswerRead(false);
            setFeedbackAnswerWrite(false);
        }
    }

    function changePlayerConfiguration() {

        if (playerConfigurationClaimRead.checked === true && playerConfigurationClaimWrite.checked === true) {
            countryClaimRead.disabled = false;
            countryClaimWrite.disabled = false;
            currencyClaimRead.disabled = false;
            currencyClaimWrite.disabled = false;
            paymentGroupClaimRead.disabled = false;
            paymentGroupClaimWrite.disabled = false;
            paymentMethodClaimRead.disabled = false;
            paymentMethodClaimWrite.disabled = false;
            languageClaimRead.disabled = false;
            languageClaimWrite.disabled = false;
            marketingChannelClaimRead.disabled = false;
            marketingChannelClaimWrite.disabled = false;
            riskLevelClaimRead.disabled = false;
            riskLevelClaimWrite.disabled = false;
            signUpPortalClaimRead.disabled = false;
            signUpPortalClaimWrite.disabled = false;
            playerStatusClaimRead.disabled = false;
            playerStatusClaimWrite.disabled = false;
            vipLevelClaimRead.disabled = false;
            vipLevelClaimWrite.disabled = false;

            setCountryRead(false);
            setCountryWrite(false);
            setVIPLevelRead(false);
            setVIPLevelWrite(false);
            setRiskLevelRead(false);
            setRiskLevelWrite(false);
            setPaymentGroupRead(false);
            setPaymentGroupWrite(false);
            setPaymentMethodRead(false);
            setPaymentMethodWrite(false);
            setCurrencyRead(false);
            setCurrencyWrite(false);
            setMarketingChannelRead(false);
            setMarketingChannelWrite(false);
            setLanguageRead(false);
            setLanguageWrite(false);
            setPlayerStatusRead(false);
            setPlayerStatusWrite(false);
            setSignUpPortalRead(false);
            setSignUpPortalWrite(false);
        } else if (playerConfigurationClaimRead.checked === true && playerConfigurationClaimWrite.checked === false) {
            countryClaimWrite.checked = false;
            currencyClaimRead.disabled = false;
            currencyClaimWrite.disabled = true;
            vipLevelClaimRead.disabled = false;
            vipLevelClaimWrite.disabled = true;
            riskLevelClaimRead.disabled = false;
            riskLevelClaimWrite.disabled = true;
            paymentGroupClaimRead.disabled = false;
            paymentGroupClaimWrite.disabled = true;
            paymentMethodClaimRead.disabled = false;
            paymentMethodClaimWrite.disabled = true;
            marketingChannelClaimRead.disabled = false;
            marketingChannelClaimWrite.disabled = true;
            signUpPortalClaimRead.disabled = false;
            signUpPortalClaimWrite.disabled = true;
            signUpPortalClaimWrite.checked = false;
            languageClaimRead.disabled = false;
            languageClaimWrite.disabled = true;
            playerStatusClaimRead.disabled = false;
            playerStatusClaimWrite.disabled = true;
            countryClaimRead.disabled = false;
            countryClaimWrite.disabled = true;
            vipLevelClaimWrite.checked = false;
            riskLevelClaimWrite.checked = false;
            currencyClaimWrite.checked = false;
            marketingChannelClaimWrite.checked = false;
            languageClaimWrite.checked = false;
            playerStatusClaimWrite.checked = false;
            paymentGroupClaimWrite.checked = false;
            paymentMethodClaimWrite.checked = false;

            setVIPLevelWrite(false);
            setRiskLevelWrite(false);
            setPaymentGroupWrite(false)
            setPaymentMethodWrite(false);
            setCurrencyWrite(false);
            setMarketingChannelWrite(false);
            setSignUpPortalWrite(false);
            setLanguageWrite(false);
            setPlayerStatusWrite(false);
            setCountryWrite(false);
        } else if (playerConfigurationClaimRead.checked === false && playerConfigurationClaimWrite.checked === true) {
            riskLevelClaimRead.disabled = false;
            riskLevelClaimWrite.disabled = false;
            paymentGroupClaimRead.disabled = false;
            paymentGroupClaimWrite.disabled = false;
            paymentMethodClaimRead.disabled = false;
            paymentMethodClaimWrite.disabled = false;
            currencyClaimRead.disabled = false;
            currencyClaimWrite.disabled = false;
            marketingChannelClaimRead.disabled = false;
            marketingChannelClaimWrite.disabled = false;
            signUpPortalClaimRead.disabled = false;
            signUpPortalClaimWrite.disabled = false;
            languageClaimRead.disabled = false;
            languageClaimWrite.disabled = false;
            playerStatusClaimRead.disabled = false;
            playerStatusClaimWrite.disabled = false;
            countryClaimRead.disabled = false;
            countryClaimWrite.disabled = false;
            vipLevelClaimRead.disabled = false;
            vipLevelClaimWrite.disabled = false;

            setCountryRead(false);
            setRiskLevelRead(false);
            setPaymentGroupRead(false);
            setPaymentMethodRead(false);
            setCurrencyRead(false);
            setCurrencyWrite(false);
            setMarketingChannelRead(false);
            setSignUpPortalRead(false);
            setLanguageRead(false);
            setPlayerStatusRead(false);
            setVIPLevelRead(false);
            setCountryWrite(false);
            setRiskLevelWrite(false);
            setPaymentGroupWrite(false);
            setPaymentMethodWrite(false);
            setMarketingChannelWrite(false);
            setSignUpPortalWrite(false);
            setLanguageWrite(false);
            setPlayerStatusWrite(false);
            setVIPLevelWrite(false);
        } else if (playerConfigurationClaimRead.checked === false && playerConfigurationClaimWrite.checked === false) {
            vipLevelClaimRead.disabled = true;
            vipLevelClaimWrite.disabled = true;
            riskLevelClaimRead.disabled = true;
            riskLevelClaimWrite.disabled = true;
            paymentGroupClaimRead.disabled = true;
            paymentGroupClaimWrite.disabled = true;
            paymentMethodClaimRead.disabled = true;
            paymentMethodClaimWrite.disabled = true;
            currencyClaimRead.disabled = true;
            currencyClaimWrite.disabled = true;
            marketingChannelClaimRead.disabled = true;
            marketingChannelClaimWrite.disabled = true;
            signUpPortalClaimRead.disabled = true;
            signUpPortalClaimWrite.disabled = true;
            languageClaimRead.disabled = true;
            languageClaimWrite.disabled = true;
            playerStatusClaimRead.disabled = true;
            playerStatusClaimWrite.disabled = true;
            countryClaimRead.disabled = true;
            countryClaimWrite.disabled = true;
            riskLevelClaimRead.checked = false;
            riskLevelClaimWrite.checked = false;
            paymentGroupClaimRead.checked = false;
            paymentGroupClaimWrite.checked = false;
            paymentMethodClaimRead.checked = false;
            paymentMethodClaimWrite.checked = false;
            currencyClaimRead.checked = false;
            currencyClaimWrite.checked = false;
            marketingChannelClaimRead.checked = false;
            marketingChannelClaimWrite.checked = false;
            signUpPortalClaimRead.checked = false;
            signUpPortalClaimWrite.checked = false;
            languageClaimRead.checked = false;
            languageClaimWrite.checked = false;
            playerStatusClaimRead.checked = false;
            playerStatusClaimWrite.checked = false;
            countryClaimRead.checked = false;
            countryClaimWrite.checked = false;
            vipLevelClaimRead.checked = false;
            vipLevelClaimWrite.checked = false;

            setCountryRead(false);
            setCountryWrite(false);
            setRiskLevelRead(false);
            setRiskLevelWrite(false);
            setPaymentGroupRead(false);
            setPaymentGroupWrite(false);
            setPaymentMethodRead(false);
            setPaymentMethodWrite(false);
            setCurrencyRead(false);
            setCurrencyWrite(false);
            setMarketingChannelRead(false);
            setMarketingChannelWrite(false);
            setSignUpPortalRead(false);
            setSignUpPortalWrite(false);
            setLanguageRead(false);
            setLanguageWrite(false);
            setPlayerStatusRead(false);
            setPlayerStatusWrite(false);
            setVIPLevelRead(false);
            setVIPLevelWrite(false);
        }
    }
    function changeStaffPerformance() { 
        if ((staffPerformanceClaimRead.checked === false || staffPerformanceClaimRead.checked === true) && staffPerformanceClaimWrite.checked === true) {
            communicationReviewPeriodClaimRead.disabled = false;
            communicationReviewPeriodClaimWrite.disabled = false;
  
            setCommunicationReviewPeriodRead(false);
            setCommunicationReviewPeriodWrite(false);

        } else if (staffPerformanceClaimRead.checked === true && staffPerformanceClaimWrite.checked === false) {
            communicationReviewPeriodClaimRead.disabled = false;
            communicationReviewPeriodClaimWrite.disabled = true;

            communicationReviewPeriodClaimRead.checked = false;
            communicationReviewPeriodClaimWrite.checked = false;

            setCommunicationReviewPeriodWrite(false);
            setCommunicationReviewPeriodRead(false);

        } else if (staffPerformanceClaimRead.checked === false && staffPerformanceClaimWrite.checked === false) {
            communicationReviewPeriodClaimRead.disabled = true;
            communicationReviewPeriodClaimWrite.disabled = true;
            communicationReviewPeriodClaimRead.checked = false;
            communicationReviewPeriodClaimWrite.checked = false;
            setCommunicationReviewPeriodRead(false);
            setCommunicationReviewPeriodWrite(false);
        }
    }

    function onChangeSystemRead(val: boolean) {
        setSystemRead(val);
        changeSystemRuleStatus();
    }

    function onChangeSystemWrite(val: boolean) {
        setSystemWrite(val);
        changeSystemRuleStatus();
    }

    function onChangeOperatorAndBrandRead(val: boolean) {
        setOperatorAndBrandRead(val);
    }

    function onChangeOperatorAndBrandWrite(val: boolean) {
        setOperatorAndBrandWrite(val);
    }

    function onChangeCodeListRead(val: boolean) {
        setCodeListRead(val);
        changeEditCodeListStatus();
    }

    function onChangeCodeListWrite(val: boolean) {
        setCodeListWrite(val);
        changeEditCodeListStatus();
    }

    function onChangePlayerConfigurationRead(val: boolean) {
        setPlayerConfigurationRead(val);
        changePlayerConfiguration();
    }

    function onChangePlayerConfigurationWrite(val: boolean) {
        setPlayerConfigurationWrite(val);
        changePlayerConfiguration();
    }

    function onChangeStaffPerformanceRead(val: boolean) {
        setStaffPerformanceRead(val);
        changeStaffPerformance();
    }

    function onChangeStaffPerformanceWrite(val: boolean) {
        setStaffPerformanceWrite(val);
        changeStaffPerformance();
    }

    function onChangePaymentGroupRead(val: boolean) {
        setPaymentGroupRead(val);
    }

    function onChangePaymentGroupWrite(val: boolean) {
        setPaymentGroupWrite(val);
    }

    function onChangePaymentMethodRead(val: boolean) {
        setPaymentMethodRead(val);
    }

    function onChangePaymentMethodWrite(val: boolean) {
        setPaymentMethodWrite(val);
    }

    function onChangeVIPLevelRead(val: boolean) {
        setVIPLevelRead(val);
    }

    function onChangeVIPLevelWrite(val: boolean) {
        setVIPLevelWrite(val);
    }

    function onChangeRiskLevelRead(val: boolean) {
        setRiskLevelRead(val);
    }

    function onChangeRiskLevelWrite(val: boolean) {
        setRiskLevelWrite(val);
    }

    function onChangeCurrencyRead(val: boolean) {
        setCurrencyRead(val);
    }

    function onChangeCurrencyWrite(val: boolean) {
        setCurrencyWrite(val);
    }

    function onChangeMarketingChannelRead(val: boolean) {
        setMarketingChannelRead(val);
    }

    function onChangeMarketingChannelWrite(val: boolean) {
        setMarketingChannelWrite(val);
    }

    function onChangeSignUpPortalRead(val: boolean) {
        setSignUpPortalRead(val);
    }

    function onChangeSignUpPortalWrite(val: boolean) {
        setSignUpPortalWrite(val);
    }

    function onChangeLanguageWrite(val: boolean) {
        setLanguageWrite(val);
    }

    function onChangeLanguageRead(val: boolean) {
        setLanguageRead(val);
    }

    function onChangePlayerStatusRead(val: boolean) {
        setPlayerStatusRead(val);
    }

    function onChangePlayerStatusWrite(val: boolean) {
        setPlayerStatusWrite(val);
    }

    function onChangeCountryRead(val: boolean) {
        setCountryRead(val);
    }

    function onChangeCountryWrite(val: boolean) {
        setCountryWrite(val);
    }

    function onChangeTopicRead(val: boolean) {
        setTopicRead(val);
    }

    function onChangeTopicWrite(val: boolean) {
        setTopicWrite(val);
    }

    function onChangeSubTopicRead(val: boolean) {
        setSubTopicRead(val);
    }

    function onChangeSubTopicWrite(val: boolean) {
        setSubTopicWrite(val);
    }

    function onChangeMessageTypeRead(val: boolean) {
        setMessageTypeRead(val);
    }

    function onChangeMessageTypeWrite(val: boolean) {
        setMessageTypeWrite(val);
    }

    function onChangeMessageStatusRead(val: boolean) {
        setMessageStatusRead(val);
    }

    function onChangeMessageStatusWrite(val: boolean) {
        setMessageStatusWrite(val);
    }

    function onChangeMessageResponseRead(val: boolean) {
        setMessageResponseRead(val);
    }

    function onChangeMessageResponseWrite(val: boolean) {
        setMessageResponseWrite(val);
    }

    function onChangeSurveyQuestionRead(val: boolean) {
        setSurveyQuestionRead(val);
    }

    function onChangeSurveyQuestionWrite(val: boolean) {
        setSurveyQuestionWrite(val);
    }

    function onChangeSurveyTemplateRead(val: boolean) {
        setSurveyQuestionRead(val);
    }

    function onChangeSurveyTemplateWrite(val: boolean) {
        setSurveyTemplateWrite(val);
    }



    function onChangeFeedbackTypeRead(val: boolean) {
        setFeedbackTypeRead(val);
    }

    function onChangeFeedbackTypeWrite(val: boolean) {
        setFeedbackTypeWrite(val);
    }

    function onChangeFeedbackCategoryRead(val: boolean) {
        setFeedbackCategoryRead(val);
    }

    function onChangeFeedbackCategoryWrite(val: boolean) {
        setFeedbackCategoryWrite(val);
    }

    function onChangeFeedbackAnswerRead(val: boolean) {
        setFeedbackAnswerRead(val);
    }

    function onChangeFeedbackAnswerWrite(val: boolean) {
        setFeedbackAnswerWrite(val);
    }

	function onChangeCommunicationReviewPeriodRead(val: boolean) {
		setCommunicationReviewPeriodRead(val);
	}

	function onChangeCommunicationReviewPeriodWrite(val: boolean) {
		setCommunicationReviewPeriodWrite(val);
	}

    return (
        <>
            <Card.Header className='accordion-header' style={CardHeaderEditStyles}>
                <Accordion.Toggle as={Button} variant='link' eventKey='3'>
                    <FontAwesomeIcon icon={faToggleOn} /> {SECURABLE_NAMES.System}
                </Accordion.Toggle>
                <div className='d-flex align-items-center my-2'>
                    <div className='col-sm-7'>
                        <div className='form-check form-switch form-check-custom form-check-solid'>
                            <ToggleComponent
                                toggleId='systemClaimRead'
                                toggleTagging='Read'
                                toggleChange={onChangeSystemRead}
                                toggleDefaultValue={systemRead}
                                isDisabled={false}
                            />
                        </div>
                    </div>
                    <div className='col'>
                        <div className='form-check form-switch form-check-custom form-check-solid'>
                            <ToggleComponent
                                toggleId='systemClaimWrite'
                                toggleTagging='Write'
                                toggleChange={onChangeSystemWrite}
                                toggleDefaultValue={systemWrite}
                                isDisabled={false}
                            />
                        </div>
                    </div>
                </div>
            </Card.Header>
            <Accordion.Collapse eventKey='3'>
                <Card.Body className='accordion-body edit-user-div' style={CardBodyEditStyles}>
                    <Accordion defaultActiveKey='0' className='accordion'>
                        <Card>
                            <Card.Header className='accordion-header'>
                                <Accordion.Toggle as={Button} variant='link' eventKey='0'>
                                    <FontAwesomeIcon icon={faCircle} /> {SECURABLE_NAMES.OperatorAndBrand}
                                </Accordion.Toggle>
                                <div className='d-flex align-items-center my-2'>
                                    <div className='col-sm-7'>
                                        <div className='form-check form-switch form-check-custom form-check-solid'>
                                            <ToggleComponent
                                                toggleId='operatorAndBrandClaimRead'
                                                toggleTagging='Read'
                                                toggleChange={onChangeOperatorAndBrandRead}
                                                toggleDefaultValue={operatorAndBrandRead}
                                                isDisabled={true}
                                            />
                                        </div>
                                    </div>
                                    <div className='col'>
                                        <div className='form-check form-switch form-check-custom form-check-solid'>
                                            <ToggleComponent
                                                toggleId='operatorAndBrandClaimWrite'
                                                toggleTagging='Write'
                                                toggleChange={onChangeOperatorAndBrandWrite}
                                                toggleDefaultValue={operatorAndBrandWrite}
                                                isDisabled={true}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </Card.Header>
                        </Card>
                        <Card>
                            <Card.Header className='accordion-header edit-user-div'>
                                <Accordion.Toggle as={Button} variant='link' eventKey='1'>
                                    <FontAwesomeIcon icon={faCircle} /> {SECURABLE_NAMES.CodeList}
                                </Accordion.Toggle>
                                <div className='d-flex align-items-center my-2'>
                                    <div className='col-sm-7'>
                                        <div className='form-check form-switch form-check-custom form-check-solid'>
                                            <ToggleComponent
                                                toggleId='codeListClaimRead'
                                                toggleTagging='Read'
                                                toggleChange={onChangeCodeListRead}
                                                toggleDefaultValue={codeListRead}
                                                isDisabled={true}
                                            />
                                        </div>
                                    </div>
                                    <div className='col'>
                                        <div className='form-check form-switch form-check-custom form-check-solid'>
                                            <ToggleComponent
                                                toggleId='codeListClaimWrite'
                                                toggleTagging='Write'
                                                toggleChange={onChangeCodeListWrite}
                                                toggleDefaultValue={codeListWrite}
                                                isDisabled={true}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </Card.Header>
                            <Accordion.Collapse eventKey='1'>
                                <Card.Body className='accordion-body edit-user-div' style={CardBodyEditStyles}>
                                    {/* Topic */}
                                    <div className='row mb-3'>
                                        <div className='d-flex align-items-center my-2'>
                                            <div className='col-sm-10'>
                                                <div className='form-label-sm'>{SECURABLE_NAMES.Topic}</div>
                                            </div>
                                            <div className='col-sm-1'>
                                                <div className='form-check form-switch form-check-custom form-check-solid'>
                                                    <ToggleComponent
                                                        toggleId='topicClaimRead'
                                                        toggleTagging='Read'
                                                        toggleChange={onChangeTopicRead}
                                                        toggleDefaultValue={topicRead}
                                                        isDisabled={true}
                                                    />
                                                </div>
                                            </div>
                                            <div className='col'>
                                                <div className='form-check form-switch form-check-custom form-check-solid'>
                                                    <ToggleComponent
                                                        toggleId='topicClaimWrite'
                                                        toggleTagging='Write'
                                                        toggleChange={onChangeTopicWrite}
                                                        toggleDefaultValue={topicWrite}
                                                        isDisabled={true}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Subtopic */}

                                    <div className='row mb-3'>
                                        <div className='d-flex align-items-center my-2'>
                                            <div className='col-sm-10'>
                                                <div className='form-label-sm'>{SECURABLE_NAMES.Subtopic}</div>
                                            </div>

                                            <div className='col-sm-1'>
                                                <div className='form-check form-switch form-check-custom form-check-solid'>
                                                    <ToggleComponent
                                                        toggleId='subtopicClaimRead'
                                                        toggleTagging='Read'
                                                        toggleChange={onChangeSubTopicRead}
                                                        toggleDefaultValue={subTopicRead}
                                                        isDisabled={true}
                                                    />
                                                </div>
                                            </div>
                                            <div className='col'>
                                                <div className='form-check form-switch form-check-custom form-check-solid'>
                                                    <ToggleComponent
                                                        toggleId='subtopicClaimWrite'
                                                        toggleTagging='Write'
                                                        toggleChange={onChangeSubTopicWrite}
                                                        toggleDefaultValue={subTopicWrite}
                                                        isDisabled={true}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Message Type */}

                                    <div className='row mb-3'>
                                        <div className='d-flex align-items-center my-2'>
                                            <div className='col-sm-10'>
                                                <div className='form-label-sm'>{SECURABLE_NAMES.MessageType}</div>
                                            </div>

                                            <div className='col-sm-1'>
                                                <div className='form-check form-switch form-check-custom form-check-solid'>
                                                    <ToggleComponent
                                                        toggleId='messageTypeClaimRead'
                                                        toggleTagging='Read'
                                                        toggleChange={onChangeMessageTypeRead}
                                                        toggleDefaultValue={messageTypeRead}
                                                        isDisabled={true}
                                                    />
                                                </div>
                                            </div>
                                            <div className='col'>
                                                <div className='form-check form-switch form-check-custom form-check-solid'>
                                                    <ToggleComponent
                                                        toggleId='messageTypeClaimWrite'
                                                        toggleTagging='Write'
                                                        toggleChange={onChangeMessageTypeWrite}
                                                        toggleDefaultValue={messageTypeWrite}
                                                        isDisabled={true}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Message Status */}

                                    <div className='row mb-3'>
                                        <div className='d-flex align-items-center my-2'>
                                            <div className='col-sm-10'>
                                                <div className='form-label-sm'>{SECURABLE_NAMES.MessageStatus}</div>
                                            </div>

                                            <div className='col-sm-1'>
                                                <div className='form-check form-switch form-check-custom form-check-solid'>
                                                    <ToggleComponent
                                                        toggleId='messageStatusClaimRead'
                                                        toggleTagging='Read'
                                                        toggleChange={onChangeMessageStatusRead}
                                                        toggleDefaultValue={messageStatusRead}
                                                        isDisabled={true}
                                                    />
                                                </div>
                                            </div>
                                            <div className='col'>
                                                <div className='form-check form-switch form-check-custom form-check-solid'>
                                                    <ToggleComponent
                                                        toggleId='messageStatusClaimWrite'
                                                        toggleTagging='Write'
                                                        toggleChange={onChangeMessageStatusWrite}
                                                        toggleDefaultValue={messageStatusWrite}
                                                        isDisabled={true}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {/* Message Response */}

                                    <div className='row mb-3'>
                                        <div className='d-flex align-items-center my-2'>
                                            <div className='col-sm-10'>
                                                <div className='form-label-sm'>{SECURABLE_NAMES.MessageResponse}</div>
                                            </div>

                                            <div className='col-sm-1'>
                                                <div className='form-check form-switch form-check-custom form-check-solid'>
                                                    <ToggleComponent
                                                        toggleId='messageResponseClaimRead'
                                                        toggleTagging='Read'
                                                        toggleChange={onChangeMessageResponseRead}
                                                        toggleDefaultValue={messageResponseRead}
                                                        isDisabled={true}
                                                    />
                                                </div>
                                            </div>
                                            <div className='col'>
                                                <div className='form-check form-switch form-check-custom form-check-solid'>
                                                    <ToggleComponent
                                                        toggleId='messageResponseClaimWrite'
                                                        toggleTagging='Write'
                                                        toggleChange={onChangeMessageResponseWrite}
                                                        toggleDefaultValue={messageResponseWrite}
                                                        isDisabled={true}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {/* Feedback Type */}

                                    <div className='row mb-3'>
                                        <div className='d-flex align-items-center my-2'>
                                            <div className='col-sm-10'>
                                                <div className='form-label-sm'>{SECURABLE_NAMES.FeedbackType}</div>
                                            </div>

                                            <div className='col-sm-1'>
                                                <div className='form-check form-switch form-check-custom form-check-solid'>
                                                    <ToggleComponent
                                                        toggleId='feedbackTypeClaimRead'
                                                        toggleTagging='Read'
                                                        toggleChange={onChangeFeedbackTypeRead}
                                                        toggleDefaultValue={feedbackTypeRead}
                                                        isDisabled={true}
                                                    />
                                                </div>
                                            </div>
                                            <div className='col'>
                                                <div className='form-check form-switch form-check-custom form-check-solid'>
                                                    <ToggleComponent
                                                        toggleId='feedbackTypeClaimWrite'
                                                        toggleTagging='Write'
                                                        toggleChange={onChangeFeedbackTypeWrite}
                                                        toggleDefaultValue={feedbackTypeWrite}
                                                        isDisabled={true}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {/* Feedback Category */}

                                    <div className='row mb-3'>
                                        <div className='d-flex align-items-center my-2'>
                                            <div className='col-sm-10'>
                                                <div className='form-label-sm'>{SECURABLE_NAMES.FeedbackCategory}</div>
                                            </div>

                                            <div className='col-sm-1'>
                                                <div className='form-check form-switch form-check-custom form-check-solid'>
                                                    <ToggleComponent
                                                        toggleId='feedbackCategoryClaimRead'
                                                        toggleTagging='Read'
                                                        toggleChange={onChangeFeedbackCategoryRead}
                                                        toggleDefaultValue={feedbackCategoryRead}
                                                        isDisabled={true}
                                                    />
                                                </div>
                                            </div>
                                            <div className='col'>
                                                <div className='form-check form-switch form-check-custom form-check-solid'>
                                                    <ToggleComponent
                                                        toggleId='feedbackCategoryClaimWrite'
                                                        toggleTagging='Write'
                                                        toggleChange={onChangeFeedbackCategoryWrite}
                                                        toggleDefaultValue={feedbackCategoryWrite}
                                                        isDisabled={true}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {/* Feedback Answer */}

                                    <div className='row mb-3'>
                                        <div className='d-flex align-items-center my-2'>
                                            <div className='col-sm-10'>
                                                <div className='form-label-sm'>{SECURABLE_NAMES.FeedbackAnswer}</div>
                                            </div>

                                            <div className='col-sm-1'>
                                                <div className='form-check form-switch form-check-custom form-check-solid'>
                                                    <ToggleComponent
                                                        toggleId='feedbackAnswerClaimRead'
                                                        toggleTagging='Read'
                                                        toggleChange={onChangeFeedbackAnswerRead}
                                                        toggleDefaultValue={feedbackAnswerRead}
                                                        isDisabled={true}
                                                    />
                                                </div>
                                            </div>
                                            <div className='col'>
                                                <div className='form-check form-switch form-check-custom form-check-solid'>
                                                    <ToggleComponent
                                                        toggleId='feedbackAnswerClaimWrite'
                                                        toggleTagging='Write'
                                                        toggleChange={onChangeFeedbackAnswerWrite}
                                                        toggleDefaultValue={feedbackAnswerWrite}
                                                        isDisabled={true}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Card.Body>
                            </Accordion.Collapse>
                        </Card>
                        <Card>
                            <Card.Header className='accordion-header edit-user-div'>
                                <Accordion.Toggle as={Button} variant='link' eventKey='2'>
                                    <FontAwesomeIcon icon={faCircle} /> {SECURABLE_NAMES.PlayerConfiguration}
                                </Accordion.Toggle>
                                <div className='d-flex align-items-center my-2'>
                                    <div className='col-sm-7'>
                                        <div className='form-check form-switch form-check-custom form-check-solid'>
                                            <ToggleComponent
                                                toggleId='playerConfigurationClaimRead'
                                                toggleTagging='Read'
                                                toggleChange={onChangePlayerConfigurationRead}
                                                toggleDefaultValue={playerConfigurationRead}
                                                isDisabled={true}
                                            />
                                        </div>
                                    </div>
                                    <div className='col'>
                                        <div className='form-check form-switch form-check-custom form-check-solid'>
                                            <ToggleComponent
                                                toggleId='playerConfigurationClaimWrite'
                                                toggleTagging='Write'
                                                toggleChange={onChangePlayerConfigurationWrite}
                                                toggleDefaultValue={playerConfigurationWrite}
                                                isDisabled={true}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </Card.Header>
                            <Accordion.Collapse eventKey='2'>
                                <Card.Body className='accordion-body edit-user-div' style={CardBodyEditStyles}>
                                    {/* VIPLevel */}
                                    <div className='row mb-3'>
                                        <div className='d-flex align-items-center my-2'>
                                            <div className='col-sm-10'>
                                                <div className='form-label-sm'>{SECURABLE_NAMES.VIPLevel}</div>
                                            </div>

                                            <div className='col-sm-1'>
                                                <div className='form-check form-switch form-check-custom form-check-solid'>
                                                    <ToggleComponent
                                                        toggleId='vipLevelClaimRead'
                                                        toggleTagging='Read'
                                                        toggleChange={onChangeVIPLevelRead}
                                                        toggleDefaultValue={vipLevelRead}
                                                        isDisabled={true}
                                                    />
                                                </div>
                                            </div>
                                            <div className='col'>
                                                <div className='form-check form-switch form-check-custom form-check-solid'>
                                                    <ToggleComponent
                                                        toggleId='vipLevelClaimWrite'
                                                        toggleTagging='Write'
                                                        toggleChange={onChangeVIPLevelWrite}
                                                        toggleDefaultValue={vipLevelWrite}
                                                        isDisabled={true}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className='row mb-3'>
                                        <div className='d-flex align-items-center my-2'>
                                            <div className='col-sm-10'>
                                                <div className='form-label-sm'>{SECURABLE_NAMES.RiskLevel}</div>
                                            </div>

                                            <div className='col-sm-1'>
                                                <div className='form-check form-switch form-check-custom form-check-solid'>
                                                    <ToggleComponent
                                                        toggleId='riskLevelClaimRead'
                                                        toggleTagging='Read'
                                                        toggleChange={onChangeRiskLevelRead}
                                                        toggleDefaultValue={riskLevelRead}
                                                        isDisabled={true}
                                                    />
                                                </div>
                                            </div>
                                            <div className='col'>
                                                <div className='form-check form-switch form-check-custom form-check-solid'>
                                                    <ToggleComponent
                                                        toggleId='riskLevelClaimWrite'
                                                        toggleTagging='Write'
                                                        toggleChange={onChangeRiskLevelWrite}
                                                        toggleDefaultValue={riskLevelWrite}
                                                        isDisabled={true}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className='row mb-3'>
                                        <div className='d-flex align-items-center my-2'>
                                            <div className='col-sm-10'>
                                                <div className='form-label-sm'>{SECURABLE_NAMES.PaymentGroup}</div>
                                            </div>

                                            <div className='col-sm-1'>
                                                <div className='form-check form-switch form-check-custom form-check-solid'>
                                                    <ToggleComponent
                                                        toggleId='paymentGroupClaimRead'
                                                        toggleTagging='Read'
                                                        toggleChange={onChangePaymentGroupRead}
                                                        toggleDefaultValue={paymentGroupRead}
                                                        isDisabled={true}
                                                    />
                                                </div>
                                            </div>
                                            <div className='col'>
                                                <div className='form-check form-switch form-check-custom form-check-solid'>
                                                    <ToggleComponent
                                                        toggleId='paymentGroupClaimWrite'
                                                        toggleTagging='Write'
                                                        toggleChange={onChangePaymentGroupWrite}
                                                        toggleDefaultValue={paymentGroupWrite}
                                                        isDisabled={true}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className='row mb-3'>
                                        <div className='d-flex align-items-center my-2'>
                                            <div className='col-sm-10'>
                                                <div className='form-label-sm'>{SECURABLE_NAMES.Currency}</div>
                                            </div>

                                            <div className='col-sm-1'>
                                                <div className='form-check form-switch form-check-custom form-check-solid'>
                                                    <ToggleComponent
                                                        toggleId='currencyClaimRead'
                                                        toggleTagging='Read'
                                                        toggleChange={onChangeCurrencyRead}
                                                        toggleDefaultValue={currencyRead}
                                                        isDisabled={true}
                                                    />
                                                </div>
                                            </div>
                                            <div className='col'>
                                                <div className='form-check form-switch form-check-custom form-check-solid'>
                                                    <ToggleComponent
                                                        toggleId='currencyClaimWrite'
                                                        toggleTagging='Write'
                                                        toggleChange={onChangeCurrencyWrite}
                                                        toggleDefaultValue={currencyWrite}
                                                        isDisabled={true}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className='row mb-3'>
                                        <div className='d-flex align-items-center my-2'>
                                            <div className='col-sm-10'>
                                                <div className='form-label-sm'>{SECURABLE_NAMES.MarketingChannel}</div>
                                            </div>

                                            <div className='col-sm-1'>
                                                <div className='form-check form-switch form-check-custom form-check-solid'>
                                                    <ToggleComponent
                                                        toggleId='marketingChannelClaimRead'
                                                        toggleTagging='Read'
                                                        toggleChange={onChangeMarketingChannelRead}
                                                        toggleDefaultValue={marketingChannelRead}
                                                        isDisabled={true}
                                                    />
                                                </div>
                                            </div>
                                            <div className='col'>
                                                <div className='form-check form-switch form-check-custom form-check-solid'>
                                                    <ToggleComponent
                                                        toggleId='marketingChannelClaimWrite'
                                                        toggleTagging='Write'
                                                        toggleChange={onChangeMarketingChannelWrite}
                                                        toggleDefaultValue={marketingChannelWrite}
                                                        isDisabled={true}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className='row mb-3'>
                                        <div className='d-flex align-items-center my-2'>
                                            <div className='col-sm-10'>
                                                <div className='form-label-sm'>{SECURABLE_NAMES.SignUpPortal}</div>
                                            </div>

                                            <div className='col-sm-1'>
                                                <div className='form-check form-switch form-check-custom form-check-solid'>
                                                    <ToggleComponent
                                                        toggleId='signUpPortalClaimRead'
                                                        toggleTagging='Read'
                                                        toggleChange={onChangeSignUpPortalRead}
                                                        toggleDefaultValue={signUpPortalRead}
                                                        isDisabled={true}
                                                    />
                                                </div>
                                            </div>
                                            <div className='col'>
                                                <div className='form-check form-switch form-check-custom form-check-solid'>
                                                    <ToggleComponent
                                                        toggleId='signUpPortalClaimWrite'
                                                        toggleTagging='Write'
                                                        toggleChange={onChangeSignUpPortalWrite}
                                                        toggleDefaultValue={signUpPortalWrite}
                                                        isDisabled={true}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className='row mb-3'>
                                        <div className='d-flex align-items-center my-2'>
                                            <div className='col-sm-10'>
                                                <div className='form-label-sm'>{SECURABLE_NAMES.Language}</div>
                                            </div>

                                            <div className='col-sm-1'>
                                                <div className='form-check form-switch form-check-custom form-check-solid'>
                                                    <ToggleComponent
                                                        toggleId='languageClaimRead'
                                                        toggleTagging='Read'
                                                        toggleChange={onChangeLanguageRead}
                                                        toggleDefaultValue={languageRead}
                                                        isDisabled={true}
                                                    />
                                                </div>
                                            </div>
                                            <div className='col'>
                                                <div className='form-check form-switch form-check-custom form-check-solid'>
                                                    <ToggleComponent
                                                        toggleId='languageClaimWrite'
                                                        toggleTagging='Write'
                                                        toggleChange={onChangeLanguageWrite}
                                                        toggleDefaultValue={languageWrite}
                                                        isDisabled={true}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className='row mb-3'>
                                        <div className='d-flex align-items-center my-2'>
                                            <div className='col-sm-10'>
                                                <div className='form-label-sm'>{SECURABLE_NAMES.PlayerStatus}</div>
                                            </div>

                                            <div className='col-sm-1'>
                                                <div className='form-check form-switch form-check-custom form-check-solid'>
                                                    <ToggleComponent
                                                        toggleId='playerStatusClaimRead'
                                                        toggleTagging='Read'
                                                        toggleChange={onChangePlayerStatusRead}
                                                        toggleDefaultValue={playerStatusRead}
                                                        isDisabled={true}
                                                    />
                                                </div>
                                            </div>
                                            <div className='col'>
                                                <div className='form-check form-switch form-check-custom form-check-solid'>
                                                    <ToggleComponent
                                                        toggleId='playerStatusClaimWrite'
                                                        toggleTagging='Write'
                                                        toggleChange={onChangePlayerStatusWrite}
                                                        toggleDefaultValue={playerStatusWrite}
                                                        isDisabled={true}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className='row mb-3'>
                                        <div className='d-flex align-items-center my-2'>
                                            <div className='col-sm-10'>
                                                <div className='form-label-sm'>{SECURABLE_NAMES.Country}</div>
                                            </div>

                                            <div className='col-sm-1'>
                                                <div className='form-check form-switch form-check-custom form-check-solid'>

                                                    <ToggleComponent
                                                        toggleId='countryClaimRead'
                                                        toggleTagging='Read'
                                                        toggleChange={onChangeCountryRead}
                                                        toggleDefaultValue={countryRead}
                                                        isDisabled={true}
                                                    />
                                                </div>
                                            </div>
                                            <div className='col'>
                                                <div className='form-check form-switch form-check-custom form-check-solid'>

                                                    <ToggleComponent
                                                        toggleId='countryClaimWrite'
                                                        toggleTagging='Write'
                                                        toggleChange={onChangeCountryWrite}
                                                        toggleDefaultValue={countryWrite}
                                                        isDisabled={true}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className='row mb-3'>
                                        <div className='d-flex align-items-center my-2'>
                                            <div className='col-sm-10'>
                                                <div className='form-label-sm'>{SECURABLE_NAMES.PaymentMethod}</div>
                                            </div>

                                            <div className='col-sm-1'>
                                                <div className='form-check form-switch form-check-custom form-check-solid'>
                                                    <ToggleComponent
                                                        toggleId='paymentMethodClaimRead'
                                                        toggleTagging='Read'
                                                        toggleChange={onChangePaymentMethodRead}
                                                        toggleDefaultValue={paymentMethodRead}
                                                        isDisabled={true}
                                                    />
                                                </div>
                                            </div>
                                            <div className='col'>
                                                <div className='form-check form-switch form-check-custom form-check-solid'>
                                                    <ToggleComponent
                                                        toggleId='paymentMethodClaimWrite'
                                                        toggleTagging='Write'
                                                        toggleChange={onChangePaymentMethodWrite}
                                                        toggleDefaultValue={paymentMethodWrite}
                                                        isDisabled={true}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Card.Body>
                            </Accordion.Collapse>
                        </Card>
                        <Card>
                            <Card.Header className='accordion-header edit-user-div'>
                                <Accordion.Toggle as={Button} variant='link' eventKey='3'>
                                    <FontAwesomeIcon icon={faCircle} /> {SECURABLE_NAMES.SurveyQuestion}
                                </Accordion.Toggle>
                                <div className='d-flex align-items-center my-2'>
                                    <div className='col-sm-7'>
                                        <div className='form-check form-switch form-check-custom form-check-solid'>

                                            <ToggleComponent
                                                toggleId='surveyQuestionClaimRead'
                                                toggleTagging='Read'
                                                toggleChange={onChangeSurveyQuestionRead}
                                                toggleDefaultValue={surveyQuestionRead}
                                                isDisabled={true}
                                            />
                                        </div>
                                    </div>
                                    <div className='col'>
                                        <div className='form-check form-switch form-check-custom form-check-solid'>
                                            <ToggleComponent
                                                toggleId='surveyQuestionClaimWrite'
                                                toggleTagging='Write'
                                                toggleChange={onChangeSurveyQuestionWrite}
                                                toggleDefaultValue={surveyQuestionWrite}
                                                isDisabled={true}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </Card.Header>
                        </Card>
                        <Card>
                            <Card.Header className='accordion-header edit-user-div'>
                                <Accordion.Toggle as={Button} variant='link' eventKey='4'>
                                    <FontAwesomeIcon icon={faCircle} /> {SECURABLE_NAMES.SurveyTemplate}
                                </Accordion.Toggle>
                                <div className='d-flex align-items-center my-2'>
                                    <div className='col-sm-7'>
                                        <div className='form-check form-switch form-check-custom form-check-solid'>
                                            <ToggleComponent
                                                toggleId='surveyTemplateClaimRead'
                                                toggleTagging='Read'
                                                toggleChange={onChangeSurveyTemplateRead}
                                                toggleDefaultValue={surveyTemplateRead}
                                                isDisabled={true}
                                            />
                                        </div>
                                    </div>
                                    <div className='col'>
                                        <div className='form-check form-switch form-check-custom form-check-solid'>
                                            <ToggleComponent
                                                toggleId='surveyTemplateClaimWrite'
                                                toggleTagging='Write'
                                                toggleChange={onChangeSurveyTemplateWrite}
                                                toggleDefaultValue={surveyTemplateWrite}
                                                isDisabled={true}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </Card.Header>
                        </Card>
                        <Card>
                            <Card.Header className='accordion-header edit-user-div'>
                                <Accordion.Toggle as={Button} variant='link' eventKey='5'>
                                    <FontAwesomeIcon icon={faCircle} /> {SECURABLE_NAMES.SkillMapping}
                                </Accordion.Toggle>
                                <div className='d-flex align-items-center my-2'>
                                    <div className='col-sm-7'>
                                        <div className='form-check form-switch form-check-custom form-check-solid'>

                                            <ToggleComponent
                                                toggleId='skillMappingClaimRead'
                                                toggleTagging='Read'
                                                toggleChange={setSkillMappingRead}
                                                toggleDefaultValue={skillMappingRead}
                                                isDisabled={true}
                                            />
                                        </div>
                                    </div>
                                    <div className='col'>
                                        <div className='form-check form-switch form-check-custom form-check-solid'>

                                            <ToggleComponent
                                                toggleId='skillMappingClaimWrite'
                                                toggleTagging='Write'
                                                toggleChange={setSkillMappingWrite}
                                                toggleDefaultValue={skillMappingWrite}
                                                isDisabled={true}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </Card.Header>
                        </Card>
                        <Card>
                            <Card.Header className='accordion-header edit-user-div'>
                                <Accordion.Toggle as={Button} variant='link' eventKey='6'>
                                    <FontAwesomeIcon icon={faCircle} /> {SECURABLE_NAMES.PostChatSurvey}
                                </Accordion.Toggle>
                                <div className='d-flex align-items-center my-2'>
                                    <div className='col-sm-7'>
                                        <div className='form-check form-switch form-check-custom form-check-solid'>
                                            <ToggleComponent
                                                toggleId='postChatSurveyClaimRead'
                                                toggleTagging='Read'
                                                toggleChange={setPostChatSurveyRead}
                                                toggleDefaultValue={postChatSurveyRead}
                                                isDisabled={true}
                                            />
                                        </div>
                                    </div>
                                    <div className='col'>
                                        <div className='form-check form-switch form-check-custom form-check-solid'>
                                            <ToggleComponent
                                                toggleId='postChatSurveyClaimWrite'
                                                toggleTagging='Write'
                                                toggleChange={setPostChatSurveyWrite}
                                                toggleDefaultValue={postChatSurveyWrite}
                                                isDisabled={true}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </Card.Header>
                        </Card>
                        <Card>
                            <Card.Header className='accordion-header edit-user-div'>
                                <Accordion.Toggle as={Button} variant='link' eventKey='7'>
                                    <FontAwesomeIcon icon={faCircle} /> {SECURABLE_NAMES.StaffPerformance}
                                </Accordion.Toggle>
                                <div className='d-flex align-items-center my-2'>
                                    <div className='col-sm-7'>
                                        <div className='form-check form-switch form-check-custom form-check-solid'>
                                            <ToggleComponent
                                                toggleId='staffPerformanceClaimRead'
                                                toggleTagging='Read'
                                                toggleChange={onChangeStaffPerformanceRead}
                                                toggleDefaultValue={staffPerformanceRead}
                                                isDisabled={true}
                                            />
                                        </div>
                                    </div>
                                    <div className='col'>
                                        <div className='form-check form-switch form-check-custom form-check-solid'>
                                            <ToggleComponent
                                                toggleId='staffPerformanceClaimWrite'
                                                toggleTagging='Write'
                                                toggleChange={onChangeStaffPerformanceWrite}
                                                toggleDefaultValue={staffPerformanceWrite}
                                                isDisabled={true}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </Card.Header>

                            <Accordion.Collapse eventKey='7'>
								<Card.Body className='accordion-body edit-user-div' style={CardBodyEditStyles}>
									<div className='row mb-3'>
										<div className='d-flex align-items-center my-2'>
											<div className='col-sm-10'>
												<div className='form-label-sm'>{SECURABLE_NAMES.CommunicationReviewPeriod}</div>
											</div>
											<div className='col-sm-1'>
												<div className='form-check form-switch form-check-custom form-check-solid'>
													<ToggleComponent
														toggleId='communicationReviewPeriodClaimRead'
														toggleTagging='Read'
														toggleChange={onChangeCommunicationReviewPeriodRead}
														toggleDefaultValue={communicationReviewPeriodRead}
														isDisabled={true}
													/>
												</div>
											</div>
											<div className='col'>
												<div className='form-check form-switch form-check-custom form-check-solid'>
													<ToggleComponent
														toggleId='communicationReviewPeriodClaimWrite'
														toggleTagging='Write'
														toggleChange={onChangeCommunicationReviewPeriodWrite}
														toggleDefaultValue={communicationReviewPeriodWrite}
														isDisabled={true}
													/>
												</div>
											</div>
										</div>
									</div>

								</Card.Body>
							</Accordion.Collapse>

                        </Card>
                    </Accordion>
                </Card.Body>
            </Accordion.Collapse>
        </>
    )
}

export default SystemSecurableObjects