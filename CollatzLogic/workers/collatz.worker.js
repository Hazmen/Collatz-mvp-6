self.onmessage = (e) => {
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

    for (let i = 0; i <= list.length; i+=CHUNK_SIZE) {
        self.postMessage({
            type: "chunk",
            data: list.slice(i, i + CHUNK_SIZE),
            offset: i
        });
    }
    

    self.postMessage({ type: "done", steps: list.length + 1, max});
};
