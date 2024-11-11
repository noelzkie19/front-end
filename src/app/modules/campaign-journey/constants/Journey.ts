export const JOURNEY_ACTION_MODE = {
    Create: 1,
    Edit: 2,
    View: 3,
};

export enum JOURNEY_TAB {
    infoEventKey = '1',
    campaignListEventKey = '2',
};

export const CAMPAIGN_STATUS_TYPE = {
    Draft: 'Draft',
    Active: 'Active',
    Inactive: 'Inactive',
    Completed: 'Completed',
    Onhold: 'Onhold',
    Ended: 'Ended'
};

export const GRID_PAGINATION_ACTION = {
    OnFirst: 1,
    OnPrev: 2,
    OnNext: 3,
    OnLast: 4,
    OnPageSize: 5
}

export const JOURNEY_CAMPAIGN_LIMIT = {
    MaxCampaignCards: 25
}