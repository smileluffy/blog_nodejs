/**
 * Created by Administrator on 2015/12/23.
 */
var mongoose = require('./db'),
    markdown = require('markdown').markdown;


var postSchema = new mongoose.Schema({
    name: String,
    head: String,
    time: {},
    title: String,
    tags: Array,
    post: String,
    comments:Array,
    reprint_info:{
        reprint_id : {},
        reprint_num : Number

    },
    pv:Number
}, {
    collection: 'posts'
});

var postModel = mongoose.model('Post', postSchema);

function Post(name, head,title,tags, post) {
    this.name = name;
    this.head = head;
    this.title = title;
    this.tags = tags;
    this.post = post;

}

module.exports = Post;

//存储一篇文章及其相关信息
Post.prototype.save = function(callback) {
    console.log("test..in");
    var date = new Date();
    //存储各种时间格式，方便以后扩展
    var time = {
        date: date,
        year : date.getFullYear(),
        month : date.getFullYear() + "-" + (date.getMonth() + 1),
        day : date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate(),
        minute : date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " +
        date.getHours() + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes())
    }
    //要存入数据库的文档
    var post = {
        name: this.name,
        head: this.head,
        time: time,
        title: this.title,
        tags: this.tags,
        post: this.post,
        comments: [],
        reprint_info: {},
        pv: 0
    };
    var newPost=new  postModel(post);
    /*//打开数据库
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }
        //读取 posts 集合
        db.collection('posts', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            //将文档插入 posts 集合
            collection.insert(post, {
                safe: true
            }, function (err) {
                mongodb.close();
                if (err) {
                    return callback(err);//失败！返回 err
                }
                callback(null);//返回 err 为 null
            });
        });
    });*/

    newPost.save(function(err,post){
        if(err){
            return callback(err);
        }
        callback(null,post);

    });
};

//读取文章及其相关信息
Post.getTen= function(name, page,callback) {
    /*//打开数据库
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }
        //读取 posts 集合
        db.collection('posts', function(err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            var query = {};
            if (name) {
                query.name = name;
            }
            //使用 count 返回特定查询的文档数 total
            collection.count(query,function(err,total){
                //根据 query 对象查询，并跳过前 (page-1)*10 个结果，返回之后的 10 个结果
                collection.find(query,{
                    skip: (page-1)*10,
                    limit:10
                }).sort({
                    time: -1
                }).toArray(function(err,docs){
                    mongodb.close();
                    if (err) {
                        return callback(err);
                    }
                    //解析 markdown 为 html
                    docs.forEach(function (doc) {
                        doc.post = markdown.toHTML(doc.post);
                    });
                    callback(null, docs, total);
                });

            });

        });
    });*/
    var query = {};
    if (name) {
        query.name = name;
    }

    postModel.count(query,function(err,total){
       // console.log("total: "+total);
        postModel.find(query)
            .limit(10)
            .skip((page-1)*10)
            .sort({
                time: -1
            })
            .exec(function(err,docs){
               // console.log("test....");
                if (err) {
                    return callback(err);
                }
                //解析 markdown 为 html
                docs.forEach(function (doc) {
                   // console.log("doc.post: "+doc.post);
                    doc.post = markdown.toHTML(doc.post);
                });
                callback(null, docs, total);
            });


    });
};

//获取一篇文章
Post.getOne = function(_id, callback) {
    /*//打开数据库
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }
        //读取 posts 集合
        db.collection('posts', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            //根据用户名、发表日期及文章名进行查询
            collection.findOne({
                "name": name,
                "time.day": day,
                "title": title
            }, function (err, doc) {

                if (err) {
                    mongodb.close();
                    return callback(err);
                }
                //解析 markdown 为 html
                if(doc){
                    //每访问 1 次，pv 值增加 1
                    collection.update({
                        "name": name,
                        "time.day": day,
                        "title": title
                    }, {
                        $inc: {"pv": 1}
                    }, function (err) {
                        mongodb.close();
                        if (err) {
                            return callback(err);
                        }
                    });
                    doc.post = markdown.toHTML(doc.post);
                    doc.comments.forEach(function (comment) {
                        comment.content = markdown.toHTML(comment.content);
                    });
                }

                callback(null, doc);//返回查询的一篇文章
            });
        });
    });*/

    postModel.findOneAndUpdate({
        "_id" : _id
    },{$inc: {"pv": 1}},{new: true},function(err,doc){
        if (err) {
            return callback(err);

        }

        if(doc){
            doc.post = markdown.toHTML(doc.post);
            doc.comments.forEach(function (comment) {
                comment.content = markdown.toHTML(comment.content);
            });
        }

        callback(null, doc);//返回查询的一篇文章

    });
};

