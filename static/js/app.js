// File Transfer App JavaScript

// Global variables
let socket;
let uploadProgress = 0;

// Helper function to detect mobile devices
function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           /Mobile|Tablet|iPad|iPhone|iPod|Android|BlackBerry|IEMobile|Opera Mini/i.test(navigator.platform);
}

// Language strings
const LANGUAGES = {
    en: {
        sidebarTitle: 'Local Transfer',
        networkInfo: 'Network Info',
        serverIP: 'Server IP:',
        url: 'URL:',
        copyURL: 'Copy URL',
        mobileAccess: 'Mobile Access',
        scanToAccess: 'Scan to access on mobile',
        files: 'Files',
        total: 'Total:',
        storage: 'Storage:',
        uploadFiles: 'Upload Files',
        dragDrop: 'Drag & Drop Files Here',
        clickSelect: 'or click to select files',
        selectFiles: 'Select Files',
        messages: 'Messages',
        clearMessages: 'Clear Messages',
        typeMessage: 'Type a message...',
        filesTitle: 'Files',
        refresh: 'Refresh',
        clearAll: 'Clear All',
        uploadStatus: {
            uploading: 'Uploading: ',
            complete: 'Upload complete: ',
            failed: 'Upload failed: '
        },
        toast: {
            connected: 'Connected to file transfer server',
            disconnected: 'Disconnected from server',
            newFile: 'New file uploaded: ',
            fileDeleted: 'File deleted',
            messagesCleared: 'Messages cleared',
            urlCopied: 'URL copied to clipboard',
            failedCopy: 'Failed to copy URL',
            errorLoading: 'Error loading files',
            fileDeletedSuccess: 'File deleted successfully',
            errorDeleting: 'Error deleting file'
        }
    },
    zh: {
        sidebarTitle: '本地传输',
        networkInfo: '网络信息',
        serverIP: '服务器IP:',
        url: 'URL:',
        copyURL: '复制URL',
        mobileAccess: '移动访问',
        scanToAccess: '扫描二维码在移动设备上访问',
        files: '文件',
        total: '总数:',
        storage: '存储:',
        uploadFiles: '上传文件',
        dragDrop: '拖拽文件到此处',
        clickSelect: '或点击选择文件',
        selectFiles: '选择文件',
        messages: '消息',
        clearMessages: '清空消息',
        typeMessage: '输入消息...',
        filesTitle: '文件',
        refresh: '刷新',
        clearAll: '清空全部',
        uploadStatus: {
            uploading: '上传中: ',
            complete: '上传完成: ',
            failed: '上传失败: '
        },
        toast: {
            connected: '已连接到文件传输服务器',
            disconnected: '已断开服务器连接',
            newFile: '新文件已上传: ',
            fileDeleted: '文件已删除',
            messagesCleared: '消息已清空',
            urlCopied: 'URL已复制到剪贴板',
            failedCopy: '复制URL失败',
            errorLoading: '加载文件时出错',
            fileDeletedSuccess: '文件删除成功',
            errorDeleting: '删除文件时出错'
        }
    }
};

// Get current language from localStorage or default to Chinese
function getCurrentLanguage() {
    return localStorage.getItem('language') || 'zh';
}

// Set language
function setLanguage(lang) {
    localStorage.setItem('language', lang);
    applyLanguage(lang);
}

