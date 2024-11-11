import '../../../../_metronic/assets/sass/core/components/_variables.scss';
import {ElementStyle, PROMPT_MESSAGES} from '../../../constants/Constants';
import {ButtonsContainer, ContentContainer, DefaultDateRangePicker, FormGroupContainer, FormHeader, MlabButton} from '../../../custom-components';
import Select from 'react-select';
import useUserProfile from '../../../custom-functions/user/useUserProfile';
import CommonLookups from '../../../custom-functions/CommonLookups';
import {LookupModel} from '../../../shared-models/LookupModel';
import {useEffect, useState} from 'react';
import {useCommunicationReviewReportHooks} from '../hooks/useCommunicationReviewReportHooks';
import {disableSplashScreen, enableSplashScreen} from '../../../utils/helper';
import swal from 'sweetalert';
import {CommReviewReportFilterRequestModel} from './models/requests/CommReviewReportFilterRequestModel';
import {GenerateCommunicationReviewReport} from '../services/CommunicationReviewReportApi';
import moment from 'moment';
import {Guid} from 'guid-typescript';
import {shallowEqual, useSelector} from 'react-redux';
import {RootState} from '../../../../setup';
import {CommReviewReportFilterResponseModel} from './models/response/CommReviewReportFilterResponseModel';
import {CommunicationReviewRemarks} from './models/response/CommunicationReviewRemarks';
import {htmlDecode} from 'js-htmlencode';
import useCommunicationReviewHooks from '../../case-management/shared/hooks/useCommunicationReviewHooks';
import {USER_CLAIMS} from '../../user-management/components/constants/UserClaims';
import {IAuthState} from '../../auth';
import * as XLSX from 'xlsx'

