import React, {useEffect, useState} from 'react';
import {shallowEqual, useSelector} from 'react-redux';
import {RootState} from '../../../../../setup';
import {LookupModel} from '../../../../common/model';
import {ChannelType, ElementStyle} from '../../../../constants/Constants';
import {ButtonsContainer, FormGroupContainer, MlabButton} from '../../../../custom-components';
import CommonLookups from '../../../../custom-functions/CommonLookups';
import {SelectFilter, TextFilter} from '../../../relationship-management/shared/components';
import {USER_CLAIMS} from '../../../user-management/components/constants/UserClaims';
import {useMasterReferenceOption, useMessageTypeOptions} from '../../../../custom-functions';
import {AppConfigSettingFilterModel} from '../../models/AppConfigSettingFilterModel';
import {MasterReference} from '../../../system/components/constants/CampaignSetting';

type AppConfigSettingFilterProps = {
	loading: boolean;
	searchAppConfigSetting: (filter: AppConfigSettingFilterModel) => void;
	clearFilter: () => void;
};

const AppConfigSettingFilter: React.FC<AppConfigSettingFilterProps> = ({
	loading,
	searchAppConfigSetting,
	clearFilter,
}: AppConfigSettingFilterProps) => {
	const userAccess = useSelector<RootState>(({auth}) => auth.access, shallowEqual) as string;
	//constant
	const applicationOptions = [{value: '283', label: 'Live Person Integration'}];
	const [applicationIdFilter, setApplicationIdFilter] = useState<LookupModel | null>(applicationOptions[0]);
	const [keyFilter, setKeyFilter] = useState('');
	const masterReference = useMasterReferenceOption(`${MasterReference.MLABService}`);
	const handleSearch = () => {
		const filter: AppConfigSettingFilterModel = {
			appConfigSettingId: 0,
			applicationId: applicationIdFilter ? Number(applicationIdFilter.value) : undefined,
			dataType: '',
			key: '',
			value: '',
		};

		searchAppConfigSetting(filter);
	};

	const handleClear = () => {
		setApplicationIdFilter(applicationOptions[0]);
		setKeyFilter('');
		clearFilter();
	};

	return (
		<>
			<FormGroupContainer>
				<div className='col-lg-4 my-2'>
					<SelectFilter
						isRequired={false}
						isMulti={false}
						label='Application'
						options={masterReference.filter((obj) => obj.masterReferenceParentId === MasterReference.MLABService).map((obj) => obj.options)}
						onChange={(val: any) => setApplicationIdFilter(val)}
						value={applicationIdFilter}
					/>
				</div>

				<div className='col-lg-4 my-2'>
					<TextFilter label='Key' onChange={(val: any) => setKeyFilter(val)} value={keyFilter} />
				</div>
			</FormGroupContainer>
			<ButtonsContainer>
				<MlabButton
					access={userAccess.includes(USER_CLAIMS.AdminRead)}
					//access={true}
					label='Search'
					style={ElementStyle.primary}
					type={'button'}
					weight={'solid'}
					size={'sm'}
					loading={loading}
					loadingTitle={'Please wait...'}
					disabled={loading}
					onClick={handleSearch}
				/>
				<MlabButton
					access={userAccess.includes(USER_CLAIMS.AdminRead)}
					//access={true}
					label='Clear'
					style={ElementStyle.secondary}
					type={'button'}
					weight={'solid'}
					size={'sm'}
					loading={loading}
					loadingTitle={'Please wait...'}
					disabled={loading}
					onClick={handleClear}
				/>
			</ButtonsContainer>
		</>
	);
};

export default AppConfigSettingFilter;
