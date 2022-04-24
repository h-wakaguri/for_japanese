// Author: H. Wakaguri 2011/09/05

var BoukeshiOneLine = function() {
	this.allStruct = new Array();
};
BoukeshiOneLine.prototype = {
	getString: function() {
		var barStr = "";
		for(var i = 0; i < this.allStruct.length; i ++) {
			if(barStr != "") {
				barStr += " ";
			}
			barStr += (this.allStruct[i])? "+": "|";
		}
		
		return barStr;
	},
	
	getList: function() {
		var status = false;
		var placeNum = 0;
		
		for(var i = 0; i < this.allStruct.length; i ++) {
			if(!status && !this.allStruct[i]) {
				placeNum ++;
				status = true;
			} else if(status && this.allStruct[i]) {
				status = false;
			}
		}

		var oneLine = new Array(placeNum);
		var insPoint = 0;
		var spaceNum = 0;
		for(var i = 0; i < this.allStruct.length; i ++) {
			if(!this.allStruct[i]) {
				spaceNum ++;
			} else if(this.allStruct[i] && spaceNum != 0) {
				oneLine[insPoint ++] = spaceNum;
				spaceNum = 0;
			}
		}
		if(spaceNum != 0) {
			oneLine[insPoint] = spaceNum;
		}

		return oneLine;
	},
	
	//消すスペースが残っているdanNum番目(0から)の棒が始まる位置(左端が0)
	getStart: function(danNum) {
		var status = false;
		var placeNum = 0;
		
		for(var i = 0; i < this.allStruct.length; i ++) {
			if(!status && !this.allStruct[i]) {
				if(danNum == placeNum) {
					return i;
				}
				placeNum ++;
				status = true;
			} else if(status && this.allStruct[i]) {
				status = false;
			}
		}
		
		return -1;
	},
	
	getXor: function() {
		var oneLine = this.getList();
		
		var xor = 0;
		for(var i = 0; i < oneLine.length; i ++) {
			xor ^= oneLine[i];
		}
		
		return xor;
	},
	
	
	getMoreThanTwo: function() {
		var oneLine = this.getList();
		var moreThanTwo = 0;
		
		for(var i = 0; i < oneLine.length; i ++) {
			if(oneLine[i] != 1) moreThanTwo ++;
		}
		
		return moreThanTwo;
	},
	
	isNoBar: function() {
		var oneLine = this.getList();
		return (oneLine.length > 0)? false: true;
	},
	
	setAllStruct: function(allStruct) {
		for(var i = 0; i < allStruct.length; i ++) {
			allStruct[i] = false;
		}
		this.allStruct = allStruct;
	},
	
	getAllStruct: function() {
		return this.allStruct;
	},
};

////////////////////////////////////////////////////////////////////////////////////////////////////

