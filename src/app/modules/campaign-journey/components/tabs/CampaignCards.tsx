import { ReactChild, ReactFragment, ReactPortal, useEffect, useState } from "react";
import { FieldContainer } from "../../../../custom-components";
import { CAMPAIGN_STATUS_TYPE } from "../../constants/Journey";
import { CampaignDetailsModel } from "../../models/CampaignDetailsModel";
import "../../styles/Journey.css"

interface ICampaignCards {
    campaignList: Array<CampaignDetailsModel>;
    onPress: (index: number) => void;
}

export const CampaignCards: React.FC<ICampaignCards> = ({campaignList, onPress}) => {
    const renderCard = (card: any, index: number) => {
        return (
            <div className="col-lg-4" key={index} onClick={() => onPress(index)}>
                <div className="col-lg-12 mt-6"></div>
                <div className={card.cardSelected ? "card card-flush card-selected" : "card card-flush shadow-lg"}>
                    <div className="card-header">
                        <div className="card-title">
                            <h3 className="card-label">{card.campaignName}</h3>                            
                        </div>
                    </div>
                    <div className="card-body py-3">
                        <h1> {card.campaignPlayerCount} </h1>
                        <br />
                        <span className="card-body-text" title={card.campaignEligibility}>{card.campaignEligibility}</span>
                    </div>
                    <div className="card-footer">
                        <span className="box-primary-goal"> {card.campaignPrimaryGoalCount} </span> &nbsp; Reach Primary Goal
                        <span className={((card.campaignStatus == CAMPAIGN_STATUS_TYPE.Draft || card.campaignStatus == CAMPAIGN_STATUS_TYPE.Completed) ? 'badge badge-light-primary' : 
                            card.campaignStatus == CAMPAIGN_STATUS_TYPE.Active ? 'badge badge-light-success' : 
                            card.campaignStatus == CAMPAIGN_STATUS_TYPE.Ended ? 'badge badge-light-danger' : 'badge badge-light-dark') + ' float-end'}>
                            {card.campaignStatus} 
                        </span>
                    </div>
                </div>
            </div>
        )
    }

    return (        
        <FieldContainer>
            {campaignList.map(renderCard)}
        </FieldContainer>
    )
};