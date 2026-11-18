package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.DocDistributionRequest;
import com.huaweicloud.plm.system.dto.DocDocumentDetailResponse;
import com.huaweicloud.plm.system.dto.DocDocumentQuery;
import com.huaweicloud.plm.system.dto.DocDocumentSaveRequest;
import com.huaweicloud.plm.system.dto.DocObsoleteRequest;
import com.huaweicloud.plm.system.dto.DocRelationSaveRequest;
import com.huaweicloud.plm.system.dto.DocReleaseRequest;
import com.huaweicloud.plm.system.dto.DocReviewAssignee;
import com.huaweicloud.plm.system.dto.DocReviewDecideRequest;
import com.huaweicloud.plm.system.dto.DocSubmitRequest;
import com.huaweicloud.plm.system.dto.DocVersionCompareResponse;
import com.huaweicloud.plm.system.dto.DocVersionFieldDiff;
import com.huaweicloud.plm.system.dto.DocVersionSaveRequest;
import com.huaweicloud.plm.system.entity.DocApprovalLog;
import com.huaweicloud.plm.system.entity.DocCategory;
import com.huaweicloud.plm.system.entity.DocDistribution;
import com.huaweicloud.plm.system.entity.DocDocument;
import com.huaweicloud.plm.system.entity.DocRelation;
import com.huaweicloud.plm.system.entity.DocReviewTask;
import com.huaweicloud.plm.system.entity.DocVersion;
import com.huaweicloud.plm.system.mapper.DocApprovalLogMapper;
import com.huaweicloud.plm.system.mapper.DocCategoryMapper;
import com.huaweicloud.plm.system.mapper.DocDistributionMapper;
import com.huaweicloud.plm.system.mapper.DocDocumentMapper;
import com.huaweicloud.plm.system.mapper.DocRelationMapper;
import com.huaweicloud.plm.system.mapper.DocReviewTaskMapper;
import com.huaweicloud.plm.system.mapper.DocVersionMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

/**
 * 图文档主档、版本、评审、审批、分发服务（DEV-034 ~ DEV-038）。
 */
@Service
@RequiredArgsConstructor
public class DocDocumentService {

    private static final String STATUS_DRAFT = "draft";
    private static final String STATUS_IN_REVIEW = "in_review";
    private static final String STATUS_APPROVED = "approved";
    private static final String STATUS_RELEASED = "released";
    private static final String STATUS_OBSOLETE = "obsolete";
    private static final String DECISION_PENDING = "pending";
    private static final String DECISION_APPROVED = "approved";
    private static final String DECISION_REJECTED = "rejected";
    private static final String DEFAULT_VERSION_NO = "V1";

    private static final String CONFIG_REVIEW_NODES_DEFAULT = "doc.review.nodes.default";
    private static final String DEFAULT_REVIEW_NODES = "prepare,proofread,review,approve";
    private static final String CONFIG_VERSION_COMPARE_FIELDS = "doc.version.compare.fields";
    private static final String DEFAULT_VERSION_COMPARE_FIELDS = "fileName,fileType,fileSize,fileHash,changeNote";

    private final DocDocumentMapper documentMapper;
    private final DocCategoryMapper categoryMapper;
    private final DocVersionMapper versionMapper;
    private final DocRelationMapper relationMapper;
    private final DocReviewTaskMapper reviewTaskMapper;
    private final DocApprovalLogMapper approvalLogMapper;
    private final DocDistributionMapper distributionMapper;
    private final ConfigService configService;

