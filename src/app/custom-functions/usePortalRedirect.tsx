import {useState, useEffect} from 'react'
import useConstant from '../constants/useConstant';

export default function usePortalRedirect() {

    // -----------------------------------------------------------------
    // STATE
    // -----------------------------------------------------------------
    const [redirectPortal, setRedirectPortal] = useState<string>('');
    const { MCORE_PORTALS } = useConstant();

    useEffect(() => {

        const host = window.location.host;

        const hostChecker = (value:string) => {
        if (host.includes(value)){
            console.log(host)
            return host;
        }
        };

        switch (host) {
            case hostChecker(MCORE_PORTALS.LocalPortal[0]):
                setRedirectPortal(MCORE_PORTALS.LocalPortal[1]);
                console.log(redirectPortal)
                break;
            case hostChecker(MCORE_PORTALS.DevPortal[0]):
                setRedirectPortal(MCORE_PORTALS.DevPortal[1]);
                break;
            case hostChecker(MCORE_PORTALS.TestPortal[0]):
                setRedirectPortal(MCORE_PORTALS.TestPortal[1]);
                break;
            case hostChecker(MCORE_PORTALS.StagePortal[0]):
                setRedirectPortal(MCORE_PORTALS.StagePortal[1]);
                break;
            case hostChecker(MCORE_PORTALS.ProdPortal[0]):
                setRedirectPortal(MCORE_PORTALS.ProdPortal[1]);
                break
            default:
                console.log('Host invalid ' + host);
        };
    }, []);

    return redirectPortal;
}