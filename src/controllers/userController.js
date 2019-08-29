'use strict';

var fs = require('fs');
const crypto = require('crypto');
var User = require('../models/userModel');
var FriendOfUser = require('../models/friendOfUser');
const socket = require('socket.io');

exports.post = (req, res, next) => {
    const io = require('../../index');
    var usuario = new User(req.body);
    if(usuario.Username != undefined && usuario.Password != undefined && usuario.Password.length > 5){
        var data = fs.readFileSync('./src/listOAuth/listUsers.json', 'utf8');
        var arrayData = ((data.replace('[', '')).replace(']','')).split(',\n');

        if(data != ''){
            for(var i = 0;i<arrayData.length;i++){
                var obj = JSON.parse(arrayData[i]);
                if((obj.Username).toLowerCase() == (usuario.Username).toLowerCase()){
                    return res.status(205).send('Data not can insert, beacause username .. exist in database.');
                }
            }
        }
        
        var dataInsert = data != '' ? (data.replace(']',''))+',\n'+usuario.Data+']' : '['+usuario.Data+']';

        fs.writeFile('./src/listOAuth/listUsers.json', dataInsert, (err) => {
            if (err){
                return res.status(500).send('Ocorreu um erro ao tentar armazenar nao json, porfavor contate o suporte!');
            } 
            io.emit('eventFriendsModify', true);
            return res.status(201).send('Data insert success!');
        });
    }else{
        return res.status(205).send('Invalid params!');
    }
    
};

exports.getAllUsers = (req,res,next) => {
    var idUser = req.params.id;
    ///console.log(idUser);
    var data = fs.readFileSync('./src/listOAuth/listUsers.json', 'utf8');
    var arrayData = ((data.replace('[', '')).replace(']','')).split(',\n');
    
    var users = [];

    if(data != ''){
        for(var i =0;i<arrayData.length;i++){
            var usuarioClass = JSON.parse(arrayData[i]);
            if(idUser != crypto.createHash('md5').update(usuarioClass.Id).digest("hex")){
                users.push(usuarioClass);
            }
        }
    }
    if(users.length == 0){
        return res.status(500).send('No users found!!');
    }
    
    return res.status(200).send(users);
};

exports.getUserInfo = (req,res,next) => {
    var token = req.params.token;
    
    if(token != '' && token != undefined){
        var data = fs.readFileSync('./src/listOAuth/listUsers.json', 'utf8');
        var arrayData = ((data.replace('[', '')).replace(']','')).split(',\n');

        var userInfo = null;

        if(data != ''){
            for(var i =0;i<arrayData.length;i++){
                var usuarioClass = JSON.parse(arrayData[i]);
                if(token == crypto.createHash('md5').update(usuarioClass.Id).digest("hex")){
                    userInfo = usuarioClass;
                }
            }
        }

        if(userInfo == null){
            return res.status(500).send('No information found!!');
        }

        return res.status(200).send(userInfo);
    }else{
        return res.status(500).send('No information found!!');
    }
};

