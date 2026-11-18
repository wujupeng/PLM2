package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.core.toolkit.support.SFunction;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.FileQuery;
import com.huaweicloud.plm.system.dto.SysFileScanRecordSaveRequest;
import com.huaweicloud.plm.system.entity.SysFileScanRecord;
import com.huaweicloud.plm.system.mapper.SysFileScanRecordMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * 病毒扫描记录（G1-N3 公共平台底座—统一文件服务 WBS T011）：扫描记录登记与统计。
 * 扫描编号支持人工指定，删除语义为「释放编码」，采用物理删除以保持与唯一索引一致。
 */
@Service
@RequiredArgsConstructor
public class SysFileScanRecordService {

    private static final String RESULT_CLEAN = "CLEAN";
    private static final String RESULT_INFECTED = "INFECTED";
    private static final String RESULT_ERROR = "ERROR";

    private final SysFileScanRecordMapper mapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询扫描记录：扫描结果精确，关键字匹配扫描编号/附件编号/文件名称，时间区间作用于创建时间。 */
    public PageResult<SysFileScanRecord> pageRecords(FileQuery query) {
        Page<SysFileScanRecord> page = query.toPage();
        mapper.selectPage(page, Wrappers.<SysFileScanRecord>lambdaQuery()
                .eq(StringUtils.hasText(query.getScanResult()),
                        SysFileScanRecord::getScanResult, query.getScanResult())
                .ge(StringUtils.hasText(query.getStartDate()), SysFileScanRecord::getCreatedAt,
                        OaBizFlowSupport.startOfDay(query.getStartDate()))
                .le(StringUtils.hasText(query.getEndDate()), SysFileScanRecord::getCreatedAt,
                        OaBizFlowSupport.endOfDay(query.getEndDate()))
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(SysFileScanRecord::getScanNo, query.getKeyword()).or()
                        .like(SysFileScanRecord::getFileNo, query.getKeyword()).or()
                        .like(SysFileScanRecord::getFileName, query.getKeyword()))
                .orderByDesc(SysFileScanRecord::getId));
        return PageResult.of(page);
    }

    public SysFileScanRecord detail(Long id) {
        return require(id);
    }

    /** 新增或更新扫描记录：新增时回填默认扫描结果与耗时，扫描时间为空时回填当前时间，并回填组织。 */
    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, SysFileScanRecordSaveRequest request) {
        SysFileScanRecord entity;
        if (id == null) {
            entity = new SysFileScanRecord();
            entity.setScanNo(StringUtils.hasText(request.getScanNo())
                    ? request.getScanNo() : flowSupport.nextBizNo("FSC"));
            entity.setScanResult(RESULT_CLEAN);
            entity.setCostMs(0);
            entity.setScanTime(request.getScanTime() != null ? request.getScanTime() : LocalDateTime.now());
            entity.setOrgId(currentOrgId());
        } else {
            entity = require(id);
            if (StringUtils.hasText(request.getScanNo())) {
                entity.setScanNo(request.getScanNo());
            }
        }
        applyRequest(entity, request);
        if (id == null) {
            mapper.insert(entity);
        } else {
            mapper.updateById(entity);
        }
        return entity.getId();
    }

    /** 删除扫描记录：物理删除以释放编码，避免软删除行占用唯一索引导致再次登记冲突。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    /** 病毒扫描记录统计：按扫描结果汇总并统计总耗时。 */
    public Map<String, Object> stats() {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("total", mapper.selectCount(null));
        result.put("clean", countByResult(RESULT_CLEAN));
        result.put("infected", countByResult(RESULT_INFECTED));
        result.put("error", countByResult(RESULT_ERROR));
        long totalCostMs = 0L;
        List<SysFileScanRecord> records = mapper.selectList(null);
        if (records != null) {
            for (SysFileScanRecord record : records) {
                if (record.getCostMs() != null) {
                    totalCostMs += record.getCostMs();
                }
            }
        }
        result.put("totalCostMs", totalCostMs);
        return result;
    }

    public SysFileScanRecord require(Long id) {
        SysFileScanRecord entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "病毒扫描记录不存在: " + id);
        }
        return entity;
    }

    /** 仅在请求提供值（字符串非空、数值/时间非空）时覆盖实体对应字段。 */
    private void applyRequest(SysFileScanRecord entity, SysFileScanRecordSaveRequest request) {
        if (StringUtils.hasText(request.getFileNo())) {
            entity.setFileNo(request.getFileNo());
        }
        if (StringUtils.hasText(request.getFileName())) {
            entity.setFileName(request.getFileName());
        }
        if (StringUtils.hasText(request.getScanEngine())) {
            entity.setScanEngine(request.getScanEngine());
        }
        if (StringUtils.hasText(request.getEngineVersion())) {
            entity.setEngineVersion(request.getEngineVersion());
        }
        if (StringUtils.hasText(request.getVirusName())) {
            entity.setVirusName(request.getVirusName());
        }
        if (StringUtils.hasText(request.getScanResult())) {
            entity.setScanResult(request.getScanResult());
        }
        if (StringUtils.hasText(request.getActionTaken())) {
            entity.setActionTaken(request.getActionTaken());
        }
        if (request.getScanTime() != null) {
            entity.setScanTime(request.getScanTime());
        }
        if (request.getCostMs() != null) {
            entity.setCostMs(request.getCostMs());
        }
        if (StringUtils.hasText(request.getOrgName())) {
            entity.setOrgName(request.getOrgName());
        }
        if (StringUtils.hasText(request.getRemark())) {
            entity.setRemark(request.getRemark());
        }
    }

    private Long countByResult(String scanResult) {
        return countBy(SysFileScanRecord::getScanResult, scanResult);
    }

    private Long countBy(SFunction<SysFileScanRecord, ?> column, Object value) {
        Long count = mapper.selectCount(Wrappers.<SysFileScanRecord>lambdaQuery().eq(column, value));
        return count == null ? 0L : count;
    }

    private Long currentOrgId() {
        UserContext.Principal principal = UserContext.get();
        return principal == null ? null : principal.orgId();
    }
}
