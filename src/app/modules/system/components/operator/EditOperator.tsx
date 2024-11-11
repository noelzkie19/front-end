import 'datatables.net';
import 'datatables.net-dt';
import {useFormik} from 'formik';
import $ from 'jquery';
import React, {useEffect, useState} from 'react';
import ReactDOM from 'react-dom';
import {shallowEqual, useSelector} from 'react-redux';
import {useHistory} from 'react-router-dom';
import swal from 'sweetalert';
import * as Yup from 'yup';
import '../../../../../_metronic/assets/css/datatables.min.css';
import '../../../../../_metronic/assets/sass/core/components/_variables.scss';
import {RootState} from '../../../../../setup';
import * as InternetConnectionHandler from '../../../../../setup/internet-connection/InternetConnectionHandler';
import * as sessionHandler from '../../../../../setup/session/SessionHandler';
import {PROMPT_MESSAGES} from '../../../../constants/Constants';
import useConstant from '../../../../constants/useConstant';
import {USER_CLAIMS} from '../../../user-management/components/constants/UserClaims';
import {BrandModel} from '../../models/BrandModel';
import {CurrencyModel} from '../../models/CurrencyModel';
import {OperatorModel} from '../../models/OperatorModel';
import {getAllCurrency, getBrandExistingList, getOperatorById, updateOperator} from '../../redux/SystemService';
import {CURRENCY_STATUS, DEFAULT_VALUES, OPERATOR_STATUS, STATUS_CODE} from '../constants/Operator';

const operatorSchema = Yup.object().shape({
	operatorId: Yup.string(),
	operatorName: Yup.string(),
	operatorStatus: Yup.number(),
	brands: Yup.array(),
	createdBy: Yup.number(),
});

const initialValues = {
	operatorId: '',
	operatorName: '',
	operatorStatus: OPERATOR_STATUS.Activate,
	brands: Array<BrandModel>(),
	createdBy: DEFAULT_VALUES.CreateUserId,
};

const enableSplashScreen = () => {
	const splashScreen = document.getElementById('splash-screen');
	if (splashScreen) {
		splashScreen.style.setProperty('display', 'flex');
		splashScreen.style.setProperty('opacity', '0.5');
	}
};

const disableSplashScreen = () => {
	const splashScreen = document.getElementById('splash-screen');
	if (splashScreen) {
		splashScreen.style.setProperty('display', 'none');
	}
};

