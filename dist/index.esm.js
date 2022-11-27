var PREFIX = 'mark';
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
         * rangeStr 前缀 默认mark
         */
        this.prefix = PREFIX;
        /**
         * 响应延迟
         */
        this._selectionchangeTimeOut = 0;
        /**
         * 需要标记的数组
         */
        this.efiRange = [];
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
            if (!this.rootElement) {
                return;
            }
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
                var arr = _this.efiRange.filter(function (item) {
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
        }
        this._initStatus = true;
    };
    /**
 * 更新
 */
    Mark.prototype.update = function () {
        var _this = this;
        this.efiRange.forEach(function (item) {
            var svgDom = _this.svgDom;
            var Fragment = svgDom.querySelector("[data-id='".concat(item.rangeStr, "']"));
            if (!Fragment) {
                return;
            }
            Fragment.innerHTML = '';
            var range = _this._handleEfiToRange(item.rangeStr);
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
    Mark.prototype.add = function (rangeStr, type, className, cb) {
        if (className === void 0) { className = ''; }
        var range = this._handleEfiToRange(rangeStr);
        if (range.collapsed) {
            return;
        }
        var rects = range.getClientRects();
        var Fragment = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        if (className) {
            Fragment.classList.add(className);
        }
        Fragment.setAttribute('data-id', rangeStr);
        Fragment.setAttribute('opacity', "0.6");
        var _position = [];
        for (var i = 0; i < rects.length; i++) {
            var rect = rects[i];
            var _a = this._handleCreateSvgG(rect, type), group = _a.group, position = _a.position;
            Fragment.appendChild(group);
            _position.push(position);
        }
        this.efiRange.push({
            rangeStr: rangeStr,
            range: range,
            type: type,
            position: _position,
            node: Fragment
        });
        if (cb) {
            Fragment.addEventListener('click', cb);
        }
        var svgDom = this.svgDom;
        svgDom.appendChild(Fragment);
    };
    /**
     * 删除标记
     * @param rangeStr
     * @param type
     */
    Mark.prototype.remove = function (rangeStr, type) {
        var _a;
        var arr = this.efiRange.map(function (item, index) {
            return { item: item, index: index };
        }).filter(function (data) {
            return data.item.rangeStr == rangeStr && data.item.type == type;
        });
        var _index = 0;
        var svgDom = this.svgDom;
        for (var i = 0; i < arr.length; i++) {
            var index = arr[i].index - _index;
            var item = arr[i].item;
            (_a = svgDom.querySelector("[data-id='".concat(item.rangeStr, "']"))) === null || _a === void 0 ? void 0 : _a.remove();
            this.efiRange.splice(index, 1);
            _index++;
        }
    };
    // public mark(rangeStr: string, className: string, cb: Function) {
    //     this.add(rangeStr, "mark", className, cb);
    // }
    /**
     * 添加高亮
     * @param rangeStr
     * @param className
     * @param cb
     */
    Mark.prototype.highlight = function (rangeStr, className, cb) {
        this.add(rangeStr, "highlight", className, cb);
    };
    /**
     * 添加下划线
     * @param rangeStr
     * @param className
     * @param cb
     */
    Mark.prototype.underline = function (rangeStr, className, cb) {
        this.add(rangeStr, "underline", className, cb);
    };
    /**
     * 全部显示
     */
    Mark.prototype.show = function () {
        var _a;
        (_a = this.svgDom) === null || _a === void 0 ? void 0 : _a.setAttribute('opacity', "1");
    };
    /**
     * 全部隐藏
     */
    Mark.prototype.hide = function () {
        var _a;
        (_a = this.svgDom) === null || _a === void 0 ? void 0 : _a.setAttribute('opacity', "0");
    };
    /**
    * 监听
    * @param key string
    * @param func function
    */
    Mark.prototype.on = function (key, func) {
        this.onArr.push({ key: key, func: func });
    };
    Mark.prototype.getRanges = function () {
        return this.efiRange;
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
        var rangeStr = this._handleSelectRangePostion(range);
        this._handleOn('selected', { rangeStr: rangeStr });
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
     * @param rangeStr 标识范围的字符
     * @returns
     */
    Mark.prototype._handleEfiToRange = function (rangeStr) {
        var range = document.createRange();
        var obj = this._handleCheckEfi(rangeStr);
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
    Mark.prototype._handleCheckEfi = function (rangeStr) {
        var reg = new RegExp("".concat(this.prefix, "(.*,.*)"));
        var _arr = rangeStr.match(reg);
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
     * @param rangeStr
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

export { Mark as default };
