import 'bootstrap';
import "bootstrap/dist/css/bootstrap.min.css";
import {useFormik} from 'formik';
import {Guid} from "guid-typescript";
import $ from "jquery";
import React, {useEffect, useState} from 'react';
import {useHistory} from "react-router-dom";
import Select from 'react-select';
import swal from 'sweetalert';
import * as Yup from 'yup';
import '../../../../../_metronic/assets/sass/core/components/_transitions.scss';
import * as hubConnection from '../../../../../setup/hub/MessagingHub';
import * as InternetConnectionHandler from '../../../../../setup/internet-connection/InternetConnectionHandler';
import * as sessionHandler from '../../../../../setup/session/SessionHandler';
import {BrandModel} from '../../../system/models/BrandModel';
import {CurrencyModel} from '../../../system/models/CurrencyModel';
import {OperatorInfoModel} from '../../../system/models/OperatorInfoModel';
import {OperatorModel} from '../../../system/models/OperatorModel';
import {GetAllOperator, getOperatorDetails} from '../../../system/redux/SystemService';
import {USER_CLAIMS} from '../../../user-management/components/constants/UserClaims';
import {TeamIdRequestModel} from '../../models/TeamIdRequestModel';
import {TeamRequestModel} from '../../models/TeamRequestModel';
import {getRolesFilter, getTeamById, getTeamByIdInfo, updateTeam} from '../../redux/UserManagementService';


import {shallowEqual, useSelector} from 'react-redux';
import {RootState} from '../../../../../setup';
import {RestrictionFields} from '../../../../constants/Constants';
import useConstant from '../../../../constants/useConstant';
import {FooterContainer, PaddedContainer} from '../../../../custom-components';
import {RolesFilterModel} from '../../models/RolesFilterModel';
import {TeamDataAccessRestrictionModel} from '../../models/TeamDataAccessRestrictionModel';
import {TeamModel} from '../../models/TeamModel';
import {TeamRestrictionRequestModel} from '../../models/TeamRestrictionRequestModel';
import TeamDataAccessRestrictionGrid from './TeamDataAccessRestrictionGrid';

const teamScheema = Yup.object().shape({
    teamId: Yup.string(),
    teamName: Yup.string(),
    teamDescription: Yup.string(),
    teamStatus: Yup.number(),
    roles: Yup.array(),
    operatorDetail: Yup.array(),
    createdBy: Yup.number(),
    queueId: Yup.string(),
    userId: Yup.string(),
})


interface RoleOption {
    value: string
    label: string
}
interface OperatorOption {
    value: number
    label: string
}


const initialValues = {
    teamId: '',
    teamName: '',
    teamDescription: '',
    teamStatus: 0,
    roles: Array<RoleOption>(),
    operatorDetail: Array<OperatorModel>(),
    createdBy: 0,
    queueId: '',
    userId: ''
}

const CardHeaderStyles = {
    backgroundColor: '#F8F9F9',
};



const CardBodytyles = {
    backgroundColor: '#F7F7F7',
};

const enableSplashScreen = () => {
    const splashScreen = document.getElementById('splash-screen')
    if (splashScreen) {
        splashScreen.style.setProperty('display', 'flex')
        splashScreen.style.setProperty('opacity', '0.5')
    }
}

const disableSplashScreen = () => {
    const splashScreen = document.getElementById('splash-screen')
    if (splashScreen) {
        splashScreen.style.setProperty('display', 'none')
    }
}

