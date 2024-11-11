import 'bootstrap/dist/css/bootstrap.min.css';
import {useFormik} from 'formik';
import {Guid} from 'guid-typescript';
import $ from 'jquery';
import React, {useEffect, useState} from 'react';
import {Accordion, Card} from 'react-bootstrap';
import {shallowEqual, useSelector} from 'react-redux';
import {useHistory} from 'react-router-dom';
import swal from 'sweetalert';
import * as Yup from 'yup';
import {RootState} from '../../../../../setup';
import * as hubConnection from '../../../../../setup/hub/MessagingHub';
import * as InternetConnectionHandler from '../../../../../setup/internet-connection/InternetConnectionHandler';
import * as sessionHandler from '../../../../../setup/session/SessionHandler';
import {FooterContainer, PaddedContainer} from '../../../../custom-components';
import {MainModuleModel} from '../../models/MainModuleModel';
import {RoleIdRequestModel} from '../../models/RoleIdRequestModel';
import {RoleRequestModel} from '../../models/RoleRequestModel';
import CampaignDashBoardSecurableObject from '../shared/compoments/CampaignDashBoardSecurableObject';
import CampaignManagementSecurableObjects from '../shared/compoments/CampaignManagementSecurableObjects';
import CampaignWorkSpaceSecurableObjects from '../shared/compoments/CampaignWorkSpaceSecurableObjects';
import CaseCommunicationSecurableObjects from '../shared/compoments/CaseCommunicationSecurableObjects';
import CaseManagementSecurableObjects from '../shared/compoments/CaseManagementSecurableObjects';
import CommunicationReviewSecurableObject from '../shared/compoments/CommunicationReviewSecurableObject';
import HomeSecurableObjects from '../shared/compoments/HomeSecurableObjects';
import PlayerManagementSecurableObjects from '../shared/compoments/PlayerManagementSecurableObjects';
import RelationShipManagementSecurableObjects from '../shared/compoments/RelationShipManagementSecurableObjects';
import SystemSecurableObjects from '../shared/compoments/SystemSecurableObjects';
import TicketSecurableObject from '../shared/compoments/TicketSecurableObject';
import UserManagementSecurableObjects from '../shared/compoments/UserManagementSecurableObjects';
import {UseUserRoleHooks} from '../shared/hooks/UseUserRoleHooks';
import {buildSecurableObjects} from '../shared/utils/helper';

const roleSchema = Yup.object().shape({
	name: Yup.string(),
	description: Yup.string(),
	status: Yup.number(),
	securableObjects: Yup.array(),
	createdBy: Yup.number(),
	updatedBy: Yup.number(),
	queueId: Yup.string(),
	userId: Yup.string(),
});

const initialValues = {
	name: '',
	description: '',
	status: 0,
	securableObjects: Array<MainModuleModel>(),
	createdBy: 0,
	updatedBy: 0,
	queueId: '',
	userId: '',
};

const CardHeaderStyles = {
	backgroundColor: '#F8F9F9',
};

const CardBodytyles = {
	backgroundColor: '#F7F7F7',
};

const enableSplashScreen = () => {
	const splashScreen = document.getElementById('splash-screen');
	if (splashScreen) {
		splashScreen.style.setProperty('display', 'flex');
		splashScreen.style.setProperty('opacity', '0.5');
	}
};

