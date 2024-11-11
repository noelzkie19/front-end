import React, { useEffect, useState } from 'react';
import {useFormik} from 'formik';
import swal from 'sweetalert';
import {AccordionHeaderType, ElementStyle, PROMPT_MESSAGES} from '../../../../constants/Constants';
import {FilterAccordion, FormContainer, FormGroupContainer, MainContainer, MlabButton} from '../../../../custom-components';
import {DateRangeFilter, SelectFilter, TextFilter} from '../../shared/components';
import CommonLookups from '../../../../custom-functions/CommonLookups';
import {useRemAssignStatusOptionsList} from '../../shared/hooks';
import {RemDistributionFilterModel, RemLookupsResponseModel} from '../../models';
import {USER_CLAIMS} from '../../../user-management/components/constants/UserClaims';
import {shallowEqual, useSelector} from 'react-redux';
import {RootState} from '../../../../../setup';
import { useBrands, useCurrencies } from '../../../../custom-functions';
import { VIPLevelOptions } from '../../../system/models';
import { getAllVIPLevelByBrand } from '../../../system/redux/SystemService';

type RemDistributionFilterProps = {
	loading: boolean;
	remLookups: RemLookupsResponseModel;
	children?: React.ReactNode;
	search: (param: RemDistributionFilterModel) => void;
	exportToCSV: any;
};

