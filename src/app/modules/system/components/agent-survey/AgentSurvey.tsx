import React, { useEffect } from "react";
import { ContentContainer, FormHeader, MainContainer } from "../../../../custom-components";

import '../../../../../client-SDK.min.js';

const AgentSurveyList: React.FC = () => {
  
  const onSuccess = (data: any) => {
    // Do something with the returning data
    console.log('onSuccess');
    console.log(data);
  };

  const onError = (err: any) => {
      // Do something with the error
      console.log('onError ' + err);
  };

    const notificationHandler = (data: any) => {
      console.log('notificationHandler');
      console.log(data);
    };

    const focusHandler = () => {
      console.log('notificationHandler');
    };

    const blurHandler = () => {
      console.log('blurHandler');
    };

    const updateCallback = function(data: any) {
      // Do something with the returning data
      let path = data.key;
      let value = data.newValue;
      // called each time the value is updated.
      // If there's an existing value when bind is called - this callback
      // will be called with the existing value

      console.log('updateCallback path ' + path);
      console.log('updateCallback value ' + value);
  };

  const notifyWhenDone = function(err: any) {
      if (err) {
          // Do something with the error
          console.log('notifyWhenDone err ' + err);
      }
      // called when the bind is completed successfully,
      // or when the action terminated with an error.
  };

  //effects
  useEffect(() => {
    lpTag.agentSDK.init({
      notificationCallback: notificationHandler,
      visitorFocusedCallback: focusHandler,
      visitorBlurredCallback: blurHandler,
      onSuccess: onSuccess,
      onerror: onError,
    });
    
    let pathToData = "visitorInfo.visitorName";

    lpTag.agentSDK.bind(pathToData, updateCallback, notifyWhenDone);

  }, []);
  
	return (
		<MainContainer>
			<FormHeader headerLabel={'Agent Survey 2'} />
			<ContentContainer>
      {/* <input type="text" value={username} /> 
      <input type="text" value={conversationId} />
      <input type="text" value={brandName} /> */}

			</ContentContainer>
		</MainContainer>
	);
};

export default AgentSurveyList;