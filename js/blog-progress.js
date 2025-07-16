/**
 * 博客阅读进度指示器
 * 在阅读文章时显示一个进度条，指示阅读进度
 */

document.addEventListener('DOMContentLoaded', () => {
  // 检查是否在文章页面
  const articleElement = document.querySelector('.blog-post');
  if (!articleElement) return;
  
  // 创建进度条容器
  const progressContainer = document.createElement('div');
  progressContainer.className = 'reading-progress-container';
  
  // 创建进度条
  const progressBar = document.createElement('div');
  progressBar.className = 'reading-progress-bar';
  
  // 添加进度条到容器
  progressContainer.appendChild(progressBar);
  
  // 添加容器到页面顶部
  document.body.insertBefore(progressContainer, document.body.firstChild);
  
  // 计算阅读进度的函数
  function updateReadingProgress() {
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight - windowHeight;
    const scrollPosition = window.scrollY;
    
    // 计算百分比进度
    let progress = (scrollPosition / documentHeight) * 100;
    
    // 确保进度在0-100之间
    progress = Math.min(Math.max(progress, 0), 100);
    
    // 更新进度条宽度
    progressBar.style.width = `${progress}%`;
    
    // 如果接近完成，添加完成状态类
    if (progress > 95) {
      progressBar.classList.add('almost-complete');
    } else {
      progressBar.classList.remove('almost-complete');
    }
  }
  
  // 初始更新进度
  updateReadingProgress();
  
  // 监听滚动事件
  window.addEventListener('scroll', updateReadingProgress);
  
  // 监听窗口大小变化
  window.addEventListener('resize', updateReadingProgress);
  
  // 自动生成文章目录
  generateTableOfContents();
});

/**
 * 自动生成文章目录
 */
function generateTableOfContents() {
  // 查找文章内容区域
  const contentElement = document.querySelector('.blog-post-content');
  if (!contentElement) return;
  
  // 查找所有标题（h2, h3）
  const headings = contentElement.querySelectorAll('h2, h3');
  if (headings.length < 3) return; // 如果标题太少，不创建目录
  
  // 创建目录容器
  const tocContainer = document.createElement('div');
  tocContainer.className = 'table-of-contents';
  
  // 创建标题
  const tocTitle = document.createElement('h4');
  const lang = document.documentElement.lang || 'en';
  tocTitle.textContent = lang === 'zh' ? '文章目录' : 'Table of Contents';
  
  // 创建目录列表
  const tocList = document.createElement('ul');
  
  // 为每个标题创建目录项
  headings.forEach((heading, index) => {
    // 为标题添加ID，如果没有的话
    if (!heading.id) {
      heading.id = `section-${index}`;
    }
    
    // 创建目录项
    const listItem = document.createElement('li');
    listItem.className = `toc-${heading.tagName.toLowerCase()}`;
    
    const link = document.createElement('a');
    link.href = `#${heading.id}`;
    link.textContent = heading.textContent;
    
    // 点击目录项时平滑滚动到对应位置
    link.addEventListener('click', (e) => {
      e.preventDefault();
      document.querySelector(`#${heading.id}`).scrollIntoView({ 
        behavior: 'smooth' 
      });
    });
    
    listItem.appendChild(link);
    tocList.appendChild(listItem);
  });
  
  // 组装目录
  tocContainer.appendChild(tocTitle);
  tocContainer.appendChild(tocList);
  
  // 将目录插入到文章开头
  contentElement.insertBefore(tocContainer, contentElement.firstChild);
  
  // 添加目录活跃状态更新
  updateActiveTableOfContents();
}

/**
 * 更新目录的活跃状态
 */
function updateActiveTableOfContents() {
  const tocLinks = document.querySelectorAll('.table-of-contents a');
  if (!tocLinks.length) return;
  
  // 获取所有目标标题元素
  const headingElements = Array.from(tocLinks).map(link => {
    const id = link.getAttribute('href').substring(1);
    return document.getElementById(id);
  });
  
  // 监听滚动事件，更新活跃的目录项
  window.addEventListener('scroll', () => {
    // 获取当前滚动位置
    const scrollPosition = window.scrollY + 100; // 添加偏移量
    
    // 查找当前可见的标题
    let currentHeading = headingElements[0];
    
    headingElements.forEach(heading => {
      if (heading.offsetTop <= scrollPosition) {
        currentHeading = heading;
      }
    });
    
    // 更新活跃状态
    tocLinks.forEach(link => {
      link.classList.remove('active');
      
      const href = link.getAttribute('href');
      if (href === `#${currentHeading.id}`) {
        link.classList.add('active');
      }
    });
  });
} 