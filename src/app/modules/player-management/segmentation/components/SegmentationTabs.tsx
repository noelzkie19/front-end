import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect, useState } from 'react';
import { Tab, Tabs } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import { MasterReferenceOptionListModel, MasterReferenceOptionModel } from '../../../../common/model';
import { GetMasterReferenceList } from '../../../../common/services';
import useConstant from '../../../../constants/useConstant';
import { ContentContainer, FormGroupContainer, FormHeader, MainContainer } from '../../../../custom-components';
import { LookupModel } from '../../../../shared-models/LookupModel';
import '../../../campaign-setting/setting-point-incentive/styles/PointIncentiveStyle.css';
import { InFileSegmentPlayerModel, SegmentConditionSaveRequestModel } from '../models';
import { SegmentVarianceModel } from '../models/SegmentVarianceModel';
import useSegmentConstant from '../useSegmentConstant';
import AddSegment from './AddSegment';
import CloneSegment from './CloneSegment';
import { ConvertToStatic } from './ConvertToStatic';
import EditSegment from './EditSegment';
import DistributionList from './shared/components/DistributionList';
import ViewSegment from './ViewSegment';

export const SegmentationTabs: React.FC = () => {
	//constants
	const {PageAction, SegmentTypes, segmentTypeMasterRefId} = useSegmentConstant();

	const {actionName} = useParams();
	const [headerLabel, setHeaderLabel] = useState('');
	const [currentTab, setCurrentTab] = React.useState(0);

	const [selectedTypeOption, setSelectedTypeOption] = useState<LookupModel | null>();

	//	Segment Fields / Data
	const [segmentQueryInputType, setSegmentQueryInputType] = useState<string>('');
	const [segmentTabType, setSegmentTabType] = useState<string>(SegmentTypes.Normal);
	const [segmentObjectName, setSegmentObjectName] = useState<string>('');
	const [segmentObjectDesc, setSegmentObjectDesc] = useState<string>('');
	const [segmentObjectStatus, setSegmentObjectStatus] = useState<boolean>(true);
	const [segmentObjectVarianceList, setSegmentObjectVarianceList] = useState<Array<SegmentVarianceModel>>([]);
	const [segmentObjectQuery, setSegmentObjectQuery] = useState<string>('');
	const [segmentObjectQueryTableau, setSegmentObjectQueryTableau] = useState<string>('');
	const [segmentObjectInFilePlayerIds, setSegmentObjectInFilePlayerIds] = useState<Array<InFileSegmentPlayerModel>>([]);
	const [segmentObjectConditions, setSegmentObjectConditions] = useState<Array<SegmentConditionSaveRequestModel>>([]);
	const [segmentObjectQueryJoins, setSegmentObjectQueryJoins] = useState<string>('');
	const [segmentObjectRespVarianceList, setSegmentObjectRespVarianceList] = useState<Array<SegmentVarianceModel>>([]);
	const [segmentObjectIsReactivated, setSegmentObjectIsReactivated] = useState<boolean>(false);
	const [segmentObjectCustomQuery, setSegmentObjectCustomQuery] = useState('');
	const [segmentOptions, setSegmentOptions] = useState<Array<LookupModel>>([]);
	const {successResponse} = useConstant();

	useEffect(() => {
		GetMasterReferenceList(segmentTypeMasterRefId)
			.then((response) => {
				if (response.status === successResponse) {
					let masterReferenceList = Object.assign(new Array<MasterReferenceOptionListModel>(), response.data);
					let tempSegmentList = Array<MasterReferenceOptionModel>();

					masterReferenceList
						.filter((x: MasterReferenceOptionListModel) => x.isParent === false)
						.forEach((item) => {
							const OptionValue: MasterReferenceOptionModel = {
								masterReferenceParentId: item.masterReferenceParentId,
								options: {label: item.masterReferenceChildName, value: item.masterReferenceId.toString()},
							};
							tempSegmentList.push(OptionValue);
						});

					setSegmentOptions(tempSegmentList.flatMap((x) => x.options));
				} else {
					console.log('Problem in  master reference list');
				}
			})
			.catch(() => {
				console.log('Problem in master reference list');
			});
	}, []);

	useEffect(() => {
		if (!actionName) {
			setHeaderLabel('Create');
		} else if (actionName === PageAction.EDIT) {
			setHeaderLabel('Edit');
		} else if (actionName === PageAction.CLONE) {
			setHeaderLabel('Clone');
		} else if (actionName === PageAction.CONVERT_TO_STATIC) {
			setHeaderLabel('Convert to Static');
		} else if (actionName === PageAction.VIEW) {
			setHeaderLabel('View');
		}
	}, [actionName]);

	useEffect(() => {
		setSelectedTypeOption(
			segmentOptions.find((st: any) => {
				return st.value === segmentTabType.toString();
			})
		);
	}, [segmentTabType]);

	const onChangeTab = (val: any) => {
		setCurrentTab(val);
	};

	useEffect(() => {
		setSegmentObjectRespVarianceList(segmentObjectVarianceList);
	}, [segmentObjectVarianceList]);

	return (
		<>
			<MainContainer>
				<FormHeader headerLabel={headerLabel + ' Segment'} />
				{/* Start: Normal Segment View - no tabs, default */}
				{segmentTabType.toString() !== SegmentTypes.Distribution && (
					<>
						{!actionName && (
							<AddSegment
							// Add segment switch display for different pages
								selectedSegmentOption={selectedTypeOption}
								setSegmentQueryInputType={setSegmentQueryInputType}
								setSegmentTabType={setSegmentTabType}
								setSegmentObjectName={setSegmentObjectName}
								setSegmentObjectDesc={setSegmentObjectDesc}
								setSegmentObjectStatus={setSegmentObjectStatus}
								segmentObjectVarianceList={segmentObjectVarianceList}
								setSegmentObjectQuery={setSegmentObjectQuery}
								setSegmentObjectInFilePlayerIds={setSegmentObjectInFilePlayerIds}
								segmentObjectConditions={segmentObjectConditions}
								setSegmentCondition={setSegmentObjectConditions}
								setSegmentObjectQueryJoins={setSegmentObjectQueryJoins}
								setSegmentObjectQueryTableau={setSegmentObjectQueryTableau}
								setSegmentObjectCustomQueryAdd={setSegmentObjectCustomQuery}
							/>
						)}
						{actionName === PageAction.CLONE && (
							<CloneSegment
							// Clone segment switch display for different pages
								selectedSegmentOption={selectedTypeOption}
								setSegmentQueryInputType={setSegmentQueryInputType}
								setSegmentTabType={setSegmentTabType}
								setSegmentObjectName={setSegmentObjectName}
								setSegmentObjectDesc={setSegmentObjectDesc}
								setSegmentObjectStatus={setSegmentObjectStatus}
								segmentObjectVarianceList={segmentObjectVarianceList}
								setSegmentObjectQuery={setSegmentObjectQuery}
								segmentObjectConditions={segmentObjectConditions}
								setSegmentCondition={setSegmentObjectConditions}
								setSegmentObjectQueryJoins={setSegmentObjectQueryJoins}
								segmentObjectInFilePlayerIds={segmentObjectInFilePlayerIds}
								setSegmentObjectVarianceList={setSegmentObjectVarianceList}
								setSegmentObjectInFilePlayerIds={setSegmentObjectInFilePlayerIds}
								setSegmentObjectQueryTableau={setSegmentObjectQueryTableau}
								setSegmentObjectCustomQueryClone={setSegmentObjectCustomQuery}
							></CloneSegment>
						)}
						{actionName === PageAction.VIEW && (
							<ViewSegment
								// View segment switch display for different pages
								selectedSegmentOption={selectedTypeOption}
								segmentObjectConditions={segmentObjectConditions}
								setSegmentTabType={setSegmentTabType}
								setSegmentObjectStatus={setSegmentObjectStatus}
								setSegmentObjectVarianceList={setSegmentObjectVarianceList}
								setSegmentObjectQuery={setSegmentObjectQuery}
								setSegmentObjectInFilePlayerIds={setSegmentObjectInFilePlayerIds}
								setSegmentCondition={setSegmentObjectConditions}
								setSegmentObjectIsReactivated={setSegmentObjectIsReactivated}
								setSegmentObjectQueryJoins={setSegmentObjectQueryJoins}
							/>
						)}
						{actionName === PageAction.EDIT && (
							<EditSegment
							// Edit segment switch display for different pages
								selectedSegmentOption={selectedTypeOption}
								segmentObjectVarianceList={segmentObjectVarianceList}
								segmentObjectInFilePlayerIds={segmentObjectInFilePlayerIds}
								segmentObjectConditions={segmentObjectConditions}
								setSegmentQueryInputType={setSegmentQueryInputType}
								setSegmentTabType={setSegmentTabType}
								setSegmentObjectName={setSegmentObjectName}
								setSegmentObjectDesc={setSegmentObjectDesc}
								setSegmentObjectStatus={setSegmentObjectStatus}
								setSegmentObjectQuery={setSegmentObjectQuery}
								setSegmentCondition={setSegmentObjectConditions}
								setSegmentObjectQueryJoins={setSegmentObjectQueryJoins}
								setSegmentObjectVarianceList={setSegmentObjectVarianceList}
								setSegmentObjectInFilePlayerIds={setSegmentObjectInFilePlayerIds}
								setSegmentObjectIsReactivated={setSegmentObjectIsReactivated}
								setSegmentObjectQueryTableau={setSegmentObjectQueryTableau}
								setSegmentObjectCustomQueryEdit={setSegmentObjectCustomQuery}
								
							/>
						)}
						{actionName === PageAction.CONVERT_TO_STATIC && (
							<ConvertToStatic
							// Convert to Static segment switch display for different pages
								selectedSegmentOption={selectedTypeOption}
								setSegmentTabType={setSegmentTabType}
								setSegmentObjectName={setSegmentObjectName}
								setSegmentObjectDesc={setSegmentObjectDesc}
								setSegmentObjectStatus={setSegmentObjectStatus}
								segmentObjectVarianceList={segmentObjectVarianceList}
								setSegmentObjectQuery={setSegmentObjectQuery}
								segmentObjectConditions={segmentObjectConditions}
								setSegmentCondition={setSegmentObjectConditions}
								setSegmentObjectQueryJoins={setSegmentObjectQueryJoins}
								segmentObjectInFilePlayerIds={segmentObjectInFilePlayerIds}
								setSegmentObjectInFilePlayerIds={setSegmentObjectInFilePlayerIds}
							/>
						)}
						
					</>
				)}
				{/* End: Normal Segment View - no tabs */}

				{/* Start: Distribution Segment View - with tabs */}
				{segmentTabType.toString() === SegmentTypes.Distribution && (
					<>
						<ContentContainer>
							<FormGroupContainer>
								<div className='col'>
									<Tabs defaultActiveKey={0} activeKey={currentTab} id='controlled-tab' onSelect={onChangeTab} style={{fontWeight: '600'}}>
										<Tab eventKey={0} title='Segment'>
											{!actionName && (
												<AddSegment
													selectedSegmentOption={selectedTypeOption}
													setSegmentQueryInputType={setSegmentQueryInputType}
													setSegmentTabType={setSegmentTabType}
													setSegmentObjectName={setSegmentObjectName}
													setSegmentObjectDesc={setSegmentObjectDesc}
													setSegmentObjectStatus={setSegmentObjectStatus}
													segmentObjectVarianceList={segmentObjectVarianceList}
													setSegmentObjectInFilePlayerIds={setSegmentObjectInFilePlayerIds}
													setSegmentObjectQuery={setSegmentObjectQuery}
													segmentObjectConditions={segmentObjectConditions}
													setSegmentCondition={setSegmentObjectConditions}
													setSegmentObjectQueryJoins={setSegmentObjectQueryJoins}
													setSegmentObjectQueryTableau={setSegmentObjectQueryTableau}
													setSegmentObjectCustomQueryAdd={setSegmentObjectCustomQuery}
												/>
											)}
											
											{actionName === PageAction.CONVERT_TO_STATIC && (
												<ConvertToStatic
													selectedSegmentOption={selectedTypeOption}
													setSegmentTabType={setSegmentTabType}
													setSegmentObjectName={setSegmentObjectName}
													setSegmentObjectDesc={setSegmentObjectDesc}
													setSegmentObjectStatus={setSegmentObjectStatus}
													segmentObjectVarianceList={segmentObjectVarianceList}
													setSegmentObjectQuery={setSegmentObjectQuery}
													segmentObjectConditions={segmentObjectConditions}
													setSegmentCondition={setSegmentObjectConditions}
													setSegmentObjectQueryJoins={setSegmentObjectQueryJoins}
													segmentObjectInFilePlayerIds={segmentObjectInFilePlayerIds}
													setSegmentObjectInFilePlayerIds={setSegmentObjectInFilePlayerIds}
												/>
											)}
											{actionName === PageAction.CLONE && (
												<CloneSegment
													selectedSegmentOption={selectedTypeOption}
													setSegmentQueryInputType={setSegmentQueryInputType}
													setSegmentTabType={setSegmentTabType}
													setSegmentObjectName={setSegmentObjectName}
													setSegmentObjectDesc={setSegmentObjectDesc}
													setSegmentObjectStatus={setSegmentObjectStatus}
													segmentObjectVarianceList={segmentObjectVarianceList}
													setSegmentObjectQuery={setSegmentObjectQuery}
													segmentObjectConditions={segmentObjectConditions}
													setSegmentCondition={setSegmentObjectConditions}
													setSegmentObjectQueryJoins={setSegmentObjectQueryJoins}
													segmentObjectInFilePlayerIds={segmentObjectInFilePlayerIds}
													setSegmentObjectVarianceList={setSegmentObjectVarianceList}
													setSegmentObjectInFilePlayerIds={setSegmentObjectInFilePlayerIds}
													setSegmentObjectQueryTableau={setSegmentObjectQueryTableau}
													setSegmentObjectCustomQueryClone={setSegmentObjectCustomQuery}
												/>
											)}
											{actionName === PageAction.VIEW && (
												<ViewSegment
													segmentObjectConditions={segmentObjectConditions}
													selectedSegmentOption={selectedTypeOption}
													setSegmentTabType={setSegmentTabType}
													setSegmentObjectStatus={setSegmentObjectStatus}
													setSegmentObjectVarianceList={setSegmentObjectVarianceList}
													setSegmentObjectInFilePlayerIds={setSegmentObjectInFilePlayerIds}
													setSegmentObjectQuery={setSegmentObjectQuery}
													setSegmentCondition={setSegmentObjectConditions}
													setSegmentObjectQueryJoins={setSegmentObjectQueryJoins}
													setSegmentObjectIsReactivated={setSegmentObjectIsReactivated}
												/>
											)}
											{actionName === PageAction.EDIT && (
												<EditSegment
													selectedSegmentOption={selectedTypeOption}
													segmentObjectVarianceList={segmentObjectVarianceList}
													segmentObjectConditions={segmentObjectConditions}
													segmentObjectInFilePlayerIds={segmentObjectInFilePlayerIds}
													setSegmentQueryInputType={setSegmentQueryInputType}
													setSegmentTabType={setSegmentTabType}
													setSegmentObjectName={setSegmentObjectName}
													setSegmentObjectDesc={setSegmentObjectDesc}
													setSegmentObjectStatus={setSegmentObjectStatus}
													setSegmentObjectQuery={setSegmentObjectQuery}
													setSegmentObjectQueryJoins={setSegmentObjectQueryJoins}
													setSegmentCondition={setSegmentObjectConditions}
													setSegmentObjectVarianceList={setSegmentObjectVarianceList}
													setSegmentObjectInFilePlayerIds={setSegmentObjectInFilePlayerIds}
													setSegmentObjectIsReactivated={setSegmentObjectIsReactivated}
													setSegmentObjectQueryTableau={setSegmentObjectQueryTableau}
													setSegmentObjectCustomQueryEdit={setSegmentObjectCustomQuery}
												/>
											)}
											
										</Tab>
										<Tab eventKey={1} title='Distribution'>
											<DistributionList
												segmentInputType={segmentQueryInputType}
												segmentTabType={segmentTabType}
												segmentObjectName={segmentObjectName}
												segmentObjectDesc={segmentObjectDesc}
												segmentObjectStatus={segmentObjectStatus}
												setSegmentObjectVarianceList={setSegmentObjectVarianceList}
												segmentObjectQuery={segmentObjectQuery}
												segmentObjectInFilePlayerIds={segmentObjectInFilePlayerIds}
												segmentObjectConditions={segmentObjectConditions}
												segmentObjectQueryJoins={segmentObjectQueryJoins}
												segmentObjectQueryTableau={segmentObjectQueryTableau}
												//this is for view/edit mode
												segmentObjectRespVarianceList={segmentObjectRespVarianceList}
												segmentObjectIsReactivated={segmentObjectIsReactivated}
												segmentObjectCustomQuery={segmentObjectCustomQuery}
											/>
										</Tab>
									</Tabs>
								</div>
							</FormGroupContainer>

							<div className='form-group row ' style={{float: 'right', marginRight: '15px'}}>
								<div className='col align-self-end'>
									<button
										type='button'
										className='btn btn-primary btn-sm me-2 btnPrevious'
										disabled={currentTab == 0}
										onClick={() => setCurrentTab(0)}
									>
										<FontAwesomeIcon icon={faChevronLeft} style={{marginRight: 5}} />
										Previous
									</button>
									<button type='button' className='btn  btn-primary btn-sm btnNext' disabled={currentTab == 1} onClick={() => setCurrentTab(1)}>
										Next
										<FontAwesomeIcon icon={faChevronRight} style={{marginLeft: 5}} />
									</button>
								</div>
							</div>
						</ContentContainer>
					</>
				)}

				{/* End: Distribution Segment View - with tabs */}
			</MainContainer>
		</>
	);
};
