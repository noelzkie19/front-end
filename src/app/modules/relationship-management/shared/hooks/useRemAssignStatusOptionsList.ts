import React, {useEffect, useState} from 'react';
import {LookupModel} from '../../../../shared-models/LookupModel';

const useRemAssignStatusOptionsList = () => {
	const [data, setData] = useState<Array<LookupModel>>([]);
	useEffect(() => {
		setData([
			{value: '1', label: 'Assigned'},
			{value: '0', label: 'Unassigned'},
		]);
	}, [])

	return data;
};

export default useRemAssignStatusOptionsList;
