import { z } from 'zod';
import { UserProfileService, UserProfile } from './user-profile.service';

/**
 * 版本信息
 */
interface VersionInfo {
  /** 版本号 */
  version: string;
  /** 创建时间戳 */
  timestamp: number;
  /** 变更描述 */
  changeDescription: string;
  /** 变更类型 */
  changeType: 'create' | 'update' | 'merge' | 'rollback' | 'auto';
  /** 变更来源 */
  changeSource: 'user' | 'agent' | 'system' | 'integration';
  /** 变更者ID */
  changedBy: string;
  /** 变更字段 */
  changedFields: string[];
  /** 变更前后对比 */
  diff?: {
    before: Partial<UserProfile>;
    after: Partial<UserProfile>;
  };
}

/**
 * 历史记录条目
 */
interface HistoryEntry {
  /** 条目ID */
  id: string;
  /** 用户ID */
  userId: string;
  /** 版本信息 */
  versionInfo: VersionInfo;
  /** 完整的用户资料快照 */
  profileSnapshot: UserProfile;
  /** 元数据 */
  metadata: {
    /** 文件大小（字节） */
    size: number;
    /** 校验和 */
    checksum: string;
    /** 压缩状态 */
    compressed: boolean;
  };
}

/**
 * 版本比较结果
 */
interface VersionComparison {
  /** 版本A */
  versionA: string;
  /** 版本B */
  versionB: string;
  /** 差异字段 */
  differences: {
    field: string;
    path: string;
    valueA: any;
    valueB: any;
    changeType: 'added' | 'removed' | 'modified';
  }[];
  /** 相似度百分比 */
  similarity: number;
}

/**
 * 版本管理配置
 */
interface VersionConfig {
  /** 最大保留版本数 */
  maxVersions: number;
  /** 自动清理策略 */
  cleanupStrategy: 'fifo' | 'lru' | 'size-based' | 'time-based';
  /** 压缩阈值（字节） */
  compressionThreshold: number;
  /** 是否启用增量存储 */
  enableDeltaStorage: boolean;
  /** 自动备份间隔（毫秒） */
  autoBackupInterval: number;
}

/**
 * 用户资料版本管理服务
 * 负责实现版本管理、历史记录、回滚等功能
 */
export class UserProfileVersionService {
  private userProfileService: UserProfileService;
  private versionConfig: VersionConfig;
  private historyStorage: Map<string, HistoryEntry[]>;
  private versionCounters: Map<string, number>;

  constructor(
    userProfileService: UserProfileService,
    config?: Partial<VersionConfig>
  ) {
    this.userProfileService = userProfileService;
    this.versionConfig = {
      maxVersions: 50,
      cleanupStrategy: 'time-based',
      compressionThreshold: 10240, // 10KB
      enableDeltaStorage: true,
      autoBackupInterval: 3600000, // 1小时
      ...config
    };
    this.historyStorage = new Map();
    this.versionCounters = new Map();
  }

  /**
   * 创建新版本
   */
  async createVersion(
    userId: string,
    profile: UserProfile,
    changeDescription: string,
    changeType: VersionInfo['changeType'] = 'update',
    changeSource: VersionInfo['changeSource'] = 'user',
    changedBy: string = 'system',
    changedFields: string[] = []
  ): Promise<string> {
    // 生成版本号
    const version = this.generateVersionNumber(userId);
    
    // 获取上一个版本进行对比
    const previousVersion = await this.getLatestVersion(userId);
    
    // 创建版本信息
    const versionInfo: VersionInfo = {
      version,
      timestamp: Date.now(),
      changeDescription,
      changeType,
      changeSource,
      changedBy,
      changedFields,
      diff: previousVersion ? {
        before: previousVersion.profileSnapshot,
        after: profile
      } : undefined
    };

    // 创建历史记录条目
    const historyEntry: HistoryEntry = {
      id: this.generateEntryId(userId, version),
      userId,
      versionInfo,
      profileSnapshot: this.deepClone(profile),
      metadata: {
        size: this.calculateSize(profile),
        checksum: this.calculateChecksum(profile),
        compressed: false
      }
    };

    // 压缩处理
    if (historyEntry.metadata.size > this.versionConfig.compressionThreshold) {
      historyEntry.profileSnapshot = this.compressProfile(historyEntry.profileSnapshot);
      historyEntry.metadata.compressed = true;
    }

    // 存储历史记录
    await this.storeHistoryEntry(historyEntry);

    // 清理旧版本
    await this.cleanupOldVersions(userId);

    return version;
  }

