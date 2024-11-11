import {useEffect, useState} from 'react';
import {RemLookupsResponseModel} from '../../models';
import {getRemLookups} from '../../services/RemDistributionApi';

export default function useRemLookups() {
	// State
	const [lookupList, setLookList] = useState<RemLookupsResponseModel>({
		remProfileNames: [],
		remAgentNames: [],
		remPseudoNames: [],
		remAssignedBys: [],
		remActionTypes: [],
		users: [],
		activeRemProfileNames: [],
	});

	// Effect
	useEffect(() => {
		getRemLookups()
			.then((response) => {
				if (response.status === 200) {
					setLookList(response.data);
				}
			})
			.catch((ex) => {
				console.log('Error getRemLookups: ' + ex);
			});
	}, []);

	return lookupList;
}
