import {useEffect, useState} from "react";
import {Col, ModalFooter, Row} from "react-bootstrap-v5";
import Select from 'react-select';
import swal from 'sweetalert';
import {OptionListModel} from "../../../../common/model";
import {LookupModel} from '../../../../common/model/LookupModel';
import {ElementStyle} from "../../../../constants/Constants";
import {FormModal, MainContainer, MlabButton, RequiredLabel} from "../../../../custom-components";
import CommonLookups from "../../../../custom-functions/CommonLookups";
import {useSystemOptionHooks} from "../../../system/shared";
import {TeamDataAccessRestrictionModel} from "../../models/TeamDataAccessRestrictionModel";



interface Props {
    showForm: boolean;
    setModalShow?: (e: boolean) => void;
    isAdd: boolean | null;
    submitAdd: (e: TeamDataAccessRestrictionModel) => void
    teamDataAccess?: Array<TeamDataAccessRestrictionModel>
    closeModal: () => void;
    selectedOperatorToEdit?: TeamDataAccessRestrictionModel,
    operatorOptions: Array<OptionListModel>
}

const CreateTeamRestriction: React.FC<Props> = ({ showForm, isAdd, submitAdd, closeModal, teamDataAccess, selectedOperatorToEdit, operatorOptions }) => {
    const allCountryList = CommonLookups('countries').filter(_ => _.label !== null);
    const [headerTitle, setHeaderTitle] = useState<string>('');
    const [countryList, setCountryList] = useState<Array<LookupModel>>(allCountryList);
    const [selectedCountries, setSelectedCountries] = useState<Array<LookupModel>>([]);
    const [selectedVipLevel, setSelectedVipLevel] = useState<Array<LookupModel>>([]);
    const [selectedOperator, setSelectedOperator] = useState<LookupModel>();
    const [selectedBrands, setSelectedBrands] = useState<Array<LookupModel>>([]);
    const [selectedCurrencies, setSelectedCurrencies] = useState<Array<LookupModel>>([]);
    const [selectedOperators, setSelectedOperators] = useState<Array<any>>([]);
    const {getBrandOptions, brandOptionList,getCurrencyOptions,currencyOptionList } = useSystemOptionHooks();

    const allVipLevelList = CommonLookups('vipLevels');
    const [vipLevelList, setVipLevelList] = useState<Array<LookupModel>>(allVipLevelList);


    useEffect(() => {
        clearValues();
        getBrandOptions();
        getCurrencyOptions();
        if (isAdd) {
            setHeaderTitle("Add Data Access Restriction");
            setCountryList(allCountryList);
            setVipLevelList(allVipLevelList);
        } else if (isAdd === false) {
            setHeaderTitle("Edit Data Access Restriction")
            loadTeamAccessRestriction();
        }
    }, [showForm]);
    const clearValues = () => {
        setSelectedCountries([]);
        setSelectedVipLevel([]);
        setSelectedOperator(undefined);
        setSelectedBrands([]);
        setSelectedCurrencies([])
    }
    const loadTeamAccessRestriction = () => {
        let _selectedAccessRestriction = teamDataAccess?.find(_ => _.operatorId === selectedOperatorToEdit?.operatorId);
        let _operator: LookupModel = {
            label: _selectedAccessRestriction?.operatorName ?? "",
            value: _selectedAccessRestriction?.operatorId ?? ""
        };
        setSelectedOperator(_operator);
        setSelectedBrands(_selectedAccessRestriction?.brands ?? []);
        setSelectedCountries(_selectedAccessRestriction?.countries ?? []);
        setSelectedVipLevel(_selectedAccessRestriction?.vipLevels ?? []);
        setSelectedCurrencies(_selectedAccessRestriction?.currencies ?? []);
        const filteredCountries = allCountryList.filter((country) => !_selectedAccessRestriction?.countries.some((selected) => selected.value?.toString() === country.value.toString()));
        const filteredVipLevel = allVipLevelList.filter((country) => !_selectedAccessRestriction?.vipLevels.some((selected) => selected.value?.toString() === country.value.toString()));
        setCountryList(filteredCountries);
        setVipLevelList(filteredVipLevel)
    }
    const onChangeBrand = (val: Array<LookupModel>) => {
        setSelectedBrands(val);
    }
    const onChangeCurrency = (val: Array<LookupModel>) => {
        setSelectedCurrencies(val);
    }
    const onChangeVipLevel = (val: Array<LookupModel>) => {
        setSelectedVipLevel(val);
    }
    const onChangeCountry = (val: Array<LookupModel>) => {
        setSelectedCountries(val);
    }
    const onChangeOperator = (val: any) => {
        setSelectedOperator(val);
    }
    function isEmpty(value :any) {
        return value === undefined || value === null || value.length === 0;
    }
    const addRestriction = () => {
        if (isEmpty(selectedBrands) || isEmpty(selectedCurrencies) || isEmpty(selectedOperator)) {
            swal('Failed', 'Unable to proceed, kindly fill up all mandatory fields', 'error');
            return;
        }
        const teamRestrictionDetails: TeamDataAccessRestrictionModel = {
            teamRestrictionId: selectedOperatorToEdit?.teamRestrictionId ?? "",
            operatorId: selectedOperator?.value,
            operatorName: selectedOperator?.label,
            currencies: selectedCurrencies,
            brands: selectedBrands,
            vipLevels: selectedVipLevel,
            countries: selectedCountries
        };
        setSelectedOperators([...selectedOperators, (selectedOperator?.value)]);
        submitAdd(teamRestrictionDetails);
        clearValues();

    }
    const close = () => {
        swal({
            title: 'Confirmation',
            text: 'This action will discard any changes made, please confirm',
            icon: 'warning',
            buttons: ['No', 'Yes'],
            dangerMode: true,
        })
            .then((willUpdate) => {
                if (willUpdate) {
                    clearValues();
                    closeModal();
                }
            })
            .catch(() => { });
    };
    const onHideModal = () => { return; } //Error sa Hide Modal ito placeholder lang.
    return (
        <FormModal headerTitle={headerTitle} onHide={onHideModal} haveFooter={false} show={showForm} customSize={'md'}>
            <MainContainer>
                <div style={{ marginBottom: 20, paddingLeft: 9, paddingRight:9 }}>
                    <Row>
                        <Col sm="12">
                            <RequiredLabel title={'Operator'} />
                            <Select
                                isClearable={true}
                                size='small'
                                style={{ width: '100%' }}
                                options={operatorOptions}
                                value={selectedOperator}
                                isLoading={false}
                                onChange={onChangeOperator}

                            />
                        </Col>
                    </Row>
                    <Row>
                        <Col sm="12">
                            <RequiredLabel title={'Brand'} />
                            <Select
                                isMulti
                                size='small'
                                style={{ width: '100%' }}
                                options={brandOptionList}
                                onChange={onChangeBrand}
                                value={selectedBrands}
                                isLoading={false}
                            />
                        </Col>
                    </Row>
                    <Row>
                        <Col sm="12">
                            <RequiredLabel title={'Currency'} />
                            <Select
                                isMulti
                                size='small'
                                style={{ width: '100%' }}
                                options={currencyOptionList}
                                onChange={onChangeCurrency}
                                value={selectedCurrencies}
                                isLoading={false}
                            />
                        </Col>
                    </Row>
                    <Row>
                        <Col sm="12">
                            <label className='col-form-label col-sm'>VIP Level</label>
                            <Select
                                isMulti
                                size='small'
                                style={{ width: '100%' }}
                                options={vipLevelList}
                                onChange={onChangeVipLevel}
                                value={selectedVipLevel}
                                isLoading={false}
                            />
                        </Col>
                    </Row>
                    <Row>
                        <Col sm="12">
                            <label className='col-form-label col-sm'>Country</label>
                            <Select
                                isMulti
                                size='small'
                                style={{ width: '100%' }}
                                options={countryList.filter((_) => _.value !== null).map((_) => _)}
                                onChange={onChangeCountry}
                                value={selectedCountries}
                                isLoading={false}
                            />
                        </Col>
                    </Row>
                </div>
            </MainContainer>
            <ModalFooter style={{ border: 0, padding: 0, marginTop: 5, marginBottom: 5}}>
                <MlabButton
                    access={true}
                    size={'sm'}
                    label={'Submit'}
                    style={ElementStyle.primary}
                    type={'button'}
                    weight={'solid'}
                    loading={false}
                    disabled={false}
                    loadingTitle={' Please wait...'}
                    onClick={addRestriction}
                />
                <MlabButton
                    access={true}
                    size={'sm'}
                    label={'Close'}
                    style={ElementStyle.secondary}
                    type={'button'}
                    weight={'solid'}
                    loading={false}
                    disabled={false}
                    loadingTitle={' Please wait...'}
                    onClick={close}
                />
            </ModalFooter>
        </FormModal>
    );
};

export default CreateTeamRestriction;