  /**
   * 获取版本历史
   */
  async getVersionHistory(
    userId: string,
    options?: {
      limit?: number;
      offset?: number;
      startDate?: Date;
      endDate?: Date;
      changeType?: VersionInfo['changeType'];
    }
  ): Promise<HistoryEntry[]> {
    const history = this.historyStorage.get(userId) || [];
    let filteredHistory = [...history];

    // 应用过滤条件
    if (options?.startDate) {
      filteredHistory = filteredHistory.filter(
        entry => entry.versionInfo.timestamp >= options.startDate!.getTime()
      );
    }

    if (options?.endDate) {
      filteredHistory = filteredHistory.filter(
        entry => entry.versionInfo.timestamp <= options.endDate!.getTime()
      );
    }

    if (options?.changeType) {
      filteredHistory = filteredHistory.filter(
        entry => entry.versionInfo.changeType === options.changeType
      );
    }

    // 排序（最新的在前）
    filteredHistory.sort((a, b) => b.versionInfo.timestamp - a.versionInfo.timestamp);

    // 分页
    const offset = options?.offset || 0;
    const limit = options?.limit || filteredHistory.length;
    
    return filteredHistory.slice(offset, offset + limit);
  }

  /**
   * 获取特定版本
   */
  async getVersion(userId: string, version: string): Promise<HistoryEntry | null> {
    const history = this.historyStorage.get(userId) || [];
    const entry = history.find(entry => entry.versionInfo.version === version);
    
    if (!entry) {
      return null;
    }

    // 解压缩处理
    if (entry.metadata.compressed) {
      const decompressedEntry = { ...entry };
      decompressedEntry.profileSnapshot = this.decompressProfile(entry.profileSnapshot);
      return decompressedEntry;
    }

    return entry;
  }

  /**
   * 获取最新版本
   */
  async getLatestVersion(userId: string): Promise<HistoryEntry | null> {
    const history = this.historyStorage.get(userId) || [];
    if (history.length === 0) {
      return null;
    }

    // 按时间戳排序，获取最新的
    const sortedHistory = history.sort((a, b) => b.versionInfo.timestamp - a.versionInfo.timestamp);
    return this.getVersion(userId, sortedHistory[0].versionInfo.version);
  }

  /**
   * 回滚到指定版本
   */
  async rollbackToVersion(
    userId: string,
    targetVersion: string,
    rollbackBy: string = 'system'
  ): Promise<UserProfile> {
    const targetEntry = await this.getVersion(userId, targetVersion);
    if (!targetEntry) {
      throw new Error(`版本 ${targetVersion} 不存在`);
    }

    const rollbackProfile = targetEntry.profileSnapshot;

    // 创建回滚版本记录
    await this.createVersion(
      userId,
      rollbackProfile,
      `回滚到版本 ${targetVersion}`,
      'rollback',
      'user',
      rollbackBy,
      ['全部字段']
    );

    // 更新当前用户资料
    await this.userProfileService.updateUserProfile(userId, rollbackProfile);

    return rollbackProfile;
  }

  /**
   * 比较两个版本
   */
  async compareVersions(
    userId: string,
    versionA: string,
    versionB: string
  ): Promise<VersionComparison> {
    const entryA = await this.getVersion(userId, versionA);
    const entryB = await this.getVersion(userId, versionB);

    if (!entryA || !entryB) {
      throw new Error('指定的版本不存在');
    }

    const differences = this.calculateDifferences(
      entryA.profileSnapshot,
      entryB.profileSnapshot
    );

    const similarity = this.calculateSimilarity(
      entryA.profileSnapshot,
      entryB.profileSnapshot
    );

    return {
      versionA,
      versionB,
      differences,
      similarity
    };
  }

  /**
   * 合并版本
   */
  async mergeVersions(
    userId: string,
    baseVersion: string,
    sourceVersion: string,
    mergeStrategy: 'auto' | 'manual' = 'auto',
    manualResolutions?: Record<string, any>
  ): Promise<UserProfile> {
    const baseEntry = await this.getVersion(userId, baseVersion);
    const sourceEntry = await this.getVersion(userId, sourceVersion);

    if (!baseEntry || !sourceEntry) {
      throw new Error('指定的版本不存在');
    }

    let mergedProfile: UserProfile;

    if (mergeStrategy === 'auto') {
      mergedProfile = this.autoMergeProfiles(
        baseEntry.profileSnapshot,
        sourceEntry.profileSnapshot
      );
    } else {
      mergedProfile = this.manualMergeProfiles(
        baseEntry.profileSnapshot,
        sourceEntry.profileSnapshot,
        manualResolutions || {}
      );
    }

    // 创建合并版本记录
    await this.createVersion(
      userId,
      mergedProfile,
      `合并版本 ${baseVersion} 和 ${sourceVersion}`,
      'merge',
      'user',
      'system',
      ['合并字段']
    );

    return mergedProfile;
  }

