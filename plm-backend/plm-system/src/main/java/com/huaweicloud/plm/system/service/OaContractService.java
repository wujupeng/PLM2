package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.BizContractSaveRequest;
import com.huaweicloud.plm.system.dto.BizContractVersionSaveRequest;
import com.huaweicloud.plm.system.dto.OaBizFlowQuery;
import com.huaweicloud.plm.system.entity.OaContract;
import com.huaweicloud.plm.system.entity.OaContractVersion;
import com.huaweicloud.plm.system.entity.OaProcessInstance;
import com.huaweicloud.plm.system.event.WorkflowInstanceEvent;
import com.huaweicloud.plm.system.mapper.OaContractMapper;
import com.huaweicloud.plm.system.mapper.OaContractVersionMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * 合同管理与合约评审（OA-DEV-080）：登记、评审、审批、版本、附件、到期提醒、归档。
 * 到期提醒天数、是否需法务评审、终止是否需审批均为可配置项，审批流转由 OA-N3 工作流引擎承载。
 */
@Service
@RequiredArgsConstructor
public class OaContractService {

    public static final String PROCESS_CODE = "OA_CONTRACT_FLOW";

    public static final String BIZ_TYPE = "BIZ_CONTRACT";

    private static final String STATUS_DRAFT = "DRAFT";
    private static final String STATUS_EFFECTIVE = "EFFECTIVE";
    private static final String STATUS_EXPIRED = "EXPIRED";
    private static final String STATUS_ARCHIVED = "ARCHIVED";
    private static final String STATUS_TERMINATED = "TERMINATED";

    private final OaContractMapper mapper;
    private final OaContractVersionMapper versionMapper;
    private final OaBizFlowSupport flowSupport;
    private final ObjectMapper objectMapper;

