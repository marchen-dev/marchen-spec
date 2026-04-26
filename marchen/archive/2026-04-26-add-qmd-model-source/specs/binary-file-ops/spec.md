### 需求: 文件下载 SHALL 支持 stream 写入和进度回调

`downloadFile(url, outputPath, options?)` 以 stream 方式将远程文件写入本地路径，避免大文件占满内存。

#### 场景: 正常下载带进度回调

- GIVEN 一个有效的远程 URL 和输出路径
- WHEN 调用 `downloadFile(url, outputPath, { onProgress })`
- THEN 文件以 stream 写入 outputPath
- AND onProgress 被多次调用，每次携带 `{ downloadedBytes, totalBytes }`
- AND 下载完成后文件内容与远程一致

#### 场景: 下载失败抛出 FileSystemError

- GIVEN 一个返回 HTTP 404 的 URL
- WHEN 调用 `downloadFile(url, outputPath)`
- THEN 抛出 `FileSystemError`

#### 场景: 自动创建父目录

- GIVEN outputPath 的父目录不存在
- WHEN 调用 `downloadFile(url, outputPath)`
- THEN 父目录被自动创建
- AND 文件正常写入

### 需求: SHA-256 校验 SHALL 返回十六进制哈希

`sha256File(path)` 以 stream 方式计算文件哈希，不将整个文件读入内存。

#### 场景: 计算已有文件的哈希

- GIVEN 一个存在的文件
- WHEN 调用 `sha256File(path)`
- THEN 返回 64 字符的十六进制 SHA-256 字符串

#### 场景: 文件不存在时抛出 FileSystemError

- GIVEN 一个不存在的路径
- WHEN 调用 `sha256File(path)`
- THEN 抛出 `FileSystemError`

### 需求: getFileSize SHALL 返回文件字节数

#### 场景: 获取已有文件大小

- GIVEN 一个存在的文件
- WHEN 调用 `getFileSize(path)`
- THEN 返回文件大小（字节数）

### 需求: removeFile SHALL 静默删除文件

#### 场景: 文件不存在时不报错

- GIVEN 一个不存在的路径
- WHEN 调用 `removeFile(path)`
- THEN 不抛出错误

### 需求: renameFile SHALL 移动文件并自动创建父目录

#### 场景: 目标父目录不存在时自动创建

- GIVEN 目标路径的父目录不存在
- WHEN 调用 `renameFile(src, dest)`
- THEN 父目录被自动创建
- AND 文件被移动到目标路径
