

<template>
  <div class="main">
    <button @click="addUnderline()">划线</button>
    <button @click="addHighlight('hig1')">高亮1</button>
    <button @click="addHighlight('hig2')">高亮2</button>
    <button @click="mark.show()">show</button>
    <button @click="mark.hide()">hide</button>
    <div id="content">
      <h1 style="padding-left: 24px;">将进酒·君不见</h1>
      <p><b>君不见，</b>黄河之水天上来，奔流到海不复回。</p>

      <p style="margin-top:24px ;">君不见，高堂明镜悲白发，<img style="width: 32px;height:32px"
          src="https://vuejs.org/logo.svg" />朝如青丝暮成雪。</p>

      <p>人生得意须尽欢，莫使金樽空对月。</p>

      <p>天生我材必有用，千金散尽还复来。</p>

      <p>烹羊宰牛且为乐，会须一饮三百杯。</p>

      <p>岑夫子，丹丘生，将进酒，杯莫停。</p>

      <p>与君歌一曲，请君为我倾耳听。</p>

      <p>钟鼓馔玉不足贵，但愿长醉不愿醒。</p>

      <p>古来圣贤皆寂寞，惟有饮者留其名。</p>

      <p>陈王昔时宴平乐，斗酒十千恣欢谑。</p>

      <p>主人何为言少钱，径须沽取对君酌。</p>

      <p>五花马，千金裘，呼儿将出换美酒，与尔同销万古愁</p>
    </div>
  </div>
</template>
<script setup lang="ts">
import Mark from "mark-highlight"
import { onMounted, shallowRef } from "vue";

let _rangeStr = "";
const mark = shallowRef();

onMounted(() => {
  mark.value = new Mark("content");

  mark.value.on('selected', (data: any) => {
    _rangeStr = data.rangeStr;
  })
  mark.value.render();
})

function addUnderline() {
  console.log("划线");
  mark.value.underline(_rangeStr, 'underline', (e: any) => {
    let rangeStr = e.target.getAttribute('data-id')

    let r = confirm("是否删除划线?")
    if (r) {
      mark.value.remove(rangeStr, 'underline');
    }

  })
  window.getSelection()?.removeAllRanges();
}

function addHighlight(classNmae: string) {
  console.log("高亮");
  mark.value.highlight(_rangeStr, classNmae, (e) => {
    let rangeStr = e.target.getAttribute('data-id')
    let r = confirm("是否删除高亮?")
    if (r) {
      mark.value.remove(rangeStr, 'highlight');
    }
  })
  window.getSelection()?.removeAllRanges();
}
</script>
<style>
#content {
  width: 320px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 10px 20px rgb(0 0 0 / 7%);
  padding: 16px;
}

.hig1 rect {
  fill: #03a9f4;
}

.hig2 rect {
  fill: #ff3366;
}
</style>
