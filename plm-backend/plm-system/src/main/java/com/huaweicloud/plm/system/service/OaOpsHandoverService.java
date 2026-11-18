package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.OaGoliveQuery;
import com.huaweicloud.plm.system.dto.OaOpsHandoverSaveRequest;
import com.huaweicloud.plm.system.entity.OaOpsHandover;
import com.huaweicloud.plm.system.mapper.OaOpsHandoverMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * 完成知识转移和质保（OA-DEV-121）：运维交接交付物交付、确认与质保期维护。
 * 质保月数为可配置项，便于按项目约定调整。
 */
@Service
@RequiredArgsConstructor
public class OaOpsHandoverService {

    private static final String TYPE_SOURCE = "SOURCE";
    private static final String STATUS_PENDING = "PENDING";
    private static final String STATUS_DELIVERED = "DELIVERED";
    private static final String STATUS_CONFIRMED = "CONFIRMED";
    private static final DateTimeFormatter TS_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    private final OaOpsHandoverMapper mapper;
    private final OaBizFlowSupport flowSupport;

    public PageResult<OaOpsHandover> pageHandovers(OaGoliveQuery query) {
        Page<OaOpsHandover> page = query.toPage();
        mapper.selectPage(page, Wrappers.<OaOpsHandover>lambdaQuery()
                .eq(StringUtils.hasText(query.getDeliverableType()),
                        OaOpsHandover::getDeliverableType, query.getDeliverableType())
                .eq(StringUtils.hasText(query.getHandoverStatus()),
                        OaOpsHandover::getHandoverStatus, query.getHandoverStatus())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(OaOpsHandover::getHandoverNo, query.getKeyword()).or()
                        .like(OaOpsHandover::getHandoverName, query.getKeyword()).or()
                        .like(OaOpsHandover::getDeliverableDesc, query.getKeyword()))
                .orderByDesc(OaOpsHandover::getId));
        return PageResult.of(page);
    }

    public OaOpsHandover detail(Long id) {
        return requireHandover(id);
    }

    @Transactional
    public Long save(Long id, OaOpsHandoverSaveRequest request) {
        OaOpsHandover entity;
        if (id == null) {
            entity = new OaOpsHandover();
            entity.setHandoverNo(StringUtils.hasText(request.getHandoverNo())
                    ? request.getHandoverNo() : flowSupport.nextBizNo("OH"));
            entity.setDeliverableType(StringUtils.hasText(request.getDeliverableType())
                    ? request.getDeliverableType() : TYPE_SOURCE);
            entity.setHandoverStatus(StringUtils.hasText(request.getHandoverStatus())
                    ? request.getHandoverStatus() : STATUS_PENDING);
            entity.setWarrantyMonths(request.getWarrantyMonths() != null
                    ? request.getWarrantyMonths() : flowSupport.configInt("oa.ops.warranty.months", 12));
            entity.setAcceptanceVerified(request.getAcceptanceVerified() == null ? 0 : request.getAcceptanceVerified());
            entity.setOrgId(currentOrgId());
        } else {
            entity = requireHandover(id);
            if (StringUtils.hasText(request.getHandoverNo())) {
                entity.setHandoverNo(request.getHandoverNo());
            }
            if (StringUtils.hasText(request.getDeliverableType())) {
                entity.setDeliverableType(request.getDeliverableType());
            }
            if (StringUtils.hasText(request.getHandoverStatus())) {
                entity.setHandoverStatus(request.getHandoverStatus());
            }
            if (request.getWarrantyMonths() != null) {
                entity.setWarrantyMonths(request.getWarrantyMonths());
            }
            if (request.getAcceptanceVerified() != null) {
                entity.setAcceptanceVerified(request.getAcceptanceVerified());
            }
        }
        entity.setHandoverName(request.getHandoverName());
        entity.setDeliverableDesc(request.getDeliverableDesc());
        entity.setLocation(request.getLocation());
        entity.setDeliveredTime(parseTimestamp(request.getDeliveredTime()));
        entity.setReceiver(request.getReceiver());
        entity.setConfirmTime(parseTimestamp(request.getConfirmTime()));
        entity.setWarrantyStart(parseTimestamp(request.getWarrantyStart()));
        entity.setWarrantyEnd(parseTimestamp(request.getWarrantyEnd()));
        entity.setOrgName(request.getOrgName());
        entity.setRemark(request.getRemark());
        if (id == null) {
            mapper.insert(entity);
        } else {
            mapper.updateById(entity);
        }
        return entity.getId();
    }

    @Transactional
    public void delete(Long id) {
        requireHandover(id);
        mapper.deleteById(id);
    }

    /** 交付交接物：回写交接状态、交付时间与接收人。 */
    @Transactional
    public OaOpsHandover deliver(Long id, String receiver) {
        OaOpsHandover entity = requireHandover(id);
        entity.setHandoverStatus(STATUS_DELIVERED);
        entity.setDeliveredTime(LocalDateTime.now());
        if (StringUtils.hasText(receiver)) {
            entity.setReceiver(receiver);
        }
        mapper.updateById(entity);
        return entity;
    }

    /** 确认交接：交付物尚未交付时不可确认。 */
    @Transactional
    public OaOpsHandover confirm(Long id) {
        OaOpsHandover entity = requireHandover(id);
        if (!STATUS_DELIVERED.equals(entity.getHandoverStatus())) {
            throw new BusinessException(ResultCode.CONFLICT, "交付物尚未交付，无法确认");
        }
        entity.setHandoverStatus(STATUS_CONFIRMED);
        entity.setConfirmTime(LocalDateTime.now());
        entity.setAcceptanceVerified(1);
        mapper.updateById(entity);
        return entity;
    }

    /** 运维交接统计。 */
    public Map<String, Object> stats() {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("total", mapper.selectCount(null));
        result.put("pending", mapper.selectCount(Wrappers.<OaOpsHandover>lambdaQuery()
                .eq(OaOpsHandover::getHandoverStatus, STATUS_PENDING)));
        result.put("delivered", mapper.selectCount(Wrappers.<OaOpsHandover>lambdaQuery()
                .eq(OaOpsHandover::getHandoverStatus, STATUS_DELIVERED)));
        result.put("confirmed", mapper.selectCount(Wrappers.<OaOpsHandover>lambdaQuery()
                .eq(OaOpsHandover::getHandoverStatus, STATUS_CONFIRMED)));
        result.put("warrantyMonths", flowSupport.configInt("oa.ops.warranty.months", 12));
        result.put("acceptanceVerifiedCount", mapper.selectCount(Wrappers.<OaOpsHandover>lambdaQuery()
                .eq(OaOpsHandover::getAcceptanceVerified, 1)));
        return result;
    }

    public OaOpsHandover requireHandover(Long id) {
        OaOpsHandover entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "运维交接记录不存在: " + id);
        }
        return entity;
    }

    private LocalDateTime parseTimestamp(String value) {
        if (!StringUtils.hasText(value)) {
            return null;
        }
        try {
            return LocalDateTime.parse(value.trim(), TS_FORMATTER);
        } catch (Exception e) {
            return null;
        }
    }

    private Long currentOrgId() {
        UserContext.Principal principal = UserContext.get();
        return principal == null ? null : principal.orgId();
    }
}
