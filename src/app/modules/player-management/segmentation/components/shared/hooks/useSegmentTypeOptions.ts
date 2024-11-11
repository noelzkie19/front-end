import React, { useEffect, useState } from "react";
import { MasterReferenceOptionListModel, MasterReferenceOptionModel } from "../../../../../../common/model";
import { GetMasterReferenceList } from "../../../../../../common/services";
import { LookupModel } from "../../../../../../shared-models/LookupModel";

const useSegmentTypeOptions = () => {

    const [segmentTypeOption, setSegmentTypeOption] = useState<Array<LookupModel>>([])

    useEffect(() => {
        GetMasterReferenceList('192').then((response) => {
            if (response.status === 200) {
       
                let masterReferenceList = Object.assign(new Array<MasterReferenceOptionListModel>(), response.data);
                let tempList = Array<MasterReferenceOptionModel>();

                masterReferenceList.filter((x:MasterReferenceOptionListModel) => x.isParent === false).forEach(item =>{
                    const OptionValue: MasterReferenceOptionModel = {
                        masterReferenceParentId: item.masterReferenceParentId,
                        options: {label: item.masterReferenceChildName, value: item.masterReferenceId.toString()}
                    }
                    tempList.push(OptionValue)
                })

                setSegmentTypeOption(tempList.flatMap(x => x.options))    
            }
            else {
                // disableSplashScreen()
                console.log("Problem in  master reference list")
            }
        })
        .catch(() => {
            //disableSplashScreen()
            console.log("Problem in master reference list")
        })
    }, []);
    

  return {segmentTypeOption}
};

export default useSegmentTypeOptions;
