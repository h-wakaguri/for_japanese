// Author: H. Wakaguri 2011/09/05
// 2011/09/07 Updated(Firefox対応)
// 2012/08/26 Updated(タッチパネル対応)
// 2012/08/31 Updated(コンピュータが計算している間にプレイヤーが消去できてしまう不具合を修正)
// 2013/06/15 Updated(Chrome27.0で正常に動かなくなる不具合を修正)

var BoukeshiGraphRoot = function(docEl, stage, option) {
	this.stage = stage;
	this.pich = (option && option["pich"])? option["pich"]: 5;
	this.spanX = 3;
	this.spanY = 14;
	this.canvW = (option && option["size"])? option["size"][0]: 250;
	this.canvH = (option && option["size"])? option["size"][1]: 350;
	
	document.getElementById(docEl).innerHTML = '<canvas id="canvas" width="' 
		+ this.canvW + '" height="' + this.canvH + '"></canvas><div id="game"></div>';
	
	var canvas = document.getElementById('canvas');
	this.canvas = canvas;
	this.cc = canvas.getContext('2d');
	
	this.canvas.addEventListener("mousemove", function(e) {}, true);
	this.canvas.addEventListener("mousedown", function(e) {}, true);
	this.canvas.addEventListener("mouseup", function(e) {}, true);
	//this.canvas.addEventListener("mouseout", function(e) {m.paint();}, true);
	
	this.canvas.addEventListener("touchmove", function(e) {e.preventDefault();}, true);
	this.canvas.addEventListener("touchstart", function(e) {}, true);
	this.canvas.addEventListener("touchend", function(e) {}, true);
	
	this.getXY = function(e) {
		var xy = new Array(2);
		var rect = e.target.getBoundingClientRect();
		xy[0] = e.clientX - rect.left;
		xy[1] = e.clientY - rect.top;
		
		return xy;
	}
	
	var m = this;
	
	this.isEnd = function() {
		return true;
	}
	
	this.getPich = function() {
		return this.pich;
	}
	
	this.setPich = function(pich) {
		this.pich = pich;
		this.paint();
	}
	
	this.getStage = function() {
		return this.stage;
	}
	
};

////////////////////////////////////////////////////////////////////////////////////////////////////

