package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.ErpGoodsReceiptDetailResponse;
import com.huaweicloud.plm.system.dto.ErpGoodsReceiptLineSaveRequest;
import com.huaweicloud.plm.system.dto.ErpGoodsReceiptQuery;
import com.huaweicloud.plm.system.dto.ErpGoodsReceiptSaveRequest;
import com.huaweicloud.plm.system.entity.ErpGoodsReceipt;
import com.huaweicloud.plm.system.entity.ErpGoodsReceiptLine;
import com.huaweicloud.plm.system.mapper.ErpGoodsReceiptLineMapper;
import com.huaweicloud.plm.system.mapper.ErpGoodsReceiptMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.util.List;

/**
 * ERP 采购管理—采购到货单（G3-N3a ERP 采购管理）：
 * 采购到货单头与明细行的登记、分页查询、明细维护与删除。
 * 删除时先逻辑删除全部明细行，再物理删除到货单头以释放到货单号。
 */
@Service
@RequiredArgsConstructor
public class ErpGoodsReceiptService {

    private static final String DEFAULT_RECEIPT_NO_PREFIX = "GR";
    private static final String DEFAULT_RECEIPT_TYPE = "NORMAL";
    private static final String DEFAULT_RECEIPT_STATUS = "DRAFT";
    private static final Integer DEFAULT_INSPECTION_REQUIRED = 1;
    private static final String DEFAULT_UOM = "PCS";
    private static final String DEFAULT_INSPECTION_RESULT = "PENDING";

