package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.ErpPurchaseRequisitionDetailResponse;
import com.huaweicloud.plm.system.dto.ErpPurchaseRequisitionLineSaveRequest;
import com.huaweicloud.plm.system.dto.ErpPurchaseRequisitionQuery;
import com.huaweicloud.plm.system.dto.ErpPurchaseRequisitionSaveRequest;
import com.huaweicloud.plm.system.entity.ErpPurchaseRequisition;
import com.huaweicloud.plm.system.entity.ErpPurchaseRequisitionLine;
import com.huaweicloud.plm.system.mapper.ErpPurchaseRequisitionLineMapper;
import com.huaweicloud.plm.system.mapper.ErpPurchaseRequisitionMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.util.List;

/**
 * ERP 采购管理—请购单（对应 WBS T023 采购管理、T093 采购到货入库，属 G3 ERP）：
 * 请购单头与明细行的登记、分页查询、明细维护与删除。
 * 删除时先逻辑删除全部明细行，再物理删除请购单头以释放请购单号。
 */
@Service
@RequiredArgsConstructor
public class ErpPurchaseRequisitionService {

    private static final String DEFAULT_REQUISITION_NO_PREFIX = "PR";
    private static final String DEFAULT_REQUISITION_TYPE = "NORMAL";
    private static final String DEFAULT_CURRENCY_CODE = "CNY";
    private static final String DEFAULT_SOURCE_TYPE = "MANUAL";
    private static final String DEFAULT_REQUISITION_STATUS = "DRAFT";
    private static final String DEFAULT_LINE_STATUS = "OPEN";
    private static final String DEFAULT_UOM = "PCS";

