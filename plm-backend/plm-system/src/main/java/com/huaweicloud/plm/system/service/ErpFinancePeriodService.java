package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.ErpFinancePeriodQuery;
import com.huaweicloud.plm.system.dto.ErpFinancePeriodSaveRequest;
import com.huaweicloud.plm.system.entity.ErpFinancePeriod;
import com.huaweicloud.plm.system.mapper.ErpFinancePeriodMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

/**
 * ERP 财务—会计期间（对应 WBS T028 会计科目与会计期间，属 G3-N6 ERP 财务）：
 * 会计期间登记、分页查询与删除。
 * 期间编码由用户指定，删除语义为「释放编码」，采用物理删除以保持与唯一索引一致。
 */
@Service
@RequiredArgsConstructor
public class ErpFinancePeriodService {

    private static final String DEFAULT_PERIOD_STATUS = "OPEN";

    private final ErpFinancePeriodMapper mapper;

    /** 分页查询会计期间：期间状态/年度精确，期间编码模糊，按主键倒序。 */
    public PageResult<ErpFinancePeriod> page(ErpFinancePeriodQuery query) {
        Page<ErpFinancePeriod> page = query.toPage();
        mapper.selectPage(page, Wrappers.<ErpFinancePeriod>lambdaQuery()
                .eq(StringUtils.hasText(query.getPeriodStatus()),
                        ErpFinancePeriod::getPeriodStatus, query.getPeriodStatus())
                .eq(query.getPeriodYear() != null,
                        ErpFinancePeriod::getPeriodYear, query.getPeriodYear())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(ErpFinancePeriod::getPeriodCode, query.getKeyword()))
                .orderByDesc(ErpFinancePeriod::getId));
        return PageResult.of(page);
    }

    public ErpFinancePeriod detail(Long id) {
        return require(id);
    }

    /** 新增或更新会计期间：新增时回填默认状态及组织。 */
    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, ErpFinancePeriodSaveRequest request) {
        ErpFinancePeriod entity;
        if (id == null) {
            entity = new ErpFinancePeriod();
            entity.setPeriodStatus(StringUtils.hasText(request.getPeriodStatus())
                    ? request.getPeriodStatus() : DEFAULT_PERIOD_STATUS);
            entity.setOrgId(currentOrgId());
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

    /** 删除会计期间：物理删除以释放期间编码。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    public ErpFinancePeriod require(Long id) {
        ErpFinancePeriod entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "会计期间不存在: " + id);
        }
        return entity;
    }

    /** 仅在请求提供值（字符串非空、数值/日期非空）时覆盖实体对应字段。 */
    private void applyRequest(ErpFinancePeriod entity, ErpFinancePeriodSaveRequest request) {
        if (StringUtils.hasText(request.getPeriodCode())) {
            entity.setPeriodCode(request.getPeriodCode());
        }
        if (request.getPeriodYear() != null) {
            entity.setPeriodYear(request.getPeriodYear());
        }
        if (request.getPeriodMonth() != null) {
            entity.setPeriodMonth(request.getPeriodMonth());
        }
        if (request.getStartDate() != null) {
            entity.setStartDate(request.getStartDate());
        }
        if (request.getEndDate() != null) {
            entity.setEndDate(request.getEndDate());
        }
        if (StringUtils.hasText(request.getPeriodStatus())) {
            entity.setPeriodStatus(request.getPeriodStatus());
        }
        if (request.getClosedAt() != null) {
            entity.setClosedAt(request.getClosedAt());
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
