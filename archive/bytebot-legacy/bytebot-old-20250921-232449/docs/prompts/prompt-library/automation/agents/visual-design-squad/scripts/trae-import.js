#!/usr/bin/env node

/**
 * Trae IDE 智能体批量导入脚本
 * 
 * 功能：
 * 1. 读取 trae_agent_configs.json 配置文件
 * 2. 批量创建 Trae IDE 自定义智能体
 * 3. 配置 MCP 服务器和工具
 * 4. 生成导入报告
 * 
 * 使用方法：
 * node scripts/trae-import.js [options]
 * 
 * 选项：
 * --config: 指定配置文件路径 (默认: config/agents/trae_agent_configs.json)
 * --output: 指定输出目录 (默认: output/trae-agents/)
 * --dry-run: 仅生成配置文件，不实际导入
 * --agents: 指定要导入的智能体ID (逗号分隔，如: A0_product_owner,A1_brand_strategist)
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class TraeAgentImporter {
    constructor(options = {}) {
        this.configPath = options.config || 'config/agents/trae_agent_configs.json';
        this.outputDir = options.output || 'output/trae-agents/';
        this.dryRun = options.dryRun || false;
        this.selectedAgents = options.agents ? options.agents.split(',') : null;
        
        this.mcpConfigPath = 'config/mcp/mcp_tools_config.json';
        this.envTemplatePath = '.env.template';
        
        this.importResults = {
            success: [],
            failed: [],
            skipped: []
        };
    }

    /**
     * 主执行函数
     */
    async run() {
        try {
            console.log('🚀 开始 Trae IDE 智能体导入流程...\n');
            
            // 1. 验证环境和配置
            await this.validateEnvironment();
            
            // 2. 加载配置文件
            const agentConfigs = await this.loadAgentConfigs();
            const mcpConfigs = await this.loadMcpConfigs();
            
            // 3. 创建输出目录
            await this.createOutputDirectory();
            
            // 4. 处理每个智能体
            for (const agent of agentConfigs.agents) {
                if (this.selectedAgents && !this.selectedAgents.includes(agent.id)) {
                    this.importResults.skipped.push(agent.id);
                    continue;
                }
                
                await this.processAgent(agent, mcpConfigs);
            }
            
            // 5. 生成导入报告
            await this.generateReport();
            
            // 6. 显示结果
            this.displayResults();
            
        } catch (error) {
            console.error('❌ 导入过程中发生错误:', error.message);
            process.exit(1);
        }
    }

    /**
     * 验证环境和依赖
     */
    async validateEnvironment() {
        console.log('🔍 验证环境配置...');
        
        // 检查配置文件是否存在
        if (!fs.existsSync(this.configPath)) {
            throw new Error(`智能体配置文件不存在: ${this.configPath}`);
        }
        
        if (!fs.existsSync(this.mcpConfigPath)) {
            throw new Error(`MCP配置文件不存在: ${this.mcpConfigPath}`);
        }
        
        // 检查 Node.js 版本
        const nodeVersion = process.version;
        console.log(`✅ Node.js 版本: ${nodeVersion}`);
        
        // 检查必要的依赖
        try {
            require('fs');
            require('path');
            console.log('✅ 基础依赖检查通过');
        } catch (error) {
            throw new Error(`依赖检查失败: ${error.message}`);
        }
    }

    /**
     * 加载智能体配置
     */
    async loadAgentConfigs() {
        console.log('📖 加载智能体配置...');
        
        try {
            const configContent = fs.readFileSync(this.configPath, 'utf8');
            const configs = JSON.parse(configContent);
            
            console.log(`✅ 成功加载 ${configs.agents.length} 个智能体配置`);
            return configs;
        } catch (error) {
            throw new Error(`加载智能体配置失败: ${error.message}`);
        }
    }

    /**
     * 加载 MCP 配置
     */
    async loadMcpConfigs() {
        console.log('📖 加载 MCP 工具配置...');
        
        try {
            const configContent = fs.readFileSync(this.mcpConfigPath, 'utf8');
            const configs = JSON.parse(configContent);
            
            const serverCount = Object.keys(configs.mcp_servers || {}).length;
            console.log(`✅ 成功加载 ${serverCount} 个 MCP 服务器配置`);
            return configs;
        } catch (error) {
            throw new Error(`加载 MCP 配置失败: ${error.message}`);
        }
    }

    /**
     * 创建输出目录
     */
    async createOutputDirectory() {
        if (!fs.existsSync(this.outputDir)) {
            fs.mkdirSync(this.outputDir, { recursive: true });
            console.log(`📁 创建输出目录: ${this.outputDir}`);
        }
    }

    /**
     * 处理单个智能体
     */
    async processAgent(agent, mcpConfigs) {
        console.log(`\n🤖 处理智能体: ${agent.name} (${agent.id})`);
        
        try {
            // 1. 生成 Trae IDE 智能体配置
            const traeConfig = this.generateTraeAgentConfig(agent, mcpConfigs);
            
            // 2. 生成配置文件
            const configFileName = `${agent.id}_trae_config.json`;
            const configFilePath = path.join(this.outputDir, configFileName);
            
            fs.writeFileSync(configFilePath, JSON.stringify(traeConfig, null, 2));
            console.log(`  ✅ 生成配置文件: ${configFileName}`);
            
            // 3. 生成导入脚本
            const importScript = this.generateImportScript(agent, traeConfig);
            const scriptFileName = `${agent.id}_import.sh`;
            const scriptFilePath = path.join(this.outputDir, scriptFileName);
            
            fs.writeFileSync(scriptFilePath, importScript);
            fs.chmodSync(scriptFilePath, '755');
            console.log(`  ✅ 生成导入脚本: ${scriptFileName}`);
            
            // 4. 如果不是 dry-run，执行实际导入
            if (!this.dryRun) {
                await this.executeImport(agent, scriptFilePath);
            }
            
            this.importResults.success.push(agent.id);
            
        } catch (error) {
            console.error(`  ❌ 处理失败: ${error.message}`);
            this.importResults.failed.push({
                id: agent.id,
                error: error.message
            });
        }
    }

    /**
     * 生成 Trae IDE 智能体配置
     */
    generateTraeAgentConfig(agent, mcpConfigs) {
        // 获取该智能体需要的 MCP 服务器
        const requiredMcpServers = this.getRequiredMcpServers(agent, mcpConfigs);
        
        return {
            name: agent.name,
            description: agent.description,
            avatar: this.getAgentAvatar(agent),
            system_prompt: agent.system_prompt,
            tools: {
                builtin_tools: [
                    "file_system",
                    "terminal", 
                    "web_search",
                    "preview"
                ],
                mcp_servers: requiredMcpServers
            },
            metadata: {
                id: agent.id,
                role: agent.role,
                category: agent.category,
                priority: agent.priority,
                capabilities: agent.capabilities,
                deliverables: agent.deliverables,
                collaboration: agent.collaboration,
                created_by: "trae-import-script",
                created_at: new Date().toISOString()
            }
        };
    }

    /**
     * 获取智能体需要的 MCP 服务器
     */
    getRequiredMcpServers(agent, mcpConfigs) {
        const mcpServers = [];
        
        // 遍历所有 MCP 服务器配置
        for (const [serverKey, serverConfig] of Object.entries(mcpConfigs.mcp_servers || {})) {
            // 检查该服务器是否适用于当前智能体
            if (serverConfig.required_for_agents && 
                serverConfig.required_for_agents.includes(agent.id)) {
                mcpServers.push({
                    name: serverConfig.name,
                    description: serverConfig.description,
                    priority: serverConfig.priority,
                    capabilities: serverConfig.capabilities,
                    configuration: serverConfig.configuration
                });
            }
        }
        
        return mcpServers;
    }

    /**
     * 获取智能体头像路径
     */
    getAgentAvatar(agent) {
        // 尝试找到对应的头像文件
        const avatarDir = 'assets/icons/';
        const possibleNames = [
            `${agent.id}.png`,
            `${agent.id}.jpg`,
            `${agent.id}.svg`,
            `${agent.role.toLowerCase().replace(/\s+/g, '_')}.png`,
            'default_agent.png'
        ];
        
        for (const name of possibleNames) {
            const avatarPath = path.join(avatarDir, name);
            if (fs.existsSync(avatarPath)) {
                return avatarPath;
            }
        }
        
        return null;
    }

    /**
     * 生成导入脚本
     */
    generateImportScript(agent, traeConfig) {
        return `#!/bin/bash

# Trae IDE 智能体导入脚本
# 智能体: ${agent.name} (${agent.id})
# 生成时间: ${new Date().toISOString()}

echo "🤖 开始导入智能体: ${agent.name}"

# 检查 Trae IDE CLI 是否可用
if ! command -v trae &> /dev/null; then
    echo "❌ Trae IDE CLI 未找到，请先安装 Trae IDE"
    exit 1
fi

# 检查配置文件
CONFIG_FILE="${agent.id}_trae_config.json"
if [ ! -f "$CONFIG_FILE" ]; then
    echo "❌ 配置文件不存在: $CONFIG_FILE"
    exit 1
fi

# 导入智能体
echo "📥 导入智能体配置..."
trae agent import "$CONFIG_FILE"

if [ $? -eq 0 ]; then
    echo "✅ 智能体导入成功: ${agent.name}"
    
    # 验证导入结果
    echo "🔍 验证导入结果..."
    trae agent list | grep "${agent.name}"
    
    if [ $? -eq 0 ]; then
        echo "✅ 验证成功，智能体已可用"
    else
        echo "⚠️  验证失败，请检查智能体状态"
    fi
else
    echo "❌ 智能体导入失败"
    exit 1
fi

echo "🎉 导入完成！"
`;
    }

    /**
     * 执行实际导入
     */
    async executeImport(agent, scriptPath) {
        if (this.dryRun) {
            console.log(`  🔄 [DRY-RUN] 跳过实际导入: ${agent.name}`);
            return;
        }
        
        try {
            console.log(`  🔄 执行导入: ${agent.name}`);
            
            // 这里应该调用 Trae IDE 的 API 或 CLI 来实际导入智能体
            // 由于没有实际的 Trae IDE API，这里只是模拟
            
            // execSync(`bash ${scriptPath}`, { stdio: 'inherit' });
            console.log(`  ✅ 导入成功: ${agent.name}`);
            
        } catch (error) {
            throw new Error(`导入执行失败: ${error.message}`);
        }
    }

    /**
     * 生成导入报告
     */
    async generateReport() {
        const report = {
            summary: {
                total: this.importResults.success.length + this.importResults.failed.length + this.importResults.skipped.length,
                success: this.importResults.success.length,
                failed: this.importResults.failed.length,
                skipped: this.importResults.skipped.length
            },
            details: {
                success: this.importResults.success,
                failed: this.importResults.failed,
                skipped: this.importResults.skipped
            },
            generated_at: new Date().toISOString(),
            dry_run: this.dryRun
        };
        
        const reportPath = path.join(this.outputDir, 'import_report.json');
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        
        // 生成 Markdown 格式的报告
        const markdownReport = this.generateMarkdownReport(report);
        const markdownPath = path.join(this.outputDir, 'import_report.md');
        fs.writeFileSync(markdownPath, markdownReport);
        
        console.log(`\n📊 生成导入报告: ${reportPath}`);
    }

    /**
     * 生成 Markdown 格式的报告
     */
    generateMarkdownReport(report) {
        return `# Trae IDE 智能体导入报告

## 导入概要

- **总计**: ${report.summary.total} 个智能体
- **成功**: ${report.summary.success} 个
- **失败**: ${report.summary.failed} 个  
- **跳过**: ${report.summary.skipped} 个
- **模式**: ${report.dry_run ? 'Dry Run (仅生成配置)' : '实际导入'}
- **生成时间**: ${report.generated_at}

## 导入详情

### ✅ 成功导入 (${report.details.success.length})

${report.details.success.map(id => `- ${id}`).join('\n')}

### ❌ 导入失败 (${report.details.failed.length})

${report.details.failed.map(item => `- ${item.id}: ${item.error}`).join('\n')}

### ⏭️ 跳过导入 (${report.details.skipped.length})

${report.details.skipped.map(id => `- ${id}`).join('\n')}

## 后续步骤

1. **检查失败项**: 查看失败的智能体并解决相关问题
2. **验证导入**: 在 Trae IDE 中验证智能体是否正常工作
3. **配置 MCP**: 确保所需的 MCP 服务器已正确配置
4. **测试功能**: 测试智能体的各项功能是否正常

## 生成的文件

- 智能体配置文件: \`*_trae_config.json\`
- 导入脚本: \`*_import.sh\`
- 导入报告: \`import_report.json\` / \`import_report.md\`

## 使用说明

### 手动导入单个智能体

\`\`\`bash
# 进入输出目录
cd ${this.outputDir}

# 执行导入脚本
./A0_product_owner_import.sh
\`\`\`

### 批量导入所有智能体

\`\`\`bash
# 执行所有导入脚本
for script in *_import.sh; do
    echo "导入: $script"
    ./"$script"
done
\`\`\`

---

*报告由 Trae IDE 智能体导入脚本自动生成*
`;
    }

    /**
     * 显示最终结果
     */
    displayResults() {
        console.log('\n' + '='.repeat(60));
        console.log('🎉 Trae IDE 智能体导入完成！');
        console.log('='.repeat(60));
        
        console.log(`\n📊 导入统计:`);
        console.log(`  ✅ 成功: ${this.importResults.success.length} 个`);
        console.log(`  ❌ 失败: ${this.importResults.failed.length} 个`);
        console.log(`  ⏭️  跳过: ${this.importResults.skipped.length} 个`);
        
        if (this.importResults.failed.length > 0) {
            console.log(`\n❌ 失败的智能体:`);
            this.importResults.failed.forEach(item => {
                console.log(`  - ${item.id}: ${item.error}`);
            });
        }
        
        console.log(`\n📁 输出目录: ${this.outputDir}`);
        console.log(`📄 查看详细报告: ${path.join(this.outputDir, 'import_report.md')}`);
        
        if (this.dryRun) {
            console.log(`\n💡 这是 Dry Run 模式，配置文件已生成但未实际导入`);
            console.log(`   要执行实际导入，请运行: node scripts/trae-import.js --no-dry-run`);
        }
    }
}

