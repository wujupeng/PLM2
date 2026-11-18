package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.ErpOutsourceReceiptDetailResponse;
import com.huaweicloud.plm.system.dto.ErpOutsourceReceiptLineSaveRequest;
import com.huaweicloud.plm.system.dto.ErpOutsourceReceiptQuery;
import com.huaweicloud.plm.system.dto.ErpOutsourceReceiptSaveRequest;
import com.huaweicloud.plm.system.entity.ErpOutsourceReceipt;
import com.huaweicloud.plm.system.entity.ErpOutsourceReceiptLine;
import com.huaweicloud.plm.system.mapper.ErpOutsourceReceiptLineMapper;
import com.huaweicloud.plm.system.mapper.ErpOutsourceReceiptMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.util.List;

/**
 * ERP 委外管理—委外到货（对应 WBS T024 委外管理、T094 委外加工闭环，属 G3 ERP）：
 * 委外到货单头与明细行的登记、分页查询、明细维护与删除。
 * 删除时先逻辑删除全部明细行，再物理删除委外到货单头以释放委外到货单号。
 */
@Service
@RequiredArgsConstructor
public class ErpOutsourceReceiptService {

    private static final String DEFAULT_RECEIPT_NO_PREFIX = "OSR";
    private static final String DEFAULT_RECEIPT_TYPE = "NORMAL";
    private static final Integer DEFAULT_INSPECTION_REQUIRED = 1;
    private static final String DEFAULT_RECEIPT_STATUS = "DRAFT";
    private static final String DEFAULT_UOM = "PCS";
    private static final String DEFAULT_INSPECTION_RESULT = "PENDING";

