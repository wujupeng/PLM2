package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.ErpDemandPlanDetailResponse;
import com.huaweicloud.plm.system.dto.ErpDemandPlanLineSaveRequest;
import com.huaweicloud.plm.system.dto.ErpDemandPlanQuery;
import com.huaweicloud.plm.system.dto.ErpDemandPlanSaveRequest;
import com.huaweicloud.plm.system.entity.ErpDemandPlan;
import com.huaweicloud.plm.system.entity.ErpDemandPlanLine;
import com.huaweicloud.plm.system.mapper.ErpDemandPlanLineMapper;
import com.huaweicloud.plm.system.mapper.ErpDemandPlanMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.util.List;

/**
 * ERP 需求计划—需求计划单（对应 WBS T025 需求计划、T095 LRP/MRP需求计划，属 G3 ERP）：
 * 需求计划头与明细行的登记、分页查询、明细维护与删除。
 * 删除时先逻辑删除全部明细行，再物理删除需求计划头以释放需求计划单号。
 */
@Service
@RequiredArgsConstructor
public class ErpDemandPlanService {

    private static final String DEFAULT_PLAN_NO_PREFIX = "EDP";
    private static final String DEFAULT_PLAN_TYPE = "ORDER";
    private static final String DEFAULT_PLAN_SOURCE = "SALES";
    private static final String DEFAULT_CURRENCY_CODE = "CNY";
    private static final String DEFAULT_PLAN_STATUS = "DRAFT";
    private static final String DEFAULT_LINE_STATUS = "OPEN";
    private static final String DEFAULT_UOM = "PCS";
    private static final String DEFAULT_LINE_SOURCE_TYPE = "SALES";