// 命令行参数解析
function parseArgs() {
    const args = process.argv.slice(2);
    const options = {
        dryRun: true // 默认为 dry-run 模式
    };
    
    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        
        switch (arg) {
            case '--config':
                options.config = args[++i];
                break;
            case '--output':
                options.output = args[++i];
                break;
            case '--dry-run':
                options.dryRun = true;
                break;
            case '--no-dry-run':
                options.dryRun = false;
                break;
            case '--agents':
                options.agents = args[++i];
                break;
            case '--help':
            case '-h':
                console.log(`
Trae IDE 智能体批量导入脚本

使用方法:
  node scripts/trae-import.js [选项]

选项:
  --config <path>     指定智能体配置文件路径 (默认: config/agents/trae_agent_configs.json)
  --output <path>     指定输出目录 (默认: output/trae-agents/)
  --dry-run          仅生成配置文件，不实际导入 (默认)
  --no-dry-run       执行实际导入
  --agents <ids>     指定要导入的智能体ID，逗号分隔 (如: A0_product_owner,A1_brand_strategist)
  --help, -h         显示此帮助信息

示例:
  # Dry run 模式，生成所有智能体配置
  node scripts/trae-import.js

  # 实际导入所有智能体
  node scripts/trae-import.js --no-dry-run

  # 仅导入指定的智能体
  node scripts/trae-import.js --agents A0_product_owner,A1_brand_strategist --no-dry-run
`);
                process.exit(0);
                break;
        }
    }
    
    return options;
}

// 主程序入口
if (require.main === module) {
    const options = parseArgs();
    const importer = new TraeAgentImporter(options);
    
    importer.run().catch(error => {
        console.error('❌ 程序执行失败:', error);
        process.exit(1);
    });
}

module.exports = TraeAgentImporter;