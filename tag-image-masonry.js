/*
    Image Masonry Tag: https://github.com/bigbite/macy.js

    Syntax:
    {% image_masonry ..."assetImg|alt|title" %}
    
*/

hexo.extend.tag.register("image_masonry", function(args){
  var assetPath = this.path;

  var list = "";
  args.forEach(function(e) {
    var item = e.split("|"); 
    var assetImg = item[0];
    // var title = item[1];
    var alt = item[1]; // 新增 alt。

    var title = item[2] || '';

    // list += `<div><img src="/${assetPath + assetImg}" alt="${title}" /></div>`
    list += `<div><img src="${assetImg}" alt="${alt}" title="${title}"/></div>`
  });
  // 修改 id，并且使内联 javascript、macy 实例也附带 id，避免一个页面中放多个瀑布流报变量二次声明的错误。
  var id = Math.random().toString(36).substring(2,8);

  var elements = `
    <div class="image-masonry" id="image-masonry-${id}">
      ${list}
    </div>
    <script class="image-masonry-script" id="image-masonry-script-${id}">
      let macyAt${id} = new Macy({
        container: '#image-masonry-${id}',
        trueOrder: false,
        waitForImages: false,
        useOwnImageLoader: false,
        debug: true,
        mobileFirst: true,
        columns: 2,
        margin: {
          y: 6,
          x: 6
        },
        breakAt: {
          1024: {
            margin: {
              x: 8,
              y: 8
            },
            columns: 4
          },
          768: 3
        }
      });
    </script>
  `;

  return elements;
});
