package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.ReportQuery;
import com.huaweicloud.plm.system.dto.SysReportDashboardSaveRequest;
import com.huaweicloud.plm.system.entity.SysReportDashboard;
import com.huaweicloud.plm.system.mapper.SysReportDashboardMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * 经营驾驶舱（G1-N2 报表平台 WBS T010）：看板登记、发布/停用状态流转与统计。
 * 看板按受众发布，刷新间隔默认取可配置项 report.dashboard.refresh.interval.sec。
 */
@Service
@RequiredArgsConstructor
public class SysReportDashboardService {

    /** 驾驶舱默认刷新间隔可配置项键。 */
    private static final String REFRESH_INTERVAL_KEY = "report.dashboard.refresh.interval.sec";
    private static final String STATUS_DRAFT = "DRAFT";
    private static final String STATUS_PUBLISHED = "PUBLISHED";
    private static final String STATUS_DISABLED = "DISABLED";
    private static final String LAYOUT_GRID = "GRID";
    private static final String LAYOUT_FREE = "FREE";

    private final SysReportDashboardMapper mapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询驾驶舱：业务域/状态精确，关键字匹配编码/名称/受众，时间区间作用于创建时间。 */
    public PageResult<SysReportDashboard> pageDashboards(ReportQuery query) {
        Page<SysReportDashboard> page = query.toPage();
        mapper.selectPage(page, Wrappers.<SysReportDashboard>lambdaQuery()
                .eq(StringUtils.hasText(query.getBizDomain()),
                        SysReportDashboard::getBizDomain, query.getBizDomain())
                .eq(StringUtils.hasText(query.getDashboardStatus()),
                        SysReportDashboard::getDashboardStatus, query.getDashboardStatus())
                .ge(StringUtils.hasText(query.getStartDate()), SysReportDashboard::getCreatedAt,
                        OaBizFlowSupport.startOfDay(query.getStartDate()))
                .le(StringUtils.hasText(query.getEndDate()), SysReportDashboard::getCreatedAt,
                        OaBizFlowSupport.endOfDay(query.getEndDate()))
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(SysReportDashboard::getDashboardCode, query.getKeyword()).or()
                        .like(SysReportDashboard::getDashboardName, query.getKeyword()).or()
                        .like(SysReportDashboard::getAudience, query.getKeyword()))
                .orderByDesc(SysReportDashboard::getId));
        return PageResult.of(page);
    }

    public SysReportDashboard detail(Long id) {
        return require(id);
    }

    /** 新增或更新驾驶舱：新增时回填布局方式、刷新间隔与状态，并回填组织。 */
    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, SysReportDashboardSaveRequest request) {
        SysReportDashboard entity;
        if (id == null) {
            entity = new SysReportDashboard();
            entity.setDashboardCode(StringUtils.hasText(request.getDashboardCode())
                    ? request.getDashboardCode() : flowSupport.nextBizNo("DASH"));
            entity.setLayoutMode(StringUtils.hasText(request.getLayoutMode())
                    ? request.getLayoutMode() : LAYOUT_GRID);
            entity.setRefreshIntervalSec(request.getRefreshIntervalSec() != null
                    ? request.getRefreshIntervalSec() : flowSupport.configInt(REFRESH_INTERVAL_KEY, 60));
            entity.setDashboardStatus(StringUtils.hasText(request.getDashboardStatus())
                    ? request.getDashboardStatus() : STATUS_DRAFT);
            entity.setOrgId(currentOrgId());
        } else {
            entity = require(id);
            if (StringUtils.hasText(request.getDashboardCode())) {
                entity.setDashboardCode(request.getDashboardCode());
            }
            if (StringUtils.hasText(request.getLayoutMode())) {
                entity.setLayoutMode(request.getLayoutMode());
            }
            if (request.getRefreshIntervalSec() != null) {
                entity.setRefreshIntervalSec(request.getRefreshIntervalSec());
            }
            if (StringUtils.hasText(request.getDashboardStatus())) {
                entity.setDashboardStatus(request.getDashboardStatus());
            }
        }
        entity.setDashboardName(request.getDashboardName());
        entity.setBizDomain(request.getBizDomain());
        entity.setAudience(request.getAudience());
        entity.setWidgetSchema(request.getWidgetSchema());
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

    /** 发布驾驶舱：状态置为 PUBLISHED。 */
    @Transactional(rollbackFor = Exception.class)
    public SysReportDashboard publish(Long id) {
        return changeStatus(id, STATUS_PUBLISHED);
    }

    /** 停用驾驶舱：状态置为 DISABLED。 */
    @Transactional(rollbackFor = Exception.class)
    public SysReportDashboard disable(Long id) {
        return changeStatus(id, STATUS_DISABLED);
    }

    /** 删除驾驶舱：物理删除以释放编码，避免软删除行占用唯一索引导致再次登记冲突。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    /** 驾驶舱统计：按状态/布局方式汇总，并回显默认刷新间隔（秒）。 */
    public Map<String, Object> stats() {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("total", mapper.selectCount(null));
        result.put("draft", countByStatus(STATUS_DRAFT));
        result.put("published", countByStatus(STATUS_PUBLISHED));
        result.put("disabled", countByStatus(STATUS_DISABLED));
        result.put("gridCount", countByLayout(LAYOUT_GRID));
        result.put("freeCount", countByLayout(LAYOUT_FREE));
        result.put("defaultRefreshSec", flowSupport.configInt(REFRESH_INTERVAL_KEY, 60));
        return result;
    }

    public SysReportDashboard require(Long id) {
        SysReportDashboard entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "经营驾驶舱不存在: " + id);
        }
        return entity;
    }

    private SysReportDashboard changeStatus(Long id, String status) {
        SysReportDashboard entity = require(id);
        entity.setDashboardStatus(status);
        mapper.updateById(entity);
        return entity;
    }

    private Long countByStatus(String dashboardStatus) {
        Long count = mapper.selectCount(Wrappers.<SysReportDashboard>lambdaQuery()
                .eq(SysReportDashboard::getDashboardStatus, dashboardStatus));
        return count == null ? 0L : count;
    }

    private Long countByLayout(String layoutMode) {
        Long count = mapper.selectCount(Wrappers.<SysReportDashboard>lambdaQuery()
                .eq(SysReportDashboard::getLayoutMode, layoutMode));
        return count == null ? 0L : count;
    }

    private Long currentOrgId() {
        UserContext.Principal principal = UserContext.get();
        return principal == null ? null : principal.orgId();
    }
}
