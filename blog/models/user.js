/**
 * Created by Administrator on 2015/12/23.
 */
var mongoose=require("./db");
var crypto = require('crypto');
//var mongoose = require('mongoose');


var userSchema = new mongoose.Schema({
    name: String,
    password: String,
    email: String,
    head: String
},{
    collection: 'users'
});

var userModel=mongoose.model('User',userSchema);

function User(user){
    this.name = user.name;
    this.password = user.password;
    this.email = user.email;
};



User.prototype.save=function(callback){
    var md5 = crypto.createHash('md5'),
        email_MD5 = md5.update(this.email.toLowerCase()).digest('hex'),
        head = "http://www.gravatar.com/avatar/" + email_MD5 + "?s=48";
    //要存入数据库的用户文档
    var user = {
        name: this.name,
        password: this.password,
        email: this.email,
        head: head
    };
    /*
    mongodb.open(function(err,db){
        if(err)
        return callback(err);

        db.collection('users',function(err,collection){
            if(err){
                mongodb.close();
                return callback(err);
            }

            collection.insert(user,{safe:true},function(err,user){
                mongodb.close;
                if(err)
                return callback(err);

                callback(null,user[0]);
            });

        });
    });
*/
    var newUser =  new  userModel(user);

    newUser.save(function (err, user) {
            if (err) {
                return callback(err);
            }
            callback(null, user);
        });



};

User.get=function(name,callback){
    /*
    //打开数据库
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);//错误，返回 err 信息
        }
        //读取 users 集合
        db.collection('users', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);//错误，返回 err 信息
            }
            //查找用户名（name键）值为 name 一个文档
            collection.findOne({
                name: name
            }, function (err, user) {
                mongodb.close();
                if (err) {
                    return callback(err);//失败！返回 err 信息
                }
                callback(null, user);//成功！返回查询的用户信息
            });
        });
    });*/

    userModel.findOne({name: name}, function (err, user) {
        if (err) {
            return callback(err);
        }
        callback(null, user);
    });




};

module.exports=User;

