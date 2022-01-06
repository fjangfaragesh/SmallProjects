

function test() {
    return new PDE_Runner(256,256, ["a","ax","ay","ax+","ay+","axx","axy","ayx","ayy","at","att","k","e"],
        testFragInitFunction,      
        testControlFlowFunction,
        testFragTickFunction,
        testColorFunction  
    );
}
let testFragInitFunction = function(x,y,output) {
    let randDistance = Math.min(127.5 - Math.abs(x - 127.5),127.5 - Math.abs(y - 127.5));
    if (randDistance <= 5) {
        output.a = 0.0;
        output.at = 0.0;
        output.reib = 0.2/(randDistance+0.2);
        
    } else {
        output.a = 0.0;
        output.at = 0.0;
        output.reib = x+y < 80 ? 0.01 : 0.01;
    }
    output.k = ((x-120)*(x-120)*4 + (y-120)*(y-120)) < 2000 ? 0.08 : 0.2;
}
let testFragTickFunction = function(x,y,t,inout) {
    inout.att = (inout.axx + inout.ayy)*inout.k - inout.at*inout.reib;
    if (x == 6) inout.att += Math.sin(t/5)*0.5;
    //inout.e = 0.5*inout.ax*inout.ax + 0.5*inout.ay*inout.ay + 0.5*inout.at*inout.at;
}
let testColorFunction = function(x,y,input) {
    return [map(input.a, -1, 1, 0, 255), map(input.reib, 0.0, 0.1, 0, 255), map(input.k, 0.0, 0.5, 0, 255), 255];
}

let testControlFlowFunction = function(r,dt) {
    calcDerivative(r.field, "a", r.field, "ax+","ay+", 1);
    makeSymmetricalXDerivative(r.field, "ax+", r.field, "ax");
    makeSymmetricalYDerivative(r.field, "ay+", r.field, "ay");
    calcDerivative(r.field, "ax+", r.field, "axx", "axy", -1);
    calcDerivative(r.field, "ay+", r.field, "ayx", "ayy", -1);
    r.frag();
    integr(r.field, "att", "at", r.field, "at", dt);
    integr(r.field, "at", "a", r.field, "a", dt);
    this.t += dt;
}

class PDE_Runner {
    constructor(w,h, fieldNames, fragInitFunction, controlFlowFunction,fragTickFunction, fragColorFunction, clickFunction) {
        this.fieldNames = fieldNames.slice();// felder dürfen nur skalare werte enthalten!
        this.fragInitFunction = fragInitFunction;
        this.controlFlowFunction = controlFlowFunction;
        this.fragTickFunction = fragTickFunction;
        this.fragColorFunction = fragColorFunction;
        this.clickFunction = clickFunction;
        
        
        this.t = 0.0;
        
        this.field = new Fields2d(w,h, this.fieldNames, 1);
//        this.fieldB = new Fields2d(w,h, this.fieldNames, 1);
        this.imageData = new ImageData(w,h);
    }
    
    init() {
        for (let y = 0; y < this.field.h; y++) for (let x = 0; x < this.field.w; x++) {
            this.fragInitFunction(x,y,this.field.data[x][y], {});
        };
        
    }
    tick(dt) {
        this.controlFlowFunction(this,dt);
    }
    frag() {
        for (let y = 0; y < this.field.h; y++) for (let x = 0; x < this.field.w; x++) {
            this.fragTickFunction(x, y, this.t, this.field.data[x][y],this.field.data[x][y]);
        }
        
    }
    show(ctx) {
        ctx.clearRect(0,0,this.field.w, this.field.h);
        for (let y = 0; y < this.field.h; y++) for (let x = 0; x < this.field.w; x++) {
            let i = x + this.field.w*y;
            let c = this.fragColorFunction(x,y, this.field.data[x][y]);
            this.imageData.data[i*4 + 0] = c[0];
            this.imageData.data[i*4 + 1] = c[1];
            this.imageData.data[i*4 + 2] = c[2];
            this.imageData.data[i*4 + 3] = c[3];
        }
        ctx.putImageData(this.imageData, 0,0);
    }
}

class Fields2d {
    constructor(w,h, fieldNames, scale) {
        this.fieldNames = fieldNames;
        this.w = w;
        this.h = h;
        this.scale = scale;
        this.data = new Array(this.h);
        for (let x = 0; x < this.w; x++) {
            this.data[x] = new Array(this.h);
            for (let y = 0; y < this.h; y++) {
                this.data[x][y] = createObjectWithKeys(fieldNames);
            }
        };
    }
}
function calcDerivative(fieldsIn, nameIn, fieldsOut, nameOutX, nameOutY, dsDirection) {
    let ds = fieldsIn.scale*dsDirection;
    let undef = {};
    for (let y = 0; y < fieldsIn.h; y++) for (let x = 0; x < fieldsIn.w; x++) {
        let v = fieldsIn.data[x][y][nameIn];
        let vpx = ((fieldsIn.data[x+dsDirection] ?? [])[y] ?? {})[nameIn];
        let vpy = (fieldsIn.data[x][y+dsDirection] ?? {})[nameIn];
        
        fieldsOut.data[x][y][nameOutX] = vpx === undefined ? 0.0 : (vpx - v)/ds;
        fieldsOut.data[x][y][nameOutY] = vpy === undefined ? 0.0 : (vpy - v)/ds;
    }
}
function makeSymmetricalXDerivative(fieldsIn, nameIn, fieldsOut, nameOut) {
    for (let y = 0; y < fieldsIn.h; y++) for (let x = 0; x < fieldsIn.w; x++) {
        let v = fieldsIn.data[x][y][nameIn];
        let vm = ((fieldsIn.data[x-1] ?? [])[y] ?? {})[nameIn] ?? 0.0;
        fieldsOut.data[x][y][nameOut] = (v + vm)/2.0;
    }
}
function makeSymmetricalYDerivative(fieldsIn, nameIn, fieldsOut, nameOut) {
    for (let y = 0; y < fieldsIn.h; y++) for (let x = 0; x < fieldsIn.w; x++) {
        let v = fieldsIn.data[x][y][nameIn];
        let vm = (fieldsIn.data[x][y-1] ?? {})[nameIn] ?? 0.0;
        fieldsOut.data[x][y][nameOut] = (v + vm)/2.0;
    }
}
function integr(fieldsIn, nameInDer, nameInVal, fieldsOut, nameOut, dt) {
    for (let y = 0; y < fieldsIn.h; y++) for (let x = 0; x < fieldsIn.w; x++) {
        fieldsOut.data[x][y][nameOut] = fieldsIn.data[x][y][nameInVal] + fieldsIn.data[x][y][nameInDer]*dt;
    }
}

function createObjectWithKeys(kys) {
    let ret = {};
    for (let k of kys) ret[k] = undefined;
    return ret;
}

function map(v, in_min, in_max, out_min, out_max) {
  return (v - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}
