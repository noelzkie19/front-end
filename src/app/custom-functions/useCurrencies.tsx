import React, { useEffect, useState } from 'react';
import useConstant from '../constants/useConstant';
import { CurrencyOptions, CurrencyResponseModel, OptionsSelectedModel } from '../modules/system/models';
import { getAllCurrencyWithNullableRestriction } from '../modules/system/redux/SystemService';

export default function useCurrencies(userId?: number) {
	const {successResponse} = useConstant();
	// State
	const [currencyList, setCurrencyList] = useState<Array<CurrencyOptions>>([]);

	// First mount to component
	// Refactored useCurrencies to accept nullable parameter (userId) for data restriction fields
	useEffect(() => {
		getAllCurrencyWithNullableRestriction(userId)
			.then((response) => {
				if (response.status === successResponse) {
					let allCurrencies = Object.assign(new Array<CurrencyResponseModel>(), response.data);
					let currencyTempList = Array<CurrencyOptions>();

					allCurrencies.forEach((item) => {
						const currencyOption: OptionsSelectedModel = {
							value: item.id.toString(),
							label: item.name,
						};
						currencyTempList.push(currencyOption);
					});
					setCurrencyList(currencyTempList.filter((thing, i, arr) => arr.findIndex((t) => t.value === thing.value) === i));
				} else {
					console.log('Problem in currency list');
				}
			})
			.catch(() => {
				console.log('Problem in currency list');
			});
	}, []);

	return currencyList;
}
