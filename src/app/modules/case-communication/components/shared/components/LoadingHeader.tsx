import React from 'react';
import Skeleton from 'react-loading-skeleton';

const LoadingHeader = () => {
	return (
		<div
			className='card-header cursor-pointer'
			role='button'
			data-bs-toggle='collapse'
			data-bs-target='#kt_account_deactivate'
			aria-expanded='true'
			aria-controls='kt_account_deactivate'
		>
			<div className='col-lg-3 mb-6' style={{marginLeft: 10, marginTop: 20}}>
				<Skeleton count={1} height={40} />
			</div>
		</div>
	);
};

export default LoadingHeader;
