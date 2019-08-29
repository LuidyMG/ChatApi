'use strict';

var fs = require('fs');
const crypto = require('crypto');

module.exports = class FriendOfUser{
    constructor(obj){
        this.IdContactOne = obj.IdContactOne;
        this.IdContactTwo = obj.IdContactTwo;
        this.Active = obj.Active;
        this.Data = '{"IdContactOne": "'+this.IdContactOne+'","IdContactTwo": "'+this.IdContactTwo+'","Active": '+this.Active+'}';
    }
}