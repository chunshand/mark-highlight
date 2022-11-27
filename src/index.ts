const PREFIX = 'mark';
interface eftObj {
    start_arr: number[],
    start_offset: number,
    end_arr: number[],
    end_offset: number,
    start_node: Node | null,
    end_node: Node | null
}
type markType = "mark" | "highlight" | "underline";
interface position {
    x1: number, y1: number, x2: number, y2: number
}
interface efiRange {
    range: Range,
    rangeStr: string,
    type: markType,
    position: position[],
    node: SVGGElement
};
export default class Mark {
    /**
     * 渲染Element
     */
    private targetElement: HTMLElement;
    /**
     * 是否初始化
     */
    private _initStatus: boolean = false;
    /**
     * 渲染节点
     */
    private targetNode: Node | undefined;
    /**
     * 监听的数组
     */
    private onArr: { key: string, func: Function }[] = [];
    /**
     * rangeStr 前缀 默认mark
     */
    private prefix = PREFIX;
    /**
     * 响应延迟
     */
    private _selectionchangeTimeOut: any = 0;
    /**
     * 需要标记的数组
     */
    private efiRange: efiRange[] = [];
    /**
     * svg dom
     */
    private svgDom: SVGSVGElement | undefined;
    /**
     * target Node Rect
     */
    private targetNodeRect: DOMRect | undefined;
    private rootElement: HTMLElement | undefined;
    constructor(target: string | HTMLElement) {
        let node: HTMLElement | null = null;
        if (typeof target == 'string') {
            node = document.getElementById(target as string) as HTMLElement;
        } else if (target.nodeType == Node.ELEMENT_NODE) {
            node = target as HTMLElement;
        }
        if (!node) {
            throw new Error("target错误 或 未找到对应元素");
        }
        this.targetElement = node as HTMLElement;
        this.onArr = [];

    }
    /**
     * 渲染执行
     */
    public render() {
        if (!this._initStatus) {
            // 父节点
            let parentNode = this.targetElement.parentNode;
            let rootDom = document.createElement("div");
            rootDom.className = 'mark-view';
            rootDom.style.position = 'relative'
            rootDom.style.width = 'fit-content'
            rootDom.style.height = 'fit-content'
            let content = this.targetElement.cloneNode(true);
            this.targetNode = content;
            rootDom.appendChild(content);
            // svg节点
            let svgDom = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            this.svgDom = svgDom;
            svgDom.id = "mark-svg"
            svgDom.style.position = 'absolute'
            svgDom.style.left = '0px'
            svgDom.style.top = '0px'
            svgDom.style.width = '100%'
            svgDom.style.height = '100%'
            svgDom.setAttribute('width', "100%")
            svgDom.setAttribute('height', "100%")
            svgDom.setAttribute('pointer-events', "none")
            rootDom.appendChild(svgDom);
            parentNode?.replaceChild(rootDom, this.targetElement);
            this.rootElement = rootDom;
            if (!this.rootElement) {
                return
            }
            this.targetNodeRect = this.rootElement.getBoundingClientRect();
            this.targetNode.addEventListener('click', (event) => {
                if (!this.rootElement) {
                    return;
                }
                let targetNodeRect = this.rootElement.getBoundingClientRect()
                let _event = event as MouseEvent;
                let offsetX = _event.pageX - targetNodeRect.x;
                let offsetY = _event.pageY - targetNodeRect.y;
                // 判断一点是否在区间内
                let arr = this.efiRange.filter((item) => {
                    return item.position.filter((item2) => {
                        return (offsetX > item2.x1 && offsetX < item2.x2)
                            && (offsetY > item2.y1 && offsetY < item2.y2)
                    }).length > 0
                })
                if (arr.length > 0) {
                    arr.forEach((item) => {
                        let event = new Event('click');
                        item.node.dispatchEvent(event)
                    })
                }
            })
            this._handletListener();
            this._update();
        }
        this._initStatus = true;
    }
    /**
 * 更新
 */
    private update() {
        this.efiRange.forEach((item) => {
            let svgDom = this.svgDom as SVGElement;
            let Fragment = svgDom.querySelector(`[data-id='${item.rangeStr}']`) as Element;
            if (!Fragment) {
                return;
            }
            Fragment.innerHTML = '';
            let range = this._handleEfiToRange(item.rangeStr);
            if (range.collapsed) {
                return;
            }
            let rects = item.range.getClientRects();
            let _position: position[] = [];
            for (let i = 0; i < rects.length; i++) {
                let rect = rects[i];
                let { group, position } = this._handleCreateSvgG(rect, item.type);
                Fragment.appendChild(group);
                _position.push(position);
            }
            item.position = _position;
        })
    }

