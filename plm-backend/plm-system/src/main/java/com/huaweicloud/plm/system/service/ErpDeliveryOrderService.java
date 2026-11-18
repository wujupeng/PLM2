package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.ErpDeliveryOrderDetailResponse;
import com.huaweicloud.plm.system.dto.ErpDeliveryOrderLineSaveRequest;
import com.huaweicloud.plm.system.dto.ErpDeliveryOrderQuery;
import com.huaweicloud.plm.system.dto.ErpDeliveryOrderSaveRequest;
import com.huaweicloud.plm.system.entity.ErpDeliveryOrder;
import com.huaweicloud.plm.system.entity.ErpDeliveryOrderLine;
import com.huaweicloud.plm.system.mapper.ErpDeliveryOrderLineMapper;
import com.huaweicloud.plm.system.mapper.ErpDeliveryOrderMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.util.List;

/**
 * ERP 销售管理—发货单（G3-N2 ERP 销售管理）：
 * 发货单头与发货行的登记、分页查询与删除。
 * 发货单号支持人工指定，删除语义为「释放编号」，头表采用物理删除以保持与唯一索引一致。
 */
@Service
@RequiredArgsConstructor
public class ErpDeliveryOrderService {

    private static final String DEFAULT_DELIVERY_NO_PREFIX = "DO";
    private static final String DEFAULT_DELIVERY_TYPE = "NORMAL";
    private static final String DEFAULT_DELIVERY_STATUS = "DRAFT";
    private static final String DEFAULT_UOM = "PCS";

