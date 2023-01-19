"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Clock = void 0;
const utils_1 = require("../utils");
class Clock {
    constructor() {
        this.timers = new Map();
    }
    addTimer(name, fn, thick, lazyStart = false) {
        let now = new Date();
        if (!lazyStart) {
            let timerId = setInterval(fn, thick);
            this.timers.set(name, {
                id: timerId,
                status: true,
                thick: thick,
                started: now,
                lastRun: now,
                fn: fn
            });
        }
        else {
            this.timers.set(name, {
                status: true,
                thick: thick,
                fn: fn
            });
        }
    }
    start(name) {
        var _a, _b, _c;
        let t = this.timers.get(name);
        if (t === undefined)
            return;
        t.id = setInterval(t.fn, t.thick);
        t.started = new Date();
        t.status = true;
        let thick;
        thick = (_a = this.timers.get(name)) === null || _a === void 0 ? void 0 : _a.thick;
        if (thick)
            thick = thick / 1000;
        console.log(`${utils_1.Colors.BRIGHT_BLUE}[CLOCK] ${name} | ${(_c = (_b = this.timers.get(name)) === null || _b === void 0 ? void 0 : _b.started) === null || _c === void 0 ? void 0 : _c.toLocaleString()} | ${thick}s ${utils_1.Colors.RESET}`);
    }
    get(name) {
        return this.timers.get(name);
    }
    count() {
        return this.timers.size;
    }
    clear(name) {
        let i = this.get(name);
        if (!i)
            return;
        i.id.close();
        i.status = false;
    }
    data() {
        return this.timers;
    }
    init() {
        if (this.count() == 0)
            return;
        this.data().forEach((v, k) => {
            this.start(k);
        });
    }
}
exports.Clock = Clock;
//# sourceMappingURL=Clock.js.map