define('app/canvas/canvas', function(require, exports, module){

/**
 * canvas
 */


var drawCanvas = function(){
    var paper = this.paper = SVG("canvas-svg").group();
    paper.cx(paper.parent.node.offsetWidth/2).cy(paper.parent.node.offsetHeight/2)
    this.centerPos = {
        x: paper.node.offsetWidth / 2,
        y: paper.node.offsetHeight / 2
    }

    this.initArrowMarker();

    this.gPositioned = paper.group();
    this.gPositioned.add(this.drawBeginShape());

    SVG.on(window, "mousewheel", function(e){
        paper.dy(-e.deltaY)
    });

    this.$selected = [];

    paper.parent.on("click", this.onPaperClick.bind(this));
}

drawCanvas.prototype = {
    constructor: drawCanvas,

    initArrowMarker: function(){
        var marker = this.markerArrow = this.paper.marker(11, 12, function(add) {
            add.path("M2,2 L2,11 L10,6 L2,2").attr({
                fill: "#c4c4c4"
            });
        })
    },

    drawRoundRect: function(bgc, title){
        var paper = this.paper;
        var g = paper.group();
        var width = 100,
            height = 36

        var rect = g.rect(width, height).radius(20).attr({
            fill: bgc,
            stroke: bgc,
            "stroke-width": 2
        });

        g.text(title).center(rect.x() + rect.width() / 2, rect.y() + rect.height() / 2);

        g.on("click", this.onSelect.bind(this, g));

        g.linkable = true;

        return g;
    },

    drawArrow: function(p){
        return this.paper.path(p).attr({
            "stroke": "#c4c4c4",
            "stroke-width": "1",
            "fill": "none"
        }).marker("end", this.markerArrow);
    },

    drawRect: function(bgc, title){
        var paper = this.paper;
        var g = paper.group();
        var width = 100,
            height = 36

        var rect = g.rect(width, height).attr({
            fill: bgc,
            stroke: bgc,
            "stroke-width": 2
        });

        g.text(title).center(rect.x() + rect.width() / 2, rect.y() + rect.height() / 2);

        g.on("click", this.onSelect.bind(this, g));

        g.linkable = true;

        return g;
    },

    drawPolygon: function(bgc, title){
        var paper = this.paper;
        var g = paper.group();

        var path = g.path("M16,0 L0,18 L16,36 L84,36 L100,18 L84,0Z").attr({
            fill: bgc,
            stroke: bgc,
            "stroke-width": 2
        });
        g.text(title).center(path.x() + path.width() / 2, path.y() + path.height() / 2);

        g.on("click", this.onSelect.bind(this, g));

        g.linkable = true;

        return g;
    },

    drawBeginShape: function(){
        var g = this.drawRoundRect("#ee7559", "开始");
        g.center(this.centerPos.x, this.centerPos.y);

        return g;
    },

    drawEndShape: function(){
        var g = this.drawRoundRect("#ee7559", "结束");
        g.center(this.centerPos.x, 200);
    },

    connectElements: function(el, elTarget){
        var elShape = el.first(),
            elTargetShape = elTarget.first();
        var y = el.y()+elShape.height(), x = el.cx();
        elTarget.y(y+50).x(el.x());

        y = y + 15;
        var line = this.drawArrow("M"+x+","+y+" L"+x+","+(y+20));

        el.$target = elTarget;
        el.$line && el.$line.remove();
        el.$line = line;
        elTarget.$related = el;

        this.gPositioned.add(elTarget);
    },

    disconnect: function(el){
        var elRelated = el.$related,
            elTarget = el.$target;
        if (!elRelated) return;

        elRelated.$line.remove();

        el.$related = null;
    },

    hideTargets: function(el){
        var elTarget = el.$target;

        el.$line && el.$line.remove();
        while (elTarget){
            elTarget.$line && elTarget.$line.remove();
            elTarget.$branchLine && elTarget.$branchLine.remove();
            elTarget.hide();

            elTarget = elTarget.$target;
        }
    },

    showTargets: function(el){
        var elRelated = el;
        var elTarget = el.$target;

        if (elRelated.$branchTo){
            this.branchTo(elRelated, elRelated.$branchTo);
        }

        while (elTarget){
            elTarget.show();
            this.connectElements(elRelated, elTarget);
            if (elTarget.$branchTo){
                this.branchTo(elTarget, elTarget.$branchTo, true);
            }

            elRelated = elTarget;
            elTarget = elTarget.$target;
        }
    },

    branchTo: function(el, elTarget, isSolid){
        var x = el.x(), y = el.cy();

        if (elTarget){
            el.$branchLine && el.$branchLine.remove();
            el.$branchLine = this.drawArrow(
                "M" + (x - 10) + "," + y + " " +
                "L" + (x - 30) + "," + y + " " +
                "L" + (x - 30) + "," + elTarget.cy() + "" +
                "L" + (x - 10) + "," + elTarget.cy()
            );
            !isSolid && el.$branchLine.attr("stroke-dasharray", "5,5");
            el.$branchTo = elTarget;
        }
    },

    isIntersected: function(x1, y1, x2, y2){
        var g = this.gPositioned;

        var ret;
        g.each(function(i, child){
            if (ret) return;

            var shape = this.first();

            var left = Math.max(this.x(), x1),
                right = Math.min(this.x()+shape.width(), x2),
                top = Math.max(this.y(), y1),
                bottom = Math.min(this.y()+shape.height(), y2);

            if (left <= right && top <= bottom){
                ret = this;
                return;
            }
        });

        return ret;
    },

    getIntersect: function(el){
        var shape = el.first();
        var x1 = el.x(),
            x2 = x1 + shape.width(),
            y1 = el.y(),
            y2 = y1 + shape.height();

        var ret = this.isIntersected(x1, y1, x2, y2);
        if (ret != el){
            return ret;
        }
    },

    removeFromPositionedGroup: function(el){
        this.paper.add(el);
    },

    itemBlur: function(el){
        var self = this;

        if (!this.$selected.length) return;

        if (el){
            var shape = el.first();
            shape.attr({
                stroke: shape.attr("fill")
            });
            el._selected = false;

            this.$selected.forEach(function(item, i){
                if (item === el){
                    self.$selected.splice(i, 1);
                    return false;
                }
            });

            return;
        }

        this.$selected.forEach(function(item){
            var shape = item.first();
            shape.attr({
                stroke: shape.attr("fill")
            });
            item._selected = false;
        });
        this.$selected.length = 0;
    },

    onSelect: function(el, e){
        e.preventDefault();
        if (el._selected) return;

        var shape = el.first();
        shape.attr({
            stroke: "#eef3f6"
        });
        el._selected = true;

        this.itemBlur();
        this.$selected.push(el);
    },

    onPaperClick: function(e){
        var self = this;
        if (e.target == this.paper.parent.node){
            this.itemBlur();
        }
        
    }

}

module.exports = new drawCanvas();

});