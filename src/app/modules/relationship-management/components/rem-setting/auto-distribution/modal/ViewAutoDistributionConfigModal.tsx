import { ModalFooter } from 'react-bootstrap-v5';
import '../../../../../../../../node_modules/react-multiselect-listbox/dist/styles.module.scss';
import * as hubConnection from '../../../../../../../setup/hub/MessagingHub';
import '../../../../css/AutoDistribution.css';
import { BasicFieldLabel, FormGroupContainer, FormModal, MlabButton, RequiredLabel } from '../../../../../../custom-components';
import { useEffect, useState } from 'react';
import { ElementStyle } from '../../../../../../constants/Constants';
import { shallowEqual, useSelector } from 'react-redux';
import { RootState } from '../../../../../../../setup';
import useConstant from '../../../../../../constants/useConstant';
import MultiSelectListBox from 'react-multiselect-listbox';
import { useCurrencies, useVIPLevels } from '../../../../../../custom-functions';
import useRemLookups from '../../../../shared/hooks/useRemLookups';
import useCountryWithAccessRestriction from '../../../../../../custom-functions/useCountryWithAccessRestriction';
import { LookupModel } from '../../../../../../shared-models/LookupModel';
import { Guid } from 'guid-typescript';
import { AutoDistributionConfigurationByIdRequestModel } from '../../../../models/request/AutoDistributionConfigurationByIdRequestModel';
import { GetAutoDistributionConfigurationDetailsById, SendGetAutoDistributionConfigurationDetailsById } from '../../../../services/RemSettingApi';

interface Props {
    showForm: boolean;
    closeModal: () => void;
    selected: number;
}

interface DropdownOption {
    value: number;
    desc: string;
}