    public add(rangeStr: string, type: markType, className = '', cb: any) {
        let range = this._handleEfiToRange(rangeStr);
        if (range.collapsed) {
            return;
        }
        let rects = range.getClientRects();
        let Fragment = document.createElementNS('http://www.w3.org/2000/svg', 'g')
        if (className) {
            Fragment.classList.add(className);
        }
        Fragment.setAttribute('data-id', rangeStr);
        Fragment.setAttribute('opacity', "0.6");
        let _position: position[] = [];
        for (let i = 0; i < rects.length; i++) {
            let rect = rects[i];
            let { group, position } = this._handleCreateSvgG(rect, type);
            Fragment.appendChild(group);
            _position.push(position);
        }
        this.efiRange.push({
            rangeStr,
            range,
            type,
            position: _position,
            node: Fragment
        });
        if (cb) {
            Fragment.addEventListener('click', cb);
        }
        let svgDom = this.svgDom as SVGElement;
        svgDom.appendChild(Fragment)

    }
    /**
     * 删除标记
     * @param rangeStr 
     * @param type 
     */
    public remove(rangeStr: string, type: markType) {
        let arr: { item: efiRange, index: number }[] = this.efiRange.map((item, index) => {
            return { item, index };
        }).filter((data) => {
            return data.item.rangeStr == rangeStr && data.item.type == type;
        })
        let _index = 0;
        let svgDom = this.svgDom as SVGElement;
        for (let i = 0; i < arr.length; i++) {
            let index = arr[i].index - _index;
            let item = arr[i].item;
            svgDom.querySelector(`[data-id='${item.rangeStr}']`)?.remove();
            this.efiRange.splice(index, 1);
            _index++;
        }
    }

    // public mark(rangeStr: string, className: string, cb: Function) {
    //     this.add(rangeStr, "mark", className, cb);
    // }
    /**
     * 添加高亮
     * @param rangeStr 
     * @param className 
     * @param cb 
     */
    public highlight(rangeStr: string, className: string, cb: Function) {
        this.add(rangeStr, "highlight", className, cb);
    }
    /**
     * 添加下划线
     * @param rangeStr 
     * @param className 
     * @param cb 
     */
    public underline(rangeStr: string, className: string, cb: Function) {
        this.add(rangeStr, "underline", className, cb);
    }
    /**
     * 全部显示
     */
    public show() {
        this.svgDom?.setAttribute('opacity', "1");
    }
    /**
     * 全部隐藏
     */
    public hide() {
        this.svgDom?.setAttribute('opacity', "0");
    }

    /**
    * 监听
    * @param key string
    * @param func function
    */
    public on(key: string, func: Function) {
        this.onArr.push({ key, func });
    }
    public getRanges() {
        return this.efiRange;
    }
    /**
     * 视图更新
     */
    private _update() {
        window.addEventListener('resize', () => {
            requestAnimationFrame(() => {
                if (!this.rootElement) {
                    return
                }
                this.targetNodeRect = this.rootElement.getBoundingClientRect();
                this.update();
            })
        })
    }
    private _handletListener() {
        document.addEventListener("selectionchange", (...args: any[]) => {
            clearTimeout(this._selectionchangeTimeOut);
            this._selectionchangeTimeOut = setTimeout(() => {
                this._handleSelected.apply(this, args as any)
            }, 250);
        })
    }
    /**
     * 监听鼠标选中后的时间
     */
    private _handleSelected() {
        let Selection = window.getSelection();
        if (!Selection) {
            return;
        }
        let isCollapsed = Selection.isCollapsed;
        if (isCollapsed) {
            return;
        }
        let range = Selection.getRangeAt(0);
        // 通过查找开始元素 和结束元素在 dom 内容范围
        let rangeStr = this._handleSelectRangePostion(range);
        this._handleOn('selected', { rangeStr })
    }
    /**
     * 范围换取efi
     * @param range 范围
     * @returns 
     */
    private _handleSelectRangePostion(range: Range): string {
        let efi_start = this._handleSelectNodePostion(range.startContainer);
        let efi_start_offset = range.startOffset;
        let efi_end = this._handleSelectNodePostion(range.endContainer);
        let efi_end_offset = range.endOffset;
        return `${this.prefix}(${efi_start}:${efi_start_offset},${efi_end}:${efi_end_offset})`;
    }
    private _handleSelectNodePostion(node: Node): string {
        let nums: number[] = [];
        let _node = node;
        while (_node != this.targetNode) {
            let index = 0;
            while (_node.previousSibling) {
                index++
                _node = _node.previousSibling
            }
            nums.push(index);
            if (_node.parentNode == null) {
                break;
            }
            _node = _node.parentNode;
        }
        return nums.reverse().join('/')
    }
    /**
     * 通过efi字符转成range
     * @param rangeStr 标识范围的字符
     * @returns 
     */
    private _handleEfiToRange(rangeStr: string): Range {
        let range = document.createRange();
        let obj = this._handleCheckEfi(rangeStr);
        if (!obj) {
            return range;
        }
        let _node = this.targetNode as Node;
        let _node_: Node | null = null;
        for (let i = 0; i < obj.start_arr.length; i++) {
            let index = obj.start_arr[i];
            _node_ = _node.childNodes[index];
            _node = _node_;
        }
        obj.start_node = _node_;
        _node = this.targetNode as Node;
        for (let i = 0; i < obj.end_arr.length; i++) {
            let index = obj.end_arr[i];
            _node_ = _node.childNodes[index];
            _node = _node_;
        }
        obj.end_node = _node_;

        range.setStart(obj.start_node as Node, obj.start_offset);
        range.setEnd(obj.end_node as Node, obj.end_offset);
        return range;
    }
    /**
     * 执行监听响应事件
     * @param key string
     * @param data data
     */
    private _handleOn(key: string, data = {}) {
        let _onArr = this.onArr.filter((item) => item.key == key);
        _onArr.forEach((item) => {
            item?.func(data)
        })
    }
    private _handleCheckEfi(rangeStr: string): eftObj | null {
        let reg = new RegExp(`${this.prefix}\(.*\,.*\)`)
        let _arr = rangeStr.match(reg);
        if (!_arr || _arr.length < 2) {
            return null;
        }
        let str = _arr[1];
        str = str.replace('(', '').replace(')', '');
        let arr = str.split(',');
        let obj: eftObj = {
            start_arr: arr[0].split(':')[0].split('/').map((i) => Number(i)),
            start_offset: Number(arr[0].split(':')[1]),
            end_arr: arr[1].split(':')[0].split('/').map((i) => Number(i)),
            end_offset: Number(arr[1].split(':')[1]),
            start_node: null,
            end_node: null
        };
        return obj;
    }

