import {useFormik} from 'formik';
import React, {useCallback, useEffect, useState} from 'react';
import {ModalFooter} from 'react-bootstrap-v5';
import {shallowEqual, useSelector} from 'react-redux';
import Select from 'react-select';
import swal from 'sweetalert';
import {RootState} from '../../../../../setup';
import useConstant from '../../../../constants/useConstant';
import {DefaultSecondaryButton, FormContainer, FormGroupContainer, FormModal, LoaderButton} from '../../../../custom-components';
import useSearchLeadsHooks from '../hooks/useSearchLeadsHooks';
import {LeadLinkDetailsResponse} from '../models/LeadLinkDetailsResponse';
import {GetLeadLinkDetailsById, LinkUnlinkPlayer} from '../services/SearchLeadsService';

interface ModalProps {
    showForm: boolean;
    closeModal: () => void;
    selectedLeadId: string;
    selectedLeadName: string;
    existingLinkedPlayerId: string;
    existingLinkedPlayerUsername: string;
    existingLinkedPlayerUsernameBrandConcat: string;
    existingLinkedMlabPlayerId: number;
    setReloadPage:  (e: any) => void;
}

interface LinkingFormValues {
    linkedPlayerId: number;
}

const initialValues: LinkingFormValues = {
    linkedPlayerId: 0,
	
};

