import 'bootstrap/dist/css/bootstrap.min.css';
import {useFormik} from 'formik';
import {Guid} from 'guid-typescript';
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
import {enableSplashScreen} from '../../../../utils/helper';
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
	roleId: Yup.string(),
	roleName: Yup.string(),
	roleDescription: Yup.string(),
	roleStatus: Yup.number(),
	securableObjects: Yup.array(),
	roleCreatedBy: Yup.number(),
	queueId: Yup.string(),
	userId: Yup.string(),
	roleUpdatedBy: Yup.number(),
});

const initialValues = {
	roleId: '',
	roleName: '',
	roleDescription: '',
	roleStatus: 0,
	securableObjects: Array<MainModuleModel>(),
	roleCreatedBy: 0,
	queueId: '',
	userId: '',
	roleUpdatedBy: 0,
};

const CardHeaderEditStyles = {
	backgroundColor: '#F8F9F9',
};

const CardBodyEditStyles = {
	backgroundColor: '#F7F7F7',
};

const EditRole: React.FC = () => {
	// Get Redux Store
	const userAccessId = useSelector<RootState>(({auth}) => auth.userId, shallowEqual) as number;
	const expiresIn = useSelector<RootState>(({auth}) => auth.expiresIn, shallowEqual) as string;
	const history = useHistory();

	//Hooks
	const {roleById, getUserRoleById, updateUserRole, completed} = UseUserRoleHooks();

	// States
	const [roleIdDisplay, setRoleIdDisplay] = useState('');
	const [loading, setLoading] = useState(false);

	const [isLoaded, setIsLoaded] = useState(false);
	const [mainModuleModel, setMainModuleModel] = useState<Array<MainModuleModel>>();
	// Formik Form Segmentation Post
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

			values.roleCreatedBy = userAccessId;
			values.roleUpdatedBy = userAccessId;
			values.queueId = Guid.create().toString();
			values.userId = userAccessId.toString();
			values.securableObjects = buildSecurableObjects(userAccessId);
			setLoading(true);
			setTimeout(() => {
				let isValid: boolean = true;

				if (values.roleName === '' || values.roleDescription === '' || values.roleStatus.toString() === '0') {
					swal('Failed', 'Unable to proceed, kindly fill up all mandatory fields', 'error');
					setLoading(false);
					setSubmitting(false);
					isValid = false;
				}

				if (isValid === true) {
					swal({
						title: 'Confirmation',
						text: 'This action will update role record, please confirm',
						icon: 'warning',
						buttons: ['No', 'Yes'],
						dangerMode: true,
					}).then(async (willUpdate) => {
						if (willUpdate) {
							const messagingHub = hubConnection.createHubConnenction();
							await messagingHub.start();
							const request: RoleRequestModel = {
								id: parseInt(values.roleId),
								name: values.roleName,
								description: values.roleDescription,
								status: parseInt(values.roleStatus.toString()),
								securableObjects: values.securableObjects,
								createdBy: values.roleCreatedBy,
								updatedBy: values.roleUpdatedBy,
								queueId: values.queueId,
								userId: values.userId,
							};
							await updateUserRole(request, setSubmitting, messagingHub)
              
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
		setLoading(false);
	}, [completed]);

	// Mounted
	useEffect(() => {
		const pathArray = window.location.pathname.split('/');
		let pageId: string = '';

		if (pathArray.length >= 4) {
			pageId = pathArray[3];
			if (isLoaded === false) {
				if (InternetConnectionHandler.isSlowConnection(history) === true) {
					return;
				}
				enableSplashScreen();
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
		}
	}, []);

	useEffect(() => {
		if (!roleById) return;
		console.log(roleById);
		setRoleIdDisplay(roleById.roleId);
		initialValues.roleId = roleById.roleId;
		initialValues.roleName = roleById.name;
		initialValues.roleDescription = roleById.description;
		initialValues.roleStatus = roleById.status;
		initialValues.roleCreatedBy = parseInt(roleById.createdBy);

		formik.setFieldValue('roleId', initialValues.roleId);
		formik.setFieldValue('roleName', initialValues.roleName);
		formik.setFieldValue('roleDescription', initialValues.roleDescription);
		formik.setFieldValue('roleStatus', initialValues.roleStatus);
		formik.setFieldValue('roleCreatedBy', initialValues.roleCreatedBy);
		setMainModuleModel(roleById.securableObjects);
		setIsLoaded(true);
	}, [roleById]);

	// Components

	// Return Elements
	return (
		<form className='form w-100' onSubmit={formik.handleSubmit} noValidate>
			<div className='card card-custom edit-user-div'>
				<div
					className='card-header cursor-pointer'
					data-bs-toggle='collapse'
					data-bs-target='#kt_account_deactivate'
					aria-expanded='true'
					aria-controls='kt_account_deactivate'
				>
					<div className='card-title m-0'>
						<h5 className='fw-bolder m-0'>Edit Role</h5>
					</div>
				</div>
				<div className='card-body p-9 edit-user-div'>
					<div className='d-flex align-items-center my-2'>
						<div className='row mb-3'>
							<div className='row mb-3'>
								<div className='col-sm-2'>
									<div className='form-label-lg fw-bold '>Role Id: </div>
								</div>
								<div className='col-sm-6'>
									<div className='form-label-lg fw-bold '>{roleIdDisplay}</div>
								</div>
							</div>
							<br />

							<div className='row mb-3'>
								<div className='col-sm-2 role-edit-lbl'>
									<div className='form-label-sm role-field required'>Role Name</div>
								</div>
								<div className='col-sm-6'>
									<input type='text' className='form-control form-control-sm' aria-label='Role Name' {...formik.getFieldProps('roleName')} />
								</div>
							</div>
							<div className='row mb-3'>
								<div className='col-sm-2 role-edit-lbl'>
									<div className='form-label-sm required'>Role Description</div>
								</div>
								<div className='col-sm-6'>
									<input
										type='text'
										className='form-control form-control-sm'
										aria-label='Role Description'
										{...formik.getFieldProps('roleDescription')}
									/>
								</div>
							</div>
							<div className='row mb-3'>
								<div className='col-sm-2'>
									<div className='form-label-sm role-edit-lbl required'>Role Status</div>
								</div>
								<div className='col-sm-6'>
									<select className='form-select form-select-sm' aria-label='Select status' {...formik.getFieldProps('roleStatus')}>
										<option value='0'>Select</option>
										<option value='1'>Active</option>
										<option value='2'>Inactive</option>
									</select>
								</div>
							</div>
							<div className='row mb-3'>
								<div className='col-sm-2'>
									<div className='form-label-lg fw-bold '>Created By: </div>
								</div>
								<div className='col-sm-6'>
									<input
										type='text'
										className='form-control form-control-sm'
										disabled
										aria-label='Email'
										{...formik.getFieldProps('roleCreatedBy')}
									/>
								</div>
							</div>

							<div className='separator border-4 my-10' />
							<h6 className='fw-bolder m-0'>Securable Objects</h6>
							<br />
							<br />

							<Accordion className='accordion'>
								<Card className='card card-custom'>
									<HomeSecurableObjects
										CardHeaderEditStyles={CardHeaderEditStyles}
										CardBodyEditStyles={CardBodyEditStyles}
										SecurableObjects={mainModuleModel}
									/>
								</Card>
								<Card className='card card-custom edit-user-div'>
									<PlayerManagementSecurableObjects
										CardHeaderEditStyles={CardHeaderEditStyles}
										CardBodyEditStyles={CardBodyEditStyles}
										SecurableObjects={mainModuleModel}
									/>
								</Card>
								<Card className='card card-custom edit-user-div'>
									<UserManagementSecurableObjects
										CardHeaderEditStyles={CardHeaderEditStyles}
										CardBodyEditStyles={CardBodyEditStyles}
										SecurableObjects={mainModuleModel}
									/>
								</Card>
								<Card className='card card-custom edit-user-div'>
									<SystemSecurableObjects
										CardHeaderEditStyles={CardHeaderEditStyles}
										CardBodyEditStyles={CardBodyEditStyles}
										SecurableObjects={mainModuleModel}
									/>
								</Card>
								<Card className='card card-custom edit-user-div'>
									<CaseCommunicationSecurableObjects
										CardHeaderEditStyles={CardHeaderEditStyles}
										CardBodyEditStyles={CardBodyEditStyles}
										SecurableObjects={mainModuleModel}
									/>
								</Card>
								<Card className='card card-custom edit-user-div'>
									<CampaignManagementSecurableObjects
										CardHeaderEditStyles={CardHeaderEditStyles}
										CardBodyEditStyles={CardBodyEditStyles}
										SecurableObjects={mainModuleModel}
									/>
								</Card>
								<Card className='card card-custom edit-user-div'>
									<CampaignWorkSpaceSecurableObjects
										CardHeaderEditStyles={CardHeaderEditStyles}
										CardBodyEditStyles={CardBodyEditStyles}
										SecurableObjects={mainModuleModel}
									/>
								</Card>
								<Card className='card card-custom edit-user-div'>
									<CampaignDashBoardSecurableObject
										CardHeaderEditStyles={CardHeaderEditStyles}
										CardBodyEditStyles={CardBodyEditStyles}
										SecurableObjects={mainModuleModel}
									/>
								</Card>
								<Card className='card card-custom edit-user-div'>
									<RelationShipManagementSecurableObjects
										CardHeaderEditStyles={CardHeaderEditStyles}
										CardBodyEditStyles={CardBodyEditStyles}
										SecurableObjects={mainModuleModel}
									/>
								</Card>
								<Card className='card card-custom edit-user-div'>
									<CaseManagementSecurableObjects
										CardHeaderEditStyles={CardHeaderEditStyles}
										CardBodyEditStyles={CardBodyEditStyles}
										SecurableObjects={mainModuleModel}
									/>
								</Card>
								<CommunicationReviewSecurableObject
									CardHeaderEditStyles={CardHeaderEditStyles}
									CardBodyEditStyles={CardBodyEditStyles}
									SecurableObjects={mainModuleModel}
								/>

								<TicketSecurableObject
									CardHeaderEditStyles={CardHeaderEditStyles}
									CardBodyEditStyles={CardBodyEditStyles}
									SecurableObjects={mainModuleModel}
								/>
							</Accordion>
						</div>
					</div>
				</div>
				<FooterContainer>
					<PaddedContainer>
							<button type='submit' className='btn btn-primary btn-sm me-2' disabled={formik.isSubmitting}>
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
export default EditRole;
