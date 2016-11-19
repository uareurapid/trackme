/**
 * Created by paulocristo on 19/11/2016.
 */
//COMMON FUNCTIONS

function validateEmail(email) {

    var exp = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if( exp.test(email) == false ) {
        return false;
    }
    return true;
}
function checkPasswords() {
    var password = document.getElementsByName("password");
    var confirmPassword = document.getElementsByName("confirm_password");
    if(password && confirmPassword) {
        if(password[0].value === confirmPassword[0].value) {
            return true;
        }
    }
    var container = document.getElementsByName("message_container");
    container[0].innerHTML = '<div class="alert alert-danger">The passwords do not match!</div>';
    return false;
}
function checkFields() {

    //first check the username
    var username = document.getElementsByName("email")[0];
    if(!validateEmail(username.value)) {
        var container = document.getElementsByName("message_container");
        container[0].innerHTML = '<div class="alert alert-danger">The email is not valid!</div>';
        return false;
    }
    //check the passwords
    return checkPasswords();

}