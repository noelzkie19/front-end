import React from 'react';
import {Spinner} from 'react-bootstrap-v5';

const RetrieveCall = () => (
	<>
		<label className={'text-danger'}>Retrieving Call Record</label>
		<Spinner animation='border' variant='danger' size='sm' />
	</>
);

export {RetrieveCall};
