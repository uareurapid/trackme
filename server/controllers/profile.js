/**
 * Created by paulocristo on 31/10/15.
 */

var ProfileControler =  function(req,res) {

};

ProfileControler.remoteLogin = function(req,res,next,passport){

    passport.authenticate('local-login', function(err, user, info) {
        if (err) {
            return res.status(500).json({err: err});
        }
        if (!user) {
            return res.status(401).json({err: info});
        }
        req.logIn(user, function(err) {
            if (err) {
                return res.status(500).json({err: 'Could not log in user'});
            }
            console.log("request headers: " + JSON.stringify(req.headers));
            res.status(200).json({status: 'Login successful!',email:user.local.email});
            //res.header("Location","http://www.sapo.pt");

        });
    })(req, res, next);
};

ProfileControler.remoteSignup = function(req,res,next,passport){

    passport.authenticate('local-login', function(err, user, info) {
        if (err) {
            return res.status(500).json({err: err});
        }
        if (!user) {
            return res.status(401).json({err: info});
        }
        req.logIn(user, function(err) {
            if (err) {
                return res.status(500).json({err: 'Could not log in user'});
            }
            console.log("request headers: " + JSON.stringify(req.headers));
            res.status(200).json({status: 'Login successful!',email:user.local.email});
            //res.header("Location","http://www.sapo.pt");

        });
    })(req, res, next);
};

module.exports = ProfileControler;