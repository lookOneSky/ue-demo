 // 获取调试按钮
 const debugBtn = document.querySelector('.debug-btn');
 if (debugBtn) {
     // 修改按钮文字
     debugBtn.textContent = '查看详细信息';
     
     // 修改按钮样式
     debugBtn.style.cssText = `
         background: linear-gradient(145deg, #E1BB82, #8B7355);
         color: #fff;
         padding: 8px 20px;
         border: none;
         border-radius: 20px;
         font-size: 14px;
         font-weight: bold;
         cursor: pointer;
         box-shadow: 0 2px 4px rgba(0,0,0,0.2);
         transition: all 0.3s ease;
         text-shadow: 1px 1px 2px rgba(0,0,0,0.2);
         margin: 15px auto;
         display: block;
         position: relative;
         overflow: hidden;
     `;

     // 添加hover效果
     debugBtn.addEventListener('mouseenter', function() {
         this.style.transform = 'translateY(-2px)';
         this.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
         this.style.background = 'linear-gradient(145deg, #8B7355, #E1BB82)';
     });

     debugBtn.addEventListener('mouseleave', function() {
         this.style.transform = 'translateY(0)';
         this.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
         this.style.background = 'linear-gradient(145deg, #E1BB82, #8B7355)';
     });

     // 添加点击效果
     debugBtn.addEventListener('click', function() {
         this.style.transform = 'scale(0.95)';
         setTimeout(() => {
             this.style.transform = 'scale(1)';
         }, 100);
     });
 }