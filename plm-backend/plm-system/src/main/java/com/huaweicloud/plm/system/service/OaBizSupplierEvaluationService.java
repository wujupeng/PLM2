package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.BizSupplierEvaluationSaveRequest;
import com.huaweicloud.plm.system.dto.OaBizFlowQuery;
import com.huaweicloud.plm.system.entity.OaBizSupplierEvalItem;
import com.huaweicloud.plm.system.entity.OaBizSupplierEvaluation;
import com.huaweicloud.plm.system.entity.OaProcessInstance;
import com.huaweicloud.plm.system.event.WorkflowInstanceEvent;
import com.huaweicloud.plm.system.mapper.OaBizSupplierEvalItemMapper;
import com.huaweicloud.plm.system.mapper.OaBizSupplierEvaluationMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * 供方考评流程包（OA-DEV-068）：月度/季度/年度考评，评分规则可配置、版本可追溯。
 * 评分项权重、等级阈值、默认周期均为可配置项。
 */
@Service
@RequiredArgsConstructor
public class OaBizSupplierEvaluationService {

    public static final String PROCESS_CODE = "OA_SUPPLIER_EVAL_FLOW";

    public static final String BIZ_TYPE = "BIZ_SUPPLIER_EVAL";

    private static final String STATUS_DRAFT = "DRAFT";

    private final OaBizSupplierEvaluationMapper mapper;
    private final OaBizSupplierEvalItemMapper itemMapper;
    private final OaBizFlowSupport flowSupport;
    private final ObjectMapper objectMapper;

