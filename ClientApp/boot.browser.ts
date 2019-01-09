import '@app/index';
import '@views/index';

import { ko, history } from '@app/providers';

// init history for current state
history.initState({}, location.pathname);

// apply root viewModel with current router
ko.applyBindings({ router: ko.router.current }, document.documentElement);

ko.utils.extend(window, { ko });