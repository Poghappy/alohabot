import { userProfileService, UserProfile } from '../services/user-profile.service';
import { z } from 'zod';

/**
 * Agent决策上下文接口
 */
export interface AgentDecisionContext {
  userId: string;
  taskType: string;
  complexity: 'low' | 'medium' | 'high';
  domain: string;
  requiredSkills: string[];
  timeConstraint?: string;
  budgetConstraint?: string;
}

/**
 * Agent推荐结果接口
 */
export interface AgentRecommendation {
  recommendedApproach: string;
  toolSuggestions: string[];
  complexityAdjustment: string;
  riskAssessment: string;
  estimatedTime: string;
  alternativeOptions: string[];
  reasoning: string;
}

/**
 * 用户资料Agent集成服务
 * 为Trae IDE Agent提供用户资料驱动的决策支持
 */
export class UserProfileIntegration {
  private readonly profileService = userProfileService;

  /**
   * 获取Agent决策上下文
   * 基于用户资料为Agent提供决策依据
   */
  async getAgentDecisionContext(userId: string, taskType: string): Promise<AgentDecisionContext | null> {
    const profile = await this.profileService.getUserProfile(userId);
    if (!profile) {
      return null;
    }

    // 分析任务复杂度
    const complexity = this.analyzeTaskComplexity(taskType, profile);
    
    // 确定任务领域
    const domain = this.identifyTaskDomain(taskType, profile);
    
    // 推荐所需技能
    const requiredSkills = this.getRequiredSkills(taskType, profile);
    
    return {
      userId,
      taskType,
      complexity,
      domain,
      requiredSkills,
      timeConstraint: profile.resourcesConstraints?.timeConstraints?.dailyHours ? 
        `${profile.resourcesConstraints.timeConstraints.dailyHours}小时/天` : undefined,
      budgetConstraint: profile.resourcesConstraints?.budgetConstraints
    };
  }

  /**
   * 获取Agent推荐方案
   * 基于用户资料和任务上下文提供个性化推荐
   */
  async getAgentRecommendation(context: AgentDecisionContext): Promise<AgentRecommendation> {
    const profile = await this.profileService.getUserProfile(context.userId);
    if (!profile) {
      throw new Error('用户资料不存在');
    }

    const recommendation: AgentRecommendation = {
      recommendedApproach: this.getRecommendedApproach(context, profile),
      toolSuggestions: this.getToolSuggestions(context, profile),
      complexityAdjustment: this.getComplexityAdjustment(context, profile),
      riskAssessment: this.getRiskAssessment(context, profile),
      estimatedTime: this.getEstimatedTime(context, profile),
      alternativeOptions: this.getAlternativeOptions(context, profile),
      reasoning: this.generateReasoning(context, profile)
    };

    return recommendation;
  }

  /**
   * 分析任务复杂度
   */
  private analyzeTaskComplexity(taskType: string, profile: UserProfile): 'low' | 'medium' | 'high' {
    const techLevel = profile.technicalInfo.techLevel;
    const teamSize = profile.teamInfo.teamSize;
    
    // 基于任务类型的基础复杂度
    const baseComplexity = this.getBaseTaskComplexity(taskType);
    
    // 根据用户技术水平调整
    let adjustedComplexity = baseComplexity;
    
    if (techLevel === '初学者' && baseComplexity === 'medium') {
      adjustedComplexity = 'high';
    } else if (techLevel === '高级' && baseComplexity === 'high') {
      adjustedComplexity = 'medium';
    } else if (techLevel === '专家' && baseComplexity !== 'low') {
      adjustedComplexity = baseComplexity === 'high' ? 'medium' : 'low';
    }
    
    // 团队规模影响
    if (teamSize !== '个人' && adjustedComplexity === 'low') {
      adjustedComplexity = 'medium';
    }
    
    return adjustedComplexity;
  }