    private final ErpDemandPlanMapper mapper;
    private final ErpDemandPlanLineMapper lineMapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询需求计划：状态/类型/来源/计划组织精确，单号/计划名称模糊，按主键倒序。 */
    public PageResult<ErpDemandPlan> page(ErpDemandPlanQuery query) {
        Page<ErpDemandPlan> page = query.toPage();
        mapper.selectPage(page, Wrappers.<ErpDemandPlan>lambdaQuery()
                .eq(StringUtils.hasText(query.getPlanStatus()),
                        ErpDemandPlan::getPlanStatus, query.getPlanStatus())
                .eq(StringUtils.hasText(query.getPlanType()),
                        ErpDemandPlan::getPlanType, query.getPlanType())
                .eq(StringUtils.hasText(query.getPlanSource()),
                        ErpDemandPlan::getPlanSource, query.getPlanSource())
                .eq(StringUtils.hasText(query.getPlanOrg()),
                        ErpDemandPlan::getPlanOrg, query.getPlanOrg())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(ErpDemandPlan::getPlanNo, query.getKeyword()).or()
                        .like(ErpDemandPlan::getPlanName, query.getKeyword()))
                .orderByDesc(ErpDemandPlan::getId));
        return PageResult.of(page);
    }

    /** 需求计划详情：返回需求计划头与全部明细行。 */
    public ErpDemandPlanDetailResponse detail(Long id) {
        ErpDemandPlan header = require(id);
        ErpDemandPlanDetailResponse response = new ErpDemandPlanDetailResponse();
        response.setHeader(header);
        response.setLines(listLines(id));
        return response;
    }

    /** 新增需求计划：回填默认类型/来源/币别/状态与组织，需求计划单号为空时自动生成。 */
    @Transactional(rollbackFor = Exception.class)
    public Long create(ErpDemandPlanSaveRequest request) {
        ErpDemandPlan header = new ErpDemandPlan();
        header.setPlanNo(StringUtils.hasText(request.getPlanNo())
                ? request.getPlanNo() : flowSupport.nextBizNo(DEFAULT_PLAN_NO_PREFIX));
        header.setPlanType(StringUtils.hasText(request.getPlanType())
                ? request.getPlanType() : DEFAULT_PLAN_TYPE);
        header.setPlanSource(StringUtils.hasText(request.getPlanSource())
                ? request.getPlanSource() : DEFAULT_PLAN_SOURCE);
        header.setCurrencyCode(StringUtils.hasText(request.getCurrencyCode())
                ? request.getCurrencyCode() : DEFAULT_CURRENCY_CODE);
        header.setPlanStatus(StringUtils.hasText(request.getPlanStatus())
                ? request.getPlanStatus() : DEFAULT_PLAN_STATUS);
        header.setOrgId(currentOrgId());
        applyHeader(header, request);
        mapper.insert(header);
        return header.getId();
    }

    /** 更新需求计划头：仅在请求提供字段时覆盖。 */
    @Transactional(rollbackFor = Exception.class)
    public void update(Long id, ErpDemandPlanSaveRequest request) {
        ErpDemandPlan header = require(id);
        applyHeader(header, request);
        mapper.updateById(header);
    }

    /** 删除需求计划：先逻辑删除全部明细行，再物理删除需求计划头以释放需求计划单号。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        lineMapper.delete(Wrappers.<ErpDemandPlanLine>lambdaQuery()
                .eq(ErpDemandPlanLine::getPlanId, id));
        mapper.physicalDeleteById(id);
    }

    /** 新增需求计划行：行号为空时取当前最大行号 +1，回填默认行状态/单位/数量/来源类型。 */
    @Transactional(rollbackFor = Exception.class)
    public Long addLine(Long headerId, ErpDemandPlanLineSaveRequest request) {
        ErpDemandPlan header = require(headerId);
        validateLine(request);
        Integer maxLineNo = lineMapper.selectMaxLineNo(headerId);

        ErpDemandPlanLine line = new ErpDemandPlanLine();
        line.setPlanId(headerId);
        line.setPlanNo(header.getPlanNo());
        line.setLineNo(request.getLineNo() != null
                ? request.getLineNo()
                : (maxLineNo == null ? 1 : maxLineNo + 1));
        line.setLineStatus(StringUtils.hasText(request.getLineStatus())
                ? request.getLineStatus() : DEFAULT_LINE_STATUS);
        line.setUom(StringUtils.hasText(request.getUom())
                ? request.getUom() : DEFAULT_UOM);
        line.setDemandQty(request.getDemandQty() != null
                ? request.getDemandQty() : BigDecimal.ZERO);
        line.setSourceType(StringUtils.hasText(request.getSourceType())
                ? request.getSourceType() : DEFAULT_LINE_SOURCE_TYPE);
        applyLine(line, request);
        lineMapper.insert(line);
        return line.getId();
    }

    /** 更新需求计划行：仅在请求提供字段时覆盖。 */
    @Transactional(rollbackFor = Exception.class)
    public void updateLine(Long lineId, ErpDemandPlanLineSaveRequest request) {
        ErpDemandPlanLine line = requireLine(lineId);
        validateLine(request);
        if (request.getLineNo() != null) {
            line.setLineNo(request.getLineNo());
        }
        applyLine(line, request);
        lineMapper.updateById(line);
    }

    /** 删除需求计划行：逻辑删除。 */
    @Transactional(rollbackFor = Exception.class)
    public void deleteLine(Long lineId) {
        requireLine(lineId);
        lineMapper.deleteById(lineId);
    }

    public ErpDemandPlan require(Long id) {
        ErpDemandPlan header = mapper.selectById(id);
        if (header == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "需求计划不存在: " + id);
        }
        return header;
    }

    private ErpDemandPlanLine requireLine(Long lineId) {
        ErpDemandPlanLine line = lineMapper.selectById(lineId);
        if (line == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "需求计划行不存在: " + lineId);
        }
        return line;
    }

    private List<ErpDemandPlanLine> listLines(Long planId) {
        return lineMapper.selectList(Wrappers.<ErpDemandPlanLine>lambdaQuery()
                .eq(ErpDemandPlanLine::getPlanId, planId)
                .orderByAsc(ErpDemandPlanLine::getLineNo));
    }

    private void validateLine(ErpDemandPlanLineSaveRequest request) {
        if (!StringUtils.hasText(request.getMaterialCode())) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "物料编码不能为空");
        }
    }

    /** 仅在请求提供值（字符串非空、数值/日期非空）时覆盖需求计划头字段。 */
    private void applyHeader(ErpDemandPlan header, ErpDemandPlanSaveRequest request) {
        if (StringUtils.hasText(request.getPlanNo())) {
            header.setPlanNo(request.getPlanNo());
        }
        if (StringUtils.hasText(request.getPlanName())) {
            header.setPlanName(request.getPlanName());
        }
        if (StringUtils.hasText(request.getPlanType())) {
            header.setPlanType(request.getPlanType());
        }
        if (StringUtils.hasText(request.getPlanSource())) {
            header.setPlanSource(request.getPlanSource());
        }
        if (StringUtils.hasText(request.getPlanOrg())) {
            header.setPlanOrg(request.getPlanOrg());
        }
        if (StringUtils.hasText(request.getPlanner())) {
            header.setPlanner(request.getPlanner());
        }
        if (request.getPlanDate() != null) {
            header.setPlanDate(request.getPlanDate());
        }
        if (request.getHorizonStart() != null) {
            header.setHorizonStart(request.getHorizonStart());
        }
        if (request.getHorizonEnd() != null) {
            header.setHorizonEnd(request.getHorizonEnd());
        }
        if (StringUtils.hasText(request.getCurrencyCode())) {
            header.setCurrencyCode(request.getCurrencyCode());
        }
        if (StringUtils.hasText(request.getPlanStatus())) {
            header.setPlanStatus(request.getPlanStatus());
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

    /** 仅在请求提供值（字符串非空、数值/日期非空）时覆盖需求计划行字段。 */
    private void applyLine(ErpDemandPlanLine line, ErpDemandPlanLineSaveRequest request) {
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
        if (request.getDemandQty() != null) {
            line.setDemandQty(request.getDemandQty());
        }
        if (StringUtils.hasText(request.getSourceType())) {
            line.setSourceType(request.getSourceType());
        }
        if (StringUtils.hasText(request.getSourceNo())) {
            line.setSourceNo(request.getSourceNo());
        }
        if (StringUtils.hasText(request.getCustomerCode())) {
            line.setCustomerCode(request.getCustomerCode());
        }
        if (request.getDemandDate() != null) {
            line.setDemandDate(request.getDemandDate());
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