    private final ErpDeliveryOrderMapper mapper;
    private final ErpDeliveryOrderLineMapper lineMapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询发货单：状态/类型/订单号/客户编码精确，单号/订单号/客户名称模糊，按主键倒序。 */
    public PageResult<ErpDeliveryOrder> page(ErpDeliveryOrderQuery query) {
        Page<ErpDeliveryOrder> page = query.toPage();
        mapper.selectPage(page, Wrappers.<ErpDeliveryOrder>lambdaQuery()
                .eq(StringUtils.hasText(query.getDeliveryStatus()),
                        ErpDeliveryOrder::getDeliveryStatus, query.getDeliveryStatus())
                .eq(StringUtils.hasText(query.getDeliveryType()),
                        ErpDeliveryOrder::getDeliveryType, query.getDeliveryType())
                .eq(StringUtils.hasText(query.getOrderNo()),
                        ErpDeliveryOrder::getOrderNo, query.getOrderNo())
                .eq(StringUtils.hasText(query.getCustomerCode()),
                        ErpDeliveryOrder::getCustomerCode, query.getCustomerCode())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(ErpDeliveryOrder::getDeliveryNo, query.getKeyword()).or()
                        .like(ErpDeliveryOrder::getOrderNo, query.getKeyword()).or()
                        .like(ErpDeliveryOrder::getCustomerName, query.getKeyword()))
                .orderByDesc(ErpDeliveryOrder::getId));
        return PageResult.of(page);
    }

    public ErpDeliveryOrderDetailResponse detail(Long id) {
        ErpDeliveryOrder header = require(id);
        ErpDeliveryOrderDetailResponse response = new ErpDeliveryOrderDetailResponse();
        response.setHeader(header);
        response.setLines(listLines(id));
        return response;
    }

    /** 新增发货单头：回填默认发货类型/状态/总数量与组织，单号为空时自动生成。 */
    @Transactional(rollbackFor = Exception.class)
    public Long create(ErpDeliveryOrderSaveRequest request) {
        ErpDeliveryOrder header = new ErpDeliveryOrder();
        header.setDeliveryNo(StringUtils.hasText(request.getDeliveryNo())
                ? request.getDeliveryNo() : flowSupport.nextBizNo(DEFAULT_DELIVERY_NO_PREFIX));
        header.setDeliveryType(StringUtils.hasText(request.getDeliveryType())
                ? request.getDeliveryType() : DEFAULT_DELIVERY_TYPE);
        header.setDeliveryStatus(StringUtils.hasText(request.getDeliveryStatus())
                ? request.getDeliveryStatus() : DEFAULT_DELIVERY_STATUS);
        header.setTotalQty(request.getTotalQty() != null ? request.getTotalQty() : BigDecimal.ZERO);
        header.setOrgId(currentOrgId());
        applyRequest(header, request);
        mapper.insert(header);
        return header.getId();
    }

    /** 更新发货单头。 */
    @Transactional(rollbackFor = Exception.class)
    public void update(Long id, ErpDeliveryOrderSaveRequest request) {
        ErpDeliveryOrder header = require(id);
        applyRequest(header, request);
        mapper.updateById(header);
    }

    /** 删除发货单：先逻辑删除全部行，再物理删除头以释放发货单号。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        lineMapper.delete(Wrappers.<ErpDeliveryOrderLine>lambdaQuery()
                .eq(ErpDeliveryOrderLine::getDeliveryId, id));
        mapper.physicalDeleteById(id);
    }

    /** 新增发货行：回填发货单号与行号，行号为空时取当前最大行号 +1。 */
    @Transactional(rollbackFor = Exception.class)
    public Long addLine(Long headerId, ErpDeliveryOrderLineSaveRequest request) {
        ErpDeliveryOrder header = require(headerId);
        validateLine(request);
        Integer maxLineNo = lineMapper.selectMaxLineNo(headerId);
        ErpDeliveryOrderLine line = new ErpDeliveryOrderLine();
        line.setDeliveryId(headerId);
        line.setDeliveryNo(header.getDeliveryNo());
        line.setLineNo(request.getLineNo() != null
                ? request.getLineNo()
                : (maxLineNo == null ? 1 : maxLineNo + 1));
        line.setUom(StringUtils.hasText(request.getUom()) ? request.getUom() : DEFAULT_UOM);
        line.setDeliveryQty(request.getDeliveryQty() != null ? request.getDeliveryQty() : BigDecimal.ZERO);
        applyLine(line, request);
        lineMapper.insert(line);
        return line.getId();
    }

    /** 更新发货行。 */
    @Transactional(rollbackFor = Exception.class)
    public void updateLine(Long lineId, ErpDeliveryOrderLineSaveRequest request) {
        ErpDeliveryOrderLine line = requireLine(lineId);
        validateLine(request);
        if (request.getLineNo() != null) {
            line.setLineNo(request.getLineNo());
        }
        applyLine(line, request);
        lineMapper.updateById(line);
    }

    /** 删除发货行：逻辑删除。 */
    @Transactional(rollbackFor = Exception.class)
    public void deleteLine(Long lineId) {
        requireLine(lineId);
        lineMapper.deleteById(lineId);
    }

    public ErpDeliveryOrder require(Long id) {
        ErpDeliveryOrder entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "发货单不存在: " + id);
        }
        return entity;
    }

    private ErpDeliveryOrderLine requireLine(Long lineId) {
        ErpDeliveryOrderLine line = lineMapper.selectById(lineId);
        if (line == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "发货单行不存在: " + lineId);
        }
        return line;
    }

    private List<ErpDeliveryOrderLine> listLines(Long headerId) {
        return lineMapper.selectList(Wrappers.<ErpDeliveryOrderLine>lambdaQuery()
                .eq(ErpDeliveryOrderLine::getDeliveryId, headerId)
                .orderByAsc(ErpDeliveryOrderLine::getLineNo));
    }

    /** 仅在请求提供值（字符串非空、数值非空）时覆盖单头对应字段。 */
    private void applyRequest(ErpDeliveryOrder header, ErpDeliveryOrderSaveRequest request) {
        if (StringUtils.hasText(request.getDeliveryNo())) {
            header.setDeliveryNo(request.getDeliveryNo());
        }
        if (StringUtils.hasText(request.getDeliveryType())) {
            header.setDeliveryType(request.getDeliveryType());
        }
        if (StringUtils.hasText(request.getOrderNo())) {
            header.setOrderNo(request.getOrderNo());
        }
        if (StringUtils.hasText(request.getCustomerCode())) {
            header.setCustomerCode(request.getCustomerCode());
        }
        if (StringUtils.hasText(request.getCustomerName())) {
            header.setCustomerName(request.getCustomerName());
        }
        if (request.getDeliveryDate() != null) {
            header.setDeliveryDate(request.getDeliveryDate());
        }
        if (StringUtils.hasText(request.getWarehouseCode())) {
            header.setWarehouseCode(request.getWarehouseCode());
        }
        if (StringUtils.hasText(request.getReceiverAddress())) {
            header.setReceiverAddress(request.getReceiverAddress());
        }
        if (StringUtils.hasText(request.getContact())) {
            header.setContact(request.getContact());
        }
        if (StringUtils.hasText(request.getPhone())) {
            header.setPhone(request.getPhone());
        }
        if (StringUtils.hasText(request.getCarrier())) {
            header.setCarrier(request.getCarrier());
        }
        if (StringUtils.hasText(request.getTrackingNo())) {
            header.setTrackingNo(request.getTrackingNo());
        }
        if (StringUtils.hasText(request.getDeliveryStatus())) {
            header.setDeliveryStatus(request.getDeliveryStatus());
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

    /** 覆盖行明细字段（发货单号与数量默认值在新增时单独处理）。 */
    private void applyLine(ErpDeliveryOrderLine line, ErpDeliveryOrderLineSaveRequest request) {
        line.setOrderNo(request.getOrderNo());
        line.setOrderLineNo(request.getOrderLineNo());
        line.setMaterialCode(request.getMaterialCode());
        line.setMaterialName(request.getMaterialName());
        line.setSpec(request.getSpec());
        if (StringUtils.hasText(request.getUom())) {
            line.setUom(request.getUom());
        }
        if (request.getDeliveryQty() != null) {
            line.setDeliveryQty(request.getDeliveryQty());
        }
        line.setBatchNo(request.getBatchNo());
        line.setWarehouseCode(request.getWarehouseCode());
        line.setRemark(request.getRemark());
    }

    private void validateLine(ErpDeliveryOrderLineSaveRequest request) {
        if (!StringUtils.hasText(request.getMaterialCode())) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "物料编码不能为空");
        }
    }

    private Long currentOrgId() {
        UserContext.Principal principal = UserContext.get();
        return principal == null ? null : principal.orgId();
    }
}
