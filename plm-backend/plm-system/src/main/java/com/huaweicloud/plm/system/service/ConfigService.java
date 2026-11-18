package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.system.dto.ConfigQuery;
import com.huaweicloud.plm.system.dto.ConfigSaveRequest;
import com.huaweicloud.plm.system.entity.SysConfig;
import com.huaweicloud.plm.system.mapper.SysConfigMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;

/**
 * 后台可配置项服务：业务规则、编码规则等未明确项统一通过配置项管理，避免写死。
 */
@Service
@RequiredArgsConstructor
public class ConfigService {

    private final SysConfigMapper configMapper;

    public PageResult<SysConfig> page(ConfigQuery query) {
        Page<SysConfig> page = query.toPage();
        configMapper.selectPage(page, Wrappers.<SysConfig>lambdaQuery()
                .eq(StringUtils.hasText(query.getCategory()), SysConfig::getCategory, query.getCategory())
                .eq(query.getPendingConfirm() != null, SysConfig::getPendingConfirm, query.getPendingConfirm())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(SysConfig::getConfigKey, query.getKeyword()).or()
                        .like(SysConfig::getConfigName, query.getKeyword()))
                .orderByAsc(SysConfig::getCategory)
                .orderByAsc(SysConfig::getConfigKey));
        return PageResult.of(page);
    }

    public List<SysConfig> listByCategory(String category) {
        return configMapper.selectList(Wrappers.<SysConfig>lambdaQuery()
                .eq(StringUtils.hasText(category), SysConfig::getCategory, category)
                .orderByAsc(SysConfig::getConfigKey));
    }

    public String getValue(String configKey) {
        SysConfig config = configMapper.selectOne(
                Wrappers.<SysConfig>lambdaQuery().eq(SysConfig::getConfigKey, configKey));
        return config == null ? null : config.getConfigValue();
    }

    public Long create(ConfigSaveRequest request) {
        ensureUniqueKey(request.getConfigKey(), -1L);
        SysConfig config = new SysConfig();
        applyRequest(config, request);
        configMapper.insert(config);
        return config.getId();
    }

    public void update(Long configId, ConfigSaveRequest request) {
        SysConfig config = requireConfig(configId);
        ensureUniqueKey(request.getConfigKey(), configId);
        applyRequest(config, request);
        configMapper.updateById(config);
    }

    public void updateValue(Long configId, String configValue) {
        SysConfig config = requireConfig(configId);
        if (config.getEditable() != null && config.getEditable() == 0) {
            throw new BusinessException(ResultCode.FORBIDDEN, "该配置项不允许在界面修改");
        }
        config.setConfigValue(configValue);
        configMapper.updateById(config);
    }

    public void delete(Long configId) {
        requireConfig(configId);
        configMapper.deleteById(configId);
    }

    private void applyRequest(SysConfig config, ConfigSaveRequest request) {
        config.setCategory(request.getCategory());
        config.setConfigKey(request.getConfigKey());
        config.setConfigName(request.getConfigName());
        config.setConfigValue(request.getConfigValue());
        config.setPendingConfirm(request.getPendingConfirm() == null ? 0 : request.getPendingConfirm());
        config.setEditable(request.getEditable() == null ? 1 : request.getEditable());
        config.setRemark(request.getRemark());
    }

    private void ensureUniqueKey(String configKey, Long excludeId) {
        if (configMapper.countByConfigKey(configKey, excludeId) > 0) {
            throw new BusinessException(ResultCode.CONFLICT, "配置键已存在: " + configKey);
        }
    }

    private SysConfig requireConfig(Long configId) {
        SysConfig config = configMapper.selectById(configId);
        if (config == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "配置项不存在: " + configId);
        }
        return config;
    }
}
