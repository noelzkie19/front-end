import {BaseRequest} from '../../../../shared-models/BaseRequest';

export interface AppConfigSettingRequestModel extends BaseRequest {
	appConfigSettingId: number;
	applicationId: number;
	key: string;
	value: string;
	dataType: string;
}
