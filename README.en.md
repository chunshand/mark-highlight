# mark-highlight(beta)

Languages: [简体中文](/README.md) | English


mark-highlight is a simple tool，Highlight the content , Does not pollute the element structure


![./image/demo.png](./image/demo.png)

- underline / highlight
- custom click function
- custom class
- auto resize

### demo
[code](./examples/index.html)

[online demo](https://code.juejin.cn/pen/7171034100965310472)

If you feel okay, give me a star

### installation

```html
<script src="../dist/index.umd.js"></script>
```

or

```bash
npm install mark-highlight
```


### use

```js
let mark = new Mark("idName"|HtmlElement);
mark.render();
```

**on**
```js
mark.on('render', (el) => {
    console.log('render dom',el);
})
mark.on('selected', (data) => {
    let markStr = data.markStr;
    let {
        top_left,
        top_center,
        top_right,
        // ...
    } = data.position;
})
```

**add highlight**

```js
mark.highlight(markStr, 'className', (e) => {
    // click function
    let _markStr = e.target.getAttribute('data-id')
})
```
**add underline**
```js
mark.underline(markStr, 'className', (e) => {
    let _markStr = e.target.getAttribute('data-id')
})
```

**remove mark**

```js
mark.remove(markStr, 'underline|highlight');
```

**add mark**

```js
mark.add({
    markStr:"",
    type: 'underline|highlight',
    className: "",
    data: {},
    clirk:()=>{},

});
```

**show all mark**
```js
mark.show();
```

**hide all mark**
```js
mark.hide();
```



**clear mark**
```js
mark.clear();
```

**get all mark**
```js
mark.getMarks();
```