//返回原始发表的内容（markdown 格式）
Post.edit = function(_id, callback) {
    postModel.findOne({
       "_id" : _id
    },function(err,doc){
        if (err) {
            return callback(err);
        }
        callback(null, doc);//返回查询的一篇文章（markdown 格式）
    });

   /* //打开数据库
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }
        //读取 posts 集合
        db.collection('posts', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            //根据用户名、发表日期及文章名进行查询
            collection.findOne({
                "name": name,
                "time.day": day,
                "title": title
            }, function (err, doc) {
                mongodb.close();
                if (err) {
                    return callback(err);
                }
                callback(null, doc);//返回查询的一篇文章（markdown 格式）
            });
        });
    });*/
};

//更新一篇文章及其相关信息
Post.update = function(_id, post, callback) {

    postModel.findOne({
       "_id" : _id
    },function(err,doc){
        if (err) {
            return callback(err);
        }
        doc.post=post;
        doc.save();
        callback(null);
    });



   /* //打开数据库
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }
        //读取 posts 集合
        db.collection('posts', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            //更新文章内容
            collection.update({
                "name": name,
                "time.day": day,
                "title": title
            }, {
                $set: {post: post}
            }, function (err) {
                mongodb.close();
                if (err) {
                    return callback(err);
                }
                callback(null);
            });
        });
    });*/
};

//删除一篇文章
Post.remove = function(id, callback) {



    postModel.findOne({
        "_id" : id
    },function(err,doc){

        if(err){
            callback(err);
        }
        var reprint_id = "";
        if (doc.reprint_info.reprint_id) {
            reprint_id = doc.reprint_info.reprint_id;
        }

        if (reprint_id != "") {
            postModel.findOneAndUpdate({
                "_id" : reprint_id
            },{
                "$inc": {'reprint_info.reprint_num': -1}
            },function(err,doc){

                if (err)
                callback(err);
            });


        }

        postModel.remove({
            "_id" : id
        },function(err,doc){
            if(err)
            callback(err);

            callback(null);
        });


    });

    /*
    //打开数据库
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }
        //读取 posts 集合
        db.collection('posts', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            collection.findOne({
                "name": name,
                "time.day": day,
                "title": title
            }, function (err, doc) {
                if (err) {
                    mongodb.close();
                    return callback(err);
                }
                //如果有 reprint_from，即该文章是转载来的，先保存下来 reprint_from
                var reprint_from = "";
                if (doc.reprint_info.reprint_from) {
                    reprint_from = doc.reprint_info.reprint_from;
                }
                if (reprint_from != "") {
                    //更新原文章所在文档的 reprint_to
                    collection.update({
                        "name": reprint_from.name,
                        "time.day": reprint_from.day,
                        "title": reprint_from.title
                    }, {
                        $pull: {
                            "reprint_info.reprint_to": {
                                "name": name,
                                "day": day,
                                "title": title
                            }}
                    }, function (err) {
                        if (err) {
                            mongodb.close();
                            return callback(err);
                        }
                    });
                }

                //删除转载来的文章所在的文档
                collection.remove({
                    "name": name,
                    "time.day": day,
                    "title": title
                }, {
                    w: 1
                }, function (err) {
                    mongodb.close();
                    if (err) {
                        return callback(err);
                    }
                    callback(null);
                });
            });
        });
    });*/
};



Post.setComment=function(pid,comment,callback){
    postModel.findOneAndUpdate({
        "_id" : pid
    },{
        $push: {"comments": comment}
    },
        {
            new: true
        },function(err,doc){
        if (err) {
            return callback(err);
        }
        callback(null);

    });
}



//返回所有文章存档信息
Post.getArchive = function(callback) {

    postModel.find({},{
            "name": 1,
            "time": 1,
            "title": 1
    })
        .sort({
            time: -1
        })
        .exec(function (err, docs) {

            if (err) {
                return callback(err);
            }
            callback(null, docs);
        });

    /*
    //打开数据库
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }
        //读取 posts 集合
        db.collection('posts', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            //返回只包含 name、time、title 属性的文档组成的存档数组
            collection.find({}, {
                "name": 1,
                "time": 1,
                "title": 1
            }).sort({
                time: -1
            }).toArray(function (err, docs) {
                mongodb.close();
                if (err) {
                    return callback(err);
                }
                callback(null, docs);
            });
        });
    });
    */
};

//返回所有标签
Post.getTags = function(callback) {

    postModel.distinct("tags",function(err,docs){
        if(err){
            callback(err);
        }
        callback(null,docs);
    });

    /*
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }
        db.collection('posts', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            //distinct 用来找出给定键的所有不同值
            collection.distinct("tags", function (err, docs) {
                mongodb.close();
                if (err) {
                    return callback(err);
                }
                callback(null, docs);
            });
        });
    });*/
};

