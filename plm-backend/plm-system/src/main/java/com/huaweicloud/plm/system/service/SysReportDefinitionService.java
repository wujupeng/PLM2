package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.ReportQuery;
import com.huaweicloud.plm.system.dto.SysReportDefinitionSaveRequest;
import com.huaweicloud.plm.system.entity.SysReportDefinition;
import com.huaweicloud.plm.system.mapper.SysReportDefinitionMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * 报表定义（G1-N2 报表平台 WBS T010）：报表登记、发布/停用状态流转与统计。
 * 报表声明查看权限码与行级过滤条件，导出开关与导出审计共同约束数据外发。
 */
@Service
@RequiredArgsConstructor
public class SysReportDefinitionService {

    private static final String STATUS_DRAFT = "DRAFT";
    private static final String STATUS_PUBLISHED = "PUBLISHED";
    private static final String STATUS_DISABLED = "DISABLED";

    private final SysReportDefinitionMapper mapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询报表定义：业务域/分类/图表类型/状态精确，关键字匹配编码/名称/数据集编码，时间区间作用于创建时间。 */
    public PageResult<SysReportDefinition> pageDefinitions(ReportQuery query) {
        Page<SysReportDefinition> page = query.toPage();
        mapper.selectPage(page, Wrappers.<SysReportDefinition>lambdaQuery()
                .eq(StringUtils.hasText(query.getBizDomain()),
                        SysReportDefinition::getBizDomain, query.getBizDomain())
                .eq(StringUtils.hasText(query.getCategory()),
                        SysReportDefinition::getCategory, query.getCategory())
                .eq(StringUtils.hasText(query.getChartType()),
                        SysReportDefinition::getChartType, query.getChartType())
                .eq(StringUtils.hasText(query.getReportStatus()),
                        SysReportDefinition::getReportStatus, query.getReportStatus())
                .ge(StringUtils.hasText(query.getStartDate()), SysReportDefinition::getCreatedAt,
                        OaBizFlowSupport.startOfDay(query.getStartDate()))
                .le(StringUtils.hasText(query.getEndDate()), SysReportDefinition::getCreatedAt,
                        OaBizFlowSupport.endOfDay(query.getEndDate()))
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(SysReportDefinition::getReportCode, query.getKeyword()).or()
                        .like(SysReportDefinition::getReportName, query.getKeyword()).or()
                        .like(SysReportDefinition::getDatasetCode, query.getKeyword()))
                .orderByDesc(SysReportDefinition::getId));
        return PageResult.of(page);
    }

    public SysReportDefinition detail(Long id) {
        return require(id);
    }

    /** 新增或更新报表定义：新增时回填图表类型、导出开关与状态，并回填组织。 */
    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, SysReportDefinitionSaveRequest request) {
        SysReportDefinition entity;
        if (id == null) {
            entity = new SysReportDefinition();
            entity.setReportCode(StringUtils.hasText(request.getReportCode())
                    ? request.getReportCode() : flowSupport.nextBizNo("RPT"));
            entity.setChartType(StringUtils.hasText(request.getChartType())
                    ? request.getChartType() : "TABLE");
            entity.setExportEnabled(request.getExportEnabled() != null ? request.getExportEnabled() : 1);
            entity.setExportAuditFlag(request.getExportAuditFlag() != null ? request.getExportAuditFlag() : 1);
            entity.setReportStatus(StringUtils.hasText(request.getReportStatus())
                    ? request.getReportStatus() : STATUS_DRAFT);
            entity.setOrgId(currentOrgId());
        } else {
            entity = require(id);
            if (StringUtils.hasText(request.getReportCode())) {
                entity.setReportCode(request.getReportCode());
            }
            if (StringUtils.hasText(request.getChartType())) {
                entity.setChartType(request.getChartType());
            }
            if (request.getExportEnabled() != null) {
                entity.setExportEnabled(request.getExportEnabled());
            }
            if (request.getExportAuditFlag() != null) {
                entity.setExportAuditFlag(request.getExportAuditFlag());
            }
            if (StringUtils.hasText(request.getReportStatus())) {
                entity.setReportStatus(request.getReportStatus());
            }
        }
        entity.setReportName(request.getReportName());
        entity.setBizDomain(request.getBizDomain());
        entity.setCategory(request.getCategory());
        entity.setDatasetCode(request.getDatasetCode());
        entity.setIndicatorCodes(request.getIndicatorCodes());
        entity.setPermissionCode(request.getPermissionCode());
        entity.setRowFilter(request.getRowFilter());
        entity.setOwnerName(request.getOwnerName());
        entity.setDescription(request.getDescription());
        entity.setOrgName(request.getOrgName());
        entity.setRemark(request.getRemark());
        if (id == null) {
            mapper.insert(entity);
        } else {
            mapper.updateById(entity);
        }
        return entity.getId();
    }

    /** 发布报表：状态置为 PUBLISHED。 */
    @Transactional(rollbackFor = Exception.class)
    public SysReportDefinition publish(Long id) {
        return changeStatus(id, STATUS_PUBLISHED);
    }

    /** 停用报表：状态置为 DISABLED。 */
    @Transactional(rollbackFor = Exception.class)
    public SysReportDefinition disable(Long id) {
        return changeStatus(id, STATUS_DISABLED);
    }

    /** 删除报表定义：物理删除以释放编码，避免软删除行占用唯一索引导致再次登记冲突。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    /** 报表定义统计：按状态汇总，并统计允许导出与导出审计的报表数。 */
    public Map<String, Object> stats() {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("total", mapper.selectCount(null));
        result.put("draft", countByStatus(STATUS_DRAFT));
        result.put("published", countByStatus(STATUS_PUBLISHED));
        result.put("disabled", countByStatus(STATUS_DISABLED));
        result.put("exportEnabled", mapper.selectCount(Wrappers.<SysReportDefinition>lambdaQuery()
                .eq(SysReportDefinition::getExportEnabled, 1)));
        result.put("auditEnabled", mapper.selectCount(Wrappers.<SysReportDefinition>lambdaQuery()
                .eq(SysReportDefinition::getExportAuditFlag, 1)));
        return result;
    }

    public SysReportDefinition require(Long id) {
        SysReportDefinition entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "报表定义不存在: " + id);
        }
        return entity;
    }

    private SysReportDefinition changeStatus(Long id, String status) {
        SysReportDefinition entity = require(id);
        entity.setReportStatus(status);
        mapper.updateById(entity);
        return entity;
    }

    private Long countByStatus(String reportStatus) {
        Long count = mapper.selectCount(Wrappers.<SysReportDefinition>lambdaQuery()
                .eq(SysReportDefinition::getReportStatus, reportStatus));
        return count == null ? 0L : count;
    }

    private Long currentOrgId() {
        UserContext.Principal principal = UserContext.get();
        return principal == null ? null : principal.orgId();
    }
}
