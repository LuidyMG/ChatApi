'use strict';

var fs = require('fs');
const crypto = require('crypto');

module.exports = class Mensage{
    constructor(obj){
        this.Send = obj.Send;
        this.SendToken = obj.SendToken;
        this.Hour = obj.Hour;
        this.To = obj.To;
        this.Mensage = obj.Mensage;
        this.View = false;
        this.Data = '{"Send": "'+this.Send+'","SendToken": "'+this.SendToken+'", "To": "'+this.To+'", "Mensage": "'+this.Mensage+'", "Hour": "'+this.Hour+'","View":"'+this.View+'"}';
    }
}