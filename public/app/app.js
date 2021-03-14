import '../sass/main.scss';
import { $, $$ } from './modules/bling';

import storeApp from './modules/store';
import formsApp from './modules/signin';
import bookmarkApp from './modules/bookmark';
import storeFormApp from './modules/storeForm';
import typeAheadApp from './modules/typeAhead';
import deleteReviewApp from './modules/deleteReview';
import registerViewApp from './modules/registerView';
import userLocationApp from './modules/userLocation';

storeApp.init();
formsApp.init();
bookmarkApp.init();
storeFormApp.init();
typeAheadApp.init();
deleteReviewApp.init();
registerViewApp.init();
userLocationApp.init();