import { SECURABLE_NAMES } from "../../../../constants/SecurableNames";
import $ from 'jquery'
import { SubMainModuleModel } from "../../../../../models/SubMainModuleModel";

export const userManagementSubMainModuleClaims = (userAccessId: number): SubMainModuleModel[] => {
    let teamsClaimRead = $('#teamsClaimRead');
    let teamsClaimWrite = $('#teamsClaimWrite');

    const teamsClaim: SubMainModuleModel = {
        id: 8,
        description: SECURABLE_NAMES.Teams,
        write: (teamsClaimWrite[0] as HTMLInputElement).checked,
        read: (teamsClaimRead[0] as HTMLInputElement).checked,
        subModuleDetails: [],
        createdBy: userAccessId,
        updatedBy: userAccessId,
    };

    let rolesClaimRead = $('#rolesClaimRead');
    let rolesClaimWrite = $('#rolesClaimWrite');
    const rolesClaim: SubMainModuleModel = {
        id: 9,
        description: SECURABLE_NAMES.Roles,
        write: (rolesClaimWrite[0] as HTMLInputElement).checked,
        read: (rolesClaimRead[0] as HTMLInputElement).checked,
        subModuleDetails: [],
        createdBy: userAccessId,
        updatedBy: userAccessId,
    };

    let usersClaimRead = $('#usersClaimRead');
    let usersClaimWrite = $('#usersClaimWrite');
    const usersClaim: SubMainModuleModel = {
        id: 10,
        description: SECURABLE_NAMES.Users,
        write: (usersClaimWrite[0] as HTMLInputElement).checked,
        read: (usersClaimRead[0] as HTMLInputElement).checked,
        subModuleDetails: [],
        createdBy: userAccessId,
        updatedBy: userAccessId,
    };

    let userManagementSubMainModuleItems: Array<SubMainModuleModel> = [teamsClaim, rolesClaim, usersClaim];

    return userManagementSubMainModuleItems
}