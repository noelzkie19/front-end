import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import {FormGroupContainer} from '../../../../custom-components';

const CodelistLoading = () => {
	return (
		<>
			<FormGroupContainer>
				<div className='col-lg-8'>
					<Skeleton count={2} height={30} />
				</div>

				<div className='col-lg-4 mb-3'>
					<Skeleton count={2} height={30} />
				</div>
			</FormGroupContainer>

			<FormGroupContainer>
				<div className='col-lg-12 mb-3'>
					<Skeleton count={2} height={30} />
				</div>
			</FormGroupContainer>
			<FormGroupContainer>
				<div className='col-lg-12 mb-3'>
					<Skeleton count={2} height={30} />
				</div>
			</FormGroupContainer>
			<div className='separator separator-dashed my-5'></div>
			<FormGroupContainer>
				<div className='col-lg-8 mb-3'>
					<Skeleton count={1} height={30} />
				</div>
			</FormGroupContainer>

			<FormGroupContainer>
				<div className='col-lg-5 '>
					<Skeleton count={2} height={30} />
				</div>
				<div className='col-lg-7 mb-3'>
					<Skeleton count={2} height={30} />
				</div>
			</FormGroupContainer>

			<FormGroupContainer>
				<div className='col-lg-2 mb-3'>
					<Skeleton count={1} height={30} />
				</div>
			</FormGroupContainer>
			{/* grid */}
			<FormGroupContainer>
				<div className='col-lg-12 mb-3'>
					<Skeleton count={1} height={300} />
				</div>
			</FormGroupContainer>

			<FormGroupContainer>
				<div className='col-lg-2' style={{marginLeft: 'auto'}}>
					<Skeleton count={1} height={30} />
				</div>
				<div className='col-lg-2'>
					<Skeleton count={1} height={30} />
				</div>
			</FormGroupContainer>
		</>
	);
};

export default CodelistLoading;
