import React from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import {FormGroupContainer} from '../../../../../../custom-components';

const Separator = () => {
	return(
		<div className='separator separator-dashed my-5'></div>
	)
}

const SkeletonLoading = () => {
	
	return (
		<>
			<FormGroupContainer>
				<div className='col-lg-4'>
					<Skeleton count={2} height={30} />
				</div>

				<div className='col-lg-5'>
					<Skeleton count={2} height={30} />
				</div>
				<div className='col-lg-3'>
					<Skeleton count={2} height={30} />
				</div>
			</FormGroupContainer>
			<Separator />

			{/* Goal Type Configuration grid */}
			<FormGroupContainer>
				<div className='col-lg-2 mb-3'>
					<Skeleton count={1} height={30} />
				</div>
			</FormGroupContainer>
			<FormGroupContainer>
				<div className='col mb-3'>
					<Skeleton count={1} height={400} />
				</div>
			</FormGroupContainer>
			<FormGroupContainer>
				<div className='col mb-5'>
					<Skeleton width={150} count={1} height={30} />
				</div>
			</FormGroupContainer>
			<Separator />
			<FormGroupContainer>
				<div className='col-lg-4 '>
					<Skeleton count={2} height={30} />
				</div>
				<div className='col-lg-4 mb-3'>
					<Skeleton count={2} height={30} />
				</div>
			</FormGroupContainer>
			<Separator />
			{/* <FormGroupContainer>
				<div className='col-lg-1'>
					<Skeleton count={1} height={30} />
				</div>
				<div className='col-lg-1 mb-5'>
					<Skeleton count={1} height={30} />
				</div>
			</FormGroupContainer> */}
		</>
	);
};

export default SkeletonLoading;
