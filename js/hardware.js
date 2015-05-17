/**
 * <div id="flowchart_if" data-item="flowchart_if_item" class="flowchart-item flowchart-prismatic">判定</div>
 *	右侧拖拽栏中的id只是用来最后的标志，虽然可以事后识别，但最好还是带上意义，比如if
 *	data-item对象才是重点，对应flowchart-item-set.js中配置的关键字
 *	参数jsPlumb_container所指定的区域是绘制流程图的区域，即id为jsPlumb_container的DIV
 *	需要为jsPlumb_container设定css样式，控制描图区域
 *	需要为jsPlumb_container+"-item"元素指定css样式，控制每个生成的流程元素块的大小
 */
define(["jquery","jsplumb","eventcenter","d3","flowchart_item_set","jquery-ui"],function($,jsPlumb,eventcenter,d3,fis){
	var jsPlumb_container='hardware-container';
	var jsPlumb_instance=null;
	var jsPlumb_nodes=[];
	var jsPlumb_selected_node=null;

	var container_width=0;
	var container_height=0;

	var data_transfer={};

	/**
	 * 整个处理的入口，需要初始化
	 * @param string strContainer 用来绘制流程图的DIV
	 * @param string itemClass 可以拖拽的元素
	 */
	function init(itemClass,strContainer){
		jsPlumb_container=strContainer;
		if(jsPlumb_container.length==0){
			alert("缺少搭建流程图的位置");
			return false;
		}

		container_width=$('#'+jsPlumb_container).width();
		container_height=$('#'+jsPlumb_container).height();

		jsPlumb.ready(function(){
		    //Initialize JsPlumb
		    initJsPlumbInstance();
		      
			$('div.'+itemClass).attr('draggable','true').on('dragstart', function(ev){
				initDrag(ev,this);
			}).on('touchstart',function(ev){
				initDrag(ev,this);
			});
			
			$('#'+jsPlumb_container).on('drop', function(ev){
				finishDrag(ev)
			}).on('dragover', function(ev){
				ev.preventDefault();
			});
			
		    jsPlumb.fire("jsFlowLoaded", jsPlumb_instance);

		    initMainBoard();
		});

		$(window).resize(function(e){
			var new_container_width=$('#'+jsPlumb_container).width();
			var move_distance=(container_width-new_container_width)/2;
			moveAllNodes(move_distance);
			container_width=new_container_width;
		});
	}

	function moveAllNodes(distance){
		for(var i=0;i<jsPlumb_nodes.length;i++){
			var node=jsPlumb.getSelector('#' + jsPlumb_nodes[i]['id'])[0];
			var left=$('#' + jsPlumb_nodes[i]['id']).position().left;
			$(node).css("left",(left-distance-5)+"px");
			//重绘流程元素
			jsPlumb_instance.repaint(node);
		}
	}

	function initMainBoard(){
		var left=container_width/2-215;
		var top=container_height/2-135;
		var firstNodeParam={};
		firstNodeParam['x'] = '' + left + 'px';
		firstNodeParam['y'] = ''+top+'px';
		firstNodeParam['id'] = "hardware_board_"+(new Date().getTime());
		firstNodeParam['data-item']= "hardware_board_item";
		firstNodeParam['text'] = "主板";
		var startNode=initNode(firstNodeParam);
	}

	/**
	 * 为jsPlumb面板增加一个流程元素
	 * @param object param {id:"",data-item:"",text:"",x:"",y:""}的信息集
	 */
	function initNode(param){
		var node = addNode(jsPlumb_container, param);
		jsPlumb_nodes.push(param);
		if(node===false){
			return false;
		}
		addPorts(node);
		jsPlumb_instance.draggable($(node));

		$(node).dblclick(function(ev){
			jsPlumb_instance.remove(this);

			for(var i=0;i<jsPlumb_nodes.length;i++){
				if(jsPlumb_nodes[i]['id']==$(node).attr('id')){
					jsPlumb_nodes.splice(i,1);
				}
			}
		}).click(function(e){
			//为流程元素新增选中激活时间
			var divElement=$("#"+$(node).attr('id'));
			if(divElement.hasClass("flowchart-item-border-show")){
				divElement.removeClass("flowchart-item-border-show");
				jsPlumb_selected_node=null;
				eventcenter.trigger("kenrobot","jsplumb_element_click",null);
			}else{
				$(".flowchart-item-border-show").removeClass("flowchart-item-border-show");
				divElement.addClass("flowchart-item-border-show");
				jsPlumb_selected_node=node;
				for(var i=0;i<jsPlumb_nodes.length;i++){
					if($(jsPlumb_selected_node).attr('id')==jsPlumb_nodes[i]['id']){
						eventcenter.trigger("kenrobot","jsplumb_element_click",jsPlumb_nodes[i]);
						break;
					}
				}
			}
		});
		// $(node).on("dragenter",function(e){
		// 	var divElement=$("#"+$(node).attr('id'));
		// 	divElement.css("border","1px solid #F00");
		// }).on("dragleave",function(e){
		// 	var divElement=$("#"+$(node).attr('id'));
		// 	divElement.css("border","");
		// });

		return node;
	}

	/**
	 * 新增一个流程元素
	 * @param string parentId 整个流程图绘制版DIV的id
	 * @param object param {id:"",data-item:"",text:"",x:"",y:""}的信息集
	 */
	function addNode(parentId, param) {
		var objSet=fis[param['data-item']];
		var panel = d3.select("#" + parentId);

		if(objSet.unique && $("div[data-item='"+param['data-item']+"']",$("#"+parentId)).length>0){
			alert("指定元素在流程中只能使用一次");
			return false;
		}

	  	panel.append('div')
	  		.style('position','absolute')
	  		.style('top',param['y'])
	  		.style('left',param['x'])
	  		.attr('align','center')
			.attr('id',param['id'])
			.attr('data-item',param['data-item'])
			.classed(objSet.className,true)
			.classed('node',true)
			.classed(jsPlumb_container+'-item',true)
			.text(param['text']);
		return jsPlumb.getSelector('#' + param['id'])[0];
	}

	/**
	 * 根据配置为流程增加endpoint
	 * @param element node 一个流程元素
	 */
	function addPorts(node) {
		//Assume horizental layout
		var arrAnchor=fis[$(node).attr('data-item')].points;
		for(var i=0;i<arrAnchor.length;i++){
			var tmpUuid=node.getAttribute("id") + "_" + arrAnchor[i].position;
			var tmpPaintStyle={ radius:5, fillStyle:arrAnchor[i].color };
			var tmpShape=arrAnchor[i].shape;
			jsPlumb_instance.addEndpoint(node, {
				endpoint:tmpShape,
				uuid:tmpUuid,
				paintStyle: tmpPaintStyle,
				anchor:arrAnchor[i].position,
				maxConnections:-1,
				isSource:arrAnchor[i].source,
				isTarget:arrAnchor[i].target,
			});
			//鼠标进入连接点时候激活的处理
			jsPlumb_instance.getEndpoint(tmpUuid).bind("mouseenter",function(e){
				console.log("mouseenter");
			});
		}
	}

	/**
	 * 连接两个endpoint
	 * @param string source_id 起点endpoint的uuid	
	 * @param string target_id 终点endpoint的uuid
	 */
	function connectPortsByUuid(source_id , target_id) {
		jsPlumb_instance.connect({uuids:[source_id, target_id]});
	}

	/**
	 * 连接两个endpoint
	 * @param string/endpoint source 起点	
	 * @param string/endpoint target 终点
	 */
	function connectPortsBySt(source,target){
		jsPlumb_instance.connect({source:source,target:target});
	}

	/**
	 * 初始化整个画板，同时增加双击链接取消链接功能
	 */
	function initJsPlumbInstance(){
		var color = "#E8C870";
		jsPlumb_instance = jsPlumb.getInstance({     
			Connector : [ "StateMachine", { curviness:1 } ],
			//DragOptions : { cursor: "pointer", zIndex:2000 },
			PaintStyle : { strokeStyle:color, lineWidth:5 },
			EndpointStyle : { radius:5, fillStyle:color },
			HoverPaintStyle : {strokeStyle:"#7073EB" },
			EndpointHoverStyle : {fillStyle:"#7073EB" },
			//ConnectionOverlays : [["Arrow",{ width:10,length:10,location:-5}]],
			Container:jsPlumb_container
	    });
		jsPlumb_instance.bind("dblclick", function(conn, e) {
	    	jsPlumb_instance.detach(conn);
	    });
	}

	/**
	 * 初始化拖拽功能
	 * @param event e 鼠标拖拽实践
	 */
	function initDrag(e){
		try{
			e.originalEvent.dataTransfer.setData('text',e.target.id);
			e.originalEvent.dataTransfer.setData('offsetX',e.originalEvent.offsetX);
			e.originalEvent.dataTransfer.setData('offsetY',e.originalEvent.offsetY);
		}catch(ev){
			data_transfer['text']=e.target.id;
			data_transfer['offsetX']=e.originalEvent.offsetX;
			data_transfer['offsetY']=e.originalEvent.offsetY;
		}
	}

	/**
	 * 完成元素拖拽后的处理
	 * @param event e 鼠标拖拽实践
	 */
	function finishDrag(e){
		//拖拽对象不是连接点的时候
		if (e.target.closest("div").className.indexOf('_jsPlumb') >= 0 && e.target.closest("div").className.indexOf(jsPlumb_container+'-item')<0) {
			return false;
		}
		e.preventDefault();
		//生成流程图元素的样式、位置
		var flowchart_obj_param={};
		var objId="";
		var startOffsetX=0;
		var startOffsetY=0;
		try{
			objId=e.originalEvent.dataTransfer.getData('text');
			startOffsetX=e.originalEvent.dataTransfer.getData('offsetX');
			startOffsetY=e.originalEvent.dataTransfer.getData('offsetY');
		}catch(ev){
			objId=data_transfer['text'];
			startOffsetX=data_transfer['offsetX'];
			startOffsetY=data_transfer['offsetY'];
		}
		var flowchart_obj_param_x=e.originalEvent.offsetX-startOffsetX;
		var flowchart_obj_param_y=e.originalEvent.offsetY-startOffsetY;
		flowchart_obj_param['x'] = '' + flowchart_obj_param_x + 'px';
		flowchart_obj_param['y'] = '' + flowchart_obj_param_y + 'px';

		flowchart_obj_param['id'] = objId+"_"+(new Date().getTime());
		flowchart_obj_param['data-item']= $("#"+objId).attr('data-item');
		flowchart_obj_param['text'] = $("#"+objId).text();

		var node=initNode(flowchart_obj_param);
		var nodeFis=fis[flowchart_obj_param['data-item']];

		//若拖拽进入已有元素，则自动连接，并调整元素位置
		if (e.target.closest("div").className.indexOf('_jsPlumb') >= 0 ) {
			var targetDiv=e.target;
			var sourceFis=fis[$(e.target.closest("div")).attr("data-item")];
			//连接点在硬件主板上，且连接元素室LED灯时，需要确认转接口的存在
			if(sourceFis.kind=="hardware" && sourceFis.type=='mainboard'){
				if(nodeFis.kind=="hardware" && nodeFis.type=="light"){
					var conns=jsPlumb_instance.getConnections({source:e.target.closest("div")});
					var hasAdapter=false;
					var sEndpoint=getNearestEndPointFromNode(targetDiv,node,flowchart_obj_param_x,flowchart_obj_param_y);
					for(var i=0;i<conns.length;i++){
						if(conns[0].endpoints[0].getUuid()!=sEndpoint.getUuid())continue;
						for(var j=0;j<conns[i].endpoints.length;j++){
							var tmpEndpoint=conns[i].endpoints[1];
							var tmpNodeFis=fis[$(tmpEndpoint.getElement()).attr("data-item")];
							if(tmpNodeFis.kind=="hardware" && tmpNodeFis.type=="adapter"){
								hasAdapter=true;
								targetDiv=$(tmpEndpoint.getElement());
								break;
							}
						}
					}
					if(!hasAdapter){
						var adapterNodeParam={};
						adapterNodeParam['x'] = flowchart_obj_param['x'];
						adapterNodeParam['y'] = flowchart_obj_param['y'];
						adapterNodeParam['id'] = "hardware_adapter_"+(new Date().getTime());
						adapterNodeParam['data-item']= "hardware_adapter_item";
						adapterNodeParam['text'] = "转接口";
						var adapterNode=initNode(adapterNodeParam);
						initConnection(
							adapterNode,
							targetDiv,
							flowchart_obj_param_x,
							flowchart_obj_param_y
						);
						targetDiv=$(adapterNode);
					}
				}
			}
			initConnection(
				node,
				targetDiv,
				flowchart_obj_param_x,
				flowchart_obj_param_y
			);
		}

		for(var i=0;i<jsPlumb_nodes.length;i++){
			if(jsPlumb_nodes[i]['id']==$(node).attr('id')){
				if(jsPlumb_nodes[i] && (jsPlumb_nodes[i]['add_info']!=null || jsPlumb_nodes[i]['add_info']==undefined)){
					jsPlumb_nodes[i]['add_info']="";
				}

				eventcenter.trigger('hardware','finish_drag',{
					"kind":nodeFis.kind,
					"type":nodeFis.type,
					"add_info":jsPlumb_nodes[i]['add_info'],
					"left":$(node).position().left,
					"top":$(node).position().top
				});
				break;
			}
		}

		
		try{
			e.originalEvent.dataTransfer.clearData();
		}catch(ev){
			data_transfer={};
		}
	}

	/**
	 * @desc拖拽至元素时自动绘制图形位置，需将已有下属元素进行位置调整
	 * @param node 流程元素
	 * @param event e 事件
	 * @param float centerX 实际中心点当前位置
	 * @param float centerY 实际中心点当前位置
	 */
	function initConnection(node,target,centerX,centerY){
		var targetDiv=target.closest("div");

		var sourceEndPoint=getNearestEndPointFromNode(targetDiv,node,centerX,centerY);
		if(sourceEndPoint==null){
			jsPlumb_instance.remove($(node));
			return false;
		}

		//拖拽位置所指对象的位置
		var baseX=$(targetDiv).position().left;
		var baseY=$(targetDiv).position().top;

		//获取起始连接点的属性
		var sourceFis=fis[$(targetDiv).attr("data-item")];
		//根据最近的起始连接点重定位新流程元素位置
		var objX=0;
		var objY=0;
		if(sourceFis.kind=="hardware"){
			var baseX=$(sourceEndPoint.canvas).position().left;
			var baseY=$(sourceEndPoint.canvas).position().top;
			if(sourceFis.type=="mainboard"){
				objX=baseX+9-$(node).outerWidth()/2;
				//主板连接点定制
				if(sourceEndPoint.anchor.y==0.05){
					//主板上连接点
					objY=baseY-$(node).outerHeight()-30;
					$(node).addClass("content-rotate");
					var targetEndPoints=jsPlumb_instance.getEndpoints($(node));
					for(var i=0;i<targetEndPoints.length;i++){
						targetEndPoints[i].anchor.x=1-targetEndPoints[i].anchor.x;
						targetEndPoints[i].anchor.y=1-targetEndPoints[i].anchor.y;
					}
				}else{
					//主板下连接点
					objY=baseY+40;
				}
			}else{
				if($(targetDiv).hasClass("content-rotate")){
					//父点旋转，子点也旋转
					objX=baseX+3-$(node).outerWidth()/2;
					objY=baseY-$(node).outerHeight()-30;
					$(node).addClass("content-rotate");
					var targetEndPoints=jsPlumb_instance.getEndpoints($(node));
					for(var i=0;i<targetEndPoints.length;i++){
						targetEndPoints[i].anchor.x=1-targetEndPoints[i].anchor.x;
						targetEndPoints[i].anchor.y=1-targetEndPoints[i].anchor.y;
					}
				}else{
					objX=baseX+3-$(node).outerWidth()/2;
					objY=baseY+30;
				}
				var arrConn=jsPlumb_instance.getConnections({source:sourceEndPoint.getElement()});
				//将同一节点出来的元素拆分显示
				if(arrConn.length%2==0){
					objX=objX-($(node).outerWidth()+10)*arrConn.length/2;
				}else if(arrConn.length==1){
					objX=objX+$(node).outerWidth()+10;
				}else if(arrConn.length%2==1){
					objX=objX+($(node).outerWidth()+10)*(arrConn.length-arrConn.length%2+2)/2;
				}
			}
		}else{
			switch(sourceEndPoint.anchor.type){
				case "TopCenter":objX=baseX;objY=baseY-$(node).outerHeight()-30;break;
				case "RightMiddle":objX=baseX+$(node).outerWidth()+30;objY=baseY+$(node).outerHeight()+10;break;
				case "BottomCenter":objX=baseX;objY=baseY+$(node).outerHeight()+30;break;
				case "LeftMiddle":objX=baseX-$(node).outerWidth()-30;objY=baseY+$(node).outerHeight()+10;break;
				default:break;
			}
		}

		$(node).css("top",objY).css("left",objX);
		//重绘流程元素
		jsPlumb_instance.repaint(node);

		var targetEndPoints=jsPlumb_instance.getEndpoints($(node));

		var targetEndPoint=null;
		for(var i=0;i<targetEndPoints.length;i++){
			if(!targetEndPoints[i].isTarget)continue;
			targetEndPoint=targetEndPoints[i];
			break;
		}

		connectPortsBySt(sourceEndPoint,targetEndPoint);

		if(sourceFis.kind=="flowchart"){
			//从sourceEndPoint出来的所有元素位置下移
			moveRelationalNodes(sourceEndPoint,node);
		}
		//截断需截断连接，重新连接
		// cutAndLink(sourceEndPoint,node);
	}

	function getNearestEndPointFromNode(div,node,centerX,centerY){
		var realX=$(node).outerWidth()/2+centerX;
		var realY=$(node).outerHeight()/2+centerY;

		return getNearestEndPoint(div,realX,realY);
	}

	/**
	 * @desc 截断需截断连接，重新连接
	 * @param EndPoint sourceEndPoint 起始点
	 * @param Node node 新绘制元素
	 */
	function cutAndLink(sourceEndPoint,node){
		//在新的元素上获取打断重连的起点
		var sourceTargetEndPoint=null;
		var sourceEndPoints=jsPlumb_instance.getEndpoints($(node));
		for(var i=0;i<sourceEndPoints.length;i++){
			if(!sourceEndPoints[i].isSource)continue;
			sourceTargetEndPoint=sourceEndPoints[i];
			break;
		}
		var connections=jsPlumb_instance.getConnections({source:sourceEndPoint.getElement()});
		for(var i=0;i<connections.length;i++){
			if(sourceEndPoint.getUuid()!=connections[i].endpoints[0].getUuid())continue;
			if($(node).attr('id')==connections[i].targetId || $(node).attr('id')==connections[i].sourceId){
				continue;
			}
			jsPlumb_instance.detach(connections[i]);
			connectPortsBySt(sourceTargetEndPoint,connections[i].endpoints[1]);
		}
	}

	/**
	 * @desc 根据连接元素递归下移
	 * @param EndPoint sourceEndPoint 起始点
	 * @param Node node 新绘制元素
	 */
	function moveRelationalNodes(sourceEndPoint,node){
		var connections=jsPlumb_instance.getConnections({source:sourceEndPoint.getElement()});
		//从同一个起点衍生出多个点时，需要将所有流程元素下移，除了刚刚绘制的流程元素
		for(var i=0;i<connections.length;i++){
			//判定该连接终点元素是不是刚刚绘制的node元素，通过ID判定
			if($(node).attr('id')==connections[i].targetId || $(node).attr('id')==connections[i].sourceId){
				continue;
			}
			//自己连自己的话
			if(connections[i].targetId==connections[i].sourceId || connections[i].targetId==$(sourceEndPoint.getElement()).attr("id")){
				break;
			}

			var positionY=$(connections[i].target).position().top;
			positionY+=$(connections[i].target).outerHeight()+30;
			$(connections[i].target).css("top",positionY);
			//重绘流程元素
			jsPlumb_instance.repaint(connections[i].target);
			arguments.callee(connections[i].endpoints[1],node);
		}
	}

	/**
	 * @desc 从附着有endpoint的div中获取离指定x，y最近的起始endpoint
	 * @param element div 附着有endpoint的div
	 * @param float realX 当前元素实际中心点X位置
	 * @param float realY 当前元素实际中心点Y位置
	 */
	function getNearestEndPoint(div,realX,realY){
		var sourceEndPoint=null;

		//拖拽位置所指对象的位置
		var baseX=$(div).position().left;
		var baseY=$(div).position().top;

		//获取拖拽位置所指对象的所有连接点endpoint
		var sourceEndPoints=jsPlumb_instance.getEndpoints(div);
		//根据拖拽放置情况获取离当前元素最近的连接点
		var distance=0;
		for(var i=0;i<sourceEndPoints.length;i++){
			if(!sourceEndPoints[i].isSource)continue;
			//获取endpoint点所在流程元素中的相对位置
			var tmpY=$(sourceEndPoints[i].canvas).position().top-baseY;
			var tmpX=$(sourceEndPoints[i].canvas).position().left-baseX;
			if(distance==0){
				distance=Math.sqrt(Math.pow((realY-tmpY),2)+Math.pow((realX-tmpX),2));
				sourceEndPoint=sourceEndPoints[i];
			}else{
				var tmpDistance=Math.sqrt(Math.pow((realY-tmpY),2)+Math.pow((realX-tmpX),2));
				if(distance>tmpDistance){
					distance=tmpDistance;
					sourceEndPoint=sourceEndPoints[i];
				}
			}
		}
		return sourceEndPoint;
	}

	/**
	 * 获取整个流程图的链接信息
	 */
	function getConnections(){
		$.each(jsPlumb_instance.getAllConnections(), function(id, connection) {
			console.log(connection);
			// $.each(scopeConnections, function(i, el) {
			// 	locations.push($.extend(el.source.offset(), { nodeId: el.source.data("id") }));
			// 	locations.push($.extend(el.target.offset(), { nodeId: el.target.data("id") }));
			// 	connections.push({ source: el.source.data("id"), target: el.target.data("id") });
			// });
		});
		console.log(JSON.stringify(connections));
	};

	/**
	 * 获取整个流程图信息
	 */
	function getFlowchart(){
		var arrFlowchart=[];
		$.each(jsPlumb_instance.getConnections(),function(id,connection){
			arrFlowchart.push({
				"source":connection.sourceId,
				"target":connection.targetId
			})
		});
		console.log(arrFlowchart);
	}

	/**
	 * 将目前绘制的流程图清除
	 */
	function clear(){
		$.each(jsPlumb_nodes,function(i,o){
			jsPlumb_instance.remove(jsPlumb_instance.getSelector("#"+o['id'])[0]);
		});
		jsPlumb_nodes=[];
	}

	/**
	 * 获取展示中所有的元素，包括流程元素、线，主要用于绘制
	 */
	function getFlowchartElements(){
		var jsPlumb_links=[];
		$.each(jsPlumb_instance.getConnections(),function(id,connection){
			jsPlumb_links.push({
				"source_id":connection.endpoints[0].getUuid(),
				"target_id":connection.endpoints[1].getUuid()
			});
		});
		//更新每个点的实时坐标
		for(var i=0;i<jsPlumb_nodes.length;i++){
			jsPlumb_nodes[i]['x']=""+$("#"+jsPlumb_nodes[i]['id']).position().left+"px";
			jsPlumb_nodes[i]['y']=""+$("#"+jsPlumb_nodes[i]['id']).position().top+"px";
		}
		return {"nodes":jsPlumb_nodes,"links":jsPlumb_links};
	}

	/**
	 * 设置当前选中元素的额外附加信息
	 */
	function setSelectedNodeInfo(jsPlumb_add_info){
		if(jsPlumb_selected_node==null)return false;
		for(var i=0;i<jsPlumb_nodes.length;i++){
			if($(jsPlumb_selected_node).attr('id')==jsPlumb_nodes[i]['id']){
				jsPlumb_nodes[i]['add_info']=jsPlumb_add_info;
			}
		}
	}

	/**
	 * 根据点、线信息绘制流程图
	 * @param object flowchart {"nodes":[],"links":[]}格式数据，可通过getFlowchartElements获取
	 */
	function draw(flowchart){
		if(jsPlumb_nodes.length>0){
			if(confirm("是否覆盖重绘?")){
				clear();
			}else{
				return false;
			}
		}
		$.each(flowchart["nodes"],function(i,o){
			initNode(o);
		});
		$.each(flowchart["links"],function(i,o){
			var sourceId=o["source_id"];
			var targetId=o["target_id"];
			connectPortsByUuid(sourceId, targetId);
		});
	}

	/**
	 * @return function init 初始化流程图绘制工具
	 * @return function getConnections 获取连接信息
	 * @return function getFlowchart 获取流程图信息
	 * @return function getFlowchartElements 获取流程图元素集
	 * @return function clear 清空整个流程图面板
	 * @return function draw 根据给定元素绘制流程图
	 */
	return {
		init:init,
		getConnections:getConnections,
		getFlowchart:getFlowchart,
		getFlowchartElements:getFlowchartElements,
		clear:clear,
		draw:draw,
		setSelectedNodeInfo:setSelectedNodeInfo
	}
});