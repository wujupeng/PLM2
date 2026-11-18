package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.core.toolkit.support.SFunction;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.FinanceQuery;
import com.huaweicloud.plm.system.dto.SysCurrencySaveRequest;
import com.huaweicloud.plm.system.entity.SysCurrency;
import com.huaweicloud.plm.system.mapper.SysCurrencyMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * 币种（G1-N5 公共平台底座—多币种多税率 WBS T101）：
 * 币种登记、启停状态流转与统计。
 * 币种编码支持人工指定，删除语义为「释放编码」，采用物理删除以保持与唯一索引一致。
 */
@Service
@RequiredArgsConstructor
public class SysCurrencyService {

    private static final String STATUS_ACTIVE = "ACTIVE";
    private static final String STATUS_DISABLED = "DISABLED";
    private static final int DEFAULT_PRECISION = 2;
    private static final int DEFAULT_BASE_FLAG = 0;
    private static final int BASE_FLAG_TRUE = 1;

    private final SysCurrencyMapper mapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询币种：币种状态精确，关键字匹配编码/名称，时间区间作用于创建时间。 */
    public PageResult<SysCurrency> pageCurrencies(FinanceQuery query) {
        Page<SysCurrency> page = query.toPage();
        mapper.selectPage(page, Wrappers.<SysCurrency>lambdaQuery()
                .eq(StringUtils.hasText(query.getCurrencyStatus()),
                        SysCurrency::getCurrencyStatus, query.getCurrencyStatus())
                .ge(StringUtils.hasText(query.getStartDate()), SysCurrency::getCreatedAt,
                        OaBizFlowSupport.startOfDay(query.getStartDate()))
                .le(StringUtils.hasText(query.getEndDate()), SysCurrency::getCreatedAt,
                        OaBizFlowSupport.endOfDay(query.getEndDate()))
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(SysCurrency::getCurrencyCode, query.getKeyword()).or()
                        .like(SysCurrency::getCurrencyName, query.getKeyword()))
                .orderByDesc(SysCurrency::getId));
        return PageResult.of(page);
    }

    public SysCurrency detail(Long id) {
        return require(id);
    }

    /** 新增或更新币种：新增时回填默认币种状态、金额精度、本位币标识与组织，币种编码为空时自动生成。 */
    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, SysCurrencySaveRequest request) {
        SysCurrency entity;
        if (id == null) {
            entity = new SysCurrency();
            entity.setCurrencyCode(StringUtils.hasText(request.getCurrencyCode())
                    ? request.getCurrencyCode() : flowSupport.nextBizNo("CUR"));
            entity.setCurrencyStatus(STATUS_ACTIVE);
            entity.setCurrencyPrecision(request.getCurrencyPrecision() == null
                    ? DEFAULT_PRECISION : request.getCurrencyPrecision());
            entity.setBaseFlag(request.getBaseFlag() == null ? DEFAULT_BASE_FLAG : request.getBaseFlag());
            entity.setOrgId(currentOrgId());
        } else {
            entity = require(id);
            if (StringUtils.hasText(request.getCurrencyCode())) {
                entity.setCurrencyCode(request.getCurrencyCode());
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

    /** 启用：币种状态置为 ACTIVE。 */
    @Transactional(rollbackFor = Exception.class)
    public SysCurrency enable(Long id) {
        return changeCurrencyStatus(id, STATUS_ACTIVE);
    }

    /** 停用：币种状态置为 DISABLED。 */
    @Transactional(rollbackFor = Exception.class)
    public SysCurrency disable(Long id) {
        return changeCurrencyStatus(id, STATUS_DISABLED);
    }

    /** 删除币种：物理删除以释放编码，避免软删除行占用唯一索引导致再次登记冲突。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    /** 币种统计：按币种状态与本位币标识汇总。 */
    public Map<String, Object> stats() {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("total", mapper.selectCount(null));
        result.put("active", countBy(SysCurrency::getCurrencyStatus, STATUS_ACTIVE));
        result.put("disabled", countBy(SysCurrency::getCurrencyStatus, STATUS_DISABLED));
        result.put("baseCount", countBy(SysCurrency::getBaseFlag, BASE_FLAG_TRUE));
        return result;
    }

    public SysCurrency require(Long id) {
        SysCurrency entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "币种不存在: " + id);
        }
        return entity;
    }

    /** 仅在请求提供值（字符串非空 / 数值非 null）时覆盖实体对应字段。 */
    private void applyRequest(SysCurrency entity, SysCurrencySaveRequest request) {
        if (StringUtils.hasText(request.getCurrencyCode())) {
            entity.setCurrencyCode(request.getCurrencyCode());
        }
        if (StringUtils.hasText(request.getCurrencyName())) {
            entity.setCurrencyName(request.getCurrencyName());
        }
        if (StringUtils.hasText(request.getCurrencySymbol())) {
            entity.setCurrencySymbol(request.getCurrencySymbol());
        }
        if (request.getCurrencyPrecision() != null) {
            entity.setCurrencyPrecision(request.getCurrencyPrecision());
        }
        if (request.getBaseFlag() != null) {
            entity.setBaseFlag(request.getBaseFlag());
        }
        if (StringUtils.hasText(request.getCountry())) {
            entity.setCountry(request.getCountry());
        }
        if (StringUtils.hasText(request.getCurrencyStatus())) {
            entity.setCurrencyStatus(request.getCurrencyStatus());
        }
        if (StringUtils.hasText(request.getDescription())) {
            entity.setDescription(request.getDescription());
        }
        if (StringUtils.hasText(request.getOrgName())) {
            entity.setOrgName(request.getOrgName());
        }
        if (StringUtils.hasText(request.getRemark())) {
            entity.setRemark(request.getRemark());
        }
    }

    private SysCurrency changeCurrencyStatus(Long id, String currencyStatus) {
        SysCurrency entity = require(id);
        entity.setCurrencyStatus(currencyStatus);
        mapper.updateById(entity);
        return entity;
    }

    private Long countBy(SFunction<SysCurrency, ?> column, Object value) {
        Long count = mapper.selectCount(Wrappers.<SysCurrency>lambdaQuery().eq(column, value));
        return count == null ? 0L : count;
    }

    private Long currentOrgId() {
        UserContext.Principal principal = UserContext.get();
        return principal == null ? null : principal.orgId();
    }
}
