import useConstant from "../../../../constants/useConstant";
import { ValidateUserProviderName } from "../../redux/UserManagementService";
import swal from 'sweetalert';

const useUsersConstant =  () => {
	const { successResponse } = useConstant();
	
	enum ChatProvider {
		livePersonId = 280,
		liveChatId = 281,
	}

	//	Function
	const validateUserProviderName: any = async (userId: any, providerId: any, providerAccount: any) => {
		return await ValidateUserProviderName(userId, providerId,providerAccount )
			.then((response) => {
				if (response.status === successResponse) {
					return response.data;
				} else {
					swal('Failed', 'Connection error Please close the form and try again 1', 'error');
				}
			})
			.catch(() => {
				swal('Failed', 'Connection error Please close the form and try again 2', 'error');
			});
	};

	return {
		ChatProvider,
		validateUserProviderName,
		
	};
};

export default useUsersConstant;
