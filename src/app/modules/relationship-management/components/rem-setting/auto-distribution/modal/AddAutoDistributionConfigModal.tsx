import { ModalFooter } from 'react-bootstrap-v5';
import '../../../../../../../../node_modules/react-multiselect-listbox/dist/styles.module.scss';
import { BasicFieldLabel, FormGroupContainer, FormModal, MlabButton, RequiredLabel } from '../../../../../../custom-components';
import swal from 'sweetalert';
import { useEffect, useState } from 'react';
import { ElementStyle, PROMPT_MESSAGES } from '../../../../../../constants/Constants';
import { shallowEqual, useSelector } from 'react-redux';
import { RootState } from '../../../../../../../setup';
import { USER_CLAIMS } from '../../../../../user-management/components/constants/UserClaims';
import useAutoDistributionSettingHooks from '../../../../shared/hooks/useAutoDistributionSettingHooks';
import useConstant from '../../../../../../constants/useConstant';
import MultiSelectListBox from 'react-multiselect-listbox';
import { LookupModel } from '../../../../../../shared-models/LookupModel';
import { AutoDistributionConfigurationRequest } from '../../../../models/request/AutoDistributionConfigurationRequest';
import useVIPLevels from '../../../../../../custom-functions/useVIPLevels';
import useCurrencies from '../../../../../../custom-functions/useCurrencies';
import useCountryWithAccessRestriction from '../../../../../../custom-functions/useCountryWithAccessRestriction';
import useRemAgentsByUserAccess from '../../../../../../custom-functions/useRemAgentsByUserAccess';

interface Props {
    showForm: boolean;
    closeModal: () => void;
}

interface DropdownOption {
    value: number;
    desc: string;
}

