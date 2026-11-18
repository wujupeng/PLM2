package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.ReportQuery;
import com.huaweicloud.plm.system.dto.SysReportDatasetSaveRequest;
import com.huaweicloud.plm.system.entity.SysReportDataset;
import com.huaweicloud.plm.system.mapper.SysReportDatasetMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * 数据集市（G1-N2 报表平台 WBS T010）：数据集登记、刷新（回填刷新时间并激活草稿）与统计。
 * 数据集承载取数来源与字段结构，报表只引用数据集，隔离底层模型变更。
 */
@Service
@RequiredArgsConstructor
public class SysReportDatasetService {

    private static final String STATUS_DRAFT = "DRAFT";
    private static final String STATUS_ACTIVE = "ACTIVE";
    private static final String STATUS_DISABLED = "DISABLED";
    private static final String MODE_MANUAL = "MANUAL";
    private static final String MODE_SCHEDULED = "SCHEDULED";
    private static final String MODE_REALTIME = "REALTIME";
    private static final DateTimeFormatter TS_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    private final SysReportDatasetMapper mapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询数据集：业务域/来源类型/刷新模式/状态精确，关键字匹配编码/名称/来源引用，时间区间作用于创建时间。 */
    public PageResult<SysReportDataset> pageDatasets(ReportQuery query) {
        Page<SysReportDataset> page = query.toPage();
        mapper.selectPage(page, Wrappers.<SysReportDataset>lambdaQuery()
                .eq(StringUtils.hasText(query.getBizDomain()),
                        SysReportDataset::getBizDomain, query.getBizDomain())
                .eq(StringUtils.hasText(query.getSourceType()),
                        SysReportDataset::getSourceType, query.getSourceType())
                .eq(StringUtils.hasText(query.getRefreshMode()),
                        SysReportDataset::getRefreshMode, query.getRefreshMode())
                .eq(StringUtils.hasText(query.getDatasetStatus()),
                        SysReportDataset::getDatasetStatus, query.getDatasetStatus())
                .ge(StringUtils.hasText(query.getStartDate()), SysReportDataset::getCreatedAt,
                        OaBizFlowSupport.startOfDay(query.getStartDate()))
                .le(StringUtils.hasText(query.getEndDate()), SysReportDataset::getCreatedAt,
                        OaBizFlowSupport.endOfDay(query.getEndDate()))
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(SysReportDataset::getDatasetCode, query.getKeyword()).or()
                        .like(SysReportDataset::getDatasetName, query.getKeyword()).or()
                        .like(SysReportDataset::getSourceRef, query.getKeyword()))
                .orderByDesc(SysReportDataset::getId));
        return PageResult.of(page);
    }

    public SysReportDataset detail(Long id) {
        return require(id);
    }

    /** 新增或更新数据集：新增时回填来源类型、刷新模式、行数与状态，并回填组织。 */
    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, SysReportDatasetSaveRequest request) {
        SysReportDataset entity;
        if (id == null) {
            entity = new SysReportDataset();
            entity.setDatasetCode(StringUtils.hasText(request.getDatasetCode())
                    ? request.getDatasetCode() : flowSupport.nextBizNo("DS"));
            entity.setSourceType(StringUtils.hasText(request.getSourceType())
                    ? request.getSourceType() : "TABLE");
            entity.setRefreshMode(StringUtils.hasText(request.getRefreshMode())
                    ? request.getRefreshMode() : MODE_MANUAL);
            entity.setRowCount(request.getRowCount() != null ? request.getRowCount() : 0L);
            entity.setDatasetStatus(StringUtils.hasText(request.getDatasetStatus())
                    ? request.getDatasetStatus() : STATUS_DRAFT);
            entity.setOrgId(currentOrgId());
        } else {
            entity = require(id);
            if (StringUtils.hasText(request.getDatasetCode())) {
                entity.setDatasetCode(request.getDatasetCode());
            }
            if (StringUtils.hasText(request.getSourceType())) {
                entity.setSourceType(request.getSourceType());
            }
            if (StringUtils.hasText(request.getRefreshMode())) {
                entity.setRefreshMode(request.getRefreshMode());
            }
            if (request.getRowCount() != null) {
                entity.setRowCount(request.getRowCount());
            }
            if (StringUtils.hasText(request.getDatasetStatus())) {
                entity.setDatasetStatus(request.getDatasetStatus());
            }
        }
        entity.setDatasetName(request.getDatasetName());
        entity.setBizDomain(request.getBizDomain());
        entity.setSourceRef(request.getSourceRef());
        entity.setFilterCondition(request.getFilterCondition());
        entity.setFieldSchema(request.getFieldSchema());
        entity.setRefreshCron(request.getRefreshCron());
        entity.setLastRefreshAt(parseTimestamp(request.getLastRefreshAt()));
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

    /** 刷新数据集：回填刷新时间；草稿状态刷新后自动激活。 */
    @Transactional(rollbackFor = Exception.class)
    public SysReportDataset refresh(Long id) {
        SysReportDataset entity = require(id);
        entity.setLastRefreshAt(LocalDateTime.now());
        if (STATUS_DRAFT.equals(entity.getDatasetStatus())) {
            entity.setDatasetStatus(STATUS_ACTIVE);
        }
        mapper.updateById(entity);
        return entity;
    }

    /** 停用数据集：状态置为 DISABLED。 */
    @Transactional(rollbackFor = Exception.class)
    public SysReportDataset disable(Long id) {
        SysReportDataset entity = require(id);
        entity.setDatasetStatus(STATUS_DISABLED);
        mapper.updateById(entity);
        return entity;
    }

    /** 删除数据集：物理删除以释放编码，避免软删除行占用唯一索引导致再次登记冲突。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    /** 数据集统计：按状态/刷新模式汇总，并汇总全部数据集数据行数。 */
    public Map<String, Object> stats() {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("total", mapper.selectCount(null));
        result.put("draft", countByStatus(STATUS_DRAFT));
        result.put("active", countByStatus(STATUS_ACTIVE));
        result.put("disabled", countByStatus(STATUS_DISABLED));
        result.put("manualCount", countByMode(MODE_MANUAL));
        result.put("scheduledCount", countByMode(MODE_SCHEDULED));
        result.put("realtimeCount", countByMode(MODE_REALTIME));
        List<SysReportDataset> all = mapper.selectList(null);
        long totalRows = all.stream().mapToLong(d -> d.getRowCount() == null ? 0L : d.getRowCount()).sum();
        result.put("totalRows", totalRows);
        return result;
    }

    public SysReportDataset require(Long id) {
        SysReportDataset entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "数据集不存在: " + id);
        }
        return entity;
    }

    private Long countByStatus(String datasetStatus) {
        Long count = mapper.selectCount(Wrappers.<SysReportDataset>lambdaQuery()
                .eq(SysReportDataset::getDatasetStatus, datasetStatus));
        return count == null ? 0L : count;
    }

    private Long countByMode(String refreshMode) {
        Long count = mapper.selectCount(Wrappers.<SysReportDataset>lambdaQuery()
                .eq(SysReportDataset::getRefreshMode, refreshMode));
        return count == null ? 0L : count;
    }

    /** 解析时间字符串为 LocalDateTime，空白或非法返回 null。 */
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
