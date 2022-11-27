# mark-highlight(beta)

针对html内容，选择区域，绘制高亮 下划线等功能，不支持动态html内容，适用于固定内容，例如文章、电子书。

![./image/demo.png](./image/demo.png)

- 支持下划线 高亮类型
- 支持点击事件
- 支持自定义类名
- 支持resize，自动更新

### 安装

```html
<script src="../dist/index.umd.js"></script>
```

### 示例

[示例代码](./examples/index.html)


### 使用

```js
 let mark = new Mark("content"|HtmlElement);
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

## 暂未实现

- 视图更新优化处理
- 判断当前选择是否存在已mark
- 针对类型或指定rangeStr的显示与隐藏
- 强制重新绘制
- 批量设置绘制mark