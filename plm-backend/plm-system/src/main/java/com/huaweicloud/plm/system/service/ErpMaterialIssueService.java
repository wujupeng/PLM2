package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.ErpMaterialIssueDetailResponse;
import com.huaweicloud.plm.system.dto.ErpMaterialIssueLineSaveRequest;
import com.huaweicloud.plm.system.dto.ErpMaterialIssueQuery;
import com.huaweicloud.plm.system.dto.ErpMaterialIssueSaveRequest;
import com.huaweicloud.plm.system.entity.ErpMaterialIssue;
import com.huaweicloud.plm.system.entity.ErpMaterialIssueLine;
import com.huaweicloud.plm.system.mapper.ErpMaterialIssueLineMapper;
import com.huaweicloud.plm.system.mapper.ErpMaterialIssueMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.util.List;

/**
 * ERP 生产管理—材料领用单（对应 WBS T026 生产管理、T096 生产订单与补料，属 G3 ERP）：
 * 材料领用单头与明细行的登记、分页查询、明细维护与删除。
 * 删除时先逻辑删除全部明细行，再物理删除领料单头以释放领料单号。
 */
@Service
@RequiredArgsConstructor
public class ErpMaterialIssueService {

    private static final String DEFAULT_ISSUE_NO_PREFIX = "EMI";
    private static final String DEFAULT_ISSUE_STATUS = "DRAFT";
    private static final String DEFAULT_LINE_STATUS = "OPEN";
    private static final String DEFAULT_UOM = "PCS";

