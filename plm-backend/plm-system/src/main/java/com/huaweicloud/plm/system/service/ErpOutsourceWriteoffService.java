package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.ErpOutsourceWriteoffQuery;
import com.huaweicloud.plm.system.dto.ErpOutsourceWriteoffSaveRequest;
import com.huaweicloud.plm.system.entity.ErpOutsourceWriteoff;
import com.huaweicloud.plm.system.mapper.ErpOutsourceWriteoffMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;

/**
 * ERP 委外管理—委外核销单（对应 WBS T024/T094 委外加工闭环，属 G3 ERP）：
 * 委外核销登记、分页查询与删除。
 * 核销单号支持人工指定，删除语义为「释放编码」，采用物理删除以保持与唯一索引一致。
 */
@Service
@RequiredArgsConstructor
public class ErpOutsourceWriteoffService {

    private static final String DEFAULT_WRITEOFF_NO_PREFIX = "OSW";
    private static final String DEFAULT_WRITEOFF_STATUS = "OPEN";

    private final ErpOutsourceWriteoffMapper mapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询委外核销单：状态/订单号/供应商编码精确，核销单号/供应商名称模糊，按主键倒序。 */
    public PageResult<ErpOutsourceWriteoff> page(ErpOutsourceWriteoffQuery query) {
        Page<ErpOutsourceWriteoff> page = query.toPage();
        mapper.selectPage(page, Wrappers.<ErpOutsourceWriteoff>lambdaQuery()
                .eq(StringUtils.hasText(query.getWriteoffStatus()),
                        ErpOutsourceWriteoff::getWriteoffStatus, query.getWriteoffStatus())
                .eq(StringUtils.hasText(query.getOrderNo()),
                        ErpOutsourceWriteoff::getOrderNo, query.getOrderNo())
                .eq(StringUtils.hasText(query.getSupplierCode()),
                        ErpOutsourceWriteoff::getSupplierCode, query.getSupplierCode())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(ErpOutsourceWriteoff::getWriteoffNo, query.getKeyword()).or()
                        .like(ErpOutsourceWriteoff::getSupplierName, query.getKeyword()))
                .orderByDesc(ErpOutsourceWriteoff::getId));
        return PageResult.of(page);
    }

    public ErpOutsourceWriteoff detail(Long id) {
        return require(id);
    }

    /** 新增或更新委外核销单：新增时回填默认状态/数量与组织，核销单号为空时自动生成。 */
    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, ErpOutsourceWriteoffSaveRequest request) {
        ErpOutsourceWriteoff entity;
        if (id == null) {
            entity = new ErpOutsourceWriteoff();
            entity.setWriteoffNo(StringUtils.hasText(request.getWriteoffNo())
                    ? request.getWriteoffNo() : flowSupport.nextBizNo(DEFAULT_WRITEOFF_NO_PREFIX));
            entity.setWriteoffStatus(StringUtils.hasText(request.getWriteoffStatus())
                    ? request.getWriteoffStatus() : DEFAULT_WRITEOFF_STATUS);
            entity.setIssuedQty(request.getIssuedQty() != null
                    ? request.getIssuedQty() : BigDecimal.ZERO);
            entity.setReceivedQty(request.getReceivedQty() != null
                    ? request.getReceivedQty() : BigDecimal.ZERO);
            entity.setLossQty(request.getLossQty() != null
                    ? request.getLossQty() : BigDecimal.ZERO);
            entity.setBalanceQty(request.getBalanceQty() != null
                    ? request.getBalanceQty() : BigDecimal.ZERO);
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

    /** 删除委外核销单：物理删除以释放核销单号。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    public ErpOutsourceWriteoff require(Long id) {
        ErpOutsourceWriteoff entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "委外核销单不存在: " + id);
        }
        return entity;
    }

    /** 仅在请求提供值（字符串非空、数值/日期非空）时覆盖实体对应字段。 */
    private void applyRequest(ErpOutsourceWriteoff entity, ErpOutsourceWriteoffSaveRequest request) {
        if (StringUtils.hasText(request.getWriteoffNo())) {
            entity.setWriteoffNo(request.getWriteoffNo());
        }
        if (StringUtils.hasText(request.getOrderNo())) {
            entity.setOrderNo(request.getOrderNo());
        }
        if (StringUtils.hasText(request.getSettlementNo())) {
            entity.setSettlementNo(request.getSettlementNo());
        }
        if (StringUtils.hasText(request.getSupplierCode())) {
            entity.setSupplierCode(request.getSupplierCode());
        }
        if (StringUtils.hasText(request.getSupplierName())) {
            entity.setSupplierName(request.getSupplierName());
        }
        if (request.getIssuedQty() != null) {
            entity.setIssuedQty(request.getIssuedQty());
        }
        if (request.getReceivedQty() != null) {
            entity.setReceivedQty(request.getReceivedQty());
        }
        if (request.getLossQty() != null) {
            entity.setLossQty(request.getLossQty());
        }
        if (request.getBalanceQty() != null) {
            entity.setBalanceQty(request.getBalanceQty());
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
