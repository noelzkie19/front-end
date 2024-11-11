import {LookupModel} from '../../../../shared-models/LookupModel';

export interface RemLookupsResponseModel {
	remProfileNames: Array<LookupModel>;
	remAgentNames: Array<LookupModel>;
	remPseudoNames: Array<LookupModel>;
	remAssignedBys: Array<LookupModel>;
	remActionTypes: Array<LookupModel>;
	users: Array<LookupModel>;
	activeRemProfileNames: Array<LookupModel>;
}
