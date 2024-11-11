import {useState} from 'react';
import useConstant from '../../../../constants/useConstant';
import {CustomerPlayerUsernameResponseModel} from '../../models';
import {PlayerInformationResponse} from '../../models/PlayerInformationResponse';
import {GetPlayersByPlayerId, GetPlayersByUsername, ValidatePlayerCaseCommunication} from '../../services/CustomerCaseApi';

const useCustomerCaseHooks = () => {
	const {successResponse} = useConstant();

	const [usernameOptions, setUsernameOptions] = useState<Array<CustomerPlayerUsernameResponseModel>>([]);
	const [playerIdOptions, setPlayerIdOptions] = useState<Array<CustomerPlayerUsernameResponseModel>>([]);
	const [playerGenInfo, setPlayerGenInfo] = useState<PlayerInformationResponse>();

	const getPlayersByPlayerIdOptions = (playerId: string, brand: number, userId: number) => {
		GetPlayersByPlayerId(playerId, brand, userId)
			.then((response) => {
				if (response.status === successResponse) {
					setPlayerIdOptions(response.data);
				} else {
					console.log('No Record found getting data getPlayersByPlayerIdOptions');
				}
			})
			.catch((ex) => {
				console.log('Problem in getting data getPlayersByPlayerIdOptions' + ex);
			});
	};

	const getPlayersByUsernameOptions = (username: string, brand: number, userId: number) => {
		GetPlayersByUsername(username, brand, userId)
			.then((response) => {
				if (response.status === successResponse) {
					setUsernameOptions(response.data);
				} else {
					console.log('No Record found getting data getPlayersByUsernameOptions');
				}
			})
			.catch((ex) => {
				console.log('Problem in getting getPlayersByUsernameOptions' + ex);
			});
	};

	const validatePlayerCaseCommunication = (_mlabPlayerId: string) => {
		ValidatePlayerCaseCommunication(parseInt(_mlabPlayerId))
			.then((response) => {
				if (response.status === successResponse) {
					let data = Object.assign(response.data);
					setPlayerGenInfo(data);
				} else {
					console.log('No results found getting ValidatePlayerCaseCommunication');
				}
			})
			.catch((ex) => {
				console.log('Problem in getting ValidatePlayerCaseCommunication' + ex);
			});
	};

	const validateParameterIsEmpty = async (_param: string[]) => {
		let isError: boolean = false;
		_param.forEach((element) => {
			if (element === '') {
				isError = true;
			}
		});
		return isError;
	};

	return {
		getPlayersByPlayerIdOptions,
		usernameOptions,
		getPlayersByUsernameOptions,
		setUsernameOptions,
		playerIdOptions,
		validatePlayerCaseCommunication,
		playerGenInfo,
		setPlayerIdOptions,
		validateParameterIsEmpty,
	};
};

export default useCustomerCaseHooks;
