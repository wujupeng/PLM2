package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.BizEdiNoticeSaveRequest;
import com.huaweicloud.plm.system.dto.OaIntegrationQuery;
import com.huaweicloud.plm.system.entity.OaEdiNotice;
import com.huaweicloud.plm.system.mapper.OaEdiNoticeMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * EDI 状态通知（OA-DEV-093）：接收报文状态、失败告警与交付异常，关联 OA 待办与处理留痕。
 */
@Service
@RequiredArgsConstructor
public class OaEdiNoticeService {

    private static final String STATUS_PENDING = "PENDING";
    private static final String STATUS_HANDLED = "HANDLED";
    private static final DateTimeFormatter TS_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    private final OaEdiNoticeMapper mapper;
    private final OaBizFlowSupport flowSupport;

    public PageResult<OaEdiNotice> page(OaIntegrationQuery query) {
        Page<OaEdiNotice> page = query.toPage();
        mapper.selectPage(page, Wrappers.<OaEdiNotice>lambdaQuery()
                .eq(StringUtils.hasText(query.getNoticeType()), OaEdiNotice::getNoticeType, query.getNoticeType())
                .eq(StringUtils.hasText(query.getHandleStatus()), OaEdiNotice::getHandleStatus, query.getHandleStatus())
                .eq(query.getAlertFlag() != null, OaEdiNotice::getAlertFlag, query.getAlertFlag())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(OaEdiNotice::getNoticeNo, query.getKeyword()).or()
                        .like(OaEdiNotice::getMessageId, query.getKeyword()).or()
                        .like(OaEdiNotice::getOrderNo, query.getKeyword()).or()
                        .like(OaEdiNotice::getPartnerName, query.getKeyword()))
                .orderByDesc(OaEdiNotice::getId));
        return PageResult.of(page);
    }

    public OaEdiNotice detail(Long id) {
        return requireEntity(id);
    }

    @Transactional
    public Long save(Long id, BizEdiNoticeSaveRequest request) {
        if (id != null) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "EDI 通知为外部推送记录，不支持修改");
        }
        if (!StringUtils.hasText(request.getMessageId())) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "报文ID不能为空");
        }
        OaEdiNotice entity = new OaEdiNotice();
        entity.setNoticeNo(flowSupport.nextBizNo("EDI"));
        entity.setMessageId(request.getMessageId());
        entity.setPartnerCode(request.getPartnerCode());
        entity.setPartnerName(request.getPartnerName());
        entity.setOrderNo(request.getOrderNo());
        entity.setNoticeType(StringUtils.hasText(request.getNoticeType()) ? request.getNoticeType() : "STATUS");
        entity.setNoticeStatus(request.getNoticeStatus());
        boolean alert = Boolean.TRUE.equals(request.getAlertFlag());
        entity.setAlertFlag(alert ? 1 : 0);
        // EDI 异常按配置自动生成 OA 待办标记
        boolean todoEnabled = flowSupport.configBoolean("oa.integration.edi.todo.enabled", true);
        entity.setTodoFlag(alert && todoEnabled ? 1 : (Boolean.TRUE.equals(request.getTodoFlag()) ? 1 : 0));
        entity.setReceivedTime(parseTimestamp(request.getReceivedTime()));
        entity.setHandleStatus(STATUS_PENDING);
        entity.setOrgId(currentOrgId());
        entity.setRemark(request.getRemark());
        mapper.insert(entity);
        return entity.getId();
    }

    @Transactional
    public void delete(Long id) {
        requireEntity(id);
        mapper.deleteById(id);
    }

    /** 处理 EDI 通知。 */
    @Transactional
    public OaEdiNotice handle(Long id, String handleRemark) {
        OaEdiNotice entity = requireEntity(id);
        if (STATUS_HANDLED.equals(entity.getHandleStatus())) {
            throw new BusinessException(ResultCode.CONFLICT, "该 EDI 通知已处理，无需重复处理");
        }
        entity.setHandleStatus(STATUS_HANDLED);
        entity.setHandleUserId(UserContext.getUserId());
        UserContext.Principal principal = UserContext.get();
        entity.setHandleUserName(principal == null ? null : principal.displayName());
        entity.setHandleRemark(handleRemark);
        mapper.updateById(entity);
        return entity;
    }

    /** EDI 通知统计。 */
    public Map<String, Object> stats() {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("total", mapper.selectCount(null));
        result.put("pending", mapper.selectCount(Wrappers.<OaEdiNotice>lambdaQuery()
                .eq(OaEdiNotice::getHandleStatus, STATUS_PENDING)));
        result.put("handled", mapper.selectCount(Wrappers.<OaEdiNotice>lambdaQuery()
                .eq(OaEdiNotice::getHandleStatus, STATUS_HANDLED)));
        result.put("alert", mapper.selectCount(Wrappers.<OaEdiNotice>lambdaQuery()
                .eq(OaEdiNotice::getAlertFlag, 1)));
        result.put("todoEnabled", flowSupport.configBoolean("oa.integration.edi.todo.enabled", true));
        return result;
    }

    public OaEdiNotice requireEntity(Long id) {
        OaEdiNotice entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "EDI 通知不存在: " + id);
        }
        return entity;
    }

    private LocalDateTime parseTimestamp(String value) {
        if (!StringUtils.hasText(value)) {
            return LocalDateTime.now();
        }
        try {
            return LocalDateTime.parse(value.trim(), TS_FORMATTER);
        } catch (Exception e) {
            return LocalDateTime.now();
        }
    }

    private Long currentOrgId() {
        UserContext.Principal principal = UserContext.get();
        return principal == null ? null : principal.orgId();
    }
}