const RemDistributionFilter = ({loading, remLookups, children, search, exportToCSV}: RemDistributionFilterProps) => {
    const userAccessId = useSelector<RootState>(({auth}) => auth.userId, shallowEqual) as number;
	 
	const remAssignStatusOptions = useRemAssignStatusOptionsList();
	const userAccess = useSelector<RootState>(({auth}) => auth.access, shallowEqual) as string;
	const brandList = useBrands(userAccessId);
    const currencyList = useCurrencies(userAccessId);
	const [vipLevelList, setVIPLevelList] = useState<Array<VIPLevelOptions>>([]);

	const formik = useFormik<RemDistributionFilterModel>({
		initialValues: {
			remProfileId: null,
			agentIds: [],
			pseudoNames: [],
			playerId: '',
			userName: '',
			statusId: null,
			currencyIds: [],
			brandId: null,
			vipLevelIds: [],
			assignStatus: null,
			distributionDate: [],
			assignedByIds: [],
		},
		onSubmit: (values, {setSubmitting}) => {
			setSubmitting(true);

			if (values.brandId === null || (values.brandId !== undefined && values.brandId.value === '')) {
				swal(PROMPT_MESSAGES.FailedValidationTitle, PROMPT_MESSAGES.FailedValidationMandatoryMessage, 'error');
				setSubmitting(false);
				return;
			}

			search(values);
			setSubmitting(false);
		},
	});

	const handleClear = () => {
		formik.resetForm();
		setVIPLevelList([]);
	};

	useEffect(() => {
		if(formik.values.brandId){
			const brandId = formik.values.brandId.value;
			getAllVIPLevelByBrand(userAccessId, brandId).then((response) => {
				if (response.status === 200) {
					let tempList = Array<VIPLevelOptions>();
					response.data.forEach(item => {
						const vipLevelOption: VIPLevelOptions = {
							value: item.vipLevelId?.toString() ?? '',
							label: item.vipLevelName,
						};
						tempList.push(vipLevelOption)
					})
					setVIPLevelList(tempList.filter(
						(thing, i, arr) => arr.findIndex(t => t.value === thing.value) === i
					));
				}
				else {
					console.log("Problem in getting VIP Level list by selected brand")
				}
			})
			.catch(() => {
				console.log("Problem in getting VIP Level list by selected brand")
			})
		}
    }, [formik.values.brandId])

	return (
		<MainContainer>
			<div className='card-body p-5'>
				<FormContainer onSubmit={formik.handleSubmit} onReset={formik.resetForm}>
					<FormGroupContainer>
						<h5>
							<i className='bi bi-search'></i> Search Filters
						</h5>
					</FormGroupContainer>
					<div className='separator separator-dashed my-3' />
					<div className='d-flex mb-2'>
						<div style={{marginRight: 5}}>
							<MlabButton
								access={true}
								label='Search'
								style={ElementStyle.primary}
								type={'submit'}
								weight={'solid'}
								size={'sm'}
								loading={loading}
								loadingTitle={'Please wait...'}
								disabled={loading || !userAccess.includes(USER_CLAIMS.RemDistributionRead)}
							/>
						</div>

						<div style={{marginRight: 5}}>
							<MlabButton
								access={true}
								label='Clear'
								style={ElementStyle.secondary}
								type={'button'}
								weight={'solid'}
								size={'sm'}
								onClick={handleClear}
							/>
						</div>
						{exportToCSV()}
					</div>
					<div className='separator separator-dashed my-3' />
					<FormGroupContainer>
						<FilterAccordion type={AccordionHeaderType.light} title='Agent' icon={<i className='bi bi-chat-quote-fill text-primary' />}>
							<SelectFilter
								isMulti={false}
								label='ReM Profile Name'
								options={remLookups.remProfileNames}
								onChange={(val: any) => formik.setFieldValue('remProfileId', val)}
								value={formik.values.remProfileId}
							/>
							<SelectFilter
								isMulti
								label='Agent Name'
								options={remLookups.remAgentNames}
								onChange={(val: any) => formik.setFieldValue('agentIds', val)}
								value={formik.values.agentIds}
							/>

							<SelectFilter
								isMulti
								label='Pseudo Name'
								options={remLookups.remPseudoNames}
								onChange={(val: any) => formik.setFieldValue('pseudoNames', val)}
								value={formik.values.pseudoNames}
							/>
						</FilterAccordion>
						<FilterAccordion type={AccordionHeaderType.light} title='Player' icon={<i className='bi bi-person-fill text-primary' />}>
							<TextFilter label='Player ID' onChange={(val: any) => formik.setFieldValue('playerId', val)} value={formik.values.playerId} />
							<TextFilter label='User Name' onChange={(val: any) => formik.setFieldValue('userName', val)} value={formik.values.userName} />
							<SelectFilter
								isMulti={false}
								label='Status'
								options={CommonLookups('playerStatuses')}
								onChange={(val: any) => formik.setFieldValue('statusId', val)}
								value={formik.values.statusId}
							/>
							<SelectFilter
								isMulti
								label='Currency'
								options={currencyList}
								onChange={(val: any) => formik.setFieldValue('currencyIds', val)}
								value={formik.values.currencyIds}
							/>
							<SelectFilter
								isRequired={true}
								isMulti={false}
								label='Brand'
								options={brandList}
								onChange={(val: any) => formik.setFieldValue('brandId', val)}
								value={formik.values.brandId}
							/>
							<SelectFilter
								isRequired={false}
								isMulti
								label='VIP Level'
								options={vipLevelList}
								onChange={(val: any) => formik.setFieldValue('vipLevelIds', val)}
								value={formik.values.vipLevelIds}
							/>
							<SelectFilter
								isMulti={false}
								label='Assign Status'
								options={remAssignStatusOptions}
								onChange={(val: any) => formik.setFieldValue('assignStatus', val)}
								value={formik.values.assignStatus}
							/>
							<DateRangeFilter
								label='Distribution Date'
								onChange={(val: any) => formik.setFieldValue('distributionDate', val)}
								value={formik.values.distributionDate}
							/>
							<SelectFilter
								isMulti
								label='Assigned By'
								options={remLookups.remAssignedBys}
								onChange={(val: any) => formik.setFieldValue('assignedByIds', val)}
								value={formik.values.assignedByIds}
							/>
						</FilterAccordion>
					</FormGroupContainer>
				</FormContainer>
				{children}
			</div>
		</MainContainer>
	);
};

export default RemDistributionFilter;
