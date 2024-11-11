import React, {useEffect, useState} from 'react';
import { shallowEqual, useSelector } from 'react-redux';
import swal from 'sweetalert';
import { RootState } from '../../../../../setup';
import {ChannelType, ElementStyle, PROMPT_MESSAGES} from '../../../../constants/Constants';
import {ButtonsContainer, FormGroupContainer, MlabButton} from '../../../../custom-components';
import { useMessageTypeOptions } from '../../../../custom-functions';
import CommonLookups from '../../../../custom-functions/CommonLookups';
import {LookupModel} from '../../../../shared-models/LookupModel';
import { IAuthState } from '../../../auth';
import {SelectFilter, TextAreaFilter, TextFilter} from '../../../relationship-management/shared/components';
import { USER_CLAIMS } from '../../../user-management/components/constants/UserClaims';
import {PostChatSurveyFilterModel} from '../../models';
import { LicenseResponseModel } from '../../models/response/LicenseResponseModel';
import { SkillsResponseModel } from '../../models/response/SkillsResponseModel';
import {useSystemOptionHooks} from '../../shared';

type PostChatSurveyFilterProps = {
	loading: boolean;
	searchPostChatSurvey: (filter: PostChatSurveyFilterModel) => void;
	clearFilter: () => void;
	addNewPostChatSurvey: () => void;
};