    private final ErpGoodsReceiptMapper mapper;
    private final ErpGoodsReceiptLineMapper lineMapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询采购到货单：状态/类型/订单编号/供应商编码精确，单号/供应商名称模糊，按主键倒序。 */
    public PageResult<ErpGoodsReceipt> page(ErpGoodsReceiptQuery query) {
        Page<ErpGoodsReceipt> page = query.toPage();
        mapper.selectPage(page, Wrappers.<ErpGoodsReceipt>lambdaQuery()
                .eq(StringUtils.hasText(query.getReceiptStatus()),
                        ErpGoodsReceipt::getReceiptStatus, query.getReceiptStatus())
                .eq(StringUtils.hasText(query.getReceiptType()),
                        ErpGoodsReceipt::getReceiptType, query.getReceiptType())
                .eq(StringUtils.hasText(query.getOrderNo()),
                        ErpGoodsReceipt::getOrderNo, query.getOrderNo())
                .eq(StringUtils.hasText(query.getSupplierCode()),
                        ErpGoodsReceipt::getSupplierCode, query.getSupplierCode())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(ErpGoodsReceipt::getReceiptNo, query.getKeyword()).or()
                        .like(ErpGoodsReceipt::getSupplierName, query.getKeyword()))
                .orderByDesc(ErpGoodsReceipt::getId));
        return PageResult.of(page);
    }

    /** 到货单详情：返回到货单头与全部明细行。 */
    public ErpGoodsReceiptDetailResponse detail(Long id) {
        ErpGoodsReceipt header = require(id);
        ErpGoodsReceiptDetailResponse response = new ErpGoodsReceiptDetailResponse();
        response.setHeader(header);
        response.setLines(listLines(id));
        return response;
    }

    /** 新增采购到货单：回填默认类型/是否报检/状态/总数量与组织，到货单号为空时自动生成。 */
    @Transactional(rollbackFor = Exception.class)
    public Long create(ErpGoodsReceiptSaveRequest request) {
        ErpGoodsReceipt header = new ErpGoodsReceipt();
        header.setReceiptNo(StringUtils.hasText(request.getReceiptNo())
                ? request.getReceiptNo() : flowSupport.nextBizNo(DEFAULT_RECEIPT_NO_PREFIX));
        header.setReceiptType(StringUtils.hasText(request.getReceiptType())
                ? request.getReceiptType() : DEFAULT_RECEIPT_TYPE);
        header.setInspectionRequired(request.getInspectionRequired() != null
                ? request.getInspectionRequired() : DEFAULT_INSPECTION_REQUIRED);
        header.setReceiptStatus(StringUtils.hasText(request.getReceiptStatus())
                ? request.getReceiptStatus() : DEFAULT_RECEIPT_STATUS);
        header.setTotalQty(request.getTotalQty() != null
                ? request.getTotalQty() : BigDecimal.ZERO);
        header.setOrgId(currentOrgId());
        applyHeader(header, request);
        mapper.insert(header);
        return header.getId();
    }

    /** 更新采购到货单头：仅在请求提供字段时覆盖。 */
    @Transactional(rollbackFor = Exception.class)
    public void update(Long id, ErpGoodsReceiptSaveRequest request) {
        ErpGoodsReceipt header = require(id);
        applyHeader(header, request);
        mapper.updateById(header);
    }

    /** 删除采购到货单：先逻辑删除全部明细行，再物理删除到货单头以释放到货单号。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        lineMapper.delete(Wrappers.<ErpGoodsReceiptLine>lambdaQuery().eq(ErpGoodsReceiptLine::getReceiptId, id));
        mapper.physicalDeleteById(id);
    }

    /** 新增到货单行：行号为空时取当前最大行号 +1，回填默认单位/数量/检验结果。 */
    @Transactional(rollbackFor = Exception.class)
    public Long addLine(Long headerId, ErpGoodsReceiptLineSaveRequest request) {
        ErpGoodsReceipt header = require(headerId);
        validateLine(request);
        Integer maxLineNo = lineMapper.selectMaxLineNo(headerId);

        ErpGoodsReceiptLine line = new ErpGoodsReceiptLine();
        line.setReceiptId(headerId);
        line.setReceiptNo(header.getReceiptNo());
        line.setLineNo(request.getLineNo() != null
                ? request.getLineNo()
                : (maxLineNo == null ? 1 : maxLineNo + 1));
        line.setUom(StringUtils.hasText(request.getUom())
                ? request.getUom() : DEFAULT_UOM);
        line.setReceiptQty(request.getReceiptQty() != null
                ? request.getReceiptQty() : BigDecimal.ZERO);
        line.setInspectionResult(StringUtils.hasText(request.getInspectionResult())
                ? request.getInspectionResult() : DEFAULT_INSPECTION_RESULT);
        applyLine(line, request);
        lineMapper.insert(line);
        return line.getId();
    }

    /** 更新到货单行：仅在请求提供字段时覆盖。 */
    @Transactional(rollbackFor = Exception.class)
    public void updateLine(Long lineId, ErpGoodsReceiptLineSaveRequest request) {
        ErpGoodsReceiptLine line = requireLine(lineId);
        validateLine(request);
        if (request.getLineNo() != null) {
            line.setLineNo(request.getLineNo());
        }
        applyLine(line, request);
        lineMapper.updateById(line);
    }

    /** 删除到货单行：逻辑删除。 */
    @Transactional(rollbackFor = Exception.class)
    public void deleteLine(Long lineId) {
        requireLine(lineId);
        lineMapper.deleteById(lineId);
    }

    public ErpGoodsReceipt require(Long id) {
        ErpGoodsReceipt header = mapper.selectById(id);
        if (header == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "采购到货单不存在: " + id);
        }
        return header;
    }

    private ErpGoodsReceiptLine requireLine(Long lineId) {
        ErpGoodsReceiptLine line = lineMapper.selectById(lineId);
        if (line == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "采购到货单行不存在: " + lineId);
        }
        return line;
    }

    private List<ErpGoodsReceiptLine> listLines(Long receiptId) {
        return lineMapper.selectList(Wrappers.<ErpGoodsReceiptLine>lambdaQuery()
                .eq(ErpGoodsReceiptLine::getReceiptId, receiptId)
                .orderByAsc(ErpGoodsReceiptLine::getLineNo));
    }

    private void validateLine(ErpGoodsReceiptLineSaveRequest request) {
        if (!StringUtils.hasText(request.getMaterialCode())) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "物料编码不能为空");
        }
    }

    /** 仅在请求提供值（字符串非空、数值/日期非空）时覆盖到货单头字段。 */
    private void applyHeader(ErpGoodsReceipt header, ErpGoodsReceiptSaveRequest request) {
        if (StringUtils.hasText(request.getReceiptNo())) {
            header.setReceiptNo(request.getReceiptNo());
        }
        if (StringUtils.hasText(request.getReceiptType())) {
            header.setReceiptType(request.getReceiptType());
        }
        if (StringUtils.hasText(request.getOrderNo())) {
            header.setOrderNo(request.getOrderNo());
        }
        if (StringUtils.hasText(request.getSupplierCode())) {
            header.setSupplierCode(request.getSupplierCode());
        }
        if (StringUtils.hasText(request.getSupplierName())) {
            header.setSupplierName(request.getSupplierName());
        }
        if (request.getReceiptDate() != null) {
            header.setReceiptDate(request.getReceiptDate());
        }
        if (StringUtils.hasText(request.getWarehouseCode())) {
            header.setWarehouseCode(request.getWarehouseCode());
        }
        if (request.getInspectionRequired() != null) {
            header.setInspectionRequired(request.getInspectionRequired());
        }
        if (StringUtils.hasText(request.getReceiver())) {
            header.setReceiver(request.getReceiver());
        }
        if (StringUtils.hasText(request.getReceiptStatus())) {
            header.setReceiptStatus(request.getReceiptStatus());
        }
        if (request.getTotalQty() != null) {
            header.setTotalQty(request.getTotalQty());
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

    /** 仅在请求提供值（字符串非空、数值非空）时覆盖到货单行字段。 */
    private void applyLine(ErpGoodsReceiptLine line, ErpGoodsReceiptLineSaveRequest request) {
        if (StringUtils.hasText(request.getOrderNo())) {
            line.setOrderNo(request.getOrderNo());
        }
        if (request.getOrderLineNo() != null) {
            line.setOrderLineNo(request.getOrderLineNo());
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
        if (request.getReceiptQty() != null) {
            line.setReceiptQty(request.getReceiptQty());
        }
        if (StringUtils.hasText(request.getBatchNo())) {
            line.setBatchNo(request.getBatchNo());
        }
        if (StringUtils.hasText(request.getWarehouseCode())) {
            line.setWarehouseCode(request.getWarehouseCode());
        }
        if (StringUtils.hasText(request.getInspectionResult())) {
            line.setInspectionResult(request.getInspectionResult());
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
