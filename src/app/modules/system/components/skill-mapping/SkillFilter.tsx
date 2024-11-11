import React, {useState} from 'react';
import {shallowEqual, useSelector} from 'react-redux';
import {RootState} from '../../../../../setup';
import {LookupModel} from '../../../../common/model';
import {ChannelType, ElementStyle} from '../../../../constants/Constants';
import {ButtonsContainer, FormGroupContainer, MlabButton} from '../../../../custom-components';
import CommonLookups from '../../../../custom-functions/CommonLookups';
import {SelectFilter, TextFilter} from '../../../relationship-management/shared/components';
import {SkillFilterModel} from '../../models';
import {USER_CLAIMS} from '../../../user-management/components/constants/UserClaims';
import { useMessageTypeOptions } from '../../../../custom-functions';

type SkillFilterProps = {
	loading: boolean;
	searchSkill: (filter: SkillFilterModel) => void;
	clearFilter: () => void;
	addNewSkill: () => void;
};

const SkillFilter: React.FC<SkillFilterProps> = ({loading, searchSkill, clearFilter, addNewSkill}: SkillFilterProps) => {
	const userAccess = useSelector<RootState>(({auth}) => auth.access, shallowEqual) as string;
	const messageTypeOptions = useMessageTypeOptions(ChannelType.ChatIntegrationId);
	
	const [brandIdFilter, setBrandIdFilter] = useState<LookupModel | null>(null);
	const [messageTypeFilter, setMessageTypeFilter] = useState<Array<LookupModel>>([]);
	const [statusFilter, setStatusFilter] = useState<LookupModel | null>(null);
	const [licenseIdFilter, setLicenseIdFilter] = useState('');
	const [skillIdFilter, setSkillIdFilter] = useState('');
	const [skillNameFilter, setSkillNameFilter] = useState('');

	const handleSearchSkill = () => {
		const filter: SkillFilterModel = {
			brandId: brandIdFilter ? Number(brandIdFilter.value) : undefined,
			messageTypeIds: messageTypeFilter ? messageTypeFilter.map((i) => i.value).join(',') : '',
			isActive: statusFilter && statusFilter.value !== ''? (statusFilter.value === '1' ? true : false) : undefined,
			licenseId: licenseIdFilter,
			skillId: skillIdFilter,
			skillName: skillNameFilter,
		};

		searchSkill(filter);
	};

	const handleClear = () => {
		setBrandIdFilter(null);
		setMessageTypeFilter([]);
		setStatusFilter(null);
		setLicenseIdFilter('');
		setSkillIdFilter('');
		setSkillNameFilter('');
		clearFilter();
	};

	return (
		<>
			<FormGroupContainer>
				<div className='col-lg-4 my-2'>
					<SelectFilter
						isRequired={false}
						isMulti={false}
						label='Brand'
						options={CommonLookups('brands')}
						onChange={(val: any) => setBrandIdFilter(val)}
						value={brandIdFilter}
					/>
				</div>

				<div className='col-lg-4 my-2'>
					<SelectFilter
						isRequired={false}
						isMulti={true}
						label='Message Type'
						options={messageTypeOptions}
						onChange={(val: any) => setMessageTypeFilter(val)}
						value={messageTypeFilter}
					/>
				</div>

				<div className='col-lg-4 my-2'>
					<SelectFilter
						isRequired={false}
						isMulti={false}
						label='Status'
						options={CommonLookups('settingStatuses').concat({label: 'Select All', value: ''})
						.reverse()}
						onChange={(val: any) => setStatusFilter(val)}
						value={statusFilter}
					/>
				</div>
			</FormGroupContainer>
			<FormGroupContainer>
				<div className='col-lg-4 my-2'>
					<TextFilter label='License ID' onChange={(val: any) => setLicenseIdFilter(val)} value={licenseIdFilter} />
				</div>
				<div className='col-lg-4 my-2'>
					<TextFilter label='Skill ID' onChange={(val: any) => setSkillIdFilter(val)} value={skillIdFilter} />
				</div>
				<div className='col-lg-4 my-2'>
					<TextFilter label='Skill Name' onChange={(val: any) => setSkillNameFilter(val)} value={skillNameFilter} />
				</div>
			</FormGroupContainer>
			<ButtonsContainer>
				<MlabButton
					access={userAccess.includes(USER_CLAIMS.SkillMappingRead)}
					label='Search'
					style={ElementStyle.primary}
					type={'button'}
					weight={'solid'}
					size={'sm'}
					loading={loading}
					loadingTitle={'Please wait...'}
					disabled={loading}
					onClick={handleSearchSkill}
				/>
				<MlabButton
					access={userAccess.includes(USER_CLAIMS.SkillMappingRead)}
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
				<MlabButton
					access={userAccess.includes(USER_CLAIMS.SkillMappingWrite)}
					label='Add New'
					style={ElementStyle.primary}
					type={'button'}
					weight={'solid'}
					size={'sm'}
					loading={loading}
					loadingTitle={'Please wait...'}
					disabled={loading}
					onClick={addNewSkill}
				/>
			</ButtonsContainer>
		</>
	);
};

export default SkillFilter;
