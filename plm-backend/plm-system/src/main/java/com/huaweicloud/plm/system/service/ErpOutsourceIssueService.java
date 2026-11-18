package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.ErpOutsourceIssueDetailResponse;
import com.huaweicloud.plm.system.dto.ErpOutsourceIssueLineSaveRequest;
import com.huaweicloud.plm.system.dto.ErpOutsourceIssueQuery;
import com.huaweicloud.plm.system.dto.ErpOutsourceIssueSaveRequest;
import com.huaweicloud.plm.system.entity.ErpOutsourceIssue;
import com.huaweicloud.plm.system.entity.ErpOutsourceIssueLine;
import com.huaweicloud.plm.system.mapper.ErpOutsourceIssueLineMapper;
import com.huaweicloud.plm.system.mapper.ErpOutsourceIssueMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.util.List;

/**
 * ERP 委外管理—委外发料（对应 WBS T024 委外管理、T094 委外加工闭环，属 G3 ERP）：
 * 委外发料单头与明细行的登记、分页查询、明细维护与删除。
 * 删除时先逻辑删除全部明细行，再物理删除委外发料单头以释放委外发料单号。
 */
@Service
@RequiredArgsConstructor
public class ErpOutsourceIssueService {

    private static final String DEFAULT_ISSUE_NO_PREFIX = "OSI";
    private static final String DEFAULT_ISSUE_STATUS = "DRAFT";
    private static final String DEFAULT_UOM = "PCS";