  /**
   * 获取任务基础复杂度
   */
  private getBaseTaskComplexity(taskType: string): 'low' | 'medium' | 'high' {
    const complexityMap: Record<string, 'low' | 'medium' | 'high'> = {
      '文件操作': 'low',
      '数据处理': 'medium',
      'API集成': 'medium',
      '自动化流程': 'high',
      '系统部署': 'high',
      '数据库设计': 'high',
      '前端开发': 'medium',
      '后端开发': 'high',
      '测试自动化': 'medium',
      '性能优化': 'high'
    };
    
    return complexityMap[taskType] || 'medium';
  }

  /**
   * 识别任务领域
   */
  private identifyTaskDomain(taskType: string, profile: UserProfile): string {
    const industryScenarios = profile.basicInfo.industryScenario;
    const techStack = profile.technicalInfo.techStack || [];
    
    // 基于行业场景和技术栈推断领域
    if (industryScenarios.includes('SaaS')) {
      return 'SaaS开发';
    } else if (industryScenarios.includes('电商')) {
      return '电商系统';
    } else if (industryScenarios.includes('教育')) {
      return '教育技术';
    } else if (techStack.includes('n8n')) {
      return '自动化工作流';
    } else if (techStack.includes('Python')) {
      return '数据处理';
    } else if (techStack.includes('React') || techStack.includes('Vue')) {
      return '前端开发';
    } else {
      return '通用开发';
    }
  }

  /**
   * 获取所需技能
   */
  private getRequiredSkills(taskType: string, profile: UserProfile): string[] {
    const userTechStack = profile.technicalInfo.techStack || [];
    const skillsMap: Record<string, string[]> = {
      '自动化流程': ['n8n', 'JavaScript', 'API'],
      '数据处理': ['Python', 'SQL', '数据库'],
      'API集成': ['JavaScript', 'Node.js', 'API'],
      '前端开发': ['JavaScript', 'React', 'Vue', 'TypeScript'],
      '后端开发': ['Node.js', 'Python', '数据库', 'API'],
      '系统部署': ['Docker', 'Kubernetes', '云服务'],
      '测试自动化': ['JavaScript', 'Python', 'API']
    };
    
    const requiredSkills = skillsMap[taskType] || ['JavaScript'];
    
    // 过滤用户已有技能，突出缺失技能
    return requiredSkills.filter(skill => {
      const techStackStrings = userTechStack.map(tech => tech as string);
      return !techStackStrings.includes(skill);
    });
  }

  /**
   * 获取推荐方法
   */
  private getRecommendedApproach(context: AgentDecisionContext, profile: UserProfile): string {
    const techLevel = profile.technicalInfo.techLevel;
    const decisionPriority = profile.aiAgentInfo?.decisionPriority;
    const riskTolerance = profile.resourcesConstraints?.riskTolerance;
    
    if (techLevel === '初学者') {
      return '使用可视化工具和模板，逐步学习核心概念';
    } else if (decisionPriority === '效率优先') {
      return '选择成熟的开源解决方案，快速集成部署';
    } else if (decisionPriority === '成本优先') {
      return '优先使用免费开源工具，避免付费服务';
    } else if (riskTolerance === '必须稳定') {
      return '选择经过验证的企业级解决方案，确保稳定性';
    } else if (context.complexity === 'high') {
      return '分阶段实施，先构建MVP验证可行性';
    } else {
      return '采用敏捷开发方式，快速迭代优化';
    }
  }

  /**
   * 获取工具建议
   */
  private getToolSuggestions(context: AgentDecisionContext, profile: UserProfile): string[] {
    const techStack = profile.technicalInfo.techStack || [];
    const systemEnv = profile.technicalInfo.systemEnvironment || [];
    const suggestions: string[] = [];
    
    // 基于用户现有技术栈推荐
    if (techStack.includes('n8n')) {
      suggestions.push('n8n工作流', 'n8n-nodes-base');
    }
    
    if (techStack.includes('Docker')) {
      suggestions.push('Docker容器', 'Docker Compose');
    }
    
    if (systemEnv.includes('AWS')) {
      suggestions.push('AWS Lambda', 'AWS API Gateway');
    }
    
    // 基于任务类型推荐
    if (context.taskType.includes('API')) {
      suggestions.push('Postman', 'Swagger', 'REST Client');
    }
    
    if (context.taskType.includes('数据')) {
      suggestions.push('Pandas', 'NumPy', 'Jupyter Notebook');
    }
    
    if (context.taskType.includes('自动化')) {
      suggestions.push('GitHub Actions', 'Jenkins', 'Cron Jobs');
    }
    
    return suggestions.length > 0 ? suggestions : ['VS Code', 'Git', 'Chrome DevTools'];
  }