exports.getLogin = (req, res, next) => {
    var usuarioLogin = (req.params.login).split('[$_$]');
    //console.log(usuarioLogin);
    if(usuarioLogin.length > 0 && usuarioLogin[0] != '' && usuarioLogin[1] != ''){
        var data = fs.readFileSync('./src/listOAuth/listUsers.json', 'utf8');
        var arrayData = ((data.replace('[', '')).replace(']','')).split(',\n');
        var token = null;
        if(data != ''){
            for(var i =0;i<arrayData.length;i++){
                var usuarioClass = JSON.parse(arrayData[i]);
                var password = crypto.createHash('md5').update(usuarioLogin[1]).digest("hex");
                if(usuarioClass.Username == usuarioLogin[0] && password == usuarioClass.Password){
                    token = crypto.createHash('md5').update(usuarioClass.Id).digest("hex");
                }
            }
        }
        if(token == null){
            return res.status(202).send(false);
        }

        return res.status(201).send(token);
    }else{
        res.status(205).send('Erro ao efetuar o login.');
    }
};
exports.postFriend = (req, res, next) => {
    const io = require('../../index');
    var request = {
        token: req.body.token,
        IdContactTwo: req.body.IdContactTwo,
        accept: req.body.accept
    }
    var valid = request.token != '' && request.token != undefined && request.IdContactTwo != '' && request.IdContactTwo != undefined;
    if(valid){
        var data = fs.readFileSync('./src/listOAuth/listUsers.json', 'utf8');
        var arrayData = ((data.replace('[', '')).replace(']','')).split(',\n');
        var dataFriends = fs.readFileSync('./src/database/listFriendsOfUsers.json', 'utf8');
        var arrayDataFriends = ((dataFriends.replace('[', '')).replace(']','')).split(',\n');
        
        var idUser = null;

        if(data != ''){
            for(var i =0;i<arrayData.length;i++){
                var usuarioClass = JSON.parse(arrayData[i]);
                if(request.token == crypto.createHash('md5').update(usuarioClass.Id).digest("hex")){
                    idUser = usuarioClass.Id;
                }
            }
        }

        if(idUser == null){
            return res.status(500).send('No user actually found!!');
        }

        var acceptInvite = false;
        var continueInsert = true;

        if(dataFriends != ''){
            for(var i =0;i<arrayDataFriends.length;i++){
                var friendClass = JSON.parse(arrayDataFriends[i]);
                if(idUser == friendClass.IdContactTwo && request.IdContactTwo == friendClass.IdContactOne){
                    acceptInvite = true;
                    continueInsert = false;
                }else if(idUser == friendClass.IdContactOne && request.IdContactTwo == friendClass.IdContactTwo){
                    continueInsert = false;
                }
            }
        }

        var updateData = '';

        if(acceptInvite){
            updateData += '[';
            for(var i =0;i<arrayDataFriends.length;i++){
                var friendClass = JSON.parse(arrayDataFriends[i]);
                if(idUser == friendClass.IdContactTwo && request.IdContactTwo == friendClass.IdContactOne){
                    friendClass.Active = true;
                    if(request.accept){
                        if(i != 0){
                            updateData += ',\n';
                        }
                        updateData += (new FriendOfUser(friendClass)).Data;
                    }
                }else{
                    if(i != 0){
                        updateData += ',\n';
                    }
                    updateData += arrayDataFriends[i];
                }
                
            }
            updateData = updateData == '[' ? '' : updateData+']';

            fs.writeFile('./src/database/listFriendsOfUsers.json', updateData, (err) => {
                if (err){
                    return res.status(500).send('Ocorreu um erro ao tentar armazenar nao json, porfavor contate o suporte!');
                }
                //console.log('adicionou');
                io.emit('eventFriendsModify', true);
                return res.status(201).send('Data insert success!');
            });
        }

        if(!continueInsert){
            return false;
        }

        var friendOfUser = new FriendOfUser({IdContactOne: idUser, IdContactTwo: request.IdContactTwo, Active: false});

        var dataInsert = dataFriends != '' ? (dataFriends.replace(']',''))+',\n'+friendOfUser.Data+']' : '['+friendOfUser.Data+']';
        
        fs.writeFile('./src/database/listFriendsOfUsers.json', dataInsert, (err) => {
            if (err){
                return res.status(500).send('Ocorreu um erro ao tentar armazenar nao json, porfavor contate o suporte!');
            } 
            //console.log('invited');
            io.emit('eventFriendsModify', true);
            return res.status(201).send('Data insert success!');
        });
    }else{
        return res.status(500).send('Request invalid, params invalid!!');
    }
};
exports.getFriends = (req,res,next) => {
    var token = req.params.token;

    if(token != '' && token != undefined){
        var data = fs.readFileSync('./src/listOAuth/listUsers.json', 'utf8');
        var arrayData = ((data.replace('[', '')).replace(']','')).split(',\n');
        var dataFriends = fs.readFileSync('./src/database/listFriendsOfUsers.json', 'utf8');
        var arrayDataFriends = ((dataFriends.replace('[', '')).replace(']','')).split(',\n');

        var userInfo = null;
        var listFriends = [];
        var listFriendsActive = [];
        var listUsersFriends = [];

        if(data != ''){
            for(var i =0;i<arrayData.length;i++){
                var usuarioClass = JSON.parse(arrayData[i]);
                if(token == crypto.createHash('md5').update(usuarioClass.Id).digest("hex")){
                    userInfo = usuarioClass;
                }
            }
        }

        if(userInfo == null){
            return res.status(500).send('No information found!!');
        }

        if(dataFriends != ''){
            for(var i =0;i<arrayDataFriends.length;i++){
                var usuarioFriend = JSON.parse(arrayDataFriends[i]);
                if(userInfo.Id == usuarioFriend.IdContactTwo){
                    if(usuarioFriend.Active){
                        listFriendsActive.push(usuarioFriend.IdContactOne); 
                    }
                    listFriends.push({Id: usuarioFriend.IdContactOne,Invited: false});
                }
                if(userInfo.Id == usuarioFriend.IdContactOne){
                    if(usuarioFriend.Active){
                        listFriendsActive.push(usuarioFriend.IdContactTwo); 
                    }
                    listFriends.push({Id: usuarioFriend.IdContactTwo,Invited: true});
                }
            }
        }

        if(data != ''){
            for(var i =0;i<arrayData.length;i++){
                var usuarioClass = JSON.parse(arrayData[i]);
                var indice = listFriends.findIndex(x => x.Id == usuarioClass.Id);
                if(indice >= 0){
                    usuarioClass.Invited = listFriends[indice].Invited;
                    usuarioClass.Active = listFriendsActive.indexOf(usuarioClass.Id) >= 0 ? true : false;
                    listUsersFriends.push(usuarioClass);
                }
            }
        }

        return res.status(200).send(listUsersFriends);

    }else{
        return res.status(500).send('No information found!!');
    }
}

