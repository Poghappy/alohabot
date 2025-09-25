# ByteBot 代码规范指南
*Cursor IDE Agent 团队代码质量标准*

## 🎯 代码规范概述

本项目采用统一的代码规范，覆盖前端 (TypeScript/React)、后端 (Node.js/NestJS) 和桌面端 (Rust/Tauri) 的代码质量标准。

## 📋 工具链配置

### 核心工具
- **ESLint**: 代码质量检查
- **Prettier**: 代码格式化
- **TypeScript**: 类型检查 (严格模式)
- **Husky**: Git hooks 管理
- **lint-staged**: 增量代码检查
- **commitlint**: 提交信息规范

### Rust 工具
- **rustfmt**: 代码格式化
- **clippy**: 代码质量检查 (警告视为错误)
- **cargo test**: 单元测试

## 🔧 TypeScript 规范

### 基础配置
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

### 命名规范
```typescript
// ✅ 正确示例
// 变量和函数: camelCase
const userName = 'john';
const getUserData = () => {};

// 类和接口: PascalCase
class UserManager {}
interface UserProfile {}

// 常量: UPPER_SNAKE_CASE
const API_BASE_URL = 'https://api.example.com';
const MAX_RETRY_COUNT = 3;

// 类型别名: PascalCase
type UserRole = 'admin' | 'user' | 'guest';

// 枚举: PascalCase
enum UserStatus {
    Active = 'active',
    Inactive = 'inactive',
    Pending = 'pending',
}
```

### 类型定义最佳实践
```typescript
// ✅ 优先使用接口
interface User {
    id: string;
    name: string;
    email: string;
    createdAt: Date;
}

// ✅ 使用泛型提高复用性
interface ApiResponse<T> {
    data: T;
    message: string;
    success: boolean;
}

// ✅ 使用联合类型
type Theme = 'light' | 'dark' | 'auto';

// ✅ 使用可选属性
interface CreateUserRequest {
    name: string;
    email: string;
    avatar?: string;
}

// ❌ 避免使用 any
// const data: any = fetchData(); // 不推荐

// ✅ 使用具体类型或 unknown
const data: User = fetchUserData();
const unknownData: unknown = fetchData();
```

### 函数规范
```typescript
// ✅ 明确的返回类型
function calculateTotal(items: CartItem[]): number {
    return items.reduce((sum, item) => sum + item.price, 0);
}

// ✅ 异步函数类型
async function fetchUser(id: string): Promise<User | null> {
    try {
        const response = await api.get(`/users/${id}`);
        return response.data;
    } catch (error) {
        console.error('Failed to fetch user:', error);
        return null;
    }
}

// ✅ 箭头函数 (简短逻辑)
const formatCurrency = (amount: number): string => 
    new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(amount);
```

## ⚛️ React 组件规范

### 组件结构
```typescript
// ✅ 组件文件结构
import React, { useState, useEffect } from 'react';
import { SomeExternalLibrary } from 'external-lib';
import { InternalComponent } from '../components';
import { useCustomHook } from '../hooks';
import { ApiService } from '../services';
import type { User, UserProps } from '../types';

// Props 接口定义
interface UserCardProps {
    user: User;
    onEdit?: (user: User) => void;
    className?: string;
    showActions?: boolean;
}

// 组件实现
const UserCard: React.FC<UserCardProps> = ({
    user,
    onEdit,
    className = '',
    showActions = true,
}) => {
    const [isLoading, setIsLoading] = useState(false);
    
    const handleEdit = () => {
        if (onEdit) {
            onEdit(user);
        }
    };
    
    return (
        <div className={`user-card ${className}`}>
            <h3>{user.name}</h3>
            <p>{user.email}</p>
            {showActions && (
                <button onClick={handleEdit} disabled={isLoading}>
                    Edit
                </button>
            )}
        </div>
    );
};

export default UserCard;
```

### Hooks 规范
```typescript
// ✅ 自定义 Hook
import { useState, useEffect } from 'react';

interface UseApiOptions<T> {
    initialData?: T;
    onError?: (error: Error) => void;
}

function useApi<T>(
    url: string,
    options: UseApiOptions<T> = {}
): {
    data: T | null;
    loading: boolean;
    error: Error | null;
    refetch: () => void;
} {
    const [data, setData] = useState<T | null>(options.initialData || null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    
    const fetchData = async () => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await fetch(url);
            const result = await response.json();
            setData(result);
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Unknown error');
            setError(error);
            options.onError?.(error);
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        fetchData();
    }, [url]);
    
    return { data, loading, error, refetch: fetchData };
}
```

## 🦀 Rust 代码规范

### 基础格式化
```rust
// rustfmt 配置 (rustfmt.toml)
edition = "2021"
max_width = 100
tab_spaces = 4
newline_style = "Unix"
use_small_heuristics = "Default"
```

### 命名规范
```rust
// ✅ 正确示例
// 函数和变量: snake_case
fn calculate_total() -> i32 {}
let user_name = "john";

// 结构体和枚举: PascalCase
struct UserProfile {
    id: String,
    name: String,
}

enum UserStatus {
    Active,
    Inactive,
    Pending,
}

// 常量: UPPER_SNAKE_CASE
const MAX_CONNECTIONS: usize = 100;
const API_VERSION: &str = "v1";

// 模块: snake_case
mod user_service;
mod api_client;
```

