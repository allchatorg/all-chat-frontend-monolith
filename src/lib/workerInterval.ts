const TICKER_SOURCE = "let t;onmessage=e=>{clearInterval(t);if(e.data>0)t=setInterval(()=>postMessage(0),e.data)}";

/**
 * setInterval whose clock runs in a worker: browsers slow a hidden tab's own timers down to as
 * little as one a minute, but leave a worker's alone. Returns the function that stops it.
 */
export function startWorkerInterval(callback: () => void, intervalMs: number): () => void {
    try {
        const url = URL.createObjectURL(new Blob([TICKER_SOURCE], {type: "text/javascript"}));
        const worker = new Worker(url);
        URL.revokeObjectURL(url);
        worker.onmessage = callback;
        worker.postMessage(intervalMs);
        return () => worker.terminate();
    } catch {
        // No worker support (or blocked): a throttled timer still beats none.
        const timer = setInterval(callback, intervalMs);
        return () => clearInterval(timer);
    }
}
