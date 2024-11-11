import React,{useState, useEffect} from 'react'
import { OptionListModel, TopicOptionModel } from '../../../common/model';
import { GetTopicOptionList } from '../../../common/services';


export default function  useTopicOptionList() {

    // -----------------------------------------------------------------
    // STATE
    // -----------------------------------------------------------------
    const [topicOptionList, setTopicOptionList] = useState<Array<OptionListModel>>([])

    // -----------------------------------------------------------------
    // FIRST MOUNT OF COMPONENT
    // -----------------------------------------------------------------
    useEffect(() => {
        _getTopicList()
    }, [])

    async function _getTopicList() {
        
        await GetTopicOptionList().then((response) => {
            if (response.status === 200) {
                let topics = Object.assign(new Array<TopicOptionModel>(), response.data);
                
                let tempList = Array<OptionListModel>();
    
                topics.forEach(item => {
                    const OptionValue: OptionListModel = {
                        value: item.topicId,
                        label: item.topicName,
                    };
                    tempList.push(OptionValue)
                })

                setTopicOptionList(tempList.filter(
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
    }

    return topicOptionList
}
