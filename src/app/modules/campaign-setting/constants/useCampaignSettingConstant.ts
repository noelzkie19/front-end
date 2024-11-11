const useCampaignSettingConstant = () => {
	const LARGE = 'lg';
	const MEDIUM = 'md';
	const EDIT = 'Edit';
	const ADD = 'Add';
	const ASC = 'ASC';
	const PRIORITYNUMBER = 'priorityNumber';
	const MAX_CONFIG_TAG = 100;
	const CAMPAIGNSETTINGID = 'CampaignSettingId';
	const COMMUNICATION_RECORD = 'Communication Record';
	const DEPOSIT = 'Deposit';
	const GAME_ACTIVITY = 'Game Activity';

	enum CampaignSettingTypes {
		autoTaggingSettingTypeId = 43,
		pointIncentiveSettingTypeId = 44,
	}

	enum PointIncentiveSettingTypes {
		goalParameterSettingTypeId = 40,
	}

	enum DropdownMasterReference {
		goalParameterAmount = 47,
		goalParameterCount = 49,
	}

	enum GameActivityThresholdTypes {
		Amount = 230,
		Count = 231,
	}

	enum DepositThresholdTypes {
		Amount = 230,
		Count = 231,
	}

	const enforceNumberValidationNoPeriod = (e: any) => {
		let checkIfNum;
		if (e.key !== undefined) {
			// Check if it's a "e", "+" or "-" or "."
			checkIfNum = e.key === 'e' || e.key === '+' || e.key === '-' || e.key === '.';
		} else if (e.keyCode !== undefined) {
			// Check if it's a "e" (69), "." (190), "+" (187) or "-" (189)
			checkIfNum = e.keyCode === 69 || e.keyCode === 187 || e.keyCode === 189;
		}
		return checkIfNum && e.preventDefault();
	};
	return {
		CampaignSettingTypes,
		LARGE,
		EDIT,
		ASC,
		PRIORITYNUMBER,
		ADD,
		MEDIUM,
		MAX_CONFIG_TAG,
		CAMPAIGNSETTINGID,
		PointIncentiveSettingTypes,
		DropdownMasterReference,
		COMMUNICATION_RECORD,
		DEPOSIT,
		GAME_ACTIVITY,
		enforceNumberValidationNoPeriod,
		GameActivityThresholdTypes,
		DepositThresholdTypes,
	};
};

export default useCampaignSettingConstant;