var BoukeshiGraph = function(docEl, stage, comStartFlg, option) {
	this.inherit = BoukeshiGraphRoot;
	this.inherit(docEl, stage, option);
	
	this.docEl = docEl;
	
	this.mouseStartReg = null;
	
	this.boukeshi = new Boukeshi(stage);
	
	//this.turnが1のときのみ自分が消せる
	this.turn = (comStartFlg)? 0: 1;
	
	this.boul = new Array(stage.length);
	for(var i = 0; i < stage.length; i ++) {
		var bouNum = stage[i];
		this.boul[i] = new Array(bouNum);
		for(var j = 0; j < bouNum; j ++) {
			this.boul[i][j] = 0;
		}
	}
	
	this.isEnd = function() {
		return this.boukeshi.isEnd();
	}
	
	if(!comStartFlg) {
		var str = "<h2>やり方</h2><ul>";
		str += "<li>最後の線を消したほうが負けです</li>";
		str += "<li>消したい位置をドラッグすると青線が引けます</li>";
		str += "<li>コンピューターは赤線で最良手を打ってきます</li>";
		str += "<li>[Restart]でゲームを初めからやり直すことができます</li>";
		str += "<li>computer startをチェックすると、次のゲームからコンピュータが先手になります</li>";
		str += "<li>[Create Stage]から自分でステージを作成することができます</li>";
		str += "</ul>";
		str += "あなたの番です。";
		document.getElementById("game").innerHTML = str;
	} else {
		this.goComTurn();
	}
	this.paint();
	
	var m = this;
	
	this.canvas.addEventListener("mousemove", mouseMoveListner, true);
	this.canvas.addEventListener("mousedown", mouseDownListner, true);
	this.canvas.addEventListener("mouseup", mouseUpListner, true);
	
	this.canvas.addEventListener("touchmove", function(e) {
		e.preventDefault();
		var touch = e.changedTouches[0];
		mouseMoveListner(touch);
	}, true);
	this.canvas.addEventListener("touchstart", function(e) {
		var touch = e.touches[0];
		mouseDownListner(touch);
	}, true);
	this.canvas.addEventListener("touchend", function(e) {
		var touch = e.changedTouches[0];
		mouseUpListner(touch);
	}, true);
	
	this.isCanErase = function(startX, endX, numY) {
		var canErase = true;
		if(numY < 0 || m.boul.length <= numY) {
			canErase = false;
		} else {
			var bouNum = m.boul[numY].length;
			if(startX < 0 || bouNum <= startX || endX < 0 || 
				bouNum <=endX || endX < startX) {
				
				canErase = false;
			} else {
				for(var i = startX; i <= endX; i ++) {
					if(m.boul[numY][i]) {
						canErase = false;
						break;
					}
				}
			}
		}
		
		return canErase;
	}
	this.getArrayReg = function(e) {
		var xy = m.getXY(e);
		var xAr;
		var yAr = Math.floor((xy[1] - (m.canvH / 2 - m.boul.length 
			/ 2 * m.pich * m.spanY)) / (m.pich * m.spanY));
		
		if(0 <= yAr && yAr < m.boul.length) {
			var bouNum = m.boul[yAr].length;
			xAr = Math.floor((xy[0] - (m.canvW / 2 - m.pich / 2 
				- (m.pich * m.spanX * (bouNum - 1 / 2)))) / (m.pich * m.spanX * 2));
			
			if(m.isCanErase(xAr, xAr, yAr)) {
				var ar = new Array(xAr, yAr);
				
				return ar;
			}
		}
		
		return null;
	}
	function mouseMoveListner(e) {
		var xy = m.getXY(e);
		m.paint();
		if(m.mouseStartReg != null) {
			var ar = m.getArrayReg(e);
			if(ar != null && m.mouseStartReg[1] == ar[1]) {
				var startX = (m.mouseStartReg[0] < ar[0])? m.mouseStartReg[0]: ar[0];
				var endX = (m.mouseStartReg[0] > ar[0])? m.mouseStartReg[0]: ar[0];
				if(m.isCanErase(startX, endX, ar[1])) {
					var bouNum = m.boul[ar[1]].length;
					var x1 = m.canvW / 2 - m.pich / 2 - (m.pich * m.spanX * (bouNum - 1)) 
						+ startX * m.pich * m.spanX * 2 - m.pich * m.spanX + m.pich / 2;
					var y1 = m.canvH / 2 - m.boul.length / 2 * m.pich * m.spanY 
						+ m.pich * 10 / 2 - m.pich / 2 + ar[1] * m.pich * m.spanY;
					
					//m.cc.fillText("TEST：" + ar[0] + ", " + ar[1], 5, 36);
					m.cc.fillStyle = "rgb(100, 100, 255)";
					m.cc.fillRect(x1, y1, m.pich * m.spanX * 2 * (endX - startX + 1), m.pich);
				} else {
					m.mouseStartReg = null;
				}
			} else {
				m.mouseStartReg = null;
			}
		}
		
	}
	
	function mouseDownListner(e) {
		e.preventDefault();
		var ar = m.getArrayReg(e);
		if(ar != null) {
			var bouNum = m.boul[ar[1]].length;
			var x1 = m.canvW / 2 - m.pich / 2 - (m.pich * m.spanX * (bouNum - 1)) 
				+ ar[0] * m.pich * m.spanX * 2 - m.pich * m.spanX + m.pich / 2;
			var y1 = m.canvH / 2 - m.boul.length / 2 * m.pich * m.spanY 
				+ m.pich * 10 / 2 - m.pich / 2 + ar[1] * m.pich * m.spanY;
			
			m.paint();
			
			//m.cc.fillText("TEST：" + ar[0] + ", " + ar[1], 5, 36);
			
			m.cc.fillStyle = "rgb(100, 100, 255)";
			m.cc.fillRect(x1, y1, m.pich * m.spanX * 2, m.pich);
			m.mouseStartReg = ar;
		}
	}
	
	function mouseUpListner(e) {
		if(m.mouseStartReg != null) {
			var ar = m.getArrayReg(e);
			if(ar != null && m.mouseStartReg[1] == ar[1]) {
				var startX = (m.mouseStartReg[0] < ar[0])? m.mouseStartReg[0]: ar[0];
				var endX = (m.mouseStartReg[0] > ar[0])? m.mouseStartReg[0]: ar[0];
				
				//m.turnが1のときのみプレイヤーの番
				//-- m.turnでプレイヤーの番のとき0に変換すると同時にコンピュータの番にする
				//コンピューターの番(m.turn <= 0)の時はif文の内部に入らないようにする
				//m,turnはgoComTurn()の中で1に戻される
				if(m.isCanErase(startX, endX, ar[1]) && !(-- m.turn)) {
					m.myErase(new Array(ar[1], startX, endX - startX + 1));
					m.paint(1);
					if(m.isEnd()) {
						var str = "<h2>コンピュータの勝ち</h2>";
						str += "[Restart]をクリックしてください。";
						document.getElementById("game").innerHTML = str;
					} else {
						m.goComTurn();
						m.paint();
					}
				} else {
					m.mouseStartReg = null;
				}
			} else {
				m.mouseStartReg = null;
			}
		}
	}
	
};