export const CommunicationReviewReportFilter = ({onClickSearch}: any) => {
	const userAccessId = useSelector<RootState>(({auth}) => auth.userId, shallowEqual) as number;
	const userProfile = useUserProfile();
	const {getTeamListOptions, getUserListOptions, teamListOptions, userListOptions} = useCommunicationReviewReportHooks();
	const {getCommunicationReviewLookups, reviewPeriodOptions} = useCommunicationReviewHooks();
	const {access} = useSelector<RootState>(({auth}) => auth, shallowEqual) as IAuthState;

	const [displayTypeFilter, setDisplayTypeFilter] = useState<LookupModel | null>({value: '352', label: 'Individual'});
	const [revieweeFilter, setRevieweeFilter] = useState<Array<LookupModel>>([]);
	const [reviewerFilter, setReviewerFilter] = useState<Array<LookupModel>>([]);
	const [revieweeTeamsFilter, setRevieweeTeamsFilter] = useState<Array<LookupModel>>([]);
	const [commRangePeriodFilter, setCommRangePeriodFilter] = useState<any>();
	const [commRangeStartDateFilter, setCommRangeStartDateFilter] = useState<any>();
	const [commRangeEndDateFilter, setCommRangeEndDateFilter] = useState<any>();
	const [reviewPeriodFilter, setReviewPeriodFilter] = useState<LookupModel | null>();
	const [lineCommentFilter, setLineCommentFilter] = useState<LookupModel | null>();

	useEffect(() => {
		enableSplashScreen();
		getTeamListOptions();
		getUserListOptions();
		getCommunicationReviewLookups();

		//set default value to Communication Range Period
		let dateTodayFrom = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
		let dateTodayTo = new Date(new Date());

		setCommRangeStartDateFilter(dateTodayFrom);
		setCommRangeEndDateFilter(dateTodayTo);
		setCommRangePeriodFilter([dateTodayFrom, dateTodayTo]);
	}, []);

	useEffect(() => {
		if (userProfile) {
			//set default value for reviewee team and reviewee
			let revieweeTeams = Array<LookupModel>();
			userProfile?.teams.map((item) => {
				const teamOption: LookupModel = {
					value: item.id,
					label: item.name,
				};

				revieweeTeams.push(teamOption);
			});
			setRevieweeTeamsFilter(revieweeTeams);

			const reviewee = [{value: userProfile?.userId.toString(), label: userProfile?.fullname}] as any;
			setRevieweeFilter(reviewee);
			disableSplashScreen();
		}
	}, [userProfile]);

	function onChangeDisplayTypeFilter(val: any) {
		setDisplayTypeFilter(val);
	}

	function onChangeRevieweeTeamsFilter(val: Array<LookupModel>) {
		setRevieweeTeamsFilter(val);
	}

	function onChangeRevieweeFilter(val: Array<LookupModel>) {
		setRevieweeFilter(val);
	}

	function onChangeReviewerFilter(val: Array<LookupModel>) {
		setReviewerFilter(val);
	}

	function onChangeCommRangePeriodFilter(val: any) {
		if (val != undefined) {
			setCommRangePeriodFilter(val);
			setCommRangeStartDateFilter(val[0]);
			setCommRangeEndDateFilter(val[1]);
		}
	}

	function onChangeReviewPeriodFilter(val: any) {
		setReviewPeriodFilter(val);
	}

	function onChangeLineCommentFilter(val: any) {
		setLineCommentFilter(val);
	}

	function validateRequiredValues(communicationRangePeriod: any) {
		return !(communicationRangePeriod == null || communicationRangePeriod == '');
	}

	const clearFilters = () => {
		setRevieweeTeamsFilter([]);
		setRevieweeFilter([]);
		setReviewerFilter([]);
		setCommRangeStartDateFilter('');
		setCommRangeEndDateFilter('');
		setCommRangePeriodFilter('');
		setReviewPeriodFilter(null);
		setLineCommentFilter(null);
	};

	const convertToProperCase = (str: string) => {
		// Convert string to proper case
		return str.charAt(0).toUpperCase() + str.slice(1);
	  }

	const generateReport = () => {
		if (!validateRequiredValues(commRangePeriodFilter)) {
			swal(PROMPT_MESSAGES.FailedValidationTitle, PROMPT_MESSAGES.FailedValidationMandatoryMessage, 'error');
			return;
		}

		let request: CommReviewReportFilterRequestModel = requestData();
		enableSplashScreen();
		GenerateCommunicationReviewReport(request)
			.then((response) => {
				let result: CommReviewReportFilterResponseModel = {...response.data};
				result?.communicationReviewRemarks.map((cat: CommunicationReviewRemarks) => {
					cat.criteria = htmlDecode(cat.criteria).replace(/\n/g, '');
					return {...cat};
				});

				const headersCommReviewScore = Object.keys(result.communicationReviewScoreData[0]).map(convertToProperCase);
				const headersCommReviewRemarks = (result.communicationReviewRemarks && result.communicationReviewRemarks.length > 0) 
													? Object.keys(result.communicationReviewRemarks[0]).map(convertToProperCase) : [];

				const dataCommReviewScore = [headersCommReviewScore, ...result.communicationReviewScoreData.map(obj => Object.values(obj))];
				const dataCommReviewRemarks = [headersCommReviewRemarks, ...result.communicationReviewRemarks.map(obj => Object.values(obj))];

				const wb = XLSX.utils.book_new();
				const ws1 = XLSX.utils.aoa_to_sheet(dataCommReviewScore);
				const ws2 = XLSX.utils.aoa_to_sheet(dataCommReviewRemarks);
				
				XLSX.utils.book_append_sheet(wb, ws1, 'Communication Review Score Data')
				XLSX.utils.book_append_sheet(wb, ws2, 'Communication Review Remarks')

				XLSX.writeFile(wb, `Communication Review Report ${moment(new Date()).format('DD/MM/yyyy')}.xlsx`);
				disableSplashScreen();
			})
			.catch(() => {
				swal('Failed', 'Problem in exporting list', 'error');
				disableSplashScreen();
			});
	}

	const searchQuery = () => {
		if (!validateRequiredValues(commRangePeriodFilter)) {
			swal(PROMPT_MESSAGES.FailedValidationTitle, PROMPT_MESSAGES.FailedValidationMandatoryMessage, 'error');
			return;
		}
		let request: CommReviewReportFilterRequestModel = requestData();
		onClickSearch(request);
	};

	const requestData = () => {
		let moldedRequestData:CommReviewReportFilterRequestModel = {
			displayType: displayTypeFilter?.value,
			revieweeTeamIds: revieweeTeamsFilter?.length > 0 ? revieweeTeamsFilter?.map((i) => i.value).join(',') : null,
			revieweeIds: revieweeFilter?.length > 0 ? revieweeFilter?.map((i) => i.value).join(',') : null,
			reviewerIds: reviewerFilter?.length > 0 ? reviewerFilter?.map((i) => i.value).join(',') : null,
			communicationRangeStart: commRangeStartDateFilter,
			communicationRangeEnd: commRangeEndDateFilter,
			reviewPeriod: reviewPeriodFilter?.value !== undefined ? Number(reviewPeriodFilter?.value) : null,
			hasLineComments: lineCommentFilter?.value !== undefined ? Number(lineCommentFilter?.value) : null,
			queueId: Guid.create().toString(),
			userId: userAccessId.toString(),
		}
		return moldedRequestData
	}
	return (
		<FormGroupContainer>
			<FormHeader headerLabel={'Search Communication Review Report'} />
			<ContentContainer>
				<FormGroupContainer>
					<div className='col-lg-3 col-sm-6 my-2'>
						<div className='form-control-label mb-2 required'>Display Result By</div>
						<Select
							size='small'
							style={{width: '100%'}}
							options={CommonLookups('reviewDisplayType')}
							onChange={onChangeDisplayTypeFilter}
							value={displayTypeFilter}
							isDisabled={true}
						/>
					</div>
					<div className='col-lg-3 col-sm-6 my-2'>
						<div className='form-control-label mb-2'>Reviewee Team</div>
						<Select
							isMulti
							size='small'
							style={{width: '100%'}}
							options={teamListOptions}
							onChange={onChangeRevieweeTeamsFilter}
							value={revieweeTeamsFilter}
							isDisabled={!access?.includes(USER_CLAIMS.CommunicationReviewReportWrite)}
						/>
					</div>
					<div className='col-lg-3 col-sm-6 my-2'>
						<div className='form-control-label mb-2'>Reviewee</div>
						<Select
							isMulti
							size='small'
							style={{width: '100%'}}
							options={userListOptions}
							onChange={onChangeRevieweeFilter}
							value={revieweeFilter}
							isDisabled={!access?.includes(USER_CLAIMS.CommunicationReviewReportWrite)}
						/>
					</div>
					<div className='col-lg-3 col-sm-6 my-2'>
						<div className='form-control-label mb-2'>Reviewer</div>
						<Select isMulti size='small' style={{width: '100%'}} options={userListOptions} onChange={onChangeReviewerFilter} value={reviewerFilter} />
					</div>
					<div className='col-lg-3 col-sm-6 my-2'>
						<div className='form-control-label mb-2 required'>Communication Range Period</div>
						<DefaultDateRangePicker format='yyyy-MM-dd HH:mm' maxDays={180} onChange={onChangeCommRangePeriodFilter} value={commRangePeriodFilter} />
					</div>
					<div className='col-lg-3 col-sm-6 my-2'>
						<div className='form-control-label mb-2'>Review Period</div>
						<Select
							size='small'
							style={{width: '100%'}}
							options={reviewPeriodOptions}
							onChange={onChangeReviewPeriodFilter}
							value={reviewPeriodFilter}
							isClearable={true}
						/>
					</div>
					<div className='col-lg-3 col-sm-6 my-2'>
						<div className='form-control-label mb-2'>Line Comment</div>
						<Select
							size='small'
							style={{width: '100%'}}
							options={[
								{value: '1', label: 'Yes'},
								{value: '0', label: 'No'},
							]}
							onChange={onChangeLineCommentFilter}
							value={lineCommentFilter}
							isDisabled={true}
						/>
					</div>
				</FormGroupContainer>
				<FormGroupContainer>
					<ButtonsContainer>
						<MlabButton
							access={true}
							label='Search'
							style={ElementStyle.primary}
							type={'button'}
							weight={'solid'}
							size={'sm'}
							loading={false}
							loadingTitle={'Please wait...'}
							disabled={false}
							onClick={searchQuery}
						/>
						<MlabButton
							access={true}
							label='Clear'
							style={ElementStyle.secondary}
							type={'button'}
							weight={'solid'}
							size={'sm'}
							loading={false}
							loadingTitle={'Please wait...'}
							disabled={false}
							onClick={clearFilters}
						/>
						<MlabButton
							access={true}
							label='Generate'
							style={ElementStyle.primary}
							type={'button'}
							weight={'solid'}
							size={'sm'}
							loading={false}
							loadingTitle={'Please wait...'}
							disabled={false}
							onClick={generateReport}
						/>
					</ButtonsContainer>
				</FormGroupContainer>
			</ContentContainer>
		</FormGroupContainer>
	);
};

export default CommunicationReviewReportFilter;
