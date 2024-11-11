import React, {useEffect, useState} from 'react';
import {OptionListModel} from '../common/model';
import useConstant from '../constants/useConstant';
import {OptionsSelectedModel} from '../modules/system/models';
import {CountryModel} from '../modules/system/models/CountryModel';
import {getAllCountryWithAccessRestriction} from '../modules/system/redux/SystemService';

export default function useCountryWithAccessRestriction(userId?: number) {
	const {successResponse} = useConstant();
	// State
	const [countryList, setCountryList] = useState<Array<OptionListModel>>([]);

	// First mount to component
	// useCountryWithAccessRestriction to accept nullable parameter (userId) for data restriction fields
	useEffect(() => {
		getAllCountryWithAccessRestriction(userId)
			.then((response) => {
				if (response.status === successResponse) {
					let countryList = Object.assign(new Array<CountryModel>(), response.data);
					let countryTempList = Array<OptionListModel>();

					countryList.forEach((item) => {
						const countryOption: OptionsSelectedModel = {
							value: item.countryId?.toString() ?? '0',
							label: item.countryName,
						};
						countryTempList.push(countryOption);
					});
					setCountryList(countryTempList.filter((thing, i, arr) => arr.findIndex((t) => t.value === thing.value) === i));
				} else {
					console.log('Problem in country list');
				}
			})
			.catch(() => {
				console.log('Problem in country list');
			});
	}, []);

	return countryList;
}
