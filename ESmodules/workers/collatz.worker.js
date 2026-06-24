self.onmessage = (e) => {
    try {
        let n = BigInt(e.data);
        
        const ONE = 1n;
        const TWO = 2n;
        const THREE = 3n;
    
        const list = [];
        let max = n;
    
        while (n !== ONE) {
            list.push(n);
    
            // get biggest number
            if (n > max) {
                max = n;
            }
    
            // if even: n/2, if odd: 3n+1
            if ((n & 1n) === 0n) {
                n = n >> 1n;
            } else {
                n = n * THREE + ONE;
            }
        }
    
        list.push(ONE);
    
        const CHUNK_SIZE = 10000;
    
        for (let i = 0; i <= list.length; i+=CHUNK_SIZE) { // it basically slices the list length into 10,000 steps chunks
            self.postMessage({
                type: "chunk",
                data: list.slice(i, i + CHUNK_SIZE), // it does it here i mean
                offset: i // ... its offset i cant explain
            });
        }
        
        // what it should send when Done or if an Error occurs 
        self.postMessage(
            { type: "done", steps: list.length - 1, max}, 
        );
    } catch (err) {
        self.postMessage({ type: "error", message: "Фантастика, что-то снова сломалось! ... Или это ввод неправильный." })
    }
};