  /**
   * 获取复杂度调整建议
   */
  private getComplexityAdjustment(context: AgentDecisionContext, profile: UserProfile): string {
    const techLevel = profile.technicalInfo.techLevel;
    
    if (context.complexity === 'high' && techLevel === '初学者') {
      return '建议分解为多个简单任务，逐步完成';
    } else if (context.complexity === 'low' && techLevel === '专家') {
      return '可以考虑扩展功能或优化性能';
    } else if (context.complexity === 'medium') {
      return '当前复杂度适中，建议按计划执行';
    } else {
      return '复杂度与技能水平匹配，可以正常进行';
    }
  }

  /**
   * 获取风险评估
   */
  private getRiskAssessment(context: AgentDecisionContext, profile: UserProfile): string {
    const riskTolerance = profile.resourcesConstraints?.riskTolerance;
    const techLevel = profile.technicalInfo.techLevel;
    
    let riskLevel = 'medium';
    
    if (context.complexity === 'high' && techLevel === '初学者') {
      riskLevel = 'high';
    } else if (context.complexity === 'low' && techLevel === '高级') {
      riskLevel = 'low';
    }
    
    const riskMessages = {
      low: '风险较低，可以放心执行',
      medium: '存在一定风险，建议做好备份和测试',
      high: '风险较高，建议寻求专业指导或分阶段实施'
    };
    
    let message = riskMessages[riskLevel as keyof typeof riskMessages];
    
    if (riskTolerance === '必须稳定') {
      message += '，建议使用经过验证的稳定方案';
    } else if (riskTolerance === '容忍试错') {
      message += '，可以尝试创新方案';
    }
    
    return message;
  }

  /**
   * 获取预估时间
   */
  private getEstimatedTime(context: AgentDecisionContext, profile: UserProfile): string {
    const techLevel = profile.technicalInfo.techLevel;
    const dailyHours = profile.resourcesConstraints?.timeConstraints?.dailyHours || 2;
    
    // 基础时间估算（小时）
    const baseTimeMap = {
      low: 2,
      medium: 8,
      high: 24
    };
    
    let baseTime = baseTimeMap[context.complexity];
    
    // 根据技术水平调整
    const skillMultiplier = {
      '初学者': 2.0,
      '中级': 1.5,
      '高级': 1.0,
      '专家': 0.8
    };
    
    const adjustedTime = baseTime * skillMultiplier[techLevel];
    const days = Math.ceil(adjustedTime / dailyHours);
    
    return `预计${adjustedTime}小时，约${days}天完成`;
  }

  /**
   * 获取替代方案
   */
  private getAlternativeOptions(context: AgentDecisionContext, profile: UserProfile): string[] {
    const alternatives: string[] = [];
    const decisionPriority = profile.aiAgentInfo?.decisionPriority;
    
    if (decisionPriority === '成本优先') {
      alternatives.push('使用免费开源替代方案');
      alternatives.push('寻找社区版本或试用版');
    }
    
    if (decisionPriority === '效率优先') {
      alternatives.push('使用现成的SaaS服务');
      alternatives.push('购买商业解决方案');
    }
    
    if (context.complexity === 'high') {
      alternatives.push('分阶段实施，先完成核心功能');
      alternatives.push('寻求外部技术支持');
      alternatives.push('使用低代码/无代码平台');
    }
    
    alternatives.push('参考类似项目的实现方案');
    alternatives.push('咨询技术社区或专家意见');
    
    return alternatives;
  }

