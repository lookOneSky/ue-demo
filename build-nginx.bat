@echo off
echo ====================================
echo 开始构建 Nginx 部署版本
echo ====================================

echo 1. 执行 Vite 构建...
call npx vite build
if %errorlevel% neq 0 (
    echo Vite 构建失败！
    pause
    exit /b %errorlevel%
)

echo 2. 创建 nginx 部署目录...
if not exist "nginx-deploy" mkdir nginx-deploy
xcopy /E /I /Y dist nginx-deploy\html

echo 3. 生成 nginx 配置文件...
(
echo server {
echo     listen       80;
echo     server_name  _;
echo.
echo     # 前端静态文件
echo     location / {
echo         root   html;
echo         index  index.html;
echo         try_files $uri $uri/ /index.html;
echo     }
echo.
echo     # 图片视频资源代理
echo     location /staticRes/ {
echo         proxy_pass http://10.100.5.28:5174/;
echo         proxy_set_header Host $host;
echo         proxy_set_header X-Real-IP $remote_addr;
echo         proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
echo     }
echo.
echo     # gzip 压缩
echo     gzip on;
echo     gzip_vary on;
echo     gzip_min_length 1024;
echo     gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
echo }
) > nginx-deploy\nginx.conf

echo ====================================
echo 构建完成！
echo 部署文件位于: nginx-deploy 目录
echo - html: 静态文件目录
echo - nginx.conf: nginx 配置文件示例
echo ====================================
echo.
echo 部署说明:
echo 1. 将 html 目录内容复制到 nginx 的 html 目录
echo 2. 参考 nginx.conf 配置 nginx 服务器
echo ====================================
pause
