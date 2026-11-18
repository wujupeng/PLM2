package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.system.dto.DataQualityQuery;
import com.huaweicloud.plm.system.dto.DataQualityScanResult;
import com.huaweicloud.plm.system.entity.MdDataQualityIssue;
import com.huaweicloud.plm.system.entity.MdMaterial;
import com.huaweicloud.plm.system.mapper.MdDataQualityIssueMapper;
import com.huaweicloud.plm.system.mapper.MdMaterialMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * 物料数据质量服务（DEV-024）。
 */
@Service
@RequiredArgsConstructor
public class DataQualityService {

    public static final String ENTITY_TYPE_MATERIAL = "MATERIAL";
    public static final String STATUS_OPEN = "open";
    private static final Set<String> ALLOWED_STATUS = Set.of("open", "fixed", "ignored");
    private static final int RULE_COUNT = 4;

    private final MdDataQualityIssueMapper issueMapper;
    private final MdMaterialMapper materialMapper;

    /**
     * 执行数据质量规则并刷新问题清单：先清理旧的待处理结果，再写入本次扫描结果。
     */
    @Transactional
    public DataQualityScanResult scan() {
        issueMapper.delete(Wrappers.<MdDataQualityIssue>lambdaQuery().eq(MdDataQualityIssue::getStatus, STATUS_OPEN));

        List<MdMaterial> materials = materialMapper.selectList(null);
        List<MdDataQualityIssue> issues = new ArrayList<>();
        issues.addAll(scanRequired(materials));
        issues.addAll(scanSupplierRequired(materials));
        issues.addAll(scanNoCategory(materials));
        issues.addAll(scanDuplicate(materials));

        issues.forEach(issueMapper::insert);
        return new DataQualityScanResult(RULE_COUNT, issues.size());
    }

    public PageResult<MdDataQualityIssue> page(DataQualityQuery query) {
        Page<MdDataQualityIssue> page = query.toPage();
        issueMapper.selectPage(page, Wrappers.<MdDataQualityIssue>lambdaQuery()
                .eq(StringUtils.hasText(query.getStatus()), MdDataQualityIssue::getStatus, query.getStatus())
                .eq(StringUtils.hasText(query.getSeverity()), MdDataQualityIssue::getSeverity, query.getSeverity())
                .eq(StringUtils.hasText(query.getRuleCode()), MdDataQualityIssue::getRuleCode, query.getRuleCode())
                .eq(StringUtils.hasText(query.getEntityType()), MdDataQualityIssue::getEntityType, query.getEntityType())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(MdDataQualityIssue::getEntityCode, query.getKeyword()).or()
                        .like(MdDataQualityIssue::getMessage, query.getKeyword()))
                .orderByDesc(MdDataQualityIssue::getCreatedAt));
        return PageResult.of(page);
    }

    public void updateStatus(Long issueId, String status) {
        if (!ALLOWED_STATUS.contains(status)) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "非法的处理状态: " + status);
        }
        MdDataQualityIssue issue = issueMapper.selectById(issueId);
        if (issue == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "数据质量问题不存在: " + issueId);
        }
        issue.setStatus(status);
        issueMapper.updateById(issue);
    }

    /** 规则 1：必填缺失。 */
    private List<MdDataQualityIssue> scanRequired(List<MdMaterial> materials) {
        List<MdDataQualityIssue> issues = new ArrayList<>();
        for (MdMaterial material : materials) {
            if (!StringUtils.hasText(material.getMaterialName())
                    || !StringUtils.hasText(material.getUnit())
                    || !StringUtils.hasText(material.getSourceType())) {
                issues.add(build("DQ_REQUIRED", "物料必填信息缺失", material, "error",
                        "物料必填字段缺失：名称/单位/来源类型不完整"));
            }
        }
        return issues;
    }

    /** 规则 2：外购物料未关联供应商。 */
    private List<MdDataQualityIssue> scanSupplierRequired(List<MdMaterial> materials) {
        List<MdDataQualityIssue> issues = new ArrayList<>();
        for (MdMaterial material : materials) {
            if ("buy".equalsIgnoreCase(material.getSourceType()) && !StringUtils.hasText(material.getSupplierCode())) {
                issues.add(build("DQ_SUPPLIER_REQUIRED", "外购物料未关联供应商", material, "warning",
                        "外购物料必须关联供应商"));
            }
        }
        return issues;
    }

    /** 规则 3：未关联物料分类。 */
    private List<MdDataQualityIssue> scanNoCategory(List<MdMaterial> materials) {
        List<MdDataQualityIssue> issues = new ArrayList<>();
        for (MdMaterial material : materials) {
            if (material.getCategoryId() == null && !StringUtils.hasText(material.getCategoryCode())) {
                issues.add(build("DQ_NO_CATEGORY", "物料未关联分类", material, "warning",
                        "物料未关联任何分类"));
            }
        }
        return issues;
    }

    /** 规则 4：名称与规格相同的重复物料。 */
    private List<MdDataQualityIssue> scanDuplicate(List<MdMaterial> materials) {
        Map<String, List<MdMaterial>> grouped = materials.stream()
                .filter(m -> StringUtils.hasText(m.getMaterialName()))
                .collect(Collectors.groupingBy(m -> m.getMaterialName() + "|" + Objects.toString(m.getSpec(), "")));
        List<MdDataQualityIssue> issues = new ArrayList<>();
        for (List<MdMaterial> group : grouped.values()) {
            if (group.size() > 1) {
                for (MdMaterial material : group) {
                    issues.add(build("DQ_DUPLICATE", "物料重复", material, "warning",
                            "存在名称与规格相同的重复物料"));
                }
            }
        }
        return issues;
    }

    private MdDataQualityIssue build(String ruleCode, String ruleName, MdMaterial material,
                                     String severity, String message) {
        MdDataQualityIssue issue = new MdDataQualityIssue();
        issue.setRuleCode(ruleCode);
        issue.setRuleName(ruleName);
        issue.setEntityType(ENTITY_TYPE_MATERIAL);
        issue.setEntityId(material.getId());
        issue.setEntityCode(material.getMaterialCode());
        issue.setSeverity(severity);
        issue.setMessage(message);
        issue.setStatus(STATUS_OPEN);
        return issue;
    }
}