### 错误处理
```rust
// ✅ 使用 Result 类型
use std::error::Error;
use std::fmt;

#[derive(Debug)]
struct CustomError {
    message: String,
}

impl fmt::Display for CustomError {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "{}", self.message)
    }
}

impl Error for CustomError {}

fn process_data(input: &str) -> Result<String, CustomError> {
    if input.is_empty() {
        return Err(CustomError {
            message: "Input cannot be empty".to_string(),
        });
    }
    
    Ok(input.to_uppercase())
}

// ✅ 错误传播
fn main() -> Result<(), Box<dyn Error>> {
    let result = process_data("hello")?;
    println!("Result: {}", result);
    Ok(())
}
```

### Clippy 配置
```toml
# Cargo.toml
[lints.clippy]
# 警告视为错误
all = "deny"
pedantic = "warn"
nursery = "warn"

# 允许的 lint
too_many_arguments = "allow"
module_name_repetitions = "allow"
```

## 📝 提交信息规范

### Conventional Commits 格式
```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### 提交类型
- **feat**: 新功能
- **fix**: 修复问题
- **docs**: 文档变更
- **style**: 代码格式化
- **refactor**: 代码重构
- **perf**: 性能优化
- **test**: 测试相关
- **chore**: 构建过程或辅助工具的变动

### 示例
```bash
# ✅ 正确示例
feat(auth): add user login functionality
fix(api): resolve memory leak in chat service
docs(readme): update installation instructions
style(ui): format button component code
refactor(core): extract common utility functions
perf(db): optimize user query performance
test(auth): add unit tests for login service
chore(deps): update dependencies to latest versions

# ❌ 错误示例
Add login feature          # 缺少类型
fix: bug                   # 描述不清晰
FEAT: new feature          # 类型大写
feat(): add feature        # 空范围
```

## 🛠️ 常用修复命令

### 代码格式化
```bash
# 格式化所有文件
npm run format

# 格式化特定文件
npx prettier --write src/components/Button.tsx

# 检查格式化状态
npx prettier --check .
```

### ESLint 检查和修复
```bash
# 检查所有文件
npm run lint

# 修复可自动修复的问题
npm run lint -- --fix

# 检查特定文件
npx eslint src/components/Button.tsx

# 修复特定文件
npx eslint src/components/Button.tsx --fix
```

### TypeScript 类型检查
```bash
# 类型检查
npm run type-check

# 监听模式类型检查
npx tsc --noEmit --watch

# 检查特定项目
npx tsc --noEmit --project packages/ui/tsconfig.json
```

### Rust 代码检查
```bash
# 格式化 Rust 代码
cargo fmt

# 检查格式化状态
cargo fmt -- --check

# Clippy 检查
cargo clippy

# Clippy 检查 (警告视为错误)
cargo clippy -- -D warnings

# 运行测试
cargo test
```

### Git Hooks 测试
```bash
# 测试 pre-commit hook
npm run lint-staged

# 测试 commit-msg hook
echo "feat: test commit" | npx commitlint

# 跳过 hooks (紧急情况)
git commit --no-verify -m "emergency fix"
```

## 🔍 代码审查检查清单

### 通用检查
- [ ] 代码符合项目命名规范
- [ ] 没有 console.log 或调试代码
- [ ] 错误处理完整
- [ ] 类型定义准确
- [ ] 注释清晰有用
- [ ] 性能考虑合理

### TypeScript/React 检查
- [ ] 组件 Props 有类型定义
- [ ] 避免使用 any 类型
- [ ] Hooks 使用正确
- [ ] 状态管理合理
- [ ] 副作用处理正确

### Rust 检查
- [ ] 错误处理使用 Result
- [ ] 内存安全
- [ ] 并发安全
- [ ] 性能优化
- [ ] 文档注释完整

## 📊 代码质量指标

### 自动化检查
- **ESLint**: 0 errors, < 10 warnings
- **TypeScript**: 0 type errors
- **Prettier**: 100% 格式化一致性
- **Clippy**: 0 warnings (deny mode)
- **测试覆盖率**: > 80%

### 手动检查
- **可读性**: 代码易于理解
- **可维护性**: 结构清晰，职责分明
- **可测试性**: 易于编写测试
- **性能**: 无明显性能问题
- **安全性**: 无安全漏洞

## 🔄 持续改进

### 定期更新
- **每月**: 更新 ESLint/Prettier 规则
- **每季度**: 评估新的最佳实践
- **每半年**: 重新评估工具链
- **每年**: 全面审查代码规范

### 团队培训
- **新人入职**: 代码规范培训
- **定期分享**: 最佳实践分享
- **代码审查**: 持续改进代码质量
- **工具更新**: 及时学习新工具

---

> **文档版本**: v1.0  
> **最后更新**: 2025年9月25日  
> **负责团队**: Cursor IDE Agent 团队  
> **下次评审**: 2025年12月25日