// Apply language to UI
function applyLanguage(lang) {
    const strings = LANGUAGES[lang];
    if (!strings) return;

    // Update sidebar title
    const sidebarTitle = document.querySelector('.sidebar-title');
    if (sidebarTitle) sidebarTitle.textContent = strings.sidebarTitle;

    // Update network info
    const networkInfo = document.querySelectorAll('.card h6.card-title');
    if (networkInfo[0]) networkInfo[0].textContent = strings.networkInfo;

    const serverIPLabels = document.querySelectorAll('.text-muted');
    if (serverIPLabels[0]) serverIPLabels[0].textContent = strings.serverIP;
    if (serverIPLabels[2]) serverIPLabels[2].textContent = strings.url;

    const copyBtn = document.getElementById('copy-url-btn');
    if (copyBtn) {
        copyBtn.innerHTML = `<i class="fas fa-copy me-2"></i>${strings.copyURL}`;
    }

    // Update mobile access
    if (networkInfo[1]) networkInfo[1].textContent = strings.mobileAccess;
    const scanText = document.querySelector('.card-body.text-center p.text-muted.small');
    if (scanText) scanText.textContent = strings.scanToAccess;

    // Update file stats
    if (networkInfo[2]) networkInfo[2].textContent = strings.files;
    const totalLabel = document.querySelector('.card-body .text-muted');
    if (totalLabel) totalLabel.textContent = strings.total;
    const storageLabel = document.querySelectorAll('.card-body .text-muted')[1];
    if (storageLabel) storageLabel.textContent = strings.storage;

    // Update upload section
    const uploadTitle = document.querySelector('.card-header h5');
    if (uploadTitle) uploadTitle.innerHTML = `<i class="fas fa-upload me-2"></i>${strings.uploadFiles}`;

    const dragDropText = document.querySelector('.upload-area h6.text-muted');
    if (dragDropText) dragDropText.textContent = strings.dragDrop;

    const clickText = document.querySelector('.upload-area p.text-muted.small');
    if (clickText) clickText.textContent = strings.clickSelect;

    const selectBtn = document.getElementById('select-files-btn');
    if (selectBtn) {
        selectBtn.innerHTML = `<i class="fas fa-folder-open me-2"></i>${strings.selectFiles}`;
    }

    // Update messages section
    const messageTitle = document.querySelectorAll('.card-header h5')[1];
    if (messageTitle) messageTitle.innerHTML = `<i class="fas fa-comments me-2"></i>${strings.messages}`;

    const clearMsgBtn = document.getElementById('clear-messages-btn');
    if (clearMsgBtn) clearMsgBtn.title = strings.clearMessages;

    const messageInput = document.getElementById('message-input');
    if (messageInput) messageInput.placeholder = strings.typeMessage;

    // Update files section
    const filesTitle = document.querySelectorAll('.card-header h5')[2];
    if (filesTitle) filesTitle.innerHTML = `<i class="fas fa-file-archive me-2"></i>${strings.filesTitle}`;

    const refreshBtn = document.getElementById('refresh-files-btn');
    if (refreshBtn) refreshBtn.title = strings.refresh;

    const clearAllBtn = document.getElementById('clear-all-files-btn');
    if (clearAllBtn) clearAllBtn.innerHTML = `<i class="fas fa-trash"></i> ${strings.clearAll}`;
}

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Apply current language on page load
    applyLanguage(getCurrentLanguage());
    
    initializeSocket();
    initializeEventListeners();
    loadInitialData();
    startPeriodicUpdates();
});

// Socket.IO initialization
function initializeSocket() {
    socket = io();
    
    socket.on('connect', function() {
        console.log('Connected to server');
        showToast('Connected to file transfer server', 'success');
    });
    
    socket.on('disconnect', function() {
        console.log('Disconnected from server');
        showToast('Disconnected from server', 'warning');
    });
    
    socket.on('new_message', function(message) {
        addMessage(message);
    });
    
    socket.on('file_uploaded', function(fileData) {
        addFileToList(fileData);
        updateFileStats();
        showToast(`New file uploaded: ${fileData.original_name}`, 'info');
    });
    
    socket.on('file_deleted', function(data) {
        removeFileFromList(data.filename);
        updateFileStats();
        showToast('File deleted', 'warning');
    });
    
    socket.on('messages_cleared', function() {
        clearMessages();
        showToast('Messages cleared', 'info');
    });
}

// Event listeners initialization
function initializeEventListeners() {
    // Language switch buttons
    const langButtons = document.querySelectorAll('.lang-btn');
    langButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Remove active class from all buttons
            langButtons.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            e.target.classList.add('active');
            // Set language
            setLanguage(e.target.dataset.lang);
        });
    });
    
    // Upload area events
    const uploadArea = document.getElementById('upload-area');
    const fileInput = document.getElementById('file-input');
    const selectFilesBtn = document.getElementById('select-files-btn');
    
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);
    
    // Only add click event for desktop, not mobile
    if (!isMobileDevice()) {
        uploadArea.addEventListener('click', (e) => {
            // Only trigger file input if not clicking on the select button
            if (!e.target.closest('.btn')) {
                fileInput.click();
            }
        });
    }
    
    selectFilesBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', handleFileSelect);
    
    // Message events
    const messageInput = document.getElementById('message-input');
    const sendMessageBtn = document.getElementById('send-message-btn');
    const clearMessagesBtn = document.getElementById('clear-messages-btn');
    
    sendMessageBtn.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    clearMessagesBtn.addEventListener('click', clearMessages);
    
    // Files events
    const refreshFilesBtn = document.getElementById('refresh-files-btn');
    const clearAllFilesBtn = document.getElementById('clear-all-files-btn');
    
    refreshFilesBtn.addEventListener('click', loadFiles);
    clearAllFilesBtn.addEventListener('click', clearAllFiles);
    
    // Copy URL button
    const copyUrlBtn = document.getElementById('copy-url-btn');
    copyUrlBtn.addEventListener('click', copyUrlToClipboard);
}

