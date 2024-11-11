import {Guid} from 'guid-typescript';
import {useEffect, useState} from 'react';
import {Modal} from 'react-bootstrap';
import {shallowEqual, useSelector} from 'react-redux';
import Select from 'react-select';
import swal from 'sweetalert';
import {RootState} from '../../../../../../setup';
import * as hubConnection from '../../../../../../setup/hub/MessagingHub';
import {ElementStyle, PROMPT_MESSAGES} from '../../../../../constants/Constants';
import useConstant from '../../../../../constants/useConstant';
import {BasicFieldLabel, FieldContainer, MlabButton, NumberTextInput, PaddedContainer, RequiredLabel} from '../../../../../custom-components';
import CommonLookups from '../../../../../custom-functions/CommonLookups';
import useSystemHooks from '../../../../../custom-functions/system/useSystemHooks';
import {LookupModel} from '../../../../../shared-models/LookupModel';
import {disableSplashScreen} from '../../../../../utils/helper';
import {PlayerConfigValidatorRequestModel} from '../../../models/PlayerConfigValidatorRequestModel';
import {VIPLevelModel} from '../../../models/VIPLevelModel';
import {
	saveVIPLevel,
	saveVIPLevelResult,
	updateVIPLevel,
	updateVIPLevelResult,
	validatePlayerConfigurationRecord,
} from '../../../redux/SystemService';
import {PlayerConfigTypes, StatusCode} from '../../constants/PlayerConfigEnums';

type ModalProps = {
	title: string;
	configInfo: VIPLevelModel | undefined;
	modal: boolean;
	isEditMode: boolean;
	toggle: () => void;
	handleSave: () => void;
	rowData: Array<any>;
};

