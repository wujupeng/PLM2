package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.IntegrationQuery;
import com.huaweicloud.plm.system.dto.SysEventTopicSaveRequest;
import com.huaweicloud.plm.system.entity.SysEventTopic;
import com.huaweicloud.plm.system.mapper.SysEventTopicMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * 事件主题（G1-N1 集成平台 T009）：领域事件主题登记、启用/停用状态流转与统计。
 * 消息保留天数默认取自可配置项，便于统一治理消息存储周期。
 */
@Service
@RequiredArgsConstructor
public class SysEventTopicService {

    /** 消息保留天数可配置项键。 */
    private static final String RETENTION_DAYS_KEY = "integration.message.retention.days";
    private static final String STATUS_DRAFT = "DRAFT";
    private static final String STATUS_ACTIVE = "ACTIVE";
    private static final String STATUS_DISABLED = "DISABLED";

    private final SysEventTopicMapper mapper;
    private final OaBizFlowSupport flowSupport;

    public PageResult<SysEventTopic> pageTopics(IntegrationQuery query) {
        Page<SysEventTopic> page = query.toPage();
        mapper.selectPage(page, Wrappers.<SysEventTopic>lambdaQuery()
                .eq(StringUtils.hasText(query.getDomain()), SysEventTopic::getDomain, query.getDomain())
                .eq(StringUtils.hasText(query.getTopicStatus()), SysEventTopic::getTopicStatus, query.getTopicStatus())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(SysEventTopic::getTopicCode, query.getKeyword()).or()
                        .like(SysEventTopic::getTopicName, query.getKeyword()).or()
                        .like(SysEventTopic::getDomain, query.getKeyword()))
                .orderByDesc(SysEventTopic::getId));
        return PageResult.of(page);
    }

    public SysEventTopic detail(Long id) {
        return requireTopic(id);
    }

    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, SysEventTopicSaveRequest request) {
        SysEventTopic entity;
        if (id == null) {
            entity = new SysEventTopic();
            entity.setTopicCode(StringUtils.hasText(request.getTopicCode())
                    ? request.getTopicCode() : flowSupport.nextBizNo("TOPIC"));
            entity.setPersistent(request.getPersistent() != null ? request.getPersistent() : 1);
            entity.setRetentionDays(request.getRetentionDays() != null
                    ? request.getRetentionDays() : flowSupport.configInt(RETENTION_DAYS_KEY, 30));
            entity.setTopicStatus(StringUtils.hasText(request.getTopicStatus())
                    ? request.getTopicStatus() : STATUS_DRAFT);
            entity.setOrgId(currentOrgId());
        } else {
            entity = requireTopic(id);
            if (StringUtils.hasText(request.getTopicCode())) {
                entity.setTopicCode(request.getTopicCode());
            }
            if (request.getPersistent() != null) {
                entity.setPersistent(request.getPersistent());
            }
            if (request.getRetentionDays() != null) {
                entity.setRetentionDays(request.getRetentionDays());
            }
            if (StringUtils.hasText(request.getTopicStatus())) {
                entity.setTopicStatus(request.getTopicStatus());
            }
        }
        entity.setTopicName(request.getTopicName());
        entity.setDomain(request.getDomain());
        entity.setPayloadSchema(request.getPayloadSchema());
        entity.setOwnerName(request.getOwnerName());
        entity.setDescription(request.getDescription());
        entity.setOrgName(request.getOrgName());
        entity.setRemark(request.getRemark());
        if (id == null) {
            mapper.insert(entity);
        } else {
            mapper.updateById(entity);
        }
        return entity.getId();
    }

    /** 启用主题：状态置为 ACTIVE。 */
    @Transactional(rollbackFor = Exception.class)
    public SysEventTopic publish(Long id) {
        return changeStatus(id, STATUS_ACTIVE);
    }

    /** 停用主题：状态置为 DISABLED。 */
    @Transactional(rollbackFor = Exception.class)
    public SysEventTopic disable(Long id) {
        return changeStatus(id, STATUS_DISABLED);
    }

    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        requireTopic(id);
        mapper.deleteById(id);
    }

    /** 事件主题统计。 */
    public Map<String, Object> stats() {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("total", mapper.selectCount(null));
        result.put("draft", mapper.selectCount(Wrappers.<SysEventTopic>lambdaQuery()
                .eq(SysEventTopic::getTopicStatus, STATUS_DRAFT)));
        result.put("active", mapper.selectCount(Wrappers.<SysEventTopic>lambdaQuery()
                .eq(SysEventTopic::getTopicStatus, STATUS_ACTIVE)));
        result.put("disabled", mapper.selectCount(Wrappers.<SysEventTopic>lambdaQuery()
                .eq(SysEventTopic::getTopicStatus, STATUS_DISABLED)));
        result.put("persistentCount", mapper.selectCount(Wrappers.<SysEventTopic>lambdaQuery()
                .eq(SysEventTopic::getPersistent, 1)));
        result.put("transientCount", mapper.selectCount(Wrappers.<SysEventTopic>lambdaQuery()
                .eq(SysEventTopic::getPersistent, 0)));
        result.put("retentionDays", flowSupport.configInt(RETENTION_DAYS_KEY, 30));
        return result;
    }

    public SysEventTopic requireTopic(Long id) {
        SysEventTopic entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "事件主题不存在: " + id);
        }
        return entity;
    }

    private SysEventTopic changeStatus(Long id, String status) {
        SysEventTopic entity = requireTopic(id);
        entity.setTopicStatus(status);
        mapper.updateById(entity);
        return entity;
    }

    private Long currentOrgId() {
        UserContext.Principal principal = UserContext.get();
        return principal == null ? null : principal.orgId();
    }
}
