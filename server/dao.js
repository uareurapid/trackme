var mongoose = require('mongoose');
//for localhost mongoose.connect('mongodb://localhost/my_database');
//for heroku mongodb://<dbuser>:<dbpassword>@ds137100.mlab.com:37100/heroku_h5n41fcw

mongoose.connect('mongodb+srv://heroku_h5n41fcw:<password>@cluster-h5n41fcw.ijl55.mongodb.net/heroku_h5n41fcw?retryWrites=true&w=majority');
//mongoose.connect('mongodb://heroku_h5n41fcw:6kuumtkofp65jf8ac3rald7uu5@ds137100.mlab.com:37100/heroku_h5n41fcw');
