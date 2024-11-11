import {PaginationModel} from '../../../../shared-models/PaginationModel';
import {RequestModel} from '../../../system/models';
import {AppConfigSettingFilterModel} from '../AppConfigSettingFilterModel';

export interface AppConfigSettingFilterRequestModel extends AppConfigSettingFilterModel, PaginationModel, RequestModel {}
