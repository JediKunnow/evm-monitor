"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListenerMonitor = void 0;
class ListenerMonitor {
    static set(k, v) {
        ListenerMonitor.processes.set(k, v);
    }
    static running(k) {
        var _a;
        return (_a = ListenerMonitor.processes.get(k)) !== null && _a !== void 0 ? _a : false;
    }
    static run(k) {
        ListenerMonitor.processes.set(k, true);
    }
    static error(k) {
        ListenerMonitor.processes.set(k, false);
    }
    static listeners() {
        return [...ListenerMonitor.processes.keys()];
    }
}
exports.ListenerMonitor = ListenerMonitor;
ListenerMonitor.processes = new Map();
//# sourceMappingURL=ListenerMonitor.js.map