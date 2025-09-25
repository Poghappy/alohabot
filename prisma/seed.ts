import { PrismaClient, UserRole, UserStatus } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 开始数据库种子数据初始化...');

    // 清理现有数据 (开发环境)
    if (process.env.NODE_ENV === 'development') {
        console.log('🧹 清理现有数据...');
        await prisma.auditLog.deleteMany();
        await prisma.file.deleteMany();
        await prisma.task.deleteMany();
        await prisma.message.deleteMany();
        await prisma.conversation.deleteMany();
        await prisma.apiKey.deleteMany();
        await prisma.session.deleteMany();
        await prisma.systemConfig.deleteMany();
        await prisma.user.deleteMany();
    }

    // 创建系统管理员用户
    console.log('👤 创建系统管理员用户...');
    const adminUser = await prisma.user.create({
        data: {
            email: 'admin@bytebot.ai',
            name: 'ByteBot Admin',
            role: UserRole.ADMIN,
            status: UserStatus.ACTIVE,
        },
    });

    // 创建测试用户
    console.log('👤 创建测试用户...');
    const testUser = await prisma.user.create({
        data: {
            email: 'test@bytebot.ai',
            name: 'Test User',
            role: UserRole.USER,
            status: UserStatus.ACTIVE,
        },
    });

    // 创建系统配置
    console.log('⚙️ 创建系统配置...');
    const systemConfigs = [
        {
            key: 'app.name',
            value: 'ByteBot',
            description: '应用名称',
            category: 'app',
            isPublic: true,
        },
        {
            key: 'app.version',
            value: '1.0.0',
            description: '应用版本',
            category: 'app',
            isPublic: true,
        },
        {
            key: 'ai.default_model',
            value: 'gpt-4',
            description: '默认 AI 模型',
            category: 'ai',
            isPublic: false,
        },
        {
            key: 'ai.default_provider',
            value: 'openai',
            description: '默认 AI 提供商',
            category: 'ai',
            isPublic: false,
        },
        {
            key: 'ai.max_tokens',
            value: 4000,
            description: '最大 token 数量',
            category: 'ai',
            isPublic: false,
        },
        {
            key: 'ai.temperature',
            value: 0.7,
            description: '默认温度参数',
            category: 'ai',
            isPublic: false,
        },
        {
            key: 'security.jwt_expires_in',
            value: '7d',
            description: 'JWT 过期时间',
            category: 'security',
            isPublic: false,
        },
        {
            key: 'security.max_login_attempts',
            value: 5,
            description: '最大登录尝试次数',
            category: 'security',
            isPublic: false,
        },
        {
            key: 'features.file_upload_enabled',
            value: true,
            description: '是否启用文件上传',
            category: 'features',
            isPublic: true,
        },
        {
            key: 'features.max_file_size',
            value: 10485760, // 10MB
            description: '最大文件大小 (bytes)',
            category: 'features',
            isPublic: true,
        },
    ];

    for (const config of systemConfigs) {
        await prisma.systemConfig.create({
            data: config,
        });
    }

    // 创建示例对话
    console.log('💬 创建示例对话...');
    const conversation = await prisma.conversation.create({
        data: {
            userId: testUser.id,
            title: '欢迎使用 ByteBot',
            description: '这是一个示例对话',
            model: 'gpt-4',
            provider: 'openai',
            messageCount: 2,
        },
    });

    // 创建示例消息
    console.log('📝 创建示例消息...');
    await prisma.message.createMany({
        data: [
            {
                conversationId: conversation.id,
                role: 'USER',
                content: '你好，ByteBot！',
                tokenCount: 10,
            },
            {
                conversationId: conversation.id,
                role: 'ASSISTANT',
                content:
                    '你好！欢迎使用 ByteBot 桌面智能体。我是你的 AI 助手，可以帮助你完成各种任务，包括代码编写、文件管理、系统操作等。有什么我可以帮助你的吗？',
                tokenCount: 50,
                model: 'gpt-4',
                provider: 'openai',
                processingTime: 1500,
            },
        ],
    });

    // 更新对话的最后消息时间
    await prisma.conversation.update({
        where: { id: conversation.id },
        data: {
            lastMessageAt: new Date(),
            tokenUsage: 60,
        },
    });

    // 创建示例任务
    console.log('📋 创建示例任务...');
    await prisma.task.createMany({
        data: [
            {
                userId: testUser.id,
                type: 'file_analysis',
                title: '分析项目结构',
                description: '分析 ByteBot 项目的目录结构和文件组织',
                input: {
                    path: '/workspace/bytebot-ecosystem',
                    recursive: true,
                },
                status: 'COMPLETED',
                progress: 100,
                startedAt: new Date(Date.now() - 60000),
                completedAt: new Date(),
                output: {
                    fileCount: 156,
                    directoryCount: 23,
                    totalSize: 2048576,
                },
            },
            {
                userId: testUser.id,
                type: 'code_generation',
                title: '生成 API 接口',
                description: '为用户管理模块生成 RESTful API 接口',
                input: {
                    module: 'user',
                    operations: ['create', 'read', 'update', 'delete'],
                },
                status: 'PENDING',
                progress: 0,
            },
        ],
    });

    // 创建审计日志
    console.log('📊 创建审计日志...');
    await prisma.auditLog.createMany({
        data: [
            {
                userId: adminUser.id,
                action: 'user.create',
                resource: 'User',
                resourceId: testUser.id,
                method: 'POST',
                path: '/api/users',
                newData: {
                    email: testUser.email,
                    name: testUser.name,
                    role: testUser.role,
                },
                success: true,
            },
            {
                userId: testUser.id,
                action: 'conversation.create',
                resource: 'Conversation',
                resourceId: conversation.id,
                method: 'POST',
                path: '/api/conversations',
                newData: {
                    title: conversation.title,
                    model: conversation.model,
                },
                success: true,
            },
        ],
    });

    console.log('✅ 数据库种子数据初始化完成！');
    console.log(`👤 创建了 ${await prisma.user.count()} 个用户`);
    console.log(`💬 创建了 ${await prisma.conversation.count()} 个对话`);
    console.log(`📝 创建了 ${await prisma.message.count()} 条消息`);
    console.log(`📋 创建了 ${await prisma.task.count()} 个任务`);
    console.log(`⚙️ 创建了 ${await prisma.systemConfig.count()} 个系统配置`);
    console.log(`📊 创建了 ${await prisma.auditLog.count()} 条审计日志`);
}

main()
    .catch((e) => {
        console.error('❌ 种子数据初始化失败:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
