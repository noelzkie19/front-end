import  {useEffect, useState} from 'react'
import {getCurrencyByFilter } from '../../modules/system/redux/SystemService'
import {CurrencyPlayerConfig, PlayerConfigCommons, PlayerConfigTypes, StatusCode} from '../../modules/system/components/constants/PlayerConfigEnums'
import {CurrencyConfigResponseModel} from '../../modules/system/models/response/CurrencyConfigResponseModel'
import {RootState} from '../../../setup/redux/RootReducer'
import {useSelector, shallowEqual} from 'react-redux'
import {Guid} from 'guid-typescript'
import {PlayerConfigurationFilterRequestModel} from '../../modules/system/models/PlayerConfigurationFilterRequestModel'
import swal from 'sweetalert'

const useLoadCurrencyList = () => {
	//State
	const [currencyFilterList, setCurrency] = useState<Array<CurrencyConfigResponseModel>>([]);
	// Redux
	const userAccessId = useSelector<RootState>(({auth}) => auth.userId, shallowEqual) as number;

	const request: PlayerConfigurationFilterRequestModel = {
		pageSize: 0,
		offsetValue: 0,
		sortColumn: CurrencyPlayerConfig.CurrencyId,
		sortOrder: PlayerConfigCommons.Asc,
		userId: userAccessId.toString(),
		queueId: Guid.create().toString(),
		playerConfigurationTypeId: PlayerConfigTypes.CurrencyTypeId,
		playerConfigurationName: null,
		playerConfigurationCode: null,
		playerConfigurationId: undefined,
		playerConfigurationICoreId: undefined,
	};
	const loadCurrencyList = () => {
		setTimeout(() => {
			getCurrencyByFilter(request).then((response: any) => {
				if (response.status === StatusCode.OK) {
					setCurrency(response.data.currencyList);
				} else {
					swal('Failed', response.data.message, 'error');
				}
			});
		}, 1000);
	}

	useEffect(() => {
		loadCurrencyList();
	}, []);

	return {
		currencyFilterList,loadCurrencyList
	};
};

export default useLoadCurrencyList