    private final ErpMaterialIssueMapper mapper;
    private final ErpMaterialIssueLineMapper lineMapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询材料领用单：状态/生产订单号精确，领料单号/车间模糊，按主键倒序。 */
    public PageResult<ErpMaterialIssue> page(ErpMaterialIssueQuery query) {
        Page<ErpMaterialIssue> page = query.toPage();
        mapper.selectPage(page, Wrappers.<ErpMaterialIssue>lambdaQuery()
                .eq(StringUtils.hasText(query.getIssueStatus()),
                        ErpMaterialIssue::getIssueStatus, query.getIssueStatus())
                .eq(StringUtils.hasText(query.getOrderNo()),
                        ErpMaterialIssue::getOrderNo, query.getOrderNo())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(ErpMaterialIssue::getIssueNo, query.getKeyword()).or()
                        .like(ErpMaterialIssue::getWorkshop, query.getKeyword()))
                .orderByDesc(ErpMaterialIssue::getId));
        return PageResult.of(page);
    }

    /** 材料领用单详情：返回材料领用单头与全部明细行。 */
    public ErpMaterialIssueDetailResponse detail(Long id) {
        ErpMaterialIssue header = require(id);
        ErpMaterialIssueDetailResponse response = new ErpMaterialIssueDetailResponse();
        response.setHeader(header);
        response.setLines(listLines(id));
        return response;
    }

    /** 新增材料领用单：回填默认状态/数量与组织，领料单号为空时自动生成。 */
    @Transactional(rollbackFor = Exception.class)
    public Long create(ErpMaterialIssueSaveRequest request) {
        ErpMaterialIssue header = new ErpMaterialIssue();
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

    /** 更新材料领用单头：仅在请求提供字段时覆盖。 */
    @Transactional(rollbackFor = Exception.class)
    public void update(Long id, ErpMaterialIssueSaveRequest request) {
        ErpMaterialIssue header = require(id);
        applyHeader(header, request);
        mapper.updateById(header);
    }

    /** 删除材料领用单：先逻辑删除全部明细行，再物理删除领料单头以释放领料单号。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        lineMapper.delete(Wrappers.<ErpMaterialIssueLine>lambdaQuery()
                .eq(ErpMaterialIssueLine::getIssueId, id));
        mapper.physicalDeleteById(id);
    }

    /** 新增材料领用单行：行号为空时取当前最大行号 +1，回填默认行状态/单位/数量。 */
    @Transactional(rollbackFor = Exception.class)
    public Long addLine(Long headerId, ErpMaterialIssueLineSaveRequest request) {
        ErpMaterialIssue header = require(headerId);
        validateLine(request);
        Integer maxLineNo = lineMapper.selectMaxLineNo(headerId);

        ErpMaterialIssueLine line = new ErpMaterialIssueLine();
        line.setIssueId(headerId);
        line.setIssueNo(header.getIssueNo());
        line.setLineNo(request.getLineNo() != null
                ? request.getLineNo()
                : (maxLineNo == null ? 1 : maxLineNo + 1));
        line.setLineStatus(StringUtils.hasText(request.getLineStatus())
                ? request.getLineStatus() : DEFAULT_LINE_STATUS);
        line.setUom(StringUtils.hasText(request.getUom())
                ? request.getUom() : DEFAULT_UOM);
        line.setIssueQty(request.getIssueQty() != null
                ? request.getIssueQty() : BigDecimal.ZERO);
        applyLine(line, request);
        lineMapper.insert(line);
        return line.getId();
    }

    /** 更新材料领用单行：仅在请求提供字段时覆盖。 */
    @Transactional(rollbackFor = Exception.class)
    public void updateLine(Long lineId, ErpMaterialIssueLineSaveRequest request) {
        ErpMaterialIssueLine line = requireLine(lineId);
        validateLine(request);
        if (request.getLineNo() != null) {
            line.setLineNo(request.getLineNo());
        }
        applyLine(line, request);
        lineMapper.updateById(line);
    }

    /** 删除材料领用单行：逻辑删除。 */
    @Transactional(rollbackFor = Exception.class)
    public void deleteLine(Long lineId) {
        requireLine(lineId);
        lineMapper.deleteById(lineId);
    }

    public ErpMaterialIssue require(Long id) {
        ErpMaterialIssue header = mapper.selectById(id);
        if (header == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "材料领用单不存在: " + id);
        }
        return header;
    }

    private ErpMaterialIssueLine requireLine(Long lineId) {
        ErpMaterialIssueLine line = lineMapper.selectById(lineId);
        if (line == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "材料领用单行不存在: " + lineId);
        }
        return line;
    }

    private List<ErpMaterialIssueLine> listLines(Long issueId) {
        return lineMapper.selectList(Wrappers.<ErpMaterialIssueLine>lambdaQuery()
                .eq(ErpMaterialIssueLine::getIssueId, issueId)
                .orderByAsc(ErpMaterialIssueLine::getLineNo));
    }

    private void validateLine(ErpMaterialIssueLineSaveRequest request) {
        if (!StringUtils.hasText(request.getMaterialCode())) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "物料编码不能为空");
        }
    }

    /** 仅在请求提供值（字符串非空、数值/日期非空）时覆盖材料领用单头字段。 */
    private void applyHeader(ErpMaterialIssue header, ErpMaterialIssueSaveRequest request) {
        if (StringUtils.hasText(request.getIssueNo())) {
            header.setIssueNo(request.getIssueNo());
        }
        if (StringUtils.hasText(request.getOrderNo())) {
            header.setOrderNo(request.getOrderNo());
        }
        if (StringUtils.hasText(request.getWorkshop())) {
            header.setWorkshop(request.getWorkshop());
        }
        if (StringUtils.hasText(request.getIssueBy())) {
            header.setIssueBy(request.getIssueBy());
        }
        if (request.getIssueDate() != null) {
            header.setIssueDate(request.getIssueDate());
        }
        if (request.getTotalQty() != null) {
            header.setTotalQty(request.getTotalQty());
        }
        if (StringUtils.hasText(request.getIssueStatus())) {
            header.setIssueStatus(request.getIssueStatus());
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

    /** 仅在请求提供值（字符串非空、数值/日期非空）时覆盖材料领用单行字段。 */
    private void applyLine(ErpMaterialIssueLine line, ErpMaterialIssueLineSaveRequest request) {
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
        if (request.getIssueQty() != null) {
            line.setIssueQty(request.getIssueQty());
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
