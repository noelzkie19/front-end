import {LookupModel} from '../../../../../shared-models/LookupModel';
import {SegmentFilterFieldResponseModel} from './SegmentFilterFieldResponseModel';
import {SegmentFilterOperatorResponseModel} from './SegmentFilterOperatorResponseModel';

export interface SegmentLookupsResponseModel {
	fieldList: Array<SegmentFilterFieldResponseModel>;
	operatorList: Array<SegmentFilterOperatorResponseModel>;
	segmentList: Array<LookupModel>;
	campaignList: Array<LookupModel>;
	lifecycleStageList: Array<LookupModel>;
	productList: Array<LookupModel>;
	vendorList:  Array<LookupModel>;
	paymentMethodList:  Array<LookupModel>;
	bonusContextStatusList: Array<LookupModel>;
	bonusContextDateMappingList: Array<LookupModel>;
	bonusCategoryList: Array<LookupModel>;
	productTypeList: Array<LookupModel>;
	remProfileList:  Array<LookupModel>;
}
