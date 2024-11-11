import {SECURABLE_NAMES} from '../../constants/SecurableNames';
import {Accordion, Button, Card} from 'react-bootstrap';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faAddressCard, faCircle} from '@fortawesome/free-solid-svg-icons';
import {useEffect, useState} from 'react';
import {MainModuleModel} from '../../../models/MainModuleModel';

interface Props {
	CardHeaderEditStyles: any;
	CardBodyEditStyles: any;
	SecurableObjects?: Array<MainModuleModel>;
}
const CommunicationReviewSecurableObject = (props: Props) => {
	const [communicationReviewRead, setCommunicationReviewRead] = useState(false);
	const [communicationReviewWrite, setCommunicationReviewWrite] = useState(false);

	const [communicationReviewerRead, setCommunicationReviewerRead] = useState(false);
	const [communicationReviewerWrite, setCommunicationReviewerWrite] = useState(false);

	const [communicationRevieweeRead, setCommunicationRevieweeRead] = useState(false);
	const [communicationRevieweeWrite, setCommunicationRevieweeWrite] = useState(false);

	const [communicationAnnotateRead, setCommunicationAnnotateRead] = useState(false);
	const [communicationAnnotateWrite, setCommunicationAnnotateWrite] = useState(false);

	const [communicationReviewReportRead, setCommunicationReviewReportRead] = useState(false);
	const [communicationReviewReportWrite, setCommunicationReviewReportWrite] = useState(false);

	const [managePrimaryFlagRead, setManagePrimaryFlagRead] = useState(false);
	const [managePrimaryFlagWrite, setManagePrimaryFlagWrite] = useState(false);

	let communicationReviewReadChkBox = document.getElementById('communicationReviewReadChkBox') as HTMLInputElement;
	let communicationReviewWriteChkBox = document.getElementById('communicationReviewWriteChkBox') as HTMLInputElement;

	let communicationReviewerReadChkbox = document.getElementById('communicationReviewerReadChkbox') as HTMLInputElement;
	let communicationReviewerWriteChkbox = document.getElementById('communicationReviewerWriteChkbox') as HTMLInputElement;

	let communicationRevieweeReadChkbox = document.getElementById('communicationRevieweeReadChkbox') as HTMLInputElement;
	let communicationRevieweeWriteChkbox = document.getElementById('communicationRevieweeWriteChkbox') as HTMLInputElement;

	let communicationAnnotateReadChkbox = document.getElementById('communicationAnnotateReadChkbox') as HTMLInputElement;
	let communicationAnnotateWriteChkbox = document.getElementById('communicationAnnotateWriteChkbox') as HTMLInputElement;

	let communicationReviewReportReadChkbox = document.getElementById('communicationReviewReportReadChkbox') as HTMLInputElement;
	let communicationReviewReportWriteChkbox = document.getElementById('communicationReviewReportWriteChkbox') as HTMLInputElement;

	let managePrimaryFlagReadChkbox = document.getElementById('managePrimaryFlagReadChkbox') as HTMLInputElement;
	let managePrimaryFlagWriteChkbox = document.getElementById('managePrimaryFlagWriteChkbox') as HTMLInputElement;

	useEffect(() => {
		if (props.SecurableObjects) {
			let commReview = props.SecurableObjects?.find((x) => x.description === SECURABLE_NAMES.CommunicationReview);
			if (!commReview) {
				return;
			}

			communicationReviewReadChkBox.checked = commReview.read;
			setCommunicationReviewRead(commReview.read);
			communicationReviewWriteChkBox.checked = commReview.write;
			setCommunicationReviewWrite(commReview.write);

			if (!commReview.subMainModuleDetails) {
				return;
			}
			communicationReviewerReadChkbox.checked = commReview.subMainModuleDetails.find(
				(_) => _.description === SECURABLE_NAMES.CommunicationReviewer
			)?.read!;
			communicationReviewerWriteChkbox.checked = commReview.subMainModuleDetails.find(
				(_) => _.description === SECURABLE_NAMES.CommunicationReviewer
			)?.write!;
			communicationRevieweeReadChkbox.checked = commReview.subMainModuleDetails.find(
				(_) => _.description === SECURABLE_NAMES.CommunicationReviewee
			)?.read!;
			communicationRevieweeWriteChkbox.checked = commReview.subMainModuleDetails.find(
				(_) => _.description === SECURABLE_NAMES.CommunicationReviewee
			)?.write!;
			communicationAnnotateReadChkbox.checked = commReview.subMainModuleDetails.find(
				(_) => _.description === SECURABLE_NAMES.CommunicationAnnotation
			)?.read!;
			communicationAnnotateWriteChkbox.checked = commReview.subMainModuleDetails.find(
				(_) => _.description === SECURABLE_NAMES.CommunicationAnnotation
			)?.write!;
			communicationReviewReportReadChkbox.checked = commReview.subMainModuleDetails.find(
				(_) => _.description === SECURABLE_NAMES.CommunicationReviewReport
			)?.read!;
			communicationReviewReportWriteChkbox.checked = commReview.subMainModuleDetails.find(
				(_) => _.description === SECURABLE_NAMES.CommunicationReviewReport
			)?.write!;
			managePrimaryFlagReadChkbox.checked = commReview.subMainModuleDetails.find(
				(_) => _.description === SECURABLE_NAMES.ManagePrimaryFlag
			)?.read!;
			managePrimaryFlagWriteChkbox.checked = commReview.subMainModuleDetails.find(
				(_) => _.description === SECURABLE_NAMES.ManagePrimaryFlag
			)?.write!;
		}
	}, [props.SecurableObjects]);
	//Case Management
	const onChangeCommunicationReviewRead = (val: boolean) => {
		setCommunicationReviewRead(val);
		changeCommunicationReview();
	};

	const onChangeCommunicationReviewWrite = (val: boolean) => {
		setCommunicationReviewWrite(val);
		changeCommunicationReview();
	};
	const updateWriteChkBoxValue = (val: boolean) => {
		communicationReviewerWriteChkbox.checked = val;
		communicationRevieweeWriteChkbox.checked = val;
		communicationAnnotateWriteChkbox.checked = val;
		communicationReviewReportWriteChkbox.checked = val;
		managePrimaryFlagWriteChkbox.checked = val;
	};
	const updateReadChkBoxValue = (val: boolean) => {
		communicationReviewerReadChkbox.checked = val;
		communicationRevieweeReadChkbox.checked = val;
		communicationAnnotateReadChkbox.checked = val;
		communicationReviewReportReadChkbox.checked = val;
		managePrimaryFlagReadChkbox.checked = val;
	};
	const setStateCommunicationReviewRead = (val: boolean) => {
		setCommunicationReviewerRead(val);
		setCommunicationRevieweeRead(val);
		setCommunicationAnnotateRead(val);
		setCommunicationReviewReportRead(val);
		setManagePrimaryFlagRead(val);
	};
	const setStateCommunicationReviewWrite = (val: boolean) => {
		setCommunicationReviewerWrite(val);
		setCommunicationRevieweeWrite(val);
		setCommunicationAnnotateWrite(val);
		setCommunicationReviewReportWrite(val);
		setManagePrimaryFlagWrite(val);
	};
	const changeCommunicationReview = () => {
		if (
			(communicationReviewReadChkBox.checked && communicationReviewWriteChkBox.checked) ||
			(!communicationReviewReadChkBox.checked && communicationReviewWriteChkBox.checked)
		) {
			setStateCommunicationReviewRead(true);
			setStateCommunicationReviewWrite(true);
		} else if (communicationReviewReadChkBox.checked && !communicationReviewWriteChkBox.checked) {
			setStateCommunicationReviewRead(true);
			setStateCommunicationReviewWrite(false);
			updateWriteChkBoxValue(false);
		} else {
			setStateCommunicationReviewRead(false);
			setStateCommunicationReviewWrite(false);
			updateReadChkBoxValue(false);
			updateWriteChkBoxValue(false);
		}
	};

	const changeCommunicationReviewReportWrite = (checked: boolean) => {
		setCommunicationReviewReportWrite(checked);
		if (checked) {
			setCommunicationRevieweeRead(checked);
			communicationReviewReportReadChkbox.checked = checked;
		}
	};

	const changeCommunicationReviewReportRead = (checked: boolean) => {
		if (communicationReviewReportWrite && !checked) {
			setCommunicationReviewReportRead(true);
			communicationReviewReportReadChkbox.checked = true;
		}
		setCommunicationReviewReportRead(checked);
	};

	return (
		<>
			{/* //Communication Review */}
			<Card className='card card-custom edit-user-div'>
				<Card.Header className='accordion-header edit-user-div' style={props.CardHeaderEditStyles}>
					<Accordion.Toggle as={Button} variant='link' eventKey='11'>
						<FontAwesomeIcon icon={faAddressCard} /> {SECURABLE_NAMES.CommunicationReview}
					</Accordion.Toggle>
					<div className='d-flex align-items-center my-2'>
						<div className='col-sm-7'>
							<div className='form-check form-switch form-check-custom form-check-solid'>
								<input
									className='form-check-input'
									type='checkbox'
									id='communicationReviewReadChkBox'
									onChange={(event) => onChangeCommunicationReviewRead(event.target.checked)}
									defaultChecked={communicationReviewRead}
								/>
								<div className='form-check-label'>Read</div>
							</div>
						</div>
						<div className='col'>
							<div className='form-check form-switch form-check-custom form-check-solid'>
								<input
									className='form-check-input'
									type='checkbox'
									id='communicationReviewWriteChkBox'
									onChange={(event) => onChangeCommunicationReviewWrite(event.target.checked)}
									defaultChecked={communicationReviewWrite}
								/>
								<div className='form-check-label'>Write</div>
							</div>
						</div>
					</div>
					{/* //Reviewer */}
				</Card.Header>
				<Accordion.Collapse eventKey='11'>
					<Card.Body className='accordion-body edit-user-div' style={props.CardBodyEditStyles}>
						<Accordion defaultActiveKey='5' className='accordion'>
							<Card>
								<Card.Header className='accordion-header'>
									<Accordion.Toggle as={Button} variant='link' eventKey='0'>
										<FontAwesomeIcon icon={faCircle} /> {SECURABLE_NAMES.CommunicationReviewer}
									</Accordion.Toggle>
									<div className='d-flex align-items-center my-2'>
										<div className='col-sm-7'>
											<div className='form-check form-switch form-check-custom form-check-solid'>
												<input
													className='form-check-input'
													type='checkbox'
													value=''
													disabled={!communicationReviewRead && !communicationReviewWrite}
													id='communicationReviewerReadChkbox'
													onChange={(event) => setCommunicationReviewerRead(event.target.checked)}
													defaultChecked={communicationReviewerRead}
												/>
												<div className='form-check-label'>Read</div>
											</div>
										</div>
										<div className='col'>
											<div className='form-check form-switch form-check-custom form-check-solid'>
												<input
													className='form-check-input'
													type='checkbox'
													value=''
													disabled={!communicationReviewWrite}
													id='communicationReviewerWriteChkbox'
													onChange={(event) => setCommunicationReviewerWrite(event.target.checked)}
													defaultChecked={communicationReviewerWrite}
												/>
												<div className='form-check-label'>Write</div>
											</div>
										</div>
									</div>
								</Card.Header>
							</Card>
							{/* //View ALl Reviewee */}
							<Card>
								<Card.Header className='accordion-header'>
									<Accordion.Toggle as={Button} variant='link' eventKey='1'>
										<FontAwesomeIcon icon={faCircle} /> {SECURABLE_NAMES.CommunicationReviewee}
									</Accordion.Toggle>
									<div className='d-flex align-items-center my-2'>
										<div className='col-sm-7'>
											<div className='form-check form-switch form-check-custom form-check-solid'>
												<input
													className='form-check-input'
													type='checkbox'
													value=''
													disabled={!communicationReviewRead && !communicationReviewWrite}
													id='communicationRevieweeReadChkbox'
													onChange={(event) => setCommunicationRevieweeRead(event.target.checked)}
													defaultChecked={communicationRevieweeRead}
												/>
												<div className='form-check-label'>Read</div>
											</div>
										</div>
										<div className='col'>
											<div className='form-check form-switch form-check-custom form-check-solid'>
												<input
													className='form-check-input'
													type='checkbox'
													value=''
													disabled={!communicationReviewWrite}
													id='communicationRevieweeWriteChkbox'
													onChange={(event) => setCommunicationRevieweeWrite(event.target.checked)}
													defaultChecked={communicationRevieweeWrite}
												/>
												<div className='form-check-label'>Write</div>
											</div>
										</div>
									</div>
								</Card.Header>
							</Card>
							{/* //Annotate */}
							<Card>
								<Card.Header className='accordion-header'>
									<Accordion.Toggle as={Button} variant='link' eventKey='2'>
										<FontAwesomeIcon icon={faCircle} /> {SECURABLE_NAMES.CommunicationAnnotation}
									</Accordion.Toggle>
									<div className='d-flex align-items-center my-2'>
										<div className='col-sm-7'>
											<div className='form-check form-switch form-check-custom form-check-solid'>
												<input
													className='form-check-input'
													type='checkbox'
													value=''
													disabled={!communicationReviewRead && !communicationReviewWrite}
													id='communicationAnnotateReadChkbox'
													onChange={(event) => setCommunicationAnnotateRead(event.target.checked)}
													defaultChecked={communicationAnnotateRead}
												/>
												<div className='form-check-label'>Read</div>
											</div>
										</div>
										<div className='col'>
											<div className='form-check form-switch form-check-custom form-check-solid'>
												<input
													className='form-check-input'
													type='checkbox'
													value=''
													disabled={!communicationReviewWrite}
													id='communicationAnnotateWriteChkbox'
													onChange={(event) => setCommunicationAnnotateWrite(event.target.checked)}
													defaultChecked={communicationAnnotateWrite}
												/>
												<div className='form-check-label'>Write</div>
											</div>
										</div>
									</div>
								</Card.Header>
							</Card>
							{/* //View Report */}
							<Card>
								<Card.Header className='accordion-header'>
									<Accordion.Toggle as={Button} variant='link' eventKey='2'>
										<FontAwesomeIcon icon={faCircle} /> Report {/*SECURABLE_NAMES.CommunicationReviewReport*/}
									</Accordion.Toggle>
									<div className='d-flex align-items-center my-2'>
										<div className='col-sm-7'>
											<div className='form-check form-switch form-check-custom form-check-solid'>
												<input
													className='form-check-input'
													type='checkbox'
													value=''
													disabled={!communicationReviewRead && !communicationReviewWrite}
													id='communicationReviewReportReadChkbox'
													onChange={(event) => changeCommunicationReviewReportRead(event.target.checked)}
													defaultChecked={communicationReviewReportRead}
												/>
												<div className='form-check-label'>Read</div>
											</div>
										</div>
										<div className='col'>
											<div className='form-check form-switch form-check-custom form-check-solid'>
												<input
													className='form-check-input'
													type='checkbox'
													value=''
													disabled={!communicationReviewWrite}
													id='communicationReviewReportWriteChkbox'
													onChange={(event) => changeCommunicationReviewReportWrite(event.target.checked)}
													defaultChecked={communicationReviewReportWrite}
												/>
												<div className='form-check-label'>Write</div>
											</div>
										</div>
									</div>
								</Card.Header>
							</Card>

							<Card>
								<Card.Header className='accordion-header'>
									<Accordion.Toggle as={Button} variant='link' eventKey='2'>
										<FontAwesomeIcon icon={faCircle} /> {SECURABLE_NAMES.ManagePrimaryFlag}
									</Accordion.Toggle>
									<div className='d-flex align-items-center my-2'>
										<div className='col-sm-7'>
											<div className='form-check form-switch form-check-custom form-check-solid'>
												<input
													className='form-check-input'
													type='checkbox'
													value=''
													disabled={!communicationReviewRead && !communicationReviewWrite}
													id='managePrimaryFlagReadChkbox'
													onChange={(event) => setManagePrimaryFlagRead(event.target.checked)}
													defaultChecked={managePrimaryFlagRead}
												/>
												<div className='form-check-label'>Read</div>
											</div>
										</div>
										<div className='col'>
											<div className='form-check form-switch form-check-custom form-check-solid'>
												<input
													className='form-check-input'
													type='checkbox'
													value=''
													disabled={!communicationReviewWrite}
													id='managePrimaryFlagWriteChkbox'
													onChange={(event) => setManagePrimaryFlagWrite(event.target.checked)}
													defaultChecked={managePrimaryFlagWrite}
												/>
												<div className='form-check-label'>Write</div>
											</div>
										</div>
									</div>
								</Card.Header>
							</Card>
						</Accordion>
					</Card.Body>
				</Accordion.Collapse>
			</Card>
		</>
	);
};
export default CommunicationReviewSecurableObject;
