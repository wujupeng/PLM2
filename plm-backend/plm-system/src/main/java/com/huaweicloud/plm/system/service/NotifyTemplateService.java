package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.system.dto.NotifyTemplateQuery;
import com.huaweicloud.plm.system.dto.NotifyTemplateSaveRequest;
import com.huaweicloud.plm.system.entity.OaNotifyTemplate;
import com.huaweicloud.plm.system.mapper.OaNotifyTemplateMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;

/**
 * 通知模板服务：标题与正文模板、渠道、变量清单均可配置，模板编码在服务层保证唯一。
 */
@Service
@RequiredArgsConstructor
public class NotifyTemplateService {

    public static final String STATUS_ENABLED = "enabled";
    public static final String STATUS_DISABLED = "disabled";

    private final OaNotifyTemplateMapper templateMapper;

    public PageResult<OaNotifyTemplate> page(NotifyTemplateQuery query) {
        Page<OaNotifyTemplate> page = query.toPage();
        templateMapper.selectPage(page, Wrappers.<OaNotifyTemplate>lambdaQuery()
                .eq(StringUtils.hasText(query.getMessageType()),
                        OaNotifyTemplate::getMessageType, query.getMessageType())
                .eq(StringUtils.hasText(query.getChannel()), OaNotifyTemplate::getChannel, query.getChannel())
                .eq(StringUtils.hasText(query.getStatus()), OaNotifyTemplate::getStatus, query.getStatus())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(OaNotifyTemplate::getTemplateCode, query.getKeyword()).or()
                        .like(OaNotifyTemplate::getTemplateName, query.getKeyword()))
                .orderByAsc(OaNotifyTemplate::getTemplateCode));
        return PageResult.of(page);
    }

    /** 供通知发送端选择可用模板。 */
    public List<OaNotifyTemplate> listEnabled() {
        return templateMapper.selectList(Wrappers.<OaNotifyTemplate>lambdaQuery()
                .eq(OaNotifyTemplate::getStatus, STATUS_ENABLED)
                .orderByAsc(OaNotifyTemplate::getTemplateCode));
    }

    public OaNotifyTemplate getDetail(Long templateId) {
        return requireTemplate(templateId);
    }

    public Long create(NotifyTemplateSaveRequest request) {
        String templateCode = request.getTemplateCode().trim();
        ensureUniqueCode(templateCode, null);
        OaNotifyTemplate template = new OaNotifyTemplate();
        applyRequest(template, request, templateCode);
        templateMapper.insert(template);
        return template.getId();
    }

    public void update(Long templateId, NotifyTemplateSaveRequest request) {
        OaNotifyTemplate template = requireTemplate(templateId);
        String templateCode = request.getTemplateCode().trim();
        ensureUniqueCode(templateCode, templateId);
        applyRequest(template, request, templateCode);
        templateMapper.updateById(template);
    }

    public void delete(Long templateId) {
        requireTemplate(templateId);
        templateMapper.deleteById(templateId);
    }

    // ---------------- 内部实现 ----------------

    private void applyRequest(OaNotifyTemplate template, NotifyTemplateSaveRequest request, String templateCode) {
        template.setTemplateCode(templateCode);
        template.setTemplateName(request.getTemplateName());
        template.setMessageType(StringUtils.hasText(request.getMessageType())
                ? request.getMessageType() : NotificationService.TYPE_SYSTEM);
        template.setChannel(StringUtils.hasText(request.getChannel())
                ? request.getChannel() : NotificationService.CHANNEL_STATION);
        template.setTitleTemplate(request.getTitleTemplate());
        template.setContentTemplate(request.getContentTemplate());
        template.setVariableJson(request.getVariableJson());
        template.setStatus(StringUtils.hasText(request.getStatus()) ? request.getStatus() : STATUS_ENABLED);
        template.setRemark(request.getRemark());
    }

    /** 模板编码唯一：数据库为普通索引（逻辑删除后重建），唯一性在服务层保证。 */
    private void ensureUniqueCode(String templateCode, Long excludeId) {
        Long count = templateMapper.selectCount(Wrappers.<OaNotifyTemplate>lambdaQuery()
                .eq(OaNotifyTemplate::getTemplateCode, templateCode)
                .ne(excludeId != null, OaNotifyTemplate::getId, excludeId));
        if (count != null && count > 0) {
            throw new BusinessException(ResultCode.CONFLICT, "模板编码已存在: " + templateCode);
        }
    }

    private OaNotifyTemplate requireTemplate(Long templateId) {
        OaNotifyTemplate template = templateMapper.selectById(templateId);
        if (template == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "通知模板不存在: " + templateId);
        }
        return template;
    }
}