// Drag and drop handlers
function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    document.getElementById('upload-area').classList.add('drag-over');
}

function handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    document.getElementById('upload-area').classList.remove('drag-over');
}

function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    document.getElementById('upload-area').classList.remove('drag-over');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFiles(files);
    }
}

function handleFileSelect(e) {
    const files = e.target.files;
    if (files.length > 0) {
        handleFiles(files);
    }
    // Clear the input to allow selecting the same file again
    e.target.value = '';
}

// File upload functionality
async function handleFiles(files) {
    const uploadStatus = document.getElementById('upload-status');
    const uploadProgress = document.getElementById('upload-progress');
    const progressBar = uploadProgress.querySelector('.progress-bar');
    
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        uploadStatus.innerHTML = `<span class="text-info">Uploading: ${file.name}</span>`;
        uploadProgress.style.display = 'block';
        progressBar.style.width = '0%';
        
        try {
            const result = await uploadFile(file, (progress) => {
                progressBar.style.width = `${progress}%`;
            });
            uploadStatus.innerHTML = `<span class="text-success">Upload complete: ${file.name}</span>`;
            console.log('Upload successful:', result);
        } catch (error) {
            uploadStatus.innerHTML = `<span class="text-danger">Upload failed: ${file.name} - ${error.message}</span>`;
            console.error('Upload error:', error);
        }
        
        // Small delay between uploads
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    uploadProgress.style.display = 'none';
    uploadStatus.innerHTML = '';
}

async function uploadFile(file, onProgress) {
    return new Promise((resolve, reject) => {
        const formData = new FormData();
        formData.append('file', file);
        
        const xhr = new XMLHttpRequest();
        
        // Set timeout for upload
        xhr.timeout = 300000; // 5 minutes
        
        xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable && onProgress) {
                const percentComplete = (e.loaded / e.total) * 100;
                onProgress(Math.round(percentComplete));
            }
        });
        
        xhr.addEventListener('load', () => {
            try {
                if (xhr.status === 200) {
                    const response = JSON.parse(xhr.responseText);
                    if (response.success) {
                        resolve(response);
                    } else {
                        reject(new Error(response.error || 'Upload failed'));
                    }
                } else {
                    reject(new Error(`HTTP ${xhr.status}: ${xhr.statusText}`));
                }
            } catch (parseError) {
                reject(new Error('Failed to parse server response'));
            }
        });
        
        xhr.addEventListener('error', () => {
            reject(new Error('Network error during upload'));
        });
        
        xhr.addEventListener('timeout', () => {
            reject(new Error('Upload timeout'));
        });
        
        xhr.open('POST', '/upload');
        xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        xhr.send(formData);
    });
}

// Message functionality
function sendMessage() {
    const messageInput = document.getElementById('message-input');
    const message = messageInput.value.trim();
    
    if (message) {
        socket.emit('send_message', { text: message });
        messageInput.value = '';
    }
}

function addMessage(message) {
    const messageContainer = document.getElementById('message-container');
    const messageElement = document.createElement('div');
    messageElement.className = 'message-item';
    
    const time = new Date(message.timestamp).toLocaleTimeString();
    
    messageElement.innerHTML = `
        <div class="message-text">${escapeHtml(message.text)}</div>
        <div class="message-meta">Sent at ${time}</div>
    `;
    
    messageContainer.appendChild(messageElement);
    messageContainer.scrollTop = messageContainer.scrollHeight;
}

function clearMessages() {
    const messageContainer = document.getElementById('message-container');
    messageContainer.innerHTML = '';
    socket.emit('clear_messages');
}

