package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.ErpProductionOrderSplitQuery;
import com.huaweicloud.plm.system.dto.ErpProductionOrderSplitSaveRequest;
import com.huaweicloud.plm.system.entity.ErpProductionOrderSplit;
import com.huaweicloud.plm.system.mapper.ErpProductionOrderSplitMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;

/**
 * ERP 生产管理—订单拆分单（对应 WBS T026 生产管理、T096 生产订单与补料，属 G3 ERP）：
 * 订单拆分登记、分页查询与删除。
 * 拆分单号支持人工指定，删除语义为「释放编码」，采用物理删除以保持与唯一索引一致。
 */
@Service
@RequiredArgsConstructor
public class ErpProductionOrderSplitService {

    private static final String DEFAULT_SPLIT_NO_PREFIX = "EOS";
    private static final String DEFAULT_SPLIT_TYPE = "QTY";
    private static final String DEFAULT_SPLIT_STATUS = "DRAFT";

    private final ErpProductionOrderSplitMapper mapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询订单拆分单：状态/类型/源订单号精确，拆分单号/源订单号/目标订单号模糊，按主键倒序。 */
    public PageResult<ErpProductionOrderSplit> page(ErpProductionOrderSplitQuery query) {
        Page<ErpProductionOrderSplit> page = query.toPage();
        mapper.selectPage(page, Wrappers.<ErpProductionOrderSplit>lambdaQuery()
                .eq(StringUtils.hasText(query.getSplitStatus()),
                        ErpProductionOrderSplit::getSplitStatus, query.getSplitStatus())
                .eq(StringUtils.hasText(query.getSplitType()),
                        ErpProductionOrderSplit::getSplitType, query.getSplitType())
                .eq(StringUtils.hasText(query.getSourceOrderNo()),
                        ErpProductionOrderSplit::getSourceOrderNo, query.getSourceOrderNo())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(ErpProductionOrderSplit::getSplitNo, query.getKeyword()).or()
                        .like(ErpProductionOrderSplit::getSourceOrderNo, query.getKeyword()).or()
                        .like(ErpProductionOrderSplit::getTargetOrderNo, query.getKeyword()))
                .orderByDesc(ErpProductionOrderSplit::getId));
        return PageResult.of(page);
    }

    public ErpProductionOrderSplit detail(Long id) {
        return require(id);
    }

    /** 新增或更新订单拆分单：新增时回填默认状态/类型/数量与组织，拆分单号为空时自动生成。 */
    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, ErpProductionOrderSplitSaveRequest request) {
        ErpProductionOrderSplit entity;
        if (id == null) {
            entity = new ErpProductionOrderSplit();
            entity.setSplitNo(StringUtils.hasText(request.getSplitNo())
                    ? request.getSplitNo() : flowSupport.nextBizNo(DEFAULT_SPLIT_NO_PREFIX));
            entity.setSplitType(StringUtils.hasText(request.getSplitType())
                    ? request.getSplitType() : DEFAULT_SPLIT_TYPE);
            entity.setSplitStatus(StringUtils.hasText(request.getSplitStatus())
                    ? request.getSplitStatus() : DEFAULT_SPLIT_STATUS);
            entity.setSplitQty(request.getSplitQty() != null
                    ? request.getSplitQty() : BigDecimal.ZERO);
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

    /** 删除订单拆分单：物理删除以释放拆分单号。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    public ErpProductionOrderSplit require(Long id) {
        ErpProductionOrderSplit entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "订单拆分单不存在: " + id);
        }
        return entity;
    }

    /** 仅在请求提供值（字符串非空、数值/日期非空）时覆盖实体对应字段。 */
    private void applyRequest(ErpProductionOrderSplit entity, ErpProductionOrderSplitSaveRequest request) {
        if (StringUtils.hasText(request.getSplitNo())) {
            entity.setSplitNo(request.getSplitNo());
        }
        if (request.getSourceOrderId() != null) {
            entity.setSourceOrderId(request.getSourceOrderId());
        }
        if (StringUtils.hasText(request.getSourceOrderNo())) {
            entity.setSourceOrderNo(request.getSourceOrderNo());
        }
        if (request.getTargetOrderId() != null) {
            entity.setTargetOrderId(request.getTargetOrderId());
        }
        if (StringUtils.hasText(request.getTargetOrderNo())) {
            entity.setTargetOrderNo(request.getTargetOrderNo());
        }
        if (request.getSplitQty() != null) {
            entity.setSplitQty(request.getSplitQty());
        }
        if (StringUtils.hasText(request.getSplitType())) {
            entity.setSplitType(request.getSplitType());
        }
        if (StringUtils.hasText(request.getSplitReason())) {
            entity.setSplitReason(request.getSplitReason());
        }
        if (StringUtils.hasText(request.getSplitBy())) {
            entity.setSplitBy(request.getSplitBy());
        }
        if (request.getSplitDate() != null) {
            entity.setSplitDate(request.getSplitDate());
        }
        if (StringUtils.hasText(request.getSplitStatus())) {
            entity.setSplitStatus(request.getSplitStatus());
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
