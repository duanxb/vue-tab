# vue-scroller

移动端TAB切换组件

 ## 演示

![vue-tab]()

#### Code DEMO
```html
<tabs v-model='tabShow' @tabchange = 'tabChange' :hash="true">
	<pane label="Tab1" class="" badge="count1">
	</pane>
	<pane label="Tab2" class="" badge="count2">
	</pane>
	<pane label="Tab3" class="" badge="count3">
	</pane>
</tabs>
```


## tabs Props
| 参数        	| 说明           |
| ------------- |-------------|
| value		|[String] 接收父组件的value	|
| hash          | [Boolean]，开启，默认true |
| touch       | [Boolean]：是否监听touch事件，默认false | 


## 方法

| 参数            | 说明          |
| -------------   |-------------|
| tabchange   | [Function] Tab切换的事件监听 |

## pane Props
| 参数        	| 说明           |
| ------------- |-------------|
| name		|[String] 设置pane的标识	|
| label          | [String]，label是设置标题 |
| badge       | [Number]：当前Tab上的数字，一般位于右上角的数字提醒 | 
