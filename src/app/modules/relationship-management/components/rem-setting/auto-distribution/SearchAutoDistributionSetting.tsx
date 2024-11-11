import React, { useEffect, useState } from 'react';
import swal from 'sweetalert';
import { BasicFieldLabel, ButtonsContainer, ContentContainer, FormContainer, FormGroupContainer, FormHeader, MainContainer, MlabButton } from '../../../../../custom-components';
import Select from 'react-select';
import useRemLookups from '../../../shared/hooks/useRemLookups';
import { STATUS_OPTIONS } from '../../../../system/components/constants/SelectOptions';
import { ElementStyle, PROMPT_MESSAGES } from '../../../../../constants/Constants';
import { shallowEqual, useSelector } from 'react-redux';
import { RootState } from '../../../../../../setup';
import { USER_CLAIMS } from '../../../../user-management/components/constants/UserClaims';
import { useFormik } from 'formik';
import { Tab, Tabs } from 'react-bootstrap-v5';
import { useVIPLevels } from '../../../../../custom-functions';
import { LookupModel } from '../../../../../shared-models/LookupModel';
import DistributionConfigurationList from './DistributionConfigurationList';
import DistributionAgentList from './DistributionAgentList';
import { AutoDistributionSettingsFilterModel } from '../../../models/request/AutoDistributionSettingsFilterModel';
import { RemoveDistributionByVIPLevelRequestModel } from '../../../models/request/RemoveDistributionByVIPLevelRequestModel';
import { RemoveDistributionbyVipLevel } from '../../../services/RemSettingApi';
import useConstant from '../../../../../constants/useConstant';
import useRemRemovedVipLevels from '../../../shared/hooks/useRemRemovedVipLevels';
import { useHistory } from 'react-router-dom';

const initialValues : AutoDistributionSettingsFilterModel = {
    configurationName: '',
    remProfileIds: [],
    configurationStatus: null
}

