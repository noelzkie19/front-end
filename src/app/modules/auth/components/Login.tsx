/* eslint-disable jsx-a11y/anchor-is-valid */
import {useFormik} from 'formik';
import {compressToBase64} from 'lz-string';
import React, {useState} from 'react';
import {useDispatch} from 'react-redux';
import {Link} from 'react-router-dom';
import useConstant from '../../../constants/useConstant';
import * as agentWorkspaceManagement from '../../campaign-agent-workspace/redux/AgentWorkspaceRedux';
import {SegmentLookupsResponseModel} from '../../player-management/segmentation/models';
import * as segmentManagement from '../../player-management/segmentation/redux/SegmentationRedux';
import {getSegmentLookups} from '../../player-management/segmentation/redux/SegmentationService';
import {getSystemLookups} from '../../system/redux/SystemService';
import {login} from '../redux/AuthCRUD';
import * as auth from '../redux/AuthRedux';
const Pwd_Key = 'mlab-front-end@2021';
const CryptoJS = require('crypto-js');

const initialValues = {
	email: '',
	password: '',
	isRemember: false,
};

/*
  Formik+YUP+Typescript:
  https://jaredpalmer.com/formik/docs/tutorial#getfieldprops
  https://medium.com/@maurice.de.beijer/yup-validation-and-typescript-and-formik-6c342578a20e
*/

