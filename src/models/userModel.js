'use strict';

var fs = require('fs');
const crypto = require('crypto');

module.exports = class User{
    constructor(obj){
        this.Id = obj.Id == undefined || obj.Id == null ? this.getNewId() : obj.Id;
        this.Username = obj.Username != undefined ? obj.Username : undefined;
        this.Password = obj.Password != undefined ? this.getPasswordHash(obj.Password) : undefined;
        this.Data = '{"Id": "'+this.Id+'","Username": "'+this.Username+'","Password": "'+this.Password+'"}';
    }

    getNewId(){
        var data = fs.readFileSync('./src/listOAuth/listUsers.json', 'utf8');
        var arrayData = ((data.replace('[', '')).replace(']','')).split(',\n');
        var id = data == '' ? crypto.createHash('md5').update('1').digest("hex") : crypto.createHash('md5').update((arrayData.length+1).toString()).digest("hex");

        return id;
    }
    getPasswordHash(password){
        return crypto.createHash('md5').update(password).digest("hex");
    }
}