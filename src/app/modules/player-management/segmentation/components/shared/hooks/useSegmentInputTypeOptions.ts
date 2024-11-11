import React, { useState } from 'react';
import { MasterReferenceOptionListModel } from '../../../../../../common/model';
import { GetMasterReferenceList } from '../../../../../../common/services';
import { LookupModel } from '../../../../../../shared-models/LookupModel';

const useSegmentInputTypeOptions = () => {
    const [segmentInputTypeOption, setSegmentInputTypeOption] = useState<Array<LookupModel>>([]);

    const getSegmentInputTypeList = async () => {
        let options: Array<LookupModel> = [];
        await GetMasterReferenceList('309').then((response) => {
            if (response.status === 200) {
       
                let masterReferenceList = Object.assign(new Array<MasterReferenceOptionListModel>(), response.data);
        
                let tempList =  masterReferenceList
                            .filter((x: MasterReferenceOptionListModel) => x.masterReferenceParentId === 309 && x.isParent === false)
                            .map((x: MasterReferenceOptionListModel) => {
                                let lookupOption: LookupModel = {
                                    value: x.masterReferenceId.toString(),
                                    label: x.masterReferenceChildName
                                }
                                return lookupOption;
                            });
                options = tempList;
                setSegmentInputTypeOption(tempList);
            }
            else {
                console.log("Problem in useSegmentInputTypeOptions StatusCode: " + response.status)
            }
        })
        .catch(() => {
            console.log("Problem in useSegmentInputTypeOptions")
        });
        return options;
    }
    

  return {segmentInputTypeOption, getSegmentInputTypeList}
}

export default useSegmentInputTypeOptions