//返回含有特定标签的所有文章
Post.getTag = function(tag, callback) {

    postModel.find({
            "tags": tag
    },{
            "name": 1,
            "time": 1,
            "title": 1
    })
        .sort({
            time: -1
        })
        .exec(function(err,docs){
            if (err) {
                return callback(err);
            }
            callback(null, docs);
        });


    /*
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }
        db.collection('posts', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            //查询所有 tags 数组内包含 tag 的文档
            //并返回只含有 name、time、title 组成的数组
            collection.find({
                "tags": tag
            }, {
                "name": 1,
                "time": 1,
                "title": 1
            }).sort({
                time: -1
            }).toArray(function (err, docs) {
                mongodb.close();
                if (err) {
                    return callback(err);
                }
                callback(null, docs);
            });
        });
    });*/
};

//返回通过标题关键字查询的所有文章信息
Post.search = function(keyword, callback) {

    var pattern = new RegExp(keyword, "i");
    postModel.find({
            "title": pattern
        },{
            "name": 1,
            "time": 1,
            "title": 1
        })
        .sort({
            time: -1
        })
        .exec(function(err,docs){
            if (err) {
                return callback(err);
            }
            callback(null, docs);
        });

    /*
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }
        db.collection('posts', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            var pattern = new RegExp(keyword, "i");
            collection.find({
                "title": pattern
            }, {
                "name": 1,
                "time": 1,
                "title": 1
            }).sort({
                time: -1
            }).toArray(function (err, docs) {
                mongodb.close();
                if (err) {
                    return callback(err);
                }
                callback(null, docs);
            });
        });
    });*/
};

//转载一篇文章
Post.reprint = function(id, currentUser, callback) {
   /* ,{
        "$inc": {'reprint_info.reprint_num': 1}
    },*/

    postModel.findOneAndUpdate({
        "_id" : id
    },{
        "$inc": {'reprint_info.reprint_num': 1}
    },function(err,doc){

        if (err) {
            return callback(err);

        }

        var date = new Date();
        var time = {
            date: date,
            year : date.getFullYear(),
            month : date.getFullYear() + "-" + (date.getMonth() + 1),
            day : date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate(),
            minute : date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " +
            date.getHours() + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes())
        }
       // delete (doc._id);//注意要删掉原来的 _id
        doc._id = null;
        console.log("_id1:   "+doc._id);
        doc.reprint_info.reprint_id = id;
        doc.reprint_info.reprint_num = 0;
        doc.name = currentUser.name;
        doc.head = currentUser.head;
        doc.time = time;
        doc.title = doc.title.match(/^\[转\]/) ? doc.title : "[转]" + doc.title;
        doc.comments = [];
        doc.pv = 0;

        doc.save(function (err, product, numAffected) {
            console.log('%s has been saved', product._id);
        });
       // var d =new  postModel(doc);
     /*   d.save(function(err,doc){
            if(err)
            callback(err);
           // console.log("do---:   "+doc._id);
            postSchema.post('save', function(doc) {
                console.log('%s has been saved', doc._id);
                callback(null,null);
            });

        });*/

       /* d.save().then(function(product) {
            console.log('%s has been saved', product._id);
        });*/

        //console.log("do---:   "+d._id);

      //  console.log("do--1-:   "+d);

        /*postModel.create(doc,function(err,doc){
            console.log("_id:   "+doc._id);
            callback(null, doc);//返回查询的一篇文章
        })*/
        //doc.save();



    });


    /*
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }
        db.collection('posts', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            //找到被转载的文章的原文档
            collection.findOne({
                "name": reprint_from.name,
                "time.day": reprint_from.day,
                "title": reprint_from.title
            }, function (err, doc) {
                if (err) {
                    mongodb.close();
                    return callback(err);
                }

                var date = new Date();
                var time = {
                    date: date,
                    year : date.getFullYear(),
                    month : date.getFullYear() + "-" + (date.getMonth() + 1),
                    day : date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate(),
                    minute : date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " +
                    date.getHours() + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes())
                }

                delete doc._id;//注意要删掉原来的 _id

                doc.name = reprint_to.name;
                doc.head = reprint_to.head;
                doc.time = time;
                doc.title = (doc.title.search(/[转载]/) > -1) ? doc.title : "[转载]" + doc.title;
                doc.comments = [];
                doc.reprint_info = {"reprint_from": reprint_from};
                doc.pv = 0;

                //更新被转载的原文档的 reprint_info 内的 reprint_to
                collection.update({
                    "name": reprint_from.name,
                    "time.day": reprint_from.day,
                    "title": reprint_from.title
                }, {
                    $push: {
                        "reprint_info.reprint_to": {
                            "name": doc.name,
                            "day": time.day,
                            "title": doc.title
                        }}
                }, function (err) {
                    if (err) {
                        mongodb.close();
                        return callback(err);
                    }
                });

                //将转载生成的副本修改后存入数据库，并返回存储后的文档
                collection.insert(doc, {
                    safe: true
                }, function (err, post) {
                    mongodb.close();
                    if (err) {
                        return callback(err);
                    }
                    callback(err, post[0]);
                });
            });
        });
    });*/
};