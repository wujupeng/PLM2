package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.system.dto.EcrSaveRequest;
import com.huaweicloud.plm.system.dto.QualityIssueActionSaveRequest;
import com.huaweicloud.plm.system.dto.QualityIssueActionVerifyRequest;
import com.huaweicloud.plm.system.dto.QualityIssueCloseRequest;
import com.huaweicloud.plm.system.dto.QualityIssueDetailResponse;
import com.huaweicloud.plm.system.dto.QualityIssueEcrResult;
import com.huaweicloud.plm.system.dto.QualityIssueQuery;
import com.huaweicloud.plm.system.dto.QualityIssueSaveRequest;
import com.huaweicloud.plm.system.dto.QualityIssueToEcrRequest;
import com.huaweicloud.plm.system.dto.QualityIssueUpdateRequest;
import com.huaweicloud.plm.system.entity.EcoChangeRequest;
import com.huaweicloud.plm.system.entity.QualityDefectCode;
import com.huaweicloud.plm.system.entity.QualityIssue;
import com.huaweicloud.plm.system.entity.QualityIssueAction;
import com.huaweicloud.plm.system.mapper.EcoChangeRequestMapper;
import com.huaweicloud.plm.system.mapper.QualityDefectCodeMapper;
import com.huaweicloud.plm.system.mapper.QualityIssueActionMapper;
import com.huaweicloud.plm.system.mapper.QualityIssueMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

/**
 * 质量问题单服务（DEV-049 / DEV-050）：登记、措施跟踪、闭环关闭与转工程变更。
 */
@Service
@RequiredArgsConstructor
public class QualityIssueService {

    private static final DateTimeFormatter MONTH_FORMAT = DateTimeFormatter.ofPattern("yyyyMM");

    private static final String ISSUE_NO_PREFIX = "QI";

    private static final String STATUS_OPEN = "open";
    private static final String STATUS_ANALYZING = "analyzing";
    private static final String STATUS_ACTION = "action";
    private static final String STATUS_VERIFYING = "verifying";
    private static final String STATUS_CLOSED = "closed";

    private static final String ACTION_STATUS_OPEN = "open";
    private static final String ACTION_STATUS_DONE = "done";
    private static final String ACTION_STATUS_VERIFIED = "verified";

    private static final String ACTION_TYPE_CONTAINMENT = "containment";
    private static final String ACTION_TYPE_ROOT_CAUSE = "root_cause";
    private static final String ACTION_TYPE_CORRECTIVE = "corrective";
    private static final String ACTION_TYPE_PREVENTIVE = "preventive";
    private static final String ACTION_TYPE_VERIFY = "verify";

    private static final String DEFAULT_SOURCE_TYPE = "internal";
    private static final String DEFAULT_SEVERITY = "minor";

    private static final String SEVERITY_CRITICAL = "critical";
    private static final String SEVERITY_MAJOR = "major";
    private static final String RISK_HIGH = "high";
    private static final String RISK_MIDDLE = "middle";
    private static final String RISK_LOW = "low";
    private static final String DEFAULT_URGENCY = "normal";

    // 配置项：质量问题单号规则 quality.issue.number.pattern（默认 QI-{yyyyMM}-{4 位流水号}）。
    // 说明：配置中的模板仅作为规则说明，实际实现按“前缀 QI-{yyyyMM}- + 4 位流水号”生成，避免解析模板带来编号格式不可控。
    private static final String CONFIG_DEFECT_AUTO_FILL = "quality.defect.auto_fill";
    private static final String CONFIG_CLOSE_REQUIRE_VERIFY = "quality.close.require_verify";
    private static final String CONFIG_TO_ECR_SOURCE_TYPE = "quality.to_ecr.ecr_source_type";
    private static final String DEFAULT_TO_ECR_SOURCE_TYPE = "quality";

    private final QualityIssueMapper issueMapper;
    private final QualityIssueActionMapper actionMapper;
    private final QualityDefectCodeMapper defectCodeMapper;
    private final EcoChangeRequestMapper changeRequestMapper;
    private final EcrService ecrService;
    private final ConfigService configService;