const EditTeam: React.FC = () => {
    // Redux
    const userAccessId = useSelector<RootState>(({ auth }) => auth.userId, shallowEqual) as number
    const userAccess = useSelector<RootState>(({ auth }) => auth.access, shallowEqual) as string
    const expiresIn = useSelector<RootState>(({ auth }) => auth.expiresIn, shallowEqual) as string
    const history = useHistory();

    //  States
    const [teamIdDisplay, setteamIdDisplay] = useState('')
    const [loading, setLoading] = useState(false)
    const [operatorDetailList, setOperatorDetailList] = useState<Array<OperatorModel>>([])
    const [operatorList, setOperatorList] = useState<Array<OperatorOption>>([])
    const [roleList, setRoleList] = useState<Array<RoleOption>>([])

    const [selectedRoles, setSelectedRoles] = useState<Array<RoleOption>>([])
    const [selectedOperators, setSelectedOperators] = useState<Array<OperatorOption>>([])

    const [isLoaded, setLoaded] = useState(false)
    
    const [teamRestrictionDetails, setTeamRestrictionDetails]= useState<Array<TeamDataAccessRestrictionModel>>([]);

    const [editTeamRestrictionDetailsResponse, setEditTeamRestrictionDetailsResponse]= useState<Array<TeamRestrictionRequestModel>>([]);
    let existingOperators = Array<OperatorModel>();
    const {successResponse, HubConnected} = useConstant();


    // -----------------------------------------------------------------
    // FORMIK FORM POST
    // -----------------------------------------------------------------
    const formik = useFormik({
        initialValues,
        validationSchema: teamScheema,
        onSubmit: (values, { setStatus, setSubmitting, resetForm }) => {

            if (sessionHandler.isSessionExpired(expiresIn, history) === true) {
                return;
            }

            if (InternetConnectionHandler.isSlowConnection(history) === true) {
                return;
            }

            values.queueId = Guid.create().toString();
            values.userId = userAccessId.toString();
            values.roles = selectedRoles;
            values.operatorDetail = getBrandsValueByOperator(selectedOperators);
            console.log('values.operatorDetail')
            console.log(values.operatorDetail)
            values.createdBy = userAccessId

            setLoading(true)
            setTimeout(() => {
                let isValid: boolean = true;

                let hasBrand: boolean = false
                let hasCurrencies: boolean = false
                let hasBrandCurrencies: boolean = false;

                values.operatorDetail.forEach(operator => {
                    operator.brands.forEach(brand => {
                        if ((hasBrand === false && hasCurrencies == false) || (hasBrand === true && hasCurrencies == true)) {

                            hasBrand = brand.status === 1;
                            hasCurrencies = brand.currencies.filter(x => x.status === 1).length > 0

                            if (hasBrandCurrencies === false) {
                                if (hasBrand === true && hasCurrencies === true) {
                                    hasBrandCurrencies = true;
                                }
                            }
                            console.log(hasBrand)
                            console.log(hasCurrencies)
                            console.log(hasBrandCurrencies)

                        } else {

                            swal("Failed", "Unable to proceed, kindly fill up all mandatory fields", "error");
                            setLoading(false)
                            setSubmitting(false)
                            isValid = false;

                        }
                    })
                })


                if (isValid === true) {
                    if (values.teamName === '' || values.teamDescription === '' || values.teamStatus.toString() === "0" ||
                        values.roles.length === 0 || values.operatorDetail.length === 0 || hasBrandCurrencies === false) {
                        swal("Failed", "Unable to proceed, kindly fill up all mandatory fields", "error");
                        setLoading(false)
                        setSubmitting(false)
                        isValid = false;
                    }

                }

                if (isValid === true) {

                    swal({
                        title: "Confirmation",
                        text: "This action will update team record, please confirm",
                        icon: "warning",
                        buttons: ["No", "Yes"],
                        dangerMode: true
                    })
                        .then((willUpdate) => {
                            if (willUpdate) {
                                // resetForm({})
                                const messagingHub = hubConnection.createHubConnenction();
                                
                                messagingHub
                                    .start()
                                    .then(() => {

                                        if (messagingHub.state === HubConnected) {
                                            const request: TeamRequestModel = {
                                                teamId: parseInt(values.teamId),
                                                operatorDetail: values.operatorDetail,
                                                roles: values.roles,
                                                teamDescription: values.teamDescription,
                                                teamName: values.teamName,
                                                teamStatus: parseInt(values.teamStatus.toString()),
                                                CreatedBy: values.createdBy,
                                                UpdatedBy: 0,
                                                queueId: values.queueId,
                                                userId: values.userId,
                                                teamRestrictionDetail: mapEditTeamRestrictionDetailsToSave()
                                            }

                                            updateTeam(request)
                                                .then((response) => {

                                                    if (response.status === 200) {

                                                        messagingHub.on(request.queueId.toString(), message => {
                                                            let resultData = JSON.parse(message.remarks);

                                                            if (resultData.Status !== 200) {
                                                                swal("Failed", resultData.Message, "error");
                                                                setLoading(false)
                                                                setSubmitting(false)

                                                            } else {
                                                                swal("Successful!", "The data has been submitted", "success");

                                                            }

                                                            messagingHub.off(request.queueId.toString());
                                                            messagingHub.stop();
                                                            setSubmitting(false);
                                                            setLoading(false)

                                                        });

                                                        setTimeout(() => {  
                                                            if (messagingHub.state === 'Connected') {
                                                                messagingHub.stop();
                                                                setLoading(false)
                                                                setSubmitting(false)
                                                            }
                                                        }, 30000)

                                                    } else {
                                                        messagingHub.stop();
                                                        swal("Failed", response.data.message, "error");
                                                    }


                                                })
                                                .catch(() => {
                                                    messagingHub.stop();
                                                    swal("Failed", "Problem updating the team", "error");
                                                    setLoading(false)
                                                    setSubmitting(false)
                                                })
                                        } else {
                                            messagingHub.stop();
                                            swal("Failed", "Problem connecting to the server, Please refresh", "error");
                                        }
                                    })
                                    .catch(err => console.log('Error while starting connection: ' + err))
                            } else {
                                setLoading(false)
                                setSubmitting(false)
                            }
                        });
                }

                setLoading(false)
                setSubmitting(false)
            }, 1000)
        },
    })

    // -----------------------------------------------------------------
    // MOUNTED
    // -----------------------------------------------------------------
    useEffect(() => {
        const pathArray = window.location.pathname.split('/');
        let pageId: string = "";

        if (isLoaded === false) {

            if (InternetConnectionHandler.isSlowConnection(history) === true) {
                return;
            }
            enableSplashScreen()

            setTimeout(() => {
                const messagingHub = hubConnection.createHubConnenction();
                messagingHub
                    .start()
                    .then(() => {
                        if (messagingHub.state === 'Connected') {
                            getRolesFilter().then((response) => {

                                if (response.status === 200) {
                                    let roleTempList = Array<RoleOption>();
                                    console.log('roles')
                                    let roleListData = Object.assign(new Array<RolesFilterModel>(), response.data);
                                    roleListData.forEach(role => {
                                        const roleOption: RoleOption = {
                                            value: role.roleId.toString(),
                                            label: role.roleName,
                                        };
                                        roleTempList.push(roleOption)
                                    })

                                    setRoleList(roleTempList.filter(
                                        (thing, i, arr) => arr.findIndex(t => t.value === thing.value) === i
                                    ));
                                    console.log('roleTempList')
                                    console.log(roleTempList)
                                    disableSplashScreen()
                                }
                                else {
                                    disableSplashScreen()
                                    swal("Failed", "Problem in getting role list", "error");
                                }

                            }).catch(() => {
                                disableSplashScreen()

                                swal("Failed", "Problem in getting role list", "error");
                            })

                            //Getting Operator
                            GetAllOperator().then((response) => {
                                if (response.status === successResponse) {
                                    let allOperatorsResult = Object.assign(new Array<OperatorInfoModel>(), response.data);
                                    let operatorTempOptionList = Array<OperatorOption>();

                                    allOperatorsResult.forEach(item => {
                                        const operatorOption: OperatorOption = {
                                            value: item.operatorId,
                                            label: item.operatorName,
                                        };
                                        operatorTempOptionList.push(operatorOption)
                                    })
                                    setOperatorList(operatorTempOptionList.filter(
                                        (thing, i, arr) => arr.findIndex(t => t.value === thing.value) === i
                                    ));


                                    if (operatorTempOptionList.length > 0) {
                                        let opertorIds = operatorTempOptionList.map(el => el.value).join(',')
                                        getOperatorDetails(opertorIds).then((response) => {
                                            let operatorDetails = Object.assign(new Array<OperatorModel>(), response.data);
                                            console.log('operatorDetails')
                                            console.log(operatorDetails)
                                            operatorDetails.forEach(operator => {
                                                existingOperators.push(operator);
                                                operator.brands.forEach(brand => {
                                                    brand.status = 0
                                                    brand.currencies.forEach(currency => {
                                                        currency.status = 0
                                                    });
                                                })
                                            })

                                            setOperatorDetailList(operatorDetails);

                                            if (pathArray.length >= 4) {
                                                pageId = pathArray[3];


                                                const request: TeamIdRequestModel = {
                                                    queueId: Guid.create().toString(),
                                                    userId: userAccessId.toString(),
                                                    teamId: parseInt(pageId)
                                                };

                                                getTeamById(request).then((response) => {

                                                    if (response.data.status === 200) {

                                                        messagingHub.on(request.queueId.toString(), message => {
                                                            getTeamByIdInfo(message.cacheId)
                                                                .then((data) => {
                                                                    let resultDataEditTeam = Object.assign({} as TeamModel, data.data);
                                                                    setEditTeamRestrictionDetailsResponse(resultDataEditTeam.teamRestrictionDetails);    
                                                                    if (resultDataEditTeam) {
                                                                        setteamIdDisplay(resultDataEditTeam.id)

                                                                        let operatorSelectedItem = Array<OperatorOption>();

                                                                        resultDataEditTeam.operators.forEach(item => {
                                                                            const operatorOption: OperatorOption = {
                                                                                value: item.operatorId,
                                                                                label: item.operatorName,
                                                                            };
                                                                            operatorSelectedItem.push(operatorOption)
                                                                        })
                                                                        let roleSelectedItem = Array<RoleOption>();

                                                                        resultDataEditTeam.roles.forEach(item => {
                                                                            const roleOption: RoleOption = {
                                                                                value: item.roleId.toString(),
                                                                                label: item.roleName,
                                                                            };
                                                                            roleSelectedItem.push(roleOption)

                                                                        })

                                                                        initialValues.teamId = resultDataEditTeam.id;
                                                                        initialValues.teamName = resultDataEditTeam.name;
                                                                        initialValues.teamDescription = resultDataEditTeam.description;
                                                                        initialValues.teamStatus = resultDataEditTeam.status;
                                                                        initialValues.createdBy = parseInt(resultDataEditTeam.createdBy);

                                                                        formik.setFieldValue('teamId', initialValues.teamId);
                                                                        formik.setFieldValue('roleName', initialValues.teamName);
                                                                        formik.setFieldValue('teamDescription', initialValues.teamDescription);
                                                                        formik.setFieldValue('teamStatus', initialValues.teamStatus);
                                                                        formik.setFieldValue('createdBy', initialValues.createdBy);
                                                                        formik.setFieldValue('teamName', initialValues.teamName);

                                                                        setSelectedOperators(operatorSelectedItem);
                                                                        onChangeSelectedRoles(roleSelectedItem);
                                                                        BuildOperatorElements(operatorSelectedItem, operatorDetails);
                                                                        operatorDetails.forEach(operator => {

                                                                            let operatorItem = resultDataEditTeam.operators.find(x => x.operatorId === operator.operatorId);
                                                                            if (operatorItem != null) {
                                                                                existingOperators.push(operator);
                                                                                operator.brands.forEach(brand => {
                                                                                    let elementId = '#' + operator.operatorName.replace(/ /g, "") + "-" + brand.name.replace(/ /g, "") + "-All";
                                                                                    $(elementId).on('click', (event: Event) => { allCurrencySelectedPerBrand(event) });

                                                                                    let brandCheckId = operator.operatorName.replace(/ /g, "") + "-" + brand.name.replace(/ /g, "");
                                                                                    let checkboxBrand = document.getElementById(brandCheckId) as HTMLInputElement;
                                                                                    let brandStatus = resultDataEditTeam.brands.find(x => x.brandId === brand.id && x.teamOperatorId === operator.operatorId)?.brandStatus
                                                                                    checkboxBrand.checked = brandStatus === 1;

                                                                                    brand.currencies.forEach(currency => {
                                                                                        let currencyElementId = operator.operatorName.replace(/ /g, "") + "-" + brand.name.replace(/ /g, "") + "-" + currency.name.replace(/ /g, "");
                                                                                        let inputCheckBoxValue = document.getElementById(currencyElementId) as HTMLInputElement;
                                                                                        let currencyStatus = resultDataEditTeam.currencies.find(x => x.currencyId === currency.id && x.brandId === brand.id)?.currencyStatus
                                                                                        inputCheckBoxValue.checked = currencyStatus === 1;

                                                                                    });
                                                                                })
                                                                            }
                                                                        })
                                                                    }

                                                                })
                                                                .catch((ex) => {
                                                                    disableSplashScreen()
                                                                    console.log(ex)
                                                                })
                                                            disableSplashScreen()
                                                            messagingHub.off(request.queueId.toString());
                                                            messagingHub.stop()
                                                        });

                                                    } else {
                                                        disableSplashScreen()
                                                        swal("Failed", response.data.message, "error");
                                                    }

                                                })
                                                    .catch((ex) => {
                                                        disableSplashScreen()
                                                        console.log('problem in getting team info' + ex)
                                                    });
                                            }
                                        })
                                            .catch(() => {
                                                disableSplashScreen()
                                                console.log("Problem in getting operator details list")
                                            })
                                    }
                                }
                                else {
                                    disableSplashScreen()
                                    console.log("Problem in getting operator details list")
                                }

                            })
                                .catch(() => {
                                    disableSplashScreen()
                                    console.log("Problem in getting operator details list")
                                })


                        }
                        else {
                            disableSplashScreen()
                            swal("Failed", "Problem connecting to the server, Please refresh", "error");
                        }

                    })
                    .catch(err => {
                        disableSplashScreen()
                        console.log('Error while starting connection: ' + err)
                    })
            }, 1000);
            setLoaded(true)
        }

    });

    // -----------------------------------------------------------------
    // METHODS
    // -----------------------------------------------------------------

    function getBrandsValueByOperator(optionSelected: Array<OperatorOption>): Array<OperatorModel> {

        let tempOperatorList = JSON.parse(JSON.stringify(operatorDetailList)) as Array<OperatorModel>
        let resultOperatorList = Array<OperatorModel>();
        tempOperatorList.forEach(operator => {
            if (optionSelected.find(x => x.value === operator.operatorId)) {
                operator.brands.forEach(brand => {
                    let elementId = operator.operatorName.replace(/ /g, "") + "-" + brand.name.replace(/ /g, "");
                    let inputValue = document.getElementById(elementId) as HTMLInputElement;
                    if (inputValue) {
                        brand.status = inputValue.checked === true ? 1 : 2;

                        brand.currencies.forEach(currency => {
                            let currencyElementId = operator.operatorName.replace(/ /g, "") + "-" + brand.name.replace(/ /g, "") + "-" + currency.name.replace(/ /g, "");
                            let inputCheckBoxValue = document.getElementById(currencyElementId) as HTMLInputElement;
                            if (inputCheckBoxValue) {
                                currency.status = inputCheckBoxValue.checked === true ? 1 : 2;
                            }
                        })
                    }
                })
                if (!resultOperatorList.find(x => x.operatorId === operator.operatorId)) {
                    resultOperatorList.push(operator)
                }

            }
        })
        return resultOperatorList;
    }

    function onChangeSelectedRoles(val: Array<RoleOption>) {
        setSelectedRoles(val);

    }

    function onChangeSelectedOperators(_val: Array<OperatorOption>) {
        setSelectedOperators(_val);
        let _existingExistingSelection = getBrandsValueByOperator(_val);
        BuildOperatorElements(_val, operatorDetailList);

        operatorDetailList.forEach(_operator => {
            existingOperators.push(_operator)
            _operator.brands.forEach(_operatorBrand => {
                let elementId = '#' + _operator.operatorName.replace(/ /g, "") + "-" + _operatorBrand.name.replace(/ /g, "") + "-All";
                $(elementId).on('click', (event: Event) => { allCurrencySelectedPerBrand(event) });

            })
        })

        _existingExistingSelection.forEach(_existingOperator => {
            existingOperators.push(_existingOperator)
            _existingOperator.brands.forEach(_operatorBrand => {
                let brandCheckId = _existingOperator.operatorName.replace(/ /g, "") + "-" + _operatorBrand.name.replace(/ /g, "");
                let checkboxBrand = document.getElementById(brandCheckId) as HTMLInputElement;
                checkboxBrand.checked = _operatorBrand.status === 1;

                _operatorBrand.currencies.forEach(currency => {
                    let currencyElementId = _existingOperator.operatorName.replace(/ /g, "") + "-" + _operatorBrand.name.replace(/ /g, "") + "-" + currency.name.replace(/ /g, "");
                    let inputCheckBoxValue = document.getElementById(currencyElementId) as HTMLInputElement;
                    inputCheckBoxValue.checked = currency.status === 1 ;
                });

            })
        })

    }

    // -----------------------------------------------------------------
    // COMPONENTS
    // -----------------------------------------------------------------
    function BuildOperatorElements(selectedOptions: Array<OperatorOption>, detailList: Array<OperatorModel>) {

        const container = document.getElementById('tblAccordion');

        if (container) {
            container.innerHTML = '';
        }

        let lisOfSelectedOperators = Array<OperatorModel>();
        lisOfSelectedOperators = [];
        for (let i = 0; i < selectedOptions.length; i++) {
            let item: any = selectedOptions[i];

            let selectedOperators = detailList.filter(
                (thing, i, arr) => arr.findIndex(t => t.operatorId === item.value) === i
            )
            lisOfSelectedOperators = selectedOperators.filter(
                (thing, i, arr) => arr.findIndex(t => t.operatorId === thing.operatorId) === i
            )

            lisOfSelectedOperators.forEach(element => {

                let nameId = element.operatorName.replace(/ /g, "")
                const content = `
                <div class="accordion-item">
                    <h2 class="accordion-header" id="headingOne" style={CardHeaderStyles}>
                        <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#` + nameId + `" aria-expanded="false" aria-controls="collapseOne"> 
                            ${element.operatorName}
                        </button>
                    </h2>
                    <div id="` + nameId + `" class="accordion-collapse collapse show" aria-labelledby="headingOne" data-bs-parent="#accordionExample">
                        <div class="accordion-body" style={CardBodytyles}> ` +
                    BuilBrandsElements(element.brands, nameId)
                    + `</div>
                    </div>
                </div>`;

                if (container) {
                    container.innerHTML += content;
                }
            });
        }

    }

    function BuilBrandsElements(items: Array<BrandModel>, operatorName: string): string {
        let brandElement: string = '';
        let checkBoxId: string = operatorName;

        items.forEach(brand => {
            let isChecked: string = '';
            if (brand.status === 1) {
                isChecked = 'Checked';
            }
            const content = `<div class='card card-custom'>
                <div class='card-header cursor-pointer' role='button'>
                    <div class='card-title m-0'>
                    <div class="form-check mb-3">
                       <input class="form-check-input" type="checkbox" id="`+ checkBoxId + "-" + brand.name.replace(/ /g, "") + `" value="" ` + isChecked + `/>
                   </div>
                        <h6 class='m-0'>${brand.name}</h6>
                    </div>
                </div>
                <div class='card-body'>` +
                BuilCurrenciesElements(brand.currencies, operatorName, brand.name.replace(/ /g, ""))
                + `</div>
            </div>`;

            brandElement += content;
        });

        return brandElement;
    }
    const getStateEditTeamRestriction = (val : Array<TeamDataAccessRestrictionModel>) =>{
        setTeamRestrictionDetails(val);
    }
    function BuilCurrenciesElements(items: Array<CurrencyModel>, operator: string, brand: string): string {
        let currencyElement: string = '';
        let checkBoxId: string = operator + '-' + brand;

        currencyElement = `  
        <div class="form-check mb-3">
            <input class="form-check-input" type="checkbox" value="" id="`+ checkBoxId + '-All' + `"/>
            <label class="form-check-label">All</label>
        </div>`

        items.forEach(currency => {
            let isChecked: string = '';
            if (currency.status === 1) {
                isChecked = 'Checked';
            }

            const content = `        
                    <div class="form-check mb-3">
                        <input class="form-check-input" type="checkbox" id="`+ checkBoxId + "-" + currency.name.replace(/ /g, "") + `" value="" ` + isChecked + `/>
                        <label class="form-check-label">
                            ${currency.name}
                        </label>
                    </div>`;
            currencyElement += content;
        });

        return currencyElement;
    }

    function allCurrencySelectedPerBrand(evenButton: Event) {
        let eventInfo = evenButton.target as HTMLInputElement;
        let buffer: any = eventInfo.id.split('-')
        let operatorEventName: string = buffer[0]
        let brandEventName: string = buffer[1]

        let tempOperatorList = JSON.parse(JSON.stringify(existingOperators)) as Array<OperatorModel>
        let resultOperatorList = Array<OperatorModel>();

        tempOperatorList.forEach(operator => {
            operator.brands.forEach(brand => {
                let elementId = operator.operatorName.replace(/ /g, "") + "-" + brand.name.replace(/ /g, "");
                let inputValue = document.getElementById(elementId) as HTMLInputElement;
                if (inputValue) {
                    brand.status = inputValue.checked === true ? 1 : 2;

                    brand.currencies.forEach(currency => {
                        let currencyElementId = operator.operatorName.replace(/ /g, "") + "-" + brand.name.replace(/ /g, "") + "-" + currency.name.replace(/ /g, "");
                        let inputCheckBoxValue = document.getElementById(currencyElementId) as HTMLInputElement;
                        if (inputCheckBoxValue) {
                            if (operatorEventName === operator.operatorName.replace(/ /g, "") && brand.name.replace(/ /g, "") === brandEventName) {
                                currency.status = eventInfo.checked === true ? 1 : 2;
                                inputCheckBoxValue.checked = currency.status === 1
                            }
                            else {
                                currency.status = inputCheckBoxValue.checked === true ? 1 : 2;
                            }
                        }
                    })
                }
            })
            resultOperatorList.push(operator)
        })
        setOperatorDetailList(resultOperatorList);
    }

    const mapEditTeamRestrictionDetailsToSave = () => {
        const teamRestrictionRequestList: Array<TeamRestrictionRequestModel> = [];
        teamRestrictionDetails.forEach((teamRestriction) => {
          teamRestriction.brands.forEach((brand) => {
            teamRestrictionRequestList.push(createTeamRestrictionRequest(teamRestriction, brand, RestrictionFields.Brand));
          });
      
          teamRestriction.countries.forEach((country) => {
            teamRestrictionRequestList.push(createTeamRestrictionRequest(teamRestriction, country, RestrictionFields.Country));
          });
      
          teamRestriction.vipLevels.forEach((vipLevel) => {
            teamRestrictionRequestList.push(createTeamRestrictionRequest(teamRestriction, vipLevel, RestrictionFields.VipLevel));
          });
      
          teamRestriction.currencies.forEach((currency) => {
            teamRestrictionRequestList.push(createTeamRestrictionRequest(teamRestriction, currency, RestrictionFields.Currency));
          });
        });
      
        return teamRestrictionRequestList;
      };
      
      const createTeamRestrictionRequest = (teamRestriction: any, value: any, fieldId: number) => {
        return {
          operatorId: Number(teamRestriction.operatorId),
          teamId: Number(initialValues.teamId),
          accessRestrictionFieldId: fieldId,
          accessRestrictionFieldValue: Number(value.value)
        };
      };
      
    // -----------------------------------------------------------------
    // RETURN ELEMENTS
    // -----------------------------------------------------------------
    return (
        <form
            className='form w-100'
            onSubmit={formik.handleSubmit}
            noValidate
        >
            <div className='card card-custom'>
                <div
                    className='card-header cursor-pointer'
                    role='button'
                    data-bs-toggle='collapse'
                    data-bs-target='#kt_account_deactivate'
                    aria-expanded='true'
                    aria-controls='kt_account_deactivate'
                >
                    <div className='card-title m-0'>
                        <h5 className='fw-bolder m-0'>Edit Team</h5>
                    </div>
                </div>
                <div className='card-body p-9'>
                    <div className='d-flex align-items-center my-2'>
                        <div className="row mb-3">
                            <div className="row mb-3">
                                <div className="col-sm-2">
                                    <label className="form-label-lg fw-bold ">Team Id: </label>
                                </div>
                                <div className="col-sm-6">
                                    <label className="form-label-lg fw-bold ">{teamIdDisplay}</label>
                                </div>
                            </div>
                            <br />

                            <div className="row mb-3">
                                <div className="col-sm-2">
                                    <span className="form-label-sm required">Team Name</span>
                                </div>
                                <div className="col-sm-6">
                                    <input type="text" className="form-control form-control-sm" aria-label="Team Name"
                                        {...formik.getFieldProps('teamName')}
                                    />
                                </div>
                            </div>
                            <div className="row mb-3">
                                <div className="col-sm-2">
                                    <span className="form-label-sm required">Team Description</span>
                                </div>
                                <div className="col-sm-6">
                                    <input type="text" className="form-control form-control-sm" aria-label="Team Description"
                                        {...formik.getFieldProps('teamDescription')}
                                    />
                                </div>
                            </div>
                            <div className="row mb-3">
                                <div className="col-sm-2">
                                    <span className="form-label-sm required">Team Status</span>
                                </div>
                                <div className="col-sm-6">
                                    <select className="form-select form-select-sm" aria-label="Select status"
                                        {...formik.getFieldProps('teamStatus')}
                                    >
                                        <option value="0">Select</option>
                                        <option value="1">Active</option>
                                        <option value="2">Inactive</option>
                                    </select>
                                </div>
                            </div>
                            <div className="row mb-3">
                                <div className="col-sm-2">
                                    <span className="form-label-sm required">Role Name</span>
                                </div>
                                <div className="col-sm-6">
                                    <Select
                                        {...formik.getFieldProps('roles')}
                                        isMulti
                                        options={roleList}
                                        onChange={onChangeSelectedRoles}
                                        value={selectedRoles}
                                    />
                                </div>
                            </div>

                            <div className="row mb-3">
                                <div className="col-sm-2">
                                    <span className="form-label-lg fw-bold ">Created By: </span>
                                </div>
                                <div className="col-sm-6">
                                    <input type="text" className="form-control form-control-sm" disabled aria-label="Email"
                                        {...formik.getFieldProps('createdBy')}
                                    />
                                </div>
                            </div>

                            <TeamDataAccessRestrictionGrid teamId={Number(initialValues.teamId)} teamRestrictionDetailsResponse = {editTeamRestrictionDetailsResponse} stateTeamRestriction = {getStateEditTeamRestriction} operatorList= {operatorList}  />

                            <div className="separator border-4 my-10" />
                            <h6 className='fw-bolder m-0'>Operator Detail</h6>
                            <br />
                            <br />

                            <div className="row mb-3">
                                <div className="col-sm-2">
                                    <span className="form-label-sm required">Operator Name</span>
                                </div>
                                <div className="col-sm-6">
                                    <Select
                                        isMulti
                                        options={operatorList}
                                        onChange={onChangeSelectedOperators}
                                        value={selectedOperators}
                                    />
                                </div>
                            </div>

                            <div className="accordion" id="tblAccordion">

                            </div>

                            
                        </div>
                    </div>
                </div>
             <FooterContainer>
                <PaddedContainer>
                    {(userAccess.includes(USER_CLAIMS.TeamsWrite) === true) && (
                        <button type='submit' className="btn btn-primary btn-sm me-2" disabled={formik.isSubmitting}>
                            {!loading && <span className='indicator-label'>Submit</span>}
                            {loading && (
                                <span className='indicator-progress' style={{ display: 'block' }}>
                                    Please wait...
                                    <span className='spinner-border spinner-border-sm align-middle ms-2'></span>
                                </span>
                            )}
                        </button>
                    )}
                </PaddedContainer>
            </FooterContainer>
            </div >

        </form >
    )
}
export default EditTeam;