// Files functionality
async function loadFiles() {
    try {
        const response = await fetch('/files');
        const files = await response.json();
        
        const filesList = document.getElementById('files-list');
        filesList.innerHTML = '';
        
        if (files.length === 0) {
            filesList.innerHTML = '<div class="text-muted text-center py-3">No files available</div>';
        } else {
            files.forEach(file => addFileToList(file, false));
        }
        
        updateFileStats();
    } catch (error) {
        console.error('Error loading files:', error);
        showToast('Error loading files', 'danger');
    }
}

function addFileToList(fileData, isNew = true) {
    const filesList = document.getElementById('files-list');
    
    // Check if file already exists
    const existingFile = filesList.querySelector(`[data-filename="${fileData.filename}"]`);
    if (existingFile && !isNew) return;
    
    const fileElement = document.createElement('div');
    fileElement.className = 'file-item';
    fileElement.setAttribute('data-filename', fileData.filename);
    
    const fileIcon = getFileIcon(fileData.original_name);
    const fileSize = formatFileSize(fileData.size);
    const time = new Date(fileData.uploaded_at).toLocaleString();
    
    fileElement.innerHTML = `
        <div class="file-info">
            <i class="fas ${fileIcon} file-icon"></i>
            <div class="file-details">
                <div class="file-name">${escapeHtml(fileData.original_name)}</div>
                <div class="file-meta">${fileSize} • Uploaded: ${time}</div>
            </div>
        </div>
        <div class="file-actions">
            <button class="btn btn-outline-primary btn-sm" onclick="previewFile('${fileData.filename}', '${escapeHtml(fileData.original_name)}')">
                <i class="fas fa-eye"></i> Preview
            </button>
            <button class="btn btn-primary btn-sm" onclick="downloadFile('${fileData.filename}')">
                <i class="fas fa-download"></i> Download
            </button>
            <button class="btn btn-outline-danger btn-sm" onclick="deleteFile('${fileData.filename}')">
                <i class="fas fa-trash"></i> Delete
            </button>
        </div>
    `;
    
    if (isNew) {
        filesList.prepend(fileElement);
    } else {
        filesList.appendChild(fileElement);
    }
}

function removeFileFromList(filename) {
    const fileElement = document.querySelector(`.file-item[data-filename="${filename}"]`);
    if (fileElement) {
        fileElement.remove();
    }
}

