import React, { useEffect, useState } from 'react'
import { LookupModel } from '../../../../shared-models/LookupModel';

const useRemProfileOptionsList = () => {
    const [data, setData] = useState<Array<LookupModel>>([]);
	useEffect(() => {
		setData([
				{
					value: '1',
					label: 'REM Profile 1',
				},
				{
					value: '2',
					label: 'REM Profile 2',
				},
				{
					value: '3',
					label: 'REM Profile 3',
				},
			]);
	}, [])
	
    
    return data;
}

export default useRemProfileOptionsList