const LinkingModal: React.FC<ModalProps> = ({
    showForm,
    closeModal,
    selectedLeadId,
    selectedLeadName,
    existingLinkedPlayerId,
    existingLinkedPlayerUsername,
    existingLinkedPlayerUsernameBrandConcat,
    existingLinkedMlabPlayerId,
    setReloadPage,
}) => {

    const { SearchLeadsConstants, successResponse} = useConstant();
    const [playerNameSearch, setPlayerNameSearch] = useState<any>()
    const userAccessId = useSelector<RootState>(({auth}) => auth.userId, shallowEqual) as number;
	const { usernameOptions, getLeadPlayersByUsernameOptions} = useSearchLeadsHooks();
    const [brandName, setBrandName] = useState<string>('')
    const [currencyName, setCurrencyName] = useState<string>('')
    const [vipLevelName, setVIPLevelName] = useState<string>('')
    const [countryName, setCountryName] = useState<string>('')
    const [selectedMlabPlayerId, setSelectedMlabPlayerId] = useState<number>(0)
    const [playerToLinkDetails, setPlayerToLinkDetails] = useState<LeadLinkDetailsResponse>()
    const [loading, setLoading] = useState<boolean>(false)
    useEffect(() => {
      if (showForm) {
        clearFields()
        debugger
        setPlayerNameSearch({label: existingLinkedPlayerUsernameBrandConcat, value: existingLinkedPlayerId, mlabPlayerId: existingLinkedMlabPlayerId })
        getPlayerDetailsOnSelection(existingLinkedMlabPlayerId)
        getLeadPlayersByUsernameOptions(existingLinkedPlayerUsername, userAccessId);
      }
    }, [showForm])
    
    useEffect(() => {
      if (existingLinkedPlayerId) {
        setSelectedMlabPlayerId(existingLinkedMlabPlayerId)
      }
    }, [existingLinkedPlayerId])
    


    const onChangeUsername = useCallback(
		(event: any) => {
            setPlayerNameSearch(event)
            if (event?.value) {
                setSelectedMlabPlayerId(event?.mlabPlayerId);
                getPlayerDetailsOnSelection(event?.mlabPlayerId);
            }
            
		},
		[playerNameSearch]
	);


    const  getPlayerDetailsOnSelection  = async (mlabPlayerId: number) => {
        if (mlabPlayerId) {
            await GetLeadLinkDetailsById(mlabPlayerId).then((response) =>{
                if (response.status === successResponse) {
                    let playerDetails = response.data 
                    
                    setPlayerToLinkDetails(playerDetails)
                    setBrandName(playerDetails.brandName)
                    setCountryName(playerDetails.countryName)
                    setCurrencyName(playerDetails.currencyName)
                    setVIPLevelName(playerDetails.vipLevelName)
                }
            

            })
        }
        
    }

    const searchUserName = (input: string) => {
		if (input.length > 2  ) {
			getLeadPlayersByUsernameOptions(input, userAccessId);
		}
	};

    
    const formik = useFormik({
        initialValues,
        onSubmit: async (values) => {
            formik.setSubmitting(true);
            debugger
            if (playerToLinkDetails && selectedMlabPlayerId) {
                try {
                    setLoading(true)
                    // Delay the execution of linkPlayer by 2000 milliseconds
                    setTimeout(async () => {
                        try {
                            const linkResult = await linkPlayer(parseInt(selectedLeadId), selectedMlabPlayerId);
                            
                            if (linkResult) {
                                swal(SearchLeadsConstants.SwalSearchLeadsMessage.titleSuccessful, 
                                    SearchLeadsConstants.SwalSearchLeadsMessage.textSuccess, 
                                    SearchLeadsConstants.SwalSearchLeadsMessage.iconSuccess);
                                    setReloadPage(true)
                                    closeModal()
                            } else {
                                swal(SearchLeadsConstants.SwalSearchLeadsMessage.titleFailed, 
                                    SearchLeadsConstants.SwalSearchLeadsMessage.textErrorLink, 
                                    SearchLeadsConstants.SwalSearchLeadsMessage.iconError);
                            }
                        } catch (error) {
                            console.error('Error occurred during linkPlayer:', error);
                            setLoading(false)
                        } finally {
                            formik.setSubmitting(false);
                            setLoading(false)
                            clearFields();
                        }
                    }, 2000);
                } catch (error) {
                    console.error('Error occurred during setTimeout:', error);
                    formik.setSubmitting(false);
                    setLoading(false)
                }
            }
            else {
                swal(SearchLeadsConstants.SwalSearchLeadsMessage.titleFailed,
                    SearchLeadsConstants.SwalSearchLeadsMessage.requiredAllFields,
                    SearchLeadsConstants.SwalSearchLeadsMessage.iconError);
            }
        }
    });
    

    const linkPlayer = async (leadId: number, linkedMlabPlayerId: number) => {
        let link = true
        await LinkUnlinkPlayer(leadId, linkedMlabPlayerId, userAccessId).then((response) =>{
            if (response.status === successResponse) {
                link = response.data
            }
            else link = false
        })

        return link
    } 
    
    const clearFields = () => {
        setPlayerNameSearch('')
        setPlayerToLinkDetails(undefined)
        setSelectedMlabPlayerId(0)
        setBrandName('')
        setCountryName('')
        setCurrencyName('')
        setVIPLevelName('')
    }


    const closeModalLinking = () => {
		swal({
            title: SearchLeadsConstants.SwalSearchLeadsMessage.titleConfirmation,
            text: SearchLeadsConstants.SwalSearchLeadsMessage.textDiscarded,
            icon: SearchLeadsConstants.SwalSearchLeadsMessage.iconWarning,
            buttons: [SearchLeadsConstants.SwalSearchLeadsMessage.btnNo, SearchLeadsConstants.SwalSearchLeadsMessage.btnYes],
            dangerMode: true,
        }).then((willClose) => {
            if (willClose) {
                closeModal();
                
            }
        });
	};

  return (
    <FormModal show={showForm} customSize={'md'} headerTitle={'Link Player'} haveFooter={false}>
            <FormContainer onSubmit={formik.handleSubmit} >
                <div className="mx-2">
                         <FormGroupContainer>
                            <span className='col-form-label col-lg-4'>Leads Id:</span>
                                <div className='col-lg-8 col-form-label'>
                                    <span className='fw-normal'>{selectedLeadId}</span>
                                </div>
                        </FormGroupContainer>
                        
                        <FormGroupContainer>
                             <span className='col-form-label  col-lg-4'>Leads Name:</span>
                                <div className='col-lg-8 mb-3 col-form-label'>
                                    <span className='text-right fw-normal'>{selectedLeadName}</span>
                                </div>
                        </FormGroupContainer> 

                        <FormGroupContainer>
                             <span className='col-form-label  col-lg-4 required'>Link to Player: </span>
                                <div className='col-lg-8 mb-3'>
                                <Select
                                        size='small'
                                        style={{width: '100%'}}
                                        options={usernameOptions.flatMap((obj) => [
                                            {
                                                label: obj.username,
                                                value: obj.playerId,
                                                mlabPlayerId: obj.mlabPlayerId
                                            },
                                        ])}
                                        onChange={onChangeUsername}
                                        value={playerNameSearch}
                                        onInputChange={searchUserName}
                                    />
                                </div>
                        </FormGroupContainer> 
                        {playerToLinkDetails ? (
                            <div className='mx-2 mt-2'>
                             <FormGroupContainer>
                                <span className='col-form-label text-right col-lg-4 '>Brand:</span>
                                <div className='col-lg-8 col-form-label'>
                                    <span className='text-right fw-normal'>{brandName}</span>
                                </div>

                            </FormGroupContainer>

                            <FormGroupContainer>
                                <span className='col-form-label text-right col-lg-4'>Currency:</span>
                                <div className='col-lg-8 col-form-label'>
                                    <span className='text-right fw-normal' >{currencyName}</span>
                                </div>
                            </FormGroupContainer>

                            <FormGroupContainer>
                               
                                <span className='col-form-label text-right col-lg-4'>Country:</span>
                                <div className='col-lg-8 col-form-label'>
                                    <span className='text-right fw-normal'>{countryName}</span>
                                </div>

                            </FormGroupContainer>

                            <FormGroupContainer>
                                <span className='col-form-label text-right col-lg-4'>VIP Level:</span>
                                <div className='col-lg-8 col-form-label '>
                                    <span className='text-right fw-normal' >{vipLevelName}</span>
                                </div>
                               
                            </FormGroupContainer>

                            <FormGroupContainer>
                                <span className="form-text text-muted italic-text mt-2">Leads will be linked to the selected Player</span>
                            </FormGroupContainer>
                           
                            </div>
                        ) : ''}
                <ModalFooter style={{border: 0, float: 'right', paddingLeft: 0, paddingRight: 0} }>
                   
                    <LoaderButton
								access={true}
								loading={loading}
								title={'Submit'}
								loadingTitle={' Please wait...'}
								disabled={loading}
                                />
                    <DefaultSecondaryButton
                                access={true}
                                title={'Close'}
                                onClick={closeModalLinking}
                                isDisable={false}
                                customStyle='btn btn-secondary btn-sm'
                            />
                </ModalFooter>
                </div>
            </FormContainer>
        </FormModal>
  )
}


export default LinkingModal