package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.core.toolkit.support.SFunction;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.FinanceQuery;
import com.huaweicloud.plm.system.dto.SysTaxRateSaveRequest;
import com.huaweicloud.plm.system.entity.SysTaxRate;
import com.huaweicloud.plm.system.mapper.SysTaxRateMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * 税率（G1-N5 公共平台底座—多币种多税率 WBS T101）：
 * 税率登记、生效/过期/停用状态流转与统计。
 * 税率编号支持人工指定，删除语义为「释放编码」，采用物理删除以保持与唯一索引一致。
 */
@Service
@RequiredArgsConstructor
public class SysTaxRateService {

    private static final String STATUS_ACTIVE = "ACTIVE";
    private static final String STATUS_EXPIRED = "EXPIRED";
    private static final String STATUS_DISABLED = "DISABLED";
    private static final String DEFAULT_TAX_TYPE = "VAT";

    private final SysTaxRateMapper mapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询税率：税率类型、税率状态精确，关键字匹配编号/编码/名称，时间区间作用于创建时间。 */
    public PageResult<SysTaxRate> pageTaxRates(FinanceQuery query) {
        Page<SysTaxRate> page = query.toPage();
        mapper.selectPage(page, Wrappers.<SysTaxRate>lambdaQuery()
                .eq(StringUtils.hasText(query.getTaxType()),
                        SysTaxRate::getTaxType, query.getTaxType())
                .eq(StringUtils.hasText(query.getTaxStatus()),
                        SysTaxRate::getTaxStatus, query.getTaxStatus())
                .ge(StringUtils.hasText(query.getStartDate()), SysTaxRate::getCreatedAt,
                        OaBizFlowSupport.startOfDay(query.getStartDate()))
                .le(StringUtils.hasText(query.getEndDate()), SysTaxRate::getCreatedAt,
                        OaBizFlowSupport.endOfDay(query.getEndDate()))
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(SysTaxRate::getTaxNo, query.getKeyword()).or()
                        .like(SysTaxRate::getTaxCode, query.getKeyword()).or()
                        .like(SysTaxRate::getTaxName, query.getKeyword()))
                .orderByDesc(SysTaxRate::getId));
        return PageResult.of(page);
    }

    public SysTaxRate detail(Long id) {
        return require(id);
    }

    /** 新增或更新税率：新增时回填默认税率状态、税率类型、税率值与组织，税率编号为空时自动生成。 */
    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, SysTaxRateSaveRequest request) {
        SysTaxRate entity;
        if (id == null) {
            entity = new SysTaxRate();
            entity.setTaxNo(StringUtils.hasText(request.getTaxNo())
                    ? request.getTaxNo() : flowSupport.nextBizNo("TAX"));
            entity.setTaxStatus(STATUS_ACTIVE);
            entity.setTaxType(StringUtils.hasText(request.getTaxType())
                    ? request.getTaxType() : DEFAULT_TAX_TYPE);
            entity.setTaxRate(request.getTaxRate() == null ? BigDecimal.ZERO : request.getTaxRate());
            entity.setOrgId(currentOrgId());
        } else {
            entity = require(id);
            if (StringUtils.hasText(request.getTaxNo())) {
                entity.setTaxNo(request.getTaxNo());
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

    /** 启用：税率状态置为 ACTIVE。 */
    @Transactional(rollbackFor = Exception.class)
    public SysTaxRate enable(Long id) {
        return changeTaxStatus(id, STATUS_ACTIVE);
    }

    /** 停用：税率状态置为 DISABLED。 */
    @Transactional(rollbackFor = Exception.class)
    public SysTaxRate disable(Long id) {
        return changeTaxStatus(id, STATUS_DISABLED);
    }

    /** 过期：税率状态置为 EXPIRED。 */
    @Transactional(rollbackFor = Exception.class)
    public SysTaxRate expire(Long id) {
        return changeTaxStatus(id, STATUS_EXPIRED);
    }

    /** 删除税率：物理删除以释放编码，避免软删除行占用唯一索引导致再次登记冲突。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    /** 税率统计：按税率状态汇总。 */
    public Map<String, Object> stats() {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("total", mapper.selectCount(null));
        result.put("active", countBy(SysTaxRate::getTaxStatus, STATUS_ACTIVE));
        result.put("expired", countBy(SysTaxRate::getTaxStatus, STATUS_EXPIRED));
        result.put("disabled", countBy(SysTaxRate::getTaxStatus, STATUS_DISABLED));
        return result;
    }

    public SysTaxRate require(Long id) {
        SysTaxRate entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "税率不存在: " + id);
        }
        return entity;
    }

    /** 仅在请求提供值（字符串非空 / 数值非 null）时覆盖实体对应字段。 */
    private void applyRequest(SysTaxRate entity, SysTaxRateSaveRequest request) {
        if (StringUtils.hasText(request.getTaxCode())) {
            entity.setTaxCode(request.getTaxCode());
        }
        if (StringUtils.hasText(request.getTaxName())) {
            entity.setTaxName(request.getTaxName());
        }
        if (StringUtils.hasText(request.getTaxType())) {
            entity.setTaxType(request.getTaxType());
        }
        if (request.getTaxRate() != null) {
            entity.setTaxRate(request.getTaxRate());
        }
        if (StringUtils.hasText(request.getCountry())) {
            entity.setCountry(request.getCountry());
        }
        if (request.getEffectiveDate() != null) {
            entity.setEffectiveDate(request.getEffectiveDate());
        }
        if (request.getExpireDate() != null) {
            entity.setExpireDate(request.getExpireDate());
        }
        if (StringUtils.hasText(request.getTaxStatus())) {
            entity.setTaxStatus(request.getTaxStatus());
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

    private SysTaxRate changeTaxStatus(Long id, String taxStatus) {
        SysTaxRate entity = require(id);
        entity.setTaxStatus(taxStatus);
        mapper.updateById(entity);
        return entity;
    }

    private Long countBy(SFunction<SysTaxRate, ?> column, Object value) {
        Long count = mapper.selectCount(Wrappers.<SysTaxRate>lambdaQuery().eq(column, value));
        return count == null ? 0L : count;
    }

    private Long currentOrgId() {
        UserContext.Principal principal = UserContext.get();
        return principal == null ? null : principal.orgId();
    }
}
