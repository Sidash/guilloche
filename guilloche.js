class Parametric {
// generating parmatric functions scaling between s in [0,1]

	constructor(p) {
		this.base = p
	}
	// utility
	//

	static getParametric(p) {
		// returns the parametric function
		try { p(0) } 
		catch (TypeError) { p = p.base}
		return p
	}

	static get pExp() {
		return 3 // decimals considered for phase offset clearance
	}

	static getPhaseClearance(x) {	// getPhaseClearance
		var e = this.pExp
		var d = this.getDigits(x)
		var s = x.toFixed(e)
		x = parseInt(x.toFixed(this.pExp).substr(this.getDigits(x)+1,e))
		if (!x) return 1 
		return this.getLcm(x,10**e)/x
	}

	static getDigits(x) { 	
		return 1+Math.floor(Math.log(x)/Math.log(10)); 
	}

	static getGcd(x, y) {
		x = Math.abs(x);
		y = Math.abs(y);
		while(y) {
			var t = y;
			y = x%y;
			x = t;
		}
		return x;
	}

	static getLcm(x, y) {
		if ((typeof x !== 'number') || (typeof y !== 'number'))  {
			return false;
		}
		return (!x || !y) ? 0 : Math.abs((x * y) / this.getGcd(x, y));
	} 

	static sawtooth(x) {
		if (x == 1) {
			return 1
		}
		return x%1
	}

	static checkDomain(s) {
		if ((s > 1) || (s < 0)) {
			throw(`s: ${s} is not in range`)
		}
	}

	// basic parametric functions
	//

	static constant() {
		return function(s) {
			return {x:s, y:0}
		}
	}

	static circle(radius) {
		return function(s) {
			s = s*2*Math.PI
			return {x: radius*Math.sin(s), y: radius*Math.cos(s)}
		}
	}

	static epicycloid(excentrical) { //normalized epicycloid
		excentrical /= 2*Math.PI
		var radius  = 1/2/Math.PI
		return function(s) {
			s = s*2*Math.PI
			return {x: (radius*s- excentrical*Math.sin(s)),
					y: ( - Math.cos(s) )}			
		}
	}

	static sinus(amp) {
		return function(s) {
			return {x:s, y:amp*Math.sin(s*2*Math.PI)}
		}
	}


	static saber(amp) {
		return function(s) {
			return {x:s, y:amp*s}
		}
	}

	static polygon(n,radius) {
		var angle = 2*Math.PI/n
		var length = 2*Math.tan(angle/2)

		var line = function(s) {
			return {x: radius*(s-0.5)*length, y: radius}
		}

		var l = new Array()
		for (var i = 0; i < n; i ++) {
			l.push(this.rotateXY(line,angle*i,0))
		}

		return this.offsetS(this.appendMulti(l),1/n/2)
	}

	// basic transformations
	//

	rotate(radius, rev, repeat) {
		this.base = Parametric.rotate(this.base, radius, rev, repeat)
	}
	rotateXY(angle) {
		this.base = Parametric.rotateXY(this.base, angle)
	}

	transform(shiftX, shiftY, scaleX, scaleY) {
		this.base = Parametric.transform(this.base, shiftX, shiftY, scaleX, scaleY)
	} 

	offsetX(offset) {
		this.base = Parametric.offsetX(this.base, offset) 
	}

	offsetS(offset) {
		this.base = Parametric.offsetS(this.base, offset)
	}

	mirrorS(mirror) {
		this.base = Parametric.mirrorS(this.base, mirror)
	}

	flipXY() {
		this.base = Parametric.flipXY(this.base)
	}

	flipX() {
		this.base = Parametric.flipX(this.base)
	}

	flipY() {
		this.base = Parametric.flipY(this.base)
	}

	repeatX(repeat) {
		this.base = Parametric.repeatX(this.base, repeat)
	}

	repeat(repeat) {
		this.base = Parametric.repeat(this.base, repeat)
	} 	

	guilloche(p2, p3, rev1, rev2, repeat) {
		this.base = Parametric.guilloche(this.base, p2.base, p3.base, rev1, rev2, repeat)
	}

	append(p2,ratio) {
		this.base = Parametric.append(this.base,p2.base,ratio)
	}

	addX(p2,ratio) {
		this.base = Parametric.addX(this.base,p2.base,ratio)
	}


//	append(p1,p2,ratio) {}
//	appendMulti(pList) {}

	static rotateXY(p,angle) {
	// rotate parametric p around the origin
		return function(s) {
			var val = p(s)
			return {x: val.x * Math.cos(angle) + val.y * Math.sin(angle),
					y: - val.x * Math.sin(angle) + val.y * Math.cos(angle)}
		}
	}

	static transform(p,shiftX,shiftY,scaleX,scaleY) {
	// scales and shifts p
	// !obs: scaling by -1 changes how s traverses
		return function(s) {
			var val = p(s)
			val.x = val.x * scaleX + shiftX
			val.y = val.y * scaleY + shiftY
			return val
		}
	} 

	static offsetX(p, offset) { 
	// offsets parametric p by parameter s
	// between x = [0,1]
	// such that after transform s is at x = 0
		this.checkDomain(offset)
		return function(s) {
			s += offset
			if (s < 1) {
				var val = p(s)
				val.x = val.x-offset
				return val
			} else {
				var val = p(s-1)
				val.x = val.x-offset+1
				return val
			}
		}
	}

	static offsetS(p, offset) {
	// offsets a parametric p by an offset in s direction,
	// effetively moving the starting point
	// and continuing to loop back after s > 1
		this.checkDomain(offset)
		return function(s) {
			s += offset
			if (s < 1) {
				return p(s)
			} else {
				return p(s-1)
			}
		}
	}

	static mirrorS(p,mirror) { 
	// rolls backwards after s reaches mirror
	// such that p'(0) == p'(1) after mirroring
		this.checkDomain(mirror)
		return function(s) {
			if (s < mirror) {
				return p(s/mirror)
			} else {
				return p((1-s)/(1-mirror))
			}
		}
	}

	static append(p1,p2,ratio) {
	// appends to parametric functions p1, p2
	// when reaching ratio
		this.checkDomain(ratio)
		return function (s) {
			if (s <= ratio) {
				return p1(s/ratio)
			} else {
				return p2((s-ratio)/(1-ratio))
			}
		}
	}

	static appendMulti(pList) {
		// appends multiple parametric functions
		return function(s) {
			var bigS = s * pList.length
			var selector = Math.floor(bigS)
			return pList[selector](Parametric.sawtooth(bigS))
		}
	}

	static flipXY(p) { 
		// flips in x between [0,1] and 
		// in y direction, reversing s
		return function(s) {
			var val = p(1-s)
			val.y = -val.y
			val.x = 1-val.x
			return val
		}
	}

	static flipX(p) { 
		// flips in x between [0,1] 
		// and reverses s
		return function(s) {
			var val = p(1-s)
			val.x = 1-val.x
			return val 
		}
	}

	static flipY(parametric) { 
		// flips in y 
		return function(s) {
			var val = parametric(s)
			val.y = - val.y
			return val
		}
	}

	static flipS(parametric) {
		// reverses the parameter direction
		return function (s) {
			return parametric(1-s)
		}
	}

	static repeatX(parametric,repeat) {
		// appends two parametric functions
		// in x-direction
		return function(s) {
			var sR = s*repeat
			var s = Parametric.sawtooth(sR)
			var advance = sR - s 
			var val = parametric(s)
			return {x: (val.x + advance)/repeat, y: val.y}
		}
	}

	static repeat(parametric, repeat) { 	
		// repeats from start of curve
		return function(s) {
			s = s * repeat
			var s = Parametric.sawtooth(s)
			return parametric(s)
		}
	}

	static addX(p1,p2,ratio) { 
		// adds two parameter functions in x
		// scaling down in x-Direction
		return function(s) {
			if (s <= ratio) {
				var val = p1(s/ratio)
				val.x = val.x*ratio
				return val
			} else {
				var val = p2((s-ratio)/(1-ratio))
				//val.y = 0
				val.x = val.x*(1-ratio)+ratio
				return val
			}
		}
	}

	// parametrizations of parameter functions

	static mid(env1, env2, ratio) {
	// interpolates between two envelopes
	// such that mid(e1,e2,1) == e2
		var mid = function(s) {
			return {x: s, y: ratio}
		}
		return this.guilloche(mid,env1,env2,1,1,1)
	}

	static rotate(parametric, radius, rev, repeat) {
		// rotates a parametric around a radius 
		// the parametric x is mapped to the angular direction
		// the parmaetric y is mapped to a radius offset
		var c = this.getPhaseClearance(repeat)
		if (c < rev) {
			rev = c
			console.log(c)
		}
		return function(s) {
			s = s*rev
			var sR = s*repeat
			var val = parametric(sR%1)
			var cor = sR - sR%1		// corrector
			return {x: (radius+radius*val.y)*Math.sin((cor+val.x)*2*Math.PI/repeat),
				    y: (radius+radius*val.y)*Math.cos((cor+val.x)*2*Math.PI/repeat)}
		}
	}

	static rotateUsingGuilloche(p,radius,rev,repeat) {
		// same as rotate
		var c1 = this.circle(radius*2)
		var c2 = function(s) {return {x: 0, y: 0}}
		return this.guilloche(c2,c1,p,rev,rev,repeat)
	}

	static guilloche(p1,p2,p3,rev1,rev2,repeat) {
		// scales paremetric p3 (x in [0,1] y in [-1,1]) linearly 
		// between the envelopes p1 and p2
		// rev1, rev2: the total nomber of revolutions in p1 and p2, respectively
		// repeat: the number of repeats for p3 within one revolution 
		var c = Parametric.getPhaseClearance(repeat)
		if ((rev1 == rev2) && (c < rev1)) {
			rev1 = c
			rev2 = c
			console.log(c)
		}
		// TODO phase clearance for rev1 != rev2
		repeat *= Math.max(rev1,rev2)
		p1 = Parametric.repeatX(p1,repeat)
		p2 = Parametric.repeat(p2,rev1)
		p3 = Parametric.repeat(p3,rev2)
		return function(s) {
			var g = p1(s)  // guilloche value
			var v1 = p2(g.x)
			var v2 = p3(g.x)
			var x = v1.x + (v2.x - v1.x)*(g.y+1)/2
			var y = v1.y + (v2.y - v1.y)*(g.y+1)/2
			return {x: x, y: y}
		}	
	}
}