const SearchAutoDistributionSetting: React.FC = () => {
    const userAccessId = useSelector<RootState>(({ auth }) => auth.userId, shallowEqual) as number;
    const userAccess = useSelector<RootState>(({ auth }) => auth.access, shallowEqual) as string;
    const remLookups = useRemLookups();
    const vipLevelList = useVIPLevels(userAccessId);
    const loadRemovedVipLevels = useRemRemovedVipLevels();

    const { successResponse, SwalSuccessMessage, SwalServerErrorMessage } = useConstant();

    const [vipLoading, setVipLoading] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [selectedVIPList, setSelectedVIPList] = useState<Array<LookupModel> | null>([]);
    const [searchFilterRequest, setSearchFilterRequest] = useState<any>();
    const history = useHistory();

    if(userAccessId != 0 && userAccess.includes(USER_CLAIMS.RemAutoDistributionSettingRead) !== true) {
		history.push('/error/401');
	}

    useEffect(() => {
        setSelectedVIPList(loadRemovedVipLevels);
    }, [loadRemovedVipLevels]);

    const clearFilterFields = () => {
        formik.resetForm();
    };


    const formik = useFormik({
        initialValues,
        onSubmit: (values, { setSubmitting }) => {
            setSubmitting(true);

            if (values.configurationName === '' && values.configurationStatus === null &&
                (values.remProfileIds !== undefined && values.remProfileIds.length === 0)) {
                swal(PROMPT_MESSAGES.FailedValidationTitle, 'Please populate at least one Search filter', 'error');
                setSubmitting(false);
                return;
            }

            setLoading(true);
            const requestObj: AutoDistributionSettingsFilterModel = {
                configurationName: values.configurationName,
                remProfileIds: values.remProfileIds,
                configurationStatus: values.configurationStatus,
            }

            setSearchFilterRequest(requestObj);
            setSubmitting(false);
        },
    });

    const confirmSaveVipLevel = () => {
        let result = selectedVIPList?.map(function (val) { return val.value }).join(',');
        const requestObj: RemoveDistributionByVIPLevelRequestModel = {
            vipLevelIds: result,
            userId: userAccessId
        }
        saveVipLevel(requestObj);
    }

    const saveVipLevel = async (requestObj: RemoveDistributionByVIPLevelRequestModel) => {
        setVipLoading(true);
        const response: any = await RemoveDistributionbyVipLevel(requestObj);
        if (response.status === successResponse) {
            swal(SwalSuccessMessage.title, SwalSuccessMessage.textSuccess, SwalSuccessMessage.icon);
            setVipLoading(false);
        } else {
            swal(SwalServerErrorMessage.title, response.data.message, SwalServerErrorMessage.icon);
            setVipLoading(false);
        }
    };

    return (
        <MainContainer>
            <FormHeader headerLabel={'Search ReM Auto Distribution Setting'} />
            <FormContainer onSubmit={formik.handleSubmit} onReset={formik.resetForm}>
                <ContentContainer>
                    <FormGroupContainer>
                        <div className='col-lg-3'>
                            <BasicFieldLabel title={'Configuration Name'} />
                            <div className='input-group'>
                                <input
                                    type='text'
                                    aria-autocomplete='none'
                                    autoComplete='off'
                                    className='form-control form-control-sm'
                                    aria-label='Configuration Name'
                                    onChange={(val: any) => formik.setFieldValue('configurationName', val.target.value)}
                                    value={formik.values.configurationName}
                                />
                            </div>
                        </div>
                        <div className='col-lg-3'>
                            <BasicFieldLabel title={'Agent Name'} />
                            <div className='col-lg-12'>
                                <Select
                                    isMulti
                                    native
                                    size="small"
                                    style={{ width: '100%' }}
                                    options={remLookups.remProfileNames}
                                    onChange={(val: any) => formik.setFieldValue('remProfileIds', val)}
                                    value={formik.values.remProfileIds}
                                    isClearable={true}
                                />
                            </div>
                        </div>
                        <div className='col-lg-3'>
                            <BasicFieldLabel title={'Configuration Status'} />
                            <div className='col-lg-12'>
                                <Select
                                    size="small"
                                    style={{ width: '100%' }}
                                    options={STATUS_OPTIONS}
                                    onChange={(val: any) => formik.setFieldValue('configurationStatus', val)}
                                    value={formik.values.configurationStatus}
                                    isClearable={true}
                                />
                            </div>
                        </div>
                    </FormGroupContainer>
                    <FormGroupContainer>
                        <ButtonsContainer>
                            <MlabButton
                                access={true}
                                label='Search'
                                style={ElementStyle.primary}
                                type={'submit'}
                                weight={'solid'}
                                size={'sm'}
                                loading={loading}
                                loadingTitle={'Please wait...'}
                                disabled={loading || !userAccess.includes(USER_CLAIMS.RemAutoDistributionSettingRead)}
                            />
                            <MlabButton
                                type={'button'}
                                weight={'solid'}
                                style={ElementStyle.secondary}
                                disabled={loading}
                                access={true}
                                label={'Clear'}
                                onClick={clearFilterFields}
                            />
                        </ButtonsContainer>
                    </FormGroupContainer>
                    <FormGroupContainer>
                        <div className='separator separator-dashed my-3' />
                        <Tabs defaultActiveKey='configurationList' id='auto-distribution-search-result' className='mt-3 mb-3' style={{ fontWeight: '600' }}>
                            <Tab eventKey='configurationList' title='Configuration' tabClassName='configuration-list-tabitem'>
                                <DistributionConfigurationList search={searchFilterRequest} setLoading={setLoading} loading={loading} />
                            </Tab>
                            <Tab eventKey='agentList' title='Agent' tabClassName='agent-list-tabitem'>
                                <DistributionAgentList search={searchFilterRequest} setLoading={setLoading} loading={loading} />
                            </Tab>
                        </Tabs>
                    </FormGroupContainer>
                    <FormGroupContainer>
                        <div className='separator separator-dashed my-3' />
                        <BasicFieldLabel title={'Remove distribution if VIP Level changed to'} />
                        <ButtonsContainer>
                            <div className='flex-grow-2 w-25 mx-2'>
                                <Select
                                    isMulti
                                    size="small"
                                    style={{ width: '100%' }}
                                    options={vipLevelList}
                                    onChange={(val: any) => setSelectedVIPList(val)}
                                    value={selectedVIPList}
                                    isClearable={false}
                                    isDisabled={!userAccess.includes(USER_CLAIMS.RemAutoDistributionSettingWrite)}
                                />
                            </div>
                            <div className='flex-grow-2  mx-2'>
                                <MlabButton
                                    access={true}
                                    label='Save'
                                    style={ElementStyle.primary}
                                    type={'button'}
                                    weight={'solid'}
                                    size={'sm'}
                                    loading={vipLoading}
                                    loadingTitle={'Please wait...'}
                                    onClick={confirmSaveVipLevel}
                                    disabled={vipLoading || !userAccess.includes(USER_CLAIMS.RemAutoDistributionSettingWrite)}
                                />
                            </div>
                        </ButtonsContainer>
                    </FormGroupContainer>
                </ContentContainer>
            </FormContainer>
        </MainContainer>
    );
};

export default SearchAutoDistributionSetting;
