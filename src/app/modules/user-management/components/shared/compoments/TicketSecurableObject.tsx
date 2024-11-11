import { useEffect, useState } from 'react';
import { Accordion, Button, Card } from 'react-bootstrap';
import ToggleComponent from './ToggleComponent';
import { MainModuleModel } from '../../../models/MainModuleModel';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircle, faTicketAlt } from '@fortawesome/free-solid-svg-icons';
import { SECURABLE_NAMES } from '../../constants/SecurableNames';
interface Props {
	CardHeaderEditStyles: any;
	CardBodyEditStyles: any;
	SecurableObjects?: Array<MainModuleModel>;
}

const TicketSecurableObject = ({ CardHeaderEditStyles, CardBodyEditStyles, SecurableObjects }: Props) => {
	/**
	 *  ? States
	 */
	const [ticketsRead, setTicketsRead] = useState<boolean>(false);
	const [ticketsWrite, setTicketsWrite] = useState<boolean>(false);
	const [manageTicketsRead, setManageTicketsRead] = useState<boolean>(false);
	const [manageTicketsWrite, setManageTicketsWrite] = useState<boolean>(false);
	const [missingDepositRead, setMissingDepositRead] = useState<boolean>(false);
	const [missingDepositWrite, setMissingDepositWrite] = useState<boolean>(false);
	const [reporterRoleRead, setReporterRoleRead] = useState<boolean>(false);
	const [reporterRoleWrite, setReporterRoleWrite] = useState<boolean>(false);

	const ticketsClaimRead = document.getElementById('ticketsClaimRead') as HTMLInputElement;
	const ticketsClaimWrite = document.getElementById('ticketsClaimWrite') as HTMLInputElement;
	const manageTicketsClaimRead = document.getElementById('manageTicketsClaimRead') as HTMLInputElement;
	const manageTicketsClaimWrite = document.getElementById('manageTicketsClaimWrite') as HTMLInputElement;
	const missingDepositClaimRead = document.getElementById('missingDepositClaimRead') as HTMLInputElement;
	const missingDepositClaimWrite = document.getElementById('missingDepositClaimWrite') as HTMLInputElement;
	const reporterRoleClaimRead = document.getElementById('reporterRoleClaimRead') as HTMLInputElement;
	const reporterRoleClaimWrite = document.getElementById('reporterRoleClaimWrite') as HTMLInputElement;

	const missingWithdrawalClaimRead = document.getElementById('missingWithdrawalClaimRead') as HTMLInputElement;
	const missingWithdrawalClaimWrite = document.getElementById('missingWithdrawalClaimWrite') as HTMLInputElement;
	const missingWithdrawalReporterClaimRead = document.getElementById('missingWithdrawalReporterClaimRead') as HTMLInputElement;
	const missingWithdrawalReporterClaimWrite = document.getElementById('missingWithdrawalReporterClaimWrite') as HTMLInputElement;

	const issueClaimRead = document.getElementById('issueClaimRead') as HTMLInputElement;
	const issueClaimWrite = document.getElementById('issueClaimWrite') as HTMLInputElement;
	const taskClaimRead = document.getElementById('taskClaimRead') as HTMLInputElement;
	const taskClaimWrite = document.getElementById('taskClaimWrite') as HTMLInputElement;

	const [missingWithdrawalRead, setMissingWithdrawalRead] = useState<boolean>(false);
	const [missingWithdrawalWrite, setMissingWithdrawalWrite] = useState<boolean>(false);
	const [missingWithdrawalReporterRead, setMissingWithdrawalReporterRead] = useState<boolean>(false);
	const [missingWithdrawalReporterWrite, setMissingWithdrawalReporterWrite] = useState<boolean>(false);

	const [issueRead, setIssueRead] = useState<boolean>(false);
	const [issueWrite, setIssueWrite] = useState<boolean>(false);
	const [taskRead, setTaskRead] = useState<boolean>(false);
	const [taskWrite, setTaskWrite] = useState<boolean>(false);

	useEffect(() => {
		if (!SecurableObjects) return;

		let ticketsClaim = SecurableObjects?.find((obj) => obj.description === SECURABLE_NAMES.Tickets);
		if (!ticketsClaim) return;
		let { read, write, subMainModuleDetails }: any = ticketsClaim;

		ticketsClaimRead.checked = read;
		setTicketsRead(read);
		ticketsClaimWrite.checked = write;
		setTicketsWrite(write);

		if (!subMainModuleDetails) return;
		manageTicketSubModules(subMainModuleDetails)
		missingDepositSubModules(subMainModuleDetails)
		missingWithdrawalSubModules(subMainModuleDetails)
		issueSubModules(subMainModuleDetails)
		taskSubModules(subMainModuleDetails)

		changeTicketsRuleStatus();
		changeMissingDepositRuleStatus();
		return () => { };
	}, [SecurableObjects]);

	const manageTicketSubModules = (subMainModuleDetails: any) => {
		const { read: manageTicketRead, write: manageTicketWrite } = subMainModuleDetails?.find((obj: any) => obj.description === SECURABLE_NAMES.ManageTickets) ?? { read: false, write: false, subModuleDetails: [] };
		manageTicketsClaimRead.checked = manageTicketRead
		manageTicketsClaimWrite.checked = manageTicketWrite
	}
	const missingWithdrawalSubModules = (subMainModuleDetails: any) => {
		const { read: missingWithdrawalRead, write: missingWithdrawalWrite, subModuleDetails: missingWithdrawalSubModules  } = subMainModuleDetails?.find((obj: any) => obj.description === SECURABLE_NAMES.MissingWithdrawal) ?? { read: false, write: false, subModuleDetails: [] };
		
		missingWithdrawalClaimRead.checked = missingWithdrawalRead
		missingWithdrawalClaimWrite.checked = missingWithdrawalWrite

		const { read: reporterRoleRead, write: reporterRoleWrite } = missingWithdrawalSubModules?.find((obj: any) => obj.description === SECURABLE_NAMES.Reporter) ?? { read: false, write: false };
		missingWithdrawalReporterClaimRead.checked = reporterRoleRead;
		missingWithdrawalReporterClaimWrite.checked = reporterRoleWrite;

		if(missingWithdrawalClaimRead.checked === true && missingWithdrawalClaimWrite.checked === true){
			missingWithdrawalReporterClaimRead.disabled = false;
			missingWithdrawalReporterClaimWrite.disabled = false;
		}
	}
	const issueSubModules = (subMainModuleDetails: any) => {
		const { read: issueRead, write: issueWrite } = subMainModuleDetails?.find((obj: any) => obj.description === SECURABLE_NAMES.TicketIssue) ?? { read: false, write: false, subModuleDetails: [] };
		
		issueClaimRead.checked = issueRead
		issueClaimWrite.checked = issueWrite
	}
	const taskSubModules = (subMainModuleDetails: any) => {
		const { read: taskRead, write: taskrite } = subMainModuleDetails?.find((obj: any) => obj.description === SECURABLE_NAMES.TicketTask) ?? { read: false, write: false, subModuleDetails: [] };
		
		taskClaimRead.checked = taskRead
		taskClaimWrite.checked = taskrite
	}
	const missingDepositSubModules = (subMainModuleDetails: any) => {
		const { read: missingDepositRead, write: missingDepositWrite, subModuleDetails: missingDepositSubModules } = subMainModuleDetails?.find((obj: any) => obj.description === SECURABLE_NAMES.MissingDeposit) ?? { read: false, write: false, subModuleDetails: [] };
		missingDepositClaimRead.checked = missingDepositRead
		missingDepositClaimWrite.checked = missingDepositWrite

		const { read: reporterRoleRead, write: reporterRoleWrite } = missingDepositSubModules?.find((obj: any) => obj.description === SECURABLE_NAMES.ReporterRole) ?? { read: false, write: false };
		reporterRoleClaimRead.checked = reporterRoleRead;
		reporterRoleClaimWrite.checked = reporterRoleWrite;
	}

	function changeTicketsRuleStatus() {
		const ticketsAllFalse = () => {
			manageTicketsClaimRead.disabled = false;
			manageTicketsClaimWrite.disabled = false;
			missingDepositClaimRead.disabled = false;
			missingDepositClaimWrite.disabled = false;
			missingWithdrawalClaimRead.disabled = false;
			missingWithdrawalClaimWrite.disabled = false;
			issueClaimRead.disabled = false;
			issueClaimWrite.disabled = false;
			taskClaimRead.disabled = false;
			taskClaimWrite.disabled = false;
			
			setManageTicketsRead(false);
			setManageTicketsWrite(false);
			setMissingDepositRead(false);
			setMissingDepositWrite(false);
			setMissingWithdrawalRead(false);
			setMissingWithdrawalWrite(false);
			setIssueRead(false);
			setIssueWrite(false);
			setTaskRead(false);
			setTaskWrite(false);
		};

		if (ticketsClaimRead.checked === true && ticketsClaimWrite.checked === true) {
			ticketsAllFalse();
		} else if (ticketsClaimRead.checked === true && ticketsClaimWrite.checked === false) {
			
			
			manageTicketsClaimRead.disabled = false;
			manageTicketsClaimWrite.disabled = true;
			manageTicketsClaimWrite.checked = false;

			missingDepositClaimRead.disabled = false;
			missingDepositClaimWrite.disabled = true;
			missingDepositClaimWrite.checked = false;

			missingWithdrawalClaimRead.disabled = false;
			missingWithdrawalClaimWrite.disabled = true;
			missingWithdrawalClaimWrite.checked = false;

			issueClaimRead.disabled = false;
			issueClaimWrite.disabled = true;
			issueClaimWrite.checked = false;

			taskClaimRead.disabled = false;
			taskClaimWrite.disabled = true;
			taskClaimWrite.checked = false;


			setManageTicketsWrite(false);
			setMissingDepositWrite(false);
			setMissingWithdrawalWrite(false);
			setIssueWrite(false);
			setTaskWrite(false);
		}

		if (ticketsClaimRead.checked === false && ticketsClaimWrite.checked === true) {
			manageTicketsClaimRead.disabled = false;
			manageTicketsClaimRead.checked = false;
			manageTicketsClaimWrite.disabled = false;

			missingDepositClaimRead.disabled = false;
			missingDepositClaimRead.checked = false;
			missingDepositClaimWrite.disabled = false;

			missingWithdrawalClaimRead.disabled = false;
			missingWithdrawalClaimRead.checked = false;
			missingWithdrawalClaimWrite.disabled = false;

			issueClaimRead.disabled = false;
			issueClaimRead.checked = false;
			issueClaimWrite.disabled = false;

			taskClaimRead.disabled = false;
			taskClaimRead.checked = false;
			taskClaimWrite.disabled = false;

			setManageTicketsRead(false);
			setMissingDepositRead(false);
			setMissingWithdrawalRead(false);
			setIssueRead(false);
			setTaskRead(false);

		} else if (ticketsClaimRead.checked === false && ticketsClaimWrite.checked === false) {
			manageTicketsClaimRead.disabled = true;
			manageTicketsClaimWrite.disabled = true;
			manageTicketsClaimRead.checked = false;
			manageTicketsClaimWrite.checked = false;

			missingDepositClaimRead.disabled = true;
			missingDepositClaimWrite.disabled = true;
			missingDepositClaimRead.checked = false;
			missingDepositClaimWrite.checked = false;

			missingWithdrawalClaimRead.disabled = true;
			missingWithdrawalClaimWrite.disabled = true;
			missingWithdrawalClaimRead.checked = false;
			missingWithdrawalClaimWrite.checked = false;

			issueClaimRead.disabled = true;
			issueClaimWrite.disabled = true;
			issueClaimRead.checked = false;
			issueClaimWrite.checked = false;

			taskClaimRead.disabled = true;
			taskClaimWrite.disabled = true;
			taskClaimRead.checked = false;
			taskClaimWrite.checked = false;

			setManageTicketsRead(false);
			setManageTicketsWrite(false);

			setMissingDepositRead(false);
			setMissingDepositWrite(false);

			setMissingWithdrawalRead(false);
			setMissingWithdrawalWrite(false);

			setIssueRead(false);
			setIssueWrite(false);

			setTaskRead(false);
			setTaskWrite(false);
		}
	}

	function changeMissingDepositRuleStatus() {
		const missingDepositAllFalse = () => {
			reporterRoleClaimRead.disabled = false;
			reporterRoleClaimWrite.disabled = false;
			setReporterRoleRead(false);
			setReporterRoleWrite(false);
		}

		if (missingDepositClaimRead.checked === true && missingDepositClaimWrite.checked === true) {
			missingDepositAllFalse();			
		} else if (missingDepositClaimRead.checked === true && missingDepositClaimWrite.checked === false) {
			reporterRoleClaimRead.disabled = false;
			reporterRoleClaimWrite.disabled = true;
			reporterRoleClaimWrite.checked = false;

			setReporterRoleRead(false);
			setReporterRoleWrite(false);

		} else if (missingDepositClaimRead.checked === false && missingDepositClaimWrite.checked === true) {
			reporterRoleClaimRead.disabled = true;
            reporterRoleClaimWrite.disabled = false;
            reporterRoleClaimRead.checked = false;

            setReporterRoleRead(true);
            setReporterRoleWrite(false);
		} else if (missingDepositClaimRead.checked === false && missingDepositClaimWrite.checked === false) {
			reporterRoleClaimRead.disabled = true;
			reporterRoleClaimWrite.disabled = true;
			reporterRoleClaimRead.checked = false
			reporterRoleClaimWrite.checked = false;
			setReporterRoleRead(false);
			setReporterRoleWrite(false);
		}
	}

	function changeMissingWithdrawalRuleStatus() {
		
		const missingWithdrawalAllFalse = () => {
			missingWithdrawalReporterClaimRead.disabled = false;
			missingWithdrawalReporterClaimWrite.disabled = false;
			setMissingWithdrawalReporterRead(false);
			setMissingWithdrawalReporterWrite(false);
		}

		if (missingWithdrawalClaimRead.checked === true && missingWithdrawalClaimWrite.checked === true) {
			missingWithdrawalAllFalse();			
		} else if (missingWithdrawalClaimRead.checked === true && missingWithdrawalClaimWrite.checked === false) {
			missingWithdrawalReporterClaimRead.disabled = false;
			missingWithdrawalReporterClaimWrite.disabled = true;
			missingWithdrawalReporterClaimWrite.checked = false;

			setMissingWithdrawalReporterRead(false);
			setMissingWithdrawalReporterWrite(false);

		} else if (missingWithdrawalClaimRead.checked === false && missingWithdrawalClaimWrite.checked === true) {
			missingWithdrawalReporterClaimRead.disabled = true;
            missingWithdrawalReporterClaimWrite.disabled = false;
            missingWithdrawalReporterClaimRead.checked = false;

            setMissingWithdrawalReporterRead(true);
            setMissingWithdrawalReporterWrite(false);
		} else if (missingWithdrawalClaimRead.checked === false && missingWithdrawalClaimWrite.checked === false) {
			missingWithdrawalReporterClaimRead.disabled = true;
			missingWithdrawalReporterClaimWrite.disabled = true;
			missingWithdrawalReporterClaimRead.checked = false
			missingWithdrawalReporterClaimWrite.checked = false;
			setMissingWithdrawalReporterRead(false);
			setMissingWithdrawalReporterWrite(false);
		}
	}

	function onChangeTicketsRead(val: boolean) {
		setTicketsRead(val);
		changeTicketsRuleStatus();
		changeMissingDepositRuleStatus();
		changeMissingWithdrawalRuleStatus();
	}

	function onChangeTicketsWrite(val: boolean) {
		setTicketsWrite(val);
		changeTicketsRuleStatus();
		changeMissingDepositRuleStatus();
		changeMissingWithdrawalRuleStatus();
	}

	function onChangeManageTicketsWrite(val: boolean) {
		setManageTicketsWrite(val);
	}
	function onChangeManageTicketRead(val: boolean) {
		setManageTicketsRead(val);
	}

	function onChangeMissingDepositWrite(val: boolean) {
		setMissingDepositWrite(val);
		changeMissingDepositRuleStatus()
	}
	function onChangeMissingDepositRead(val: boolean) {
		setMissingDepositRead(val);
		changeMissingDepositRuleStatus()
	}

	function onChangeReporterRoleRead(val: boolean) {
		setReporterRoleRead(val);
	}

	function onChangeReporterRoleWrite(val: boolean) {
		setReporterRoleWrite(val);
	}

	function onChangeMissingWithdrawalWrite(val: boolean) {
		setMissingWithdrawalWrite(val);
		changeMissingWithdrawalRuleStatus();
	}
	function onChangeMissingWithdrawalRead(val: boolean) {
		setMissingWithdrawalRead(val);
		changeMissingWithdrawalRuleStatus();
	}

	function onChangeMissingWithdrawalReporterRead(val: boolean) {
		setMissingWithdrawalReporterRead(val);
	}

	function onChangeMissingWithdrawalReporterWrite(val: boolean) {
		setMissingWithdrawalReporterWrite(val);
	}

	return (
		<>
			<Card.Header className='accordion-header' style={CardHeaderEditStyles}>
				<Accordion.Toggle as={Button} variant='link' eventKey='12'>
					<FontAwesomeIcon icon={faTicketAlt} /> {SECURABLE_NAMES.Tickets}
				</Accordion.Toggle>
				<div className='d-flex align-items-center my-2 acc-read'>
					<div className='col-sm-7'>
						<ToggleComponent
							toggleId='ticketsClaimRead'
							toggleChange={onChangeTicketsRead}
							toggleDefaultValue={ticketsRead}
							toggleTagging='Read'
							isDisabled={false}
						/>
					</div>
					<div className='col'>
						<div className='form-check form-switch form-check-custom form-check-solid acc-read'>
							<ToggleComponent
								toggleId='ticketsClaimWrite'
								toggleChange={onChangeTicketsWrite}
								toggleDefaultValue={ticketsWrite}
								toggleTagging='Write'
								isDisabled={false}
							/>
						</div>
					</div>
				</div>
			</Card.Header>
			<Accordion.Collapse eventKey='12'>
				<Card.Body className='accordion-body edit-user-div' style={CardBodyEditStyles}>
					<Accordion defaultActiveKey='12' className='accordion'>
						<Card>
							<Card.Header className='accordion-header'>
								<Accordion.Toggle as={Button} variant='link' eventKey='1'>
									<FontAwesomeIcon icon={faCircle} /> {SECURABLE_NAMES.ManageTickets}
								</Accordion.Toggle>
								<div className='d-flex align-items-center my-2'>
									<div className='col-sm-7'>
										<div className='form-check form-switch form-check-custom form-check-solid elem-role-edit'>
											<ToggleComponent
												toggleId='manageTicketsClaimRead'
												toggleChange={onChangeManageTicketRead}
												toggleDefaultValue={manageTicketsRead}
												toggleTagging='Read'
												isDisabled={true}
											/>
										</div>
									</div>
									<div className='col'>
										<div className='form-check form-switch form-check-custom form-check-solid elem-role-edit'>
											<ToggleComponent
												toggleId='manageTicketsClaimWrite'
												toggleChange={onChangeManageTicketsWrite}
												toggleDefaultValue={manageTicketsWrite}
												toggleTagging='Write'
												isDisabled={true}
											/>
										</div>
									</div>
								</div>
							</Card.Header>
							<Card.Header className='accordion-header'>
								<Accordion.Toggle as={Button} variant='link' eventKey='2'>
									<FontAwesomeIcon icon={faCircle} /> {SECURABLE_NAMES.MissingDeposit}
								</Accordion.Toggle>
								<div className='d-flex align-items-center my-2'>
									<div className='col-sm-7'>
										<div className='form-check form-switch form-check-custom form-check-solid elem-role-edit'>
											<ToggleComponent
												toggleId='missingDepositClaimRead'
												toggleChange={onChangeMissingDepositRead}
												toggleDefaultValue={missingDepositRead}
												toggleTagging='Read'
												isDisabled={true}
											/>
										</div>
									</div>
									<div className='col'>
										<div className='form-check form-switch form-check-custom form-check-solid elem-role-edit'>
											<ToggleComponent
												toggleId='missingDepositClaimWrite'
												toggleChange={onChangeMissingDepositWrite}
												toggleDefaultValue={missingDepositWrite}
												toggleTagging='Write'
												isDisabled={true}
											/>
										</div>
									</div>
								</div>
							</Card.Header>
							<Accordion.Collapse eventKey='2'>
								<Card.Body className='accordion-body edit-user-div' style={CardBodyEditStyles}>
									{/* Reporter Role */}
									<div className='row mb-3'>
										<div className='d-flex align-items-center my-2'>
											<div className='col-sm-10'>
												<div className='form-label-sm'>{SECURABLE_NAMES.ReporterRole}</div>
											</div>
											<div className='col-sm-1'>
												<div className='form-check form-switch form-check-custom form-check-solid'>
													<ToggleComponent
														toggleId='reporterRoleClaimRead'
														toggleTagging='Read'
														toggleChange={onChangeReporterRoleRead}
														toggleDefaultValue={reporterRoleRead}
														isDisabled={true}
													/>
												</div>
											</div>
											<div className='col'>
												<div className='form-check form-switch form-check-custom form-check-solid'>
													<ToggleComponent
														toggleId='reporterRoleClaimWrite'
														toggleTagging='Write'
														toggleChange={onChangeReporterRoleWrite}
														toggleDefaultValue={reporterRoleWrite}
														isDisabled={true}
													/>
												</div>
											</div>
										</div>
									</div>
								</Card.Body>
							</Accordion.Collapse>

							<Card.Header className='accordion-header'>
								<Accordion.Toggle as={Button} variant='link' eventKey='3'>
									<FontAwesomeIcon icon={faCircle} /> {SECURABLE_NAMES.MissingWithdrawal}
								</Accordion.Toggle>
								<div className='d-flex align-items-center my-2'>
									<div className='col-sm-7'>
										<div className='form-check form-switch form-check-custom form-check-solid elem-role-edit'>
											<ToggleComponent
												toggleId='missingWithdrawalClaimRead'
												toggleChange={onChangeMissingWithdrawalRead}
												toggleDefaultValue={missingWithdrawalRead}
												toggleTagging='Read'
												isDisabled={true}
											/>
										</div>
									</div>
									<div className='col'>
										<div className='form-check form-switch form-check-custom form-check-solid elem-role-edit'>
											<ToggleComponent
												toggleId='missingWithdrawalClaimWrite'
												toggleChange={onChangeMissingWithdrawalWrite}
												toggleDefaultValue={missingWithdrawalWrite}
												toggleTagging='Write'
												isDisabled={true}
											/>
										</div>
									</div>
								</div>
							</Card.Header>
							<Accordion.Collapse eventKey='3'>
								<Card.Body className='accordion-body edit-user-div' style={CardBodyEditStyles}>
									{/* Reporter Role */}
									<div className='row mb-3'>
										<div className='d-flex align-items-center my-2'>
											<div className='col-sm-10'>
												<div className='form-label-sm'>{SECURABLE_NAMES.Reporter}</div>
											</div>
											<div className='col-sm-1'>
												<div className='form-check form-switch form-check-custom form-check-solid'>
													<ToggleComponent
														toggleId='missingWithdrawalReporterClaimRead'
														toggleTagging='Read'
														toggleChange={onChangeMissingWithdrawalReporterRead}
														toggleDefaultValue={missingWithdrawalReporterRead}
														isDisabled={true}
													/>
												</div>
											</div>
											<div className='col'>
												<div className='form-check form-switch form-check-custom form-check-solid'>
													<ToggleComponent
														toggleId='missingWithdrawalReporterClaimWrite'
														toggleTagging='Write'
														toggleChange={onChangeMissingWithdrawalReporterWrite}
														toggleDefaultValue={missingWithdrawalReporterWrite}
														isDisabled={true}
													/>
												</div>
											</div>
										</div>
									</div>
								</Card.Body>
							</Accordion.Collapse>

							<Card.Header className='accordion-header'>
								<Accordion.Toggle as={Button} variant='link' eventKey='4'>
									<FontAwesomeIcon icon={faCircle} /> {SECURABLE_NAMES.TicketIssue}
								</Accordion.Toggle>
								<div className='d-flex align-items-center my-2'>
									<div className='col-sm-7'>
										<div className='form-check form-switch form-check-custom form-check-solid elem-role-edit'>
											<ToggleComponent
												toggleId='issueClaimRead'
												toggleChange={onChangeMissingDepositRead}
												toggleDefaultValue={issueRead}
												toggleTagging='Read'
												isDisabled={true}
											/>
										</div>
									</div>
									<div className='col'>
										<div className='form-check form-switch form-check-custom form-check-solid elem-role-edit'>
											<ToggleComponent
												toggleId='issueClaimWrite'
												toggleChange={onChangeMissingDepositWrite}
												toggleDefaultValue={issueWrite}
												toggleTagging='Write'
												isDisabled={true}
											/>
										</div>
									</div>
								</div>
							</Card.Header>

							<Card.Header className='accordion-header'>
								<Accordion.Toggle as={Button} variant='link' eventKey='5'>
									<FontAwesomeIcon icon={faCircle} /> {SECURABLE_NAMES.TicketTask}
								</Accordion.Toggle>
								<div className='d-flex align-items-center my-2'>
									<div className='col-sm-7'>
										<div className='form-check form-switch form-check-custom form-check-solid elem-role-edit'>
											<ToggleComponent
												toggleId='taskClaimRead'
												toggleChange={onChangeMissingDepositRead}
												toggleDefaultValue={taskRead}
												toggleTagging='Read'
												isDisabled={true}
											/>
										</div>
									</div>
									<div className='col'>
										<div className='form-check form-switch form-check-custom form-check-solid elem-role-edit'>
											<ToggleComponent
												toggleId='taskClaimWrite'
												toggleChange={onChangeMissingDepositWrite}
												toggleDefaultValue={taskWrite}
												toggleTagging='Write'
												isDisabled={true}
											/>
										</div>
									</div>
								</div>
							</Card.Header>
						</Card>
					</Accordion>
				</Card.Body>
			</Accordion.Collapse>
		</>
	);
};

export default TicketSecurableObject;
