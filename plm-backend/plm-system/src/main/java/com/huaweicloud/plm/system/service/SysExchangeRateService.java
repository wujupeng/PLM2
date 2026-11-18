package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.core.toolkit.support.SFunction;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.FinanceQuery;
import com.huaweicloud.plm.system.dto.SysExchangeRateSaveRequest;
import com.huaweicloud.plm.system.entity.SysExchangeRate;
import com.huaweicloud.plm.system.mapper.SysExchangeRateMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * 汇率（G1-N5 公共平台底座—多币种多税率 WBS T101）：
 * 汇率登记、生效/过期/停用状态流转与统计。
 * 汇率编号支持人工指定，删除语义为「释放编码」，采用物理删除以保持与唯一索引一致。
 */
@Service
@RequiredArgsConstructor
public class SysExchangeRateService {

    private static final String STATUS_ACTIVE = "ACTIVE";
    private static final String STATUS_EXPIRED = "EXPIRED";
    private static final String STATUS_DISABLED = "DISABLED";
    private static final String DEFAULT_RATE_TYPE = "SPOT";

    private final SysExchangeRateMapper mapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询汇率：源/目标币种、汇率类型、汇率状态精确，关键字匹配编号/源币种/目标币种/来源，时间区间作用于创建时间。 */
    public PageResult<SysExchangeRate> pageExchangeRates(FinanceQuery query) {
        Page<SysExchangeRate> page = query.toPage();
        mapper.selectPage(page, Wrappers.<SysExchangeRate>lambdaQuery()
                .eq(StringUtils.hasText(query.getFromCurrency()),
                        SysExchangeRate::getFromCurrency, query.getFromCurrency())
                .eq(StringUtils.hasText(query.getToCurrency()),
                        SysExchangeRate::getToCurrency, query.getToCurrency())
                .eq(StringUtils.hasText(query.getRateType()),
                        SysExchangeRate::getRateType, query.getRateType())
                .eq(StringUtils.hasText(query.getRateStatus()),
                        SysExchangeRate::getRateStatus, query.getRateStatus())
                .ge(StringUtils.hasText(query.getStartDate()), SysExchangeRate::getCreatedAt,
                        OaBizFlowSupport.startOfDay(query.getStartDate()))
                .le(StringUtils.hasText(query.getEndDate()), SysExchangeRate::getCreatedAt,
                        OaBizFlowSupport.endOfDay(query.getEndDate()))
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(SysExchangeRate::getRateNo, query.getKeyword()).or()
                        .like(SysExchangeRate::getFromCurrency, query.getKeyword()).or()
                        .like(SysExchangeRate::getToCurrency, query.getKeyword()).or()
                        .like(SysExchangeRate::getRateSource, query.getKeyword()))
                .orderByDesc(SysExchangeRate::getId));
        return PageResult.of(page);
    }

    public SysExchangeRate detail(Long id) {
        return require(id);
    }

    /** 新增或更新汇率：新增时回填默认汇率状态、汇率类型、汇率值与组织，汇率编号为空时自动生成。 */
    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, SysExchangeRateSaveRequest request) {
        SysExchangeRate entity;
        if (id == null) {
            entity = new SysExchangeRate();
            entity.setRateNo(StringUtils.hasText(request.getRateNo())
                    ? request.getRateNo() : flowSupport.nextBizNo("EX"));
            entity.setRateStatus(STATUS_ACTIVE);
            entity.setRateType(StringUtils.hasText(request.getRateType())
                    ? request.getRateType() : DEFAULT_RATE_TYPE);
            entity.setRateValue(request.getRateValue() == null ? BigDecimal.ONE : request.getRateValue());
            entity.setOrgId(currentOrgId());
        } else {
            entity = require(id);
            if (StringUtils.hasText(request.getRateNo())) {
                entity.setRateNo(request.getRateNo());
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

    /** 启用：汇率状态置为 ACTIVE。 */
    @Transactional(rollbackFor = Exception.class)
    public SysExchangeRate enable(Long id) {
        return changeRateStatus(id, STATUS_ACTIVE);
    }

    /** 停用：汇率状态置为 DISABLED。 */
    @Transactional(rollbackFor = Exception.class)
    public SysExchangeRate disable(Long id) {
        return changeRateStatus(id, STATUS_DISABLED);
    }

    /** 过期：汇率状态置为 EXPIRED。 */
    @Transactional(rollbackFor = Exception.class)
    public SysExchangeRate expire(Long id) {
        return changeRateStatus(id, STATUS_EXPIRED);
    }

    /** 删除汇率：物理删除以释放编码，避免软删除行占用唯一索引导致再次登记冲突。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    /** 汇率统计：按汇率状态汇总。 */
    public Map<String, Object> stats() {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("total", mapper.selectCount(null));
        result.put("active", countBy(SysExchangeRate::getRateStatus, STATUS_ACTIVE));
        result.put("expired", countBy(SysExchangeRate::getRateStatus, STATUS_EXPIRED));
        result.put("disabled", countBy(SysExchangeRate::getRateStatus, STATUS_DISABLED));
        return result;
    }

    public SysExchangeRate require(Long id) {
        SysExchangeRate entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "汇率不存在: " + id);
        }
        return entity;
    }

    /** 仅在请求提供值（字符串非空 / 数值非 null）时覆盖实体对应字段。 */
    private void applyRequest(SysExchangeRate entity, SysExchangeRateSaveRequest request) {
        if (StringUtils.hasText(request.getFromCurrency())) {
            entity.setFromCurrency(request.getFromCurrency());
        }
        if (StringUtils.hasText(request.getToCurrency())) {
            entity.setToCurrency(request.getToCurrency());
        }
        if (StringUtils.hasText(request.getRateType())) {
            entity.setRateType(request.getRateType());
        }
        if (request.getRateValue() != null) {
            entity.setRateValue(request.getRateValue());
        }
        if (request.getEffectiveDate() != null) {
            entity.setEffectiveDate(request.getEffectiveDate());
        }
        if (request.getExpireDate() != null) {
            entity.setExpireDate(request.getExpireDate());
        }
        if (StringUtils.hasText(request.getRateSource())) {
            entity.setRateSource(request.getRateSource());
        }
        if (StringUtils.hasText(request.getRateStatus())) {
            entity.setRateStatus(request.getRateStatus());
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

    private SysExchangeRate changeRateStatus(Long id, String rateStatus) {
        SysExchangeRate entity = require(id);
        entity.setRateStatus(rateStatus);
        mapper.updateById(entity);
        return entity;
    }

    private Long countBy(SFunction<SysExchangeRate, ?> column, Object value) {
        Long count = mapper.selectCount(Wrappers.<SysExchangeRate>lambdaQuery().eq(column, value));
        return count == null ? 0L : count;
    }

    private Long currentOrgId() {
        UserContext.Principal principal = UserContext.get();
        return principal == null ? null : principal.orgId();
    }
}
