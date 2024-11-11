import swal from "sweetalert";
import { scrollableHeaders } from "../constants/Constants";
export const enableSplashScreen = () => {
    const splashScreen = document.getElementById('splash-screen')
    if (splashScreen) {
        showSplashScreen(splashScreen);
    }
}

export const disableSplashScreen = () => {
    const splashScreen = document.getElementById('splash-screen')
    if (splashScreen) {
        hideSplashScreen(splashScreen)
    }
}
export const enableSplashScreenDrawer = () => {
    const splashScreen = document.getElementById('splash-screen-drawer')
    if (splashScreen) {
        showSplashScreen(splashScreen);
    }
}

export const disableSplashScreenDrawer = () => {
    const splashScreen = document.getElementById('splash-screen-drawer')
    if (splashScreen) {
        hideSplashScreen(splashScreen)
    }
}
const showSplashScreen = (splashScreen : any)=> {
    splashScreen.style.setProperty('display', 'flex')
    splashScreen.style.setProperty('opacity', '0.5')
}
const hideSplashScreen = (splashScreen : any)=>  splashScreen.style.setProperty('display', 'none')
export const isJsonSizeValid = (jsonObject: Record<string, any>) => {
    // Convert the JSON object to a JSON string
    const jsonString = JSON.stringify(jsonObject);

    // Convert the string size to bytes (UTF-8 encoding)
    const bytes = new TextEncoder().encode(jsonString).length;

    // Define the maximum allowed size (3MB in bytes)
    const maxSizeBytes = 3 * 1024 * 1024;

    // Check if the JSON size is within the limit
    return bytes <= maxSizeBytes;
}


export const checkSessionExpiry = (history: any, expiresIn :any) => {
    const expiration = new Date(expiresIn);
    let today = new Date();
  
    if (expiration <= today) {
      swal({
        icon: 'warning',
        dangerMode: true,
        text: 'You are about to logout, Please click OK to proceed.',
        title: 'Expired Session Detected',
      }).then((willLogout) => {
        if (willLogout) {
          history.push('/logout');
        }
      });
    }
  }

  export const setHeaderScrollable = () => {
    const isScrollable = scrollableHeaders.some(function(prefix) {
        return window.location.pathname.startsWith(prefix);
    });

    if(isScrollable) {
        document.body.classList.remove('header-fixed');
        document.body.classList.remove('toolbar-fixed');
    } else {
        document.body.classList.add('header-fixed');
        document.body.classList.add('toolbar-fixed');
    }
  }