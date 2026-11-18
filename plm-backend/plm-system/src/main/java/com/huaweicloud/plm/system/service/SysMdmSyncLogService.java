package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.SysMdmSyncLogQuery;
import com.huaweicloud.plm.system.dto.SysMdmSyncLogSaveRequest;
import com.huaweicloud.plm.system.entity.SysMdmSyncLog;
import com.huaweicloud.plm.system.mapper.SysMdmSyncLogMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;

/**
 * 主数据平台—同步日志（G1-N8 公共平台底座 WBS T007 主数据平台）：
 * 同步日志登记、分页查询与删除。
 * 同步日志编号支持人工指定，删除语义为「释放编号」，采用物理删除以保持与唯一索引一致。
 */
@Service
@RequiredArgsConstructor
public class SysMdmSyncLogService {

    private static final String DEFAULT_SYNC_STATUS = "SUCCESS";

    private final SysMdmSyncLogMapper mapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询同步日志：域/源系统/目标系统/状态精确，编号/主数据编码模糊，按主键倒序。 */
    public PageResult<SysMdmSyncLog> pageSyncLogs(SysMdmSyncLogQuery query) {
        Page<SysMdmSyncLog> page = query.toPage();
        mapper.selectPage(page, Wrappers.<SysMdmSyncLog>lambdaQuery()
                .eq(StringUtils.hasText(query.getDomainCode()),
                        SysMdmSyncLog::getDomainCode, query.getDomainCode())
                .eq(StringUtils.hasText(query.getSourceSystem()),
                        SysMdmSyncLog::getSourceSystem, query.getSourceSystem())
                .eq(StringUtils.hasText(query.getTargetSystem()),
                        SysMdmSyncLog::getTargetSystem, query.getTargetSystem())
                .eq(StringUtils.hasText(query.getSyncStatus()),
                        SysMdmSyncLog::getSyncStatus, query.getSyncStatus())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(SysMdmSyncLog::getLogNo, query.getKeyword()).or()
                        .like(SysMdmSyncLog::getMasterCode, query.getKeyword()))
                .orderByDesc(SysMdmSyncLog::getId));
        return PageResult.of(page);
    }

    public SysMdmSyncLog detail(Long id) {
        return require(id);
    }

    /** 新增或更新同步日志：新增时回填默认状态、组织与同步时间，编号为空时自动生成。 */
    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, SysMdmSyncLogSaveRequest request) {
        SysMdmSyncLog entity;
        if (id == null) {
            entity = new SysMdmSyncLog();
            entity.setLogNo(StringUtils.hasText(request.getLogNo())
                    ? request.getLogNo() : flowSupport.nextBizNo("MSY"));
            entity.setSyncStatus(StringUtils.hasText(request.getSyncStatus())
                    ? request.getSyncStatus() : DEFAULT_SYNC_STATUS);
            entity.setOrgId(currentOrgId());
            if (request.getSyncTime() == null) {
                entity.setSyncTime(LocalDateTime.now());
            }
        } else {
            entity = require(id);
        }
        applyRequest(entity, request);
        if (id == null) {
            mapper.insert(entity);
        } else {
            mapper.updateById(entity);
        }
        return entity.getId();
    }

    /** 删除同步日志：物理删除以释放同步日志编号。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    public SysMdmSyncLog require(Long id) {
        SysMdmSyncLog entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "主数据同步日志不存在: " + id);
        }
        return entity;
    }

    /** 仅在请求提供值（字符串非空、时间非 null）时覆盖实体对应字段。 */
    private void applyRequest(SysMdmSyncLog entity, SysMdmSyncLogSaveRequest request) {
        if (StringUtils.hasText(request.getLogNo())) {
            entity.setLogNo(request.getLogNo());
        }
        if (StringUtils.hasText(request.getDomainCode())) {
            entity.setDomainCode(request.getDomainCode());
        }
        if (StringUtils.hasText(request.getSourceSystem())) {
            entity.setSourceSystem(request.getSourceSystem());
        }
        if (StringUtils.hasText(request.getTargetSystem())) {
            entity.setTargetSystem(request.getTargetSystem());
        }
        if (StringUtils.hasText(request.getMasterCode())) {
            entity.setMasterCode(request.getMasterCode());
        }
        if (StringUtils.hasText(request.getSyncStatus())) {
            entity.setSyncStatus(request.getSyncStatus());
        }
        if (request.getSyncTime() != null) {
            entity.setSyncTime(request.getSyncTime());
        }
        if (StringUtils.hasText(request.getMessage())) {
            entity.setMessage(request.getMessage());
        }
        if (StringUtils.hasText(request.getOrgName())) {
            entity.setOrgName(request.getOrgName());
        }
        if (StringUtils.hasText(request.getDescription())) {
            entity.setDescription(request.getDescription());
        }
        if (StringUtils.hasText(request.getRemark())) {
            entity.setRemark(request.getRemark());
        }
    }

    private Long currentOrgId() {
        UserContext.Principal principal = UserContext.get();
        return principal == null ? null : principal.orgId();
    }
}
