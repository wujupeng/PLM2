package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.BizPriceApprovalSaveRequest;
import com.huaweicloud.plm.system.dto.OaBizFlowQuery;
import com.huaweicloud.plm.system.entity.OaBizPriceApproval;
import com.huaweicloud.plm.system.entity.OaProcessInstance;
import com.huaweicloud.plm.system.event.WorkflowInstanceEvent;
import com.huaweicloud.plm.system.mapper.OaBizPriceApprovalMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.temporal.ChronoUnit;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * 价格审批流程包（OA-DEV-063 销售价格 / OA-DEV-071 零件价格）：价格数据权限隔离、版本可追踪。
 * 是否必须填写成本依据、价格有效期上限等为可配置项。
 */
@Service
@RequiredArgsConstructor
public class OaBizPriceApprovalService {

    public static final String PROCESS_CODE = "OA_PRICE_FLOW";

    public static final String BIZ_TYPE = "BIZ_PRICE";

    private static final String STATUS_DRAFT = "DRAFT";

    private final OaBizPriceApprovalMapper mapper;
    private final OaBizFlowSupport flowSupport;
    private final ObjectMapper objectMapper;

    public PageResult<OaBizPriceApproval> page(OaBizFlowQuery query, Long applicantUserId) {
        Page<OaBizPriceApproval> page = query.toPage();
        mapper.selectPage(page, Wrappers.<OaBizPriceApproval>lambdaQuery()
                .eq(applicantUserId != null, OaBizPriceApproval::getApplicantUserId, applicantUserId)
                .eq(StringUtils.hasText(query.getFlowStatus()), OaBizPriceApproval::getFlowStatus, query.getFlowStatus())
                .eq(query.getOrgId() != null, OaBizPriceApproval::getOrgId, query.getOrgId())
                .eq(query.getApplicantUserId() != null, OaBizPriceApproval::getApplicantUserId, query.getApplicantUserId())
                .eq(StringUtils.hasText(query.getTypeCode()), OaBizPriceApproval::getPriceCategory, query.getTypeCode())
                .ge(StringUtils.hasText(query.getStartDate()), OaBizPriceApproval::getEffectiveFrom,
                        OaBizFlowSupport.parseDate(query.getStartDate()))
                .le(StringUtils.hasText(query.getEndDate()), OaBizPriceApproval::getEffectiveFrom,
                        OaBizFlowSupport.parseDate(query.getEndDate()))
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(OaBizPriceApproval::getPriceNo, query.getKeyword()).or()
                        .like(OaBizPriceApproval::getMaterialCode, query.getKeyword()).or()
                        .like(OaBizPriceApproval::getMaterialName, query.getKeyword()))
                .orderByDesc(OaBizPriceApproval::getId));
        return PageResult.of(page);
    }

    public OaBizPriceApproval detail(Long id) {
        return requireEntity(id);
    }

    @Transactional
    public Long save(Long id, BizPriceApprovalSaveRequest request) {
        OaBizPriceApproval entity;
        if (id == null) {
            entity = new OaBizPriceApproval();
            entity.setPriceNo(flowSupport.nextBizNo("PR"));
            entity.setApplicantUserId(UserContext.getUserId());
            entity.setApplicantName(currentDisplayName());
            entity.setOrgId(currentOrgId());
            entity.setFlowStatus(STATUS_DRAFT);
            entity.setCancelFlag(0);
        } else {
            entity = requireEntity(id);
            ensureEditable(entity.getFlowStatus());
        }
        validate(request);
        apply(entity, request);
        if (id == null) {
            mapper.insert(entity);
        } else {
            mapper.updateById(entity);
        }
        if (Boolean.TRUE.equals(request.getSubmit())) {
            submit(entity.getId());
        }
        return entity.getId();
    }

    @Transactional
    public void submit(Long id) {
        OaBizPriceApproval entity = requireEntity(id);
        if (!isSubmittable(entity.getFlowStatus())) {
            throw new BusinessException(ResultCode.CONFLICT, "当前状态不可提交审批: " + entity.getFlowStatus());
        }
        OaProcessInstance instance = flowSupport.startFlow(PROCESS_CODE, BIZ_TYPE, entity.getId(),
                buildTitle(entity), buildFormJson(entity));
        entity.setFlowStatus(WorkflowEngineService.INSTANCE_RUNNING);
        entity.setInstanceId(instance.getId());
        entity.setInstanceNo(instance.getInstanceNo());
        mapper.updateById(entity);
    }

    @Transactional
    public void withdraw(Long id) {
        OaBizPriceApproval entity = requireEntity(id);
        if (!WorkflowEngineService.INSTANCE_RUNNING.equals(entity.getFlowStatus())) {
            throw new BusinessException(ResultCode.CONFLICT, "仅审批中的单据可撤回");
        }
        flowSupport.cancelFlow(entity.getInstanceId());
        entity.setFlowStatus(WorkflowInstanceEvent.STATUS_CANCELLED);
        entity.setCancelFlag(1);
        mapper.updateById(entity);
    }

    @Transactional
    public void delete(Long id) {
        OaBizPriceApproval entity = requireEntity(id);
        if (!STATUS_DRAFT.equals(entity.getFlowStatus())) {
            throw new BusinessException(ResultCode.CONFLICT, "仅草稿状态的单据可删除");
        }
        mapper.deleteById(id);
    }

    public OaBizPriceApproval requireEntity(Long id) {
        OaBizPriceApproval entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "价格审批单不存在: " + id);
        }
        return entity;
    }

    @Transactional
    public void markFlowStatus(Long id, String flowStatus) {
        OaBizPriceApproval entity = mapper.selectById(id);
        if (entity == null) {
            return;
        }
        entity.setFlowStatus(flowStatus);
        mapper.updateById(entity);
    }

    private boolean isSubmittable(String flowStatus) {
        return STATUS_DRAFT.equals(flowStatus)
                || WorkflowInstanceEvent.STATUS_REJECTED.equals(flowStatus)
                || WorkflowInstanceEvent.STATUS_CANCELLED.equals(flowStatus);
    }

    private void ensureEditable(String flowStatus) {
        if (WorkflowEngineService.INSTANCE_RUNNING.equals(flowStatus)
                || WorkflowInstanceEvent.STATUS_APPROVED.equals(flowStatus)) {
            throw new BusinessException(ResultCode.CONFLICT, "审批中或已通过的价格单不可修改");
        }
    }

    private void validate(BizPriceApprovalSaveRequest request) {
        if (request.getPriceAmount() == null) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "价格不能为空");
        }
        if (flowSupport.configBoolean("oa.biz.price.need.cost.basis", true)
                && !StringUtils.hasText(request.getCostBasis())) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "按当前配置，价格审批需填写成本依据");
        }
        int maxDays = flowSupport.configInt("oa.biz.price.max.valid.days", 365);
        if (maxDays > 0 && request.getEffectiveFrom() != null && request.getEffectiveTo() != null
                && ChronoUnit.DAYS.between(request.getEffectiveFrom(), request.getEffectiveTo()) > maxDays) {
            throw new BusinessException(ResultCode.BAD_REQUEST,
                    "价格有效期不得超过 " + maxDays + " 天，如需调整请联系管理员配置");
        }
    }

    private void apply(OaBizPriceApproval entity, BizPriceApprovalSaveRequest request) {
        entity.setPriceCategory(StringUtils.hasText(request.getPriceCategory()) ? request.getPriceCategory() : "SALES");
        entity.setChangeType(StringUtils.hasText(request.getChangeType()) ? request.getChangeType() : "NEW");
        entity.setMaterialCode(request.getMaterialCode());
        entity.setMaterialName(request.getMaterialName());
        entity.setCustomerCode(request.getCustomerCode());
        entity.setCustomerName(request.getCustomerName());
        entity.setSupplierCode(request.getSupplierCode());
        entity.setSupplierName(request.getSupplierName());
        entity.setPriceAmount(request.getPriceAmount());
        entity.setOldPrice(request.getOldPrice());
        entity.setCurrency(StringUtils.hasText(request.getCurrency()) ? request.getCurrency() : "CNY");
        entity.setPriceUnit(StringUtils.hasText(request.getPriceUnit()) ? request.getPriceUnit() : "PCS");
        entity.setEffectiveFrom(request.getEffectiveFrom());
        entity.setEffectiveTo(request.getEffectiveTo());
        entity.setCostBasis(request.getCostBasis());
        entity.setAttachmentJson(request.getAttachmentJson());
        entity.setRemark(request.getRemark());
    }

    private String buildTitle(OaBizPriceApproval entity) {
        return "价格审批-" + entity.getMaterialCode() + "-" + entity.getPriceNo();
    }

    private String buildFormJson(OaBizPriceApproval entity) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("priceNo", entity.getPriceNo());
        data.put("priceCategory", entity.getPriceCategory());
        data.put("materialCode", entity.getMaterialCode());
        data.put("priceAmount", entity.getPriceAmount());
        data.put("currency", entity.getCurrency());
        data.put("effectiveFrom", entity.getEffectiveFrom() == null ? null : entity.getEffectiveFrom().toString());
        data.put("effectiveTo", entity.getEffectiveTo() == null ? null : entity.getEffectiveTo().toString());
        try {
            return objectMapper.writeValueAsString(data);
        } catch (Exception e) {
            return "{}";
        }
    }

    private String currentDisplayName() {
        UserContext.Principal principal = UserContext.get();
        return principal == null ? null : principal.displayName();
    }

    private Long currentOrgId() {
        UserContext.Principal principal = UserContext.get();
        return principal == null ? null : principal.orgId();
    }
}