exports.put = (req, res, next) => {
    
};
exports.deleteFriend = (req, res, next) => {
    const io = require('../../index');
    var information = (req.params.tokenAndIdContact).split('[$_$]');

    var valid = information[0] != '' && information[0] != undefined && information[1] != '' && information[1] != undefined;
    if(valid){
        var data = fs.readFileSync('./src/listOAuth/listUsers.json', 'utf8');
        var arrayData = ((data.replace('[', '')).replace(']','')).split(',\n');
        var dataFriends = fs.readFileSync('./src/database/listFriendsOfUsers.json', 'utf8');
        var arrayDataFriends = ((dataFriends.replace('[', '')).replace(']','')).split(',\n');
        
        var idUser = null;

        if(data != ''){
            for(var i =0;i<arrayData.length;i++){
                var usuarioClass = JSON.parse(arrayData[i]);
                if(information[0] == crypto.createHash('md5').update(usuarioClass.Id).digest("hex")){
                    idUser = usuarioClass.Id;
                }
            }
        }

        if(idUser == null){
            return res.status(500).send('No user actually found!!');
        }

        var updateData = '';

            updateData += '[';
            for(var i =0;i<arrayDataFriends.length;i++){
                var friendClass = JSON.parse(arrayDataFriends[i]);
                if((idUser == friendClass.IdContactOne && information[1] == friendClass.IdContactTwo) || (idUser == friendClass.IdContactTwo && information[1] == friendClass.IdContactOne)){
                    
                }else{
                    if(i != 0){
                        updateData += ',\n';
                    }
                    updateData += arrayDataFriends[i];
                }
                
            }
            updateData = updateData == '[' ? '' : updateData+']';

            fs.writeFile('./src/database/listFriendsOfUsers.json', updateData, (err) => {
                if (err){
                    return res.status(500).send('Ocorreu um erro ao tentar armazenar nao json, porfavor contate o suporte!');
                }
                //console.log('adicionou');
                io.emit('eventFriendsModify', true);
                return res.status(201).send('Data insert success!');
            });
        
    }else{
         return res.status(500).send('Request invalid, params invalid!!');
    }
};