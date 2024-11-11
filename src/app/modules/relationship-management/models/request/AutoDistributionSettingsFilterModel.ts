import {LookupModel} from '../../../../shared-models/LookupModel';

export interface AutoDistributionSettingsFilterModel {
	configurationName: string;
	remProfileIds: Array<LookupModel>;
	configurationStatus?: LookupModel | null;
}
