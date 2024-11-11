import {BaseRequest} from '../../../../shared-models/BaseRequest';

export interface EventSubscriptionRequestModel extends BaseRequest {
    subscriberEventType: string;
    serviceURL: string;
}
