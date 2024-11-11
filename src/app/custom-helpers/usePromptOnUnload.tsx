import React, { useEffect } from "react";
import PropTypes from "prop-types";
import { Prompt } from "react-router-dom";

// Prompt the user onbeforeunload or when navigating away by clicking a link
export default function usePromptOnUnload(when: boolean, message: string) {

    const enabled = when;

  useEffect(() => {

        if(enabled === true){

                const handleBeforeUnload = (event: any) => {
                    event.preventDefault();
                    event.returnValue = ''; // Chrome requires setting this.
                    // console.log(event)
                };

                window.addEventListener("beforeunload", handleBeforeUnload);

                return () => {
                    window.removeEventListener("beforeunload", handleBeforeUnload);
                }
        }

  }, [enabled])

  return <Prompt when={enabled} message={message} />;
}


usePromptOnUnload.propTypes = {
  /** Set to true to enable the prompt */
  when: PropTypes.bool.isRequired,

  /** Message to display when the user navigates away by clicking a local link.
   * This is also used as a requested message for onbeforeunload when the user refreshes the page or tries to close the tab.
   * NOTE: Most browsers don't display a requested message when onbeforeunload fires, so the message
   * is primarily useful to prompt the user when they're navigating away via a local React Router link. */
  message: PropTypes.string,
};

usePromptOnUnload.defaultProps = {
  message: "Are you sure you want to leave?",
};