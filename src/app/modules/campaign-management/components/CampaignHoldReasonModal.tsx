import React, { useEffect, useState } from 'react'
import { ModalFooter } from 'react-bootstrap-v5'
import { useDispatch,useSelector, shallowEqual } from 'react-redux'
import { RootState } from '../../../../setup'
import { DangerButton, FieldContainer, FormModal, SuccessButton } from '../../../custom-components'
import { CampaignModel } from '../models/request/CampaignModel'
import * as campaign from '../redux/CampaignManagementRedux'


interface Props {
    showForm: boolean
    closeModal: () => void
    showHeader?: boolean
    modalSize?: any
    actionTitle?: any,
    submitCampaign: () => void

}

export const CampaignHoldReasonModal = (Props : Props) => {
  const [selectedHoldReason, setSelectedHoldReason] = useState<string>('')
  const dispatch = useDispatch()
  const campaignState = useSelector<RootState>(
    ({campaign}) => campaign.campaign,
    shallowEqual) as CampaignModel

useEffect(() => {
    campaignState.holdReason = selectedHoldReason
    dispatch(campaign.actions.campaign({...campaignState}))
}, [selectedHoldReason])
    return (
        <>
         <FormModal headerTitle={'Hold Campaign'} haveFooter={false} show={Props.showForm}>
         <FieldContainer>
        <div className='col-sm-3'>
          <label className='form-label-sm'>Hold Reason</label>
        </div>
        <div className='col-sm-6'>
          <input
            type='text'
            className='form-control form-control-sm '
            onChange={(e: any) => setSelectedHoldReason(e.target.value)}
            value={selectedHoldReason}
            aria-label='Hold Reason'
          />
        </div>
      </FieldContainer>
            <ModalFooter style={{border:0}}>
                <SuccessButton access={true} title={'Submit'} onClick={() => Props.submitCampaign()}/>
                <DangerButton access={true} title={'Close'} onClick={Props.closeModal}/>
            </ModalFooter>
        </FormModal>
        </>
      )

    }