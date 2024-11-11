import React,{useState, useEffect} from 'react'
import { CaseTypeOptionModel, OptionListModel, TopicOptionModel } from '../../../common/model';
import { GetCaseTypeOptionList, GetTopicOptionList } from '../../../common/services';


export default function useCaseTypeOptions() {

    // -----------------------------------------------------------------
    // STATE
    // -----------------------------------------------------------------
    const [caseTypeOptionsList, setCaseTypeOptionsList] = useState<Array<OptionListModel>>([])

    // -----------------------------------------------------------------
    // FIRST MOUNT OF COMPONENT
    // -----------------------------------------------------------------
    useEffect(() => {

        GetCaseTypeOptionList().then((response) => {
            if (response.status === 200) {
                let topics = Object.assign(new Array<CaseTypeOptionModel>(), response.data);
                
                let tempList = Array<OptionListModel>();
    
                topics.forEach(item => {
                    const OptionValue: OptionListModel = {
                        value: item.caseTypeId,
                        label: item.caseTypeName,
                    };
                    tempList.push(OptionValue)
                })

                setCaseTypeOptionsList(tempList.filter(
                    (thing, i, arr) => arr.findIndex(t => t.value === thing.value) === i
                ));

            }
            else {
                // disableSplashScreen()
                console.log("Problem in Topic list")
            }
        })
        .catch(() => {
            //disableSplashScreen()
            console.log("Problem in Topic list")
        })
    }, [])

    return caseTypeOptionsList
}
