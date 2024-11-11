import { ModalFooter } from 'react-bootstrap-v5';
import '../../../../../../../../node_modules/react-multiselect-listbox/dist/styles.module.scss';
import * as hubConnection from '../../../../../../../setup/hub/MessagingHub';
import { BasicFieldLabel, FormGroupContainer, FormModal, MlabButton, RequiredLabel } from '../../../../../../custom-components';
import swal from 'sweetalert';
import { useEffect, useState } from 'react';
import { ElementStyle, PROMPT_MESSAGES } from '../../../../../../constants/Constants';
import { shallowEqual, useSelector } from 'react-redux';
import { RootState } from '../../../../../../../setup';
import { USER_CLAIMS } from '../../../../../user-management/components/constants/UserClaims';
import useConstant from '../../../../../../constants/useConstant';
import useAutoDistributionSettingHooks from '../../../../shared/hooks/useAutoDistributionSettingHooks';
import MultiSelectListBox from 'react-multiselect-listbox';
import { useCurrencies, useVIPLevels } from '../../../../../../custom-functions';
import useCountryWithAccessRestriction from '../../../../../../custom-functions/useCountryWithAccessRestriction';
import { LookupModel } from '../../../../../../shared-models/LookupModel';
import { Guid } from 'guid-typescript';
import { AutoDistributionConfigurationByIdRequestModel } from '../../../../models/request/AutoDistributionConfigurationByIdRequestModel';
import { GetAutoDistributionConfigurationDetailsById, SendGetAutoDistributionConfigurationDetailsById } from '../../../../services/RemSettingApi';
import { AutoDistributionConfigurationRequest } from '../../../../models/request/AutoDistributionConfigurationRequest';
import useRemAgentsByUserAccess from '../../../../../../custom-functions/useRemAgentsByUserAccess';

interface Props {
    showForm: boolean;
    closeModal: () => void;
    selected: number;
}

interface DropdownOption {
    value: number;
    desc: string;
}

