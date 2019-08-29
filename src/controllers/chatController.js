'use strict';

var fs = require('fs');
const crypto = require('crypto');
const socket = require('socket.io');
var Mensage = require('../models/chatModel');

exports.post = (req, res, next) => {
    const io = require('../../index');
    var idsChat = req.body;
    
    if(idsChat.token != '' && idsChat.token != undefined && idsChat.idFriend != '' && idsChat.idFriend != undefined){
        var data = fs.readFileSync('./src/listOAuth/listUsers.json', 'utf8');
        var arrayData = ((data.replace('[', '')).replace(']','')).split(',\n');
        
        var userInfo = null;

        if(data != ''){
            for(var i =0;i<arrayData.length;i++){
                var usuarioClass = JSON.parse(arrayData[i]);
                if(idsChat.token == crypto.createHash('md5').update(usuarioClass.Id).digest("hex")){
                    userInfo = usuarioClass;
                }
            }
        }

        fs.readdir("./src/database/mensages", function(err, files){
            var mensage = {
                SendToken: idsChat.token,
                Send: userInfo.Id,
                Hour: idsChat.hour,
                To: idsChat.idFriend,
                Mensage: idsChat.mensage
            }

            var mensageInsert = new Mensage(mensage);
            var returnSokect = {
                SendToken: mensageInsert.SendToken,
                Send: mensageInsert.Send,
                To: mensageInsert.To,
                ToToken: crypto.createHash('md5').update(mensageInsert.To).digest("hex"),
                Hour: mensageInsert.Hour,
                Mensage: mensageInsert.Mensage
            }
            
            if(files.length == 0){
                var dataChat =  '['+mensageInsert.Data+']';
                fs.writeFile('./src/database/mensages/'+userInfo.Id+'[$_$]'+idsChat.idFriend+'.json', dataChat,function(err){
                    if(err)
                        console.log(err);
                    io.emit('eventRequestMensage', returnSokect);
                    return res.status(201).send('Data insert success!');
                });
            }else{
                var fileUse = null;
                files.map((file) => file == userInfo.Id+'[$_$]'+idsChat.idFriend+'.json' || file == idsChat.idFriend+'[$_$]'+userInfo.Id+'.json' ? fileUse = file : '');
                if(fileUse == null){
                    var dataChat =  '['+mensageInsert.Data+']';

                    fs.writeFile('./src/database/mensages/'+userInfo.Id+'[$_$]'+idsChat.idFriend+'.json', dataChat,function(err){
                        if(err)
                            console.log(err);
                        io.emit('eventRequestMensage', returnSokect);
                        return res.status(201).send('Data insert success!');
                    });
                }else{
                    var dataChat = fs.readFileSync('./src/database/mensages/'+fileUse, 'utf8');
                    var arrayDataChat = ((dataChat.replace('[', '')).replace(']','')).split(',\n');

                    dataChat = dataChat != '' ? (dataChat.replace(']',''))+',\n'+mensageInsert.Data+']' : '['+mensageInsert.Data+']';

                    fs.writeFile('./src/database/mensages/'+fileUse, dataChat, (err) => {
                        if (err){
                            return res.status(500).send('Ocorreu um erro ao tentar armazenar o json, porfavor contate o suporte!');
                        } 
                        io.emit('eventRequestMensage', returnSokect);
                        return res.status(201).send('Data insert success!');
                    });
                }
            }
        });
    }else{
        return res.status(500).send('Params invalid!');
    }
}

exports.get = (req, res,next) => {
    var idsChat = (req.params.idsChat).split('[$_$]');
    if(idsChat[0] != '' && idsChat[0] != undefined && idsChat[1] != '' && idsChat[1] != undefined){
        var data = fs.readFileSync('./src/listOAuth/listUsers.json', 'utf8');
        var arrayData = ((data.replace('[', '')).replace(']','')).split(',\n');
        
        var userInfo = null;

        if(data != ''){
            for(var i =0;i<arrayData.length;i++){
                var usuarioClass = JSON.parse(arrayData[i]);
                if(idsChat[0] == crypto.createHash('md5').update(usuarioClass.Id).digest("hex")){
                    userInfo = usuarioClass;
                }
            }
        }
        if(userInfo != null){
            fs.readdir("./src/database/mensages", function(err, files){
                var fileUse = null;
                for(var i = 0;i<files.length;i++){
                    if(files[i] === userInfo.Id+'[$_$]'+idsChat[1]+'.json' || files[i] === idsChat[1]+'[$_$]'+userInfo.Id+'.json'){
                        fileUse = files[i];
                    }
                }
                //files.map((file) => (file == userInfo.Id+'[$_$]'+idsChat[1]+'.json' || file == idsChat[i]+'[$_$]'+userInfo.Id+'.json') ? fileUse = file : '');
                
                if(fileUse != null){
                    var dataChat = fs.readFileSync('./src/database/mensages/'+fileUse, 'utf8');
                    var arrayDataChat = ((dataChat.replace('[', '')).replace(']','')).split(',\n');

                    var chatReturn = [];
                    if(dataChat != '')
                        arrayDataChat.map((dataChat) => chatReturn.push(JSON.parse(dataChat)));

                    res.send(chatReturn).status(201);
                }else{
                    res.send(false).status(500);
                }
            });
        }else{
            console.log('Not found user information!');
            res.send(false).status(500);
        }
    }else{
        console.log('Error invalid params');
        res.send(false).status(500);
    }
}