    private final ErpPurchaseRequisitionMapper mapper;
    private final ErpPurchaseRequisitionLineMapper lineMapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询请购单：状态/类型/请购人精确，单号/请购组织模糊，按主键倒序。 */
    public PageResult<ErpPurchaseRequisition> page(ErpPurchaseRequisitionQuery query) {
        Page<ErpPurchaseRequisition> page = query.toPage();
        mapper.selectPage(page, Wrappers.<ErpPurchaseRequisition>lambdaQuery()
                .eq(StringUtils.hasText(query.getRequisitionStatus()),
                        ErpPurchaseRequisition::getRequisitionStatus, query.getRequisitionStatus())
                .eq(StringUtils.hasText(query.getRequisitionType()),
                        ErpPurchaseRequisition::getRequisitionType, query.getRequisitionType())
                .eq(StringUtils.hasText(query.getApplicant()),
                        ErpPurchaseRequisition::getApplicant, query.getApplicant())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(ErpPurchaseRequisition::getRequisitionNo, query.getKeyword()).or()
                        .like(ErpPurchaseRequisition::getReqOrg, query.getKeyword()))
                .orderByDesc(ErpPurchaseRequisition::getId));
        return PageResult.of(page);
    }

    /** 请购单详情：返回请购单头与全部明细行。 */
    public ErpPurchaseRequisitionDetailResponse detail(Long id) {
        ErpPurchaseRequisition header = require(id);
        ErpPurchaseRequisitionDetailResponse response = new ErpPurchaseRequisitionDetailResponse();
        response.setHeader(header);
        response.setLines(listLines(id));
        return response;
    }

    /** 新增请购单：回填默认类型/币别/来源/状态与组织，请购单号为空时自动生成。 */
    @Transactional(rollbackFor = Exception.class)
    public Long create(ErpPurchaseRequisitionSaveRequest request) {
        ErpPurchaseRequisition header = new ErpPurchaseRequisition();
        header.setRequisitionNo(StringUtils.hasText(request.getRequisitionNo())
                ? request.getRequisitionNo() : flowSupport.nextBizNo(DEFAULT_REQUISITION_NO_PREFIX));
        header.setRequisitionType(StringUtils.hasText(request.getRequisitionType())
                ? request.getRequisitionType() : DEFAULT_REQUISITION_TYPE);
        header.setCurrencyCode(StringUtils.hasText(request.getCurrencyCode())
                ? request.getCurrencyCode() : DEFAULT_CURRENCY_CODE);
        header.setSourceType(StringUtils.hasText(request.getSourceType())
                ? request.getSourceType() : DEFAULT_SOURCE_TYPE);
        header.setRequisitionStatus(StringUtils.hasText(request.getRequisitionStatus())
                ? request.getRequisitionStatus() : DEFAULT_REQUISITION_STATUS);
        header.setOrgId(currentOrgId());
        applyHeader(header, request);
        mapper.insert(header);
        return header.getId();
    }

    /** 更新请购单头：仅在请求提供字段时覆盖。 */
    @Transactional(rollbackFor = Exception.class)
    public void update(Long id, ErpPurchaseRequisitionSaveRequest request) {
        ErpPurchaseRequisition header = require(id);
        applyHeader(header, request);
        mapper.updateById(header);
    }

    /** 删除请购单：先逻辑删除全部明细行，再物理删除请购单头以释放请购单号。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        lineMapper.delete(Wrappers.<ErpPurchaseRequisitionLine>lambdaQuery()
                .eq(ErpPurchaseRequisitionLine::getRequisitionId, id));
        mapper.physicalDeleteById(id);
    }

    /** 新增请购行：行号为空时取当前最大行号 +1，回填默认行状态/单位/数量。 */
    @Transactional(rollbackFor = Exception.class)
    public Long addLine(Long headerId, ErpPurchaseRequisitionLineSaveRequest request) {
        ErpPurchaseRequisition header = require(headerId);
        validateLine(request);
        Integer maxLineNo = lineMapper.selectMaxLineNo(headerId);

        ErpPurchaseRequisitionLine line = new ErpPurchaseRequisitionLine();
        line.setRequisitionId(headerId);
        line.setRequisitionNo(header.getRequisitionNo());
        line.setLineNo(request.getLineNo() != null
                ? request.getLineNo()
                : (maxLineNo == null ? 1 : maxLineNo + 1));
        line.setLineStatus(StringUtils.hasText(request.getLineStatus())
                ? request.getLineStatus() : DEFAULT_LINE_STATUS);
        line.setUom(StringUtils.hasText(request.getUom())
                ? request.getUom() : DEFAULT_UOM);
        line.setReqQty(request.getReqQty() != null
                ? request.getReqQty() : BigDecimal.ZERO);
        line.setOrderedQty(request.getOrderedQty() != null
                ? request.getOrderedQty() : BigDecimal.ZERO);
        line.setRemainingQty(request.getRemainingQty() != null
                ? request.getRemainingQty() : BigDecimal.ZERO);
        applyLine(line, request);
        lineMapper.insert(line);
        return line.getId();
    }

    /** 更新请购行：仅在请求提供字段时覆盖。 */
    @Transactional(rollbackFor = Exception.class)
    public void updateLine(Long lineId, ErpPurchaseRequisitionLineSaveRequest request) {
        ErpPurchaseRequisitionLine line = requireLine(lineId);
        validateLine(request);
        if (request.getLineNo() != null) {
            line.setLineNo(request.getLineNo());
        }
        applyLine(line, request);
        lineMapper.updateById(line);
    }

    /** 删除请购行：逻辑删除。 */
    @Transactional(rollbackFor = Exception.class)
    public void deleteLine(Long lineId) {
        requireLine(lineId);
        lineMapper.deleteById(lineId);
    }

    public ErpPurchaseRequisition require(Long id) {
        ErpPurchaseRequisition header = mapper.selectById(id);
        if (header == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "请购单不存在: " + id);
        }
        return header;
    }

    private ErpPurchaseRequisitionLine requireLine(Long lineId) {
        ErpPurchaseRequisitionLine line = lineMapper.selectById(lineId);
        if (line == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "请购单行不存在: " + lineId);
        }
        return line;
    }

    private List<ErpPurchaseRequisitionLine> listLines(Long requisitionId) {
        return lineMapper.selectList(Wrappers.<ErpPurchaseRequisitionLine>lambdaQuery()
                .eq(ErpPurchaseRequisitionLine::getRequisitionId, requisitionId)
                .orderByAsc(ErpPurchaseRequisitionLine::getLineNo));
    }

    private void validateLine(ErpPurchaseRequisitionLineSaveRequest request) {
        if (!StringUtils.hasText(request.getMaterialCode())) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "物料编码不能为空");
        }
    }

    /** 仅在请求提供值（字符串非空、数值/日期非空）时覆盖请购单头字段。 */
    private void applyHeader(ErpPurchaseRequisition header, ErpPurchaseRequisitionSaveRequest request) {
        if (StringUtils.hasText(request.getRequisitionNo())) {
            header.setRequisitionNo(request.getRequisitionNo());
        }
        if (StringUtils.hasText(request.getRequisitionType())) {
            header.setRequisitionType(request.getRequisitionType());
        }
        if (StringUtils.hasText(request.getReqOrg())) {
            header.setReqOrg(request.getReqOrg());
        }
        if (StringUtils.hasText(request.getApplicant())) {
            header.setApplicant(request.getApplicant());
        }
        if (request.getApplyDate() != null) {
            header.setApplyDate(request.getApplyDate());
        }
        if (request.getRequiredDate() != null) {
            header.setRequiredDate(request.getRequiredDate());
        }
        if (StringUtils.hasText(request.getCurrencyCode())) {
            header.setCurrencyCode(request.getCurrencyCode());
        }
        if (StringUtils.hasText(request.getSourceType())) {
            header.setSourceType(request.getSourceType());
        }
        if (StringUtils.hasText(request.getRequisitionStatus())) {
            header.setRequisitionStatus(request.getRequisitionStatus());
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

    /** 仅在请求提供值（字符串非空、数值/日期非空）时覆盖请购行字段。 */
    private void applyLine(ErpPurchaseRequisitionLine line, ErpPurchaseRequisitionLineSaveRequest request) {
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
        if (request.getReqQty() != null) {
            line.setReqQty(request.getReqQty());
        }
        if (request.getOrderedQty() != null) {
            line.setOrderedQty(request.getOrderedQty());
        }
        if (request.getRemainingQty() != null) {
            line.setRemainingQty(request.getRemainingQty());
        }
        if (request.getReqDate() != null) {
            line.setReqDate(request.getReqDate());
        }
        if (StringUtils.hasText(request.getSuggestedSupplier())) {
            line.setSuggestedSupplier(request.getSuggestedSupplier());
        }
        if (StringUtils.hasText(request.getWarehouseCode())) {
            line.setWarehouseCode(request.getWarehouseCode());
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
