'use strict';

var fs = require('fs');
const crypto = require('crypto');
var User = require('../models/userModel');
var ImgUser = require('../models/imgUserModel');

exports.post = (req, res, next) => {
    var usuario = new ImgUser(req.body);
    var runDataInsert = usuario.UserId != '' && usuario.UserId != undefined && usuario.Img != '' && usuario.Img != undefined; 
    if(runDataInsert){
        var dataUser = fs.readFileSync('./src/listOAuth/listUsers.json', 'utf8');
        var arrayDataUser = ((dataUser.replace('[', '')).replace(']','')).split(',\n');
        var dataImgUser = fs.readFileSync('./src/database/listImgUsers.json', 'utf8');
        var arrayDataImgUser = ((dataImgUser.replace('[', '')).replace(']','')).split(',\n');

        var userInfo = null;

        if(dataUser != ''){
            for(var i =0;i<arrayDataUser.length;i++){
                var usuarioClass = JSON.parse(arrayDataUser[i]);
                if(usuario.UserId == crypto.createHash('md5').update(usuarioClass.Id).digest("hex")){
                    userInfo = usuarioClass;
                }
            }
        }

        if(userInfo == null){
            return res.send('No user found!!').status(500);
        }

        var imgUser = new ImgUser({UserId: userInfo.Id,Img: usuario.Img});

        var dataInsert = dataImgUser != '' ? (dataImgUser.replace(']',''))+',\n'+imgUser.Data+']' : '['+imgUser.Data+']';

        fs.writeFile('./src/database/listImgUsers.json', dataInsert, (err) => {
            if (err){
                return res.status(500).send('Ocorreu um erro ao tentar armazenar nao json, porfavor contate o suporte!');
            } 

            return res.status(201).send('Data insert success!');
        });
    }
};
exports.get = (req, res, next) => {
    var token = req.params.token;
    if(token != '' && token != undefined){
        var dataImgUser = fs.readFileSync('./src/database/listImgUsers.json', 'utf8');
        var arrayDataImgUser = ((dataImgUser.replace('[', '')).replace(']','')).split(',\n');

        var imgUserInfo = null;

        if(dataImgUser != ''){
            for(var i =0;i<arrayDataImgUser.length;i++){
                var usuarioImgClass = JSON.parse(arrayDataImgUser[i]);
                if(token == crypto.createHash('md5').update(usuarioImgClass.UserId).digest("hex")){
                    imgUserInfo = usuarioImgClass;
                }
            }
        }

        if(imgUserInfo == null){
            return res.status(500).send('No img of user found!!');
        }

        return res.send(imgUserInfo.Img).status(200);
    }
};