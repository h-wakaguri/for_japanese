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
	
	//�����X�y�[�X���c���Ă���danNum�Ԗ�(0����)�̖_���n�܂�ʒu(���[��0)
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
		//�ŗǎ�ŏ����ꏊ���擾����
		var randomErasePlace = this.getRandomBestErasePlace();
		return this.autoEraser(randomErasePlace);
	},
	
	autoRandomEraseBar: function() {
		var randomErasePlace = this.getRandomErasePlace();
		return this.autoEraser(randomErasePlace);
	},
	
	autoEraser: function(erasePlace) {
		//�����_��1���Ȃ��ꍇ
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
		//�ύX��h�����߃R�s�[���ĕԂ��B
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
					//���X�y�[�X�̏ꍇ
					if (andValue != 0) {
						var candNum = 0;
						//2�{�������āA���͂P�{�̏ꍇ(���̃p�^�[���̂݃C���M�����[�ɂȂ�)
						if (this.isLast() && spaceNum == 2) {
							//xor��2�̏ꍇ��������2�ʂ�A3�̏ꍇ1�ʂ�
							candNum = 4 - xor;
						} else {
							//���ꂾ���c����OK(���E�ǂ��炩�Ɏc��)
							var xor2 = xor ^ spaceNum;
							for (var k = 0; k < spaceNum; k++) {
								var nowLeft = k;
								//�������ʂŎc���X�y�[�X + �����Ŏc���Ȃ������X�y�[�X���E���Ɏc��
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
		//�������̐�
		var totalPlace = 0;
		for (var i = 0; i < candidate.length; i++) {
			var tempCand = candidate[i];
			totalPlace += tempCand[3];
		}

		return totalPlace;
	},
	
	getRandomBestErasePlace: function() {
		var totalPlace = this.getTotalPlace();

		//������Ԃ̏ꍇ�����_���ȏꏊ��Ԃ�
		if(totalPlace == 0) {
			var erasePos = this.getRandomErasePlace();
			return erasePos;
		}

		//������Ԃ̏ꍇ�A������̒����烉���_���ɏꏊ��Ԃ�
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
		//���ꂾ���c����OK(���E�ǂ��炩�Ɏc��)
		var xor2 = xor ^ spaceNum;
		for (var i = 0; i < spaceNum; i++) {
			//���E�Ɏc���X�y�[�X�����߂�
			//�����Ɏc���X�y�[�X
			var nowLeft = i;
			//�������ʂŎc���X�y�[�X + �����Ŏc���Ȃ������X�y�[�X���E���Ɏc��
			var nowRight = (i & (~xor2)) + (xor2 & (~i));
			var restLength = nowLeft + nowRight;
			//�c�����������̒��������̏ꍇ�̂ݍ̗p�\
			if (restLength < spaceNum) {
				//�Q�{���ꃖ���Ƒ�����{����xor���Q�̂Ƃ��̃C���M�����[����
				if (this.isLast() && spaceNum == 2 && xor == 2) {
					var erasePlase = new Array(pickNum, 1 - pickNum);
					return erasePlase;
				}
				if (passNum == pickNum) {
					var erasePlase = new Array(2);
					erasePlase[0] = nowLeft;
					//�ŏI�i�K�̃C���M�����[�ȏ���
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

