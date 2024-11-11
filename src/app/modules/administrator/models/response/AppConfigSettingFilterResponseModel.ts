import {AppConfigSettingResponseModel} from './AppConfigSettingResponseModel';

export interface AppConfigSettingFilterResponseModel {
	appConfigSettingList: Array<AppConfigSettingResponseModel>;
	recordCount: number;
}
