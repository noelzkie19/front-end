import {useEffect, useState} from 'react';
import {FormContainer, FormGroupContainer, FormModal} from '../../../../custom-components';
import Select from 'react-select';
import {RemDistributionModel} from '../../models/response/RemDistributionModel';
import {LookupModel} from '../../../../shared-models/LookupModel';
import {RemDistributionAssigmentRequest} from '../../models/request/RemDistributionAssigmentRequest';
import {shallowEqual, useSelector} from 'react-redux';
import {RootState} from '../../../../../setup';
import {Guid} from 'guid-typescript';
import {PROMPT_MESSAGES} from '../../../../constants/Constants';
import swal from 'sweetalert';
import {formatDate} from '../../../../custom-functions/helper/dateHelper';
import useConstant from '../../../../constants/useConstant';

interface RemDistributionAssignmentProps {
	modal: boolean;
	title: string;
	distributionData: RemDistributionModel[];
	remProfileOptions: Array<LookupModel>;
	onHide?: () => void;
	onSubmitForm?: (remAssignmentRequest: RemDistributionAssigmentRequest[]) => void;
	toggle: () => void;
}

const RemDistributionAssignmentModal = ({
	modal,
	title,
	distributionData,
	remProfileOptions,
	onHide,
	onSubmitForm,
	toggle,
}: RemDistributionAssignmentProps) => {
	// States
	const [remProfileId, setRemProfileId] = useState<LookupModel | undefined>({value: '0', label: ''});
	const [assignmentDate, setAssignmentDate] = useState('');
	const userId = useSelector<RootState>(({auth}) => auth.userId, shallowEqual) as number;
	const { SwalConfirmMessage, ReMAutoDistributionConstants } = useConstant();

	// Effects
	useEffect(() => {
		if (modal) {
			if (distributionData.length === 1) {
				setAssignmentDate(formatDate(distributionData[0]?.lastAssigmentDate));
			}

			if (distributionData.length === 1 && distributionData[0].remProfileId > 0) {
				const selectedProfile = remProfileOptions.find((i) => i.value.toString() === distributionData[0].remProfileId.toString());
				setRemProfileId(selectedProfile);
			}
		} else {
			setRemProfileId(undefined);
			setAssignmentDate('');
		}
	}, [modal, distributionData]);

	// Methods
	const handleRemProfileChange = (val: LookupModel) => {
		setRemProfileId(val);
	};

	const validateForm = () => {
		let isValid = true;

		if (remProfileId === undefined || remProfileId === null || (remProfileId && remProfileId.value === '0')) {
			isValid = false;
			swal(PROMPT_MESSAGES.FailedValidationTitle, PROMPT_MESSAGES.FailedValidationMandatoryMessage, 'error');
		}

		return isValid;
	};

	const handleSubmit = async () => {
		// Validate Form
		if (!validateForm()) return false;

		// Confirm Submit
		swal({
			title: PROMPT_MESSAGES.ConfirmCloseTitle,
			text: ReMAutoDistributionConstants.SwalReMAutoDistributionMessage.textRemoveAssignment,
			icon: 'warning',
			buttons: [SwalConfirmMessage.btnNo, SwalConfirmMessage.btnYes],
			dangerMode: true,
		}).then(async (confirmRemoveRemProfile) => {
			if (confirmRemoveRemProfile) {
				submitForm();
			}
		});
	};

	const submitForm = () => {
		const remAssignmentRequest = distributionData.map((i) => {
			const remAssignmentItem: RemDistributionAssigmentRequest = {
				remDistributionId: i.remDistributionId,
				mlabPlayerId: i.mlabPlayerId,
				playerId: i.playerId,
				remProfileId: remProfileId !== undefined ? Number(remProfileId.value) : 0,
				createdBy: userId,
				queueId: Guid.create().toString(),
				userId: userId.toString(),
				hasIntegration: i.hasIntegration ?? 0
			};

			return remAssignmentItem;
		});
		if(onSubmitForm){
			onSubmitForm(remAssignmentRequest);
		}
	};

	return (
		<FormModal headerTitle={title} haveFooter={true} show={modal} onHide={onHide} onSubmmit={handleSubmit}>
			<FormContainer onSubmit={handleSubmit}>
				<FormGroupContainer>
					<div className='col-4 col-form-label'>Last Assigned Date</div>
					<div className='col-8'>
						<input className='form-control form-control-sm' type='text' value={assignmentDate} id='example-text-input' disabled />
					</div>
				</FormGroupContainer>
				<FormGroupContainer>
					<div className='col-4 col-form-label required'>ReM Profile Name</div>
					<div className='col-8'>
						<Select
							native
							size='small'
							style={{width: '100%'}}
							isClearable={true}
							menuPortalTarget={document.body}
							styles={{menuPortal: (base: any) => ({...base, zIndex: 9999})}}
							options={remProfileOptions}
							onChange={handleRemProfileChange}
							value={remProfileId}
						/>
					</div>
				</FormGroupContainer>
			</FormContainer>
		</FormModal>
	);
};

export default RemDistributionAssignmentModal;
