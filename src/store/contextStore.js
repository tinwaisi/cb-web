import { createStore } from 'redux'

var currentUser = null;
function update(state = 0, action) {
  switch (action.type) {
  case 'INIT_CURRENT_USER':
    currentUser = action.currentUser;
    break;
  case 'LOGOUT':
    return currentUser = null;
    break;
  default:
    return state
    break;
  }
}


// Create a Redux store holding the state of your app.
// Its API is { subscribe, dispatch, getState }.
var store = createStore(update);



// You can use subscribe() to update the UI in response to state changes.
// Normally you'd use a view binding library (e.g. React Redux) rather than subscribe() directly.
// However it can also be handy to persist the current state in the localStorage.

store.subscribe(() =>
  console.log(store.getState())
)

store.getCurrentUser = () => {return currentUser};
// The only way to mutate the internal state is to dispatch an action.
// The actions can be serialized, logged or stored and later replayed.
export default store;