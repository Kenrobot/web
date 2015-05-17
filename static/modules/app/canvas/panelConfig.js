define('app/canvas/panelConfig', function(require, exports, module){

/**
 * panelConfig
 */

module.exports = {
    "if": {
        "bgc": "#04b7d0",
        "title": "条件分支",
        "shape": "polygon",
        "branch": true
    },
    "for": {
        "bgc": "#72b37d",
        "title": "计数循环",
        "shape": "polygon",
        "branch": true
    },
    "whiletrue": {
        "bgc": "#b1cc6b",
        "title": "永远循环",
        "shape": "polygon",
        "branch": true
    },
    "while": {
        "bgc": "#cdd957",
        "title": "条件循环",
        "shape": "polygon",
        "branch": true
    },
    "return": {
        "bgc": "#da4752",
        "title": "返回",
        "shape": "rect",
        "branch": true
    },
    "delay": {
        "bgc": "#8c5694",
        "title": "延时函数",
        "shape": "rect",
        "onConfig": function(){}
    },
    "timing": {
        "bgc": "#faa333",
        "title": "定时函数",
        "shape": "rect",
        "onConfig": function(){}
    },
    "assign": {
        "bgc": "#faa333",
        "title": "赋值函数",
        "shape": "rect",
        "onConfig": function(){}
    },
    "rand": {
        "bgc": "#ebc52c",
        "title": "随机函数",
        "shape": "rect",
        "onConfig": function(){}
    },
    "custom": {
        "bgc": "#88cda0",
        "title": "自定函数",
        "shape": "rect",
        "onConfig": function(){}
    }
}

});