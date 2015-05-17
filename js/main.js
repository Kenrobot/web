require.config({
	baseUrl:"js/lib",
	paths: {
		"jquery": "jquery-1.11.2.min",
		"jquery-ui":"jquery-ui-1.11.3.min",
		"jsplumb":"jsPlumb/jsplumb",
		"bootstrap":"bootstrap/bootstrap.min",
		"d3":"d3.min",
		"flowchart_item_set":"../flowchart-item-set",
		"hardware":"../hardware",
		"kenrobotJsPlumb":"../kenrobotJsPlumb",
		"eventcenter":"../eventcenter"
	},
	shim: {
        'jquery-ui': {
            deps: ['jquery'],
            exports: 'jquery-ui'
        },
        'bootstrap': {
            deps: ['jquery'],
            exports: 'bootstrap'
        }
    }
});

require(['jquery','hardware','eventcenter'], function($,hardware,eventcenter) {
	//flowchart-container为流程图绘制区域，flowchart-item为即将成为拖拽生成流程图对象的元素，详细参照kenrobotJsPlumb
	hardware.init('hardware-item','hardware-container');

	eventcenter.bind('hardware','finish_drag',function(args){
		console.log(args);
	});
});

require(['jquery','kenrobotJsPlumb','eventcenter'], function($,kenrobotJsPlumb,eventcenter) {
	//flowchart-container为流程图绘制区域，flowchart-item为即将成为拖拽生成流程图对象的元素，详细参照kenrobotJsPlumb
	kenrobotJsPlumb.init('flowchart-item','flowchart-container');
	initWindow();
	var flowchartImg={};
	$("#save_btn").click(function(e){
		flowchartImg=kenrobotJsPlumb.getFlowchartElements();
		kenrobotJsPlumb.clear();
	});

	$("#draw_btn").click(function(e){
		kenrobotJsPlumb.draw(flowchartImg);
	});
	
	$(".flowchart_input_text").on("change",function(e){
		kenrobotJsPlumb.setSelectedNodeInfo($(this).val());
		$(this).val("");
	});

	eventcenter.bind("kenrobot","flowchart_item_click",function(args){
		createFloatWindow(args);
	});

	function createFloatWindow(args){
		if(args==null){
			$("#flowchar-container-float-window").hide();
			return false;
		}
		var fc_top=$("#flowchart-container").offset().top;
		fc_top+=args.top;
		var fc_left=$("#flowchart-container").offset().left+150;
		fc_left+=args.left;
		$("#flowchar-container-float-window").css({
			"top":fc_top+"px",
			"left":fc_left+"px",
		});
		if(args.options){
			var selectObj=$("<select></select>");
			for(var i=0;i<args.options.length;i++){
				var optionObj=$("<option value"+args.options[i].value+">"+args.options[i].text+"</options>");
				selectObj.append(optionObj);
			}
			$("#prop_set_field").empty().append(selectObj);
		}else{
			$("#prop_set_field").empty().append($("<input type='text' style='width:120px'>"));
		}

		$("#flowchar-container-float-window").show();
	}
});

function initWindow(){
	var floatDiv=$("<div></div>").attr("id","flowchar-container-float-window");
	floatDiv.css({
		"z-index":9999,
		"position":"absolute",
		"width":"250px",
		"height":"auto",
		"border-radius":"5px",
		"-webkit-border-radiux":"5px",
		"-moz-border-radius":"5px"
	});
	var headerDiv=$("<div></div>").css({
		"position":"relative",
		"top":"0px",
		"left":"0px",
		"width":"248px",
		"height":"40px",
		"padding":"10px",
		"background-color":"#2E8ACC",
		"color":"#FFF"
	}).text("流程元素");
	floatDiv.append(headerDiv);
	var bodyDiv=$("<div></div>").css({
		"position":"relative",
		"top":"0px",
		"left":"0px",
		"width":"248px",
		"height":"auto",
		"padding":"5px 10px",
		"background-color":"#FFF"
	});
	bodyDiv.text("属性设置:");
	bodyDiv.append($("<span id='prop_set_field'></span>"));
	bodyDiv.append($("<hr>").css({
		"margin":"8px 0px"
	}));
	bodyDiv.append("硬件连接端口:");
	bodyDiv.append($("<span></span>").css({
		"color":"#F00"
	}).text("PORTA0"));
	bodyDiv.append($("<hr>").css({
		"margin":"8px 0px"
	}));
	bodyDiv.append($("<span></span>").css({
		"color":"#BBBDBF"
	}).text("注释:PORTA0 输入高压电平，LED 灯亮"));
	floatDiv.append(bodyDiv);
	
	$("body").append(floatDiv);
	floatDiv.hide();
}