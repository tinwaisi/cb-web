

module.exports = {
    getUserFromSession: function(){
        return JSON.parse(window.sessionStorage.getItem("crewbrick"));
    },
    setUserToSession: (user) => { window.sessionStorage.setItem('crewbrick', JSON.stringify(user));},
    removeUserFromSession: (user) => { window.sessionStorage.removeItem('crewbrick');}
}