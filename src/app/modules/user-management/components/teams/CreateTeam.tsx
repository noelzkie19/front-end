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
import {TeamIdRequestModel} from '../../models/TeamIdRequestModel';
import {TeamRequestModel} from '../../models/TeamRequestModel';
import {addTeam, getRolesFilter, getTeamById, getTeamByIdInfo} from '../../redux/UserManagementService';

import {shallowEqual, useSelector} from 'react-redux';
import {RootState} from '../../../../../setup';
import {RolesFilterModel} from '../../models/RolesFilterModel';

import {RestrictionFields} from '../../../../constants/Constants';
import useConstant from '../../../../constants/useConstant';
import {FooterContainer, PaddedContainer} from '../../../../custom-components';
import {TeamDataAccessRestrictionModel} from '../../models/TeamDataAccessRestrictionModel';
import {TeamModel} from '../../models/TeamModel';
import {TeamRestrictionRequestModel} from '../../models/TeamRestrictionRequestModel';
import TeamDataAccessRestrictionGrid from './TeamDataAccessRestrictionGrid';

const CreateTeamInitialValues = {
    teamName: '',
    teamDescription: '',
    teamStatus: 0,
    roles: Array<RoleOption>(),
    operatorDetail: Array<OperatorModel>(),
    createdBy: 0,
    queueId: '',
    userId: ''
}

const CardHeaderStyles1 = {
    backgroundColor: '#F8F9F9',
};

interface RoleOption {
    value: string
    label: string
}

const CardBodytyles1 = {
    backgroundColor: '#F7F7F7',
};

const createTeamEnableSplashScreen = () => {
    const splashScreen = document.getElementById('splash-screen')
    if (splashScreen) {
        splashScreen.style.setProperty('display', 'flex')
        splashScreen.style.setProperty('opacity', '0.5')
    }
}

const createTEamDisableSplashScreen = () => {
    const splashScreen = document.getElementById('splash-screen')
    if (splashScreen) {
        splashScreen.style.setProperty('display', 'none')
    }
}

const CreateTeamScheema = Yup.object().shape({
    teamName: Yup.string(),
    teamDescription: Yup.string(),
    teamStatus: Yup.number(),
    roles: Yup.array(),
    operatorDetail: Yup.array(),
    createdBy: Yup.number(),
    queueId: Yup.string(),
    userId: Yup.string(),
})

interface OperatorOptionList {
    value: number
    label: string
}

