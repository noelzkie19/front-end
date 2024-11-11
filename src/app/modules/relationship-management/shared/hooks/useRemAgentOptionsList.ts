import {useEffect, useState} from 'react';
import {LookupModel} from '../../../../shared-models/LookupModel';

const useRemAgentOptionsList = () => {
	const [data, setData] = useState<Array<LookupModel>>([]);
	useEffect(() => {
		setData([
			{
				value: '2',
				label: 'Kenneth Montevirgen',
			},
			{
				value: '4',
				label: 'John Wilmer Laddaran',
			},
			{
				value: '5',
				label: 'Jonnalyn Romero',
			},
			{
				value: '6',
				label: 'Jhon Esmael Agapito',
			},
			{
				value: '7',
				label: 'Putu P',
			},
			{
				value: '8',
				label: 'Gerald Diaz',
			},
			{
				value: '9',
				label: 'Ronald Jay-R Ventanilla',
			},
		]);
	}, []);
	
	return data;
};

export default useRemAgentOptionsList;
