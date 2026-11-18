package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.ErpProductionOrderDetailResponse;
import com.huaweicloud.plm.system.dto.ErpProductionOrderLineSaveRequest;
import com.huaweicloud.plm.system.dto.ErpProductionOrderQuery;
import com.huaweicloud.plm.system.dto.ErpProductionOrderSaveRequest;
import com.huaweicloud.plm.system.entity.ErpProductionOrder;
import com.huaweicloud.plm.system.entity.ErpProductionOrderLine;
import com.huaweicloud.plm.system.mapper.ErpProductionOrderLineMapper;
import com.huaweicloud.plm.system.mapper.ErpProductionOrderMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.util.List;

/**
 * ERP 生产管理—生产订单（对应 WBS T026 生产管理、T096 生产订单与补料，属 G3 ERP）：
 * 生产订单头与明细行的登记、分页查询、明细维护与删除。
 * 删除时先逻辑删除全部明细行，再物理删除生产订单头以释放生产订单号。
 */
@Service
@RequiredArgsConstructor
public class ErpProductionOrderService {

    private static final String DEFAULT_ORDER_NO_PREFIX = "EPO";
    private static final String DEFAULT_ORDER_TYPE = "STANDARD";
    private static final String DEFAULT_UOM = "PCS";
    private static final String DEFAULT_ORDER_STATUS = "DRAFT";
    private static final String DEFAULT_LINE_STATUS = "OPEN";
    private static final String DEFAULT_SOURCE_TYPE = "MANUAL";

