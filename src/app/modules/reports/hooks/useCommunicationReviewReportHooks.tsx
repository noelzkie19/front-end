import { useState } from "react";
import useConstant from "../../../constants/useConstant";
import { LookupModel } from "../../../shared-models/LookupModel";
import { TeamsFilterModel } from "../../user-management/models/TeamsFilterModel";
import { getTeamsFilter, getUserListOption } from "../../user-management/redux/UserManagementService";
import { UserInfoListModel } from "../../user-management/models/UserInfoListModel";

export const useCommunicationReviewReportHooks = () => {
    /**
     * Add your hooks here for case management hooks only
     */
    const {successResponse} = useConstant()
    const [teamListOptions, setTeamListOptions] = useState<Array<LookupModel>>([])
    const [userListOptions, setUserListOptions] = useState<Array<LookupModel>>([])
	
    /**
	 *  ? Methods
	 */
    const getTeamListOptions = () => {
        getTeamsFilter().then((response) => {
          if (response.status === successResponse) {
            let teamList = Array<LookupModel>();
            let teamListRaw = Object.assign(new Array<TeamsFilterModel>(), response.data);
            teamListRaw.map(team => {
              const roleOption: LookupModel = {
                value: team.teamId.toString(),
                label: team.teamName,
              };
              teamList.push(roleOption)
            })
            setTeamListOptions(teamList.filter((thing, i, arr) => arr.findIndex(t => t.value === thing.value) === i));
          }
          else {
            console.log('Problem in getting team list');
          }
        })
        .catch(() => {
          console.log('Problem in getting team list');
        })
    };

    const getUserListOptions = () => {
        getUserListOption().then((response) => {
          if (response.status === successResponse) {
            let userList = Array<LookupModel>();
            let userListRaw = Object.assign(new Array<UserInfoListModel>(), response.data);
            userList.push({ value: '0', label: 'Administrator'});
            userListRaw.map(user => {
              const userOption: LookupModel = {
                value: user.userId.toString(),
                label: user.fullName
              };
              userList.push(userOption)
            })
            setUserListOptions(userList.filter((thing, i, arr) => arr.findIndex(t => t.value === thing.value) === i));
          }
          else {
            console.log('Problem in getting user list');
          }
        })
        .catch(() => {
          console.log('Problem in getting user list');
        })
    }
	
  return {getTeamListOptions, teamListOptions, getUserListOptions, userListOptions};
};


