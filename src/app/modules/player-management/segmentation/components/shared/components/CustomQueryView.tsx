import React from 'react';
import {FormGroupContainer} from '../../../../../../custom-components';
type CustomQueryViewProps = {
	customQuery: string;
	setCustomQuery: (customerQuery: string) => void;
	readOnly?: boolean;
};
const CustomQueryView: React.FC<CustomQueryViewProps> = ({customQuery, setCustomQuery, readOnly}: CustomQueryViewProps) => {
	const handleCustomQueryChange = (event: any) => {
		setCustomQuery(event.target.value);
	};
	return (
		<FormGroupContainer>
			<div className='col-lg-12 pt-2'>
				<h6 className='required'>Query</h6>

				<textarea
					className='form-control'
					id='exampleFormControlTextarea1'
					rows={3}
					value={customQuery}
					onChange={handleCustomQueryChange}
					disabled={readOnly}
				></textarea>
			</div>
		</FormGroupContainer>
	);
};

export default CustomQueryView;
