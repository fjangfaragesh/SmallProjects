const FFT = {};
//p.legth power of 2
FFT.realFFT = function(p, doInverse) {
    let pComplex = new Array(p.length);
    for (let i = 0; i < p.length; i++) pComplex[i] = [p[i],0.0];
    return FFT.fft(pComplex, doInverse, false);
}

// p: [[real,imag],[real,imag], ...] p.legth power of 2
FFT.fft = function(p, doInverse, _recursiveCall) {
    const n = p.length;
    
    if (n === 0) {
        return [];
    }
    
    if (n === 1) {
        return [[p[0][0],p[0][1]]];
    }
    
    if (Math.log2(n) !== Math.floor(Math.log2(n))) throw new Error("length=" + n + " is not a power of 2.");
    let omegaArg = -2.0*Math.PI/n;
    
    if (doInverse) {
        omegaArg = -omegaArg;
    }
    
    
    const pEven = new Array(n/2);
    const pOdd = new Array(n/2);
    for (let i = 0; i < n/2; i++) {
        pEven[i] = p[i*2];
        pOdd[i] = p[i*2 + 1];
    }
    
    const yEven = FFT.fft(pEven,doInverse,true);
    const yOdd = FFT.fft(pOdd,doInverse,true);
    
    const y = new Array(n);
        
    for (let i = 0; i < n/2; i++) {
        const omegaPowerIReal = Math.cos(omegaArg*i);
        const omegaPowerIImag = Math.sin(omegaArg*i);
        
        const productRe = yOdd[i][0]*omegaPowerIReal - yOdd[i][1]*omegaPowerIImag;
        const productIm = yOdd[i][0]*omegaPowerIImag + yOdd[i][1]*omegaPowerIReal;
        
        y[i] = [yEven[i][0] + productRe, yEven[i][1] + productIm];
        y[i + n/2] = [yEven[i][0] - productRe, yEven[i][1] - productIm];
    }
    
    if (!_recursiveCall && doInverse) {
        for (let i = 0; i < n; i++) {
            y[i][0] /= n;
            y[i][1] /= n;
        }
    }
    return y;
}
