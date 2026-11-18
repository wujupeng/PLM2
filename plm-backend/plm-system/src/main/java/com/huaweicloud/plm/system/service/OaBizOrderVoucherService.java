package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.BizOrderVoucherSaveRequest;
import com.huaweicloud.plm.system.dto.OaBizFlowQuery;
import com.huaweicloud.plm.system.entity.OaBizOrderVoucher;
import com.huaweicloud.plm.system.entity.OaProcessInstance;
import com.huaweicloud.plm.system.event.WorkflowInstanceEvent;
import com.huaweicloud.plm.system.mapper.OaBizOrderVoucherMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * 订货传票流程包（OA-DEV-066 销售/进口件、OA-DEV-071 采购）：待 ERP 映射且避免重复建单。
 * ERP 采购/销售订单单据仍由 ERP 生成或回写，OA 承载审批与协同；同步开关为可配置项。
 */
@Service
@RequiredArgsConstructor
public class OaBizOrderVoucherService {

    public static final String PROCESS_CODE = "OA_VOUCHER_FLOW";

    public static final String BIZ_TYPE = "BIZ_VOUCHER";

    private static final String STATUS_DRAFT = "DRAFT";

    private final OaBizOrderVoucherMapper mapper;
    private final OaBizFlowSupport flowSupport;
    private final ObjectMapper objectMapper;

    public PageResult<OaBizOrderVoucher> page(OaBizFlowQuery query, Long applicantUserId) {
        Page<OaBizOrderVoucher> page = query.toPage();
        mapper.selectPage(page, Wrappers.<OaBizOrderVoucher>lambdaQuery()
                .eq(applicantUserId != null, OaBizOrderVoucher::getApplicantUserId, applicantUserId)
                .eq(StringUtils.hasText(query.getFlowStatus()), OaBizOrderVoucher::getFlowStatus, query.getFlowStatus())
                .eq(query.getOrgId() != null, OaBizOrderVoucher::getOrgId, query.getOrgId())
                .eq(query.getApplicantUserId() != null, OaBizOrderVoucher::getApplicantUserId, query.getApplicantUserId())
                .eq(StringUtils.hasText(query.getTypeCode()), OaBizOrderVoucher::getVoucherType, query.getTypeCode())
                .ge(StringUtils.hasText(query.getStartDate()), OaBizOrderVoucher::getDeliveryDate,
                        OaBizFlowSupport.parseDate(query.getStartDate()))
                .le(StringUtils.hasText(query.getEndDate()), OaBizOrderVoucher::getDeliveryDate,
                        OaBizFlowSupport.parseDate(query.getEndDate()))
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(OaBizOrderVoucher::getVoucherNo, query.getKeyword()).or()
                        .like(OaBizOrderVoucher::getOrderNo, query.getKeyword()).or()
                        .like(OaBizOrderVoucher::getMaterialCode, query.getKeyword()))
                .orderByDesc(OaBizOrderVoucher::getId));
        return PageResult.of(page);
    }

    public OaBizOrderVoucher detail(Long id) {
        return requireEntity(id);
    }

    @Transactional
    public Long save(Long id, BizOrderVoucherSaveRequest request) {
        OaBizOrderVoucher entity;
        if (id == null) {
            entity = new OaBizOrderVoucher();
            entity.setVoucherNo(flowSupport.nextBizNo("OV"));
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
        OaBizOrderVoucher entity = requireEntity(id);
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
        OaBizOrderVoucher entity = requireEntity(id);
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
        OaBizOrderVoucher entity = requireEntity(id);
        if (!STATUS_DRAFT.equals(entity.getFlowStatus())) {
            throw new BusinessException(ResultCode.CONFLICT, "仅草稿状态的单据可删除");
        }
        mapper.deleteById(id);
    }

    public OaBizOrderVoucher requireEntity(Long id) {
        OaBizOrderVoucher entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "订货传票不存在: " + id);
        }
        return entity;
    }

    @Transactional
    public void markFlowStatus(Long id, String flowStatus) {
        OaBizOrderVoucher entity = mapper.selectById(id);
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
            throw new BusinessException(ResultCode.CONFLICT, "审批中或已通过的订货传票不可修改");
        }
    }

    private void validate(BizOrderVoucherSaveRequest request) {
        if (!StringUtils.hasText(request.getMaterialCode()) && !StringUtils.hasText(request.getMaterialName())) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "物料编码与名称至少填写一项");
        }
        if (intFlag(request.getImportFlag()) == 1
                && flowSupport.configBoolean("oa.biz.order.voucher.import.need.customs", true)
                && !StringUtils.hasText(request.getTradeTerms())) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "按当前配置，进口件传票需填写报关/贸易条款");
        }
        if (StringUtils.hasText(request.getErpOrderNo())) {
            Long exists = mapper.selectCount(Wrappers.<OaBizOrderVoucher>lambdaQuery()
                    .eq(OaBizOrderVoucher::getErpOrderNo, request.getErpOrderNo()));
            if (exists != null && exists > 0) {
                throw new BusinessException(ResultCode.CONFLICT, "该 ERP 订单已存在订货传票，避免重复建单");
            }
        }
    }

    private void apply(OaBizOrderVoucher entity, BizOrderVoucherSaveRequest request) {
        entity.setVoucherType(StringUtils.hasText(request.getVoucherType()) ? request.getVoucherType() : "SALES");
        entity.setImportFlag(intFlag(request.getImportFlag()));
        entity.setOrderNo(request.getOrderNo());
        entity.setErpOrderNo(request.getErpOrderNo());
        entity.setCustomerCode(request.getCustomerCode());
        entity.setCustomerName(request.getCustomerName());
        entity.setSupplierCode(request.getSupplierCode());
        entity.setSupplierName(request.getSupplierName());
        entity.setMaterialCode(request.getMaterialCode());
        entity.setMaterialName(request.getMaterialName());
        entity.setQty(request.getQty());
        entity.setUnit(StringUtils.hasText(request.getUnit()) ? request.getUnit() : "PCS");
        entity.setDeliveryDate(request.getDeliveryDate());
        entity.setCurrency(StringUtils.hasText(request.getCurrency()) ? request.getCurrency() : "CNY");
        entity.setAmount(request.getAmount());
        entity.setTradeTerms(request.getTradeTerms());
        entity.setAttachmentJson(request.getAttachmentJson());
        entity.setRemark(request.getRemark());
    }

    private int intFlag(Integer value) {
        return value == null ? 0 : value;
    }

    private String buildTitle(OaBizOrderVoucher entity) {
        return "订货传票-" + entity.getMaterialCode() + "-" + entity.getVoucherNo();
    }

    private String buildFormJson(OaBizOrderVoucher entity) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("voucherNo", entity.getVoucherNo());
        data.put("voucherType", entity.getVoucherType());
        data.put("importFlag", entity.getImportFlag());
        data.put("materialCode", entity.getMaterialCode());
        data.put("qty", entity.getQty());
        data.put("deliveryDate", entity.getDeliveryDate() == null ? null : entity.getDeliveryDate().toString());
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