    public PageResult<DocDocument> page(DocDocumentQuery query) {
        Page<DocDocument> page = query.toPage();
        documentMapper.selectPage(page, Wrappers.<DocDocument>lambdaQuery()
                .eq(StringUtils.hasText(query.getCategoryCode()), DocDocument::getCategoryCode, query.getCategoryCode())
                .eq(StringUtils.hasText(query.getDocType()), DocDocument::getDocType, query.getDocType())
                .eq(StringUtils.hasText(query.getProductCode()), DocDocument::getProductCode, query.getProductCode())
                .eq(StringUtils.hasText(query.getMaterialCode()), DocDocument::getMaterialCode, query.getMaterialCode())
                .eq(StringUtils.hasText(query.getStatus()), DocDocument::getStatus, query.getStatus())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(DocDocument::getDocNo, query.getKeyword()).or()
                        .like(DocDocument::getDocName, query.getKeyword()))
                .orderByDesc(DocDocument::getCreatedAt));
        return PageResult.of(page);
    }

    public List<DocDocument> options() {
        return documentMapper.selectList(Wrappers.<DocDocument>lambdaQuery()
                .orderByAsc(DocDocument::getDocNo));
    }

    /**
     * 按物料编码查询有效（已发布）图文档，用于从物料/BOM 打开对应有效图纸。
     */
    public List<DocDocument> listByMaterial(String materialCode) {
        return documentMapper.selectList(Wrappers.<DocDocument>lambdaQuery()
                .eq(DocDocument::getMaterialCode, materialCode)
                .eq(DocDocument::getStatus, STATUS_RELEASED)
                .orderByAsc(DocDocument::getDocNo));
    }

    public DocDocumentDetailResponse getDetail(Long documentId) {
        DocDocument document = requireDocument(documentId);
        DocDocumentDetailResponse response = new DocDocumentDetailResponse();
        response.setDocument(document);
        if (document.getCategoryId() != null) {
            response.setCategory(categoryMapper.selectById(document.getCategoryId()));
        }
        if (StringUtils.hasText(document.getCurrentVersionNo())) {
            response.setCurrentVersion(versionMapper.selectOne(Wrappers.<DocVersion>lambdaQuery()
                    .eq(DocVersion::getDocumentId, documentId)
                    .eq(DocVersion::getVersionNo, document.getCurrentVersionNo())
                    .last("LIMIT 1")));
        }
        response.setRelations(listRelations(documentId));
        response.setReviewTasks(reviewTaskMapper.selectList(Wrappers.<DocReviewTask>lambdaQuery()
                .eq(DocReviewTask::getDocumentId, documentId)
                .orderByAsc(DocReviewTask::getSeqNo)));
        response.setApprovalLogs(listApprovalLogs(documentId));
        return response;
    }

    public List<DocVersion> listVersions(Long documentId) {
        requireDocument(documentId);
        return versionMapper.selectList(Wrappers.<DocVersion>lambdaQuery()
                .eq(DocVersion::getDocumentId, documentId)
                .orderByAsc(DocVersion::getId));
    }

    /**
     * 比较同一图文档两个版本的差异，比较字段由配置项 doc.version.compare.fields 决定。
     */
    public DocVersionCompareResponse compareVersions(Long documentId, String leftVersionNo, String rightVersionNo) {
        requireDocument(documentId);
        DocVersion left = requireVersion(documentId, leftVersionNo);
        DocVersion right = requireVersion(documentId, rightVersionNo);

        List<DocVersionFieldDiff> diffs = new ArrayList<>();
        for (String field : resolveCompareFields()) {
            DocVersionFieldDiff diff = new DocVersionFieldDiff();
            diff.setField(field);
            diff.setFieldLabel(fieldLabel(field));
            String leftValue = resolveVersionField(left, field);
            String rightValue = resolveVersionField(right, field);
            diff.setLeftValue(leftValue);
            diff.setRightValue(rightValue);
            diff.setChanged(!Objects.equals(leftValue, rightValue));
            diffs.add(diff);
        }
        DocVersionCompareResponse response = new DocVersionCompareResponse();
        response.setLeftVersionNo(leftVersionNo);
        response.setRightVersionNo(rightVersionNo);
        response.setDiffs(diffs);
        return response;
    }

    @Transactional
    public Long create(DocDocumentSaveRequest request) {
        if (documentMapper.countByNo(request.getDocNo(), -1L) > 0) {
            throw new BusinessException(ResultCode.CONFLICT, "图文档编号已存在: " + request.getDocNo());
        }
        DocDocument document = new DocDocument();
        applyRequest(document, request);
        // 未显式提供分类编码时，按分类回填分类编码与图文档类型。
        if (!StringUtils.hasText(document.getCategoryCode()) && request.getCategoryId() != null) {
            DocCategory category = categoryMapper.selectById(request.getCategoryId());
            if (category != null) {
                document.setCategoryCode(category.getCategoryCode());
                if (!StringUtils.hasText(document.getDocType())) {
                    document.setDocType(category.getDocType());
                }
            }
        }
        if (!StringUtils.hasText(document.getStatus())) {
            document.setStatus(STATUS_DRAFT);
        }
        if (!StringUtils.hasText(document.getCurrentVersionNo())) {
            document.setCurrentVersionNo(DEFAULT_VERSION_NO);
        }
        if (document.getOwnerId() == null) {
            document.setOwnerId(UserContext.getUserId());
        }
        if (!StringUtils.hasText(document.getOwnerName())) {
            document.setOwnerName(UserContext.getUsername());
        }
        documentMapper.insert(document);

        // 建档后自动生成首版本记录。
        DocVersion version = new DocVersion();
        version.setDocumentId(document.getId());
        version.setDocNo(document.getDocNo());
        version.setVersionNo(document.getCurrentVersionNo());
        version.setFileName(request.getFileName());
        version.setStatus(STATUS_DRAFT);
        versionMapper.insert(version);
        return document.getId();
    }

    public void update(Long documentId, DocDocumentSaveRequest request) {
        DocDocument document = requireDocument(documentId);
        if (!document.getDocNo().equals(request.getDocNo())
                && documentMapper.countByNo(request.getDocNo(), documentId) > 0) {
            throw new BusinessException(ResultCode.CONFLICT, "图文档编号已存在: " + request.getDocNo());
        }
        applyRequest(document, request);
        documentMapper.updateById(document);
    }

    public void delete(Long documentId) {
        requireDocument(documentId);
        documentMapper.deleteById(documentId);
    }

    @Transactional
    public Long addVersion(Long documentId, DocVersionSaveRequest request) {
        DocDocument document = requireDocument(documentId);
        String versionNo = StringUtils.hasText(request.getVersionNo())
                ? request.getVersionNo()
                : nextVersionNo(documentId);
        DocVersion version = new DocVersion();
        version.setDocumentId(documentId);
        version.setDocNo(document.getDocNo());
        version.setVersionNo(versionNo);
        version.setFileName(request.getFileName());
        version.setFilePath(request.getFilePath());
        version.setFileSize(request.getFileSize());
        version.setFileType(request.getFileType());
        version.setFileHash(request.getFileHash());
        version.setMetadataJson(request.getMetadataJson());
        version.setChangeNote(request.getChangeNote());
        version.setStatus(STATUS_DRAFT);
        versionMapper.insert(version);

        if (Boolean.TRUE.equals(request.getActivate())) {
            document.setCurrentVersionNo(versionNo);
            documentMapper.updateById(document);
        }
        return version.getId();
    }

    public void activateVersion(Long documentId, Long versionId) {
        DocDocument document = requireDocument(documentId);
        DocVersion version = versionMapper.selectById(versionId);
        if (version == null || !documentId.equals(version.getDocumentId())) {
            throw new BusinessException(ResultCode.NOT_FOUND, "图文档版本不存在: " + versionId);
        }
        document.setCurrentVersionNo(version.getVersionNo());
        documentMapper.updateById(document);
    }

    @Transactional
    public void submit(Long documentId, DocSubmitRequest request) {
        DocDocument document = requireDocument(documentId);
        String versionNo = resolveVersionNo(document, request.getVersionNo());
        long pendingCount = reviewTaskMapper.selectCount(Wrappers.<DocReviewTask>lambdaQuery()
                .eq(DocReviewTask::getDocumentId, documentId)
                .eq(DocReviewTask::getVersionNo, versionNo)
                .eq(DocReviewTask::getDecision, DECISION_PENDING));
        if (pendingCount > 0) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "该版本已在审批中");
        }

        document.setStatus(STATUS_IN_REVIEW);
        documentMapper.updateById(document);

        Map<String, DocReviewAssignee> assigneeMap = new HashMap<>();
        if (request.getAssignees() != null) {
            for (DocReviewAssignee assignee : request.getAssignees()) {
                if (assignee != null && StringUtils.hasText(assignee.getNodeCode())) {
                    assigneeMap.put(assignee.getNodeCode(), assignee);
                }
            }
        }

        int seqNo = 1;
        for (String nodeCode : resolveReviewNodes(request.getReviewNodes())) {
            DocReviewTask task = new DocReviewTask();
            task.setDocumentId(documentId);
            task.setDocNo(document.getDocNo());
            task.setVersionNo(versionNo);
            task.setNodeCode(nodeCode);
            task.setNodeName(nodeNameOf(nodeCode));
            task.setSeqNo(seqNo++);
            task.setDecision(DECISION_PENDING);
            DocReviewAssignee assignee = assigneeMap.get(nodeCode);
            if (assignee != null) {
                task.setAssigneeId(assignee.getAssigneeId());
                task.setAssigneeName(assignee.getAssigneeName());
            }
            reviewTaskMapper.insert(task);
        }
        appendLog(document, versionNo, "submit", null);
    }

    public List<DocReviewTask> listReviewTasks(Long documentId, String versionNo) {
        requireDocument(documentId);
        return reviewTaskMapper.selectList(Wrappers.<DocReviewTask>lambdaQuery()
                .eq(DocReviewTask::getDocumentId, documentId)
                .eq(StringUtils.hasText(versionNo), DocReviewTask::getVersionNo, versionNo)
                .orderByAsc(DocReviewTask::getSeqNo));
    }

    @Transactional
    public void decide(Long taskId, DocReviewDecideRequest request) {
        DocReviewTask task = reviewTaskMapper.selectById(taskId);
        if (task == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "评审任务不存在: " + taskId);
        }
        DocDocument document = requireDocument(task.getDocumentId());
        String decision = request.getDecision();
        task.setDecision(decision);
        task.setComment(request.getComment());
        task.setDecidedAt(LocalDateTime.now());
        reviewTaskMapper.updateById(task);

        String action;
        if (DECISION_REJECTED.equalsIgnoreCase(decision)) {
            document.setStatus(STATUS_DRAFT);
            documentMapper.updateById(document);
            action = "reject";
        } else {
            long unfinished = reviewTaskMapper.selectCount(Wrappers.<DocReviewTask>lambdaQuery()
                    .eq(DocReviewTask::getDocumentId, task.getDocumentId())
                    .eq(DocReviewTask::getVersionNo, task.getVersionNo())
                    .ne(DocReviewTask::getDecision, DECISION_APPROVED));
            if (unfinished == 0) {
                document.setStatus(STATUS_APPROVED);
                documentMapper.updateById(document);
            }
            action = "approve";
        }
        appendLog(document, task.getVersionNo(), action, request.getComment());
    }

    @Transactional
    public void release(Long documentId, DocReleaseRequest request) {
        DocDocument document = requireDocument(documentId);
        if (!STATUS_APPROVED.equals(document.getStatus())) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "文档未完成审批，不能发布");
        }
        String versionNo = resolveVersionNo(document, request == null ? null : request.getVersionNo());
        DocVersion version = requireVersion(documentId, versionNo);
        LocalDateTime now = LocalDateTime.now();
        version.setStatus(STATUS_RELEASED);
        version.setReleasedAt(now);
        version.setReleasedBy(UserContext.getUserId());
        versionMapper.updateById(version);

        document.setStatus(STATUS_RELEASED);
        documentMapper.updateById(document);
        appendLog(document, versionNo, "release", request == null ? null : request.getComment());
    }

    @Transactional
    public void obsolete(Long documentId, DocObsoleteRequest request) {
        DocDocument document = requireDocument(documentId);
        document.setStatus(STATUS_OBSOLETE);
        documentMapper.updateById(document);
        appendLog(document, document.getCurrentVersionNo(), "obsolete",
                request == null ? null : request.getComment());
    }

    public List<DocRelation> listRelations(Long documentId) {
        return relationMapper.selectList(Wrappers.<DocRelation>lambdaQuery()
                .eq(DocRelation::getDocumentId, documentId)
                .orderByAsc(DocRelation::getId));
    }

    public Long addRelation(Long documentId, DocRelationSaveRequest request) {
        DocDocument document = requireDocument(documentId);
        DocRelation relation = new DocRelation();
        relation.setDocumentId(documentId);
        relation.setDocNo(document.getDocNo());
        relation.setRelationType(request.getRelationType());
        relation.setTargetId(request.getTargetId());
        relation.setTargetCode(request.getTargetCode());
        relation.setTargetName(request.getTargetName());
        relation.setRelationRole(request.getRelationRole());
        relation.setRemark(request.getRemark());
        relationMapper.insert(relation);
        return relation.getId();
    }

    public void deleteRelation(Long relationId) {
        DocRelation relation = relationMapper.selectById(relationId);
        if (relation == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "图文档关联关系不存在: " + relationId);
        }
        relationMapper.deleteById(relationId);
    }

    public List<DocDistribution> listDistributions(Long documentId) {
        requireDocument(documentId);
        return distributionMapper.selectList(Wrappers.<DocDistribution>lambdaQuery()
                .eq(DocDistribution::getDocumentId, documentId)
                .orderByDesc(DocDistribution::getId));
    }

    @Transactional
    public Long distribute(Long documentId, DocDistributionRequest request) {
        DocDocument document = requireDocument(documentId);
        DocDistribution distribution = new DocDistribution();
        distribution.setDocumentId(documentId);
        distribution.setDocNo(document.getDocNo());
        distribution.setVersionNo(request.getVersionNo());
        distribution.setRecipientType(request.getRecipientType());
        distribution.setRecipientCode(request.getRecipientCode());
        distribution.setRecipientName(request.getRecipientName());
        distribution.setDistributedAt(LocalDateTime.now());
        distribution.setStatus("active");
        distribution.setRemark(request.getRemark());
        distributionMapper.insert(distribution);
        appendLog(document, request.getVersionNo(), "distribute", null);
        return distribution.getId();
    }

    @Transactional
    public void recall(Long distributionId) {
        DocDistribution distribution = distributionMapper.selectById(distributionId);
        if (distribution == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "分发记录不存在: " + distributionId);
        }
        distribution.setStatus("recalled");
        distributionMapper.updateById(distribution);

        DocDocument document = requireDocument(distribution.getDocumentId());
        appendLog(document, distribution.getVersionNo(), "recall", null);
    }

    public List<DocApprovalLog> listApprovalLogs(Long documentId) {
        return approvalLogMapper.selectList(Wrappers.<DocApprovalLog>lambdaQuery()
                .eq(DocApprovalLog::getDocumentId, documentId)
                .orderByAsc(DocApprovalLog::getId));
    }

    private void applyRequest(DocDocument document, DocDocumentSaveRequest request) {
        document.setDocNo(request.getDocNo());
        document.setDocName(request.getDocName());
        document.setCategoryId(request.getCategoryId());
        document.setCategoryCode(request.getCategoryCode());
        document.setDocType(request.getDocType());
        document.setProductCode(request.getProductCode());
        document.setMaterialCode(request.getMaterialCode());
        document.setBomHeaderId(request.getBomHeaderId());
        document.setBomCode(request.getBomCode());
        document.setFileName(request.getFileName());
        document.setDistributionControlled(request.getDistributionControlled() == null ? 0 : request.getDistributionControlled());
        document.setDescription(request.getDescription());
        document.setRemark(request.getRemark());
    }

    private void appendLog(DocDocument document, String versionNo, String action, String comment) {
        DocApprovalLog log = new DocApprovalLog();
        log.setDocumentId(document.getId());
        log.setDocNo(document.getDocNo());
        log.setVersionNo(versionNo);
        log.setAction(action);
        log.setOperatorId(UserContext.getUserId());
        log.setOperatorName(UserContext.getUsername());
        log.setComment(comment);
        approvalLogMapper.insert(log);
    }

    private String nextVersionNo(Long documentId) {
        int max = 0;
        for (DocVersion version : versionMapper.selectList(Wrappers.<DocVersion>lambdaQuery()
                .eq(DocVersion::getDocumentId, documentId))) {
            int seq = parseVersionSeq(version.getVersionNo());
            if (seq > max) {
                max = seq;
            }
        }
        return "V" + (max + 1);
    }

    private int parseVersionSeq(String versionNo) {
        if (!StringUtils.hasText(versionNo)) {
            return 0;
        }
        String digits = versionNo.replaceAll("[^0-9]", "");
        if (!StringUtils.hasText(digits)) {
            return 0;
        }
        try {
            return Integer.parseInt(digits);
        } catch (NumberFormatException e) {
            return 0;
        }
    }

    private List<String> resolveReviewNodes(String reviewNodes) {
        String value = StringUtils.hasText(reviewNodes) ? reviewNodes : configService.getValue(CONFIG_REVIEW_NODES_DEFAULT);
        String resolved = StringUtils.hasText(value) ? value : DEFAULT_REVIEW_NODES;
        return Arrays.stream(resolved.split(","))
                .map(String::trim)
                .filter(StringUtils::hasText)
                .toList();
    }

    private String nodeNameOf(String nodeCode) {
        return switch (nodeCode) {
            case "prepare" -> "编制";
            case "proofread" -> "校对";
            case "review" -> "审核";
            case "approve" -> "批准";
            default -> nodeCode;
        };
    }

    private List<String> resolveCompareFields() {
        String value = configService.getValue(CONFIG_VERSION_COMPARE_FIELDS);
        String resolved = StringUtils.hasText(value) ? value : DEFAULT_VERSION_COMPARE_FIELDS;
        return Arrays.stream(resolved.split(","))
                .map(String::trim)
                .filter(StringUtils::hasText)
                .toList();
    }

    private String fieldLabel(String field) {
        return switch (field) {
            case "fileName" -> "文件名";
            case "fileType" -> "文件类型";
            case "fileSize" -> "文件大小";
            case "fileHash" -> "文件摘要";
            case "changeNote" -> "变更说明";
            case "metadataJson" -> "元数据";
            default -> field;
        };
    }

    private String resolveVersionField(DocVersion version, String field) {
        return switch (field) {
            case "fileName" -> version.getFileName();
            case "fileType" -> version.getFileType();
            case "fileSize" -> version.getFileSize() == null ? null : String.valueOf(version.getFileSize());
            case "fileHash" -> version.getFileHash();
            case "changeNote" -> version.getChangeNote();
            case "metadataJson" -> version.getMetadataJson();
            default -> null;
        };
    }

    private String resolveVersionNo(DocDocument document, String requestVersionNo) {
        return StringUtils.hasText(requestVersionNo) ? requestVersionNo : document.getCurrentVersionNo();
    }

    private DocDocument requireDocument(Long documentId) {
        DocDocument document = documentMapper.selectById(documentId);
        if (document == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "图文档不存在: " + documentId);
        }
        return document;
    }

    private DocVersion requireVersion(Long documentId, String versionNo) {
        DocVersion version = versionMapper.selectOne(Wrappers.<DocVersion>lambdaQuery()
                .eq(DocVersion::getDocumentId, documentId)
                .eq(DocVersion::getVersionNo, versionNo)
                .last("LIMIT 1"));
        if (version == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "图文档版本不存在: " + versionNo);
        }
        return version;
    }
}
