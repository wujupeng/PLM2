package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.ReportQuery;
import com.huaweicloud.plm.system.dto.SysReportIndicatorSaveRequest;
import com.huaweicloud.plm.system.entity.SysReportIndicator;
import com.huaweicloud.plm.system.mapper.SysReportIndicatorMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * 指标口径（G1-N2 报表平台 WBS T010）：指标统一登记、启用/停用状态流转与统计。
 * 指标是否需先审核取可配置项 report.indicator.review.required，口径发布流程可配置。
 */
@Service
@RequiredArgsConstructor
public class SysReportIndicatorService {

    /** 指标发布前是否需审核的可配置项键。 */
    private static final String REVIEW_REQUIRED_KEY = "report.indicator.review.required";
    private static final String STATUS_DRAFT = "DRAFT";
    private static final String STATUS_ACTIVE = "ACTIVE";
    private static final String STATUS_DISABLED = "DISABLED";

    private final SysReportIndicatorMapper mapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询指标口径：业务域/分类/状态精确，关键字匹配编码/名称/业务域，时间区间作用于创建时间。 */
    public PageResult<SysReportIndicator> pageIndicators(ReportQuery query) {
        Page<SysReportIndicator> page = query.toPage();
        mapper.selectPage(page, Wrappers.<SysReportIndicator>lambdaQuery()
                .eq(StringUtils.hasText(query.getBizDomain()),
                        SysReportIndicator::getBizDomain, query.getBizDomain())
                .eq(StringUtils.hasText(query.getCategory()),
                        SysReportIndicator::getCategory, query.getCategory())
                .eq(StringUtils.hasText(query.getIndicatorStatus()),
                        SysReportIndicator::getIndicatorStatus, query.getIndicatorStatus())
                .ge(StringUtils.hasText(query.getStartDate()), SysReportIndicator::getCreatedAt,
                        OaBizFlowSupport.startOfDay(query.getStartDate()))
                .le(StringUtils.hasText(query.getEndDate()), SysReportIndicator::getCreatedAt,
                        OaBizFlowSupport.endOfDay(query.getEndDate()))
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(SysReportIndicator::getIndicatorCode, query.getKeyword()).or()
                        .like(SysReportIndicator::getIndicatorName, query.getKeyword()).or()
                        .like(SysReportIndicator::getBizDomain, query.getKeyword()))
                .orderByDesc(SysReportIndicator::getId));
        return PageResult.of(page);
    }

    public SysReportIndicator detail(Long id) {
        return require(id);
    }

    /** 新增或更新指标口径：新增时回填默认小数位、刷新周期与状态，并回填组织。 */
    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, SysReportIndicatorSaveRequest request) {
        SysReportIndicator entity;
        if (id == null) {
            entity = new SysReportIndicator();
            entity.setIndicatorCode(StringUtils.hasText(request.getIndicatorCode())
                    ? request.getIndicatorCode() : flowSupport.nextBizNo("IND"));
            entity.setDecimalScale(request.getDecimalScale() != null ? request.getDecimalScale() : 2);
            entity.setRefreshCycle(StringUtils.hasText(request.getRefreshCycle())
                    ? request.getRefreshCycle() : "DAILY");
            entity.setIndicatorStatus(StringUtils.hasText(request.getIndicatorStatus())
                    ? request.getIndicatorStatus() : STATUS_DRAFT);
            entity.setOrgId(currentOrgId());
        } else {
            entity = require(id);
            if (StringUtils.hasText(request.getIndicatorCode())) {
                entity.setIndicatorCode(request.getIndicatorCode());
            }
            if (request.getDecimalScale() != null) {
                entity.setDecimalScale(request.getDecimalScale());
            }
            if (StringUtils.hasText(request.getRefreshCycle())) {
                entity.setRefreshCycle(request.getRefreshCycle());
            }
            if (StringUtils.hasText(request.getIndicatorStatus())) {
                entity.setIndicatorStatus(request.getIndicatorStatus());
            }
        }
        entity.setIndicatorName(request.getIndicatorName());
        entity.setBizDomain(request.getBizDomain());
        entity.setCategory(request.getCategory());
        entity.setCaliber(request.getCaliber());
        entity.setFormula(request.getFormula());
        entity.setUnit(request.getUnit());
        entity.setDataSource(request.getDataSource());
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

    /** 发布指标：状态置为 ACTIVE。 */
    @Transactional(rollbackFor = Exception.class)
    public SysReportIndicator publish(Long id) {
        return changeStatus(id, STATUS_ACTIVE);
    }

    /** 停用指标：状态置为 DISABLED。 */
    @Transactional(rollbackFor = Exception.class)
    public SysReportIndicator disable(Long id) {
        return changeStatus(id, STATUS_DISABLED);
    }

    /** 删除指标：物理删除以释放编码，避免软删除行占用唯一索引导致再次登记冲突。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    /** 指标口径统计：按状态汇总并回显口径发布前是否需审核。 */
    public Map<String, Object> stats() {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("total", mapper.selectCount(null));
        result.put("draft", countByStatus(STATUS_DRAFT));
        result.put("active", countByStatus(STATUS_ACTIVE));
        result.put("disabled", countByStatus(STATUS_DISABLED));
        result.put("reviewRequired", flowSupport.configBoolean(REVIEW_REQUIRED_KEY, true));
        return result;
    }

    public SysReportIndicator require(Long id) {
        SysReportIndicator entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "指标口径不存在: " + id);
        }
        return entity;
    }

    private SysReportIndicator changeStatus(Long id, String status) {
        SysReportIndicator entity = require(id);
        entity.setIndicatorStatus(status);
        mapper.updateById(entity);
        return entity;
    }

    private Long countByStatus(String indicatorStatus) {
        Long count = mapper.selectCount(Wrappers.<SysReportIndicator>lambdaQuery()
                .eq(SysReportIndicator::getIndicatorStatus, indicatorStatus));
        return count == null ? 0L : count;
    }

    private Long currentOrgId() {
        UserContext.Principal principal = UserContext.get();
        return principal == null ? null : principal.orgId();
    }
}