  /**
   * 生成推理说明
   */
  private generateReasoning(context: AgentDecisionContext, profile: UserProfile): string {
    const reasons: string[] = [];
    
    reasons.push(`基于您的技术水平（${profile.technicalInfo.techLevel}）`);
    reasons.push(`团队规模（${profile.teamInfo.teamSize}）`);
    
    if (profile.aiAgentInfo?.decisionPriority) {
      reasons.push(`决策优先级（${profile.aiAgentInfo.decisionPriority}）`);
    }
    
    if (profile.resourcesConstraints?.budgetConstraints) {
      reasons.push(`预算约束（${profile.resourcesConstraints.budgetConstraints}）`);
    }
    
    reasons.push(`任务复杂度（${context.complexity}）`);
    
    return `推荐理由：${reasons.join('、')}，为您量身定制了最适合的解决方案。`;
  }

  /**
   * 更新用户偏好
   * 基于Agent交互结果更新用户资料
   */
  async updateUserPreferences(userId: string, feedback: {
    taskType: string;
    satisfaction: 'high' | 'medium' | 'low';
    actualTime?: number;
    usedTools?: string[];
    difficulties?: string[];
    suggestions?: string[];
  }): Promise<void> {
    const profile = await this.profileService.getUserProfile(userId);
    if (!profile) {
      return;
    }

    // 基于反馈更新用户资料
    const updates: Partial<UserProfile> = {};
    
    // 更新工具熟悉度
    if (feedback.usedTools && feedback.satisfaction === 'high') {
      const toolFamiliarity = { ...profile.technicalInfo.toolFamiliarity };
      feedback.usedTools.forEach(tool => {
        if (tool === 'n8n' && toolFamiliarity.n8n !== '精通') {
          toolFamiliarity.n8n = toolFamiliarity.n8n === '未接触' ? '基础' : 
                                toolFamiliarity.n8n === '基础' ? '熟练' : '精通';
        }
        // 类似逻辑适用于其他工具
      });
      
      updates.technicalInfo = {
        ...profile.technicalInfo,
        toolFamiliarity
      };
    }
    
    // 更新技术栈
    if (feedback.usedTools && feedback.satisfaction !== 'low') {
      const currentTechStack = profile.technicalInfo.techStack || [];
      const currentTechStackStrings = currentTechStack.map(tech => tech as string);
      const newTools = feedback.usedTools.filter(tool => !currentTechStackStrings.includes(tool));
      
      if (newTools.length > 0) {
        // 验证新工具是否在允许的枚举值中
        const validTechStack = ['n8n', 'Python', 'Node.js', 'JavaScript', 'TypeScript', 'React', 'Vue', 'Docker', 'Kubernetes', 'API', '数据库', '云服务'] as const;
        const validNewTools = newTools.filter(tool => validTechStack.includes(tool as any));
        
        if (validNewTools.length > 0) {
          updates.technicalInfo = {
            ...updates.technicalInfo,
            ...profile.technicalInfo,
            techStack: [...currentTechStack, ...validNewTools as any[]]
          };
        }
      }
    }
    
    // 如果有更新，保存到用户资料
    if (Object.keys(updates).length > 0) {
      await this.profileService.updateUserProfile(userId, {
        ...updates,
        versionManagement: {
          ...profile.versionManagement,
          lastModifiedBy: 'agent-feedback'
        }
      });
    }
  }

  /**
   * 获取用户学习建议
   */
  async getLearningRecommendations(userId: string): Promise<{
    skillGaps: string[];
    learningPath: string[];
    resources: string[];
    estimatedTime: string;
  } | null> {
    const profile = await this.profileService.getUserProfile(userId);
    if (!profile) {
      return null;
    }

    const currentSkills = profile.technicalInfo.techStack || [];
    const targetRoles = profile.basicInfo.userRole;
    const industryScenarios = profile.basicInfo.industryScenario;
    
    // 分析技能差距
    const skillGaps = this.analyzeSkillGaps(currentSkills, targetRoles, industryScenarios);
    
    // 生成学习路径
    const learningPath = this.generateLearningPath(skillGaps, profile.technicalInfo.techLevel);
    
    // 推荐学习资源
    const resources = this.recommendLearningResources(skillGaps);
    
    // 估算学习时间
    const estimatedTime = this.estimateLearningTime(skillGaps, profile.technicalInfo.techLevel);
    
    return {
      skillGaps,
      learningPath,
      resources,
      estimatedTime
    };
  }