const EditAutoDistributionConfigModal: React.FC<Props> = ({ showForm, closeModal, selected }) => {
    //Redux
    const userAccess = useSelector<RootState>(({ auth }) => auth.access, shallowEqual) as string;
    const userAccessId = useSelector<RootState>(({ auth }) => auth.userId, shallowEqual) as number;
    const messagingHub = hubConnection.createHubConnenction();
    const { successResponse } = useConstant()

    //States
    const [loading, setLoading] = useState<boolean>(false);
    const { SwalFailedMessage, message, SwalConfirmMessage, ReMAutoDistributionConstants } = useConstant();
    const { isConfigurationNameExisting, generateRequestModel, upsertAutoDistributionConfiguration, resetForm } = useAutoDistributionSettingHooks();

    //dropdown
    const currencyList = useCurrencies(userAccessId);
    const vipLevelList = useVIPLevels(userAccessId);
    const remLookups = useRemAgentsByUserAccess(userAccessId);
    const countryList = useCountryWithAccessRestriction(userAccessId);

    //fields
    const [editConfigurationName, setEditConfigurationName] = useState<string>('');
    const [editSelectedCurrency, setEditSelectedCurrency] = useState<number[]>([]);
    const [editSelectedVipLevel, setEditSelectedVipLevel] = useState<number[]>([]);
    const [editSelectedCountry, setEditSelectedCountry] = useState<number[]>([]);
    const [editSelectedRemAgents, setEditSelectedRemAgents] = useState<number[]>([]);

    useEffect(() => {
        if (resetForm) {
            setLoading(false);
            clearFields();
            closeModal();
        }
    }, [resetForm]);

    useEffect(() => {
        if (showForm) {
            clearFields();
            _getAutoDistributionConfigurationDetailsById();
        }
    }, [showForm])

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

    const clearFields = () => {
        setEditConfigurationName('');
        setEditSelectedCurrency([]);
        setEditSelectedVipLevel([]);
        setEditSelectedCountry([]);
        setEditSelectedRemAgents([]);
    }

    const _getAutoDistributionConfigurationDetailsById = () => {
        setTimeout(() => {
            messagingHub.start().then(() => {
                const request: AutoDistributionConfigurationByIdRequestModel = {
                    queueId: Guid.create().toString(),
                    userId: userAccessId.toString(),
                    autoDistributionConfigurationId: selected,
                };
                SendGetAutoDistributionConfigurationDetailsById(request).then((response) => {
                    if (response.status === successResponse) {
                        messagingHub.on(request.queueId.toString(), (message) => {
                            GetAutoDistributionConfigurationDetailsById(message.cacheId)
                                .then((data) => {
                                    console.log(data.data);
                                    let configurationDetails = data.data.configurationDetails;
                                    setEditConfigurationName(configurationDetails.configurationName);
                                    let currencyObj = data.data.adsCurrencyType;
                                    setEditSelectedCurrency(currencyObj.map(i => i.currencyId));
                                    let countryObj = data.data.adsCountryType;
                                    setEditSelectedCountry(countryObj.map(i => i.countryId));
                                    let vipLevelObj = data.data.adsVipLevelType;
                                    setEditSelectedVipLevel(vipLevelObj.map(i => i.vipLevelId));
                                    let remAgentObj = data.data.adsRemAgentType;
                                    setEditSelectedRemAgents(remAgentObj.map(i => i.remProfileId));
                                })
                                .catch(() => { });
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

    const updateAutoDistributionConfiguration = async () => {
        const isValid = await validateEditConfigurationName(editConfigurationName);
        if (isValid) {
            swal({
                title: SwalConfirmMessage.title,
                text: ReMAutoDistributionConstants.SwalReMAutoDistributionMessage.textUpdateConfirmation,
                icon: SwalConfirmMessage.icon,
                buttons: [SwalConfirmMessage.btnNo, SwalConfirmMessage.btnYes],
                dangerMode: true,
            }).then((onConfirm) => {
                if (onConfirm) {
                    setLoading(true);
                    const request: AutoDistributionConfigurationRequest = {
                        autoDistributionSettingId: selected,
                        configurationName: editConfigurationName,
                        selectedCurrency: editSelectedCurrency,
                        selectedCountry: editSelectedCountry,
                        selectedVipLevel: editSelectedVipLevel,
                        selectedRemAgents: editSelectedRemAgents
                    }
                    const saveConfigurationRequestObj = generateRequestModel(request);
                    upsertAutoDistributionConfiguration(saveConfigurationRequestObj);
                }
            });
        }
    }

    const validateEditConfigurationName = async (configurationNameEdit: string) => {
         if (configurationNameEdit === '' || editSelectedCurrency.length === 0 || editSelectedVipLevel.length === 0
            || editSelectedRemAgents.length === 0) {
            swal(SwalFailedMessage.title, message.requiredFields, SwalFailedMessage.icon);
            return false;
        }

        const isExisting = await isConfigurationNameExisting(selected, configurationNameEdit);
        if (isExisting) {
            swal(SwalFailedMessage.title, ReMAutoDistributionConstants.SwalReMAutoDistributionMessage.textConfigurationNameExists, SwalFailedMessage.icon);
            return false;
        }

        return true;
    }

    const onEditHandleListBoxSearch = (items: DropdownOption[], query: string) => {
        query = query.toLowerCase();

        return items.filter(item =>
            item['desc'].toLowerCase().includes(query)
        );
    }

    const onCloseModal = () => {
        swal({
            title: PROMPT_MESSAGES.ConfirmCloseTitle,
            text: ReMAutoDistributionConstants.SwalReMAutoDistributionMessage.textCloseConfirmation,
            icon: 'warning',
            buttons: ['No', 'Yes'],
            dangerMode: true,
        }).then((toConfirm) => {
            if (toConfirm) {
                clearFields();
                closeModal();
            }
        });
    };

    return (
        <FormModal
            headerTitle="Edit Auto Distribution Configuration"
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
                            onChange={(val: any) => setEditConfigurationName(val.target.value)}
                            value={editConfigurationName}
                            maxLength={100}
                        />
                    </div>
                </div>
                <div className='col-lg-12 mt-6'>
                    <BasicFieldLabel title={'Auto Distribution Configuration'} />
                </div>
                <div className='row'>
                    <div className='col-lg-6'>
                        <RequiredLabel title={'Currency'} />
                        <div className='input-group multi-select-container'>
                            <MultiSelectListBox
                                className={"multi-select"}
                                overrideStrings={{
                                    search: "Search...",
                                    selectAll: "Add All",
                                    removeAll: "Remove All",
                                    selectedInfo: "Items selected"
                                }}
                                sortable={true}
                                options={mapDropdownOptions(currencyList)}
                                textField="desc"
                                valueField="value"
                                value={editSelectedCurrency}
                                rowHeight={25}
                                onSelect={({ item, sortedList }: { item: DropdownOption, sortedList: DropdownOption[] }) => {
                                    setEditSelectedCurrency(sortedList.map(i => i.value));
                                }}
                                onRemove={({ item }: { item: DropdownOption }) => {
                                    setEditSelectedCurrency([...editSelectedCurrency.filter(i => i !== item.value)]);
                                }}
                                onSelectAll={(selectedItems: DropdownOption[]) => {
                                    const selected = [
                                        ...editSelectedCurrency,
                                        ...selectedItems.map(item => item.value)
                                    ];
                                    setEditSelectedCurrency(selected);
                                }}
                                onRemoveAll={() => setEditSelectedCurrency([])}
                                onSort={({ sortedList }: { sortedList: DropdownOption[] }) =>
                                    setEditSelectedCurrency([...sortedList.map(i => i.value)])
                                }
                                onSearch={({ items, query }: { items: DropdownOption[], query: string }) => {
                                    const currencyOptionsList = onEditHandleListBoxSearch(items, query);
                                    return currencyOptionsList;
                                }}
                            />
                        </div>
                    </div>
                    <div className='col-lg-6'>
                        <RequiredLabel title={'VIP Level'} />
                        <div className='input-group multi-select-container'>
                            <MultiSelectListBox
                                className={"multi-select"}
                                overrideStrings={{
                                    search: "Search...",
                                    selectAll: "Add All",
                                    removeAll: "Remove All",
                                    selectedInfo: "Items selected"
                                }}
                                sortable={true}
                                options={mapDropdownOptions(vipLevelList)}
                                textField="desc"
                                valueField="value"
                                value={editSelectedVipLevel}
                                rowHeight={25}
                                onSelect={({ item, sortedList }: { item: DropdownOption, sortedList: DropdownOption[] }) => {
                                    setEditSelectedVipLevel(sortedList.map(i => i.value));
                                }}
                                onRemove={({ item }: { item: DropdownOption }) => {
                                    setEditSelectedVipLevel([...editSelectedVipLevel.filter(i => i !== item.value)]);
                                }}
                                onSelectAll={(selectedItems: DropdownOption[]) => {
                                    const selected = [
                                        ...editSelectedVipLevel,
                                        ...selectedItems.map(item => item.value)
                                    ];
                                    setEditSelectedVipLevel(selected);
                                }}
                                onRemoveAll={() => setEditSelectedVipLevel([])}
                                onSort={({ sortedList }: { sortedList: DropdownOption[] }) =>
                                    setEditSelectedVipLevel([...sortedList.map(i => i.value)])
                                }
                                onSearch={({ items, query }: { items: DropdownOption[], query: string }) => {
                                    const vipLevelOptionsList = onEditHandleListBoxSearch(items, query);
                                    return vipLevelOptionsList;
                                }}
                            />
                        </div>
                    </div>
                </div>
                <div className='row pt-10'>
                    <div className='col-lg-6'>
                        <label htmlFor='country-multiselect-edit' className='col-form-label col-sm'>Country</label>
                        <div className='input-group multi-select-container'>
                            <MultiSelectListBox
                                id='country-multiselect-edit'
                                className={"multi-select"}
                                overrideStrings={{
                                    search: "Search...",
                                    selectAll: "Add All",
                                    removeAll: "Remove All",
                                    selectedInfo: "Items selected"
                                }}
                                sortable={true}
                                options={mapDropdownOptions(countryList)}
                                textField="desc"
                                valueField="value"
                                value={editSelectedCountry}
                                rowHeight={25}
                                onSelect={({ item, sortedList }: { item: DropdownOption, sortedList: DropdownOption[] }) => {
                                    setEditSelectedCountry(sortedList.map(i => i.value));
                                }}
                                onRemove={({ item }: { item: DropdownOption }) => {
                                    setEditSelectedCountry([...editSelectedCountry.filter(i => i !== item.value)]);
                                }}
                                onSelectAll={(selectedItems: DropdownOption[]) => {
                                    const selected = [
                                        ...editSelectedCountry,
                                        ...selectedItems.map(item => item.value)
                                    ];
                                    setEditSelectedCountry(selected);
                                }}
                                onRemoveAll={() => setEditSelectedCountry([])}
                                onSort={({ sortedList }: { sortedList: DropdownOption[] }) =>
                                    setEditSelectedCountry([...sortedList.map(i => i.value)])
                                }
                                onSearch={({ items, query }: { items: DropdownOption[], query: string }) => {
                                    const countryOptionsList = onEditHandleListBoxSearch(items, query);
                                    return countryOptionsList;
                                }}
                            />
                        </div>
                    </div>
                    <div className='col-lg-6'>
                        <RequiredLabel title={'ReM Agent'} />
                        <div className='input-group multi-select-container'>
                            <MultiSelectListBox
                                className={"multi-select"}
                                overrideStrings={{
                                    search: "Search...",
                                    selectAll: "Add All",
                                    removeAll: "Remove All",
                                    selectedInfo: "Items selected"
                                }}
                                sortable={true}
                                options={mapDropdownOptions(remLookups)}
                                textField="desc"
                                valueField="value"
                                value={editSelectedRemAgents}
                                rowHeight={25}
                                onSelect={({ item, sortedList }: { item: DropdownOption, sortedList: DropdownOption[] }) => {
                                    setEditSelectedRemAgents(sortedList.map(i => i.value));
                                }}
                                onRemove={({ item }: { item: DropdownOption }) => {
                                    setEditSelectedRemAgents([...editSelectedRemAgents.filter(i => i !== item.value)]);
                                }}
                                onSelectAll={(selectedItems: DropdownOption[]) => {
                                    const selected = [
                                        ...editSelectedRemAgents,
                                        ...selectedItems.map(item => item.value)
                                    ];
                                    setEditSelectedRemAgents(selected);
                                }}
                                onRemoveAll={() => setEditSelectedRemAgents([])}
                                onSort={({ sortedList }: { sortedList: DropdownOption[] }) =>
                                    setEditSelectedRemAgents([...sortedList.map(i => i.value)])
                                }
                                onSearch={({ items, query }: { items: DropdownOption[], query: string }) => {
                                    const remAgentsOptionsList = onEditHandleListBoxSearch(items, query);
                                    return remAgentsOptionsList;
                                }}
                            />
                        </div>
                    </div>
                </div>
            </FormGroupContainer>
            <ModalFooter style={{ border: 0 }}>
                <MlabButton
                    access={true}
                    label='Submit'
                    style={ElementStyle.primary}
                    type={'button'}
                    weight={'solid'}
                    size={'sm'}
                    loading={loading}
                    loadingTitle={'Please wait...'}
                    onClick={updateAutoDistributionConfiguration}
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
                    disabled={loading}
                    onClick={() => {
                        onCloseModal();
                    }}
                />
            </ModalFooter>
        </FormModal>
    );
};

export default EditAutoDistributionConfigModal;
