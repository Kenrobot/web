define('app/canvas/panels', function(require, exports, module){

/**
 * 
 */

var panelConfig = require("app/canvas/panelConfig");
var canvas = require("app/canvas/canvas");

var ViewPanels = function(el){
    this.$el = $(el);

    this.initEvents();
}

ViewPanels.prototype = {
    constructor: ViewPanels,
    initEvents: function(){
        this.$el.on("click", ".panel-content a", this.onModuleClick.bind(this));
    },

    onModuleClick: function(e){
        e.preventDefault();

        var $self = $(e.currentTarget);
        var conf = $self.data("conf");
        var config = panelConfig[conf];
        if (!config) return;

        var fnName = "draw"+config.shape.substr(0, 1).toUpperCase()+config.shape.substr(1);
        var g = canvas[fnName](config.bgc, config.title);

        if (config.branch){
            g.on("click", this.onBranchStart.bind(this, g));
        }
        
        g.draggable();
        g.dragmove = this.onModuleDragMove.bind(this, g);
        g.dragend = this.onModuleDragEnd.bind(this, g);

    },

    onModuleDragMove: function(el, delta){
        if (el._hasDisconnected){
            return;
        }
        el._hasDisconnected = true;
        canvas.removeFromPositionedGroup(el);
        canvas.disconnect(el);
        canvas.hideTargets(el);
    },

    onModuleDragEnd: function(el, delta, e){
        console.log(delta)
        if (Math.abs(delta.x) < 20 && Math.abs(delta.y) < 40){
            el.dx(-delta.x).dy(-delta.y);
            canvas.showTargets(el);
            return;
        }

        var elIntersect = canvas.getIntersect(el);
        if (elIntersect){
            canvas.connectElements(elIntersect, el);
        }

        canvas.showTargets(el);

        el._hasDisconnected = false;
    },

    onBranchStart: function(el, e){
        $(window)
            .off("mousemove.branch").off("mousedown.branch")
            .on("mousemove.branch", this.onBranchMouseMove.bind(this, el))
            .on("mousedown.branch", this.onBranchEnd.bind(this, el))
    },

    onBranchMouseMove: function(el, e){
        var x1 = e.offsetX - canvas.paper.x(),
            y1 = e.offsetY - canvas.paper.y(),
            x2 = x1 + 5,
            y2 = y1 + 5;
        var elIntersect = canvas.isIntersected(x1, y1, x2, y2);

        if (elIntersect && elIntersect != el){
            canvas.branchTo(el, elIntersect);
        }
    },

    onBranchEnd: function(el, e){
        $(window)
            .off("mousemove.branch")
            .off("mousedown.branch")

        var x1 = e.offsetX - canvas.paper.x(),
            y1 = e.offsetY - canvas.paper.y(),
            x2 = x1 + 5,
            y2 = y1 + 5;
        var elIntersect = canvas.isIntersected(x1, y1, x2, y2);

        if (el.$branchTo != elIntersect){
            el.$branchTo = null;
            el.$branchLine.remove();
        } else {
            el.$branchLine.attr("stroke-dasharray", null)
        }
    }
}

new ViewPanels(".panels");

});