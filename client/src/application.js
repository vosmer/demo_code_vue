import Vue from 'vue';

import Store from './store';
import Application from './components/application.vue';
import Api from './services/api';
import Router from './services/router';
import I18n from './services/i18n';
import localeLanguageForElementUI from 'element-ui/lib/locale/lang/ru-RU';
import localeForElementUI from 'element-ui/lib/locale';
//import Socket from './services/socket';
import dotenv from 'dotenv';
import ApplicationAdmin from './components/application-admin.vue';
import ElementUI from 'element-ui'; //http://element.eleme.io/#/en-US/component/layout 2.4.8

// configure localization for Element UI
localeForElementUI.use(localeLanguageForElementUI);
Vue.use(ElementUI);

Api.init();
dotenv.config();
/*Socket.init(process.env.VUE_APP_WEBSOCKET_SERVER);*/

let pathisAdmin = (window.location.pathname.indexOf('/admin') === 0);
let application = new Vue({
	el: '#application',
	template: '<application></application>',
	components: {
		application: (pathisAdmin)?ApplicationAdmin:Application
	},
	store: Store,
	router: Router.getInstance(),
    i18n: I18n.getInstance(),
});

require('./assets/stylesheets/application.scss');
require('./assets/javascripts/assets.js');
