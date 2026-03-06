document.addEventListener("DOMContentLoaded", function() {
  // 获取正文中由 [TOC] 生成的目录容器
  var toc = document.querySelector('.md-content .toc');
  if (!toc) return;

  // 创建左侧目录容器
  var leftToc = document.createElement('div');
  leftToc.className = 'md-nav__title md-nav__title--toc';
  leftToc.textContent = '页面目录'; // 可自定义标题

  var leftNavSecondary = document.createElement('nav');
  leftNavSecondary.className = 'md-nav md-nav--secondary';
  leftNavSecondary.innerHTML = toc.innerHTML;

  // 找到左侧导航的插入点（例如在站点导航列表之后）
  var primaryNav = document.querySelector('.md-sidebar--primary .md-nav--primary');
  if (primaryNav) {
    primaryNav.appendChild(leftToc);
    primaryNav.appendChild(leftNavSecondary);
  }

  // 隐藏正文中的原目录
  toc.style.display = 'none';
});