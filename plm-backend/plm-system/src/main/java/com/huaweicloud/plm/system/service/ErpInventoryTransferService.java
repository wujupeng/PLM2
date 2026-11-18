package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.ErpInventoryTransferDetailResponse;
import com.huaweicloud.plm.system.dto.ErpInventoryTransferLineSaveRequest;
import com.huaweicloud.plm.system.dto.ErpInventoryTransferQuery;
import com.huaweicloud.plm.system.dto.ErpInventoryTransferSaveRequest;
import com.huaweicloud.plm.system.entity.ErpInventoryTransfer;
import com.huaweicloud.plm.system.entity.ErpInventoryTransferLine;
import com.huaweicloud.plm.system.mapper.ErpInventoryTransferLineMapper;
import com.huaweicloud.plm.system.mapper.ErpInventoryTransferMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.util.List;

/**
 * ERP 库存核算—库存调拨（对应 WBS T027 库存核算、T097 库存业务，属 G3 ERP）：
 * 库存调拨头与明细行的登记、分页查询、明细维护与删除。
 * 删除时先逻辑删除全部明细行，再物理删除库存调拨头以释放调拨单号。
 */
@Service
@RequiredArgsConstructor
public class ErpInventoryTransferService {

    private static final String DEFAULT_TRANSFER_NO_PREFIX = "ETR";
    private static final String DEFAULT_TRANSFER_TYPE = "DIRECT";
    private static final String DEFAULT_UOM = "PCS";
    private static final String DEFAULT_TRANSFER_STATUS = "DRAFT";
    private static final String DEFAULT_LINE_STATUS = "OPEN";

