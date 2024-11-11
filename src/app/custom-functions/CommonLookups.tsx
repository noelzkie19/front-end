import React,{useState,useEffect} from 'react'
import { LookupModel } from "../shared-models/LookupModel";
import { decompressFromBase64  } from "lz-string"

export default function CommonLookups(type: string) {

    // -----------------------------------------------------------------
    // STATE
    // -----------------------------------------------------------------
    const [lookupList, setLookList] = useState<Array<LookupModel>>([])    

    // -----------------------------------------------------------------
    // FIRST MOUNT OF COMPONENT
    // -----------------------------------------------------------------   
    useEffect(() => {

        var decompressedLookup = decompressFromBase64(localStorage.getItem('systemLookups')??'')?.toString()
        if(decompressedLookup != undefined)
        {
            var lookups = JSON.parse(decompressedLookup)  
            switch(type)
            {
                case "brands": 
                    setLookList(Object.assign(new Array<LookupModel>(), lookups.brands));
                    break;
                case "caseTypes": 
                    setLookList(Object.assign(new Array<LookupModel>(), lookups.caseTypes));
                    break;
                case "codeLists": 
                    setLookList(Object.assign(new Array<LookupModel>(), lookups.codeLists));
                    break;
                case "countries": 
                    setLookList(Object.assign(new Array<LookupModel>(), lookups.countries));
                    break;
                case "currencies": 
                    setLookList(Object.assign(new Array<LookupModel>(), lookups.currencies));
                    break;
                case "fieldTypes": 
                    setLookList(Object.assign(new Array<LookupModel>(), lookups.fieldTypes));
                    break;
                case "marketingChannels": 
                    setLookList(Object.assign(new Array<LookupModel>(), lookups.marketingChannels));
                    break;
                case "messageResponses": 
                    setLookList(Object.assign(new Array<LookupModel>(), lookups.messageResponses));
                    break;
                case "messageStatuses": 
                    setLookList(Object.assign(new Array<LookupModel>(), lookups.messageStatuses));
                    break;
                case "messageTypes": 
                    setLookList(Object.assign(new Array<LookupModel>(), lookups.messageTypes));
                    break;
                case "paymentGroups": 
                    setLookList(Object.assign(new Array<LookupModel>(), lookups.paymentGroups));
                    break;
                case "playerStatuses": 
                    setLookList(Object.assign(new Array<LookupModel>(), lookups.playerStatuses));
                    break;
                case "riskLevels": 
                    setLookList(Object.assign(new Array<LookupModel>(), lookups.riskLevels));
                    break;
                case "signUpPortals": 
                    setLookList(Object.assign(new Array<LookupModel>(), lookups.signUpPortals));
                    break;
                case "vipLevels": 
                    setLookList(Object.assign(new Array<LookupModel>(), lookups.vipLevels));
                    break;
                case "internalAccounts": 
                    let internalAccountsList = Array<LookupModel>();
                    internalAccountsList.push({ label: 'Yes', value: 'true' })
                    internalAccountsList.push({ label: 'No', value: 'false' })
                    setLookList(internalAccountsList)
                    break;
                case "campaignNames": 
                    let campaignNamesList = Array<LookupModel>();
                    campaignNamesList.push({ label: 'Campaign Name 1', value: '1' })
                    campaignNamesList.push({ label: 'Campaign Name 2', value: '2' })
                    setLookList(campaignNamesList)
                    break;  
                case "campaignStatuses": 
                    let campaignStatusesList = Array<LookupModel>();
                    campaignStatusesList.push({ label: 'On Hold', value: '1' })
                    campaignStatusesList.push({ label: 'Active', value: '2' })
                    campaignStatusesList.push({ label: 'Ended', value: '3' })
                    campaignStatusesList.push({ label: 'Completed', value: '4' })
                    campaignStatusesList.push({ label: 'Inactive', value: '5' })
                    campaignStatusesList.push({ label: 'Draft', value: '6' })
                    setLookList(campaignStatusesList)
                    break;     
                case "caseStatuses": 
                    let caseStatusList = Array<LookupModel>();
                    caseStatusList.push({ label: 'Open', value: '2' })
                    caseStatusList.push({ label: 'Re-Open', value: '3' })
                    caseStatusList.push({ label: 'Closed', value: '46' })
                    setLookList(caseStatusList)
                    break;     
                case "settingStatuses": 
                    let settingStatusList = Array<LookupModel>();
                    settingStatusList.push({ label: 'Active', value: '1' })
                    settingStatusList.push({ label: 'Inactive', value: '0' })
                    setLookList(settingStatusList)
                    break; 
                case "statusesWithDefault":
                    let statusWithDefaultList = Array<LookupModel>();
                    statusWithDefaultList.push({ label: 'Select All', value: '' })
                    statusWithDefaultList.push({ label: 'Active', value: '1' })
                    statusWithDefaultList.push({ label: 'Inactive', value: '0' })
                    setLookList(statusWithDefaultList)
                    break;
                case "settingTypeWithDefault":
                    let settingTypeWithDefaultList = Array<LookupModel>();
                    settingTypeWithDefaultList.push({ label: 'Select All', value: '' })
                    settingTypeWithDefaultList.push({ label: 'Goal Parameter to Point', value: '40' })
                    settingTypeWithDefaultList.push({ label: 'Point to Value', value: '41' })
                    setLookList(settingTypeWithDefaultList)
                    break;
                case "searchType":
                    setLookList(Object.assign(new Array<LookupModel>(), lookups.searchType));
                    break;    
                case "mobileVerificationStatus":
                    setLookList(Object.assign(new Array<LookupModel>(), lookups.mobileVerificationStatus));
                    break;
                case "isLastAgentAbandonedAssigned":
                    {
                        let abandonedAssigned = Array<LookupModel>();
                        abandonedAssigned.push({ label: 'Yes', value: '1' })
                        abandonedAssigned.push({ label: 'No', value: '0' })
                        setLookList(abandonedAssigned)
                        break;    
                    }
                             
            }

        }

    }, [])

    return lookupList
}