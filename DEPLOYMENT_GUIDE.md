# 文件传输应用长期部署指南

## 🎯 部署方案对比

| 方案 | 成本 | 技术难度 | 稳定性 | 适用场景 |
|------|------|----------|--------|----------|
| **路由器部署** | 💰 免费 | 🔴 高 | 🟡 中等 | 有刷机路由器 |
| **Windows开机自启** | 💰 免费 | 🟢 低 | 🟢 高 | 家用电脑常开 |
| **NAS部署** | 💰 免费 | 🟡 中等 | 🟢 高 | 有NAS设备 |
| **树莓派部署** | 💰 低 | 🟡 中等 | 🟢 高 | 技术爱好者 |
| **DDNS+内网穿透** | 💰 低 | 🟡 中等 | 🟡 中等 | 需要外网访问 |

## 🚀 最佳方案推荐

### 方案1: Windows开机自启 (推荐新手)
**优点**: 简单、稳定、零成本
**缺点**: 需要电脑常开

#### 部署步骤:

1. **创建启动脚本**
```batch
@echo off
cd /d "D:\agent\file-transfer-app"
python app.py
pause
```
保存为 `start_server.bat`

2. **创建Windows服务 (可选)**
```powershell
# 以管理员身份运行PowerShell
$serviceName = "FileTransferService"
$scriptPath = "D:\agent\file-transfer-app\app.py"
$pythonPath = "C:\Python311\python.exe"

# 创建服务
New-Service -Name $serviceName -BinaryPathName "$pythonPath $scriptPath" -StartupType Automatic
```

3. **添加到启动项**
- 按 `Win + R`，输入 `shell:startup`
- 将 `start_server.bat` 复制到启动文件夹

4. **设置防火墙**
```cmd
netsh advfirewall firewall add rule name="FileTransferApp" dir=in action=allow protocol=TCP localport=5000
```

### 方案2: 路由器部署 (技术向)
**优点**: 24小时运行、低功耗
**缺点**: 需要刷机、存储空间有限

#### 支持的路由器:
- **OpenWRT**: 大部分支持
- **梅林固件**: 华硕路由器
- **Padavan**: 老毛子固件

#### OpenWRT部署步骤:

1. **安装Python3**
```bash
opkg update
opkg install python3 python3-pip
```

2. **安装依赖**
```bash
pip3 install flask flask-socketio qrcode
```

3. **上传文件到路由器**
```bash
scp -r file-transfer-app root@192.168.1.1:/root/
```

4. **创建启动脚本**
```bash
#!/bin/sh
cd /root/file-transfer-app
python3 app.py &
```

5. **设置开机启动**
编辑 `/etc/rc.local`，在 `exit 0` 前添加:
```bash
/root/start_server.sh
```

### 方案3: NAS部署
**优点**: 稳定、低功耗、已有设备
**缺点**: 部署稍复杂

#### 群晖NAS部署:

1. **启用套件中心**
- 控制面板 → 套件中心 → 启用套件中心

2. **安装Python套件**
- 套件中心搜索 "Python" 并安装

3. **SSH连接NAS**
```bash
ssh admin@你的NAS_IP
```

4. **部署应用**
```bash
# 上传文件
scp -r file-transfer-app admin@你的NAS_IP:/volume1/homes/admin/

# 安装依赖
pip install -r file-transfer-app/requirements.txt

# 启动应用
cd file-transfer-app
python app.py
```

### 方案4: 树莓派部署
**优点**: 专用设备、低功耗、可玩性强
**缺点**: 需要额外设备

#### 部署步骤:

1. **安装Raspberry Pi OS**
- 下载官方镜像并写入SD卡

2. **启用SSH**
```bash
sudo raspi-config
# 选择 Interface Options → SSH → Yes
```

3. **安装Python环境**
```bash
sudo apt update
sudo apt install python3 python3-pip
```

4. **部署应用**
```bash
# 上传文件
scp -r file-transfer-app pi@树莓派IP:/home/pi/

# 安装依赖
cd file-transfer-app
pip3 install -r requirements.txt

# 启动应用
python3 app.py
```

5. **设置开机自启**
```bash
sudo systemctl enable app.py
```

## 🔧 高级配置

### 端口配置
修改 `app.py` 中的端口:
```python
port = 8080  # 改为8080或其他端口
```

### 自动重启脚本
创建 `restart_script.py`:
```python
import subprocess
import time
import os

def restart_app():
    while True:
        try:
            # 检查端口是否被占用
            result = subprocess.run(['netstat', '-an'], capture_output=True, text=True)
            if ':5000' not in result.stdout:
                print("Starting server...")
                subprocess.Popen(['python', 'app.py'])
        except Exception as e:
            print(f"Error: {e}")
        
        time.sleep(60)  # 每分钟检查一次

if __name__ == '__main__':
    restart_app()
```

### Docker部署 (可选)
创建 `Dockerfile`:
```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

EXPOSE 5000
CMD ["python", "app.py"]
```

构建和运行:
```bash
docker build -t file-transfer-app .
docker run -p 5000:5000 file-transfer-app
```

## 🌐 外网访问方案

### DDNS + 端口转发
1. **申请DDNS域名**
   - 花生壳: https://hsk.oray.com/
   - 西部数码: https://www.west.cn/gy/cmddns/

2. **路由器端口转发**
   - 登录路由器管理界面
   - 找到"端口转发"或"虚拟服务器"
   - 添加规则: 外部端口 5000 → 内部IP:5000

3. **动态DNS设置**
   - 在路由器中配置DDNS账号
   - 绑定域名到路由器

### 内网穿透工具
- **frp**: https://github.com/fatedier/frp
- **花生壳内网版**: 免费版有带宽限制
- **ZeroTier**: P2P组网，无需公网IP

## 📱 手机常驻方案

### Android方案
1. **Termux + Python**
```bash
pkg install python
pip install flask flask-socketio
# 上传文件并运行
python app.py
```

2. **Tasker自动化**
- 设置开机启动脚本
- 监控进程自动重启

### iOS方案
使用 **Pythonista** 应用:
1. 安装Pythonista
2. 上传文件到Pythonista
3. 运行脚本

## 🛡️ 安全建议

### 基础安全
1. **修改默认端口**: 避免使用5000端口
2. **防火墙设置**: 只允许内网访问
3. **定期更新**: 保持Python和依赖包更新

### 高级安全 (可选)
1. **添加认证**: 实现简单的用户名密码验证
2. **HTTPS**: 使用Let's Encrypt证书
3. **访问日志**: 记录访问历史

## 📊 性能优化

### 内存优化
```python
# 在app.py中添加
import gc

# 定期清理内存
def cleanup_memory():
    gc.collect()
    threading.Timer(3600, cleanup_memory).start()  # 每小时清理一次

cleanup_memory()
```

### 存储优化
```python
# 修改清理时间从1小时改为30分钟
if (current_time - uploaded_time).total_seconds() > 1800:  # 30分钟
```

## 🎯 推荐配置

### 家庭用户 (最简单)
- **方案**: Windows开机自启
- **成本**: 0元
- **维护**: 极低

### 技术用户 (最稳定)
- **方案**: 树莓派 + Docker
- **成本**: ~200元
- **维护**: 低

### 企业用户 (最专业)
- **方案**: NAS + Docker
- **成本**: 已有设备
- **维护**: 中等

选择最适合您情况的方案开始部署吧！🎉