class Guilloche {
	// drawing curves



	constructor(element) {
		this.prepareContext(element)
		this.step = 0.0001
	}

	drawColor(parametric) {
		var ctx = this.ctx
		var p = Parametric.getParametric(parametric)
		var val = p(0)
		var s = 0
		var k = 0
		ctx.beginPath()
		ctx.moveTo(val.x, val.y)
		while (s < 1) {
			val = p(s)
			ctx.lineTo(val.x, val.y)
			ctx.strokeStyle = `rgb(${Math.floor(20 + 200 * s)} , 0, ${Math.floor(220 - 200 * s)} )`
			s += this.step
			k += this.step
			if (k > 0.04) {
				k = 0
				ctx.stroke()
				ctx.beginPath()
			}
		}
		ctx.stroke()
	}

	draw(parametric) {
		var ctx = this.ctx
		var p = Parametric.getParametric(parametric)
		var val = p(0)
		var s = 0
		ctx.beginPath()
		ctx.moveTo(val.x, val.y)
		while (s <= 1) {
			val = p(s)
			ctx.lineTo(val.x, val.y)
			s += this.step
		}
		ctx.stroke()
	}

	drawMid(env1, env2, ratio) {
		var env1 = Parametric.getParametric(env1)
		var env2 = Parametric.getParametric(env2)
		var mid = Parametric.mid(env1, env2, ratio)
		this.draw(mid,0.001)
	}

	drawFishscale(env1,env2,periodic,rev,repeat,phase,no) { 
		// draws a fishscale like pattern between envelopes env1, env2
		var env1 = Parametric.getParametric(env1)
		var env2 = Parametric.getParametric(env2)
		var periodic = Parametric.getParametric(periodic)
		var step = 1/no
		var i = 0
		while (i < no) {
			var mid1 = Parametric.mid(env1,env2,i*2*step-1)
			i++
			var mid2 = Parametric.mid(env1,env2,i*2*step-1)
			var o = Parametric.offsetX(periodic, (i*phase)%1)
			var g = Parametric.guilloche(o,mid1,mid2,rev,rev,repeat)
			this.draw(g,0.0001)
		}
	}

	prepareContext($el) {
		this.ctx = $el.getContext("2d")
		this.ctx.imageSmoothingEnabled = false;
		this.ctx.translate($el.width/2+0.5, $el.height/2+0.5);
		this.ctx.scale($el.width/2,$el.height/2)
		this.ctx.beginPath();
		this.ctx.lineWidth = 0.001
		this.ctx.lineJoin = "round"
	}
}