export const Login: React.FC = () => {
	const {successResponse} = useConstant();
	const isRemember = localStorage.getItem('isRemember') ?? 'false';
	initialValues.isRemember = isRemember == 'true';

	const storedEmail = localStorage.getItem('storedEmail') ?? '';
	initialValues.email = storedEmail ?? '';

	// Decrypt Password
	const storedPassword = localStorage.getItem('storedPassword') ?? '';
	initialValues.password = '';
	if (storedPassword !== '') {
		let decryptInBytes = CryptoJS.AES.decrypt(storedPassword, Pwd_Key);
		initialValues.password = JSON.parse(decryptInBytes.toString(CryptoJS.enc.Utf8));
	}

	/**
	 *  ? States
	 */
	const [loading, setLoading] = useState(false);
	const [hasErrors, setHasErrors] = useState<boolean | undefined>(undefined);
	const [errorMessage, setErrorMessage] = useState<string>('');

	const dispatch = useDispatch();

	const loadSystemLookups = () => {
		getSystemLookups()
			.then((response) => {
				if (response.status === successResponse) {
					let compressedSystemLookups = compressToBase64(JSON.stringify(response.data));
					localStorage.setItem('systemLookups', compressedSystemLookups);
				}
			})
			.catch((ex) => {
				console.log('Error GetSystemLookups: ' + ex);
			});
	};

	// 1. login
	const loginWithTimeout = (values: any) => {
		setTimeout(() => {
			login(values.email, values.password)
				.then((response) => {
					console.log(response);
					if (response.status === successResponse) {
						handleRemember(values);
						handleCredential(response.data);
						setLoadingAndSubmitting(false);
						handleLoginSuccess(values);
					}
				})
				.catch((ex) => {
					handleLoginFailure(ex.response.data.message);
				});
		}, 1000);
	};

	const handleLoginSuccess = async (values: any) => {
		localStorage.setItem('isLoggedIn', 'true');
		if (values.isRemember) {
			const ciphertext = CryptoJS.AES.encrypt(JSON.stringify(values.password), Pwd_Key).toString();
			localStorage.setItem('isRemember', 'true');
			localStorage.setItem('storedEmail', values.email);
			localStorage.setItem('storedPassword', ciphertext);
		} else {
			localStorage.removeItem('isRemember');
			localStorage.removeItem('storedEmail');
			localStorage.removeItem('storedPassword');
		}

		loadSegmentLookUps();
		loadSystemLookups();
	};

	const handleLoginFailure = (_errorMessage: string): void => {
		setHasErrors(true);
		setErrorMessage(_errorMessage);
		setLoadingAndSubmitting(false);
	};

	const handleRemember = (values: any): void => {
		const ciphertext = CryptoJS.AES.encrypt(JSON.stringify(values.password), Pwd_Key).toString();
		localStorage.setItem('isRemember', 'true');
		localStorage.setItem('storedEmail', values.email);
		localStorage.setItem('storedPassword', ciphertext);
	};

	const handleCredential = (credential: any): void => {
		dispatch(auth.actions.login(credential.token, credential.userId, credential.access, credential.expiresIn, credential.fullName, credential.mCoreUserId));
		dispatch(agentWorkspaceManagement.actions.setCurrentUser(credential.fullName));
		setLoadingAndSubmitting(false);
		formik.setSubmitting(false);
		setLoading(false);
	};

	const setLoadingAndSubmitting = (isLoading: boolean): void => {
		setLoading(isLoading);
		formik.setSubmitting(isLoading);
	};

	const formik = useFormik({
		initialValues,
		onSubmit: async (values, {setStatus, setSubmitting}) => {
			setLoading(true);
			setHasErrors(false);
			setErrorMessage('');

			loginWithTimeout(values);
		},
	});

	const loadSegmentLookUps = () => {
		getSegmentLookups()
			.then((response) => {
				if (response.status === successResponse) {
					let resultData = Object.assign({} as SegmentLookupsResponseModel, response.data);
					dispatch(segmentManagement.actions.setSegmentLookups(resultData));
				}
			})
			.catch((ex) => {
				console.log('Error getSegmentLookups: ' + ex);
			});
	};

	return (
		<form className='form w-100' onSubmit={formik.handleSubmit} noValidate id='kt_login_signin_form'>
			{/* begin::Heading */}
			<div className='text-center mb-10'>
				<h1 className='text-dark mb-3'>Sign In</h1>
			</div>
			{/* begin::Heading */}

			{hasErrors === true && (
				<div className='mb-lg-15 alert alert-danger'>
					<div className='alert-text font-weight-bold'>{errorMessage ?? 'Sorry, looks like there are some errors detected, please try again.'}</div>
				</div>
			)}

			{/* begin::Form group */}
			<div className='fv-row mb-10'>
				<label className='form-label fs-6 fw-bolder text-dark'>Email</label>
				<input
					placeholder='user@domain.com'
					{...formik.getFieldProps('email')}
					className='form-control form-control-lg form-control-solid'
					type='email'
					name='email'
				/>
			</div>
			{/* end::Form group */}

			{/* begin::Form group */}
			<div className='fv-row mb-10'>
				<div className='d-flex justify-content-between mt-n5'>
					<div className='d-flex flex-stack mb-2'>
						{/* begin::Label */}
						<label className='form-label fw-bolder text-dark fs-6 mb-0'>Password</label>
						{/* end::Label */}
						{/* begin::Link */}

						{/* end::Link */}
					</div>
				</div>
				<input type='password' autoComplete='off' {...formik.getFieldProps('password')} className='form-control form-control-lg form-control-solid' />
			</div>
			{/* end::Form group */}

			{/* begin::Action */}
			<div className='text-center'>
				<button type='submit' id='kt_sign_in_submit' className='btn btn-lg btn-primary w-100 mb-5' disabled={formik.isSubmitting || !formik.isValid}>
					{!loading && <span className='indicator-label'>Continue</span>}
					{loading && (
						<span className='indicator-progress' style={{display: 'block'}}>
							{'Please wait...'}
							<span className='spinner-border spinner-border-sm align-middle ms-2'></span>
						</span>
					)}
				</button>
			</div>
			{/* end::Action */}

			<div className='form-check'>
				<label className='form-check-label'>Remember me</label>
				<input
					className='form-check-input'
					type='checkbox'
					id='gridCheck'
					defaultChecked={initialValues.isRemember}
					{...formik.getFieldProps('isRemember')}
				></input>
				<Link to='/auth/forgot-password' className='link-primary fs-6 fw-bolder' style={{marginLeft: '150px'}}>
					Reset Password ?
				</Link>
			</div>
		</form>
	);
};
