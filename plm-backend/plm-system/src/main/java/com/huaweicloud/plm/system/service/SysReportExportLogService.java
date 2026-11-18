package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.ReportQuery;
import com.huaweicloud.plm.system.dto.SysReportExportLogSaveRequest;
import com.huaweicloud.plm.system.entity.SysReportExportLog;
import com.huaweicloud.plm.system.mapper.SysReportExportLogMapper;
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
 * 导出审计（G1-N2 报表平台 WBS T010）：导出留痕登记与统计。
 * 记录导出人、导出范围、行数、文件大小与结果，满足数据外发审计要求。
 */
@Service
@RequiredArgsConstructor
public class SysReportExportLogService {

    private static final String STATUS_SUCCESS = "SUCCESS";
    private static final String STATUS_FAILED = "FAILED";
    private static final DateTimeFormatter TS_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    private final SysReportExportLogMapper mapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询导出审计：结果状态精确，关键字匹配导出编号/报表编码/报表名称/导出人，时间区间作用于创建时间。 */
    public PageResult<SysReportExportLog> pageExportLogs(ReportQuery query) {
        Page<SysReportExportLog> page = query.toPage();
        mapper.selectPage(page, Wrappers.<SysReportExportLog>lambdaQuery()
                .eq(StringUtils.hasText(query.getExportStatus()),
                        SysReportExportLog::getResultStatus, query.getExportStatus())
                .ge(StringUtils.hasText(query.getStartDate()), SysReportExportLog::getCreatedAt,
                        OaBizFlowSupport.startOfDay(query.getStartDate()))
                .le(StringUtils.hasText(query.getEndDate()), SysReportExportLog::getCreatedAt,
                        OaBizFlowSupport.endOfDay(query.getEndDate()))
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(SysReportExportLog::getExportNo, query.getKeyword()).or()
                        .like(SysReportExportLog::getReportCode, query.getKeyword()).or()
                        .like(SysReportExportLog::getReportName, query.getKeyword()).or()
                        .like(SysReportExportLog::getExportBy, query.getKeyword()))
                .orderByDesc(SysReportExportLog::getId));
        return PageResult.of(page);
    }

    public SysReportExportLog detail(Long id) {
        return require(id);
    }

    /** 新增或更新导出审计：新增时回填导出编号、导出格式、行数、文件大小、导出时间、结果与耗时。 */
    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, SysReportExportLogSaveRequest request) {
        SysReportExportLog entity;
        if (id == null) {
            entity = new SysReportExportLog();
            entity.setExportNo(StringUtils.hasText(request.getExportNo())
                    ? request.getExportNo() : flowSupport.nextBizNo("EXP"));
            entity.setExportType(StringUtils.hasText(request.getExportType())
                    ? request.getExportType() : "EXCEL");
            entity.setExportRows(request.getExportRows() != null ? request.getExportRows() : 0);
            entity.setFileSize(request.getFileSize() != null ? request.getFileSize() : 0L);
            entity.setExportTime(StringUtils.hasText(request.getExportTime())
                    ? parseTimestamp(request.getExportTime()) : LocalDateTime.now());
            entity.setResultStatus(StringUtils.hasText(request.getResultStatus())
                    ? request.getResultStatus() : STATUS_SUCCESS);
            entity.setCostMs(request.getCostMs() != null ? request.getCostMs() : 0);
            entity.setOrgId(currentOrgId());
        } else {
            entity = require(id);
            if (StringUtils.hasText(request.getExportNo())) {
                entity.setExportNo(request.getExportNo());
            }
            if (StringUtils.hasText(request.getExportType())) {
                entity.setExportType(request.getExportType());
            }
            if (request.getExportRows() != null) {
                entity.setExportRows(request.getExportRows());
            }
            if (request.getFileSize() != null) {
                entity.setFileSize(request.getFileSize());
            }
            if (StringUtils.hasText(request.getExportTime())) {
                LocalDateTime parsed = parseTimestamp(request.getExportTime());
                if (parsed != null) {
                    entity.setExportTime(parsed);
                }
            }
            if (StringUtils.hasText(request.getResultStatus())) {
                entity.setResultStatus(request.getResultStatus());
            }
            if (request.getCostMs() != null) {
                entity.setCostMs(request.getCostMs());
            }
        }
        entity.setReportCode(request.getReportCode());
        entity.setReportName(request.getReportName());
        entity.setExportBy(request.getExportBy());
        entity.setIpAddress(request.getIpAddress());
        entity.setFilterSummary(request.getFilterSummary());
        entity.setOrgName(request.getOrgName());
        entity.setRemark(request.getRemark());
        if (id == null) {
            mapper.insert(entity);
        } else {
            mapper.updateById(entity);
        }
        return entity.getId();
    }

    /** 删除导出审计：物理删除以释放编号，避免软删除行占用唯一索引导致再次登记冲突。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    /** 导出审计统计：按结果汇总，并汇总全部导出记录的导出行数与文件大小。 */
    public Map<String, Object> stats() {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("total", mapper.selectCount(null));
        result.put("success", countByStatus(STATUS_SUCCESS));
        result.put("failed", countByStatus(STATUS_FAILED));
        List<SysReportExportLog> all = mapper.selectList(null);
        long totalRows = all.stream().mapToLong(l -> l.getExportRows() == null ? 0L : l.getExportRows()).sum();
        long totalFileSize = all.stream().mapToLong(l -> l.getFileSize() == null ? 0L : l.getFileSize()).sum();
        result.put("totalRows", totalRows);
        result.put("totalFileSize", totalFileSize);
        return result;
    }

    public SysReportExportLog require(Long id) {
        SysReportExportLog entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "导出审计记录不存在: " + id);
        }
        return entity;
    }

    private Long countByStatus(String resultStatus) {
        Long count = mapper.selectCount(Wrappers.<SysReportExportLog>lambdaQuery()
                .eq(SysReportExportLog::getResultStatus, resultStatus));
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