    /**
     * 创建矩形
     * @param rect 
     * @param bool 是否透明 
     * @returns 
     */
    private _handleCreateRect(rect: DOMRect, bool = false) {
        let Dom = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
        let targetNodeRect = this.targetNodeRect as DOMRect;
        let x = rect.x - targetNodeRect.x;
        let y = rect.y - targetNodeRect.y;
        Dom.setAttribute('x', x.toString())
        Dom.setAttribute('y', y.toString())
        Dom.setAttribute('width', rect.width.toString())
        Dom.setAttribute('height', rect.height.toString())
        Dom.setAttribute('fill', '#03a9f4')
        Dom.setAttribute('mix-blend-mode', 'multiply')
        if (bool) {
            Dom.setAttribute('opacity', '0')
        }
        return Dom;
    }
    /**
     * 划线
     * @param rect 
     * @returns 
     */
    private _handleCreateLine(rect: DOMRect) {
        let Dom = document.createElementNS('http://www.w3.org/2000/svg', 'line')
        let targetNodeRect = this.targetNodeRect as DOMRect;
        let x1 = rect.x - targetNodeRect.x;
        let y1 = rect.y - targetNodeRect.y + rect.height;
        let x2 = x1 + rect.width;
        let y2 = y1;
        Dom.setAttribute('x1', x1.toString())
        Dom.setAttribute('y1', y1.toString())
        Dom.setAttribute('x2', x2.toString())
        Dom.setAttribute('y2', y2.toString())
        Dom.setAttribute('stroke-width', "2")
        Dom.setAttribute('stroke', '#03a9f4')
        Dom.setAttribute('mix-blend-mode', 'multiply')
        return Dom;
    }
    /**
     * 创建svg g
     * @param rect 
     * @param type 
     * @param rangeStr 
     * @returns 
     */
    private _handleCreateSvgG(rect: DOMRect, type: markType) {
        let targetNodeRect = this.targetNodeRect as DOMRect;
        let group = document.createDocumentFragment();
        if (type == 'highlight') {
            let rectDom = this._handleCreateRect(rect);
            group.appendChild(rectDom);
        }
        if (type == 'underline') {
            let rectDom = this._handleCreateRect(rect, true);
            let LineDom = this._handleCreateLine(rect);
            group.appendChild(rectDom);
            group.appendChild(LineDom);
        }
        let x1 = rect.x - targetNodeRect.x;
        let y1 = rect.y - targetNodeRect.y;
        let x2 = x1 + rect.width;
        let y2 = y1 + rect.height;
        let position: position = {
            x1,
            y1,
            x2,
            y2,
        }

        return { group, position };
    }


}