  /**
   * 导出版本历史
   */
  async exportVersionHistory(
    userId: string,
    format: 'json' | 'csv' | 'xml' = 'json'
  ): Promise<string> {
    const history = await this.getVersionHistory(userId);

    switch (format) {
      case 'json':
        return JSON.stringify(history, null, 2);
      case 'csv':
        return this.convertToCSV(history);
      case 'xml':
        return this.convertToXML(history);
      default:
        throw new Error(`不支持的导出格式: ${format}`);
    }
  }

  /**
   * 导入版本历史
   */
  async importVersionHistory(
    userId: string,
    data: string,
    format: 'json' | 'csv' | 'xml' = 'json'
  ): Promise<void> {
    let history: HistoryEntry[];

    switch (format) {
      case 'json':
        history = JSON.parse(data);
        break;
      case 'csv':
        history = this.parseCSV(data);
        break;
      case 'xml':
        history = this.parseXML(data);
        break;
      default:
        throw new Error(`不支持的导入格式: ${format}`);
    }

    // 验证数据格式
    this.validateHistoryData(history);

    // 合并到现有历史
    const existingHistory = this.historyStorage.get(userId) || [];
    const mergedHistory = this.mergeHistories(existingHistory, history);
    
    this.historyStorage.set(userId, mergedHistory);
  }

  /**
   * 获取版本统计信息
   */
  async getVersionStatistics(userId: string): Promise<{
    totalVersions: number;
    totalSize: number;
    averageSize: number;
    changeTypeDistribution: Record<string, number>;
    changeSourceDistribution: Record<string, number>;
    timelineData: { date: string; count: number }[];
  }> {
    const history = await this.getVersionHistory(userId);

    const totalVersions = history.length;
    const totalSize = history.reduce((sum, entry) => sum + entry.metadata.size, 0);
    const averageSize = totalVersions > 0 ? totalSize / totalVersions : 0;

    // 变更类型分布
    const changeTypeDistribution: Record<string, number> = {};
    history.forEach(entry => {
      const type = entry.versionInfo.changeType;
      changeTypeDistribution[type] = (changeTypeDistribution[type] || 0) + 1;
    });

    // 变更来源分布
    const changeSourceDistribution: Record<string, number> = {};
    history.forEach(entry => {
      const source = entry.versionInfo.changeSource;
      changeSourceDistribution[source] = (changeSourceDistribution[source] || 0) + 1;
    });

    // 时间线数据（按天统计）
    const timelineData = this.generateTimelineData(history);

    return {
      totalVersions,
      totalSize,
      averageSize,
      changeTypeDistribution,
      changeSourceDistribution,
      timelineData
    };
  }

  /**
   * 生成版本号
   */
  private generateVersionNumber(userId: string): string {
    const counter = this.versionCounters.get(userId) || 0;
    const newCounter = counter + 1;
    this.versionCounters.set(userId, newCounter);
    
    const timestamp = Date.now();
    return `v${newCounter}.${timestamp}`;
  }

  /**
   * 生成条目ID
   */
  private generateEntryId(userId: string, version: string): string {
    return `${userId}_${version}_${Date.now()}`;
  }

