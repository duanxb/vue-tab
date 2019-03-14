Vue.component('tabs', {
    template: '<div class="tab-switch" ref="tabSwitch" :class="{noTab: tabNames.length <= 1}">\
                    <div class="tab-switch-bar" v-show="tabNames.length > 1">\
                    <span :class="tabCls(item)" v-for="(item,index) in navList" @click="handleChange(index)">\
                    {{item.label}}\
                    <em :attr-name="item.badge" class="badge" v-if="item.badge">0</em>\
                    </span>\
                    <em class="active-line" :style="{left: activeStyleLeft}"></em>\
                    </div>\
                    <div class="tabs-content">\
                    <slot></slot>\
                    </div>\
                </div>',
    data: function() {
        return {
            //将pane的标题保存到数组中
            navList: [],
            //保存父组件的value到currentValue变量中，以便在本地维护
            currentValue: this.value,
            touch: {
                startx: 0,
                starty: 0,
            },
            tabNames: [], //tab name集合
        }
    },
    computed: {
        activeStyleLeft: function() {
            var currentIndex = 0, that = this;
            this.tabNames.forEach(function(item, index) {
                if(that.currentValue == item) {
                    currentIndex = index;
                }
            })
            var bar = this.$refs.tabSwitch;
            if(bar) {
                var singleTabWidth = bar.offsetWidth / this.tabNames.length;
                var left = (singleTabWidth - 14) / 2 + currentIndex * singleTabWidth;
                return left + 'px';
            }
        }
    },
    props: {
        //接收父组件的value
        value: {
            type: [String]
        },
        hash: {
            type: Boolean,
            default: false
        },
        touch: {
            type: Boolean,
            default: false
        }
    },
    methods: {
        //使用$children遍历子组件，得到所有的pane组件
        getTabs: function() {
            // return this.$children.filter(function(item) {
            //     return item.$options.name === 'pane';
            // })
            var that = this;
                that.tabNames = [];

            var tabs = [];
            this.$children.forEach(function(item, index) {
                if(item.$options.name === 'pane') {
                    item.name = index;
                    tabs.push(item);
                    that.tabNames.push(item.name);
                }
            })
            return tabs;
        },
        //更新tabs
        updateNav: function() {
            this.navList = [];
            var _this = this;
            this.getTabs().forEach(function(pane, index) {
                _this.navList.push({
                    label: pane.label,
                    badge: pane.badge,
                    name: pane.name || index
                });
                //如果没有设置name，默认设置为索引值
                if(!pane.name) {
                    pane.name = index;
                }
                //设置第一个pane为当前显示的tab
                if(index === 0) {
                    if(!_this.currentValue) {
                        _this.currentValue = pane.name || index;
                    }
                }
            });
            this.updateStatus();
        },
        updateStatus: function() {
            var tabs = this.getTabs();
            var _this = this;
            //显示当前选中的tab对应的pane组件，隐藏没有选中的
            tabs.forEach(function(tab) {
                return tab.show = tab.name == _this.currentValue;
            })
        },
        tabCls: function(item) {
            return [
                'item',
                {
                    //为当前选中的tab加一个tabs-tab-active class
                    'active': item.name == this.currentValue
                }
            ]
        },
        //点击tab标题触发
        handleChange: function(index) {
            var nav = this.navList[index];
            var name = nav.name;
            //改变当前选中的tab，触发watch
            this.currentValue = name;
            //实现子组件与父组件通信
            this.$emit('tabchange', name);
            //增加hash地址
            if(this.hash) {
                history.replaceState(null, '', '#'+this.currentValue);
            }
        },
        //得到前后的tab name
        getTabName: function(tabIndex) {
            var that = this;
            var tabName = '';
            this.tabNames.forEach(function(item, index) {
                if(that.currentValue == item) {
                    var newIndex = index + tabIndex;
                    if(newIndex < 0) {
                        newIndex = 0;
                    }
                    if(newIndex >= that.tabNames.length) {
                        newIndex = that.tabNames.length - 1;
                    }
                    tabName = that.tabNames[newIndex];
                }
            })
            return tabName;
        },
        //获取滑动的角度
        getTouchAngle: function(angx, angy) {
            return Math.atan2(angy, angx) * 180 / Math.PI;
        },
        //获取滑动距离和方向
        getTouchDirection: function(startx, starty, endx, endy) {
            var angx = endx - startx;
            var angy = endy - starty;
            var result = {angle: 0, angx: angx, angy: angy};
     
            //如果滑动距离太短
            if (Math.abs(angx) < 2 && Math.abs(angy) < 2) {
                return result;
            }
     
            var angle = this.getTouchAngle(angx, angy);
            //根据起点终点返回方向 1向上 2向下 3向左 4向右 0未滑动
            if (angle >= -135 && angle <= -45) {
                result = {angle: 1, angx: angx, angy: angy};
            } else if (angle > 45 && angle < 135) {
                result = {angle: 2, angx: angx, angy: angy};
            } else if ((angle >= 135 && angle <= 180) || (angle >= -180 && angle < -135)) {
                result = {angle: 3, angx: angx, angy: angy};
            } else if (angle >= -45 && angle <= 45) {
                result = {angle: 4, angx: angx, angy: angy};
            }
     
            return result;
        },
        listenTouch: function() {
            var that = this;
            //手指接触屏幕
            document.addEventListener("touchstart", function(e) {
                that.touch.startx = e.touches[0].pageX;
                that.touch.starty = e.touches[0].pageY;
            }, false);
            //手指离开屏幕
            document.addEventListener("touchend", function(e) {
                var endx, endy;
                endx = e.changedTouches[0].pageX;
                endy = e.changedTouches[0].pageY;
                var direction = that.getTouchDirection(that.touch.startx, that.touch.starty, endx, endy);
                if(direction.angle === 3) {
                    that.handleChange(that.getTabName(1));
                }
                if(direction.angle === 4) {
                    that.handleChange(that.getTabName(-1));
                }
            }, false);
        }
    },
    mounted: function() {
        if(this.touch) {
            this.listenTouch();
        }
    },
    watch: {
        value: function(val) {
            this.currentValue = val;
        },
        currentValue: function() {
            //tab发生变化时，更新pane的显示状态
            this.updateStatus();
        }
    }
})


Vue.component('pane',{
    template: '<div class="pane" v-show="show"><slot></slot></div>',
    data: function(){
        return {
            show:true
        }
    },
    //props为来自父组件的变量，实现父组件与子组件通信
    props:{
        //设置pane的标识
        name:{
            type:String
        },
        //label是设置标题
        label:{
            type:String,
            default:''
        },
        badge: {
            type:String,
            default:''
        }
    },
    methods:{
        updateNav: function(){
            //$parent 父链，通知父组件（tabs）进行更新。
            //说明：在业务中尽可能不要使用$parent来操作父组件，$parent适合标签页这样的独立组件
            this.$parent.updateNav();
        }
    },
    //监听label
    watch:{
        label: function(){
            this.updateNav();
        }
    },
    
    mounted: function(){
        //初始化tabs
        this.updateNav();
    }
})