const PostChatSurveyFilter: React.FC<PostChatSurveyFilterProps> = ({
	loading,
	searchPostChatSurvey,
	clearFilter,
	addNewPostChatSurvey,
}: PostChatSurveyFilterProps) => {
	// Hooks
	const {getPostChatSurveyOptions, postChatSurveyOptions} = useSystemOptionHooks();
	const {access} = useSelector<RootState>(({auth}) => auth, shallowEqual) as IAuthState;

	// States
	const [brandIdFilter, setBrandIdFilter] = useState<any>(null);
	const [messageTypeFilter, setMessageTypeFilter] = useState<any>(null);
	const [licenseFilter, setLicenseFilter] = useState<LookupModel | null>(null);
	const [skillFilter, setSkillFilter] = useState<Array<LookupModel>>([]);
	const [statusFilter, setStatusFilter] = useState<LookupModel | null>(null);
	const [surveyIdFilter, setSurveyIdFilter] = useState<any>('');

	const [questionIdFilter, setQuestionIdFilter] = useState('');
	const [questionMessageFilter, setQuestionMessageFilter] = useState('');
	const [questionMessageENFilter, setQuestionMessageENFilter] = useState('');
	const messageTypeOptions = useMessageTypeOptions(ChannelType.ChatIntegrationId);

	const [licenseListOptions, setLicenseListOptions] = useState<Array<LicenseResponseModel>>([]);
	const [skillListOptions, setSkillListOptions] = useState<Array<SkillsResponseModel>>([]);
	
	// Side Effects
	useEffect(() => {
		getPostChatSurveyOptions();
	}, []);


	useEffect(() => {
		const licenses = postChatSurveyOptions.licenseByBrandMessageType.filter(t => t.messageTypeId == messageTypeFilter?.value && t.brandId == brandIdFilter?.value);
		setLicenseListOptions(licenses);
	}, [brandIdFilter, messageTypeFilter])

	useEffect(() => {
		const skills = postChatSurveyOptions.skillsByLicense.filter(t => t.license === licenseFilter?.label && t.messageTypeId == messageTypeFilter?.value && t.brandId == brandIdFilter?.value);
		setSkillListOptions(skills);
	}, [licenseFilter]);

	// Methods
	const handleSearch = () => {
		const filter: PostChatSurveyFilterModel = {
			brandId: brandIdFilter ? Number(brandIdFilter.value) : undefined,
			messageTypeId: messageTypeFilter ? Number(messageTypeFilter.value) : undefined,
			licenseId: licenseFilter ? licenseFilter.value.toString() : '',
			skillIds: skillFilter ? skillFilter.map((i) => i.value).join(',') : '',
			questionId: questionIdFilter,
			questionMessage: questionMessageFilter,
			questionMessageEN: questionMessageENFilter,
			status: statusFilter ? Number(statusFilter.value) : undefined,
			surveyId: surveyIdFilter
		};

		if (filter.brandId === null || filter.brandId === undefined || (filter.brandId !== undefined && filter.brandId === 0)) {
			swal(PROMPT_MESSAGES.FailedValidationTitle, PROMPT_MESSAGES.FailedValidationMandatoryMessage, 'error');
			return;
		}

		searchPostChatSurvey(filter);
	};

	const handleClear = () => {
		setBrandIdFilter(null);
		setMessageTypeFilter(null);
		setLicenseFilter(null);
		setSkillFilter([]);
		setQuestionIdFilter('');
		setQuestionMessageFilter('');
		setQuestionMessageENFilter('');
		setSurveyIdFilter('')
		setStatusFilter(null)
		clearFilter();
	};

	return (
		<>
			<FormGroupContainer>
				<div className='col-lg-3 col-sm-6 my-2'>
					<SelectFilter
						isRequired={true}
						isMulti={false}
						label='Brand'
						options={CommonLookups('brands')}
						onChange={(val: any) => setBrandIdFilter(val)}
						value={brandIdFilter}
					/>
				</div>
				<div className='col-lg-3  col-sm-6 my-2'>
					<SelectFilter
						isRequired={false}
						isMulti={false}
						label='Message Type'
						options={messageTypeOptions}
						onChange={(val: any) => setMessageTypeFilter(val)}
						value={messageTypeFilter}
					/>
				</div>
				<div className='col-lg-3 col-sm-6 my-2'>
					<SelectFilter
						isRequired={false}
						isMulti={false}
						label='License'
						options={licenseListOptions}
						onChange={(val: any) => setLicenseFilter(val)}
						value={licenseFilter}
					/>
				</div>
				<div className='col-lg-3 col-sm-6 my-2'>
					<SelectFilter
						isRequired={false}
						isMulti={true}
						label='Skill'
						options={skillListOptions}
						onChange={(val: any) => setSkillFilter(val)}
						value={skillFilter}
					/>
				</div>
			</FormGroupContainer>
			<FormGroupContainer>
				<div className='col-lg-3 col-sm-6 my-2'>
					<SelectFilter
						isRequired={false}
						isMulti={false}
						label='Status'
						options={CommonLookups('settingStatuses')}
						onChange={(val: any) => setStatusFilter(val)}
						value={statusFilter}
					/>
				</div>
				<div className='col-lg-3 col-sm-12 my-2'>
					<TextFilter label='Survey ID' onChange={(val: any) => setSurveyIdFilter(val)} value={surveyIdFilter} />
				</div>
				<div className='col-lg-6 col-sm-12 my-2'>
					<TextFilter label='Question Id' onChange={(val: any) => setQuestionIdFilter(val)} value={questionIdFilter} />
				</div>
			</FormGroupContainer>
			<FormGroupContainer>
			<div className='col-lg-6 col-sm-12 my-2'>
					<TextAreaFilter label='Question Messsage' onChange={(val: any) => setQuestionMessageFilter(val)} value={questionMessageFilter} />
				</div>
				<div className='col-lg-6 col-sm-12 my-2'>
					<TextAreaFilter label='Question Message (EN)' onChange={(val: any) => setQuestionMessageENFilter(val)} value={questionMessageENFilter} />
				</div>
			</FormGroupContainer>
			<ButtonsContainer>
				<MlabButton
					access={true}
					label='Search'
					style={ElementStyle.primary}
					type={'button'}
					weight={'solid'}
					size={'sm'}
					loading={loading}
					loadingTitle={'Please wait...'}
					disabled={loading || !access?.includes(USER_CLAIMS.PostChatSurveyRead)}
					onClick={handleSearch}
				/>
				<MlabButton
					access={true}
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
					access={access?.includes(USER_CLAIMS.PostChatSurveyWrite)}
					label='Add New'
					style={ElementStyle.primary}
					type={'button'}
					weight={'solid'}
					size={'sm'}
					loading={loading}
					loadingTitle={'Please wait...'}
					disabled={loading}
					onClick={addNewPostChatSurvey}
				/>
			</ButtonsContainer>
		</>
	);
};

export default PostChatSurveyFilter;