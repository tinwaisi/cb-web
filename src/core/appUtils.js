

module.exports = {
    getUserFromSession: function(){
        return JSON.parse(window.localStorage.getItem("crewbrick"));
    },
    setUserToSession: (user) => { window.localStorage.setItem('crewbrick', JSON.stringify(user));},
    removeUserFromSession: (user) => { window.localStorage.removeItem('crewbrick');}
}