const CreateRole: React.FC = () => {
	//Redux
	const userAccessId = useSelector<RootState>(({auth}) => auth.userId, shallowEqual) as number;
	const expiresIn = useSelector<RootState>(({auth}) => auth.expiresIn, shallowEqual) as string;
	const history = useHistory();

	const [loading, setLoading] = useState(false);

	//Hooks
	const {roleById, getUserRoleById, addUserRole, completed, isSuccess} = UseUserRoleHooks();

	const [isLoaded, setIsLoaded] = useState(false);
	const [addMainModuleModel, setAddMainModuleModel] = useState<Array<MainModuleModel>>();

	// Formik form post
	const formik = useFormik({
		initialValues,
		validationSchema: roleSchema,
		onSubmit: (values, {setStatus, setSubmitting, resetForm}) => {
			if (InternetConnectionHandler.isSlowConnection(history) === true) {
				return;
			}

			if (sessionHandler.isSessionExpired(expiresIn, history) === true) {
				return;
			}

			values.createdBy = userAccessId;
			values.updatedBy = userAccessId;
			values.queueId = Guid.create().toString();
			values.userId = userAccessId.toString();
			values.securableObjects = buildSecurableObjects(userAccessId);
			setLoading(true);
			setTimeout(() => {
				console.log('values');
				console.log(values);
				let isValid: boolean = true;

				if (values.name === '' || values.description === '' || values.status.toString() === '0') {
					swal('Failed', 'Unable to proceed, kindly fill up all mandatory fields', 'error');
					setLoading(false);
					setSubmitting(false);

					isValid = false;
				}

				if (isValid === true) {
					swal({
						title: 'Confirmation',
						text: 'This action will create a new role record, please confirm',
						icon: 'warning',
						buttons: ['No', 'Yes'],
						dangerMode: true,
					}).then(async (willCreate) => {
						if (willCreate) {
							const messagingHub = hubConnection.createHubConnenction();
							await messagingHub.start();
							const request: RoleRequestModel = {
								id: 0,
								name: values.name,
								description: values.description,
								status: parseInt(values.status.toString()),
								securableObjects: values.securableObjects,
								createdBy: values.createdBy,
								updatedBy: values.updatedBy,
								queueId: values.queueId,
								userId: values.userId,
							};
							console.log('request');
							console.log(JSON.stringify(request));
							
							await addUserRole(request, setSubmitting, messagingHub, resetForm, history)

							
						} else {
							setLoading(false);
							setSubmitting(false);
						}
					});
				}
			}, 1000);
		},
	});
	useEffect(() => {
		if (!completed) return;
		if (isSuccess) {
			clearInput();
			formik.setFieldValue('name', '');
			formik.setFieldValue('descrption', '');
			formik.setFieldValue('status', 0);
		}
		setLoading(false);
	}, [completed, isSuccess]);

	// Mounted
	useEffect(() => {
		const pathArray = window.location.pathname.split('/');
		let pageAction: string = '';
		let pageId: string = '';

		if (pathArray.length >= 4) {
			pageAction = pathArray[3];
			pageId = pathArray[4];

			if (pageAction === 'clone') {
				if (isLoaded === false) {
					if (InternetConnectionHandler.isSlowConnection(history) === true) {
						return;
					}
					enableSplashScreen();

					setTimeout(() => {
						const requestRole: RoleIdRequestModel = {
							queueId: Guid.create().toString(),
							userId: userAccessId.toString(),
							roleId: parseInt(pageId),
						};
						getUserRoleById(requestRole);
					}, 1000);
					setIsLoaded(true);
				}
			}
		} else {
			if (isLoaded) return;
			setIsLoaded(true);
		}
	}, []);

	useEffect(() => {
		if (!roleById) return;
		setAddMainModuleModel(roleById.securableObjects);
	}, [roleById]);

	// Methods

	function clearInput() {
		let checkedItems = $("input[type='checkbox']").get();
		for (const item of checkedItems) {
			(item as HTMLInputElement).checked = false;
		}
	}

	// Return Elements
	return (
		<form className='form w-100' onSubmit={formik.handleSubmit} noValidate>
			<div className='card card-custom'>
				<div
					className='card-header cursor-pointer'
					data-bs-toggle='collapse'
					data-bs-target='#kt_account_deactivate'
					aria-expanded='true'
					aria-controls='kt_account_deactivate'
				>
					<div className='card-title m-0'>
						<h5 className='fw-bolder m-0'>Create Role</h5>
					</div>
				</div>
				<div className='card-body p-9'>
					<div className='d-flex align-items-center my-2'>
						<div className='row mb-3'>
							<div className='row mb-3'>
								<div className='col-sm-2'>
									<div className='form-label-sm required'>Role Name</div>
								</div>
								<div className='col-sm-6'>
									<input type='text' className='form-control form-control-sm' aria-label='Role Name' {...formik.getFieldProps('name')} />
								</div>
							</div>
							<div className='row mb-3'>
								<div className='col-sm-2 role-desc'>
									<div className='form-label-sm required'>Role Description</div>
								</div>
								<div className='col-sm-6 role-desc'>
									<input
										type='text'
										className='form-control form-control-sm'
										aria-label='Role Description'
										{...formik.getFieldProps('description')}
									/>
								</div>
							</div>
							<div className='row mb-3'>
								<div className='col-sm-2 role-stat'>
									<div className='form-label-sm role-stat required'>Role Status</div>
								</div>
								<div className='col-sm-6'>
									<select className='form-select form-select-sm' aria-label='Select status' {...formik.getFieldProps('status')}>
										<option value='0'>Select</option>
										<option value='1'>Active</option>
										<option value='2'>Inactive</option>
									</select>
								</div>
							</div>

							<div className='separator border-4 my-10' />
							<h6 className='fw-bolder m-0'>Securable Objects</h6>
							<br />
							<br />
							<Accordion className='accordion'>
								<Card className='card card-custom'>
									<HomeSecurableObjects
										CardHeaderEditStyles={CardHeaderStyles}
										CardBodyEditStyles={CardBodytyles}
										SecurableObjects={addMainModuleModel}
									/>
								</Card>
								<Card className='card card-custom'>
									<PlayerManagementSecurableObjects
										CardHeaderEditStyles={CardHeaderStyles}
										CardBodyEditStyles={CardBodytyles}
										SecurableObjects={addMainModuleModel}
									/>
								</Card>
								<Card className='card card-custom'>
									<UserManagementSecurableObjects
										CardHeaderEditStyles={CardHeaderStyles}
										CardBodyEditStyles={CardBodytyles}
										SecurableObjects={addMainModuleModel}
									/>
								</Card>
								<Card className='card card-custom'>
									<SystemSecurableObjects
										CardHeaderEditStyles={CardHeaderStyles}
										CardBodyEditStyles={CardBodytyles}
										SecurableObjects={addMainModuleModel}
									/>
								</Card>
								<Card className='card card-custom'>
									<CaseCommunicationSecurableObjects
										CardHeaderEditStyles={CardHeaderStyles}
										CardBodyEditStyles={CardBodytyles}
										SecurableObjects={addMainModuleModel}
									/>
								</Card>
								<Card className='card card-custom'>
									<CampaignManagementSecurableObjects
										CardHeaderEditStyles={CardHeaderStyles}
										CardBodyEditStyles={CardBodytyles}
										SecurableObjects={addMainModuleModel}
									/>
								</Card>
								<Card className='card card-custom'>
									<CampaignWorkSpaceSecurableObjects
										CardHeaderEditStyles={CardHeaderStyles}
										CardBodyEditStyles={CardBodytyles}
										SecurableObjects={addMainModuleModel}
									/>
								</Card>
								<Card className='card card-custom'>
									<CampaignDashBoardSecurableObject
										CardHeaderEditStyles={CardHeaderStyles}
										CardBodyEditStyles={CardBodytyles}
										SecurableObjects={addMainModuleModel}
									/>
								</Card>
								<Card className='card card-custom'>
									<RelationShipManagementSecurableObjects
										CardHeaderEditStyles={CardHeaderStyles}
										CardBodyEditStyles={CardBodytyles}
										SecurableObjects={addMainModuleModel}
									/>
								</Card>
								<Card className='card card-custom'>
									<CaseManagementSecurableObjects
										CardHeaderEditStyles={CardHeaderStyles}
										CardBodyEditStyles={CardBodytyles}
										SecurableObjects={addMainModuleModel}
									/>
								</Card>
								<CommunicationReviewSecurableObject
									CardHeaderEditStyles={CardHeaderStyles}
									CardBodyEditStyles={CardBodytyles}
									SecurableObjects={addMainModuleModel}
								/>
								<TicketSecurableObject
									CardHeaderEditStyles={CardHeaderStyles}
									CardBodyEditStyles={CardBodytyles}
									SecurableObjects={addMainModuleModel}
								/>
							</Accordion>
						</div>
					</div>
				</div>
				<FooterContainer>
					<PaddedContainer>
						<button type='submit' className='btn btn-primary btn-sm me-2 card-role' disabled={formik.isSubmitting}>
								{!loading && <span className='indicator-label'>Submit</span>}
								{loading && (
									<div className='indicator-progress d-flex'>
										<div>Please wait...</div>
										<div className='spinner-border spinner-border-sm align-middle ms-2'></div>
									</div>
								)}
						</button>
					</PaddedContainer>
				</FooterContainer>
			</div>
		</form>
	);
};
export default CreateRole;
