import React from 'react';
import Skeleton from 'react-loading-skeleton';
import {FormGroupContainer} from '../../../../custom-components';

interface SkeletonBlockProps {
	height: number;
	columnSize?: string;
	marginBottom?: string;
}

const SkeletonBlock: React.FC<SkeletonBlockProps> = ({height, columnSize = 'col-lg-2', marginBottom = 'mb-3'}) => {
	return (
		<FormGroupContainer>
			<div className={`${columnSize} ${marginBottom}`}>
				<Skeleton count={1} height={height} />
			</div>
		</FormGroupContainer>
	);
};

const ChatStatisticSkeletonLoading: React.FC = () => {
	return (
		<>
			<SkeletonBlock height={30} />
			<SkeletonBlock height={30} />
			<SkeletonBlock height={30} />
			<SkeletonBlock height={200} columnSize='col' />
			<SkeletonBlock height={30} />
			<SkeletonBlock height={200} columnSize='col' />
			<SkeletonBlock height={30} />
			<SkeletonBlock height={200} columnSize='col' />
		</>
	);
};

export default ChatStatisticSkeletonLoading;
