import React, {useEffect, useState} from 'react';
import {OptionListModel} from '../../../common/model';
import useConstant from '../../../constants/useConstant';
import {LanguageResponseModel} from '../../../modules/system/models/LanguageResponseModel';
import {GetLanguageOptionList} from '../../../modules/system/redux/SystemService';

const useLanguageOption = () => {
	//States
	const [languageOptions, setLanguageOptions] = useState<Array<LanguageResponseModel>>([]);
	//Constants
	const {successResponse} = useConstant();

	useEffect(() => {
		GetLanguageOptionList()
			.then((response) => {
				if (response.status === successResponse) {
					let data = Object.assign(new Array<LanguageResponseModel>(), response.data);

					setLanguageOptions(data);
				} else {
					console.log('Problem in getting language List');
				}
			})
			.catch(() => {
				//disableSplashScreen()
				console.log('Problem in message type brand list');
			});
	}, []);

	return {languageOptions};
};

export default useLanguageOption;
