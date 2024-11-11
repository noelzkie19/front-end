import { Container, ModalFooter } from 'react-bootstrap-v5';
import { FormModal, MlabButton, NumberTextInput } from '../../../../../../custom-components';
import swal from 'sweetalert';
import { useEffect, useState } from 'react';
import { ElementStyle, PROMPT_MESSAGES } from '../../../../../../constants/Constants';
import { shallowEqual, useSelector } from 'react-redux';
import { RootState } from '../../../../../../../setup';
import { USER_CLAIMS } from '../../../../../user-management/components/constants/UserClaims';
import useConstant from '../../../../../../constants/useConstant';
import { UpdateMaxPlayerCountConfigRequestModel } from '../../../../models/request/UpdateMaxPlayerCountConfigRequestModel';
import { UpdateMaxPlayerCountConfig } from '../../../../services/RemSettingApi';
import { RemProfileResponseModel } from '../../../../models/response/RemProfileResponseModel';

interface Props {
    showForm: boolean;
    closeModal: () => void;
    selectedRow: RemProfileResponseModel;
}

const UpdateAgentMaximumPlayerCountModal: React.FC<Props> = ({ showForm, closeModal, selectedRow }) => {
    //Redux
    const userAccessId = useSelector<RootState>(({ auth }) => auth.userId, shallowEqual) as number;
    const userAccess = useSelector<RootState>(({ auth }) => auth.access, shallowEqual) as string;
    const { successResponse, SwalConfirmMessage, SwalSuccessMessage, SwalServerErrorMessage } = useConstant();

    //States
    const [loading, setLoading] = useState<boolean>(false);
    const [agentName, setAgentName] = useState<string>('');
    const [maxPlayerCount, setMaxPlayerCount] = useState<string>('');

    //Watchers
    useEffect(() => {
        if (selectedRow && showForm) {
            setMaxPlayerCount(selectedRow.maxPlayersCount.toString())
            setAgentName(selectedRow.remProfileName);
        }
    }, [showForm]);

    const handleMaxPlayerCountField = (event: any) => {
        setMaxPlayerCount(event.target.value);
    };

    const onCloseModal = () => {
        closeModal();
    };

    const validateMaxPlayerCount = () => {
        let valid = true;

        if (maxPlayerCount.length === 0) {
            swal(PROMPT_MESSAGES.FailedValidationTitle, 'Unable to proceed, kindly fill up the mandatory fields.', 'error');
            valid = false;
        }

        if (parseInt(maxPlayerCount) > 999999) {
            swal(PROMPT_MESSAGES.FailedValidationTitle, 'Exceeded the maximum count of players.', 'error');
            valid = false;
        }
        return valid;
    }

    const confirmSaveMaxPlayerCount = () => {
        if (validateMaxPlayerCount()) {
            swal({
                title: PROMPT_MESSAGES.ConfirmSubmitTitle,
                text: PROMPT_MESSAGES.ConfirmSubmitMessageEdit,
                icon: SwalConfirmMessage.icon,
                buttons: [SwalConfirmMessage.btnNo, SwalConfirmMessage.btnYes],
                dangerMode: true
            }).then((action) => {
                if (action) {
                    const requestObj: UpdateMaxPlayerCountConfigRequestModel = {
                        agentNameId: selectedRow.remProfileId,
                        maxPlayerCount: parseInt(maxPlayerCount),
                        userId: userAccessId
                    }
                    saveMaxPlayerCountUpdate(requestObj);
                }
            });
        }
    }

    const saveMaxPlayerCountUpdate = async (requestObj: UpdateMaxPlayerCountConfigRequestModel) => {
        setLoading(true);
        const response: any = await UpdateMaxPlayerCountConfig(requestObj);
        if (response.status === successResponse) {
            swal(SwalSuccessMessage.title, SwalSuccessMessage.textSuccess, SwalSuccessMessage.icon);
            setLoading(false);
            closeModal();
        } else {
            swal(SwalServerErrorMessage.title, response.data.message, SwalServerErrorMessage.icon);
            setLoading(false);
        }
    };

    return (
        <FormModal
            headerTitle={"Change Max Player Count - " + agentName}
            haveFooter={false}
            show={showForm}
            customSize='md'
        >
            <Container>
                <div className='row mb-3'>
                    <div className='col-sm-6'>
                        <label htmlFor="countField" className='form-control-label mb-2 required'>Maximum Player Count</label>
                    </div>
                    <div className='col-sm-3'>
                        <div className='input-group'>
                            <NumberTextInput
                                ariaLabel={'Maximum Player Count'}
                                min='0'
                                className={'form-control form-control-sm'}
                                disabled={!userAccess.includes(USER_CLAIMS.RemAutoDistributionSettingWrite)}
                                {...{ id: 'countField', value: maxPlayerCount, onChange: handleMaxPlayerCountField }}
                            />
                        </div>
                    </div>
                </div>
            </Container>
            <ModalFooter style={{ border: 0 }}>
                <MlabButton
                    access={true}
                    label='Update'
                    style={ElementStyle.primary}
                    type={'button'}
                    weight={'solid'}
                    size={'sm'}
                    loading={loading}
                    loadingTitle={'Please wait...'}
                    onClick={confirmSaveMaxPlayerCount}
                    disabled={loading || !userAccess.includes(USER_CLAIMS.RemAutoDistributionSettingWrite)}
                />
                <MlabButton
                    access={true}
                    size={'sm'}
                    label={'Close'}
                    additionalClassStyle={{ marginRight: 0 }}
                    style={ElementStyle.secondary}
                    type={'button'}
                    weight={'solid'}
                    loadingTitle={'Please wait...'}
                    disabled={loading}
                    onClick={() => {
                        onCloseModal();
                    }}
                />
            </ModalFooter>
        </FormModal>
    );
};

export default UpdateAgentMaximumPlayerCountModal;
