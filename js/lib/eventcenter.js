var handlers = {};
var delayTriggerArgs = {};
define({
    bind: function (widget,type,callback) {
        if (!handlers[widget+'_'+type])
             handlers[widget+'_'+type] = [];
        handlers[widget+'_'+type].push(callback);
        //检测
        if (delayTriggerArgs[widget+'_'+type]){
            for (var i = 0 ; i < delayTriggerArgs[widget+'_'+type].length ; i ++){
                callback && callback(delayTriggerArgs[widget+'_'+type][i])
            }
        }
    },
    unbind:function(widget,type,callback) {
        if (!handlers[widget+'_'+type])
             return;
        var handler = handlers[widget+'_'+type];
        for (var i = 0; i < handler.length; i++) {
            if (handler[i].toString()==callback.toString()){
                handler.splice(i,1);
                break;
            }
        }
    },
    trigger: function (widget,type,args) {
        var handler = handlers[widget+'_'+type];
        if (!handler)
            return;
        for (var i = 0; i < handler.length; i++) {
            handler[i] && handler[i](args);
        }
    },
    delaytrigger: function(widget,type,args){
        
        //存入
        if (!delayTriggerArgs[widget+'_'+type]) {
            delayTriggerArgs[widget+'_'+type] = [];
        }
        delayTriggerArgs[widget+'_'+type].push(args);
        //执行
        this.trigger(widget,type,args);
    }
});