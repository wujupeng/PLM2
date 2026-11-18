package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.ErpOutsourceReturnQuery;
import com.huaweicloud.plm.system.dto.ErpOutsourceReturnSaveRequest;
import com.huaweicloud.plm.system.entity.ErpOutsourceReturn;
import com.huaweicloud.plm.system.mapper.ErpOutsourceReturnMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;

/**
 * ERP 委外管理—委外退货单（对应 WBS T024/T094 委外加工闭环，属 G3 ERP）：
 * 委外退货登记、分页查询与删除。
 * 退货单号支持人工指定，删除语义为「释放编码」，采用物理删除以保持与唯一索引一致。
 */
@Service
@RequiredArgsConstructor
public class ErpOutsourceReturnService {

    private static final String DEFAULT_RETURN_NO_PREFIX = "OST";
    private static final String DEFAULT_RETURN_STATUS = "DRAFT";

    private final ErpOutsourceReturnMapper mapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询委外退货单：状态/订单号/供应商编码精确，退货单号/物料编码模糊，按主键倒序。 */
    public PageResult<ErpOutsourceReturn> page(ErpOutsourceReturnQuery query) {
        Page<ErpOutsourceReturn> page = query.toPage();
        mapper.selectPage(page, Wrappers.<ErpOutsourceReturn>lambdaQuery()
                .eq(StringUtils.hasText(query.getReturnStatus()),
                        ErpOutsourceReturn::getReturnStatus, query.getReturnStatus())
                .eq(StringUtils.hasText(query.getOrderNo()),
                        ErpOutsourceReturn::getOrderNo, query.getOrderNo())
                .eq(StringUtils.hasText(query.getSupplierCode()),
                        ErpOutsourceReturn::getSupplierCode, query.getSupplierCode())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(ErpOutsourceReturn::getReturnNo, query.getKeyword()).or()
                        .like(ErpOutsourceReturn::getMaterialCode, query.getKeyword()))
                .orderByDesc(ErpOutsourceReturn::getId));
        return PageResult.of(page);
    }

    public ErpOutsourceReturn detail(Long id) {
        return require(id);
    }

    /** 新增或更新委外退货单：新增时回填默认状态/数量与组织，退货单号为空时自动生成。 */
    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, ErpOutsourceReturnSaveRequest request) {
        ErpOutsourceReturn entity;
        if (id == null) {
            entity = new ErpOutsourceReturn();
            entity.setReturnNo(StringUtils.hasText(request.getReturnNo())
                    ? request.getReturnNo() : flowSupport.nextBizNo(DEFAULT_RETURN_NO_PREFIX));
            entity.setReturnStatus(StringUtils.hasText(request.getReturnStatus())
                    ? request.getReturnStatus() : DEFAULT_RETURN_STATUS);
            entity.setReturnQty(request.getReturnQty() != null
                    ? request.getReturnQty() : BigDecimal.ZERO);
            entity.setReturnAmount(request.getReturnAmount() != null
                    ? request.getReturnAmount() : BigDecimal.ZERO);
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

    /** 删除委外退货单：物理删除以释放退货单号。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    public ErpOutsourceReturn require(Long id) {
        ErpOutsourceReturn entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "委外退货单不存在: " + id);
        }
        return entity;
    }

    /** 仅在请求提供值（字符串非空、数值/日期非空）时覆盖实体对应字段。 */
    private void applyRequest(ErpOutsourceReturn entity, ErpOutsourceReturnSaveRequest request) {
        if (StringUtils.hasText(request.getReturnNo())) {
            entity.setReturnNo(request.getReturnNo());
        }
        if (StringUtils.hasText(request.getOrderNo())) {
            entity.setOrderNo(request.getOrderNo());
        }
        if (StringUtils.hasText(request.getReceiptNo())) {
            entity.setReceiptNo(request.getReceiptNo());
        }
        if (StringUtils.hasText(request.getSupplierCode())) {
            entity.setSupplierCode(request.getSupplierCode());
        }
        if (StringUtils.hasText(request.getSupplierName())) {
            entity.setSupplierName(request.getSupplierName());
        }
        if (StringUtils.hasText(request.getMaterialCode())) {
            entity.setMaterialCode(request.getMaterialCode());
        }
        if (StringUtils.hasText(request.getMaterialName())) {
            entity.setMaterialName(request.getMaterialName());
        }
        if (request.getReturnDate() != null) {
            entity.setReturnDate(request.getReturnDate());
        }
        if (request.getReturnQty() != null) {
            entity.setReturnQty(request.getReturnQty());
        }
        if (StringUtils.hasText(request.getReturnReason())) {
            entity.setReturnReason(request.getReturnReason());
        }
        if (request.getReturnAmount() != null) {
            entity.setReturnAmount(request.getReturnAmount());
        }
        if (StringUtils.hasText(request.getWarehouseCode())) {
            entity.setWarehouseCode(request.getWarehouseCode());
        }
        if (StringUtils.hasText(request.getReturnStatus())) {
            entity.setReturnStatus(request.getReturnStatus());
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
