import React from 'react'
import { shallowEqual, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { RootState } from '../../../../setup';
import { USER_CLAIMS } from '../../user-management/components/constants/UserClaims';
import { Campaign } from './Campaign';

export const ViewCampaign = () => {

    const userAccess = useSelector<RootState>(({ auth }) => auth.access, shallowEqual) as string
    const history = useHistory();

    //check if has view access
    if(!userAccess.includes(USER_CLAIMS.ViewCampaignRead))
        history.push("/error/401");

    return (
       <Campaign mode= {'view'}/>
    )
}

export default ViewCampaign
