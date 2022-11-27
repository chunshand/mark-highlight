# mark-highlight(beta)

`mark-highlight`是一个简单轻量的内容选中划线高亮小工具。

- 保留元素的内部结构
- 对于选中区域的标记操作，有很简单的数据符号，方便下次访问时再次渲染绘制选中区域，前提是内容不变的情况下。
- 适用于笔记、博客、电子书、批注等场景。

![./image/demo.png](./image/demo.png)

- 支持下划线 高亮类型的标记
- 支持标记区域点击事件
- 支持标记区域设置自定义类名
- 支持视图更新标记区域同步更新



### 安装

```html
<script src="../dist/index.umd.js"></script>
```

or

```bash
npm install mark-highlight
```
### 示例

[示例代码](./examples/index.html)


### 使用

```js
 let mark = new Mark("idName"|HtmlElement);
```

**渲染**

建议content元素在内容填充完毕后，执行此方法。

```js
mark.render();
```

**选择后回调事件**
```js
mark.on('selected', (data) => {
    let _rangeStr = data.rangeStr;
})
```

**设置高亮**

```js
mark.highlight(_rangeStr, 'className', (e) => {
    // 高亮区域点击后回调
    // 获取点击元素的_rangeStr
    let rangeStr = e.target.getAttribute('data-id')
   
})
```
**设置下划线**
```js
mark.underline(_rangeStr, 'className', (e) => {
    let rangeStr = e.target.getAttribute('data-id')
})
```

**删除标记**

```js
mark.remove(rangeStr, 'underline|highlight');
```

**添加标记**

```js
mark.add(rangeStr, 'underline|highlight','className',click:()=>{});
```

**显示所有**
```js
mark.show();
```

**隐藏所有**
```js
mark.hide();
```

## 任务列表

- [ ] 视图更新优化处理
- [ ] 判断rangeStr是否存在交集rangeStr
- [ ] 显示隐藏，支持针对类型与rangeStr
- [ ] 强制重新绘制
- [ ] 批量mark
- [ ] 获取rangeStr区域的坐标点，方便浮动工具栏的应用