  /**
   * 分析技能差距
   */
  private analyzeSkillGaps(currentSkills: string[], targetRoles: string[], industries: string[]): string[] {
    const requiredSkillsMap: Record<string, string[]> = {
      '开发者': ['JavaScript', 'Python', 'Git', 'API', '数据库'],
      '产品经理': ['数据分析', 'Figma', 'Notion', 'API'],
      '设计师': ['Figma', 'Sketch', 'Adobe Creative Suite'],
      '运营': ['数据分析', 'SQL', 'Excel', 'Google Analytics']
    };
    
    const industrySkillsMap: Record<string, string[]> = {
      'SaaS': ['云服务', 'API', 'Docker', 'Kubernetes'],
      '电商': ['支付集成', '数据分析', 'SEO', '营销自动化'],
      '教育': ['LMS', '视频处理', '在线协作工具']
    };
    
    const requiredSkills = new Set<string>();
    
    // 基于角色添加技能
    targetRoles.forEach(role => {
      const skills = requiredSkillsMap[role] || [];
      skills.forEach(skill => requiredSkills.add(skill));
    });
    
    // 基于行业添加技能
    industries.forEach(industry => {
      const skills = industrySkillsMap[industry] || [];
      skills.forEach(skill => requiredSkills.add(skill));
    });
    
    // 返回缺失的技能
    return Array.from(requiredSkills).filter(skill => !currentSkills.includes(skill));
  }

  /**
   * 生成学习路径
   */
  private generateLearningPath(skillGaps: string[], techLevel: string): string[] {
    const learningOrder: Record<string, number> = {
      'Git': 1,
      'JavaScript': 2,
      'HTML/CSS': 2,
      'Python': 3,
      'API': 4,
      '数据库': 5,
      'Docker': 6,
      'Kubernetes': 7,
      '云服务': 8
    };
    
    // 根据学习顺序排序
    const sortedSkills = skillGaps.sort((a, b) => {
      return (learningOrder[a] || 999) - (learningOrder[b] || 999);
    });
    
    // 根据技术水平调整学习路径
    if (techLevel === '初学者') {
      return ['基础概念理解', ...sortedSkills.slice(0, 3), '实践项目', ...sortedSkills.slice(3)];
    } else {
      return sortedSkills;
    }
  }

  /**
   * 推荐学习资源
   */
  private recommendLearningResources(skillGaps: string[]): string[] {
    const resourceMap: Record<string, string[]> = {
      'JavaScript': ['MDN Web Docs', 'JavaScript.info', 'freeCodeCamp'],
      'Python': ['Python.org Tutorial', 'Automate the Boring Stuff', 'Real Python'],
      'Git': ['Pro Git Book', 'GitHub Learning Lab', 'Atlassian Git Tutorials'],
      'API': ['Postman Learning Center', 'RESTful API Tutorial', 'Swagger Documentation'],
      '数据库': ['W3Schools SQL', 'PostgreSQL Tutorial', 'MongoDB University'],
      'Docker': ['Docker Official Docs', 'Docker for Beginners', 'Play with Docker'],
      'n8n': ['n8n Documentation', 'n8n Community', 'n8n YouTube Channel']
    };
    
    const resources: string[] = [];
    skillGaps.forEach(skill => {
      const skillResources = resourceMap[skill] || [`${skill} 官方文档`];
      resources.push(...skillResources);
    });
    
    return [...new Set(resources)]; // 去重
  }

  /**
   * 估算学习时间
   */
  private estimateLearningTime(skillGaps: string[], techLevel: string): string {
    const timePerSkill = {
      '初学者': 20,
      '中级': 15,
      '高级': 10,
      '专家': 5
    };
    
    const hoursPerSkill = timePerSkill[techLevel] || 15;
    const totalHours = skillGaps.length * hoursPerSkill;
    const weeks = Math.ceil(totalHours / 10); // 假设每周学习10小时
    
    return `预计${totalHours}小时，约${weeks}周完成`;
  }
}

// 导出单例实例
export const userProfileIntegration = new UserProfileIntegration();