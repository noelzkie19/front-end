import React, {useState} from 'react';
import {Col, Row} from 'react-bootstrap-v5';
import {BasicFieldLabel, BasicTextInput, FormHeader, MainContainer, MlabButton} from '../../../../custom-components';
import {OptionsSelectedModel} from '../../../system/models';
import Select from 'react-select';
import {ElementStyle} from '../../../../constants/Constants';

const RemSetting: React.FC = () => {
	//States
	const [templateName, setTemplateName] = useState<string>('');
	const [createdBy, setCreatedBy] = useState<OptionsSelectedModel>();
	const [updatedBy, setUpdatedBy] = useState<OptionsSelectedModel>();

	//Methods
	const onChangeCreatedBy = (val: OptionsSelectedModel) => {
		setCreatedBy(val);
	};
	const onChangeUpdatedBy = (val: OptionsSelectedModel) => {
		setUpdatedBy(val);
	};

	// Components
	const HeaderContent = () => {
		return (
			<>
				{/* Header Section */}
				<div style={{margin: 20}}>
					<Row>
						<Col sm={4}>
							<BasicFieldLabel title={'Template Name'} />
							<BasicTextInput
								colWidth='col-sm-12'
								onChange={(e) => setTemplateName(e.target.value)}
								value={templateName}
								ariaLabel={'Template Name'}
								disabled={false}
							/>
						</Col>
						<Col sm={4}>
							<BasicFieldLabel title={'Created By'} />
							<div className='col-sm-12'>
								<Select style={{width: '100%'}} options={createdBy} onChange={onChangeCreatedBy} value={createdBy} isDisabled={false} />
							</div>
						</Col>
						<Col sm={4}>
							<BasicFieldLabel title={'Updated By'} />
							<div className='col-sm-12'>
								<Select size='small' style={{width: '100%'}} options={createdBy} onChange={onChangeUpdatedBy} value={updatedBy} isDisabled={false} />
							</div>
						</Col>
					</Row>
				</div>
				<div style={{marginLeft: 20, marginRight: 20}}>
					<Row>
						<Col sm={4}>
							<Row>
								<Col sm={2}>
									<MlabButton
										access={true}
										size={'sm'}
										label={'Search'}
										style={ElementStyle.primary}
										type={'button'}
										weight={'solid'}
										loading={false}
										disabled={false}
										loadingTitle={' Please wait...'}
										onClick={() => {
											console.log('fasfa');
										}}
									/>
								</Col>
								<Col sm={6}>
									<MlabButton
										access={true}
										size={'sm'}
										label={'Add New Schedule'}
										style={ElementStyle.primary}
										type={'button'}
										weight={'solid'}
										loading={false}
										disabled={false}
										loadingTitle={' Please wait...'}
										onClick={() => {
											console.log('fasfa');
										}}
									/>
								</Col>
								<Col sm={4}></Col>
							</Row>
						</Col>
						<Col sm={8}></Col>
					</Row>
				</div>
			</>
		);
	};

	return (
		<MainContainer>
			<FormHeader headerLabel={'Schedule'} />
			{HeaderContent()}
			{/* Grid section */}
			<div style={{margin: 20}}></div>
		</MainContainer>
	);
};

export default RemSetting;
