window.onload = function(){
	function drawAWord(opts) {
		// 初始化dom属性
		this.dom = opts.dom;
		this.lineWidth = opts.lineWidth;
		this.zWin = window;

		// 初始化米字表格
		this.init();
		// 渲染数据
		this.render();
		// 绑定事件
		this.bandDom();
	}

	// 绘制边框表格
	function drawFrame(context,dom,begin,lineWidth){
		context.beginPath();
		context.strokeStyle = '#f20';

		// 绘制边框路径
		context.moveTo(begin,begin);
		context.lineTo(begin,dom.height - begin);
		context.lineTo(dom.width - begin,dom.height - begin);
		context.lineTo(dom.width - begin,begin);

		context.closePath();
		context.lineWidth = lineWidth;
		context.stroke();
	}

	// 绘制米字横竖虚线
	function drawHVD(context,dom,w,h,begin,lineWidth){
		var i,half = dom.width/2;
		
		if(h == 0){ // 横虚线
			for(i = begin; i < dom.width - begin; i+=lineWidth * 2){
				context.beginPath();
				context.moveTo(i,half);
				context.lineTo(i+lineWidth,half);
				context.lineWidth = lineWidth;
				context.stroke();
			}
		}else if(w == 0){ // 竖虚线
			for(i = begin; i < dom.height - begin; i+=lineWidth * 2){
				context.beginPath();
				context.moveTo(half,i);
				context.lineTo(half,i+lineWidth);
				context.lineWidth = lineWidth;
				context.stroke();
			}
		}
	}

	// 绘制米字对角虚线
	function drawAcrossD(context,dom,w,h,begin,lineWidth){
		var i,j;
		
		if(h == 0){ // 下对角虚线
			for(i = begin; i < dom.width - begin; i+=lineWidth * 2){
				context.beginPath();
				context.moveTo(i,i);
				context.lineTo(i+lineWidth,i+lineWidth);
				context.lineWidth = lineWidth;
				context.stroke();
			}
		}else if(w == 0){ // 上对角虚线
			for(i = begin,j = dom.height - begin; i < dom.height - begin; i+=lineWidth * 2,j-=lineWidth * 2){
				context.beginPath();
				context.moveTo(i,j);
				context.lineTo(i,j-lineWidth);
				context.lineWidth = lineWidth;
				context.stroke();
			}
		}
	}

	// 画米字表格
	function drawGrid(context,dom){
		var lineWidth = 2,
			beginPath = 3;
		context.save();
		// 绘制边框表格
		drawFrame(context,dom,beginPath,6);

		// 绘制米字横竖虚线
		drawHVD(context,dom,1,0,beginPath,lineWidth);
		drawHVD(context,dom,0,1,beginPath,lineWidth);

		// 绘制米字对角虚线
		drawAcrossD(context,dom,1,0,beginPath,lineWidth);
		drawAcrossD(context,dom,0,1,beginPath,lineWidth);

		context.restore();
	}

	// 初始化米字表格
	drawAWord.prototype.init = function(){
		var zWin = this.zWin;
		var w;
		// 获取canvas节点
		var dom = this.dom;

		// 动态设置canvas宽高
		if(zWin.innerWidth > 620){
			w = 600;
		}else{
			w = zWin.innerWidth - 20;
		}
		dom.width = dom.height = w;
		// 设置按钮组宽度
		document.getElementById('btn-group').style.width = w + 'px';

		// 获取canvas上下文绘图环境
		this.context = dom.getContext('2d');

		// 绘制米字表格
		drawGrid(this.context,dom);
	}

	// 渲染数据
	drawAWord.prototype.render = function(){
		var self = this;
		var dom = self.dom;
		var context = this.context;

		function getRealXY(x,y){
			var box = dom.getBoundingClientRect();
			return {
				x: x - box.left,
				y: y - box.top
			}
		};

		function getS(pre,cur){
			return Math.sqrt((cur.x-pre.x)*(cur.x-pre.x) + (cur.y-pre.y)*(cur.y-pre.y));
		}

		function cacurlateLineW(v){
			var lineWidth = self.lineWidth;
			var minline = 1;
			var max = 8;
			var min = 0.5;
			if(v > max){
				lineWidth = minline;
			}else if(v < min){
				lineWidth = self.lineWidth
			}else{
				var k = (self.lineWidth - minline)/(min - max);
				var b = self.lineWidth - min*k;
				lineWidth = v*k + b;
			}
			return lineWidth;
		}

		function move(x,y){
			// 获取当前相对画布的xy坐标
			self.curXY = getRealXY(x,y);
			// 获取当前时间
			self.curTime = new Date().getTime();

			// 计算时间差
			var t = self.curTime -self.preTime;
			// 获取鼠标移动的路程
			var s = getS(self.preXY,self.curXY);
			// 鼠标移动速度
			var v = s/t;

			// 通过v计算线条宽度
			var lineWidth = cacurlateLineW(v);

			// 写字
			context.save();
			context.beginPath();
			context.strokeStyle = self.color;

			context.moveTo(self.preXY.x,self.preXY.y);
			context.lineTo(self.curXY.x,self.curXY.y);

			context.lineWidth = lineWidth;
			context.lineCap = 'round';
			context.lineJoin = 'round';
			context.stroke();
			context.restore();

			self.preXY.x = self.curXY.x;
			self.preXY.y = self.curXY.y;
			self.preTime = self.curTime;
		}

		// 鼠标按下事件
		dom.onmousedown = function(e){
			e.preventDefault();
			self.isdown = true;

			// 获取相对画布的xy坐标
			self.preXY = getRealXY(e.pageX,e.pageY);

			// 获取当前时间
			self.preTime = new Date().getTime();
	
		};

		// 鼠标松开事件
		dom.onmouseup = function(e){
			e.preventDefault();
			self.isdown = false;
		};

		// 鼠标移出界面外事件
		dom.onmouseout = function(e){
			e.preventDefault();
			self.isdown = false;
		};

		// 鼠标移动事件
		dom.onmousemove = function(e){
			e.preventDefault();
			if(self.isdown){
				move(e.pageX,e.pageY);
			}
		};

		// 手指按下事件
		dom.addEventListener('touchstart',function(e){
			// 获取相对画布的xy坐标
			self.preXY = getRealXY(e.touches[0].pageX,e.touches[0].pageY);

			// 获取当前时间
			self.preTime = new Date().getTime();
		});

		// 手指触摸移动事件
		dom.addEventListener('touchmove',function(e){
			e.preventDefault();
			move(e.touches[0].pageX,e.touches[0].pageY);
		});
	}

	// 绑定事件
	drawAWord.prototype.bandDom = function(){
		var self = this;
		var btnGroup = document.getElementById('btn-group').getElementsByTagName('button');
		for(var i in btnGroup){
			(function(i){
				btnGroup[i].onclick = function(){
					switch(i){
						case '0': 
							self.color = 'black';
							break;
						case '1':
							self.color = 'blue';break;
						case '2':
							self.color = 'green';break;
						case '3':
							self.color = 'red';break;
						case '4':
							self.color = 'orange';break;
						case '5':
							self.color = 'yellow';break;
						case '6':
							self.context.clearRect(0,0,self.dom.width,self.dom.height);
							self.init();
							break;
						default: break;
					}
				}
			})(i);
		}
	}

	//新建一个drawAWord对象
	new drawAWord({
		dom: document.getElementById('cvs'),
		lineWidth: 30
	});
}


