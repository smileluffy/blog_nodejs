/**
 * Created by Administrator on 2015/12/22.
 */
var setting=require("../settings");
   /* Db=require("mongodb").Db,
    Connection = require('mongodb').Connection,
    Server = require('mongodb').Server;
module.exports=new Db(setting.db, new Server(setting.host, setting.port),
    {safe: true});*/


var mongoose = require('mongoose');
mongoose.connect('mongodb://'+setting.host+'/'+setting.db);

module.exports = mongoose;