BoukeshiGraph.prototype = {
	paint: function(recolorNum) {
		this.cc.clearRect(0, 0, this.canvW, this.canvH);
		
		var centerX = this.canvW / 2;
		var centerY = this.canvH / 2;
		for(var i = 0; i < this.boul.length; i ++) {
			var bouNum = this.boul[i].length;
			for(var j = 0; j < bouNum; j ++) {
				var x1 = centerX - this.pich / 2 - (this.pich * this.spanX * (bouNum - 1)) 
					+ j * this.pich * this.spanX * 2;
				var y1 = centerY - this.boul.length / 2 * this.pich * this.spanY 
					+ i * this.pich * this.spanY;
				
				this.cc.fillStyle = "rgb(0, 0, 0)";
				this.cc.fillRect(x1, y1, this.pich, this.pich * 10);
				if(this.boul[i][j]) {
					var x2 = x1 - this.pich * this.spanX + this.pich / 2;
					var y2 = y1 + this.pich * 10 / 2 - this.pich / 2;
					this.cc.fillStyle = (this.boul[i][j] == 1)? "rgb(200, 0, 0)": 
						(this.boul[i][j] == 2)? "rgb(0, 0, 200)": "rgb(255, 100, 100)";
					this.cc.fillRect(x2, y2, this.pich * this.spanX * 2, this.pich);
					if(recolorNum && this.boul[i][j] == 3) this.boul[i][j] = recolorNum;
				}
			}
		}
		
	},
	
	myErase: function(region) {
		if(this.boukeshi.eraseBar(region[0], region[1], region[2])) {
			for(var i = 0; i < region[2]; i ++) {
				this.boul[region[0]][region[1] + i] = 2;
			}
		} else {
			return false;
		}
		return true;
	},
	
	comErase: function() {
		//コンピュータの手番
		this.boukeshi.autoEraseBar();
		//コンピューターの棒の消去場所の取得
		var comEr = this.boukeshi.getNowErase();
		
		for(var i = 0; i < comEr[2]; i ++) {
			this.boul[comEr[0]][comEr[1] + i] = 3;
		}
	},
	
	goComTurn: function() {
		this.comErase();
		var str = "";
		if(this.isEnd()) {
			str += "<h2>あなたの勝ち！</h2>[Restart]をクリックしてください。";
		} else {
			str += "あなたの番です。";
			this.turn = 1;
		}
		document.getElementById("game").innerHTML = str;
	},
};

////////////////////////////////////////////////////////////////////////////////////////////////////

