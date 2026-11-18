package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.ErpOutsourceInboundQuery;
import com.huaweicloud.plm.system.dto.ErpOutsourceInboundSaveRequest;
import com.huaweicloud.plm.system.entity.ErpOutsourceInbound;
import com.huaweicloud.plm.system.mapper.ErpOutsourceInboundMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;

/**
 * ERP 委外管理—委外入库单（对应 WBS T024 委外管理、T094 委外加工闭环，属 G3 ERP）：
 * 委外入库登记、分页查询与删除。
 * 入库单号支持人工指定，删除语义为「释放编码」，采用物理删除以保持与唯一索引一致。
 */
@Service
@RequiredArgsConstructor
public class ErpOutsourceInboundService {

    private static final String DEFAULT_INBOUND_NO_PREFIX = "OSN";
    private static final String DEFAULT_INBOUND_STATUS = "DRAFT";

    private final ErpOutsourceInboundMapper mapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询委外入库单：状态/到货单号/订单号/供应商编码精确，单号/到货单号模糊，按主键倒序。 */
    public PageResult<ErpOutsourceInbound> page(ErpOutsourceInboundQuery query) {
        Page<ErpOutsourceInbound> page = query.toPage();
        mapper.selectPage(page, Wrappers.<ErpOutsourceInbound>lambdaQuery()
                .eq(StringUtils.hasText(query.getInboundStatus()),
                        ErpOutsourceInbound::getInboundStatus, query.getInboundStatus())
                .eq(StringUtils.hasText(query.getReceiptNo()),
                        ErpOutsourceInbound::getReceiptNo, query.getReceiptNo())
                .eq(StringUtils.hasText(query.getOrderNo()),
                        ErpOutsourceInbound::getOrderNo, query.getOrderNo())
                .eq(StringUtils.hasText(query.getSupplierCode()),
                        ErpOutsourceInbound::getSupplierCode, query.getSupplierCode())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(ErpOutsourceInbound::getInboundNo, query.getKeyword()).or()
                        .like(ErpOutsourceInbound::getReceiptNo, query.getKeyword()))
                .orderByDesc(ErpOutsourceInbound::getId));
        return PageResult.of(page);
    }

    public ErpOutsourceInbound detail(Long id) {
        return require(id);
    }

    /** 新增或更新委外入库单：新增时回填默认状态/数量与组织，入库单号为空时自动生成。 */
    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, ErpOutsourceInboundSaveRequest request) {
        ErpOutsourceInbound entity;
        if (id == null) {
            entity = new ErpOutsourceInbound();
            entity.setInboundNo(StringUtils.hasText(request.getInboundNo())
                    ? request.getInboundNo() : flowSupport.nextBizNo(DEFAULT_INBOUND_NO_PREFIX));
            entity.setInboundStatus(StringUtils.hasText(request.getInboundStatus())
                    ? request.getInboundStatus() : DEFAULT_INBOUND_STATUS);
            entity.setInboundQty(request.getInboundQty() != null
                    ? request.getInboundQty() : BigDecimal.ZERO);
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

    /** 删除委外入库单：物理删除以释放入库单号。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    public ErpOutsourceInbound require(Long id) {
        ErpOutsourceInbound entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "委外入库单不存在: " + id);
        }
        return entity;
    }

    /** 仅在请求提供值（字符串非空、数值/日期非空）时覆盖实体对应字段。 */
    private void applyRequest(ErpOutsourceInbound entity, ErpOutsourceInboundSaveRequest request) {
        if (StringUtils.hasText(request.getInboundNo())) {
            entity.setInboundNo(request.getInboundNo());
        }
        if (StringUtils.hasText(request.getReceiptNo())) {
            entity.setReceiptNo(request.getReceiptNo());
        }
        if (StringUtils.hasText(request.getOrderNo())) {
            entity.setOrderNo(request.getOrderNo());
        }
        if (StringUtils.hasText(request.getSupplierCode())) {
            entity.setSupplierCode(request.getSupplierCode());
        }
        if (StringUtils.hasText(request.getWarehouseCode())) {
            entity.setWarehouseCode(request.getWarehouseCode());
        }
        if (request.getInboundDate() != null) {
            entity.setInboundDate(request.getInboundDate());
        }
        if (request.getInboundQty() != null) {
            entity.setInboundQty(request.getInboundQty());
        }
        if (StringUtils.hasText(request.getBatchNo())) {
            entity.setBatchNo(request.getBatchNo());
        }
        if (StringUtils.hasText(request.getOperatorName())) {
            entity.setOperatorName(request.getOperatorName());
        }
        if (StringUtils.hasText(request.getInboundStatus())) {
            entity.setInboundStatus(request.getInboundStatus());
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
