declare type markType = "mark" | "highlight" | "underline";
declare class Mark {
    /**
     * 渲染Element
     */
    private targetElement;
    /**
     * 是否初始化
     */
    private _initStatus;
    /**
     * 渲染节点
     */
    private targetNode;
    /**
     * 监听的数组
     */
    private onArr;
    /**
     * efi 前缀 默认mark
     */
    private prefix;
    /**
     * 响应延迟
     */
    private _selectionchangeTimeOut;
    private _resizeTimeOut;
    /**
     * 需要标记的数组
     */
    private efiRange;
    /**
     * svg dom
     */
    private svgDom;
    /**
     * target Node Rect
     */
    private targetNodeRect;
    private rootElement;
    constructor(target: string | HTMLElement);
    /**
     * 渲染执行
     */
    render(): void;
    /**
     * 视图更新
     */
    private _update;
    private _handletListener;
    /**
     * 监听鼠标选中后的时间
     */
    private _handleSelected;
    /**
     * 范围换取efi
     * @param range 范围
     * @returns
     */
    private _handleSelectRangePostion;
    private _handleSelectNodePostion;
    /**
     * 通过efi字符转成range
     * @param efi 标识范围的字符
     * @returns
     */
    private _handleEfiToRange;
    /**
     * 执行监听响应事件
     * @param key string
     * @param data data
     */
    private _handleOn;
    private _handleCheckEfi;
    /**
     * 监听
     * @param key string
     * @param func function
     */
    on(key: string, func: Function): void;
    /**
     * 创建矩形
     * @param rect
     * @param bool 是否透明
     * @returns
     */
    private _handleCreateRect;
    /**
     * 划线
     * @param rect
     * @returns
     */
    private _handleCreateLine;
    /**
     * 创建svg g
     * @param rect
     * @param type
     * @param efi
     * @returns
     */
    private _handleCreateSvgG;
    /**
     * 更新
     */
    private update;
    add(efi: string, type: markType, className: string | undefined, cb: any): void;
    /**
     * 删除标记
     * @param efi
     * @param type
     */
    remove(efi: string, type: markType): void;
    /**
     * 添加高亮
     * @param efi
     * @param className
     * @param cb
     */
    highlight(efi: string, className: string, cb: Function): void;
    /**
     * 添加下划线
     * @param efi
     * @param className
     * @param cb
     */
    underline(efi: string, className: string, cb: Function): void;
    /**
     * 全部显示
     */
    show(): void;
    /**
     * 全部隐藏
     */
    hide(): void;
}

export { Mark as default };
