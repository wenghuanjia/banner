let bannerRender = (function () {
  // 获取后续需要操作的元素获取元素集合
  let container = document.querySelector('#container'), // 展示图片的容器 视图容器
    wrapper = container.querySelector('.wrapper'), // 放置图片的容器
    focus = container.querySelector('.focus'), // 放置焦点的容器
    arrowLeft = container.querySelector('.arrowLeft'), // 左箭头    
    arrowRight = container.querySelector('.arrowRight'), // 右箭头
    slideList = null,
    focusList = null;
  let stepIndex = 0, // 记录当前展示块的索引（步长）
    autoTimer = null, // 存储自动轮播的定时器
    interval = 1000; // 间隔多长时间自动切换一次  
  // ajax 基于 promise 对象获取数据，处理异步编程
  let queryData = function queryData() {
    // 返回一个promise实例
    return new Promise((resolve, reject) => {
      // 一个异步操作处理
      let xhr = new XMLHttpRequest;
      xhr.open('get', 'json/banner.json', true);
      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4 && xhr.status === 200) {
          let data = JSON.parse(xhr.responseText);
          // 成功时执行 resolve函数
          resolve(data);
        }
      };
      xhr.send(null);
    });
  };
  // 基于 ES6 模板字符串实现数据绑定
  let bindHTML = function bindHTML(data) {
    let strSlide = ``,
      strFoucs = ``;
    data.forEach((item, index) => {
      let {
        img,
        desc
      } = item;
      strSlide += `<div class="slide">
        <img src="${img}" alt="${desc}">
      </div>`;
      // es6模板字符串中${}存放的是js表达式，但是需要表达式有返回值，因为我们要把这个返回值拼接到模板字符串中
      strFoucs += `<li class="${index === 0 ? 'active' : ''}"></li>`;
    });
    // 把第一张复制一份放到末尾
    // strSlide += `<div class="slide">
    //   <img src="${data[0].img}" alt="${data[0].desc}">
    // </div>`;
    wrapper.innerHTML = strSlide;
    focus.innerHTML = strFoucs;
    // 获取所有的slide和li
    slideList = wrapper.querySelectorAll('.slide');
    focusList = focus.querySelectorAll('li');
    // 把原有的第一张克隆一份放到容器的末尾（由于querySelectAll不存在DOM映射，新增加一个原有集合中还是之前的slide，我们需要重新获取一遍）,深度克隆
    wrapper.appendChild(slideList[0].cloneNode(true));
    slideList = wrapper.querySelectorAll('.slide');
    // 根据slide的个数动态计算wrapper的宽度
    utils.css(wrapper, 'width', slideList.length * 1000);
  };
  // 让焦点跟着轮播图的切换而切换（遇到克隆这一张的时候，也需要让第一个li有选中的样式）
  let changeFocus = function changeFocus() {
    // 当轮播图运动到最后一张（克隆第一张，我们需要让第一个li（索引为0）有选中的样式）
    let tempIndex = stepIndex;
    // 当焦点索引等于图片元素的长度-1的时候，说明已经到了最后一张，即克隆的第一张，我们此时让该索引等于第一张图片的索引
    tempIndex === slideList.length - 1 ? tempIndex = 0 : null;
    [].forEach.call(focusList, (item, index) => {
      // 当图片的对应索引等于焦点的对应索引的时候，给对应的焦点索引选中的样式即可
      item.className = index === tempIndex ? 'active' : '';
    });
  };
  // 控制轮播图的运动和切换
  let autoMove = function autoMove() {
    stepIndex++;
    if (stepIndex > (slideList.length - 1)) {
      utils.css(wrapper, 'left', 0);
      stepIndex = 1;
    }
    animate(wrapper, {
      left: -stepIndex * 1000
    }, 200); // 200是从当前切换到下一张的动画时间
    // 切换焦点
    changeFocus();
  };
  // 鼠标进入和离开控制自动的轮播和停止 开启
  let handleContainer = function handleContainer() {
    // 鼠标移入执行的事件
    container.onmouseenter = function () {
      // 清除定时器
      clearInterval(autoTimer);
      // 显示两个箭头
      arrowLeft.style.display = arrowRight.style.display = 'block';
    };
    // 鼠标离开执行的事件
    container.onmouseleave = function () {
      // 重新启动定时器
      autoTimer = setInterval(autoMove, interval);
      // 隐藏两个箭头
      arrowLeft.style.display = arrowRight.style.display = 'none';
    };
  };  
  // 点击焦点实现切换
  let handleFocus = function handleFocus() {
    [].forEach.call(focusList, (item, index) => {
      item.onclick = function () {
        stepIndex = index; // 点击的是谁，就让stepIndex运动到哪（索引一致）
        animate(wrapper, {
          left: -stepIndex * 1000
        }, 200);
        changeFocus();
      }
    })
  };
  // 两个箭头绑定点击事件
  let handleArrow = function handleArrow() {
    // 点击右按钮和自动轮播是一样的操作
    arrowRight.onclick = autoMove;
    // 为 左按钮 添加对应的点击事件
    arrowLeft.onclick = function () {
      stepIndex--;
      // 如果索引减减后小于0，说明当前是第一张，不能再向右运动了，此时我们让wrapper瞬间移动到最后一张，再让其运动到倒数第二张即可
      if (stepIndex < 0) {
        utils.css(wrapper, 'left', -(slideList.length - 1) * 1000);
        // 让stepIndex为倒数第二个
        stepIndex = slideList.length - 2;
      }
      animate(wrapper, {
        left: -stepIndex * 1000
      }, 200);
      changeFocus();
    };
  };
  return {
    init: function init() {
      // 创建一个promise实例
      let promise = queryData();
      promise.then(bindHTML).then(() => {
        // 开启定时器驱动的自动轮播
        autoTimer = setInterval(autoMove, interval);
      }).then(() => {
        // 左右按钮或者焦点切换
        handleContainer();
        handleFocus();
        handleArrow();
      });
    }
  }
})();
bannerRender.init();