const AddAutoDistributionConfigModal: React.FC<Props> = ({ showForm, closeModal }) => {
    //Redux
    const userAccess = useSelector<RootState>(({ auth }) => auth.access, shallowEqual) as string;
    const userAccessId = useSelector<RootState>(({ auth }) => auth.userId, shallowEqual) as number;

    //States
    const [loading, setLoading] = useState<boolean>(false);
    const [configurationName, setConfigurationName] = useState<string>('');
    const { SwalFailedMessage, message, SwalConfirmMessage, ReMAutoDistributionConstants } = useConstant();
    const { isConfigurationNameExisting, generateRequestModel, upsertAutoDistributionConfiguration, resetForm } = useAutoDistributionSettingHooks();

    //dropdown
    const currencyList = useCurrencies(userAccessId);
    const vipLevelList = useVIPLevels(userAccessId);
    const remLookups = useRemAgentsByUserAccess(userAccessId);
    const countryList = useCountryWithAccessRestriction(userAccessId);

    //fields
    const [selectedCurrency, setSelectedCurrency] = useState<number[]>([]);
    const [selectedVipLevel, setSelectedVipLevel] = useState<number[]>([]);
    const [selectedCountry, setSelectedCountry] = useState<number[]>([]);
    const [selectedRemAgents, setSelectedRemAgents] = useState<number[]>([]);

    useEffect(() => {
        if (resetForm) {
            setLoading(false);
            clearFields();
            closeModal();
        }
    }, [resetForm])

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
        setConfigurationName('');
        setSelectedCurrency([]);
        setSelectedVipLevel([]);
        setSelectedCountry([]);
        setSelectedRemAgents([]);
    }

    const confirmSaveAutoDistributionConfiguration = async () => {
        const isValid = await validateAddConfigurationName(configurationName);
        if (isValid) {
            swal({
                title: SwalConfirmMessage.title,
                text: ReMAutoDistributionConstants.SwalReMAutoDistributionMessage.textSubmitConfirmation,
                icon: SwalConfirmMessage.icon,
                buttons: [SwalConfirmMessage.btnNo, SwalConfirmMessage.btnYes],
                dangerMode: true,
            }).then((onConfirm) => {
                if (onConfirm) {
                    setLoading(true);
                    const request: AutoDistributionConfigurationRequest = {
                        autoDistributionSettingId: 0,
                        configurationName: configurationName,
                        selectedCurrency: selectedCurrency,
                        selectedCountry: selectedCountry,
                        selectedVipLevel: selectedVipLevel,
                        selectedRemAgents: selectedRemAgents
                    }
                    const saveConfigurationRequestObj = generateRequestModel(request);
                    upsertAutoDistributionConfiguration(saveConfigurationRequestObj);
                }
            });
        }
    }

    const validateAddConfigurationName = async (configurationNameAdd: string) => {
        if (configurationNameAdd === '' || selectedCurrency.length === 0 || selectedVipLevel.length === 0
            || selectedRemAgents.length === 0) {
            swal(SwalFailedMessage.title, message.requiredFields, SwalFailedMessage.icon);
            return false;
        }

        const isExisting = await isConfigurationNameExisting(0, configurationNameAdd);
        if (isExisting) {
            swal(SwalFailedMessage.title, ReMAutoDistributionConstants.SwalReMAutoDistributionMessage.textConfigurationNameExists, SwalFailedMessage.icon);
            return false;
        }

        return true;
    }

    const onAddHandleListBoxSearch = (items: DropdownOption[], query: string) => {
        query = query.toLowerCase();

        return items.filter(item =>
            item['desc'].toLowerCase().includes(query)
        );
    }

    const onCloseAddModal = () => {
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
            headerTitle="Add Auto Distribution Configuration"
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
                            onChange={(val: any) => setConfigurationName(val.target.value)}
                            value={configurationName}
                            maxLength={100}
                        />
                    </div>
                </div>
                <div className='col-lg-12 mt-6'>
                    <div className='separator separator-dashed my-3' />
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
                                value={selectedCurrency}
                                rowHeight={25}
                                //style={customStyles}
                                onSelect={({ item, sortedList }: { item: DropdownOption, sortedList: DropdownOption[] }) => {
                                    setSelectedCurrency(sortedList.map(i => i.value));
                                }}
                                onRemove={({ item }: { item: DropdownOption }) => {
                                    setSelectedCurrency([...selectedCurrency.filter(i => i !== item.value)]);
                                }}
                                onSelectAll={(selectedItems: DropdownOption[]) => {
                                    const selected = [
                                        ...selectedCurrency,
                                        ...selectedItems.map(item => item.value)
                                    ];
                                    setSelectedCurrency(selected);
                                }}
                                onRemoveAll={() => setSelectedCurrency([])}
                                onSort={({ sortedList }: { sortedList: DropdownOption[] }) =>
                                    setSelectedCurrency([...sortedList.map(i => i.value)])
                                }
                                onSearch={({ items, query }: { items: DropdownOption[], query: string }) => {
                                    const currencyOptionsList = onAddHandleListBoxSearch(items, query);
                                    return currencyOptionsList;
                                }}
                            />
                        </div>
                    </div>
                    <div className='col-lg-6'>
                        <RequiredLabel title={'VIP Level'} />
                        <div className='input-group multi-select-container' aria-disabled>
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
                                value={selectedVipLevel}
                                rowHeight={25}
                                onSelect={({ item, sortedList }: { item: DropdownOption, sortedList: DropdownOption[] }) => {
                                    setSelectedVipLevel(sortedList.map(i => i.value));
                                }}
                                onRemove={({ item }: { item: DropdownOption }) => {
                                    setSelectedVipLevel([...selectedVipLevel.filter(i => i !== item.value)]);
                                }}
                                onSelectAll={(selectedItems: DropdownOption[]) => {
                                    const selected = [
                                        ...selectedVipLevel,
                                        ...selectedItems.map(item => item.value)
                                    ];
                                    setSelectedVipLevel(selected);
                                }}
                                onRemoveAll={() => setSelectedVipLevel([])}
                                onSort={({ sortedList }: { sortedList: DropdownOption[] }) =>
                                    setSelectedVipLevel([...sortedList.map(i => i.value)])
                                }
                                onSearch={({ items, query }: { items: DropdownOption[], query: string }) => {
                                    const vipLevelOptionsList = onAddHandleListBoxSearch(items, query);
                                    return vipLevelOptionsList;
                                }}
                            />
                        </div>
                    </div>
                </div>
                <div className='row pt-10'>
                    <div className='col-lg-6'>
                        <label htmlFor='country-multiselect-add' className='col-form-label col-sm'>Country</label>
                        <div className='input-group multi-select-container'>
                            <MultiSelectListBox
                                id='country-multiselect-add'
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
                                value={selectedCountry}
                                rowHeight={25}
                                onSelect={({ item, sortedList }: { item: DropdownOption, sortedList: DropdownOption[] }) => {
                                    setSelectedCountry(sortedList.map(i => i.value));
                                }}
                                onRemove={({ item }: { item: DropdownOption }) => {
                                    setSelectedCountry([...selectedCountry.filter(i => i !== item.value)]);
                                }}
                                onSelectAll={(selectedItems: DropdownOption[]) => {
                                    const selected = [
                                        ...selectedCountry,
                                        ...selectedItems.map(item => item.value)
                                    ];
                                    setSelectedCountry(selected);
                                }}
                                onRemoveAll={() => setSelectedCountry([])}
                                onSort={({ sortedList }: { sortedList: DropdownOption[] }) =>
                                    setSelectedCountry([...sortedList.map(i => i.value)])
                                }
                                onSearch={({ items, query }: { items: DropdownOption[], query: string }) => {
                                    const countryOptionsList = onAddHandleListBoxSearch(items, query);
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
                                value={selectedRemAgents}
                                rowHeight={25}
                                onSelect={({ item, sortedList }: { item: DropdownOption, sortedList: DropdownOption[] }) => {
                                    setSelectedRemAgents(sortedList.map(i => i.value));
                                }}
                                onRemove={({ item }: { item: DropdownOption }) => {
                                    setSelectedRemAgents([...selectedRemAgents.filter(i => i !== item.value)]);
                                }}
                                onSelectAll={(selectedItems: DropdownOption[]) => {
                                    const selected = [
                                        ...selectedRemAgents,
                                        ...selectedItems.map(item => item.value)
                                    ];
                                    setSelectedRemAgents(selected);
                                }}
                                onRemoveAll={() => setSelectedRemAgents([])}
                                onSort={({ sortedList }: { sortedList: DropdownOption[] }) =>
                                    setSelectedRemAgents([...sortedList.map(i => i.value)])
                                }
                                onSearch={({ items, query }: { items: DropdownOption[], query: string }) => {
                                    const remAgentOptionsList = onAddHandleListBoxSearch(items, query);
                                    return remAgentOptionsList;
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
                    onClick={confirmSaveAutoDistributionConfiguration}
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
                        onCloseAddModal();
                    }}
                />
            </ModalFooter>
        </FormModal>
    );
};

export default AddAutoDistributionConfigModal;