  /**
   * 深度克隆对象
   */
  private deepClone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
  }

  /**
   * 计算对象大小
   */
  private calculateSize(obj: any): number {
    return JSON.stringify(obj).length;
  }

  /**
   * 计算校验和
   */
  private calculateChecksum(obj: any): string {
    const str = JSON.stringify(obj);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // 转换为32位整数
    }
    return hash.toString(16);
  }

  /**
   * 压缩用户资料
   */
  private compressProfile(profile: UserProfile): UserProfile {
    // 简单的压缩实现：移除空值和默认值
    const compressed = this.deepClone(profile);
    this.removeEmptyValues(compressed);
    return compressed;
  }

  /**
   * 解压缩用户资料
   */
  private decompressProfile(profile: UserProfile): UserProfile {
    // 解压缩实现：恢复默认值
    return this.deepClone(profile);
  }

  /**
   * 移除空值
   */
  private removeEmptyValues(obj: any): void {
    Object.keys(obj).forEach(key => {
      if (obj[key] === null || obj[key] === undefined || obj[key] === '') {
        delete obj[key];
      } else if (typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
        this.removeEmptyValues(obj[key]);
        if (Object.keys(obj[key]).length === 0) {
          delete obj[key];
        }
      } else if (Array.isArray(obj[key]) && obj[key].length === 0) {
        delete obj[key];
      }
    });
  }

  /**
   * 存储历史记录条目
   */
  private async storeHistoryEntry(entry: HistoryEntry): Promise<void> {
    const userId = entry.userId;
    const history = this.historyStorage.get(userId) || [];
    history.push(entry);
    this.historyStorage.set(userId, history);
  }

  /**
   * 清理旧版本
   */
  private async cleanupOldVersions(userId: string): Promise<void> {
    const history = this.historyStorage.get(userId) || [];
    
    if (history.length <= this.versionConfig.maxVersions) {
      return;
    }

    // 按策略清理
    let cleanedHistory: HistoryEntry[];
    
    switch (this.versionConfig.cleanupStrategy) {
      case 'fifo':
        cleanedHistory = history.slice(-this.versionConfig.maxVersions);
        break;
      case 'lru':
        // 简化实现：按时间戳排序
        cleanedHistory = history
          .sort((a, b) => b.versionInfo.timestamp - a.versionInfo.timestamp)
          .slice(0, this.versionConfig.maxVersions);
        break;
      case 'size-based':
        // 保留较小的版本
        cleanedHistory = history
          .sort((a, b) => a.metadata.size - b.metadata.size)
          .slice(0, this.versionConfig.maxVersions);
        break;
      case 'time-based':
        // 保留最近的版本
        cleanedHistory = history
          .sort((a, b) => b.versionInfo.timestamp - a.versionInfo.timestamp)
          .slice(0, this.versionConfig.maxVersions);
        break;
      default:
        cleanedHistory = history.slice(-this.versionConfig.maxVersions);
    }

    this.historyStorage.set(userId, cleanedHistory);
  }

  /**
   * 计算差异
   */
  private calculateDifferences(objA: any, objB: any, path: string = ''): VersionComparison['differences'] {
    const differences: VersionComparison['differences'] = [];

    const allKeys = new Set([...Object.keys(objA || {}), ...Object.keys(objB || {})]);

    for (const key of allKeys) {
      const currentPath = path ? `${path}.${key}` : key;
      const valueA = objA?.[key];
      const valueB = objB?.[key];

      if (valueA === undefined && valueB !== undefined) {
        differences.push({
          field: key,
          path: currentPath,
          valueA,
          valueB,
          changeType: 'added'
        });
      } else if (valueA !== undefined && valueB === undefined) {
        differences.push({
          field: key,
          path: currentPath,
          valueA,
          valueB,
          changeType: 'removed'
        });
      } else if (valueA !== valueB) {
        if (typeof valueA === 'object' && typeof valueB === 'object' && valueA !== null && valueB !== null) {
          differences.push(...this.calculateDifferences(valueA, valueB, currentPath));
        } else {
          differences.push({
            field: key,
            path: currentPath,
            valueA,
            valueB,
            changeType: 'modified'
          });
        }
      }
    }

    return differences;
  }

  /**
   * 计算相似度
   */
  private calculateSimilarity(objA: any, objB: any): number {
    const strA = JSON.stringify(objA);
    const strB = JSON.stringify(objB);
    
    if (strA === strB) {
      return 100;
    }

    const maxLength = Math.max(strA.length, strB.length);
    const differences = this.calculateDifferences(objA, objB);
    const changeCount = differences.length;
    
    // 简化的相似度计算
    const similarity = Math.max(0, 100 - (changeCount / maxLength * 100));
    return Math.round(similarity * 100) / 100;
  }

  /**
   * 自动合并用户资料
   */
  private autoMergeProfiles(base: UserProfile, source: UserProfile): UserProfile {
    const merged = this.deepClone(base);
    
    // 简单的合并策略：source 覆盖 base
    this.deepMerge(merged, source);
    
    return merged;
  }

  /**
   * 手动合并用户资料
   */
  private manualMergeProfiles(
    base: UserProfile,
    source: UserProfile,
    resolutions: Record<string, any>
  ): UserProfile {
    const merged = this.deepClone(base);
    
    // 应用手动解决方案
    Object.keys(resolutions).forEach(path => {
      this.setValueByPath(merged, path, resolutions[path]);
    });
    
    return merged;
  }

  /**
   * 深度合并对象
   */
  private deepMerge(target: any, source: any): void {
    Object.keys(source).forEach(key => {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        if (!target[key]) {
          target[key] = {};
        }
        this.deepMerge(target[key], source[key]);
      } else {
        target[key] = source[key];
      }
    });
  }

  /**
   * 根据路径设置值
   */
  private setValueByPath(obj: any, path: string, value: any): void {
    const keys = path.split('.');
    let current = obj;
    
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) {
        current[keys[i]] = {};
      }
      current = current[keys[i]];
    }
    
    current[keys[keys.length - 1]] = value;
  }

  /**
   * 转换为CSV格式
   */
  private convertToCSV(history: HistoryEntry[]): string {
    const headers = ['版本', '时间戳', '变更描述', '变更类型', '变更来源', '变更者', '大小'];
    const rows = history.map(entry => [
      entry.versionInfo.version,
      new Date(entry.versionInfo.timestamp).toISOString(),
      entry.versionInfo.changeDescription,
      entry.versionInfo.changeType,
      entry.versionInfo.changeSource,
      entry.versionInfo.changedBy,
      entry.metadata.size.toString()
    ]);
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  /**
   * 转换为XML格式
   */
  private convertToXML(history: HistoryEntry[]): string {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<history>\n';
    
    history.forEach(entry => {
      xml += '  <entry>\n';
      xml += `    <version>${entry.versionInfo.version}</version>\n`;
      xml += `    <timestamp>${entry.versionInfo.timestamp}</timestamp>\n`;
      xml += `    <description>${entry.versionInfo.changeDescription}</description>\n`;
      xml += `    <type>${entry.versionInfo.changeType}</type>\n`;
      xml += `    <source>${entry.versionInfo.changeSource}</source>\n`;
      xml += `    <changedBy>${entry.versionInfo.changedBy}</changedBy>\n`;
      xml += `    <size>${entry.metadata.size}</size>\n`;
      xml += '  </entry>\n';
    });
    
    xml += '</history>';
    return xml;
  }

  /**
   * 解析CSV数据
   */
  private parseCSV(data: string): HistoryEntry[] {
    // 简化实现
    const lines = data.split('\n');
    const headers = lines[0].split(',');
    
    return lines.slice(1).map((line, index) => {
      const values = line.split(',');
      return {
        id: `imported_${index}`,
        userId: 'imported',
        versionInfo: {
          version: values[0],
          timestamp: new Date(values[1]).getTime(),
          changeDescription: values[2],
          changeType: values[3] as VersionInfo['changeType'],
          changeSource: values[4] as VersionInfo['changeSource'],
          changedBy: values[5],
          changedFields: []
        },
        profileSnapshot: {} as UserProfile,
        metadata: {
          size: parseInt(values[6]),
          checksum: '',
          compressed: false
        }
      };
    });
  }

  /**
   * 解析XML数据
   */
  private parseXML(data: string): HistoryEntry[] {
    // 简化实现 - 实际项目中应使用专业的XML解析器
    throw new Error('XML解析功能待实现');
  }

  /**
   * 验证历史数据
   */
  private validateHistoryData(history: HistoryEntry[]): void {
    history.forEach((entry, index) => {
      if (!entry.id || !entry.userId || !entry.versionInfo) {
        throw new Error(`历史记录条目 ${index} 格式无效`);
      }
    });
  }

  /**
   * 合并历史记录
   */
  private mergeHistories(existing: HistoryEntry[], imported: HistoryEntry[]): HistoryEntry[] {
    const merged = [...existing];
    
    imported.forEach(importedEntry => {
      const existingIndex = merged.findIndex(
        entry => entry.versionInfo.version === importedEntry.versionInfo.version
      );
      
      if (existingIndex === -1) {
        merged.push(importedEntry);
      } else {
        // 可以选择覆盖或跳过
        merged[existingIndex] = importedEntry;
      }
    });
    
    return merged.sort((a, b) => a.versionInfo.timestamp - b.versionInfo.timestamp);
  }

  /**
   * 生成时间线数据
   */
  private generateTimelineData(history: HistoryEntry[]): { date: string; count: number }[] {
    const dateMap = new Map<string, number>();
    
    history.forEach(entry => {
      const date = new Date(entry.versionInfo.timestamp).toISOString().split('T')[0];
      dateMap.set(date, (dateMap.get(date) || 0) + 1);
    });
    
    return Array.from(dateMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  /**
   * 清理资源
   */
  cleanup(): void {
    this.historyStorage.clear();
    this.versionCounters.clear();
  }
}

/**
 * 导出类型定义
 */
export type {
  VersionInfo,
  HistoryEntry,
  VersionComparison,
  VersionConfig
};