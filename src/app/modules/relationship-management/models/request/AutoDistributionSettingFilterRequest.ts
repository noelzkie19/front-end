import { PaginationModel } from '../../../../shared-models/PaginationModel';
import {RequestModel} from '../../../system/models';

export interface AutoDistributionSettingFilterRequest extends RequestModel, PaginationModel {
	configurationName?: string;
	remProfileIds?: string;
	status?: boolean;
}