    private final ErpInventoryTransferMapper mapper;
    private final ErpInventoryTransferLineMapper lineMapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询库存调拨：状态/类型/调出仓库编码精确，单号/调出仓库名称/调入仓库名称模糊，按主键倒序。 */
    public PageResult<ErpInventoryTransfer> page(ErpInventoryTransferQuery query) {
        Page<ErpInventoryTransfer> page = query.toPage();
        mapper.selectPage(page, Wrappers.<ErpInventoryTransfer>lambdaQuery()
                .eq(StringUtils.hasText(query.getTransferStatus()),
                        ErpInventoryTransfer::getTransferStatus, query.getTransferStatus())
                .eq(StringUtils.hasText(query.getTransferType()),
                        ErpInventoryTransfer::getTransferType, query.getTransferType())
                .eq(StringUtils.hasText(query.getFromWarehouseCode()),
                        ErpInventoryTransfer::getFromWarehouseCode, query.getFromWarehouseCode())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(ErpInventoryTransfer::getTransferNo, query.getKeyword()).or()
                        .like(ErpInventoryTransfer::getFromWarehouseName, query.getKeyword()).or()
                        .like(ErpInventoryTransfer::getToWarehouseName, query.getKeyword()))
                .orderByDesc(ErpInventoryTransfer::getId));
        return PageResult.of(page);
    }

    /** 库存调拨详情：返回库存调拨头与全部明细行。 */
    public ErpInventoryTransferDetailResponse detail(Long id) {
        ErpInventoryTransfer header = require(id);
        ErpInventoryTransferDetailResponse response = new ErpInventoryTransferDetailResponse();
        response.setHeader(header);
        response.setLines(listLines(id));
        return response;
    }

    /** 新增库存调拨：回填默认类型/状态/数量与组织，调拨单号为空时自动生成。 */
    @Transactional(rollbackFor = Exception.class)
    public Long create(ErpInventoryTransferSaveRequest request) {
        ErpInventoryTransfer header = new ErpInventoryTransfer();
        header.setTransferNo(StringUtils.hasText(request.getTransferNo())
                ? request.getTransferNo() : flowSupport.nextBizNo(DEFAULT_TRANSFER_NO_PREFIX));
        header.setTransferType(StringUtils.hasText(request.getTransferType())
                ? request.getTransferType() : DEFAULT_TRANSFER_TYPE);
        header.setTotalQty(request.getTotalQty() != null
                ? request.getTotalQty() : BigDecimal.ZERO);
        header.setTransferStatus(StringUtils.hasText(request.getTransferStatus())
                ? request.getTransferStatus() : DEFAULT_TRANSFER_STATUS);
        header.setOrgId(currentOrgId());
        applyHeader(header, request);
        mapper.insert(header);
        return header.getId();
    }

    /** 更新库存调拨头：仅在请求提供字段时覆盖。 */
    @Transactional(rollbackFor = Exception.class)
    public void update(Long id, ErpInventoryTransferSaveRequest request) {
        ErpInventoryTransfer header = require(id);
        applyHeader(header, request);
        mapper.updateById(header);
    }

    /** 删除库存调拨：先逻辑删除全部明细行，再物理删除库存调拨头以释放调拨单号。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        lineMapper.delete(Wrappers.<ErpInventoryTransferLine>lambdaQuery()
                .eq(ErpInventoryTransferLine::getTransferId, id));
        mapper.physicalDeleteById(id);
    }

    /** 新增库存调拨行：行号为空时取当前最大行号 +1，回填默认行状态/单位/库位/批次/数量。 */
    @Transactional(rollbackFor = Exception.class)
    public Long addLine(Long headerId, ErpInventoryTransferLineSaveRequest request) {
        ErpInventoryTransfer header = require(headerId);
        validateLine(request);
        Integer maxLineNo = lineMapper.selectMaxLineNo(headerId);

        ErpInventoryTransferLine line = new ErpInventoryTransferLine();
        line.setTransferId(headerId);
        line.setTransferNo(header.getTransferNo());
        line.setLineNo(request.getLineNo() != null
                ? request.getLineNo()
                : (maxLineNo == null ? 1 : maxLineNo + 1));
        line.setLineStatus(StringUtils.hasText(request.getLineStatus())
                ? request.getLineStatus() : DEFAULT_LINE_STATUS);
        line.setUom(StringUtils.hasText(request.getUom())
                ? request.getUom() : DEFAULT_UOM);
        line.setBatchNo(StringUtils.hasText(request.getBatchNo())
                ? request.getBatchNo() : "");
        line.setFromLocationCode(StringUtils.hasText(request.getFromLocationCode())
                ? request.getFromLocationCode() : "");
        line.setToLocationCode(StringUtils.hasText(request.getToLocationCode())
                ? request.getToLocationCode() : "");
        line.setTransferQty(request.getTransferQty() != null
                ? request.getTransferQty() : BigDecimal.ZERO);
        applyLine(line, request);
        lineMapper.insert(line);
        return line.getId();
    }

    /** 更新库存调拨行：仅在请求提供字段时覆盖。 */
    @Transactional(rollbackFor = Exception.class)
    public void updateLine(Long lineId, ErpInventoryTransferLineSaveRequest request) {
        ErpInventoryTransferLine line = requireLine(lineId);
        validateLine(request);
        if (request.getLineNo() != null) {
            line.setLineNo(request.getLineNo());
        }
        applyLine(line, request);
        lineMapper.updateById(line);
    }

    /** 删除库存调拨行：逻辑删除。 */
    @Transactional(rollbackFor = Exception.class)
    public void deleteLine(Long lineId) {
        requireLine(lineId);
        lineMapper.deleteById(lineId);
    }

    public ErpInventoryTransfer require(Long id) {
        ErpInventoryTransfer header = mapper.selectById(id);
        if (header == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "库存调拨单不存在: " + id);
        }
        return header;
    }

    private ErpInventoryTransferLine requireLine(Long lineId) {
        ErpInventoryTransferLine line = lineMapper.selectById(lineId);
        if (line == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "库存调拨行不存在: " + lineId);
        }
        return line;
    }

    private List<ErpInventoryTransferLine> listLines(Long transferId) {
        return lineMapper.selectList(Wrappers.<ErpInventoryTransferLine>lambdaQuery()
                .eq(ErpInventoryTransferLine::getTransferId, transferId)
                .orderByAsc(ErpInventoryTransferLine::getLineNo));
    }

    private void validateLine(ErpInventoryTransferLineSaveRequest request) {
        if (!StringUtils.hasText(request.getMaterialCode())) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "物料编码不能为空");
        }
    }

    /** 仅在请求提供值（字符串非空、数值/日期非空）时覆盖库存调拨头字段。 */
    private void applyHeader(ErpInventoryTransfer header, ErpInventoryTransferSaveRequest request) {
        if (StringUtils.hasText(request.getTransferNo())) {
            header.setTransferNo(request.getTransferNo());
        }
        if (StringUtils.hasText(request.getTransferType())) {
            header.setTransferType(request.getTransferType());
        }
        if (StringUtils.hasText(request.getFromWarehouseCode())) {
            header.setFromWarehouseCode(request.getFromWarehouseCode());
        }
        if (StringUtils.hasText(request.getFromWarehouseName())) {
            header.setFromWarehouseName(request.getFromWarehouseName());
        }
        if (StringUtils.hasText(request.getToWarehouseCode())) {
            header.setToWarehouseCode(request.getToWarehouseCode());
        }
        if (StringUtils.hasText(request.getToWarehouseName())) {
            header.setToWarehouseName(request.getToWarehouseName());
        }
        if (StringUtils.hasText(request.getTransferBy())) {
            header.setTransferBy(request.getTransferBy());
        }
        if (request.getTransferDate() != null) {
            header.setTransferDate(request.getTransferDate());
        }
        if (request.getTotalQty() != null) {
            header.setTotalQty(request.getTotalQty());
        }
        if (StringUtils.hasText(request.getTransferStatus())) {
            header.setTransferStatus(request.getTransferStatus());
        }
        if (StringUtils.hasText(request.getOrgName())) {
            header.setOrgName(request.getOrgName());
        }
        if (StringUtils.hasText(request.getDescription())) {
            header.setDescription(request.getDescription());
        }
        if (StringUtils.hasText(request.getRemark())) {
            header.setRemark(request.getRemark());
        }
    }

    /** 仅在请求提供值（字符串非空、数值非空）时覆盖库存调拨行字段。 */
    private void applyLine(ErpInventoryTransferLine line, ErpInventoryTransferLineSaveRequest request) {
        if (StringUtils.hasText(request.getLineStatus())) {
            line.setLineStatus(request.getLineStatus());
        }
        if (StringUtils.hasText(request.getMaterialCode())) {
            line.setMaterialCode(request.getMaterialCode());
        }
        if (StringUtils.hasText(request.getMaterialName())) {
            line.setMaterialName(request.getMaterialName());
        }
        if (StringUtils.hasText(request.getSpec())) {
            line.setSpec(request.getSpec());
        }
        if (StringUtils.hasText(request.getUom())) {
            line.setUom(request.getUom());
        }
        if (StringUtils.hasText(request.getBatchNo())) {
            line.setBatchNo(request.getBatchNo());
        }
        if (StringUtils.hasText(request.getFromLocationCode())) {
            line.setFromLocationCode(request.getFromLocationCode());
        }
        if (StringUtils.hasText(request.getToLocationCode())) {
            line.setToLocationCode(request.getToLocationCode());
        }
        if (request.getTransferQty() != null) {
            line.setTransferQty(request.getTransferQty());
        }
        if (StringUtils.hasText(request.getRemark())) {
            line.setRemark(request.getRemark());
        }
    }

    private Long currentOrgId() {
        UserContext.Principal principal = UserContext.get();
        return principal == null ? null : principal.orgId();
    }
}
