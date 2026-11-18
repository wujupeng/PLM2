package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.WmsReceiptQuery;
import com.huaweicloud.plm.system.dto.WmsReceiptSaveRequest;
import com.huaweicloud.plm.system.entity.WmsReceipt;
import com.huaweicloud.plm.system.mapper.WmsReceiptMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

/**
 * WMS 收货上架—收货单（对应收货单）：
 * 收货单登记、分页查询与删除。
 * 收货单号支持人工指定，删除语义为「释放编码」，采用物理删除以保持与唯一索引一致。
 */
@Service
@RequiredArgsConstructor
public class WmsReceiptService {

    private static final String DEFAULT_RECEIPT_NO_PREFIX = "RCV";
    private static final String DEFAULT_RECEIPT_STATUS = "PENDING";
    private static final String DEFAULT_RECEIVE_TYPE = "SCAN";

    private final WmsReceiptMapper mapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询收货单记录：收货方式/收货状态/供应商编码/收货通知单号精确，收货单号/收货通知单号/供应商编码/供应商名称/收货人模糊，按主键倒序。 */
    public PageResult<WmsReceipt> page(WmsReceiptQuery query) {
        Page<WmsReceipt> page = query.toPage();
        mapper.selectPage(page, Wrappers.<WmsReceipt>lambdaQuery()
                .eq(StringUtils.hasText(query.getReceiveType()),
                        WmsReceipt::getReceiveType, query.getReceiveType())
                .eq(StringUtils.hasText(query.getReceiveStatus()),
                        WmsReceipt::getReceiveStatus, query.getReceiveStatus())
                .eq(StringUtils.hasText(query.getSupplierCode()),
                        WmsReceipt::getSupplierCode, query.getSupplierCode())
                .eq(StringUtils.hasText(query.getAsnNo()),
                        WmsReceipt::getAsnNo, query.getAsnNo())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(WmsReceipt::getReceiptNo, query.getKeyword()).or()
                        .like(WmsReceipt::getAsnNo, query.getKeyword()).or()
                        .like(WmsReceipt::getSupplierCode, query.getKeyword()).or()
                        .like(WmsReceipt::getSupplierName, query.getKeyword()).or()
                        .like(WmsReceipt::getOperator, query.getKeyword()))
                .orderByDesc(WmsReceipt::getId));
        return PageResult.of(page);
    }

    public WmsReceipt detail(Long id) {
        return require(id);
    }

    /** 新增或更新收货单记录：新增时回填默认收货方式、收货状态与组织，收货单号为空时自动生成。 */
    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, WmsReceiptSaveRequest request) {
        WmsReceipt entity;
        if (id == null) {
            entity = new WmsReceipt();
            entity.setReceiptNo(StringUtils.hasText(request.getReceiptNo())
                    ? request.getReceiptNo() : flowSupport.nextBizNo(DEFAULT_RECEIPT_NO_PREFIX));
            entity.setReceiveType(StringUtils.hasText(request.getReceiveType())
                    ? request.getReceiveType() : DEFAULT_RECEIVE_TYPE);
            entity.setReceiveStatus(StringUtils.hasText(request.getReceiveStatus())
                    ? request.getReceiveStatus() : DEFAULT_RECEIPT_STATUS);
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

    /** 删除收货单记录：物理删除以释放收货单号。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    public WmsReceipt require(Long id) {
        WmsReceipt entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "收货单不存在: " + id);
        }
        return entity;
    }

    /** 仅在请求提供值（字符串非空、日期非空、数量非空）时覆盖实体对应字段。 */
    private void applyRequest(WmsReceipt entity, WmsReceiptSaveRequest request) {
        if (StringUtils.hasText(request.getReceiptNo())) {
            entity.setReceiptNo(request.getReceiptNo());
        }
        if (StringUtils.hasText(request.getAsnNo())) {
            entity.setAsnNo(request.getAsnNo());
        }
        if (StringUtils.hasText(request.getSupplierCode())) {
            entity.setSupplierCode(request.getSupplierCode());
        }
        if (StringUtils.hasText(request.getSupplierName())) {
            entity.setSupplierName(request.getSupplierName());
        }
        if (StringUtils.hasText(request.getWarehouseCode())) {
            entity.setWarehouseCode(request.getWarehouseCode());
        }
        if (StringUtils.hasText(request.getReceiveType())) {
            entity.setReceiveType(request.getReceiveType());
        }
        if (request.getReceiveTime() != null) {
            entity.setReceiveTime(request.getReceiveTime());
        }
        if (StringUtils.hasText(request.getOperator())) {
            entity.setOperator(request.getOperator());
        }
        if (request.getTotalQty() != null) {
            entity.setTotalQty(request.getTotalQty());
        }
        if (request.getInspectedQty() != null) {
            entity.setInspectedQty(request.getInspectedQty());
        }
        if (request.getQualifiedQty() != null) {
            entity.setQualifiedQty(request.getQualifiedQty());
        }
        if (request.getRejectedQty() != null) {
            entity.setRejectedQty(request.getRejectedQty());
        }
        if (StringUtils.hasText(request.getReceiveStatus())) {
            entity.setReceiveStatus(request.getReceiveStatus());
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
