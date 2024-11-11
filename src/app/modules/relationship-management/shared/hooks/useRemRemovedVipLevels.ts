import { useEffect, useState } from 'react';
import { getRemovedVipLevels } from '../../services/RemSettingApi';
import { LookupModel } from '../../../../shared-models/LookupModel';
import useConstant from '../../../../constants/useConstant';

export default function useRemRemovedVipLevels() {
    // State
    const [removedVipLevelList, setRemovedVipLevelList] = useState<Array<LookupModel> | null>([]);
    const { successResponse } = useConstant()

    // Effect
    useEffect(() => {
        setRemovedVipLevelList(null);
        getRemovedVipLevels()
            .then((response) => {
                if (response.status === successResponse) {
                    setRemovedVipLevelList(response.data);
                }
                else {
                    console.log('Problem in getting vip level list');
                }
            })
            .catch((ex) => {
                console.log('Error getRemovedVipLevels: ' + ex);
            });
    }, []);

    return removedVipLevelList;
}
