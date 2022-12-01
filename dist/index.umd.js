(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Mark = factory());
})(this, (function () { 'use strict';

    var PREFIX = 'mark';
    var OnType;
    (function (OnType) {
        OnType[OnType["render"] = 0] = "render";
        OnType[OnType["selected"] = 1] = "selected";
    })(OnType || (OnType = {}));
    var Mark = /** @class */ (function () {
        function Mark(target) {
            /**
             * 是否初始化
             */
            this._initStatus = false;
            /**
             * 监听的数组
             */
            this.onArr = [];
            /**
             * markStr 前缀 默认mark
             */
            this.prefix = PREFIX;
            /**
             * 响应延迟
             */
            this._selectionchangeTimeOut = 0;
            /**
             * 需要标记的数组
             */
            this.markRange = [];
            var node = null;
            if (typeof target == 'string') {
                node = document.getElementById(target);
            }
            else if (target.nodeType == Node.ELEMENT_NODE) {
                node = target;
            }
            if (!node) {
                throw new Error("target错误 或 未找到对应元素");
            }
            this.targetElement = node;
            this.onArr = [];
        }
        /**
         * 渲染执行
         */
        Mark.prototype.render = function () {
            var _this = this;
            if (!this._initStatus) {
                // 父节点
                var parentNode = this.targetElement.parentNode;
                var rootDom = document.createElement("div");
                rootDom.className = 'mark-view';
                rootDom.style.position = 'relative';
                rootDom.style.width = 'fit-content';
                rootDom.style.height = 'fit-content';
                var content = this.targetElement.cloneNode(true);
                this.targetNode = content;
                rootDom.appendChild(content);
                // svg节点
                var svgDom = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                this.svgDom = svgDom;
                svgDom.id = "mark-svg";
                svgDom.style.position = 'absolute';
                svgDom.style.left = '0px';
                svgDom.style.top = '0px';
                svgDom.style.width = '100%';
                svgDom.style.height = '100%';
                svgDom.setAttribute('width', "100%");
                svgDom.setAttribute('height', "100%");
                svgDom.setAttribute('pointer-events', "none");
                rootDom.appendChild(svgDom);
                parentNode === null || parentNode === void 0 ? void 0 : parentNode.replaceChild(rootDom, this.targetElement);
                this.rootElement = rootDom;
                this.targetNodeRect = this.rootElement.getBoundingClientRect();
                this.targetNode.addEventListener('click', function (event) {
                    if (!_this.rootElement) {
                        return;
                    }
                    var targetNodeRect = _this.rootElement.getBoundingClientRect();
                    var _event = event;
                    var offsetX = _event.pageX - targetNodeRect.x;
                    var offsetY = _event.pageY - targetNodeRect.y;
                    // 判断一点是否在区间内
                    var arr = _this.markRange.filter(function (item) {
                        return item.position.filter(function (item2) {
                            return (offsetX > item2.x1 && offsetX < item2.x2)
                                && (offsetY > item2.y1 && offsetY < item2.y2);
                        }).length > 0;
                    });
                    if (arr.length > 0) {
                        arr.forEach(function (item) {
                            var event = new Event('click');
                            item.node.dispatchEvent(event);
                        });
                    }
                });
                this._handletListener();
                this._update();
                this._handleOn('render', this.rootElement);
            }
            this._initStatus = true;
        };
        /**
         * 更新
         */
        Mark.prototype.update = function () {
            var _this = this;
            this.markRange.forEach(function (item) {
                var svgDom = _this.svgDom;
                var Fragment = svgDom.querySelector("[data-id='".concat(item.markStr, "']"));
                if (!Fragment) {
                    return;
                }
                Fragment.innerHTML = '';
                var range = _this._handleEfiToRange(item.markStr);
                if (range.collapsed) {
                    return;
                }
                var rects = item.range.getClientRects();
                var _position = [];
                for (var i = 0; i < rects.length; i++) {
                    var rect = rects[i];
                    var _a = _this._handleCreateSvgG(rect, item.type), group = _a.group, position = _a.position;
                    Fragment.appendChild(group);
                    _position.push(position);
                }
                item.position = _position;
            });
        };
        /**
         * 添加单个标记
         * @param data markData 数据
         * @returns
         */
        Mark.prototype.add = function (data) {
            var _a, _b;
            var type = data.type;
            var click = (_a = data.click) !== null && _a !== void 0 ? _a : null;
            var range = this._handleEfiToRange(data.markStr);
            if (range.collapsed) {
                return;
            }
            var rects = range.getClientRects();
            var Fragment = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            if (data.className) {
                Fragment.classList.add(data.className);
            }
            Fragment.setAttribute('data-id', data.markStr);
            Fragment.setAttribute('data-type', data.type);
            Fragment.setAttribute('opacity', "0.6");
            var _position = [];
            for (var i = 0; i < rects.length; i++) {
                var rect = rects[i];
                var _c = this._handleCreateSvgG(rect, type), group = _c.group, position = _c.position;
                Fragment.appendChild(group);
                _position.push(position);
            }
            this.markRange.push({
                markStr: data.markStr,
                range: range,
                type: type,
                position: _position,
                node: Fragment,
                data: (_b = data.data) !== null && _b !== void 0 ? _b : {}
            });
            if (click && typeof click == 'function') {
                Fragment.addEventListener('click', function (event) {
                    var markStr = this.getAttribute('data-id');
                    click.apply(this, [event, markStr]);
                });
            }
            var svgDom = this.svgDom;
            svgDom.appendChild(Fragment);
        };
        /**
         * 删除单个标记
         * @param markStr
         * @param type markType
         */
        Mark.prototype.remove = function (markStr, type) {
            var _a;
            var arr = this.markRange.map(function (item, index) {
                return { item: item, index: index };
            }).filter(function (data) {
                return data.item.markStr == markStr && (type ? data.item.type == type : true);
            });
            var _index = 0;
            var svgDom = this.svgDom;
            for (var i = 0; i < arr.length; i++) {
                var index = arr[i].index - _index;
                var item = arr[i].item;
                (_a = svgDom.querySelector("[data-id='".concat(item.markStr, "']"))) === null || _a === void 0 ? void 0 : _a.remove();
                this.markRange.splice(index, 1);
                _index++;
            }
        };
        /**
         * 添加高亮
         * @param markStr
         * @param className
         * @param click
         * @param data
         */
        Mark.prototype.highlight = function (markStr, className, click, data) {
            if (data === void 0) { data = {}; }
            this.add({
                type: "highlight",
                markStr: markStr,
                className: className,
                click: click,
                data: data
            });
        };
        /**
         * 添加下划线
         * @param markStr
         * @param className
         * @param click
         * @param data
         */
        Mark.prototype.underline = function (markStr, className, click, data) {
            if (data === void 0) { data = {}; }
            this.add({
                type: "underline",
                markStr: markStr,
                className: className,
                click: click,
                data: data
            });
        };
        /**
         * 全部显示
         */
        Mark.prototype.show = function (type) {
            var _a, _b;
            if (type) {
                (_a = this.svgDom) === null || _a === void 0 ? void 0 : _a.querySelectorAll("g[data-type=\"".concat(type, "\"]")).forEach(function (item) {
                    item.setAttribute('display', "auto");
                });
            }
            else {
                (_b = this.svgDom) === null || _b === void 0 ? void 0 : _b.querySelectorAll("g").forEach(function (item) {
                    item.setAttribute('display', "auto");
                });
            }
        };
        /**
         * 全部隐藏
         */
        Mark.prototype.hide = function (type) {
            var _a, _b;
            if (type) {
                (_a = this.svgDom) === null || _a === void 0 ? void 0 : _a.querySelectorAll("g[data-type=\"".concat(type, "\"]")).forEach(function (item) {
                    item.setAttribute('display', "none");
                });
            }
            else {
                (_b = this.svgDom) === null || _b === void 0 ? void 0 : _b.querySelectorAll("g").forEach(function (item) {
                    item.setAttribute('display', "none");
                });
            }
        };
        /**
         * 清空所有标记 不传type 清空所有
         * @param markStr
         * @param type markType
         */
        Mark.prototype.clear = function (type) {
            var _a;
            var arr = this.markRange.map(function (item, index) {
                return { item: item, index: index };
            }).filter(function (data) {
                return type ? data.item.type == type : true;
            });
            var _index = 0;
            var svgDom = this.svgDom;
            for (var i = 0; i < arr.length; i++) {
                var index = arr[i].index - _index;
                var item = arr[i].item;
                (_a = svgDom.querySelector("[data-id='".concat(item.markStr, "']"))) === null || _a === void 0 ? void 0 : _a.remove();
                this.markRange.splice(index, 1);
                _index++;
            }
        };
        /**
        * 监听
        * @param key string
        * @param func function
        */
        Mark.prototype.on = function (key, func) {
            this.onArr.push({ key: key, func: func });
        };
        /**
         * 获取所有的标记
         * @returns
         */
        Mark.prototype.getMarks = function () {
            return this.markRange.map(function (item) {
                return {
                    markStr: item.markStr,
                    type: item.type,
                    data: item.data
                };
            });
        };
        /**
         * 视图更新
         */
        Mark.prototype._update = function () {
            var _this = this;
            window.addEventListener('resize', function () {
                requestAnimationFrame(function () {
                    if (!_this.rootElement) {
                        return;
                    }
                    _this.targetNodeRect = _this.rootElement.getBoundingClientRect();
                    _this.update();
                });
            });
        };
        Mark.prototype._handletListener = function () {
            var _this = this;
            document.addEventListener("selectionchange", function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                clearTimeout(_this._selectionchangeTimeOut);
                _this._selectionchangeTimeOut = setTimeout(function () {
                    _this._handleSelected.apply(_this, args);
                }, 250);
            });
        };
        /**
         * 监听鼠标选中后的时间
         */
        Mark.prototype._handleSelected = function () {
            var _a, _b, _c, _d;
            var Selection = window.getSelection();
            if (!Selection) {
                return;
            }
            var isCollapsed = Selection.isCollapsed;
            if (isCollapsed) {
                return;
            }
            var range = Selection.getRangeAt(0);
            // 通过查找开始元素 和结束元素在 dom 内容范围
            var markStr = this._handleSelectRangePostion(range);
            var Rects = range.getClientRects();
            var topRects = Rects[0];
            var bottomRects = Rects[Rects.length - 1];
            var _top = (_b = (_a = this.targetNodeRect) === null || _a === void 0 ? void 0 : _a.top) !== null && _b !== void 0 ? _b : 0;
            var _left = (_d = (_c = this.targetNodeRect) === null || _c === void 0 ? void 0 : _c.left) !== null && _d !== void 0 ? _d : 0;
            // 计算位置
            var position = {
                top_left: [topRects.left - _left, topRects.top - _top],
                top_center: [topRects.left + (topRects.width / 2) - _left, topRects.top - _top],
                top_right: [topRects.right - _left, topRects.top - _top],
                center_left: [bottomRects.left - _left, topRects.top + ((bottomRects.bottom - topRects.top) / 2) - _top],
                center: [bottomRects.left + (topRects.right - bottomRects.left) / 2 - _left, topRects.top + ((bottomRects.bottom - topRects.top) / 2) - _top],
                center_right: [topRects.right - _left, topRects.top + ((bottomRects.bottom - topRects.top) / 2) - _top],
                bottom_left: [bottomRects.left - _left, bottomRects.bottom - _top],
                bottom_center: [bottomRects.left + (bottomRects.width / 2) - _left, bottomRects.top + bottomRects.height - _top],
                bottom_right: [bottomRects.right - _left, bottomRects.bottom - _top],
            };
            this._handleOn('selected', { markStr: markStr, range: range, position: position });
        };
        /**
         * 范围换取efi
         * @param range 范围
         * @returns
         */
        Mark.prototype._handleSelectRangePostion = function (range) {
            var efi_start = this._handleSelectNodePostion(range.startContainer);
            var efi_start_offset = range.startOffset;
            var efi_end = this._handleSelectNodePostion(range.endContainer);
            var efi_end_offset = range.endOffset;
            return "".concat(this.prefix, "(").concat(efi_start, ":").concat(efi_start_offset, ",").concat(efi_end, ":").concat(efi_end_offset, ")");
        };
        Mark.prototype._handleSelectNodePostion = function (node) {
            var nums = [];
            var _node = node;
            while (_node != this.targetNode) {
                var index = 0;
                while (_node.previousSibling) {
                    index++;
                    _node = _node.previousSibling;
                }
                nums.push(index);
                if (_node.parentNode == null) {
                    break;
                }
                _node = _node.parentNode;
            }
            return nums.reverse().join('/');
        };
        /**
         * 通过efi字符转成range
         * @param markStr 标识范围的字符
         * @returns
         */
        Mark.prototype._handleEfiToRange = function (markStr) {
            var range = document.createRange();
            var obj = this._handleCheckEfi(markStr);
            if (!obj) {
                return range;
            }
            var _node = this.targetNode;
            var _node_ = null;
            for (var i = 0; i < obj.start_arr.length; i++) {
                var index = obj.start_arr[i];
                _node_ = _node.childNodes[index];
                _node = _node_;
            }
            obj.start_node = _node_;
            _node = this.targetNode;
            for (var i = 0; i < obj.end_arr.length; i++) {
                var index = obj.end_arr[i];
                _node_ = _node.childNodes[index];
                _node = _node_;
            }
            obj.end_node = _node_;
            range.setStart(obj.start_node, obj.start_offset);
            range.setEnd(obj.end_node, obj.end_offset);
            return range;
        };
        /**
         * 执行监听响应事件
         * @param key string
         * @param data data
         */
        Mark.prototype._handleOn = function (key, data) {
            if (data === void 0) { data = {}; }
            var _onArr = this.onArr.filter(function (item) { return item.key == key; });
            _onArr.forEach(function (item) {
                item === null || item === void 0 ? void 0 : item.func(data);
            });
        };
        Mark.prototype._handleCheckEfi = function (markStr) {
            var reg = new RegExp("".concat(this.prefix, "(.*,.*)"));
            var _arr = markStr.match(reg);
            if (!_arr || _arr.length < 2) {
                return null;
            }
            var str = _arr[1];
            str = str.replace('(', '').replace(')', '');
            var arr = str.split(',');
            var obj = {
                start_arr: arr[0].split(':')[0].split('/').map(function (i) { return Number(i); }),
                start_offset: Number(arr[0].split(':')[1]),
                end_arr: arr[1].split(':')[0].split('/').map(function (i) { return Number(i); }),
                end_offset: Number(arr[1].split(':')[1]),
                start_node: null,
                end_node: null
            };
            return obj;
        };
        /**
         * 创建矩形
         * @param rect
         * @param bool 是否透明
         * @returns
         */
        Mark.prototype._handleCreateRect = function (rect, bool) {
            if (bool === void 0) { bool = false; }
            var Dom = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            var targetNodeRect = this.targetNodeRect;
            var x = rect.x - targetNodeRect.x;
            var y = rect.y - targetNodeRect.y;
            Dom.setAttribute('x', x.toString());
            Dom.setAttribute('y', y.toString());
            Dom.setAttribute('width', rect.width.toString());
            Dom.setAttribute('height', rect.height.toString());
            Dom.setAttribute('fill', '#03a9f4');
            Dom.setAttribute('mix-blend-mode', 'multiply');
            if (bool) {
                Dom.setAttribute('opacity', '0');
            }
            return Dom;
        };
        /**
         * 划线
         * @param rect
         * @returns
         */
        Mark.prototype._handleCreateLine = function (rect) {
            var Dom = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            var targetNodeRect = this.targetNodeRect;
            var x1 = rect.x - targetNodeRect.x;
            var y1 = rect.y - targetNodeRect.y + rect.height;
            var x2 = x1 + rect.width;
            var y2 = y1;
            Dom.setAttribute('x1', x1.toString());
            Dom.setAttribute('y1', y1.toString());
            Dom.setAttribute('x2', x2.toString());
            Dom.setAttribute('y2', y2.toString());
            Dom.setAttribute('stroke-width', "2");
            Dom.setAttribute('stroke', '#03a9f4');
            Dom.setAttribute('mix-blend-mode', 'multiply');
            return Dom;
        };
        /**
         * 创建svg g
         * @param rect
         * @param type
         * @param markStr
         * @returns
         */
        Mark.prototype._handleCreateSvgG = function (rect, type) {
            var targetNodeRect = this.targetNodeRect;
            var group = document.createDocumentFragment();
            if (type == 'highlight') {
                var rectDom = this._handleCreateRect(rect);
                group.appendChild(rectDom);
            }
            if (type == 'underline') {
                var rectDom = this._handleCreateRect(rect, true);
                var LineDom = this._handleCreateLine(rect);
                group.appendChild(rectDom);
                group.appendChild(LineDom);
            }
            var x1 = rect.x - targetNodeRect.x;
            var y1 = rect.y - targetNodeRect.y;
            var x2 = x1 + rect.width;
            var y2 = y1 + rect.height;
            var position = {
                x1: x1,
                y1: y1,
                x2: x2,
                y2: y2,
            };
            return { group: group, position: position };
        };
        return Mark;
    }());

    return Mark;

}));
