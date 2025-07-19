"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnimationPattern = exports.KiroState = void 0;
// Core enums
var KiroState;
(function (KiroState) {
    KiroState["IDLE"] = "idle";
    KiroState["EXECUTING"] = "executing";
    KiroState["ERROR"] = "error";
})(KiroState || (exports.KiroState = KiroState = {}));
var AnimationPattern;
(function (AnimationPattern) {
    AnimationPattern["IDLE"] = "idle";
    AnimationPattern["ACTIVE"] = "active";
    AnimationPattern["ERROR"] = "error";
})(AnimationPattern || (exports.AnimationPattern = AnimationPattern = {}));
//# sourceMappingURL=index.js.map