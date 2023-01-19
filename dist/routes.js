"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const base_1 = require("./class/base");
const models_1 = require("./class/models");
const utils_1 = require("./class/utils");
const fs = require("fs");
const readline = require('readline');
const config = require('./config/config.js').config;
let net = config.networks.find(el => el.name == config.network);
if (net === undefined) {
    console.log("Wrong Network.");
    process.exit();
}
const safe = new base_1.SafeWeb3({ network: new models_1.Network(net) });
const factory_abi = require('./abis/factory.json');
const pair_abi = require('./abis/pair.json').abi;
const factory_address = "0xc35DADB65012eC5796536bD9864eD8773aBc74C4";
class Queue {
    constructor() {
        this.data = [];
        this.enqueue = (v) => {
            this.data.push(v);
        };
        this.dequeue = () => {
            return this.data.shift();
        };
        this.isEmpty = () => {
            return this.data.length === 0;
        };
    }
}
;
class Node {
    constructor(address) {
        this.address = address;
    }
}
class Graph {
    constructor() {
        this.nodesCount = 0;
        this.edgesCount = 0;
        this.adj = new Map();
        this.nodesMap = new Map();
        this.pairs = [];
    }
    addNode(v) {
        if (!this.adj.has(v)) {
            this.adj.set(v, []);
            this.nodesCount++;
        }
        return v;
    }
    addEdge(v, w, weight) {
        var _a, _b;
        (_a = this.adj.get(v)) === null || _a === void 0 ? void 0 : _a.push([w, weight]);
        (_b = this.adj.get(w)) === null || _b === void 0 ? void 0 : _b.push([v, weight]);
        this.edgesCount++;
    }
    print() {
        var get_keys = this.adj.keys();
        for (let n of get_keys) {
            var get_values = this.neighbors(n);
            var conc = "";
            if (get_values) {
                for (let e of get_values)
                    conc += `${e[0].address}(${e[1]}) `;
            }
            console.log(n.address + " -> " + conc);
        }
    }
    bfs(start) {
        var visited = new Map();
        var q = new Queue();
        visited.set(start, true);
        q.enqueue(start);
        while (!q.isEmpty()) {
            var getQueueElement = q.dequeue();
            if (!getQueueElement)
                continue;
            console.log(getQueueElement.address);
            var get_List = this.neighbors(getQueueElement);
            if (get_List) {
                for (let neigh of get_List) {
                    if (!visited.get(neigh[0])) {
                        visited.set(neigh[0], true);
                        q.enqueue(neigh[0]);
                    }
                }
            }
        }
    }
    dfs(start) {
        const DFSUtil = (vert, visited) => {
            visited.set(vert, true);
            console.log(vert.address);
            var neighbours = this.neighbors(vert);
            if (neighbours) {
                for (var n of neighbours) {
                    if (!visited.get(n[0]))
                        DFSUtil(n[0], visited);
                }
            }
        };
        var visited = new Map();
        DFSUtil(start, visited);
    }
    neighbors(node) {
        let neighbors = this.adj.get(node);
        if (neighbors)
            return neighbors;
        else
            return [];
    }
    nodeOf(address) {
        return this.nodesMap.get(address);
    }
    sub(src, dest) {
        let g = Graph.load(this.adj, this.nodesCount, this.edgesCount);
        g.adj.forEach((v, k, map) => {
        });
        return g;
    }
    dijkstra(source, dest) {
        console.time('Dijkstra');
        const vertexWithMinDistance = (distances, visited) => {
            var _a;
            let minDistance = Infinity, minVertex = null;
            for (let vertex in distances) {
                let distance = distances[vertex];
                if (distance < minDistance && !visited.has(vertex)) {
                    minDistance = distance;
                    minVertex = vertex;
                }
            }
            if (minVertex)
                return (_a = this.nodeOf(minVertex)) !== null && _a !== void 0 ? _a : null;
            else
                return null;
        };
        let distances = {}, parents = {}, visited = new Set();
        for (let v of this.nodesMap.values()) {
            if (v === source)
                distances[source.address] = 0;
            else
                distances[v.address] = Infinity;
            parents[v.address] = null;
        }
        let currVertex = vertexWithMinDistance(distances, visited);
        while (currVertex !== null) {
            let distance = distances[currVertex.address], neighbors = this.neighbors(currVertex);
            for (let neighbor of neighbors) {
                let newDistance = distance + neighbor[1];
                if (distances[neighbor[0].address] > newDistance) {
                    distances[neighbor[0].address] = newDistance;
                    parents[neighbor[0].address] = currVertex;
                }
            }
            visited.add(currVertex.address);
            currVertex = vertexWithMinDistance(distances, visited);
        }
        let shortestPath = [dest];
        let parent = parents[dest.address];
        while (parent) {
            shortestPath.push(parent);
            parent = parents[parent.address];
        }
        shortestPath.reverse();
        console.timeEnd('Dijkstra');
        return shortestPath;
    }
    getAllPaths(s, d, path = [], maxPathLength = 0) {
        console.log("allPaths()");
        console.time("allPaths");
        const hasEdgeBeenFollowedInPath = ({ from, to }, path) => {
            for (let a of this.neighbors(from)) {
                for (let i = 0; i < path.length; i++) {
                    if (path[i + 1] === to)
                        return true;
                }
            }
            return false;
        };
        const explore = (currNode, to, paths = []) => {
            path.push(currNode);
            if (maxPathLength > 0 && path.length < maxPathLength) {
                for (let linkedNode of this.neighbors(currNode)) {
                    if (linkedNode[0] === to) {
                        let result = path.slice();
                        result.push(to);
                        paths.push(result);
                        continue;
                    }
                    if (!hasEdgeBeenFollowedInPath({ from: currNode, to: linkedNode[0] }, path)) {
                        explore(linkedNode[0], to, paths);
                    }
                }
            }
            path.pop();
            return paths;
        };
        return explore(s, d);
    }
    findPair(a, b) {
        return __awaiter(this, void 0, void 0, function* () {
            if (safe.w3) {
                let factory = new safe.w3.eth.Contract(factory_abi, factory_address);
                return yield factory.methods.getPair(a, b).call();
            }
        });
    }
    weight() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("Weighting...");
            console.time('Weighting');
            if (!safe.w3)
                throw new Error("SAFEWEB3 DOWN");
            for (let from of this.nodesMap.values()) {
                let all_to = this.neighbors(from);
                for (let i = 0; i < all_to.length; i++) {
                    if (all_to[i][1] > 0)
                        continue;
                    let K = yield (0, utils_1.getPrice)({ w3: safe.w3, router_address: safe.network.routers["quick"], path: [from.address, all_to[i][0].address] });
                    all_to[i][1] = 1 - Number(K);
                    let to_as_node = this.nodeOf(all_to[i][0].address);
                    if (to_as_node) {
                        let coll = this.adj.get(to_as_node);
                        if (coll) {
                            coll.map((el, idx) => {
                                if (el[0] === all_to[i][0])
                                    el[1] = all_to[i][1];
                            });
                        }
                    }
                }
            }
            console.timeEnd('Weighting');
            return this;
        });
    }
    getPathWithMaxReserves(paths) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const getPathWithMaxReservesUtil = (path) => __awaiter(this, void 0, void 0, function* () {
                if (safe.w3) {
                    let numbers = [];
                    for (let i = 1; i < path.length; i++) {
                        let pair_addr = (0, utils_1.getPairAddresOffChain)(safe.w3, factory_address, path[i - 1].address, path[i].address);
                        if (pair_addr !== undefined) {
                            let p = { a: path[i - 1].address, b: path[i].address, p: pair_addr };
                            let cProduct = yield (0, utils_1.getCostantProduct)({ w3: safe.w3, pair: p });
                            numbers.push(cProduct);
                        }
                    }
                    return numbers;
                }
                return [];
            });
            let data = [];
            for (let p of paths) {
                let n = yield getPathWithMaxReservesUtil(p);
                data.push({ path: p, candidates: n });
            }
            return (_a = data.sort((a, b) => {
                let len = a.candidates.length >= b.candidates.length ? a.candidates.length : b.candidates.length;
                for (let i = 0; i < len; i++) {
                    if (a.candidates[i] != b.candidates[i])
                        return a.candidates[i] - b.candidates[i];
                }
                return a.candidates[0] - b.candidates[0];
            })[0].path) !== null && _a !== void 0 ? _a : [];
        });
    }
    static build(safe, pairs) {
        console.time('buildGraph');
        if (!safe.w3)
            throw new Error('SAFEWEB3 DOWN');
        let g = new Graph;
        g.pairs = pairs;
        for (let p of pairs) {
            try {
                let a = new Node(p.a);
                let b = new Node(p.b);
                if (!g.nodesMap.has(p.a)) {
                    g.nodesMap.set(p.a, a);
                    g.addNode(a);
                }
                if (!g.nodesMap.has(p.b)) {
                    g.nodesMap.set(p.b, b);
                    g.addNode(b);
                }
            }
            catch (err) {
                console.log("PAIR ERR %s", err);
            }
        }
        for (let i = 0; i < pairs.length; i++) {
            try {
                let a = g.nodesMap.get(pairs[i].a);
                let b = g.nodesMap.get(pairs[i].b);
                if (a && b)
                    g.addEdge(a, b, 0);
                process.stdout.write(`Preparing: ${Number(i / (pairs.length - 1) * 100).toFixed(4)}\% (${i}/${pairs.length - 1})\r`);
            }
            catch (err) {
                console.log("PAIR ERR %s", err);
            }
        }
        console.log("");
        console.timeEnd('buildGraph');
        return g;
    }
    static load(data, nodes, edges) {
        let g = new Graph();
        g.adj = data;
        g.nodesCount = nodes;
        g.edgesCount = edges;
        return g;
    }
}
class PairSource {
    static fetchPairs(w3) {
        return __awaiter(this, void 0, void 0, function* () {
            var file = fs.createWriteStream(PairSource.storage_file);
            file.on('error', (err) => { console.log(err); });
            console.time('fetchPairs');
            let factory = new w3.eth.Contract(factory_abi, factory_address);
            let pairs_count = Number(yield factory.methods.allPairsLength().call());
            for (let i = 0; i < pairs_count; i++) {
                try {
                    process.stdout.write(`Fetching Pairs: ${Number(i / pairs_count * 100).toFixed(2)}\% (${i}/${pairs_count - 1})\r`);
                    let p = yield factory.methods.allPairs(i).call();
                    let p_contract = new w3.eth.Contract(pair_abi, p);
                    let t0 = yield p_contract.methods.token0().call();
                    let t1 = yield p_contract.methods.token1().call();
                    file.write(`${t0},${t1}\n`);
                }
                catch (err) {
                    console.log("PAIR ERR %s", err);
                }
            }
            file.end();
            console.timeEnd('fetchPairs');
        });
    }
    static loadPairs(limit = 0) {
        var e_1, _a;
        return __awaiter(this, void 0, void 0, function* () {
            if (!safe.w3)
                return [];
            if (!fs.existsSync(PairSource.storage_file))
                yield this.fetchPairs(safe.w3);
            let pairs = [];
            const fileStream = fs.createReadStream(PairSource.storage_file);
            const rl = readline.createInterface({
                input: fileStream,
                crlfDelay: Infinity
            });
            let c = 0;
            try {
                for (var rl_1 = __asyncValues(rl), rl_1_1; rl_1_1 = yield rl_1.next(), !rl_1_1.done;) {
                    const line = rl_1_1.value;
                    if (limit > 0 && c >= limit)
                        break;
                    let [t0, t1] = String(line).split(',');
                    pairs.push({ a: t0.trim(), b: t1.trim() });
                    c++;
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (rl_1_1 && !rl_1_1.done && (_a = rl_1.return)) yield _a.call(rl_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
            console.log("%s pairs loaded.", pairs.length);
            return pairs;
        });
    }
}
PairSource.storage_file = 'pairs.txt';
if (safe.load()) {
    PairSource.loadPairs()
        .then((pairs) => {
        let g = Graph.build(safe, pairs);
        let from = g.nodeOf("0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270");
        let to = g.nodeOf("0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063");
        if (from && to) {
            let d = g.dijkstra(from, to);
            console.log(d);
            let paths = g.getAllPaths(from, to, [], 4);
            console.timeEnd("allPaths");
            console.log(paths);
            console.log(`Routes: ${paths.length} routes found [${from.address} -> ${to.address}]`);
            let optimal = g.getPathWithMaxReserves(paths);
            console.log("Optimal Route: %s", optimal);
            process.exit();
        }
    });
}
//# sourceMappingURL=routes.js.map