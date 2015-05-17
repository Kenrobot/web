/*
 * @desc 流程元素配置文件
 * 	key:css样式class为拖拽对象元素的标签元素的data-item值
 * 	value:元素说明
 *		className:拖拽完所生成流程元素的css样式class
 *		unique:true/false表明是否是唯一流程元素，缺失默认为false（不唯一）
 *		type:元素样式类型，可以通过此类型定制化样式
 *		kind:"flowchart"/"hardware"/"software"等，元素从属类型
 *		points:指定流程元素附着的拖拽点的设定，设定说明如下
 *			position:拖拽点位置
 *			source:是否为起点
 *			target:是否为终点
 *			color:拖拽点颜色
 *			shape:连接点形状 Dot是圆形，Rectangle是方形
 *			port:硬件端口号
 */
define({
	//开始
	"flowchart_start_item":{
		"className":"flowchart-oval-item",
		"unique":true,
		"type":"start",
		"kind":"flowchart",
		"points":[
			{"position":"BottomCenter","source":true,"target":false,"color":"#FF0","shape":"Dot"}
		]
	},
	//结束
	"flowchart_end_item":{
		"className":"flowchart-oval-item",
		"unique":false,
		"type":"end",
		"kind":"flowchart",
		"points":[
			{"position":"TopCenter","source":false,"target":true,"color":"#FF8891","shape":"Dot"}
		]
	},
	//流程
	"flowchart_process_item":{
		"className":"flowchart-rectangle-item",
		"unique":false,
		"type":"process",
		"kind":"flowchart",
		"points":[
			{"position":"TopCenter","source":false,"target":true,"color":"#FF8891","shape":"Dot"},
			// {"position":"RightMiddle","source":true,"target":true,"color":"#F0F","shape":"Dot"},
			{"position":"BottomCenter","source":true,"target":false,"color":"#FF0","shape":"Dot"},
			// {"position":"LeftMiddle","source":true,"target":true,"color":"#F0F","shape":"Dot"}
		]
	},
	//假设
	"flowchart_if_item":{
		"className":"flowchart-prismatic-item",
		"unique":false,
		"type":"if",
		"kind":"flowchart",
		"points":[
			{"position":"TopCenter","source":false,"target":true,"color":"#FF8891","shape":"Dot"},
			{"position":"RightMiddle","source":true,"target":false,"color":"#FF0","shape":"Dot"},
			{"position":"LeftMiddle","source":true,"target":false,"color":"#FF0","shape":"Dot"}
		]
	},
	//操作
	"flowchart_op_item":{
		"className":"flowchart-parallelogram-item",
		"unique":false,
		"type":"op",
		"kind":"flowchart",
		"points":[
			{"position":"TopCenter","source":false,"target":true,"color":"#FF8891","shape":"Dot"},
			{"position":"BottomCenter","source":true,"target":false,"color":"#FF0","shape":"Dot"},
		]
	},
	//循环
	"flowchart_loop_item":{
		"className":"flowchart-prismatic-item",
		"unique":false,
		"type":"loop",
		"kind":"flowchart",
		"points":[
			{"position":"TopCenter","source":false,"target":true,"color":"#FF8891","shape":"Dot"},
			{"position":"BottomCenter","source":true,"target":false,"color":"#FF0","shape":"Dot"},
			{"position":"RightMiddle","source":true,"target":false,"color":"#FF0","shape":"Dot"},
			{"position":"LeftMiddle","source":false,"target":true,"color":"#FF8891","shape":"Dot"}
		]
	},
	//主板
	"hardware_board_item":{
		"className":"hardware-board-item",
		"unique":true,
		"type":"mainboard",
		"kind":"hardware",
		"points":[
			{"position":[0.16,0.05,0,0],"source":true,"target":false,"color":"#FF0","shape":"Rectangle","port":"PORTA0"},
			{"position":[0.34,0.05,0,0],"source":true,"target":false,"color":"#FF0","shape":"Rectangle","port":"PORTB0"},
			{"position":[0.66,0.05,0,0],"source":true,"target":false,"color":"#FF0","shape":"Rectangle","port":"PORTC0"},
			{"position":[0.84,0.05,0,0],"source":true,"target":false,"color":"#FF0","shape":"Rectangle","port":"PORTD0"},
			{"position":[0.16,0.95,0,0],"source":true,"target":false,"color":"#FF0","shape":"Rectangle","port":"PORTE0"},
			{"position":[0.34,0.95,0,0],"source":true,"target":false,"color":"#FF0","shape":"Rectangle","port":"PORTF0"},
			{"position":[0.66,0.95,0,0],"source":true,"target":false,"color":"#FF0","shape":"Rectangle","port":"PORTG0"},
			{"position":[0.84,0.95,0,0],"source":true,"target":false,"color":"#FF0","shape":"Rectangle","port":"PORTH0"},
		]
	},
	//LED灯
	"hardware_light_item":{
		"className":"hardware-light-item",
		"unique":false,
		"type":"light",
		"kind":"hardware",
		"points":[
			{"position":[0.5,0.05,0,0],"source":false,"target":true,"color":"#FF8891","shape":"Dot"},
		],
		"setOptions":[
			{"value":"1","text":"开"},
			{"value":"0","text":"关"}
		]
	},
	//LED等转接口,LED等必须接在这个转接口上
	"hardware_adapter_item":{
		"className":"hardware-adapter-item",
		"unique":false,
		"type":"adapter",
		"kind":"hardware",
		"points":[
			{"position":[0.5,0.05,0,0],"source":false,"target":true,"color":"#FF8891","shape":"Dot"},
			{"position":[0.5,0.95,0,0],"source":true,"target":false,"color":"#FF0","shape":"Dot"},
		]
	},
});