async function deleteFile(filename) {
    if (confirm('Are you sure you want to delete this file?')) {
        try {
            const response = await fetch(`/delete/${filename}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                showToast('File deleted successfully', 'success');
            } else {
                const error = await response.json();
                showToast(`Error: ${error.error}`, 'danger');
            }
        } catch (error) {
            console.error('Error deleting file:', error);
            showToast('Error deleting file', 'danger');
        }
    }
}

async function clearAllFiles() {
    if (confirm('Are you sure you want to delete all files?')) {
        const filesList = document.getElementById('files-list');
        const fileElements = filesList.querySelectorAll('.file-item');
        
        for (const fileElement of fileElements) {
            const filename = fileElement.getAttribute('data-filename');
            await deleteFile(filename);
        }
    }
}

function downloadFile(filename) {
    const link = document.createElement('a');
    link.href = `/download/${filename}`;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function previewFile(filename, originalName) {
    const modal = new bootstrap.Modal(document.getElementById('file-preview-modal'));
    const previewContent = document.getElementById('preview-content');
    
    // Determine file type and create appropriate preview
    const fileExtension = originalName.split('.').pop().toLowerCase();
    const isImage = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(fileExtension);
    const isText = ['txt', 'md', 'json', 'xml', 'html', 'css', 'js'].includes(fileExtension);
    
    if (isImage) {
        previewContent.innerHTML = `
            <div class="text-center">
                <img src="/download/${filename}" class="img-fluid" alt="${originalName}">
                <p class="mt-3 text-muted">File: ${originalName}</p>
            </div>
        `;
    } else if (isText) {
        // For text files, we could fetch and display content
        previewContent.innerHTML = `
            <div class="text-center">
                <i class="fas fa-file-alt fa-3x text-muted mb-3"></i>
                <p class="text-muted">Text file: ${originalName}</p>
                <a href="/download/${filename}" class="btn btn-primary">
                    <i class="fas fa-download me-2"></i>Download
                </a>
            </div>
        `;
    } else {
        previewContent.innerHTML = `
            <div class="text-center">
                <i class="fas fa-file fa-3x text-muted mb-3"></i>
                <p class="text-muted">File: ${originalName}</p>
                <a href="/download/${filename}" class="btn btn-primary">
                    <i class="fas fa-download me-2"></i>Download
                </a>
            </div>
        `;
    }
    
    modal.show();
}

// Utility functions
function getFileIcon(filename) {
    const extension = filename.split('.').pop().toLowerCase();
    
    const iconMap = {
        'jpg': 'fa-image', 'jpeg': 'fa-image', 'png': 'fa-image', 'gif': 'fa-image',
        'pdf': 'fa-file-pdf', 'doc': 'fa-file-word', 'docx': 'fa-file-word',
        'xls': 'fa-file-excel', 'xlsx': 'fa-file-excel', 'ppt': 'fa-file-powerpoint',
        'pptx': 'fa-file-powerpoint', 'txt': 'fa-file-alt', 'zip': 'fa-file-archive',
        'rar': 'fa-file-archive', '7z': 'fa-file-archive', 'mp4': 'fa-file-video',
        'avi': 'fa-file-video', 'mov': 'fa-file-video', 'mp3': 'fa-file-audio',
        'wav': 'fa-file-audio', 'json': 'fa-file-code', 'xml': 'fa-file-code'
    };
    
    return iconMap[extension] || 'fa-file';
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showToast(message, type = 'info') {
    const toast = document.getElementById('notification-toast');
    const toastMessage = document.getElementById('toast-message');
    const toastHeader = toast.querySelector('.toast-header');
    
    // Set message
    toastMessage.textContent = message;
    
    // Set type styling
    toastHeader.className = 'toast-header';
    toastMessage.className = '';
    
    if (type === 'success') {
        toastHeader.classList.add('text-success');
        toastMessage.classList.add('text-success');
    } else if (type === 'danger' || type === 'error') {
        toastHeader.classList.add('text-danger');
        toastMessage.classList.add('text-danger');
    } else if (type === 'warning') {
        toastHeader.classList.add('text-warning');
        toastMessage.classList.add('text-warning');
    }
    
    // Show toast
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();
}

function copyUrlToClipboard() {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
        showToast('URL copied to clipboard', 'success');
    }).catch(err => {
        console.error('Failed to copy URL:', err);
        showToast('Failed to copy URL', 'danger');
    });
}

function updateFileStats() {
    const filesList = document.getElementById('files-list');
    const fileCount = filesList.querySelectorAll('.file-item').length;
    const fileCountElement = document.getElementById('file-count');
    
    if (fileCountElement) {
        fileCountElement.textContent = fileCount;
    }
    
    // Calculate total storage
    const storageElement = document.getElementById('storage-used');
    if (storageElement) {
        let totalSize = 0;
        
        // Get all file meta elements that contain size information
        const fileMetaElements = filesList.querySelectorAll('.file-meta');
        
        fileMetaElements.forEach(metaElement => {
            const metaText = metaElement.textContent;
            // Extract size from text like "1.5 MB • Uploaded: ..."
            const sizeMatch = metaText.match(/([\d.]+\s*[KMGT]?B)/i);
            if (sizeMatch) {
                const sizeStr = sizeMatch[1];
                totalSize += parseFileSize(sizeStr);
            }
        });
        
        storageElement.textContent = formatFileSize(totalSize);
    }
}

// Helper function to parse file size strings
function parseFileSize(sizeStr) {
    const sizeMatch = sizeStr.match(/([\d.]+)\s*([KMGT]?B)/i);
    if (!sizeMatch) return 0;
    
    const value = parseFloat(sizeMatch[1]);
    const unit = sizeMatch[2].toUpperCase();
    
    const units = {
        'B': 1,
        'KB': 1024,
        'MB': 1024 * 1024,
        'GB': 1024 * 1024 * 1024,
        'TB': 1024 * 1024 * 1024 * 1024
    };
    
    return value * (units[unit] || 1);
}

async function loadInitialData() {
    // Load messages
    try {
        const response = await fetch('/messages');
        const messages = await response.json();
        
        const messageContainer = document.getElementById('message-container');
        messageContainer.innerHTML = '';
        
        messages.forEach(message => addMessage(message, false));
    } catch (error) {
        console.error('Error loading messages:', error);
    }
    
    // Load files
    await loadFiles();
}

function startPeriodicUpdates() {
    // Update file stats every 30 seconds
    setInterval(updateFileStats, 30000);
    
    // Refresh files list every 60 seconds
    setInterval(loadFiles, 60000);
}