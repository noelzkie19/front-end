const useSegmentConstant = () => {
	const segmentTypeMasterRefId = '192';

	enum PageAction {
		EDIT = 'edit',
		CLONE = 'clone',
		CONVERT_TO_STATIC = 'tostatic',
		VIEW = 'view',
	}

	enum SegmentTypes {
		Normal = '193',
		Distribution = '194',
	}

	enum SegmentStatus {
		Active = 'Active',
		Inactive = 'Inactive',
		ActiveId = '1',
		InactiveId = '0',
	}

	enum SegmentSourceTypes {
		Mlab = 199,
		Tableau = 200,
	}

	enum SwalConfirmMessage {
		title = 'Confirmation',
		textDiscard = 'This action will discard any changes made, please confirm',
		textSaveChannel = 'This action will submit the details of the newly added record. Please confirm',
		icon = 'warning',
		btnYes = 'Yes',
		btnNo = 'No',
	}

	const segmentationStatusOptions = [
		{value: 1, label: SegmentStatus.Active},
		{value: 0, label: SegmentStatus.Inactive},
	];

	const validateNumberInput = (e: any) => {
		let checkIfNumber;
		if (e.key !== undefined) {
			checkIfNumber = e.key === 'e' || e.key === '.' || e.key === '+' || e.key === '-';
		} else if (e.keyCode !== undefined) {
			checkIfNumber = e.keyCode === 69 || e.keyCode === 190 || e.keyCode === 187 || e.keyCode === 189;
		}
		return checkIfNumber && e.preventDefault();
	};

	enum SegmentInputTypes {
		Condition = '310',
		CustomQuery = '311',
	}

	return {
		PageAction,
		segmentTypeMasterRefId,
		SegmentTypes,
		SegmentStatus,
		segmentationStatusOptions,
		SegmentSourceTypes,
		SwalConfirmMessage,
		validateNumberInput,
		SegmentInputTypes,
	};
};

export default useSegmentConstant;