    private final ErpOutsourceReceiptMapper mapper;
    private final ErpOutsourceReceiptLineMapper lineMapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询委外到货单：状态/类型/订单号/加工商精确，单号/加工商名称模糊，按主键倒序。 */
    public PageResult<ErpOutsourceReceipt> page(ErpOutsourceReceiptQuery query) {
        Page<ErpOutsourceReceipt> page = query.toPage();
        mapper.selectPage(page, Wrappers.<ErpOutsourceReceipt>lambdaQuery()
                .eq(StringUtils.hasText(query.getReceiptStatus()),
                        ErpOutsourceReceipt::getReceiptStatus, query.getReceiptStatus())
                .eq(StringUtils.hasText(query.getReceiptType()),
                        ErpOutsourceReceipt::getReceiptType, query.getReceiptType())
                .eq(StringUtils.hasText(query.getOrderNo()),
                        ErpOutsourceReceipt::getOrderNo, query.getOrderNo())
                .eq(StringUtils.hasText(query.getSupplierCode()),
                        ErpOutsourceReceipt::getSupplierCode, query.getSupplierCode())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(ErpOutsourceReceipt::getReceiptNo, query.getKeyword()).or()
                        .like(ErpOutsourceReceipt::getSupplierName, query.getKeyword()))
                .orderByDesc(ErpOutsourceReceipt::getId));
        return PageResult.of(page);
    }

    /** 委外到货单详情：返回委外到货单头与全部明细行。 */
    public ErpOutsourceReceiptDetailResponse detail(Long id) {
        ErpOutsourceReceipt header = require(id);
        ErpOutsourceReceiptDetailResponse response = new ErpOutsourceReceiptDetailResponse();
        response.setHeader(header);
        response.setLines(listLines(id));
        return response;
    }

    /** 新增委外到货单：回填默认类型/是否报检/状态/数量与组织，委外到货单号为空时自动生成。 */
    @Transactional(rollbackFor = Exception.class)
    public Long create(ErpOutsourceReceiptSaveRequest request) {
        ErpOutsourceReceipt header = new ErpOutsourceReceipt();
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

    /** 更新委外到货单头：仅在请求提供字段时覆盖。 */
    @Transactional(rollbackFor = Exception.class)
    public void update(Long id, ErpOutsourceReceiptSaveRequest request) {
        ErpOutsourceReceipt header = require(id);
        applyHeader(header, request);
        mapper.updateById(header);
    }

    /** 删除委外到货单：先逻辑删除全部明细行，再物理删除委外到货单头以释放委外到货单号。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        lineMapper.delete(Wrappers.<ErpOutsourceReceiptLine>lambdaQuery()
                .eq(ErpOutsourceReceiptLine::getReceiptId, id));
        mapper.physicalDeleteById(id);
    }

    /** 新增委外到货行：行号为空时取当前最大行号 +1，回填默认单位/检验结论/数量。 */
    @Transactional(rollbackFor = Exception.class)
    public Long addLine(Long headerId, ErpOutsourceReceiptLineSaveRequest request) {
        ErpOutsourceReceipt header = require(headerId);
        validateLine(request);
        Integer maxLineNo = lineMapper.selectMaxLineNo(headerId);

        ErpOutsourceReceiptLine line = new ErpOutsourceReceiptLine();
        line.setReceiptId(headerId);
        line.setReceiptNo(header.getReceiptNo());
        line.setLineNo(request.getLineNo() != null
                ? request.getLineNo()
                : (maxLineNo == null ? 1 : maxLineNo + 1));
        line.setUom(StringUtils.hasText(request.getUom())
                ? request.getUom() : DEFAULT_UOM);
        line.setInspectionResult(StringUtils.hasText(request.getInspectionResult())
                ? request.getInspectionResult() : DEFAULT_INSPECTION_RESULT);
        line.setReceiptQty(request.getReceiptQty() != null
                ? request.getReceiptQty() : BigDecimal.ZERO);
        applyLine(line, request);
        lineMapper.insert(line);
        return line.getId();
    }

    /** 更新委外到货行：仅在请求提供字段时覆盖。 */
    @Transactional(rollbackFor = Exception.class)
    public void updateLine(Long lineId, ErpOutsourceReceiptLineSaveRequest request) {
        ErpOutsourceReceiptLine line = requireLine(lineId);
        validateLine(request);
        if (request.getLineNo() != null) {
            line.setLineNo(request.getLineNo());
        }
        applyLine(line, request);
        lineMapper.updateById(line);
    }

    /** 删除委外到货行：逻辑删除。 */
    @Transactional(rollbackFor = Exception.class)
    public void deleteLine(Long lineId) {
        requireLine(lineId);
        lineMapper.deleteById(lineId);
    }

    public ErpOutsourceReceipt require(Long id) {
        ErpOutsourceReceipt header = mapper.selectById(id);
        if (header == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "委外到货单不存在: " + id);
        }
        return header;
    }

    private ErpOutsourceReceiptLine requireLine(Long lineId) {
        ErpOutsourceReceiptLine line = lineMapper.selectById(lineId);
        if (line == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "委外到货单行不存在: " + lineId);
        }
        return line;
    }

    private List<ErpOutsourceReceiptLine> listLines(Long receiptId) {
        return lineMapper.selectList(Wrappers.<ErpOutsourceReceiptLine>lambdaQuery()
                .eq(ErpOutsourceReceiptLine::getReceiptId, receiptId)
                .orderByAsc(ErpOutsourceReceiptLine::getLineNo));
    }

    private void validateLine(ErpOutsourceReceiptLineSaveRequest request) {
        if (!StringUtils.hasText(request.getMaterialCode())) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "物料编码不能为空");
        }
    }

    /** 仅在请求提供值（字符串非空、数值/日期非空）时覆盖委外到货单头字段。 */
    private void applyHeader(ErpOutsourceReceipt header, ErpOutsourceReceiptSaveRequest request) {
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

    /** 仅在请求提供值（字符串非空、数值/日期非空）时覆盖委外到货行字段。 */
    private void applyLine(ErpOutsourceReceiptLine line, ErpOutsourceReceiptLineSaveRequest request) {
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
