import ReactDOM from 'react-dom';

/**
 * React 19 removed the public ReactDOM.findDOMNode API, but a few legacy
 * dependencies (e.g. react-transition-group) still call it. Some of our routes,
 * like Station Trading, pull those dependencies indirectly which causes a crash.
 *
 * React still ships the internal implementation on
 * `__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.findDOMNode`, so we can
 * safely re-export that implementation to keep those libraries working until
 * they ship React 19 compatible releases.
 */
const internals = ReactDOM.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;

if (
  typeof ReactDOM.findDOMNode !== 'function' &&
  internals &&
  typeof internals.findDOMNode === 'function'
) {
  ReactDOM.findDOMNode = internals.findDOMNode;
}
