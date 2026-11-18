package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.ErpCompletionReceiptQuery;
import com.huaweicloud.plm.system.dto.ErpCompletionReceiptSaveRequest;
import com.huaweicloud.plm.system.entity.ErpCompletionReceipt;
import com.huaweicloud.plm.system.mapper.ErpCompletionReceiptMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;

/**
 * ERP 生产管理—完工入库单（对应 WBS T026 生产管理、T096 生产订单与补料，属 G3 ERP）：
 * 完工入库登记、分页查询与删除。
 * 完工入库单号支持人工指定，删除语义为「释放编码」，采用物理删除以保持与唯一索引一致。
 */
@Service
@RequiredArgsConstructor
public class ErpCompletionReceiptService {

    private static final String DEFAULT_RECEIPT_NO_PREFIX = "ECR";
    private static final String DEFAULT_UOM = "PCS";
    private static final String DEFAULT_INSPECTION_STATUS = "PENDING";
    private static final String DEFAULT_RECEIPT_STATUS = "DRAFT";

    private final ErpCompletionReceiptMapper mapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询完工入库单：入库状态/检验状态/生产订单号精确，单号/物料名称模糊，按主键倒序。 */
    public PageResult<ErpCompletionReceipt> page(ErpCompletionReceiptQuery query) {
        Page<ErpCompletionReceipt> page = query.toPage();
        mapper.selectPage(page, Wrappers.<ErpCompletionReceipt>lambdaQuery()
                .eq(StringUtils.hasText(query.getReceiptStatus()),
                        ErpCompletionReceipt::getReceiptStatus, query.getReceiptStatus())
                .eq(StringUtils.hasText(query.getInspectionStatus()),
                        ErpCompletionReceipt::getInspectionStatus, query.getInspectionStatus())
                .eq(StringUtils.hasText(query.getOrderNo()),
                        ErpCompletionReceipt::getOrderNo, query.getOrderNo())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(ErpCompletionReceipt::getReceiptNo, query.getKeyword()).or()
                        .like(ErpCompletionReceipt::getMaterialName, query.getKeyword()))
                .orderByDesc(ErpCompletionReceipt::getId));
        return PageResult.of(page);
    }

    public ErpCompletionReceipt detail(Long id) {
        return require(id);
    }

    /** 新增或更新完工入库单：新增时回填默认状态/单位/数量与组织，完工入库单号为空时自动生成。 */
    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, ErpCompletionReceiptSaveRequest request) {
        ErpCompletionReceipt entity;
        if (id == null) {
            entity = new ErpCompletionReceipt();
            entity.setReceiptNo(StringUtils.hasText(request.getReceiptNo())
                    ? request.getReceiptNo() : flowSupport.nextBizNo(DEFAULT_RECEIPT_NO_PREFIX));
            entity.setUom(StringUtils.hasText(request.getUom())
                    ? request.getUom() : DEFAULT_UOM);
            entity.setCompletedQty(request.getCompletedQty() != null
                    ? request.getCompletedQty() : BigDecimal.ZERO);
            entity.setScrapQty(request.getScrapQty() != null
                    ? request.getScrapQty() : BigDecimal.ZERO);
            entity.setInspectionRequired(request.getInspectionRequired() != null
                    ? request.getInspectionRequired() : 0);
            entity.setInspectionStatus(StringUtils.hasText(request.getInspectionStatus())
                    ? request.getInspectionStatus() : DEFAULT_INSPECTION_STATUS);
            entity.setReceiptStatus(StringUtils.hasText(request.getReceiptStatus())
                    ? request.getReceiptStatus() : DEFAULT_RECEIPT_STATUS);
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

    /** 删除完工入库单：物理删除以释放完工入库单号。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    public ErpCompletionReceipt require(Long id) {
        ErpCompletionReceipt entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "完工入库单不存在: " + id);
        }
        return entity;
    }

    /** 仅在请求提供值（字符串非空、数值/日期非空）时覆盖实体对应字段。 */
    private void applyRequest(ErpCompletionReceipt entity, ErpCompletionReceiptSaveRequest request) {
        if (StringUtils.hasText(request.getReceiptNo())) {
            entity.setReceiptNo(request.getReceiptNo());
        }
        if (StringUtils.hasText(request.getOrderNo())) {
            entity.setOrderNo(request.getOrderNo());
        }
        if (StringUtils.hasText(request.getMaterialCode())) {
            entity.setMaterialCode(request.getMaterialCode());
        }
        if (StringUtils.hasText(request.getMaterialName())) {
            entity.setMaterialName(request.getMaterialName());
        }
        if (StringUtils.hasText(request.getSpec())) {
            entity.setSpec(request.getSpec());
        }
        if (StringUtils.hasText(request.getUom())) {
            entity.setUom(request.getUom());
        }
        if (request.getCompletedQty() != null) {
            entity.setCompletedQty(request.getCompletedQty());
        }
        if (request.getScrapQty() != null) {
            entity.setScrapQty(request.getScrapQty());
        }
        if (StringUtils.hasText(request.getWarehouseCode())) {
            entity.setWarehouseCode(request.getWarehouseCode());
        }
        if (request.getReceiptDate() != null) {
            entity.setReceiptDate(request.getReceiptDate());
        }
        if (request.getInspectionRequired() != null) {
            entity.setInspectionRequired(request.getInspectionRequired());
        }
        if (StringUtils.hasText(request.getInspectionStatus())) {
            entity.setInspectionStatus(request.getInspectionStatus());
        }
        if (StringUtils.hasText(request.getReceiptStatus())) {
            entity.setReceiptStatus(request.getReceiptStatus());
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