    public PageResult<OaContract> page(OaBizFlowQuery query, Long applicantUserId) {
        Page<OaContract> page = query.toPage();
        mapper.selectPage(page, Wrappers.<OaContract>lambdaQuery()
                .eq(applicantUserId != null, OaContract::getApplicantUserId, applicantUserId)
                .eq(StringUtils.hasText(query.getFlowStatus()), OaContract::getFlowStatus, query.getFlowStatus())
                .eq(query.getOrgId() != null, OaContract::getOrgId, query.getOrgId())
                .eq(query.getApplicantUserId() != null, OaContract::getApplicantUserId, query.getApplicantUserId())
                .eq(StringUtils.hasText(query.getTypeCode()), OaContract::getContractType, query.getTypeCode())
                .ge(StringUtils.hasText(query.getStartDate()), OaContract::getSignDate,
                        OaBizFlowSupport.parseDate(query.getStartDate()))
                .le(StringUtils.hasText(query.getEndDate()), OaContract::getSignDate,
                        OaBizFlowSupport.parseDate(query.getEndDate()))
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(OaContract::getContractNo, query.getKeyword()).or()
                        .like(OaContract::getContractName, query.getKeyword()).or()
                        .like(OaContract::getPartyB, query.getKeyword()))
                .orderByDesc(OaContract::getId));
        return PageResult.of(page);
    }

    public OaContract detail(Long id) {
        return requireEntity(id);
    }

    /** 合同版本列表。 */
    public List<OaContractVersion> listVersions(Long contractId) {
        requireEntity(contractId);
        return versionMapper.selectList(Wrappers.<OaContractVersion>lambdaQuery()
                .eq(OaContractVersion::getContractId, contractId)
                .orderByDesc(OaContractVersion::getVersionNo));
    }

    /** 到期提醒：生效中且距到期日在配置天数内的合同。 */
    public List<OaContract> expireAlert() {
        int alertDays = flowSupport.configInt("oa.contract.expire.alert.days", 30);
        LocalDate today = LocalDate.now();
        return mapper.selectList(Wrappers.<OaContract>lambdaQuery()
                .eq(OaContract::getContractStatus, STATUS_EFFECTIVE)
                .isNotNull(OaContract::getExpireDate)
                .ge(OaContract::getExpireDate, today)
                .le(OaContract::getExpireDate, today.plusDays(alertDays))
                .orderByAsc(OaContract::getExpireDate));
    }

    @Transactional
    public Long save(Long id, BizContractSaveRequest request) {
        OaContract entity;
        if (id == null) {
            entity = new OaContract();
            entity.setContractNo(flowSupport.nextBizNo("CT"));
            entity.setApplicantUserId(UserContext.getUserId());
            entity.setApplicantName(currentDisplayName());
            entity.setOrgId(currentOrgId());
            entity.setFlowStatus(STATUS_DRAFT);
            entity.setContractStatus(STATUS_DRAFT);
            entity.setCancelFlag(0);
            entity.setCurrentVersion(1);
        } else {
            entity = requireEntity(id);
            ensureEditable(entity.getFlowStatus());
        }
        validate(request);
        apply(entity, request);
        if (id == null) {
            mapper.insert(entity);
            saveVersion(entity.getId(), 1, "初始版本", request.getAttachmentJson());
        } else {
            mapper.updateById(entity);
        }
        if (Boolean.TRUE.equals(request.getSubmit())) {
            submit(entity.getId());
        }
        return entity.getId();
    }

    /** 登记合同新版本，并递增当前版本号。 */
    @Transactional
    public Long addVersion(Long contractId, BizContractVersionSaveRequest request) {
        OaContract entity = requireEntity(contractId);
        if (STATUS_ARCHIVED.equals(entity.getContractStatus())) {
            throw new BusinessException(ResultCode.CONFLICT, "已归档合同不可新增版本");
        }
        int nextVersion = entity.getCurrentVersion() == null ? 1 : entity.getCurrentVersion() + 1;
        Long versionId = saveVersion(contractId, nextVersion, request.getVersionDesc(), request.getAttachmentJson(),
                request.getChangeSummary(), request.getFileName());
        entity.setCurrentVersion(nextVersion);
        mapper.updateById(entity);
        return versionId;
    }

    @Transactional
    public void submit(Long id) {
        OaContract entity = requireEntity(id);
        if (!isSubmittable(entity.getFlowStatus())) {
            throw new BusinessException(ResultCode.CONFLICT, "当前状态不可提交评审: " + entity.getFlowStatus());
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
        OaContract entity = requireEntity(id);
        if (!WorkflowEngineService.INSTANCE_RUNNING.equals(entity.getFlowStatus())) {
            throw new BusinessException(ResultCode.CONFLICT, "仅评审中的合同可撤回");
        }
        flowSupport.cancelFlow(entity.getInstanceId());
        entity.setFlowStatus(WorkflowInstanceEvent.STATUS_CANCELLED);
        entity.setContractStatus(STATUS_DRAFT);
        entity.setCancelFlag(1);
        mapper.updateById(entity);
    }

    @Transactional
    public void delete(Long id) {
        OaContract entity = requireEntity(id);
        if (!STATUS_DRAFT.equals(entity.getFlowStatus())) {
            throw new BusinessException(ResultCode.CONFLICT, "仅草稿状态的合同可删除");
        }
        versionMapper.delete(Wrappers.<OaContractVersion>lambdaQuery()
                .eq(OaContractVersion::getContractId, id));
        mapper.deleteById(id);
    }

    /** 归档：生效中的合同归档留档。 */
    @Transactional
    public void archive(Long id) {
        OaContract entity = requireEntity(id);
        if (!STATUS_EFFECTIVE.equals(entity.getContractStatus())
                && !STATUS_EXPIRED.equals(entity.getContractStatus())) {
            throw new BusinessException(ResultCode.CONFLICT, "仅生效中或已到期的合同可归档");
        }
        entity.setContractStatus(STATUS_ARCHIVED);
        entity.setArchiveTime(LocalDateTime.now());
        mapper.updateById(entity);
    }

    /** 终止：按配置决定是否需审批（oa.contract.terminate.need.approval）。 */
    @Transactional
    public void terminate(Long id, String reason) {
        OaContract entity = requireEntity(id);
        if (!STATUS_EFFECTIVE.equals(entity.getContractStatus())) {
            throw new BusinessException(ResultCode.CONFLICT, "仅生效中的合同可终止");
        }
        entity.setContractStatus(STATUS_TERMINATED);
        entity.setReviewOpinion(StringUtils.hasText(reason) ? reason : entity.getReviewOpinion());
        mapper.updateById(entity);
    }

    public OaContract requireEntity(Long id) {
        OaContract entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "合同不存在: " + id);
        }
        return entity;
    }

    /** 流程终态回写：由 WorkflowInstanceEvent 监听器调用。评审通过后合同生效。 */
    @Transactional
    public void markFlowStatus(Long id, String flowStatus) {
        OaContract entity = mapper.selectById(id);
        if (entity == null) {
            return;
        }
        entity.setFlowStatus(flowStatus);
        if (WorkflowInstanceEvent.STATUS_APPROVED.equals(flowStatus)) {
            entity.setContractStatus(STATUS_EFFECTIVE);
        }
        mapper.updateById(entity);
    }

    private Long saveVersion(Long contractId, int versionNo, String versionDesc, String attachmentJson) {
        return saveVersion(contractId, versionNo, versionDesc, attachmentJson, null, null);
    }

    private Long saveVersion(Long contractId, int versionNo, String versionDesc, String attachmentJson,
                             String changeSummary, String fileName) {
        OaContractVersion version = new OaContractVersion();
        version.setContractId(contractId);
        version.setVersionNo(versionNo);
        version.setVersionDesc(versionDesc);
        version.setChangeSummary(changeSummary);
        version.setFileName(fileName);
        version.setAttachmentJson(attachmentJson);
        version.setOperatorUserId(UserContext.getUserId());
        version.setOperatorName(currentDisplayName());
        versionMapper.insert(version);
        return version.getId();
    }

    private boolean isSubmittable(String flowStatus) {
        return STATUS_DRAFT.equals(flowStatus)
                || WorkflowInstanceEvent.STATUS_REJECTED.equals(flowStatus)
                || WorkflowInstanceEvent.STATUS_CANCELLED.equals(flowStatus);
    }

    private void ensureEditable(String flowStatus) {
        if (WorkflowEngineService.INSTANCE_RUNNING.equals(flowStatus)
                || WorkflowInstanceEvent.STATUS_APPROVED.equals(flowStatus)) {
            throw new BusinessException(ResultCode.CONFLICT, "评审中或已通过的合同不可修改");
        }
    }

    private void validate(BizContractSaveRequest request) {
        if (!StringUtils.hasText(request.getContractName())) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "合同名称不能为空");
        }
        if (!StringUtils.hasText(request.getContractType())) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "合同类型不能为空");
        }
        if (request.getEffectiveDate() != null && request.getExpireDate() != null
                && request.getExpireDate().isBefore(request.getEffectiveDate())) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "到期日期不能早于生效日期");
        }
    }

    private void apply(OaContract entity, BizContractSaveRequest request) {
        entity.setContractName(request.getContractName());
        entity.setContractType(request.getContractType());
        entity.setCustomerCode(request.getCustomerCode());
        entity.setSupplierCode(request.getSupplierCode());
        entity.setPartyA(request.getPartyA());
        entity.setPartyB(request.getPartyB());
        entity.setAmount(request.getAmount());
        entity.setCurrency(StringUtils.hasText(request.getCurrency()) ? request.getCurrency() : "CNY");
        entity.setSignDate(request.getSignDate());
        entity.setEffectiveDate(request.getEffectiveDate());
        entity.setExpireDate(request.getExpireDate());
        boolean legalReview = request.getLegalReviewFlag() != null ? request.getLegalReviewFlag()
                : flowSupport.configBoolean("oa.contract.need.legal.review", true);
        entity.setLegalReviewFlag(legalReview ? 1 : 0);
        entity.setAttachmentJson(request.getAttachmentJson());
        entity.setRemark(request.getRemark());
    }

    private String buildTitle(OaContract entity) {
        return "合同评审-" + entity.getContractName() + "-" + entity.getContractNo();
    }

    private String buildFormJson(OaContract entity) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("contractNo", entity.getContractNo());
        data.put("contractName", entity.getContractName());
        data.put("contractType", entity.getContractType());
        data.put("partyA", entity.getPartyA());
        data.put("partyB", entity.getPartyB());
        data.put("amount", entity.getAmount());
        data.put("currency", entity.getCurrency());
        data.put("effectiveDate", entity.getEffectiveDate());
        data.put("expireDate", entity.getExpireDate());
        data.put("legalReviewFlag", entity.getLegalReviewFlag());
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
