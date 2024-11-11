import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import {Tab, Tabs} from 'react-bootstrap';
import {FormGroupContainer, FormGroupContainerBordered} from '../../../../custom-components';
import { LookupModel } from '../../../../common/model';
import { useCaseManagementHooks } from '../../shared/hooks/useCaseManagementHooks';

interface Props {
	caseDetails?: any;
}

export const CustomerCaseInformationSec: React.FC<Props> = ({caseDetails}) => {
	const { getAllCampaignOptions, campaignOptions } = useCaseManagementHooks();
	const {brand} = caseDetails;
	const [campaignNames, setCampaignNames] = useState<Array<LookupModel>>(caseDetails.campaignList?.map((i: any) => { return { value: i.campaignId.toString(), label: i.campaignName ?? '' }}));

	useEffect(() => {
		getAllCampaignOptions();
	}, []);

	const onChangeCampaignNames = (value: any) => {
		setCampaignNames(value);
	}

	return (
		<>
			<FormGroupContainerBordered>
				<Tabs defaultActiveKey='genInfo' id='case-details' style={{fontWeight: '600'}} className='mb-3 fs-5'>
					<Tab eventKey='genInfo' title='General Information' tabClassName='case-tabitem'>
						<FormGroupContainer>
							<div className='row mt-3'>
								<div className='col-lg-3'>
									<label className='required'>Brand</label>
									<input type='text' className='form-control form-control-sm' disabled aria-label='Brand' value={brand} />
								</div>

								<div className='col-lg-3'>
									<label>Case Status</label>
									<input type='text' className='form-control form-control-sm' disabled aria-label='CaseStatus' value={caseDetails?.caseStatus} />
								</div>

								<div className='col-lg-3'>
									<label>Currency</label>
									<input type='text' className='form-control form-control-sm' disabled aria-label='Currency' value={caseDetails?.currency} />
								</div>
							</div>
							<div className='row'>
								<div className='col-lg-3 mt-3'>
									<label className='required'>Case Type</label>
									<input type='text' className='form-control form-control-sm' disabled aria-label='CaseType' value={caseDetails?.caseType} />
								</div>

								<div className='col-lg-3 mt-3'>
									<label className='required'>Case Owner</label>
									<input type='text' className='form-control form-control-sm' disabled aria-label='CaseOwner' value={caseDetails?.caseOwner} />
								</div>

								<div className='col-lg-3 mt-3'>
									<label>VIP Level</label>
									<input type='text' className='form-control form-control-sm' disabled aria-label='VipLevel' value={caseDetails?.vipLevel} />
								</div>
							</div>
							<div className='row'>
								<div className='col-lg-3 mt-3'>
									<label className='required'>Username</label>
									<input type='text' className='form-control form-control-sm' disabled aria-label='Username' value={caseDetails?.username} />
								</div>

								<div className='col-lg-3 mt-3'>
									<label className='required'>Player ID</label>
									<input type='text' className='form-control form-control-sm' disabled aria-label='PlayerID' value={caseDetails?.playerId} />
								</div>

								<div className='col-lg-3 mt-3'>
									<label>Payment Group</label>
									<input type='text' className='form-control form-control-sm' disabled aria-label='PaymentGroup' value={caseDetails?.paymentGroup} />
								</div>
							</div>
							<div className='row'>
								<div className='col-lg-9 mt-3'>
									<label className="w-100">Campaign Name
										<Select
											isMulti
											size='small'
											options={campaignOptions}
											onChange={onChangeCampaignNames}
											value={campaignNames}
											isDisabled={true}
										/>
									</label>
								</div>
							</div>
						</FormGroupContainer>
					</Tab>
					<Tab eventKey='caseSystem' title='Case System Data' tabClassName='case-tabitem'>
						<FormGroupContainer>
							<div className='row mt-5'>
								<div className='col-lg-2'>
									<label className='fw-bolder'>Case Origin</label>
								</div>

								<div className='col-lg-2'>
									<label className='fw-bolder'>Case Created Date</label>
								</div>

								<div className='col-lg-2'>
									<label className='fw-bolder'>Case Created By</label>
								</div>
								<div className='col-lg-2'>
									<label className='fw-bolder'>Updated Date</label>
								</div>

								<div className='col-lg-2'>
									<label className='fw-bolder'>Updated By</label>
								</div>

								<div className='col-lg-2'>
									<label className='fw-bolder'>Case Owner</label>
								</div>
							</div>
							<div className='row mb-8'>
								<div className='col-lg-2'>
									<label>{caseDetails?.caseOrigin}</label>
								</div>

								<div className='col-lg-2'>
									<label>{caseDetails?.caseCreatedDate}</label>
								</div>

								<div className='col-lg-2'>
									<label>{caseDetails?.caseCreatedBy}</label>
								</div>
								<div className='col-lg-2'>
									<label>{caseDetails?.updatedDate}</label>
								</div>

								<div className='col-lg-2'>
									<label>{caseDetails?.updatedBy}</label>
								</div>

								<div className='col-lg-2'>
									<label>{caseDetails?.caseOwner}</label>
								</div>
							</div>
						</FormGroupContainer>
					</Tab>
				</Tabs>
			</FormGroupContainerBordered>
			<FormGroupContainerBordered>
				<h5>Case Information</h5>
				<FormGroupContainer>
					<div className='row mt-5'>
						<div className='col-lg-10'>
							<label>Subject</label>
							<input type='text' className='form-control form-control-sm' disabled aria-label='Subject' value={caseDetails?.subject} />
						</div>
					</div>
					<div className='row'>
						<div className='col-lg-1 mt-3'>
							<label className='required'>Language</label>
							<input type='text' className='form-control form-control-sm' disabled aria-label='LanguageCode' value={caseDetails?.languageCode} />
						</div>

						<div className='col-lg-3 mt-3'>
							<label className='required'>Topic</label>
							<input type='text' className='form-control form-control-sm' disabled aria-label='Topic' value={caseDetails?.topic} />
						</div>

						<div className='col-lg-6 mt-3'>
							<label className='required'>Subtopic</label>
							<input type='text' className='form-control form-control-sm' disabled aria-label='Subtopic' value={caseDetails?.subtopic} />
						</div>
					</div>
				</FormGroupContainer>
			</FormGroupContainerBordered>
		</>
	);
};

export default CustomerCaseInformationSec;
