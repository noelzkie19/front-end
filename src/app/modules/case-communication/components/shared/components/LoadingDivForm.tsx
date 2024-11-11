import React from 'react';
import Skeleton from 'react-loading-skeleton';
import {FormGroupContainer, MainContainer} from '../../../../../custom-components';
import LoadingHeader from './LoadingHeader';

const LoadingDivForm = () => {
	return (
		<MainContainer>
			<LoadingHeader />
			<div style={{marginLeft: 40, marginRight: 40, marginTop: 10}}>
				<FormGroupContainer>
					<div className='col-lg-3 mb-3'>
						<Skeleton count={2} height={30} style={{marginBottom: 10}} />
						<Skeleton count={2} height={30} style={{marginBottom: 10}} />
					</div>

					<div className='col-lg-3 mb-3'>
						<Skeleton count={2} height={30} style={{marginBottom: 10}} />
						<Skeleton count={2} height={30} style={{marginBottom: 10}} />
					</div>

					<div className='col-lg-3 mb-3'>
						<Skeleton count={2} height={30} style={{marginBottom: 10}} />
						<Skeleton count={2} height={30} style={{marginBottom: 10}} />
					</div>

					<div className='col-lg-3 mb-3'>
						<Skeleton count={2} height={30} style={{marginBottom: 10}} />
						<Skeleton count={2} height={30} style={{marginBottom: 10}} />
					</div>
				</FormGroupContainer>
			</div>
		</MainContainer>
	);
};

export default LoadingDivForm;
