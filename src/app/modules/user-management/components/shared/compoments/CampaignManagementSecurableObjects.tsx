import { faCircle, faCommentsDollar } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from 'react';
import { Accordion, Button, Card } from 'react-bootstrap';
import { MainModuleModel } from '../../../models/MainModuleModel';
import { SECURABLE_NAMES } from '../../constants/SecurableNames';
import ToggleComponent from './ToggleComponent';
interface Props {
  CardHeaderEditStyles: any,
  CardBodyEditStyles: any,
  SecurableObjects?: Array<MainModuleModel>,
}
const CampaignManagementSecurableObjects = ({ CardHeaderEditStyles, CardBodyEditStyles, SecurableObjects }: Props) => {
  //Campaign
  const [campaignRead, setCampaignRead] = useState(false);
  const [campaignWrite, setCampaignWrite] = useState(false);

  // Campaign	CampaignSetting
  const [agentForTaggingRead, setAgentForTaggingRead] = useState(false);
  const [agentForTaggingWrite, setAgentForTaggingWrite] = useState(false);
  const [customEventSettingWrite, setCustomEventSettingWrite] = useState(false);
  const [customEventSettingRead, setCustomEventSettingRead] = useState(false);
  const [campaignSettingRead, setCampaignSettingRead] = useState(false);
  const [campaignSettingWrite, setCampaignSettingWrite] = useState(false);
  const [searchGoalSettingRead, setSearchGoalSettingRead] = useState(false);
  const [searchGoalSettingWrite, setSearchGoalSettingWrite] = useState(false);
  const [searchAutoTaggingRead, setSearchAutoTaggingRead] = useState(false);
  const [searchAutoTaggingWrite, setSearchAutoTaggingWrite] = useState(false);
  const [updateAutoTaggingRead, setUpdateAutoTaggingRead] = useState(false);
  const [viewAutoTaggingRead, setViewAutoTaggingRead] = useState(false);
  const [viewAutoTaggingWrite, setViewAutoTaggingWrite] = useState(false);
  const [viewGoalSettingRead, setViewGoalSettingRead] = useState(false);
  const [viewGoalSettingWrite, setViewGoalSettingWrite] = useState(false);
  const [viewIncentiveSettingRead, setViewIncentiveSettingRead] = useState(false);
  const [viewIncentiveSettingWrite, setViewIncentiveSettingWrite] = useState(false);
  const [incentiveGoalSettingRead, setIncentiveGoalSettingRead] = useState(false);
  const [incentiveGoalSettingWrite, setIncentiveGoalSettingWrite] = useState(false);
  const [updateIncentiveSettingRead, setUpdateIncentiveSettingRead] = useState(false);
  const [updateIncentiveSettingWrite, setUpdateIncentiveSettingWrite] = useState(false);
  const [updateAutoTaggingWrite, setUpdateAutoTaggingWrite] = useState(false);
  const [updateGoalSettingRead, setUpdateGoalSettingRead] = useState(false);
  const [updateGoalSettingWrite, setUpdateGoalSettingWrite] = useState(false);

  // Manage Telegram Bot
  const [viewManageTelegramBotRead, setViewManageTelegramBotRead] = useState(false);
  const [viewManageTelegramBotWrite, setViewManageTelegramBotWrite] = useState(false);
  const [telegramBotRead, setTelegramBotRead] = useState(false);
  const [telegramBotWrite, setTelegramBotWrite] = useState(false);
  const [updateManageTelegramBotRead, setUpdateManageTelegramBotRead] = useState(false);
  const [updateManageTelegramBotWrite, setUpdateManageTelegramBotWrite] = useState(false);

  // Manage Campaign
  const [createCampaignRead, setCreateCampaignRead] = useState(false);
  const [createCampaignWrite, setCreateCampaignWrite] = useState(false);
  const [editCampaignRead, setEditCampaignRead] = useState(false);
  const [editCampaignWrite, setEditCampaignWrite] = useState(false);
  const [manageCampaignRead, setManageCampaignRead] = useState(false);
  const [manageCampaignWrite, setManageCampaignWrite] = useState(false);
  const [searchCampaignRead, setSearchCampaignRead] = useState(false);
  const [searchCampaignWrite, setSearchCampaignWrite] = useState(false);
  const [viewCampaignRead, setViewCampaignRead] = useState(false);
  const [viewCampaignWrite, setViewCampaignWrite] = useState(false);
  const [holdCampaignRead, setHoldCampaignRead] = useState(false);
  const [holdCampaignWrite, setHoldCampaignWrite] = useState(false);

  // Campaign	ManageJourney
  const [createJourneyRead, setCreateJourneyRead] = useState<boolean>(false);
  const [createJourneyWrite, setCreateJourneyWrite] = useState<boolean>(false);
  const [editJourneyRead, setEditJourneyRead] = useState<boolean>(false);
  const [editJourneyWrite, setEditJourneyWrite] = useState<boolean>(false);
  const [manageJourneyRead, setManageJourneyRead] = useState<boolean>(false);
  const [manageJourneyWrite, setManageJourneyWrite] = useState<boolean>(false);
  const [searchJourneyRead, setSearchJourneyRead] = useState<boolean>(false);
  const [searchJourneyWrite, setSearchJourneyWrite] = useState<boolean>(false);
  const [viewJourneyRead, setViewJourneyRead] = useState<boolean>(false);
  const [viewJourneyWrite, setViewJourneyWrite] = useState<boolean>(false);

  // Broadcast 
  const [broadcastRead, setBroadcastRead] = useState<boolean>(false);
  const [broadcastWrite, setBroadcastWrite] = useState<boolean>(false);

  let campaignClaimRead = document.getElementById('campaignClaimRead') as HTMLInputElement;
  let campaignClaimWrite = document.getElementById('campaignClaimWrite') as HTMLInputElement;
  let campaignSettingClaimRead = document.getElementById('campaignSettingClaimRead') as HTMLInputElement;
  let campaignSettingClaimWrite = document.getElementById('campaignSettingClaimWrite') as HTMLInputElement;
  let manageCampaignClaimRead = document.getElementById('manageCampaignClaimRead') as HTMLInputElement;
  let manageCampaignClaimWrite = document.getElementById('manageCampaignClaimWrite') as HTMLInputElement;
  let manageJourneyClaimRead = document.getElementById('manageJourneyClaimRead') as HTMLInputElement;
  let manageJourneyClaimWrite = document.getElementById('manageJourneyClaimWrite') as HTMLInputElement;

  let agentForTaggingClaimRead = document.getElementById('agentForTaggingClaimRead') as HTMLInputElement;
  let agentForTaggingClaimWrite = document.getElementById('agentForTaggingClaimWrite') as HTMLInputElement;
  let customEventSettingClaimRead = document.getElementById('customEventSettingClaimRead') as HTMLInputElement;
  let customEventSettingClaimWrite = document.getElementById('customEventSettingClaimWrite') as HTMLInputElement;
  let searchAutoTaggingClaimRead = document.getElementById('searchAutoTaggingClaimRead') as HTMLInputElement;
  let searchAutoTaggingClaimWrite = document.getElementById('searchAutoTaggingClaimWrite') as HTMLInputElement;
  let updateAutoTaggingClaimRead = document.getElementById('updateAutoTaggingClaimRead') as HTMLInputElement;
  let updateAutoTaggingClaimWrite = document.getElementById('updateAutoTaggingClaimWrite') as HTMLInputElement;
  let viewAutoTaggingClaimRead = document.getElementById('viewAutoTaggingClaimRead') as HTMLInputElement;
  let viewAutoTaggingClaimWrite = document.getElementById('viewAutoTaggingClaimWrite') as HTMLInputElement;
  let incentiveGoalSettingClaimRead = document.getElementById('incentiveGoalSettingClaimRead') as HTMLInputElement;
  let incentiveGoalSettingClaimWrite = document.getElementById('incentiveGoalSettingClaimWrite') as HTMLInputElement;
  let updateIncentiveSettingClaimRead = document.getElementById('updateIncentiveSettingClaimRead') as HTMLInputElement;
  let updateIncentiveSettingClaimWrite = document.getElementById('updateIncentiveSettingClaimWrite') as HTMLInputElement;
  let viewIncentiveSettingClaimRead = document.getElementById('viewIncentiveSettingClaimRead') as HTMLInputElement;
  let viewIncentiveSettingClaimWrite = document.getElementById('viewIncentiveSettingClaimWrite') as HTMLInputElement;
  let searchGoalSettingClaimRead = document.getElementById('searchGoalSettingClaimRead') as HTMLInputElement;
  let searchGoalSettingClaimWrite = document.getElementById('searchGoalSettingClaimWrite') as HTMLInputElement;
  let updateGoalSettingClaimRead = document.getElementById('updateGoalSettingClaimRead') as HTMLInputElement;
  let updateGoalSettingClaimWrite = document.getElementById('updateGoalSettingClaimWrite') as HTMLInputElement;
  let viewGoalSettingClaimRead = document.getElementById('viewGoalSettingClaimRead') as HTMLInputElement;
  let viewGoalSettingClaimWrite = document.getElementById('viewGoalSettingClaimWrite') as HTMLInputElement;

  // Manage telegram bot
  let telegramBotClaimRead = document.getElementById('telegramBotClaimRead') as HTMLInputElement;
  let telegramBotClaimWrite = document.getElementById('telegramBotClaimWrite') as HTMLInputElement;
  let updateTelegramBotClaimRead = document.getElementById('updateTelegramBotClaimRead') as HTMLInputElement;
  let updateTelegramBotClaimWrite = document.getElementById('updateTelegramBotClaimWrite') as HTMLInputElement;
  let viewTelegramBotClaimRead = document.getElementById('viewTelegramBotClaimRead') as HTMLInputElement;
  let viewTelegramBotClaimWrite = document.getElementById('viewTelegramBotClaimWrite') as HTMLInputElement;

  let searchCampaignClaimRead = document.getElementById('searchCampaignClaimRead') as HTMLInputElement;
  let searchCampaignClaimWrite = document.getElementById('searchCampaignClaimWrite') as HTMLInputElement;
  let createCampaignClaimRead = document.getElementById('createCampaignClaimRead') as HTMLInputElement;
  let createCampaignClaimWrite = document.getElementById('createCampaignClaimWrite') as HTMLInputElement;
  let editCampaignClaimRead = document.getElementById('editCampaignClaimRead') as HTMLInputElement;
  let editCampaignClaimWrite = document.getElementById('editCampaignClaimWrite') as HTMLInputElement;
  let viewCampaignClaimRead = document.getElementById('viewCampaignClaimRead') as HTMLInputElement;
  let viewCampaignClaimWrite = document.getElementById('viewCampaignClaimWrite') as HTMLInputElement;
  let holdCampaignClaimRead = document.getElementById('holdCampaignClaimRead') as HTMLInputElement;
  let holdCampaignClaimWrite = document.getElementById('holdCampaignClaimWrite') as HTMLInputElement;

  let searchJourneyClaimRead = document.getElementById('searchJourneyClaimRead') as HTMLInputElement;
  let searchJourneyClaimWrite = document.getElementById('searchJourneyClaimWrite') as HTMLInputElement;
  let createJourneyClaimRead = document.getElementById('createJourneyClaimRead') as HTMLInputElement;
  let createJourneyClaimWrite = document.getElementById('createJourneyClaimWrite') as HTMLInputElement;
  let editJourneyClaimRead = document.getElementById('editJourneyClaimRead') as HTMLInputElement;
  let editJourneyClaimWrite = document.getElementById('editJourneyClaimWrite') as HTMLInputElement;
  let viewJourneyClaimRead = document.getElementById('viewJourneyClaimRead') as HTMLInputElement;
  let viewJourneyClaimWrite = document.getElementById('viewJourneyClaimWrite') as HTMLInputElement;

  // Broadcast
  let broadcastClaimRead = document.getElementById('broadcastClaimRead') as HTMLInputElement;
  let broadcastClaimWrite = document.getElementById('broadcastClaimWrite') as HTMLInputElement;
  
  useEffect(() => {
    if (!SecurableObjects) return
    let campaignManagementClaims = SecurableObjects?.find((obj) => obj.description === SECURABLE_NAMES.Campaign);
    if (!campaignManagementClaims) return
    let { read, write, subMainModuleDetails }: any = campaignManagementClaims;

    campaignClaimRead.checked = read
    setCampaignRead(read)
    campaignClaimWrite.checked = write
    setCampaignWrite(write)

    if (!subMainModuleDetails) return

    campaignSettingsSubModules(subMainModuleDetails)
    manageCampaignSubModules(subMainModuleDetails)
    manageJourneySubModules(subMainModuleDetails);
    broadcastSubModules(subMainModuleDetails)
    changeCampaignStatus();

    return () => { }
  }, [SecurableObjects])



  const campaignSettingsSubModules = (subMainModuleDetails: any) => {
    //Campaign Settings
    const { read: campaignSettingsRead, write: campaignSettingsWrite, subModuleDetails: campaignSettingSubModule } = subMainModuleDetails?.find((obj: any) => obj.description === SECURABLE_NAMES.CampaignSetting) ?? { read: false, write: false, subModuleDetails: [] };
    campaignSettingClaimRead.checked = campaignSettingsRead;
    campaignSettingClaimWrite.checked = campaignSettingsWrite;

    const { read: searchGoalRead, write: searchGoalWrite } = campaignSettingSubModule?.find((obj: any) => obj.description === SECURABLE_NAMES.SearchGoalSetting) ?? { read: false, write: false };
    searchGoalSettingClaimRead.checked = searchGoalRead;
    searchGoalSettingClaimWrite.checked = searchGoalWrite;

    const { read: updateGoalRead, write: updateGoalWrite } = campaignSettingSubModule?.find((obj: any) => obj.description === SECURABLE_NAMES.UpdateGoalSetting) ?? { read: false, write: false };
    updateGoalSettingClaimRead.checked = updateGoalRead;
    updateGoalSettingClaimWrite.checked = updateGoalWrite;

    const { read: viewGoalRead, write: viewGoalWrite } = campaignSettingSubModule?.find((obj: any) => obj.description === SECURABLE_NAMES.ViewGoalSetting) ?? { read: false, write: false };
    viewGoalSettingClaimRead.checked = viewGoalRead;
    viewGoalSettingClaimWrite.checked = viewGoalWrite;

    const { read: searchAutoTagRead, write: searchAutoTagWrite } = campaignSettingSubModule?.find((obj: any) => obj.description === SECURABLE_NAMES.SearchAutoTagging) ?? { read: false, write: false };
    searchAutoTaggingClaimRead.checked = searchAutoTagRead;
    searchAutoTaggingClaimWrite.checked = searchAutoTagWrite;

    const { read: updateAutoTagRead, write: updateAutoTagWrite } = campaignSettingSubModule?.find((obj: any) => obj.description === SECURABLE_NAMES.UpdateAutoTagging) ?? { read: false, write: false };
    updateAutoTaggingClaimRead.checked = updateAutoTagRead;
    updateAutoTaggingClaimWrite.checked = updateAutoTagWrite;

    const { read: viewAutoTagRead, write: viewAutoTagWrite } = campaignSettingSubModule?.find((obj: any) => obj.description === SECURABLE_NAMES.ViewAutoTagging) ?? { read: false, write: false };
    viewAutoTaggingClaimRead.checked = viewAutoTagRead;
    viewAutoTaggingClaimWrite.checked = viewAutoTagWrite;

    const { read: searchIncentiveRead, write: searchIncentiveWrite } = campaignSettingSubModule?.find((obj: any) => obj.description === SECURABLE_NAMES.IncentiveGoalSetting) ?? { read: false, write: false };
    incentiveGoalSettingClaimRead.checked = searchIncentiveRead;
    incentiveGoalSettingClaimWrite.checked = searchIncentiveWrite;

    const { read: updateIncentiveRead, write: updateIncentiveWrite } = campaignSettingSubModule?.find((obj: any) => obj.description === SECURABLE_NAMES.UpdateIncentiveSetting) ?? { read: false, write: false };
    updateIncentiveSettingClaimRead.checked = updateIncentiveRead;
    updateIncentiveSettingClaimWrite.checked = updateIncentiveWrite;

    const { read: viewIncentiveRead, write: viewIncentiveWrite } = campaignSettingSubModule?.find((obj: any) => obj.description === SECURABLE_NAMES.ViewIncentiveSetting) ?? { read: false, write: false };
    viewIncentiveSettingClaimRead.checked = viewIncentiveRead;
    viewIncentiveSettingClaimWrite.checked = viewIncentiveWrite;

    const { read: agentTaggingRead, write: agentTaggingWrite } = campaignSettingSubModule?.find((obj: any) => obj.description === SECURABLE_NAMES.AgentForTagging) ?? { read: false, write: false };
    agentForTaggingClaimRead.checked = agentTaggingRead;
    agentForTaggingClaimWrite.checked = agentTaggingWrite;

    const { read: customEventRead, write: customEventWrite } = campaignSettingSubModule?.find((obj: any) => obj.description === SECURABLE_NAMES.CustomEventSetting) ?? { read: false, write: false };
    customEventSettingClaimRead.checked = customEventRead;
    customEventSettingClaimWrite.checked = customEventWrite;

    // Manage telegram bot
    const { read: searchTelegramBotRead, write: searchTelegramBotWrite } = campaignSettingSubModule?.find((obj: any) => obj.description === SECURABLE_NAMES.SearchTelegramBot) ?? { read: false, write: false };
    telegramBotClaimRead.checked = searchTelegramBotRead;
    telegramBotClaimWrite.checked = searchTelegramBotWrite;

    const { read: updateTelegramBotRead, write: updateTelegramBotWrite } = campaignSettingSubModule?.find((obj: any) => obj.description === SECURABLE_NAMES.UpdateTelegramBot) ?? { read: false, write: false };
    updateTelegramBotClaimRead.checked = updateTelegramBotRead;
    updateTelegramBotClaimWrite.checked = updateTelegramBotWrite;

    const { read: viewTelegramBotRead, write: viewTelegramBotWrite } = campaignSettingSubModule?.find((obj: any) => obj.description === SECURABLE_NAMES.ViewTelegramBot) ?? { read: false, write: false };
    viewTelegramBotClaimRead.checked = viewTelegramBotRead;
    viewTelegramBotClaimWrite.checked = viewTelegramBotWrite;
  }

  const manageCampaignSubModules = (subMainModuleDetails: any) => {
    //Manage Campaign
    const { read: manageCampaignRead, write: manageCampaignWrite, subModuleDetails: manageCampaignSubModule } = subMainModuleDetails?.find((obj: any) => obj.description === SECURABLE_NAMES.ManageCampaign) ?? { read: false, write: false, subModuleDetails: [] };
    manageCampaignClaimRead.checked = manageCampaignRead;
    manageCampaignClaimWrite.checked = manageCampaignWrite;

    const { read: searchCampaignRead, write: searchCampaignWrite } = manageCampaignSubModule?.find((obj: any) => obj.description === SECURABLE_NAMES.SearchCampaign) ?? { read: false, write: false };
    searchCampaignClaimRead.checked = searchCampaignRead;
    searchCampaignClaimWrite.checked = searchCampaignWrite;

    const { read: createCampaignRead, write: createCampaignWrite } = manageCampaignSubModule?.find((obj: any) => obj.description === SECURABLE_NAMES.CreateCampaign) ?? { read: false, write: false };
    createCampaignClaimRead.checked = createCampaignRead;
    createCampaignClaimWrite.checked = createCampaignWrite;

    const { read: editCampaignRead, write: editCampaignWrite } = manageCampaignSubModule?.find((obj: any) => obj.description === SECURABLE_NAMES.EditCampaign) ?? { read: false, write: false };
    editCampaignClaimRead.checked = editCampaignRead;
    editCampaignClaimWrite.checked = editCampaignWrite;


    const { read: viewCampaignRead, write: viewCampaignWrite } = manageCampaignSubModule?.find((obj: any) => obj.description === SECURABLE_NAMES.ViewCampaign) ?? { read: false, write: false };
    viewCampaignClaimRead.checked = viewCampaignRead;
    viewCampaignClaimWrite.checked = viewCampaignWrite;

    const { read: holdCampaignRead, write: holdCampaignWrite } = manageCampaignSubModule?.find((obj: any) => obj.description === SECURABLE_NAMES.HoldCampaign) ?? { read: false, write: false };
    holdCampaignClaimRead.checked = holdCampaignRead;
    holdCampaignClaimWrite.checked = holdCampaignWrite;

  }

  const manageJourneySubModules = (subMainModuleDetails: any) => {
    const { read: manageJourneyRead, write: manageJourneyWrite, subModuleDetails: manageJourneySubModule } = subMainModuleDetails?.find((obj: any) => obj.description === SECURABLE_NAMES.ManageJourney) ?? { read: false, write: false, subModuleDetails: [] };
    manageJourneyClaimRead.checked = manageJourneyRead;
    manageJourneyClaimWrite.checked = manageJourneyWrite;

    const { read: searchJourneyRead, write: searchJourneyWrite } = manageJourneySubModule?.find((obj: any) => obj.description === SECURABLE_NAMES.SearchJourney) ?? { read: false, write: false };
    searchJourneyClaimRead.checked = searchJourneyRead;
    searchJourneyClaimWrite.checked = searchJourneyWrite;

    const { read: createJourneyRead, write: createJourneyWrite } = manageJourneySubModule?.find((obj: any) => obj.description === SECURABLE_NAMES.CreateJourney) ?? { read: false, write: false };
    createJourneyClaimRead.checked = createJourneyRead;
    createJourneyClaimWrite.checked = createJourneyWrite;

    const { read: editJourneyRead, write: editJourneyWrite } = manageJourneySubModule?.find((obj: any) => obj.description === SECURABLE_NAMES.EditJourney) ?? { read: false, write: false };
    editJourneyClaimRead.checked = editJourneyRead;
    editJourneyClaimWrite.checked = editJourneyWrite;

    const { read: viewJourneyRead, write: viewJourneyWrite } = manageJourneySubModule?.find((obj: any) => obj.description === SECURABLE_NAMES.ViewJourney) ?? { read: false, write: false };
    viewJourneyClaimRead.checked = viewJourneyRead;
    viewJourneyClaimWrite.checked = viewJourneyWrite;
  }

  const broadcastSubModules = (subMainModuleDetails: any) => {    
    const { read: broadCastRead, write: broadcastWrite } = subMainModuleDetails?.find((obj: any) => obj.description === SECURABLE_NAMES.Broadcast) ?? { read: false, write: false };
    broadcastClaimRead.checked = broadCastRead;
    broadcastClaimWrite.checked = broadcastWrite;
  }


  //Campaign
  function onChangeCampaignWrite(val: boolean) {
    setCampaignWrite(val);
    changeCampaignStatus();
  }

  function onChangeCampaignRead(val: boolean) {
    setCampaignRead(val);
    changeCampaignStatus();
  }

  function changeCampaignStatus() {


    if (campaignClaimRead.checked === true && campaignClaimWrite.checked === true) {
      campaignSettingClaimWrite.disabled = false;
      campaignSettingClaimRead.disabled = false;
      manageCampaignClaimRead.disabled = false;
      manageCampaignClaimWrite.disabled = false;
      manageJourneyClaimWrite.disabled = false;
      manageJourneyClaimRead.disabled = false;
      broadcastClaimRead.disabled = false;
      broadcastClaimWrite.disabled = false;

      setCampaignSettingRead(false);
      setCampaignSettingWrite(false);
      setManageCampaignRead(false);
      setManageCampaignWrite(false);
      setManageJourneyRead(false);
      setManageJourneyWrite(false);
      setBroadcastRead(false)
      setBroadcastWrite(false)
    } else if (campaignClaimRead.checked === true && campaignClaimWrite.checked === false) {
      campaignSettingClaimRead.disabled = false;
      campaignSettingClaimWrite.disabled = true;
      manageCampaignClaimWrite.disabled = true;
      manageCampaignClaimRead.disabled = false;
      manageJourneyClaimRead.disabled = false;
      manageJourneyClaimWrite.disabled = true;
      campaignSettingClaimWrite.checked = false;
      manageCampaignClaimWrite.checked = false;
      manageJourneyClaimWrite.checked = false;
      broadcastClaimRead.disabled = false;
      broadcastClaimWrite.disabled = true;
      broadcastClaimWrite.checked = false;

      setCampaignSettingWrite(false);
      setManageCampaignWrite(false);
      setManageJourneyWrite(false);
      setBroadcastWrite(false)
    } else if (campaignClaimRead.checked === false && campaignClaimWrite.checked === true) {
      campaignSettingClaimWrite.disabled = false;
      campaignSettingClaimRead.disabled = false;
      manageCampaignClaimRead.disabled = false;
      manageCampaignClaimWrite.disabled = false;
      manageJourneyClaimRead.disabled = false;
      manageJourneyClaimWrite.disabled = false;
      broadcastClaimRead.disabled = false;
      broadcastClaimWrite.disabled = false;

      setCampaignSettingRead(false);
      setCampaignSettingWrite(false);
      setManageCampaignWrite(false);
      setManageCampaignRead(false);
      setManageJourneyRead(false);
      setManageJourneyWrite(false);
      setBroadcastRead(false)
      setBroadcastWrite(false)
    } else if (campaignClaimRead.checked === false && campaignClaimWrite.checked === false) {
      campaignSettingClaimRead.checked = false;
      campaignSettingClaimWrite.checked = false;
      campaignSettingClaimRead.disabled = true;
      campaignSettingClaimWrite.disabled = true;
      manageCampaignClaimRead.disabled = true;
      manageCampaignClaimWrite.disabled = true;
      manageJourneyClaimRead.disabled = true;
      manageJourneyClaimWrite.disabled = true;
      manageCampaignClaimRead.checked = false;
      manageCampaignClaimWrite.checked = false;
      manageJourneyClaimRead.checked = false;
      manageJourneyClaimWrite.checked = false;
      broadcastClaimRead.disabled = true;
      broadcastClaimWrite.disabled = true;
      broadcastClaimRead.checked = false;
      broadcastClaimWrite.checked = false;

      setCampaignSettingRead(false);
      setCampaignSettingWrite(false);
      setManageCampaignRead(false);
      setManageCampaignWrite(false);
      setManageJourneyRead(false);
      setManageJourneyWrite(false);
      setBroadcastRead(false)
      setBroadcastWrite(false)
    }
    changeCampaignSettingStatus();
    changeManageCampaignStatus();
    changeManageJourneyStatus();
  }
  // Campaign ManageJourney
  function onChangeManageJourneyRead(val: boolean) {
    setManageJourneyRead(val);
    changeManageJourneyStatus();
  }

  function onChangeManageJourneyWrite(val: boolean) {
    setManageJourneyWrite(val);
    changeManageJourneyStatus();
  }

  function changeCampaignSettingStatus() {
    if (campaignSettingClaimRead.checked === true && campaignSettingClaimWrite.checked === true) {
      agentForTaggingClaimRead.disabled = false;
      agentForTaggingClaimWrite.disabled = false;
      customEventSettingClaimRead.disabled = false;
      customEventSettingClaimWrite.disabled = false;

      searchAutoTaggingClaimRead.disabled = false;
      searchAutoTaggingClaimWrite.disabled = false;
      updateAutoTaggingClaimRead.disabled = false;
      updateAutoTaggingClaimWrite.disabled = false;
      viewAutoTaggingClaimRead.disabled = false;
      viewAutoTaggingClaimWrite.disabled = false;
      incentiveGoalSettingClaimRead.disabled = false;
      incentiveGoalSettingClaimWrite.disabled = false;
      updateIncentiveSettingClaimRead.disabled = false;
      updateIncentiveSettingClaimWrite.disabled = false;
      viewIncentiveSettingClaimRead.disabled = false;
      viewIncentiveSettingClaimWrite.disabled = false;
      searchGoalSettingClaimRead.disabled = false;
      searchGoalSettingClaimWrite.disabled = false;
      updateGoalSettingClaimRead.disabled = false;
      updateGoalSettingClaimWrite.disabled = false;
      viewGoalSettingClaimRead.disabled = false;
      viewGoalSettingClaimWrite.disabled = false;

      telegramBotClaimRead.disabled = false;
      telegramBotClaimWrite.disabled = false;
      updateTelegramBotClaimRead.disabled = false;
      updateTelegramBotClaimWrite.disabled = false;
      viewTelegramBotClaimRead.disabled = false;
      viewTelegramBotClaimWrite.disabled = false;

      setAgentForTaggingRead(false);
      setAgentForTaggingWrite(false);
      setCustomEventSettingRead(false);
      setCustomEventSettingWrite(false);
      setSearchGoalSettingRead(false);
      setSearchGoalSettingWrite(false);
      setUpdateGoalSettingRead(false);
      setUpdateGoalSettingWrite(false);
      setViewGoalSettingRead(false);
      setViewGoalSettingWrite(false);
      setSearchAutoTaggingWrite(false);
      setSearchAutoTaggingRead(false);
      setUpdateAutoTaggingRead(false);
      setUpdateAutoTaggingWrite(false);
      setViewAutoTaggingRead(false);
      setViewAutoTaggingWrite(false);
      setIncentiveGoalSettingRead(false);
      setIncentiveGoalSettingWrite(false);
      setUpdateIncentiveSettingRead(false);
      setUpdateIncentiveSettingWrite(false);
      setViewIncentiveSettingRead(false);
      setViewIncentiveSettingWrite(false);

      setTelegramBotRead(false);
      setTelegramBotWrite(false);
      setUpdateManageTelegramBotRead(false);
      setUpdateManageTelegramBotWrite(false);
      setViewManageTelegramBotRead(false);
      setViewManageTelegramBotWrite(false);

    } else if (campaignSettingClaimRead.checked === true && campaignSettingClaimWrite.checked === false) {
      agentForTaggingClaimRead.disabled = false;
      agentForTaggingClaimWrite.disabled = true;
      updateGoalSettingClaimRead.disabled = false;
      updateGoalSettingClaimWrite.disabled = true;
      viewGoalSettingClaimRead.disabled = false;
      viewGoalSettingClaimWrite.disabled = true;
      searchAutoTaggingClaimRead.disabled = false;
      searchAutoTaggingClaimWrite.disabled = true;
      updateAutoTaggingClaimRead.disabled = false;
      updateAutoTaggingClaimWrite.disabled = true;
      viewAutoTaggingClaimRead.disabled = false;
      viewAutoTaggingClaimWrite.disabled = true;
      incentiveGoalSettingClaimRead.disabled = false;
      incentiveGoalSettingClaimWrite.disabled = true;
      updateIncentiveSettingClaimRead.disabled = false;
      updateIncentiveSettingClaimWrite.disabled = true;
      viewIncentiveSettingClaimRead.disabled = false;
      viewIncentiveSettingClaimWrite.disabled = true;

      telegramBotClaimRead.disabled = false;
      telegramBotClaimWrite.disabled = true;
      updateTelegramBotClaimRead.disabled = false;
      updateTelegramBotClaimWrite.disabled = true;
      viewTelegramBotClaimRead.disabled = false;
      viewTelegramBotClaimWrite.disabled = true;

      customEventSettingClaimRead.disabled = false;
      customEventSettingClaimWrite.disabled = true;
      searchGoalSettingClaimWrite.checked = false;
      updateGoalSettingClaimWrite.checked = false;
      viewGoalSettingClaimWrite.checked = false;
      searchAutoTaggingClaimWrite.checked = false;
      updateAutoTaggingClaimWrite.checked = false;
      viewAutoTaggingClaimWrite.checked = false;
      incentiveGoalSettingClaimWrite.checked = false;
      updateIncentiveSettingClaimWrite.checked = false;
      viewIncentiveSettingClaimWrite.checked = false;
      agentForTaggingClaimWrite.checked = false;
      customEventSettingClaimWrite.checked = false;
      searchGoalSettingClaimRead.disabled = false;
      searchGoalSettingClaimWrite.disabled = true;

      telegramBotClaimWrite.checked = false;
      updateTelegramBotClaimWrite.checked = false;
      viewTelegramBotClaimWrite.checked = false;


      setSearchGoalSettingWrite(false);
      setUpdateGoalSettingWrite(false);
      setViewGoalSettingWrite(false);
      setSearchAutoTaggingWrite(false);
      setUpdateAutoTaggingWrite(false);
      setViewAutoTaggingWrite(false);
      setIncentiveGoalSettingWrite(false);
      setUpdateIncentiveSettingWrite(false);
      setViewIncentiveSettingWrite(false);
      setAgentForTaggingWrite(false);
      setCustomEventSettingWrite(false);

      setTelegramBotWrite(false);
      setUpdateManageTelegramBotWrite(false);
      setViewManageTelegramBotWrite(false);
    } else if (campaignSettingClaimRead.checked === false && campaignSettingClaimWrite.checked === true) {
      agentForTaggingClaimRead.disabled = false;
      agentForTaggingClaimWrite.disabled = false;
      customEventSettingClaimRead.disabled = false;
      customEventSettingClaimWrite.disabled = false;
      searchGoalSettingClaimRead.disabled = false;
      searchGoalSettingClaimWrite.disabled = false;
      updateGoalSettingClaimRead.disabled = false;
      updateGoalSettingClaimWrite.disabled = false;
      viewGoalSettingClaimRead.disabled = false;
      viewGoalSettingClaimWrite.disabled = false;
      searchAutoTaggingClaimRead.disabled = false;
      searchAutoTaggingClaimWrite.disabled = false;
      updateAutoTaggingClaimRead.disabled = false;
      updateAutoTaggingClaimWrite.disabled = false;
      viewAutoTaggingClaimRead.disabled = false;
      viewAutoTaggingClaimWrite.disabled = false;
      incentiveGoalSettingClaimRead.disabled = false;
      incentiveGoalSettingClaimWrite.disabled = false;
      updateIncentiveSettingClaimRead.disabled = false;
      updateIncentiveSettingClaimWrite.disabled = false;
      viewIncentiveSettingClaimRead.disabled = false;
      viewIncentiveSettingClaimWrite.disabled = false;

      telegramBotClaimRead.disabled = false;
      telegramBotClaimWrite.disabled = false;
      updateTelegramBotClaimRead.disabled = false;
      updateTelegramBotClaimWrite.disabled = false;
      viewTelegramBotClaimRead.disabled = false;
      viewTelegramBotClaimWrite.disabled = false;

      setAgentForTaggingRead(false);
      setAgentForTaggingWrite(false);
      setCustomEventSettingRead(false);
      setCustomEventSettingWrite(false);
      setUpdateGoalSettingRead(false);
      setUpdateGoalSettingWrite(false);
      setViewGoalSettingRead(false);
      setViewGoalSettingWrite(false);
      setSearchAutoTaggingRead(false);
      setSearchAutoTaggingWrite(false);
      setUpdateAutoTaggingRead(false);
      setUpdateAutoTaggingWrite(false);
      setViewAutoTaggingRead(false);
      setViewAutoTaggingWrite(false);
      setIncentiveGoalSettingRead(false);
      setIncentiveGoalSettingWrite(false);
      setUpdateIncentiveSettingRead(false);
      setUpdateIncentiveSettingWrite(false);
      setViewIncentiveSettingRead(false);
      setViewIncentiveSettingWrite(false);
      setSearchGoalSettingRead(false);
      setSearchGoalSettingWrite(false);

      setTelegramBotRead(false);
      setTelegramBotWrite(false);
      setUpdateManageTelegramBotRead(false);
      setUpdateManageTelegramBotWrite(false);
      setViewManageTelegramBotRead(false);
      setViewManageTelegramBotWrite(false);
    } else if (campaignSettingClaimRead.checked === false && campaignSettingClaimWrite.checked === false) {
      agentForTaggingClaimRead.checked = false;
      agentForTaggingClaimRead.disabled = true;
      agentForTaggingClaimWrite.checked = false;
      agentForTaggingClaimWrite.disabled = true;
      customEventSettingClaimRead.checked = false;
      customEventSettingClaimRead.disabled = true;
      customEventSettingClaimWrite.checked = false;
      customEventSettingClaimWrite.disabled = true;
      searchGoalSettingClaimRead.checked = false;
      searchGoalSettingClaimRead.disabled = true;
      searchGoalSettingClaimWrite.checked = false;
      searchGoalSettingClaimWrite.disabled = true;
      updateGoalSettingClaimRead.checked = false;
      updateGoalSettingClaimRead.disabled = true;
      updateGoalSettingClaimWrite.checked = false;
      updateGoalSettingClaimWrite.disabled = true;
      viewGoalSettingClaimRead.checked = false;
      viewGoalSettingClaimRead.disabled = true;
      viewGoalSettingClaimWrite.checked = false;
      viewGoalSettingClaimWrite.disabled = true;
      searchAutoTaggingClaimRead.checked = false;
      searchAutoTaggingClaimRead.disabled = true;
      searchAutoTaggingClaimWrite.checked = false;
      searchAutoTaggingClaimWrite.disabled = true;
      updateAutoTaggingClaimRead.checked = false;
      updateAutoTaggingClaimRead.disabled = true;
      updateAutoTaggingClaimWrite.checked = false;
      updateAutoTaggingClaimWrite.disabled = true;
      viewAutoTaggingClaimRead.checked = false;
      viewAutoTaggingClaimRead.disabled = true;
      viewAutoTaggingClaimWrite.checked = false;
      viewAutoTaggingClaimWrite.disabled = true;
      incentiveGoalSettingClaimRead.checked = false;
      incentiveGoalSettingClaimRead.disabled = true;
      incentiveGoalSettingClaimWrite.checked = false;
      incentiveGoalSettingClaimWrite.disabled = true;
      updateIncentiveSettingClaimRead.checked = false;
      updateIncentiveSettingClaimRead.disabled = true;
      updateIncentiveSettingClaimWrite.checked = false;
      updateIncentiveSettingClaimWrite.disabled = true;
      viewIncentiveSettingClaimRead.checked = false;
      viewIncentiveSettingClaimRead.disabled = true;
      viewIncentiveSettingClaimWrite.checked = false;
      viewIncentiveSettingClaimWrite.disabled = true;

      telegramBotClaimRead.checked = false;
      telegramBotClaimRead.disabled = true;
      telegramBotClaimWrite.checked = false;
      telegramBotClaimWrite.disabled = true;
      updateTelegramBotClaimRead.checked = false;
      updateTelegramBotClaimRead.disabled = true;
      updateTelegramBotClaimWrite.checked = false;
      updateTelegramBotClaimWrite.disabled = true;
      viewTelegramBotClaimRead.checked = false;
      viewTelegramBotClaimRead.disabled = true;
      viewTelegramBotClaimWrite.checked = false;
      viewTelegramBotClaimWrite.disabled = true;

      setAgentForTaggingRead(false);
      setAgentForTaggingWrite(false);
      setCustomEventSettingRead(false);
      setCustomEventSettingWrite(false);
      setSearchGoalSettingRead(false);
      setSearchGoalSettingWrite(false);
      setUpdateGoalSettingRead(false);
      setUpdateGoalSettingWrite(false);
      setViewGoalSettingRead(false);
      setViewGoalSettingWrite(false);
      setSearchAutoTaggingRead(false);
      setSearchAutoTaggingWrite(false);
      setUpdateAutoTaggingRead(false);
      setUpdateAutoTaggingWrite(false);
      setViewAutoTaggingRead(false);
      setViewAutoTaggingWrite(false);
      setIncentiveGoalSettingRead(false);
      setIncentiveGoalSettingWrite(false);
      setUpdateIncentiveSettingRead(false);
      setUpdateIncentiveSettingWrite(false);
      setViewIncentiveSettingRead(false);
      setViewIncentiveSettingWrite(false);

      setTelegramBotRead(false);
      setTelegramBotWrite(false);
      setUpdateManageTelegramBotRead(false);
      setUpdateManageTelegramBotWrite(false);
      setViewManageTelegramBotRead(false);
      setViewManageTelegramBotWrite(false);
    }
  }

  // Campaign	CampaignSetting
  function onChangeCampaignSettingRead(val: boolean) {
    setCampaignSettingRead(val);
    changeCampaignSettingStatus();
  }

  function onChangeCampaignSettingWrite(val: boolean) {
    setCampaignSettingWrite(val);
    changeCampaignSettingStatus();
  }



  function onChangeSearchGoalSettingRead(val: boolean) {
    setSearchGoalSettingRead(val);
  }

  function onChangeSearchGoalSettingWrite(val: boolean) {
    setSearchGoalSettingWrite(val);
  }

  function onChangeUpdateGoalSettingRead(val: boolean) {
    setUpdateGoalSettingRead(val);
  }

  function onChangeUpdateGoalSettingWrite(val: boolean) {
    setUpdateGoalSettingWrite(val);
  }

  function onChangeViewGoalSettingRead(val: boolean) {
    setViewGoalSettingRead(val);
  }

  function onChangeViewGoalSettingWrite(val: boolean) {
    setViewGoalSettingWrite(val);
  }

  function onChangeSearchAutoTaggingRead(val: boolean) {
    setSearchAutoTaggingRead(val);
  }

  function onChangeSearchAutoTaggingWrite(val: boolean) {
    setSearchAutoTaggingWrite(val);
  }

  function onChangeUpdateAutoTaggingRead(val: boolean) {
    setUpdateAutoTaggingRead(val);
  }

  function onChangeUpdateAutoTaggingWrite(val: boolean) {
    setUpdateAutoTaggingWrite(val);
  }

  function onChangeIncentiveGoalSettingRead(val: boolean) {
    setIncentiveGoalSettingRead(val);
  }

  function onChangeIncentiveGoalSettingWrite(val: boolean) {
    setIncentiveGoalSettingWrite(val);
  }

  function onChangeUpdateIncentiveSettingRead(val: boolean) {
    setUpdateIncentiveSettingRead(val);
  }

  function onChangeUpdateIncentiveSettingWrite(val: boolean) {
    setUpdateIncentiveSettingWrite(val);
  }

  function onChangeTelegramBotRead(val: boolean) {
    setTelegramBotRead(val);
  }

  function onChangeTelegramBotWrite(val: boolean) {
    setTelegramBotWrite(val);
  }

  function onChangeUpdateTelegramBotRead(val: boolean) {
    setUpdateManageTelegramBotRead(val);
  }

  function onChangeUpdateTelegramBotWrite(val: boolean) {
    setUpdateManageTelegramBotWrite(val);
  }

  function onChangeViewAutoTaggingRead(val: boolean) {
    setViewAutoTaggingRead(val);
  }

  function onChangeViewAutoTaggingWrite(val: boolean) {
    setViewAutoTaggingWrite(val);
  }

  function onChangeViewIncentiveSettingRead(val: boolean) {
    setViewIncentiveSettingRead(val);
  }

  function onChangeViewIncentiveSettingWrite(val: boolean) {
    setViewIncentiveSettingWrite(val);
  }

  function onChangeViewTelegramBotRead(val: boolean) {
    setViewManageTelegramBotRead(val);
  }

  function onChangeViewTelegramBotWrite(val: boolean) {
    setViewManageTelegramBotWrite(val);
  }

  function onChangeAgentForTaggingRead(val: boolean) {
    setAgentForTaggingRead(val);
  }

  function onChangeAgentForTaggingWrite(val: boolean) {
    setAgentForTaggingWrite(val);
  }

  function onChangeCustomEventSettingRead(val: boolean) {
    setCustomEventSettingRead(val);
  }

  function onChangeCustomEventSettingWrite(val: boolean) {
    setCustomEventSettingWrite(val);
  }

  // Campaign	ManageCampaign
  function onChangeManageCampaignRead(val: boolean) {
    setManageCampaignRead(val);
    changeManageCampaignStatus();
  }

  function onChangeManageCampaignWrite(val: boolean) {
    setManageCampaignWrite(val);
    changeManageCampaignStatus();
  }

  function changeManageCampaignStatus() {
    if (manageCampaignClaimRead.checked === true && manageCampaignClaimWrite.checked === true) {
      createCampaignClaimRead.disabled = false;
      createCampaignClaimWrite.disabled = false;
      editCampaignClaimRead.disabled = false;
      editCampaignClaimWrite.disabled = false;
      holdCampaignClaimRead.disabled = false;
      holdCampaignClaimWrite.disabled = false;
      searchCampaignClaimRead.disabled = false;
      searchCampaignClaimWrite.disabled = false;
      viewCampaignClaimRead.disabled = false;
      viewCampaignClaimWrite.disabled = false;

      setSearchCampaignRead(false);
      setSearchCampaignWrite(false);
      setCreateCampaignRead(false);
      setCreateCampaignWrite(false);
      setEditCampaignRead(false);
      setEditCampaignWrite(false);
      setViewCampaignRead(false);
      setViewCampaignWrite(false);
      setHoldCampaignRead(false);
      setHoldCampaignWrite(false);
    } else if (manageCampaignClaimRead.checked === true && manageCampaignClaimWrite.checked === false) {
      createCampaignClaimRead.disabled = false;
      createCampaignClaimWrite.disabled = true;
      createCampaignClaimWrite.checked = false;
      editCampaignClaimRead.disabled = false;
      editCampaignClaimWrite.disabled = true;
      viewCampaignClaimRead.disabled = false;
      viewCampaignClaimWrite.disabled = true;
      holdCampaignClaimRead.disabled = false;
      holdCampaignClaimWrite.disabled = true;

      editCampaignClaimWrite.checked = false;
      viewCampaignClaimWrite.checked = false;
      holdCampaignClaimWrite.checked = false;
      searchCampaignClaimRead.disabled = false;
      searchCampaignClaimWrite.disabled = true;
      searchCampaignClaimWrite.checked = false;

      setSearchCampaignWrite(false);
      setCreateCampaignWrite(false);
      setEditCampaignWrite(false);
      setViewCampaignWrite(false);
      setHoldCampaignWrite(false);
    } else if (manageCampaignClaimRead.checked === false && manageCampaignClaimWrite.checked === true) {
      createCampaignClaimRead.disabled = false;
      createCampaignClaimWrite.disabled = false;
      editCampaignClaimRead.disabled = false;
      editCampaignClaimWrite.disabled = false;
      viewCampaignClaimRead.disabled = false;
      viewCampaignClaimWrite.disabled = false;
      holdCampaignClaimRead.disabled = false;
      holdCampaignClaimWrite.disabled = false;
      searchCampaignClaimRead.disabled = false;
      searchCampaignClaimWrite.disabled = false;

      setSearchCampaignRead(false);
      setSearchCampaignWrite(false);
      setCreateCampaignRead(false);
      setCreateCampaignWrite(false);
      setEditCampaignRead(false);
      setEditCampaignWrite(false);
      setViewCampaignRead(false);
      setViewCampaignWrite(false);
      setHoldCampaignRead(false);
      setHoldCampaignWrite(false);
    } else if (manageCampaignClaimRead.checked === false && manageCampaignClaimWrite.checked === false) {
      searchCampaignClaimRead.disabled = true;
      searchCampaignClaimWrite.disabled = true;
      createCampaignClaimRead.disabled = true;
      createCampaignClaimWrite.disabled = true;
      editCampaignClaimRead.disabled = true;
      editCampaignClaimWrite.disabled = true;
      viewCampaignClaimRead.disabled = true;
      viewCampaignClaimWrite.disabled = true;
      holdCampaignClaimRead.disabled = true;
      holdCampaignClaimWrite.disabled = true;
      searchCampaignClaimRead.checked = false;
      searchCampaignClaimWrite.checked = false;
      createCampaignClaimRead.checked = false;
      createCampaignClaimWrite.checked = false;
      editCampaignClaimRead.checked = false;
      editCampaignClaimWrite.checked = false;
      viewCampaignClaimRead.checked = false;
      viewCampaignClaimWrite.checked = false;
      holdCampaignClaimRead.checked = false;
      holdCampaignClaimWrite.checked = false;

      setSearchCampaignRead(false);
      setSearchCampaignWrite(false);
      setCreateCampaignRead(false);
      setCreateCampaignWrite(false);
      setEditCampaignRead(false);
      setEditCampaignWrite(false);
      setViewCampaignRead(false);
      setViewCampaignWrite(false);
      setHoldCampaignRead(false);
      setHoldCampaignWrite(false);
    }
  }

  function onChangeSearchCampaignRead(val: boolean) {
    setSearchCampaignRead(val);
  }

  function onChangeSearchCampaignWrite(val: boolean) {
    setSearchCampaignWrite(val);
  }

  function onChangeCreateCampaignRead(val: boolean) {
    setCreateCampaignRead(val);
  }

  function onChangecreateCampaignWrite(val: boolean) {
    setCreateCampaignWrite(val);
  }

  function onChangeEditCampaignRead(val: boolean) {
    setEditCampaignRead(val);
  }

  function onChangeEditCampaignWrite(val: boolean) {
    setEditCampaignWrite(val);
  }

  function onChangeViewCampaignRead(val: boolean) {
    setViewCampaignRead(val);
  }

  function onChangeviewCampaignWrite(val: boolean) {
    setViewCampaignWrite(val);
  }

  function onChangeHoldCampaignRead(val: boolean) {
    setHoldCampaignRead(val);
  }

  function onChangeHoldCampaignWrite(val: boolean) {
    setHoldCampaignWrite(val);
  }

  function changeManageJourneyStatus() {
    const manageJourneyAllFalse = () => {
      searchJourneyClaimRead.disabled = false;
      searchJourneyClaimWrite.disabled = false;
      createJourneyClaimRead.disabled = false;
      createJourneyClaimWrite.disabled = false;
      editJourneyClaimRead.disabled = false;
      editJourneyClaimWrite.disabled = false;
      viewJourneyClaimRead.disabled = false;
      viewJourneyClaimWrite.disabled = false;

      setSearchJourneyRead(false);
      setSearchJourneyWrite(false);
      setCreateJourneyRead(false);
      setCreateJourneyWrite(false);
      setEditJourneyRead(false);
      setEditJourneyWrite(false);
      setViewJourneyRead(false);
      setViewJourneyWrite(false);
    }

    if (manageJourneyClaimRead.checked === true && manageJourneyClaimWrite.checked === true) {
      manageJourneyAllFalse();
    } else if (manageJourneyClaimRead.checked === true && manageJourneyClaimWrite.checked === false) {
      searchJourneyClaimRead.disabled = false;
      searchJourneyClaimWrite.disabled = true;
      createJourneyClaimRead.disabled = false;
      createJourneyClaimWrite.disabled = true;
      editJourneyClaimRead.disabled = false;
      editJourneyClaimWrite.disabled = true;
      viewJourneyClaimRead.disabled = false;
      viewJourneyClaimWrite.disabled = true;

      searchJourneyClaimWrite.checked = false;
      createJourneyClaimWrite.checked = false;
      editJourneyClaimWrite.checked = false;
      viewJourneyClaimWrite.checked = false;

      setSearchJourneyWrite(false);
      setCreateJourneyWrite(false);
      setEditJourneyWrite(false);
      setViewJourneyWrite(false);
    } else if (manageJourneyClaimRead.checked === false && manageJourneyClaimWrite.checked === true) {
      manageJourneyAllFalse();
    } else if (manageJourneyClaimRead.checked === false && manageJourneyClaimWrite.checked === false) {
      searchJourneyClaimRead.disabled = true;
      searchJourneyClaimWrite.disabled = true;
      createJourneyClaimRead.disabled = true;
      createJourneyClaimWrite.disabled = true;
      editJourneyClaimRead.disabled = true;
      editJourneyClaimWrite.disabled = true;
      viewJourneyClaimRead.disabled = true;
      viewJourneyClaimWrite.disabled = true;

      searchJourneyClaimRead.checked = false;
      searchJourneyClaimWrite.checked = false;
      createJourneyClaimRead.checked = false;
      createJourneyClaimWrite.checked = false;
      editJourneyClaimRead.checked = false;
      editJourneyClaimWrite.checked = false;
      viewJourneyClaimRead.checked = false;
      viewJourneyClaimWrite.checked = false;

      setSearchJourneyRead(false);
      setSearchJourneyWrite(false);
      setCreateJourneyRead(false);
      setCreateJourneyWrite(false);
      setEditJourneyRead(false);
      setEditJourneyWrite(false);
      setViewJourneyRead(false);
      setViewJourneyWrite(false);
    }
  }

  function onChangeSearchJourneyRead(val: boolean) {
    setSearchJourneyRead(val);
  }

  function onChangeSearchJourneyWrite(val: boolean) {
    setSearchJourneyWrite(val);
  }

  function onChangeCreateJourneyRead(val: boolean) {
    setCreateJourneyRead(val);
  }

  function onChangeCreateJourneyWrite(val: boolean) {
    setCreateJourneyWrite(val);
  }

  function onChangeEditJourneyRead(val: boolean) {
    setEditJourneyRead(val);
  }

  function onChangeEditJourneyWrite(val: boolean) {
    setEditJourneyWrite(val);
  }

  function onChangeViewJourneyRead(val: boolean) {
    setViewJourneyRead(val);
  }

  function onChangeViewJourneyWrite(val: boolean) {
    setViewJourneyWrite(val);
  }

  // Broadcast
  function onChangeBroadcastRead(val: boolean) {
    setBroadcastRead(val);
  }

  function onChangeBroadcastWrite(val: boolean) {
    setBroadcastWrite(val);
  }

  
  return (
    <>
      <Card.Header className='accordion-header form-edit' style={CardHeaderEditStyles}>
        <Accordion.Toggle as={Button} variant='link' eventKey='5'>
          <FontAwesomeIcon icon={faCommentsDollar} /> {SECURABLE_NAMES.Campaign}
        </Accordion.Toggle>
        <div className='d-flex align-items-center my-2'>
          <div className='col-sm-7'>
            <div className='form-check form-switch form-check-custom form-check-solid'>
              <ToggleComponent
                toggleId='campaignClaimRead'
                toggleTagging='Read'
                toggleChange={onChangeCampaignRead}
                toggleDefaultValue={campaignRead}
                isDisabled={false}
              />
            </div>
          </div>
          <div className='col'>
            <div className='form-check form-switch form-check-custom form-check-solid'>
              <ToggleComponent
                toggleId='campaignClaimWrite'
                toggleTagging='Write'
                toggleChange={onChangeCampaignWrite}
                toggleDefaultValue={campaignWrite}
                isDisabled={false}
              />
            </div>
          </div>
        </div>
      </Card.Header>
      <Accordion.Collapse eventKey='5'>
        <Card.Body className='accordion-body edit-user-div' style={CardBodyEditStyles}>
          <Accordion defaultActiveKey='0' className='accordion'>
            <Card>
              <Card.Header className='accordion-header'>
                <Accordion.Toggle as={Button} variant='link' eventKey='0'>
                  <FontAwesomeIcon icon={faCircle} /> {SECURABLE_NAMES.CampaignSetting}
                </Accordion.Toggle>
                <div className='d-flex align-items-center my-2'>
                  <div className='col-sm-7'>
                    <div className='form-check form-switch form-check-custom form-check-solid'>
                      <ToggleComponent
                        toggleId='campaignSettingClaimRead'
                        toggleTagging='Read'
                        toggleChange={onChangeCampaignSettingRead}
                        toggleDefaultValue={campaignSettingRead}
                        isDisabled={true}
                      />
                    </div>
                  </div>
                  <div className='col'>
                    <div className='form-check form-switch form-check-custom form-check-solid'>
                      <ToggleComponent
                        toggleId='campaignSettingClaimWrite'
                        toggleTagging='Write'
                        toggleChange={onChangeCampaignSettingWrite}
                        toggleDefaultValue={campaignSettingWrite}
                        isDisabled={true}
                      />
                    </div>
                  </div>
                </div>
              </Card.Header>
              <Accordion.Collapse eventKey='0'>
                <Card.Body className='accordion-body edit-user-div' style={CardBodyEditStyles}>
                  <div className='row mb-3'>
                    <div className='d-flex align-items-center my-2'>
                      <div className='col-sm-10'>
                        <div className='form-label-sm'>{SECURABLE_NAMES.SearchGoalSetting}</div>
                      </div>
                      <div className='col-sm-1'>
                        <div className='form-check form-switch form-check-custom form-check-solid'>
                          <ToggleComponent
                            toggleId='searchGoalSettingClaimRead'
                            toggleTagging='Read'
                            toggleChange={onChangeSearchGoalSettingRead}
                            toggleDefaultValue={searchGoalSettingRead}
                            isDisabled={true}
                          />
                        </div>
                      </div>
                      <div className='col'>
                        <div className='form-check form-switch form-check-custom form-check-solid'>
                          <ToggleComponent
                            toggleId='searchGoalSettingClaimWrite'
                            toggleTagging='Write'
                            toggleChange={onChangeSearchGoalSettingWrite}
                            toggleDefaultValue={searchGoalSettingWrite}
                            isDisabled={true}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className='row mb-3'>
                    <div className='d-flex align-items-center my-2'>
                      <div className='col-sm-10'>
                        <div className='form-label-sm'>{SECURABLE_NAMES.UpdateGoalSetting}</div>
                      </div>
                      <div className='col-sm-1'>
                        <div className='form-check form-switch form-check-custom form-check-solid'>
                          <ToggleComponent
                            toggleId='updateGoalSettingClaimRead'
                            toggleTagging='Read'
                            toggleChange={onChangeUpdateGoalSettingRead}
                            toggleDefaultValue={updateGoalSettingRead}
                            isDisabled={true}
                          />
                        </div>
                      </div>
                      <div className='col'>
                        <div className='form-check form-switch form-check-custom form-check-solid'>
                          <ToggleComponent
                            toggleId='updateGoalSettingClaimWrite'
                            toggleTagging='Write'
                            toggleChange={onChangeUpdateGoalSettingWrite}
                            toggleDefaultValue={updateGoalSettingWrite}
                            isDisabled={true}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className='row mb-3'>
                    <div className='d-flex align-items-center my-2'>
                      <div className='col-sm-10'>
                        <div className='form-label-sm'>{SECURABLE_NAMES.ViewGoalSetting}</div>
                      </div>

                      <div className='col-sm-1'>
                        <div className='form-check form-switch form-check-custom form-check-solid'>
                          <ToggleComponent
                            toggleId='viewGoalSettingClaimRead'
                            toggleTagging='Read'
                            toggleChange={onChangeViewGoalSettingRead}
                            toggleDefaultValue={viewGoalSettingRead}
                            isDisabled={true}
                          />
                        </div>
                      </div>
                      <div className='col'>
                        <div className='form-check form-switch form-check-custom form-check-solid'>
                          <ToggleComponent
                            toggleId='viewGoalSettingClaimWrite'
                            toggleTagging='Write'
                            toggleChange={onChangeViewGoalSettingWrite}
                            toggleDefaultValue={viewGoalSettingWrite}
                            isDisabled={true}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className='row mb-3'>
                    <div className='d-flex align-items-center my-2'>
                      <div className='col-sm-10'>
                        <div className='form-label-sm'>{SECURABLE_NAMES.SearchAutoTagging}</div>
                      </div>

                      <div className='col-sm-1'>
                        <div className='form-check form-switch form-check-custom form-check-solid'>
                          <ToggleComponent
                            toggleId='searchAutoTaggingClaimRead'
                            toggleTagging='Read'
                            toggleChange={onChangeSearchAutoTaggingRead}
                            toggleDefaultValue={searchAutoTaggingRead}
                            isDisabled={true}
                          />
                        </div>
                      </div>
                      <div className='col'>
                        <div className='form-check form-switch form-check-custom form-check-solid'>
                          <ToggleComponent
                            toggleId='searchAutoTaggingClaimWrite'
                            toggleTagging='Write'
                            toggleChange={onChangeSearchAutoTaggingWrite}
                            toggleDefaultValue={searchAutoTaggingWrite}
                            isDisabled={true}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className='row mb-3'>
                    <div className='d-flex align-items-center my-2'>
                      <div className='col-sm-10'>
                        <div className='form-label-sm'>{SECURABLE_NAMES.UpdateAutoTagging}</div>
                      </div>

                      <div className='col-sm-1'>
                        <div className='form-check form-switch form-check-custom form-check-solid'>
                          <ToggleComponent
                            toggleId='updateAutoTaggingClaimRead'
                            toggleTagging='Read'
                            toggleChange={onChangeUpdateAutoTaggingRead}
                            toggleDefaultValue={updateAutoTaggingRead}
                            isDisabled={true}
                          />
                        </div>
                      </div>
                      <div className='col'>
                        <div className='form-check form-switch form-check-custom form-check-solid'>
                          <ToggleComponent
                            toggleId='updateAutoTaggingClaimWrite'
                            toggleTagging='Write'
                            toggleChange={onChangeUpdateAutoTaggingWrite}
                            toggleDefaultValue={updateAutoTaggingWrite}
                            isDisabled={true}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className='row mb-3'>
                    <div className='d-flex align-items-center my-2'>
                      <div className='col-sm-10'>
                        <div className='form-label-sm'>{SECURABLE_NAMES.ViewAutoTagging}</div>
                      </div>
                      <div className='col-sm-1'>
                        <div className='form-check form-switch form-check-custom form-check-solid'>
                          <ToggleComponent
                            toggleId='viewAutoTaggingClaimRead'
                            toggleTagging='Read'
                            toggleChange={onChangeViewAutoTaggingRead}
                            toggleDefaultValue={viewAutoTaggingRead}
                            isDisabled={true}
                          />
                        </div>
                      </div>
                      <div className='col'>
                        <div className='form-check form-switch form-check-custom form-check-solid'>
                          <ToggleComponent
                            toggleId='viewAutoTaggingClaimWrite'
                            toggleTagging='Write'
                            toggleChange={onChangeViewAutoTaggingWrite}
                            toggleDefaultValue={viewAutoTaggingWrite}
                            isDisabled={true}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className='row mb-3'>
                    <div className='d-flex align-items-center my-2'>
                      <div className='col-sm-10'>
                        <div className='form-label-sm'>{SECURABLE_NAMES.IncentiveGoalSetting}</div>
                      </div>
                      <div className='col-sm-1'>
                        <div className='form-check form-switch form-check-custom form-check-solid'>
                          <ToggleComponent
                            toggleId='incentiveGoalSettingClaimRead'
                            toggleTagging='Read'
                            toggleChange={onChangeIncentiveGoalSettingRead}
                            toggleDefaultValue={incentiveGoalSettingRead}
                            isDisabled={true}
                          />
                        </div>
                      </div>
                      <div className='col'>
                        <div className='form-check form-switch form-check-custom form-check-solid'>
                          <ToggleComponent
                            toggleId='incentiveGoalSettingClaimWrite'
                            toggleTagging='Write'
                            toggleChange={onChangeIncentiveGoalSettingWrite}
                            toggleDefaultValue={incentiveGoalSettingWrite}
                            isDisabled={true}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className='row mb-3'>
                    <div className='d-flex align-items-center my-2'>
                      <div className='col-sm-10'>
                        <div className='form-label-sm'>{SECURABLE_NAMES.UpdateIncentiveSetting}</div>
                      </div>

                      <div className='col-sm-1'>
                        <div className='form-check form-switch form-check-custom form-check-solid'>
                          <ToggleComponent
                            toggleId='updateIncentiveSettingClaimRead'
                            toggleTagging='Read'
                            toggleChange={onChangeUpdateIncentiveSettingRead}
                            toggleDefaultValue={updateIncentiveSettingRead}
                            isDisabled={true}
                          />
                        </div>
                      </div>
                      <div className='col'>
                        <div className='form-check form-switch form-check-custom form-check-solid'>
                          <ToggleComponent
                            toggleId='updateIncentiveSettingClaimWrite'
                            toggleTagging='Write'
                            toggleChange={onChangeUpdateIncentiveSettingWrite}
                            toggleDefaultValue={updateIncentiveSettingWrite}
                            isDisabled={true}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className='row mb-3'>
                    <div className='d-flex align-items-center my-2'>
                      <div className='col-sm-10'>
                        <div className='form-label-sm'>{SECURABLE_NAMES.ViewIncentiveSetting}</div>
                      </div>

                      <div className='col-sm-1'>
                        <div className='form-check form-switch form-check-custom form-check-solid'>
                          <ToggleComponent
                            toggleId='viewIncentiveSettingClaimRead'
                            toggleTagging='Read'
                            toggleChange={onChangeViewIncentiveSettingRead}
                            toggleDefaultValue={viewIncentiveSettingRead}
                            isDisabled={true}
                          />
                        </div>
                      </div>
                      <div className='col'>
                        <div className='form-check form-switch form-check-custom form-check-solid'>
                          <ToggleComponent
                            toggleId='viewIncentiveSettingClaimWrite'
                            toggleTagging='Write'
                            toggleChange={onChangeViewIncentiveSettingWrite}
                            toggleDefaultValue={viewIncentiveSettingWrite}
                            isDisabled={true}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className='row mb-3'>
                    <div className='d-flex align-items-center my-2'>
                      <div className='col-sm-10'>
                        <div className='form-label-sm'>{SECURABLE_NAMES.AgentForTagging}</div>
                      </div>

                      <div className='col-sm-1'>
                        <div className='form-check form-switch form-check-custom form-check-solid'>
                          <ToggleComponent
                            toggleId='agentForTaggingClaimRead'
                            toggleTagging='Read'
                            toggleChange={onChangeAgentForTaggingRead}
                            toggleDefaultValue={agentForTaggingRead}
                            isDisabled={true}
                          />
                        </div>
                      </div>
                      <div className='col'>
                        <div className='form-check form-switch form-check-custom form-check-solid'>
                          <ToggleComponent
                            toggleId='agentForTaggingClaimWrite'
                            toggleTagging='Write'
                            toggleChange={onChangeAgentForTaggingWrite}
                            toggleDefaultValue={agentForTaggingWrite}
                            isDisabled={true}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className='row mb-3'>
                    <div className='d-flex align-items-center my-2'>
                      <div className='col-sm-10'>
                        <div className='form-label-sm'>{SECURABLE_NAMES.CustomEventSetting}</div>
                      </div>
                      <div className='col-sm-1'>
                        <div className='form-check form-switch form-check-custom form-check-solid'>
                          <ToggleComponent
                            toggleId='customEventSettingClaimRead'
                            toggleTagging='Read'
                            toggleChange={onChangeCustomEventSettingRead}
                            toggleDefaultValue={customEventSettingRead}
                            isDisabled={true}
                          />
                        </div>
                      </div>
                      <div className='col'>
                        <div className='form-check form-switch form-check-custom form-check-solid'>
                          <ToggleComponent
                            toggleId='customEventSettingClaimWrite'
                            toggleTagging='Write'
                            toggleChange={onChangeCustomEventSettingWrite}
                            toggleDefaultValue={customEventSettingWrite}
                            isDisabled={true}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Manage Telegram Bot */}
                  <div className='row mb-3'>
                    <div className='d-flex align-items-center my-2'>
                      <div className='col-sm-10'>
                        <div className='form-label-sm'>{SECURABLE_NAMES.SearchTelegramBot}</div>
                      </div>
                      <div className='col-sm-1'>
                        <div className='form-check form-switch form-check-custom form-check-solid'>
                          <ToggleComponent
                            toggleId='telegramBotClaimRead'
                            toggleTagging='Read'
                            toggleChange={onChangeTelegramBotRead}
                            toggleDefaultValue={telegramBotRead}
                            isDisabled={true}
                          />
                        </div>
                      </div>
                      <div className='col'>
                        <div className='form-check form-switch form-check-custom form-check-solid'>
                          <ToggleComponent
                            toggleId='telegramBotClaimWrite'
                            toggleTagging='Write'
                            toggleChange={onChangeTelegramBotWrite}
                            toggleDefaultValue={telegramBotWrite}
                            isDisabled={true}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className='row mb-3'>
                    <div className='d-flex align-items-center my-2'>
                      <div className='col-sm-10'>
                        <div className='form-label-sm'>{SECURABLE_NAMES.UpdateTelegramBot}</div>
                      </div>

                      <div className='col-sm-1'>
                        <div className='form-check form-switch form-check-custom form-check-solid'>
                          <ToggleComponent
                            toggleId='updateTelegramBotClaimRead'
                            toggleTagging='Read'
                            toggleChange={onChangeUpdateTelegramBotRead}
                            toggleDefaultValue={updateManageTelegramBotRead}
                            isDisabled={true}
                          />
                        </div>
                      </div>
                      <div className='col'>
                        <div className='form-check form-switch form-check-custom form-check-solid'>
                          <ToggleComponent
                            toggleId='updateTelegramBotClaimWrite'
                            toggleTagging='Write'
                            toggleChange={onChangeUpdateTelegramBotWrite}
                            toggleDefaultValue={updateManageTelegramBotWrite}
                            isDisabled={true}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className='row mb-3'>
                    <div className='d-flex align-items-center my-2'>
                      <div className='col-sm-10'>
                        <div className='form-label-sm'>{SECURABLE_NAMES.ViewTelegramBot}</div>
                      </div>

                      <div className='col-sm-1'>
                        <div className='form-check form-switch form-check-custom form-check-solid'>
                          <ToggleComponent
                            toggleId='viewTelegramBotClaimRead'
                            toggleTagging='Read'
                            toggleChange={onChangeViewTelegramBotRead}
                            toggleDefaultValue={viewManageTelegramBotRead}
                            isDisabled={true}
                          />
                        </div>
                      </div>
                      <div className='col'>
                        <div className='form-check form-switch form-check-custom form-check-solid'>
                          <ToggleComponent
                            toggleId='viewTelegramBotClaimWrite'
                            toggleTagging='Write'
                            toggleChange={onChangeViewTelegramBotWrite}
                            toggleDefaultValue={viewManageTelegramBotWrite}
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
                <Accordion.Toggle as={Button} variant='link' eventKey='1'>
                  <FontAwesomeIcon icon={faCircle} /> {SECURABLE_NAMES.ManageCampaign}
                </Accordion.Toggle>
                <div className='d-flex align-items-center my-2'>
                  <div className='col-sm-7'>
                    <div className='form-check form-switch form-check-custom form-check-solid'>
                      <ToggleComponent
                        toggleId='manageCampaignClaimRead'
                        toggleTagging='Read'
                        toggleChange={onChangeManageCampaignRead}
                        toggleDefaultValue={manageCampaignRead}
                        isDisabled={true}
                      />
                    </div>
                  </div>
                  <div className='col'>
                    <div className='form-check form-switch form-check-custom form-check-solid'>
                      <ToggleComponent
                        toggleId='manageCampaignClaimWrite'
                        toggleTagging='Write'
                        toggleChange={onChangeManageCampaignWrite}
                        toggleDefaultValue={manageCampaignWrite}
                        isDisabled={true}
                      />
                    </div>
                  </div>
                </div>
              </Card.Header>
              <Accordion.Collapse eventKey='1'>
                <Card.Body className='accordion-body edit-user-div' style={CardBodyEditStyles}>
                  <div className='row mb-3'>
                    <div className='d-flex align-items-center my-2'>
                      <div className='col-sm-10'>
                        <div className='form-label-sm'>{SECURABLE_NAMES.SearchCampaign}</div>
                      </div>
                      <div className='col-sm-1'>
                        <div className='form-check form-switch form-check-custom form-check-solid'>
                          <ToggleComponent
                            toggleId='searchCampaignClaimRead'
                            toggleTagging='Read'
                            toggleChange={onChangeSearchCampaignRead}
                            toggleDefaultValue={searchCampaignRead}
                            isDisabled={true}
                          />
                        </div>
                      </div>
                      <div className='col'>
                        <div className='form-check form-switch form-check-custom form-check-solid'>
                          <ToggleComponent
                            toggleId='searchCampaignClaimWrite'
                            toggleTagging='Write'
                            toggleChange={onChangeSearchCampaignWrite}
                            toggleDefaultValue={searchCampaignWrite}
                            isDisabled={true}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className='row mb-3'>
                    <div className='d-flex align-items-center my-2'>
                      <div className='col-sm-10'>
                        <div className='form-label-sm'>{SECURABLE_NAMES.CreateCampaign}</div>
                      </div>

                      <div className='col-sm-1'>
                        <div className='form-check form-switch form-check-custom form-check-solid'>
                          <ToggleComponent
                            toggleId='createCampaignClaimRead'
                            toggleTagging='Read'
                            toggleChange={onChangeCreateCampaignRead}
                            toggleDefaultValue={createCampaignRead}
                            isDisabled={true}
                          />
                        </div>
                      </div>
                      <div className='col'>
                        <div className='form-check form-switch form-check-custom form-check-solid'>
                          <ToggleComponent
                            toggleId='createCampaignClaimWrite'
                            toggleTagging='Write'
                            toggleChange={onChangecreateCampaignWrite}
                            toggleDefaultValue={createCampaignWrite}
                            isDisabled={true}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className='row mb-3'>
                    <div className='d-flex align-items-center my-2'>
                      <div className='col-sm-10'>
                        <div className='form-label-sm'>{SECURABLE_NAMES.EditCampaign}</div>
                      </div>
                      <div className='col-sm-1'>
                        <div className='form-check form-switch form-check-custom form-check-solid'>
                          <ToggleComponent
                            toggleId='editCampaignClaimRead'
                            toggleTagging='Read'
                            toggleChange={onChangeEditCampaignRead}
                            toggleDefaultValue={editCampaignRead}
                            isDisabled={true}
                          />
                        </div>
                      </div>
                      <div className='col'>
                        <div className='form-check form-switch form-check-custom form-check-solid'>
                          <ToggleComponent
                            toggleId='editCampaignClaimWrite'
                            toggleTagging='Write'
                            toggleChange={onChangeEditCampaignWrite}
                            toggleDefaultValue={editCampaignWrite}
                            isDisabled={true}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className='row mb-3'>
                    <div className='d-flex align-items-center my-2'>
                      <div className='col-sm-10'>
                        <div className='form-label-sm'>{SECURABLE_NAMES.ViewCampaign}</div>
                      </div>
                      <div className='col-sm-1'>
                        <div className='form-check form-switch form-check-custom form-check-solid'>
                          <ToggleComponent
                            toggleId='viewCampaignClaimRead'
                            toggleTagging='Read'
                            toggleChange={onChangeViewCampaignRead}
                            toggleDefaultValue={viewCampaignRead}
                            isDisabled={true}
                          />
                        </div>
                      </div>
                      <div className='col'>
                        <div className='form-check form-switch form-check-custom form-check-solid'>
                          <ToggleComponent
                            toggleId='viewCampaignClaimWrite'
                            toggleTagging='Write'
                            toggleChange={onChangeviewCampaignWrite}
                            toggleDefaultValue={viewCampaignWrite}
                            isDisabled={true}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className='row mb-3'>
                    <div className='d-flex align-items-center my-2'>
                      <div className='col-sm-10'>
                        <div className='form-label-sm'>{SECURABLE_NAMES.HoldCampaign}</div>
                      </div>
                      <div className='col-sm-1'>
                        <div className='form-check form-switch form-check-custom form-check-solid'>
                          <ToggleComponent
                            toggleId='holdCampaignClaimRead'
                            toggleTagging='Read'
                            toggleChange={onChangeHoldCampaignRead}
                            toggleDefaultValue={holdCampaignRead}
                            isDisabled={true}
                          />
                        </div>
                      </div>
                      <div className='col'>
                        <div className='form-check form-switch form-check-custom form-check-solid'>
                          <ToggleComponent
                            toggleId='holdCampaignClaimWrite'
                            toggleTagging='Write'
                            toggleChange={onChangeHoldCampaignWrite}
                            toggleDefaultValue={holdCampaignWrite}
                            isDisabled={true}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </Card.Body>
              </Accordion.Collapse>
            </Card>
            {/* {Manage Journey} */}
            <Card>
              <Card.Header className='accordion-header edit-user-div'>
                <Accordion.Toggle as={Button} variant='link' eventKey='9'>
                  <FontAwesomeIcon icon={faCircle} /> {SECURABLE_NAMES.ManageJourney}
                </Accordion.Toggle>
                <div className='d-flex align-items-center my-2'>
                  <div className='col-sm-7'>
                    <div className='form-check form-switch form-check-custom form-check-solid'>
                      <ToggleComponent
                        toggleId='manageJourneyClaimRead'
                        toggleTagging='Read'
                        toggleChange={onChangeManageJourneyRead}
                        toggleDefaultValue={manageJourneyRead}
                        isDisabled={true}
                      />
                    </div>
                  </div>
                  <div className='col'>
                    <div className='form-check form-switch form-check-custom form-check-solid'>
                      <ToggleComponent
                        toggleId='manageJourneyClaimWrite'
                        toggleTagging='Write'
                        toggleChange={onChangeManageJourneyWrite}
                        toggleDefaultValue={manageJourneyWrite}
                        isDisabled={true}
                      />
                    </div>
                  </div>
                </div>
              </Card.Header>
              <Accordion.Collapse eventKey='9'>
                <Card.Body className='accordion-body edit-user-div' style={CardBodyEditStyles}>
                  <div className='row mb-3'>
                    <div className='d-flex align-items-center my-2'>
                      <div className='col-sm-10'>
                        <div className='form-label-sm'>{SECURABLE_NAMES.SearchJourney}</div>
                      </div>
                      <div className='col-sm-1'>
                        <div className='form-check form-switch form-check-custom form-check-solid'>
                          <ToggleComponent
                            toggleId='searchJourneyClaimRead'
                            toggleTagging='Read'
                            toggleChange={onChangeSearchJourneyRead}
                            toggleDefaultValue={searchJourneyRead}
                            isDisabled={true}
                          />
                        </div>
                      </div>
                      <div className='col'>
                        <div className='form-check form-switch form-check-custom form-check-solid'>
                          <ToggleComponent
                            toggleId='searchJourneyClaimWrite'
                            toggleTagging='Write'
                            toggleChange={onChangeSearchJourneyWrite}
                            toggleDefaultValue={searchJourneyWrite}
                            isDisabled={true}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className='row mb-3'>
                    <div className='d-flex align-items-center my-2'>
                      <div className='col-sm-10'>
                        <div className='form-label-sm'>{SECURABLE_NAMES.CreateJourney}</div>
                      </div>
                      <div className='col-sm-1'>
                        <div className='form-check form-switch form-check-custom form-check-solid'>
                          <ToggleComponent
                            toggleId='createJourneyClaimRead'
                            toggleTagging='Read'
                            toggleChange={onChangeCreateJourneyRead}
                            toggleDefaultValue={createJourneyRead}
                            isDisabled={true}
                          />
                        </div>
                      </div>
                      <div className='col'>
                        <div className='form-check form-switch form-check-custom form-check-solid'>
                          <ToggleComponent
                            toggleId='createJourneyClaimWrite'
                            toggleTagging='Write'
                            toggleChange={onChangeCreateJourneyWrite}
                            toggleDefaultValue={createJourneyWrite}
                            isDisabled={true}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className='row mb-3'>
                    <div className='d-flex align-items-center my-2'>
                      <div className='col-sm-10'>
                        <div className='form-label-sm'>{SECURABLE_NAMES.EditJourney}</div>
                      </div>

                      <div className='col-sm-1'>
                        <div className='form-check form-switch form-check-custom form-check-solid'>
                          <ToggleComponent
                            toggleId='editJourneyClaimRead'
                            toggleTagging='Read'
                            toggleChange={onChangeEditJourneyRead}
                            toggleDefaultValue={editJourneyRead}
                            isDisabled={true}
                          />
                        </div>
                      </div>
                      <div className='col'>
                        <div className='form-check form-switch form-check-custom form-check-solid'>
                          <ToggleComponent
                            toggleId='editJourneyClaimWrite'
                            toggleTagging='Write'
                            toggleChange={onChangeEditJourneyWrite}
                            toggleDefaultValue={editJourneyWrite}
                            isDisabled={true}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className='row mb-3'>
                    <div className='d-flex align-items-center my-2'>
                      <div className='col-sm-10'>
                        <div className='form-label-sm'>{SECURABLE_NAMES.ViewJourney}</div>
                      </div>

                      <div className='col-sm-1'>
                        <div className='form-check form-switch form-check-custom form-check-solid'>
                          <ToggleComponent
                            toggleId='viewJourneyClaimRead'
                            toggleTagging='Read'
                            toggleChange={onChangeViewJourneyRead}
                            toggleDefaultValue={viewJourneyRead}
                            isDisabled={true}
                          />
                        </div>
                      </div>
                      <div className='col'>
                        <div className='form-check form-switch form-check-custom form-check-solid'>
                          <ToggleComponent
                            toggleId='viewJourneyClaimWrite'
                            toggleTagging='Write'
                            toggleChange={onChangeViewJourneyWrite}
                            toggleDefaultValue={viewJourneyWrite}
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
                <Accordion.Toggle as={Button} variant='link' eventKey='10'>
                  <FontAwesomeIcon icon={faCircle} /> {SECURABLE_NAMES.Broadcast}
                </Accordion.Toggle>
                <div className='d-flex align-items-center my-2'>
                  <div className='col-sm-7'>
                    <div className='form-check form-switch form-check-custom form-check-solid'>
                      <ToggleComponent
                        toggleId='broadcastClaimRead'
                        toggleTagging='Reads'
                        toggleChange={onChangeBroadcastRead}
                        toggleDefaultValue={broadcastRead}
                        isDisabled={true}
                      />
                    </div>
                  </div>
                  <div className='col'>
                    <div className='form-check form-switch form-check-custom form-check-solid'>
                      <ToggleComponent
                        toggleId='broadcastClaimWrite'
                        toggleTagging='Write'
                        toggleChange={onChangeBroadcastWrite}
                        toggleDefaultValue={broadcastWrite}
                        isDisabled={true}
                      />
                    </div>
                  </div>
                </div>
              </Card.Header>              
            </Card>
          </Accordion>
        </Card.Body>
      </Accordion.Collapse>
    </>
  )
}

export default CampaignManagementSecurableObjects