const EditOperator: React.FC = () => {
	// Get redux store
	const userAccessId = useSelector<RootState>(({auth}) => auth.userId, shallowEqual) as number;
	const userAccess = useSelector<RootState>(({auth}) => auth.access, shallowEqual) as string;
	const [brandList, setBrandList] = useState<Array<BrandModel>>([]);
	const expiresIn = useSelector<RootState>(({auth}) => auth.expiresIn, shallowEqual) as string;
	const history = useHistory();
    const {SwalFailedMessage, SwalConfirmMessage, SwalServerErrorMessage, SwalSuccessMessage, SwalOperatorMessage} = useConstant();

	// Status
	const tempBrandList = Array<BrandModel>();
	const [loading, setLoading] = useState(false);
	const [brandId, setBrandId] = useState('');
	const [brandName, setBrandName] = useState('');
	const [isLoaded, setIsLoaded] = useState(false);

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

				setTimeout(() => {
					getOperatorById(parseInt(pageId))
						.then((response) => {
							let operator = {...response.data};
							let operatorBrands = operator?.brands;

							operatorBrands?.forEach((brand) => {
								tempBrandList.push(brand);
								return tempBrandList;
							});

							$('#table-brands').DataTable({
								retrieve: true,
								dom: '<"table-brands"ltip>',
								columns,
								data: brandList,
								ordering: true,
								paging: true,
								pagingType: 'full_numbers',
								pageLength: 10,
								order: [[1, 'asc']],
								language: {
									emptyTable: 'No Rows To Show',
								},
							});
							setBrandList(tempBrandList);

							initialValues.operatorId = operator?.operatorId.toString()!;
							initialValues.operatorName = operator?.operatorName!;
							initialValues.operatorStatus = operator?.operatorStatus!;

							formik.setFieldValue('operatorId', initialValues.operatorId);
							formik.setFieldValue('operatorName', initialValues.operatorName);
							formik.setFieldValue('operatorStatus', initialValues.operatorStatus);

							disableSplashScreen();
						})
						.catch((error) => {
							disableSplashScreen();
							console.log('problem in getting currencies' + error);
						});
				}, 1000);

				setIsLoaded(true);
			}
		}
	});

	const _validateForm = (operatorId: string, operatorName: string, operatorStatus: number, brands: Array<BrandModel>) => {
        let isValid: boolean = true;
		if (operatorId === '' || operatorName === '' || operatorStatus == OPERATOR_STATUS.Null || brands.length === 0) {
			swal(SwalFailedMessage.title, SwalOperatorMessage.textErrorCreateOperator, SwalFailedMessage.icon);
			setLoading(false);
			isValid = false;
			return;
		}
		
		if (brands.length !== 0) {
			brands.forEach((brand) => {
				let hasChecked: boolean = false;
				brand.currencies.forEach((currency) => {
					if (currency.status === CURRENCY_STATUS.Checked) {
						hasChecked = true;
					}
				});

				if (hasChecked === false) {
					swal(SwalFailedMessage.title, SwalOperatorMessage.textErrorCreateOperator, SwalFailedMessage.icon);
					setLoading(false);
					isValid = false;
				}
			});
		}

		return isValid;
	};

	const modifyOperator = (request: OperatorModel) => {
		updateOperator(request)
			.then((response) => {
				if (response.data.status !== STATUS_CODE.OK) {
             		swal(SwalServerErrorMessage.title, response.data.message, SwalServerErrorMessage.icon);
				} else {
                   	swal(SwalSuccessMessage.title, SwalSuccessMessage.textSuccess, SwalSuccessMessage.icon).then(() => {
						window.location.href = '/system/operator-list';
					});
				}
			})
			.catch((error) => {
				console.log('problem in inserting opeartor' + error);
			});
	}

	// Formik form post
	const formik = useFormik({
		initialValues,
		validationSchema: operatorSchema,
		onSubmit: (values, {setStatus, setSubmitting, resetForm}) => {
			if (InternetConnectionHandler.isSlowConnection(history) === true
					|| sessionHandler.isSessionExpired(expiresIn, history) === true) {
				return;
			}

			setLoading(true);
			setTimeout(() => {
				values.createdBy = userAccessId;
				values.brands = getCurrenciesValueByBrand(brandList);
				let isValid = _validateForm(values.operatorId, values.operatorName, values.operatorStatus, values.brands);
				if (isValid === true) {
					swal({
                        title: PROMPT_MESSAGES.ConfirmSubmitTitle,
                        text: PROMPT_MESSAGES.ConfirmSubmitMessageEdit,
                        icon: SwalConfirmMessage.icon,
					    buttons: [SwalConfirmMessage.btnNo, SwalConfirmMessage.btnYes],
                        dangerMode: true
                    }).then((action) => {
						if (action) {
							const request: OperatorModel = {
								operatorId: parseInt(values.operatorId),
								operatorName: values.operatorName,
								operatorStatus: values.operatorStatus,
								brands: values.brands,
								createdBy: values.createdBy,
							};
							setSubmitting(true);
							modifyOperator(request);
						} else {
							setLoading(false);
							setSubmitting(false);
						}
					});
				}

				setLoading(false);
				setSubmitting(false);
			}, 1000);
		},
	});

	useEffect(() => {

		localStorage.setItem('tempBrandRow', JSON.stringify(brandList));

		const table = $('.table-brands').find('table').DataTable();
		table.clear();
		table.rows.add(brandList);
		table
			.on('order.dt search.dt', function () {
				table
					.column(0, {search: 'applied', order: 'applied'})
					.nodes()
					.each(function (cell, i) {
						cell.innerHTML = i + 1;
					});
			})
			.draw();

		brandList.forEach((brand) => {
			brand.currencies.forEach((currency) => {
				let elementId: string = '#' + brand.name + '-' + brand.id;
				$(elementId).on('click', (event: Event) => {
					activationChange(elementId);
				});
			});
		});
	}, [brandList]);

	// Methods
	function clearInput() {
		setBrandId('');
		setBrandName('');
	}

	function getCurrenciesValueByBrand(list: any): Array<BrandModel> {
		let brands = JSON.parse(JSON.stringify(list)) as Array<BrandModel>;

		brands.forEach((brand) => {
			brand.currencies.forEach((currency) => {
				let elementId = brand.name + '-' + currency.name + '-' + currency.id;
				let inputValue = document.getElementById(elementId) as HTMLInputElement;
				currency.status = inputValue.checked === true ? CURRENCY_STATUS.Checked : CURRENCY_STATUS.Unchecked;
			});
		});
		return brands;
	}

	async function addBrand() {
		if (brandId === '' || brandName === '') {
            swal(SwalFailedMessage.title, SwalOperatorMessage.textErrorBrandValidation, SwalFailedMessage.icon);
		} else if (brandList.find((x) => x.id === parseInt(brandId)) || brandList.find((x) => x.name.toLowerCase() === brandName.toLowerCase())) {
            swal(SwalFailedMessage.title, SwalOperatorMessage.textErrorBrandDuplicate, SwalFailedMessage.icon);
		} else {
			await GetAllCurrencyList();
		}
	}

	const onChangeBrandIdInput = (val: string) => {
		setBrandId(val);
	};
	const onChangeBrandNameInput = (val: string) => {
		setBrandName(val);
	};

	function activationChange(eventId: string) {
		let tempBrandList = JSON.parse(JSON.stringify(brandList)) as Array<BrandModel>;
		let eventInfo = document.getElementById(eventId.replace('#', '')) as HTMLInputElement;
		let buffer: any = eventInfo.id.split('-');
		let brandeventId: string = buffer[1];

		brandList.forEach((brand) => {
			if (brand.id === parseInt(brandeventId)) {
				brand.status = eventInfo.innerText === (Object.keys(OPERATOR_STATUS)[0]) ? OPERATOR_STATUS.Activate : OPERATOR_STATUS.Deactivate;
			}
		});

		setBrandList(tempBrandList);
	}

	async function GetAllCurrencyList() {
		setTimeout(() => {
			getBrandExistingList(brandId, brandName)
				.then((response) => {
					if (response.data.status !== STATUS_CODE.OK) {
						swal(SwalServerErrorMessage.title, response.data.message, SwalServerErrorMessage.icon);
					} else {
						getAllCurrency()
							.then((response) => {
								let allCurrencies = Object.assign(new Array<CurrencyModel>(), response.data);

								allCurrencies.forEach((element) => {
									element.status = CURRENCY_STATUS.Unchecked;
								});

								let tempBrandList = Array<BrandModel>();

								const brandItem: BrandModel = {
									id: parseInt(brandId),
									name: brandName,
									status: OPERATOR_STATUS.Activate,
									currencies: allCurrencies,
									createStatus: OPERATOR_STATUS.Null,
								};

								tempBrandList.push(brandItem);

								let previousBrandList = brandList;

								tempBrandList.forEach((brand) => {
									previousBrandList.push(brand);
								});

								localStorage.setItem('tempBrandRow', JSON.stringify(previousBrandList));

								setBrandList(previousBrandList);

								const table = $('.table-brands').find('table').DataTable();

								table.rows.add(tempBrandList);

								table
									.on('order.dt search.dt', function () {
										table
											.column(0, {search: 'applied', order: 'applied'})
											.nodes()
											.each(function (cell, i) {
												cell.innerHTML = i + 1;
											});
									})
									.draw();

								setBrandId('');
								setBrandName('');
							})
							.catch((error) => {
								console.log('problem in getting currencies' + error);
							});
					}
				})
				.catch((error) => {
					console.log('problem in getting existing brands' + error);
				});
		}, 1000);
	}

	function onClose() {
		swal({
            title: PROMPT_MESSAGES.ConfirmCloseTitle,
            text: PROMPT_MESSAGES.ConfirmCloseMessage,
            icon: SwalConfirmMessage.icon,
            buttons: [SwalConfirmMessage.btnNo, SwalConfirmMessage.btnYes],
            dangerMode: true
        }).then((action) => {
			if (action) {
				history.push('/system/operator-list');
				localStorage.removeItem('tempBrandRow');
			}
		});
	}

	const onClickBrandStatus = (val: any) => {
		let brands = new Array<BrandModel>();

		let tempBrandRow = new Array<BrandModel>();
		tempBrandRow = JSON.parse(localStorage.getItem('tempBrandRow') ?? '{}');

		tempBrandRow = getCurrenciesValueByBrand(tempBrandRow);

		tempBrandRow.forEach((e) => {
			if (e.id == Number(val.target.ariaLabel)) {
				e.status = val.target.innerText === (Object.keys(OPERATOR_STATUS)[0]) ? OPERATOR_STATUS.Activate : OPERATOR_STATUS.Deactivate;
				brands.push(e);
			} else {
				brands.push(e);
			}
		});

		setBrandList(brands);
	};

	const columns = [
		{
			title: 'No',
			data: null,
			className: 'align-middle',
		},
		{
			title: 'Brand ID',
			data: 'id',
			className: 'align-middle',
		},
		{
			title: 'Brand Name',
			data: 'name',
			className: 'align-middle',
		},
		{
			title: 'Brand Status',
			data: 'status',
			className: 'align-middle',
			render: function (data: any, row: any) {
				let brandStatus: string;
				brandStatus = '';

				if (data === OPERATOR_STATUS.Activate) {
					brandStatus = 'Active';
				} else if (data === OPERATOR_STATUS.Deactivate) {
					brandStatus = 'Inactive';
				}
				return brandStatus;
			},
		},
		{
			title: 'Currencies',
			data: 'currencies',
			className: 'align-middle',
			render: function (data: any, type: any, row: any, meta: any) {
				let result: string;
				result = '';

				for (let item of data) {
					let checkId = row.name + '-' + item.name + '-' + item.id;
					let isChecked: string = '';
					if (item.status === CURRENCY_STATUS.Checked) {
						isChecked = 'Checked';
					}

					result += `	<div className="mb-10">
									<div className="form-check form-check-custom form-check-solid">
										<input className="form-check-input" type="checkbox" value="" id='` + checkId + `' ` + isChecked + `/>
										<label className="form-check-label" for="flexCheckDefault">` + item.name + `</label>
									</div>
								</div>`;

				}
				return result;
			},
		},
		{
			title: 'Action',
			data: 'status',
			className: 'align-middle',
			createdCell: (td: any, cellData: any, rowData: any, row: any, col: any) =>
			{
				const renderActivateButton = () => (
					<div className='d-flex justify-content-center flex-shrink-0'>
				 		<button style={{cursor: 'pointer'}}
				 			onClick={onClickBrandStatus}
							className='btn btn-outline-primary btn-sm px-4 fw-bolder'
							aria-label={rowData != undefined ? rowData['id'] : ''}>
				 			{cellData == OPERATOR_STATUS.Activate ? 'Deactivate' : 'Activate'}
				 		</button>
				 	</div>
				);

				ReactDOM.render(renderActivateButton(),td);
				return null;
			}
		},
	];

	// Return elements
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
						<h5 className='fw-bolder m-0'>Edit Operator</h5>
					</div>
				</div>
				<div className='card-body p-9'>
					<div className='d-flex align-items-center my-2'>
						<div className='row mb-3'>
							<div className='row mb-3'>
								<div className='col-sm-2'>
									<label htmlFor='edit-operator-id' className='form-label-sm required'>Operator Id </label>
								</div>
								<div className='col-sm-3'>
									<input
										id='edit-operator-id'
										type='text'
										className='form-control form-control-sm'
										disabled
										aria-label='Operator Id'
										{...formik.getFieldProps('operatorId')}
									/>
								</div>
							</div>
							<div className='row mb-3'>
								<div className='col-sm-2'>
									<label htmlFor='edit-operator-name' className='form-label-sm required'>Operator Name </label>
								</div>
								<div className='col-sm-3'>
									<input
										id='edit-operator-name'
										type='text'
										className='form-control form-control-sm'
										disabled
										aria-label='Operator Name'
										{...formik.getFieldProps('operatorName')}
									/>
								</div>
							</div>
							<div className='row mb-3'>
								<div className='col-sm-2'>
									<label htmlFor='edit-status' className='form-label-sm required'>Status</label>
								</div>
								<div className='col-sm-3'>
									<select id='edit-status' className='form-select form-select-sm' aria-label='Select status' {...formik.getFieldProps('operatorStatus')}>
										<option value='1'>Active</option>
										<option value='2'>Inactive</option>
									</select>
								</div>
							</div>
							<div className='row mb-3'>
								<div className='separator border-4 my-10' />
								<h6 className='fw-bolder m-0'>Brand</h6>
								<br />
								<br />

								<div className='row mb-3'>
									<div className='col-sm-2'>
										<label htmlFor='edit-brand-id' className='form-label-sm required'>Brand Id</label>
									</div>
									<div className='col-sm-3'>
										<input
											id='edit-brand-id'
											type='number'
											className='form-control form-control-sm'
											aria-label='Brand Id'
											onChange={(event) => onChangeBrandIdInput(event.target.value)}
											value={brandId}
										/>
									</div>
								</div>
								<div className='row mb-3'>
									<div className='col-sm-2'>
										<label htmlFor='edit-brand-name' className='form-label-sm required'>Brand Name</label>
									</div>
									<div className='col-sm-3'>
										<input
											id='edit-brand-name'
											type='text'
											className='form-control form-control-sm'
											aria-label='Brand Id'
											onChange={(event) => onChangeBrandNameInput(event.target.value)}
											value={brandName}
										/>
									</div>
								</div>
							</div>

							{userAccess.includes(USER_CLAIMS.OperatorAndBrandWrite) === true && (
								<div className='d-flex my-4 mb-10'>
									<button type='button' className='btn btn-primary btn-sm me-0' onClick={addBrand}>
										Add
									</button>
								</div>
							)}

							<table id='table-brands' className='table table-hover table-rounded table-striped border gy-3 gs-3' />

							<div className='separator border-4 my-10' />

							<div className='d-flex my-4 mt-5'>
								{userAccess.includes(USER_CLAIMS.OperatorAndBrandWrite) === true && (
									<button id='btnSubmit' type='submit' className='btn btn-primary btn-sm me-2' disabled={formik.isSubmitting}>
										{!loading && 
											<span className='indicator-label'>Submit</span>}
										{loading && (
											<span className='indicator-progress' style={{display: 'block'}}>
												Please wait...{''}
												<span className='spinner-border spinner-border-sm align-middle ms-2'></span>
											</span>
										)}
									</button>
								)}
								<button id='btnClose 'type='button' className='btn btn-sm btn-secondary' onClick={onClose}>
									Close
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</form>
	);
};
export default EditOperator;