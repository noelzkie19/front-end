import React from 'react';
import Skeleton from 'react-loading-skeleton';
import {FormGroupContainer, MainContainer} from '../../../../../custom-components';
import LoadingHeader from './LoadingHeader';

const CommunicationLoadingDiv = () => {
	return (
		<MainContainer>
			<LoadingHeader />
			<div style={{marginLeft: 40, marginRight: 40, marginTop: 10, marginBottom: 40}}>
				<FormGroupContainer>
					<div className='col-lg-3 mb-3'>
						<Skeleton count={2} height={30} style={{marginBottom: 10}} />
					</div>

					<div className='col-lg-3 mb-3'>
						<Skeleton count={2} height={30} style={{marginBottom: 10}} />
					</div>

					<div className='col-lg-3 mb-3'>
						<Skeleton count={2} height={30} style={{marginBottom: 10}} />
					</div>

					<div className='col-lg-3 mb-3'>
						<Skeleton count={2} height={30} style={{marginBottom: 10}} />
					</div>
				</FormGroupContainer>
				<div className='col-lg-3 mb-3'>
					<Skeleton count={1} height={30} style={{marginBottom: 10}} />
				</div>
				<Skeleton count={1} height={200} style={{marginBottom: 10}} />
			</div>
		</MainContainer>
	);
};

export default CommunicationLoadingDiv;