const ViewAutoDistributionConfigModal: React.FC<Props> = ({ showForm, closeModal, selected }) => {
    //Redux
    const userAccessId = useSelector<RootState>(({ auth }) => auth.userId, shallowEqual) as number;
    const messagingHub = hubConnection.createHubConnenction();
    const { successResponse } = useConstant()

    //States
    const [loading, setLoading] = useState<boolean>(false);
    const [viewConfigurationName, setViewConfigurationName] = useState<string>('');

    //dropdown
    const currencyList = useCurrencies(userAccessId);
    const vipLevelList = useVIPLevels(userAccessId);
    const remLookups = useRemLookups();
    const countryList = useCountryWithAccessRestriction(userAccessId);

    //fields
    const [viewSelectedCurrency, setViewSelectedCurrency] = useState<number[]>([]);
    const [viewSelectedVipLevel, setViewSelectedVipLevel] = useState<number[]>([]);
    const [viewSelectedCountry, setViewSelectedCountry] = useState<number[]>([]);
    const [viewSelectedRemAgents, setViewSelectedRemAgents] = useState<number[]>([]);

    const mapDropdownOptions = (_val: any) => {
        let dropdownOptions: DropdownOption[] = [];
        _val.map((item: LookupModel) => {
            const option = {
                value: Number(item.value),
                desc: item.label,
            };
            dropdownOptions.push(option);
        });

        return dropdownOptions;
    };

    useEffect(() => {
        if (showForm) {
            clearFields();
            _getAutoDistributionConfigurationDetailsById();
        }
    }, [showForm])

    const clearFields = () => {
        setViewConfigurationName('');
        setViewSelectedCurrency([]);
        setViewSelectedVipLevel([]);
        setViewSelectedCountry([]);
        setViewSelectedRemAgents([]);
    }

    const _getAutoDistributionConfigurationDetailsById = () => {
        setTimeout(() => {
            messagingHub.start().then(() => {
                const request: AutoDistributionConfigurationByIdRequestModel = {
                    queueId: Guid.create().toString(),
                    userId: userAccessId.toString(),
                    autoDistributionConfigurationId: selected,
                };
                setLoading(true);
                SendGetAutoDistributionConfigurationDetailsById(request).then((response) => {
                    if (response.status === successResponse) {
                        messagingHub.on(request.queueId.toString(), (message) => {
                            GetAutoDistributionConfigurationDetailsById(message.cacheId)
                                .then((data) => {
                                    console.log(data.data);
                                    let configurationDetails = data.data.configurationDetails;
                                    setViewConfigurationName(configurationDetails.configurationName);
                                    let currencyObj = data.data.adsCurrencyType;
                                    setViewSelectedCurrency(currencyObj.map(i => i.currencyId));
                                    let countryObj = data.data.adsCountryType;
                                    setViewSelectedCountry(countryObj.map(i => i.countryId));
                                    let vipLevelObj = data.data.adsVipLevelType;
                                    setViewSelectedVipLevel(vipLevelObj.map(i => i.vipLevelId));
                                    let remAgentObj = data.data.adsRemAgentType;
                                    setViewSelectedRemAgents(remAgentObj.map(i => i.remProfileId));
                                    setLoading(false);
                                })
                                .catch(() => {
                                    setLoading(false);
                                });
                        });

                        setTimeout(() => {
                            if (messagingHub.state === 'Connected') {
                                messagingHub.stop();
                            }
                        }, 300000);
                    } else {
                        messagingHub.stop();
                    }
                });
            });
        }, 1000);
    };

    const onCloseModal = () => {
        clearFields();
        closeModal();
    };

    return (
        <FormModal
            headerTitle="View Auto Distribution Configuration"
            haveFooter={false}
            show={showForm}
            customSize='xl'
        >
            <FormGroupContainer>
                <div className='col-lg-6'>
                    <RequiredLabel title={'Configuration Name'} />
                    <div className='input-group'>
                        <input
                            type='text'
                            aria-autocomplete='none'
                            autoComplete='off'
                            className='form-control form-control-sm'
                            aria-label='Configuration Name'
                            value={viewConfigurationName}
                            disabled={true}
                        />
                    </div>
                </div>
                <div className='col-lg-12 mt-6'>
                    <BasicFieldLabel title={'Auto Distribution Configuration'} />
                </div>
                <div className='row'>
                    <div className='col-lg-6'>
                        <RequiredLabel title={'Currency'} />
                        <div className='input-group multi-select-container disableListBox'>
                            <MultiSelectListBox
                                className={"multi-select"}
                                overrideStrings={{
                                    search: "Search...",
                                    selectAll: "Add All",
                                    removeAll: "Remove All",
                                    selectedInfo: "Items selected"
                                }}
                                sortable={false}
                                options={mapDropdownOptions(currencyList)}
                                textField="desc"
                                valueField="value"
                                value={viewSelectedCurrency}
                                rowHeight={25}
                                onSelect={null}
                                onRemove={null}
                                onSelectAll={null}
                                onRemoveAll={null}
                                onSort={null}
                            />
                        </div>
                    </div>
                    <div className='col-lg-6'>
                        <RequiredLabel title={'VIP Level'} />
                        <div className='input-group multi-select-container disableListBox'>
                            <MultiSelectListBox
                                className={"multi-select"}
                                overrideStrings={{
                                    search: "Search...",
                                    selectAll: "Add All",
                                    removeAll: "Remove All",
                                    selectedInfo: "Items selected"
                                }}
                                sortable={false}
                                options={mapDropdownOptions(vipLevelList)}
                                textField="desc"
                                valueField="value"
                                value={viewSelectedVipLevel}
                                rowHeight={25}
                                onSelect={null}
                                onRemove={null}
                                onSelectAll={null}
                                onRemoveAll={null}
                                onSort={null}
                            />
                        </div>
                    </div>
                </div>
                <div className='row pt-10'>
                    <div className='col-lg-6'>
                        <label htmlFor='country-multiselect-view' className='col-form-label col-sm'>Country</label>
                        <div className='input-group multi-select-container disableListBox'>
                            <MultiSelectListBox
                                id='country-multiselect-view'
                                className={"multi-select"}
                                overrideStrings={{
                                    search: "Search...",
                                    selectAll: "Add All",
                                    removeAll: "Remove All",
                                    selectedInfo: "Items selected"
                                }}
                                sortable={false}
                                options={mapDropdownOptions(countryList)}
                                textField="desc"
                                valueField="value"
                                value={viewSelectedCountry}
                                rowHeight={25}
                                onSelect={null}
                                onRemove={null}
                                onSelectAll={null}
                                onRemoveAll={null}
                                onSort={null}
                            />
                        </div>
                    </div>
                    <div className='col-lg-6'>
                        <RequiredLabel title={'ReM Agent'} />
                        <div className='input-group multi-select-container disableListBox'>
                            <MultiSelectListBox
                                className={"multi-select"}
                                overrideStrings={{
                                    search: "Search...",
                                    selectAll: "Add All",
                                    removeAll: "Remove All",
                                    selectedInfo: "Items selected"
                                }}
                                sortable={false}
                                options={mapDropdownOptions(remLookups.activeRemProfileNames)}
                                textField="desc"
                                valueField="value"
                                value={viewSelectedRemAgents}
                                rowHeight={25}
                                onSelect={null}
                                onRemove={null}
                                onSelectAll={null}
                                onRemoveAll={null}
                                onSort={null}
                            />
                        </div>
                    </div>
                </div>
            </FormGroupContainer>
            <ModalFooter style={{ border: 0 }}>
                <MlabButton
                    access={true}
                    size={'sm'}
                    label={'Close'}
                    additionalClassStyle={{ marginRight: 0 }}
                    style={ElementStyle.secondary}
                    type={'button'}
                    weight={'solid'}
                    disabled={loading}
                    onClick={() => {
                        onCloseModal();
                    }}
                />
            </ModalFooter>
        </FormModal>
    );
};

export default ViewAutoDistributionConfigModal;
