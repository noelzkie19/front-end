import { useRef, useEffect } from 'react';

const onUnload = (e: any) =>  { 
    const confirmationMessage = 'CONFIRM REFRESH';
    e.returnValue = confirmationMessage;     // Gecko, Trident, Chrome 34+
    return confirmationMessage;              // Gecko, WebKit, Chrome <34
  }

const useUnload = (fn: any) => {
  useEffect(() => {
    window.addEventListener("beforeunload", onUnload);
    return () => window.removeEventListener("beforeunload", onUnload);
  }, []);
};

export default useUnload;