    public PageResult<OaBizSupplierEvaluation> page(OaBizFlowQuery query, Long applicantUserId) {
        Page<OaBizSupplierEvaluation> page = query.toPage();
        mapper.selectPage(page, Wrappers.<OaBizSupplierEvaluation>lambdaQuery()
                .eq(applicantUserId != null, OaBizSupplierEvaluation::getEvaluatorUserId, applicantUserId)
                .eq(StringUtils.hasText(query.getFlowStatus()), OaBizSupplierEvaluation::getFlowStatus, query.getFlowStatus())
                .eq(query.getOrgId() != null, OaBizSupplierEvaluation::getOrgId, query.getOrgId())
                .eq(StringUtils.hasText(query.getTypeCode()), OaBizSupplierEvaluation::getEvalPeriod, query.getTypeCode())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(OaBizSupplierEvaluation::getEvalNo, query.getKeyword()).or()
                        .like(OaBizSupplierEvaluation::getSupplierName, query.getKeyword()))
                .orderByDesc(OaBizSupplierEvaluation::getId));
        return PageResult.of(page);
    }

    public OaBizSupplierEvaluation detail(Long id) {
        return requireEntity(id);
    }

    public List<OaBizSupplierEvalItem> listItems(Long evaluationId) {
        requireEntity(evaluationId);
        return itemMapper.selectList(Wrappers.<OaBizSupplierEvalItem>lambdaQuery()
                .eq(OaBizSupplierEvalItem::getEvaluationId, evaluationId)
                .orderByAsc(OaBizSupplierEvalItem::getSortNo)
                .orderByAsc(OaBizSupplierEvalItem::getId));
    }

    @Transactional
    public Long save(Long id, BizSupplierEvaluationSaveRequest request) {
        OaBizSupplierEvaluation entity;
        if (id == null) {
            entity = new OaBizSupplierEvaluation();
            entity.setEvalNo(flowSupport.nextBizNo("SE"));
            entity.setEvaluatorUserId(UserContext.getUserId());
            entity.setEvaluatorName(currentDisplayName());
            entity.setOrgId(currentOrgId());
            entity.setEvalStatus(STATUS_DRAFT);
            entity.setFlowStatus(STATUS_DRAFT);
            entity.setCancelFlag(0);
        } else {
            entity = requireEntity(id);
            ensureEditable(entity.getFlowStatus());
        }
        validate(request);
        entity.setEvalPeriod(StringUtils.hasText(request.getEvalPeriod()) ? request.getEvalPeriod()
                : flowSupport.configString("oa.biz.supplier.eval.default.period", "MONTH"));
        entity.setEvalYear(request.getEvalYear() == null ? currentYear() : request.getEvalYear());
        entity.setEvalQuarter(request.getEvalQuarter());
        entity.setEvalMonth(request.getEvalMonth());
        entity.setSupplierCode(request.getSupplierCode());
        entity.setSupplierName(request.getSupplierName());
        entity.setEvalBasis(request.getEvalBasis());
        entity.setEvalOpinion(request.getEvalOpinion());
        entity.setAttachmentJson(request.getAttachmentJson());
        entity.setRemark(request.getRemark());
        if (id == null) {
            mapper.insert(entity);
        } else {
            mapper.updateById(entity);
        }
        saveItems(entity.getId(), request.getItems());
        OaBizSupplierEvaluation fresh = mapper.selectById(entity.getId());
        if (fresh != null) {
            fresh.setTotalScore(fresh.getTotalScore());
            fresh.setGrade(calcGrade(fresh.getTotalScore()));
            mapper.updateById(fresh);
        }
        if (Boolean.TRUE.equals(request.getSubmit())) {
            submit(entity.getId());
        }
        return entity.getId();
    }

    @Transactional
    public void submit(Long id) {
        OaBizSupplierEvaluation entity = requireEntity(id);
        if (!isSubmittable(entity.getFlowStatus())) {
            throw new BusinessException(ResultCode.CONFLICT, "当前状态不可提交审批: " + entity.getFlowStatus());
        }
        OaProcessInstance instance = flowSupport.startFlow(PROCESS_CODE, BIZ_TYPE, entity.getId(),
                buildTitle(entity), buildFormJson(entity));
        entity.setFlowStatus(WorkflowEngineService.INSTANCE_RUNNING);
        entity.setEvalStatus(WorkflowEngineService.INSTANCE_RUNNING);
        entity.setInstanceId(instance.getId());
        entity.setInstanceNo(instance.getInstanceNo());
        mapper.updateById(entity);
    }

    @Transactional
    public void withdraw(Long id) {
        OaBizSupplierEvaluation entity = requireEntity(id);
        if (!WorkflowEngineService.INSTANCE_RUNNING.equals(entity.getFlowStatus())) {
            throw new BusinessException(ResultCode.CONFLICT, "仅审批中的单据可撤回");
        }
        flowSupport.cancelFlow(entity.getInstanceId());
        entity.setFlowStatus(WorkflowInstanceEvent.STATUS_CANCELLED);
        entity.setEvalStatus(WorkflowInstanceEvent.STATUS_CANCELLED);
        entity.setCancelFlag(1);
        mapper.updateById(entity);
    }

    @Transactional
    public void delete(Long id) {
        OaBizSupplierEvaluation entity = requireEntity(id);
        if (!STATUS_DRAFT.equals(entity.getFlowStatus())) {
            throw new BusinessException(ResultCode.CONFLICT, "仅草稿状态的单据可删除");
        }
        itemMapper.delete(Wrappers.<OaBizSupplierEvalItem>lambdaQuery()
                .eq(OaBizSupplierEvalItem::getEvaluationId, id));
        mapper.deleteById(id);
    }

    public OaBizSupplierEvaluation requireEntity(Long id) {
        OaBizSupplierEvaluation entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "供方考评单不存在: " + id);
        }
        return entity;
    }

    @Transactional
    public void markFlowStatus(Long id, String flowStatus) {
        OaBizSupplierEvaluation entity = mapper.selectById(id);
        if (entity == null) {
            return;
        }
        entity.setFlowStatus(flowStatus);
        entity.setEvalStatus(flowStatus);
        mapper.updateById(entity);
    }

    private void saveItems(Long evaluationId, List<BizSupplierEvaluationSaveRequest.Item> items) {
        itemMapper.delete(Wrappers.<OaBizSupplierEvalItem>lambdaQuery()
                .eq(OaBizSupplierEvalItem::getEvaluationId, evaluationId));
        BigDecimal total = BigDecimal.ZERO;
        int sortNo = 1;
        if (items != null) {
            for (BizSupplierEvaluationSaveRequest.Item item : items) {
                OaBizSupplierEvalItem row = new OaBizSupplierEvalItem();
                row.setEvaluationId(evaluationId);
                row.setItemCode(item.getItemCode());
                row.setItemName(StringUtils.hasText(item.getItemName()) ? item.getItemName() : "评分项" + sortNo);
                row.setWeight(item.getWeight() == null ? BigDecimal.ZERO : item.getWeight());
                row.setMaxScore(item.getMaxScore() == null ? BigDecimal.valueOf(100) : item.getMaxScore());
                row.setScore(item.getScore());
                row.setScoreBasis(item.getScoreBasis());
                row.setSortNo(sortNo++);
                row.setRemark(item.getRemark());
                itemMapper.insert(row);
                if (item.getScore() != null) {
                    total = total.add(item.getScore());
                }
            }
        }
        OaBizSupplierEvaluation entity = mapper.selectById(evaluationId);
        if (entity != null) {
            entity.setEvalItemCount(items == null ? 0 : items.size());
            entity.setTotalScore(items == null || items.isEmpty() ? null : total.setScale(2, RoundingMode.HALF_UP));
            mapper.updateById(entity);
        }
    }

    private String calcGrade(BigDecimal totalScore) {
        if (totalScore == null) {
            return null;
        }
        String json = flowSupport.configString("oa.biz.supplier.eval.grade.rule", "{\"A\":90,\"B\":80,\"C\":70}");
        try {
            JsonNode node = objectMapper.readTree(json);
            double score = totalScore.doubleValue();
            if (node.has("A") && score >= node.get("A").asDouble()) {
                return "A";
            }
            if (node.has("B") && score >= node.get("B").asDouble()) {
                return "B";
            }
            if (node.has("C") && score >= node.get("C").asDouble()) {
                return "C";
            }
        } catch (Exception e) {
            return null;
        }
        return "D";
    }

    private boolean isSubmittable(String flowStatus) {
        return STATUS_DRAFT.equals(flowStatus)
                || WorkflowInstanceEvent.STATUS_REJECTED.equals(flowStatus)
                || WorkflowInstanceEvent.STATUS_CANCELLED.equals(flowStatus);
    }

    private void ensureEditable(String flowStatus) {
        if (WorkflowEngineService.INSTANCE_RUNNING.equals(flowStatus)
                || WorkflowInstanceEvent.STATUS_APPROVED.equals(flowStatus)) {
            throw new BusinessException(ResultCode.CONFLICT, "审批中或已通过的供方考评单不可修改");
        }
    }

    private void validate(BizSupplierEvaluationSaveRequest request) {
        if (!StringUtils.hasText(request.getSupplierName())) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "供应商名称不能为空");
        }
    }

    private int currentYear() {
        return java.time.LocalDate.now().getYear();
    }

    private String buildTitle(OaBizSupplierEvaluation entity) {
        return "供方考评-" + entity.getSupplierName() + "-" + entity.getEvalNo();
    }

    private String buildFormJson(OaBizSupplierEvaluation entity) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("evalNo", entity.getEvalNo());
        data.put("evalPeriod", entity.getEvalPeriod());
        data.put("evalYear", entity.getEvalYear());
        data.put("supplierName", entity.getSupplierName());
        data.put("totalScore", entity.getTotalScore());
        data.put("grade", entity.getGrade());
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
