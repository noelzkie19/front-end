import React, {useEffect} from 'react';
import {Col, Row} from 'react-bootstrap-v5';
import Select from 'react-select';
import {OptionListModel} from '../../../../../common/model';
import {BasicFieldLabel, BasicTextInput, DefaultSelect, FormHeader, MainContainer, RequiredLabel} from '../../../../../custom-components';

interface Props {
	selectedCaseType: string;
	setSelectedCaseType: (e: any) => void;
	selectedTopic: string;
	setSelectedTopic: (e: any) => void;
	selectedSubtopic: string;
	setSelectedSubtopic: (e: any) => void;
	topicOptionList: Array<OptionListModel>;
	subtopicOptionList: Array<OptionListModel>;
	getSubtopicOptions: (e: number) => void;
	campaignName: string;
	setCampaignName: (e: string) => void;
	userProfile: any;
	campaignTypeId: number;
	caseTypeOptionsList: OptionListModel[];
}

const CaseInformations: React.FC<Props> = ({
	selectedCaseType,
	setSelectedCaseType,
	selectedTopic,
	setSelectedTopic,
	selectedSubtopic,
	setSelectedSubtopic,
	topicOptionList,
	subtopicOptionList,
	getSubtopicOptions,
	campaignName,
	setCampaignName,
	userProfile,
	campaignTypeId,
	caseTypeOptionsList,
}) => {
	/**
	 *  ? Watchers
	 */
	useEffect(() => {
		if (campaignTypeId === 35 || campaignTypeId === 145) {
			setSelectedTopic(topicOptionList.find((x) => x.label.toLocaleLowerCase() === 'campaign'));
			let topicId = topicOptionList.find((x) => x.label.toLocaleLowerCase() === 'campaign')?.value;
			getSubtopicOptions(topicId === undefined ? 0 : parseInt(topicId));
		}
	}, [topicOptionList]);

	useEffect(() => {
		if (campaignTypeId === 35) setSelectedSubtopic(subtopicOptionList.find((x) => x.label.toLocaleLowerCase() === 'welcome call'));
		if (campaignTypeId === 145) setSelectedSubtopic(subtopicOptionList.find((x) => x.label.toLocaleLowerCase() === 'retention campaign'));
		if (subtopicOptionList.length === 1) setSelectedSubtopic(subtopicOptionList.find((x) => x.label !== ''));
	}, [subtopicOptionList]);

	useEffect(() => {
		setSelectedCaseType(caseTypeOptionsList.find((x) => x.label.toLowerCase() === 'campaign'));
	}, [caseTypeOptionsList]);

	/**
	 *  ? Events
	 */
	const onChangeCaseType = (val: string) => {
		setSelectedCaseType(val);
	};

	const onChangeSelectedTopic = (val: string | any) => {
		setSelectedTopic(val);
		setSelectedSubtopic('');
		let _topicId: number = val.value;
		getSubtopicOptions(_topicId);
	};

	const onChangeSelectedSubTopic = (val: string) => {
		setSelectedSubtopic(val);
	};

	return (
		<MainContainer>
			<FormHeader headerLabel={'Case Information'} />
			<div style={{margin: 40}}>
				<Row>
					<Col sm={4}>
						<BasicFieldLabel title={'Case Creator'} />
						<input type='text' className='form-control form-control-sm' value={userProfile?.fullname} disabled={true} />
					</Col>
					<Col sm={4}>
						<BasicFieldLabel title={'Case Type'} />
						<Select
							size='small'
							style={{width: '100%'}}
							options={caseTypeOptionsList}
							onChange={onChangeCaseType}
							value={selectedCaseType}
							isDisabled={true}
						/>
					</Col>
					<Col sm={4}>
						<BasicFieldLabel title={'Campaign Name'} />
						<BasicTextInput ariaLabel={'campaignName'} disabled={true} value={campaignName} onChange={(e) => setCampaignName(e.target.value)} />
					</Col>
				</Row>

				<Row style={{marginTop: 20, marginBottom: 20}}>
					<Col sm={4}>
						<RequiredLabel title={'Topic'} />
						<Select size='small' style={{width: '100%'}} options={topicOptionList} onChange={onChangeSelectedTopic} value={selectedTopic} />
					</Col>
					<Col sm={4}>
						<RequiredLabel title={'Subtopic'} />
						<DefaultSelect data={subtopicOptionList} onChange={onChangeSelectedSubTopic} value={selectedSubtopic} />
					</Col>
				</Row>
			</div>
		</MainContainer>
	);
};

export default CaseInformations;
