package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.ErpFinanceAccrualQuery;
import com.huaweicloud.plm.system.dto.ErpFinanceAccrualSaveRequest;
import com.huaweicloud.plm.system.entity.ErpFinanceAccrual;
import com.huaweicloud.plm.system.mapper.ErpFinanceAccrualMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;

/**
 * ERP 财务—暂估（对应 WBS T028 ERP 财务，属 G3-N6 ERP 财务）：
 * 暂估登记、分页查询与删除。
 * 暂估单号支持人工指定，删除语义为「释放编码」，采用物理删除以保持与唯一索引一致。
 */
@Service
@RequiredArgsConstructor
public class ErpFinanceAccrualService {

    private static final String DEFAULT_ACCRUAL_NO_PREFIX = "FAC";
    private static final String DEFAULT_ACCRUAL_TYPE = "AP";
    private static final String DEFAULT_CURRENCY_CODE = "CNY";
    private static final String DEFAULT_ACCRUAL_STATUS = "DRAFT";

    private final ErpFinanceAccrualMapper mapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询暂估单：类型/状态/往来单位编码/期间精确，暂估单号/来源单号/往来单位名称模糊，按主键倒序。 */
    public PageResult<ErpFinanceAccrual> page(ErpFinanceAccrualQuery query) {
        Page<ErpFinanceAccrual> page = query.toPage();
        mapper.selectPage(page, Wrappers.<ErpFinanceAccrual>lambdaQuery()
                .eq(StringUtils.hasText(query.getAccrualType()),
                        ErpFinanceAccrual::getAccrualType, query.getAccrualType())
                .eq(StringUtils.hasText(query.getAccrualStatus()),
                        ErpFinanceAccrual::getAccrualStatus, query.getAccrualStatus())
                .eq(StringUtils.hasText(query.getPartyCode()),
                        ErpFinanceAccrual::getPartyCode, query.getPartyCode())
                .eq(StringUtils.hasText(query.getPeriodCode()),
                        ErpFinanceAccrual::getPeriodCode, query.getPeriodCode())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(ErpFinanceAccrual::getAccrualNo, query.getKeyword()).or()
                        .like(ErpFinanceAccrual::getSourceNo, query.getKeyword()).or()
                        .like(ErpFinanceAccrual::getPartyName, query.getKeyword()))
                .orderByDesc(ErpFinanceAccrual::getId));
        return PageResult.of(page);
    }

    public ErpFinanceAccrual detail(Long id) {
        return require(id);
    }

    /** 新增或更新暂估单：新增时回填默认暂估类型/金额/税额/币种与冲回标志及状态和组织，暂估单号为空时自动生成。 */
    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, ErpFinanceAccrualSaveRequest request) {
        ErpFinanceAccrual entity;
        if (id == null) {
            entity = new ErpFinanceAccrual();
            entity.setAccrualNo(StringUtils.hasText(request.getAccrualNo())
                    ? request.getAccrualNo() : flowSupport.nextBizNo(DEFAULT_ACCRUAL_NO_PREFIX));
            entity.setAccrualType(StringUtils.hasText(request.getAccrualType())
                    ? request.getAccrualType() : DEFAULT_ACCRUAL_TYPE);
            entity.setAmount(request.getAmount() != null
                    ? request.getAmount() : BigDecimal.ZERO);
            entity.setTaxAmount(request.getTaxAmount() != null
                    ? request.getTaxAmount() : BigDecimal.ZERO);
            entity.setCurrencyCode(StringUtils.hasText(request.getCurrencyCode())
                    ? request.getCurrencyCode() : DEFAULT_CURRENCY_CODE);
            entity.setReversed(request.getReversed() != null
                    ? request.getReversed() : 0);
            entity.setAccrualStatus(StringUtils.hasText(request.getAccrualStatus())
                    ? request.getAccrualStatus() : DEFAULT_ACCRUAL_STATUS);
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

    /** 删除暂估单：物理删除以释放暂估单号。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    public ErpFinanceAccrual require(Long id) {
        ErpFinanceAccrual entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "暂估单不存在: " + id);
        }
        return entity;
    }

    /** 仅在请求提供值（字符串非空、数值/日期非空）时覆盖实体对应字段。 */
    private void applyRequest(ErpFinanceAccrual entity, ErpFinanceAccrualSaveRequest request) {
        if (StringUtils.hasText(request.getAccrualNo())) {
            entity.setAccrualNo(request.getAccrualNo());
        }
        if (StringUtils.hasText(request.getAccrualType())) {
            entity.setAccrualType(request.getAccrualType());
        }
        if (StringUtils.hasText(request.getPartyCode())) {
            entity.setPartyCode(request.getPartyCode());
        }
        if (StringUtils.hasText(request.getPartyName())) {
            entity.setPartyName(request.getPartyName());
        }
        if (StringUtils.hasText(request.getSourceNo())) {
            entity.setSourceNo(request.getSourceNo());
        }
        if (StringUtils.hasText(request.getPeriodCode())) {
            entity.setPeriodCode(request.getPeriodCode());
        }
        if (request.getAmount() != null) {
            entity.setAmount(request.getAmount());
        }
        if (request.getTaxAmount() != null) {
            entity.setTaxAmount(request.getTaxAmount());
        }
        if (StringUtils.hasText(request.getCurrencyCode())) {
            entity.setCurrencyCode(request.getCurrencyCode());
        }
        if (request.getAccrualDate() != null) {
            entity.setAccrualDate(request.getAccrualDate());
        }
        if (request.getReversed() != null) {
            entity.setReversed(request.getReversed());
        }
        if (StringUtils.hasText(request.getAccrualStatus())) {
            entity.setAccrualStatus(request.getAccrualStatus());
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