var Boukeshi = function(boukeshiLineNums) {
	this.eraseLog = new Array();
	this.boukeshiOneLine = new Array(boukeshiLineNums.length);
	for (var i = 0; i < boukeshiLineNums.length; i++) {
		var oneLine = new Array(boukeshiLineNums[i]);
		this.boukeshiOneLine[i] = new BoukeshiOneLine();
		this.boukeshiOneLine[i].setAllStruct(oneLine);
	}
	this.logpoint = 0;
};
Boukeshi.prototype = {
	getXor: function() {
		var xor = 0;
		for (var i = 0; i < this.boukeshiOneLine.length; i++) {
			var oneLine = this.boukeshiOneLine[i].getXor();
			xor ^= oneLine;
		}

		return xor;
	},
	
	eraseBar: function(dan, start, lng) {
		dan   = Math.floor(dan);
		start = Math.floor(start);
		lng   = Math.floor(lng);
		
		if(dan <= -1 || start <= -1 || lng <= 0 || isNaN(dan + start + lng) || 
			dan >= this.boukeshiOneLine.length) {
			
			return false;
		} else if(this.reverseBar(dan, start, lng, false)) {
			var nowLog = new Array(dan, start, lng);
			if(this.eraseLog.length > this.logpoint) this.eraseLog.length = this.logpoint;
			this.eraseLog[this.eraseLog.length] = nowLog;
			this.logpoint++;
		} else {
			return false;
		}
		
		return true;
	},
	
	reverseBar: function(dan, start, lng, ft) {
		var allStruct = this.boukeshiOneLine[dan].getAllStruct();
		for (var i = start; i < start + lng; i++) {
			if (allStruct[i] != ft) {
				return false;
			}
		}
		for (var i = start; i < start + lng; i++) {
			allStruct[i] = (allStruct[i])? false: true;
		}
		
		return true;
	},
	
	backLog: function() {
		if (this.logpoint == 0) {
			return false;
		}
		var nowErase = this.getNowErase();
		this.reverseBar(nowErase[0], nowErase[1], nowErase[2], true);
		this.logpoint--;

		return true;
	},
	
	forwardLog: function() {
		if (this.logpoint == this.eraseLog.length) {
			return false;
		}
		var nextErase = this.eraseLog[this.logpoint];
		reverseBar(nextErase[0], nextErase[1], nextErase[2]);
		this.logpoint++;

		return true;
	},
	
	autoEraseBar: function() {
		//最良手で消す場所を取得する
		var randomErasePlace = this.getRandomBestErasePlace();
		return this.autoEraser(randomErasePlace);
	},
	
	autoRandomEraseBar: function() {
		var randomErasePlace = this.getRandomErasePlace();
		return this.autoEraser(randomErasePlace);
	},
	
	autoEraser: function(erasePlace) {
		//消す棒が1個もない場合
		if (erasePlace == false) {
			return false;
		}

		var dan = erasePlace[0];
		var danNum = erasePlace[1];
		var leftSpace = erasePlace[2];
		var rightSpace = erasePlace[3];
		var spaceNum = this.boukeshiOneLine[dan].getList()[danNum];
		var spaceStart = this.boukeshiOneLine[dan].getStart(danNum);
		var start = spaceStart + leftSpace;
		var length = spaceNum - leftSpace - rightSpace;

		this.eraseBar(dan, start, length);

		return true;
	},
	
	getNowErase: function() {
		if (this.logpoint == 0) {
			return false;
		}

		var nowErase = this.eraseLog[this.logpoint - 1];
		//変更を防ぐためコピーして返す。
		var cpErase = new Array(nowErase[0], nowErase[1], nowErase[2]);

		return cpErase;
	},
	
	getAllData: function() {
		var tmpBoukeshi = this.boukeshiOneLine;
		var cpBoukeshi = new Array();

		for (var i = 0; i < tmpBoukeshi.length; i++) {
			var tmpBoukeshiStruct = tmpBoukeshi[i].getAllStruct();
			var tmpArray = new Array(tmpBoukeshiStruct.length);
			for (var j = 0; j < tmpBoukeshiStruct.length; j++) {
				tmpArray[j] = tmpBoukeshiStruct[j];
			}
			cpBoukeshi[cpBoukeshi.length] = tmpArray;
		}

		return cpBoukeshi;
	},
	
	isLast: function() {
		var moreThanTwo = 0;

		for (var i = 0; i < this.boukeshiOneLine.length; i++) {
			moreThanTwo += this.boukeshiOneLine[i].getMoreThanTwo();
			if (moreThanTwo >= 2) {
				return false;
			}
		}

		return true;
	},
	
	isOneOnly: function() {
		for (var i = 0; i < this.boukeshiOneLine.length; i++) {
			if (this.boukeshiOneLine[i].getMoreThanTwo() >= 1) {
				return false;
			}
		}
		return true;
	},
	
	isEnd: function() {
		for (var i = 0; i < this.boukeshiOneLine.length; i++) {
			if (!this.boukeshiOneLine[i].isNoBar()) {
				return false;
			}
		}

		return true;
	},
	
	isWin: function() {
		if (this.isOneOnly()) {
			var oneNum = 0;
			for (var i = 0; i < this.boukeshiOneLine.length; i++) {
				oneNum += this.boukeshiOneLine[i].getList().length;
			}
			if (oneNum % 2 == 0) {
				return true;
			}
			return false;
		} else if (this.getXor() == 0) {
			return false;
		}

		return true;
	},
	
	candidatePlace: function() {
		var candidate = new Array();

		var xor = this.getXor();
		if (xor != 0) {
			var big = Math.pow(2, Math.log(xor) / Math.log(2));

			for (var i = 0; i < this.boukeshiOneLine.length; i++) {
				var oneLine = this.boukeshiOneLine[i].getList();
				for (var j = 0; j < oneLine.length; j++) {
					var spaceNum = oneLine[j];
					var andValue = spaceNum & big;
					//候補スペースの場合
					if (andValue != 0) {
						var candNum = 0;
						//2本があって、他は１本の場合(このパターンのみイレギュラーになる)
						if (this.isLast() && spaceNum == 2) {
							//xorが2の場合消し方は2通り、3の場合1通り
							candNum = 4 - xor;
						} else {
							//これだけ残せばOK(左右どちらかに残す)
							var xor2 = xor ^ spaceNum;
							for (var k = 0; k < spaceNum; k++) {
								var nowLeft = k;
								//両方共通で残すスペース + 左側で残さなかったスペースを右側に残す
								var nowRight = (k & (~xor2)) + (xor2 & (~k));
								var restLength = nowLeft + nowRight;
								if (restLength < spaceNum) {
									candNum++;
								}
							}
						}
						var tempCand = new Array(i, j, spaceNum, candNum);
						candidate[candidate.length] = tempCand;
					}
				}
			}
		}

		return candidate;
	},
	
	getTotalPlace: function() {
		var candidate = this.candidatePlace();
		//消し方の数
		var totalPlace = 0;
		for (var i = 0; i < candidate.length; i++) {
			var tempCand = candidate[i];
			totalPlace += tempCand[3];
		}

		return totalPlace;
	},
	
	getRandomBestErasePlace: function() {
		var totalPlace = this.getTotalPlace();

		//負け状態の場合ランダムな場所を返す
		if(totalPlace == 0) {
			var erasePos = this.getRandomErasePlace();
			return erasePos;
		}

		//勝ち状態の場合、勝ち手の中からランダムに場所を返す
		var candidate = this.candidatePlace();

		var rndNum = Math.floor(Math.random() * totalPlace);
		for (var i = 0; i < candidate.length; i++) {
			var tempCand = candidate[i];
			if (rndNum < tempCand[3]) {
				var erasePlase
					= this.getErasePlace(tempCand[2], rndNum);

				var erasePos = new Array(4);
				erasePos[0] = tempCand[0];
				erasePos[1] = tempCand[1];
				erasePos[2] = erasePlase[0];
				erasePos[3] = erasePlase[1];

				return erasePos;
			}
			rndNum -= tempCand[3];
		}

		return false;
	},
	
	getRandomErasePlace: function() {
		var placeNum = 0;
		for (var i = 0; i < this.boukeshiOneLine.length; i++) {
			var oneLine = this.boukeshiOneLine[i].getList();
			placeNum += oneLine.length;
		}

		var rndNum = Math.floor(Math.random() * placeNum);
		for (var i = 0; i < this.boukeshiOneLine.length; i++) {
			var oneLine = this.boukeshiOneLine[i].getList();
			if (rndNum < oneLine.length) {
				var spaceNum = oneLine[rndNum];
				var leftSpace = Math.floor(Math.random() * spaceNum);
				var rightSpaceNum = spaceNum - leftSpace;
				var rightSpace = Math.floor(Math.random() * rightSpaceNum);

				var erasePos = new Array(4);
				erasePos[0] = i;
				erasePos[1] = rndNum;
				erasePos[2] = leftSpace;
				erasePos[3] = rightSpace;

				return erasePos;
			}
			rndNum -= oneLine.length;
		}

		return false;
	},
	
	getErasePlace: function(spaceNum, pickNum) {
		var passNum = 0;
		var xor = this.getXor();
		//これだけ残せばOK(左右どちらかに残す)
		var xor2 = xor ^ spaceNum;
		for (var i = 0; i < spaceNum; i++) {
			//左右に残すスペースを決める
			//左側に残すスペース
			var nowLeft = i;
			//両方共通で残すスペース + 左側で残さなかったスペースを右側に残す
			var nowRight = (i & (~xor2)) + (xor2 & (~i));
			var restLength = nowLeft + nowRight;
			//残す長さが元の長さ未満の場合のみ採用可能
			if (restLength < spaceNum) {
				//２本が一ヶ所と他が一本かつxorが２のときのイレギュラー消去
				if (this.isLast() && spaceNum == 2 && xor == 2) {
					var erasePlase = new Array(pickNum, 1 - pickNum);
					return erasePlase;
				}
				if (passNum == pickNum) {
					var erasePlase = new Array(2);
					erasePlase[0] = nowLeft;
					//最終段階のイレギュラーな消去
					if (nowRight < 2 && this.isLast() && !this.isOneOnly()) {
						nowRight = 1 - nowRight;
					}
					erasePlase[1] = nowRight;

					return erasePlase;
				}
				passNum ++;
			}
		}

		return false;
	},
	
	getString: function() {
		var maxBouLng = 0;
		for (var i = 0; i < this.boukeshiOneLine.length; i++) {
			var bouLng = this.boukeshiOneLine[i].getAllStruct().length;
			if (maxBouLng < bouLng) { maxBouLng = bouLng; }
		}

		var str = "";
		for (var i = 0; i < this.boukeshiOneLine.length; i++) {
			var bouLng = this.boukeshiOneLine[i].getAllStruct().length;
			for (var j = 0; j < maxBouLng - bouLng; j++) {
				str += " ";
			}
			str += this.boukeshiOneLine[i].getString() + "\n";
		}

		return str;
	},
};

