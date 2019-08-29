'use strict';

var fs = require('fs');
const crypto = require('crypto');

module.exports = class ImgUser{
    constructor(obj){
        this.UserId = obj.UserId;
        this.Img = obj.Img;
        this.Data = '{"UserId": "'+this.UserId+'","Img": "'+this.Img+'"}';
    }
}