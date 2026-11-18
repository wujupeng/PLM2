package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.ErpFinanceWriteoffQuery;
import com.huaweicloud.plm.system.dto.ErpFinanceWriteoffSaveRequest;
import com.huaweicloud.plm.system.entity.ErpFinanceWriteoff;
import com.huaweicloud.plm.system.mapper.ErpFinanceWriteoffMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;

/**
 * ERP 财务—核销单（对应 WBS T028 ERP 财务，属 G3 ERP）：
 * 核销登记、分页查询与删除。
 * 核销单号支持人工指定，删除语义为「释放编码」，采用物理删除以保持与唯一索引一致。
 */
@Service
@RequiredArgsConstructor
public class ErpFinanceWriteoffService {

    private static final String DEFAULT_WRITEOFF_NO_PREFIX = "FWO";
    private static final String DEFAULT_WRITEOFF_TYPE = "AR";
    private static final String DEFAULT_CURRENCY_CODE = "CNY";
    private static final String DEFAULT_WRITEOFF_STATUS = "DRAFT";

    private final ErpFinanceWriteoffMapper mapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询核销单：类型/状态/往来单位编码精确，核销单号/来源单号/目标单号模糊，按主键倒序。 */
    public PageResult<ErpFinanceWriteoff> page(ErpFinanceWriteoffQuery query) {
        Page<ErpFinanceWriteoff> page = query.toPage();
        mapper.selectPage(page, Wrappers.<ErpFinanceWriteoff>lambdaQuery()
                .eq(StringUtils.hasText(query.getWriteoffType()),
                        ErpFinanceWriteoff::getWriteoffType, query.getWriteoffType())
                .eq(StringUtils.hasText(query.getWriteoffStatus()),
                        ErpFinanceWriteoff::getWriteoffStatus, query.getWriteoffStatus())
                .eq(StringUtils.hasText(query.getPartyCode()),
                        ErpFinanceWriteoff::getPartyCode, query.getPartyCode())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(ErpFinanceWriteoff::getWriteoffNo, query.getKeyword()).or()
                        .like(ErpFinanceWriteoff::getSourceNo, query.getKeyword()).or()
                        .like(ErpFinanceWriteoff::getTargetNo, query.getKeyword()))
                .orderByDesc(ErpFinanceWriteoff::getId));
        return PageResult.of(page);
    }

    public ErpFinanceWriteoff detail(Long id) {
        return require(id);
    }

    /** 新增或更新核销单：新增时回填默认类型/金额/币种与状态及组织，核销单号为空时自动生成。 */
    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, ErpFinanceWriteoffSaveRequest request) {
        ErpFinanceWriteoff entity;
        if (id == null) {
            entity = new ErpFinanceWriteoff();
            entity.setWriteoffNo(StringUtils.hasText(request.getWriteoffNo())
                    ? request.getWriteoffNo() : flowSupport.nextBizNo(DEFAULT_WRITEOFF_NO_PREFIX));
            entity.setWriteoffType(StringUtils.hasText(request.getWriteoffType())
                    ? request.getWriteoffType() : DEFAULT_WRITEOFF_TYPE);
            entity.setWriteoffAmount(request.getWriteoffAmount() != null
                    ? request.getWriteoffAmount() : BigDecimal.ZERO);
            entity.setCurrencyCode(StringUtils.hasText(request.getCurrencyCode())
                    ? request.getCurrencyCode() : DEFAULT_CURRENCY_CODE);
            entity.setWriteoffStatus(StringUtils.hasText(request.getWriteoffStatus())
                    ? request.getWriteoffStatus() : DEFAULT_WRITEOFF_STATUS);
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

    /** 删除核销单：物理删除以释放核销单号。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    public ErpFinanceWriteoff require(Long id) {
        ErpFinanceWriteoff entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "核销单不存在: " + id);
        }
        return entity;
    }

    /** 仅在请求提供值（字符串非空、数值/日期非空）时覆盖实体对应字段。 */
    private void applyRequest(ErpFinanceWriteoff entity, ErpFinanceWriteoffSaveRequest request) {
        if (StringUtils.hasText(request.getWriteoffNo())) {
            entity.setWriteoffNo(request.getWriteoffNo());
        }
        if (StringUtils.hasText(request.getWriteoffType())) {
            entity.setWriteoffType(request.getWriteoffType());
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
        if (StringUtils.hasText(request.getTargetNo())) {
            entity.setTargetNo(request.getTargetNo());
        }
        if (request.getWriteoffAmount() != null) {
            entity.setWriteoffAmount(request.getWriteoffAmount());
        }
        if (StringUtils.hasText(request.getCurrencyCode())) {
            entity.setCurrencyCode(request.getCurrencyCode());
        }
        if (request.getWriteoffDate() != null) {
            entity.setWriteoffDate(request.getWriteoffDate());
        }
        if (StringUtils.hasText(request.getWriteoffStatus())) {
            entity.setWriteoffStatus(request.getWriteoffStatus());
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
