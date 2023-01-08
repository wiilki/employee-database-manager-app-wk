function role(actions) {
    if (`${actions}` === 'View All Roles') {
        console.log('VIEW ROLES');
    } else if (`${actions}` === 'Add Role') {
        console.log('ADD ROLE');
    }
}

module.exports = role;