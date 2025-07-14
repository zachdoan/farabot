let state = {
    flag: false,
    id: ''
};

function updateId() {
    if (state.flag) {
        state.id = '1392462088722710678';
    } else {
        state.id = '1390548614035800134';
    }
}

module.exports = {
    updateId,
    state
};