const AddEditVIPLevelModal: React.FC<ModalProps> = (props: ModalProps) => {
	// States
	const messagingHub = hubConnection.createHubConnenction();
	const userAccessId = useSelector<RootState>(({auth}) => auth.userId, shallowEqual) as number;
	const [idField, setIdField] = useState<string>('');
	const [iCoreIdField, setICoreIdField] = useState<string>('');
	const [nameField, setNameField] = useState<string>('');
	const [brand, setBrand] = useState<LookupModel | null>();
	const [submitting, setSubmitting] = useState<boolean>(false);
	const [vipGroup, setVipGroup] = useState<any>();
	/**
	 *  ? Hooks
	 */
	const {getMasterReference, masterReferenceOptions} = useSystemHooks();
	const {masterReferenceIds, message} = useConstant();

	// Effects
	useEffect(() => {
		if (props.modal) {
			if (props.isEditMode && props.configInfo !== undefined) {
				if (props.configInfo.vipLevelId?.toString()) setIdField(props.configInfo.vipLevelId.toString());
				setICoreIdField(props.configInfo.iCoreId != null ? props.configInfo.iCoreId?.toString() : '');
				setNameField(props.configInfo.vipLevelName);
				setVipGroup(
					masterReferenceOptions
						.map((objOptions) => objOptions.options)
						.find((findGorupId) => findGorupId.value === props.configInfo?.vipGroupId?.toString())
				);

				if (props.configInfo.brandId == null || props.configInfo.brandName == null) {
					setBrand(null);
				} else {
					const selBrand: LookupModel = {
						value: props.configInfo.brandId.toString(),
						label: props.configInfo.brandName.toString(),
					};
					setBrand(selBrand);
				}
			} else {
				setIdField('');
				setICoreIdField('');
				setNameField('');
				setBrand(null);
				setVipGroup(null);
			}
		}
		getMasterReference(masterReferenceIds.parentId.VIPGroup.toString());
	}, [props.modal]);

	useEffect(() => {
		if (!props.isEditMode)
			setVipGroup(
				masterReferenceOptions.map((objDefaultObj) => objDefaultObj.options).find((obj) => obj.value === masterReferenceIds.childId.NonVip.toString())
			);
	}, [masterReferenceOptions]);

	//  Methods
	const handleCloseUpsertVIPLevel = () => {
		alertVIPLevel();
	};

	const validateUpsertVipLevelFields = async () => {
		let validFields: boolean = true;

		if (Number.isInteger(parseInt(idField)) === false && idField !== '') {
			swal('Failed', 'VIP Level Id should be a number', 'error');
			validFields = false;
		}

		if (iCoreIdField === undefined || iCoreIdField === '') {
			swal('Failed', message.requiredAllFields, 'error');
			validFields = false;
		}

		if (vipGroup === undefined || vipGroup === null || vipGroup?.value === null) {
			swal('Failed', message.requiredAllFields, 'error');
			validFields = false;
		}

		if (nameField === undefined || nameField.toString().trim() == '') {
			swal('Failed', message.requiredAllFields, 'error');
			validFields = false;
		}

		const validationRequest: PlayerConfigValidatorRequestModel = {
			playerConfigurationTypeId: PlayerConfigTypes.VIPLevelTypeId,
			playerConfigurationId: idField != '' ? Number(idField) : null,
			playerConfigurationName: nameField,
			playerConfigurationCode: null,
			playerConfigurationICoreId: Number(iCoreIdField),
			playerConfigurationAction: props.isEditMode ? 'edit' : 'add',
			playerConfigurationBrandId: brand == null || brand.value == '' ? null : Number(brand.value),
		};

		const hasDuplicate = await validatePlayerConfigurationRecord(validationRequest);
		const isDuplicate = props.rowData.find(
			(u) =>
				u.vipLevelName.trim().toLowerCase() == nameField.trim().toLowerCase() &&
				u.brandId === Number(brand?.value) &&
				u.vipLevelId != idField &&
				u.iCoreId != iCoreIdField
		);

		if (hasDuplicate.data || isDuplicate !== undefined) {
			validFields = false;
			swal(PROMPT_MESSAGES.FailedValidationTitle, 'Unable to proceed, iCore ID, VIP Level Name or Brand combination already exists.', 'error');
		}

		return validFields;
	};

	const postAddVipLevel = (_addRequest: VIPLevelModel) => {
		messagingHub.start().then(() => {
			saveVIPLevel(_addRequest).then((response) => {
				if (response.status === StatusCode.OK) {
					messagingHub.on(_addRequest.queueId.toString(), (message) => {
						saveVIPLevelResult(message.cacheId)
							.then(() => {
								if (response.status !== StatusCode.OK) {
									swal('ERROR', 'Error Saving VIP Level Configuration', 'error');
								} else {
									disableSplashScreen();
									messagingHub.off(_addRequest.queueId.toString());
									messagingHub.stop();
									swal('Successful!', 'The data has been submitted', 'success');
									setSubmitting(false);
									props.handleSave();
								}
							})
							.catch(() => {
								swal('Failed', 'getVIPLevelList', 'error');
								disableSplashScreen();
								setSubmitting(false);
							});
					});
				} else {
					swal('Failed', response.data.message, 'error');
					setSubmitting(false);
				}
			});
		});
	};

	const postUpdateVipLevel = (_updateRequest: VIPLevelModel) => {
		messagingHub.start().then(() => {
			updateVIPLevel(_updateRequest).then((response) => {
				if (response.status === StatusCode.OK) {
					messagingHub.on(_updateRequest.queueId.toString(), (message) => {
						updateVIPLevelResult(message.cacheId)
							.then(() => {
								if (response.status !== StatusCode.OK) {
									swal('ERROR', 'Error Updating VIP Level Configuration', 'error');
								} else {
									disableSplashScreen();
									messagingHub.off(_updateRequest.queueId.toString());
									messagingHub.stop();
									swal('Successful!', 'The data has been submitted', 'success');
									setSubmitting(false);
									props.handleSave();
								}
							})
							.catch(() => {
								swal('Failed', 'getVIPLevelList', 'error');
								setSubmitting(false);
								disableSplashScreen();
							});
					});
				} else {
					swal('Failed', response.data.message, 'error');
					setSubmitting(false);
				}
			});
		});
	};

	const handleSaveUpsertVIPLevelChanges = async () => {
		//Validate
		let isValid: boolean = true;

		isValid = await validateUpsertVipLevelFields();

		if (isValid) {
			swal({
				title: 'Confirmation',
				text: 'This action will save the changes made. Please confirm',
				icon: 'warning',
				buttons: ['No', 'Yes'],
				dangerMode: true,
			}).then((onFormSubmit) => {
				if (onFormSubmit) {
					setSubmitting(true);
					const vipLevelRequest: VIPLevelModel = {
						vipLevelId: Number(idField),
						vipLevelName: nameField,
						brandId: Number(brand?.value ?? '0'),
						userId: userAccessId.toString(),
						queueId: Guid.create().toString(),
						iCoreId: +iCoreIdField,
						vipGroupId: parseInt(vipGroup.value),
					};

					if (!props.isEditMode) {
						postAddVipLevel(vipLevelRequest);
					} else {
						postUpdateVipLevel(vipLevelRequest);
					}
				}
			});
		}
	};

	const handleIdField = (event: any) => {
		setIdField(event.target.value);
	};

	const handleICoreIdField = (event: any) => {
		setICoreIdField(event.target.value);
	};

	const handleNameField = (event: any) => {
		setNameField(event.target.value);
	};
	const alertVIPLevel = () => {
		swal({
			title: 'Confirmation',
			text: 'This action will discard any changes made and return to the VIP Level page, please confirm',
			icon: 'warning',
			buttons: ['No', 'Yes'],
			dangerMode: true,
		}).then((onFormSubmit) => {
			if (onFormSubmit) {
				props.toggle();
			}
		});
	};

	const onChangeVIPLevel = (val: LookupModel) => {
		setBrand(val);
	};

	const onChangeAddVIPGroup = (_val: any) => {
		setVipGroup(_val);
	};

	return (
		<Modal show={props.modal} onHide={handleCloseUpsertVIPLevel} centered>
			<Modal.Header>
				<Modal.Title>
					{props.isEditMode ? 'Edit' : 'Add'}
					{' ' + props.title}
				</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<PaddedContainer>
					<FieldContainer>
						<FieldContainer>
							<div className='col-sm-4'>
								<BasicFieldLabel title={`${props.title}` + ' Id'} />
							</div>
							<div className='col'>
								<NumberTextInput
									ariaLabel={'Id'}
									className={'form-control form-control-sm'}
									{...{value: idField, onChange: handleIdField, disabled: true}}
								/>
							</div>
						</FieldContainer>
						<FieldContainer>
							<div className='col-sm-4'>
								<RequiredLabel title='iCore Id' />
							</div>
							<div className='col'>
								<NumberTextInput
									ariaLabel={'iCore Id'}
									className={'form-control form-control-sm'}
									min='0'
									{...{
										value: iCoreIdField,
										onChange: handleICoreIdField,
										disabled: props.isEditMode,
									}}
								/>
							</div>
						</FieldContainer>
						<FieldContainer>
							<div className='col-sm-4'>
								<RequiredLabel title={`${props.title}` + ' Name'} />
							</div>
							<div className='col'>
								<input type='text' className='form-control form-control-sm' aria-label='Name' value={nameField} onChange={handleNameField} />
							</div>
						</FieldContainer>
						<FieldContainer>
							<div className='col-sm-4'>
								<BasicFieldLabel title='Brand' />
							</div>
							<div className='col'>
								<Select options={CommonLookups('brands')} value={brand} onChange={onChangeVIPLevel} isClearable={true} />
							</div>
						</FieldContainer>
						<FieldContainer>
							<div className='col-sm-4'>
								<RequiredLabel title='VIP Group' />
							</div>
							<div className='col'>
								<Select
									options={masterReferenceOptions.flatMap((objOptions) => objOptions.options)}
									value={vipGroup}
									onChange={onChangeAddVIPGroup}
									isClearable={true}
								/>
							</div>
						</FieldContainer>
						<FieldContainer>
							<div className='col-sm-4'>
								<BasicFieldLabel title='Complete' />
							</div>
							<div className='col-sm-3'>
								<input
									type='text'
									disabled={true}
									className='form-control form-control-sm'
									aria-label='Complete'
									value={props.configInfo && props.configInfo.isComplete === true ? 'Yes' : 'No'}
								/>
							</div>
						</FieldContainer>
					</FieldContainer>
				</PaddedContainer>
			</Modal.Body>
			<Modal.Footer className='d-flex'>
				<MlabButton
					access={true}
					size={'sm'}
					label={'Save'}
					style={ElementStyle.primary}
					type={'button'}
					weight={'solid'}
					onClick={handleSaveUpsertVIPLevelChanges}
					loading={submitting}
					loadingTitle={'Please wait ...'}
					disabled={submitting}
				/>
				<MlabButton
					access={true}
					size={'sm'}
					label={'Close'}
					style={ElementStyle.secondary}
					type={'button'}
					weight={'solid'}
					onClick={handleCloseUpsertVIPLevel}
					loading={submitting}
					loadingTitle={'Please wait ...'}
					disabled={submitting}
				/>
			</Modal.Footer>
		</Modal>
	);
};

export default AddEditVIPLevelModal;
