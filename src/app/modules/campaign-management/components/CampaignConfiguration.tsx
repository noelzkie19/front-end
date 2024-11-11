import React, {useEffect, useState} from 'react';
import {FieldContainer} from '../../../custom-components';
import {CampaignConfigurationEligibility} from './CampaignConfigurationEligibility';
import {CampaignConfigurationTagging} from './CampaignConfigurationTagging';
import {CampaignConfigurationGoal} from './CampaignConfigurationGoal';
import {CampaignConfigurationExchangeRate} from './CampaignConfigurationExchangeRate';
import {CampaignMessageTypeEnum} from '../../../constants/Constants';
import {shallowEqual, useSelector} from 'react-redux';
import {RootState} from '../../../../setup';

export const CampaignConfiguration = () => {
	const [isViewMode, setIsViewMode] = useState<boolean>(false);
	const [isCall, setIsCall] = useState<boolean>(true);
	const mode = useSelector<RootState>(({campaign}) => campaign.mode, shallowEqual) as string;
	const messageType = useSelector<RootState>(
		({campaign}) => campaign.campaign?.campaignConfigurationCommunicationModel?.messageType,
		shallowEqual
	) as string;

	useEffect(() => {
		setIsViewMode(false);
		setIsCall(true);
	}, []);
	useEffect(() => {
		setIsViewMode(false);
		if (mode === 'view') {
			setIsViewMode(true);
		}
	}, [mode]);
	useEffect(() => {
		console.log(messageType);
		if (messageType == CampaignMessageTypeEnum.Email || messageType == CampaignMessageTypeEnum.WebPush) {
			setIsCall(false);
		} else {
			setIsCall(true);
		}
	}, [messageType]);

	return (
		<FieldContainer>
			<CampaignConfigurationEligibility viewMode={isViewMode} />
			<>{isCall && <CampaignConfigurationTagging viewMode={isViewMode} />}</>
			<CampaignConfigurationGoal viewMode={isViewMode} />
			<CampaignConfigurationExchangeRate viewMode={isViewMode} />
		</FieldContainer>
	);
};
