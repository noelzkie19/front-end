import { PlayerSensitiveDataRequestModel } from "../models";
import {getPlayerSensitiveData} from '../redux/PlayerManagementService';
import useConstant from "../../../constants/useConstant";
import swal from 'sweetalert';
import { USER_CLAIMS } from "../../user-management/components/constants/UserClaims";

export const usePlayerManagementHooks = () => {

    const {successResponse} = useConstant();

    async function getPlayerSensitiveFieldData(_request: PlayerSensitiveDataRequestModel) {
		let sensitiveDataResponse: string = '';
		await getPlayerSensitiveData(_request)
			.then((response) => {
				if (response.status === successResponse) {
					sensitiveDataResponse = response.data.sensitiveValue;
				}
			})
			.catch(() => {
				swal('Failed', 'Problem in getting profile', 'error');
			});
		return sensitiveDataResponse;
	}

	const validateContactDetailsAccess = (userAccess: any , isBlindAccount: any) => {
		// true or false if can view Mobile and Email
		const viewContactDetailsRead = userAccess.includes(USER_CLAIMS.ViewContactDetailsRead)
		const viewContactDetailsWrite = userAccess.includes(USER_CLAIMS.ViewContactDetailsWrite)
		const viewSensitiveDataRead =  userAccess.includes(USER_CLAIMS.ViewSensitiveDataRead)
		const viewSensitiveDataWrite =  userAccess.includes(USER_CLAIMS.ViewSensitiveDataWrite)
		const hasFullAccess = (viewContactDetailsRead && viewContactDetailsWrite && viewSensitiveDataRead && viewSensitiveDataWrite && isBlindAccount)
							  || (viewContactDetailsRead && viewContactDetailsWrite && viewSensitiveDataRead && viewSensitiveDataWrite && !isBlindAccount)
							  || (viewContactDetailsRead && viewContactDetailsWrite && viewSensitiveDataRead && !viewSensitiveDataWrite && !isBlindAccount)
							  || (viewContactDetailsRead && viewContactDetailsWrite && !viewSensitiveDataRead && !viewSensitiveDataWrite && !isBlindAccount);

		return hasFullAccess
	}


    return {
		getPlayerSensitiveFieldData,
		validateContactDetailsAccess
	}
}

