
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../../../../../setup';
import { SegmentLookupFieldsEnum } from '../../../../../../constants/Constants';
import CommonLookups from '../../../../../../custom-functions/CommonLookups';
import { LookupModel } from '../../../../../../shared-models/LookupModel';
import * as segmentManagement from '../../../../../player-management/segmentation/redux/SegmentationRedux';
import { SegmentLookupsResponseModel } from '../../../models';
import { ISegmentationState } from '../../../redux/SegmentationRedux';
import { getSegmentLookups } from '../../../redux/SegmentationService';

const useSegmentLookups = () => {
	const dispatch = useDispatch();
	const {segmentLookups} = useSelector<RootState>(({segment}) => segment, shallowEqual) as ISegmentationState;
	const brandOptions = CommonLookups('brands');
	const countryOptions = CommonLookups('countries');
	const currencyOptions = CommonLookups('currencies');
	const vipLevelOptions = CommonLookups('vipLevels');
	const paymentGroupOptions = CommonLookups('paymentGroups');
	const playerStatusOptions = CommonLookups('playerStatuses');
	const marketingChannelOptions = CommonLookups('marketingChannels');
	const portalOptions = CommonLookups('signUpPortals');
	const remProfileOptions = segmentLookups?.remProfileList;
	const segmentOptions = segmentLookups?.segmentList;
	const campaignOptions = segmentLookups?.campaignList;
	const lifecycleStageOptions = segmentLookups?.lifecycleStageList;
	const productOptions = segmentLookups?.productList;
	const vendorOptions = segmentLookups?.vendorList;
	const paymentMethodOptions = segmentLookups?.paymentMethodList;
	const bonusContextStatusOptions = segmentLookups?.bonusContextStatusList;
	const bonusContextDateMapping = segmentLookups?.bonusContextDateMappingList;
	const bonusCategoryOptions = segmentLookups?.bonusCategoryList;
	const productTypeOptions = segmentLookups?.productTypeList;

	//	States    

	const getSegmentLookup = (fieldValue: string): Array<LookupModel> => {
		switch (fieldValue) {
			case SegmentLookupFieldsEnum.Brand:
				return brandOptions;
			case SegmentLookupFieldsEnum.Currency:
				return currencyOptions;
			case SegmentLookupFieldsEnum.PlayerStatus:
				return playerStatusOptions;
			case SegmentLookupFieldsEnum.Country:
				return countryOptions;
			case SegmentLookupFieldsEnum.VipLevel:
			case SegmentLookupFieldsEnum.NewVipLevel:
			case SegmentLookupFieldsEnum.PreviousVipLevel:
				return vipLevelOptions;
			case SegmentLookupFieldsEnum.PaymentGroup:
				return paymentGroupOptions;
			case SegmentLookupFieldsEnum.MarketingChannel:
				return marketingChannelOptions;
			case SegmentLookupFieldsEnum.Segment:
				return segmentOptions ?? [];
			case SegmentLookupFieldsEnum.Variance:
			case SegmentLookupFieldsEnum.CampaignGoal:
			case SegmentLookupFieldsEnum.CampaignGoalReached:
				return [];
			case SegmentLookupFieldsEnum.Campaign:
				return campaignOptions ?? [];
			case SegmentLookupFieldsEnum.Product:
				return productOptions ?? [];
			case SegmentLookupFieldsEnum.Lifestage:
				return lifecycleStageOptions ?? [];
			case SegmentLookupFieldsEnum.SignupPortal:
			case SegmentLookupFieldsEnum.LastLoginPortal:
				return portalOptions;
			case SegmentLookupFieldsEnum.Vendor:
				return vendorOptions ?? [];
			case SegmentLookupFieldsEnum.PaymentMethod:
					return paymentMethodOptions ?? [];
			case SegmentLookupFieldsEnum.BonusContextStatus:
					return bonusContextStatusOptions ?? [];
			case SegmentLookupFieldsEnum.BonusContextDateMapping:
					return bonusContextDateMapping ?? [];
			case SegmentLookupFieldsEnum.BonusCategory:
					return bonusCategoryOptions ?? [];
			case SegmentLookupFieldsEnum.ProductType:
					return productTypeOptions ?? [];		
			case SegmentLookupFieldsEnum.RemProfile:
					return remProfileOptions ?? [];
			case SegmentLookupFieldsEnum.Margin:
				let marginOptions = Array<LookupModel>();
				for (let index = 1; index <= 100; index++) {
					marginOptions.push({label: index.toString(), value: index.toString()});
				}
				marginOptions.push({label: 'Win', value: 'Win'});
				return marginOptions;
			default:
				return [];
		}
	};

	const loadSegmentLookUps = async (): Promise<Boolean> => {
		let isSuccess = false;
		await getSegmentLookups()
			.then((response) => {
				if (response.status === 200) {
					let resultData = Object.assign({} as SegmentLookupsResponseModel, response.data);
					dispatch(segmentManagement.actions.setSegmentLookups(resultData));
					isSuccess = true;
				}
			})
			.catch((ex) => {
				console.log('Error getSegmentLookups: ' + ex);
				isSuccess = false;
			});

		return isSuccess;
	};

	return {getSegmentLookup, loadSegmentLookUps};
};

export default useSegmentLookups;