    public PageResult<QualityIssue> page(QualityIssueQuery query) {
        Page<QualityIssue> page = query.toPage();
        issueMapper.selectPage(page, Wrappers.<QualityIssue>lambdaQuery()
                .eq(StringUtils.hasText(query.getIssueNo()), QualityIssue::getIssueNo, query.getIssueNo())
                .eq(StringUtils.hasText(query.getSourceType()), QualityIssue::getSourceType, query.getSourceType())
                .eq(StringUtils.hasText(query.getProductCode()), QualityIssue::getProductCode, query.getProductCode())
                .eq(StringUtils.hasText(query.getMaterialCode()), QualityIssue::getMaterialCode, query.getMaterialCode())
                .eq(StringUtils.hasText(query.getBatchNo()), QualityIssue::getBatchNo, query.getBatchNo())
                .eq(StringUtils.hasText(query.getWorkOrderNo()), QualityIssue::getWorkOrderNo, query.getWorkOrderNo())
                .eq(StringUtils.hasText(query.getOperationCode()), QualityIssue::getOperationCode, query.getOperationCode())
                .eq(StringUtils.hasText(query.getDefectCode()), QualityIssue::getDefectCode, query.getDefectCode())
                .eq(StringUtils.hasText(query.getSeverity()), QualityIssue::getSeverity, query.getSeverity())
                .eq(StringUtils.hasText(query.getStatus()), QualityIssue::getStatus, query.getStatus())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(QualityIssue::getIssueNo, query.getKeyword()).or()
                        .like(QualityIssue::getTitle, query.getKeyword()))
                .orderByDesc(QualityIssue::getCreatedAt)
                .orderByDesc(QualityIssue::getId));
        return PageResult.of(page);
    }

    public QualityIssueDetailResponse detail(Long issueId) {
        QualityIssue issue = requireIssue(issueId);
        QualityIssueDetailResponse response = new QualityIssueDetailResponse();
        response.setIssue(issue);
        response.setActions(listActions(issueId));
        return response;
    }

    @Transactional
    public Long create(QualityIssueSaveRequest request) {
        QualityIssue issue = new QualityIssue();
        issue.setTitle(request.getTitle());
        issue.setSourceType(StringUtils.hasText(request.getSourceType())
                ? request.getSourceType() : DEFAULT_SOURCE_TYPE);
        issue.setProductCode(request.getProductCode());
        issue.setMaterialCode(request.getMaterialCode());
        issue.setBatchNo(request.getBatchNo());
        issue.setWorkOrderNo(request.getWorkOrderNo());
        issue.setOperationCode(request.getOperationCode());
        issue.setDefectCode(request.getDefectCode());
        issue.setDefectName(request.getDefectName());
        issue.setSeverity(StringUtils.hasText(request.getSeverity()) ? request.getSeverity() : null);
        issue.setFoundQty(request.getFoundQty());
        issue.setIssueDesc(request.getIssueDesc());
        issue.setResponsibleDept(request.getResponsibleDept());
        issue.setResponsibleId(request.getResponsibleId());
        issue.setResponsibleName(request.getResponsibleName());
        issue.setTempAction(request.getTempAction());
        issue.setRootCause(request.getRootCause());
        issue.setPermanentAction(request.getPermanentAction());
        issue.setFoundAt(request.getFoundAt());
        issue.setRemark(request.getRemark());
        fillFromDefectCode(issue);
        if (!StringUtils.hasText(issue.getSeverity())) {
            issue.setSeverity(DEFAULT_SEVERITY);
        }
        if (issue.getFoundAt() == null) {
            issue.setFoundAt(LocalDateTime.now());
        }
        issue.setStatus(STATUS_OPEN);
        issue.setIssueNo(generateIssueNo());
        issueMapper.insert(issue);
        return issue.getId();
    }

    public void update(Long issueId, QualityIssueUpdateRequest request) {
        QualityIssue issue = requireIssue(issueId);
        if (STATUS_CLOSED.equalsIgnoreCase(issue.getStatus())) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "已关闭的质量问题不允许修改");
        }
        if (request.getTitle() != null) {
            issue.setTitle(request.getTitle());
        }
        if (request.getSeverity() != null) {
            issue.setSeverity(request.getSeverity());
        }
        if (request.getIssueDesc() != null) {
            issue.setIssueDesc(request.getIssueDesc());
        }
        if (request.getResponsibleDept() != null) {
            issue.setResponsibleDept(request.getResponsibleDept());
        }
        if (request.getResponsibleId() != null) {
            issue.setResponsibleId(request.getResponsibleId());
        }
        if (request.getResponsibleName() != null) {
            issue.setResponsibleName(request.getResponsibleName());
        }
        if (request.getTempAction() != null) {
            issue.setTempAction(request.getTempAction());
        }
        if (request.getRootCause() != null) {
            issue.setRootCause(request.getRootCause());
        }
        if (request.getPermanentAction() != null) {
            issue.setPermanentAction(request.getPermanentAction());
        }
        if (request.getRemark() != null) {
            issue.setRemark(request.getRemark());
        }
        issueMapper.updateById(issue);
    }

    @Transactional
    public void delete(Long issueId) {
        QualityIssue issue = requireIssue(issueId);
        if (STATUS_CLOSED.equalsIgnoreCase(issue.getStatus())) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "已关闭的质量问题不允许删除");
        }
        issueMapper.deleteById(issueId);
        actionMapper.delete(Wrappers.<QualityIssueAction>lambdaQuery()
                .eq(QualityIssueAction::getIssueId, issueId));
    }

    public List<QualityIssueAction> listActions(Long issueId) {
        requireIssue(issueId);
        return actionMapper.selectList(Wrappers.<QualityIssueAction>lambdaQuery()
                .eq(QualityIssueAction::getIssueId, issueId)
                .orderByAsc(QualityIssueAction::getId));
    }

    @Transactional
    public Long addAction(Long issueId, QualityIssueActionSaveRequest request) {
        QualityIssue issue = requireIssue(issueId);
        QualityIssueAction action = new QualityIssueAction();
        action.setIssueId(issueId);
        action.setActionType(request.getActionType());
        action.setContent(request.getContent());
        action.setOwnerId(request.getOwnerId());
        action.setOwnerName(request.getOwnerName());
        action.setDueDate(request.getDueDate());
        action.setStatus(ACTION_STATUS_OPEN);
        actionMapper.insert(action);
        advanceStatusByAction(issue, request.getActionType());
        return action.getId();
    }

    public void updateAction(Long issueId, Long actionId, QualityIssueActionSaveRequest request) {
        requireIssue(issueId);
        QualityIssueAction action = requireAction(issueId, actionId);
        action.setActionType(request.getActionType());
        action.setContent(request.getContent());
        action.setOwnerId(request.getOwnerId());
        action.setOwnerName(request.getOwnerName());
        action.setDueDate(request.getDueDate());
        actionMapper.updateById(action);
    }

    public void completeAction(Long issueId, Long actionId) {
        requireIssue(issueId);
        QualityIssueAction action = requireAction(issueId, actionId);
        action.setStatus(ACTION_STATUS_DONE);
        action.setCompletedAt(LocalDateTime.now());
        actionMapper.updateById(action);
    }

    public void verifyAction(Long issueId, Long actionId, QualityIssueActionVerifyRequest request) {
        requireIssue(issueId);
        QualityIssueAction action = requireAction(issueId, actionId);
        action.setStatus(ACTION_STATUS_VERIFIED);
        if (request != null) {
            action.setResult(request.getResult());
            action.setEvidence(request.getEvidence());
        }
        actionMapper.updateById(action);
    }

    public void deleteAction(Long issueId, Long actionId) {
        requireIssue(issueId);
        QualityIssueAction action = requireAction(issueId, actionId);
        actionMapper.deleteById(action.getId());
    }

    @Transactional
    public void close(Long issueId, QualityIssueCloseRequest request) {
        QualityIssue issue = requireIssue(issueId);
        if (getBooleanConfig(CONFIG_CLOSE_REQUIRE_VERIFY, true)) {
            long verified = actionMapper.selectCount(Wrappers.<QualityIssueAction>lambdaQuery()
                    .eq(QualityIssueAction::getIssueId, issueId)
                    .eq(QualityIssueAction::getActionType, ACTION_TYPE_VERIFY)
                    .in(QualityIssueAction::getStatus, ACTION_STATUS_VERIFIED, ACTION_STATUS_DONE));
            if (verified <= 0) {
                throw new BusinessException(ResultCode.BAD_REQUEST, "关闭前必须存在已验证的效果验证记录");
            }
        }
        if (request != null) {
            if (StringUtils.hasText(request.getVerifyResult())) {
                issue.setVerifyResult(request.getVerifyResult());
            }
            if (StringUtils.hasText(request.getTempAction())) {
                issue.setTempAction(request.getTempAction());
            }
            if (StringUtils.hasText(request.getRootCause())) {
                issue.setRootCause(request.getRootCause());
            }
            if (StringUtils.hasText(request.getPermanentAction())) {
                issue.setPermanentAction(request.getPermanentAction());
            }
            if (StringUtils.hasText(request.getRemark())) {
                issue.setRemark(request.getRemark());
            }
        }
        issue.setStatus(STATUS_CLOSED);
        issue.setClosedAt(LocalDateTime.now());
        issueMapper.updateById(issue);
    }

    @Transactional
    public QualityIssueEcrResult toEcr(Long issueId, QualityIssueToEcrRequest request) {
        QualityIssue issue = requireIssue(issueId);
        if (issue.getEcrId() != null) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "该质量问题已关联变更申请: " + issue.getEcrNo());
        }

        EcrSaveRequest ecrRequest = new EcrSaveRequest();
        String title = request == null ? null : request.getTitle();
        ecrRequest.setTitle(StringUtils.hasText(title)
                ? title : "质量问题转变更：" + issue.getIssueNo() + " " + issue.getTitle());

        String sourceType = configService.getValue(CONFIG_TO_ECR_SOURCE_TYPE);
        ecrRequest.setSourceType(StringUtils.hasText(sourceType) ? sourceType : DEFAULT_TO_ECR_SOURCE_TYPE);
        ecrRequest.setSourceRef(issue.getIssueNo());

        String reason = request == null ? null : request.getReason();
        ecrRequest.setReason(StringUtils.hasText(reason) ? reason : issue.getIssueDesc());

        String riskLevel = request == null ? null : request.getRiskLevel();
        ecrRequest.setRiskLevel(StringUtils.hasText(riskLevel) ? riskLevel : mapRiskLevel(issue.getSeverity()));

        String urgency = request == null ? null : request.getUrgency();
        ecrRequest.setUrgency(StringUtils.hasText(urgency) ? urgency : DEFAULT_URGENCY);

        String affectedProducts = request == null ? null : request.getAffectedProducts();
        ecrRequest.setAffectedProducts(StringUtils.hasText(affectedProducts)
                ? affectedProducts : issue.getProductCode());

        String affectedMaterials = request == null ? null : request.getAffectedMaterials();
        ecrRequest.setAffectedMaterials(StringUtils.hasText(affectedMaterials)
                ? affectedMaterials : issue.getMaterialCode());

        if (request != null) {
            ecrRequest.setAffectedDocuments(request.getAffectedDocuments());
            ecrRequest.setAffectedProcesses(request.getAffectedProcesses());
            ecrRequest.setRemark(request.getRemark());
        }

        Long ecrId = ecrService.create(ecrRequest);
        EcoChangeRequest changeRequest = changeRequestMapper.selectById(ecrId);
        String ecrNo = changeRequest == null ? null : changeRequest.getEcrNo();

        issue.setEcrId(ecrId);
        issue.setEcrNo(ecrNo);
        issueMapper.updateById(issue);

        QualityIssueEcrResult result = new QualityIssueEcrResult();
        result.setEcrId(ecrId);
        result.setEcrNo(ecrNo);
        result.setMessage("已生成工程变更申请 " + ecrNo + "，可在工程变更模块继续跟踪闭环");
        return result;
    }

    /**
     * 措施记录追加后按措施类型推进问题单状态：
     * open + containment → analyzing；corrective/preventive 且 open/analyzing → action；
     * verify 且 action/analyzing → verifying；root_cause 在 analyzing 下保持不变。
     */
    private void advanceStatusByAction(QualityIssue issue, String actionType) {
        String status = issue.getStatus();
        String next = status;
        if (STATUS_OPEN.equals(status) && ACTION_TYPE_CONTAINMENT.equals(actionType)) {
            next = STATUS_ANALYZING;
        } else if ((ACTION_TYPE_CORRECTIVE.equals(actionType) || ACTION_TYPE_PREVENTIVE.equals(actionType))
                && (STATUS_OPEN.equals(status) || STATUS_ANALYZING.equals(status))) {
            next = STATUS_ACTION;
        } else if (ACTION_TYPE_VERIFY.equals(actionType)
                && (STATUS_ACTION.equals(status) || STATUS_ANALYZING.equals(status))) {
            next = STATUS_VERIFYING;
        }
        if (!next.equals(status)) {
            issue.setStatus(next);
            issueMapper.updateById(issue);
        }
    }

    /**
     * 缺陷代码自动带出：开启自动带出且传入缺陷代码时，用缺陷库记录补齐未显式提供的缺陷名称、
     * 责任部门、严重度，以及默认措施（defaultAction）与默认原因（defaultCause）。
     */
    private void fillFromDefectCode(QualityIssue issue) {
        if (!getBooleanConfig(CONFIG_DEFECT_AUTO_FILL, true) || !StringUtils.hasText(issue.getDefectCode())) {
            return;
        }
        QualityDefectCode defectCode = defectCodeMapper.selectOne(Wrappers.<QualityDefectCode>lambdaQuery()
                .eq(QualityDefectCode::getDefectCode, issue.getDefectCode())
                .last("LIMIT 1"));
        if (defectCode == null) {
            return;
        }
        if (!StringUtils.hasText(issue.getDefectName())) {
            issue.setDefectName(defectCode.getDefectName());
        }
        if (!StringUtils.hasText(issue.getResponsibleDept())) {
            issue.setResponsibleDept(defectCode.getResponsibleDept());
        }
        if (!StringUtils.hasText(issue.getSeverity())) {
            issue.setSeverity(defectCode.getSeverity());
        }
        if (!StringUtils.hasText(issue.getTempAction())) {
            issue.setTempAction(defectCode.getDefaultAction());
        }
        if (!StringUtils.hasText(issue.getRootCause())) {
            issue.setRootCause(defectCode.getDefaultCause());
        }
    }

    private String mapRiskLevel(String severity) {
        if (SEVERITY_CRITICAL.equalsIgnoreCase(severity)) {
            return RISK_HIGH;
        }
        if (SEVERITY_MAJOR.equalsIgnoreCase(severity)) {
            return RISK_MIDDLE;
        }
        return RISK_LOW;
    }

    /**
     * 生成问题单号：前缀 QI-{yyyyMM}- + 4 位流水号，流水号取同前缀已有最大流水号 + 1，重复则继续递增。
     */
    private String generateIssueNo() {
        String prefix = ISSUE_NO_PREFIX + "-" + LocalDate.now().format(MONTH_FORMAT) + "-";
        List<QualityIssue> latest = issueMapper.selectList(Wrappers.<QualityIssue>lambdaQuery()
                .likeRight(QualityIssue::getIssueNo, prefix)
                .orderByDesc(QualityIssue::getIssueNo)
                .last("LIMIT 1"));
        long seq = 1L;
        if (!latest.isEmpty()) {
            String latestNo = latest.get(0).getIssueNo();
            String tail = latestNo.length() > prefix.length() ? latestNo.substring(prefix.length()) : "";
            try {
                seq = Long.parseLong(tail) + 1;
            } catch (NumberFormatException ignored) {
                seq = 1L;
            }
        }
        String candidate = prefix + String.format("%04d", seq);
        while (issueMapper.countByNo(candidate, -1L) > 0) {
            seq++;
            candidate = prefix + String.format("%04d", seq);
        }
        return candidate;
    }

    private boolean getBooleanConfig(String configKey, boolean defaultValue) {
        String value = configService.getValue(configKey);
        return StringUtils.hasText(value) ? Boolean.parseBoolean(value) : defaultValue;
    }

    private QualityIssue requireIssue(Long issueId) {
        QualityIssue issue = issueMapper.selectById(issueId);
        if (issue == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "质量问题不存在: " + issueId);
        }
        return issue;
    }

    private QualityIssueAction requireAction(Long issueId, Long actionId) {
        QualityIssueAction action = actionMapper.selectById(actionId);
        if (action == null || !issueId.equals(action.getIssueId())) {
            throw new BusinessException(ResultCode.NOT_FOUND, "措施记录不存在: " + actionId);
        }
        return action;
    }
}
