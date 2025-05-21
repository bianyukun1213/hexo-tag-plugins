// https://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript
String.prototype.hashCode = function () {
  let hash = 0,
    i, chr;
  if (this.length === 0) return hash;
  for (i = 0; i < this.length; i++) {
    chr = this.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
}

/*
    Image Masonry Tag: https://github.com/bigbite/macy.js

    Syntax:
    {% image_masonry ..."assetImg[&]alt[&]title[&]data-mask" %}
    
*/

let masonryCount = {};

hexo.extend.tag.register('image_masonry', function (args) {
  let list = '';
  let imgCount = 0;
  const argsLength = args.length;
  for (let i = 0; i < argsLength; i++) {
    const singleArg = args[i];
    const items = singleArg.split('[&]');
    const img = items[0].trim();
    const alt = items[1].trim(); // 新增 alt。
    const title = items[2] ? items[2].trim() : '';
    const dataMask = typeof items[3] !== 'undefined' ? items[3].trim() : undefined; // 新增 data-mask。
    // Redefine 的 img 有 margin-top。在这里我新建一个类 image-masonry-img，在 tag-image-masonry.css 里把 margin 归零。
    // 在 site-mod.js 里也可以写 JavaScript 来归零，但是样式不会立即渲染，下一句代码执行时获取的还是旧样式，重新计算 masonry 也就没有效果，得写 timeout 等一下。
    // 我不想这么写，就还是在 CSS 里归零了。
    list += `<div class="image-masonry-img-wrapper"><img class="image-masonry-img" src="${img}" alt="${alt}" title="${title}"${typeof dataMask !== 'undefined' ? ' data-mask="' + dataMask + '"' : ''}/></div>`;
    imgCount++;
  }
  // 修改 id，并且使内联 javascript、macy 实例也附带 id，避免一个页面中放多个瀑布流报变量二次声明的错误。
  const { path } = this;
  const prefix = path.hashCode();
  // 默认 3 列，如果 list 里图片少于 3 个，以 list 里图片个数为准。
  // 如果不这样写，假如 list 里只有两个图片，则这两个图片会即在左 2/3 的位置，右 1/3 是空白，不好看。
  // 需要注意的是，要在 site-mod.js 里重新计算 masonry，需要用 var 而不是 let 声明 macyxxx。
  let currentCount = 0;
  if (typeof masonryCount[prefix] === 'undefined')
    currentCount = masonryCount[prefix] = 0;
  else
    currentCount = masonryCount[prefix] = masonryCount[prefix] + 1;
  const id = `${(prefix + '').replace('-', 'n')}m${currentCount}`;
  const elements = `
    <div class="image-masonry" id="image-masonry-${id}">
      ${list}
    </div>
    <script class="image-masonry-script" id="image-masonry-script-${id}">
      var macy${id} = new Macy({
        container: '#image-masonry-${id}',
        trueOrder: false,
        waitForImages: false,
        useOwnImageLoader: false,
        mobileFirst: false,
        columns: ${imgCount < 3 ? imgCount : 3},
        margin: {
          y: 10,
          x: 10
        },
        breakAt: {
          1024: ${imgCount < 2 ? imgCount : 2},
          768: ${imgCount < 1 ? imgCount : 1}
        }
      });
      // 未加载完成时，让所有图片不要叠在一行。
      macy${id}.runOnImageLoad(() => {
        macy${id}.recalculate(true);
      }, true);
      // a dirty fix:
      // 遇到一个问题，页面里有两个 macy 实例，加载相同的图片，从内存缓存中加载时，recalculate 总是不生效。
      // 似乎能触发 runOnImageLoad，因为能打印日志。并且我还在附近查找加载完成的图片，手动触发 recalculate，手动触发 resize 事件，都没有效果。
      // 目前只能加一个 timeout，实测能解决问题。
      setTimeout(() => {
        macy${id}.recalculate(true);
      }, 1000);
    </script>
  `;
  return elements;
});
