# Git 版本控制操作指南

## 🎯 概述

本项目已配置 Git 版本控制，用于定期保存历史版本。本文档介绍日常开发中的 Git 操作流程。

## 📋 日常操作流程

### 1. 查看当前状态

```bash
git status
```

- 查看哪些文件被修改
- 查看哪些文件已暂存
- 查看哪些文件未跟踪

### 2. 查看修改内容

```bash
# 查看所有修改
git diff

# 查看已暂存的修改
git diff --cached

# 查看特定文件的修改
git diff src/pages/Home/index.tsx
```

### 3. 添加文件到暂存区

```bash
# 添加所有修改的文件
git add .

# 添加特定文件
git add src/pages/Home/index.tsx

# 添加特定类型文件
git add *.tsx
```

### 4. 提交更改

```bash
# 提交所有暂存的更改
git commit -m "描述你的更改"

# 跳过代码检查直接提交（如果遇到pre-commit错误）
git commit --no-verify -m "描述你的更改"
```

### 5. 查看提交历史

```bash
# 查看简洁的提交历史
git log --oneline

# 查看详细的提交历史
git log

# 查看最近5次提交
git log -5
```

## 🔄 版本管理操作

### 创建新版本（推荐方式）

```bash
# 1. 查看当前状态
git status

# 2. 添加所有更改
git add .

# 3. 提交更改
git commit -m "feat: 添加新功能 - 描述具体功能"
```

### 推荐的提交信息格式

```bash
# 功能新增
git commit -m "feat: 添加用户登录功能"

# 功能修复
git commit -m "fix: 修复登录页面样式问题"

# 文档更新
git commit -m "docs: 更新README文档"

# 代码重构
git commit -m "refactor: 重构用户管理模块"

# 性能优化
git commit -m "perf: 优化页面加载速度"
```

## 📅 定期保存策略

### 每日保存

```bash
# 每天工作结束时
git add .
git commit -m "daily: $(date +%Y-%m-%d) 日常开发进度"
```

### 功能完成保存

```bash
# 完成一个功能模块后
git add .
git commit -m "feat: 完成作业列表功能模块"
```

### 重要节点保存

```bash
# 重要里程碑
git add .
git commit -m "milestone: 完成用户认证系统 v1.0"
```

## 🔍 查看和回退

### 查看特定版本

```bash
# 查看提交历史
git log --oneline

# 查看特定提交的详细信息
git show <commit-hash>
```

### 回退到之前的版本

```bash
# 回退到上一个版本（保留修改）
git reset --soft HEAD~1

# 回退到上一个版本（丢弃修改）
git reset --hard HEAD~1

# 回退到特定版本
git reset --hard <commit-hash>
```

### 创建标签（重要版本）

```bash
# 创建标签
git tag v1.0.0

# 创建带注释的标签
git tag -a v1.0.0 -m "第一个正式版本"

# 查看所有标签
git tag
```

## 🛠️ 分支管理

### 创建新分支

```bash
# 创建并切换到新分支
git checkout -b feature/new-feature

# 或者使用新命令
git switch -c feature/new-feature
```

### 切换分支

```bash
# 切换到主分支
git checkout master

# 或者使用新命令
git switch master
```

### 合并分支

```bash
# 切换到主分支
git checkout master

# 合并功能分支
git merge feature/new-feature
```

## 📊 常用命令速查

| 命令                      | 说明             |
| ------------------------- | ---------------- |
| `git status`              | 查看仓库状态     |
| `git add .`               | 添加所有更改     |
| `git commit -m "消息"`    | 提交更改         |
| `git log --oneline`       | 查看提交历史     |
| `git diff`                | 查看修改内容     |
| `git checkout <文件>`     | 撤销文件修改     |
| `git reset --hard HEAD~1` | 回退到上一个版本 |

## ⚠️ 注意事项

1. **定期提交**: 建议每天至少提交一次，避免丢失工作
2. **清晰的提交信息**: 使用描述性的提交信息，便于后续查看
3. **重要版本打标签**: 对于重要的里程碑版本，建议创建标签
4. **备份重要数据**: 虽然 Git 可以回退，但重要数据建议额外备份

## 🚀 快速开始

### 第一次使用

```bash
# 1. 查看当前状态
git status

# 2. 添加所有文件
git add .

# 3. 创建第一个提交
git commit -m "Initial commit: 项目初始化"
```

### 日常开发流程

```bash
# 1. 开始开发前查看状态
git status

# 2. 开发完成后添加更改
git add .

# 3. 提交更改
git commit -m "feat: 描述你的更改"

# 4. 查看提交历史
git log --oneline
```

## 📞 遇到问题

如果遇到 Git 相关问题：

1. **权限问题**: 确保已配置安全目录
2. **提交失败**: 尝试使用 `--no-verify` 参数
3. **文件冲突**: 手动解决冲突后重新提交
4. **误删文件**: 使用 `git checkout <文件>` 恢复

---

**提示**: 建议每天工作结束时进行一次提交，这样可以保证你的工作进度得到保存！