var BoukeshiStageMaker = function(docEl, stage, option) {
	this.inherit = BoukeshiGraphRoot;
	this.inherit(docEl, stage, option);
	
	this.indentY = 10;
	
	this.mouseYpos = null;
	
	this.paint(0);
	var str = "<h2>ステージの作成</h2><ul>";
	str += "<li>一番下の段をクリック（タップ）するとその段が消去されます</li>";
	str += "<li>一番下の次の段の位置をドラッグすると段が追加されます</li>";
	str += "<li>[Restart]で作成ステージをプレーできます</li>";
	str += "</ul>";
	document.getElementById("game").innerHTML = str;
	
	var m = this;
	
	this.canvas.addEventListener("mousemove", mouseMoveListner, true);
	this.canvas.addEventListener("mousedown", mouseDownListner, true);
	this.canvas.addEventListener("mouseup", mouseUpListner, true);
	
	this.canvas.addEventListener("touchmove", function(e) {
		e.preventDefault();
		var touch = e.changedTouches[0];
		mouseMoveListner(touch);
	}, true);
	this.canvas.addEventListener("touchstart", function(e) {
		var touch = e.touches[0];
		mouseDownListner(touch);
	}, true);
	this.canvas.addEventListener("touchend", function(e) {
		var touch = e.changedTouches[0];
		mouseUpListner(touch);
	}, true);
	
	this.getArrayReg = function(e) {
		var xy = m.getXY(e);
		var xAr;
		var yAr = Math.floor((xy[1] - m.indentY) / (m.pich * m.spanY));
		if(0 <= yAr && yAr <= m.stage.length) {
			xAr = Math.abs(Math.floor((xy[0] - m.canvW / 2) / (m.pich * m.spanX)));
			
			return new Array(xAr, yAr);
		}
		
		return null;
	}
	function mouseMoveListner(e) {
		var ar = m.getArrayReg(e);
		if(ar != null) {
			if(ar[1] == m.mouseYpos) {
				if(m.stage.length == m.mouseYpos) {
					m.paint(0);
					for(var j = 0; j <= ar[0]; j ++) {
						var x1 = m.canvW / 2 - m.pich / 2 - (m.pich * m.spanX * (ar[0])) 
							+ j * m.pich * m.spanX * 2;
						var y1 = m.indentY + ar[1] * m.pich * m.spanY;
						m.cc.fillStyle = "rgb(0, 0, 0)";
						m.cc.fillRect(x1, y1, m.pich, m.pich * 10);
					}
				} else {
					m.paint(1);
				}
			} else {
				m.mouseYpos = null;
				m.paint(0);
			}
		} else {
			m.mouseYpos = null;
			m.paint(0);
		}
		
	}
	
	function mouseDownListner(e) {
		var ar = m.getArrayReg(e);
		if(ar != null) {
			if(ar[1] == m.stage.length) {
				m.mouseYpos = ar[1];
				m.paint(0);
				for(var j = 0; j <= ar[0]; j ++) {
					var x1 = m.canvW / 2 - m.pich / 2 - (m.pich * m.spanX * (ar[0])) 
						+ j * m.pich * m.spanX * 2;
					var y1 = m.indentY + ar[1] * m.pich * m.spanY;
					m.cc.fillStyle = "rgb(0, 0, 0)";
					m.cc.fillRect(x1, y1, m.pich, m.pich * 10);
				}
			} else if(ar[1] == m.stage.length - 1) {
				m.mouseYpos = ar[1];
				m.paint(1);
			} else {
				m.paint(0);
			}
		} else {
			m.paint(0);
		}
	}
	
	function mouseUpListner(e) {
		var ar = m.getArrayReg(e);
		if(ar != null) {
			if(ar[1] == m.mouseYpos) {
				if(m.stage.length == m.mouseYpos) {
					m.stage[m.stage.length] = ar[0] + 1;
				} else {
					m.stage.length = m.mouseYpos;
				}
			}
		}
		m.mouseYpos = null;
		m.paint(0);
	}
};

BoukeshiStageMaker.prototype = {
	paint: function(eraseNum) {
		this.cc.clearRect(0, 0, this.canvW, this.canvH);
		for(var i = 0; i < this.stage.length; i ++) {
			var bouNum = this.stage[i];
			for(var j = 0; j < bouNum; j ++) {
				var x1 = this.canvW / 2 - this.pich / 2 - (this.pich * this.spanX * (bouNum - 1)) 
					+ j * this.pich * this.spanX * 2;
				var y1 = this.indentY + i * this.pich * this.spanY;
				this.cc.fillStyle = (eraseNum && i >= this.stage.length - eraseNum)? 
					"rgb(200, 200, 200)": "rgb(150, 150, 150)";
				
				this.cc.fillRect(x1, y1, this.pich, this.pich * 10);
			}
		}
	},
};