    private final ErpOutsourceIssueMapper mapper;
    private final ErpOutsourceIssueLineMapper lineMapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询委外发料单：状态/订单号/加工商精确，单号/加工商名称模糊，按主键倒序。 */
    public PageResult<ErpOutsourceIssue> page(ErpOutsourceIssueQuery query) {
        Page<ErpOutsourceIssue> page = query.toPage();
        mapper.selectPage(page, Wrappers.<ErpOutsourceIssue>lambdaQuery()
                .eq(StringUtils.hasText(query.getIssueStatus()),
                        ErpOutsourceIssue::getIssueStatus, query.getIssueStatus())
                .eq(StringUtils.hasText(query.getOrderNo()),
                        ErpOutsourceIssue::getOrderNo, query.getOrderNo())
                .eq(StringUtils.hasText(query.getSupplierCode()),
                        ErpOutsourceIssue::getSupplierCode, query.getSupplierCode())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(ErpOutsourceIssue::getIssueNo, query.getKeyword()).or()
                        .like(ErpOutsourceIssue::getSupplierName, query.getKeyword()))
                .orderByDesc(ErpOutsourceIssue::getId));
        return PageResult.of(page);
    }

    /** 委外发料单详情：返回委外发料单头与全部明细行。 */
    public ErpOutsourceIssueDetailResponse detail(Long id) {
        ErpOutsourceIssue header = require(id);
        ErpOutsourceIssueDetailResponse response = new ErpOutsourceIssueDetailResponse();
        response.setHeader(header);
        response.setLines(listLines(id));
        return response;
    }

    /** 新增委外发料单：回填默认状态/数量与组织，委外发料单号为空时自动生成。 */
    @Transactional(rollbackFor = Exception.class)
    public Long create(ErpOutsourceIssueSaveRequest request) {
        ErpOutsourceIssue header = new ErpOutsourceIssue();
        header.setIssueNo(StringUtils.hasText(request.getIssueNo())
                ? request.getIssueNo() : flowSupport.nextBizNo(DEFAULT_ISSUE_NO_PREFIX));
        header.setIssueStatus(StringUtils.hasText(request.getIssueStatus())
                ? request.getIssueStatus() : DEFAULT_ISSUE_STATUS);
        header.setTotalQty(request.getTotalQty() != null
                ? request.getTotalQty() : BigDecimal.ZERO);
        header.setOrgId(currentOrgId());
        applyHeader(header, request);
        mapper.insert(header);
        return header.getId();
    }

    /** 更新委外发料单头：仅在请求提供字段时覆盖。 */
    @Transactional(rollbackFor = Exception.class)
    public void update(Long id, ErpOutsourceIssueSaveRequest request) {
        ErpOutsourceIssue header = require(id);
        applyHeader(header, request);
        mapper.updateById(header);
    }

    /** 删除委外发料单：先逻辑删除全部明细行，再物理删除委外发料单头以释放委外发料单号。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        lineMapper.delete(Wrappers.<ErpOutsourceIssueLine>lambdaQuery()
                .eq(ErpOutsourceIssueLine::getIssueId, id));
        mapper.physicalDeleteById(id);
    }

    /** 新增委外发料行：行号为空时取当前最大行号 +1，回填默认单位/数量。 */
    @Transactional(rollbackFor = Exception.class)
    public Long addLine(Long headerId, ErpOutsourceIssueLineSaveRequest request) {
        ErpOutsourceIssue header = require(headerId);
        validateLine(request);
        Integer maxLineNo = lineMapper.selectMaxLineNo(headerId);

        ErpOutsourceIssueLine line = new ErpOutsourceIssueLine();
        line.setIssueId(headerId);
        line.setIssueNo(header.getIssueNo());
        line.setLineNo(request.getLineNo() != null
                ? request.getLineNo()
                : (maxLineNo == null ? 1 : maxLineNo + 1));
        line.setUom(StringUtils.hasText(request.getUom())
                ? request.getUom() : DEFAULT_UOM);
        line.setIssueQty(request.getIssueQty() != null
                ? request.getIssueQty() : BigDecimal.ZERO);
        applyLine(line, request);
        lineMapper.insert(line);
        return line.getId();
    }

    /** 更新委外发料行：仅在请求提供字段时覆盖。 */
    @Transactional(rollbackFor = Exception.class)
    public void updateLine(Long lineId, ErpOutsourceIssueLineSaveRequest request) {
        ErpOutsourceIssueLine line = requireLine(lineId);
        validateLine(request);
        if (request.getLineNo() != null) {
            line.setLineNo(request.getLineNo());
        }
        applyLine(line, request);
        lineMapper.updateById(line);
    }

    /** 删除委外发料行：逻辑删除。 */
    @Transactional(rollbackFor = Exception.class)
    public void deleteLine(Long lineId) {
        requireLine(lineId);
        lineMapper.deleteById(lineId);
    }

    public ErpOutsourceIssue require(Long id) {
        ErpOutsourceIssue header = mapper.selectById(id);
        if (header == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "委外发料单不存在: " + id);
        }
        return header;
    }

    private ErpOutsourceIssueLine requireLine(Long lineId) {
        ErpOutsourceIssueLine line = lineMapper.selectById(lineId);
        if (line == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "委外发料单行不存在: " + lineId);
        }
        return line;
    }

    private List<ErpOutsourceIssueLine> listLines(Long issueId) {
        return lineMapper.selectList(Wrappers.<ErpOutsourceIssueLine>lambdaQuery()
                .eq(ErpOutsourceIssueLine::getIssueId, issueId)
                .orderByAsc(ErpOutsourceIssueLine::getLineNo));
    }

    private void validateLine(ErpOutsourceIssueLineSaveRequest request) {
        if (!StringUtils.hasText(request.getMaterialCode())) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "物料编码不能为空");
        }
    }

    /** 仅在请求提供值（字符串非空、数值/日期非空）时覆盖委外发料单头字段。 */
    private void applyHeader(ErpOutsourceIssue header, ErpOutsourceIssueSaveRequest request) {
        if (StringUtils.hasText(request.getIssueNo())) {
            header.setIssueNo(request.getIssueNo());
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
        if (request.getIssueDate() != null) {
            header.setIssueDate(request.getIssueDate());
        }
        if (StringUtils.hasText(request.getWarehouseCode())) {
            header.setWarehouseCode(request.getWarehouseCode());
        }
        if (StringUtils.hasText(request.getIssuer())) {
            header.setIssuer(request.getIssuer());
        }
        if (StringUtils.hasText(request.getIssueStatus())) {
            header.setIssueStatus(request.getIssueStatus());
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

    /** 仅在请求提供值（字符串非空、数值/日期非空）时覆盖委外发料行字段。 */
    private void applyLine(ErpOutsourceIssueLine line, ErpOutsourceIssueLineSaveRequest request) {
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
        if (request.getIssueQty() != null) {
            line.setIssueQty(request.getIssueQty());
        }
        if (StringUtils.hasText(request.getBatchNo())) {
            line.setBatchNo(request.getBatchNo());
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
