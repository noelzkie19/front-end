import React from 'react';
// import ReactDOM from 'react-dom'
import {createRoot} from 'react-dom/client';

// https://github.com/rt2zz/redux-persist
import {PersistGate} from 'redux-persist/integration/react';
import {Provider} from 'react-redux';
import * as _redux from './setup';
import store, {persistor} from './setup/redux/Store';
// Axios
import axios from 'axios';
import {Chart, registerables} from 'chart.js';

// Apps. Trigger Deployment
import {App} from './app/App';
import {MetronicI18nProvider} from './_metronic/i18n/Metronici18n';
import {AppConfiguration} from 'read-appsettings-json';
/**
 * TIP: Replace this style import with dark styles to enable dark mode
 *
 * import './_metronic/assets/sass/style.dark.scss'
 **/
import './_metronic/assets/sass/style.scss';
const Pwd_Key = 'mlab-new-relic@2024';
const CryptoJS = require('crypto-js');
/**
 * Base URL of the website.
 *
 * @see https://facebook.github.io/create-react-app/docs/using-the-public-folder
 */
const {PUBLIC_URL} = process.env;
window.name = CryptoJS.AES.encrypt(JSON.stringify(AppConfiguration.Setting()), Pwd_Key).toString() + "." + window.btoa(Pwd_Key);
/**
 * Creates `axios-mock-adapter` instance for provided `axios` instance, add
 * basic Metronic mocks and returns it.
 *
 * @see https://github.com/ctimmerm/axios-mock-adapter

 * Inject Metronic interceptors for axios.
 *
 * @see https://github.com/axios/axios#interceptors
 */
_redux.setupAxios(axios, store);

Chart.register(...registerables);

let element = document.getElementById('root');

// ReactDOM.render(
//   <MetronicI18nProvider>
//     <Provider store={store}>
//       {/* Asynchronously persist redux stores and show `SplashScreen` while it's loading. */}
//       <PersistGate persistor={persistor} loading={<div>Loading...</div>}>
//         <App basename={PUBLIC_URL} />
//       </PersistGate>
//     </Provider>
//   </MetronicI18nProvider>,
//   document.getElementById('root')
// )

/**
 *  New Implementation for react 18 render
 */
if (element) {
	let root = createRoot(element);
	root.render(
		<MetronicI18nProvider>
			<Provider store={store}>
				{/* Asynchronously persist redux stores and show `SplashScreen` while it's loading. */}
				<PersistGate persistor={persistor} loading={<div>Loading...</div>}>
					<App basename={PUBLIC_URL} />
				</PersistGate>
			</Provider>
		</MetronicI18nProvider>
	);
}
