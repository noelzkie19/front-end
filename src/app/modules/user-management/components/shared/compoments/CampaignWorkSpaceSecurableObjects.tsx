import { useEffect, useState } from 'react'
import { Accordion, Button, Card } from 'react-bootstrap';
import ToggleComponent from './ToggleComponent';
import { MainModuleModel } from '../../../models/MainModuleModel';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircle, faPhoneSquare } from '@fortawesome/free-solid-svg-icons';
import { SECURABLE_NAMES } from '../../constants/SecurableNames';
interface Props {
    CardHeaderEditStyles: any,
    CardBodyEditStyles: any,
    SecurableObjects?: Array<MainModuleModel>,
}

const CampaignWorkSpaceSecurableObjects = ({ CardHeaderEditStyles, CardBodyEditStyles, SecurableObjects }: Props) => {
    //     CampaignWorkspace
    const [campaignWorkspaceRead, setCampaignWorkspaceRead] = useState(false);
    const [campaignWorkspaceWrite, setCampaignWorkspaceWrite] = useState(false);
    const [callListValidationRead, setCallListValidationRead] = useState(false);
    const [callListValidationWrite, setCallListValidationWrite] = useState(false);
    const [agentWorkSpaceRead, setAgentWorkSpaceRead] = useState(false);
    const [agentWorkSpaceWrite, setAgentWorkSpaceWrite] = useState(false);
    const [agentMonitoringRead, setAgentMonitoringRead] = useState(false);
    const [agentMonitoringWrite, setAgentMonitoringWrite] = useState(false);
    const [viewOwnPlayersRead, setViewOwnPlayersRead] = useState(false);
    const [viewOwnPlayersWrite, setViewOwnPlayersWrite] = useState(false);
    const [viewAllPlayersRead, setViewAllPlayersRead] = useState(false);
    const [viewAllPlayersWrite, setViewAllPlayersWrite] = useState(false);
    const [viewCallListAllPlayersRead, setViewCallListAllPlayersRead] = useState(false);
    const [viewCallListAllPlayersWrite, setViewCallListAllPlayersWrite] = useState(false);
    const [updateAllAgentValidationsRead, setUpdateAllAgentValidationsRead] = useState(false);
    const [updateAllAgentValidationsWrite, setUpdateAllAgentValidationsWrite] = useState(false);
    const [updateLeaderValidationRead, setUpdateLeaderValidationRead] = useState(false);
    const [updateLeaderValidationWrite, setUpdateLeaderValidationWrite] = useState(false);
    const [updateCallEvaluationRead, setUpdateCallEvaluationRead] = useState(false);
    const [updateCallEvaluationWrite, setUpdateCallEvaluationWrite] = useState(false);
    const [updateAgentStatusRead, setUpdateAgentStatusRead] = useState(false);
    const [updateAgentStatusWrite, setUpdateAgentStatusWrite] = useState(false);
    const [updateDailyReportRead, setUpdateDailyReportRead] = useState(false);
    const [updateDailyReportWrite, setUpdateDailyReportWrite] = useState(false);
    const [exportToCSVCallListRead, setExportToCSVCallListRead] = useState(false);
    const [exportToCSVCallListWrite, setExportToCSVCallListWrite] = useState(false);
    const [exportToCSVAgentWorkSpaceRead, setExportToCSVAgentWorkSpaceRead] = useState(false);
    const [exportToCSVAgentWorkSpaceWrite, setExportToCSVAgentWorkSpaceWrite] = useState(false);

    let campaignWorkspaceClaimsRead = document.getElementById('campaignWorkspaceClaimRead') as HTMLInputElement;
    let campaignWorkspaceClaimsWrite = document.getElementById('campaignWorkspaceClaimWrite') as HTMLInputElement;
    let agentWorkSpaceClaimsRead = document.getElementById('agentWorkSpaceClaimRead') as HTMLInputElement;
    let agentWorkSpaceClaimsWrite = document.getElementById('agentWorkSpaceClaimWrite') as HTMLInputElement;
    let callListValidationClaimsRead = document.getElementById('callListValidationClaimRead') as HTMLInputElement;
    let callListValidationClaimsWrite = document.getElementById('callListValidationClaimWrite') as HTMLInputElement;
    let agentMonitoringClaimsRead = document.getElementById('agentMonitoringClaimRead') as HTMLInputElement;
    let agentMonitoringClaimsWrite = document.getElementById('agentMonitoringClaimWrite') as HTMLInputElement;

    let viewOwnPlayersClaimsRead = document.getElementById('viewOwnPlayersClaimRead') as HTMLInputElement;
    let viewOwnPlayersClaimsWrite = document.getElementById('viewOwnPlayersClaimWrite') as HTMLInputElement;
    let viewAllPlayersClaimsRead = document.getElementById('viewAllPlayersClaimRead') as HTMLInputElement;
    let viewAllPlayersClaimsWrite = document.getElementById('viewAllPlayersClaimWrite') as HTMLInputElement;
    let exportToCSVAgentWorkSpaceClaimsRead = document.getElementById('exportToCSVAgentWorkSpaceClaimRead') as HTMLInputElement;
    let exportToCSVAgentWorkSpaceClaimsWrite = document.getElementById('exportToCSVAgentWorkSpaceClaimWrite') as HTMLInputElement;

    let viewCallListAllPlayersClaimsRead = document.getElementById('viewCallListAllPlayersClaimRead') as HTMLInputElement;
    let viewCallListAllPlayersClaimsWrite = document.getElementById('viewCallListAllPlayersClaimWrite') as HTMLInputElement;
    let updateAllAgentValidationsClaimsRead = document.getElementById('updateAllAgentValidationsClaimRead') as HTMLInputElement;
    let updateAllAgentValidationsClaimsWrite = document.getElementById('updateAllAgentValidationsClaimWrite') as HTMLInputElement;
    let updateLeaderValidationClaimsRead = document.getElementById('updateLeaderValidationClaimRead') as HTMLInputElement;
    let updateLeaderValidationClaimsWrite = document.getElementById('updateLeaderValidationClaimWrite') as HTMLInputElement;
    let updateCallEvaluationClaimsRead = document.getElementById('updateCallEvaluationClaimRead') as HTMLInputElement;
    let updateCallEvaluationClaimsWrite = document.getElementById('updateCallEvaluationClaimWrite') as HTMLInputElement;
    let exportToCSVCallListClaimRead = document.getElementById('exportToCSVCallListClaimRead') as HTMLInputElement;
    let exportToCSVCallListClaimWrite = document.getElementById('exportToCSVCallListClaimWrite') as HTMLInputElement;

    let updateAgentStatusClaimsRead = document.getElementById('updateAgentStatusClaimRead') as HTMLInputElement;
    let updateAgentStatusClaimsWrite = document.getElementById('updateAgentStatusClaimWrite') as HTMLInputElement;
    let updateDailyReportClaimsRead = document.getElementById('updateDailyReportClaimRead') as HTMLInputElement;
    let updateDailyReportClaimsWrite = document.getElementById('updateDailyReportClaimWrite') as HTMLInputElement;

    useEffect(() => {
        if (!SecurableObjects) return

        let campaignWorkSpaceClaims = SecurableObjects?.find((obj) => obj.description === SECURABLE_NAMES.CampaignWorkspace);
        if (!campaignWorkSpaceClaims) return
        let { read, write, subMainModuleDetails }: any = campaignWorkSpaceClaims;

        campaignWorkspaceClaimsRead.checked = read
        setCampaignWorkspaceRead(read)
        campaignWorkspaceClaimsWrite.checked = write
        setCampaignWorkspaceWrite(write)

        if (!subMainModuleDetails) return

        AgentWorkSpaceSubmodules(subMainModuleDetails)
        CallListValidationSubmodules(subMainModuleDetails)
        AgentMonitoringSubmodules(subMainModuleDetails)
        changeCampaignWorkspace();

        return () => { }
    }, [SecurableObjects])

    const AgentWorkSpaceSubmodules = (subMainModuleDetails: any) => {
        const { read: agentWorkSpaceRead, write: agentWorkSpaceWrite, subModuleDetails: agentWorkSpaceSubModule } = subMainModuleDetails?.find((obj: any) => obj.description === SECURABLE_NAMES.AgentWorkSpace) ?? { read: false, write: false, subModuleDetails: [] };
        agentWorkSpaceClaimsRead.checked = agentWorkSpaceRead;
        agentWorkSpaceClaimsWrite.checked = agentWorkSpaceWrite;

        const { read: viewOwnPlayerRead, write: viewOwnPlayerWrite } = agentWorkSpaceSubModule?.find((obj: any) => obj.description === SECURABLE_NAMES.ViewOwnPlayers) ?? { read: false, write: false };
        viewOwnPlayersClaimsRead.checked = viewOwnPlayerRead;
        viewOwnPlayersClaimsWrite.checked = viewOwnPlayerWrite;

        const { read: updateGoalRead, write: updateGoalWrite } = agentWorkSpaceSubModule?.find((obj: any) => obj.description === SECURABLE_NAMES.ViewAllPlayers) ?? { read: false, write: false };
        viewAllPlayersClaimsRead.checked = updateGoalRead;
        viewAllPlayersClaimsWrite.checked = updateGoalWrite;

        const { read: exportCSVAgentWorkSpaceRead, write: exportCSVAgentWorkSpaceWrite } = agentWorkSpaceSubModule?.find((obj: any) => obj.description === SECURABLE_NAMES.ExportToCSVAgentWorkSpace) ?? { read: false, write: false };
        exportToCSVAgentWorkSpaceClaimsRead.checked = exportCSVAgentWorkSpaceRead;
        exportToCSVAgentWorkSpaceClaimsWrite.checked = exportCSVAgentWorkSpaceWrite;
    }

    const CallListValidationSubmodules = (subMainModuleDetails: any) => {
        const { read: callListValidationRead, write: callListValidationWrite, subModuleDetails: callListValidationSubModule } = subMainModuleDetails?.find((obj: any) => obj.description === SECURABLE_NAMES.CallListValidation) ?? { read: false, write: false, subModuleDetails: [] };
        callListValidationClaimsRead.checked = callListValidationRead;
        callListValidationClaimsWrite.checked = callListValidationWrite;

        const { read: viewCallListAllPlayerRead, write: viewCallListAllPlayerWrite } = callListValidationSubModule?.find((obj: any) => obj.description === SECURABLE_NAMES.ViewCallListAllPlayers) ?? { read: false, write: false };
        viewCallListAllPlayersClaimsRead.checked = viewCallListAllPlayerRead;
        viewCallListAllPlayersClaimsWrite.checked = viewCallListAllPlayerWrite;

        const { read: updateAgentValidationRead, write: updateAgentValidationWrite } = callListValidationSubModule?.find((obj: any) => obj.description === SECURABLE_NAMES.UpdateAllAgentValidations) ?? { read: false, write: false };
        updateAllAgentValidationsClaimsRead.checked = updateAgentValidationRead;
        updateAllAgentValidationsClaimsWrite.checked = updateAgentValidationWrite;

        const { read: updateLeaderValidationRead, write: updateLeaderValidationWrite } = callListValidationSubModule?.find((obj: any) => obj.description === SECURABLE_NAMES.UpdateLeaderValidation) ?? { read: false, write: false };
        updateLeaderValidationClaimsRead.checked = updateLeaderValidationRead;
        updateLeaderValidationClaimsWrite.checked = updateLeaderValidationWrite;

        const { read: updateCallEvaluationRead, write: updateCallEvaluationWrite } = callListValidationSubModule?.find((obj: any) => obj.description === SECURABLE_NAMES.UpdateCallEvaluation) ?? { read: false, write: false };
        updateCallEvaluationClaimsRead.checked = updateCallEvaluationRead;
        updateCallEvaluationClaimsWrite.checked = updateCallEvaluationWrite;

        const { read: exportCSVCallListRead, write: exportCSVCallListWrite } = callListValidationSubModule?.find((obj: any) => obj.description === SECURABLE_NAMES.ExportToCSVCallList) ?? { read: false, write: false };
        exportToCSVCallListClaimRead.checked = exportCSVCallListRead;
        exportToCSVCallListClaimWrite.checked = exportCSVCallListWrite;

    }

    const AgentMonitoringSubmodules = (subMainModuleDetails: any) => {
        const { read: agentMonitoringRead, write: agentMonitoringWrite, subModuleDetails: agentMonitoringSubModule } = subMainModuleDetails?.find((obj: any) => obj.description === SECURABLE_NAMES.AgentMonitoring) ?? { read: false, write: false, subModuleDetails: [] };
        agentMonitoringClaimsRead.checked = agentMonitoringRead;
        agentMonitoringClaimsWrite.checked = agentMonitoringWrite;

        const { read: updateAgentStatusRead, write: updateAgentStatusWrite } = agentMonitoringSubModule?.find((obj: any) => obj.description === SECURABLE_NAMES.UpdateAgentStatus) ?? { read: false, write: false };
        updateAgentStatusClaimsRead.checked = updateAgentStatusRead;
        updateAgentStatusClaimsWrite.checked = updateAgentStatusWrite;

        const { read: updateDailyReportRead, write: updateDailyReportWrite } = agentMonitoringSubModule?.find((obj: any) => obj.description === SECURABLE_NAMES.UpdateDailyReport) ?? { read: false, write: false };
        updateDailyReportClaimsRead.checked = updateDailyReportRead;
        updateDailyReportClaimsWrite.checked = updateDailyReportWrite;
    }

    function changeCampaignWorkspace() {
        const campaignWorkSpaceAllFalse = () => {
            agentWorkSpaceClaimsRead.disabled = false;
            agentWorkSpaceClaimsWrite.disabled = false;
            callListValidationClaimsRead.disabled = false;
            callListValidationClaimsWrite.disabled = false;
            agentMonitoringClaimsRead.disabled = false;
            agentMonitoringClaimsWrite.disabled = false;

            setAgentWorkSpaceRead(false);
            setAgentWorkSpaceWrite(false);
            setCallListValidationRead(false);
            setCallListValidationWrite(false);
            setAgentMonitoringRead(false);
            setAgentMonitoringWrite(false);
        }
        if (campaignWorkspaceClaimsRead.checked === true && campaignWorkspaceClaimsWrite.checked === true) {
            campaignWorkSpaceAllFalse();
        } else if (campaignWorkspaceClaimsRead.checked === true && campaignWorkspaceClaimsWrite.checked === false) {
            agentWorkSpaceClaimsRead.disabled = false;
            agentWorkSpaceClaimsWrite.disabled = true;
            callListValidationClaimsRead.disabled = false;
            callListValidationClaimsWrite.disabled = true;
            agentMonitoringClaimsRead.disabled = false;
            agentMonitoringClaimsWrite.disabled = true;
            agentWorkSpaceClaimsWrite.checked = false;
            callListValidationClaimsWrite.checked = false;
            agentMonitoringClaimsWrite.checked = false;

            setAgentWorkSpaceWrite(false);
            setCallListValidationWrite(false);
            setAgentMonitoringWrite(false);
        } else if (campaignWorkspaceClaimsRead.checked === false && campaignWorkspaceClaimsWrite.checked === true) {
            campaignWorkSpaceAllFalse();
        } else if (!campaignWorkspaceClaimsRead.checked && !campaignWorkspaceClaimsWrite.checked) { 
            agentWorkSpaceClaimsRead.disabled = true;
            agentWorkSpaceClaimsWrite.disabled = true;
            callListValidationClaimsRead.disabled = true;
            callListValidationClaimsWrite.disabled = true;
            agentMonitoringClaimsRead.disabled = true;
            agentMonitoringClaimsWrite.disabled = true;
            agentWorkSpaceClaimsRead.checked = false;
            agentWorkSpaceClaimsWrite.checked = false;
            callListValidationClaimsRead.checked = false;
            callListValidationClaimsWrite.checked = false;
            agentMonitoringClaimsRead.checked = false;
            agentMonitoringClaimsWrite.checked = false;

            setAgentWorkSpaceRead(false);
            setAgentWorkSpaceWrite(false);
            setCallListValidationRead(false);
            setCallListValidationWrite(false);
            setAgentMonitoringRead(false);
            setAgentMonitoringWrite(false);
        }

        changeAgentWorkspaceStatus();
        changeCallListValidationStatus();
        changeAgentMonitoringStatus();
    }

    // CampaignWorkspace
    function onChangeCampaignWorkspaceRead(val: boolean) {
        setCampaignWorkspaceRead(val);
        changeCampaignWorkspace();
    }

    function onChangeCampaignWorkspaceWrite(val: boolean) {
        setCampaignWorkspaceWrite(val);
        changeCampaignWorkspace();
    }



    function onChangeAgentWorkSpaceRead(val: boolean) {
        setAgentWorkSpaceRead(val);
        changeAgentWorkspaceStatus();
    }

    function onChangeAgentWorkSpaceWrite(val: boolean) {
        setAgentWorkSpaceWrite(val);
        changeAgentWorkspaceStatus();
    }

    function changeAgentWorkspaceStatus() {
        const agentWorkSpaceAllFalse = () => {
            viewOwnPlayersClaimsRead.disabled = false;
            viewOwnPlayersClaimsWrite.disabled = false;
            viewAllPlayersClaimsRead.disabled = false;
            viewAllPlayersClaimsWrite.disabled = false;
            exportToCSVAgentWorkSpaceClaimsRead.disabled = false;
            exportToCSVAgentWorkSpaceClaimsWrite.disabled = false;

            setViewOwnPlayersRead(false);
            setViewOwnPlayersWrite(false);
            setViewAllPlayersRead(false);
            setViewAllPlayersWrite(false);
            setExportToCSVAgentWorkSpaceRead(false);
            setExportToCSVAgentWorkSpaceWrite(false);
        }

        if (agentWorkSpaceClaimsRead.checked === true && agentWorkSpaceClaimsWrite.checked === true) {
            agentWorkSpaceAllFalse();
        } else if (agentWorkSpaceClaimsRead.checked === true && agentWorkSpaceClaimsWrite.checked === false) {
            viewOwnPlayersClaimsRead.disabled = false;
            viewOwnPlayersClaimsWrite.disabled = true;
            viewAllPlayersClaimsRead.disabled = false;
            viewAllPlayersClaimsWrite.disabled = true;
            exportToCSVAgentWorkSpaceClaimsRead.disabled = false;
            exportToCSVAgentWorkSpaceClaimsWrite.disabled = true;
            viewOwnPlayersClaimsWrite.checked = false;
            viewAllPlayersClaimsWrite.checked = false;
            exportToCSVAgentWorkSpaceClaimsWrite.checked = false;

            setViewOwnPlayersWrite(false);
            setViewAllPlayersWrite(false);
            setExportToCSVAgentWorkSpaceWrite(false);
        } else if (agentWorkSpaceClaimsRead.checked === false && agentWorkSpaceClaimsWrite.checked === true) {
            agentWorkSpaceAllFalse();
        } else if (agentWorkSpaceClaimsRead.checked === false && agentWorkSpaceClaimsWrite.checked === false) {
            viewOwnPlayersClaimsRead.disabled = true;
            viewOwnPlayersClaimsWrite.disabled = true;
            viewAllPlayersClaimsRead.disabled = true;
            viewAllPlayersClaimsWrite.disabled = true;
            exportToCSVAgentWorkSpaceClaimsRead.disabled = true;
            exportToCSVAgentWorkSpaceClaimsWrite.disabled = true;
            viewOwnPlayersClaimsRead.checked = false;
            viewOwnPlayersClaimsWrite.checked = false;
            viewAllPlayersClaimsRead.checked = false;
            viewAllPlayersClaimsWrite.checked = false;
            exportToCSVAgentWorkSpaceClaimsRead.checked = false;
            exportToCSVAgentWorkSpaceClaimsWrite.checked = false;

            setViewOwnPlayersRead(false);
            setViewOwnPlayersWrite(false);
            setViewAllPlayersRead(false);
            setViewAllPlayersWrite(false);
            setExportToCSVAgentWorkSpaceRead(false);
            setExportToCSVAgentWorkSpaceWrite(false);
        }
    }

    function onChangeViewOwnPlayersRead(val: boolean) {
        setViewOwnPlayersRead(val);
    }

    function onChangeViewOwnPlayersWrite(val: boolean) {
        setViewOwnPlayersWrite(val);
    }

    function onChangeViewAllPlayersRead(val: boolean) {
        setViewAllPlayersRead(val);
    }

    function onChangeViewAllPlayersWrite(val: boolean) {
        setViewAllPlayersWrite(val);
    }

    function onChangeexportToCSVAgentWorkSpaceRead(val: boolean) {
        setExportToCSVAgentWorkSpaceRead(val);
    }

    function onChangeexportToCSVAgentWorkSpaceWrite(val: boolean) {
        setExportToCSVAgentWorkSpaceWrite(val);
    }

    function onChangeCallListValidationRead(val: boolean) {
        setCallListValidationRead(val);
        changeCallListValidationStatus();
    }

    function onChangeCallListValidationWrite(val: boolean) {
        setCallListValidationWrite(val);
        changeCallListValidationStatus();
    }

    function changeCallListValidationStatus() {


        if (callListValidationClaimsRead.checked === true && callListValidationClaimsWrite.checked === true) {
            updateAllAgentValidationsClaimsRead.disabled = false;
            updateAllAgentValidationsClaimsWrite.disabled = false;
            updateLeaderValidationClaimsRead.disabled = false;
            updateLeaderValidationClaimsWrite.disabled = false;
            updateCallEvaluationClaimsRead.disabled = false;
            updateCallEvaluationClaimsWrite.disabled = false;
            exportToCSVCallListClaimRead.disabled = false;
            exportToCSVCallListClaimWrite.disabled = false;
            viewCallListAllPlayersClaimsRead.disabled = false;
            viewCallListAllPlayersClaimsWrite.disabled = false;

            setExportToCSVCallListRead(false);
            setExportToCSVCallListWrite(false);
            setViewCallListAllPlayersRead(false);
            setViewCallListAllPlayersWrite(false);
            setUpdateAllAgentValidationsRead(false);
            setUpdateAllAgentValidationsWrite(false);
            setUpdateLeaderValidationRead(false);
            setUpdateLeaderValidationWrite(false);
            setUpdateCallEvaluationRead(false);
            setUpdateCallEvaluationWrite(false);
        } else if (callListValidationClaimsRead.checked === true && callListValidationClaimsWrite.checked === false) {
            viewCallListAllPlayersClaimsRead.disabled = false;
            viewCallListAllPlayersClaimsWrite.disabled = true;
            updateAllAgentValidationsClaimsRead.disabled = false;
            updateAllAgentValidationsClaimsWrite.disabled = true;
            updateLeaderValidationClaimsRead.disabled = false;
            updateLeaderValidationClaimsWrite.disabled = true;
            updateCallEvaluationClaimsRead.disabled = false;
            updateCallEvaluationClaimsWrite.disabled = true;
            exportToCSVCallListClaimRead.disabled = false;
            exportToCSVCallListClaimWrite.disabled = true;
            viewCallListAllPlayersClaimsWrite.checked = false;
            updateAllAgentValidationsClaimsWrite.checked = false;
            updateLeaderValidationClaimsWrite.checked = false;
            updateCallEvaluationClaimsWrite.checked = false;
            exportToCSVCallListClaimWrite.checked = false;

            setViewCallListAllPlayersWrite(false);
            setUpdateAllAgentValidationsWrite(false);
            setUpdateLeaderValidationWrite(false);
            setUpdateCallEvaluationWrite(false);
            setExportToCSVCallListWrite(false);
        } else if (callListValidationClaimsRead.checked === false && callListValidationClaimsWrite.checked === true) {
            exportToCSVCallListClaimRead.disabled = false;
            exportToCSVCallListClaimWrite.disabled = false;
            viewCallListAllPlayersClaimsRead.disabled = false;
            viewCallListAllPlayersClaimsWrite.disabled = false;
            updateAllAgentValidationsClaimsRead.disabled = false;
            updateAllAgentValidationsClaimsWrite.disabled = false;
            updateLeaderValidationClaimsRead.disabled = false;
            updateLeaderValidationClaimsWrite.disabled = false;
            updateCallEvaluationClaimsRead.disabled = false;
            updateCallEvaluationClaimsWrite.disabled = false;

            setViewCallListAllPlayersRead(false);
            setViewCallListAllPlayersWrite(false);
            setUpdateAllAgentValidationsRead(false);
            setUpdateAllAgentValidationsWrite(false);
            setUpdateLeaderValidationRead(false);
            setUpdateLeaderValidationWrite(false);
            setUpdateCallEvaluationRead(false);
            setUpdateCallEvaluationWrite(false);
            setExportToCSVCallListRead(false);
            setExportToCSVCallListWrite(false);
        } else if (callListValidationClaimsRead.checked === false && callListValidationClaimsWrite.checked === false) {
            viewCallListAllPlayersClaimsRead.disabled = true;
            viewCallListAllPlayersClaimsWrite.disabled = true;
            updateAllAgentValidationsClaimsRead.disabled = true;
            updateAllAgentValidationsClaimsWrite.disabled = true;
            updateLeaderValidationClaimsRead.disabled = true;
            updateLeaderValidationClaimsWrite.disabled = true;
            updateCallEvaluationClaimsRead.disabled = true;
            updateCallEvaluationClaimsWrite.disabled = true;
            exportToCSVCallListClaimRead.disabled = true;
            exportToCSVCallListClaimWrite.disabled = true;
            viewCallListAllPlayersClaimsRead.checked = false;
            viewCallListAllPlayersClaimsWrite.checked = false;
            updateAllAgentValidationsClaimsRead.checked = false;
            updateAllAgentValidationsClaimsWrite.checked = false;
            updateLeaderValidationClaimsRead.checked = false;
            updateLeaderValidationClaimsWrite.checked = false;
            updateCallEvaluationClaimsRead.checked = false;
            updateCallEvaluationClaimsWrite.checked = false;
            exportToCSVCallListClaimRead.checked = false;
            exportToCSVCallListClaimWrite.checked = false;

            setViewCallListAllPlayersRead(false);
            setViewCallListAllPlayersWrite(false);
            setUpdateAllAgentValidationsRead(false);
            setUpdateAllAgentValidationsWrite(false);
            setUpdateLeaderValidationRead(false);
            setUpdateLeaderValidationWrite(false);
            setUpdateCallEvaluationRead(false);
            setUpdateCallEvaluationWrite(false);
            setExportToCSVCallListRead(false);
            setExportToCSVCallListWrite(false);
        }
    }

    function onChangeUpdateAllAgentValidationsRead(val: boolean) {
        setUpdateAllAgentValidationsRead(val);
    }

    function onChangeUpdateLeaderValidationRead(val: boolean) {
        setUpdateLeaderValidationRead(val);
    }

    function onChangeUpdateAllAgentValidationsWrite(val: boolean) {
        setUpdateAllAgentValidationsWrite(val);
    }

    function onChangeupdateLeaderValidationWrite(val: boolean) {
        setUpdateLeaderValidationWrite(val);
    }

    function onChangeUpdateCallEvaluationRead(val: boolean) {
        setUpdateCallEvaluationRead(val);
    }

    function onChangeUpdateCallEvaluationWrite(val: boolean) {
        setUpdateCallEvaluationWrite(val);
    }

    function onChangeViewCallListAllPlayersRead(val: boolean) {
        setViewCallListAllPlayersRead(val);
    }

    function onChangeViewCallListAllPlayersWrite(val: boolean) {
        setViewCallListAllPlayersWrite(val);
    }

    function onChangeAgentMonitoringRead(val: boolean) {
        setAgentMonitoringRead(val);
        changeAgentMonitoringStatus();
    }

    function onChangeAgentMonitoringWrite(val: boolean) {
        setAgentMonitoringWrite(val);
        changeAgentMonitoringStatus();
    }

    function onChangeExportToCSVCallListRead(val: boolean) {
        setExportToCSVCallListRead(val);
    }

    function onChangeExportToCSVCallListWrite(val: boolean) {
        setExportToCSVCallListWrite(val);
    }

    function changeAgentMonitoringStatus() {


        const agentMonitoringAllFalse = () => {
            updateAgentStatusClaimsRead.disabled = false;
            updateAgentStatusClaimsWrite.disabled = false;
            updateDailyReportClaimsRead.disabled = false;
            updateDailyReportClaimsWrite.disabled = false;

            setUpdateAgentStatusRead(false);
            setUpdateAgentStatusWrite(false);
            setUpdateDailyReportRead(false);
            setUpdateDailyReportWrite(false);
        }

        if (agentMonitoringClaimsRead.checked === true && agentMonitoringClaimsWrite.checked === true) {
            agentMonitoringAllFalse();
        } else if (agentMonitoringClaimsRead.checked === true && agentMonitoringClaimsWrite.checked === false) {
            updateAgentStatusClaimsWrite.checked = false;
            updateAgentStatusClaimsRead.disabled = false;
            updateAgentStatusClaimsWrite.disabled = true;
            updateDailyReportClaimsRead.disabled = false;
            updateDailyReportClaimsWrite.disabled = true;
            updateDailyReportClaimsWrite.checked = false;

            setUpdateAgentStatusWrite(false);
            setUpdateDailyReportWrite(false);
        } else if (agentMonitoringClaimsRead.checked === false && agentMonitoringClaimsWrite.checked === true) {
            agentMonitoringAllFalse();
        } else if (agentMonitoringClaimsRead.checked === false && agentMonitoringClaimsWrite.checked === false) {
            updateAgentStatusClaimsRead.disabled = true;
            updateAgentStatusClaimsWrite.disabled = true;
            updateDailyReportClaimsRead.disabled = true;
            updateDailyReportClaimsWrite.disabled = true;
            updateAgentStatusClaimsRead.checked = false;
            updateAgentStatusClaimsWrite.checked = false;
            updateDailyReportClaimsRead.checked = false;
            updateDailyReportClaimsWrite.checked = false;

            setUpdateAgentStatusRead(false);
            setUpdateAgentStatusWrite(false);
            setUpdateDailyReportRead(false);
            setUpdateDailyReportWrite(false);
        }
    }

    function onChangeUpdateAgentStatusWrite(val: boolean) {
        setUpdateAgentStatusWrite(val);
    }

    function onChangeUpdateAgentStatusRead(val: boolean) {
        setUpdateAgentStatusRead(val);
    }

    function onChangeUpdateDailyReportRead(val: boolean) {
        setUpdateAgentStatusRead(val);
    }

    function onChangeUpdateDailyReportWrite(val: boolean) {
        setUpdateAgentStatusWrite(val);
    }
    return (
        <>
            <Card.Header className='accordion-header' style={CardHeaderEditStyles}>
                <Accordion.Toggle as={Button} variant='link' eventKey='6'>
                    <FontAwesomeIcon icon={faPhoneSquare} /> {SECURABLE_NAMES.CampaignWorkspace}
                </Accordion.Toggle>
                <div className='d-flex align-items-center my-2'>
                    <div className='col-sm-7'>
                        <div className='form-check form-switch form-check-custom form-check-solid'>
                            <ToggleComponent
                                toggleId='campaignWorkspaceClaimRead'
                                toggleChange={onChangeCampaignWorkspaceRead}
                                toggleDefaultValue={campaignWorkspaceRead}
                                toggleTagging='Read'
                                isDisabled={false}
                            />
                        </div>
                    </div>
                    <div className='col'>
                        <div className='form-check form-switch form-check-custom form-check-solid'>
                            <ToggleComponent
                                toggleId='campaignWorkspaceClaimWrite'
                                toggleChange={onChangeCampaignWorkspaceWrite}
                                toggleDefaultValue={campaignWorkspaceWrite}
                                toggleTagging='Write'
                                isDisabled={false}
                            />

                        </div>
                    </div>
                </div>
            </Card.Header>
            <Accordion.Collapse eventKey='6'>
                <Card.Body className='accordion-body edit-user-div' style={CardBodyEditStyles}>
                    <Accordion defaultActiveKey='0' className='accordion'>
                        <Card>
                            <Card.Header className='accordion-header'>
                                <Accordion.Toggle as={Button} variant='link' eventKey='0'>
                                    <FontAwesomeIcon icon={faCircle} /> {SECURABLE_NAMES.AgentWorkSpace}
                                </Accordion.Toggle>
                                <div className='d-flex align-items-center my-2'>
                                    <div className='col-sm-7'>
                                        <div className='form-check form-switch form-check-custom form-check-solid'>
                                            <ToggleComponent
                                                toggleId='agentWorkSpaceClaimRead'
                                                toggleChange={onChangeAgentWorkSpaceRead}
                                                toggleDefaultValue={agentWorkSpaceRead}
                                                toggleTagging='Read'
                                                isDisabled={true}
                                            />

                                        </div>
                                    </div>
                                    <div className='col'>
                                        <div className='form-check form-switch form-check-custom form-check-solid'>
                                            <ToggleComponent
                                                toggleId='agentWorkSpaceClaimWrite'
                                                toggleChange={onChangeAgentWorkSpaceWrite}
                                                toggleDefaultValue={agentWorkSpaceWrite}
                                                toggleTagging='Write'
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
                                                <div className='form-label-sm'>{SECURABLE_NAMES.ViewOwnPlayers}</div>
                                            </div>

                                            <div className='col-sm-1'>
                                                <div className='form-check form-switch form-check-custom form-check-solid'>
                                                    <ToggleComponent
                                                        toggleId='viewOwnPlayersClaimRead'
                                                        toggleChange={onChangeViewOwnPlayersRead}
                                                        toggleDefaultValue={viewOwnPlayersRead}
                                                        toggleTagging='Read'
                                                        isDisabled={true}
                                                    />
                                                </div>
                                            </div>
                                            <div className='col'>
                                                <div className='form-check form-switch form-check-custom form-check-solid'>
                                                    <ToggleComponent
                                                        toggleId='viewOwnPlayersClaimWrite'
                                                        toggleChange={onChangeViewOwnPlayersWrite}
                                                        toggleDefaultValue={viewOwnPlayersWrite}
                                                        toggleTagging='Write'
                                                        isDisabled={true}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className='row mb-3'>
                                        <div className='d-flex align-items-center my-2'>
                                            <div className='col-sm-10'>
                                                <div className='form-label-sm'>{SECURABLE_NAMES.ViewAllPlayers}</div>
                                            </div>

                                            <div className='col-sm-1'>
                                                <div className='form-check form-switch form-check-custom form-check-solid'>
                                                    <ToggleComponent
                                                        toggleId='viewAllPlayersClaimRead'
                                                        toggleChange={onChangeViewAllPlayersRead}
                                                        toggleDefaultValue={viewAllPlayersRead}
                                                        toggleTagging='Read'
                                                        isDisabled={true}
                                                    />
                                                </div>
                                            </div>
                                            <div className='col'>
                                                <div className='form-check form-switch form-check-custom form-check-solid'>
                                                    <ToggleComponent
                                                        toggleId='viewAllPlayersClaimWrite'
                                                        toggleChange={onChangeViewAllPlayersWrite}
                                                        toggleDefaultValue={viewAllPlayersWrite}
                                                        toggleTagging='Write'
                                                        isDisabled={true}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className='row mb-3'>
                                        <div className='d-flex align-items-center my-2'>
                                            <div className='col-sm-10'>
                                                <div className='form-label-sm'>{SECURABLE_NAMES.ExportToCSVAgentWorkSpace}</div>
                                            </div>

                                            <div className='col-sm-1'>
                                                <div className='form-check form-switch form-check-custom form-check-solid'>
                                                    <ToggleComponent
                                                        toggleId='exportToCSVAgentWorkSpaceClaimRead'
                                                        toggleChange={onChangeexportToCSVAgentWorkSpaceRead}
                                                        toggleDefaultValue={exportToCSVAgentWorkSpaceRead}
                                                        toggleTagging='Read'
                                                        isDisabled={true}
                                                    />
                                                </div>
                                            </div>
                                            <div className='col'>
                                                <div className='form-check form-switch form-check-custom form-check-solid'>
                                                    <ToggleComponent
                                                        toggleId='exportToCSVAgentWorkSpaceClaimWrite'
                                                        toggleChange={onChangeexportToCSVAgentWorkSpaceWrite}
                                                        toggleDefaultValue={exportToCSVAgentWorkSpaceWrite}
                                                        toggleTagging='Write'
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
                                    <FontAwesomeIcon icon={faCircle} /> {SECURABLE_NAMES.CallListValidation}
                                </Accordion.Toggle>
                                <div className='d-flex align-items-center my-2'>
                                    <div className='col-sm-7'>
                                        <div className='form-check form-switch form-check-custom form-check-solid'>
                                            <ToggleComponent
                                                toggleId='callListValidationClaimRead'
                                                toggleChange={onChangeCallListValidationRead}
                                                toggleDefaultValue={callListValidationRead}
                                                toggleTagging='Read'
                                                isDisabled={true}
                                            />
                                        </div>
                                    </div>
                                    <div className='col'>
                                        <div className='form-check form-switch form-check-custom form-check-solid'>
                                            <ToggleComponent
                                                toggleId='callListValidationClaimWrite'
                                                toggleChange={onChangeCallListValidationWrite}
                                                toggleDefaultValue={callListValidationWrite}
                                                toggleTagging='Write'
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
                                                <div className='form-label-sm'>{SECURABLE_NAMES.ViewCallListAllPlayers}</div>
                                            </div>

                                            <div className='col-sm-1'>
                                                <div className='form-check form-switch form-check-custom form-check-solid'>
                                                    <ToggleComponent
                                                        toggleId='viewCallListAllPlayersClaimRead'
                                                        toggleChange={onChangeViewCallListAllPlayersRead}
                                                        toggleDefaultValue={viewCallListAllPlayersRead}
                                                        toggleTagging='Read'
                                                        isDisabled={true}
                                                    />
                                                </div>
                                            </div>
                                            <div className='col'>
                                                <div className='form-check form-switch form-check-custom form-check-solid'>
                                                    <ToggleComponent
                                                        toggleId='viewCallListAllPlayersClaimWrite'
                                                        toggleChange={onChangeViewCallListAllPlayersWrite}
                                                        toggleDefaultValue={viewCallListAllPlayersWrite}
                                                        toggleTagging='Write'
                                                        isDisabled={true}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className='row mb-3'>
                                        <div className='d-flex align-items-center my-2'>
                                            <div className='col-sm-10'>
                                                <div className='form-label-sm'>{SECURABLE_NAMES.UpdateAllAgentValidations}</div>
                                            </div>

                                            <div className='col-sm-1'>
                                                <div className='form-check form-switch form-check-custom form-check-solid'>
                                                    <ToggleComponent
                                                        toggleId='updateAllAgentValidationsClaimRead'
                                                        toggleChange={onChangeUpdateAllAgentValidationsRead}
                                                        toggleDefaultValue={updateAllAgentValidationsRead}
                                                        toggleTagging='Read'
                                                        isDisabled={true}
                                                    />
                                                </div>
                                            </div>
                                            <div className='col'>
                                                <div className='form-check form-switch form-check-custom form-check-solid'>
                                                    <ToggleComponent
                                                        toggleId='updateAllAgentValidationsClaimWrite'
                                                        toggleChange={onChangeUpdateAllAgentValidationsWrite}
                                                        toggleDefaultValue={updateAllAgentValidationsWrite}
                                                        toggleTagging='Write'
                                                        isDisabled={true}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className='row mb-3'>
                                        <div className='d-flex align-items-center my-2'>
                                            <div className='col-sm-10'>
                                                <div className='form-label-sm'>{SECURABLE_NAMES.UpdateLeaderValidation}</div>
                                            </div>
                                            <div className='col-sm-1'>
                                                <div className='form-check form-switch form-check-custom form-check-solid'>
                                                    <ToggleComponent
                                                        toggleId='updateLeaderValidationClaimRead'
                                                        toggleChange={onChangeUpdateLeaderValidationRead}
                                                        toggleDefaultValue={updateLeaderValidationRead}
                                                        toggleTagging='Read'
                                                        isDisabled={true}
                                                    />
                                                </div>
                                            </div>
                                            <div className='col'>
                                                <div className='form-check form-switch form-check-custom form-check-solid'>
                                                    <ToggleComponent
                                                        toggleId='updateLeaderValidationClaimWrite'
                                                        toggleChange={onChangeupdateLeaderValidationWrite}
                                                        toggleDefaultValue={updateLeaderValidationWrite}
                                                        toggleTagging='Write'
                                                        isDisabled={true}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className='row mb-3'>
                                        <div className='d-flex align-items-center my-2'>
                                            <div className='col-sm-10'>
                                                <div className='form-label-sm'>{SECURABLE_NAMES.UpdateCallEvaluation}</div>
                                            </div>

                                            <div className='col-sm-1'>
                                                <div className='form-check form-switch form-check-custom form-check-solid'>
                                                    <ToggleComponent
                                                        toggleId='updateCallEvaluationClaimRead'
                                                        toggleChange={onChangeUpdateCallEvaluationRead}
                                                        toggleDefaultValue={updateCallEvaluationRead}
                                                        toggleTagging='Read'
                                                        isDisabled={true}
                                                    />
                                                </div>
                                            </div>
                                            <div className='col'>
                                                <div className='form-check form-switch form-check-custom form-check-solid'>
                                                    <ToggleComponent
                                                        toggleId='updateCallEvaluationClaimWrite'
                                                        toggleChange={onChangeUpdateCallEvaluationWrite}
                                                        toggleDefaultValue={updateCallEvaluationWrite}
                                                        toggleTagging='Write'
                                                        isDisabled={true}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className='row mb-3'>
                                        <div className='d-flex align-items-center my-2'>
                                            <div className='col-sm-10'>
                                                <div className='form-label-sm'>{SECURABLE_NAMES.ExportToCSVCallList}</div>
                                            </div>

                                            <div className='col-sm-1'>
                                                <div className='form-check form-switch form-check-custom form-check-solid'>
                                                    <ToggleComponent
                                                        toggleId='exportToCSVCallListClaimRead'
                                                        toggleChange={onChangeExportToCSVCallListRead}
                                                        toggleDefaultValue={exportToCSVCallListRead}
                                                        toggleTagging='Read'
                                                        isDisabled={true}
                                                    />
                                                </div>
                                            </div>
                                            <div className='col'>
                                                <div className='form-check form-switch form-check-custom form-check-solid'>
                                                    <ToggleComponent
                                                        toggleId='exportToCSVCallListClaimWrite'
                                                        toggleChange={onChangeExportToCSVCallListWrite}
                                                        toggleDefaultValue={exportToCSVCallListWrite}
                                                        toggleTagging='Write'
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
                                    <FontAwesomeIcon icon={faCircle} /> {SECURABLE_NAMES.AgentMonitoring}
                                </Accordion.Toggle>
                                <div className='d-flex align-items-center my-2'>
                                    <div className='col-sm-7'>
                                        <div className='form-check form-switch form-check-custom form-check-solid'>
                                            <ToggleComponent
                                                toggleId='agentMonitoringClaimRead'
                                                toggleChange={onChangeAgentMonitoringRead}
                                                toggleDefaultValue={agentMonitoringRead}
                                                toggleTagging='Read'
                                                isDisabled={true}
                                            />
                                        </div>
                                    </div>
                                    <div className='col'>
                                        <div className='form-check form-switch form-check-custom form-check-solid'>
                                            <ToggleComponent
                                                toggleId='agentMonitoringClaimWrite'
                                                toggleChange={onChangeAgentMonitoringWrite}
                                                toggleDefaultValue={agentMonitoringWrite}
                                                toggleTagging='Write'
                                                isDisabled={true}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </Card.Header>
                            <Accordion.Collapse eventKey='2'>
                                <Card.Body className='accordion-body edit-user-div' style={CardBodyEditStyles}>
                                    <div className='row mb-3'>
                                        <div className='d-flex align-items-center my-2'>
                                            <div className='col-sm-10'>
                                                <div className='form-label-sm'>{SECURABLE_NAMES.UpdateAgentStatus}</div>
                                            </div>
                                            <div className='col-sm-1'>
                                                <div className='form-check form-switch form-check-custom form-check-solid'>
                                                    <ToggleComponent
                                                        toggleId='updateAgentStatusClaimRead'
                                                        toggleChange={onChangeUpdateAgentStatusRead}
                                                        toggleDefaultValue={updateAgentStatusRead}
                                                        toggleTagging='Read'
                                                        isDisabled={true}
                                                    />
                                                </div>
                                            </div>
                                            <div className='col'>
                                                <div className='form-check form-switch form-check-custom form-check-solid'>
                                                    <ToggleComponent
                                                        toggleId='updateAgentStatusClaimWrite'
                                                        toggleChange={onChangeUpdateAgentStatusWrite}
                                                        toggleDefaultValue={updateAgentStatusWrite}
                                                        toggleTagging='Write'
                                                        isDisabled={true}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className='row mb-3'>
                                        <div className='d-flex align-items-center my-2'>
                                            <div className='col-sm-10'>
                                                <div className='form-label-sm'>{SECURABLE_NAMES.UpdateDailyReport}</div>
                                            </div>

                                            <div className='col-sm-1'>
                                                <div className='form-check form-switch form-check-custom form-check-solid'>
                                                    <ToggleComponent
                                                        toggleId='updateDailyReportClaimRead'
                                                        toggleChange={onChangeUpdateDailyReportRead}
                                                        toggleDefaultValue={updateDailyReportRead}
                                                        toggleTagging='Read'
                                                        isDisabled={true}
                                                    />
                                                </div>
                                            </div>
                                            <div className='col'>
                                                <div className='form-check form-switch form-check-custom form-check-solid'>
                                                    <ToggleComponent
                                                        toggleId='updateDailyReportClaimWrite'
                                                        toggleChange={onChangeUpdateDailyReportWrite}
                                                        toggleDefaultValue={updateDailyReportWrite}
                                                        toggleTagging='Write'
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

export default CampaignWorkSpaceSecurableObjects