    private final ErpProductionOrderMapper mapper;
    private final ErpProductionOrderLineMapper lineMapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询生产订单：状态/类型/生产物料编码/需求计划号精确，单号/物料名称模糊，按主键倒序。 */
    public PageResult<ErpProductionOrder> page(ErpProductionOrderQuery query) {
        Page<ErpProductionOrder> page = query.toPage();
        mapper.selectPage(page, Wrappers.<ErpProductionOrder>lambdaQuery()
                .eq(StringUtils.hasText(query.getOrderStatus()),
                        ErpProductionOrder::getOrderStatus, query.getOrderStatus())
                .eq(StringUtils.hasText(query.getOrderType()),
                        ErpProductionOrder::getOrderType, query.getOrderType())
                .eq(StringUtils.hasText(query.getMaterialCode()),
                        ErpProductionOrder::getMaterialCode, query.getMaterialCode())
                .eq(StringUtils.hasText(query.getPlanNo()),
                        ErpProductionOrder::getPlanNo, query.getPlanNo())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(ErpProductionOrder::getOrderNo, query.getKeyword()).or()
                        .like(ErpProductionOrder::getMaterialName, query.getKeyword()))
                .orderByDesc(ErpProductionOrder::getId));
        return PageResult.of(page);
    }

    /** 生产订单详情：返回生产订单头与全部明细行。 */
    public ErpProductionOrderDetailResponse detail(Long id) {
        ErpProductionOrder header = require(id);
        ErpProductionOrderDetailResponse response = new ErpProductionOrderDetailResponse();
        response.setHeader(header);
        response.setLines(listLines(id));
        return response;
    }

    /** 新增生产订单：回填默认类型/单位/数量/状态/来源类型与组织，生产订单号为空时自动生成。 */
    @Transactional(rollbackFor = Exception.class)
    public Long create(ErpProductionOrderSaveRequest request) {
        ErpProductionOrder header = new ErpProductionOrder();
        header.setOrderNo(StringUtils.hasText(request.getOrderNo())
                ? request.getOrderNo() : flowSupport.nextBizNo(DEFAULT_ORDER_NO_PREFIX));
        header.setOrderType(StringUtils.hasText(request.getOrderType())
                ? request.getOrderType() : DEFAULT_ORDER_TYPE);
        header.setUom(StringUtils.hasText(request.getUom())
                ? request.getUom() : DEFAULT_UOM);
        header.setPlanQty(request.getPlanQty() != null
                ? request.getPlanQty() : BigDecimal.ZERO);
        header.setCompletedQty(request.getCompletedQty() != null
                ? request.getCompletedQty() : BigDecimal.ZERO);
        header.setScrapQty(request.getScrapQty() != null
                ? request.getScrapQty() : BigDecimal.ZERO);
        header.setOrderStatus(StringUtils.hasText(request.getOrderStatus())
                ? request.getOrderStatus() : DEFAULT_ORDER_STATUS);
        header.setSourceType(StringUtils.hasText(request.getSourceType())
                ? request.getSourceType() : DEFAULT_SOURCE_TYPE);
        header.setOrgId(currentOrgId());
        applyHeader(header, request);
        mapper.insert(header);
        return header.getId();
    }

    /** 更新生产订单头：仅在请求提供字段时覆盖。 */
    @Transactional(rollbackFor = Exception.class)
    public void update(Long id, ErpProductionOrderSaveRequest request) {
        ErpProductionOrder header = require(id);
        applyHeader(header, request);
        mapper.updateById(header);
    }

    /** 删除生产订单：先逻辑删除全部明细行，再物理删除生产订单头以释放生产订单号。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        lineMapper.delete(Wrappers.<ErpProductionOrderLine>lambdaQuery()
                .eq(ErpProductionOrderLine::getOrderId, id));
        mapper.physicalDeleteById(id);
    }

    /** 新增生产订单行：行号为空时取当前最大行号 +1，回填默认行状态/单位/数量。 */
    @Transactional(rollbackFor = Exception.class)
    public Long addLine(Long headerId, ErpProductionOrderLineSaveRequest request) {
        ErpProductionOrder header = require(headerId);
        validateLine(request);
        Integer maxLineNo = lineMapper.selectMaxLineNo(headerId);

        ErpProductionOrderLine line = new ErpProductionOrderLine();
        line.setOrderId(headerId);
        line.setOrderNo(header.getOrderNo());
        line.setLineNo(request.getLineNo() != null
                ? request.getLineNo()
                : (maxLineNo == null ? 1 : maxLineNo + 1));
        line.setLineStatus(StringUtils.hasText(request.getLineStatus())
                ? request.getLineStatus() : DEFAULT_LINE_STATUS);
        line.setUom(StringUtils.hasText(request.getUom())
                ? request.getUom() : DEFAULT_UOM);
        line.setRequiredQty(request.getRequiredQty() != null
                ? request.getRequiredQty() : BigDecimal.ZERO);
        line.setIssuedQty(request.getIssuedQty() != null
                ? request.getIssuedQty() : BigDecimal.ZERO);
        line.setPickedQty(request.getPickedQty() != null
                ? request.getPickedQty() : BigDecimal.ZERO);
        line.setRemainingQty(request.getRemainingQty() != null
                ? request.getRemainingQty() : BigDecimal.ZERO);
        applyLine(line, request);
        lineMapper.insert(line);
        return line.getId();
    }

    /** 更新生产订单行：仅在请求提供字段时覆盖。 */
    @Transactional(rollbackFor = Exception.class)
    public void updateLine(Long lineId, ErpProductionOrderLineSaveRequest request) {
        ErpProductionOrderLine line = requireLine(lineId);
        validateLine(request);
        if (request.getLineNo() != null) {
            line.setLineNo(request.getLineNo());
        }
        applyLine(line, request);
        lineMapper.updateById(line);
    }

    /** 删除生产订单行：逻辑删除。 */
    @Transactional(rollbackFor = Exception.class)
    public void deleteLine(Long lineId) {
        requireLine(lineId);
        lineMapper.deleteById(lineId);
    }

    public ErpProductionOrder require(Long id) {
        ErpProductionOrder header = mapper.selectById(id);
        if (header == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "生产订单不存在: " + id);
        }
        return header;
    }

    private ErpProductionOrderLine requireLine(Long lineId) {
        ErpProductionOrderLine line = lineMapper.selectById(lineId);
        if (line == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "生产订单行不存在: " + lineId);
        }
        return line;
    }

    private List<ErpProductionOrderLine> listLines(Long orderId) {
        return lineMapper.selectList(Wrappers.<ErpProductionOrderLine>lambdaQuery()
                .eq(ErpProductionOrderLine::getOrderId, orderId)
                .orderByAsc(ErpProductionOrderLine::getLineNo));
    }

    private void validateLine(ErpProductionOrderLineSaveRequest request) {
        if (!StringUtils.hasText(request.getMaterialCode())) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "子件物料编码不能为空");
        }
    }

    /** 仅在请求提供值（字符串非空、数值/日期非空）时覆盖生产订单头字段。 */
    private void applyHeader(ErpProductionOrder header, ErpProductionOrderSaveRequest request) {
        if (StringUtils.hasText(request.getOrderNo())) {
            header.setOrderNo(request.getOrderNo());
        }
        if (StringUtils.hasText(request.getOrderType())) {
            header.setOrderType(request.getOrderType());
        }
        if (StringUtils.hasText(request.getMaterialCode())) {
            header.setMaterialCode(request.getMaterialCode());
        }
        if (StringUtils.hasText(request.getMaterialName())) {
            header.setMaterialName(request.getMaterialName());
        }
        if (StringUtils.hasText(request.getSpec())) {
            header.setSpec(request.getSpec());
        }
        if (StringUtils.hasText(request.getUom())) {
            header.setUom(request.getUom());
        }
        if (request.getPlanQty() != null) {
            header.setPlanQty(request.getPlanQty());
        }
        if (request.getCompletedQty() != null) {
            header.setCompletedQty(request.getCompletedQty());
        }
        if (request.getScrapQty() != null) {
            header.setScrapQty(request.getScrapQty());
        }
        if (StringUtils.hasText(request.getOrderStatus())) {
            header.setOrderStatus(request.getOrderStatus());
        }
        if (request.getPlanStartDate() != null) {
            header.setPlanStartDate(request.getPlanStartDate());
        }
        if (request.getPlanEndDate() != null) {
            header.setPlanEndDate(request.getPlanEndDate());
        }
        if (request.getActualStartDate() != null) {
            header.setActualStartDate(request.getActualStartDate());
        }
        if (request.getActualEndDate() != null) {
            header.setActualEndDate(request.getActualEndDate());
        }
        if (StringUtils.hasText(request.getWorkshop())) {
            header.setWorkshop(request.getWorkshop());
        }
        if (StringUtils.hasText(request.getLineCode())) {
            header.setLineCode(request.getLineCode());
        }
        if (StringUtils.hasText(request.getBomVersion())) {
            header.setBomVersion(request.getBomVersion());
        }
        if (StringUtils.hasText(request.getRoutingVersion())) {
            header.setRoutingVersion(request.getRoutingVersion());
        }
        if (StringUtils.hasText(request.getSourceType())) {
            header.setSourceType(request.getSourceType());
        }
        if (StringUtils.hasText(request.getSourceNo())) {
            header.setSourceNo(request.getSourceNo());
        }
        if (StringUtils.hasText(request.getPlanNo())) {
            header.setPlanNo(request.getPlanNo());
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

    /** 仅在请求提供值（字符串非空、数值非空）时覆盖生产订单行字段。 */
    private void applyLine(ErpProductionOrderLine line, ErpProductionOrderLineSaveRequest request) {
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
        if (request.getRequiredQty() != null) {
            line.setRequiredQty(request.getRequiredQty());
        }
        if (request.getIssuedQty() != null) {
            line.setIssuedQty(request.getIssuedQty());
        }
        if (request.getPickedQty() != null) {
            line.setPickedQty(request.getPickedQty());
        }
        if (request.getRemainingQty() != null) {
            line.setRemainingQty(request.getRemainingQty());
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