const CreateTeam: React.FC = () => {
    const {HubConnected, successResponse} = useConstant();

    const userAccessId = useSelector<RootState>(({ auth }) => auth.userId, shallowEqual) as number
    const expiresIn = useSelector<RootState>(({ auth }) => auth.expiresIn, shallowEqual) as string
    const history = useHistory();
    const [loading, setLoading] = useState(false)
    const [operatorDetailList, setOperatorDetailList] = useState<Array<OperatorModel>>([])
    const [operatorList, setOperatorList] = useState<Array<OperatorOptionList>>([])
    const [roleList, setRoleList] = useState<Array<RoleOption>>([])

    const [selectedRoles, setSelectedRoles] = useState<Array<RoleOption>>([])
    const [selectedOperators, setSelectedOperators] = useState<Array<OperatorOptionList>>([])
    const [isLoaded, setLoaded] = useState(false);
    let existingOperators = Array<OperatorModel>();
    const [teamRestrictionDetails, setTeamRestrictionDetails]= useState<Array<TeamDataAccessRestrictionModel>>([]);
    const [teamRestrictionDetailsResponse, setTeamRestrictionDetailsResponse]= useState<Array<TeamRestrictionRequestModel>>([]);
   
    const formik = useFormik({
        initialValues: CreateTeamInitialValues,
        validationSchema: CreateTeamScheema,
        onSubmit: (values, { setStatus, setSubmitting, resetForm }) => {
            if(!checkInternetConnection()){
                return;
            }
            values.userId = userAccessId.toString();
            values.roles = selectedRoles;
            values.createdBy = userAccessId
            values.queueId = Guid.create().toString();
            values.operatorDetail = getBrandsValueByOperator(selectedOperators);

            setLoading(true)
            setSubmitting(true)
            setTimeout(() => {

                let isValidToCreate: boolean = true;
                let hasBrandSelected: boolean = false
                let hasCurrenciesSelected: boolean = false
                let hasBrandCurrenciesSelected: boolean = false;
                values.operatorDetail.forEach(operator => {
                    operator.brands.forEach(brand => {
                        hasBrandSelected = brand.status === 1;
                        hasCurrenciesSelected = brand.currencies.filter(x => x.status === 1).length > 0;
                        if (!hasBrandSelected && !hasCurrenciesSelected) return;
                        if ( hasBrandSelected && brand.currencies.length === 0) {
                            hasBrandCurrenciesSelected = true 
                            return;
                        }
                        if ((hasBrandSelected && !hasCurrenciesSelected) || (!hasBrandSelected && hasCurrenciesSelected)) {
                          swal("Failed", "Unable to proceed, kindly fill up all mandatory fields", "error");
                          setLoading(false);
                          setSubmitting(false);
                          isValidToCreate = false;
                        } else {
                          hasBrandCurrenciesSelected = true;
                        }
                    })


                })

                if (!isValidToCreate || 
                    values.teamName === '' || 
                    values.teamDescription === '' || 
                    values.teamStatus.toString() === "0" ||
                    values.roles.length === 0 || 
                    values.operatorDetail.length === 0 || 
                    !hasBrandCurrenciesSelected) {
                    swal("Failed", "Unable to proceed, kindly fill up all mandatory fields", "error");
                    setLoading(false);
                    setSubmitting(false);
                    isValidToCreate = false;
                    return;
                }

                    swal({
                        title: "Confirmation",
                        text: "This action will create a new team record, please confirm",
                        icon: "warning",
                        buttons: ["No", "Yes"],
                        dangerMode: true
                    })
                        .then((willCreate) => {
                            if(willCreate){
                                setLoading(false)
                                setSubmitting(false)
                            
                            const messagingHub = hubConnection.createHubConnenction();
                            
                            messagingHub
                                .start()
                                .then(() => {

                                    if (messagingHub.state === HubConnected) {
                                        const createTeamRequestModel: TeamRequestModel = {
                                            teamId: 0,
                                            teamDescription: values.teamDescription,
                                            teamName: values.teamName,
                                            operatorDetail: values.operatorDetail,
                                            roles: values.roles,
                                            teamStatus: parseInt(values.teamStatus.toString()),
                                            CreatedBy: values.createdBy,
                                            UpdatedBy: 0,
                                            teamRestrictionDetail: mapTeamRestrictionDetailsToSave(),
                                            queueId: values.queueId,
                                            userId: values.userId,
                                        }
                                        setSubmitting(true)
                                        setLoading(true)

                                        addTeam(createTeamRequestModel)
                                            .then((response) => {

                                                if (response.status === successResponse) {

                                                    messagingHub.on(createTeamRequestModel.queueId.toString(), message => {
                                                        let _resultData = JSON.parse(message.remarks);
                                                        if (_resultData.Status !== successResponse) {
                                                            swal("Failed", _resultData.Message, "error");
                                                        } else {
                                                            resetForm({})
                                                            setTeamRestrictionDetailsResponse(Array<TeamRestrictionRequestModel>());
                                                            clearInput();
                                                            formik.setFieldValue('teamName', '');
                                                            formik.setFieldValue('teamDescription', '');
                                                            formik.setFieldValue('teamStatus', 0);

                                                            swal("Successful!", "The data has been submitted", "success");

                                                        }
                                                        messagingHub.off(createTeamRequestModel.queueId.toString());
                                                        messagingHub.stop();
                                                        setSubmitting(false);
                                                        setLoading(false)
                                                       
                                                    });

                                                    setTimeout(() => {
                                                        if (messagingHub.state === HubConnected) {
                                                            messagingHub.stop();
                                                        }
                                                    }, 30000)

                                                } else {
                                                    messagingHub.stop();
                                                    swal("Failed", response.data.message, "error");
                                                }


                                            })
                                            .catch(() => {
                                                messagingHub.stop();
                                                swal("Failed", "Problem creating the team", "error");
                                            })


                                    } else {
                                        messagingHub.stop();
                                        swal("Failed", "Problem connecting to the server, Please refresh", "error");
                                    }
                                })
                                .catch(err => console.log('Error while starting connection: ' + err))
                            }
                            else {
                                
                                setLoading(false)
                                setSubmitting(false)
                            }
                        });
                setLoading(false)
                setSubmitting(false)
            }, 1000)
        },
    })
    
    const checkInternetConnection = () => {
        if (InternetConnectionHandler.isSlowConnection(history) || sessionHandler.isSessionExpired(expiresIn, history)) {
            return false;
        }
        return true;
    }
    

    useEffect(() => {
        const pathArray = window.location.pathname.split('/');
        let pageAction: string = "";
        let pageId: string = "";
      
        if (isLoaded === false) {
            if (InternetConnectionHandler.isSlowConnection(history) === true) {
                return;
            }

            createTeamEnableSplashScreen()
            setTimeout(() => {
                const messagingHub = hubConnection.createHubConnenction();

                messagingHub
                    .start()
                    .then(() => {
                        if (messagingHub.state === 'Connected') {

                            getRolesFilter().then((response) => {

                                if (response.status === 200) {
                                    let roleTempList = Array<RoleOption>();
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

                                    createTEamDisableSplashScreen()
                                }
                                else {
                                    createTEamDisableSplashScreen()
                                    swal("Failed", "Problem in getting role list", "error");
                                }

                            })
                                .catch(() => {
                                    createTEamDisableSplashScreen()

                                    swal("Failed", "Problem in getting role list", "error");
                                })

                            // Getting the operator

                            GetAllOperator().then((response) => {
                                if (response.status === 200) {
                                    let allOperators = Object.assign(new Array<OperatorInfoModel>(), response.data);
                                    let operatorTempList = Array<OperatorOptionList>();

                                    allOperators.forEach(item => {
                                        const operatorOptionList: OperatorOptionList = {
                                            value: item.operatorId,
                                            label: item.operatorName,
                                        };
                                        operatorTempList.push(operatorOptionList)
                                    })
                                    setOperatorList(operatorTempList.filter(
                                        (thing, i, arr) => arr.findIndex(t => t.value === thing.value) === i
                                    ));


                                    if (operatorTempList.length > 0) {
                                        let opertorIds = operatorTempList.map(el => el.value).join(',')
                                        getOperatorDetails(opertorIds).then((response) => {
                                            let operatorDetails = Object.assign(new Array<OperatorModel>(), response.data);
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
                                                pageAction = pathArray[3];
                                                pageId = pathArray[4];

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
                                                                    let resultDataCreateTeam =Object.assign({} as TeamModel, data.data);
                                                                    if (resultDataCreateTeam) {
                                                                        let operatorSelectedItem = Array<OperatorOptionList>();
                                                                        setTeamRestrictionDetailsResponse(resultDataCreateTeam.teamRestrictionDetails);    
                                                                        resultDataCreateTeam.operators.forEach(item => {
                                                                            const CreateTeamOperatorOptionList: OperatorOptionList = {
                                                                                value: item.operatorId,
                                                                                label: item.operatorName,
                                                                            };
                                                                            operatorSelectedItem.push(CreateTeamOperatorOptionList)
                                                                        })

                                                                        let roleSelectedItem = Array<RoleOption>();

                                                                        resultDataCreateTeam.roles.forEach(item => {
                                                                            const createTeamRoleOptionList: RoleOption = {
                                                                                value: item.roleId.toString(),
                                                                                label: item.roleName,
                                                                            };
                                                                            roleSelectedItem.push(createTeamRoleOptionList)
                                                                        })

                                                                        setSelectedOperators(operatorSelectedItem);
                                                                        onChangeSelectedRoles(roleSelectedItem);
                                                                        BuildOperatorElements(operatorSelectedItem, operatorDetails);

                                                                        operatorDetails.forEach(operator => {

                                                                            let operatorItemResult = resultDataCreateTeam.operators.find(x => x.operatorId === operator.operatorId);
                                                                            if (operatorItemResult != null) {
                                                                                existingOperators.push(operator);
                                                                                operator.brands.forEach(brand => {
                                                                                    let elementId = '#' + operator.operatorName.replace(/ /g, "") + "-" + brand.name.replace(/ /g, "") + "-All";
                                                                                    $(elementId).on('click', (event: Event) => { allCurrencySelectedPerBrand(event) });

                                                                                    let brandCheckId = operator.operatorName.replace(/ /g, "") + "-" + brand.name.replace(/ /g, "");
                                                                                    let checkboxBrand = document.getElementById(brandCheckId) as HTMLInputElement;
                                                                                    let brandStatus = resultDataCreateTeam.brands.find(x => x.brandId === brand.id && x.teamOperatorId === operator.operatorId)?.brandStatus
                                                                                    checkboxBrand.checked = brandStatus === 1;

                                                                                    brand.currencies.forEach(currency => {
                                                                                        let currencyElementId = operator.operatorName.replace(/ /g, "") + "-" + brand.name.replace(/ /g, "") + "-" + currency.name.replace(/ /g, "");
                                                                                        let inputCheckBoxValue = document.getElementById(currencyElementId) as HTMLInputElement;
                                                                                        let currencyStatus = resultDataCreateTeam.currencies.find(x => x.currencyId === currency.id && x.brandId === brand.id)?.currencyStatus
                                                                                        inputCheckBoxValue.checked = currencyStatus === 1;

                                                                                    });
                                                                                })
                                                                            }
                                                                        })
                                                                    }

                                                                })
                                                                .catch((ex) => {
                                                                    createTEamDisableSplashScreen()
                                                                    console.log(ex)
                                                                    swal("Failed", "Problem in getting record of the team selected", "error");
                                                                })
                                                            createTEamDisableSplashScreen()
                                                            messagingHub.off(request.queueId.toString());
                                                            messagingHub.stop()

                                                        });

                                                    } else {
                                                        createTEamDisableSplashScreen()
                                                        swal("Failed", response.data.message, "error");
                                                    }

                                                })
                                                    .catch((ex) => {
                                                        createTEamDisableSplashScreen()
                                                        console.log('problem in getting team info' + ex)
                                                    });
                                            }
                                        })
                                            .catch(() => {
                                                createTEamDisableSplashScreen()
                                                swal("Failed", "Problem in getting operator details list", "error");
                                            })
                                    }
                                }
                                else {
                                    createTEamDisableSplashScreen()
                                    swal("Failed", "Problem in getting operators", "error");
                                }

                            })
                                .catch(() => {
                                    createTEamDisableSplashScreen()
                                    swal("Failed", "Problem in getting operator list", "error");
                                })

                        }
                        else {
                            createTEamDisableSplashScreen()
                            swal("Failed", "Problem connecting to the server, Please refresh", "error");
                        }

                    })
                    .catch(err => {
                        console.log('Error while starting connection: ' + err)
                        createTEamDisableSplashScreen()
                    })
            }, 1000);
            setLoaded(true)

        }


    }, []);

    // -----------------------------------------------------------------
    // METHODS
    // -----------------------------------------------------------------
    function clearInput() {

        operatorDetailList.forEach(operator => {
            operator.brands.forEach(brand => {
                let elementId = operator.operatorName.replace(/ /g, "") + "-" + brand.name.replace(/ /g, "");
                let inputValue = document.getElementById(elementId) as HTMLInputElement;
                if (inputValue) {
                    inputValue.checked = false
                    brand.status = 2


                    brand.currencies.forEach(currency => {
                        let currencyElementId = operator.operatorName.replace(/ /g, "") + "-" + brand.name.replace(/ /g, "") + "-" + currency.name;
                        let inputCheckBoxValue = document.getElementById(currencyElementId) as HTMLInputElement;
                        if (inputCheckBoxValue) {
                            inputCheckBoxValue.checked = false;
                            currency.status = 2
                        }
                    })
                }
            })
        })

        setSelectedRoles([])
        setSelectedOperators([])

        const container = document.getElementById('tblAccordion');

        if (container) {
            container.innerHTML = '';
        }
    }
    function getElementId(...values: string[]): string {
        return values.map(value => value.replace(/ /g, "")).join("-");
      }
      
      function getInputElement(elementId: string): HTMLInputElement | null {
        return document.getElementById(elementId) as HTMLInputElement;
      }
      
      function getInputCheckedStatus(inputElement: HTMLInputElement): boolean {
        return inputElement.checked === true;
      }
      function updateCurrencyStatus(operatorName: string, brand: BrandModel, currencies: Array<CurrencyModel>) {
        currencies.forEach(currency => {
          let currencyElementId = getElementId(operatorName, brand.name, currency.name);
          let inputCheckBoxValue = getInputElement(currencyElementId);
          if (inputCheckBoxValue) {
            currency.status = getInputCheckedStatus(inputCheckBoxValue) ? 1 : 2;
          }
        });
      }
      
    function updateBrandStatus(operator: OperatorModel) {
        operator.brands.forEach(brand => {
          let elementId = getElementId(operator.operatorName, brand.name);
          let inputValue = getInputElement(elementId);
          if (inputValue) {
            brand.status = getInputCheckedStatus(inputValue) ? 1 : 2;
            updateCurrencyStatus(operator.operatorName, brand, brand.currencies);
          }
        });
      }
      function getBrandsValueByOperator(optionSelected: Array<OperatorOptionList>): Array<OperatorModel> {
        let tempOperatorList = JSON.parse(JSON.stringify(operatorDetailList)) as Array<OperatorModel>;
        let resultOperatorList = Array<OperatorModel>();
      
        tempOperatorList.forEach(operator => {
          if (optionSelected.find(x => x.value === operator.operatorId)) {
            updateBrandStatus(operator);
            if (!resultOperatorList.find(x => x.operatorId === operator.operatorId)) {
              resultOperatorList.push(operator);
            }
          }
        });
      
        return resultOperatorList;
      }


    function onChangeSelectedRoles(val: Array<RoleOption>) {
        setSelectedRoles(val);

    }

    function onChangeSelectedOperators(operatorVal: Array<OperatorOptionList>) {
        setSelectedOperators(operatorVal);

        let createTeamExistingExistingSelection = getBrandsValueByOperator(operatorVal);

        BuildOperatorElements(operatorVal, operatorDetailList);

        operatorDetailList.forEach(createTeamOperator => {
            existingOperators.push(createTeamOperator)
            createTeamOperator.brands.forEach(brand => {
                let elementId = '#' + createTeamOperator.operatorName.replace(/ /g, "") + "-" + brand.name.replace(/ /g, "") + "-All";
                $(elementId).on('click', (event: Event) => { allCurrencySelectedPerBrand(event) });

            })
        })

        createTeamExistingExistingSelection.forEach(createTeamExistingOperator => {
            existingOperators.push(createTeamExistingOperator)
            console.log(createTeamExistingOperator.brands)
            createTeamExistingOperator.brands.forEach(createTeamExistingOperatorBrand => {
                let brandCheckId = createTeamExistingOperator.operatorName.replace(/ /g, "") + "-" + createTeamExistingOperatorBrand.name.replace(/ /g, "");
                let checkboxBrand = document.getElementById(brandCheckId) as HTMLInputElement;
                checkboxBrand.checked = createTeamExistingOperatorBrand.status === 1;

                createTeamExistingOperatorBrand.currencies.forEach(currency => {
                    let currencyElementId = createTeamExistingOperator.operatorName.replace(/ /g, "") + "-" + createTeamExistingOperatorBrand.name.replace(/ /g, "") + "-" + currency.name.replace(/ /g, "");
                    let inputCheckBoxValue = document.getElementById(currencyElementId) as HTMLInputElement;
                    inputCheckBoxValue.checked = currency.status === 1;
                });

            })
        })


    }
    const mapTeamRestrictionDetailsToSave = () => {
        let _teamRestrictionRequestList : Array<TeamRestrictionRequestModel> = [];

        teamRestrictionDetails.forEach((_) => {
            _.brands.forEach((br) => {
                _teamRestrictionRequestList.push(addTeamRestrictionRequest(_, br ,  RestrictionFields.Brand));
            });
            _.countries.forEach((coun) => {
                _teamRestrictionRequestList.push(addTeamRestrictionRequest(_, coun ,  RestrictionFields.Country));
            });
            _.vipLevels.forEach((vip) => {
                _teamRestrictionRequestList.push(addTeamRestrictionRequest(_, vip ,  RestrictionFields.VipLevel));
            });
            _.currencies.forEach((cur) => {
                _teamRestrictionRequestList.push(addTeamRestrictionRequest(_, cur ,  RestrictionFields.Currency));
            });
        });
       return _teamRestrictionRequestList;
    }

    const addTeamRestrictionRequest = (_: any ,val : any, fieldId : number) => {
        return  {
            operatorId: Number(_.operatorId),
            teamId: 0,
            accessRestrictionFieldId : fieldId,
            accessRestrictionFieldValue: Number(val.value)
        }
    }
    // -----------------------------------------------------------------
    // COMPONENTS
    // -----------------------------------------------------------------
    function BuildOperatorElements(selectedOptions: Array<OperatorOptionList>, detailList: Array<OperatorModel>) {

        const tblAccordionContainer = document.getElementById('tblAccordion');

        if (tblAccordionContainer) {
            tblAccordionContainer.innerHTML = '';
        }

        let _lisOfSelectedOperators = Array<OperatorModel>();
        _lisOfSelectedOperators = [];
        for (let i = 0; i < selectedOptions.length; i++) {
            let item: any = selectedOptions[i];

            let selectedOperators = detailList.filter(
                (thing, i, arr) => arr.findIndex(t => t.operatorId === item.value) === i
            )
            _lisOfSelectedOperators = selectedOperators.filter(
                (thing, i, arr) => arr.findIndex(t => t.operatorId === thing.operatorId) === i
            )

            _lisOfSelectedOperators.forEach(elementOperator => {

                let nameId = elementOperator.operatorName.replace(/ /g, "")
                const content = `
                <div class="accordion-item">
                    <h2 class="accordion-header" id="headingOne" style={CardHeaderStyles1}>
                        <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#` + nameId + `" aria-expanded="false" aria-controls="collapseOne"> 
                            ${elementOperator.operatorName}
                        </button>
                    </h2>
                    <div id="` + nameId + `" class="accordion-collapse collapse show" aria-labelledby="headingOne" data-bs-parent="#accordionExample">
                        <div class="accordion-body" style={CardBodytyles1}> ` +
                    BuilBrandsElements(elementOperator.brands, nameId)
                    + `</div>
                    </div>
                </div>`;

                if (tblAccordionContainer) {
                    tblAccordionContainer.innerHTML += content;
                }
            });
        }

    }

    function BuilBrandsElements(items: Array<BrandModel>, operatorName: string): string {
        let brandElement: string = '';
        let checkBoxId: string = operatorName;

        items.forEach(brand => {
            let isChecked: string = '';
  
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
    const getStateTeamRestriction = (_val : Array<TeamDataAccessRestrictionModel>) =>{
        setTeamRestrictionDetails(_val);
    }

    function allCurrencySelectedPerBrand(evenButton: Event) {
        let eventInfo = evenButton.target as HTMLInputElement;
        const pathArray = window.location.pathname.split('/');
        let pageAction: string = "";

        let tempOperatorList = Array<OperatorModel>();

        if (pathArray.length >= 4) {
            pageAction = pathArray[3];

            if (pageAction === 'clone') {
                tempOperatorList = JSON.parse(JSON.stringify(existingOperators)) as Array<OperatorModel>

            }
        } else {
            tempOperatorList = JSON.parse(JSON.stringify(operatorDetailList)) as Array<OperatorModel>

        }
        setCreateTeamResultOperator(tempOperatorList, eventInfo);
    }
    const setCreateTeamResultOperator = (tempOperatorList: OperatorModel[], eventInfo : HTMLInputElement)=> {
        let createTeamResultOperatorList = Array<OperatorModel>();

        tempOperatorList.forEach(operator => {
            operator.brands.forEach(operatorBrand => {
                let elementId = operator.operatorName.replace(/ /g, "") + "-" + operatorBrand.name.replace(/ /g, "");
                let createInputValue = getInputElement(elementId); 
                if (createInputValue) {
                    operatorBrand.status = createInputValue.checked === true ? 1 : 2;
                    operatorBrand.currencies.forEach(operatorCurrency => {
                        setTeamOperatorDetails(operatorCurrency, eventInfo,operatorBrand,operator)
                    })
                }
            })
            createTeamResultOperatorList.push(operator)
        })
        setOperatorDetailList(createTeamResultOperatorList);
    }
 
    const setTeamOperatorDetails = (operatorCurrency: any,eventInfo: any , operatorBrand: any, operator: any) =>{
        let buffer: any = eventInfo.id.split('-')
        let operatorEventName: string = buffer[0]
        let brandEventName: string = buffer[1]
        let currencyElementId = operator.operatorName.replace(/ /g, "") + "-" + operatorBrand.name.replace(/ /g, "") + "-" + operatorCurrency.name.replace(/ /g, "");
        let inputCheckBoxValue =  getInputElement(currencyElementId); 
        if (inputCheckBoxValue) {
            if (operatorEventName === operator.operatorName.replace(/ /g, "") && operatorBrand.name.replace(/ /g, "") === brandEventName) {
                operatorCurrency.status = eventInfo.checked === true ? 1 : 2;
                inputCheckBoxValue.checked = operatorCurrency.status === 1
            }
            else {
                operatorCurrency.status = inputCheckBoxValue.checked === true ? 1 : 2;
            }
        }
    }
    
    return (
        <form
            className='form w-100'
            onSubmit={formik.handleSubmit}
            noValidate
        >
            <div className='card card-custom'>
                <div className='card-header cursor-pointer' role='button' data-bs-toggle='collapse' data-bs-target='#kt_account_deactivate' aria-expanded='true' aria-controls='kt_account_deactivate'>
                    <div className='card-title m-0'> <h5 className='fw-bolder m-0'>Create Team</h5></div>
                </div>
                <div className='card-body p-9'>
                    <div className='d-flex align-items-center my-2'>
                        <div className="row mb-3">
                            <div className="row mb-3">
                                <div className="col-sm-2">
                                    <span className="form-label-sm required">Team Name</span>
                                </div>
                                <div className="col-sm-6">
                                    <input type="text" className="form-control form-control-sm" title='' aria-label="Team Name"{...formik.getFieldProps('teamName')} />
                                </div>
                            </div>
                            <div className="row mb-3">
                                <div className="col-sm-2">
                                    <span className="form-label-sm required">Team Description</span>
                                </div>
                                <div className="col-sm-6">
                                    <input type="text" title='' className="form-control form-control-sm" aria-label="Team Description"
                                        {...formik.getFieldProps('teamDescription')}
                                    />
                                </div>
                            </div>
                            <div className="row mb-3">
                                <div className="col-sm-2">
                                    <span className="form-label-sm required">Team Status</span>
                                </div>
                                <div className="col-sm-6">
                                    <select title='' className="form-select form-select-sm" aria-label="Select status" {...formik.getFieldProps('teamStatus')}>
                                        <option value="0">Select...</option>
                                        <option value="1">Active</option>
                                        <option value="2">Inactive</option>
                                    </select>
                                </div>
                            </div>
                            <div className="row mb-3">
                                <div className="col-sm-2">
                                    <span className="form-label-sm required">Role Name</span>
                                </div>
                                <div title=''  className="col-sm-6">
                                    <Select
                                        {...formik.getFieldProps('roles')}
                                        isMulti
                                        options={roleList}
                                        onChange={onChangeSelectedRoles}
                                        value={selectedRoles}
                                    />
                                </div>
                            </div>
                            <TeamDataAccessRestrictionGrid stateTeamRestriction = {getStateTeamRestriction}  teamRestrictionDetailsResponse = {teamRestrictionDetailsResponse} operatorList= {operatorList}/>
                            <div className="separator border-4 my-10" />
                            <h6 className='fw-bolder m-0'>Operator Detail</h6>
                            <br />
                            <br />

                            <div className="row mb-3">
                                <div className="col-sm-2">
                                    <span title='Operator name' className="form-label-sm required">Operator Name</span>
                                </div>
                                <div className="col-sm-6">
                                    <Select isMulti options={operatorList} onChange={onChangeSelectedOperators} value={selectedOperators} />
                                </div>
                            </div>

                            <div className="accordion" id="tblAccordion">
                            </div>
                          
                        </div>
                    </div>
                </div>
                <FooterContainer>
                    <PaddedContainer>
                        <button type='submit' className="btn btn-primary btn-sm me-2" disabled={formik.isSubmitting}> {!loading && <span className='indicator-label'>Submit</span>}
                            {loading && ( <span className='indicator-progress' style={{ display: 'block' }}>
                                    Please wait...
                                    <span className='spinner-border spinner-border-sm align-middle ms-2'></span>
                                </span>
                            )}
                        </button>
                      
                    </PaddedContainer>
                </FooterContainer>

            
            </div >
        </form >
    )
}
export default CreateTeam;